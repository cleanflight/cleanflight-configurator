'use strict';


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
            CHAR_WIDTH: 12
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

FONT.blocks = {
        logo: {
            data: [1,2,3,17,18,19],
            width: 3
        }
};

/**
 * Each line is composed of 8 ascii 1 or 0, representing 1 bit each for a total of 1 byte per line
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
    for (var i = 0; i < data.length; i++) {
        var line = data[i];
        // hexstring is for debugging
        FONT.data.hexstring.push('0x' + parseInt(line, 2).toString(16));
        // every 64 bytes (line) is a char, we're counting chars though, which are 2 bits
        if (character_bits.length == FONT.constants.SIZES.MAX_NVM_FONT_CHAR_FIELD_SIZE * (8 / 2)) {
            FONT.data.characters_bytes.push(character_bytes);
            FONT.data.characters.push(character_bits);
            FONT.draw(FONT.data.characters.length-1);
            //$log.debug('parsed char ', i, ' as ', character);
            character_bits = [];
            character_bytes = [];
        }
        for (var y = 0; y < 8; y = y + 2) {
            var v = parseInt(line.slice(y, y+2), 2);
            character_bits.push(v);
        }
        character_bytes.push(parseInt(line, 2));
    }
    FONT.drawBlock(FONT.blocks.logo);
    return FONT.data.characters;
};


FONT.openFontFile = function($preview) {
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
                    if ($preview) {
                        FONT.preview($preview);
                    }
                }
                var msg = 'could not load whole font file';
                console.error(msg);
            };
            reader.readAsText(file);
        });
    });
};

/**
 * returns a canvas image with the character on it
 */
var drawCanvas = function(charAddresses, block_width) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");

    // TODO: do we want to be able to set pixel size? going to try letting the consumer scale the image.
    var pixelSize = pixelSize || 1;
    var width = pixelSize * FONT.constants.SIZES.CHAR_WIDTH;
    var height = pixelSize * FONT.constants.SIZES.CHAR_HEIGHT;

    canvas.width = width;
    canvas.height = height;

    if (charAddresses.length != undefined) {
        canvas.width *= block_width;
        canvas.height *= (charAddresses.length / block_width);
    }

    var offsetX = 0;
    var offsetY = 0;

    function process(charAddress) {
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var v = FONT.data.characters[charAddress][(y*width)+x];
                ctx.fillStyle = FONT.constants.COLORS[v];
                ctx.fillRect(x + offsetX, y + offsetY, pixelSize, pixelSize);
            }
        }
    }

    if (charAddresses.length != undefined) {
        charAddresses.forEach(function(charAddress) {
            process(charAddress);
            offsetX += width;
            if (offsetX >= (block_width * width)) {
                offsetX = 0;
                offsetY += height;
            }
        });
    } else {
        process(charAddresses);
    }
    return canvas;
};

FONT.draw = function(charAddress) {
    var cached = FONT.data.character_image_urls[charAddress];
    if (!cached) {
        cached = FONT.data.character_image_urls[charAddress] = drawCanvas(charAddress, 1).toDataURL('image/png');
    }
    return cached;
};

FONT.drawBlock = function(block) {
    var charAddresses = block.data;
    var width = block.width;
    var cached = FONT.data.character_image_urls[block];
    if (!cached) {
        cached = FONT.data.character_image_urls[block] = drawCanvas(charAddresses, width).toDataURL('image/png');
    }
    return cached;
};
/*
FONT.msp = {
  encode: function(charAddress) {
    return [charAddress].concat(FONT.data.characters_bytes[charAddress].slice(0,FONT.constants.SIZES.MAX_NVM_FONT_CHAR_SIZE));
  }
};

FONT.upload = function($progress) {
  return Promise.mapSeries(FONT.data.characters, function(data, i) {
    $progress.val((i / FONT.data.characters.length) * 100);
    return MSP.promise(MSP_codes.MSP_OSD_CHAR_WRITE, FONT.msp.encode(i));
  })
  .then(function() {
    return MSP.promise(MSP_codes.MSP_SET_REBOOT);
  });
};
 */
FONT.preview = function($el) {
    $el.empty();
    FONT.data.character_image_urls.map(function(url) {
        $el.append('<img src='+url+'></img>');
    });
}

FONT.preview2 = function($el) {
    for (var i = 0; i < FONT.data.character_image_urls.length; i++) {
        if (i % 16 == 0 && i > 0)
            $el.append('</div>');
        if (i % 16 == 0)
            $el.append('<div class="font_text_row">');
        var url = FONT.data.character_image_urls[i];
        $el.append('<img src='+url+'></img>');
    }
    $el.append('</div>');
}

FONT.logo = function($el) {
    var url = FONT.data.character_image_urls[FONT.blocks.logo];
    $el.append('<img src=' + url + '></img>');

}

