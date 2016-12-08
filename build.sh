#!/bin/bash

BUILD_PATH="../build"
REPO_PATH="."

echo "Building from: $REPO_PATH"
echo "Build output: $BUILD_PATH"

echo "Checking for nwb..."

nwb -h > /dev/null

if [ $? -ne 0 ]; then
	echo "nwjs-builder is not installed. Please ensure Node.js and NPM is installed then run \`sudo npm install -g nwjs-builder\`"
	exit 1
fi

echo "Checking for zip..."

zip -h > /dev/null

if [ $? -ne 0 ]; then
	echo "nwjs-builder is not installed. Please ensure Node.js and NPM is installed then run \`sudo npm install -g nwjs-builder\`"
	exit 1
fi


echo "Building using nwjs-builder..."

nwb nwbuild -p win32,osx64,linux32 --win-ico $REPO_PATH/images/icon.ico --mac-icns $REPO_PATH/images/icon.icns $REPO_PATH --output-name "cleanflight-configurator-{target}" -o $BUILD_PATH 

if [ $? -ne 0 ]; then
	echo "Build failed. "
	exit 1
fi

echo "Editing PLIST file..."

PLIST_FILE="cleanflight-configurator-osx-x64/Cleanflight - Configurator.app/Contents/Info.plist"

if [ "$(uname)" == "Darwin" ]; then
	defaults delete "$(pwd)/$BUILD_PATH/$PLIST_FILE" "UTExportedTypeDeclarations"
	defaults delete "$(pwd)/$BUILD_PATH/$PLIST_FILE" "CFBundleURLTypes"
	defaults delete "$(pwd)/$BUILD_PATH/$PLIST_FILE" "CFBundleDocumentTypes"
else
	echo "Please edit $PLIST_FILE manually. "
fi

echo "Finished builds. Creating archives..."

cd $BUILD_PATH
for D in *; do
	if [ -d "${D}" ]; then
		zip -r "${D}.zip" "${D}"
	fi
done

echo "Build finished. "
