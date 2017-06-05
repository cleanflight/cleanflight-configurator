'use strict';


TABS.transponder = {
    available: false
};

TABS.transponder.initialize = function(callback, scrollPosition) {

    let _persistentInputValues = {};

    let dataTypes = {
        NONE: 0,
        TEXT: 1,
        LIST: 2,
    };

    // CONFIGURATION HERE FOR ADD NEW TRANSPONDER
    let transponderConfigurations = {
        0: {
            dataType: dataTypes.NONE // empty
        }, //NONE
        1: {
            dataType: dataTypes.TEXT //<input type="text">
        }, //ilap
        2: {
            dataType: dataTypes.LIST, // <select>...</select>
            dataOptions: {
                'ID 1': 'E00370FC0FFE07E0FF',
                'ID 2': '007C003EF800FC0FFE',
                'ID 3': 'F8811FF8811FFFC7FF',
                'ID 4': '007C003EF81F800FFE',
                'ID 5': 'F00FFF00FFF00FF0FF',
                'ID 6': '007CF0C1071F7C00F0',
                'ID 7': 'E003F03F00FF03F0C1',
                'ID 8': '00FC0FFE071F3E00FE',
                'ID 9': 'E083BFF00F9E38C0FF',
            }
        }, //arcitimer
		3: {
            dataType: dataTypes.TEXT //<input type="text">
        }, //ERLT
    };
    /////////////////////////////////////////////

    if ( GUI.active_tab != 'transponder' ) {
        GUI.active_tab = 'transponder';
        googleAnalytics.sendAppView('Transponder');
    }
    // transponder supported added in MSP API Version 1.16.0
    if ( CONFIG ) {
        TABS.transponder.available = semver.gte(CONFIG.apiVersion, "1.16.0");
    }
    //////////////
    if ( !TABS.transponder.available ) {
        load_html();
        return;
    }

    function load_html() {
        $('#content').load("./tabs/transponder.html", process_html);
    }

    //HELPERS
    // Convert a hex string to a byte array
    function hexToBytes(hex) {
        var bytes = [];
        for ( let c = 0; c < hex.length; c += 2 ) {
            bytes.push(~parseInt(hex.substr(c, 2), 16));
        }

        return bytes;
    }

    function pad(n, width) {
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
    }

    // Convert a byte array to a hex string
    function bytesToHex(bytes) {
        var hex = [];
        for ( let i = 0; i < bytes.length; i++ ) {
            hex.push(pad(((~bytes[i]) & 0xFF).toString(16), 2));
        }
        return hex.join("").toUpperCase();
    }

    /////////////

    function fillByTransponderProviders(transponderProviders, transponderProviderID, toggleTransponderType) {
        let transponderTypeSelect = $('#transponder_type_select');
        transponderTypeSelect.attr('data-defaultValue', transponderProviderID);
        transponderTypeSelect.off('change').change(toggleTransponderType);
        transponderTypeSelect.html('');

        //build radio buttons
        transponderTypeSelect.append(
            $('<option>').attr('value', 0).html(chrome.i18n.getMessage("transponderType0")) // NONE
        );

        for ( let transponderProvidersKey in transponderProviders ) {
            let transponderProvider = transponderProviders[transponderProvidersKey];

            if ( transponderProvider.hasOwnProperty('id') ) {
                transponderTypeSelect.append(
                    $('<option>').attr('value', transponderProvider.id).html(chrome.i18n.getMessage("transponderType" + transponderProvider.id))
                );
            }
        }

        transponderTypeSelect.val(transponderProviderID);
    }

    function buildDataBlockForTransponderProviders(transponderProvider, data, clearValue) {
        var clearValue = clearValue || false;
        $('#transponderConfiguration').html('');
        $('#transponderConfiguration').hide();
        $('#transponderHelpBox').hide();

        if ( !transponderProvider ) {
            return;
        }

        let template = $('#transponder-configuration-template').clone();

        template.find('.spacer_box_title').html(chrome.i18n.getMessage("transponderData" + transponderProvider.id));
        template.find('.dataHelp').html(chrome.i18n.getMessage("transponderDataHelp" + transponderProvider.id));


        if ( chrome.i18n.getMessage("transponderHelp" + transponderProvider.id).length ) {
            $('#transponderHelp').html(chrome.i18n.getMessage("transponderHelp" + transponderProvider.id));
            $('#transponderHelpBox').show();
        }

        let transponderConfiguration = transponderConfigurations[transponderProvider.id];
        let dataInput = null;

        switch ( transponderConfiguration.dataType ) {

            case dataTypes.TEXT:
                dataInput = $('<input>').attr('type', 'text').attr('maxlength', parseInt(transponderProvider.dataLength) * 2);
                if ( !clearValue ) {
                    dataInput.val(data);
                } else {
                    dataInput.val(_persistentInputValues[transponderProvider.id] || '');
                }

                break;
            case dataTypes.LIST:
                dataInput = $('<select>');
                for ( let dataOptionsKey in transponderConfiguration.dataOptions ) {
                    let dataOptions = transponderConfiguration.dataOptions[dataOptionsKey];
                    dataInput.append($('<option>').val(dataOptions).html(dataOptionsKey));
                }

                if ( dataInput.find("option[value='" + data + "']").length > 0 && !clearValue ) {
                    dataInput.val(data);
                } else {
                    dataInput.val(_persistentInputValues[transponderProvider.id] || '');
                }

                break;
            default:
                return;
        }

        if ( !clearValue ) {
            _persistentInputValues[transponderProvider.id] = data;
        }

        let changedInputValue = function() {
            let dataString = $(this).val();
            let hexRegExp = new RegExp('[0-9a-fA-F]{' + (transponderProvider.dataLength * 2) + '}', 'gi');

            if ( !dataString.match(hexRegExp) ) {
                TRANSPONDER.data = [];
            } else {
                TRANSPONDER.data = hexToBytes(dataString);
            }
            _persistentInputValues[transponderProvider.id] = dataString;
        };

        dataInput.change(changedInputValue).keyup(changedInputValue);
        template.find('.input_block').html(dataInput);
        $('#transponder-configuration').html(template.show());
    }

    /**
     * this function is called from select click scope
     */
    function toggleTransponderType() {

        TRANSPONDER.provider = $(this).val();
        let defaultProvider = $(this).attr('data-defaultValue');
        if ( defaultProvider == $(this).val() ) {
            $('.save_reboot').hide();
            $('.save_no_reboot').show();
        } else {
            $('.save_no_reboot').hide();
            $('.save_reboot').show();
        }

        let clearValue = true;
        buildDataBlockForTransponderProviders(TRANSPONDER.providers.find(function(provider) {
            return provider.id == TRANSPONDER.provider;
        }), bytesToHex(TRANSPONDER.data), clearValue);
    }


    MSP.send_message(MSPCodes.MSP_TRANSPONDER_CONFIG, false, false, load_html);

    function process_html() {
        $(".tab-transponder").toggleClass("transponder-supported", TABS.transponder.available && TRANSPONDER.supported);

        localize();

        if ( TABS.transponder.available && TRANSPONDER.providers.length > 0 ) {

            fillByTransponderProviders(TRANSPONDER.providers, TRANSPONDER.provider, toggleTransponderType);
            buildDataBlockForTransponderProviders(TRANSPONDER.providers.find(function(provider) {
                return provider.id == TRANSPONDER.provider;
            }), bytesToHex(TRANSPONDER.data));


            $('a.save').click(function() {
                let _this = this;

                function save_transponder_data() {
                    MSP.send_message(MSPCodes.MSP_SET_TRANSPONDER_CONFIG, mspHelper.crunch(MSPCodes.MSP_SET_TRANSPONDER_CONFIG), false, save_to_eeprom);
                }

                function save_to_eeprom() {
                    MSP.send_message(MSPCodes.MSP_EEPROM_WRITE, false, false, function() {
                        GUI.log(chrome.i18n.getMessage('transponderEepromSaved'));
                        if ( $(_this).hasClass('reboot') ) {
                            GUI.tab_switch_cleanup(function() {
                                MSP.send_message(MSPCodes.MSP_SET_REBOOT, false, false, reinitialize);
                            });
                        }
                    });
                }

                if ( TRANSPONDER.data.length !== TRANSPONDER.providers.find(function(provider) {
                        return provider.id == TRANSPONDER.provider;
                    }).dataLength ) {
                    GUI.log(chrome.i18n.getMessage('transponderDataInvalid'));
                } else {
                    save_transponder_data();
                }
            });
        }

        function reinitialize() {
            GUI.log(chrome.i18n.getMessage('deviceRebooting'));
            if ( BOARD.find_board_definition(CONFIG.boardIdentifier).vcp ) {
                $('a.connect').click();
                GUI.timeout_add('start_connection', function start_connection() {
                    $('a.connect').click();
                }, 2500);
            } else {
                GUI.timeout_add('waiting_for_bootup', function waiting_for_bootup() {
                    MSP.send_message(MSPCodes.MSP_IDENT, false, false, function() {
                        GUI.log(chrome.i18n.getMessage('deviceReady'));
                        TABS.configuration.initialize(false, $('#content').scrollTop());
                    });
                }, 1500);
            }
        }

        GUI.content_ready(callback);
    }
};

TABS.transponder.cleanup = function(callback) {
    if ( callback ) callback();
};
