# Crowdin

Translations are managed on [Crowdin](https://crowdin.com)

## Project setup

Install crowdin-cli, see https://support.crowdin.com/cli-tool/

### Create identity file

Get the project_id from the crowdin project page
Get the api_token from your crowdin account settings.

Create a file, e.g. `crowdin-yourname.yml` with the content as below, changing values as appropriate

```
"project_id": "<project id number>"
"api_token": "<api token hex string>"
"base_path": "locales/"
"base_url": "https://crowdin.com"
```

### Create configuration file

See `crowdin.yml` in root of source tree.

### Upload source

`crowdin upload sources --verbose --identity=crowdin-yourname.yml`

example result

```
[OK] Fetching project info
[OK] Directory 'en'
[OK] File 'en\messages.json'
```


### Upload translations

This is done only once, if existing translations already exist in the source tree.

`crowdin upload translations --verbose --identity=crowdin-yourname.yml`

example result

```
[OK] Fetching project info
[SKIPPED] 'ar\messages.json' translation file doesn't exist in the specified place
[SKIPPED] 'cs\messages.json' translation file doesn't exist in the specified place
[SKIPPED] 'da\messages.json' translation file doesn't exist in the specified place
[SKIPPED] 'nl\messages.json' translation file doesn't exist in the specified place
[SKIPPED] 'fi\messages.json' translation file doesn't exist in the specified place
[SKIPPED] 'el\messages.json' translation file doesn't exist in the specified place
[SKIPPED] 'he\messages.json' translation file doesn't exist in the specified place
[SKIPPED] 'lt\messages.json' translation file doesn't exist in the specified place
[SKIPPED] 'tl\messages.json' translation file doesn't exist in the specified place
[SKIPPED] 'tr\messages.json' translation file doesn't exist in the specified place
[OK] Translation file 'hr\messages.json' has been uploaded
[OK] Translation file 'lv\messages.json' has been uploaded
[OK] Translation file 'eu\messages.json' has been uploaded
[OK] Translation file 'pt_BR\messages.json' has been uploaded
[OK] Translation file 'pt\messages.json' has been uploaded
[OK] Translation file 'ru\messages.json' has been uploaded
[OK] Translation file 'hu\messages.json' has been uploaded
[OK] Translation file 'ko\messages.json' has been uploaded
[OK] Translation file 'pl\messages.json' has been uploaded
[OK] Translation file 'fr\messages.json' has been uploaded
[OK] Translation file 'ja\messages.json' has been uploaded
[OK] Translation file 'id\messages.json' has been uploaded
[OK] Translation file 'zh_CN\messages.json' has been uploaded
[OK] Translation file 'gl\messages.json' has been uploaded
[OK] Translation file 'de\messages.json' has been uploaded
[OK] Translation file 'sv\messages.json' has been uploaded
[OK] Translation file 'zh_TW\messages.json' has been uploaded
[OK] Translation file 'it\messages.json' has been uploaded
[OK] Translation file 'es\messages.json' has been uploaded
[OK] Translation file 'ca\messages.json' has been uploaded
```

### Download translations

`crowdin download --verbose --identity=crowdin-yourname.yml`

example result

```
[OK] Fetching project info
[OK] Building ZIP archive with the latest translations
[OK] Building translation (100%)
[OK] Downloading translation
[OK] Extracted: 'ar\messages.json'
[OK] Extracted: 'ca\messages.json'
[OK] Extracted: 'cs\messages.json'
[OK] Extracted: 'da\messages.json'
[OK] Extracted: 'de\messages.json'
[OK] Extracted: 'el\messages.json'
[OK] Extracted: 'es\messages.json'
[OK] Extracted: 'eu\messages.json'
[OK] Extracted: 'fi\messages.json'
[OK] Extracted: 'fr\messages.json'
[OK] Extracted: 'gl\messages.json'
[OK] Extracted: 'he\messages.json'
[OK] Extracted: 'hr\messages.json'
[OK] Extracted: 'hu\messages.json'
[OK] Extracted: 'id\messages.json'
[OK] Extracted: 'it\messages.json'
[OK] Extracted: 'ja\messages.json'
[OK] Extracted: 'ko\messages.json'
[OK] Extracted: 'lt\messages.json'
[OK] Extracted: 'lv\messages.json'
[OK] Extracted: 'nl\messages.json'
[OK] Extracted: 'pl\messages.json'
[OK] Extracted: 'pt\messages.json'
[OK] Extracted: 'pt_BR\messages.json'
[OK] Extracted: 'ru\messages.json'
[OK] Extracted: 'sv\messages.json'
[OK] Extracted: 'tl\messages.json'
[OK] Extracted: 'tr\messages.json'
[OK] Extracted: 'zh_CN\messages.json'
[OK] Extracted: 'zh_TW\messages.json'
```

