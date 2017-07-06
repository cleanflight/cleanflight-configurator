'use strict';

var SYM = SYM || {};
SYM.VOLT = 0x06;
SYM.RSSI = 0x01;
SYM.AH_RIGHT = 0x02;
SYM.AH_LEFT = 0x03;
SYM.THR = 0x04;
SYM.THR1 = 0x05;
SYM.FLY_M = 0x9C;
SYM.ON_M = 0x9B;
SYM.AH_CENTER_LINE = 0x26;
SYM.AH_CENTER_LINE_RIGHT = 0x27;
SYM.AH_CENTER = 0x7E;
SYM.AH_BAR9_0 = 0x80;
SYM.AH_DECORATION = 0x13;
SYM.LOGO = 0xA0;
SYM.AMP = 0x9A;
SYM.MAH = 0x07;
SYM.METRE = 0xC;
SYM.FEET = 0xF;
SYM.GPS_SAT = 0x1F;
SYM.BATTERY = 0x96;
SYM.TEMP_F = 0x0D;
SYM.TEMP_C = 0x0E;

// Direction arrows
SYM.ARROW_SOUTH = 0x60;
SYM.ARROW_2 = 0x61;
SYM.ARROW_3 = 0x62;
SYM.ARROW_4 = 0x63;
SYM.ARROW_EAST = 0x64;
SYM.ARROW_6 = 0x65;
SYM.ARROW_7 = 0x66;
SYM.ARROW_8 = 0x67;
SYM.ARROW_NORTH = 0x68;
SYM.ARROW_10 = 0x69;
SYM.ARROW_11 = 0x6A;
SYM.ARROW_12 = 0x6B;
SYM.ARROW_WEST = 0x6C;
SYM.ARROW_14 = 0x6D;
SYM.ARROW_15 = 0x6E;
SYM.ARROW_16 = 0x6F;

// Progress bar
SYM.PB_START = 0x8A;
SYM.PB_FULL  = 0x8B;
SYM.PB_HALF  = 0x8C;
SYM.PB_EMPTY = 0x8D;
SYM.PB_END   = 0x8E;
SYM.PB_CLOSE = 0x8F;

var FONT = FONT || {};

FONT.initData = function() {
  if (FONT.data) {
    return;
  }
  FONT.data = {
    // default font file name
    loaded_font_file: 'default',
    // array of arry of image bytes ready to upload to fc
    characters_bytes: [],
    // array of array of image bits by character
    characters: [],
    // an array of base64 encoded image strings by character
    character_image_urls: []
  }
};

FONT.constants = {
  SIZES: {
    /** NVM ram size for one font char, actual character bytes **/
    MAX_NVM_FONT_CHAR_SIZE: 54,
    /** NVM ram field size for one font char, last 10 bytes dont matter **/
    MAX_NVM_FONT_CHAR_FIELD_SIZE: 64,
    CHAR_HEIGHT: 18,
    CHAR_WIDTH: 12,
    LINE: 30
  },
  COLORS: {
    // black
    0: 'rgba(0, 0, 0, 1)',
    // also the value 3, could yield transparent according to
    // https://www.sparkfun.com/datasheets/BreakoutBoards/MAX7456.pdf
    1: 'rgba(255, 255, 255, 0)',
    // white
    2: 'rgba(255,255,255, 1)'
  }
};

/**
 * Each line is composed of 8 asci 1 or 0, representing 1 bit each for a total of 1 byte per line
 */
FONT.parseMCMFontFile = function(data) {
  var data = data.split("\n");
  // clear local data
  FONT.data.characters.length = 0;
  FONT.data.characters_bytes.length = 0;
  FONT.data.character_image_urls.length = 0;
  // make sure the font file is valid
  if (data.shift().trim() != 'MAX7456') {
    var msg = 'that font file doesnt have the MAX7456 header, giving up';
    console.debug(msg);
    Promise.reject(msg);
  }
  var character_bits = [];
  var character_bytes = [];
  // hexstring is for debugging
  FONT.data.hexstring = [];
  var pushChar = function() {
    FONT.data.characters_bytes.push(character_bytes);
    FONT.data.characters.push(character_bits);
    FONT.draw(FONT.data.characters.length-1);
    //$log.debug('parsed char ', i, ' as ', character);
    character_bits = [];
    character_bytes = [];
  };
  for (var i = 0; i < data.length; i++) {
    var line = data[i];
    // hexstring is for debugging
    FONT.data.hexstring.push('0x' + parseInt(line, 2).toString(16));
    // every 64 bytes (line) is a char, we're counting chars though, which are 2 bits
    if (character_bits.length == FONT.constants.SIZES.MAX_NVM_FONT_CHAR_FIELD_SIZE * (8 / 2)) {
      pushChar()
    }
    for (var y = 0; y < 8; y = y + 2) {
      var v = parseInt(line.slice(y, y+2), 2);
      character_bits.push(v);
    }
    character_bytes.push(parseInt(line, 2));
  }
  // push the last char
  pushChar();
  return FONT.data.characters;
};


