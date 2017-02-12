'use strict';

var transponderType = {
    0 : 'arcitimer',
    1 : 'ilap',
};

TABS.transponder = {
    available: false
};

TABS.transponder.initialize = function (callback, scrollPosition) {
    if (GUI.active_tab != 'transponder') {
        GUI.active_tab = 'transponder';
        googleAnalytics.sendAppView('Transponder');
    }

    // transponder supported added in MSP API Version 1.16.0
    if (CONFIG) {
        TABS.transponder.available = semver.gte(CONFIG.apiVersion, "1.16.0");
    }

    //////////////
    if (!TABS.transponder.available) {
        load_html();
        return;
    }

    function load_html() {
        $('#content').load("./tabs/transponder.html", process_html);
    }

    // get the transponder data and a flag to see if transponder support is enabled on the FC
    var load_config = function () {
        MSP.send_message(MSP_codes.MSP_TRANSPONDER_TYPE, false, false, load_html);
    };

    MSP.send_message(MSP_codes.MSP_TRANSPONDER_CONFIG, false, false, load_config);
    //////////////


    // Convert a hex string to a byte array
    function hexToBytes(hex) {
        for (var bytes = [], c = 0; c < hex.length; c += 2)
            bytes.push(~parseInt(hex.substr(c, 2), 16));
        return bytes;
    }

    function pad(n, width) {
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
    }

    // Convert a byte array to a hex string
    function bytesToHex(bytes) {
        for (var hex = [], i = 0; i < bytes.length; i++) {
            hex.push(pad(((~bytes[i]) & 0xFF).toString(16), 2));
        }
        return hex.join("").toUpperCase();
    }

    function process_html() {
        // translate to user-selected language
        localize();

        $(".tab-transponder")
            .toggleClass("transponder-supported", TABS.transponder.available && TRANSPONDER.supported);

        if (TABS.transponder.available) {
            var originalType = TRANSPONDER.type[0];

            $("input[name=type][value='" + (TRANSPONDER.type[0]) + "']").prop("checked", true);
            toogleTimerType(TRANSPONDER.type[0], originalType);

            $("input[name=type]").change(
                function () {
                    toogleTimerType($(this).val(), originalType);
                }
            );

            var data = bytesToHex(TRANSPONDER.data);

            $('input[name="data_ilap"]').val(data.substr(0, 12));
            $('input[name="data_ilap"]').prop('maxLength', data.length - 6);

            $('select[name="data_arcitimer"]').val(data);

            $('a.save').click(function () {

                if ($("input[name=type]:checked").val() == 0) {
                    switch ($('select[name="data_arcitimer"]').val()) {
                        default:
                        case 'E00370FC0FFE07E0FF':
                            dataString = 'E00370FC0FFE07E0FF';
                            break;
                        case '007C003EF800FC0FFE':
                            dataString = '007C003EF800FC0FFE';
                            break;
                        case 'F8811FF8811FFFC7FF':
                            dataString = 'F8811FF8811FFFC7FF';
                            break;
                        case '007C003EF81F800FFE':
                            dataString = '007C003EF81F800FFE';
                            break;
                        case 'F00FFF00FFF00FF0FF':
                            dataString = 'F00FFF00FFF00FF0FF';
                            break;
                        case '007CF0C1071F7C00F0':
                            dataString = '007CF0C1071F7C00F0';
                            break;
                        case 'E003F03F00FF03F0C1':
                            dataString = 'E003F03F00FF03F0C1';
                            break;
                        case '00FC0FFE071F3E00FE':
                            dataString = '00FC0FFE071F3E00FE';
                            break;
                        case 'E083BFF00F9E38C0FF':
                            dataString = 'E083BFF00F9E38C0FF';

                            break
                    }

                    TRANSPONDER.data = hexToBytes(dataString);
                    TRANSPONDER.type = [0];

                } else {
                    // gather data that doesn't have automatic change event bound
                    var dataString = $('input[name="data_ilap"]').val();

                    var hexRegExp = new RegExp('[0-9a-fA-F]{' + TRANSPONDER.data.length + '}', 'gi');
                    var dataForsend = dataString + "FFFFFF";
                    if (!dataString.match(hexRegExp) || dataForsend.length != data.length) {
                        GUI.log(chrome.i18n.getMessage('transponderDataInvalid'));
                        return;
                    }

                    TRANSPONDER.data = hexToBytes(dataForsend);

                    TRANSPONDER.type = [1];
                }


                // send data to FC
                //
                function save_transponder_type() {
                    MSP.send_message(MSP_codes.MSP_SET_TRANSPONDER_TYPE, MSP.crunch(MSP_codes.MSP_SET_TRANSPONDER_TYPE), false, save_transponder_data);
                }

                function save_transponder_data() {
                    MSP.send_message(MSP_codes.MSP_SET_TRANSPONDER_CONFIG, MSP.crunch(MSP_codes.MSP_SET_TRANSPONDER_CONFIG), false, save_to_eeprom);
                }

                function save_to_eeprom() {
                    GUI.log(chrome.i18n.getMessage('transponderEepromSaved'));
                    MSP.send_message(MSP_codes.MSP_EEPROM_WRITE, false, false, function(){
                        GUI.log(chrome.i18n.getMessage('transponderEepromSaved'));
                        if(TRANSPONDER.type[0] != originalType){
                            GUI.tab_switch_cleanup(function () {
                                MSP.send_message(MSP_codes.MSP_SET_REBOOT, false, false, reinitialize);
                            });
                        }
                    });
                }

                save_transponder_type();
            });
        }

        function reinitialize() {
            GUI.log(chrome.i18n.getMessage('deviceRebooting'));

            if (BOARD.find_board_definition(CONFIG.boardIdentifier).vcp) {
                $('a.connect').click();
                GUI.timeout_add('start_connection', function start_connection() {
                    $('a.connect').click();
                }, 2500);
            } else {

                GUI.timeout_add('waiting_for_bootup', function waiting_for_bootup() {
                    MSP.send_message(MSP_codes.MSP_IDENT, false, false, function () {
                        GUI.log(chrome.i18n.getMessage('deviceReady'));
                        TABS.configuration.initialize(false, $('#content').scrollTop());
                    });
                }, 3000);
            }
        }

        function toogleTimerType(type, originalType) {
            if(type != originalType){
               $('.save_no_reboot').hide();
               $('.save_reboot').show();
            }else{
                $('.save_no_reboot').show();
                $('.save_reboot').hide();
            }

            $('#transponderConfigurationIlap').hide();
            $('#transponderConfigurationArcitimer').hide();

            var type = transponderType[type].charAt(0).toUpperCase() + transponderType[type].slice(1);
            $('#transponderConfiguration' + type).show();
        }

        GUI.content_ready(callback);
    }
};

TABS.transponder.cleanup = function (callback) {
    if (callback) callback();
};
