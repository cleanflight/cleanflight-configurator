# Cleanflight Configurator

Cleanflight Configurator is a crossplatform configuration tool for the [Cleanflight](http://cleanflight.com/) flight control system.

It runs as an app within Google Chrome, or as a standalone app, and allows you to configure the Cleanflight software running on any [supported Cleanflight target](https://github.com/cleanflight/cleanflight/blob/master/docs/Boards.md).

Various types of aircraft are supported by the tool and by cleanflight, e.g. quadcopters, hexacopters, octocopters and fixed-wing aircraft.

[![available in the Chrome web store](https://developer.chrome.com/webstore/images/ChromeWebStore_Badge_v2_206x58.png)](https://chrome.google.com/webstore/detail/cleanflight-configurator/enacoimjcgeinfnnnpajinjgmkahmfgb)

## Authors

Dominic Clifton/hydra - maintainer of the Cleanflight firmware and configurator. 

Cleanflight Configurator was originally a [fork](#credits) of Baseflight Configurator with support for Cleanflight instead of Baseflight.

This configurator is the only configurator with support for Cleanflight specific features. It will likely require that you run the latest firmware on the flight controller.
If you are experiencing any problems please make sure you are running the [latest firmware version](https://github.com/cleanflight/cleanflight/releases/latest).

## Installation

### As chrome app

1. Visit [Chrome web store](https://chrome.google.com/webstore/detail/cleanflight-configurator/enacoimjcgeinfnnnpajinjgmkahmfgb)
2. Click **+ Free**

Please note - the application will automatically update itself when new versions are released.  Please ensure you maintain configuration backups as described in the Cleanflight documentation.

#### Alternative way

1. Clone the repo to any local directory or download it as zip
2. Start Chromium or Google Chrome and go to tools -> extension
3. Check the "Developer mode" checkbox
4. Click on load unpacked extension and point it to the Cleanflight Configurator directory (for example D:/cleanflight-configurator)

### As native app

Builds of Cleanflight Configurator as a native app are not yet available. If you are adventerous, build it yourself.

#### Building instructions

The current build scripts only support full building on OSX. Linux would produce unpatched Info.plist files for the OSX output. No Windows build scripts yet, someone can write one and do a PR. 

1. Clone the repo.
2. Install Node.js
3. Run `sudo npm install -g nwjs-builder`
4. `cd` into the repo and run `./build.sh`
5. Build output available in parent directory. 

## How to use

You can find the Cleanflight Configurator icon in your application tab "Apps"

## Notes

### WebGL

Make sure Settings -> System -> "User hardware acceleration when available" is checked to achieve the best performance

### Linux users

1. Dont forget to add your user into dialout group "sudo usermod -aG dialout YOUR_USERNAME" for serial access
2. If you have 3D model animation problems, enable "Override software rendering list" in Chrome flags chrome://flags/#ignore-gpu-blacklist

## Support

If you need help your please use the multiwii or rcgroups forums or visit the IRC channel before raising issues in the issue trackers.

### Issue trackers

For Cleanflight configurator issues raise them here

https://github.com/cleanflight/cleanflight-configurator/issues

For Cleanflight firmware issues raise them here

https://github.com/cleanflight/cleanflight/issues

### IRC Channel

There is an IRC channel for Cleanflight, here: irc://irc.freenode.net/#cleanflight

Support for Baseflight Configurator can also be found on IRC, here: irc://irc.freenode.net/#multiwii

## Technical details

The configurator is based on chrome.serial API running on Google Chrome/Chromium core.

## Developers

We accept clean and reasonable patches, submit them!

## Credits

ctn - primary author and maintainer of Baseflight Configurator from which this project was forked.
