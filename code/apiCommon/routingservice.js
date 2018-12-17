"use strict";

/*
enum class TurnInstruction : unsigned char
{
    NoTurn = 0,

    1   GoStraight,

    2   TurnSlightRight,
    3   TurnRight,
    4   TurnSharpRight,

    5   UTurn,

    6   TurnSharpLeft,
    7   TurnLeft,
    8   TurnSlightLeft,

    9   ReachViaLocation,

    10  HeadOn,

    11  EnterRoundAbout,
    12  LeaveRoundAbout,
    13  StayOnRoundAbout,

    14  StartAtEndOfStreet,

    15  ReachedYourDestination,

    16  EnterAgainstAllowedDirection,
    17  LeaveAgainstAllowedDirection,

    InverseAccessRestrictionFlag = 127,
    AccessRestrictionFlag = 128,
    AccessRestrictionPenalty = 129
};
*/

tf.services.TranslateRoutingInstruction = function(routingInstruction) {
    var instructions = {};
  
    var instructionNumber = parseInt(routingInstruction, 10);
    var instruction = instructionNumber & 63;
    //var flag = (instructionNumber >> 7);
    var instructionStr = '' + instruction;

    instructions["0"] = "No turn";

    instructions["1"] = "Straight";

    instructions["2"] = "Slight right turn";
    instructions["3"] = "Right turn ";
    instructions["4"] = "Sharp right turn";

    instructions["5"] = "U-Turn";

    instructions["6"] = "Sharp left turn";
    instructions["7"] = "Left turn";
    instructions["8"] = "Slight left turn";

    instructions["9"] = "Reach via location";

    instructions["10"] = "Head on";

    instructions["11"] = "Enter round about";
    instructions["12"] = "Leave round about";
    instructions["13"] = "Stay in round about";

    instructions["14"] = "Start at end of street";

    instructions["15"] = "Enter against allowed direction";
    instructions["16"] = "Leave against allowed direction";

    return instructions[instructionStr];
}


/**
 * A callback function that can be used in the creation of TerraFly API Service requests, such as
 * [Raster Source Lists]{@link tf.services.RasterSourceList} and [Routing]{@link tf.services.Routing}
 * @public
 * @callback tf.types.ServiceCallBack
 * @param {object} serviceObject - the object returned by the TerraFly service, its contents depend on the type of service being used
 * @returns {void} - | {@link void} no return value
 */

/**
 * Settings used in the creation of [Base Service]{@link tf.services.BaseJSONService} instances
 * @private
 * @typedef {object} tf.types.BaseServiceSettings
 * @property {string} serviceURL - the service URL complete with parameters
 * @property {boolean} useRedirect - if <b>true</b> the service is accessed with a redirect proxy, defaults to {@link void}
 * @property {boolean} useAjax - if <b>true</b> the service is accessed via ajax, otherwise JSON is used, defaults to {@link void}
 * @property {tf.types.ServiceCallBack} callBack - to receive the object retrieved from the service
 * @property {object} optionalScope - optional JavaScript scope used with <b>callBack</b>
*/

