'use strict';

TABS.osd_configuration = {
};

TABS.osd_configuration.initialize = function (callback) {
    var self = this;

    if (GUI.active_tab != 'osd_configuration') {
        GUI.active_tab = 'osd_configuration';
        googleAnalytics.sendAppView('OSD');
    }

    function load_status() {
        MSP.send_message(MSP_codes.MSP_STATUS, false, false, load_video_config);
    }

    function load_video_config() {
        MSP.send_message(MSP_codes.MSP_OSD_VIDEO_CONFIG, false, false, load_html);
    }

    function load_html() {
        $('#content').load("./tabs/osd_configuration.html", process_html);
    }

    load_status();

    function process_html() {
        
        var osdVideoModes = [
            'AUTO',
            'NTSC',
            'PAL'
        ];

        var osd_video_mode_e = $('select.osd_video_mode');
        for (var i = 0; i < osdVideoModes.length; i++) {
            osd_video_mode_e.append('<option value="' + i + '">' + osdVideoModes[i] + '</option>');
        }
        
        osd_video_mode_e.change(function () {
            OSD_VIDEO_CONFIG.video_mode = parseInt($(this).val());
        });
        
        osd_video_mode_e.val(OSD_VIDEO_CONFIG.video_mode);



        // translate to user-selected language
        localize();

        $('a.resetSettings').click(function () {
            MSP.send_message(MSP_codes.MSP_RESET_CONF, false, false, function () {
                GUI.log(chrome.i18n.getMessage('initialSetupSettingsRestored'));

                GUI.tab_switch_cleanup(function () {
                    TABS.osd_configuration.initialize();
                });
            });
        });
        
        $('a.save').click(function () {
            function save_video_config() {
                MSP.send_message(MSP_codes.MSP_SET_OSD_VIDEO_CONFIG, MSP.crunch(MSP_codes.MSP_SET_OSD_VIDEO_CONFIG), false, save_to_eeprom);
            }

            function save_to_eeprom() {
                MSP.send_message(MSP_codes.MSP_EEPROM_WRITE, false, false, function() {
                    GUI.log(chrome.i18n.getMessage('osdEepromSaved'));
                });
            }
            
            save_video_config();
        });

        GUI.content_ready(callback);
    }
};

TABS.osd_configuration.cleanup = function (callback) {
    if (callback) callback();
};
