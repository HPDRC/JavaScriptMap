"use strict";

/**
 * class tf.map.aux.GoDBPage - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} map - parameter description?
*/
tf.map.aux.GoDBPage = function (settings) {

    var theThis, map, linkTargetStr;

    function loadDBPage(pointCoords) {
        if (map) {
            var latitude = tf.js.GetLatitudeFrom(pointCoords[1]);
            var longitude = tf.js.GetLongitudeFrom(pointCoords[0]);

            if (latitude != 0 && longitude != 0) {
                var res = map.GetResolution();
                var strURL = "http://vn4.cs.fiu.edu/cgi-bin/gnis.cgi?Res=" + res + "&Lat=" + latitude + "&Long=" + longitude;
                var vidParam = map.GetVIDParamStr();
                var passthroughParam = map.GetTFPassThroughString();
                if (vidParam) { strURL += "&vid=" + vidParam; }
                if (passthroughParam) {
                    if (passthroughParam.charAt(0) == "&") { strURL += passthroughParam; }
                    else { strURL += "&" + passthroughParam; }
                }
                window.open(strURL, linkTargetStr);
            }
        }
    }

    function showHelp(errorMsg) { if (map) { map.ShowMessage(errorMsg); } }

    function geoCodeDB(Lat, Lon, ErrorMsg) {
        if (Lat == 0 || Lon == 0) {
            if (ErrorMsg == undefined || typeof ErrorMsg != "string" || ErrorMsg.length == 0) {
                ErrorMsg = tf.consts.defaultGeocoderError;
            }
            else {
                ErrorMsg = ErrorMsg.trim();
            }
            showHelp(ErrorMsg);
        }
        else if ((Lat >= -90) && (Lat <= 90) && (Lon >= -180) && (Lon <= 180)) { loadDBPage([Lon, Lat]); }
    }

/**
 * method tf.map.aux.GoDBPage.GoDBByAddress - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} addressStr - parameter description?
*/
    this.GoDBByAddress = function (addressStr) {
        if (map) {
            if (typeof addressStr === "string" && addressStr.length > 0) {
                new tf.services.Geocoder({
                    address: addressStr, callBack: function (data) {
                        var pointCoords = !!data ? data.pointCoords : [0, 0];
                        geoCodeDB(pointCoords[1], pointCoords[0], data.errormsg, data.geocoderlevel);
                    }
                });

                //TGetLatLngByAddress(addressStr, geoCodeDB);
            }
            else { theThis.GoDBByCenterCoords(); }
        }
    }

/**
 * method tf.map.aux.GoDBPage.GoDBByCoords - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} pointCoords - parameter description?
*/
    this.GoDBByCoords = function (pointCoords) { loadDBPage(pointCoords); }

/**
 * method tf.map.aux.GoDBPage.GoDBByCenterCoords - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GoDBByCenterCoords = function () { if (map) { theThis.GoDBByCoords(map.GetCenter()); } }

    function initialize() {
        map = settings.map;
        linkTargetStr = settings.linkTargetStr ? settings.linkTargetStr : '_top';
    }

    (function actualConstructor(theMapThis) { theThis = theMapThis; initialize(); })(this);
};