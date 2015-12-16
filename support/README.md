# Build & Support Files

This directory is not to be included in the Chrome App release.

## Gulp Taks Runner

The `gulpfile.js` build script provides gulp tasks to validate the sourcecode (js, html, css) and to package the a Chrome App ZIP-File containing all necessary files for the publication in the Chrome Web Store.

## Running gulp

the default task will perform all validation steps and package the application. For Windows users it is recommended to use the Cygwin-Shell as the `.jshintrc` file will not be picked up correctly otherwise resulting in too strict validation and lots of false alarms.

### Prerequisites

* node.js (+npm)
* Cygwin bash/zsh shell (Windows users only)

### Installing / Running

Install all npm dev dependencies and optionally update your PATH (sentenv.sh) environment variable if you do not plan on installing gulp globally.

The default Gulp task will validate js, css, html and package a release zip file `chrome_app_release.zip` placed in the support directory.

Example:

```
➜  npm install
➜  source setenv.sh
➜  gulp

[14:09:02] Using gulpfile ./gulpfile.js
[14:09:02] Starting 'validate_js'...

(...)
(...)
(...)

[14:09:05] 'validate_js' errored after 2.68 s
[14:09:05] Error in plugin 'gulp-jshint'

(...)
(...)
(...)

[14:09:08] Finished 'package' after 4.3 s

➜  ls -lah chrome_app_release.zip
-rwxr-xr-x 1 pulsar Kein 5,5M 16. Dez 15:24 chrome_app_release.zip
```

Errors in *hint Tasks are intentional and meant to be addressed by the developer.

### Available Gulp Tasks:

* validate_css
* validate_js
* validate_html
* package

Any of this tasks can be run autonomously via gulp command line, example:

```
➜  gulp package
```
