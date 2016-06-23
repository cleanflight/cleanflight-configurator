'use strict';


var OSD = OSD || {};



TABS.osd = {};
TABS.osd.initialize = function (callback) {
    var self = this;


    if (GUI.active_tab != 'osd') {
        GUI.active_tab = 'osd';
        googleAnalytics.sendAppView('OSD');
    }
    
    $('#content').load("./tabs/osd.html", function () {
        // translate to user-selected language
        localize();

 
function on_tab_loaded_handler() {

        localize();
        
        update_ui();

        $('a.save').click(on_save_handler);

        // status data pulled via separate timer with static speed
        GUI.interval_add('status_pull', function status_pull() {
            MSP.send_message(MSP_codes.MSP_STATUS);
        }, 250, true);

        GUI.content_ready(callback);
    }



        GUI.content_ready(callback);
    });
};

TABS.osd.cleanup = function (callback) {
    PortHandler.flush_callbacks();

    // unbind "global" events
    $(document).unbind('keypress');
    $(document).off('click', 'span.progressLabel a');

    if (callback) callback();
};
