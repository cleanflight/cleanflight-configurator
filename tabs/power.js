'use strict';

TABS.power = {
};

TABS.power.initialize = function (callback) {
    var self = this;

    if (GUI.active_tab != 'power') {
        GUI.active_tab = 'power';
        googleAnalytics.sendAppView('Power');
    }

    function load_status() {
        MSP.send_message(MSP_codes.MSP_STATUS, false, false, load_html);
    }

    function load_html() {
        $('#content').load("./tabs/power.html", process_html);
    }

    load_status();

    function process_html() {

        // translate to user-selected language
        localize();

        function get_slow_data() {
            MSP.send_message(MSP_codes.MSP_STATUS);

            MSP.send_message(MSP_codes.MSP_VOLTAGE_METERS, false, false, function () {
                for (var i = 0; i < VOLTAGE_METERS.length; i++) {
                    var elementName = '.voltage-meter-' + (i + 1);
                    var element;
                    
                    element = $(elementName);
                    element.text(chrome.i18n.getMessage('powerVoltageValue', [VOLTAGE_METERS[i].voltage]));
                }
            });

            MSP.send_message(MSP_codes.MSP_CURRENT_METERS, false, false, function () {
                for (var i = 0; i < CURRENT_METERS.length; i++) {
                    var elementName = '.current-meter-' + (i + 1);
                    var element;
                    
                    element = $(elementName);
                    element.text(chrome.i18n.getMessage('powerAmperageValue', [CURRENT_METERS[i].amperage.toFixed(2)]));
                }
            });
            
            MSP.send_message(MSP_codes.MSP_BATTERY_STATES, false, false, function () {
                for (var i = 0; i < BATTERY_STATES.length; i++) {
                    var elementPrefix = '.battery-' + (i + 1);
                    var element;
                    
                    element = $(elementPrefix + '-connected');
                    element.text(BATTERY_STATES[i].connected ? chrome.i18n.getMessage('powerBatteryConnectedValueYes') : chrome.i18n.getMessage('powerBatteryConnectedValueNo'));
                    element = $(elementPrefix + '-mah-drawn');
                    element.text(chrome.i18n.getMessage('powerMahValue', [BATTERY_STATES[i].mah_drawn]));
                    element = $(elementPrefix + '-voltage');
                    element.text(chrome.i18n.getMessage('powerVoltageValue', [BATTERY_STATES[i].voltage]));
                }
            });

        }

        GUI.interval_add('setup_data_pull_slow', get_slow_data, 200, true); // 5hz

        GUI.content_ready(callback);
    }
};

TABS.power.cleanup = function (callback) {
    if (callback) callback();
};
