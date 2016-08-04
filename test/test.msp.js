"use strict";

var sensor_status = function() {};

describe('msp', function(){
  var encoder = new TextEncoder('utf-8');
  var incoming = Array.prototype.slice.call(encoder.encode('$M<'));

  beforeEach(function(){
    MSP.disconnect_cleanup();
  });

  describe('given a message', function() {
    describe('when the preamble is invalid', function() {
      var message = {data:encoder.encode('$N')};
      it('should ignore preamble', function(){
        MSP.read(message);
        MSP.state.should.equal(0);
      });
    });
    describe('when the direction is incoming', function() {
      var message = {data:encoder.encode('$M<')};
      it('should set correct message direction', function(){
        MSP.read(message);
        MSP.message_direction.should.equal(0);
      });
    });
    describe('when the direction is outgoing', function() {
      var message = {data:encoder.encode('$M>')};
      it('should set correct message direction', function(){
        MSP.read(message);
        MSP.message_direction.should.equal(1);
      });
    });
    describe('when the direction is unknown', function() {
      var message = {data:encoder.encode('$M^')};
      it('should default to incoming', function(){
        MSP.read(message);
        MSP.message_direction.should.equal(0);
      });
    });
    describe('when the message underruns size', function() {
      var payload = [1, 2];
      var message = {data:incoming.concat(3, MSP_codes.MSP_IDENT, payload, 100)};
      it('should wait for more data', function(){
        MSP.read(message);
        MSP.state.should.not.equal(0);
      });
    });
    describe('when the message overruns size', function() {
      var payload = [1, 2, 3, 4];
      var message = {data:incoming.concat(3, MSP_codes.MSP_IDENT, payload, 99)};
      it('should record a packet error', function(){
        MSP.read(message);
        MSP.packet_error.should.equal(1);
      });
    });
    describe('when the crc is incorrect', function() {
      var payload = [1, 2, 3];
      var message = {data:incoming.concat(3, MSP_codes.MSP_IDENT, payload, 301)};
      it('should record a packet error', function(){
        MSP.read(message);
        MSP.packet_error.should.equal(1);
      });
    });
    describe('when the command is unknown', function() {
      var message = {data:incoming.concat(0, 29, 29)};
      it('should ignore the message', function(){
        MSP.read(message);
        // TODO
      });
    });
  });

  describe('given an MSP_IDENT message', function() {
    var payload = [123, 4, 5, 42, 0, 0, 0];
    var message = {data:incoming.concat(7, MSP_codes.MSP_IDENT, payload, 51)};
    it('should set config correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      CONFIG.version.should.equal(1.23);
      CONFIG.multiType.should.equal(4);
      CONFIG.msp_version.should.equal(5);
      CONFIG.capability.should.equal(42);
    });
  });

  describe('given an MSP_STATUS message', function() {
    var payload = [20, 0, 30, 0, 7, 0, 1, 0, 0, 0, 40];
    var message = {data:incoming.concat(11, MSP_codes.MSP_STATUS, payload, 74)};
    it('should set config correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      CONFIG.cycleTime.should.equal(20);
      CONFIG.i2cError.should.equal(30);
      CONFIG.activeSensors.should.equal(7);
      CONFIG.mode.should.equal(1);
      CONFIG.profile.should.equal(40);
    });
  });

  describe('given an MSP_RAW_IMU message', function() {
    var payload = [0, 2, 0, 4, 0, 6, 41, 0, 82, 0, 123, 0, 66, 4, 66, 4, 66, 4];
    var message = {data:incoming.concat(18, MSP_codes.MSP_RAW_IMU, payload, 50)};
    it('should set sensor data correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      SENSOR_DATA.accelerometer[0].should.equal(1);
      SENSOR_DATA.accelerometer[1].should.equal(2);
      SENSOR_DATA.accelerometer[2].should.equal(3);
      SENSOR_DATA.gyroscope[0].should.be.approximately(10, 0.1);
      SENSOR_DATA.gyroscope[1].should.be.approximately(20, 0.1);
      SENSOR_DATA.gyroscope[2].should.be.approximately(30, 0.1);
      SENSOR_DATA.magnetometer[0].should.equal(1);
      SENSOR_DATA.magnetometer[1].should.equal(1);
      SENSOR_DATA.magnetometer[2].should.equal(1);
    });
  });

  describe('given an MSP_SERVO message', function() {
    var payload = [1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8, 0];
    var message = {data:incoming.concat(16, MSP_codes.MSP_SERVO, payload, 127)};
    it('should set servo data correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      SERVO_DATA[0].should.equal(1);
      SERVO_DATA[1].should.equal(2);
      SERVO_DATA[2].should.equal(3);
      SERVO_DATA[3].should.equal(4);
      SERVO_DATA[4].should.equal(5);
      SERVO_DATA[5].should.equal(6);
      SERVO_DATA[6].should.equal(7);
      SERVO_DATA[7].should.equal(8);
    });
  });

  describe('given an MSP_MOTOR message', function() {
    var payload = [1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8, 0];
    var message = {data:incoming.concat(16, MSP_codes.MSP_MOTOR, payload, 112)};
    it('should set motor data correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      SERVO_DATA[0].should.equal(1);
      SERVO_DATA[1].should.equal(2);
      SERVO_DATA[2].should.equal(3);
      SERVO_DATA[3].should.equal(4);
      SERVO_DATA[4].should.equal(5);
      SERVO_DATA[5].should.equal(6);
      SERVO_DATA[6].should.equal(7);
      SERVO_DATA[7].should.equal(8);
    });
  });

  describe('given an MSP_RC message', function() {
    var payload = [1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8, 0];
    var message = {data:incoming.concat(16, MSP_codes.MSP_RC, payload, 113)};
    it('should set RC channels correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      RC.channels[0].should.equal(1);
      RC.channels[1].should.equal(2);
      RC.channels[2].should.equal(3);
      RC.channels[3].should.equal(4);
      RC.channels[4].should.equal(5);
      RC.channels[5].should.equal(6);
      RC.channels[6].should.equal(7);
      RC.channels[7].should.equal(8);
    });
  });

  describe('given an MSP_RAW_GPS message', function() {
    var payload = [1, 2, 3, 0, 0, 0, 4, 0, 0, 0, 5, 0, 6, 0, 7, 0];
    var message = {data:incoming.concat(16, MSP_codes.MSP_RAW_GPS, payload, 122)};
    it('should set GPS data correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      GPS_DATA.fix.should.equal(1);
      GPS_DATA.numSat.should.equal(2);
      GPS_DATA.lat.should.equal(3);
      GPS_DATA.lon.should.equal(4);
      GPS_DATA.alt.should.equal(5);
      GPS_DATA.speed.should.equal(6);
      GPS_DATA.ground_course.should.equal(7);
    });
  });

  describe('given an MSP_COMP_GPS message', function() {
    var payload = [1, 0, 2, 0, 3];
    var message = {data:incoming.concat(5, MSP_codes.MSP_COMP_GPS, payload, 110)};
    it('should set GPS data correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      GPS_DATA.distanceToHome.should.equal(1);
      GPS_DATA.directionToHome.should.equal(2);
      GPS_DATA.update.should.equal(3);
    });
  });

  describe('given an MSP_ATTITUDE message', function() {
    var payload = [10, 0, 20, 0, 3, 0];
    var message = {data:incoming.concat(6, MSP_codes.MSP_ATTITUDE, payload, 119)};
    it('should set sensor data correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      SENSOR_DATA.kinematics[0].should.equal(1);
      SENSOR_DATA.kinematics[1].should.equal(2);
      SENSOR_DATA.kinematics[2].should.equal(3);
    });
  });

  describe('given an MSP_ALTITUDE message', function() {
    var payload = [250, 0, 0, 0];
    var message = {data:incoming.concat(4, MSP_codes.MSP_ALTITUDE, payload, 147)};
    it('should set sensor data correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      SENSOR_DATA.altitude.should.equal(2.5);
    });
  });

  describe('given an MSP_SONAR message', function() {
    var payload = [250, 0, 0, 0];
    var message = {data:incoming.concat(4, MSP_codes.MSP_SONAR, payload, 196)};
    it('should set sensor data correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      SENSOR_DATA.sonar.should.equal(250);
    });
  });

  describe('given an MSP_ANALOG message', function() {
    var payload = [10, 1, 0, 2, 0, 200, 0];
    var message = {data:incoming.concat(7, MSP_codes.MSP_ANALOG, payload, 168)};
    it('should set analog data correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      ANALOG.voltage.should.equal(1);
      ANALOG.mAhdrawn.should.equal(1);
      ANALOG.rssi.should.equal(2);
      ANALOG.amperage.should.equal(2);
    });
  });

  describe('given an MSP_RC_TUNING message', function() {
    var payload = [110, 120, 130, 140, 150, 160, 170];
    var message = {data:incoming.concat(7, MSP_codes.MSP_RC_TUNING, payload, 236)};
    it('should set RC tuning correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      RC_tuning.RC_RATE.should.equal(1.1);
      RC_tuning.RC_EXPO.should.equal(1.2);
      RC_tuning.roll_pitch_rate.should.equal(1.3);
      RC_tuning.yaw_rate.should.equal(1.4);
      RC_tuning.dynamic_THR_PID.should.equal(1.5);
      RC_tuning.throttle_MID.should.equal(1.6);
      RC_tuning.throttle_EXPO.should.equal(1.7);
    });
  });

  describe('given an MSP_PID message', function() {
    var payload = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
    var message = {data:incoming.concat(30, MSP_codes.MSP_PID, payload, 113)};
    it('should set PIDs correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');

      PIDs[0][0].should.equal(0.1);
      PIDs[0][1].should.equal(0.002);
      PIDs[0][2].should.equal(3);

      PIDs[1][0].should.equal(0.4);
      PIDs[1][1].should.equal(0.005);
      PIDs[1][2].should.equal(6);

      PIDs[2][0].should.equal(0.7);
      PIDs[2][1].should.equal(0.008);
      PIDs[2][2].should.equal(9);

      PIDs[3][0].should.equal(1.0);
      PIDs[3][1].should.equal(0.011);
      PIDs[3][2].should.equal(12);

      PIDs[4][0].should.equal(0.13);
      PIDs[4][1].should.equal(0.14);
      PIDs[4][2].should.equal(0.015);

      PIDs[5][0].should.equal(1.6);
      PIDs[5][1].should.equal(0.17);
      PIDs[5][2].should.equal(0.018);

      PIDs[6][0].should.equal(1.9);
      PIDs[6][1].should.equal(0.20);
      PIDs[6][2].should.equal(0.021);

      PIDs[7][0].should.equal(2.2);
      PIDs[7][1].should.equal(0.023);
      PIDs[7][2].should.equal(24);

      PIDs[8][0].should.equal(2.5);
      PIDs[8][1].should.equal(0.026);
      PIDs[8][2].should.equal(27);

      PIDs[9][0].should.equal(2.8);
      PIDs[9][1].should.equal(0.029);
      PIDs[9][2].should.equal(30);
    });
  });

  describe('given an MSP_MISC message', function() {
    var payload = [1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 7, 8, 9, 10, 11, 12, 0, 13, 14, 15, 16];
    var message = {data:incoming.concat(22, MSP_codes.MSP_MISC, payload, 116)};
    it('should set MISC correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');

      MISC.midrc.should.equal(1);
      MISC.minthrottle.should.equal(2);
      MISC.maxthrottle.should.equal(3);
      MISC.mincommand.should.equal(4);
      MISC.failsafe_throttle.should.equal(5);
      MISC.gps_type.should.equal(6);
      MISC.gps_baudrate.should.equal(7);
      MISC.gps_ubx_sbas.should.equal(8);
      MISC.multiwiicurrentoutput.should.equal(9);
      MISC.rssi_channel.should.equal(10);
      MISC.placeholder2.should.equal(11);
      MISC.mag_declination.should.equal(1.2);
      MISC.vbatscale.should.equal(13);
      MISC.vbatmincellvoltage.should.equal(1.4);
      MISC.vbatmaxcellvoltage.should.equal(1.5);
      MISC.vbatwarningcellvoltage.should.equal(1.6);
    });
  });

  describe('given an MSP_BOXNAMES message', function() {
    var payload = Array.prototype.slice.call(encoder.encode('box1;box2;box3;'));
    var message = {data:incoming.concat(15, MSP_codes.MSP_BOXNAMES, payload, 5)};
    it('should create aux config', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      AUX_CONFIG.length.should.equal(3);
      AUX_CONFIG[0].should.equal('box1');
      AUX_CONFIG[1].should.equal('box2');
      AUX_CONFIG[2].should.equal('box3');
    });
  });

  describe('given an MSP_PIDNAMES message', function() {
    var payload = Array.prototype.slice.call(encoder.encode('pid1;pid2;pid3;'));
    var message = {data:incoming.concat(15, MSP_codes.MSP_PIDNAMES, payload, 12)};
    it('should set pid names', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      PID_names.length.should.equal(3);
      PID_names[0].should.equal('pid1');
      PID_names[1].should.equal('pid2');
      PID_names[2].should.equal('pid3');
    });
  });

  describe('given an MSP_BOXIDS message', function() {
    var payload = [1, 2, 3];
    var message = {data:incoming.concat(3, MSP_codes.MSP_BOXIDS, payload, 116)};
    it('should create aux config ids', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      AUX_CONFIG_IDS.length.should.equal(3);
      AUX_CONFIG_IDS[0].should.equal(1);
      AUX_CONFIG_IDS[1].should.equal(2);
      AUX_CONFIG_IDS[2].should.equal(3);
    });
  });

  describe('given an MSP_SERVO_CONF message', function() {
    var channel = [1, 0, 2, 0, 3, 0, 4];
    var payload = channel.concat(channel, channel, channel, channel, channel, channel, channel);
    var message = {data:incoming.concat(56, MSP_codes.MSP_SERVO_CONF, payload, 64)};
    it('should create servo config', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');

      SERVO_CONFIG.length.should.equal(8);
      for(var i=0; i<8; i++) {
        SERVO_CONFIG[i].min.should.equal(1);
        SERVO_CONFIG[i].max.should.equal(2);
        SERVO_CONFIG[i].middle.should.equal(3);
        SERVO_CONFIG[i].rate.should.equal(4);
      }
    });
  });

  describe('given an MSP_DEBUG message', function() {
    var payload = [1, 0, 2, 0, 3, 0, 4, 0];
    var message = {data:incoming.concat(8, MSP_codes.MSP_DEBUG, payload, 242)};
    it('should set sensor data correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      SENSOR_DATA.debug[0].should.equal(1);
      SENSOR_DATA.debug[1].should.equal(2);
      SENSOR_DATA.debug[2].should.equal(3);
      SENSOR_DATA.debug[3].should.equal(4);
    });
  });

  describe('given an MSP_UID message', function() {
    var payload = [1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0];
    var message = {data:incoming.concat(12, MSP_codes.MSP_UID, payload, 172)};
    it('should set config correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      CONFIG.uid[0].should.equal(1);
      CONFIG.uid[1].should.equal(2);
      CONFIG.uid[2].should.equal(3);
    });
  });

  describe('given an MSP_ACC_TRIM message', function() {
    var payload = [1, 0, 2, 0];
    var message = {data:incoming.concat(4, MSP_codes.MSP_ACC_TRIM, payload, 247)};
    it('should set config correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      CONFIG.accelerometerTrims[0].should.equal(1);
      CONFIG.accelerometerTrims[1].should.equal(2);
    });
  });

  describe('given an MSP_GPS_SV_INFO message', function() {
    var payload = [2, 1, 2, 3, 4, 5, 6, 7, 8];
    var message = {data:incoming.concat(9, MSP_codes.MSP_GPS_SV_INFO, payload, 167)};
    it('should set GPS data correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      GPS_DATA.chn.length.should.equal(2);
      GPS_DATA.svid.length.should.equal(2);
      GPS_DATA.quality.length.should.equal(2);
      GPS_DATA.cno.length.should.equal(2);

      GPS_DATA.chn[0].should.equal(1);
      GPS_DATA.svid[0].should.equal(2);
      GPS_DATA.quality[0].should.equal(3);
      GPS_DATA.cno[0].should.equal(4);
      GPS_DATA.chn[1].should.equal(5);
      GPS_DATA.svid[1].should.equal(6);
      GPS_DATA.quality[1].should.equal(7);
      GPS_DATA.cno[1].should.equal(8);
    });
  });

  describe('given an MSP_RCMAP message', function() {
    var payload = [1, 2, 3];
    var message = {data:incoming.concat(3, MSP_codes.MSP_RCMAP, payload, 67)};
    it('should set RCP map data correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      RC_MAP[0].should.equal(1);
      RC_MAP[1].should.equal(2);
      RC_MAP[2].should.equal(3);
    });
  });

  describe('given an MSP_BF_CONFIG message', function() {
    var payload = [1, 2, 0, 0, 0, 3, 4, 0, 5, 0, 6, 0, 7, 0, 8, 0];
    var message = {data:incoming.concat(16, MSP_codes.MSP_BF_CONFIG, payload, 90)};
    it('should set BF config data correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      BF_CONFIG.mixerConfiguration.should.equal(1);
      BF_CONFIG.features.should.equal(2);
      BF_CONFIG.serialrx_type.should.equal(3);
      BF_CONFIG.board_align_roll.should.equal(4);
      BF_CONFIG.board_align_pitch.should.equal(5);
      BF_CONFIG.board_align_yaw.should.equal(6);
      BF_CONFIG.currentscale.should.equal(7);
      BF_CONFIG.currentoffset.should.equal(8);
    });
  });

  describe('given an MSP_API_VERSION message', function() {
    var payload = [1, 2, 4];
    var message = {data:incoming.concat(3, MSP_codes.MSP_API_VERSION, payload, 5)};
    it('should set config data correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      CONFIG.mspProtocolVersion.should.equal(1);
      CONFIG.apiVersion.should.equal('2.4');
    });
  });

  describe('given an MSP_FC_VARIANT message', function() {
    var payload = Array.prototype.slice.call(encoder.encode('CLFL'));
    var message = {data:incoming.concat(4, MSP_codes.MSP_FC_VARIANT, payload, 3)};
    it('should set config data correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      CONFIG.flightControllerIdentifier.should.equal('CLFL');
    });
  });

  describe('given an MSP_BUILD_INFO message', function() {
    var payload = Array.prototype.slice.call(encoder.encode('Dec 25 200003:02:01'));
    var message = {data:incoming.concat(19, MSP_codes.MSP_BUILD_INFO, payload, 81)};
    it('should set config data correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      CONFIG.buildInfo.should.equal('Dec 25 2000 03:02:01')
    });
  });

  describe('given an MSP_BOARD_INFO message', function() {
    var payload = Array.prototype.slice.call(encoder.encode('CLFL')).concat(1, 0);
    var message = {data:incoming.concat(6, MSP_codes.MSP_BOARD_INFO, payload, 6)};
    it('should set config data correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      CONFIG.boardIdentifier.should.equal('CLFL');
      CONFIG.boardVersion.should.equal(1);
    });
  });

  describe('given an MSP_CF_SERIAL_CONFIG message', function() {
    var payload = [1, 2, 3, 4, 5, 0, 0, 0, 6, 0, 0, 0, 7, 0, 0, 0, 8, 0, 0, 0];
    var message = {data:incoming.concat(20, MSP_codes.MSP_CF_SERIAL_CONFIG, payload, 42)};
    it('should create serial config', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      SERIAL_CONFIG.ports.length.should.equal(2);
      SERIAL_CONFIG.ports[0].identifier.should.equal(1);
      SERIAL_CONFIG.ports[0].scenario.should.equal(2);
      SERIAL_CONFIG.ports[1].identifier.should.equal(3);
      SERIAL_CONFIG.ports[1].scenario.should.equal(4);
      SERIAL_CONFIG.mspBaudRate.should.equal(5);
      SERIAL_CONFIG.cliBaudRate.should.equal(6);
      SERIAL_CONFIG.gpsBaudRate.should.equal(7);
      SERIAL_CONFIG.gpsPassthroughBaudRate.should.equal(8);
    });
  });

  describe('given an MSP_MODE_RANGES message', function() {
    var payload = [1, 2, 3, 4, 5, 6, 7, 8];
    var message = {data:incoming.concat(8, MSP_codes.MSP_MODE_RANGES, payload, 34)};
    it('should create mode ranges', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      MODE_RANGES.length.should.equal(2);
      MODE_RANGES[0].id.should.equal(1);
      MODE_RANGES[0].auxChannelIndex.should.equal(2);
      MODE_RANGES[0].range.start.should.equal(975);
      MODE_RANGES[0].range.end.should.equal(1000);
      MODE_RANGES[1].id.should.equal(5);
      MODE_RANGES[1].auxChannelIndex.should.equal(6);
      MODE_RANGES[1].range.start.should.equal(1075);
      MODE_RANGES[1].range.end.should.equal(1100);
    });
  });

  describe('given an MSP_ADJUSTMENT_RANGES message', function() {
    var payload = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    var message = {data:incoming.concat(12, MSP_codes.MSP_ADJUSTMENT_RANGES, payload, 52)};
    it('should create adjustment ranges', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      ADJUSTMENT_RANGES.length.should.equal(2);
      ADJUSTMENT_RANGES[0].slotIndex.should.equal(1);
      ADJUSTMENT_RANGES[0].auxChannelIndex.should.equal(2);
      ADJUSTMENT_RANGES[0].range.start.should.equal(975);
      ADJUSTMENT_RANGES[0].range.end.should.equal(1000);
      ADJUSTMENT_RANGES[0].adjustmentFunction.should.equal(5);
      ADJUSTMENT_RANGES[0].auxSwitchChannelIndex.should.equal(6);
      ADJUSTMENT_RANGES[1].slotIndex.should.equal(7);
      ADJUSTMENT_RANGES[1].auxChannelIndex.should.equal(8);
      ADJUSTMENT_RANGES[1].range.start.should.equal(1125);
      ADJUSTMENT_RANGES[1].range.end.should.equal(1150);
      ADJUSTMENT_RANGES[1].adjustmentFunction.should.equal(11);
      ADJUSTMENT_RANGES[1].auxSwitchChannelIndex.should.equal(12);
    });
  });

  describe('given an MSP_SERVO_CONF message followed by an MSP_CHANNEL_FORWARDING message', function() {
    var channel = [1, 0, 2, 0, 3, 0, 4];
    var payloadServoConf = channel.concat(channel, channel, channel, channel, channel, channel, channel);
    var messageServoConf = {data:incoming.concat(56, MSP_codes.MSP_SERVO_CONF, payloadServoConf, 64)};
    MSP.read(messageServoConf);

    var payload = [1, 2, 3, 4, 255, 255, 255, 255];
    var message = {data:incoming.concat(8, MSP_codes.MSP_CHANNEL_FORWARDING, payload, 44)};
    it('should set servo config correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      SERVO_CONFIG[0].indexOfChannelToForward.should.equal(1);
      SERVO_CONFIG[1].indexOfChannelToForward.should.equal(2);
      SERVO_CONFIG[2].indexOfChannelToForward.should.equal(3);
      SERVO_CONFIG[3].indexOfChannelToForward.should.equal(4);
      Should(SERVO_CONFIG[4].indexOfChannelToForward).undefined;
      Should(SERVO_CONFIG[5].indexOfChannelToForward).undefined;
      Should(SERVO_CONFIG[6].indexOfChannelToForward).undefined;
      Should(SERVO_CONFIG[7].indexOfChannelToForward).undefined;
    });
  });

  describe('given an MSP_LED_STRIP_CONFIG message', function() {
    var payload = [3, 0, 7, 0, 1, 2, 3];
    var message = {data:incoming.concat(7, MSP_codes.MSP_LED_STRIP_CONFIG, payload, 51)};
    it('should create the LED strip', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      LED_STRIP.length.should.equal(1);
      LED_STRIP[0].directions.should.eql(['n', 'e']);
      LED_STRIP[0].functions.should.eql(['i', 'w', 'f']);
      LED_STRIP[0].x.should.equal(1);
      LED_STRIP[0].y.should.equal(2);
      LED_STRIP[0].color.should.equal(3);
    });
  });

  describe('given an MSP_PID_CONTROLLER message', function() {
    var payload = [1];
    var message = {data:incoming.concat(1, MSP_codes.MSP_PID_CONTROLLER, payload, 59)};
    it('should set PID controller correctly', function() {
      MSP.read(message);
      MSP.packet_error.should.equal(0, 'packet error');
      PID.controller.should.equal(1);
    });
  });
});