FONT.write = function($el, text) {
    if (text == undefined)
        return;
    for (var i = 0; i < text.length; i++) {
        var url = FONT.data.character_image_urls[text.charCodeAt(i)];
        $el.append('<img src=' + url + '></img>');
    }
}






var OSD = OSD || {};




//parsed fc output and output to fc, used by to OSD.msp.encode
OSD.initData = function() {
    OSD.data = {
            video_system: null,
            display_items: []
    };
};
OSD.initData();

OSD.constants = {
        VIDEO_TYPES: ['AUTO', 'PAL', 'NTSC'],
        VIDEO_LINES: {
            PAL: 16,
            NTSC: 13
        },
        VIDEO_BUFFER_CHARS: {
            PAL: 480,
            NTSC: 390
        },

        // order matters, so these are going in an array... pry could iterate the example map instead
        DISPLAY_FIELDS:
            [
             {
                 name: 'MAIN_BATT_VOLTAGE',
                 default_position_x: 0,
                 default_position_y: 0,
                 positionable: true,
                 default_value: 'BAT 11.7V' 
             },
             {
                 name: 'RSSI_VALUE',
                 default_position_x: 0,
                 default_position_y: 1,
                 positionable: true,
                 default_value: 'RSSI 87'
             },
             {
                 name: 'TIMER',
                 default_position_x: 12,
                 default_position_y: 0,
                 positionable: true,
                 default_value: '05:23'
             },
             {
                 name: 'THROTTLE_POS',
                 default_position_x: 18,
                 default_position_y: 0,
                 positionable: true,
                 default_value: 'THR 45'
             },
             {
                 name: 'CPU_LOAD',
                 default_position_x: 25,
                 default_position_y: 0,
                 positionable: true,
                 default_value: 'CPU 3'
             },
             {
                 name: 'VTX_CHANNEL',
                 default_position_x: 0,
                 default_position_y: 3,
                 positionable: true,
                 default_value: 'CHN 11'
             },
             {
                 name: 'VOLTAGE_WARNING',
                 default_position_x: 6,
                 default_position_y: 3,
                 positionable: true,
                 default_value: 'WRN 10.5 V'
             },
             {
                 name: 'ARMED',
                 default_position_x: 12,
                 default_position_y: 3,
                 positionable: true,
                 default_value: 'ARMED'
             },
             {
                 name: 'DISARMED',
                 default_position_x: 18,
                 default_position_y: 3,
                 positionable: true,
                 default_value: 'DISARMED'
             },
             {
                 name: 'ARTIFICIAL_HORIZON',
                 default_position_x: 12,
                 default_position_y: 7,
                 positionable: false,
                 default_value: 'HORIZON'
             },
             {
                 name: 'HORIZON_SIDEBARS',
                 default_position_x: 12,
                 default_position_y: 8,
                 positionable: false,
                 default_value: 'HOR BARS'
             },
             {
                 name: 'LOGO',
                 default_position_x: 12,
                 default_position_y: 8,
                 positionable: true,
                 default_value: 'FONT.logo'
             }
             ],
};


OSD.updateDisplaySize = function() {
    // compute the size
    OSD.data.display_size = {
            x: 18,
            y: OSD.constants.VIDEO_LINES[OSD.data.video_system]
    };
};

OSD.initTestData = function() {
    /*
    OSD.data = {
        video_system: 'PAL',
        display_items: []
    };
     */

    var d = OSD.data;
    d.compiled_in = 0;
    d.video_system = 1;
    d.display_items = [];
    // start at the offset from the other fields
    for (var j = 0; j < OSD.constants.DISPLAY_FIELDS.length; j++) {
        var c = OSD.constants.DISPLAY_FIELDS[j];
        d.display_items.push({
            name: c.name,
            index: j,
            position_x: c.default_position_x,
            position_y: c.default_position_y,
            positionable: c.positionable,
            default_value: c.default_value,
            visible: true
        });
    }
    OSD.updateDisplaySize();
};
OSD.initTestData();

