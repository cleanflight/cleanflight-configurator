'use strict';

// MSP_codes needs to be re-integrated inside MSP object
var MSP_codes = {
    MSP_API_VERSION:            1,
    MSP_FC_VARIANT:             2,
    MSP_FC_VERSION:             3,
    MSP_BOARD_INFO:             4,
    MSP_BUILD_INFO:             5,
    
    // MSP commands for Cleanflight original features
    MSP_BATTERY_CONFIG:          32,
    MSP_SET_BATTERY_CONFIG:      33,
    MSP_MODE_RANGES:             34,
    MSP_SET_MODE_RANGE:          35,
    MSP_FEATURE:                 36,
    MSP_SET_FEATURE:             37,
    MSP_BOARD_ALIGNMENT:         38,
    MSP_SET_BOARD_ALIGNMENT:     39,
    MSP_AMPERAGE_METER_CONFIG:   40,
    MSP_SET_AMPERAGE_METER_CONFIG:41,
    MSP_MIXER:                   42,
    MSP_SET_MIXER:               43,
    MSP_RX_CONFIG:               44,
    MSP_SET_RX_CONFIG:           45,
    MSP_LED_COLORS:              46,
    MSP_SET_LED_COLORS:          47,
    MSP_LED_STRIP_CONFIG:        48,
    MSP_SET_LED_STRIP_CONFIG:    49,
    MSP_ADJUSTMENT_RANGES:       52,
    MSP_SET_ADJUSTMENT_RANGE:    53,
    MSP_CF_SERIAL_CONFIG:        54,
    MSP_SET_CF_SERIAL_CONFIG:    55,
    MSP_VOLTAGE_METER_CONFIG:    56,
    MSP_SET_VOLTAGE_METER_CONFIG:57,
    MSP_SONAR:                   58,
    MSP_PID_CONTROLLER:          59,
    MSP_SET_PID_CONTROLLER:      60,
    MSP_ARMING_CONFIG:           61,
    MSP_SET_ARMING_CONFIG:       62,
    MSP_DATAFLASH_SUMMARY:       70,
    MSP_DATAFLASH_READ:          71,
    MSP_DATAFLASH_ERASE:         72,
    MSP_LOOP_TIME:               73,
    MSP_SET_LOOP_TIME:           74,
    MSP_FAILSAFE_CONFIG:         75,
    MSP_SET_FAILSAFE_CONFIG:     76,
    MSP_RXFAIL_CONFIG:           77,
    MSP_SET_RXFAIL_CONFIG:       78,
    MSP_SDCARD_SUMMARY:          79,
    MSP_BLACKBOX_CONFIG:         80,
    MSP_SET_BLACKBOX_CONFIG:     81,
    MSP_TRANSPONDER_CONFIG:      82,
    MSP_SET_TRANSPONDER_CONFIG:  83,
    MSP_VTX:                     88,
    MSP_SET_VTX:                 89,

    MSP_SET_TRANSPONDER_TYPE:    99,
    MSP_TRANSPONDER_TYPE:        98,

    MSP_LED_STRIP_MODECOLOR:     127,
    MSP_SET_LED_STRIP_MODECOLOR: 221,
    
    MSP_VOLTAGE_METERS:          128,
    MSP_AMPERAGE_METERS:         129,
    MSP_BATTERY_STATE:           130,

    MSP_PILOT:                   131,
    MSP_SET_PILOT:               222,

    // OSD commands
    
    MSP_OSD_VIDEO_CONFIG:       180,
    MSP_SET_OSD_VIDEO_CONFIG:   181,
    MSP_OSD_VIDEO_STATUS:       182,
    MSP_OSD_ELEMENT_SUMMARY:    183,
    MSP_OSD_LAYOUT_CONFIG:      184,
    MSP_SET_OSD_LAYOUT_CONFIG:  185,
    
    // Multiwii MSP commands
    MSP_IDENT:              100,
    MSP_STATUS:             101,
    MSP_RAW_IMU:            102,
    MSP_SERVO:              103,
    MSP_MOTOR:              104,
    MSP_RC:                 105,
    MSP_RAW_GPS:            106,
    MSP_COMP_GPS:           107,
    MSP_ATTITUDE:           108,
    MSP_ALTITUDE:           109,
    MSP_ANALOG:             110,
    MSP_RC_TUNING:          111,
    MSP_PID:                112,
    MSP_BOX:                113,
    MSP_MISC:               114,
    MSP_MOTOR_PINS:         115,
    MSP_BOXNAMES:           116,
    MSP_PIDNAMES:           117,
    MSP_WP:                 118,
    MSP_BOXIDS:             119,
    MSP_SERVO_CONFIGURATIONS: 120,
    MSP_3D:                 124,
    MSP_RC_DEADBAND:        125,
    MSP_SENSOR_ALIGNMENT:   126,
    
    MSP_SET_RAW_RC:         200,
    MSP_SET_RAW_GPS:        201,
    MSP_SET_PID:            202,
    MSP_SET_BOX:            203,
    MSP_SET_RC_TUNING:      204,
    MSP_ACC_CALIBRATION:    205,
    MSP_MAG_CALIBRATION:    206,
    MSP_SET_MISC:           207,
    MSP_RESET_CONF:         208,
    MSP_SET_WP:             209,
    MSP_SELECT_SETTING:     210,
    MSP_SET_HEAD:           211,
    MSP_SET_SERVO_CONFIGURATION: 212,
    MSP_SET_MOTOR:          214,
    MSP_SET_3D:             217,
    MSP_SET_RC_DEADBAND:    218,
    MSP_SET_RESET_CURR_PID: 219,
    MSP_SET_SENSOR_ALIGNMENT: 220,
    
    // MSP_BIND:               240,
    
    MSP_SERVO_MIX_RULES:    241,
    MSP_SET_SERVO_MIX_RULE: 242,

    MSP_EEPROM_WRITE:       250,

    MSP_DEBUGMSG:           253,
    MSP_DEBUG:              254,

    // Additional baseflight commands that are not compatible with MultiWii
    MSP_UID:                160, // Unique device ID
    MSP_ACC_TRIM:           240, // get acc angle trim values
    MSP_SET_ACC_TRIM:       239, // set acc angle trim values
    MSP_GPS_SV_INFO:        164, // get Signal Strength
    
    // Additional private MSP for baseflight configurator
    MSP_RX_MAP:                64, // get channel map (also returns number of channels total)
    MSP_SET_RX_MAP:            65, // set rc map, numchannels to set comes from MSP_RX_MAP
        
    MSP_SET_REBOOT:            68, // reboot settings
    MSP_BF_BUILD_INFO:         69  // build date as well as some space for future expansion
};

