'use strict';


var OSD = OSD || {};



TABS.osd = {};
TABS.osd.initialize = function (callback) {
    var self = this;

    if (GUI.active_tab != 'osd') {
        GUI.active_tab = 'osd';
    }

    $('#content').load("./tabs/osd.html", function () {
        // translate to user-selected language
        localize();

        // 2 way binding... sorta
        function updateOsdView() {
          // ask for the OSD config data
          MSP.promise(MSP_codes.MSP_OSD_CONFIG)
          .then(function(info) {
            if (!info.length) {
              $('.tab-osd .unsupported').fadeIn();;
              return;
            }
            $('.tab-osd .supported').fadeIn();;
            OSD.msp.decode(info);
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
              MSP.promise(MSP_codes.MSP_SET_OSD_CONFIG, OSD.msp.encodeOther())
              .then(function() {
                updateOsdView();
              });
            });

            // display fields on/off and position
            var $displayFields = $('.display-fields').empty();
            for (let field of OSD.data.display_items) {
              var checked = (-1 != field.position) ? 'checked' : '';
              //$displayFields.append('<input type="checkbox" data-field-index="'+field.index+'" '+checked+'>'+field.name+'</input>');
              var $field = $('<div class="display-field"/>');
              $field.append(
                $('<input type="checkbox" name="'+field.name+'"></input>')
                .data('field', field)
                .attr('checked', field.position != -1)
                .click(function(e) {
                  var field = $(this).data('field');
                  var $position = $(this).parent().find('.position.'+field.name);
                  if (field.position == -1) {
                    $position.show();
                    field.position = OSD.data.last_positions[field.name]
                  }
                  else {
                    $position.hide();
                    OSD.data.last_positions[field.name] = field.position
                    field.position = -1
                  }
                  MSP.promise(MSP_codes.MSP_SET_OSD_CONFIG, OSD.msp.encode(field))
                  .then(function() {
                    updateOsdView();
                  });
                })
              );
              $field.append('<label for="'+field.name+'">'+field.name+'</label>');
              if (field.positionable && field.position != -1) {
                $field.append(
                  $('<input type="number" class="'+field.name+' position"></input>')
                  .data('field', field)
                  .val(field.position)
                  .change($.debounce(250, function(e) {
                    var field = $(this).data('field');
                    var position = parseInt($(this).val());
                    field.position = position;
                    MSP.promise(MSP_codes.MSP_SET_OSD_CONFIG, OSD.msp.encode(field))
                    .then(function() {
                      updateOsdView();
                    });
                  }))
                );
              }
              $displayFields.append($field);
            }
          });
        };
        updateOsdView();
        $('.display-layout .save').click(function() {
          var self = this;
          MSP.promise(MSP_codes.MSP_EEPROM_WRITE)
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

        var $fontPicker = $('.font-picker button');
        $fontPicker.click(function(e) {
          $fontPicker.removeClass('active');
          $(this).addClass('active');
          $.get('/resources/osd/' + $(this).data('font-file') + '.mcm', function(data) {
            FONT.parseMCMFontFile(data);
            FONT.preview($preview);
          });
        });

        // load the first font when we change tabs
        $fontPicker.first().click();

        // UI Hooks
        $('a.load_font_file').click((function($preview) {
          return function() {
            $fontPicker.removeClass('active');
            FONT.openFontFile($preview);
          }
        })($preview));

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
