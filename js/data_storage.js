'use strict';

var CONFIGURATOR = {
    'releaseDate': 1473796742334, // new Date().getTime() - Tue Sep 13 2016 21:58:47 GMT+0200
    
     // all versions are specified and compared using semantic versioning http://semver.org/
    'apiVersionAccepted': '1.2.1',
    'backupRestoreMinApiVersionAccepted': '1.5.0',
    'pidControllerChangeMinApiVersion': '1.5.0',
    'backupFileMinVersionAccepted': '0.55.0', // chrome.runtime.getManifest().version is stored as string, so does this one
    
    'connectionValid': false,
    'connectionValidCliOnly': false,
    'cliActive': false,
    'cliValid': false
};