var MSP = {
    state:                      0,
    message_direction:          1,
    code:                       0,
    message_length_expected:    0,
    message_length_received:    0,
    message_buffer:             null,
    message_buffer_uint8_view:  null,
    message_checksum:           0,

    callbacks:                  [],
    packet_error:               0,
    unsupported:                0,

    ledDirectionLetters:        ['n', 'e', 's', 'w', 'u', 'd'],      // in LSB bit order
    ledFunctionLetters:         ['i', 'w', 'f', 'a', 't', 'r', 'c', 'g', 's', 'b', 'l'], // in LSB bit order
    ledBaseFunctionLetters:     ['c', 'f', 'a', 'l', 's', 'g', 'r'], // in LSB bit 
    ledOverlayLetters:          ['t', 'o', 'b', 'n', 'i', 'w'], // in LSB bit 
    
    last_received_timestamp:   null,
    analog_last_received_timestamp: null,
    
    supportedBaudRates: [ // 0 based index.
        'AUTO',
        '9600',
        '19200',
        '38400',
        '57600',
        '115200',
        '230400',
        '250000',
    ],
    
    serialPortFunctions: {
            'MSP': 0,
            'GPS': 1, 
            'TELEMETRY_FRSKY': 2, 
            'TELEMETRY_HOTT': 3,
            'TELEMETRY_MSP': 4, 
            'TELEMETRY_LTM': 4, // LTM replaced MSP 
            'TELEMETRY_SMARTPORT': 5,
            'RX_SERIAL': 6,
            'BLACKBOX': 7,
            'TELEMETRY_MAVLINK': 8,
            //'MSP_CLIENT': 9,
            'TELEMETRY_IBUS': 10,
        },

    read: function (readInfo) {
        var data = new Uint8Array(readInfo.data);

        for (var i = 0; i < data.length; i++) {
            switch (this.state) {
                case 0: // sync char 1
                    if (data[i] == 36) { // $
                        this.state++;
                    }
                    break;
                case 1: // sync char 2
                    if (data[i] == 77) { // M
                        this.state++;
                    } else { // restart and try again
                        this.state = 0;
                    }
                    break;
                case 2: // direction (should be >)
                    this.unsupported = 0;
                    if (data[i] == 62) { // >
                        this.message_direction = 1;
                    } else if (data[i] == 60) { // <
                        this.message_direction = 0;
                    } else if (data[i] == 33) { // !
                        // FC reports unsupported message error
                        this.unsupported = 1;
                    }

                    this.state++;
                    break;
                case 3:
                    this.message_length_expected = data[i];

                    this.message_checksum = data[i];

                    // setup arraybuffer
                    this.message_buffer = new ArrayBuffer(this.message_length_expected);
                    this.message_buffer_uint8_view = new Uint8Array(this.message_buffer);

                    this.state++;
                    break;
                case 4:
                    this.code = data[i];
                    this.message_checksum ^= data[i];

                    if (this.message_length_expected > 0) {
                        // process payload
                        this.state++;
                    } else {
                        // no payload
                        this.state += 2;
                    }
                    break;
                case 5: // payload
                    this.message_buffer_uint8_view[this.message_length_received] = data[i];
                    this.message_checksum ^= data[i];
                    this.message_length_received++;

                    if (this.message_length_received >= this.message_length_expected) {
                        this.state++;
                    }
                    break;
                case 6:
                    if (this.message_checksum == data[i]) {
                        // message received, process
                        this.process_data(this.code, this.message_buffer, this.message_length_expected);
                    } else {
                        console.log('code: ' + this.code + ' - crc failed');

                        this.packet_error++;
                        $('span.packet-error').html(this.packet_error);
                    }

                    // Reset variables
                    this.message_length_received = 0;
                    this.state = 0;
                    break;

                default:
                    console.log('Unknown state detected: ' + this.state);
            }
        }
        this.last_received_timestamp = Date.now();
    },
    process_data: function (code, message_buffer, message_length) {
        var data = new DataView(message_buffer, 0); // DataView (allowing us to view arrayBuffer as struct/union)
       
        if (!this.unsupported) switch (code) {
            case MSP_codes.MSP_IDENT:
                console.log('Using deprecated msp command: MSP_IDENT');
                // Deprecated
                CONFIG.version = parseFloat((data.getUint8(0) / 100).toFixed(2));
                CONFIG.multiType = data.getUint8(1);
                CONFIG.msp_version = data.getUint8(2);
                CONFIG.capability = data.getUint32(3, 1);
                break;
            case MSP_codes.MSP_STATUS:
                CONFIG.pidDeltaUs = data.getUint16(0, 1);
                CONFIG.i2cError = data.getUint16(2, 1);
                CONFIG.activeSensors = data.getUint16(4, 1);
                CONFIG.mode = data.getUint32(6, 1);
                CONFIG.profile = data.getUint8(10);
                if (semver.gte(CONFIG.apiVersion, "1.22.0")) {
                    CONFIG.cpuload = data.getUint16(11, 1);
                }
                if (semver.gte(CONFIG.apiVersion, "1.23.0")) {
                    CONFIG.gyroDeltaUs = data.getUint16(13, 1);
                }
                $('select[name="profilechange"]').val(CONFIG.profile);

                sensor_status(CONFIG.activeSensors);
                $('span.i2c-error').text(CONFIG.i2cError);
                $('span.pid-delta').text(CONFIG.pidDeltaUs);
                $('span.gyro-delta').text(CONFIG.gyroDeltaUs);
                $('span.cpu-load').text(CONFIG.cpuload + '%');
                
                
                break;
            case MSP_codes.MSP_RAW_IMU:
                // 512 for mpu6050, 256 for mma
                // currently we are unable to differentiate between the sensor types, so we are goign with 512
                SENSOR_DATA.accelerometer[0] = data.getInt16(0, 1) / 512;
                SENSOR_DATA.accelerometer[1] = data.getInt16(2, 1) / 512;
                SENSOR_DATA.accelerometer[2] = data.getInt16(4, 1) / 512;

                // properly scaled
                SENSOR_DATA.gyroscope[0] = data.getInt16(6, 1) * (4 / 16.4);
                SENSOR_DATA.gyroscope[1] = data.getInt16(8, 1) * (4 / 16.4);
                SENSOR_DATA.gyroscope[2] = data.getInt16(10, 1) * (4 / 16.4);

                // no clue about scaling factor
                SENSOR_DATA.magnetometer[0] = data.getInt16(12, 1) / 1090;
                SENSOR_DATA.magnetometer[1] = data.getInt16(14, 1) / 1090;
                SENSOR_DATA.magnetometer[2] = data.getInt16(16, 1) / 1090;
                break;
            case MSP_codes.MSP_SERVO:
                var servoCount = message_length / 2;
                var needle = 0;
                for (var i = 0; i < servoCount; i++) {
                    SERVO_DATA[i] = data.getUint16(needle, 1);

                    needle += 2;
                }
                break;
            case MSP_codes.MSP_MOTOR:
                var motorCount = message_length / 2;
                var needle = 0;
                for (var i = 0; i < motorCount; i++) {
                    MOTOR_DATA[i] = data.getUint16(needle, 1);

                    needle += 2;
                }
                break;
            case MSP_codes.MSP_RC:
                RC.active_channels = message_length / 2;

                for (var i = 0; i < RC.active_channels; i++) {
                    RC.channels[i] = data.getUint16((i * 2), 1);
                }
                break;
            case MSP_codes.MSP_RAW_GPS:
                GPS_DATA.fix = data.getUint8(0);
                GPS_DATA.numSat = data.getUint8(1);
                GPS_DATA.lat = data.getInt32(2, 1);
                GPS_DATA.lon = data.getInt32(6, 1);
                GPS_DATA.alt = data.getUint16(10, 1);
                GPS_DATA.speed = data.getUint16(12, 1);
                GPS_DATA.ground_course = data.getUint16(14, 1);
                break;
            case MSP_codes.MSP_COMP_GPS:
                GPS_DATA.distanceToHome = data.getUint16(0, 1);
                GPS_DATA.directionToHome = data.getUint16(2, 1);
                GPS_DATA.update = data.getUint8(4);
                break;
            case MSP_codes.MSP_ATTITUDE:
                SENSOR_DATA.kinematics[0] = data.getInt16(0, 1) / 10.0; // x
                SENSOR_DATA.kinematics[1] = data.getInt16(2, 1) / 10.0; // y
                SENSOR_DATA.kinematics[2] = data.getInt16(4, 1); // z
                break;
            case MSP_codes.MSP_ALTITUDE:
                SENSOR_DATA.altitude = parseFloat((data.getInt32(0, 1) / 100.0).toFixed(2)); // correct scale factor
                break;
            case MSP_codes.MSP_SONAR:
                SENSOR_DATA.sonar = data.getInt32(0, 1);
                break;
            case MSP_codes.MSP_ANALOG:
                ANALOG.voltage = data.getUint8(0) / 10.0;
                ANALOG.mAhdrawn = data.getUint16(1, 1);
                ANALOG.rssi = data.getUint16(3, 1); // 0-1023
                ANALOG.amperage = data.getInt16(5, 1) / 100; // A
                this.analog_last_received_timestamp = Date.now();
                break;
            case MSP_codes.MSP_VOLTAGE_METERS:
                var offset = 0;
                VOLTAGE_METERS = [];
                for (var i = 0; i < (message_length); i++) {
                    var voltageMeter = {};
                    voltageMeter.voltage = data.getUint8(offset++) / 10.0;
                    
                    VOLTAGE_METERS.push(voltageMeter)
                }
                break;
            case MSP_codes.MSP_VOLTAGE_METER_CONFIG:
                var offset = 0;
                VOLTAGE_METER_CONFIGS = [];
                var voltage_meter_count = message_length / 3;
                for (var i = 0; i < voltage_meter_count; i++) {
                    var voltageMeterConfig = {};
                    voltageMeterConfig.vbatscale = data.getUint8(offset++);
                    voltageMeterConfig.vbatresdivval = data.getUint8(offset++);
                    voltageMeterConfig.vbatresdivmultiplier = data.getUint8(offset++);
                    
                    VOLTAGE_METER_CONFIGS.push(voltageMeterConfig);
                }
                break;
            case MSP_codes.MSP_AMPERAGE_METER_CONFIG:
                var offset = 0;
                AMPERAGE_METER_CONFIGS = [];
                var amperage_meter_count = message_length / 4;
                for (var i = 0; i < amperage_meter_count; i++) {
                    var amperageMeterConfig = {};
                    amperageMeterConfig.scale = data.getInt16(offset, 1);
                    offset+=2;
                    amperageMeterConfig.offset = data.getUint16(offset, 1);
                    offset+=2;
                    
                    AMPERAGE_METER_CONFIGS.push(amperageMeterConfig);
                }
                break;
            case MSP_codes.MSP_BATTERY_CONFIG:
                var offset = 0;
                BATTERY_CONFIG.vbatmincellvoltage = data.getUint8(offset++) / 10;
                BATTERY_CONFIG.vbatmaxcellvoltage = data.getUint8(offset++) / 10;
                BATTERY_CONFIG.vbatwarningcellvoltage = data.getUint8(offset++) / 10;
                BATTERY_CONFIG.capacity = data.getUint16(offset, 1);
                offset+=2;
                BATTERY_CONFIG.amperageMeterSource = data.getUint8(offset++);
                break;
            case MSP_codes.MSP_AMPERAGE_METERS:
                var offset = 0;
                AMPERAGE_METERS = [];
                for (var i = 0; i < (message_length / 6); i++) {
                    var amperageMeter = {};
                    amperageMeter.amperage = data.getInt16(offset, 1) / 1000; // A
                    offset += 2;
                    amperageMeter.mAhDrawn = data.getUint32(offset, 1); // A
                    offset += 4;
                    
                    AMPERAGE_METERS.push(amperageMeter);
                }
                break;
            case MSP_codes.MSP_BATTERY_STATE:
                var offset = 0;
                BATTERY_STATE.connected = data.getUint8(offset, 1); // A
                offset += 1;
                BATTERY_STATE.voltage = data.getUint8(offset) / 10.0;
                offset += 1;
                BATTERY_STATE.mah_drawn = data.getUint16(offset, 1);
                offset += 2;
                break;
            case MSP_codes.MSP_VTX:
                var offset = 0;
                var flags = data.getUint8(offset++, 1);

                VTX.supported = bit_check(flags, 0);

                VTX_STATE.enabled = bit_check(flags, 1);
                VTX_STATE.channel = data.getUint8(offset++, 1);
                VTX_STATE.band = data.getUint8(offset++, 1);
                VTX_STATE.rfPower = data.getUint8(offset++, 1);

                VTX_CONFIG.channel = data.getUint8(offset++, 1);
                VTX_CONFIG.band = data.getUint8(offset++, 1);
                VTX_CONFIG.rfPower = data.getUint8(offset++, 1);
                VTX_CONFIG.enabledOnBoot = data.getUint8(offset++, 1);
                break;

            case MSP_codes.MSP_RC_TUNING:
                var offset = 0;
                RC_tuning.RC_RATE = parseFloat((data.getUint8(offset++) / 100).toFixed(2));
                RC_tuning.RC_EXPO = parseFloat((data.getUint8(offset++) / 100).toFixed(2));
                if (semver.lt(CONFIG.apiVersion, "1.7.0")) {
                    RC_tuning.roll_pitch_rate = parseFloat((data.getUint8(offset++) / 100).toFixed(2));
                    RC_tuning.pitch_rate = 0;
                    RC_tuning.roll_rate = 0;
                } else {
                    RC_tuning.roll_pitch_rate = 0;
                    RC_tuning.roll_rate = parseFloat((data.getUint8(offset++) / 100).toFixed(2));
                    RC_tuning.pitch_rate = parseFloat((data.getUint8(offset++) / 100).toFixed(2));
                }
                RC_tuning.yaw_rate = parseFloat((data.getUint8(offset++) / 100).toFixed(2));
                RC_tuning.dynamic_THR_PID = parseFloat((data.getUint8(offset++) / 100).toFixed(2));
                RC_tuning.throttle_MID = parseFloat((data.getUint8(offset++) / 100).toFixed(2));
                RC_tuning.throttle_EXPO = parseFloat((data.getUint8(offset++) / 100).toFixed(2));
                if (semver.gte(CONFIG.apiVersion, "1.7.0")) {
                    RC_tuning.dynamic_THR_breakpoint = data.getUint16(offset, 1);
                    offset += 2;
                } else {
                    RC_tuning.dynamic_THR_breakpoint = 0;
                }
                if (semver.gte(CONFIG.apiVersion, "1.10.0")) {
                    RC_tuning.RC_YAW_EXPO = parseFloat((data.getUint8(offset++) / 100).toFixed(2));
                } else {
                    RC_tuning.RC_YAW_EXPO = 0;
                }
                break;
            case MSP_codes.MSP_PID:
                // PID data arrived, we need to scale it and save to appropriate bank / array
                for (var i = 0, needle = 0; i < (message_length / 3); i++, needle += 3) {
                    // main for loop selecting the pid section
                    switch (i) {
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                        case 7:
                        case 8:
                        case 9:
                            PIDs[i][0] = data.getUint8(needle);
                            PIDs[i][1] = data.getUint8(needle + 1);
                            PIDs[i][2] = data.getUint8(needle + 2);
                            break;
                        case 4:
                            PIDs[i][0] = data.getUint8(needle);
                            PIDs[i][1] = data.getUint8(needle + 1);
                            PIDs[i][2] = data.getUint8(needle + 2);
                            break;
                        case 5:
                        case 6:
                            PIDs[i][0] = data.getUint8(needle);
                            PIDs[i][1] = data.getUint8(needle + 1);
                            PIDs[i][2] = data.getUint8(needle + 2);
                            break;
                    }
                }
                break;
            // Disabled, cleanflight does not use MSP_BOX.
            /*
            case MSP_codes.MSP_BOX:
                AUX_CONFIG_values = []; // empty the array as new data is coming in

                // fill in current data
                for (var i = 0; i < data.byteLength; i += 2) { // + 2 because uint16_t = 2 bytes
                    AUX_CONFIG_values.push(data.getUint16(i, 1));
                }
                break;
            */
            case MSP_codes.MSP_ARMING_CONFIG:
                if (semver.gte(CONFIG.apiVersion, "1.8.0")) {
                    ARMING_CONFIG.auto_disarm_delay = data.getUint8(0, 1);
                    ARMING_CONFIG.disarm_kill_switch = data.getUint8(1);
                }
                break;
            case MSP_codes.MSP_LOOP_TIME:
                if (semver.gte(CONFIG.apiVersion, "1.8.0")) {
                    FC_CONFIG.loopTime = data.getInt16(0, 1);
                }
                break;
            case MSP_codes.MSP_MISC: // 22 bytes
                var offset = 0;
                MISC.midrc = data.getInt16(offset, 1);
                offset += 2;
                MISC.minthrottle = data.getUint16(offset, 1); // 0-2000
                offset += 2;
                MISC.maxthrottle = data.getUint16(offset, 1); // 0-2000
                offset += 2;
                MISC.mincommand = data.getUint16(offset, 1); // 0-2000
                offset += 2;
                MISC.failsafe_throttle = data.getUint16(offset, 1); // 1000-2000
                offset += 2;
                MISC.gps_type = data.getUint8(offset++);
                MISC.gps_baudrate = data.getUint8(offset++);
                MISC.gps_ubx_sbas = data.getInt8(offset++);
                MISC.multiwiicurrentoutput = data.getUint8(offset++);
                MISC.rssi_channel = data.getUint8(offset++);
                MISC.placeholder2 = data.getUint8(offset++);                
                if (semver.lt(CONFIG.apiVersion, "1.18.0"))
                    MISC.mag_declination = data.getInt16(offset, 1) / 10; // -1800-1800
                else
                    MISC.mag_declination = data.getInt16(offset, 1) / 100; // -18000-18000                
                offset += 2;
                if (semver.lt(CONFIG.apiVersion, "1.22.0")) {
                    MISC.vbatscale = data.getUint8(offset++, 1); // 10-200
                    MISC.vbatmincellvoltage = data.getUint8(offset++, 1) / 10; // 10-50
                    MISC.vbatmaxcellvoltage = data.getUint8(offset++, 1) / 10; // 10-50
                    MISC.vbatwarningcellvoltage = data.getUint8(offset++, 1) / 10; // 10-50
                }
                break;
            case MSP_codes.MSP_3D:
                var offset = 0;
                _3D.deadband3d_low = data.getUint16(offset, 1);
                offset += 2;
                _3D.deadband3d_high = data.getUint16(offset, 1);
                offset += 2;
                _3D.neutral3d = data.getUint16(offset, 1);
                
                if (semver.lt(CONFIG.apiVersion, "1.17.0")) {
                    offset += 2;
                    _3D.deadband3d_throttle = data.getUint16(offset, 1);
                }
                break;
            case MSP_codes.MSP_MOTOR_PINS:
                console.log(data);
                break;
            case MSP_codes.MSP_BOXNAMES:
                AUX_CONFIG = []; // empty the array as new data is coming in

                var buff = [];
                for (var i = 0; i < data.byteLength; i++) {
                    if (data.getUint8(i) == 0x3B) { // ; (delimeter char)
                        AUX_CONFIG.push(String.fromCharCode.apply(null, buff)); // convert bytes into ASCII and save as strings

                        // empty buffer
                        buff = [];
                    } else {
                        buff.push(data.getUint8(i));
                    }
                }
                break;
            case MSP_codes.MSP_PIDNAMES:
                PID_names = []; // empty the array as new data is coming in

                var buff = [];
                for (var i = 0; i < data.byteLength; i++) {
                    if (data.getUint8(i) == 0x3B) { // ; (delimeter char)
                        PID_names.push(String.fromCharCode.apply(null, buff)); // convert bytes into ASCII and save as strings

                        // empty buffer
                        buff = [];
                    } else {
                        buff.push(data.getUint8(i));
                    }
                }
                break;
            case MSP_codes.MSP_WP:
                console.log(data);
                break;
            case MSP_codes.MSP_BOXIDS:
                AUX_CONFIG_IDS = []; // empty the array as new data is coming in

                for (var i = 0; i < data.byteLength; i++) {
                    AUX_CONFIG_IDS.push(data.getUint8(i));
                }
                break;
            case MSP_codes.MSP_SERVO_MIX_RULES:
                break;

            case MSP_codes.MSP_SERVO_CONFIGURATIONS:
                SERVO_CONFIG = []; // empty the array as new data is coming in

                if (data.byteLength % 12 == 0) {
                    for (var i = 0; i < data.byteLength; i += 12) {
                        var arr = {
                            'min':                      data.getInt16(i + 0, 1),
                            'max':                      data.getInt16(i + 2, 1),
                            'middle':                   data.getInt16(i + 4, 1),
                            'rate':                     data.getInt8(i + 6),
                            'indexOfChannelToForward':  data.getInt8(i + 7),
                            'reversedInputSources':     data.getUint32(i + 8)
                        };

                        SERVO_CONFIG.push(arr);
                    }
                }
                break;
            case MSP_codes.MSP_RC_DEADBAND:
                var offset = 0;
                RC_deadband.deadband = data.getUint8(offset++, 1);
                RC_deadband.yaw_deadband = data.getUint8(offset++, 1);
                RC_deadband.alt_hold_deadband = data.getUint8(offset++, 1);
                if (semver.gte(CONFIG.apiVersion, "1.17.0")) {
                    _3D.deadband3d_throttle = data.getUint8(offset, 1);
                    offset+=2;
                }
                break;
            case MSP_codes.MSP_SENSOR_ALIGNMENT:
                var offset = 0;
                SENSOR_ALIGNMENT.align_gyro = data.getUint8(offset++, 1);
                SENSOR_ALIGNMENT.align_acc = data.getUint8(offset++, 1);
                SENSOR_ALIGNMENT.align_mag = data.getUint8(offset++, 1);
                break;
            case MSP_codes.MSP_SET_RAW_RC:
                break;
            case MSP_codes.MSP_SET_RAW_GPS:
                break;
            case MSP_codes.MSP_SET_PID:
                console.log('PID settings saved');
                break;
            /*
            case MSP_codes.MSP_SET_BOX:
                console.log('AUX Configuration saved');
                break;
            */
            case MSP_codes.MSP_SET_RC_TUNING:
                console.log('RC Tuning saved');
                break;
            case MSP_codes.MSP_ACC_CALIBRATION:
                console.log('Accel calibration executed');
                break;
            case MSP_codes.MSP_MAG_CALIBRATION:
                console.log('Mag calibration executed');
                break;
            case MSP_codes.MSP_SET_MISC:
                console.log('MISC configuration saved');
                break;
            case MSP_codes.MSP_SET_BATTERY_CONFIG:
                console.log('Battery configuration saved');
                break;
            case MSP_codes.MSP_SET_VOLTAGE_METER_CONFIG:
                console.log('Voltage meter configuration saved');
                break;
            case MSP_codes.MSP_SET_AMPERAGE_METER_CONFIG:
                console.log('Amperage meter configuration saved');
                break;
            case MSP_codes.MSP_RESET_CONF:
                console.log('Settings Reset');
                break;
            case MSP_codes.MSP_SELECT_SETTING:
                console.log('Profile selected');
                break;
            case MSP_codes.MSP_SET_SERVO_CONFIGURATION:
                console.log('Servo Configuration saved');
                break;
            case MSP_codes.MSP_EEPROM_WRITE:
                console.log('Settings Saved in EEPROM');
                break;
            case MSP_codes.MSP_DEBUGMSG:
                break;
            case MSP_codes.MSP_DEBUG:
                for (var i = 0; i < 4; i++)
                    SENSOR_DATA.debug[i] = data.getInt16((2 * i), 1);
                break;
            case MSP_codes.MSP_SET_MOTOR:
                console.log('Motor Speeds Updated');
                break;
            // Additional baseflight commands that are not compatible with MultiWii
            case MSP_codes.MSP_UID:
                CONFIG.uid[0] = data.getUint32(0, 1);
                CONFIG.uid[1] = data.getUint32(4, 1);
                CONFIG.uid[2] = data.getUint32(8, 1);
                break;
            case MSP_codes.MSP_ACC_TRIM:
                CONFIG.accelerometerTrims[0] = data.getInt16(0, 1); // pitch
                CONFIG.accelerometerTrims[1] = data.getInt16(2, 1); // roll
                break;
            case MSP_codes.MSP_SET_ACC_TRIM:
                console.log('Accelerometer trimms saved.');
                break;
            case MSP_codes.MSP_GPS_SV_INFO:
                if (data.byteLength > 0) {
                    GPS_DATA.chn = [];
                    GPS_DATA.svid = [];
                    GPS_DATA.quality = [];
                    GPS_DATA.cno = [];
                    
                    var numCh = data.getUint8(0);

                    var needle = 1;
                    for (var i = 0; i < numCh; i++) {
                        GPS_DATA.chn[i] = data.getUint8(needle);
                        GPS_DATA.svid[i] = data.getUint8(needle + 1);
                        GPS_DATA.quality[i] = data.getUint8(needle + 2);
                        GPS_DATA.cno[i] = data.getUint8(needle + 3);

                        needle += 4;
                    }
                }
                break;
            // Additional private MSP for baseflight configurator
            case MSP_codes.MSP_RX_MAP:
                RC_MAP = []; // empty the array as new data is coming in

                for (var i = 0; i < data.byteLength; i++) {
                    RC_MAP.push(data.getUint8(i));
                }
                break;
            case MSP_codes.MSP_SET_RX_MAP:
                console.log('RCMAP saved');
                break;
            case MSP_codes.MSP_FEATURE:
                FEATURE.enabled = data.getUint32(0, 1);
                break;
            case MSP_codes.MSP_SET_FEATURE:
                break;
            case MSP_codes.MSP_MIXER:
                MIXER.mode = data.getUint8(0);
                break;
            case MSP_codes.MSP_BOARD_ALIGNMENT:
                BOARD_ALIGNMENT.board_align_roll = data.getInt16(0, 1); // -180 - 360
                BOARD_ALIGNMENT.board_align_pitch = data.getInt16(2, 1); // -180 - 360
                BOARD_ALIGNMENT.board_align_yaw = data.getInt16(4, 1); // -180 - 360
                break;
            case MSP_codes.MSP_SET_MIXER:
                console.log('Mixer config saved');
                break;
            case MSP_codes.MSP_SET_BOARD_ALIGNMENT:
                console.log('Board alignment saved');
                break;
            case MSP_codes.MSP_SET_REBOOT:
                console.log('Reboot request accepted');
                break;

            //
            // Cleanflight specific 
            //

            case MSP_codes.MSP_API_VERSION:
                var offset = 0;
                CONFIG.mspProtocolVersion = data.getUint8(offset++); 
                CONFIG.apiVersion = data.getUint8(offset++) + '.' + data.getUint8(offset++) + '.0';
                break;

            case MSP_codes.MSP_FC_VARIANT:
                var identifier = '';
                var offset;
                for (offset = 0; offset < 4; offset++) {
                    identifier += String.fromCharCode(data.getUint8(offset));
                }
                CONFIG.flightControllerIdentifier = identifier;
                break;

            case MSP_codes.MSP_FC_VERSION:
                var offset = 0;
                CONFIG.flightControllerVersion = data.getUint8(offset++) + '.' + data.getUint8(offset++) + '.' + data.getUint8(offset++);
                break;

            case MSP_codes.MSP_BUILD_INFO:
                var offset = 0;
                
                var dateLength = 11;
                var buff = [];
                for (var i = 0; i < dateLength; i++) {
                    buff.push(data.getUint8(offset++));
                }
                buff.push(32); // ascii space
                
                var timeLength = 8;
                for (var i = 0; i < timeLength; i++) {
                    buff.push(data.getUint8(offset++));
                }
                CONFIG.buildInfo = String.fromCharCode.apply(null, buff);
                break;

            case MSP_codes.MSP_BOARD_INFO:
                var identifier = '';
                var offset;
                for (offset = 0; offset < 4; offset++) {
                    identifier += String.fromCharCode(data.getUint8(offset));
                }
                CONFIG.boardIdentifier = identifier;
                CONFIG.boardVersion = data.getUint16(offset, 1);
                offset+=2;
                if (semver.gte(CONFIG.apiVersion, "1.22.0")) {
                    CONFIG.boardType = data.getUint8(offset, 1);
                    offset++;
                } else {
                    CONFIG.boardType = 0;
                }
                break;

            case MSP_codes.MSP_SET_CHANNEL_FORWARDING:
                console.log('Channel forwarding saved');
                break;

            case MSP_codes.MSP_CF_SERIAL_CONFIG:
                
                if (semver.lt(CONFIG.apiVersion, "1.6.0")) {
                    SERIAL_CONFIG.ports = [];
                    var offset = 0;
                    var serialPortCount = (data.byteLength - (4 * 4)) / 2;
                    for (var i = 0; i < serialPortCount; i++) {
                        var serialPort = {
                            identifier: data.getUint8(offset++, 1),
                            scenario: data.getUint8(offset++, 1)
                        }
                        SERIAL_CONFIG.ports.push(serialPort); 
                    }
                    SERIAL_CONFIG.mspBaudRate = data.getUint32(offset, 1);
                    offset+= 4;
                    SERIAL_CONFIG.cliBaudRate = data.getUint32(offset, 1);
                    offset+= 4;
                    SERIAL_CONFIG.gpsBaudRate = data.getUint32(offset, 1);
                    offset+= 4;
                    SERIAL_CONFIG.gpsPassthroughBaudRate = data.getUint32(offset, 1);
                    offset+= 4;
                } else {
                    SERIAL_CONFIG.ports = [];
                    var offset = 0;
                    var bytesPerPort = 1 + 2 + (1 * 4);
                    var serialPortCount = data.byteLength / bytesPerPort;
                    
                    for (var i = 0; i < serialPortCount; i++) {
                        var serialPort = {
                            identifier: data.getUint8(offset, 1),
                            functions: MSP.serialPortFunctionMaskToFunctions(data.getUint16(offset + 1, 1)),
                            msp_baudrate: MSP.supportedBaudRates[data.getUint8(offset + 3, 1)],
                            gps_baudrate: MSP.supportedBaudRates[data.getUint8(offset + 4, 1)],
                            telemetry_baudrate: MSP.supportedBaudRates[data.getUint8(offset + 5, 1)],
                            blackbox_baudrate: MSP.supportedBaudRates[data.getUint8(offset + 6, 1)]
                        }
                        
                        offset += bytesPerPort;
                        SERIAL_CONFIG.ports.push(serialPort);
                    }
                }
                break;

            case MSP_codes.MSP_SET_CF_SERIAL_CONFIG:
                console.log('Serial config saved');
                break;

            case MSP_codes.MSP_MODE_RANGES:
                MODE_RANGES = []; // empty the array as new data is coming in

                var modeRangeCount = data.byteLength / 4; // 4 bytes per item.
                
                var offset = 0;
                for (var i = 0; offset < data.byteLength && i < modeRangeCount; i++) {
                    var modeRange = {
                        id: data.getUint8(offset++, 1),
                        auxChannelIndex: data.getUint8(offset++, 1),
                        range: {
                            start: 900 + (data.getUint8(offset++, 1) * 25),
                            end: 900 + (data.getUint8(offset++, 1) * 25)
                        }
                    };
                    MODE_RANGES.push(modeRange);
                }
                break;

            case MSP_codes.MSP_ADJUSTMENT_RANGES:
                ADJUSTMENT_RANGES = []; // empty the array as new data is coming in

                var adjustmentRangeCount = data.byteLength / 6; // 6 bytes per item.
                
                var offset = 0;
                for (var i = 0; offset < data.byteLength && i < adjustmentRangeCount; i++) {
                    var adjustmentRange = {
                        slotIndex: data.getUint8(offset++, 1),
                        auxChannelIndex: data.getUint8(offset++, 1),
                        range: {
                            start: 900 + (data.getUint8(offset++, 1) * 25),
                            end: 900 + (data.getUint8(offset++, 1) * 25)
                        },
                        adjustmentFunction: data.getUint8(offset++, 1),
                        auxSwitchChannelIndex: data.getUint8(offset++, 1)
                    };
                    ADJUSTMENT_RANGES.push(adjustmentRange);
                }
                break;

            case MSP_codes.MSP_RX_CONFIG:
                var offset = 0;
                RX_CONFIG.serialrx_provider = data.getUint8(offset, 1);
                offset++;
                RX_CONFIG.stick_max = data.getUint16(offset, 1);
                offset += 2;
                RX_CONFIG.stick_center = data.getUint16(offset, 1);
                offset += 2;
                RX_CONFIG.stick_min = data.getUint16(offset, 1);
                offset += 2;
                RX_CONFIG.spektrum_sat_bind = data.getUint8(offset, 1);
                offset++;
                RX_CONFIG.rx_min_usec = data.getUint16(offset, 1);
                offset += 2;
                RX_CONFIG.rx_max_usec = data.getUint16(offset, 1);
                offset += 2;
                break;

            case MSP_codes.MSP_FAILSAFE_CONFIG:
                var offset = 0;
                FAILSAFE_CONFIG.failsafe_delay = data.getUint8(offset, 1);
                offset++;
                FAILSAFE_CONFIG.failsafe_off_delay = data.getUint8(offset, 1);
                offset++;
                FAILSAFE_CONFIG.failsafe_throttle = data.getUint16(offset, 1);
                offset += 2;
                if (semver.gte(CONFIG.apiVersion, "1.15.0")) {
                    FAILSAFE_CONFIG.failsafe_kill_switch = data.getUint8(offset, 1);
                    offset++;
                    FAILSAFE_CONFIG.failsafe_throttle_low_delay = data.getUint16(offset, 1);
                    offset += 2;
                    FAILSAFE_CONFIG.failsafe_procedure = data.getUint8(offset, 1);
                    offset++;
                }
                break;

            case MSP_codes.MSP_RXFAIL_CONFIG:
                RXFAIL_CONFIG = []; // empty the array as new data is coming in

                var channelCount = data.byteLength / 3;

                var offset = 0;
                for (var i = 0; offset < data.byteLength && i < channelCount; i++, offset++) {
                    var rxfailChannel = {
                        mode:  data.getUint8(offset++, 1),
                        value: data.getUint16(offset++, 1)
                    };
                    RXFAIL_CONFIG.push(rxfailChannel);
                }
                break;


            case MSP_codes.MSP_LED_STRIP_CONFIG:
                LED_STRIP = [];
                
                var ledCount = data.byteLength / 7; // v1.4.0 and below incorrectly reported 4 bytes per led.
                if (semver.gte(CONFIG.apiVersion, "1.20.0"))
                    ledCount = data.byteLength / 4;
                    
                var offset = 0;
                for (var i = 0; offset < data.byteLength && i < ledCount; i++) {

                    if (semver.lt(CONFIG.apiVersion, "1.20.0")) {
                        var directionMask = data.getUint16(offset, 1);
                        offset += 2;
                        
                        var directions = [];
                        for (var directionLetterIndex = 0; directionLetterIndex < MSP.ledDirectionLetters.length; directionLetterIndex++) {
                            if (bit_check(directionMask, directionLetterIndex)) {
                                directions.push(MSP.ledDirectionLetters[directionLetterIndex]);
                            }
                        }
    
                        var functionMask = data.getUint16(offset, 1);
                        offset += 2;
    
                        var functions = [];
                        for (var functionLetterIndex = 0; functionLetterIndex < MSP.ledFunctionLetters.length; functionLetterIndex++) {
                            if (bit_check(functionMask, functionLetterIndex)) {
                                functions.push(MSP.ledFunctionLetters[functionLetterIndex]);
                            }
                        }
                        
                        var led = {
                            directions: directions,
                            functions: functions,
                            x: data.getUint8(offset++, 1),
                            y: data.getUint8(offset++, 1),
                            color: data.getUint8(offset++, 1)
                        };
                        
                        LED_STRIP.push(led);
                    } else {
                        var mask = data.getUint32(offset, 1);
                        offset +=4;
                        
                        var functionId = (mask >> 8) & 0xF;
                        var functions = [];
                        for (var baseFunctionLetterIndex = 0; baseFunctionLetterIndex < MSP.ledBaseFunctionLetters.length; baseFunctionLetterIndex++) {
                            if (functionId == baseFunctionLetterIndex) {
                                functions.push(MSP.ledBaseFunctionLetters[baseFunctionLetterIndex]);
                                break;
                            }
                        }
                        
                        var overlayMask = (mask >> 12) & 0x3F;
                        for (var overlayLetterIndex = 0; overlayLetterIndex < MSP.ledOverlayLetters.length; overlayLetterIndex++) {
                            if (bit_check(overlayMask, overlayLetterIndex)) {
                                functions.push(MSP.ledOverlayLetters[overlayLetterIndex]);
                            }
                        }
                        
                        var directionMask = (mask >> 22) & 0x3F;
                        var directions = [];
                        for (var directionLetterIndex = 0; directionLetterIndex < MSP.ledDirectionLetters.length; directionLetterIndex++) {
                            if (bit_check(directionMask, directionLetterIndex)) {
                                directions.push(MSP.ledDirectionLetters[directionLetterIndex]);
                            }
                        }
                        var led = {
                            y: (mask) & 0xF,
                            x: (mask >> 4) & 0xF,
                            functions: functions,
                            color: (mask >> 18) & 0xF,
                            directions: directions,
                            parameters: (mask >> 28) & 0xF
                        };
                        
                        LED_STRIP.push(led);
                    }
                }
                break;
            case MSP_codes.MSP_SET_LED_STRIP_CONFIG:
                console.log('Led strip config saved');
                break;
            case MSP_codes.MSP_LED_COLORS:
                
                LED_COLORS = [];
                
                var colorCount = data.byteLength / 4;
                
                var offset = 0;
                for (var i = 0; offset < data.byteLength && i < colorCount; i++) {

                    var h = data.getUint16(offset, 1);
                    var s = data.getUint8(offset + 2, 1);
                    var v = data.getUint8(offset + 3, 1);
                    offset += 4;

                    var color = {
                        h: h,
                        s: s,
                        v: v
                    };
                    
                    LED_COLORS.push(color);
                }
                
                break;
            case MSP_codes.MSP_SET_LED_COLORS:
                console.log('Led strip colors saved');
                break;
            case MSP_codes.MSP_LED_STRIP_MODECOLOR:
                if (semver.gte(CONFIG.apiVersion, "1.19.0")) {

                    LED_MODE_COLORS = [];
                    
                    var colorCount = data.byteLength / 3;
                    
                    var offset = 0;
                    for (var i = 0; offset < data.byteLength && i < colorCount; i++) {

                        var mode = data.getUint8(offset++, 1);
                        var direction = data.getUint8(offset++, 1);
                        var color = data.getUint8(offset++, 1);

                        var mode_color = {
                            mode: mode,
                            direction: direction,
                            color: color
                        };
                        
                        LED_MODE_COLORS.push(mode_color);
                    }
                }
                break;
            case MSP_codes.MSP_SET_LED_STRIP_MODECOLOR:
                console.log('Led strip mode colors saved');
                break;
                
                
                
            case MSP_codes.MSP_DATAFLASH_SUMMARY:
                if (data.byteLength >= 13) {
                    var
                        flags = data.getUint8(0);
                    DATAFLASH.ready = (flags & 1) != 0;
                    DATAFLASH.supported = (flags & 2) != 0 || DATAFLASH.ready;
                    DATAFLASH.sectors = data.getUint32(1, 1);
                    DATAFLASH.totalSize = data.getUint32(5, 1);
                    DATAFLASH.usedSize = data.getUint32(9, 1);
                } else {
                    // Firmware version too old to support MSP_DATAFLASH_SUMMARY
                    DATAFLASH.ready = false;
                    DATAFLASH.supported = false;
                    DATAFLASH.sectors = 0;
                    DATAFLASH.totalSize = 0;
                    DATAFLASH.usedSize = 0;
                }
                update_dataflash_global();
                break;
            case MSP_codes.MSP_DATAFLASH_READ:
                // No-op, let callback handle it
                break;
            case MSP_codes.MSP_DATAFLASH_ERASE:
                console.log("Data flash erase begun...");
                break;
            case MSP_codes.MSP_SDCARD_SUMMARY:
                var flags = data.getUint8(0); 
                
                SDCARD.supported = (flags & 0x01) != 0;
                SDCARD.state = data.getUint8(1);
                SDCARD.filesystemLastError = data.getUint8(2);
                SDCARD.freeSizeKB = data.getUint32(3, 1);
                SDCARD.totalSizeKB = data.getUint32(7, 1);
                break;
            case MSP_codes.MSP_BLACKBOX_CONFIG:
                BLACKBOX.supported = (data.getUint8(0) & 1) != 0;
                BLACKBOX.blackboxDevice = data.getUint8(1);
                BLACKBOX.blackboxRateNum = data.getUint8(2);
                BLACKBOX.blackboxRateDenom = data.getUint8(3);
                break;
            case MSP_codes.MSP_SET_BLACKBOX_CONFIG:
                console.log("Blackbox config saved");
                break;
            case MSP_codes.MSP_TRANSPONDER_CONFIG:
                var offset = 0;
                TRANSPONDER.supported = (data.getUint8(offset++) & 1) != 0;
                TRANSPONDER.data = [];
                var bytesRemaining = data.byteLength - offset; 
                for (var i = 0; i < bytesRemaining; i++) {
                    TRANSPONDER.data.push(data.getUint8(offset++));
                }
                break;
            case MSP_codes.MSP_TRANSPONDER_TYPE:
                var offset = 0;
                TRANSPONDER.type = [];
                var bytesRemaining = data.byteLength - offset; 
                for (var i = 0; i < bytesRemaining; i++) {
                    TRANSPONDER.type.push(data.getUint8(offset++));
                }
                break;
            case MSP_codes.MSP_SET_TRANSPONDER_CONFIG:
                console.log("Transponder config saved");
                break;
            case MSP_codes.MSP_SET_TRANSPONDER_TYPE:
                console.log("Transponder type config saved");
                break;
            case MSP_codes.MSP_SET_MODE_RANGE:
                console.log('Mode range saved');
                break;
            case MSP_codes.MSP_SET_ADJUSTMENT_RANGE:
                console.log('Adjustment range saved');
                break;
                
            case MSP_codes.MSP_PID_CONTROLLER:
                PID.controller = data.getUint8(0, 1);
                break;
            case MSP_codes.MSP_SET_PID_CONTROLLER:
                console.log('PID controller changed');
                break;
            case MSP_codes.MSP_SET_LOOP_TIME:
                console.log('Looptime saved');
                break;
            case MSP_codes.MSP_SET_ARMING_CONFIG:
                console.log('Arming config saved');
                break;
            case MSP_codes.MSP_SET_RESET_CURR_PID:
                console.log('Current PID profile reset');
                break;
            case MSP_codes.MSP_SET_3D:
                console.log('3D settings saved');
                break;
            case MSP_codes.MSP_SET_RC_DEADBAND:
                console.log('RC controls settings saved');
                break;
            case MSP_codes.MSP_SET_SENSOR_ALIGNMENT:
                console.log('Sensor alignment saved');
                break; 
            case MSP_codes.MSP_SET_RX_CONFIG:
                console.log('RX config saved');
                break;
            case MSP_codes.MSP_SET_RXFAIL_CONFIG:
                console.log('RX Fail config saved');
                break;
            case MSP_codes.MSP_SET_FAILSAFE_CONFIG:
                console.log('Failsafe config saved');
                break;
            case MSP_codes.MSP_PILOT:
                var offset = 0;
                var length = data.getUint8(offset++);
                var callsign = "";
                for (var i = 0; i < (length); i++) {
                    var c = data.getUint8(offset++);
                    callsign += String.fromCharCode(c);
                }
                PILOT_CONFIG.callsign = callsign;
                break;
                
            //
            // OSD specific
            //
            case MSP_codes.MSP_OSD_VIDEO_CONFIG:
                var offset = 0;
                OSD_VIDEO_CONFIG.video_mode = data.getUint8(offset, 1);
                break;
            case MSP_codes.MSP_SET_OSD_VIDEO_CONFIG:
                console.log('Video config saved');
                break;
            case MSP_codes.MSP_OSD_VIDEO_STATUS:
                var offset = 0;
                OSD_VIDEO_STATE.video_mode = data.getUint8(offset++, 1);
                OSD_VIDEO_STATE.camera_connected = data.getUint8(offset++, 1);
                OSD_VIDEO_STATE.text_width = data.getUint8(offset++, 1);
                OSD_VIDEO_STATE.text_height = data.getUint8(offset++, 1);
                break;

            case MSP_codes.MSP_OSD_ELEMENT_SUMMARY:
                OSD_ELEMENT_SUMMARY.supported_element_ids = [];
                var offset = 0;
                for (var i = 0; i < data.byteLength / 2; i++) {
                    var element_id = data.getUint16(offset, 1);
                    offset += 2;
                    OSD_ELEMENT_SUMMARY.supported_element_ids.push(element_id);
                }
                break;


            case MSP_codes.MSP_OSD_LAYOUT_CONFIG:
                OSD_LAYOUT.elements = [];
                var offset = 0;
                var element_count = data.getUint8(offset++, 1);
                
                for (var i = 0; i < element_count; i++) {
                    var element_id = data.getUint16(offset, 1);
                    offset += 2;
                    var flag_mask = data.getUint16(offset, 1);
                    offset += 2;
                    var x = data.getInt8(offset, 1);
                    offset += 1;
                    var y = data.getInt8(offset, 1);
                    offset += 1;
                    
                    var element = {
                        id: element_id,
                        initial_flag_mask: flag_mask,
                        enabled: bit_check(flag_mask, 0),
                        positionable: bit_check(flag_mask, 1),
                        x: x,
                        y: y,
                    };
                    OSD_LAYOUT.elements.push(element);
                }
                break;
                
            default:
                console.log('Unknown code detected: ' + code);
        } else {
            console.log('FC reports unsupported message error: ' + code);
        }

        // trigger callbacks, cleanup/remove callback after trigger
        for (var i = this.callbacks.length - 1; i >= 0; i--) { // itterating in reverse because we use .splice which modifies array length
            if (i < this.callbacks.length) {
                if (this.callbacks[i].code == code) {
                    // save callback reference
                    var callback = this.callbacks[i].callback;
    
                    // remove timeout
                    clearInterval(this.callbacks[i].timer);
    
                    // remove object from array
                    this.callbacks.splice(i, 1);
    
                    // fire callback
                    if (callback) callback({'command': code, 'data': data, 'length': message_length});
                }
            }
        }
    },
    send_message: function (code, data, callback_sent, callback_msp) {
        var bufferOut,
            bufView;

        if (code == undefined) {
            debugger;
        }
        
        // always reserve 6 bytes for protocol overhead !
        if (data) {
            var size = data.length + 6,
                checksum = 0;

            bufferOut = new ArrayBuffer(size);
            bufView = new Uint8Array(bufferOut);

            bufView[0] = 36; // $
            bufView[1] = 77; // M
            bufView[2] = 60; // <
            bufView[3] = data.length;
            bufView[4] = code;

            checksum = bufView[3] ^ bufView[4];

            for (var i = 0; i < data.length; i++) {
                bufView[i + 5] = data[i];

                checksum ^= bufView[i + 5];
            }

            bufView[5 + data.length] = checksum;
        } else {
            bufferOut = new ArrayBuffer(6);
            bufView = new Uint8Array(bufferOut);

            bufView[0] = 36; // $
            bufView[1] = 77; // M
            bufView[2] = 60; // <
            bufView[3] = 0; // data length
            bufView[4] = code; // code
            bufView[5] = bufView[3] ^ bufView[4]; // checksum
        }

        var obj = {'code': code, 'requestBuffer': bufferOut, 'callback': (callback_msp) ? callback_msp : false, 'timer': false};

        var requestExists = false;
        for (var i = 0; i < MSP.callbacks.length; i++) {
            if (i < MSP.callbacks.length) {
                if (MSP.callbacks[i].code == code) {
                    // request already exist, we will just attach
                    requestExists = true;
                    break;
                }
            } else {
                console.log("Callback index error: "+ i);
            }
        }

        if (!requestExists) {
            obj.timer = setInterval(function () {
                console.log('MSP data request timed-out: ' + code);

                serial.send(bufferOut, false);
            }, 1000); // we should be able to define timeout in the future
        }

        MSP.callbacks.push(obj);

        // always send messages with data payload (even when there is a message already in the queue)
        if (data || !requestExists) {
            serial.send(bufferOut, function (sendInfo) {
                if (sendInfo.bytesSent == bufferOut.byteLength) {
                    if (callback_sent) callback_sent();
                }
            });
        }
        return true;
    },
    promise: function(code, data) {
      var self = this;
      return new Promise(function(resolve) {
        self.send_message(code, data, false, function(data) {
          resolve(data);
        });
      });
    },
    callbacks_cleanup: function () {
        for (var i = 0; i < this.callbacks.length; i++) {
            clearInterval(this.callbacks[i].timer);
        }

        this.callbacks = [];
    },
    disconnect_cleanup: function () {
        this.state = 0; // reset packet state for "clean" initial entry (this is only required if user hot-disconnects)
        this.packet_error = 0; // reset CRC packet error counter for next session

        this.callbacks_cleanup();
    }
};