FONT.openFontFile = function($preview) {
  return new Promise(function(resolve) {
    chrome.fileSystem.chooseEntry({type: 'openFile', accepts: [{extensions: ['mcm']}]}, function (fileEntry) {
      FONT.data.loaded_font_file = fileEntry.name;
      if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          return;
      }
      fileEntry.file(function (file) {
        var reader = new FileReader();
        reader.onloadend = function(e) {
          if (e.total != 0 && e.total == e.loaded) {
            FONT.parseMCMFontFile(e.target.result);
            resolve();
          }
          else {
            console.error('could not load whole font file');
          }
        };
        reader.readAsText(file);
      });
    });
  });
};

/**
 * returns a canvas image with the character on it
 */
var drawCanvas = function(charAddress) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext("2d");

  // TODO: do we want to be able to set pixel size? going to try letting the consumer scale the image.
  var pixelSize = pixelSize || 1;
  var width = pixelSize * FONT.constants.SIZES.CHAR_WIDTH;
  var height = pixelSize * FONT.constants.SIZES.CHAR_HEIGHT;

  canvas.width = width;
  canvas.height = height;

  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      if (!(charAddress in FONT.data.characters)) {
        console.log('charAddress', charAddress, ' is not in ', FONT.data.characters.length);
      }
      var v = FONT.data.characters[charAddress][(y*width)+x];
      ctx.fillStyle = FONT.constants.COLORS[v];
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }
  return canvas;
};

FONT.draw = function(charAddress) {
  var cached = FONT.data.character_image_urls[charAddress];
  if (!cached) {
    cached = FONT.data.character_image_urls[charAddress] = drawCanvas(charAddress).toDataURL('image/png');
  }
  return cached;
};

FONT.msp = {
  encode: function(charAddress) {
    return [charAddress].concat(FONT.data.characters_bytes[charAddress].slice(0,FONT.constants.SIZES.MAX_NVM_FONT_CHAR_SIZE));
  }
};

FONT.upload = function($progress) {
  return Promise.mapSeries(FONT.data.characters, function(data, i) {
    $progress.val((i / FONT.data.characters.length) * 100);
    return MSP.promise(MSPCodes.MSP_OSD_CHAR_WRITE, FONT.msp.encode(i));
  })
  .then(function() {
    OSD.GUI.jbox.close();
    return MSP.promise(MSPCodes.MSP_SET_REBOOT);
  });
};

FONT.preview = function($el) {
  $el.empty()
  for (var i = 0; i < SYM.LOGO; i++) {
    var url = FONT.data.character_image_urls[i];
    $el.append('<img src="'+url+'" title="0x'+i.toString(16)+'"></img>');
  }
};

FONT.symbol = function(hexVal) {
  return String.fromCharCode(hexVal);
};

var OSD = OSD || {};

OSD.pos = function(x, y, visible) {
  var OSD_POS_BITS = 5;

  var visibleFlag = 0;

  if (visible === undefined || visible === null) {
    visibleFlag = 0x800
  } else {
    visibleFlag = visible ? 0x800 : 0;
  }

  return ((x) & 0x1F) | ((y << OSD_POS_BITS) & 0x1F) | visibleFlag;
}

// parsed fc output and output to fc, used by to OSD.msp.encode
OSD.initData = function() {
  OSD.data = {
    video_system: null,
    unit_mode: null,
    alarms: [],
    display_items: [],
    last_positions: {},
    preview_logo: false,
    preview: []
  };
};
OSD.initData();

