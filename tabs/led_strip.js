'use strict';

TABS.led_strip = {
    wireMode: false,
    baseFuncs: ['c', 'f', 'a', 'g', 'b', 'r'],
    overlays: ['t', 's', 'w', 'i'],
    directions: ['n', 'e', 's', 'w', 'u', 'd'],
};

TABS.led_strip.initialize = function (callback, scrollPosition) {
    var self = this;
    var selectedColorIndex = null;
    var selectedModeColor = null;

    TABS.led_strip.wireMode = false;

    if (GUI.active_tab != 'led_strip') {
        GUI.active_tab = 'led_strip';
        googleAnalytics.sendAppView('LED Strip');
    }

    function load_led_config() {
        MSP.send_message(MSP_codes.MSP_LED_STRIP_CONFIG, false, false, load_led_colors);
    }

    function load_led_colors() {
        MSP.send_message(MSP_codes.MSP_LED_COLORS, false, false, load_led_mode_colors);
    }

    function load_led_mode_colors() {
        if (semver.gte(CONFIG.apiVersion, "1.19.0"))
            MSP.send_message(MSP_codes.MSP_LED_STRIP_MODECOLOR, false, false, load_html);
        else
            load_html();
    }
    
    
    
    
    
    function load_html() {
        $('#content').load("./tabs/led_strip.html", process_html);
    }

    load_led_config();
    

    function buildUsedWireNumbers() {
        var usedWireNumbers = [];
        $('.mainGrid .gPoint .wire').each(function () {
            var wireNumber = parseInt($(this).html());
            if (wireNumber >= 0) {
                usedWireNumbers.push(wireNumber);
            }
        });
        usedWireNumbers.sort(function(a,b){return a - b});
        return usedWireNumbers;
    }
    
    function process_html() {
        
        localize();

        // Build Grid
        var theHTML = [];
        var theHTMLlength = 0;
        for (var i = 0; i < 256; i++) {
            theHTML[theHTMLlength++] = ('<div class="gPoint"><div class="indicators"><span class="north"></span><span class="south"></span><span class="west"></span><span class="east"></span><span class="up">U</span><span class="down">D</span></div><span class="wire"></span><span class="overlay-t"> </span><span class="overlay-s"> </span><span class="overlay-w"> </span><span class="overlay-i"> </span><span class="overlay-color"> </span></div>');
        }
        $('.mainGrid').html(theHTML.join(''));

        $('.tempOutput').click(function() {
            $(this).select();
        });

        // Clear button
        $('.funcClear').click(function() {
            $('.gPoint').each(function() {
                if ($(this).is('.ui-selected')) {
                    removeFunctionsAndDirections(this);
                    $(this).find('.wire').html('');
                }
            });

            $('.controls button').removeClass('btnOn');
            updateBulkCmd();
        });

        // Clear All button
        $('.funcClearAll').click(function() {
            $('.gPoint').each(function() {
                removeFunctionsAndDirections(this);
            });
            $('.gPoint .wire').html('');

            updateBulkCmd();

            $('.controls button').removeClass('btnOn');
        });

        function removeFunctionsAndDirections(element) {
            var classesToRemove = [];

            TABS.led_strip.baseFuncs.forEach(function(letter) {
                classesToRemove.push('function-' + letter);
            });
            TABS.led_strip.overlays.forEach(function(letter) {
                classesToRemove.push('function-' + letter);
            });
            TABS.led_strip.directions.forEach(function(letter) {
                classesToRemove.push('dir-' + letter);
            });
            $(element).removeClass(classesToRemove.join(' '));
        }


        // Directional Buttons
        $('.directions').on('click', 'button', function() {
            var that = this;
            if ($('.ui-selected').length > 0) {
                TABS.led_strip.directions.forEach(function(letter) {
                    if ($(that).is('.dir-' + letter)) {
                        if ($(that).is('.btnOn')) {
                            $(that).removeClass('btnOn');
                            $('.ui-selected').removeClass('dir-' + letter);
                        } else {
                            $(that).addClass('btnOn');
                            $('.ui-selected').addClass('dir-' + letter);
                        }
                    }
                });

                clearModeColorSelection();
                updateBulkCmd();
            }
        });
        
        // Mode Color Buttons
        $('.mode_colors').on('click', 'button', function() {
            var that = this;
            LED_MODE_COLORS.forEach(function(mc) {
                if ($(that).is('.mode_color-' + mc.mode + '-' + mc.direction)) {
                    if ($(that).is('.btnOn')) {
                        $(that).removeClass('btnOn');
                        $('.ui-selected').removeClass('mode_color-' + mc.mode + '-' + mc.direction);
                        selectedModeColor = null;
                    } else {
                        $(that).addClass('btnOn');
                        selectedModeColor = { mode: mc.mode, direction: mc.direction };

                        // select the color button
                        for (var colorIndex = 0; colorIndex < 16; colorIndex++) {
                            var className = '.color-' + colorIndex;
                            if (colorIndex == getModeColor(mc.mode, mc.direction)) {
                                $(className).addClass('btnOn');
                                selectedColorIndex = colorIndex;
                                setColorSliders(colorIndex);
                                
                            } else {
                                $(className).removeClass('btnOn');
                            }
                        }
                    }
                }
            });

            $('.mode_colors').each(function() {
                $(this).children().each(function() {
                    if (! $(this).is($(that))) {
                        if ($(this).is('.btnOn')) {
                            $(this).removeClass('btnOn');
                        }                            
                    }
                });
            });
            
            updateBulkCmd();
            
        });
        

        var ip = $('div.colorDefineSliders input');
        ip.eq(0).on("input change", function() { updateColors($(this).val(), 0); });
        ip.eq(1).on("input change", function() { updateColors($(this).val(), 1); });
        ip.eq(2).on("input change", function() { updateColors($(this).val(), 2); });
        for (var i = 0; i < 3; i++) {
            updateColors(ip.eq(i).val(), i);
        }


        // Color Buttons
        $('.colors').on('click', 'button', function(e) {
            var that = this;
            var colorButtons = $(this).parent().find('button');
            
            for (var colorIndex = 0; colorIndex < 16; colorIndex++) {
                colorButtons.removeClass('btnOn');
                if (selectedModeColor == undefined)
                    $('.ui-selected').removeClass('color-' + colorIndex);
                
                if ($(that).is('.color-' + colorIndex)) {
                    selectedColorIndex = colorIndex;
                    if (selectedModeColor == undefined)
                        $('.ui-selected').addClass('color-' + colorIndex);
                }
            }


            setColorSliders(selectedColorIndex);
            
            $(this).addClass('btnOn');

            if (selectedModeColor) {
                setModeColor(selectedModeColor.mode, selectedModeColor.direction, selectedColorIndex);
            }

            drawColorBoxesInColorLedPoints();

            // refresh color buttons
            $('.colors').children().each(function() { setBackgroundColor($(this)); });
            $('.overlay-color').each(function() { setBackgroundColor($(this)); });
            
            $('.mode_colors').each(function() { setModeBackgroundColor($(this)); });
            $('.special_colors').each(function() { setModeBackgroundColor($(this)); });
            
            updateBulkCmd();
        });
        
        $('.colors').on('dblclick', 'button', function(e) {

            var pp = $('.tab-led-strip').position();
            var moveLeft = $('.tab-led-strip').position().left + ($('.colorDefineSliders').width() / 2);
            var moveUp =   $('.tab-led-strip').position().top  + $('.colorDefineSliders').height() + 20;
            
            $('.colorDefineSliders').css('left', e.pageX - e.offsetX - moveLeft);
            $('.colorDefineSliders').css('top', e.pageY - e.offsetY - moveUp);
            $('.colorDefineSliders').show();
            
        });
        
        $('.colorDefineSliders').on({
            mouseleave: function () {
                $('.colorDefineSliders').hide();
            }
        });

        $('.colors').children().on({
            mouseleave: function () {
                if (!$('.colorDefineSliders').is(":hover"))
                    $('.colorDefineSliders').hide();
            }
        });
        
        $('.funcWire').click(function() {
            $(this).toggleClass('btnOn');
            TABS.led_strip.wireMode = $(this).hasClass('btnOn'); 
            $('.mainGrid').toggleClass('gridWire');
        });

        $('.funcWireClearSelect').click(function() {
            $('.ui-selected').each(function() {
                var thisWire = $(this).find('.wire');
                if (thisWire.html() != '') {
                    thisWire.html('');
                }
                updateBulkCmd();
            });
        });

        $('.funcWireClear').click(function() {
            $('.gPoint .wire').html('');
            updateBulkCmd();
        });

        $('.mainGrid').selectable({
            filter: ' > div',
            stop: function() {
                var functionsInSelection = [];
                var directionsInSelection = [];

                clearModeColorSelection();

                var that;
                $('.ui-selected').each(function() {
                    
                    var usedWireNumbers = buildUsedWireNumbers();
                    
                    var nextWireNumber = 0;
                    for (var nextWireNumber = 0; nextWireNumber < usedWireNumbers.length; nextWireNumber++) {
                        if (usedWireNumbers[nextWireNumber] != nextWireNumber) {
                            break;
                        }
                    }
                        
                    if (TABS.led_strip.wireMode) {
                        if ($(this).find('.wire').html() == '' && nextWireNumber < LED_STRIP.length) {
                            $(this).find('.wire').html(nextWireNumber);
                        }
                    }
                    

                    if ($(this).find('.wire').text() != '') {

                        that = this;
    
                        // Get function & overlays or current cell
                        TABS.led_strip.directions.forEach(function(letter) {
                            var className = '.dir-' + letter;
                            if ($(that).is(className)) {
                                directionsInSelection.push(className);
                            }
                        });
    
                        TABS.led_strip.baseFuncs.forEach(function(letter) {
                            var className = '.function-' + letter;
                            if ($(that).is(className)) {
                                functionsInSelection.push(className);
                            }
                        });
                        
                        TABS.led_strip.overlays.forEach(function(letter) {
                            var className = '.function-' + letter;
                            if ($(that).is(className)) {
                                functionsInSelection.push(className);
                            }
                        });
                    }
                });

                $('select.functionSelect').val("");

                TABS.led_strip.baseFuncs.forEach(function(letter) {
                    var className = 'function-' + letter;
                    if ($('select.functionSelect').is("." + className)) {
                        $('select').removeClass(className);
                    }
                });
                selectedColorIndex = 0;
                
                if (that) {
                    
                    // set active color
                    for (var colorIndex = 0; colorIndex < 16; colorIndex++) {
                        var className = '.color-' + colorIndex;
                        if ($(that).is(className)) {
                            $(className).addClass('btnOn');
                            selectedColorIndex = colorIndex;
                            
                        } else {
                            $(className).removeClass('btnOn');
                        }
                    }
                    
                    // set checkbox values
                    TABS.led_strip.overlays.forEach(function(letter) {
                        var feature_o = $('.checkbox').find('input.function-' + letter);
    
                        var newVal = ($(that).is('.function-' + letter));
                        
                        if (feature_o.is(':checked') != newVal) {
                            feature_o.prop('checked', newVal);
                            feature_o.change();
                        }
                    });
                    
                    // Update active function in combobox
                    TABS.led_strip.baseFuncs.forEach(function(letter) {
                        if ($(that).is('.function-' + letter)) {
                            $('select.functionSelect').val("function-" + letter);
                        }
                    });  
                }
                updateBulkCmd();
                
                setColorSliders(selectedColorIndex);
                
                setOptionalGroupsVisibility();

                $('.directions button').removeClass('btnOn');
                directionsInSelection.forEach(function(direction_e) {
                    $(direction_e).addClass('btnOn');
                });
            }
        });

        // UI: select LED function from drop-down
        $('.functionSelect').on('change', function() {

            var that = this;
            if ($('.ui-selected').length > 0) {
                TABS.led_strip.baseFuncs.forEach(function(letter) {
                    if ($(that).val() == 'function-' + letter) {
                        $('select').addClass('function-' + letter);
                        
                        $('.ui-selected').find('.wire').each(function() {
                            if ($(this).text() != "")
                                $(this).parent().addClass('function-' + letter);
                        });
                        
                        if (letter == 'b' || letter == 'r') {
                            if ($('input.function-i').is(':checked')) {
                                $('input.function-i').prop('checked', false);
                                $('input.function-i').change();
                                $('.ui-selected').each(function() {
                                    if ($(this).is('.function-' + letter)) {
                                        $(this).removeClass('function-i');
                                    }
                                });
                            }
                        }
                        if (letter == 'b' || letter == 'r' || letter == 'l' || letter == 'g') {
                            if ($('input.function-w').is(':checked')) {
                                $('input.function-w').prop('checked', false);
                                $('input.function-w').change();
                                $('.ui-selected').each(function() {
                                    if ($(this).is('.function-' + letter)) {
                                        $(this).removeClass('function-w'); 
                                    }
                                });
                            }
                            if ($('input.function-t').is(':checked')) {
                                $('input.function-t').prop('checked', false);
                                $('input.function-t').change();
                                $('.ui-selected').each(function() {
                                    if ($(this).is('.function-' + letter)) {
                                        $(this).removeClass('function-t'); 
                                    }
                                });
                            }
                            if ($('input.function-s').is(':checked')) { 
                                $('input.function-s').prop('checked', false);
                                $('input.function-s').change();
                                $('.ui-selected').each(function() {
                                    if ($(this).is('.function-' + letter)) {
                                        $(this).removeClass('function-s'); 
                                    }
                                });
                            }
                        }
                    } else {
                        $('select').removeClass('function-' + letter);
                        $('.ui-selected').removeClass('function-' + letter);
                    }
                });
                $('select').addClass($('select.functionSelect').val());
                
                clearModeColorSelection();
                updateBulkCmd();
                drawColorBoxesInColorLedPoints();
            }

            setOptionalGroupsVisibility();
        });

        // UI: select mode from drop-down
        $('.modeSelect').on('change', function() {

            var that = this;
            
            var mode = Number($(that).val());
            $('.mode_colors').find('button').each(function() {
                for (var i = 0; i < 6; i++)
                    for (var j = 0; j < 6; j++)
                        if ($(this).hasClass('mode_color-' + i + '-' + j)) {
                            $(this).removeClass('mode_color-' + i + '-' + j);
                            $(this).addClass('mode_color-' + mode + '-' + j);
                        }
                
            });

            $('.mode_colors').each(function() { setModeBackgroundColor($(this)); });
        });
        
        // UI: checkbox toggle
        $('.checkbox').change(function(e) { 
            if (e.originalEvent) {
                // user-triggered event
                var that = $(this).find('input');
                if ($('.ui-selected').length > 0) {
                    TABS.led_strip.overlays.forEach(function(letter) {
                        if ($(that).is('.function-' + letter)) {
                            if ($(that).is(':checked')) {
                                $('.ui-selected').find('.wire').each(function() {
                                    if ($(this).text() != "")
                                        $(this).parent().addClass('function-' + letter);
                                });
                            } else {
                                $('.ui-selected').removeClass('function-' + letter);
                            }
                        }
                    });

                    clearModeColorSelection();
                    updateBulkCmd();
                }
            } else {
                // code-triggered event
            }
            setOptionalGroupsVisibility();
        });
        

        
        $('.mainGrid').disableSelection();

        $('.gPoint').each(function(){
            var gridNumber = ($(this).index() + 1);
            var row = Math.ceil(gridNumber / 16) - 1;
            var col = gridNumber/16 % 1 * 16 - 1;
            if (col < 0) {
                col = 15;
            }
            
            var ledResult = findLed(col, row);
            if (!ledResult) {
                return;
            }
            
            var ledIndex = ledResult.index;
            var led = ledResult.led;
            
            if (led.functions.length == 0 && led.directions.length == 0 && led.color == 0) {
                return;
            }
            
            $(this).find('.wire').html(ledIndex);

            for (var modeIndex = 0; modeIndex < led.functions.length; modeIndex++) {
                $(this).addClass('function-' + led.functions[modeIndex]);
            }
            
            for (var directionIndex = 0; directionIndex < led.directions.length; directionIndex++) {
                $(this).addClass('dir-' + led.directions[directionIndex]);
            }
            
            $(this).addClass('color-' + led.color);

        });
        
        updateBulkCmd();
        
        setOptionalGroupsVisibility();

        drawColorBoxesInColorLedPoints();
        
        $('.colorDefineSliders').hide();
        
        $('a.save').click(function () {

            MSP.sendLedStripConfig(send_led_strip_colors);
             
            function send_led_strip_colors() {
                MSP.sendLedStripColors(send_led_strip_mode_colors);
            }
            
            function send_led_strip_mode_colors() {
                if (semver.gte(CONFIG.apiVersion, "1.19.0"))
                    MSP.sendLedStripModeColors(save_to_eeprom);
                else
                    save_to_eeprom();
            }
            
            function save_to_eeprom() {
                MSP.send_message(MSP_codes.MSP_EEPROM_WRITE, false, false, function() {
                    GUI.log(chrome.i18n.getMessage('ledStripEepromSaved'));
                });
            }

        });
        
        if (semver.lt(CONFIG.apiVersion, "1.19.0")) {
            $(".extra_functions19").hide();
            $(".mode_colors").hide();
        }
        
        GUI.content_ready(callback);
    }
    
    
    
    



    function findLed(x, y) {
        for (var ledIndex = 0; ledIndex < LED_STRIP.length; ledIndex++) {
            var led = LED_STRIP[ledIndex];
            if (led.x == x && led.y == y) {
                return { index: ledIndex, led: led };
            }
        }
        return undefined;
    }
    
        
    function updateBulkCmd() {
        var counter = 0;

        var lines = [];
        var ledStripLength = LED_STRIP.length;
        var ledColorsLength = LED_COLORS.length;
        var ledModeColorsLenggth = LED_MODE_COLORS.length;
        
        LED_STRIP = [];
        
        $('.gPoint').each(function(){
            if ($(this).is('[class*="function"]')) {
                var gridNumber = ($(this).index() + 1);
                var row = Math.ceil(gridNumber / 16) - 1;
                var col = gridNumber/16 % 1 * 16 - 1;
                if (col < 0) {col = 15;}

                var wireNumber = $(this).find('.wire').html();
                var functions = '';
                var directions = '';
                var colorIndex = 0;
                var that = this;
                
                var match = $(this).attr("class").match(/(^|\s)color-([0-9]+)(\s|$)/);
                if (match) {
                    colorIndex = match[2];
                }

                TABS.led_strip.baseFuncs.forEach(function(letter){
                    if ($(that).is('.function-' + letter)) {
                        functions += letter;
                    }
                });
                TABS.led_strip.overlays.forEach(function(letter){
                    if ($(that).is('.function-' + letter)) {
                        functions += letter;
                    }
                });

                TABS.led_strip.directions.forEach(function(letter){
                    if ($(that).is('.dir-' + letter)) {
                        directions += letter;
                    }
                });

                if (wireNumber != '') {
                    var led = {
                        x: col,
                        y: row,
                        directions: directions,
                        functions: functions,
                        color: colorIndex
                    }
                    
                    LED_STRIP[wireNumber] = led;
                }
                counter++;
            }
        });

        var defaultLed = {
            x: 0,
            y: 0,
            directions: '',
            functions: ''
        };
        
        for (var i = 0; i < ledStripLength; i++) {
            if (LED_STRIP[i]) {
                continue;
            }
            LED_STRIP[i] = defaultLed;
        }
        
        var usedWireNumbers = buildUsedWireNumbers();

        var remaining = LED_STRIP.length - usedWireNumbers.length;
        
        $('.wires-remaining div').html(remaining);
    }

    // refresh mode color buttons
    function setModeBackgroundColor(element) {
        if (semver.gte(CONFIG.apiVersion, "1.19.0")) {
            element.find('[class*="mode_color"]').each(function() { 
                var m = 0;
                var d = 0;
                
                var match = $(this).attr("class").match(/(^|\s)mode_color-([0-9]+)-([0-9]+)(\s|$)/);
                if (match) {
                    m = Number(match[2]);
                    d = Number(match[3]);
                    $(this).css('background-color', HsvToColor(LED_COLORS[getModeColor(m, d)]));
                }
            });
        }
    }
    
    function setBackgroundColor(element) {
        if (element.is('[class*="color"]')) {
            var colorIndex = 0;
            
            var match = element.attr("class").match(/(^|\s)color-([0-9]+)(\s|$)/);
            if (match) {
                colorIndex = match[2];
                element.css('background-color', HsvToColor(LED_COLORS[colorIndex]));
            }
        }
    }
    
    function setOptionalGroupsVisibility() {
        
        var activeFunction = $('select.functionSelect').val();
        
        $('select').addClass(activeFunction);

        // set color modifiers (checkboxes) visibility
        switch (activeFunction) {
            case "function-c": 
            case "function-a": 
            case "function-f":
                $('.modifiers').show();
            break;
            default: 
                $('.modifiers').hide();
            break; 
        }

        // set overlays (checkboxes) visibility
        switch (activeFunction) {
            case "function-g":
                $('.warningOverlay').hide();
                $('.indicatorOverlay').show();
                $('.overlays').show();
            break;
            case "function-b":
            case "function-r": 
                $('.warningOverlay').hide();
                $('.indicatorOverlay').hide();
                $('.overlays').hide();
            break;
            default: 
                $('.indicatorOverlay').show();
                $('.warningOverlay').show();
                $('.overlays').show();
            break; 
        }
        
        // set color palette visibility
        /*
        switch (activeFunction) {
            case "":
            case "function-c":
            case "function-b":
            case "function-r":
            case "function-a":
            case "function-f":
            case "function-g":
                $('.colors').show();
                $('.colorDefineSliders').show();
            break;
          
            default: 
                $('.colors').hide();
                $('.colorDefineSliders').hide();
            break; 
        }
        */
        
        // set mode colors visibility
        if (activeFunction == "function-f" && semver.gte(CONFIG.apiVersion, "1.19.0"))
            $('.mode_colors').show();
        else
            $('.mode_colors').hide(); 

        // set directions visibility
        if (activeFunction == "function-f" || activeFunction == "" || $('input.function-i').is(':checked'))
            $('.directions').show();
        else
            $('.directions').hide(); 
        
        // set special colors visibility
        $('.special_colors').show();
        $('.mode_color-6-0').hide();
        $('.mode_color-6-1').hide();
        $('.mode_color-6-2').hide();
        $('.mode_color-6-3').hide();
        $('.mode_color-6-4').hide();
        $('.mode_color-6-5').hide();
        $('.mode_color-6-6').hide();
        $('.mode_color-6-7').hide();
        
        switch (activeFunction) {
            case "":           // none
            case "function-f": // Modes & Orientation
                // $('.mode_color-6-3').show(); // background
                $('.special_colors').hide();
                break;
            case "function-g": // GPS
                $('.mode_color-6-5').show(); // no sats
                $('.mode_color-6-6').show(); // no lock
                $('.mode_color-6-7').show(); // locked
                // $('.mode_color-6-3').show(); // background
                break;
            case "function-b": // Blink
                $('.mode_color-6-4').show(); // blink background 
                break;
            case "function-a": // Arm state
                $('.mode_color-6-0').show(); // disarmed 
                $('.mode_color-6-1').show(); // armed 
                break;
                
            case "function-r": // Ring
            default:
                $('.special_colors').hide();
            break; 
        }
    }
    
    function updateColors(value, hsvIndex) {
        var change = false;
        
        value = Number(value);
        
        var className = '.color-' + selectedColorIndex;
        if ($(className).hasClass('btnOn')) {
            switch (hsvIndex) {
                case 0:
                    if (LED_COLORS[selectedColorIndex].h != value) {
                        LED_COLORS[selectedColorIndex].h = value;
                        $('.colorDefineSliderValue.Hvalue').text(LED_COLORS[selectedColorIndex].h);
                        change = true
                    }
                    break;
                case 1: 
                    if (LED_COLORS[selectedColorIndex].s != value) {
                        LED_COLORS[selectedColorIndex].s = value;
                        $('.colorDefineSliderValue.Svalue').text(LED_COLORS[selectedColorIndex].s);
                        change = true
                    }
                    break;
                case 2: 
                    if (LED_COLORS[selectedColorIndex].v != value) {
                        LED_COLORS[selectedColorIndex].v = value;
                        $('.colorDefineSliderValue.Vvalue').text(LED_COLORS[selectedColorIndex].v);
                        change = true
                    }
                    break;
            }                
        }
        

        // refresh color buttons 
        $('.colors').children().each(function() { setBackgroundColor($(this)); });
        $('.overlay-color').each(function() { setBackgroundColor($(this)); });
        
        $('.mode_colors').each(function() { setModeBackgroundColor($(this)); });
        $('.special_colors').each(function() { setModeBackgroundColor($(this)); });
        
        if (change)
            updateBulkCmd();
    }
    
    function drawColorBoxesInColorLedPoints() {

        $('.gPoint').each(function() {
            if ($(this).is('.function-c') || $(this).is('.function-r') || $(this).is('.function-b')) {
                $(this).find('.overlay-color').show();
                
                for (var colorIndex = 0; colorIndex < 16; colorIndex++) {
                    var className = 'color-' + colorIndex;
                    if ($(this).is('.' + className)) {
                        $(this).find('.overlay-color').addClass(className);
                        $(this).find('.overlay-color').css('background-color', HsvToColor(LED_COLORS[colorIndex]))
                    } else {
                        if ($(this).find('.overlay-color').is('.' + className))
                            $(this).find('.overlay-color').removeClass(className);
                    }
                }
            } else {
                $(this).find('.overlay-color').hide();
            }
        });
    }
    
    function setColorSliders(colorIndex) {

        var sliders = $('div.colorDefineSliders input');
        var change = false;
        
        if (!LED_COLORS[colorIndex])
            return;
        
        if (LED_COLORS[colorIndex].h != Number(sliders.eq(0).val())) {
            sliders.eq(0).val(LED_COLORS[colorIndex].h);
            $('.colorDefineSliderValue.Hvalue').text(LED_COLORS[colorIndex].h);
            change = true;
        }
        
        if (LED_COLORS[colorIndex].s != Number(sliders.eq(1).val())) {
            sliders.eq(1).val(LED_COLORS[colorIndex].s);
            $('.colorDefineSliderValue.Svalue').text(LED_COLORS[colorIndex].s);
            change = true;
        }
        
        if (LED_COLORS[colorIndex].v != Number(sliders.eq(2).val())) {
            sliders.eq(2).val(LED_COLORS[colorIndex].v);
            $('.colorDefineSliderValue.Vvalue').text(LED_COLORS[colorIndex].v);
            change = true;
        }

        // only fire events when all values are set
        if (change)
            sliders.trigger('input');
        
    }
    
    function HsvToColor(input) {
        var HSV = { h:Number(input.h), s:Number(input.s), v:Number(input.v) };
        
        if (HSV.s == 0 && HSV.v == 0)
            return "";
        
        HSV = { h:HSV.h, s:1 - HSV.s / 255, v:HSV.v / 255 };
        
        var HSL = { h:0, s:0, v:0};
        HSL.h = HSV.h;
        HSL.l = (2 - HSV.s) * HSV.v / 2;
        HSL.s = HSL.l && HSL.l < 1 ? HSV.s * HSV.v / (HSL.l < 0.5 ? HSL.l * 2 : 2 - HSL.l * 2) : HSL.s;
        
        var ret = 'hsl(' + HSL.h + ', ' + HSL.s * 100 + '%, ' + HSL.l * 100 + '%)';
        return ret;
    }

    function getModeColor(mode, dir) {
        for (var i = 0; i < LED_MODE_COLORS.length; i++) {
            var mc = LED_MODE_COLORS[i];
            if (mc.mode == mode && mc.direction == dir)
                return mc.color;
        }
        return "";
    }

    function setModeColor(mode, dir, color) {
        for (var i = 0; i < LED_MODE_COLORS.length; i++) {
            var mc = LED_MODE_COLORS[i];
            if (mc.mode == mode && mc.direction == dir) {
                mc.color = color;
                return 1;
            }
        }
        return 0;
    }
    
    function clearModeColorSelection() {
        selectedModeColor = null;
        $('.mode_colors').each(function() {
            $(this).children().each(function() {
                if ($(this).is('.btnOn')) {
                    $(this).removeClass('btnOn');
                }                            
            });
        });
    }
};

TABS.led_strip.cleanup = function (callback) {
    if (callback) callback();
};