/**
 * Encode the request body for the MSP request with the given code and return it as an array of bytes.
 */
MSP.crunch = function (code) {
    var buffer = [];

    switch (code) {
        case MSP_codes.MSP_SET_FEATURE:
            buffer.push(specificByte(FEATURE.enabled, 0));
            buffer.push(specificByte(FEATURE.enabled, 1));
            buffer.push(specificByte(FEATURE.enabled, 2));
            buffer.push(specificByte(FEATURE.enabled, 3));
            break;
        case MSP_codes.MSP_SET_MIXER:
            buffer.push(MIXER.mode);
            break;
        case MSP_codes.MSP_SET_BOARD_ALIGNMENT:
            buffer.push(specificByte(BOARD_ALIGNMENT.board_align_roll, 0));
            buffer.push(specificByte(BOARD_ALIGNMENT.board_align_roll, 1));
            buffer.push(specificByte(BOARD_ALIGNMENT.board_align_pitch, 0));
            buffer.push(specificByte(BOARD_ALIGNMENT.board_align_pitch, 1));
            buffer.push(specificByte(BOARD_ALIGNMENT.board_align_yaw, 0));
            buffer.push(specificByte(BOARD_ALIGNMENT.board_align_yaw, 1));
            break;
        case MSP_codes.MSP_SET_PID_CONTROLLER:
            buffer.push(PID.controller);
            break;
        case MSP_codes.MSP_SET_PID:
            for (var i = 0; i < PIDs.length; i++) {
                switch (i) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 7:
                    case 8:
                    case 9:
                        buffer.push(parseInt(PIDs[i][0]));
                        buffer.push(parseInt(PIDs[i][1]));
                        buffer.push(parseInt(PIDs[i][2]));
                        break;
                    case 4:
                        buffer.push(parseInt(PIDs[i][0]));
                        buffer.push(parseInt(PIDs[i][1]));
                        buffer.push(parseInt(PIDs[i][2]));
                        break;
                    case 5:
                    case 6:
                        buffer.push(parseInt(PIDs[i][0]));
                        buffer.push(parseInt(PIDs[i][1]));
                        buffer.push(parseInt(PIDs[i][2]));
                        break;
                }
            }
            break;
        case MSP_codes.MSP_SET_RC_TUNING:
            buffer.push(Math.round(RC_tuning.RC_RATE * 100));
            buffer.push(Math.round(RC_tuning.RC_EXPO * 100));
            if (semver.lt(CONFIG.apiVersion, "1.7.0")) {
                buffer.push(Math.round(RC_tuning.roll_pitch_rate * 100));
            } else {
                buffer.push(Math.round(RC_tuning.roll_rate * 100));
                buffer.push(Math.round(RC_tuning.pitch_rate * 100));
            }
            buffer.push(Math.round(RC_tuning.yaw_rate * 100));
            buffer.push(Math.round(RC_tuning.dynamic_THR_PID * 100));
            buffer.push(Math.round(RC_tuning.throttle_MID * 100));
            buffer.push(Math.round(RC_tuning.throttle_EXPO * 100));
            if (semver.gte(CONFIG.apiVersion, "1.7.0")) {
                buffer.push(lowByte(RC_tuning.dynamic_THR_breakpoint));
                buffer.push(highByte(RC_tuning.dynamic_THR_breakpoint));
            }
            if (semver.gte(CONFIG.apiVersion, "1.10.0")) {
                buffer.push(Math.round(RC_tuning.RC_YAW_EXPO * 100));
            }
            break;
        // Disabled, cleanflight does not use MSP_SET_BOX.
        /*
        case MSP_codes.MSP_SET_BOX:
            for (var i = 0; i < AUX_CONFIG_values.length; i++) {
                buffer.push(lowByte(AUX_CONFIG_values[i]));
                buffer.push(highByte(AUX_CONFIG_values[i]));
            }
            break;
        */
        case MSP_codes.MSP_SET_RX_MAP:
            for (var i = 0; i < RC_MAP.length; i++) {
                buffer.push(RC_MAP[i]);
            }
            break;
        case MSP_codes.MSP_SET_ACC_TRIM:
            buffer.push(lowByte(CONFIG.accelerometerTrims[0]));
            buffer.push(highByte(CONFIG.accelerometerTrims[0]));
            buffer.push(lowByte(CONFIG.accelerometerTrims[1]));
            buffer.push(highByte(CONFIG.accelerometerTrims[1]));
            break;
        case MSP_codes.MSP_SET_ARMING_CONFIG:
            buffer.push(ARMING_CONFIG.auto_disarm_delay);
            buffer.push(ARMING_CONFIG.disarm_kill_switch);
            break;
        case MSP_codes.MSP_SET_LOOP_TIME:
            buffer.push(lowByte(FC_CONFIG.loopTime));
            buffer.push(highByte(FC_CONFIG.loopTime));
            break;
        case MSP_codes.MSP_SET_MISC:
            buffer.push(lowByte(MISC.midrc));
            buffer.push(highByte(MISC.midrc));
            buffer.push(lowByte(MISC.minthrottle));
            buffer.push(highByte(MISC.minthrottle));
            buffer.push(lowByte(MISC.maxthrottle));
            buffer.push(highByte(MISC.maxthrottle));
            buffer.push(lowByte(MISC.mincommand));
            buffer.push(highByte(MISC.mincommand));
            buffer.push(lowByte(MISC.failsafe_throttle));
            buffer.push(highByte(MISC.failsafe_throttle));
            buffer.push(MISC.gps_type);
            buffer.push(MISC.gps_baudrate);
            buffer.push(MISC.gps_ubx_sbas);
            buffer.push(MISC.multiwiicurrentoutput);
            buffer.push(MISC.rssi_channel);
            buffer.push(MISC.placeholder2);
            if (semver.lt(CONFIG.apiVersion, "1.18.0")) {
                buffer.push(lowByte(Math.round(MISC.mag_declination * 10)));
                buffer.push(highByte(Math.round(MISC.mag_declination * 10)));
            } else {            
                buffer.push(lowByte(Math.round(MISC.mag_declination * 100)));
                buffer.push(highByte(Math.round(MISC.mag_declination * 100)));
            }
            if (semver.lt(CONFIG.apiVersion, "1.22.0")) {
                buffer.push(MISC.vbatscale);
                buffer.push(Math.round(MISC.vbatmincellvoltage * 10));
                buffer.push(Math.round(MISC.vbatmaxcellvoltage * 10));
                buffer.push(Math.round(MISC.vbatwarningcellvoltage * 10));
            }
            break;
        case MSP_codes.MSP_SET_BATTERY_CONFIG:
            buffer.push(Math.round(BATTERY_CONFIG.vbatmincellvoltage * 10));
            buffer.push(Math.round(BATTERY_CONFIG.vbatmaxcellvoltage * 10));
            buffer.push(Math.round(BATTERY_CONFIG.vbatwarningcellvoltage * 10));
            buffer.push(lowByte(BATTERY_CONFIG.capacity));
            buffer.push(highByte(BATTERY_CONFIG.capacity));
            buffer.push(BATTERY_CONFIG.amperageMeterSource);
            break;

        case MSP_codes.MSP_SET_RX_CONFIG:
            buffer.push(RX_CONFIG.serialrx_provider);
            buffer.push(lowByte(RX_CONFIG.stick_max));
            buffer.push(highByte(RX_CONFIG.stick_max));
            buffer.push(lowByte(RX_CONFIG.stick_center));
            buffer.push(highByte(RX_CONFIG.stick_center));
            buffer.push(lowByte(RX_CONFIG.stick_min));
            buffer.push(highByte(RX_CONFIG.stick_min));
            buffer.push(RX_CONFIG.spektrum_sat_bind);
            buffer.push(lowByte(RX_CONFIG.rx_min_usec));
            buffer.push(highByte(RX_CONFIG.rx_min_usec));
            buffer.push(lowByte(RX_CONFIG.rx_max_usec));
            buffer.push(highByte(RX_CONFIG.rx_max_usec));
            break;

        case MSP_codes.MSP_SET_FAILSAFE_CONFIG:
            buffer.push(FAILSAFE_CONFIG.failsafe_delay);
            buffer.push(FAILSAFE_CONFIG.failsafe_off_delay);
            buffer.push(lowByte(FAILSAFE_CONFIG.failsafe_throttle));
            buffer.push(highByte(FAILSAFE_CONFIG.failsafe_throttle));
            if (semver.gte(CONFIG.apiVersion, "1.15.0")) {
                buffer.push(FAILSAFE_CONFIG.failsafe_kill_switch);
                buffer.push(lowByte(FAILSAFE_CONFIG.failsafe_throttle_low_delay));
                buffer.push(highByte(FAILSAFE_CONFIG.failsafe_throttle_low_delay));
                buffer.push(FAILSAFE_CONFIG.failsafe_procedure);
            }
            break;

        case MSP_codes.MSP_SET_TRANSPONDER_CONFIG:
            for (var i = 0; i < TRANSPONDER.data.length; i++) {
                buffer.push(TRANSPONDER.data[i]);
            }
            break;
        case MSP_codes.MSP_SET_TRANSPONDER_TYPE: 
            for (var i = 0; i < TRANSPONDER.type.length; i++) {
                buffer.push(TRANSPONDER.type[i]);
            }
            break;

        case MSP_codes.MSP_SET_CHANNEL_FORWARDING:
            for (var i = 0; i < SERVO_CONFIG.length; i++) {
                var out = SERVO_CONFIG[i].indexOfChannelToForward;
                if (out == undefined) {
                    out = 255; // Cleanflight defines "CHANNEL_FORWARDING_DISABLED" as "(uint8_t)0xFF"
                }
                buffer.push(out);
            }
            break;
        case MSP_codes.MSP_SET_CF_SERIAL_CONFIG:
            if (semver.lt(CONFIG.apiVersion, "1.6.0")) {

                for (var i = 0; i < SERIAL_CONFIG.ports.length; i++) {
                    buffer.push(SERIAL_CONFIG.ports[i].scenario);
                }
                buffer.push(specificByte(SERIAL_CONFIG.mspBaudRate, 0));
                buffer.push(specificByte(SERIAL_CONFIG.mspBaudRate, 1));
                buffer.push(specificByte(SERIAL_CONFIG.mspBaudRate, 2));
                buffer.push(specificByte(SERIAL_CONFIG.mspBaudRate, 3));
    
                buffer.push(specificByte(SERIAL_CONFIG.cliBaudRate, 0));
                buffer.push(specificByte(SERIAL_CONFIG.cliBaudRate, 1));
                buffer.push(specificByte(SERIAL_CONFIG.cliBaudRate, 2));
                buffer.push(specificByte(SERIAL_CONFIG.cliBaudRate, 3));
    
                buffer.push(specificByte(SERIAL_CONFIG.gpsBaudRate, 0));
                buffer.push(specificByte(SERIAL_CONFIG.gpsBaudRate, 1));
                buffer.push(specificByte(SERIAL_CONFIG.gpsBaudRate, 2));
                buffer.push(specificByte(SERIAL_CONFIG.gpsBaudRate, 3));
    
                buffer.push(specificByte(SERIAL_CONFIG.gpsPassthroughBaudRate, 0));
                buffer.push(specificByte(SERIAL_CONFIG.gpsPassthroughBaudRate, 1));
                buffer.push(specificByte(SERIAL_CONFIG.gpsPassthroughBaudRate, 2));
                buffer.push(specificByte(SERIAL_CONFIG.gpsPassthroughBaudRate, 3));
            } else {
                for (var i = 0; i < SERIAL_CONFIG.ports.length; i++) {
                    var serialPort = SERIAL_CONFIG.ports[i];
                    
                    buffer.push(serialPort.identifier);
                    
                    var functionMask = MSP.serialPortFunctionsToMask(serialPort.functions);
                    buffer.push(specificByte(functionMask, 0));
                    buffer.push(specificByte(functionMask, 1));
                    
                    buffer.push(MSP.supportedBaudRates.indexOf(serialPort.msp_baudrate));
                    buffer.push(MSP.supportedBaudRates.indexOf(serialPort.gps_baudrate));
                    buffer.push(MSP.supportedBaudRates.indexOf(serialPort.telemetry_baudrate));
                    buffer.push(MSP.supportedBaudRates.indexOf(serialPort.blackbox_baudrate));
                }
            }
            break;

        case MSP_codes.MSP_SET_3D:
            buffer.push(lowByte(_3D.deadband3d_low));
            buffer.push(highByte(_3D.deadband3d_low));
            buffer.push(lowByte(_3D.deadband3d_high));
            buffer.push(highByte(_3D.deadband3d_high));
            buffer.push(lowByte(_3D.neutral3d));
            buffer.push(highByte(_3D.neutral3d));
            if (semver.lt(CONFIG.apiVersion, "1.17.0")) {
                buffer.push(lowByte(_3D.deadband3d_throttle));
                buffer.push(highByte(_3D.deadband3d_throttle));
            }
            break;    

        case MSP_codes.MSP_SET_RC_DEADBAND:
            buffer.push(RC_deadband.deadband);
            buffer.push(RC_deadband.yaw_deadband); 
            buffer.push(RC_deadband.alt_hold_deadband);
            if (semver.gte(CONFIG.apiVersion, "1.17.0")) {
                buffer.push(lowByte(_3D.deadband3d_throttle));
                buffer.push(highByte(_3D.deadband3d_throttle));
            }
            break;

        case MSP_codes.MSP_SET_SENSOR_ALIGNMENT:
            buffer.push(SENSOR_ALIGNMENT.align_gyro);
            buffer.push(SENSOR_ALIGNMENT.align_acc);
            buffer.push(SENSOR_ALIGNMENT.align_mag);
            break;

        case MSP_codes.MSP_SET_OSD_VIDEO_CONFIG:
            buffer.push(OSD_VIDEO_CONFIG.video_mode);
            break;

        default:
            return false;
    }

    return buffer;
};

