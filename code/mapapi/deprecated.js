"use strict";

/**
 * A {@link string} defining an arbitrary number of semi-colon delimited properties in the format: "A=VA;B=VB...", where "A" and "B" are property names and "VA" and "VB" are their respective values
 * @public
 * @typedef {string} deprecatedPropertyString
 * @see {@link tf.js.ParseLegacyFormatString}
 */

/**
 * @public
 * @function
 * @summary - Converts the given [property string]{@link deprecatedPropertyString} into an {@link object}
 * @param {deprecatedPropertyString} formatStr - the format string
 * @returns {object} - | {@link object} an object with the specified properties
 * @deprecated use {@link tf.types.MapFeatureStyleSettings} instead
*/
tf.js.ParseLegacyFormatString = function (formatStr) {
    var formatObj = {};
    if (!!formatStr && typeof formatStr == "string") {
        var settings = formatStr.split(';');
        for (var i = 0; i < settings.length; i++) {
            var items = settings[i].split('=');
            if (items !== undefined && items.length > 0) {
                formatObj[items[0].trim().toLowerCase()] = items[1] ? items[1].trim() : "";
            }
        }
    }
    return formatObj;
}

/**
 * @public
 * @function
 * @summary - Auxiliary method for TLayer class
 * @param {string} strPoints - a string containing map coordinates
 * @returns {tf.types.GeoJSONGeometryCoordinates} - | {@link tf.types.GeoJSONGeometryCoordinates} map coordinates
 * @deprecated
*/
tf.helpers.GetCoordsFromLatLonString = function (strPoints) {
    var coordinates = [];

    var strPointsUse = tf.js.GetNonEmptyString(strPoints);

    if (strPointsUse) {
        if (strPointsUse)
            var pointList = strPointsUse.split(';');
        try {
            for (var i in pointList) { var latLon = pointList[i].split(','); if (latLon.length == 2) { coordinates.push([tf.js.GetLongitudeFrom(latLon[1]), tf.js.GetLatitudeFrom(latLon[0])]); } }
        }
        catch (e) { coordinates = [] };
    }
    return coordinates;
}

/**
 * @public
 * @function
 * @summary - Auxiliary method for TLayer class
 * @param {string} strPoints - a string containing map coordinates
 * @returns {tf.types.GeoJSONGeometryCoordinates} - | {@link tf.types.GeoJSONGeometryCoordinates} map coordinates
 * @deprecated
*/
tf.helpers.GetMultiCoordsFromLatLonString = function (strPoints) {
    var coordinates = [];
    var strPointsUse = tf.js.GetNonEmptyString(strPoints);

    if (strPointsUse) {
        if (strPointsUse.charAt(0) == '(') {
            var multilineStrings = strPointsUse.split('(').slice(1);

            for (var i in multilineStrings) {
                if (multilineStrings[i].length > 0 && multilineStrings[i].charAt(0) == '(') {
                    tf.GetDebug().LogIfTest('double parenthesis in strPoints');
                }
                coordinates.push([tf.helpers.GetCoordsFromLatLonString(multilineStrings[i])]);
            }
        }
        else { coordinates = tf.helpers.GetCoordsFromLatLonString(strPoints); }
    }
    return coordinates;
}

/**
 * @public
 * @function
 * @summary - Calculates the minimum distance between given map coordinates and a given segment defined by an array of map coordinates
 * @param {array<deprecatedMapCoords3>} mapCoordinatesArray - the array of map coordinates defining a segment
 * @param {tf.types.latitude} ptLat - the latitude
 * @param {tf.types.longitude} ptLon - the longitude
 * @returns {tf.types.HitTestCoordinatesArrayResult} - | {@link tf.types.HitTestCoordinatesArrayResult} the result
 * @deprecated see {@link tf.helpers.HitTestMapCoordinatesArray}
*/
tf.helpers.HitTestLatLonArray = function (latLonArray, ptLat, ptLon) {
    var minDistance = -1;
    var minDistanceIndex = -1;

    if (!!latLonArray && typeof latLonArray === "object" && !!latLonArray.length) {
        var nInPath = latLonArray.length;
        var prevEnd = latLonArray[0];
        var time = 0;

        for (var i = 1 ; i < nInPath ; ++i) {
            var start = prevEnd, end = latLonArray[i];
            var thisDistance = 0;
            var latPtToStart = ptLat - start.lat;
            var lonPtToStart = ptLon - start.lon;

            if (start.lat == end.lat && start.lon == end.lon) { thisDistance = (latPtToStart * latPtToStart + lonPtToStart * lonPtToStart); }
            else {
                var latEndToStart = end.lat - start.lat;
                var lonEndToStart = end.lon - start.lon;
                var distEndStartSq = Math.sqrt(latEndToStart * latEndToStart + lonEndToStart * lonEndToStart);
                var latPtToEnd = ptLat - end.lat;
                var lonPtToEnd = ptLon - end.lon;
                var proj = (lonPtToStart * lonEndToStart + latPtToStart * latEndToStart) / distEndStartSq;

                if (proj < 0) { thisDistance = (latPtToStart * latPtToStart + lonPtToStart * lonPtToStart); }
                else if (proj > 1) { thisDistance = (latPtToEnd * latPtToEnd + lonPtToEnd * lonPtToEnd); }
                else {
                    var segPtLat = start.lat + latEndToStart * proj;
                    var segPtLon = start.lon + lonEndToStart * proj;
                    var segPtToPtLat = segPtLat - ptLat;
                    var segPtToPtLon = segPtLon - ptLon;
                    thisDistance = (segPtToPtLat * segPtToPtLat + segPtToPtLon * segPtToPtLon);
                }
            }

            if (minDistance < 0 || thisDistance < minDistance) { minDistance = thisDistance; minDistanceIndex = i - 1; }

            prevEnd = end;
        }
    }
    return { minDistance: minDistance, minDistanceIndex: minDistanceIndex };
};

/**
 * @public
 * @function
 * @summary - Auxiliary function for MVideo application
 * @param {?} path - ?
 * @param {?} times - ?
 * @param {?} ptLat - ?
 * @param {?} ptLon - ?
 * @returns {?} - ?
 * @deprecated
*/
tf.helpers.HitTestRoute = function (path, times, ptLat, ptLon) {
    var hitTestResult = tf.helpers.HitTestLatLonArray(path, ptLat, ptLon);
    var minDistanceIndex = hitTestResult.minDistanceIndex;
    var time = 0;

    if (minDistanceIndex >= 0) {
        var lastTime = times[path.length - 1].indexPath;
        time = times[minDistanceIndex].indexPath / lastTime;
    }
    return { time01: time, index: minDistanceIndex };
}

/**
 * @public
 * @function
 * @summary - Auxiliary method for MVideo application
 * @param {?} times - ?
 * @returns {?} - ?
 * @deprecated
*/
tf.helpers.CreateTimesWithoutGap = function (times) {
    var newTimes = [];

    if (!!times && typeof times == "object" && times.length > 0) {
        var ngaps = 0;
        var ntimes = times.length, i;

        if (ntimes > 0) {
            var lastTime = 0, lastIndex = 0;

            for (var i = 0 ; i < ntimes ; ++i) {
                var thisTime = times[i];

                if (thisTime > lastTime) {
                    while (lastTime < thisTime - 1) {
                        newTimes.push({ indexPath: lastIndex, hasGPS: false });
                        ++lastTime;
                        ++ngaps;
                    }
                    lastTime = thisTime;
                    lastIndex = i;
                    newTimes.push({ indexPath: lastIndex, hasGPS: true });
                }
                /*else if (thisTime < lastTime) { tf.GetDebug().LogIfTest("timeline out of sequence"); }*/
            }

            while (lastTime < ntimes) {
                newTimes.push({ indexPath: lastIndex, hasGPS: false });
                ++lastTime;
                ++ngaps;
            }
        }
    }

    return newTimes;
};

/**
 * @public
 * @function
 * @summary - Auxiliary method for MVideo application
 * @param {?} fromLatLon - parameter description?
 * @param {?} toLatLon - parameter description?
 * @returns {?} - method returns?
*/
tf.units.GetMapRadAngleFromLatLonVector = function (fromLatLon, toLatLon) {
    return tf.units.GetMapHeading([fromLatLon.lon, fromLatLon.lat], [toLatLon.lon, toLatLon.lat]);
}

/**
 * @public
 * @function
 * @summary - Auxiliary method for MVideo application
 * @param {?} latLonArray - ?
 * @returns {?} - ?
 * @deprecated
*/
tf.helpers.CalcDirectionsLatLonArray = function (latLonArray) {
    var directions = [];
    var nInlatLonArray = latLonArray ? latLonArray.length : 0;

    if (nInlatLonArray > 1) {
        var getMapRadAngleFromLatLonVector = tf.units.GetMapRadAngleFromLatLonVector;
        var startAngle = undefined;
        var start = latLonArray[0];

        for (var i = 1 ; startAngle == undefined && i < nInlatLonArray ; ++i) {
            var thisItem = latLonArray[i];

            if (start.lat != thisItem.lat || start.lon != thisItem.lon) {
                startAngle = getMapRadAngleFromLatLonVector(start, thisItem);
            }
        }

        if (startAngle != undefined) {

            var lastAngle = startAngle;
            var current = latLonArray[1];
            var last = latLonArray[nInlatLonArray - 1];

            directions.push(startAngle);

            for (var i = 1 ; i < nInlatLonArray - 1 ; ++i) {
                var thisItem = latLonArray[i];
                var nextItem = latLonArray[i + 1];

                if (thisItem.lat != nextItem.lat || thisItem.lon != nextItem.lon) {
                    directions.push(lastAngle = getMapRadAngleFromLatLonVector(thisItem, nextItem));
                }
                else {
                    directions.push(lastAngle);
                }
            }

            directions.push(lastAngle);
        }
        else {
            for (var i = 0 ; i < nInlatLonArray ; ++i) {
                directions.push(0);
            }
        }
    }
    else {
        directions.push(0);
    }
    return directions;
}

/**
 * @public
 * @function
 * @summary - Auxiliary method for MVideo application
 * @param {?} path - ?
 * @returns {?} - ?
 * @deprecated
*/
tf.helpers.CalcMinMaxSpeedAlt = function (path) {
    var maxAlt = 0, minAlt = 0, maxSpeed = 0, minSpeed = 0, altRange = 0, speedRange = 0;
    if (!!path && typeof path === "object" && path.length > 0 && path[0].speed !== undefined && path[0].altitude !== undefined) {
        if (path.length > 0) {
            maxAlt = minAlt = path[0].altitude; maxSpeed = minSpeed = path[0].speed;
            for (var i in path) {
                var thisInPath = path[i], thisSpeed = thisInPath.speed, thisAlt = thisInPath.altitude;
                if (thisSpeed < minSpeed) { minSpeed = thisSpeed; } if (thisSpeed > maxSpeed) { maxSpeed = thisSpeed; }
                if (thisAlt < minAlt) { minAlt = thisAlt; } if (thisAlt > maxAlt) { maxAlt = thisAlt; }
            }
            altRange = maxAlt - minAlt; speedRange = maxSpeed - minSpeed;
        }
    }
    return { minAlt: minAlt, maxAlt: maxAlt, altRange: altRange, minSpeed: minSpeed, maxSpeed: maxSpeed, speedRange: speedRange };
};

