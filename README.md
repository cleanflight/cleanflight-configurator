# Cleanflight Configurator

[![Crowdin](https://badges.crowdin.net/cleanflight-configurator/localized.svg)](https://crowdin.com/project/cleanflight-configurator) [![Build Status](https://travis-ci.com/cleanflight/cleanflight-configurator.svg?branch=master)](https://travis-ci.com/cleanflight/cleanflight-configurator)

This is a crossplatform configuration tool for the [Cleanflight](http://cleanflight.com/) flight control system.

Various types of aircraft are supported by the tool and by Cleanflight, e.g. quadcopters, hexacopters, octocopters and fixed-wing aircraft.

There is also now a standalone version available.  The old Google Chrome Apps version of this software will be removed by Google on platforms other than Chrome OS. 

[Downloads are available in Releases page on GitHub.](https://github.com/cleanflight/cleanflight-configurator/releases)

## Project History

This configurator was originally a [fork](#credits) of Baseflight Configurator with support for Cleanflight instead of Baseflight.

This configurator is the only configurator with support for Cleanflight specific features. It will likely require that you run the latest firmware on the flight controller.
If you are experiencing any problems please make sure you are running the [latest firmware version](https://github.com/cleanflight/cleanflight/releases/latest).

## Installation

### Standalone

Download the installer from [Releases.](https://github.com/cleanflight/cleanflight-configurator/releases)
**This is the default installation method, and at some point in the future this will become the only way available for most platforms. Please use this method whenever possible.**

#### Note for MacOS X users

Changes to the security model used in the latest versions of MacOS X 10.14 (Mojave) and 10.15 (Catalina) mean that the operating system will show an error message ('"Cleanflight Configurator.app" is damaged and can’t be opened. You should move it to the Trash.') when trying to install the application. To work around this, run the following command in a terminal after installing: `sudo xattr -rd com.apple.quarantine /Applications/Cleanflight\ Configurator.app`.


### Via Chrome Web Store (for ChromeOS)

[![available in the Chrome web store](https://developer.chrome.com/webstore/images/ChromeWebStore_Badge_v2_206x58.png)](https://chrome.google.com/webstore/detail/cleanflight-configurator/enacoimjcgeinfnnnpajinjgmkahmfgb)

1. Visit [Cleanflight Configurator page Chrome in the web store](https://chrome.google.com/webstore/detail/cleanflight-configurator/enacoimjcgeinfnnnpajinjgmkahmfgb)
2. Click **+ Add to Chrome**

Please note - the application will automatically update itself when new versions are released.  Please ensure you maintain configuration backups as described in the Cleanflight documentation.


### Unstable Testing Versions

Unstable testing versions of the lates builds of the configurator for most platforms can be downloaded from [here](https://github.com/cleanflight/cleanflight-configurator-nightlies/releases/).

**Be aware that these versions are intended for testing / feedback only, and may be buggy or broken, and can cause flight controller settings to be corrupted. Caution is advised when using these versions.**

You can find the Cleanflight Configurator icon in your application tab "Apps"

## Native app build via NW.js

### Development

1. Install node.js (version 10 required)
2. Install yarn: `npm install yarn -g`
3. Change to project folder and run `yarn install`.
4. Run `yarn start`.

### Running tests

`yarn test`

### App build and release

The tasks are defined in `gulpfile.js` and can be run with through yarn:
```
yarn gulp <taskname> [[platform] [platform] ...]
```

List of possible values of `<task-name>`:
* **dist** copies all the JS and CSS files in the `./dist` folder.
* **apps** builds the apps in the `./apps` folder [1].
* **debug** builds debug version of the apps in the `./debug` folder [1].
* **release** zips up the apps into individual archives in the `./release` folder [1]. 

[1] Running this task on macOS or Linux requires Wine, since it's needed to set the icon for the Windows app (build for specific platform to avoid errors).

#### Build or release app for one specific platform
To build or release only for one specific platform you can append the plaform after the `task-name`.
If no platform is provided, all the platforms will be done in sequence.

* **MacOS X** use `yarn gulp <task-name> --osx64`
* **Linux** use `yarn gulp <task-name> --linux64`
* **Windows** use `yarn gulp <task-name> --win32`
* **ChromeOS** use `yarn gulp <task-name> --chromeos`

You can also use multiple platforms e.g. `yarn gulp <taskname> --osx64 --linux64`.

## Languages

Cleanflight Configurator has been translated into several languages. The application will try to detect and use your system language if a translation into this language is available. You can help [translating the application into your language](https://github.com/cleanflight/cleanflight/tree/master/README.md#Translators).

If you prefer to have the application in English or any other language, you can select your desired language in the first screen of the application.

## Notes

### Graphics Issues

If you experience graphics display problems or smudged/dithered fonts display issues in the Configurator, try invoking the `cleanflight-configurator` executable file with the --disable-gpu command line switch. This will switch off hardware graphics acceleration. Likewise, setting your graphics card antialiasing option to OFF (e.g. FXAA parameter on NVidia graphics cards) might be a remedy as well.

### Linux users

In most Linux distributions your user won't have access to serial interfaces by default. To add this access right type the following command in a terminal, log out your user and log in again:

```
sudo usermod -aG dialout ${USER}
```

### Linux / MacOS X users

If you have 3D model animation problems, enable "Override software rendering list" in Chrome flags chrome://flags/#ignore-gpu-blacklist

## Support

If you need help please reach out on the [cleanflight](https://cleanflight.slack.com/) slack channel before raising issues on github. Register and [request slack access here](http://cleanflight.com/slack).

### Issue trackers

For Cleanflight configurator issues raise them here

https://github.com/cleanflight/cleanflight-configurator/issues

For Cleanflight firmware issues raise them here

https://github.com/cleanflight/cleanflight/issues

### IRC Channel

There is an IRC channel for Cleanflight, here: irc://irc.freenode.net/#cleanflight

## Technical details

The configurator is based on chrome.serial API running on Google Chrome/Chromium core.

## Developers

We accept clean and reasonable patches, submit them!

## Authors

Dominic Clifton/hydra - maintainer of the Cleanflight firmware and configurator. 
ctn - primary author and maintainer of Baseflight Configurator from which Cleanflight Configurator project was forked.

