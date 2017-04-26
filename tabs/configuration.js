'use strict';

TABS.configuration = {
    DSHOT_PROTOCOL_MIN_VALUE: 5
};

TABS.configuration.initialize = function (callback, scrollPosition) {
    var self = this;

    if (GUI.active_tab != 'configuration') {
        GUI.active_tab = 'configuration';
    }

    function load_config() {
        MSP.send_message(MSPCodes.MSP_FEATURE_CONFIG, false, false, load_serial_config);
    }

    function load_serial_config() {
        MSP.send_message(MSPCodes.MSP_CF_SERIAL_CONFIG, false, false, load_board_alignment_config);
    }

    function load_board_alignment_config() {
        MSP.send_message(MSPCodes.MSP_BOARD_ALIGNMENT_CONFIG, false, false, load_rc_map);
    }
    
    function load_rc_map() {
        MSP.send_message(MSPCodes.MSP_RX_MAP, false, false, load_mixer_config);
    }

    function load_mixer_config() {
        MSP.send_message(MSPCodes.MSP_MIXER_CONFIG, false, false, load_rssi_config);
    }

    function load_rssi_config() {
        MSP.send_message(MSPCodes.MSP_RSSI_CONFIG, false, false, load_motor_config);
    }

    function load_motor_config() {
        var next_callback = load_compass_config;
        if(semver.gte(CONFIG.apiVersion, "1.33.0")) {
            MSP.send_message(MSPCodes.MSP_MOTOR_CONFIG, false, false, next_callback);
        } else {
            next_callback();
        }
    }
    
    function load_compass_config() {
        var next_callback = load_gps_config;
        if(semver.gte(CONFIG.apiVersion, "1.33.0")) {
            MSP.send_message(MSPCodes.MSP_COMPASS_CONFIG, false, false, load_gps_config);
        } else {
            next_callback();
        }
    }
    
    function load_gps_config() {
        var next_callback = load_acc_trim;
        if(semver.gte(CONFIG.apiVersion, "1.33.0")) {
            MSP.send_message(MSPCodes.MSP_GPS_CONFIG, false, false, load_acc_trim);
        } else {
            next_callback();
        }
    }

    function load_acc_trim() {
        MSP.send_message(MSPCodes.MSP_ACC_TRIM, false, false, load_misc);
    }

    function load_misc() {
        var next_callback = load_arming_config;
        if (semver.lt(CONFIG.apiVersion, "1.33.0")) {
            MSP.send_message(MSPCodes.MSP_MISC, false, false, next_callback);
        } else {
            next_callback();
        }
    }
    
    function load_arming_config() {
        var next_callback = load_3d;
        if (semver.gte(CONFIG.apiVersion, "1.8.0")) {
            MSP.send_message(MSPCodes.MSP_ARMING_CONFIG, false, false, next_callback);
        } else {
            next_callback();
        }
    }

    function load_3d() {
        var next_callback = load_rc_deadband;
        if (semver.gte(CONFIG.apiVersion, "1.14.0")) {
            MSP.send_message(MSPCodes.MSP_MOTOR_3D_CONFIG, false, false, next_callback);
        } else {
            next_callback();
        }
    }

    function load_rc_deadband() {
        var next_callback = esc_protocol;
        if (semver.gte(CONFIG.apiVersion, "1.17.0")) {
            MSP.send_message(MSPCodes.MSP_RC_DEADBAND, false, false, next_callback);
        } else {
            next_callback();
        }
    }

    function esc_protocol() {
        var next_callback = sensor_config;
        if (semver.gte(CONFIG.apiVersion, "1.16.0")) {
            MSP.send_message(MSPCodes.MSP_ADVANCED_CONFIG, false, false, next_callback);
        } else {
            next_callback();
        }
    }

    function sensor_config() {
        var next_callback = load_sensor_alignment;
        if (semver.gte(CONFIG.apiVersion, "1.16.0")) {
            MSP.send_message(MSPCodes.MSP_SENSOR_CONFIG, false, false, next_callback);
        } else {
            next_callback();
        }
    }

    function load_sensor_alignment() {
        var next_callback = load_name;
        if (semver.gte(CONFIG.apiVersion, "1.15.0")) {
            MSP.send_message(MSPCodes.MSP_SENSOR_ALIGNMENT, false, false, next_callback);
        } else {
            next_callback();
        }
    }

    function load_name() {
        var next_callback = load_rx_config;
        if (semver.gte(CONFIG.apiVersion, "1.20.0")) {
            MSP.send_message(MSPCodes.MSP_NAME, false, false, next_callback);
        } else {
            next_callback();
        }
    }

    function load_rx_config() {
        var next_callback = load_html;
        if (semver.gte(CONFIG.apiVersion, "1.31.0")) {
            MSP.send_message(MSPCodes.MSP_RX_CONFIG, false, false, next_callback);
        } else {
            next_callback();
        }
    }

    function load_html() {
        $('#content').load("./tabs/configuration.html", process_html);
    }

    load_config();

    function process_html() {
        var mixer_list_e = $('select.mixerList');
        for (var selectIndex = 0; selectIndex < mixerList.length; selectIndex++) {
            mixerList.forEach(function (mixerEntry, mixerIndex) {
                if (mixerEntry.pos === selectIndex) {
                    mixer_list_e.append('<option value="' + (mixerIndex + 1) + '">' + mixerEntry.name + '</option>');
                }
            });
        }

        mixer_list_e.change(function () {
            var val = parseInt($(this).val());

            MIXER_CONFIG.mixer = val;

            $('.mixerPreview img').attr('src', './resources/motor_order/' + mixerList[val - 1].image + '.svg');
        });

        // select current mixer configuration
        mixer_list_e.val(MIXER_CONFIG.mixer).change();

        var features_e = $('.tab-configuration .features');

        FEATURE_CONFIG.features.generateElements(features_e);

        // translate to user-selected language
        localize();

        var alignments = [
            'CW 0°',
            'CW 90°',
            'CW 180°',
            'CW 270°',
            'CW 0° flip',
            'CW 90° flip',
            'CW 180° flip',
            'CW 270° flip'
        ];

        var orientation_gyro_e = $('select.gyroalign');
        var orientation_acc_e = $('select.accalign');
        var orientation_mag_e = $('select.magalign');

        if (semver.lt(CONFIG.apiVersion, "1.15.0")) {
            $('.tab-configuration .sensoralignment').hide();
        } else {
            for (var i = 0; i < alignments.length; i++) {
                orientation_gyro_e.append('<option value="' + (i+1) + '">'+ alignments[i] + '</option>');
                orientation_acc_e.append('<option value="' + (i+1) + '">'+ alignments[i] + '</option>');
                orientation_mag_e.append('<option value="' + (i+1) + '">'+ alignments[i] + '</option>');
            }
            orientation_gyro_e.val(SENSOR_ALIGNMENT.align_gyro);
            orientation_acc_e.val(SENSOR_ALIGNMENT.align_acc);
            orientation_mag_e.val(SENSOR_ALIGNMENT.align_mag);
        }

        // ESC protocols
        var escprotocols = [
            'PWM',
            'ONESHOT125',
            'ONESHOT42',
            'MULTISHOT'
        ];

        if (semver.gte(CONFIG.apiVersion, "1.20.0")) {
            escprotocols.push('BRUSHED');
        }

        if (semver.gte(CONFIG.apiVersion, "1.31.0")) {
            escprotocols.push('DSHOT150');
            escprotocols.push('DSHOT300');
            escprotocols.push('DSHOT600');
            if (semver.gte(CONFIG.apiVersion, "1.26.0")) {
                if (PID_ADVANCED_CONFIG.fast_pwm_protocol === 8) {
                    escprotocols.push('DSHOT1200');
                }
            }
        }

        var esc_protocol_e = $('select.escprotocol');

        for (var i = 0; i < escprotocols.length; i++) {
            esc_protocol_e.append('<option value="' + (i + 1) + '">'+ escprotocols[i] + '</option>');
        }

        esc_protocol_e.val(PID_ADVANCED_CONFIG.fast_pwm_protocol + 1);

        esc_protocol_e.change(function () {
            if ($(this).val() - 1 >= self.DSHOT_PROTOCOL_MIN_VALUE) {
                $('div.minthrottle').hide();
                $('div.maxthrottle').hide();
                $('div.mincommand').hide();

                $('div.digitalIdlePercent').show();
            } else {
                $('div.minthrottle').show();
                $('div.maxthrottle').show();
                $('div.mincommand').show();

                $('div.digitalIdlePercent').hide();
            }
        }).change();

        $('input[id="unsyncedPWMSwitch"]').prop('checked', PID_ADVANCED_CONFIG.use_unsyncedPwm !== 0);
        $('input[name="unsyncedpwmfreq"]').val(PID_ADVANCED_CONFIG.motor_pwm_rate);
        $('input[name="digitalIdlePercent"]').val(PID_ADVANCED_CONFIG.digitalIdlePercent);

        // Gyro and PID update
        var gyroUse32kHz_e = $('input[id="gyroUse32kHz"]');
        var gyro_select_e = $('select.gyroSyncDenom');
        var pid_select_e = $('select.pidProcessDenom');

         function addDenomOption(element, denom, baseFreq) {
            element.append('<option value="' + denom + '">' + ((baseFreq / denom * 100).toFixed(0) / 100) + ' kHz</option>');
        }

        var updateGyroDenom = function (gyroBaseFreq) {
            var originalGyroDenom = gyro_select_e.val();

            gyro_select_e.empty();

            var denom = 1;
            while (denom <= 8) {
                addDenomOption(gyro_select_e, denom, gyroBaseFreq);
                denom ++;
            }

            if (semver.gte(CONFIG.apiVersion, "1.25.0")) {
                while (denom <= 32) {
                     addDenomOption(gyro_select_e, denom, gyroBaseFreq);

                     denom ++;
                }
            }

            gyro_select_e.val(originalGyroDenom);

            gyro_select_e.change();
        };

        if (semver.gte(CONFIG.apiVersion, "1.25.0")) {
            gyroUse32kHz_e.prop('checked', PID_ADVANCED_CONFIG.gyroUse32kHz !== 0);

            gyroUse32kHz_e.change(function () {
                var gyroBaseFreq;
                if ($(this).is(':checked')) {
                    gyroBaseFreq = 32;
                } else {
                    gyroBaseFreq = 8;
                }

                updateGyroDenom(gyroBaseFreq);
            }).change();
        } else {
            $('div.gyroUse32kHz').hide();

            updateGyroDenom(8);
        }

        gyro_select_e.val(PID_ADVANCED_CONFIG.gyro_sync_denom);

        gyro_select_e.change(function () {
            var originalPidDenom = pid_select_e.val();

            var pidBaseFreq = 8;
            if (semver.gte(CONFIG.apiVersion, "1.25.0") && gyroUse32kHz_e.is(':checked')) {
                pidBaseFreq = 32;
            }

            pidBaseFreq = pidBaseFreq / parseInt($(this).val());

            pid_select_e.empty();

            var denom = 1;

            while (denom <= 8) {
                addDenomOption(pid_select_e, denom, pidBaseFreq);
                denom ++;
            }

            if (semver.gte(CONFIG.apiVersion, "1.24.0")) {
                while (denom <= 16) {
                    addDenomOption(pid_select_e, denom, pidBaseFreq);

                    denom ++;
                }
            }

            pid_select_e.val(originalPidDenom);
        }).change();

        pid_select_e.val(PID_ADVANCED_CONFIG.pid_process_denom);

        $('input[id="accHardwareSwitch"]').prop('checked', SENSOR_CONFIG.acc_hardware !== 1);
        $('input[id="baroHardwareSwitch"]').prop('checked', SENSOR_CONFIG.baro_hardware !== 1);
        $('input[id="magHardwareSwitch"]').prop('checked', SENSOR_CONFIG.mag_hardware !== 1);

        // Only show these sections for supported FW
        if (semver.lt(CONFIG.apiVersion, "1.16.0")) {
            $('.selectProtocol').hide();
            $('.checkboxPwm').hide();
            $('.selectPidProcessDenom').hide();
        }

        if (semver.lt(CONFIG.apiVersion, "1.16.0")) {
            $('.hardwareSelection').hide();
        }

        $('input[name="craftName"]').val(CONFIG.name);


        if (semver.gte(CONFIG.apiVersion, "1.31.0")) {
            $('input[name="fpvCamAngleDegrees"]').val(RX_CONFIG.fpvCamAngleDegrees);
        } else {
            $('div.fpvCamAngleDegrees').hide();
        }

        if (semver.lt(CONFIG.apiVersion, "1.20.0")) {
            $('.miscSettings').hide();
        }

        // generate GPS
        var gpsProtocols = [
            'NMEA',
            'UBLOX'
        ];

        var gpsBaudRates = [
            '115200',
            '57600',
            '38400',
            '19200',
            '9600'
        ];

        var gpsSbas = [
            'Auto-detect',
            'European EGNOS',
            'North American WAAS',
            'Japanese MSAS',
            'Indian GAGAN'
        ];


        var gps_protocol_e = $('select.gps_protocol');
        for (var i = 0; i < gpsProtocols.length; i++) {
            gps_protocol_e.append('<option value="' + i + '">' + gpsProtocols[i] + '</option>');
        }

        gps_protocol_e.change(function () {
            GPS_CONFIG.provider = parseInt($(this).val());
        });

        gps_protocol_e.val(GPS_CONFIG.provider);

        $('input[name="gps_auto_baud"]').prop('checked', GPS_CONFIG.auto_baud == 1);
        $('input[name="gps_auto_config"]').prop('checked', GPS_CONFIG.auto_config == 1);
        if (semver.gte(CONFIG.apiVersion, "1.34.0")) {
            $('.select.gps_auto_baud').show();
            $('.select.gps_auto_config').show();
        } else {
            $('.select.gps_auto_baud').hide();
            $('.select.gps_auto_config').hide();
        }

        var gps_baudrate_e = $('select.gps_baudrate');
        for (var i = 0; i < gpsBaudRates.length; i++) {
            gps_baudrate_e.append('<option value="' + gpsBaudRates[i] + '">' + gpsBaudRates[i] + '</option>');
        }

        if (semver.lt(CONFIG.apiVersion, "1.6.0")) {
            gps_baudrate_e.change(function () {
                SERIAL_CONFIG.gpsBaudRate = parseInt($(this).val());
            });
            gps_baudrate_e.val(SERIAL_CONFIG.gpsBaudRate);
        } else {
            gps_baudrate_e.prop("disabled", true);
            gps_baudrate_e.parent().hide();
        }


        var gps_ubx_sbas_e = $('select.gps_ubx_sbas');
        for (var i = 0; i < gpsSbas.length; i++) {
            gps_ubx_sbas_e.append('<option value="' + i + '">' + gpsSbas[i] + '</option>');
        }

        gps_ubx_sbas_e.change(function () {
            GPS_CONFIG.ublox_sbas = parseInt($(this).val());
        });

        gps_ubx_sbas_e.val(GPS_CONFIG.ublox_sbas);


        // generate serial RX
        var serialRXtypes = [
            'SPEKTRUM1024',
            'SPEKTRUM2048',
            'SBUS',
            'SUMD',
            'SUMH',
            'XBUS_MODE_B',
            'XBUS_MODE_B_RJ01'
        ];

        if (semver.gte(CONFIG.apiVersion, "1.15.0")) {
            serialRXtypes.push('IBUS');
        }

        if ((CONFIG.flightControllerIdentifier === 'BTFL' && semver.gte(CONFIG.flightControllerVersion, "2.6.0")) ||
            (CONFIG.flightControllerIdentifier === 'CLFL' && semver.gte(CONFIG.apiVersion, "1.31.0"))) {
            serialRXtypes.push('JETIEXBUS');
        }

        if (semver.gte(CONFIG.apiVersion, "1.31.0"))  {
            serialRXtypes.push('CRSF');
        }

        if (semver.gte(CONFIG.apiVersion, "1.24.0"))  {
            serialRXtypes.push('SRXL');
        }

        if (semver.gte(CONFIG.apiVersion, "1.35.0")) {
            serialRXtypes.push('TARGET_CUSTOM');
        }

        var serialRX_e = $('select.serialRX');
        for (var i = 0; i < serialRXtypes.length; i++) {
            serialRX_e.append('<option value="' + i + '">' + serialRXtypes[i] + '</option>');
        }

        serialRX_e.change(function () {
            RX_CONFIG.serialrx_provider = parseInt($(this).val());
        });

        // select current serial RX type
        serialRX_e.val(RX_CONFIG.serialrx_provider);

        // for some odd reason chrome 38+ changes scroll according to the touched select element
        // i am guessing this is a bug, since this wasn't happening on 37
        // code below is a temporary fix, which we will be able to remove in the future (hopefully)
        $('#content').scrollTop((scrollPosition) ? scrollPosition : 0);

        // fill board alignment
        $('input[name="board_align_roll"]').val(BOARD_ALIGNMENT_CONFIG.roll);
        $('input[name="board_align_pitch"]').val(BOARD_ALIGNMENT_CONFIG.pitch);
        $('input[name="board_align_yaw"]').val(BOARD_ALIGNMENT_CONFIG.yaw);

        // fill accel trims
        $('input[name="roll"]').val(CONFIG.accelerometerTrims[1]);
        $('input[name="pitch"]').val(CONFIG.accelerometerTrims[0]);

        // fill magnetometer
        $('input[name="mag_declination"]').val(COMPASS_CONFIG.mag_declination.toFixed(2));

        //fill motor disarm params and FC loop time
        if(semver.gte(CONFIG.apiVersion, "1.8.0")) {
            $('input[name="autodisarmdelay"]').val(ARMING_CONFIG.auto_disarm_delay);
            $('input[id="disarmkillswitch"]').prop('checked', ARMING_CONFIG.disarm_kill_switch !== 0);
            $('div.disarm').show();

            $('div.cycles').show();
        }

        // fill throttle
        $('input[name="minthrottle"]').val(MOTOR_CONFIG.minthrottle);
        $('input[name="maxthrottle"]').val(MOTOR_CONFIG.maxthrottle);
        $('input[name="mincommand"]').val(MOTOR_CONFIG.mincommand);

        //fill 3D
        if (semver.lt(CONFIG.apiVersion, "1.14.0")) {
            $('.tab-configuration ._3d').hide();
        } else {
            $('input[name="3ddeadbandlow"]').val(MOTOR_3D_CONFIG.deadband3d_low);
            $('input[name="3ddeadbandhigh"]').val(MOTOR_3D_CONFIG.deadband3d_high);
            $('input[name="3dneutral"]').val(MOTOR_3D_CONFIG.neutral);
        }

        // UI hooks
        function checkShowDisarmDelay() {
            if (FEATURE_CONFIG.features.isEnabled('MOTOR_STOP')) {
                $('div.disarmdelay').show();
            } else {
                $('div.disarmdelay').hide();
            }
        }

        function checkShowSerialRxBox() {
            if (FEATURE_CONFIG.features.isEnabled('RX_SERIAL')) {
                $('div.serialRXBox').show();
            } else {
                $('div.serialRXBox').hide();
            }
        }

        function checkUpdateGpsControls() {
            if (FEATURE_CONFIG.features.isEnabled('GPS')) {
                $('.gpsSettings').show();
            } else {
                $('.gpsSettings').hide();
            }
        }

        function checkUpdate3dControls() {
            if (FEATURE_CONFIG.features.isEnabled('3D')) {
                $('._3dSettings').show();
            } else {
                $('._3dSettings').hide();
            }
        }

        $('input.feature', features_e).change(function () {
            var element = $(this);

            FEATURE_CONFIG.features.updateData(element);
            updateTabList(FEATURE_CONFIG.features);

            switch (element.attr('name')) {
                case 'MOTOR_STOP':
                    checkShowDisarmDelay();
                    break;

                case 'GPS':
                    checkUpdateGpsControls();
                    break;
                    
                case '3D':
                    checkUpdate3dControls();
                    break;
                    
                default:
                    break;
            }
        });

        $(features_e).filter('select').change(function () {
            var element = $(this);

            FEATURE_CONFIG.features.updateData(element);
            updateTabList(FEATURE_CONFIG.features);

            switch (element.attr('name')) {
                case 'rxMode':
                    checkShowSerialRxBox();

                    break;
                default:
                    break;
            }
        });

        checkShowDisarmDelay();
        checkShowSerialRxBox();
        checkUpdateGpsControls();
        checkUpdate3dControls();

        $("input[id='unsyncedPWMSwitch']").change(function() {
            if ($(this).is(':checked')) {
                $('div.unsyncedpwmfreq').show();
            } else {
                $('div.unsyncedpwmfreq').hide();
            }
        }).change();

        $('a.save').click(function () {
            // gather data that doesn't have automatic change event bound
            BOARD_ALIGNMENT_CONFIG.roll = parseInt($('input[name="board_align_roll"]').val());
            BOARD_ALIGNMENT_CONFIG.pitch = parseInt($('input[name="board_align_pitch"]').val());
            BOARD_ALIGNMENT_CONFIG.yaw = parseInt($('input[name="board_align_yaw"]').val());

            CONFIG.accelerometerTrims[1] = parseInt($('input[name="roll"]').val());
            CONFIG.accelerometerTrims[0] = parseInt($('input[name="pitch"]').val());
            COMPASS_CONFIG.mag_declination = parseFloat($('input[name="mag_declination"]').val());

            // motor disarm
            if(semver.gte(CONFIG.apiVersion, "1.8.0")) {
                ARMING_CONFIG.auto_disarm_delay = parseInt($('input[name="autodisarmdelay"]').val());
                ARMING_CONFIG.disarm_kill_switch = $('input[id="disarmkillswitch"]').is(':checked') ? 1 : 0;
            }

            MOTOR_CONFIG.minthrottle = parseInt($('input[name="minthrottle"]').val());
            MOTOR_CONFIG.maxthrottle = parseInt($('input[name="maxthrottle"]').val());
            MOTOR_CONFIG.mincommand = parseInt($('input[name="mincommand"]').val());

            if(semver.gte(CONFIG.apiVersion, "1.14.0")) {
                MOTOR_3D_CONFIG.deadband3d_low = parseInt($('input[name="3ddeadbandlow"]').val());
                MOTOR_3D_CONFIG.deadband3d_high = parseInt($('input[name="3ddeadbandhigh"]').val());
                MOTOR_3D_CONFIG.neutral = parseInt($('input[name="3dneutral"]').val());
            }

            SENSOR_ALIGNMENT.align_gyro = parseInt(orientation_gyro_e.val());
            SENSOR_ALIGNMENT.align_acc = parseInt(orientation_acc_e.val());
            SENSOR_ALIGNMENT.align_mag = parseInt(orientation_mag_e.val());

            PID_ADVANCED_CONFIG.fast_pwm_protocol = parseInt(esc_protocol_e.val()-1);
            PID_ADVANCED_CONFIG.use_unsyncedPwm = $('input[id="unsyncedPWMSwitch"]').is(':checked') ? 1 : 0;
            PID_ADVANCED_CONFIG.motor_pwm_rate = parseInt($('input[name="unsyncedpwmfreq"]').val());
            PID_ADVANCED_CONFIG.gyro_sync_denom = parseInt(gyro_select_e.val());
            PID_ADVANCED_CONFIG.pid_process_denom = parseInt(pid_select_e.val());
            PID_ADVANCED_CONFIG.digitalIdlePercent = parseFloat($('input[name="digitalIdlePercent"]').val());
            if (semver.gte(CONFIG.apiVersion, "1.25.0")) {
                PID_ADVANCED_CONFIG.gyroUse32kHz = $('input[id="gyroUse32kHz"]').is(':checked') ? 1 : 0;
            }

            if (semver.gte(CONFIG.apiVersion, "1.31.0")) {
                RX_CONFIG.fpvCamAngleDegrees = parseInt($('input[name="fpvCamAngleDegrees"]').val());
            }

            function save_serial_config() {
                var next_callback = save_feature_config;
                MSP.send_message(MSPCodes.MSP_SET_CF_SERIAL_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_CF_SERIAL_CONFIG), false, next_callback);
            }

            function save_feature_config() {
                var next_callback = save_misc;
                MSP.send_message(MSPCodes.MSP_SET_FEATURE_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_FEATURE_CONFIG), false, next_callback);
            }

            function save_misc() {
                var next_callback = save_mixer_config;
                if(semver.lt(CONFIG.apiVersion, "1.33.0")) {
                    MSP.send_message(MSPCodes.MSP_SET_MISC, mspHelper.crunch(MSPCodes.MSP_SET_MISC), false, next_callback);
                } else {
                    next_callback();
                }
            }

            function save_mixer_config() {
                var next_callback = save_board_alignment_config;
                MSP.send_message(MSPCodes.MSP_SET_MIXER_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_MIXER_CONFIG), false, next_callback);
            }

            function save_board_alignment_config() {
                var next_callback = save_motor_config;
                MSP.send_message(MSPCodes.MSP_SET_BOARD_ALIGNMENT_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_BOARD_ALIGNMENT_CONFIG), false, next_callback);
            }

            function save_motor_config() {
                var next_callback = save_gps_config;
                if(semver.gte(CONFIG.apiVersion, "1.33.0")) {
                    MSP.send_message(MSPCodes.MSP_SET_MOTOR_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_MOTOR_CONFIG), false, next_callback);
                } else {
                    next_callback();
                }
            }

            function save_gps_config() {
                if (semver.gte(CONFIG.apiVersion, "1.34.0")) {
                    GPS_CONFIG.auto_baud = $('input[name="gps_auto_baud"]').is(':checked') ? 1 : 0;
                    GPS_CONFIG.auto_config = $('input[name="gps_auto_config"]').is(':checked') ? 1 : 0;
                }

                var next_callback = save_compass_config;
                if(semver.gte(CONFIG.apiVersion, "1.33.0")) {
                    MSP.send_message(MSPCodes.MSP_SET_GPS_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_GPS_CONFIG), false, next_callback);
                } else {
                    next_callback();
                }
            }

            function save_compass_config() {
                var next_callback = save_motor_3d_config;
                if(semver.gte(CONFIG.apiVersion, "1.33.0")) {
                    MSP.send_message(MSPCodes.MSP_SET_COMPASS_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_COMPASS_CONFIG), false, next_callback);
                } else {
                    next_callback();
                }
            }

            function save_motor_3d_config() {
                var next_callback = save_rc_deadband;
                MSP.send_message(MSPCodes.MSP_SET_MOTOR_3D_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_MOTOR_3D_CONFIG), false, next_callback);
            }

            function save_rc_deadband() {
                var next_callback = save_sensor_alignment;
                MSP.send_message(MSPCodes.MSP_SET_RC_DEADBAND, mspHelper.crunch(MSPCodes.MSP_SET_RC_DEADBAND), false, next_callback);
            }

            function save_sensor_alignment() {
                var next_callback = save_esc_protocol;
               MSP.send_message(MSPCodes.MSP_SET_SENSOR_ALIGNMENT, mspHelper.crunch(MSPCodes.MSP_SET_SENSOR_ALIGNMENT), false, next_callback);
            }
            function save_esc_protocol() {
                var next_callback = save_acc_trim;
                MSP.send_message(MSPCodes.MSP_SET_ADVANCED_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_ADVANCED_CONFIG), false, next_callback);
            }

            function save_acc_trim() {
                var next_callback = save_arming_config;
                MSP.send_message(MSPCodes.MSP_SET_ACC_TRIM, mspHelper.crunch(MSPCodes.MSP_SET_ACC_TRIM), false, next_callback);
            }

            function save_arming_config() {
                MSP.send_message(MSPCodes.MSP_SET_ARMING_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_ARMING_CONFIG), false, save_sensor_config);
            }

            function save_sensor_config() {
                SENSOR_CONFIG.acc_hardware = $('input[id="accHardwareSwitch"]').is(':checked') ? 0 : 1;
                SENSOR_CONFIG.baro_hardware = $('input[id="baroHardwareSwitch"]').is(':checked') ? 0 : 1;
                SENSOR_CONFIG.mag_hardware = $('input[id="magHardwareSwitch"]').is(':checked') ? 0 : 1;
                
                var next_callback = save_name;
                MSP.send_message(MSPCodes.MSP_SET_SENSOR_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_SENSOR_CONFIG), false, next_callback);
            }

            function save_name() {
                var next_callback = save_rx_config;

                CONFIG.name = $.trim($('input[name="craftName"]').val());
                MSP.send_message(MSPCodes.MSP_SET_NAME, mspHelper.crunch(MSPCodes.MSP_SET_NAME), false, next_callback);
            }

            function save_rx_config() {
                var next_callback = save_to_eeprom;
                if (semver.gte(CONFIG.apiVersion, "1.20.0")) {
                    MSP.send_message(MSPCodes.MSP_SET_RX_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_RX_CONFIG), false, next_callback);
                } else {
                    next_callback();
                }
            }

            function save_to_eeprom() {
                MSP.send_message(MSPCodes.MSP_EEPROM_WRITE, false, false, reboot);
            }

            function reboot() {
                GUI.log(chrome.i18n.getMessage('configurationEepromSaved'));

                GUI.tab_switch_cleanup(function() {
                    MSP.send_message(MSPCodes.MSP_SET_REBOOT, false, false, reinitialize);
                });
            }

            function reinitialize() {
                GUI.log(chrome.i18n.getMessage('deviceRebooting'));

                if (BOARD.find_board_definition(CONFIG.boardIdentifier).vcp) { // VCP-based flight controls may crash old drivers, we catch and reconnect
                    $('a.connect').click();
                    GUI.timeout_add('start_connection',function start_connection() {
                        $('a.connect').click();
                    },2500);
                } else {

                    GUI.timeout_add('waiting_for_bootup', function waiting_for_bootup() {
                        MSP.send_message(MSPCodes.MSP_STATUS, false, false, function() {
                            GUI.log(chrome.i18n.getMessage('deviceReady'));
                            TABS.configuration.initialize(false, $('#content').scrollTop());
                        });
                    },1500); // 1500 ms seems to be just the right amount of delay to prevent data request timeouts
                }
            }
            
            save_serial_config();
        });

        // status data pulled via separate timer with static speed
        GUI.interval_add('status_pull', function status_pull() {
            MSP.send_message(MSPCodes.MSP_STATUS);
        }, 250, true);
        GUI.content_ready(callback);
    }
};

TABS.configuration.cleanup = function (callback) {
    if (callback) callback();
};
