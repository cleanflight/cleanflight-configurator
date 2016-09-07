'use strict';

// define all the global variables that are uses to hold FC state
var OSD_VIDEO_CONFIG;
var OSD_VIDEO_STATE;
var OSD_LAYOUT;
var OSD_ELEMENT_SUMMARY;

var OSD = {
    resetState: function() {
        OSD_VIDEO_CONFIG = {
            video_mode: 0,
        };
        
        OSD_VIDEO_STATE = {
            video_mode: 0,
            camera_connected: 0,
            text_width: 0,
            text_height: 0,
        };
        OSD_LAYOUT = {
            elements: []
        };
        OSD_ELEMENT_SUMMARY = {
            supported_element_ids: []
        };
    }
};