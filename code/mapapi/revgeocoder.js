"use strict";

/**
 * class tf.map.aux.GeoCodeReporter - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} callBack - parameter description?
*/
tf.map.aux.GeoCodeReporter = function (callBack) {
/**
 * method tf.map.aux.GeoCodeReporter.DelayCallBack - ?
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
        if (typeof callBack === "function") { setTimeout(function (theCallBack) { theCallBack.call(null, Lat, Lon, ErrorMsg, GeoCodeResult); }(callBack), 10); }
    }
};

/**
 * class tf.map.aux.RevGeocoder - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} theMap - parameter description?
 * @param {?} updateLocInfoWindow - parameter description?
 * @param {?} locInfoWindowPopup - parameter description?
*/
tf.map.aux.RevGeocoder = function (theMap, updateLocInfoWindow, locInfoWindowPopup) {

    var theThis = null;
    var moveEndListener = null;

/**
 * method tf.map.aux.RevGeocoder.SetListenToMoveEnd - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} bool - parameter description?
*/
    this.SetListenToMoveEnd = function (bool) {
        if (theMap) {
            if ((bool = !!bool) != theThis.IsListeningToMoveEnd()) {
                if (bool) {
                    moveEndListener = theMap.AddListener(tf.consts.mapMoveEndEvent, onMoveEnd);
                    updateLocInfoWindow("Map Center", "Retrieving...", false);
                    var center = theMap.GetCenter();
                    theThis.LoadHTMLFeed(center.Latitude, center.Longitude);
                }
                else { moveEndListener.OnDelete(); moveEndListener = null; }
            }
        }
    }

/**
 * method tf.map.aux.RevGeocoder.IsListeningToMoveEnd - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.IsListeningToMoveEnd = function () { return moveEndListener != null; }

/**
 * method tf.map.aux.RevGeocoder.TryShowGeocode - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} targetLat - parameter description?
 * @param {?} targetLon - parameter description?
 * @param {?} errorMsg - parameter description?
 * @param {?} geoCodeResult - parameter description?
*/
    this.TryShowGeocode = function (targetLat, targetLon, errorMsg, geoCodeResult) {
        if (theMap) {
            if (typeof errorMsg === "string" && errorMsg.length > 0) { showHelp(errorMsg); }
            else { this.LoadHTMLFeed(targetLat, targetLon); }
        }
    }

    function showHelp(errorMsg) { if (theMap) { theMap.ShowMessage(errorMsg); } }

    var loadHTMLFeedObject = { ID: 0, Latitude: 0, Longitude: 0, Download: null };

    function onMoveEnd(notification) {
        //tf.GetDebug().LogIfTest("revgeocoder move end...");
        theThis.LoadHTMLFeed(notification.eventCoords[1], notification.eventCoords[0]);
    }

/**
 * method tf.map.aux.RevGeocoder.LoadHTMLFeed - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} latitude - parameter description?
 * @param {?} longitude - parameter description?
*/
    this.LoadHTMLFeed = function (latitude, longitude) {

        //tf.GetDebug().LogIfTest("loading feed...");

        //if (!theMap.GetIsAnimating()) {

            locInfoWindowPopup.ShowTitleColorInfo(false);

            latitude = tf.js.GetLatitudeFrom(latitude);
            longitude = tf.js.GetLongitudeFrom(longitude);

            var res = theMap.GetResolution();
            var strURL = "http://vn4.cs.fiu.edu/cgi-bin/reversegeocoder.cgi?Res=" + res + "&Lat=" + latitude + "&Long=" + longitude;

            var vidParam = theMap.GetVIDParamStr();

            if (vidParam) { strURL += "&vid=" + vidParam; }

            var passThrough = theMap.GetTFPassThroughString();

            if (passThrough) { strURL += passThrough; }

            if (loadHTMLFeedObject.Download) {
                loadHTMLFeedObject.Download.Cancel();
                loadHTMLFeedObject.Download = null;
            }

            loadHTMLFeedObject.ID++;
            loadHTMLFeedObject.Latitude = latitude;
            loadHTMLFeedObject.Longitude = longitude;
            loadHTMLFeedObject.Download = new tf.ajax.GetRequest({
                url: strURL, onDataLoaded: OnHTMLFeedLoaded, requestProps: loadHTMLFeedObject.ID, autoSend: true, useRedirect: false, overrideMimeType: "text/xml"
            });
        //}
    }

    function OnHTMLFeedLoaded(notification) {
        loadHTMLFeedObject.Download = null;
        if ((loadHTMLFeedObject.ID == notification.requestProps) && (notification.httpRequest.status == 200)) {
            var content = unescape(notification.httpRequest.responseText);
            content = content.replace(/\+/g, " ");

            content = content.replace(/<\/br>/g, "");
            content = content.replace(/<br>/g, " ");

            content = content.replace(/<p>/g, " ");
            //content = content.replace(/<p>/g, "<br>");
            content = content.replace(/<u>/g, "");
            content = content.replace(/<\/u>/g, "");
            content = content.replace(/<b>/g, "");
            content = content.replace(/<\/b>/g, "");
            content = content.replace(/<font color="#0000FF">/g, "");
            content = content.replace(/<\/font>/g, "");

            if (moveEndListener) { updateLocInfoWindow("Map Center", content, true); }
        }
    }

    (function construct(theThisSet) { theThis = theThisSet; })(this);
};