/**
 * Set raw Rx values over MSP protocol.
 * 
 * Channels is an array of 16-bit unsigned integer channel values to be sent. 8 channels is probably the maximum.
 */
MSP.setRawRx = function(channels) {
    var buffer = [];
    
    for (var i = 0; i < channels.length; i++) {
        buffer.push(specificByte(channels[i], 0));
        buffer.push(specificByte(channels[i], 1));
    }
    
    MSP.send_message(MSP_codes.MSP_SET_RAW_RC, buffer, false);
}

MSP.sendBlackboxConfiguration = function(onDataCallback) {
    var 
        message = [
            BLACKBOX.blackboxDevice & 0xFF, 
            BLACKBOX.blackboxRateNum & 0xFF, 
            BLACKBOX.blackboxRateDenom & 0xFF
        ];
    
    MSP.send_message(MSP_codes.MSP_SET_BLACKBOX_CONFIG, message, false, function(response) {
        onDataCallback();
    });
}

/**
 * Send a request to read a block of data from the dataflash at the given address and pass that address and a dataview
 * of the returned data to the given callback (or null for the data if an error occured).
 */
MSP.dataflashRead = function(address, onDataCallback) {
    MSP.send_message(MSP_codes.MSP_DATAFLASH_READ, [address & 0xFF, (address >> 8) & 0xFF, (address >> 16) & 0xFF, (address >> 24) & 0xFF], 
            false, function(response) {
        var chunkAddress = response.data.getUint32(0, 1);
        
        // Verify that the address of the memory returned matches what the caller asked for
        if (chunkAddress == address) {
            /* Strip that address off the front of the reply and deliver it separately so the caller doesn't have to
             * figure out the reply format:
             */
            onDataCallback(address, new DataView(response.data.buffer, response.data.byteOffset + 4, response.data.buffer.byteLength - 4));
        } else {
            // Report error
            onDataCallback(address, null);
        }
    });
};

