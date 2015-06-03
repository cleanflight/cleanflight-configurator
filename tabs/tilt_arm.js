'use strict';

TABS.tilt_arm = {};
TABS.tilt_arm.initialize = function (callback) {
    var self = this;
    
    if (GUI.active_tab != 'tilt_arm') {
        GUI.active_tab = 'tilt_arm';
        googleAnalytics.sendAppView('Tilting_arm');
    }
    
    function get_tilt_arm_conf_data() {
        MSP.send_message(MSP_codes.MSP_TILT_ARM_CONFIG, false, false, get_rc_data());
    }
    
    function get_rc_data() {
        MSP.send_message(MSP_codes.MSP_RC, false, false, load_html);
    }
    
    function load_html() {
        $('#content').load("./tabs/tilt_arm.html", process_html);
    }
    
    MSP.send_message(MSP_codes.MSP_IDENT, false, false, get_tilt_arm_conf_data);
    
    var pitchFlagEnable      =    parseInt('1', 2);
    var thrustFlagEnable     =   parseInt('10', 2);
    var rollyawFlagEnable    =  parseInt('100', 2);
    var thrustBodyFlagEnable = parseInt('1000', 2);
    
    function process_html() {
        
        if (CONFIG.multiType != 23){ // QuadXTiltArm
            $('div.tab-tilt-arm strong.model').text(chrome.i18n.getMessage('tiltArmModelNoSupport'));
            $('#TILT_TABLE').hide();
        }
        
        // translate to user-selected language
        localize();
        
        /* clear the select and then add elements */
        $('#CHANNELS').find('option').remove();

        var selected = '';
        var found = false;
        for (var i = 0; i < (RC.active_channels - 4); i++) {
            if (TILT_ARM_CONFIG.channel-4 === i){
                selected = 'selected';
                found = true;
            }else{
                selected = '';
            }
            $("#CHANNELS").append('<option value='+i+' '+selected+'>AUX'+(i+1)+'</option>');
        }
        if (!found)
            $("#CHANNELS").append('<option value=0 selected>WARNING: SELECT ONE CHANNEL HERE</option>');
        
        console.log("TILT_ARM_CONFIG.flagEnable "+TILT_ARM_CONFIG.flagEnable);
        
        if ( (TILT_ARM_CONFIG.flagEnable & pitchFlagEnable) > 0){
            console.log("pitchFlagEnable");
            $('#PITCH_ENABLE').prop('checked', true);
        }else{
            $('#PITCH_ENABLE').prop('checked', false);
        }
        
        if ( (TILT_ARM_CONFIG.flagEnable & thrustFlagEnable) > 0){
            console.log("thrustFlagEnable");
            $('#THRUST_ENABLE').prop('checked', true);
        }else{
            $('#THRUST_ENABLE').prop('checked', false);
        }
        
        if ( (TILT_ARM_CONFIG.flagEnable & rollyawFlagEnable) > 0){
            console.log("rollyawFlagEnable");
            $('#YAWROLL_ENABLE').prop('checked', true);
        }else{
            $('#YAWROLL_ENABLE').prop('checked', false);
        }
        
        if ( (TILT_ARM_CONFIG.flagEnable & thrustBodyFlagEnable) > 0){
            $('#THRUST_BODY_ENABLE').prop('checked', true);
        }else{
            $('#THRUST_BODY_ENABLE').prop('checked', false);
        }
        
        $('#PITCH_VALUE').val(TILT_ARM_CONFIG.pitchDivisior);
        $('#THRUST_VALUE').val(TILT_ARM_CONFIG.thrustLiftoff);
        $('#GEAR_RATIO').val(TILT_ARM_CONFIG.gearRatio/100);
        
        $('a.save').click(function () {
            TILT_ARM_CONFIG.flagEnable = 0;
            if ($('#PITCH_ENABLE').is(':checked') ){
                TILT_ARM_CONFIG.flagEnable |= pitchFlagEnable;
            }
            if ($('#THRUST_ENABLE').is(':checked') ){
                TILT_ARM_CONFIG.flagEnable |= thrustFlagEnable;
            }
            if ($('#YAWROLL_ENABLE').is(':checked') ){
                TILT_ARM_CONFIG.flagEnable |= rollyawFlagEnable;
            }
            if ($('#THRUST_BODY_ENABLE').is(':checked') ){
                TILT_ARM_CONFIG.flagEnable |= thrustBodyFlagEnable;
            }
            
            TILT_ARM_CONFIG.pitchDivisior = parseInt( $('#PITCH_VALUE').val() );
            TILT_ARM_CONFIG.thrustLiftoff = parseInt( $('#THRUST_VALUE').val() );
            TILT_ARM_CONFIG.channel = parseInt( $('#CHANNELS').val() ) + 4;
            TILT_ARM_CONFIG.gearRatio = Math.round(parseFloat( $('#GEAR_RATIO').val() )*100);
            
            MSP.send_message(MSP_codes.MSP_SET_TILT_ARM, MSP.crunch(MSP_codes.MSP_SET_TILT_ARM), false, function () {
                MSP.send_message(MSP_codes.MSP_EEPROM_WRITE, false, false, function () {
                    GUI.log(chrome.i18n.getMessage('servosEepromSave'));
                });
            });
            
            get_tilt_arm_conf_data();
        });
        
        // status data pulled via separate timer with static speed
        GUI.interval_add('status_pull', function () {
            MSP.send_message(MSP_codes.MSP_STATUS);
        }, 250, true);
        
        if (callback) callback();
    }
};

TABS.tilt_arm.cleanup = function (callback) {
    if (callback) callback();
};