OSD.constants = {
  VISIBLE: 0x0800,
  VIDEO_TYPES: [
    'AUTO',
    'PAL',
    'NTSC'
  ],
  VIDEO_LINES: {
    PAL: 16,
    NTSC: 13
  },
  VIDEO_BUFFER_CHARS: {
    PAL: 480,
    NTSC: 390
  },
  UNIT_TYPES: [
    'IMPERIAL',
    'METRIC'
  ],
  AHISIDEBARWIDTHPOSITION: 7,
  AHISIDEBARHEIGHTPOSITION: 3,

  // All display fields, from every version, do not remove elements, only add!
  ALL_DISPLAY_FIELDS: {
    MAIN_BATT_VOLTAGE: {
      name: 'MAIN_BATT_VOLTAGE',
      default_position: -29,
      positionable: true,
      preview: FONT.symbol(SYM.BATTERY) + '16.8' + FONT.symbol(SYM.VOLT)
    },
    RSSI_VALUE: {
      name: 'RSSI_VALUE',
      default_position: -59,
      positionable: true,
      preview: FONT.symbol(SYM.RSSI) + '99'
    },
    TIMER: {
      name: 'TIMER',
      default_position: -39,
      positionable: true,
      preview: FONT.symbol(SYM.ON_M) + ' 11:11'
    },
    THROTTLE_POSITION: {
      name: 'THROTTLE_POSITION',
      default_position: -9,
      positionable: true,
      preview: FONT.symbol(SYM.THR) + FONT.symbol(SYM.THR1) + '69'
    },
    CPU_LOAD: {
      name: 'CPU_LOAD',
      default_position: 26,
      positionable: true,
      preview: '15'
    },
    VTX_CHANNEL: {
      name: 'VTX_CHANNEL',
      default_position: 1,
      positionable: true,
      preview: 'R:2:0'
    },
    VOLTAGE_WARNING: {
      name: 'VOLTAGE_WARNING',
      default_position: -80,
      positionable: true,
      preview: 'LOW VOLTAGE'
    },
    ARMED: {
      name: 'ARMED',
      default_position: -107,
      positionable: true,
      preview: 'ARMED'
    },
    DISARMED: {
      name: 'DISARMED',
      default_position: -109,
      positionable: true,
      preview: 'DISARMED'
    },
    CROSSHAIRS: {
      name: 'CROSSHAIRS',
      default_position: -1,
      positionable: false
    },
    ARTIFICIAL_HORIZON: {
      name: 'ARTIFICIAL_HORIZON',
      default_position: -1,
      positionable: false
    },
    HORIZON_SIDEBARS: {
      name: 'HORIZON_SIDEBARS',
      default_position: -1,
      positionable: false
    },
    CURRENT_DRAW: {
      name: 'CURRENT_DRAW',
      default_position: -23,
      positionable: true,
      preview: FONT.symbol(SYM.AMP) + '42.0'
    },
    MAH_DRAWN: {
      name: 'MAH_DRAWN',
      default_position: -18,
      positionable: true,
      preview: FONT.symbol(SYM.MAH) + '690'
    },
    CRAFT_NAME: {
      name: 'CRAFT_NAME',
      default_position: -77,
      positionable: true,
      preview: 'CRAFT_NAME'
    },
    ALTITUDE: {
      name: 'ALTITUDE',
      default_position: 62,
      positionable: true,
      preview: function(osd_data) {
        return '399.7' + FONT.symbol(osd_data.unit_mode === 0 ? SYM.FEET : SYM.METRE)
      }
    },
    ONTIME: {
      name: 'ONTIME',
      default_position: -1,
      positionable: true,
      preview: FONT.symbol(SYM.ON_M) + '05:42'
    },
    FLYTIME: {
      name: 'FLYTIME',
      default_position: -1,
      positionable: true,
      preview: FONT.symbol(SYM.FLY_M) + '04:11'
    },
    FLYMODE: {
      name: 'FLYMODE',
      default_position: -1,
      positionable: true,
      preview: 'STAB'
    },
    GPS_SPEED: {
      name: 'GPS_SPEED',
      default_position: -1,
      positionable: true,
      preview: '40K'
    },
    GPS_SATS: {
      name: 'GPS_SATS',
      default_position: -1,
      positionable: true,
      preview: FONT.symbol(SYM.GPS_SAT) + '14'
    },
    PID_ROLL: {
      name: 'PID_ROLL',
      default_position: 0x800 | (10 << 5) | 2, // 0x0800 | (y << 5) | x
      positionable: true,
      preview: 'ROL  43  40  20'
    },
    PID_PITCH: {
      name: 'PID_PITCH',
      default_position: 0x800 | (11 << 5) | 2, // 0x0800 | (y << 5) | x
      positionable: true,
      preview: 'PIT  58  50  22'
    },
    PID_YAW: {
      name: 'PID_YAW',
      default_position: 0x800 | (12 << 5) | 2, // 0x0800 | (y << 5) | x
      positionable: true,
      preview: 'YAW  70  45  20'
    },
    POWER: {
      name: 'POWER',
      default_position: (15 << 5) | 2,
      positionable: true,
      preview: '142W'
    },
    PID_RATE_PROFILE: {
      name: 'PID_RATE_PROFILE',
      default_position: 0x800 | (13 << 5) | 2, // 0x0800 | (y << 5) | x
      positionable: true,
      preview: '1-2'
    },
    BATTERY_WARNING: {
      name: 'BATTERY_WARNING',
      default_position: -1,
      positionable: true,
      preview: 'LOW VOLTAGE'
    },
    AVG_CELL_VOLTAGE: {
      name: 'AVG_CELL_VOLTAGE',
      default_position: 12 << 5,
      positionable: true,
      preview: FONT.symbol(SYM.BATTERY) + '3.98' + FONT.symbol(SYM.VOLT)
    },
    DEBUG: {
      name: 'DEBUG',
      default_position: OSD.pos(1, 0),
      positionable: true,
      preview: 'DBG 12345 67890 98765 43210'
    },
    PITCH_ANGLE: {
      name: 'PITCH_ANGLE',
      default_position: OSD.pos(1, 8),
      positionable: true,
      preview: '-25.7'
    },
    ROLL_ANGLE: {
      name: 'ROLL_ANGLE',
      default_position: OSD.pos(1, 9),
      positionable: true,
      preview: '-13.3'
    },
    GPS_LAT: {
      name: 'GPS_LAT',
      default_position: OSD.pos(1, 2),
      positionable: true,
      preview: FONT.symbol(SYM.ARROW_EAST) + '50.1234567'
    },
    GPS_LON: {
      name: 'GPS_LON',
      default_position: OSD.pos(18, 2),
      positionable: true,
      preview: FONT.symbol(SYM.ARROW_SOUTH) + '19.1234567'
    },
    MAIN_BATT_USAGE: {
      name: 'MAIN_BATT_USAGE',
      default_position: OSD.pos(8, 12),
      positionable: true,
      preview:
        FONT.symbol(SYM.PB_START) +
        FONT.symbol(SYM.PB_FULL) + FONT.symbol(SYM.PB_FULL) +
        FONT.symbol(SYM.PB_FULL) + FONT.symbol(SYM.PB_FULL) +
        FONT.symbol(SYM.PB_FULL) + FONT.symbol(SYM.PB_FULL) +
        FONT.symbol(SYM.PB_EMPTY) + FONT.symbol(SYM.PB_EMPTY) +
        FONT.symbol(SYM.PB_EMPTY) + FONT.symbol(SYM.PB_EMPTY) +
        FONT.symbol(SYM.PB_EMPTY) +
        FONT.symbol(SYM.PB_CLOSE)
    },
    ARMED_TIME: {
      name: 'ARMED_TIME',
      default_position: OSD.pos(1, 2),
      positionable: true,
      preview: FONT.symbol(SYM.FLY_M) + '04:11'
    },
    DISARMED_V1_32: {
      name: 'DISARMED',
      default_position: OSD.pos(11, 4),
      positionable: true,
      preview: 'DISARMED'
    },
    ESC_TMP: {
      name: 'ESC_TEMPERATURE',
      default_position: OSD.pos(1, 14),
      positionable: true,
      preview: FONT.symbol(SYM.TEMP_C) + '31'
    },
    ESC_RPM: {
      name: 'ESC_SPEED',
      default_position: OSD.pos(1, 15),
      positionable: true,
      preview: '12345'
    }
  }
};