MSP.sendServoMixRules = function(onCompleteCallback) {
    // TODO implement
    onCompleteCallback();
};

MSP.sendServoConfigurations = function(onCompleteCallback) {
    var nextFunction = send_next_servo_configuration; 
    
    var servoIndex = 0;

    if (SERVO_CONFIG.length == 0) {
        onCompleteCallback();
    } else {
        nextFunction();
    }


    function send_next_servo_configuration() {
        
        var buffer = [];

        // send one at a time, with index
        
        var servoConfiguration = SERVO_CONFIG[servoIndex];
        
        buffer.push(servoIndex);
        
        buffer.push(lowByte(servoConfiguration.min));
        buffer.push(highByte(servoConfiguration.min));

        buffer.push(lowByte(servoConfiguration.max));
        buffer.push(highByte(servoConfiguration.max));

        buffer.push(lowByte(servoConfiguration.middle));
        buffer.push(highByte(servoConfiguration.middle));

        buffer.push(lowByte(servoConfiguration.rate));
        
        var out = servoConfiguration.indexOfChannelToForward;
        if (out == undefined) {
            out = 255; // Cleanflight defines "CHANNEL_FORWARDING_DISABLED" as "(uint8_t)0xFF"
        }
        buffer.push(out);

        buffer.push(specificByte(servoConfiguration.reversedInputSources, 0));
        buffer.push(specificByte(servoConfiguration.reversedInputSources, 1));
        buffer.push(specificByte(servoConfiguration.reversedInputSources, 2));
        buffer.push(specificByte(servoConfiguration.reversedInputSources, 3));
        
        // prepare for next iteration
        servoIndex++;
        if (servoIndex == SERVO_CONFIG.length) {
            nextFunction = onCompleteCallback;
        }
        MSP.send_message(MSP_codes.MSP_SET_SERVO_CONFIGURATION, buffer, false, nextFunction);
    }
    
};

