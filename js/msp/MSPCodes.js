'use strict';

//MSPCodes needs to be re-integrated inside MSP object
var MSPCodes = {
    MSP_API_VERSION:                1,
    MSP_FC_VARIANT:                 2,
    MSP_FC_VERSION:                 3,
    MSP_BOARD_INFO:                 4,
    MSP_BUILD_INFO:                 5,

    MSP_NAME:                       10,
    MSP_SET_NAME:                   11,

    MSP_CHANNEL_FORWARDING:         32,
    MSP_SET_CHANNEL_FORWARDING:     33,
    MSP_MODE_RANGES:                34,
    MSP_SET_MODE_RANGE:             35,

    MSP_CURRENT_METER_CONFIG:       40,
    MSP_SET_CURRENT_METER_CONFIG:   41,

    MSP_RX_CONFIG:                  44,
    MSP_SET_RX_CONFIG:              45,
    MSP_LED_COLORS:                 46,
    MSP_SET_LED_COLORS:             47,
    MSP_LED_STRIP_CONFIG:           48,
    MSP_SET_LED_STRIP_CONFIG:       49,

    MSP_ADJUSTMENT_RANGES:          52,
    MSP_SET_ADJUSTMENT_RANGE:       53,
    MSP_CF_SERIAL_CONFIG:           54,
    MSP_SET_CF_SERIAL_CONFIG:       55,
    MSP_VOLTAGE_METER_CONFIG:       56,
    MSP_SET_VOLTAGE_METER_CONFIG:   57,
    MSP_SONAR:                      58,
    MSP_PID_CONTROLLER:             59,
    MSP_SET_PID_CONTROLLER:         60,
    MSP_ARMING_CONFIG:              61,
    MSP_SET_ARMING_CONFIG:          62,
    MSP_RX_MAP:                     64,
    MSP_SET_RX_MAP:                 65,
    MSP_BF_CONFIG:                  66,
    MSP_SET_BF_CONFIG:              67,
    MSP_SET_REBOOT:                 68,
    MSP_BF_BUILD_INFO:              69, // Not used
    MSP_DATAFLASH_SUMMARY:          70,
    MSP_DATAFLASH_READ:             71,
    MSP_DATAFLASH_ERASE:            72,
    MSP_LOOP_TIME:                  73,
    MSP_SET_LOOP_TIME:              74,
    MSP_FAILSAFE_CONFIG:            75,
    MSP_SET_FAILSAFE_CONFIG:        76,
    MSP_RXFAIL_CONFIG:              77,
    MSP_SET_RXFAIL_CONFIG:          78,
    MSP_SDCARD_SUMMARY:             79,
    MSP_BLACKBOX_CONFIG:            80,
    MSP_SET_BLACKBOX_CONFIG:        81,
    MSP_TRANSPONDER_CONFIG:         82,
    MSP_SET_TRANSPONDER_CONFIG:     83,
    MSP_OSD_CONFIG:                 84,
    MSP_SET_OSD_CONFIG:             85,
    MSP_OSD_CHAR_READ:              86,
    MSP_OSD_CHAR_WRITE:             87,
    MSP_VTX_CONFIG:                 88,
    MSP_SET_VTX_CONFIG:             89,
    MSP_ADVANCED_CONFIG:            90,
    MSP_SET_ADVANCED_CONFIG:        91,
    MSP_FILTER_CONFIG:              92,
    MSP_SET_FILTER_CONFIG:          93,
    MSP_PID_ADVANCED:               94,
    MSP_SET_PID_ADVANCED:           95,
    MSP_SENSOR_CONFIG:              96,
    MSP_SET_SENSOR_CONFIG:          97,
	MSP_TRANSPONDER_TYPE:           98,
	MSP_SET_TRANSPONDER_TYPE:       99,
    MSP_IDENT:                      100, // Not used
    MSP_STATUS:                     101,
    MSP_RAW_IMU:                    102,
    MSP_SERVO:                      103,
    MSP_MOTOR:                      104,
    MSP_RC:                         105,
    MSP_RAW_GPS:                    106,
    MSP_COMP_GPS:                   107,
    MSP_ATTITUDE:                   108,
    MSP_ALTITUDE:                   109,
    MSP_ANALOG:                     110,
    MSP_RC_TUNING:                  111,
    MSP_PID:                        112,
    MSP_BOX:                        113, // Not used
    MSP_MISC:                       114,
    MSP_MOTOR_PINS:                 115, // Not used
    MSP_BOXNAMES:                   116,
    MSP_PIDNAMES:                   117,
    MSP_WP:                         118, // Not used
    MSP_BOXIDS:                     119,
    MSP_SERVO_CONFIGURATIONS:       120,
    MSP_3D:                         124,
    MSP_RC_DEADBAND:                125,
    MSP_SENSOR_ALIGNMENT:           126,
    MSP_LED_STRIP_MODECOLOR:        127,

    MSP_STATUS_EX:                  150,

    MSP_UID:                        160,
    MSP_GPS_SV_INFO:                164,

    MSP_DISPLAYPORT:                182,

    MSP_SET_RAW_RC:                 200,
    MSP_SET_RAW_GPS:                201, // Not used
    MSP_SET_PID:                    202,
    MSP_SET_BOX:                    203,
    MSP_SET_RC_TUNING:              204,
    MSP_ACC_CALIBRATION:            205,
    MSP_MAG_CALIBRATION:            206,
    MSP_SET_MISC:                   207,
    MSP_RESET_CONF:                 208,
    MSP_SET_WP:                     209, // Not used
    MSP_SELECT_SETTING:             210,
    MSP_SET_HEAD:                   211, // Not used
    MSP_SET_SERVO_CONFIGURATION:    212,
    MSP_SET_MOTOR:                  214,
    MSP_SET_3D:                     217,
    MSP_SET_RC_DEADBAND:            218,
    MSP_SET_RESET_CURR_PID:         219,
    MSP_SET_SENSOR_ALIGNMENT:       220,
    MSP_SET_LED_STRIP_MODECOLOR:    221,

    MSP_SET_ACC_TRIM:               239,
    MSP_ACC_TRIM:                   240,
    MSP_SERVO_MIX_RULES:            241,
    MSP_SET_SERVO_MIX_RULE:         242, // Not used

    MSP_EEPROM_WRITE:               250,
    MSP_DEBUGMSG:                   253, // Not used
    MSP_DEBUG:                      254
};