// Pick display fields by version, order matters, so these are going in an array... pry could iterate the example map instead
OSD.chooseFields = function () {
  var F = OSD.constants.ALL_DISPLAY_FIELDS;
  // version 3.0.1
  if (semver.gte(CONFIG.apiVersion, "1.21.0")) {
    OSD.constants.DISPLAY_FIELDS = [
      F.RSSI_VALUE,
      F.MAIN_BATT_VOLTAGE,
      F.CROSSHAIRS,
      F.ARTIFICIAL_HORIZON,
      F.HORIZON_SIDEBARS,
      F.ONTIME,
      F.FLYTIME,
      F.FLYMODE,
      F.CRAFT_NAME,
      F.THROTTLE_POSITION,
      F.VTX_CHANNEL,
      F.CURRENT_DRAW,
      F.MAH_DRAWN,
      F.GPS_SPEED,
      F.GPS_SATS,
      F.ALTITUDE
    ];
    if (semver.gte(CONFIG.apiVersion, "1.31.0")) {
      OSD.constants.DISPLAY_FIELDS = OSD.constants.DISPLAY_FIELDS.concat([
        F.PID_ROLL,
        F.PID_PITCH,
        F.PID_YAW,
        F.POWER
      ]);
      if (semver.gte(CONFIG.apiVersion, "1.32.0")) {
        OSD.constants.DISPLAY_FIELDS = OSD.constants.DISPLAY_FIELDS.concat([
          F.PID_RATE_PROFILE,
          F.BATTERY_WARNING,
          F.AVG_CELL_VOLTAGE,
          F.GPS_LON,
          F.GPS_LAT,
          F.DEBUG,
          F.PITCH_ANGLE,
          F.ROLL_ANGLE,
          F.MAIN_BATT_USAGE,
          F.ARMED_TIME,
          F.DISARMED_V1_32,
          F.ESC_TMP,
          F.ESC_RPM
        ]);
      }
    }
  }
  // version 3.0.0
  else {
    OSD.constants.DISPLAY_FIELDS = [
      F.MAIN_BATT_VOLTAGE,
      F.RSSI_VALUE,
      F.TIMER,
      F.THROTTLE_POSITION,
      F.CPU_LOAD,
      F.VTX_CHANNEL,
      F.VOLTAGE_WARNING,
      F.ARMED,
      F.DISARMED,
      F.ARTIFICIAL_HORIZON,
      F.HORIZON_SIDEBARS,
      F.CURRENT_DRAW,
      F.MAH_DRAWN,
      F.CRAFT_NAME,
      F.ALTITUDE
    ];
  }
};

