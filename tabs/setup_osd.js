'use strict';

TABS.setup_osd = {
};

TABS.setup_osd.initialize = function (callback) {
    var self = this;

    if (GUI.active_tab != 'setup_osd') {
        GUI.active_tab = 'setup_osd';
        googleAnalytics.sendAppView('Setup OSD');
    }

    function load_status() {
        MSP.send_message(MSP_codes.MSP_STATUS, false, false, load_html);
    }

    function load_html() {
        $('#content').load("./tabs/setup_osd.html", process_html);
    }

    load_status();

    function process_html() {

        // translate to user-selected language
        localize();

        $('a.resetSettings').click(function () {
            MSP.send_message(MSP_codes.MSP_RESET_CONF, false, false, function () {
                GUI.log(chrome.i18n.getMessage('initialSetupSettingsRestored'));

                GUI.tab_switch_cleanup(function () {
                    TABS.setup_osd.initialize();
                });
            });
        });
        
        function get_slow_data() {
            MSP.send_message(MSP_codes.MSP_STATUS);

            MSP.send_message(MSP_codes.MSP_VOLTAGE_METERS, false, false, function () {
                for (var i = 0; i < VOLTAGE_METERS.length; i++) {
                    var elementName = '.voltage-meter-' + (i + 1);
                    var element;
                    
                    element = $(elementName);
                    element.text(chrome.i18n.getMessage('osdBatteryVoltageValue', [VOLTAGE_METERS[i].voltage]));
                }
            });

            MSP.send_message(MSP_codes.MSP_CURRENT_METERS, false, false, function () {
                for (var i = 0; i < CURRENT_METERS.length; i++) {
                    var elementName = '.current-meter-' + (i + 1);
                    var element;
                    
                    element = $(elementName);
                    element.text(chrome.i18n.getMessage('osdBatteryAmperageValue', [CURRENT_METERS[i].amperage.toFixed(2)]));
                }
            });
            
            MSP.send_message(MSP_codes.MSP_BATTERY_STATES, false, false, function () {
                for (var i = 0; i < BATTERY_STATES.length; i++) {
                    var elementPrefix = '.battery-' + (i + 1);
                    var element;
                    
                    element = $(elementPrefix + '-connected');
                    element.text(BATTERY_STATES[i].connected ? chrome.i18n.getMessage('osdBatteryConnectedValueYes') : chrome.i18n.getMessage('osdBatteryConnectedValueNo'));
                    element = $(elementPrefix + '-mah-drawn');
                    element.text(chrome.i18n.getMessage('osdBatteryMahValue', [BATTERY_STATES[i].mah_drawn]));
                    element = $(elementPrefix + '-voltage');
                    element.text(chrome.i18n.getMessage('osdBatteryVoltageValue', [BATTERY_STATES[i].voltage]));
                }
            });

        }

        function get_fast_data() {
            // nothing to do
        }

        GUI.interval_add('setup_data_pull_fast', get_fast_data, 33, true); // 30 fps
        GUI.interval_add('setup_data_pull_slow', get_slow_data, 250, true); // 4 fps

        GUI.content_ready(callback);
    }
};

TABS.setup_osd.cleanup = function (callback) {
    if (callback) callback();
};
