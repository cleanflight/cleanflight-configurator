'use strict';

TABS.failsafe = {};

TABS.failsafe.initialize = function (callback, scrollPosition) {
    var self = this;

    if (GUI.active_tab != 'failsafe') {
        GUI.active_tab = 'failsafe';
    }

    function load_rx_config() {
        MSP.send_message(MSPCodes.MSP_RX_CONFIG, false, false, load_failssafe_config);
    }

    function load_failssafe_config() {
        MSP.send_message(MSPCodes.MSP_FAILSAFE_CONFIG, false, false, load_rxfail_config);
    }
    
    function load_rxfail_config() {
        MSP.send_message(MSPCodes.MSP_RXFAIL_CONFIG, false, false, get_box_names);
    }

    function get_box_names() {
        MSP.send_message(MSPCodes.MSP_BOXNAMES, false, false, get_mode_ranges);
    }

    function get_mode_ranges() {
        MSP.send_message(MSPCodes.MSP_MODE_RANGES, false, false, get_box_ids);
    }

    function get_box_ids() {
        MSP.send_message(MSPCodes.MSP_BOXIDS, false, false, get_ports_config);
    }

    function get_ports_config() {
        MSP.send_message(MSPCodes.MSP_CF_SERIAL_CONFIG, false, false, get_rc_data);
    }

    function get_rc_data() {
        MSP.send_message(MSPCodes.MSP_RC, false, false, load_feature_config);
    }

    function load_feature_config() {
        MSP.send_message(MSPCodes.MSP_FEATURE_CONFIG, false, false, load_motor_config);
    }

    function load_motor_config() {
        MSP.send_message(MSPCodes.MSP_MOTOR_CONFIG, false, false, load_compass_config);
    }
    
    function load_compass_config() {
        MSP.send_message(MSPCodes.MSP_COMPASS_CONFIG, false, false, load_gps_config);
    }
    
    function load_gps_config() {
        MSP.send_message(MSPCodes.MSP_GPS_CONFIG, false, false, load_html);
    }

    function load_html() {
        $('#content').load("./tabs/failsafe.html", process_html);
    }


    load_rx_config();

    function process_html() {
        // fill stage 2 fields
        function toggleStage2(doShow) {
            if (doShow) {
                $('div.stage2').show();
            } else {
                $('div.stage2').hide();
            }
        }
        
        // FIXME cleanup oldpane html and css
        var oldPane = $('div.oldpane');
        oldPane.prop("disabled", true);
        oldPane.hide();

        // generate labels for assigned aux modes
        var auxAssignment = [],
            i,
            element;

        for (var channelIndex = 0; channelIndex < RC.active_channels - 4; channelIndex++) {
            auxAssignment.push("");
        }

        for (var modeIndex = 0; modeIndex < AUX_CONFIG.length; modeIndex++) {

            var modeId = AUX_CONFIG_IDS[modeIndex];

            // scan mode ranges to find assignments
            for (var modeRangeIndex = 0; modeRangeIndex < MODE_RANGES.length; modeRangeIndex++) {
                var modeRange = MODE_RANGES[modeRangeIndex];

                if (modeRange.id != modeId) {
                    continue;
                }

                var range = modeRange.range;
                if (!(range.start < range.end)) {
                    continue; // invalid!
                }

                // Search for the real name if it belongs to a peripheral
                var modeName = AUX_CONFIG[modeIndex];                
                modeName = adjustBoxNameIfPeripheralWithModeID(modeId, modeName);

                auxAssignment[modeRange.auxChannelIndex] += "<span class=\"modename\">" + modeName + "</span>";
            }
        }

        // generate full channel list
        var channelNames = [
                chrome.i18n.getMessage('controlAxisRoll'),
                chrome.i18n.getMessage('controlAxisPitch'),
                chrome.i18n.getMessage('controlAxisYaw'),
                chrome.i18n.getMessage('controlAxisThrottle')
            ],
            fullChannels_e = $('div.activechannellist'),
            aux_index = 1,
            aux_assignment_index = 0;

        for (i = 0; i < RXFAIL_CONFIG.length; i++) {
            if (i < channelNames.length) {
                fullChannels_e.append('\
                    <div class="number">\
                        <div class="channelprimary">\
                            <span>' + channelNames[i] + '</span>\
                        </div>\
                        <div class="cf_tip channelsetting" title="' + chrome.i18n.getMessage("failsafeChannelFallbackSettingsAuto") + '">\
                            <select class="aux_set" id="' + i + '">\
                                <option value="0">Auto</option>\
                                <option value="1">Hold</option>\
                            </select>\
                        </div>\
                    </div>\
                ');
            } else {
                fullChannels_e.append('\
                    <div class="number">\
                        <div class="channelauxiliary">\
                            <span class="channelname">' + chrome.i18n.getMessage("controlAxisAux" + (aux_index++)) + '</span>\
                            ' + auxAssignment[aux_assignment_index++] + '\
                        </div>\
                        <div class="cf_tip channelsetting" title="' + chrome.i18n.getMessage("failsafeChannelFallbackSettingsHold") + '">\
                            <select class="aux_set" id="' + i + '">\
                                <option value="1">Hold</option>\
                                <option value="2">Set</option>\
                            </select>\
                        </div>\
                        <div class="auxiliary"><input type="number" name="aux_value" min="750" max="2250" step="25" id="' + i + '"/></div>\
                    </div>\
                ');
            }
        }

        var channel_mode_array = [];
        $('.number', fullChannels_e).each(function () {
            channel_mode_array.push($('select.aux_set' , this));
        });

        var channel_value_array = [];
        $('.number', fullChannels_e).each(function () {
            channel_value_array.push($('input[name="aux_value"]' , this));
        });

        var channelMode = $('select.aux_set');
        var channelValue = $('input[name="aux_value"]');

        // UI hooks
        channelMode.change(function () {
            var currentMode = parseInt($(this).val());
            var i = parseInt($(this).prop("id"));
            RXFAIL_CONFIG[i].mode = currentMode;
            if (currentMode == 2) {
                channel_value_array[i].prop("disabled", false);
                channel_value_array[i].show();
            } else {
                channel_value_array[i].prop("disabled", true);
                channel_value_array[i].hide();
            }
        });

        // UI hooks
        channelValue.change(function () {
            var i = parseInt($(this).prop("id"));
            RXFAIL_CONFIG[i].value = parseInt($(this).val());
        });

        // for some odd reason chrome 38+ changes scroll according to the touched select element
        // i am guessing this is a bug, since this wasn't happening on 37
        // code below is a temporary fix, which we will be able to remove in the future (hopefully)
        $('#content').scrollTop((scrollPosition) ? scrollPosition : 0);

        // fill stage 1 Valid Pulse Range Settings
        $('input[name="rx_min_usec"]').val(RX_CONFIG.rx_min_usec);
        $('input[name="rx_max_usec"]').val(RX_CONFIG.rx_max_usec);

        // fill fallback settings (mode and value) for all channels
        for (i = 0; i < RXFAIL_CONFIG.length; i++) {
            channel_value_array[i].val(RXFAIL_CONFIG[i].value);
            channel_mode_array[i].val(RXFAIL_CONFIG[i].mode);
            channel_mode_array[i].change();
        }

        FEATURE_CONFIG.features.generateElements($('.tab-failsafe .featuresNew'));

        var failsafeFeature = $('input[name="FAILSAFE"]');
        failsafeFeature.change(function () {
            toggleStage2($(this).is(':checked'));
        });
        toggleStage2(FEATURE_CONFIG.features.isEnabled('FAILSAFE'));

        $('input[name="failsafe_throttle"]').val(FAILSAFE_CONFIG.failsafe_throttle);
        $('input[name="failsafe_off_delay"]').val(FAILSAFE_CONFIG.failsafe_off_delay);
        $('input[name="failsafe_throttle_low_delay"]').val(FAILSAFE_CONFIG.failsafe_throttle_low_delay);
        $('input[name="failsafe_delay"]').val(FAILSAFE_CONFIG.failsafe_delay);

        // set stage 2 failsafe procedure
        $('input[type="radio"].procedure').change(function () {
            var element = $(this),
                checked = element.is(':checked'),
                id = element.attr('id');
            switch(id) {
                case 'drop':
                    if (checked) {
                        $('input[name="failsafe_throttle"]').prop("disabled", true);
                        $('input[name="failsafe_off_delay"]').prop("disabled", true);
                    }
                    break;

                case 'land':
                    if (checked) {
                        $('input[name="failsafe_throttle"]').prop("disabled", false);
                        $('input[name="failsafe_off_delay"]').prop("disabled", false);
                    }
                    break;
            }
        });

        switch(FAILSAFE_CONFIG.failsafe_procedure) {
            default:
            case 0:
                element = $('input[id="land"]') ;
                element.prop('checked', true);
                element.change();
                break;
            case 1:
                element = $('input[id="drop"]');
                element.prop('checked', true);
                element.change();
                break;
        }

        // set stage 2 kill switch option
        $('input[name="failsafe_kill_switch"]').prop('checked', FAILSAFE_CONFIG.failsafe_kill_switch);


        $('a.save').click(function () {
            // gather data that doesn't have automatic change event bound

            FEATURE_CONFIG.features.updateData($('input[name="FAILSAFE"]'));

            RX_CONFIG.rx_min_usec = parseInt($('input[name="rx_min_usec"]').val());
            RX_CONFIG.rx_max_usec = parseInt($('input[name="rx_max_usec"]').val());

            FAILSAFE_CONFIG.failsafe_throttle = parseInt($('input[name="failsafe_throttle"]').val());
            FAILSAFE_CONFIG.failsafe_off_delay = parseInt($('input[name="failsafe_off_delay"]').val());
            FAILSAFE_CONFIG.failsafe_throttle_low_delay = parseInt($('input[name="failsafe_throttle_low_delay"]').val());
            FAILSAFE_CONFIG.failsafe_delay = parseInt($('input[name="failsafe_delay"]').val());

            if( $('input[id="land"]').is(':checked')) {
                FAILSAFE_CONFIG.failsafe_procedure = 0;
            } else if( $('input[id="drop"]').is(':checked')) {
                FAILSAFE_CONFIG.failsafe_procedure = 1;
            }

            FAILSAFE_CONFIG.failsafe_kill_switch = $('input[name="failsafe_kill_switch"]').is(':checked') ? 1 : 0;

            function save_failssafe_config() {
                MSP.send_message(MSPCodes.MSP_SET_FAILSAFE_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_FAILSAFE_CONFIG), false, save_rxfail_config);
            }

            function save_rxfail_config() {
                mspHelper.sendRxFailConfig(save_feature_config);
            }

            function save_feature_config() {
                MSP.send_message(MSPCodes.MSP_SET_FEATURE_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_FEATURE_CONFIG), false, save_to_eeprom);
            }

            function save_to_eeprom() {
                MSP.send_message(MSPCodes.MSP_EEPROM_WRITE, false, false, reboot);
            }

            function reboot() {
                GUI.log(chrome.i18n.getMessage('configurationEepromSaved'));

                GUI.tab_switch_cleanup(function() {
                    MSP.send_message(MSPCodes.MSP_SET_REBOOT, false, false, reinitialize);
                });
            }

            function reinitialize() {
                GUI.log(chrome.i18n.getMessage('deviceRebooting'));

                if (BOARD.find_board_definition(CONFIG.boardIdentifier).vcp) { // VCP-based flight controls may crash old drivers, we catch and reconnect
                    $('a.connect').click();
                    GUI.timeout_add('start_connection',function start_connection() {
                        $('a.connect').click();
                    },2500);
                } else {

                    GUI.timeout_add('waiting_for_bootup', function waiting_for_bootup() {
                        MSP.send_message(MSPCodes.MSP_STATUS, false, false, function() {
                            GUI.log(chrome.i18n.getMessage('deviceReady'));
                            TABS.failsafe.initialize(false, $('#content').scrollTop());
                        });
                    },1500); // 1500 ms seems to be just the right amount of delay to prevent data request timeouts
                }
            }

            MSP.send_message(MSPCodes.MSP_SET_RX_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_RX_CONFIG), false, save_failssafe_config);
        });

        // translate to user-selected language
        localize();

        // status data pulled via separate timer with static speed
        GUI.interval_add('status_pull', function status_pull() {
            MSP.send_message(MSPCodes.MSP_STATUS);
        }, 250, true);

        GUI.content_ready(callback);
    }
};

TABS.failsafe.cleanup = function (callback) {
    if (callback) callback();
};
