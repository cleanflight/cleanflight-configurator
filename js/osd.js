'use strict';

// define all the global variables that are uses to hold FC state
var OSD_VIDEO_CONFIG;
var OSD_VIDEO_STATE;

var OSD = {
    resetState: function() {
        OSD_VIDEO_CONFIG = {
            video_mode: 0,
        };
        
        OSD_VIDEO_STATE = {
            video_mode: 0,
            camera_connected: 0,
        };        
    }
};