OSD.updateDisplaySize = function() {
  var video_type = OSD.constants.VIDEO_TYPES[OSD.data.video_system];
  if (video_type == 'AUTO') {
    video_type = 'PAL';
  }
  // compute the size
  OSD.data.display_size = {
    x: FONT.constants.SIZES.LINE,
    y: OSD.constants.VIDEO_LINES[video_type],
    total: null
  };
};


OSD.msp = {
  /**
   * Note, unsigned 16 bit int for position ispacked:
   * 0: unused
   * v: visible flag
   * b: blink flag
   * y: y coordinate
   * x: x coordinate
   * 0000 vbyy yyyx xxxx
   */
  helpers: {
    unpack: {
      position: function(bits, c) {
        var display_item = {};
        if (semver.gte(CONFIG.apiVersion, "1.21.0")) {
          // size * y + x
          display_item.position = FONT.constants.SIZES.LINE * ((bits >> 5) & 0x001F) + (bits & 0x001F);
          display_item.isVisible = (bits & OSD.constants.VISIBLE) != 0;
        } else {
          display_item.position = (bits === -1) ? c.default_position : bits;
          display_item.isVisible = bits !== -1;
        }
        return display_item;
      }
    },
    pack: {
      position: function(display_item) {
        var isVisible = display_item.isVisible;
        var position = display_item.position;
        if (semver.gte(CONFIG.apiVersion, "1.21.0")) {
          return (isVisible ? 0x0800 : 0) | (((position / FONT.constants.SIZES.LINE) & 0x001F) << 5) | (position % FONT.constants.SIZES.LINE);
        } else {
          return isVisible ? (position == -1 ? 0 : position): -1;
        }
      }
    }
  },
  encodeOther: function() {
    var result = [-1, OSD.data.video_system];
    if (OSD.data.state.haveOsdFeature && semver.gte(CONFIG.apiVersion, "1.21.0")) {
      result.push8(OSD.data.unit_mode);
      // watch out, order matters! match the firmware
      result.push8(OSD.data.alarms.rssi.value);
      result.push16(OSD.data.alarms.cap.value);
      result.push16(OSD.data.alarms.time.value);
      result.push16(OSD.data.alarms.alt.value);
    }
    return result;
  },
  encode: function(display_item) {
    var buffer = [];
    buffer.push8(display_item.index);
    buffer.push16(this.helpers.pack.position(display_item));
    return buffer;
  },
  // Currently only parses MSP_MAX_OSD responses, add a switch on payload.code if more codes are handled
  decode: function(payload) {
    var view = payload.data;
    var d = OSD.data;
    d.flags = view.readU8();
    
    if (d.flags > 0) {
      if (payload.length > 1) {
        d.video_system = view.readU8();
        if (semver.gte(CONFIG.apiVersion, "1.21.0") && bit_check(d.flags, 0)) {
          d.unit_mode = view.readU8();
          d.alarms = {};
          d.alarms['rssi'] = { display_name: 'Rssi', value: view.readU8() };
          d.alarms['cap']= { display_name: 'Capacity', value: view.readU16() };
          d.alarms['time'] = { display_name: 'Minutes', value: view.readU16() };
          d.alarms['alt'] = { display_name: 'Altitude', value: view.readU16() };
        }
      }
    }
    
    d.state = {};
    d.state.haveSomeOsd = (d.flags != 0) 
    d.state.haveMax7456Video = bit_check(d.flags, 4) || (d.flags == 1 && semver.lt(CONFIG.apiVersion, "1.34.0"));
    d.state.haveOsdFeature = bit_check(d.flags, 0) || (d.flags == 1 && semver.lt(CONFIG.apiVersion, "1.34.0"));
    d.state.isOsdSlave = bit_check(d.flags, 1) && semver.gte(CONFIG.apiVersion, "1.34.0");

    d.display_items = [];
    
    // start at the offset from the other fields
    while (view.offset < view.byteLength && d.display_items.length < OSD.constants.DISPLAY_FIELDS.length) {
      var v = null;
      if (semver.gte(CONFIG.apiVersion, "1.21.0")) {
        v = view.readU16();
      } else {
        v = view.read16();
      }
      var j = d.display_items.length;
      var c = OSD.constants.DISPLAY_FIELDS[j];
      d.display_items.push($.extend({
        name: c.name,
        index: j,
        positionable: c.positionable,
        preview: typeof(c.preview) === 'function' ? c.preview(d) : c.preview
      }, this.helpers.unpack.position(v, c)));
    }
    OSD.updateDisplaySize();
  }
};