MSP.sendModeRanges = function(onCompleteCallback) {
    var nextFunction = send_next_mode_range; 
    
    var modeRangeIndex = 0;

    if (MODE_RANGES.length == 0) {
        onCompleteCallback();
    } else {
        send_next_mode_range();
    }

    function send_next_mode_range() {
        
        var modeRange = MODE_RANGES[modeRangeIndex];
                        
        var buffer = [];
        buffer.push(modeRangeIndex);
        buffer.push(modeRange.id);
        buffer.push(modeRange.auxChannelIndex);
        buffer.push((modeRange.range.start - 900) / 25);
        buffer.push((modeRange.range.end - 900) / 25);
        
        // prepare for next iteration
        modeRangeIndex++;
        if (modeRangeIndex == MODE_RANGES.length) {
            nextFunction = onCompleteCallback;
        
        }
        MSP.send_message(MSP_codes.MSP_SET_MODE_RANGE, buffer, false, nextFunction);
    }
};

MSP.sendAdjustmentRanges = function(onCompleteCallback) {
    var nextFunction = send_next_adjustment_range; 
        
    var adjustmentRangeIndex = 0;

    if (ADJUSTMENT_RANGES.length == 0) {
        onCompleteCallback();
    } else {
        send_next_adjustment_range();
    }


    function send_next_adjustment_range() {
        
        var adjustmentRange = ADJUSTMENT_RANGES[adjustmentRangeIndex];
                        
        var buffer = [];
        buffer.push(adjustmentRangeIndex);
        buffer.push(adjustmentRange.slotIndex);
        buffer.push(adjustmentRange.auxChannelIndex);
        buffer.push((adjustmentRange.range.start - 900) / 25);
        buffer.push((adjustmentRange.range.end - 900) / 25);
        buffer.push(adjustmentRange.adjustmentFunction);
        buffer.push(adjustmentRange.auxSwitchChannelIndex);
        
        // prepare for next iteration
        adjustmentRangeIndex++;
        if (adjustmentRangeIndex == ADJUSTMENT_RANGES.length) {
            nextFunction = onCompleteCallback;
        
        }
        MSP.send_message(MSP_codes.MSP_SET_ADJUSTMENT_RANGE, buffer, false, nextFunction);
    }
};

