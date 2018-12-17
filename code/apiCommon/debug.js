"use strict";

/**
 * @public
 * @class
 * @summary - Counter instances are used to generate unique numbers
*/
tf.js.Counter = function () {
    var counter = 0;

    /**
     * @public
     * @function
     * @summary - Retrieves the next number, returns <b>1</b> the first time it is called
     * @returns {number} - | {@link number} the next number
    */
    this.GetNext = function () { return ++counter; }
};

/**
 * @public
 * @class
 * @summary - The {@link singleton} instance of this class, obtainable by calling {@link tf.units.GetDebug}, aids in debugging
*/
tf.Debug = function () {

    var theThis, isTest;

    this.AddExtent = function(extent, layer, lineColor) {
        var coords = [
            [extent[0], extent[1]],
            [extent[0], extent[3]],
            [extent[2], extent[3]],
            [extent[2], extent[1]],
            [extent[0], extent[1]]
        ];
        var line_color = lineColor !== undefined ? lineColor : "#f00";
        var style = { line: true, line_color: line_color, line_width: 5, zindex: 10 };
        var extentFeature = new tf.map.Feature({ type: "linestring", coordinates: coords, style: style });
        layer.AddMapFeature(extentFeature);
    }


   /**
     * @public
     * @function
     * @summary - Logs the given string to the Browser's console only if using the Test platform of the API
     * @param {string} logString - the given string
     * @returns {void} - | {@link void} no return value
     * @see {@link tf.platform.GetIsTest}
    */
    this.LogIfTest = function (logString) { return logIfTest(logString); }

    /**
     * @public
     * @function
     * @summary - Converts the given object to JSON format and writes it to a file of the given name, works on Firefox and not on all Browsers
     * @param {string} name - the given name
     * @param {object} object - the given object
     * @returns {void} - | {@link void} no return value
    */
    this.FileLog = function (name, object) { if (isTest) { saveTextAsFile(name, "var " + name + " = " + JSON.stringify(object)); } }

    /**
     * @public
     * @function
     * @summary - Writes the given string to a file of the given name, works on Firefox and not on all Browsers
     * @param {string} name - the given name
     * @param {string} textToWrite - the given text
     * @returns {void} - | {@link void} no return value
    */
    this.SaveAsTextFile = function (name, textToWrite) { return saveTextAsFile(name, textToWrite); }

    /**
     * @public
     * @function
     * @summary - Logs any arguments passed to the console
     * @returns {void} - | {@link void} no return value
    */
    this.DebugArguments = function () { for (var a in arguments) { logIfTest(a + ': ' + arguments[a]); } }

    function logIfTest(string) { if (isTest) { console.log(string); } }

    function saveTextAsFile(name, textToWrite) {
        var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
        var downloadLink = document.createElement("a");
        downloadLink.download = name;
        downloadLink.innerHTML = "Download File";
        if (window.webkitURL != null) { downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob); }
        else {
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = function (event) { (function () { document.body.removeChild(event.target); })(); };
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
        }
        downloadLink.click();
    }

    function initialize() {
        isTest = tf.platform.GetIsTest();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/*tf.debug.RotationTester = function (settings) {
    var theThis, map, actualAngle, anglePopup, anglesStr, isDeleted, debug;

    this.OnDelete = function () { return onDelete(); }

    function onDelete() { if (!isDeleted) { isDeleted = true; if (anglePopup) { anglePopup.Show(false); anglePopup = null; } } }

    function showActualAngle() { debug.LogIfTest('t: ' + actualAngle); }

    function onChangeAngle(newAngleStr) {
        actualAngle = anglesStr[newAngleStr];
        if (actualAngle !== undefined) {
            //map.SetRotationRad(actualAngle);
            var stepMillis = 1000;
            showActualAngle();
            map.StartAnimation(function (request) {
                var nextStep;
                if (request.step == 0) {
                    nextStep = { duration: stepMillis, easing: tf.units.EaseLinear, rotation: actualAngle, notifyListeners: false };
                }
                else if (nextStep != -1) { setTimeout(showActualAngle, 100); }
                return nextStep;
            }, theThis);
        }
    }

    function onCloseAngles() { if (!isDeleted) { setTimeout(function () { anglePopup.Show(true); }, 100); } }

    function createAnglePopup() {
        var angleNames = [];

        anglesStr = {};
        for (var i = 0 ; i < 360 ; i += 30) {
            var angleRad = tf.units.DegreesToRadians(i), angleStr = '' + i;
            anglesStr[angleStr] = angleRad; angleNames.push(angleStr);
        }
        anglePopup = new tf.ui.RadioOrCheckPopupFromData({
            isRadioList: true, optionalScope: theThis, title: "Angles", data: angleNames, isInline: true, onClick: onChangeAngle,
            onClose: onCloseAngles, container: map.GetMapContainer(), horPos: "center", verPos: "bottom", marginVer: "0.5em", zIndex: 1000
        });
        anglePopup.Show(true);
    }

    function initialize() {
        debug = tf.GetDebug();
        settings = tf.js.GetValidObjectFrom(settings);

        if (map = tf.js.GetMapFrom(settings.map)) { createAnglePopup(); }
        else { isDeleted = true; }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};*/


/**
 * Settings used in the creation of [Route Tracker]{@link tf.map.RouteTracker} instances
 * @private
 * @typedef {object} tf.types.RouteTrackerSettings
 * @property {tf.map.Map} map - the given map instance
 * @property {array<tf.types.mapCoordinates>} lineStringCoords - the given route coordinates, in [GeoJSON linestring format]{@link tf.types.GeoJSONGeometryType}
*/

/**
 * @private
 * @class
 * @summary - Route Tracker instances are created to display and follow a given route on a given [map]{@link tf.map.Map} instance
 * @param {tf.types.RouteTrackerSettings} settings - creation settings
*/

/*

tf.map.RouteTracker = function (settings) {

    var theThis, map, coords, routeFeature, postComposeListener, curIndex, directions, routePointFeature, autoPlay;

    this.GoToIndex = function (index, timeInMillis) { return goToIndex(index, timeInMillis); }
    this.GetCurrentIndex = function () { return curIndex; }

    this.SetAutoPlay = function (bool) { autoPlay = !!bool; }
    this.GetAutoPlay = function () { return autoPlay; }

    this.OnDelete = function () { return onDelete(); }

    function onDelete() {
        if (!!map) {
            if (!!postComposeListener) { postComposeListener.OnDelete(); postComposeListener = null; }
            routeFeature = null;
            routePointFeature = null;
            map.Render();
            map = null;
        }
    }

    function onPostCompose(notification) {
        if (!!map) {
            var show = notification.showFeatureImmediately;
            if (!!routeFeature) { show(routeFeature); }
            if (!!routePointFeature) { show(routePointFeature); }
        }
    }

    function goToIndex(index, timeInMillis) {
        if (!!map) {
            //var stepMillis = 100;
            //var stepMillis = 1000;
            //var stepMillis = 3000;
            var stepMillis = tf.js.GetFloatNumberInRange(timeInMillis, 100, 1000000, 1000);

            index = tf.js.GetIntNumberInRange(index, 0, coords.length - 1, 0);

            curIndex = index;
            map.StartAnimation(function (request) {
                var nextStep;
                if (request.step == 0) {
                    var nextRotation = !!directions ? directions[index] : undefined;
                    if (nextRotation !== undefined) { nextRotation -= Math.PI / 2; }
                    nextStep = { duration: stepMillis, center: coords[index], rotation: nextRotation, easing: tf.units.EaseLinear, notifyListeners: false };
                }
                return nextStep;
            }, theThis);

            if (autoPlay) { setTimeout(function () { if (++index == coords.length) { index = 0; } goToIndex(index, timeInMillis); }, stepMillis + 50); }
        }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (!!(map = tf.js.GetMapFrom(settings.map)) && tf.js.GetLooksLikeLineStringCoords(coords = settings.lineStringCoords)) {

            var routeStyle = settings.routeStyle, pointStyle = settings.pointStyle;

            map.ShowPanel(tf.consts.panelNameMapLocation, false);

            var routeStyle = [{ line: true, line_width: 8, line_color: "#f00", zindex: 1, snaptopixel: false }, {
                line: true, line_width: 2, line_color: "#fff", zindex: 2, line_dash: [16, 4], snaptopixel: false
            }];
            //pointStyle = [{ circle: true, circle_radius: 6, line: true, line_color: "#000", fill: true, fill_color: "#f00", fill_opacity: 30, zindex: 3, snaptopixel: false }];

            if (tf.js.GetIsValidObject(routeStyle)) {
                routeFeature = new tf.map.Feature({ type: "linestring", coordinates: coords, style: routeStyle });
            }

            if (tf.js.GetIsValidObject(pointStyle)) {
                routePointFeature = new tf.map.Feature({ type: "multipoint", coordinates: coords, style: pointStyle });
            }

            directions = tf.js.GetIsArrayWithMinLength(settings.directions, settings.lineStringCoords.length) ? settings.directions : null;
            postComposeListener = map.AddListener(tf.consts.mapPostComposeEvent, onPostCompose);
            curIndex = settings.startIndex !== undefined ? tf.js.GetIntNumberInRange(settings.startIndex, 0, coords.length, 0) : 0;
            if (autoPlay = tf.js.GetBoolFromValue(settings.autoPlay, false)) { goToIndex(curIndex, settings.stepTimeInMillis); }
            else { map.Render(); }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

*/