/**
 * @public
 * @function
 * @summary - Auxiliary method for MVideo application
 * @param {?} latLonArray - parameter description?
 * @returns {?} - method returns?
 * @deprecated
*/
tf.helpers.GetCoordinatesFromLatLonArray = function (latLonArray) {
    var coordinates = [];
    try {
        if (typeof latLonArray === "object" && latLonArray.length > 0 && latLonArray[0].lat !== undefined && latLonArray[0].lon !== undefined) {
            for (var i in latLonArray) { var thisPoint = latLonArray[i]; coordinates.push([tf.js.GetLongitudeFrom(thisPoint.lon), tf.js.GetLatitudeFrom(thisPoint.lat)]); }
        }
    }
    catch (e) { coordinates = [] };
    return coordinates;
}

/**
 * A callback function that can be passed to the global function {@link TDownloadRequest}
 * @public
 * @callback TDownloadRequestCallBack
 * @param {object} httpRequest - the request object
 * @param {number} status - the request status
 * @param {object} requestID - the object passed in the call to {@link TDownloadRequest}
 * @returns {void} - | {@link void} no return value
 */

/**
 * @public
 * @class
 * @summary Create an instance of this class to retrieve data from a given url pointing to a service or data file
 * @param {string} urlToDownload - the desired url
 * @param {TDownloadRequestCallBack} callBack - the callback function
 * @param {object} requestID - parameter that will be passed back to the callback function
 * @extends {tf.ajax.GetRequest}
 * @deprecated This global function will soon be removed: use {@link tf.ajax.GetRequest} instead
*/
var TDownloadRequest = function (urlToDownload, callBack, requestID) {
    var theThis, callBackUse;
    /**
     * @public
     * @function
     * @summary - Cancels the request if it is in progress
     * @returns {void} - | {@link void} no return value
     * @deprecated Use [Cancel]{@link tf.ajax.GetRequest#Cancel} instead
    */
    this.Abort = function () { return theThis.Cancel(); }

    function onDataLoaded(notification) {
        callBackUse(notification.httpRequest, notification.httpRequest.status, notification.requestProps);
    }

    function initialize() {
        if (callBackUse = tf.js.GetFunctionOrNull(callBack)) {
            tf.ajax.GetRequest.call(theThis, { url: urlToDownload, onDataLoaded: onDataLoaded, requestProps: requestID, autoSend: false });
        }
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(TDownloadRequest, tf.ajax.GetRequest);

/**
 * @public
 * @class
 * @summary Instances of this class are used by deprecated functions in the TerraFly API
 * @param {tf.types.latitude} latitude - the latitude
 * @param {tf.types.longitude} longitude - the longitude
 * @property {tf.types.latitude} latitude - the latitude
 * @property {tf.types.longitude} longitude - the longitude
 * @deprecated This format will soon be removed along with functions that support it. TerraFly applications should replace the 
 * use of these functions with current API functions that use the {@link tf.types.mapCoordinates} format
*/
var tLatLng = function (latitude, longitude) {
    var theThis = this;
    /**
     * @public
     * @function
     * @summary - Obtain the corresponding map coordinates
     * @returns {tf.types.mapCoordinates} - | {@link tf.types.mapCoordinates} the corresponding map coordinates
    */
    this.GetMapCoords = function () { return [longitude, latitude]; }
    theThis.latitude = latitude; theThis.longitude = longitude;
};

/**
 * @public
 * @class
 * @summary An instance of this class is passed to callBack functions specified in calls to the {@link TGetAddressByLatLng} function
 * @param {string} address - component part of the address
 * @param {string} housenumber - component part of the address
 * @param {string} range_from - component part of the address
 * @param {string} range_to - component part of the address
 * @param {string} street - component part of the address
 * @param {string} city - component part of the address
 * @param {string} state - component part of the address
 * @param {string} zip - component part of the address
 * @param {string} latitude - component part of the address
 * @param {string} longitude - component part of the address
 * @param {string} distance - component part of the address
 * @param {string} compass_direction - component part of the address
 * @param {string} offset - component part of the address
 * @param {string} streetc - component part of the address
 * @property {string} address - component part of the address
 * @property {string} housenumber - component part of the address
 * @property {string} range_from - component part of the address
 * @property {string} range_to - component part of the address
 * @property {string} street - component part of the address
 * @property {string} city - component part of the address
 * @property {string} state - component part of the address
 * @property {string} zip - component part of the address
 * @property {string} latitude - component part of the address
 * @property {string} longitude - component part of the address
 * @property {string} distance - component part of the address
 * @property {string} compass_direction - component part of the address
 * @property {string} offset - component part of the address
 * @property {string} streetc - component part of the address
 * @property {number} GGeoAddressAccuracy - the TerraFly geo location accuracy code associated with this address
 * @deprecated A replacement for this class will soon be available in the {@link tf.services} namespace
*/
var TAddressReturnObject = function (address, housenumber, range_from, range_to, street, city, state, zip, latitude, longitude, distance, compass_direction, offset, streetc) {

    this.address = address;
    this.housenumber = housenumber;
    this.range_from = range_from;
    this.range_to = range_to;
    this.street = street;
    this.city = city;
    this.state = state;
    this.zip = zip;
    this.latitude = latitude;
    this.longitude = longitude;
    this.distance = distance;
    this.compass_direction = compass_direction;
    this.offset = offset;
    this.streetc = streetc;

    if (this.distance <= 10) { this.GGeoAddressAccuracy = 9; }
    else if (this.distance <= 50) { this.GGeoAddressAccuracy = 8; }
    else if (this.distance <= 100) { this.GGeoAddressAccuracy = 7; }
    else if (this.distance <= 200) { this.GGeoAddressAccuracy = 6; }
    else if (this.distance <= 500) { this.GGeoAddressAccuracy = 5; }
    else { this.GGeoAddressAccuracy = 4; }

    /**
     * @public
     * @function
     * @summary - Obtains the full address
     * @returns {string} - | {@link string} the full address composed from its individual parts
    */
    this.toString = function () {
        var addressString = this.address + ", " + this.city + ", " + this.state + ", " + this.zip;
        if (addressString == null)
            throw ("Error in TAddressReturnObject toString method");
        return addressString;
    }

    /**
     * @public
     * @function
     * @summary - Obtains a string describing the accuracy of the address geo location represented by the desired accuracy code
     * @param {number} GGeoAddressAccuracy - the desired accuracy code
     * @returns {string} - | {@link string} the accuracy description associated with the the given code
    */
    this.GetAccuracyDescription = function (GGeoAddressAccuracy) {

        if (GGeoAddressAccuracy === undefined) { GGeoAddressAccuracy = this.GGeoAddressAccuracy; }

        var descriptions = [
                "Country level accuracy",
                "Region (state, province, prefecture, etc.) level accuracy",
                "Sub-region (county, municipality, etc.) level accuracy",
                "Town (city, village) level accuracy",
                "Post code (zip code) level accuracy",
                "Street level accuracy",
                "Intersection level accuracy",
                "Address level accuracy",
                "Premise level accuracy"
        ];

        var descriptionsCount = descriptions.length;

        return (GGeoAddressAccuracy >= 1 && GGeoAddressAccuracy <= descriptionsCount) ? descriptions[GGeoAddressAccuracy - 1] : "Unknown location";
    }
};

/**
 * @public
 * @typedef {array} ResourceArray - an array of instances of {@link Resources}
 */

/**
 * @public
 * @class
 * @property {string} name - the name of the resource
 * @property {string} produceDate - an array of dates
 * @property {array} resolutionList - array of resolutions
 * @property {array} notchList - array of notches
 * @summary An array of instances of this class is passed to callBack functions specified in calls to the {@link TGetAerialImagerySources_UTM} and {@link TGetAerialImagerySources} functions
 * @deprecated A replacement for this class is now available: {@link tf.types.RasterSourceListResult} used with the [Raster Source List Service]{@link tf.services.RasterSourceList} service
*/
var Resources = function () {

    this.name = null;
    this.produceDate = null;
    this.resolutionList = null;
    this.notchList = null;

    /**
     * @public
     * @function
     * @summary - Sets the dates of the resource
     * @param {string} workString - comma separated date values 
     * @returns {void} - | {@link void} no return value
    */
    this.SetDate = function (workString) {
        this.produceDate = workString.split(",").slice(0, -1);
        //if (this.produceDate.length > 1) { tf.GetDebug().LogIfTest('Resource: more than one date' + this.produceDate); }
        for (var i in this.produceDate) {
            var thisProduceDate = this.produceDate[i];
            var year = thisProduceDate.substring(0, 4);
            var month = thisProduceDate.substring(4, 6);
            var day = thisProduceDate.substring(6, 8);
            this.produceDate[i] = new Date(year, month - 1, day);
        }
    }

    /**
     * @public
     * @function
     * @summary - Creates a list of resolutions
     * @param {string} workString - comma separated resolution values
     * @returns {void} - | {@link void} no return value
    */
    this.CreateList = function (workString) {
        this.resolutionList = workString.split(",").slice(0, -1);
        for (var i in this.resolutionList) { this.resolutionList[i] = parseFloat(this.resolutionList[i]); }
    }

    /**
     * @public
     * @function
     * @summary - Creates a list of notches
     * @param {string} workString - comma separated notch values
     * @returns {void} - | {@link void} no return value
    */
    this.CreateNotchList = function (workString) { this.notchList = workString.split(",").slice(0, -1) }

    /**
     * @public
     * @function
     * @summary - Sorts the resource
     * @returns {void} - | {@link void} no return value
    */
    this.Sort = function () {
        var temp;
        var tempNotch;
        //if (this.resolutionList.length > 1) { tf.GetDebug().LogIfTest('Resource: more than one resolution');}
        for (var i = 1; i < this.resolutionList.length; i++) {
            for (var j = this.resolutionList.length - 1; j > 0; j--) {
                if (this.resolutionList[j] < this.resolutionList[j - 1]) {
                    temp = this.resolutionList[j];
                    tempNotch = this.notchList[j];
                    this.resolutionList[j] = this.resolutionList[j - 1];
                    this.notchList[j] = this.notchList[j - 1];
                    this.resolutionList[j - 1] = temp;
                    this.notchList[j - 1] = tempNotch;
                }
            }
        }
    }
};

/**
 * @public
 * @global
 * @function
 * @summary - Obtains the map level corresponding to the given map resolution
 * @param {tf.types.mapResolution} resolution - the given map resolution
 * @returns {tf.types.mapLevel} - | {@link tf.types.mapLevel} the corresponding map level
 * @deprecated This global function will soon be removed: use {@link tf.units.GetLevelByResolution} instead
*/
function TGetLevelByResolution(resolution) { return tf.units.GetLevelByResolution(resolution); }

/**
 * @public
 * @global
 * @function
 * @summary - Obtains the map resolution corresponding to the given map level
 * @param {tf.types.mapLevel} level - the given map level
 * @returns {tf.types.mapResolution} - | {@link tf.types.mapResolution} the corresponding map resolution
 * @deprecated This global function will soon be removed: use {@link tf.units.GetResolutionByLevel} instead
*/
function TGetResolutionByLevel(level) { return tf.units.GetResolutionByLevel(level); }

/**
 * @public
 * @global
 * @function
 * @summary - Obtains the minimum map level required to display the given map extent
 * @param {deprecatedMapCoords1} pointNW - the left top corner of the extent
 * @param {deprecatedMapCoords1} pointSE - the right bottom corner of the extent
 * @returns {tf.types.mapLevel} - | {@link tf.types.mapLevel} the minimum map level required to display the given map extent
 * @deprecated This global function will soon be removed: use {@link tf.units.GetBoundsZoomLevel} instead, with an updated map coordinate format
*/
function TGetBoundsZoomLevel(pointNW, pointSE, width, height) { return tf.units.GetBoundsZoomLevel([pointNW.longitude, pointNW.latitude], [pointSE.longitude, pointSE.latitude], width, height); }

/**
 * @public
 * @global
 * @function
 * @summary - Provides information about the Browser being used
 * @returns {tf.browser.Type} - | {@link tf.browser.Type} information about the browser being used
 * @deprecated This global function will soon be removed: use {@link tf.browser.Type} instead
*/
function TGetBrowserType() { return tf.browser.Type; }

/**
 * @public
 * @global
 * @function
 * @summary - Tests if the Browser being used is compatible with the TerraFly API
 * @returns {boolean} - | {@link boolean } <b>true</b> if the Browser is compatible, <b>false</b> otherwise
 * @deprecated This global function will soon be removed: use {@link tf.browser.IsCompatible} instead
*/
function TBrowserIsCompatible() { return tf.browser.IsCompatible(); }

/**
 * @public
 * @function
 * @summary - Helper function
 * @param {string} serviceUrl - the service url
 * @param {tf.types.latitude} Lat - the desired latitude
 * @param {tf.types.longitude} Lng - the desired longitude
 * @param {TAddressReturnAddressArrayCallback | TAddressReturnObjectCallback} callBack - the callback function, of a type compatible with the service being used
 * @returns {void} - | {@link void} no return value
 * @deprecated  This global function will soon be removed: use {@link tf.services.ReverseGeocoder} instead
*/
tf.helpers.GetAddressFromServiceByLatLng = function (serviceUrl, Lat, Lng, callBack) {
    var url = serviceUrl + "Lat=" + encodeURIComponent(Lat) + "&Lng=" + encodeURIComponent(Lng);
    return tf.js.RemoteScriptCall(url, callBack);
}

/**
 * A callback function that can be passed to the global function {@link TGetAddressByLatLngPro}
 * @public
 * @callback TAddressReturnAddressArrayCallback
 * @param {array} addressArray- an array of addresses
 * @param {string} errorMsg - an empty string when {@link TGetAddressByLatLngPro} is successful, otherwise an error message
 * @returns {void} - | {@link void} no return value
 */

/**
 * @public
 * @global
 * @function
 * @summary - Accesses a TerraFly service to obtain the address corresponding to the given latitude and longitude coordinates; calls the given call back function to report results
 * @param {tf.types.latitude} Lat - the desired latitude
 * @param {tf.types.longitude} Lng - the desired longitude
 * @param {TAddressReturnAddressArrayCallback} callBack - the callback function
 * @returns {void} - | {@link void} no return value
 * @deprecated  This global function will soon be removed: use {@link tf.services.ReverseGeocoder} instead
*/
function TGetAddressesByLatLngPro(Lat, Lng, callBack) {
    var strServer = "http://tfservice.cs.fiu.edu/AddByCoordinate/Default.aspx?";
    return tf.helpers.GetAddressFromServiceByLatLng(strServer, Lat, Lng, callBack);
}

/**
 * A callback function that can be passed to the global function {@link TGetAddressByLatLng}
 * @public
 * @callback TAddressReturnObjectCallback
 * @param {TAddressReturnObject} addressObject - the address object obtained from the remote service
 * @returns {void} - | {@link void} no return value
 */

/**
 * @public
 * @global
 * @function
 * @summary - Accesses a TerraFly service to obtain the address corresponding to the given latitude and longitude coordinates; calls the given call back function to report results
 * @param {tf.types.latitude} Lat - the desired latitude
 * @param {tf.types.longitude} Lng - the desired longitude
 * @param {TAddressReturnObjectCallback} callBack - the callback function
 * @returns {void} - | {@link void} no return value
 * @deprecated  This global function will soon be removed: use {@link tf.services.ReverseGeocoder} instead
*/
function TGetAddressByLatLng(Lat, Lng, callBack) {
    var strServer = "http://tfservice.cs.fiu.edu/AddByCoordinate/Compact.aspx?";
    return tf.helpers.GetAddressFromServiceByLatLng(strServer, Lat, Lng, callBack);
}

/**
 * A callback function that can be passed to the global function {@link TGetLatLngByAddress}
 * @public
 * @callback TGetLatLngByAddressCallBack
 * @param {tf.types.latitude} lat - the obtained latitude
 * @param {tf.types.longitude} lon - the obtained longitude
 * @param {string} errorMsg - an empty string when {@link TGetLatLngByAddress} is successful, otherwise an error message
 * @param {number} errorMsg - an empty string when {@link TGetLatLngByAddress} is successful, otherwise an error message
 * @returns {void} - | {@link void} no return value
 */

/**
 * @public
 * @global
 * @function
 * @summary - Accesses a TerraFly service to obtain the latitude and longitude coordinates corresponding to the given address; calls the given call back function to report results
 * @param {string} addressFull - the desired address
 * @param {TGetLatLngByAddressCallBack} callBack - the callback function
 * @returns {void} - | {@link void} no return value
 * @deprecated  This global function will soon be removed: use {@link tf.services.Geocoder} instead
*/
function TGetLatLngByAddress(addressFull, callBack) {
    /*var strServer = "http://tfservice.cs.fiu.edu/coordinatebyadd/Default.aspx?";
    var url = strServer + "street=" + encodeURIComponent(addressFull);
    //tf.GetDebug().LogIfTest(url);
    url = "http://vn4.cs.fiu.edu/cgi-bin/geocoder.cgi?street=hollywood%20fl";
    return tf.js.RemoteScriptCall(url, callBack);*/
    if (!!(callBack = tf.js.GetFunctionOrNull(callBack))) {
        new tf.services.Geocoder({
            address: addressFull, callBack: function (data) {
                var pointCoords = !!data ? data.pointCoords : [0, 0];
                callBack(pointCoords[1], pointCoords[0], data.errormsg, data.geocoderlevel);
            }
        });
    }
}

/**
 * A callback function that can be passed to the global functions {@link TGetAerialImagerySources_UTM} and {@link TGetAerialImagerySources}
 * @public
 * @callback TGetAerialImagerySourcesCallBack
 * @param {ResourceArray} resources - the obtained resources
 * @param {string} errorMsg - an empty string when {@link TGetAerialImagerySources_UTM} or {@link TGetAerialImagerySources} are successful, otherwise an error message
 * @returns {void} - | {@link void} no return value
 */

/**
 * @public
 * @global
 * @function
 * @summary - Accesses a TerraFly service to obtain information about the availability of TerraFly aerial image resources 
 * (see {@link Resources}) corresponding to the given UTM coordinates amd map resolution; calls the given call back function to report results
 * @param {number} X - the desired UTM X coordinate
 * @param {number} Y - the desired UTM Y coordinate
 * @param {number} utm - the desired UTM zone
 * @param {tf.types.mapResolution} res - the given map resolution
 * @param {TGetAerialImagerySourcesCallBack} callBack - the callback function
 * @returns {void} - | {@link void} no return value
 * @deprecated A replacement for this function is now available through the [Raster Source List Service]{@link tf.services.RasterSourceList} service

*/
function TGetAerialImagerySources_UTM(X, Y, utm, res, callBack) {
    var strServer = "http://tfcore.cs.fiu.edu/GetAerialImagerySources/Stage/default.aspx?";
    var url = strServer;
    url = url + "X=" + encodeURIComponent(X) + "";
    url = url + "&Y=" + encodeURIComponent(Y) + "";
    url = url + "&utm=" + encodeURIComponent(utm) + "";
    url = url + "&res=" + encodeURIComponent(res) + "";
    return tf.js.RemoteScriptCall(url, callBack);
}

/**
 * @public
 * @global
 * @function
 * @summary - Accesses a TerraFly service to obtain information about the availability of TerraFly aerial image resources 
 * (see {@link Resources}) corresponding to the given UTM coordinates amd map resolution; calls the given call back function to report results
 * @param {tf.types.longitude} lng - the desired longitude
 * @param {tf.types.latitude} lat - the desired latitude
 * @param {tf.types.mapResolution} res - the given map resolution
 * @param {TGetAerialImagerySourcesCallBack} callBack - the callback function
 * @returns {void} - | {@link void} no return value
 * @deprecated A replacement for this function is now available through the [Raster Source List Service]{@link tf.services.RasterSourceList} service
*/
function TGetAerialImagerySources(lng, lat, res, callBack) {
    var utm = tf.units.GdcToUtm([lng, lat]); TGetAerialImagerySources_UTM(utm[0], utm[1], utm[2], res, callBack);
}

/**
 * @public
 * @class
 * @summary Instances of this class are automatically created to receive data returned by remote services called via script insertion
 * @param {object} headElement - the script element 
 * @param {object} key - a unique identifier
 * @param {string} baseUrl - an url
 * @param {function} callBack - the callback function that will receive the data returned by the service
 * @deprecated Services using script injection are being updated, a replacement for this class will soon be available in the {@link tf.services} namespace
 */
tf.js.RemoteScriptCallReceiver = function (headElement, key, baseUrl, callBack) {
    var theThis = null;
    var theCallBack = null;
    var scriptID = null;
    var script = null;

    /**
     * @public
     * @function
     * @summary - Receives the response from the remote service
     * @param {...object} parameters - the parameters to be passed to the callback function
     * @returns {void} - | {@link void} no return value
    */
    this.ReceiveScriptResponse = function () { return receiveScriptResponse.apply(theThis, arguments); }

    function receiveScriptResponse() { removeScript(); if (!!theCallBack) { theCallBack.apply(null, arguments); } }
    function removeScript() {
        if (!!script) { var parentElem = script.parentNode; parentElem && (parentElem.removeChild(script)); }
    }

    function initialize() {
        if (!!(theCallBack = tf.js.GetFunctionOrNull(callBack)) && !!key && !!headElement) {
            var localCallBackStr = 'tf.js.GetRemoteScriptCallDispatcher().ReceiveScriptResponse(' + key + ')';

            script = document.createElement("script");
            script.id = scriptID = "TFScriptCallBack_" + key;
            script.defer = true;
            script.type = "text/javascript";
            script.src = baseUrl + "&CallBackFun=" + encodeURIComponent(localCallBackStr) + ("&SCRIPT_ID=" + scriptID) + "&a=" + Math.random();

            //tf.GetDebug().LogIfTest('calling remote service by script id:' + scriptID + ' url: ' + script.src);

            headElement.appendChild(script);
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * @public
 * @class
 * @summary A singleton instance of this class (see {@link tf.js.GetRemoteScriptCallDispatcher}) is used to dispatch requests to remote services using script insertion
 * @deprecated Services using script injection are being updated, a replacement for this class will soon be available in the {@link tf.services} namespace
 */
tf.js.RemoteScriptCallDispatcher = function () {
    var theThis = null;
    var headElement = null;
    var currentKey;
    var scriptCallResponseReceivers = null;

    /**
     * @public
     * @function
     * @summary - Initiates a request to a remove service via script insertion
     * @param {string} url - an url pointing to the remote service
     * @param {function} callBack - the callback function that will receive the data returned by the service
     * @returns {void} - | {@link void} no return value
    */
    this.DoScriptCall = function (url, callBack) {
        if (!!headElement) {
            scriptCallResponseReceivers[tf.js.MakeObjectKey(currentKey)] = new tf.js.RemoteScriptCallReceiver(headElement, currentKey, url, callBack);
            ++currentKey;
        }
    }

    /**
     * @public
     * @function
     * @summary - Receives the response from the remote service
     * @param {object} key - a unique identifier
     * @returns {void} - | {@link void} no return value
    */
    this.ReceiveScriptResponse = function (key) {
        var actualKey = tf.js.MakeObjectKey(key);
        var scriptCallResponseReceiver = scriptCallResponseReceivers[actualKey];
        if (!!scriptCallResponseReceiver) {
            delete scriptCallResponseReceivers[actualKey];
            return scriptCallResponseReceiver.ReceiveScriptResponse;
        }
        return dummyResponse;
    }

    function dummyResponse() { }

    function initialize() {
        headElement = document.getElementsByTagName("HEAD").item(0);
        scriptCallResponseReceivers = {};
        currentKey = 1;
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * @public
 * @function
 * @summary - Obtains the singleton instance of {@link tf.js.RemoteScriptCallDispatcher}
 * @returns {tf.js.RemoteScriptCallDispatcher} - | {@link tf.js.RemoteScriptCallDispatcher} the singleton instance
 * @deprecated Services using script injection are being updated, a replacement for this class will soon be available in the {@link tf.services} namespace
*/
tf.js.GetRemoteScriptCallDispatcher = function () { if (!tf.g_scriptCallDispatcher) { tf.g_scriptCallDispatcher = new tf.js.RemoteScriptCallDispatcher(); } return tf.g_scriptCallDispatcher; }

/**
 * @public
 * @function
 * @summary - Initiates a remote request via script insertion
 * @param {string} url - an url pointing to the remote service
 * @param {function} callBack - the callback function that will receive the data returned by the service
 * @returns {void} - | {@link void} no return value
 * @deprecated Services using script injection are being updated, a replacement for this class will soon be available in the {@link tf.services} namespace
*/
tf.js.RemoteScriptCall = function (url, callBack) { return tf.js.GetRemoteScriptCallDispatcher().DoScriptCall(url, callBack); }

/**
 * class TFHelpers
 * @public
 * @class
 * @namespace
 * @description TFHelpers is a deprecated namespace that will soon be removed.
*/
var TFHelpers = {};

/**
 * @public
 * @class
 * @summary An instance of this class is created to parse url parameters
 * @param {function} callBack - a callback function that will receive the parser url parameters
 * @param {string} url - a string containing an url with parameters, like <b>"http://server.fiu.edu/#a=1&b=2&c=test"</b>
 * @param {string} defaults - a string containing default url parameters
 * @deprecated This class has been superseeded by classes and functions available in the {@link tf.urlapi} namespace, and will soon be removed.
 */
TFHelpers.UrlParser = function (callBack, url, defaults) {

    var processingParamNum = 0;
    var parameters = null;

    /**
     * @private
     * @function
     * @summary - Retrieves the parsed parameters object
     * @returns {object} - | {@link object} the parsed parameters object
    */
    this.GetParameters = function () { return parameters; }

    function parseParameters() {

        parameters = defaults ? defaults : [];

        var indexSep;
        var urlParamString =
            ((indexSep = url.indexOf("?")) != -1) ? url.slice(indexSep + 1) :
                (((indexSep = url.indexOf("#")) != -1) ? url.slice(indexSep + 1) : "");
        var paramStringArray = urlParamString.split("&");
        var paramStringArrayLen = paramStringArray.length;
        var skipRemoteCalls = false;

        if (paramStringArrayLen) {

            for (var i = 0; i < paramStringArrayLen; ++i) {

                var equalIndex = paramStringArray[i].indexOf("=");

                if (equalIndex != -1) {

                    var key = paramStringArray[i].substring(0, equalIndex).toLowerCase();
                    var value = paramStringArray[i].substring(equalIndex + 1, paramStringArray[i].length);

                    parameters[key] = unescape(value);
                }
            }

            if (!skipRemoteCalls) {

                var paramsWithDDURLDD = [
                    TFConsts.paramNameLegend,
                    tf.consts.paramNameLegendH,
                    tf.consts.paramNameLegendM
                ];

                var paramsWithDDURLDDCount = paramsWithDDURLDD.length;

                if (paramsWithDDURLDDCount) {
                    for (var i = 0 ; i < paramsWithDDURLDDCount ; i++) {

                        var thisParamName = paramsWithDDURLDD[i];
                        var thisParam = parameters[thisParamName];

                        if (thisParam) {
                            processingParamNum++;
                            new tf.urlapi.URLPartsLoader(thisParamName, thisParam, onLoadedParamParts);
                        }
                    }
                }
                else { doCallBack(); }
            }
            else { doCallBack(); }
        }
    }

    function onLoadedParamParts(paramName, param) {

        parameters[paramName] = param;
        if (! --processingParamNum) { doCallBack(); }
    }

    function doCallBack() { setTimeout(doActualCallBack, 10); }

    function doActualCallBack() { callBack(parameters); }

    (function construct() { parseParameters(); })();
};

/**
 * @public
 * @typedef {object} deprecatedMapCoords1
 * @property {tf.types.latitude} latitude - the latitude
 * @property {tf.types.longitude} longitude - the longitude
 * @deprecated This format will soon be removed along with functions that support it. TerraFly applications should replace the 
 * use of these functions with current API functions that use the {@link tf.types.mapCoordinates} format
 */

/**
 * @public
 * @typedef {object} deprecatedMapCoords2
 * @property {tf.types.latitude} Lat - the latitude
 * @property {tf.types.longitude} Lon - the longitude
 * @deprecated This format will soon be removed along with functions that support it. TerraFly applications should replace the 
 * use of these functions with current API functions that use the {@link tf.types.mapCoordinates} format
 */

/**
 * @public
 * @typedef {object} deprecatedMapCoords3
 * @property {tf.types.latitude} lat - the latitude
 * @property {tf.types.longitude} lon - the longitude
 * @deprecated This format will soon be removed along with functions that support it. TerraFly applications should replace the 
 * use of these functions with current API functions that use the {@link tf.types.mapCoordinates} format
 */

/**
 * @public
 * @typedef {object} deprecatedMapCoords4
 * @property {tf.types.latitude} Latitude - the latitude
 * @property {tf.types.longitude} Longitude - the longitude
 * @deprecated This format will soon be removed along with functions that support it. TerraFly applications should replace the 
 * use of these functions with current API functions that use the {@link tf.types.mapCoordinates} format
 */

/**
 * @public
 * @typedef {object} deprecatedPixelCoords1
 * @property {number} X - horizontal pixel coordinate
 * @property {number} Y - vertical pixel coordinate
 * @deprecated This format will soon be removed along with functions that support it. TerraFly applications should replace the 
 * use of these functions with current API functions that use the {@link tf.types.mapCoordinates} format
 */

/**
 * Map extent format used by legacy MAP-API {@link TMap} instances
 * @public
 * @typedef {object} deprecatedMapExtent
 * @property {tf.types.longitude} longitude1 - the minimum longitude
 * @property {tf.types.latitude} latitude1 - the maximum latitude
 * @property {tf.types.longitude} longitude2 - the maximum longitude
 * @property {tf.types.latitude} latitude2 - the minimum latitude
 * @deprecated This format will soon be removed along with functions that support it. TerraFly applications should replace the 
 * use of these functions with current API functions that use the {@link tf.types.mapExtent} format
 */

/**
 * A callback function that can be passed to certain deprecated {@link TMap} AddOn... listener functions
 * @public
 * @callback TMapLatLonCallBack
 * @param {tf.types.latitude} latitude - the map latitude where the event occurred
 * @param {tf.types.longitude} longitude - the map longitude where the event occurred
 * @returns {void} - | {@link void} no return value
 */

/**
 * A callback function that can be passed to certain deprecated {@link TMap} AddOn... listener functions
 * @public
 * @callback TMapLevelCallBack
 * @param {tf.types.mapLevel} level - the map level associated with the event
 * @returns {void} - | {@link void} no return value
 */

/**
 * A callback function that can be passed to certain deprecated {@link TMap} AddOn... listener functions
 * @public
 * @callback TMapTypeCallBack
 * @param {tf.types.mapType} type - the map type associated with the event
 * @returns {void} - | {@link void} no return value
 */

/**
 * @public
 * @global
 * @class
 * @summary This is the <b>legacy MAP-API TMap class</b>, which has been replaced by the {@link tf.map.Map} class, and will soon be removed
 * @param {HTMLElementLike} container - the HTML container where the map is created
 * @param {tf.types.latitude} latitude - the initial map center latitude, defaults to {@link tf.consts.defaultLatitude}
 * @param {tf.types.longitude} longitude - the initial map center longitude, defaults to {@link tf.consts.defaultLongitude}
 * @param {tf.types.mapLevel} level - the initial map level, defaults to {@link tf.consts.defaultLevel}
 * @param {function} onCreatedCallBack - called when map creation is complete
 * @param {void} deprecated1 - legacy parameter placeholder
 * @param {void} deprecated2 - legacy parameter placeholder
 * @param {tf.types.mapEngine} mapEngine - the Vector Tile engine, defaults to {@link tf.consts.mapnik2Engine}
 * @param {tf.types.mapType} initMapType - the initial map type, defaults to {@link tf.consts.typeNameHybrid}
 * @param {tf.types.mapAerialSource} mapAerialSource - the source of aerial tiles used by the map, defaults to {@link tf.consts.sourceName_best_available}
 * @param {void} deprecated3 - legacy parameter placeholder
 * @deprecated  This global class will soon be removed: use {@link tf.map.Map} instead
 * @extends {tf.map.Map}
*/
var TMap = function (
    container,
    latitude,
    longitude,
    level,
    onCreatedCallBack,
    deprecated1,
    deprecated2,
    mapEngine,
    initMapType,
    mapAerialSource,
    deprecated3) {

    var theThis = null, onCallBackCall = null, msgContents = '', allOldListeners = null;

    /**
     * @public
     * @function
     * @summary - Shows or hides a map panel
     * @param {tf.types.mapPanelName} strPanel - the map panel
     * @param {tf.types.mapPanelVisibilityState} strVis - the desired visibility state
     * @returns {void} - | {@link void} no return value
     * @deprecated  This function will soon be removed: use [ShowPanel]{@link tf.map.Map#ShowPanel} instead
    */
    this.SetPanelVisibility = function (strPanel, strVis) {
        if (tf.js.GetIsNonEmptyString(strVis)) {
            var isHidden = tf.consts.strHidePanel.toLowerCase() == strVis.toLowerCase();
            theThis.ShowPanel(strPanel, !isHidden);
        }
    }

    /**
     * @public
     * @function
     * @summary - Retrieves the current visibility state of a map panel
     * @param {tf.types.mapPanelName} strPanel - the map panel
     * @returns {boolean} - | {@link boolean} <b>true</b> if the panel is visible, <b>false</b> otherwise
     * @deprecated  This function will soon be removed: use [IsPanelShowing]{@link tf.map.Map#IsPanelShowing} instead
    */
    this.GetPanelVisibility = function (strPanel) { return theThis.IsPanelShowing(strPanel); }

    /**
     * @public
     * @function
     * @summary - Sets a the value of a string used by the map when interacting with some TerraFly services
     * @param {string} tfPassThroughString - the string value
     * @returns {void} - | {@link void} no return value
     * @deprecated There is a misspelling in this function's name and it will soon be removed: use [SetTFPassThroughString]{@link tf.map.Map#SetTFPassThroughString} instead
    */
    this.SetTFPassTroughString = function (tfPassThroughString) { return theThis.SetTFPassThroughString(tfPassThroughString); }

    /**
     * @public
     * @function
     * @summary - Sets the map type 
     * @param {tf.types.mapType} type - the map type
     * @returns {void} - | {@link void} no return value
     * @deprecated This function will soon be removed: use [SetMapType]{@link tf.map.Map#SetMapType} instead
    */
    this.MapMode = function (type) { theThis.SetMapType(type); }

    /**
     * @public
     * @function
     * @summary - Adds a listener for the {@link tf.consts.mapMoveEndEvent} event
     * @param {TMapLatLonCallBack} callBack - the callback for event notifications
     * @returns {tf.events.EventListener} - | {@link tf.events.EventListener} the event listener
     * @deprecated Individual listener creation will soon be removed, use [AddListener]{@link tf.map.Map#AddListener} or [AddListeners]{@link tf.map.Map#AddListeners} instead
    */
    this.AddOnMoveEndListener = function (callBack) { return addOldFormatListener(tf.consts.mapMoveEndEvent, callBack); }

    /**
     * @public
     * @function
     * @summary - Adds a listener for the {@link tf.consts.mapMouseMoveEvent} event
     * @param {TMapLatLonCallBack} callBack - the callback for event notifications
     * @returns {tf.events.EventListener} - | {@link tf.events.EventListener} the event listener
     * @deprecated Individual listener creation will soon be removed, use [AddListener]{@link tf.map.Map#AddListener} or [AddListeners]{@link tf.map.Map#AddListeners} instead
    */
    this.AddOnRollOverListener = function (callBack) { return addOldFormatListener(tf.consts.mapMouseMoveEvent, callBack); }

    /**
     * @public
     * @function
     * @summary - Adds a listener for the {@link tf.consts.mapClickEvent} event
     * @param {TMapLatLonCallBack} callBack - the callback for event notifications
     * @returns {tf.events.EventListener} - | {@link tf.events.EventListener} the event listener
     * @deprecated Individual listener creation will soon be removed, use [AddListener]{@link tf.map.Map#AddListener} or [AddListeners]{@link tf.map.Map#AddListeners} instead
    */
    this.AddOnClickListener = function (callBack) { return addOldFormatListener(tf.consts.mapClickEvent, callBack); }

    /**
     * @public
     * @function
     * @summary - Adds a listener for the {@link tf.consts.mapDblClickEvent} event
     * @param {TMapLatLonCallBack} callBack - the callback for event notifications
     * @returns {tf.events.EventListener} - | {@link tf.events.EventListener} the event listener
     * @deprecated Individual listener creation will soon be removed, use [AddListener]{@link tf.map.Map#AddListener} or [AddListeners]{@link tf.map.Map#AddListeners} instead
    */
    this.AddOnDoubleClickListener = function (callBack) { return addOldFormatListener(tf.consts.mapDblClickEvent, callBack); }

    /**
     * @public
     * @function
     * @summary - Adds a listener for the {@link tf.consts.mapLevelChangeEvent} event
     * @param {TMapLevelCallBack} callBack - the callback for event notifications
     * @returns {tf.events.EventListener} - | {@link tf.events.EventListener} the event listener
     * @deprecated Individual listener creation will soon be removed, use [AddListener]{@link tf.map.Map#AddListener} or [AddListeners]{@link tf.map.Map#AddListeners} instead
    */
    this.AddOnZoomEndListener = function (callBack) { return addOldFormatListener(tf.consts.mapLevelChangeEvent, callBack); }

    /**
     * @public
     * @function
     * @summary - Adds a listener for the {@link tf.consts.mapTypeChangeEvent} event
     * @param {TMapTypeCallBack} callBack - the callback for event notifications
     * @returns {tf.events.EventListener} - | {@link tf.events.EventListener} the event listener
     * @deprecated Individual listener creation will soon be removed, use [AddListener]{@link tf.map.Map#AddListener} or [AddListeners]{@link tf.map.Map#AddListeners} instead
    */
    this.AddOnModeChangeListener = function (callBack) { return addOldFormatListener(tf.consts.mapTypeChangeEvent, callBack); }

    /**
     * @public
     * @function
     * @summary - Adds a listener for the {@link tf.consts.mapFullScreenEvent} event
     * @param {TMapLatLonCallBack} callBack - the callback for event notifications
     * @returns {tf.events.EventListener} - | {@link tf.events.EventListener} the event listener
     * @deprecated Individual listener creation will soon be removed, use [AddListener]{@link tf.map.Map#AddListener} or [AddListeners]{@link tf.map.Map#AddListeners} instead
    */
    this.AddOnFullScreenListener = function (callBack) { return addOldFormatListener(tf.consts.mapFullScreenEvent, callBack); }

    /**
     * @public
     * @function
     * @summary - Removes an event listener
     * @param {tf.events.EventListener} theListener - the event listener to be removed
     * @returns {void} - | {@link void} no return value
     * @deprecated To remove an instance of {@link tf.events.EventListener} call the instance's [OnDelete]{@link tf.events.EventListener#OnDelete} function directly
    */
    this.RemoveListener = function (theListener) { if (theListener instanceof tf.events.EventListener) { theListener.OnDelete(); } }

    /**
     * @public
     * @function
     * @summary - This type of event listener is no longer available
     * @param {function} callBack - the callback for event notifications
     * @returns {null} - | {@link null} an invalid event listener
     * @deprecated
    */
    this.AddOnFlyEndListener = function (callBack) { return addOldFormatListener(tf.consts.mapAnimationEndEvent, callBack); }

    /**
     * @public
     * @function
     * @summary - This type of event listener is no longer available
     * @param {function} callBack - the callback for event notifications
     * @returns {null} - | {@link null} an invalid event listener
     * @deprecated
    */
    this.AddOnLegendChangeListener = function (callBack) { return null; }

    /**
     * @public
     * @function
     * @summary - This type of event listener is no longer available
     * @param {function} callBack - the callback for event notifications
     * @returns {null} - | {@link null} an invalid event listener
     * @deprecated
    */
    this.AddOnFlyCrashedListener = function (callBack) { return null; }

    /**
     * @public
     * @function
     * @summary - This type of event listener is no longer available
     * @param {function} callBack - the callback for event notifications
     * @returns {null} - | {@link null} an invalid event listener
     * @deprecated
    */
    this.AddOnTileAddedListener = function (callBack) { return null; }

    /**
     * @public
     * @function
     * @summary - This type of event listener is no longer available
     * @param {function} callBack - the callback for event notifications
     * @returns {null} - | {@link null} an invalid event listener
     * @deprecated
    */
    this.AddOnTileRemovedListener = function (callBack) { return null; }

    /**
     * @public
     * @function
     * @summary - This type of event listener is no longer available
     * @param {function} callBack - the callback for event notifications
     * @returns {null} - | {@link null} an invalid event listener
     * @deprecated
    */
    this.AddDebugListener = function (callBack) { return null; }

    /**
     * @public
     * @function
     * @summary - Shows the Information Popup
     * @param {tf.types.latitude} latitude - the latitude associated with the popup
     * @param {tf.types.longitude} longitude - the longitude associated with the popup
     * @param {void} deprecated1 - ignored
     * @param {string} title - Title of the popup
     * @param {HTMLContent} content - Content of the popup
     * @returns {void} - | {@link void} no return value
     * @deprecated This function will soon be removed: use [ShowInfoPopup]{@link tf.map.Map#ShowInfoPopup} instead
    */
    this.ShowInfoWindow = function (latitude, longitude, deprecated1, title, content) { theThis.ShowInfoPopup(title, content, [longitude, latitude]); }

    /**
     * @public
     * @function
     * @summary - Hides the Information Popup
     * @returns {void} - | {@link void} no return value
     * @deprecated This function will soon be removed: use [HideInfoPopup]{@link tf.map.Map#HideInfoPopup} instead
    */
    this.HideInfoWindow = function () { return theThis.HideInfoPopup(); }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.ShowInfoWindowTabs = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.ViewDebugPanel = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.ViewTileURL = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.ShowAreaSelector = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.HideAreaSelector = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.GetOverlayComposite = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.GetColorByLatLng = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.SetMapOnAreaSelectedListener = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.SetBorderVisibility = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.SetPanelPosition = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.SetZoomPanelMode = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.GetFPS = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.SetFPS = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.SetMessageAlpha = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.MBFadeAni = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.MBFadeCheck = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.SetFlyMode = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.PauseFly = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.ContinueFly = function () { }

    /**
     * @public
     * @function
     * @summary - Sets contents that will be displayed the next time the function [ShowMessageBar]{@link TMap.Map#ShowMessageBar} is called
     * @param {HTMLElementLike} contents - the contents to be displayed
     * @returns {void} - | {@link void} no return value
     * @deprecated This function will soon be removed: use [ShowMessage]{@link tf.map.Map#ShowMessage} instead
    */
    this.SetMessageText = function (contents) { msgContents = contents; }

    /**
     * @public
     * @function
     * @summary - Shows the Message Popup
     * @returns {void} - | {@link void} no return value
     * @deprecated This function will soon be removed: use [ShowMessage]{@link tf.map.Map#ShowMessage} instead
    */
    this.ShowMessageBar = function () { theThis.ShowMessage(msgContents); }

    /**
     * @public
     * @function
     * @summary - Hides the Information Popup
     * @returns {void} - | {@link void} no return value
     * @deprecated This function will soon be removed: use [HideMessage]{@link tf.map.Map#HideMessage} instead
    */
    this.HideMessageBar = function () { return theThis.HideMessage(); }

    /**
     * @public
     * @function
     * @summary - Sets the time after which the message popup automatically hides itself
     * @param {number} timeoutSecs - the time in seconds
     * @returns {void} - | {@link void} no return value
     * @deprecated This function will soon be removed: use [SetMessageTimeout]{@link tf.map.Map#SetMessageTimeout} instead
    */
    this.SetMessageBarInterval = function (timeoutSecs) { return theThis.SetMessageTimeout(timeoutSecs); }

    /**
     * @public
     * @function
     * @summary - Checks if the map is performing an animation
     * @returns {boolean} - | {@link boolean} <b>true</b> if an animation is in progress, <b>false</b> otherwise
     * @deprecated This function will soon be removed: use [GetIsAnimating]{@link tf.map.Map#GetIsAnimating} instead
    */
    this.GetFlyMode = function () { return theThis.GetIsAnimating(); }

    /**
     * @public
     * @function
     * @summary - Stops an ongoing map animation
     * @returns {void} - | {@link void} no return value
     * @deprecated This function will soon be removed: use [EndAnimation]{@link tf.map.Map#EndAnimation} instead
    */
    this.StopFly = function () { return theThis.EndAnimation(); }

    /**
     * @public
     * @function
     * @summary - Adds a legacy MAP-API [TLayer]{@link TLayer} instance
     * @param {string} strLayerName - the layer name
     * @param {string} strLayerDesc - the layer description
     * @param {boolean} isChecked - <b>true</b> to create a visible layer, <b>false</b> to create a hidden layer
     * @param {boolean} isSecret - <b>true</b> to prevent the layer name from being displayed in the Map Layers popup,<b>false</b> to display it in the popup
     * @param {color} layerColor - legacy parameter no longer used
     * @returns {TLayer} - | {@link TLayer} the legacy TLayer instance
     * @deprecated This function will soon be removed: use [AddFeatureLayer]{@link tf.map.Map#AddFeatureLayer} instead
    */
    this.AddLayer = function (strLayerName, strLayerDesc, isChecked, isSecret, layerColor) {
        return theThis.deprecatedAddLegacyLayer({
            name: strLayerName, description: strLayerDesc, isVisible: isChecked, isHidden: isSecret, color: layerColor
        });
    }

    /**
     * @public
     * @function
     * @summary - Notifies the map that its container may have been resized
     * @returns {void} - | {@link void} no return value
     * @deprecated This function will soon be removed: use [OnResize]{@link tf.map.Map#OnResize} instead
    */
    this.SetSize = function () { return theThis.OnResize(); }

    /**
     * @public
     * @function
     * @summary - Obtains the size of the map in pixels
     * @returns {deprecatedPixelCoords1} - | {@link deprecatedPixelCoords1} the map size in pixels
     * @deprecated This function will soon be removed: use [OnResize]{@link tf.map.Map#GetPixelSize} instead
    */
    this.GetSize = function () { var pixelSize = theThis.GetPixelSize(); return { X: pixelSize[0], Y: pixelSize[1] }; }

    /**
     * @public
     * @function
     * @summary - Adds a legacy MAP-API [TButton]{@link TButton} instance
     * @param {number} buttonX - horizontal pixel coordinates
     * @param {number} buttonY - vertical pixel coordinates
     * @param {string} buttonIconURL - url to button image background
     * @returns {TButton} - | {@link TButton} the legacy TButton instance
     * @deprecated This function will soon be removed: use instances of [Map HTML Controls]{@link tf.map.HTMLControl} instead
    */
    this.AddCustomizedButton = function (buttonX, buttonY, buttonIconURL) { return addCustomizedButton(buttonX, buttonY, buttonIconURL); }

    /**
     * @public
     * @function
     * @summary - Recenters the map to the given coordinates
     * @param {tf.types.latitude} latitude - the new map center latitude
     * @param {tf.types.longitude} longitude - the new map center longitude
     * @returns {void} - | {@link void} no return value
     * @deprecated This function will soon be removed: use [SetCenter]{@link tf.map.Map#SetCenter} instead
    */
    this.PanTo = function (latitude, longitude) { return theThis.SetCenter([longitude, latitude]); }

    /**
     * @public
     * @function
     * @summary - Incrementally recenters the map to the given coordinates 
     * @param {tf.types.latitude} latitude - the new map center latitude
     * @param {tf.types.longitude} longitude - the new map center longitude
     * @param {number} speed - the duration of the animation, in milliseconds
     * @param {TMapLatLonCallBack} callBack - if defined, receives a notification when the animation ends
     * @returns {void} - | {@link void} no return value
     * @deprecated This function will soon be removed: use [AnimatedSetCenter]{@link tf.map.Map#AnimatedSetCenter} instead
    */
    this.PanToAni = function (latitude, longitude, speed, callBack) {
        function sendDeprecatedNotification(notification) { callBack(notification.eventCoords[1], notification.eventCoords[0]); }
        if (!(callBack = tf.js.GetFunctionOrNull(callBack))) { sendDeprecatedNotification = null; }
        return theThis.AnimatedSetCenter([longitude, latitude], sendDeprecatedNotification, speed, true, tf.units.EaseLinear);
    }

    /**
     * @public
     * @function
     * @summary - Recenters the map to the given coordinates and changes the map level to the given level
     * @param {tf.types.latitude} latitude - the new map center latitude
     * @param {tf.types.longitude} longitude - the new map center longitude
     * @param {tf.types.mapLevel} level - the new map level
     * @returns {void} - | {@link void} no return value
     * @deprecated This function will soon be removed: use [SetCenterAndLevel]{@link tf.map.Map#SetCenterAndLevel} instead
    */
    this.CenterTo = function (latitude, longitude, level) { return theThis.SetCenterAndLevel([longitude, latitude], level); }

    /**
     * @public
     * @function
     * @summary - Sets the map level
     * @param {tf.types.mapLevel} level - the desired map level
     * @returns {void} - | {@link void} no return value
     * @deprecated This function will soon be removed: use [SetLevel]{@link tf.map.Map#SetLevel} instead
    */
    this.ZoomTo = function (level) { theThis.SetLevel(level); }

    /**
     * @public
     * @function
     * @summary - Incrementally changes the map level to the given level
     * @param {tf.mapLevel} newLevel - the desired new level
     * @param {TMapLevelCallBack} callBack - to receive a notification when the animation ends
     * @returns {void} - | {@link void} no return value
     * @deprecated This function will soon be removed: use [AnimatedSetLevel]{@link tf.map.Map#AnimatedSetLevel} instead
    */
    this.ZoomToAni = function (newLevel, callBack) {
        function sendDeprecatedNotification(notification) { callBack(notification.level); }
        if (!(callBack = tf.js.GetFunctionOrNull(callBack))) { sendDeprecatedNotification = null; }
        return theThis.AnimatedSetLevel(newLevel, sendDeprecatedNotification, undefined, true, tf.units.EaseLinear);
    }

    /**
     * @public
     * @function
     * @summary - Moves the map center by a pixel offset
     * @param {number} xPixel - horizontal pixel offset
     * @param {number} yPixel - vertical pixel offset
     * @returns {void} - | {@link void} no return value
     * @deprecated This function will soon be removed: use [PanByPixelOffset]{@link tf.map.Map#PanByPixelOffset} instead
    */
    this.MoveOffsetPixel = function (xPixel, yPixel) { theThis.PanByPixelOffset([xPixel, yPixel]); }

    /**
     * @public
     * @function
     * @summary - Translates the given pixel coordinates into map coordinates
     * @param {number} xPixel - horizontal pixel coordinate
     * @param {number} yPixel - vertical pixel coordinate
     * @returns {deprecatedMapCoords2} - | {@link deprecatedMapCoords2} the map coordinates
     * @deprecated This function will soon be removed: use [PixelToMapCoords]{@link tf.map.Map#PixelToMapCoords} instead
    */
    this.ScreenToGlobal = function (xPixel, yPixel) {
        var obj = theThis.PixelToMapCoords([xPixel, yPixel]);
        if (!!obj) {
            obj.Lat = obj[1];
            obj.Lon = obj[0];
        }
        return obj;
    }

    /**
     * @public
     * @function
     * @summary - Translates the given map coordinates into pixel coordinates
     * @param {tf.types.latitude} Lat - map latitude coordinate
     * @param {tf.types.longitude} Lng - map longitude coordinate
     * @returns {deprecatedPixelCoords1} - | {@link deprecatedPixelCoords1} the pixel coordinates
     * @deprecated This function will soon be removed: use [MapToPixelCoords]{@link tf.map.Map#MapToPixelCoords} instead
    */
    this.GlobalToScreen = function (Lat, Lng) { var pixelCoords = theThis.MapToPixelCoords([Lng, Lat]); return { X: pixelCoords[0], Y: pixelCoords[1] }; }

    /**
     * @public
     * @function
     * @summary - Retrieves the visible map extent
     * @returns {deprecatedMapExtent} - | {@link deprecatedMapExtent} the map extent
     * @deprecated This function will soon be removed: use [GetVisibleExtent]{@link tf.map.Map#GetVisibleExtent} instead
    */
    this.GetBounds = function () { var extent = theThis.GetVisibleExtent(); return { longitude1: extent[0], latitude1: extent[3], longitude2: extent[2], latitude2: extent[1] }; }

    /**
     * @public
     * @function
     * @summary - Sets the visible map extent
     * @param {deprecatedMapExtent} extent - the new map extent
     * @returns {void} - | {@link void} no return value
     * @deprecated This function will soon be removed: use [SetVisibleExtent]{@link tf.map.Map#SetVisibleExtent} instead
    */
    this.SetBounds = function (extent) { if (tf.js.GetIsValidObject(extent)) { theThis.SetVisibleExtent([extent.longitude1, extent.latitude2, extent.longitude2, extent.latitude1]); } }

    function onCallBack() { onCallBackCall(theThis); }

    function addCustomizedButton(buttonX, buttonY, buttonIconURL) {
        var newElement = document.createElement('img');

        newElement.style.left = buttonX + "px";
        newElement.style.top = buttonY + "px";
        newElement.style.position = 'absolute';
        newElement.style.zIndex = zIndex + 5;
        newElement.src = buttonIconURL;

        mapContainerAll.appendChild(newElement);

        return new TButton(newElement);
    }

    function onOldNotificationListener(eventName, notification) {
        switch (eventName) {
            case tf.consts.mapMoveEndEvent:
            case tf.consts.mapMouseMoveEvent:
            case tf.consts.mapClickEvent:
            case tf.consts.mapDblClickEvent:
                allOldListeners.Notify(eventName, notification.eventCoords[1], notification.eventCoords[0], notification.sender);
                break;
            case tf.consts.mapTypeChangeEvent:
                allOldListeners.Notify(eventName, notification.newType, notification.sender);
                break;
            case tf.consts.mapLevelChangeEvent:
                allOldListeners.Notify(eventName, notification.level, notification.sender);
                break;
            case tf.consts.mapFullScreenEvent:
                allOldListeners.Notify(notification.sender);
                break;
            default:
                tf.GetDebug().LogIfTest("deprecated map notification for unsupported event: " + eventName);
                break;
        }
    }

    function useOldListenerForEvent(eventName) {
        var useOldListener = false;
        switch (eventName) {
            case tf.consts.mapMoveEndEvent:
            case tf.consts.mapMouseMoveEvent:
            case tf.consts.mapClickEvent:
            case tf.consts.mapDblClickEvent:
            case tf.consts.mapTypeChangeEvent:
            case tf.consts.mapLevelChangeEvent:
            case tf.consts.mapFullScreenEvent:
                useOldListener = true;
                break;
            default: break;
        }
        return useOldListener;
    }

    function addOldFormatListener(eventName, callbackFunction) {
        var listener = null;
        var useOldListener = useOldListenerForEvent(eventName);

        if (useOldListener) {
            if (tf.js.GetIsNonEmptyString(eventName) && tf.js.GetFunctionOrNull(callbackFunction)) {
                var listenerSet = allOldListeners.GetNotifier(eventName);
                if (!!listenerSet) { listener = listenerSet.Add(callbackFunction); }
            }
        }
        else { listener = theThis.AddListener(eventName, callbackFunction); }
        return listener;
    }

    function makeOldNotificationCallBack(eventName) { return function (notification) { return onOldNotificationListener(eventName, notification) }; }

    function initialize() {
        var allMapEventNames = tf.consts.allMapEventNames;
        allOldListeners = new tf.events.MultiEventNotifier({ eventNames: allMapEventNames });
        var settings = {
            container: container,
            center: [longitude, latitude],
            mapType: initMapType,
            mapAerialSource: mapAerialSource,
            mapEngine: mapEngine
        };

        if (level > 0) { settings.level = level; } else { settings.resolution = -level; }

        tf.map.Map.call(theThis, settings);

        var eventNamesAndCallBacks = {};
        for (var i in allMapEventNames) {
            var thisEventName = allMapEventNames[i];
            if (useOldListenerForEvent(thisEventName)) {
                eventNamesAndCallBacks[thisEventName] = makeOldNotificationCallBack(thisEventName);
            }
        }
        theThis.AddListeners(eventNamesAndCallBacks);

        if (onCallBackCall = tf.js.GetFunctionOrNull(onCreatedCallBack)) { setTimeout(onCallBack, 100); }
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(TMap, tf.map.Map);

/**
 * @public
 * @typedef {object} deprecatedPolygonCoords
 * A string containing Polygon vertex coordinates in the format: "Lat1,Lon1;Lat2,Lon2;...LatN,LonN", optionally grouped and nested inside paranthesis: ((Lat1,Lon1;Lat2,Lon2;...LatM,LonM),(Lat1,Lon1;Lat2,Lon2;...LatN,LonN))
 * @deprecated This format will soon be removed along with the legacy MAP-API [TPolygon]{@link TPolygon] class. TerraFly applications
 * should use [Map Features]{@link tf.map.Feature} instead
 */

/**
 * @public
 * @global
 * @class
 * @summary This is the <b>legacy MAP-API TLayer class</b>, which has been replaced by the {@link tf.map.FeatureLayer} class, and will soon be removed. 
 * Instances of this class are created by calling the function [AddLayer]{@link TMap#AddLayer} of a [TMap]{@link TMap} instance
 * @deprecated  This global class will soon be removed: use {@link tf.map.FeatureLayer} instead
 * @extends {tf.map.FeatureLayer}
*/
var TLayer = function (settings) {
    var theThis, debug, markers, polygons, groundTiles;
    var hasEnclosureRegExp = new RegExp(/ENCLOSURE=TRUE/i);

    /**
     * @public
     * @function
     * @summary - Adds a legacy MAP-API [TMarker]{@link TMarker} instance
     * @param {tf.types.latitude} latitude - the latitude
     * @param {tf.types.longitude} longitude - the longitude
     * @param {string} label - the label to be displayed on the map at the marker's coordinates
     * @param {tf.types.MapFeatureStyleSettings|deprecatedPropertyString} strStyleOrObj - map feature style settings
     * @returns {TMarker} - | {TMarker} the added instance
     * @deprecated This function will soon be removed: use [AddMapFeature]{@link tf.map.FeatureLayer#AddMapFeature} instead
    */
    this.AddMarker = function (latitude, longitude, label, strStyleOrObj) {
        (!label || typeof label !== "string" || !label.length) && (label = '');
        return addMarker(latitude, longitude, { marker: true, label: label }, strStyleOrObj);
    }

    /**
     * @public
     * @function
     * @summary - Adds a legacy MAP-API [TMarker]{@link TMarker} instance
     * @param {tf.types.latitude} latitude - the latitude
     * @param {tf.types.longitude} longitude - the longitude
     * @param {string} url - the url to an image to be displayed on the map at the marker's coordinates
     * @param {tf.types.MapFeatureStyleSettings|deprecatedPropertyString} strStyleOrObj - map feature style settings
     * @returns {TMarker} - | {TMarker} the added instance
     * @deprecated This function will soon be removed: use [AddMapFeature]{@link tf.map.FeatureLayer#AddMapFeature} instead
    */
    this.AddImgMarker = function (latitude, longitude, url, strStyleOrObj) {
        if (!tf.js.GetIsNonEmptyString(url)) { return theThis.AddMarker(latitude, longitude, null); }
        return addMarker(latitude, longitude, { icon: true, icon_url: url }, strStyleOrObj);
    }

    /**
     * @public
     * @function
     * @summary - Updates the style of all markers
     * @param {tf.types.MapFeatureStyleSettings|deprecatedPropertyString} strStyleOrObj - map feature style settings
     * @returns {void} - | {@link void} no return value
    */
    this.SetAllMarkersStyle = function (strStyleOrObj) { if (typeof strStyleOrObj == "string" || typeof strStyleOrObj === "object") { for (var i in markers) { markers[i].SetMarkerStyle(strStyleOrObj); } } }

    /**
     * @public
     * @function
     * @summary - Removes the marker
     * @param {TMarker} marker - the marker
     * @returns {void} - | {@link void} no return value
    */
    this.RemoveMarker = function (marker) { if (marker) { var indexOf = markers.indexOf(marker); if (indexOf != -1) { marker.SetVisible(false); markers.splice(indexOf, 1); } } }

    /**
     * @public
     * @function
     * @summary - Adds a legacy MAP-API [TPolygon]{@link TPolygon} instance
     * @param {deprecatedPolygonCoords} strPoints - parameter description?
     * @param {tf.types.MapFeatureStyleSettings|deprecatedPropertyString} strStyleOrObj - map feature style settings
     * @returns {TPolygon} - | {TPolygon} the added instance
     * @deprecated This function will soon be removed: use [AddMapFeature]{@link tf.map.FeatureLayer#AddMapFeature} instead
    */
    this.AddPolygon = function (strPoints, strStyleOrObj) { return addPolygon(strPoints, tf.helpers.GetMultiCoordsFromLatLonString(strPoints), strStyleOrObj); }

    /**
     * @public
     * @function
     * @summary - Removes the polygon
     * @param {TPolygon} polygon - the polygon
     * @returns {void} - | {@link void} no return value
    */
    this.RemovePolygon = function (polygon) { if (polygon instanceof TPolygon) { var indexOf = polygons.indexOf(polygon); if (indexOf != -1) { polygon.SetVisible(false); polygons.splice(indexOf, 1); } } }

    /**
     * @public
     * @function
     * @summary - Adds a legacy MAP-API [TGroundTile]{@link TGroundTile} instance
     * @param {string} url - the url to an image to be displayed on the map bounded by the given map coordinates
     * @param {tf.types.latitude} latitudeLT - left top latitude
     * @param {tf.types.longitude} longtitudeLT - left top longitude
     * @param {tf.types.latitude} latitudeRB - right bottom latitude
     * @param {tf.types.longitude} longtitudeRB - right bottom longitude
     * @returns {TGroundTile} - | {TGroundTile} the added instance
     * @deprecated This function will soon be removed: use [AddMapFeature]{@link tf.map.FeatureLayer#AddMapFeature} instead
    */
    this.AddGroundTile = function (url, latitudeLT, longtitudeLT, latitudeRB, longtitudeRB) { return new TGroundTile(theThis.GetMap(), theThis, url, latitudeLT, longtitudeLT, latitudeRB, longtitudeRB); }

    /**
     * @public
     * @function
     * @summary - Removes the ground tile
     * @param {TGroundTile} groundTile - the ground tile
     * @returns {void} - | {@link void} no return value
    */
    this.RemoveGroundTile = function (groundTile) { if (groundTile) { var indexOf = groundTiles.indexOf(groundTile); if (indexOf != -1) { groundTile.SetVisible(false); groundTiles.splice(indexOf, 1); } } }

    /**
     * @public
     * @function
     * @summary - Removes all features from the layer
     * @returns {void} - | {@link void} no return value
    */
    this.Clean = function () { theThis.RemoveAllFeatures(); markers = []; polygons = []; groundTiles = []; }

    function addMarker(latitude, longitude, settings, strStyleOrObj) {
        longitude = tf.js.GetLongitudeFrom(longitude);
        latitude = tf.js.GetLatitudeFrom(latitude);
        if (!tf.js.GetIsValidObject(strStyleOrObj)) { strStyleOrObj = tf.js.GetIsNonEmptyString(strStyleOrObj) ? tf.js.ParseLegacyFormatString(strStyleOrObj) : {}; }
        var mapFeature = new tf.map.Feature({ type: "point", coordinates: [longitude, latitude], style: tf.js.ShallowMerge(strStyleOrObj, settings) });
        var tMarker = new TMarker(theThis, mapFeature);
        theThis.AddMapFeature(mapFeature, false);
        markers.push(tMarker);
        return tMarker;
    }

    function getPolyGeometryType(strPoints, strStyleOrObj) {
        var isEnclosure = typeof strStyleOrObj === "string" ? hasEnclosureRegExp.test(strStyleOrObj) : (typeof strStyleOrObj === "object" ? !!strStyleOrObj.enclosure : false);
        var strPointsUse = tf.js.GetNonEmptyString(strPoints);
        var isMultiLine = !!strPointsUse ? strPointsUse.charAt(0) == '(' : false;
        var isMultiPoly = false;
        if (isMultiLine) { isMultiPoly = (strPointsUse.length > 1 && strPointsUse.charAt(1) == '('); }
        return { typeName: isEnclosure ? "polygon" : isMultiLine ? "multipolygon" : "linestring", isEnclosure: isEnclosure, isMultiLine: isMultiLine, isMultiPoly: isMultiPoly };
    }

    function addPolygon(strPoints, dataArray, strStyleOrObj) {
        var polyGeometryType = getPolyGeometryType(strPoints, strStyleOrObj);
        if (polyGeometryType.isMultiLine) { if (polyGeometryType.isEnclosure) { if (!!debug) { debug.LogIfTest('multiEnclosure'); } } }
        else if (polyGeometryType.isMultiPoly) { if (!!debug) { debug.LogIfTest('multiEnclosure'); } }
        var style = { line: true, fill: polyGeometryType.isEnclosure || polyGeometryType.isMultiLine };
        if (polyGeometryType.isEnclosure) { dataArray = [dataArray]; }
        if (!tf.js.GetIsValidObject(strStyleOrObj)) { strStyleOrObj = tf.js.GetIsNonEmptyString(strStyleOrObj) ? tf.js.ParseLegacyFormatString(strStyleOrObj) : {}; }
        var mapFeature = new tf.map.Feature({ type: polyGeometryType.typeName, coordinates: dataArray, style: tf.js.ShallowMerge(strStyleOrObj, style) });
        var tPolygon = new TPolygon(theThis, mapFeature);
        theThis.AddMapFeature(mapFeature, false);
        polygons.push(tPolygon);
        return tPolygon;
    }

    function initialize() {
        debug = null;//tf.GetDebug();
        markers = []; polygons = []; groundTiles = [];
        tf.map.FeatureLayer.call(theThis, settings);
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(TLayer, tf.map.FeatureLayer);

/**
 * @public
 * @global
 * @class
 * @summary This is the <b>legacy MAP-API TMarker class</b>, which has been replaced by the {@link tf.map.Feature} class, and will soon be removed. 
 * Instances of this class are created by calling the functions [AddMarker]{@link TLayer#AddMarker} or [AddImgMarker]{@link TLayer#AddImgMarker} of a [TLayer]{@link TLayer} instance
 * @deprecated  This global class will soon be removed: use {@link tf.map.Feature} instead
 * @extends {tf.map.Feature}
*/
var TMarker = function (tLayer, mapFeature) {
    var theThis, onClickListener, onRollOverListener, isVisible;

    /**
     * @public
     * @function
     * @summary - Retrieves the associated legacy MAP-API [TLayer]{@link TLayer} instance
     * @returns {TLayer} - | {@link TLayer} the layer instance
    */
    this.GetLayer = function () { return tLayer; }

    /**
     * @public
     * @function
     * @summary - Sets a callback for mouse move notifications
     * @param {function} callBack - the callback
     * @returns {void} - | {@link void} no return value
    */
    this.SetOnRolloverListener = function (callBack) { onRollOverListener = tf.js.GetFunctionOrNull(callBack); }

    /**
     * @public
     * @function
     * @summary - Sets a callback for mouse click notifications
     * @param {function} callBack - the callback
     * @returns {void} - | {@link void} no return value
    */
    this.SetOnClickListener = function (callBack) { onClickListener = tf.js.GetFunctionOrNull(callBack); }

    /**
     * @public
     * @function
     * @summary - Changes the marker's label
     * @param {string} strLabel - the new label
     * @returns {void} - | {@link void} no return value
    */
    this.SetLabel = function (strLabel) { return mapFeature.ChangeStyle({ label: strLabel }); }

    /**
     * @public
     * @function
     * @summary - Changes the marker's style
     * @param {tf.types.MapFeatureStyleSettings|deprecatedPropertyString} strStyleOrObj - map feature style settings
     * @returns {void} - | {@link void} no return value
    */
    this.SetMarkerStyle = function (strStyleOrObj) { return mapFeature.ChangeStyle(strStyleOrObj); }

    /**
     * @public
     * @function
     * @summary - Shows or hides the marker
     * @param {boolean} bool - Set to <b>true</b> to show, <b>false</b> to hide
     * @returns {void} - | {@link void} no return value
    */
    this.SetVisible = function (bool) {
        if ((bool = !!bool) != isVisible) { if (isVisible = bool) { if (!!tLayer) { tLayer.AddMapFeature(mapFeature, false); } } else { if (!!tLayer) { tLayer.DelMapFeature(mapFeature, false); } } }
    }

    /**
     * @public
     * @function
     * @summary - Determines if the marker is visible
     * @returns {boolean} - | {@link boolean} <b>true</b> if visible, <b>false</b> otherwise
    */
    this.GetVisible = function () { return isVisible; }

    /**
     * @public
     * @function
     * @summary - Changes the marker's position
     * @param {tf.types.latitude} latitude - the new latitude
     * @param {tf.types.longitude} longitude - the new longitude
     * @returns {void} - | {@link void} no return value
    */
    this.MoveTo = function (latitude, longitude) { return moveTo(latitude, longitude); }

    /**
     * @public
     * @function
     * @summary - Incrementally changes the marker's position
     * @param {tf.types.latitude} latitude - the new latitude
     * @param {tf.types.longitude} longitude - the new longitude
     * @param {number} speed - duration of the animation
     * @param {function} moveEndCallback - called when the animation ends
     * @returns {void} - | {@link void} no return value
    */
    this.MoveToAni = function (latitude, longitude, speed, moveEndCallback) {
        moveTo(latitude, longitude);
        if (!!(moveEndCallback = tf.js.GetFunctionOrNull(moveEndCallback))) { if ((speed = tf.js.GetFloatNumber(speed, 10)) <= 0) { speed = 10; } setTimeout(moveEndCallback, speed); }
    }

    /**
     * @public
     * @function
     * @summary - Retrieves the marker's position
     * @returns {deprecatedMapCoords1} - | {@link deprecatedMapCoords1} the position
    */
    this.GetPosition = function () { var position = mapFeature.GetPointCoords(); return { latitude: position[1], longitude: position[0] }; }

    /**
     * @public
     * @function
     * @summary - Shows the Information Popup
     * @param {void} deprecated1 - ignored
     * @param {string} title - Title of the popup
     * @param {HTMLContent} content - Content of the popup
     * @returns {void} - | {@link void} no return value
    */
    this.ShowInfoWindow = function (deprecataed1, title, content) {
        if (!!tLayer) { var map = tLayer.GetMap(); if (!!map) { var pos = theThis.GetPosition(); map.ShowInfoWindow(pos.latitude, pos.longitude, null, title, content); } }
    }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.SetGroundTileStyle = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.ShowInfoWindowTabs = function () { }

    function moveTo(latitude, longitude) { mapFeature.SetPointCoords([tf.js.GetLongitudeFrom(longitude), tf.js.GetLatitudeFrom(latitude)]); }

    function notify(notification, callBackFunction) { if (!!callBackFunction) { callBackFunction(notification.eventCoords[1], notification.eventCoords[0]); } }

    function onMouseMove(notification) { return notify(notification, onRollOverListener); }
    function onClick(notification) { return notify(notification, onClickListener); }

    function initialize() {
        isVisible = true;
        mapFeature.SetOnMouseMoveListener(onMouseMove);
        mapFeature.SetOnClickListener(onClick);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * @public
 * @global
 * @class
 * @summary This is the <b>legacy MAP-API TPolygon class</b>, which has been replaced by the {@link tf.map.Feature} class, and will soon be removed. 
 * Instances of this class are created by calling the functions [AddPolygon]{@link TLayer#AddMarker} of a [TLayer]{@link TLayer} instance
 * @deprecated  This global class will soon be removed: use {@link tf.map.Feature} instead
 * @extends {tf.map.Feature}
*/
var TPolygon = function (tLayer, mapFeature) {
    var theThis, isVisible;

    /**
     * @public
     * @function
     * @summary - Retrieves the associated legacy MAP-API [TLayer]{@link TLayer} instance
     * @returns {TLayer} - | {@link TLayer} the layer instance
    */
    this.GetLayer = function () { return tLayer; }

    /**
     * @public
     * @function
     * @summary - Sets a callback for mouse click notifications
     * @param {function} callBack - the callback
     * @returns {void} - | {@link void} no return value
    */
    this.SetOnClickListener = function (callBack) { mapFeature.SetOnClickListener(callBack); }

    /**
     * @public
     * @function
     * @summary - Shows or hides the polygon
     * @param {boolean} bool - Set to <b>true</b> to show, <b>false</b> to hide
     * @returns {void} - | {@link void} no return value
    */
    this.SetVisible = function (bool) {
        if ((bool = !!bool) != isVisible) { if (isVisible = bool) { if (!!tLayer) { tLayer.AddMapFeature(mapFeature, false); } } else { if (!!tLayer) { tLayer.DelMapFeature(mapFeature, false); } } }
    }

    /**
     * @public
     * @function
     * @summary - Determines if the polygon is visible
     * @returns {boolean} - | {@link boolean} <b>true</b> if visible, <b>false</b> otherwise
    */
    this.GetIsVisible = function () { return isVisible; }

    /**
     * @public
     * @function
     * @summary - Changes the polygon's style
     * @param {tf.types.MapFeatureStyleSettings|deprecatedPropertyString} strStyleOrObj - map feature style settings
     * @returns {void} - | {@link void} no return value
    */
    this.UpdateStyle = function (strStyleOrObj) { return mapFeature.ChangeStyle(strStyleOrObj); }

    function initialize() {
        isVisible = true;
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * @public
 * @global
 * @class
 * @summary This is the <b>legacy MAP-API TButton class</b>, which has been replaced by the {@link tf.map.HTMLControl} class, and will soon be removed. 
 * Instances of this class are created by calling the functions [AddCustomizedButton]{@link TMap#AddCustomizedButton} of a [TMap]{@link TMap} instance
 * @deprecated  This global class will soon be removed: use {@link tf.map.HTMLControl} instead
*/
var TButton = function (htmlButtonElement) {
    var theThis, theClickCallBack;

    /**
     * @public
     * @function
     * @summary - Sets a callback for mouse click notifications
     * @param {function} callBack - the callback
     * @returns {void} - | {@link void} no return value
    */
    this.SetOnClickListener = function (callBack) { theClickCallBack = tf.js.GetFunctionOrNull(callBack); }


    function doOnClickCallBack() { if (!!theClickCallBack) { theClickCallBack(); } }

    function initialize() {
        htmlButtonElement.onclick = function () { doOnClickCallBack(); };
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * @public
 * @global
 * @class
 * @summary - This legacy MAP-API class is no longer available
 * @deprecated This class is no longer available
*/
var TTabObject = function () {
    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.GetLabel = function () { }

    /**
     * @public
     * @function
     * @summary - This function is no longer available
     * @returns {void} - | {@link void} no return value
     * @deprecated This function is no longer available
    */
    this.GetContent = function () { }
};

/**
 * @public
 * @global
 * @class
 * @summary This is the <b>legacy MAP-API TGroundTile class</b>, which has been replaced by the {@link tf.map.Feature} class, and will soon be removed. 
 * Instances of this class are created by calling the functions [AddGroundTile]{@link TLayer#AddGroundTile} of a [TLayer]{@link TLayer} instance,
 * or directly by using a valid tMap parameter and null tLayer parameter. The image pointed by the url parameter must be pre-loaded.
 * @param {TMap} tMap - the [TMap]{@link TMap} instance where the ground tile will be shown
 * @param {TLayer} tLayer - the [TLayer]{@link TLayer} instance associated with the ground tile
 * @param {string} url - the url to an image to be displayed on the map bounded by the given map coordinates
 * @param {tf.types.latitude} latitudeLT - left top latitude
 * @param {tf.types.longitude} longtitudeLT - left top longitude
 * @param {tf.types.latitude} latitudeRB - right bottom latitude
 * @param {tf.types.longitude} longtitudeRB - right bottom longitude
 * @deprecated  This global class will soon be removed: use {@link tf.map.Feature} instead
 * @see {@link tf.dom.ImgsPreLoader}
*/
var TGroundTile = function (tMap, tLayer, url, latitudeLT, longtitudeLT, latitudeRB, longtitudeRB) {
    var theThis, mapFeature, myStrStyle;
    var centerLat, centerLon, width;
    var img, isVisible, isLoaded;

    /**
     * @public
     * @function
     * @summary - Retrieves the associated legacy MAP-API [TLayer]{@link TLayer} instance, if any
     * @returns {TLayer} - | {@link TLayer} the layer instance
    */
    this.GetLayer = function () { return tLayer; }

    /**
     * @public
     * @function
     * @summary - Shows the ground tile immediately during a map post render event. The ground tile's image must have been loaded before calling this function.
     * @param {tf.types.MapShowFeatureImmediately} showFeatureImmediately - Set to <b>true</b> to show, <b>false</b> to hide
     * @returns {void} - | {@link void} no return value
    */
    this.ShowImmediately = function (showFeatureImmediately) { if (!!mapFeature && !!isLoaded) { return showFeatureImmediately(mapFeature); } }

    /**
     * @public
     * @function
     * @summary - Determines if the ground tile image is loaded. The function [ShowImmediately]{@link TGroundTile#ShowImmediately} cannot be called before image loading is complete.
     * @returns {boolean} - | {@link boolean} <b>true</b> if loaded, <b>false</b> otherwise
    */
    this.GetIsLoaded = function () { return isLoaded; }

    /**
     * @public
     * @function
     * @summary - Shows or hides the ground tile on the associated [TLayer]{@link TLayer} instance, if any
     * @param {boolean} bool - Set to <b>true</b> to show, <b>false</b> to hide
     * @returns {void} - | {@link void} no return value
    */
    this.SetVisible = function (bool) {
        bool = !!bool;

        if (bool != isVisible) {
            isVisible = bool;
            if (mapFeature) {
                if (tLayer) {
                    if (isVisible) { tLayer.AddMapFeature(mapFeature); }
                    else { tLayer.DelMapFeature(mapFeature); }
                }
            }
        }
    }

    /**
     * @public
     * @function
     * @summary - Changes the ground tile's style
     * @param {tf.types.MapFeatureStyleSettings|deprecatedPropertyString} strStyleOrObj - map feature style settings
     * @returns {void} - | {@link void} no return value
    */
    this.SetGroundTileStyle = function (strStyle) { myStrStyle = strStyle; if (mapFeature) { mapFeature.ChangeStyle(myStrStyle); } }

    function createFromImg() {
        var geom = new tf.map.FeatureGeom({ type: "point", coordinates: [centerLon, centerLat] });
        var scale = width !== undefined ? width / img.width : 1;

        scale *= tf.browser.GetDevicePixelRatio();

        var styleSpecs = { icon: true, icon_anchor: [0.5, 0.5], scale: scale, zindex: 1, icon_img: img, icon_size: [img.width, img.height], snaptopixel: false, rotate_with_map: true };
        var style = new tf.map.FeatureSubStyle(styleSpecs);
        mapFeature = new tf.map.Feature({ geom: geom, style: style, hoverStyle: style });
        if (myStrStyle) {
            mapFeature.ChangeStyle(myStrStyle);
        }
        if (isVisible) { if (tLayer) { tLayer.AddMapFeature(mapFeature); } }
    }

    function onImageLoaded() { img.onload = undefined; createFromImg(); isLoaded = true; }

    function initialize() {

        isVisible = true;
        isLoaded = false;

        (!tLayer || !(tLayer instanceof TLayer)) && (tLayer = null);
        tMap = tf.js.GetMapFrom(tMap);

        centerLat = (latitudeLT + latitudeRB) / 2;
        centerLon = (longtitudeLT + longtitudeRB) / 2;

        if (tMap) { width = Math.round(tMap.GetPixelDistance([longtitudeLT, centerLat], [longtitudeRB, centerLat])); }
        else { width = undefined; }

        if (url instanceof tf.dom.Img) {
            img = url.GetHTMLElement();
            createFromImg();
            isLoaded = true;
        }
        else {
            img = document.createElement('img');
            img.onload = onImageLoaded;
            img.src = url;
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