MSP.sendLedStripConfig = function(onCompleteCallback) {
    
    var nextFunction = send_next_led_strip_config; 
    
    var ledIndex = 0;

    if (LED_STRIP.length == 0) {
        onCompleteCallback();
    } else {
        send_next_led_strip_config();
    }

    function send_next_led_strip_config() {
        
        var led = LED_STRIP[ledIndex];
        /*
        var led = {
            directions: directions,
            functions: functions,
            x: data.getUint8(offset++, 1),
            y: data.getUint8(offset++, 1),
            color: data.getUint8(offset++, 1)
        };
        */       
        var buffer = [];
        
        buffer.push(ledIndex);

        if (semver.lt(CONFIG.apiVersion, "1.20.0")) {
            var directionMask = 0;
            for (var directionLetterIndex = 0; directionLetterIndex < led.directions.length; directionLetterIndex++) {
                var bitIndex = MSP.ledDirectionLetters.indexOf(led.directions[directionLetterIndex]);
                if (bitIndex >= 0) {
                    directionMask = bit_set(directionMask, bitIndex);
                }
            }
            buffer.push(specificByte(directionMask, 0));
            buffer.push(specificByte(directionMask, 1));
    
            var functionMask = 0;
            for (var functionLetterIndex = 0; functionLetterIndex < led.functions.length; functionLetterIndex++) {
                var bitIndex = MSP.ledFunctionLetters.indexOf(led.functions[functionLetterIndex]);
                if (bitIndex >= 0) {
                    functionMask = bit_set(functionMask, bitIndex);
                }
            }
            buffer.push(specificByte(functionMask, 0));
            buffer.push(specificByte(functionMask, 1));
    
            buffer.push(led.x);
            buffer.push(led.y);
    
            buffer.push(led.color);
        } else {
            var mask = 0;
            /*
    ledDirectionLetters:        ['n', 'e', 's', 'w', 'u', 'd'],      // in LSB bit order
    ledFunctionLetters:         ['i', 'w', 'f', 'a', 't', 'r', 'c', 'g', 's', 'b', 'l'], // in LSB bit order
    ledBaseFunctionLetters:     ['c', 'f', 'a', 'l', 's', 'g', 'r'], // in LSB bit 
    ledOverlayLetters:          ['t', 'o', 'b', 'n', 'i', 'w'], // in LSB bit 
    
             */
            mask |= (led.y << 0);
            mask |= (led.x << 4);

            for (var functionLetterIndex = 0; functionLetterIndex < led.functions.length; functionLetterIndex++) {
                var fnIndex = MSP.ledBaseFunctionLetters.indexOf(led.functions[functionLetterIndex]);
                if (fnIndex >= 0) {
                    mask |= (fnIndex << 8);
                    break;
                }
            }
            
            for (var overlayLetterIndex = 0; overlayLetterIndex < led.functions.length; overlayLetterIndex++) {
                var bitIndex = MSP.ledOverlayLetters.indexOf(led.functions[overlayLetterIndex]);
                if (bitIndex >= 0) {
                    mask |= bit_set(mask, bitIndex + 12);
                }
            }

            mask |= (led.color << 18);

            for (var directionLetterIndex = 0; directionLetterIndex < led.directions.length; directionLetterIndex++) {
                var bitIndex = MSP.ledDirectionLetters.indexOf(led.directions[directionLetterIndex]);
                if (bitIndex >= 0) {
                    mask |= bit_set(mask, bitIndex + 22);
                }
            }
            
            mask |= (0 << 28); // parameters
            
            
            buffer.push(specificByte(mask, 0));
            buffer.push(specificByte(mask, 1));
            buffer.push(specificByte(mask, 2));
            buffer.push(specificByte(mask, 3));
        }
        
        // prepare for next iteration
        ledIndex++;
        if (ledIndex == LED_STRIP.length) {
            nextFunction = onCompleteCallback;
        }
        
        MSP.send_message(MSP_codes.MSP_SET_LED_STRIP_CONFIG, buffer, false, nextFunction);
    }
}