OSD.GUI = {};
OSD.GUI.preview = {
  onMouseEnter: function() {
    if (!$(this).data('field')) { return; }
    $('.field-'+$(this).data('field').index).addClass('mouseover')
  },
  onMouseLeave: function() {
    if (!$(this).data('field')) { return; }
    $('.field-'+$(this).data('field').index).removeClass('mouseover')
  },
  onDragStart: function(e) {
    var ev = e.originalEvent;
    ev.dataTransfer.setData("text/plain", $(ev.target).data('field').index);
    ev.dataTransfer.setDragImage($(this).data('field').preview_img, 6, 9);
  },
  onDragOver: function(e) {
    var ev = e.originalEvent;
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move"
    $(this).css({
      background: 'rgba(0,0,0,.5)'
    });
  },
  onDragLeave: function(e) {
    // brute force unstyling on drag leave
    $(this).removeAttr('style');
  },
  onDrop: function(e) {
    var ev = e.originalEvent;
    var position = $(this).removeAttr('style').data('position');
    var field_id = parseInt(ev.dataTransfer.getData('text'))
    var display_item = OSD.data.display_items[field_id];
    var overflows_line = FONT.constants.SIZES.LINE - ((position % FONT.constants.SIZES.LINE) + display_item.preview.length);
    if (overflows_line < 0) {
      position += overflows_line;
    }
    if (semver.gte(CONFIG.apiVersion, "1.21.0")) {
      // unsigned now
    } else {
      if (position > OSD.data.display_size.total/2) {
        position = position - OSD.data.display_size.total;
      }
    }
    $('input.'+field_id+'.position').val(position).change();
  },
};


