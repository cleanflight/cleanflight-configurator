'use strict';

var BOARD_DEFINITIONS = [
    {
        name: "CC3D",
        identifier: "CC3D",
        filename: "CC3D",
        vcp: true
    }, {
        name: "ChebuzzF3",
        identifier: "CHF3",
        filename: false,
        vcp: false
    }, {
        name: "CJMCU",
        identifier: "CJM1",
        filename: "CJMCU",
        vcp: false
    }, {
        name: "EUSTM32F103RB",
        identifier: "EUF1",
        filename: false,
        vcp: false
    }, {
        name: "Naze/Flip32+",
        identifier: "AFNA",
        filename: "NAZE",
        vcp: false
    }, {
        name: "Naze32Pro",
        identifier: "AFF3",
        filename: "NAZE",
        vcp: false
    }, {
        name: "Olimexino",
        identifier: "OLI1",
        filename: false
    }, {
        name: "Port103R",
        identifier: "103R",
        filename: false,
        vcp: false
    }, {
        name: "Seiously DODO",
        identifier: "RMDO",
        filename: "RMDO",
        vcp: false
    }, {
        name: "Sparky",
        identifier: "SPKY",
        filename: "SPARKY",
        vcp: true
    }, {
        name: "STM32F3Discovery",
        identifier: "SDF3",
        filename: false,
        vcp: true
    }, {
        name: "Colibri Race",
        identifier: "CLBR",
        filename: "COLIBRI_RACE",
        vcp: true
    }, {
        name: "SP Racing F3",
        identifier: "SRF3",
        filename: "SPRACINGF3",
        vcp: false
    }, {
        name: "SP Racing F3 Mini",
        identifier: "SRFM",
        filename: "SPRACINGF3MINI",
        vcp: true
    }, {
        name: "MotoLab",
        identifier: "MOTO",
        filename: "MOTOLAB",
        vcp: true
    }
];

var DEFAULT_BOARD_DEFINITION = {
    name: "Unknown",
    identifier: "????",
    filename: false,
    vcp: false
};

var BOARD = {
    
};

BOARD.find_board_definition = function (identifier) {
    for (var i = 0; i < BOARD_DEFINITIONS.length; i++) {
        var candidate = BOARD_DEFINITIONS[i];
        
        if (candidate.identifier == identifier) {
            return candidate;
        }
    }
    return DEFAULT_BOARD_DEFINITION;
};