MSP.sendLedStripColors = function(onCompleteCallback) {
    if (LED_COLORS.length == 0) {
        onCompleteCallback();
    } else {
        var buffer = [];
        
        for (var colorIndex = 0; colorIndex < LED_COLORS.length; colorIndex++) {
            var color = LED_COLORS[colorIndex];
            
            buffer.push(specificByte(color.h, 0));
            buffer.push(specificByte(color.h, 1));
            buffer.push(color.s);
            buffer.push(color.v);
        }
        MSP.send_message(MSP_codes.MSP_SET_LED_COLORS, buffer, false, onCompleteCallback);
    }
}

MSP.sendLedStripModeColors = function(onCompleteCallback) {
    
    var nextFunction = send_next_led_strip_mode_color; 
    var index = 0;
    
    if (LED_MODE_COLORS.length == 0) {
        onCompleteCallback();
    } else {
        send_next_led_strip_mode_color();
    }
    
    function send_next_led_strip_mode_color() {
        var buffer = [];
        
        var mode_color = LED_MODE_COLORS[index];
        
        buffer.push(mode_color.mode);
        buffer.push(mode_color.direction);
        buffer.push(mode_color.color);

        // prepare for next iteration
        index++;
        if (index == LED_MODE_COLORS.length) {
            nextFunction = onCompleteCallback;
        }

        MSP.send_message(MSP_codes.MSP_SET_LED_STRIP_MODECOLOR, buffer, false, nextFunction);
    }
}

MSP.sendOsdLayout = function(elements, onCompleteCallback) {
    var nextFunction = send_next; 
    var index = 0;
    
    if (elements.length == 0) {
        onCompleteCallback();
    } else {
        send_next();
    }
    
    function send_next() {
        var buffer = [];
        
        var element = elements[index];
        
        buffer.push(index);
        buffer.push(specificByte(element.id, 0));
        buffer.push(specificByte(element.id, 1));
        buffer.push(specificByte(element.flag_mask, 0));
        buffer.push(specificByte(element.flag_mask, 1));
        buffer.push(element.x);
        buffer.push(element.y);

        // prepare for next iteration
        index++;
        if (index == elements.length) {
            nextFunction = onCompleteCallback;
        }

        MSP.send_message(MSP_codes.MSP_SET_OSD_LAYOUT_CONFIG, buffer, false, nextFunction);
    }
}

MSP.serialPortFunctionMaskToFunctions = function(functionMask) {
    var functions = [];
    
    var keys = Object.keys(MSP.serialPortFunctions);
    for (var index = 0; index < keys.length; index++) {
        var key = keys[index];
        var bit = MSP.serialPortFunctions[key];
        if (bit_check(functionMask, bit)) {
            functions.push(key);
        }
    }
    return functions;
}

MSP.serialPortFunctionsToMask = function(functions) {
    var mask = 0;
    var keys = Object.keys(MSP.serialPortFunctions);
    for (var index = 0; index < functions.length; index++) {
        var key = functions[index];
        var bitIndex = MSP.serialPortFunctions[key];
        if (bitIndex >= 0) {
            mask = bit_set(mask, bitIndex);
        }
    }
    return mask;
}

MSP.sendRxFailConfig = function(onCompleteCallback) {
    var nextFunction = send_next_rxfail_config;

    var rxFailIndex = 0;

    if (RXFAIL_CONFIG.length == 0) {
        onCompleteCallback();
    } else {
        send_next_rxfail_config();
    }

    function send_next_rxfail_config() {

        var rxFail = RXFAIL_CONFIG[rxFailIndex];

        var buffer = [];
        buffer.push(rxFailIndex);
        buffer.push(rxFail.mode);
        buffer.push(lowByte(rxFail.value));
        buffer.push(highByte(rxFail.value));

        // prepare for next iteration
        rxFailIndex++;
        if (rxFailIndex == RXFAIL_CONFIG.length) {
            nextFunction = onCompleteCallback;

        }
        MSP.send_message(MSP_codes.MSP_SET_RXFAIL_CONFIG, buffer, false, nextFunction);
    }
};

MSP.sendVoltageMeterConfigs = function(onCompleteCallback) {
    var nextFunction = send_next; 
    var index = 0;
    
    if (VOLTAGE_METER_CONFIGS.length == 0) {
        onCompleteCallback();
    } else {
        send_next();
    }
    
    function send_next() {
        var buffer = [];
        
        var voltageConfig = VOLTAGE_METER_CONFIGS[index];
        
        buffer.push(index);
        buffer.push(voltageConfig.vbatscale);
        buffer.push(voltageConfig.vbatresdivval);
        buffer.push(voltageConfig.vbatresdivmultiplier);

        // prepare for next iteration
        index++;
        if (index == VOLTAGE_METER_CONFIGS.length) {
            nextFunction = onCompleteCallback;
        }

        MSP.send_message(MSP_codes.MSP_SET_VOLTAGE_METER_CONFIG, buffer, false, nextFunction);
    }
}


MSP.sendAmperageMeterConfigs = function(onCompleteCallback) {
    var nextFunction = send_next; 
    var index = 0;
    
    if (AMPERAGE_METER_CONFIGS.length == 0) {
        onCompleteCallback();
    } else {
        send_next();
    }
    
    function send_next() {
        var buffer = [];
        
        var amperageConfig = AMPERAGE_METER_CONFIGS[index];
        
        buffer.push(index);
        buffer.push(specificByte(amperageConfig.scale, 0));
        buffer.push(specificByte(amperageConfig.scale, 1));
        buffer.push(specificByte(amperageConfig.offset, 0));
        buffer.push(specificByte(amperageConfig.offset, 1));

        // prepare for next iteration
        index++;
        if (index == AMPERAGE_METER_CONFIGS.length) {
            nextFunction = onCompleteCallback;
        }

        MSP.send_message(MSP_codes.MSP_SET_AMPERAGE_METER_CONFIG, buffer, false, nextFunction);
    }
}

MSP.SDCARD_STATE_NOT_PRESENT = 0;
MSP.SDCARD_STATE_FATAL       = 1;
MSP.SDCARD_STATE_CARD_INIT   = 2;
MSP.SDCARD_STATE_FS_INIT     = 3;
MSP.SDCARD_STATE_READY       = 4;