TABS.osd = {};
TABS.osd.initialize = function (callback) {
    var self = this;

    if (GUI.active_tab != 'osd') {
        GUI.active_tab = 'osd';
    }

    $('#content').load("./tabs/osd.html", function () {
        // translate to user-selected language
        localize();

        // Open modal window
        OSD.GUI.jbox = new jBox('Modal', {
            width: 800,
            height: 240,
            closeButton: 'title',
            animation: false,
            attach: $('#fontmanager'),
            title: 'OSD Font Manager',
            content: $('#fontmanagercontent')
        });

        // 2 way binding... sorta
        function updateOsdView() {
          // ask for the OSD config data
          MSP.promise(MSPCodes.MSP_OSD_CONFIG)
          .then(function(info) {
            OSD.chooseFields();
            OSD.msp.decode(info);

            if (OSD.data.state.haveSomeOsd == 0) {
              $('.unsupported').fadeIn();
              return;
            }
            $('.supported').fadeIn();

            // show Betaflight logo in preview
            var $previewLogo = $('.preview-logo').empty();
            $previewLogo.append(
              $('<label for="preview-logo">Logo: </label><input type="checkbox" name="preview-logo" class="togglesmall"></input>')
              .attr('checked', OSD.data.preview_logo)
              .change(function(e) {
                OSD.data.preview_logo = $(this).attr('checked') == undefined;
                updateOsdView();
              })
            );

            // video mode
            var $videoTypes = $('.video-types').empty();
            for (var i = 0; i < OSD.constants.VIDEO_TYPES.length; i++) {
              var type = OSD.constants.VIDEO_TYPES[i];
              var $checkbox = $('<label/>').append($('<input name="video_system" type="radio"/>'+type+'</label>')
                .prop('checked', i === OSD.data.video_system)
                .data('type', type)
                .data('type', i)
              );
              $videoTypes.append($checkbox);
            }
            $videoTypes.find(':radio').click(function(e) {
              OSD.data.video_system = $(this).data('type');
              MSP.promise(MSPCodes.MSP_SET_OSD_CONFIG, OSD.msp.encodeOther())
              .then(function() {
                updateOsdView();
              });
            });

            if (semver.gte(CONFIG.apiVersion, "1.21.0")) {
              // units
              $('.units-container').show();
              var $unitMode = $('.units').empty();
              for (var i = 0; i < OSD.constants.UNIT_TYPES.length; i++) {
                var type = OSD.constants.UNIT_TYPES[i];
                var $checkbox = $('<label/>').append($('<input name="unit_mode" type="radio"/>'+type+'</label>')
                  .prop('checked', i === OSD.data.unit_mode)
                  .data('type', type)
                  .data('type', i)
                );
                $unitMode.append($checkbox);
              }
              $unitMode.find(':radio').click(function(e) {
                OSD.data.unit_mode = $(this).data('type');
                MSP.promise(MSPCodes.MSP_SET_OSD_CONFIG, OSD.msp.encodeOther())
                .then(function() {
                  updateOsdView();
                });
              });
              // alarms
              $('.alarms-container').show();
              var $alarms = $('.alarms').empty();
              for (let k in OSD.data.alarms) {
                var alarm = OSD.data.alarms[k];
                var alarmInput = $('<input name="alarm" type="number" id="'+k+'"/>'+alarm.display_name+'</label>');
                alarmInput.val(alarm.value);
                alarmInput.blur(function(e) {
                  OSD.data.alarms[$(this)[0].id].value = $(this)[0].value;
                  MSP.promise(MSPCodes.MSP_SET_OSD_CONFIG, OSD.msp.encodeOther())
                  .then(function() {
                    updateOsdView();
                  });
                });
                var $input = $('<label/>').append(alarmInput);
                $alarms.append($input);
              }
            }
            
            if (!OSD.data.state.haveMax7456Video) {
              $('.requires-max7456').hide();
            }

            if (!OSD.data.state.haveOsdFeature) {
              $('.requires-osd-feature').hide();
            }

            // display fields on/off and position
            var $displayFields = $('.display-fields').empty();
            for (let field of OSD.data.display_items) {
              // versioning related, if the field doesn't exist at the current flight controller version, just skip it
              if (!field.name) { continue; }

              var checked = field.isVisible ? 'checked' : '';
              var $field = $('<div class="display-field field-'+field.index+'"/>');
              $field.append(
                $('<input type="checkbox" name="'+field.name+'" class="togglesmall"></input>')
                .data('field', field)
                .attr('checked', field.isVisible)
                .change(function(e) {
                  var field = $(this).data('field');
                  var $position = $(this).parent().find('.position.'+field.name);
                  field.isVisible = !field.isVisible;
                  if (field.isVisible) {
                    $position.show();
                  } else {
                    $position.hide();
                  }
                  MSP.promise(MSPCodes.MSP_SET_OSD_CONFIG, OSD.msp.encode(field))
                  .then(function() {
                    updateOsdView();
                  });
                })
              );
              $field.append('<label for="'+field.name+'" class="char-label">'+inflection.titleize(field.name)+'</label>');
              if (field.positionable && field.isVisible) {
                $field.append(
                  $('<input type="number" class="'+field.index+' position"></input>')
                  .data('field', field)
                  .val(field.position)
                  .change($.debounce(250, function(e) {
                    var field = $(this).data('field');
                    var position = parseInt($(this).val());
                    field.position = position;
                    MSP.promise(MSPCodes.MSP_SET_OSD_CONFIG, OSD.msp.encode(field))
                    .then(function() {
                      updateOsdView();
                    });
                  }))
                );
              }
              $displayFields.append($field);
            }
            GUI.switchery();
            // buffer the preview
            OSD.data.preview = [];
            OSD.data.display_size.total = OSD.data.display_size.x * OSD.data.display_size.y;
            for(let field of OSD.data.display_items) {
              // reset fields that somehow end up off the screen
              if (field.position > OSD.data.display_size.total) {
                field.position = 0;
              }
            }
            // clear the buffer
            for(var i = 0; i < OSD.data.display_size.total; i++) {
              OSD.data.preview.push([null, ' '.charCodeAt(0)]);
            }
            // logo first, so it gets overwritten by subsequent elements
            if (OSD.data.preview_logo) {
              var x = 160;
              for (var i = 1; i < 5; i++) {
                for (var j = 3; j < 27; j++)
                    OSD.data.preview[i * 30 + j] = [{name: 'LOGO', positionable: false}, x++];
              }
            }
            // draw all the displayed items and the drag and drop preview images
            for(let field of OSD.data.display_items) {
              if (!field.preview || !field.isVisible) { continue; }
              var j = (field.position >= 0) ? field.position : field.position + OSD.data.display_size.total;
              // create the preview image
              field.preview_img = new Image();
              var canvas = document.createElement('canvas');
              var ctx = canvas.getContext("2d");
              // fill the screen buffer
              for(var i = 0; i < field.preview.length; i++) {
                var charCode = field.preview.charCodeAt(i);
                OSD.data.preview[j++] = [field, charCode];
                // draw the preview
                var img = new Image();
                img.src = FONT.draw(charCode);
                ctx.drawImage(img, i*12, 0);
              }
              field.preview_img.src = canvas.toDataURL('image/png');
            }
            var centerishPosition = 194;
            // artificial horizon
            if ($('input[name="ARTIFICIAL_HORIZON"]').prop('checked')) {
              for (var i = 0; i < 9; i++) {
                OSD.data.preview[centerishPosition - 4 + i] = SYM.AH_BAR9_0 + 4;
              }
            }
            // crosshairs
            if ($('input[name="CROSSHAIRS"]').prop('checked')) {
              OSD.data.preview[centerishPosition - 1] = SYM.AH_CENTER_LINE;
              OSD.data.preview[centerishPosition + 1] = SYM.AH_CENTER_LINE_RIGHT;
              OSD.data.preview[centerishPosition]     = SYM.AH_CENTER;
            }
            // sidebars
            if ($('input[name="HORIZON_SIDEBARS"]').prop('checked')) {
              var hudwidth  = OSD.constants.AHISIDEBARWIDTHPOSITION;
              var hudheight = OSD.constants.AHISIDEBARHEIGHTPOSITION;
              for (var i = -hudheight; i <= hudheight; i++) {
                OSD.data.preview[centerishPosition - hudwidth + (i * FONT.constants.SIZES.LINE)] = SYM.AH_DECORATION;
                OSD.data.preview[centerishPosition + hudwidth + (i * FONT.constants.SIZES.LINE)] = SYM.AH_DECORATION;
              }
              // AH level indicators
              OSD.data.preview[centerishPosition-hudwidth+1] =  SYM.AH_LEFT;
              OSD.data.preview[centerishPosition+hudwidth-1] =  SYM.AH_RIGHT;
            }
            // render
            var $preview = $('.display-layout .preview').empty();
            var $row = $('<div class="row"/>');
            for(var i = 0; i < OSD.data.display_size.total;) {
              var charCode = OSD.data.preview[i];
              if (typeof charCode === 'object') {
                var field = OSD.data.preview[i][0];
                var charCode = OSD.data.preview[i][1];
              }
              var $img = $('<div class="char"><img src='+FONT.draw(charCode)+'></img></div>')
                .on('mouseenter', OSD.GUI.preview.onMouseEnter)
                .on('mouseleave', OSD.GUI.preview.onMouseLeave)
                .on('dragover', OSD.GUI.preview.onDragOver)
                .on('dragleave', OSD.GUI.preview.onDragLeave)
                .on('drop', OSD.GUI.preview.onDrop)
                .data('field', field)
                .data('position', i);
              if (field && field.positionable) {
                $img
                  .addClass('field-'+field.index)
                  .data('field', field)
                  .prop('draggable', true)
                  .on('dragstart', OSD.GUI.preview.onDragStart);
              }
              else {
              }
              $row.append($img);
              if (++i % OSD.data.display_size.x == 0) {
                $preview.append($row);
                $row = $('<div class="row"/>');
              }
            }
          });
        };

        $('a.save').click(function() {
          var self = this;
          MSP.promise(MSPCodes.MSP_EEPROM_WRITE);
          GUI.log('OSD settings saved');
          var oldText = $(this).text();
          $(this).html("Saved");
          setTimeout(function () {
              $(self).html(oldText);
          }, 2000);
        });

        // font preview window
        var $preview = $('.font-preview');

        //  init structs once, also clears current font
        FONT.initData();

        var $fontPicker = $('.fontbuttons button');
        $fontPicker.click(function(e) {
          if (!$(this).data('font-file')) { return; }
          $fontPicker.removeClass('active');
          $(this).addClass('active');
          $.get('/resources/osd/' + $(this).data('font-file') + '.mcm', function(data) {
            FONT.parseMCMFontFile(data);
            FONT.preview($preview);
            updateOsdView();
          });
        });

        // load the first font when we change tabs
        $fontPicker.first().click();

        $('button.load_font_file').click(function() {
          $fontPicker.removeClass('active');
          FONT.openFontFile().then(function() {
            FONT.preview($preview);
            updateOsdView();
          });
        });

        // font upload
        $('a.flash_font').click(function () {
            if (!GUI.connect_lock) { // button disabled while flashing is in progress
                $('.progressLabel').text('Uploading...');
                FONT.upload($('.progress').val(0)).then(function() {
                    var msg = 'Uploaded all ' + FONT.data.characters.length + ' characters';
                    console.log(msg);
                    $('.progressLabel').text(msg);
                });
            }
        });

        $(document).on('click', 'span.progressLabel a.save_font', function () {
            chrome.fileSystem.chooseEntry({type: 'saveFile', suggestedName: 'baseflight', accepts: [{extensions: ['mcm']}]}, function (fileEntry) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    return;
                }

                chrome.fileSystem.getDisplayPath(fileEntry, function (path) {
                    console.log('Saving firmware to: ' + path);

                    // check if file is writable
                    chrome.fileSystem.isWritableEntry(fileEntry, function (isWritable) {
                        if (isWritable) {
                            var blob = new Blob([intel_hex], {type: 'text/plain'});

                            fileEntry.createWriter(function (writer) {
                                var truncated = false;

                                writer.onerror = function (e) {
                                    console.error(e);
                                };

                                writer.onwriteend = function() {
                                    if (!truncated) {
                                        // onwriteend will be fired again when truncation is finished
                                        truncated = true;
                                        writer.truncate(blob.size);

                                        return;
                                    }
                                };

                                writer.write(blob);
                            }, function (e) {
                                console.error(e);
                            });
                        } else {
                            console.log('You don\'t have write permissions for this file, sorry.');
                            GUI.log('You don\'t have <span style="color: red">write permissions</span> for this file');
                        }
                    });
                });
            });
        });

        $(document).keypress(function (e) {
            if (e.which == 13) { // enter
                // Trigger regular Flashing sequence
                $('a.flash_font').click();
            }
        });

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