/**
 * @public
 * @class
 * @summary - Base Service implements functionality common to TerraFly API Service instances
 * @param {tf.types.BaseServiceSettings} settings - creation settings
*/
tf.services.BaseJSONService = function (settings) {

    var theThis, downloadObj, callBack, optionalScope, data, filterData, wasCancelled;

    /**
     * @public
     * @function
     * @summary - Checks if the request is in progress (was sent, but a response has not been received)
     * @returns {boolean} - | {@link boolean } <b>true</b> if the request is in progress, <b>false</b> otherwise
    */
    this.GetIsInProgress = function () { return !!downloadObj && downloadObj.GetIsInProgress(); }

    /**
     * @public
     * @function
     * @summary - Cancels an ongoing request
     * @returns {void} - | {@link void} no return value
    */
    this.Cancel = function () {
        //console.log('cancelled');
        return cancel();
    }

    this.WasCancelled = function () { return wasCancelled; }

    function cancel() { if (downloadObj) { downloadObj.Cancel(); downloadObj = null; wasCancelled = true; } }

    function doCalBack() { callBack.call(optionalScope, data); data = null; }

    function privateCallBack(notification) {
        data = notification.data;
        if (!!filterData) { data = filterData(data); }
        if (!!data) { data.requestProps = notification.requestProps; }
        setTimeout(doCalBack, 0);
    }

    function initialize() {
        wasCancelled = false;
        settings = tf.js.GetValidObjectFrom(settings);

        if (tf.js.GetIsNonEmptyString(settings.serviceURL)) {
            if (!!(callBack = tf.js.GetFunctionOrNull(settings.callBack))) {

                filterData = tf.js.GetFunctionOrNull(settings.filterData);

                optionalScope = settings.optionalScope;
                if (settings.skipRemoteService) {
                    data = { failed: true, requestProps: settings.requestProps };
                    setTimeout(function () { doCalBack(); }, 0); }
                else {
                    if (settings.useAjax) {
                        downloadObj = new tf.ajax.GetRequest({ requestProps: settings.requestProps, url: settings.serviceURL, useRedirect: settings.useRedirect, autoSend: true, optionalScope: theThis, onDataLoaded: privateCallBack });
                    }
                    else {
                        downloadObj = new tf.ajax.JSONGet();
                        downloadObj.Request(settings.serviceURL, privateCallBack, theThis, settings.requestProps, settings.useRedirect, settings.overrideMimeType, settings.JSONDecode);
                    }
                }
            }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * The accuracy of the result returned by the [Geocoder Service]{@link tf.services.Geocoder}, one of:<br>
 * 0 - Service failed,<br>
 * 1 - Exact match,<br>
 * 2 - Approx match - the program could not find the exact range, but found the nearest syntactic match or range,<br>
 * 3 - Zip center - the returned coordinate is the zip code center,<br>
 * 4 - City Center - the returned coordinate is the city center,<br>
 * 5 - Not Found - the address could not be located
 * @public
 * @typedef {number} tf.types.geocoderAccuracy
 */

/**
 * Object retrieved by [Geocoder Service]{@link tf.services.Geocoder} instances
 * @public
 * @typedef {object} tf.types.GeocoderData
 * @property {tf.types.mapCoordinates} pointCoords - the retrieved coordinates
 * @property {tf.types.geocoderAccuracy} geocoderAccuracy - the accuracy of <b>pointCoords</b>
 * @property {string} errorMsg - if the service fails contains an error message, otherwise {@link void}
*/

/**
 * Settings used in the creation of [Geocoder Service]{@link tf.services.Geocoder} instances
 * @public
 * @typedef {object} tf.types.GeocoderSettings
 * @property {string} address - the address for which to retrieve map coordinates
 * @property {tf.types.ServiceCallBack} callBack - to receive a the object retrieved from the service
 * @property {object} optionalScope - optional JavaScript scope used with <b>callBack</b>
*/

/**
 * @public
 * @class
 * @summary - Geocoder Service instances are created to retrieve the map coordinates corresponding to a given address.
 * This service passes an instance of [GeocoderData]{@link tf.types.GeocoderData} to its callBack
 * @param {tf.types.GeocoderSettings} settings - creation settings
 * @extends {tf.services.BaseJSONService}
*/
tf.services.Geocoder = function (settings) {

    var theThis, callBack, optionalScope, localSettings;

    this.GetSettings = function () { return tf.js.ShallowMerge(localSettings); }

    function decode(httpRequest) {
        var data = { pointCoords: [0, 0], geocoderAccuracy: 0 };

        if (!!httpRequest && !!httpRequest.responseText) {
            var rawData = tf.helpers.XMLString2Object(httpRequest.responseText);
            if (tf.js.GetIsValidObject(data)) {
                if (tf.js.GetIsNonEmptyString(rawData.GeocoderErrorMsg)) {
                    data.errorMsg = rawData.GeocoderErrorMsg;
                }
                else {
                    data.pointCoords = [tf.js.GetLongitudeFrom(rawData.Longitude), tf.js.GetLongitudeFrom(rawData.Latitude)];
                    data.geocoderAccuracy = parseInt(rawData.GeocoderLevel, 10);
                }
            }
            //tf.GetDebug().LogIfTest(JSON.stringify(data));
        }
        return data;
    }

    function initialize() {

        localSettings = tf.js.ShallowMerge(settings);

        if (!!(callBack = tf.js.GetFunctionOrNull(localSettings.callBack))) {

            optionalScope = localSettings.optionalScope;

            var address = encodeURI(tf.js.GetNonEmptyString(localSettings.address));
            var geocoderServiceURL = "http://vn4.cs.fiu.edu/cgi-bin/geocoder.cgi?";

            localSettings.serviceURL = geocoderServiceURL + "street=" + address + "&filetype=.xml";
            localSettings.overrideMimeType = "text/xml";
            localSettings.JSONDecode = decode;

            //tf.GetDebug().LogIfTest("Geocoder: " + localSettings.serviceURL);

            tf.services.BaseJSONService.call(theThis, localSettings);
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.services.Geocoder, tf.services.BaseJSONService);

tf.services.TFReverseGeocoder = function (settings) {

    var theThis, callBack, optionalScope, localSettings;

    this.GetSettings = function () { return tf.js.ShallowMerge(localSettings); }

    function decode(httpRequest) {
        var data = !!httpRequest ? tf.js.GetNonEmptyString(unescape(httpRequest.responseText), undefined) : undefined
        return { pointCoords: settings.pointCoords, HTML: data };
    }

    function filterTFReverseGeocodeData(rawData) {
        var data = { success : false, sender: theThis };
        if (tf.js.GetIsValidObject(rawData) && tf.js.GetIsNonEmptyString(rawData.address)) {
            data.success = true;
            data = tf.js.ShallowMerge(data, rawData);
        }
        return data;
    }

    function initialize() {

        localSettings = tf.js.ShallowMerge(settings);

        if (!!(callBack = tf.js.GetFunctionOrNull(localSettings.callBack))) {

            optionalScope = localSettings.optionalScope;

            var strURL = "http://vn4.cs.fiu.edu/cgi-bin/reversegeocoder.cgi?Lat=" + settings.pointCoords[1] + "&Long=" + settings.pointCoords[0];

            if (settings.resolution != undefined) { strURL += "&Res=" + settings.resolution; }

            var usingJSON = !!settings.getJSON;

            if (tf.js.GetIsNonEmptyString(settings.vidParam)) { strURL += "&vid=" + settings.vidParam; }

            if (tf.js.GetIsNonEmptyString(settings.passThrough)) {
                var passThrough = settings.passThrough;
                if (passThrough.charAt(0) != "&") { passThrough = "&" + passThrough; }
                strURL += passThrough;
            }

            if (usingJSON) { strURL += '&filetype=.json'; }

            localSettings.serviceURL = strURL;
            if (usingJSON) {
                localSettings.filterData = filterTFReverseGeocodeData;
            }
            else {
                localSettings.overrideMimeType = "text/html";
                localSettings.JSONDecode = decode;
            }

            tf.services.BaseJSONService.call(theThis, localSettings);
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.services.TFReverseGeocoder, tf.services.BaseJSONService);

/**
 * Object retrieved by [Reverse Geocoder Service]{@link tf.services.ReverseGeocoder} instances
 * @public
 * @typedef {object} tf.types.ReverseGeocoderData
 * @property {boolean} success - <b>true</b> if the service succeeded, <b>false</b> otherwise
 * @property {tf.types.mapCoordinates} pointCoords - the coordinates associated with the address
 * @property {string} address - the street address
 * @property {string} stdAddress - the street address
 * @property {string} city - the city
 * @property {string} stdCity - the city
 * @property {string} stdState - the state
 * @property {string} stdZip - the zip code
 * @property {string} stdZipPlus - the zip code extension
*/

/**
 * Settings used in the creation of [Reverse Geocoder Service]{@link tf.services.ReverseGeocoder} instances
 * @public
 * @typedef {object} tf.types.ReverseGeocoderSettings
 * @property {tf.types.mapCoordinates} pointCoords - the coordinates for which an address will be retrieved
 * @property {tf.types.ServiceCallBack} callBack - to receive a the object retrieved from the service
 * @property {object} optionalScope - optional JavaScript scope used with <b>callBack</b>
*/

/**
 * @public
 * @class
 * @summary - Reverse Geocoder Service instances are created to retrieve the address corresponding to the given map coordinates.
 * This service passes an instance of [ReverseGeocoderData]{@link tf.types.ReverseGeocoderData} to its callBack
 * @param {tf.types.ReverseGeocoderSettings} settings - creation settings
 * @extends {tf.services.BaseJSONService}
*/
tf.services.ReverseGeocoder = function (settings) {

    var theThis, callBack, optionalScope, localSettings;

    this.GetSettings = function () { return tf.js.ShallowMerge(localSettings); }

    function filterReverseGeocodeData(rawData) {
        var data = { success : false, sender: theThis };
        if (tf.js.GetIsValidObject(rawData) && tf.js.GetIsArrayWithMinLength(rawData = rawData.features, 1)) {
            if (tf.js.GetIsValidObject(rawData = rawData[0].properties)){
                data.success = true;
                data.pointCoords = [tf.js.GetLongitudeFrom(rawData.lon), tf.js.GetLatitudeFrom(rawData.lat)];
                data.address = rawData.ADDR;
                data.city = rawData.CITY;
                data.stdAddress = rawData.STD_ADDR;
                data.stdCity = rawData.STD_CITY;
                data.stdState = rawData.STD_STATE;
                data.stdZip = rawData.STD_ZIP;
                data.stdZipPlus = rawData.STD_PLUS;
            }
        }
        return data;
    }

    function initialize() {

        localSettings = tf.js.ShallowMerge(settings);

        if (!!(callBack = tf.js.GetFunctionOrNull(localSettings.callBack)) && tf.js.GetIsArrayWithMinLength(localSettings.pointCoords, 2)) {

            optionalScope = localSettings.optionalScope;

            var lon = tf.js.GetLongitudeFrom(localSettings.pointCoords[0]);
            var lat = tf.js.GetLatitudeFrom(localSettings.pointCoords[1]);
            //var geocoderServiceURL = "http://vn4.cs.fiu.edu/cgi-bin/arquery.cgi?&tfaction=shortdisplayflash&numfind=1&category=firstamerican_points_2014&filetype=.json";
            var geocoderServiceURL = "http://vn4.cs.fiu.edu/cgi-bin/arquery.cgi?&tfaction=shortdisplayflash&numfind=1&category=firstamerican_points_2017&filetype=.json";

            localSettings.serviceURL = geocoderServiceURL + "&lat=" + lat + "&lon=" + lon;
            localSettings.filterData = filterReverseGeocodeData;

            //tf.GetDebug().LogIfTest("ReverseGeocoder: " + localSettings.serviceURL);

            tf.services.BaseJSONService.call(theThis, localSettings);
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.services.ReverseGeocoder, tf.services.BaseJSONService);

tf.services.GetDirectionModeFrom = function (modeSet, defaultMode, allowBus) {
    var mode = tf.js.GetNonEmptyString(modeSet, defaultMode);

    switch (mode = mode.toLowerCase()) {
        case tf.consts.routingServiceModeFoot:
        case tf.consts.routingServiceModeBicycle:
        case tf.consts.routingServiceModeCar:
            break;
        case tf.consts.routingServiceModeBus: if (!allowBus) { mode = defaultMode; } break;
        default: mode = defaultMode; break;
    }
    return mode;
};

/**
 * Settings used in the creation of [Routing Service]{@link tf.services.RoutingService} instances
 * @public
 * @typedef {object} tf.types.RoutingServiceSettings
 * @property {array<tf.types.mapCoordinates>} lineStringCoords - the given via point coordinates for routing, in [GeoJSON linestring format]{@link tf.types.GeoJSONGeometryType}, a maximum of 25 points can be used
 * @property {tf.types.routingServiceMode} mode - defaults to {@link tf.consts.routingServiceModeFoot}
 * @property {tf.types.mapCoordinates} coords - the given via point coordinates for locating or finding a nearest point, used in conjunction with <b>locateOnly<b> or <b>nearestOnly</b>
 * @property {boolean} locateOnly - if set to <b>true</b> requests the location of the nearest node of the road network to the given <b>coords</b>, defaults to {@link void}, takes precedence over <b>nearestOnly</b>
 * @property {boolean} nearestOnly - if set to <b>true</b> requests the location of the nearest point in any street segment of the road network to the given <b>coords</b>, defaults to {@link void}
 * @property {boolean} findAlternatives - if set to <b>false</b> prevents the service from attempting to find alternative routes, defaults to <b>true</b>
 * @property {boolean} instructions - if set to <b>true</b> requests guidance instructions from the service, defaults to {@link void}
 * @property {tf.types.mapLevel} level - a map level, defaults to <b>18</b>
 * @property {tf.types.ServiceCallBack} callBack - to receive the object retrieved from the service
 * @property {object} optionalScope - optional JavaScript scope used with <b>callBack</b>
*/

/**
 * @public
 * @class
 * @summary - Routing Service instances are created to retrieve directions from the TerraFly Routing Service
 * @param {tf.types.RoutingServiceSettings} settings - creation settings
 * @extends {tf.services.BaseJSONService}
*/
tf.services.Routing = function (settings) {

    var theThis, localSettings;
    var serverURL, useDefaultServer;

    this.GetSettings = function () { return tf.js.ShallowMerge(localSettings); }

    function filterLocateNearestData(data) {
        if (tf.js.GetIsValidObject(data)) {
            if (data.status == 0 || data.status == 200) {
                if (tf.js.GetIsArrayWithMinLength(data.mapped_coordinate, 2)) {
                    var coords = data.mapped_coordinate;
                    var t = coords[0]; coords[0] = coords[1]; coords[1] = t;
                    data.mapped_coordinate = coords;
                }
                else {
                    data.status = 400;
                    data.status_message = "Invalid route";
                }
            }
        }
        return data;
    }

    function filterViaRouteData(data) {
        if (tf.js.GetIsValidObject(data)) {
            if ((data.status !== 0 && data.status !== 200) || ! tf.js.GetLooksLikeLineStringCoords(data.route_geometry)) {
                data.route_geometry = [];
            }
            else {
                var coords = data.route_geometry;
                for (var i in coords) { var c = coords[i], t = c[0]; c[0] = c[1]; c[1] = t; }
                var viaIndices = data.via_indices;
                if (tf.js.GetIsArrayWithMinLength(viaIndices, 2)) {
                    var len = viaIndices.length;
                    if (viaIndices[len - 1] == coords.length) {
                        //tf.GetDebug().LogIfTest('Routing service: fixing via indices');
                        for (var i = 1 ; i < len ; ++i) { viaIndices[i] -= 1; }
                    }
                }
            }
            data.sender = theThis;
        }
        else {
            data = { sender : theThis };
        }
        return data;
    }

    function getModeFrom(mode) {
        return tf.services.GetDirectionModeFrom(localSettings.mode, tf.consts.routingServiceModeFoot, false);
    }

    function initialize() {
        var callRemoteService = false;

        localSettings = tf.js.GetValidObjectFrom(settings);

        if (localSettings.level === undefined) { localSettings.level = 14; }

        serverURL = tf.js.GetNonEmptyString(settings.serverURL, null);

        var strLevel = "";

        if (localSettings.level !== undefined) { var level = tf.js.GetLevelFrom(localSettings.level); strLevel = "&z=" + level; }

        useDefaultServer = !serverURL;
    
        if (!!(localSettings.locateOnly || localSettings.nearestOnly)) {
            var coords = localSettings.coords;

            if (tf.js.GetIsArrayWithMinLength(coords, 2)) {
                var mode = getModeFrom(localSettings.mode);
                var serviceVerb = !!localSettings.locateOnly ? "/locate?" : "/nearest?";
                var strPoints = "loc=" + coords[1] + ',' + coords[0];

                if (useDefaultServer) {
                    localSettings.serviceURL = tf.consts.RoutingServiceURL + mode + serviceVerb + strPoints;
                }
                else {
                    localSettings.serviceURL = serverURL + serviceVerb + strPoints + strLevel;
                }
                localSettings.filterData = filterLocateNearestData;
                callRemoteService = true;
            }
        }
        else {
            var coords = localSettings.lineStringCoords;
            if (tf.js.GetLooksLikeLineStringCoords(coords)) {

                var mode = getModeFrom(localSettings.mode);

                switch (mode = mode.toLowerCase()) {
                    case tf.consts.routingServiceModeFoot:
                    case tf.consts.routingServiceModeBicycle:
                    case tf.consts.routingServiceModeCar:
                        break;
                    default:
                        mode = tf.consts.routingServiceModeCar;
                        break;
                }

                var strPoints = "";
                var maxViaPoints = 25;
                var nViaPoints = coords.length;
                var strAlt = "", strInstructions = "";

                if (tf.js.GetIsFalseNotUndefined(localSettings.findAlternatives)) { strAlt = "&alt=false"; }
                if (!!localSettings.instructions) { strInstructions = "&instructions=true"; }

                if (nViaPoints > maxViaPoints) { nViaPoints = maxViaPoints; }

                for (var i = 0 ; i < nViaPoints ; ++i) { var coord = coords[i]; strPoints += "&loc=" + coord[1] + "," + coord[0]; }

                if (useDefaultServer) {
                    localSettings.serviceURL = tf.consts.RoutingServiceURL + mode + "/viaroute?compression=false" + strPoints + strAlt + strInstructions;
                }
                else {
                    localSettings.serviceURL = serverURL + "/viaroute?compression=false" + strPoints + strAlt + strLevel + strInstructions;
                }
                localSettings.filterData = filterViaRouteData;
                callRemoteService = true;
            }
        }

        //callRemoteService = false;

        localSettings.skipRemoteService = !callRemoteService;
        tf.services.BaseJSONService.call(theThis, localSettings);

        /*if (false && callRemoteService) {
            //tf.GetDebug().LogIfTest("Routing: " + localSettings.serviceURL);
            tf.services.BaseJSONService.call(theThis, localSettings);
        }
        else {
            var callBack;
            if (!!(callBack = tf.js.GetFunctionOrNull(settings.callBack))) {
                setTimeout(function () {
                    callBack.call(localSettings.optionalScope, { data: undefined, requestProps: localSettings.requestProps });
                }, 0);
            }
        }*/
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.services.Routing, tf.services.BaseJSONService);

/**
 * Object passed to [Raster Source List Service]{@link tf.services.RasterSourceList} callbacks
 * @public
 * @typedef {object} tf.types.RasterSourceListResult
 * @property {boolean} success - <b>true</b> on succes, <b>false</b> otherwise, in which case the contents of <b>error_message</b> should be checked
 * @property {string} error_message - if <b>success</b> is <b>false</b> contains an explanation of the reason(s) for failure
 * @property {array<object>} sources - an {@link array} of available sources at the requested location, each element of which contains:
 * @property {string} sources.name - the name of the source
 * @property {array<string>} sources.dates - the dates for which raster information is available for the source, each in the format "YYYYMMDD", as in "20150109"
 * @example {"success":true, "error_message":"", "sources":[{"name":"BEST_AVAILABLE", "dates":["20150109", "20150709"]}]}
*/

/**
 * Settings used in the creation of [Raster Source List]{@link tf.services.RasterSourceList} instances. Use either <b>pointCoordinates</b> or
 * a <b>extent</b>
 * @public
 * @typedef {object} tf.types.RasterSourceListSettings
 * @property {tf.types.mapLevel} level - map level, defaults to {@link tf.consts.defaultLevel}
 * @property {tf.types.mapCoordinates} pointCoordinates - if defined, takes precedence over <b>extent</b>
 * @property {tf.types.mapExtent} extent - map extent
 * @property {tf.types.ServiceCallBack} callBack - to receive a [RasterSourceListResult]{@link tf.types.RasterSourceListResult} object retrieved from the service
 * @property {object} optionalScope - optional JavaScript scope used with <b>callBack</b>
*/

/**
 * @public
 * @class
 * @summary - Raster Source List Service instances are created to retrieve a list of available raster sources and dates from the TerraFly Tile Service
 * @param {tf.types.RasterSourceListSettings} settings - creation settings
 * @extends {tf.services.BaseJSONService}
*/
tf.services.RasterSourceList = function (settings) {

    var theThis, localSettings;

    this.GetSettings = function () { return tf.js.ShallowMerge(localSettings); }

    function initialize() {

        localSettings = tf.js.ShallowMerge(settings);

        var level = tf.js.GetLevelFrom(localSettings.level);
        var extent ;
        
        if (localSettings.pointCoordinates !== undefined) {
            extent = tf.js.GetMapCoordsFrom(localSettings.pointCoordinates);
            extent = [extent[0], extent[1], extent[0], extent[1]];
        }
        else {
            extent = tf.js.GetMapExtentFrom(localSettings.extent);
        }
        
        var tileServiceURL = "http://131.94.133.184/TileService/";

        localSettings.serviceURL = tileServiceURL + "rsourcelist.aspx?projection=bing&z=" + level +
            "&bbox=" + extent[1] + ',' + extent[2] + ',' + extent[3] + ',' + extent[0];

        //tf.GetDebug().LogIfTest("RasterSourceList: " + localSettings.serviceURL);

        tf.services.BaseJSONService.call(theThis, localSettings);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.services.RasterSourceList, tf.services.BaseJSONService);

/**
 * Settings used in the creation of [Raster Mosaic]{@link tf.services.RasterMosaic} instances. The mosaic area can be
 * specified to the service by either providing it with <b>level</b> and <b>leftTop</b> parameters, or with an <b>extent</b>
 * parameter. In both cases the mosaic is created with the given <b>dim</b> dimensions. Use the former invocation 
 * to efficiently construct mosaics at the discrete [resolution]{@link tf.types.mapResolution} values corresponding to valid
 * [levels]{@link tf.types.mapLevel}.
 * Use the latter invocation to construct mosaics of any resolution, at the expense of additional processing time by the service
 * @public
 * @typedef {object} tf.types.RasterMosaicSettings
 * @property {tf.types.mapLevel} level - map level, if defined, together with <b>leftTop</b>, takes precedence over <b>extent</b>, defaults to {@link void}
 * @property {tf.types.mapCoordinates} leftTop - if defined, together with <b>level</b>, takes precedence over <b>extent</b>, defaults to {@link void}
 * @property {tf.types.mapExtent} extent - mosaic's extent coordinates, required when either <b>level</b> or <b>leftTop</b> are undefined
 * @property {tf.types.pixelCoordinates} dims - mosaic's dimensions
 * @property {tf.types.mapAerialSource} source - mosaic's source, defaults to [Best Available]{@link tf.consts.sourceName_best_available}
 * @property {string} date - mosaic's date, in the format "YYYYMMDD", as in "20151007", if not defined tiles from all dates are used to create the mosaic
 * @property {tf.types.ServiceCallBack} callBack - to receive an [Img]{@link tf.dom.Img} instance, whose [GetIsValid]{@link tf.dom.Img#GetIsValid} function can be used to determined success or failure
 * @property {object} optionalScope - optional JavaScript scope used with <b>callBack</b>
*/

/**
 * @public
 * @class
 * @summary - Raster Source List Service instances are created to retrieve a raster mosaic tile from the available aerial images in the TerraFly Tile Service.
 * This service passes an [Img]{@link tf.dom.Img} instance containing the mosaic image to its callback, whose [GetIsValid]{@link tf.dom.Img#GetIsValid} function 
 * can be used to determined success or failure.
 * @param {tf.types.RasterMosaicSettings} settings - creation settings
*/
tf.services.RasterMosaic = function (settings) {

    var theThis, callBack, optionalScope, localSettings, img;

    this.GetSettings = function () { return tf.js.ShallowMerge(localSettings); }

    function onImgLoaded() { setTimeout(doCalBack, 50); }
    function doCalBack() { callBack.call(optionalScope, img); img = null; }

    function initialize() {

        localSettings = tf.js.ShallowMerge(settings);

        if (!!(callBack = tf.js.GetFunctionOrNull(localSettings.callBack))) {

            optionalScope = localSettings.optionalScope;

            var level = tf.js.GetLevelFrom(localSettings.level);
            var leftTop = tf.js.GetMapCoordsFrom(localSettings.leftTop);
            var extent = tf.js.GetMapExtentFrom(localSettings.extent);
            var dim = tf.js.GetIsArrayWithMinLength(settings.dim, 2) ? settings.dim : [16, 16];
            var source = tf.js.GetNonEmptyString(localSettings.source);
            var date = tf.js.GetNonEmptyString(localSettings.date);
            var tileServiceURL = "http://131.94.133.184/TileService/";

            if (localSettings.level !== undefined && localSettings.leftTop !== undefined) {
                localSettings.serviceURL = tileServiceURL + "rmosaic.aspx?projection=bing&z=" + level +
                    "&left=" + leftTop[0] + '&top=' + leftTop[1] + '&width=' + dim[0] + '&height=' + dim[1];
            }
            else {
                var xMinYMin = tf.units.TM2OL([extent[0], extent[3]]);
                var xMaxYMax = tf.units.TM2OL([extent[2], extent[1]]);

                localSettings.serviceURL = tileServiceURL + "rmosaic.aspx?projection=bing" +
                    "&bbox=" + xMinYMin[0] + ',' + xMinYMin[1] + ',' + xMaxYMax[0] + ',' + xMaxYMax[1] + '&width=' + dim[0] + '&height=' + dim[1];
            }

            if (!!source) { localSettings.serviceURL += '&source=' + source; }
            if (!!date) { localSettings.serviceURL += '&date=' + date; }

            //tf.GetDebug().LogIfTest("RasterMosaic: " + localSettings.serviceURL);

            img = new tf.dom.Img({ src: localSettings.serviceURL, onLoad: onImgLoaded, crossOrigin: true });
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.services.Uber = function (settings) {
    var theThis, serverToken, clientId;
    var uberApiVersionStr, startUrl;

    this.GetPriceEstimate = function (then, fromCoords, toCoords, seatCount) { return getPriceEstimate(fromCoords, toCoords, seatCount, then); }
    this.GetTimeEstimate = function (then, fromCoords) { return getTimeEstimate(fromCoords, then); }
    this.GetProducts = function (then, fromCoords) { return getProducts(fromCoords, then); }

    this.SetPickup = function (then, fromCoords, fromName, toCoords, toName, productId) { return setPickup(then, fromCoords, fromName, toCoords, toName, productId); }

    this.MakeSetPickupUrl = function (fromCoords, fromName, toCoords, toName, productId) { return makeSetPickupUrl(fromCoords, fromName, toCoords, toName, productId); }

    function makeSetPickupUrl(fromCoords, fromName, toCoords, toName, productId) {
        var url = startUrl + "?client_id=" + clientId + "&action=setPickup&pickup[latitude]=" + fromCoords[1] +
            "&pickup[longitude]=" + fromCoords[0] + "&pickup[formatted_address]=" + fromName + "&dropoff[latitude]=" + toCoords[1] +
            "&dropoff[longitude]=" + toCoords[0] + "&dropoff[formatted_address]=" + toName;
        if (productId != undefined) { url += "&product_id=" + productId; }
        return url;
    }

    function makeUberStartEndSeatCountParams(fromCoords, toCoords, seatCount) {
        var str = 'start_latitude=' + fromCoords[1] + '&start_longitude=' + fromCoords[0] + '&end_latitude=' + toCoords[1] + '&end_longitude=' + toCoords[0];
        if (seatCount != undefined) { str += '&seat_count=' + seatCount; }
        return str;
    }
    function makeUberStartParams(fromCoords, toCoords) { return 'start_latitude=' + fromCoords[1] + '&start_longitude=' + fromCoords[0]; }
    function makeUberLocationParams(coords) { return 'latitude=' + coords[1] + '&longitude=' + coords[0]; }

    function doUberCall(url, then) {
        if (tf.js.GetFunctionOrNull(then)) {
            /*var req = { method: 'GET', url: 'https://api.uber.com/' + url, headers: { 'Authorization': 'Token ' + serverToken } };
            $http(req).
            success(function (data, status, headers, config) { then(data, status, headers, config); }).
            error(function (data, status, headers, config) { then(data, status, headers, config); });*/

            var header = { 'Authorization': 'Token ' + serverToken };

            new tf.ajax.JSONGet().Request('https://api.uber.com/' + uberApiVersionStr + url, function (notification) {
                then(!!notification ? notification.data : undefined);
            }, theThis, undefined, false, undefined, undefined, undefined, header);
        }
    }

    function getPriceEstimate(fromCoords, toCoords, seatCount, then) { return doUberCall('/estimates/price?' + makeUberStartEndSeatCountParams(fromCoords, toCoords, seatCount), then); }
    function getTimeEstimate(coords, then) { return doUberCall('/estimates/time?' + makeUberStartParams(coords), then); }
    function getProducts(coords, then) { return doUberCall('/products?' + makeUberLocationParams(coords), then); }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        uberApiVersionStr = tf.js.GetNonEmptyString(settings.uperApiVersion, "v1.2");
        serverToken = tf.js.GetNonEmptyString(settings.serverToken, "");
        clientId = tf.js.GetNonEmptyString(settings.clientId, "");
        startUrl = !!settings.useDeepLink ? "uber://" : "https://m.uber.com/ul/";
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.services.MDTServiceAPI = function (settings) {
    var theThis, nRequestsPending;
    var baseServiceUrl, busRoutesService, directionsForRouteIdService, routeShapeIdsForRouteIdAndDirectionService, shapeForShapeIdService, routeServicesService;
    var routeStopsForRouteIdAndDirectionService, busShedulesService, busesService, busTrackerService;

    this.GetHasRequestsPending = function () { return nRequestsPending > 0; }

    this.GetBuses = function (then) { return loadMDTServiceThen(busesService, then); }
    this.GetBusRoutes = function (then) { return loadMDTServiceThen(busRoutesService, then); }
    this.GetDirectionsForRouteId = function (routeId, then) { return loadMDTServiceThen(routeId != undefined ? directionsForRouteIdService + routeId : directionsForRouteIdService, then); }
    this.GetShapeIdsForRouteIdAndDirection = function (routeId, direction, then) { return loadMDTServiceThen(routeShapeIdsForRouteIdAndDirectionService + routeId + '&Dir=' + direction, then); }
    this.GetShapeForShapeId = function (shapeId, then) { return loadMDTServiceThen(shapeForShapeIdService + shapeId, then); }
    this.GetRouteServices = function (then) { return loadMDTServiceThen(routeServicesService, then); }
    this.GetBusRouteStops = function (routeId, direction, then) { return loadMDTServiceThen(routeStopsForRouteIdAndDirectionService + routeId + '&Dir=' + direction, then); }

    this.GetBusTrackerURL = function (stopId, routeId, direction) { return baseServiceUrl + makeBusTrackerUrl(stopId, routeId, direction); }
    this.GetBusTracker = function (stopId, routeId, direction, then) { return loadMDTServiceThen(makeBusTrackerUrl(stopId, routeId, direction), then); }

    this.GetBusSchedules = function (routeId, serviceId, direction, stopId, sequence, then) {
        var fullURL = busShedulesService + routeId + '&Service=' + serviceId + '&Dir=' + direction + '&StopID=' + stopId;
        if (sequence != undefined) { fullURL += '&Sequence=' + sequence; }
        return loadMDTServiceThen(fullURL, then);
    }

    function makeBusTrackerUrl(stopId, routeId, direction) {
        var url = busTrackerService + stopId;
        if (routeId != undefined) { url += "&RouteID=" + routeId; }
        if (direction != undefined) { url += "&Dir=" + direction; }
        return url;
    }

    function loadAjaxThen(url, then) {
        if (tf.js.GetFunctionOrNull(then)) {
            ++nRequestsPending;
            new tf.ajax.GetRequest({
                onDataLoaded: function (notification) {
                    --nRequestsPending;
                    if (nRequestsPending < 0) { console.log('MDTServiceAPI has negative number of pending requests: ' + nRequestsPending); }
                    var data, httpRequest = notification.httpRequest;
                    if (httpRequest.status == 200 && !!httpRequest.responseXML) {
                        data = tf.helpers.XML2Object(httpRequest.responseXML.documentElement);
                    }
                    then(data);
                }, optionalScope: theThis, url: url, autoSend: true, useRedirect: true
            });
        }
    }

    function loadMDTServiceThen(serviceStr, then) { return loadAjaxThen(baseServiceUrl + serviceStr, then); }

    function initialize() {
        nRequestsPending = 0;
        baseServiceUrl = "http://www.miamidade.gov/transit/WebServices/";
        busesService = "Buses";
        busRoutesService = "BusRoutes/";
        directionsForRouteIdService = "BusRouteDirections/?RouteID=";
        routeStopsForRouteIdAndDirectionService = "BusRouteStops/?RouteID=";
        shapeForShapeIdService = "BusRouteShape/?ShapeID=";
        routeServicesService = "BusRouteService";
        busShedulesService = "BusSchedules/?RouteID=";
        busTrackerService = "BusTracker/?StopID=";
        routeShapeIdsForRouteIdAndDirectionService = "BusRouteShapesByRoute/?RouteID="; //95&Dir=Northbound";
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.services.CRUDClient = function (settings) {
    var theThis = this; if (!(theThis instanceof tf.services.CRUDClient)) { return new tf.services.CRUDClient(settings); }
    var verbNames, verbsData, maxCounter, serverURL, serverURLCB, tableName;

    this.ListTables = function (then) { processVerb(then, verbNames.list_tables, undefined, undefined, undefined); }
    this.RenameTable = function (then, overrideTableName, newTableName) { processVerb(then, verbNames.rename_table, undefined, undefined, overrideTableName, newTableName); }

    this.Post = function (then, valueOrValues, overrideTableName) { processVerb(then, verbNames.post, undefined, valueOrValues, overrideTableName); };
    this.Get = function (then, idOrIds, overrideTableName) { processVerb(then, verbNames.get, idOrIds, undefined, overrideTableName); };
    this.Put = function (then, valueWithIdOrValuesWithIds, overrideTableName) { processVerb(then, verbNames.put, undefined, valueWithIdOrValuesWithIds, overrideTableName); };
    this.Del = function (then, idOrIds, ValueWithIdOrValuesWithIds, overrideTableName) { processVerb(then, verbNames.del, idOrIds, ValueWithIdOrValuesWithIds, overrideTableName); };

    function processVerb(then, verbName, idOrIds, valueOrValues, overrideTableName, newTableName) {
        if (verbNames && verbNames[verbName] !== undefined) {
            if (tf.js.GetFunctionOrNull(then)) {
                var tableNameUse = tf.js.GetNonEmptyString(overrideTableName, tableName);
                var fullURL = serverURLCB ? serverURLCB({ sender: theThis }) : serverURL;
                var ids = tf.js.GetIsNonEmptyArray(idOrIds) ? idOrIds : undefined;
                var id = ids == undefined ? idOrIds : undefined;
                var values = tf.js.GetIsNonEmptyArray(valueOrValues) ? valueOrValues : undefined;
                var value = values == undefined ? valueOrValues : undefined;
                if (verbName == verbNames.put) {
                    if (value != undefined) {
                        id = value.id;
                    }
                    else if (tf.js.GetIsNonEmptyArray(values)) {
                        ids = [];
                        for (var i = 0, len = values.length; i < len; ++i) {
                            ids.push(values[i].id);
                        }
                    }
                }
                else if (verbName == verbNames.del) {
                    if (id == undefined && value != undefined) {
                        id = value.id;
                        value = undefined;
                    }
                    else if (ids == undefined && values != undefined) {
                        ids = [];
                        for (var i in values) { ids.push(values[i].id); }
                        values = undefined;
                    }
                }
                else if (verbName == verbNames.listTables) {
                    tableNameUse = id = ids = value = values = undefined;
                }
                else if (verbName == verbNames.rename_table) {
                    id = ids = value = values = undefined;
                }

                if (value != undefined) { value = JSON.stringify(value); }
                if (values != undefined) { for (var i in values) { values[i] = JSON.stringify(values[i]); } }

                var crudRecord = {
                    authForm: settings.authForm,
                    crudContent: { verb: verbName, tableName: tableNameUse, newTableName: newTableName, id: id, ids: ids, value: value, values: values }
                };

                var verbData = verbsData[verbName];

                if (verbData.ajax) { verbData.ajax.Cancel(); }
                if (++verbData.counter > maxCounter) { verbData.counter = 1; }

                var requestProps = { counter: verbData.counter, then: then, sender: theThis, verbName: verbName, verbData: verbData, crudRecord: crudRecord };

                verbData.ajax = new tf.ajax.JSONGet().Request(fullURL, function (notification) {
                    var requestProps = notification ? notification.requestProps : undefined;
                    if (requestProps && requestProps.counter == requestProps.verbData.counter) {
                        var ok = false, message = "";
                        var data = (notification && notification.data && notification.data.OK) ? notification.data : undefined;
                        var dataNotify = [];
                        if (data != undefined) {
                            ok = true;
                            message = notification.data.message;
                            if (data.value) {
                                var value = JSON.parse(data.value);
                                if (data.id) { value.id = data.id; }
                                dataNotify.push(value);
                            }
                            else if (tf.js.GetIsNonEmptyArray(data.values)) {
                                var nValues = data.values.length;
                                var idsUse = tf.js.GetIsNonEmptyArray(data.ids) ? data.ids : undefined;
                                for (var i = 0; i < nValues; ++i) {
                                    var value = JSON.parse(data.values[i]);
                                    if (idsUse) { value.id = idsUse[i]; }
                                    dataNotify.push(value);
                                }
                            }
                        }
                        requestProps.then({ sender: requestProps.sender, data: dataNotify, ok: ok, message: message });
                    }
                }, theThis, requestProps, false, undefined, undefined, JSON.stringify(crudRecord));
            }
        }
    };

    function initialize() {
        if (settings) {
            verbNames = { post: "post", get: "get", put: "put", del: "del", list_tables: "list_tables", rename_table: "rename_table" };
            verbsData = {};
            maxCounter = 1000;
            for (var i in verbNames) { verbsData[verbNames[i]] = { counter: 0, ajax: null } }
            if (settings.serverURL !== undefined) {
                if (tf.js.GetIsNonEmptyString(settings.serverURL)) { serverURL = settings.serverURL; }
                else if (tf.js.GetFunctionOrNull(settings.serverURL)) { serverURLCB = settings.serverURL; }
            }
            else {
                var defaultServerURL = 'http://131.94.133.212/v1/CRUD/';
                serverURL = tf.js.GetNonEmptyString(settings.serverURL, defaultServerURL);
            }
            tableName = tf.js.GetNonEmptyString(settings.tableName, "_crud_test");
        }
    };

    initialize();
};

tf.services.TestCrudClient = function (settings) {
    var theThis = this; if (!(theThis instanceof testCrudClient)) { return new testCrudClient(settings); }

    function crudTestPostOne(cc) {
        var value = { name: "leo", what: "_not_" };
        cc.Post(function (notification) { console.log('post one result'); console.log(notification.data); }, value);
    };
    function crudTestPostSome(cc) {
        var values = [], howMany = 10;
        for (var i = 0; i < howMany; ++i) { values.push({ name: "leo", count: i }); }
        cc.Post(function (notification) { console.log('post some result'); console.log(notification.data); }, values);
    };

    function crudTestGetAll(cc) { cc.Get(function (notification) { console.log('get all result'); console.log(notification.data); }); };
    function crudTestGetSome(cc) { cc.Get(function (notification) { console.log('get some result'); console.log(notification.data); }, [1, 3, 5]); };
    function crudTestGetOne(cc) { cc.Get(function (notification) { console.log('get one result'); console.log(notification.data); }, 3); };

    function crudTestDelAll(cc) { cc.Del(function (notification) { console.log('del all result'); console.log(notification.data); }); };
    function crudTestDelSome(cc) { cc.Del(function (notification) { console.log('del some result'); console.log(notification.data); }, [2, 4, 6]); };
    function crudTestDelOne(cc) { cc.Del(function (notification) { console.log('del one result'); console.log(notification.data); }, 8); };

    function crudTestPutOne(cc, id) {
        var value = { id: id, name: "leo changed", what: "not!!!" };
        cc.Put(function (notification) { console.log('put one result'); console.log(notification.data); }, value);
    };

    function crudTestPutSome(cc, baseId) {
        var values = [], howMany = 10;
        for (var i = 0; i < howMany; ++i) { values.push({ id: baseId + i, name: "leo put many", count: i * 10 }); }
        cc.Put(function (notification) { console.log('put some result'); console.log(notification.data); }, values);
    };

    function getServerURL() { return 'http://192.168.0.105:8080/v1/CRUD/'; };

    function initialize() {
        var cc = tf.services.CRUDClient({
            //serverURL: undefined,
            //serverURL: "apple",
            serverURL: getServerURL,
            //serverURL: 'http://192.168.0.105:8080/v1/CRUD/',
            tableName: "_utma_stops3"
        });

        //crudTestPostOne(cc);
        //crudTestPostSome(cc);
        //crudTestGetAll(cc);
        //crudTestGetSome(cc);
        //crudTestGetOne(cc);
        //crudTestDelAll(cc);
        //crudTestDelSome(cc);
        //crudTestDelOne(cc);
        //crudTestPutOne(cc, 100);
        //crudTestPutSome(cc, 40);
    };

    initialize();
};
