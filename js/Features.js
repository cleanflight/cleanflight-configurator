'use strict;'

var Features = function (config) {
    var self = this;

    var features = [
        {bit: 0, group: 'rxMode', mode: 'select', name: 'RX_PPM'},
        {bit: 1, group: 'batteryVoltage', name: 'VBAT'},
        {bit: 2, group: 'other', name: 'INFLIGHT_ACC_CAL'},
        {bit: 3, group: 'rxMode', mode: 'select', name: 'RX_SERIAL'},
        {bit: 4, group: 'esc', name: 'MOTOR_STOP'},
        {bit: 5, group: 'other', name: 'SERVO_TILT'},
        {bit: 6, group: 'other', name: 'SOFTSERIAL', haveTip: true},
        {bit: 7, group: 'gps', name: 'GPS', haveTip: true},
        {bit: 9, group: 'other', name: 'SONAR'},
        {bit: 10, group: 'other', name: 'TELEMETRY'},
        {bit: 11, group: 'batteryCurrent', name: 'CURRENT_METER'},
        {bit: 12, group: '3D', name: '3D'},
        {bit: 13, group: 'rxMode', mode: 'select', name: 'RX_PARALLEL_PWM'},
        {bit: 14, group: 'rxMode', mode: 'select', name: 'RX_MSP'},
        {bit: 15, group: 'rssi', name: 'RSSI_ADC'},
        {bit: 16, group: 'other', name: 'LED_STRIP'},
        {bit: 17, group: 'other', name: 'DISPLAY', haveTip: true}
    ];

    if (semver.lt(config.apiVersion, "1.33.0")) {
        features.push(
            {bit: 19, group: 'other', name: 'BLACKBOX', haveTip: true}
        );
    }

    if (semver.gte(config.apiVersion, "1.12.0")) {
        features.push(
            {bit: 20, group: 'other', name: 'CHANNEL_FORWARDING'}
        );
    }

    if (semver.gte(CONFIG.apiVersion, "1.15.0")) {
        features.push(
            {bit: 8, group: 'rxFailsafe', name: 'FAILSAFE', haveTip: true}
        );
    } else {
        features.push(
            {bit: 8, group: 'rxFailsafe', name: 'FAILSAFE', haveTip: true}
        );
    }

    if (semver.gte(CONFIG.apiVersion, "1.16.0")) {
        features.push(
            {bit: 21, group: 'other', name: 'TRANSPONDER', haveTip: true}
        );
    }

    if (config.flightControllerVersion !== '') {
        if (semver.gte(CONFIG.apiVersion, "1.16.0")) {
            features.push(
                {bit: 22, group: 'other', name: 'AIRMODE'}
            );
        }

        if (semver.gte(CONFIG.apiVersion, "1.16.0")) {
            if (semver.lt(CONFIG.apiVersion, "1.20.0")) {
                features.push(
                    {bit: 23, group: 'pidTuning', name: 'SUPEREXPO_RATES'}
                );
            } else if (semver.lt(config.apiVersion, "1.33.0")) {
                features.push(
                    {bit: 23, group: 'other', name: 'SDCARD'}
                );
            }
        }

        if (semver.gte(CONFIG.apiVersion, "1.20.0")) {
            features.push(
                {bit: 18, group: 'other', name: 'OSD'},
            );
        }

        if (semver.gte(CONFIG.apiVersion, "1.20.0") && semver.lte(CONFIG.apiVersion, "1.35.0")) {
            features.push(
                {bit: 24, group: 'other', name: 'VTX'}
            );
        }

        if (semver.gte(CONFIG.apiVersion, "1.31.0")) {
            features.push(
                {bit: 27, group: 'other', name: 'ESC_SENSOR'}
            )
        }
        if (semver.gte(CONFIG.apiVersion, "1.36.0")) {
            features.push(
                {bit: 29, group: 'other', name: 'DYNAMIC_FILTER', haveTip: true}
            )
        }
        
        
    }

    self._features = features;
    self._featureMask = 0;
};

Features.prototype.getMask = function () {
    var self = this;

    return self._featureMask;
};

Features.prototype.setMask = function (featureMask) {
    var self = this;

    self._featureMask = featureMask;
};

Features.prototype.isEnabled = function (featureName) {
    var self = this;

    for (var i = 0; i < self._features.length; i++) {
        if (self._features[i].name === featureName && bit_check(self._featureMask, self._features[i].bit)) {
            return true;
        }
    }
    return false;
};

Features.prototype.generateElements = function (featuresElements) {
    var self = this;

    var listElements = [];

    for (var i = 0; i < self._features.length; i++) {
        var feature_tip_html = '';
        if (self._features[i].haveTip) {
            feature_tip_html = '<div class="helpicon cf_tip" i18n_title="feature' + self._features[i].name + 'Tip"></div>';
        }

        var newElements = [];
        if (self._features[i].mode === 'select') {
            if (listElements.length === 0) {
                newElements.push($('<option class="feature" '
                    + 'value="-1" '
                    + 'i18n="featureNone" />'));
            }

            var newElement = $('<option class="feature" id="feature-'
                + i
                + '" name="'
                + self._features[i].name
                + '" value="'
                + self._features[i].bit
                + '" i18n="feature' + self._features[i].name + '" />');

            newElements.push(newElement);
            listElements.push(newElement);
        } else {
            var newElement = $('<tr><td><input class="feature toggle" id="feature-'
                    + i
                    + '" name="'
                    + self._features[i].name
                    + '" title="'
                    + self._features[i].name
                    + '" type="checkbox"/></td><td><label for="feature-'
                    + i
                    + '">'
                    + self._features[i].name
                    + '</label></td><td><span i18n="feature' + self._features[i].name + '"></span>'
                    + feature_tip_html + '</td></tr>');

            var feature_e = newElement.find('input.feature');

            feature_e.prop('checked', bit_check(self._featureMask, self._features[i].bit));
            feature_e.data('bit', self._features[i].bit);

            newElements.push(newElement);
        }

        featuresElements.each(function () {
            if ($(this).hasClass(self._features[i].group)) {
                $(this).append(newElements);
            }
        });
    }

    for (var i = 0; i < listElements.length; i++) {
        var element = listElements[i];
        var bit = parseInt(element.attr('value'));
        var state = bit_check(self._featureMask, bit);

        element.prop('selected', state);
    }
};

Features.prototype.updateData = function (featureElement) {
    var self = this;

    if (featureElement.attr('type') === 'checkbox') {
        var bit = featureElement.data('bit');

        if (featureElement.is(':checked')) {
            self._featureMask = bit_set(self._featureMask, bit);
        } else {
            self._featureMask = bit_clear(self._featureMask, bit);
        }
    } else if (featureElement.prop('localName') === 'select') {
        var controlElements = featureElement.children();
        var selectedBit = featureElement.val();
        if (selectedBit !== -1) {
            for (var i = 0; i < controlElements.length; i++) {
                var bit = controlElements[i].value;
                if (selectedBit === bit) {
                    self._featureMask = bit_set(self._featureMask, bit);
                } else {
                    self._featureMask = bit_clear(self._featureMask, bit);
                }
            }
        }
    }
};