/*
OSD.msp = {
    encodeOther: function() {
     return [-1, OSD.data.video_system];
    },
    encode: function(display_item) {
     return [
       display_item.index,
       specificByte(display_item.position, 0),
       specificByte(display_item.position, 1)
     ];
    },
    // Currently only parses MSP_MAX_OSD responses, add a switch on payload.code if more codes are handled
    decode: function(payload) {
     var view = payload.data;
     var d = OSD.data;
     d.compiled_in = view.getUint8(0, 1);
     d.video_system = view.getUint8(1, 1);
     d.display_items = [];
     // start at the offset from the other fields
     for (var i = 2; i < view.byteLength; i = i + 2) {
       var v = view.getInt16(i, 1)
       var j = d.display_items.length;
       var c = OSD.constants.DISPLAY_FIELDS[j];
       d.display_items.push({
         name: c.name,
         index: j,
         position: v,
         positionable: c.positionable
       });
     }
     OSD.updateDisplaySize();
    }
};
 */




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
        // 2 way binding... sorta
        function updateOsdView() {
            // ask for the OSD config data
            /*
            MSP.promise(MSP_codes.MSP_OSD_CONFIG)
                .then(function(info) {
                    if (!info.length) {
                        //$('.tab-osd .unsupported').fadeIn();;
                        //return;
                    }
                    $('.tab-osd .supported').fadeIn();;
                    OSD.msp.decode(info);
             */

            // video mode
            var $videoTypes = $('.video_format');
            $videoTypes.empty();
            $.each(OSD.constants.VIDEO_TYPES, function (i, item) {
                var type = OSD.constants.VIDEO_TYPES[i];
                $videoTypes.append($('<option>', {
                    value: i,
                    text : type
                }));
            });

            /*
            $videoTypes.find(':radio').click(function(e) {
              OSD.data.video_system = $(this).data('type');
              MSP.promise(MSP_codes.MSP_SET_OSD_CONFIG, OSD.msp.encodeOther())
              .then(function() {
                updateOsdView();
              });
            });*/

            // display fields on/off and position
            var $displayFields = $('.display-fields').empty();

            FONT.initData();

            for (let field of OSD.data.display_items) {
                var checked = (field.visible) ? 'checked' : '';
                var $field1 = $('<div class="elementselect" />');
                var $field2 = $('<div class="checkbox" />');
                var $field = $('<div class="numberspacer" />');
                $field.append(
                        $('<input type="checkbox" class="togglesmall" name="' + field.name + '" ' + checked + '></input>')
                        .data('field', field)
                        .change(function(e) {
                            var field = $(this).data('field');
                            field.visible = !field.visible;
                            UpdateAllBlocks();
                        })
                );
                $field2.append($field);
                $field2.append('<label for="' + field.name + '">' + field.name + '</label>');

                $field1.append($field2);


                $field1
                .mouseenter(function(e) {
                    var field = $(this).find('.checkbox').text();
                    $('.osd_canvas').find('.block_' + field).addClass('block_active');
                })
                .mouseleave(function(e) {
                    var field = $(this).find('.checkbox').text();
                    $('.osd_canvas').find('.block_' + field).removeClass('block_active');
                });

                $displayFields.append($field1);
            }

            UpdateAllBlocks();

            //});
        };

        function on_save_handler() {

        }

        //  init structs once, also clears current font
        var $preview = $('.font-preview');
        $preview.empty();

        // ' + $(this).data('font-file') + '
        FONT.initData();
        $.get('/resources/osd/cleanflight-font.mcm', function(data) {
            FONT.parseMCMFontFile(data);
            // FONT.preview($preview);
            // FONT.logo($preview);
            // FONT.preview2($preview);
        });



        $('a.save').click(on_save_handler);

        // status data pulled via separate timer with static speed
        GUI.interval_add('status_pull', function status_pull() {
            MSP.send_message(MSP_codes.MSP_STATUS);
        }, 250, true);



        updateOsdView();
        GUI.content_ready(callback);
    });

    function UpdateAllBlocks() 
    {
        var $canvas = $('.osd_canvas').empty();
        $.get('/resources/osd/cleanflight-font.mcm', function(data) {
            FONT.parseMCMFontFile(data);
            for (let field of OSD.data.display_items) {
                UpdateBlock(field);
            }
        });
    }

    function UpdateBlock(field) 
    {
        var $canvas = $('.osd_canvas');
        if (field.visible) {
            var $block = $('<div class="font_text_row block_' + field.name + '" />');
            $canvas.append($block);
            if (field.default_value == "FONT.logo")
                FONT.logo($block);
            else
                FONT.write($block, field.default_value);

            $block.draggable();
            $block.draggable("option", "grid", [ FONT.constants.SIZES.CHAR_WIDTH, FONT.constants.SIZES.CHAR_HEIGHT ]);
            $block.draggable({containment: "parent"});
            $block.offset({ 
                top: $canvas.offset().top + field.position_y * FONT.constants.SIZES.CHAR_HEIGHT, 
                left: $canvas.offset().left + field.position_x * FONT.constants.SIZES.CHAR_WIDTH
            });
            $block.bind('drag', function() {
                field.position_y = ($block.offset().top - $canvas.offset().top) / FONT.constants.SIZES.CHAR_HEIGHT;
                field.position_x = ($block.offset().left - $canvas.offset().left) / FONT.constants.SIZES.CHAR_WIDTH;
            });
        }
    }
};

TABS.osd.cleanup = function (callback) {
    PortHandler.flush_callbacks();

    // unbind "global" events
    $(document).unbind('keypress');
    $(document).off('click', 'span.progressLabel a');

    if (callback) callback();
};
