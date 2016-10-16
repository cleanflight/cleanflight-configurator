'use strict';

TABS.power = {
    supported: false,
};

TABS.power.initialize = function (callback) {
    var self = this;

    if (GUI.active_tab != 'power') {
        GUI.active_tab = 'power';
        googleAnalytics.sendAppView('Power');
    }

    function load_status() {
        MSP.send_message(MSP_codes.MSP_STATUS, false, false, load_feature);
    }

    function load_feature() {
        MSP.send_message(MSP_codes.MSP_FEATURE, false, false, load_amperage_meters);
    }

    function load_amperage_meters() {
        MSP.send_message(MSP_codes.MSP_AMPERAGE_METERS, false, false, load_amperage_meter_configs);
    }
    
    function load_amperage_meter_configs() {
        MSP.send_message(MSP_codes.MSP_AMPERAGE_METER_CONFIG, false, false, load_voltage_meter_configs);
    }

    function load_voltage_meter_configs() {
        MSP.send_message(MSP_codes.MSP_VOLTAGE_METER_CONFIG, false, false, load_battery_state);
    }

    function load_battery_state() {
        MSP.send_message(MSP_codes.MSP_BATTERY_STATE, false, false, load_battery_config);
    }
    
    function load_battery_config() {
        MSP.send_message(MSP_codes.MSP_BATTERY_CONFIG, false, false, load_html);
    }

    function load_html() {
        $('#content').load("./tabs/power.html", process_html);
    }
    
    this.supported = semver.gte(CONFIG.apiVersion, "1.22.0");

    if (!this.supported) {
        load_html();
    } else {
        load_status();
    }

    function update_ui() {
        if (!TABS.power.supported) {
            $(".tab-power").removeClass("supported");
            return;
        }
        $(".tab-power").addClass("supported");

        // voltage meters
        
        var template = $('#tab-power-templates .voltage-meters .voltage-meter');
        var destination = $('.tab-power .voltage-meters'); 
        
        for (var index = 0; index < VOLTAGE_METERS.length; index++) {
            var meterElement = template.clone();
            $(meterElement).attr('id', 'voltage-meter-' + index);
            
            var message = chrome.i18n.getMessage('powerVoltage', [index + 1]);
            $(meterElement).find('.label').text(message)
            destination.append(meterElement);
        }
        
        var template = $('#tab-power-templates .voltage-configuration');
        for (var index = 0; index < VOLTAGE_METER_CONFIGS.length; index++) {
            var destination = $('#voltage-meter-' + index + ' .configuration');
            var element = template.clone();
            
            var attributeNames = ["vbatscale", "vbatresdivval", "vbatresdivmultiplier"]; 
            for (let attributeName of attributeNames) {
                $(element).find('input[name="' + attributeName + '"]').attr('name', attributeName + '-' + index);
            }
            destination.append(element);
            
            $('input[name="vbatscale-' + index + '"]').val(VOLTAGE_METER_CONFIGS[index].vbatscale);
            $('input[name="vbatresdivval-' + index + '"]').val(VOLTAGE_METER_CONFIGS[index].vbatresdivval);
            $('input[name="vbatresdivmultiplier-' + index + '"]').val(VOLTAGE_METER_CONFIGS[index].vbatresdivmultiplier);
        }

        // amperage meters

        var template = $('#tab-power-templates .amperage-meters .amperage-meter');
        var destination = $('.tab-power .amperage-meters'); 
        
        for (var index = 0; index < AMPERAGE_METERS.length; index++) {
            var meterElement = template.clone();
            $(meterElement).attr('id', 'amperage-meter-' + index);
            
            var message = chrome.i18n.getMessage('powerAmperage' + index);
            $(meterElement).find('.label').text(message)
            destination.append(meterElement);
        }
        
        var template = $('#tab-power-templates .amperage-configuration');
        for (var index = 0; index < AMPERAGE_METER_CONFIGS.length; index++) {
            var destination = $('#amperage-meter-' + index + ' .configuration');
            var element = template.clone();
            
            var attributeNames = ["amperagescale", "amperageoffset"]; 
            for (let attributeName of attributeNames) {
                $(element).find('input[name="' + attributeName + '"]').attr('name', attributeName + '-' + index);
            }
            destination.append(element);
            
            $('input[name="amperagescale-' + index + '"]').val(AMPERAGE_METER_CONFIGS[index].scale);
            $('input[name="amperageoffset-' + index + '"]').val(AMPERAGE_METER_CONFIGS[index].offset);
        }
        
        
        // battery
        
        var template = $('#tab-power-templates .battery-states .battery-state');
        var destination = $('.tab-power .battery-state');
        var element = template.clone();
        $(element).find('.connection-state').attr('id', 'battery-connection-state');
        $(element).find('.voltage').attr('id', 'battery-voltage');
        $(element).find('.mah-drawn').attr('id', 'battery-mah-drawn');
            
        destination.append(element.children());

        var template = $('#tab-power-templates .battery-configuration');
        var destination = $('.tab-power .battery .configuration');
        var element = template.clone();
        destination.append(element);
            
        $('input[name="mincellvoltage"]').val(BATTERY_CONFIG.vbatmincellvoltage);
        $('input[name="maxcellvoltage"]').val(BATTERY_CONFIG.vbatmaxcellvoltage);
        $('input[name="warningcellvoltage"]').val(BATTERY_CONFIG.vbatwarningcellvoltage);
        $('input[name="capacity"]').val(BATTERY_CONFIG.capacity);

        function get_slow_data() {
            MSP.send_message(MSP_codes.MSP_VOLTAGE_METERS, false, false, function () {
                for (var i = 0; i < VOLTAGE_METERS.length; i++) {
                    var elementName = '#voltage-meter-' + i + ' .value';
                    var element = $(elementName);
                    element.text(chrome.i18n.getMessage('powerVoltageValue', [VOLTAGE_METERS[i].voltage]));
                }
            });

            MSP.send_message(MSP_codes.MSP_AMPERAGE_METERS, false, false, function () {
                for (var i = 0; i < AMPERAGE_METERS.length; i++) {
                    var elementName = '#amperage-meter-' + i + ' .value';
                    var element = $(elementName);
                    element.text(chrome.i18n.getMessage('powerAmperageValue', [AMPERAGE_METERS[i].amperage.toFixed(2)]));
                }
            });
            
            MSP.send_message(MSP_codes.MSP_BATTERY_STATE, false, false, function () {
                var elementPrefix = '#battery';
                var element;
                    
                element = $(elementPrefix + '-connection-state .value');
                element.text(BATTERY_STATE.connected ? chrome.i18n.getMessage('powerBatteryConnectedValueYes') : chrome.i18n.getMessage('powerBatteryConnectedValueNo'));
                element = $(elementPrefix + '-voltage .value');
                element.text(chrome.i18n.getMessage('powerVoltageValue', [BATTERY_STATE.voltage]));
                element = $(elementPrefix + '-mah-drawn .value');
                element.text(chrome.i18n.getMessage('powerMahValue', [BATTERY_STATE.mah_drawn]));
            });

        }
        
        $('a.save').click(function () {
        
            for (var index = 0; index < VOLTAGE_METER_CONFIGS.length; index++) {
                VOLTAGE_METER_CONFIGS[index].vbatscale = parseInt($('input[name="vbatscale-' + index + '"]').val());
                VOLTAGE_METER_CONFIGS[index].vbatresdivval = parseInt($('input[name="vbatresdivval-' + index + '"]').val());
                VOLTAGE_METER_CONFIGS[index].vbatresdivmultiplier = parseInt($('input[name="vbatresdivmultiplier-' + index + '"]').val());
            }
            
            for (var index = 0; index < AMPERAGE_METER_CONFIGS.length; index++) {
                AMPERAGE_METER_CONFIGS[index].scale = parseInt($('input[name="amperagescale-' + index + '"]').val());
                AMPERAGE_METER_CONFIGS[index].offset = parseInt($('input[name="amperageoffset-' + index + '"]').val());
            }
                
            BATTERY_CONFIG.vbatmincellvoltage = parseFloat($('input[name="mincellvoltage"]').val());
            BATTERY_CONFIG.vbatmaxcellvoltage = parseFloat($('input[name="maxcellvoltage"]').val());
            BATTERY_CONFIG.vbatwarningcellvoltage = parseFloat($('input[name="warningcellvoltage"]').val());
            BATTERY_CONFIG.capacity = parseInt($('input[name="capacity"]').val());

            function save_features() {
                MSP.send_message(MSP_codes.MSP_SET_FEATURE, MSP.crunch(MSP_codes.MSP_SET_FEATURE), false, save_voltage_config);
            }

            function save_voltage_config() {
                MSP.sendVoltageMeterConfigs(save_amperage_config);
            }

            function save_amperage_config() {
                MSP.sendAmperageMeterConfigs(save_battery_config);
            }

            function save_battery_config() {
                MSP.send_message(MSP_codes.MSP_SET_BATTERY_CONFIG, MSP.crunch(MSP_codes.MSP_SET_BATTERY_CONFIG), false, save_to_eeprom);
            }
            
            function save_to_eeprom() {
                MSP.send_message(MSP_codes.MSP_EEPROM_WRITE, false, false, save_completed);
            }

            function save_completed() {
                GUI.log(chrome.i18n.getMessage('configurationEepromSaved'));

                TABS.power.initialize();
            }

            save_features();
        });

        GUI.interval_add('setup_data_pull_slow', get_slow_data, 200, true); // 5hz
    }
    
    function process_html() {
        update_ui();
        
        // translate to user-selected language
        localize();
        
        GUI.content_ready(callback);
    }
};

TABS.power.cleanup = function (callback) {
    if (callback) callback();
};
