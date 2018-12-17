"use strict";

/**
 * class tf.map.aux.GeoCodeFlyer - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} theMap - parameter description?
 * @param {?} mapCallBack - parameter description?
 * @param {?} addressStr - parameter description?
*/
tf.map.aux.GeoCodeFlyer = function (theMap, mapCallBack, addressStr) {

    var targetLat = 0, targetLon = 0, targetLevel = 0;
    var errorMsg = "", geoCodeResult = "";
    var wasCancelled = false;
    var hasCompleted = false;
    var hasStarted = false;
    var didMove = false;
    var panDuration = 1250;

    /**
     * method tf.map.aux.GeoCodeFlyer.GetAddressStr - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
    */
    this.GetAddressStr = function () { return addressStr; }

    /**
     * method tf.map.aux.GeoCodeFlyer.HasStarted - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
    */
    this.HasStarted = function () { return hasStarted; }
    /**
     * method tf.map.aux.GeoCodeFlyer.HasCompleted - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
    */
    this.HasCompleted = function () { return hasCompleted; }
    /**
     * method tf.map.aux.GeoCodeFlyer.WasCancelled - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
    */
    this.WasCancelled = function () { return wasCancelled; }
    /**
     * method tf.map.aux.GeoCodeFlyer.IsFlying - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
    */
    this.IsFlying = function () { return hasStarted && !hasCompleted; }
    /**
     * method tf.map.aux.GeoCodeFlyer.DidMove - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
    */
    this.DidMove = function () { return didMove; }

    /**
     * method tf.map.aux.GeoCodeFlyer.Cancel - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
    */
    this.Cancel = function () { wasCancelled = !hasStarted; }

    /**
     * method tf.map.aux.GeoCodeFlyer.DelayCallBack - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
     * @param {?} Lat - parameter description?
     * @param {?} Lon - parameter description?
     * @param {?} ErrorMsg - parameter description?
     * @param {?} GeoCodeResult - parameter description?
    */
    this.DelayCallBack = function (Lat, Lon, ErrorMsg, GeoCodeResult) {

        var a = arguments;

        if (!wasCancelled) {
            hasStarted = true;

            targetLat = Lat;
            targetLon = Lon;
            targetLevel = theMap.GetLevel();

            errorMsg = typeof ErrorMsg === "string" ? ErrorMsg.trim() : "";
            geoCodeResult = typeof GeoCodeResult === "string" ? GeoCodeResult.trim() : "";

            if (errorMsg.length == 0) {

                if (Lat == 0 || Lon == 0) { errorMsg = tf.consts.defaultGeocoderError; reportToCallBack(); }
                else if ((Lat >= -90) && (Lat <= 90) && (Lon >= -180) && (Lon <= 180)) {

                    var pointNW = [0, 0], pointSE = [0, 0];

                    if (theMap.IsSamePixelAsCenter([Lon, Lat])) { reportToCallBack(); }
                    else {
                        //theMap.HideOpenPopups();

                        var center = theMap.GetCenter();
                        var centerLat = center[1], centerLon = center[0];
                        var mapSize = theMap.GetPixelSize();

                        if (centerLat >= Lat) { pointNW[1] = centerLat; pointSE[1] = Lat; }
                        else { pointNW[1] = Lat; pointSE[1] = centerLat; }

                        if (centerLon <= Lon) { pointNW[0] = centerLon; pointSE[0] = Lon; }
                        else { pointNW[0] = Lon; pointSE[0] = centerLon; }

                        var zoomLevel = tf.units.GetBoundsZoomLevel(pointNW, pointSE, mapSize[0], mapSize[1]);

                        //tf.GetDebug().LogIfTest("flyTargetLevel: " + zoomLevel);

                        startGeoCodeFly();

                        if (targetLevel < zoomLevel) { theMap.AnimatedSetCenter([targetLon, targetLat], FlyEnded, panDuration, false); }
                        else { aniZoomOut(zoomLevel); }
                    }
                }
            }
            else { reportToCallBack(); }
        }
    }

    function FlyEnded(notification) {
        //tf.GetDebug().LogIfTest("fly ended");
        finishGeoCodeFly();
    }

    function aniZoomOut(zoomLevel) {
        //tf.GetDebug().LogIfTest("ani zoom out");
        theMap.AnimatedSetLevel(zoomLevel, aniFlyTo, tf.consts.defaultMapAnimatedDurationPerLevelMillis, false);
    }

    function aniFlyTo(notification) {
        //tf.GetDebug().LogIfTest("ani fly to");
        theMap.AnimatedSetCenter([targetLon, targetLat], aniZoomIn, panDuration, false);
    }

    function aniZoomIn(notification) {
        //tf.GetDebug().LogIfTest("ani zoom in");
        theMap.AnimatedSetLevel(targetLevel, FlyEnded, tf.consts.defaultMapAnimatedDurationPerLevelMillis, false);
    }

    function startGeoCodeFly() { didMove = true; theMap.EndAnimation(); theMap.SetHasInteractions(false); }
    function finishGeoCodeFly() { theMap.SetHasInteractions(true); reportToCallBack(); }

    function reportToCallBack() {
        hasCompleted = true;
        if (theMap && typeof mapCallBack == "function") { mapCallBack.call(theMap, targetLat, targetLon, errorMsg, geoCodeResult); }
    }
};