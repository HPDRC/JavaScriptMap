"use strict";

/**
 * Specifications for the next animation set, returned by [Map Animation Callbacks]{@link tf.types.MapAnimationCallBack}, passed to
 * the function {@link tf.map.Map#StartAnimation}, upon receiving an [Animation Request]{@link tf.types.MapAnimationRequest} 
 * sent by a {@link tf.map.Map} instance
 * @public
 * @typedef {object} tf.types.MapAnimationStep
 * @property {tf.types.mapCoordinates} center - the new map center, if defined
 * @property {tf.types.mapResolution} resolution - the new map resolution, if defined
 * @property {number} rotation - the new map rotation, in radians, if defined
 * @property {number} duration - the duration of the animation step, in milliseconds
 * @property {boolean} notifyListeners - if set to <b>true</b> event notifications are sent to listeners during the animation, 
 * @property {tf.types.EasingFunction} easing - if not defined defaults to {@link tf.units.EaseInAndOut}
 * otherwise notifications are sent only when the animation ends, defaults to {@link void}
*/

/**
 * A request for the next animation step sent by {@link tf.map.Map} instances to callBacks passed to the function {@link tf.map.Map#StartAnimation}
 * @public
 * @typedef {object} tf.types.MapAnimationRequest
 * @property {tf.map.Map} sender - the instance sending the notification
 * @property {number} step - the current animation step, starts at 0 and is incremented at each call. 
 * Used by the callBack to determine which data to return for the next setp of the animation, and
 * when to stop the animation. 
 * An ongoing animation may be prematurely stoped by calls made to {@link tf.map.Map#StartAnimation} 
 * or {@link tf.map.Map#EndAnimation}, in which case this property is set to <b>-1</b>
*/

/**
 * A callback function that can be passed to the function {@link tf.map.Map#StartAnimation} to start an ongoing map animation
 * @public
 * @callback tf.types.MapAnimationCallBack
 * @param {tf.types.MapAnimationRequest} request - a request for the next animation step
 * @returns {tf.types.MapAnimationStep} - | {@link tf.types.MapAnimationStep} the requested next step, or {@link void} to end the animation
 */

/**
 * Map UTM coordinates use the array format <b>[ x, y, zone  ]</b>
 * @public
 * @typedef {array} tf.types.mapUTMCoordinates
 */

/**
 * Map coordinates use the GeoJSON array format <b>[ {@link tf.types.longitude}, {@link tf.types.latitude} ]</b>
 * @public
 * @typedef {array} tf.types.mapCoordinates
 */

/**
 * Map extents delimit a rectangular map area and are defined by a 4-position coordinate array in the order: <b>[ minLon, minLat, maxLon, maxLat ]</b>, where min/maxLon coordinates 
 * are {@link tf.types.longitude} and min/maxLat coordinates are {@link tf.types.latitude}
 * @public
 * @typedef {array} tf.types.mapExtent
 */

/**
 * An instance of a map layer class, currently only {@link tf.map.FeatureLayer}
 * @public
 * @typedef {tf.types.mapLayer} tf.types.mapLayer
 */

/**
 * A callback function that can be passed to the function [Add Listener]{@link tf.map.Map#AddListener} of a [Map]{@link tf.map.Map} instance to start receiving event notifications from it
 * @public
 * @callback tf.types.MapEventCallBack
 * @param {tf.types.MapEventNotification} notification - the notification
 * @returns {void} - | {@link void} no return value
 */

/**
 * A callback, provided by map ({@link tf.map.Map}) instances during {@link tf.consts.mapPreComposeEvent} and {@link tf.consts.mapPostComposeEvent} notifications, 
 * to start a new rendering cycle after the current one completes
 * @public
 * @callback tf.types.MapContinueAnimation
 * @returns {void} - | {@link void} no return value
 * @see {@link tf.types.MapShowFeatureImmediately}
 */

/**
 * A callback, provided by map ({@link tf.map.Map}) instances during {@link tf.consts.mapPreComposeEvent} and {@link tf.consts.mapPostComposeEvent} notifications, to display instances of {@link tf.map.Feature} 
 * during the post compose phase of the map rendering cycle. This can be used to achieve animation effects, and to display transient map features that are not associated with a persistent data set
 * @public
 * @callback tf.types.MapShowFeatureImmediately
 * @param {tf.map.Feature} mapFeature - the map feature to show
 * @returns {void} - | {@link void} no return value
 * @see {@link tf.types.MapContinueAnimation}
 */

/**
 * Elements in the <b>featureCluster</b> property included in some notifications sent by {@link tf.map.Map} instances.
 * @public
 * @typedef {object} tf.types.MapFeatureClusterElement
 * @property {tf.map.Feature} mapFeature - a map feature in the cluster
 * @property {tf.map.KeyedFeature} keyedFeature - the keyed feature associated with the <b>mapFeature</b>, if any
 * @property {string} styleName - the name of the style of the <b>mapFeature</b>, if any
 */

/**
 * Notifications sent by {@link tf.map.Map} instances. Properties are included in the event notifications that require them, and undefined otherwise
 * @public
 * @typedef {object} tf.types.MapEventNotification
 * @property {tf.map.Map} sender - the instance sending the notification
 * @property {tf.types.mapEventName} eventName - the name of the event
 * @property {tf.types.mapCoordinates} eventCoords - the map coordinates associated with the event, if any
 * @property {tf.types.mapResolution} resolution - the map resolution in {@link tf.consts.mapResolutionChangeEvent} notifications
 * @property {tf.types.mapLevel} level - the map level in {@link tf.consts.mapLevelChangeEvent} notifications
 * @property {tf.map.KeyedFeature} keyedFeature - the keyed feature associated with the event, if any
 * @property {tf.map.Feature} mapFeature - the map feature associated with the event, if any
 * @property {string} styleName - the name of the style of the map feature associated with the event, if any
 * @property {boolean} isInHover - <b>true</b> if for "hover in" events, <b>false</b> for "hover out" events
 * @property {tf.map.KeyedFeature} nextKeyedFeature - the next keyed feature being "hovered in" in "hover out" event notifications
 * @property {tf.map.Feature} nextFeature - the next map feature being "hovered in" in "hover out" event notifications
 * @property {tf.map.KeyedFeature} prevKeyedFeature - the previous keyed feature being "hovered out" in "hover in" event notifications
 * @property {tf.map.Feature} prevFeature - the previous map feature being "hovered out" in "hover in" event notifications
 * @property {tf.map.Feature} prevFeature - the previous map feature being "hovered out" in "hover in" event notifications
 * @property {tf.types.MapShowFeatureImmediately} showFeatureImmediately - a function that displays an instance of {@link tf.map.Feature} during the post compose phase of the map rendering cycle
 * @property {tf.types.MapContinueAnimation} continueAnimation - a function that instructs the {@link tf.map.Map} instance to start a new rendering cycle after the current one completes
 * @property {tf.types.mapType} oldType - the map type being replaced in {@link tf.consts.mapTypeChangeEvent} notifications
 * @property {tf.types.mapType} newType - the new map type in {@link tf.consts.mapTypeChangeEvent} notifications
 * @property {array<tf.types.MapFeatureClusterElement>} featureCluster - an array containing information about map features in the same cluster as the map feature 
 * for which the event was triggered. This property is <b>undefined</b> in
 * non-cluster related event notifications
*/

/**
 * Settings used by the [map]{@link tf.map.Map} function [AddFeatureLayer]{@link tf.map.Map#AddFeatureLayer}
 * @public
 * @typedef {object} tf.types.AddFeatureLayerSettings
 * @property {string} name - the layer name, displayed in the Map Layers popup
 * @property {string} description - the layer description
 * @property {boolean} isVisible - if <b>false</b> the layer is created invisible, defaults to <b>true</b>
 * @property {boolean} isHidden - if <b>false</b> the layer is not listed in the Map Layers popup, defaults to <b>true</b>
 * @property {number} zIndex - the layer zIndex, defaults to 0
 * @property {tf.types.opacity01} opacity - the layer opacity, defaults to 1
 * @property {tf.types.MinMaxLevels} minMaxLevels - if defined, constrains the layer's visibility to the given range, defaults to {@link void}
 * @property {boolean} useClusters - if <b>true</b> the layer can only display [Features]{@link tf.map.Feature] with [point geometries]{@link tf.types.GeoJSONGeometryType} 
 * and displays clusters of features into a single feature. Defaults to <b>void</b>
 * @property {number} clusterFeatureDistance - the distance in pixels under which [Map Features]{@link tf.map.Feature] are clustered together
 * @property {tf.types.MapFeatureStyleLike} clusterStyle - style used to display a cluster of [Map Features]{@link tf.map.Feature]
 * @property {tf.types.MapFeatureStyleSettings} clusterLabelStyle - style used to display the number of [Map Features]{@link tf.map.Feature] in a cluster
*/

/**
 * View settings used in the creation of [Map]{@link tf.map.Map} instances
 * @public
 * @typedef {object} tf.types.MapViewSettings
 * @property {tf.types.mapExtent} extent - optional allowed map extent (to restrict map navigation)
 * @property {tf.types.mapLevel} minLevel - optional minimum level allowed
 * @property {tf.types.mapLevel} maxLevel - optional maximum level allowed
*/

/**
 * A string containing the url to a Map Tile Server
 * @public
 * @typedef {string} tf.types.mapTileServerUrl
 */

/**
 * Settings used in the creation of [Map]{@link tf.map.Map} instances
 * @public
 * @typedef {object} tf.types.MapSettings
 * @property {HTMLElementLike} container - the container where the map is created, this is a mandatory property
 * @property {HTMLElementLike} fullScreenContainer - defines the container to be displayed in fullscreen, if not defined, <b>document.body</b> is displayed in fullscreen
 * @property {tf.types.mapCoordinates} center - optional map center, defaults to [ {@link tf.consts.defaultLongitude}, {@link tf.consts.defaultLatitude}]
 * @property {tf.types.mapLevel} level - optional map level, defaults to {@link tf.consts.defaultLevel}
 * @property {tf.types.mapResolution} resolution - optional map resolution, defaults to {@link void}, if defined takes precedence over <b>level</b>
 * @property {tf.types.mapEngine} mapEngine - optional map engine, defaults to {@link tf.consts.mapnik2Engine}
 * @property {tf.types.mapType} mapType - optional map type, defaults to {@link tf.consts.typeNameHybrid}
 * @property {tf.types.mapAerialSource} mapAerialSource - the source of Aerial map tiles, defaults to {@link tf.consts.sourceName_best_available}
 * @property {tf.types.MapViewSettings} viewSettings - optional view settings
 * @property {tf.types.mapTileServerUrl} mapLayerSourceURL - optional alternative map engine, defaults to {@link void}, if defined replaces <b>mapEngine</b>
 * @property {tf.types.opacity01} mapLayerSourceHybridModeOpacity - optional opacity used with <b>mapLayerSourceURL</b> when the map type is set to {@link tf.consts.typeNameHybrid}, defaults to 1
 * @property {tf.types.mapPanelNamesString} panels - if present sets the visibility status of map panels
 * @property {boolean} showMapCenter - if set to <b>false</b> prevents the map center image from being overlayed on map, otherwise the map center is displayed
 * @property {boolean} panOnClick - if set to <b>false</b> prevents the map from panning to the map location clicked by the user
 * @property {boolean} goDBOnDoubleClick - if set to <b>false</b> prevents the map from displaying the TerraFly geoquery page corresponding to the map location double clicked by the user
 * @property {string} addressBarHelp - if present sets the text that is displayed when the user clicks the '?' button in the map's Address Bar
 * @property {string} passThroughString - if present sets the value of a string used by the map when interacting with some TerraFly services
 * @property {string} vidParam - if present sets the value of a string used by the map when interacting with some TerraFly services
 * @property {number} messageTimeout - if present sets the time after which the Message Popup automatically hides itself, defaults to {@link tf.consts.defaultMessageTimeout}
 * @property {tf.types.legendString} legendH - if present sets the value of the {@link tf.consts.typeNameHybrid} legend, defaults to {@link tf.consts.defaultLegendH}
 * @property {tf.types.legendString} legendM - if present sets the value of the {@link tf.consts.typeNameMap} legend, defaults to {@link tf.consts.defaultLegendM}
*/

/**
 * @public
 * @class
 * @summary Create instances of this class to display the TerraFly HTerraMap
 * @param {tf.types.MapSettings} settings - map creation settings
 */
tf.map.Map = function (settings) {

    var styles, subStyles;
    var mapPrivateLayerZIndex = 10000;
    var id = null;
    var mapCanvas = null;
    var linkTargetStr;
    var layersByName;

    var mapURLIPs = ["184", "186", "188", "190"];
    //var mapURLIPs = ["184", "186", "190"];
    //var mapURLIPs = ["184", "186", "188"];

    var allEventDispatchers = null;
    var actualToVirtualTranslateCallBack, virtualToActualTranslateCallBack, getDisplayPixelSizeCB;

    var animationCallBack, animationOptionalScope, animationStep, isAnimating, animationSpecs;

    var originalViewConstrainResolution;

    function fractionalConstrainZoom(resolution, delta, direction) { return delta ? originalViewConstrainResolution.call(olView, resolution, delta, direction) : resolution; }

    this.ActualToVirtualPixelCoords = function (pixelCoords) { return actualToVirtualPixelCoords(pixelCoords); }

    function actualToVirtualPixelCoords(pixelCoords) {
        var coords;
        if (!!pixelCoords) { if (!(coords = (!!actualToVirtualTranslateCallBack ? actualToVirtualTranslateCallBack(pixelCoords) : pixelCoords.slice(0)))) { coords = pixelCoords; } }
        else { coords = [0, 0]; }
        return coords;
    }

    this.VirtualToActualPixelCoords = function (pixelCoords) { return virtualToActualPixelCoords(pixelCoords); }

    function virtualToActualPixelCoords(pixelCoords) {
        var coords;
        if (!!pixelCoords) { if (!(coords = (!!virtualToActualTranslateCallBack ? virtualToActualTranslateCallBack(pixelCoords) : pixelCoords.slice(0)))) { coords = pixelCoords; } }
        else { coords = [0, 0]; }
        return coords;
    }

    this.SetDecodedLegends = function (decodedLegendH, decodedLegendM) { return setDecodedLegends(decodedLegendH, decodedLegendM, undefined); }

    this.SetIsUSScaleUnits = function (bool) { if (isUsScaleUnits != !!bool) { toggleScaleUnits(); } }
    this.GetIsUSScaleUnits = function () { return isUsScaleUnits; }

    this.SetFractionalZoomInteraction = function (setBool) {
        olView.constrainResolution = !!setBool ? fractionalConstrainZoom: originalViewConstrainResolution;
    }

    this.RemoveDragPan = function () { return removeDragPan(); }
    this.AddDragPan = function () { return addDragPan(); }

    this.GetCanvas = function () { return mapCanvas; }

    this.GetPixelSize = function () {
        var dps = !!getDisplayPixelSizeCB ? getDisplayPixelSizeCB() : undefined;
        return !!dps ? dps : theThis.GetActualPixelSize();
    }

    this.SetActualToVirtualPixelTranslateCallBacks = function (actualToVirtualCallBack, virtualToActualCallBack, displayPixelSizeCallBack) {
        actualToVirtualTranslateCallBack = tf.js.GetFunctionOrNull(actualToVirtualCallBack);
        if (!(virtualToActualTranslateCallBack = tf.js.GetFunctionOrNull(virtualToActualCallBack))) {
            virtualToActualTranslateCallBack = actualToVirtualCallBack;
        }
        getDisplayPixelSizeCB = tf.js.GetFunctionOrNull(displayPixelSizeCallBack);
    }

    this.SetTarget = function (newTarget) { olMap.setTarget(newTarget); }
    this.RestoreTarget = function () { olMap.setTarget(mapContainer); }

    this.getAPIMap = function () { return olMap; }
    this.getAPIView = function () { return olView; }

    this.GetControlContainer = function () { return mapControlContainerHTML; }

    this.CreateMapWithSameLayers = function (container) {
        var map;
        if (tf.dom.GetHTMLElementFrom(container)) {
            var mapSettings = {
                container: container,
                center: getCenter(),
                panels: "noaddress+nomaplocation+nouserlocation+nomapscale",
                panOnClick: false,
                goDBOnDoubleClick: false,
                resolution: getResolution()
            };
            map = new tf.map.Map(mapSettings);
            map.SetHasInteractions(false);
            map.ShowMapCenter(false);
            map.getAPIMap().setLayerGroup(olMap.getLayerGroup());
        }
        return map;
    }

    /*this.ShareLayersWith = function (map) {
        if (!!(map = tf.js.GetMapFrom(map))) {
            map.getAPIMap().setLayerGroup(olMap.getLayerGroup());
        }
    }*/

    /**
     * @public
     * @function
     * @summary - Returns the map instance's unique identifier
     * @returns {number} - | {@link number} the map instance's unique identifier
    */
    this.GetID = function () { return id; }

    /**
     * @public
     * @function
     * @summary - Returns the map container that was passed in the creation of the map instance
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the map container
    */
    this.GetMapContainer = function () { return containerAll; }

    /**
     * @private
     * @function
     * @summary - Returns the top map container
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the top map container
    */
    this.GetMapMapContainer = function () { return mapContainerAllObj; }

    this.GetMapControlContainer = function () { return mapControlContainerObj; }

    /**
     * @public
     * @function
     * @summary - Returns the map engine that was passed in the creation of the map instance
     * @returns {tf.types.mapEngine} - | {@link tf.types.mapEngine} the map engine
    */
    this.GetMapEngine = function () { return mapEngine; }

    /**
     * @public
     * @function
     * @summary - Uses the browser's geolocation service to create or update (and display) a map feature at the estimated user location
     * @returns {void} - | {@link void} no return value
    */
    this.ShowUserLocation = function () { return updateUserLocation(); }

    /**
     * @public
     * @function
     * @summary - Hides the map feature positioned at the estimated user location, if it has been created
     * @returns {void} - | {@link void} no return value
    */
    this.HideUserLocation = function () { return hideUserLocation(); }

    /**
     * @public
     * @function
     * @summary - CenterUses the browser's geolocation service to center the map to the estimated user location
     * @returns {void} - | {@link void} no return value
    */
    this.CenterToUserLocation = function () { return requestCenterToUserLocation(); }

    /**
     * @public
     * @function
     * @summary - Requests the map to initiate a render cycle. Should not be called from within a render cycle (e.g. during a map {@link tf.consts.mapPostComposeEvent} event)
     * @returns {void} - | {@link void} no return value
    */
    this.Render = function () { return render(); }

    /**
     * @public
     * @function
     * @summary - Sets the value of a string used by the map when interacting with some TerraFly services
     * @param {string} tfPassThroughString - the string value
     * @returns {void} - | {@link void} no return value
    */
    this.SetTFPassThroughString = function (passTroughString) { setTFPassThroughString(passTroughString); }

    /**
     * @public
     * @function
     * @summary - Returns the value of a string used by the map when interacting with some TerraFly services
     * @returns {string} - | {@link string} the string value
    */
    this.GetTFPassThroughString = function () { return getTFPassTroughString(); }

    /**
     * @public
     * @function
     * @summary - Sets the value of a string used by the map when interacting with some TerraFly services
     * @param {string} vidParamStr - the string value
     * @returns {void} - | {@link void} no return value
    */
    this.SetVIDParamStr = function (vidParamStr) { setVIDParamStr(vidParamStr); }

    /**
     * @public
     * @function
     * @summary - Returns the value of a string used by the map when interacting with some TerraFly services
     * @returns {string} - | {@link string} the string value
    */
    this.GetVIDParamStr = function () { return getVIDParamStr(); }

    /**
     * @public
     * @function
     * @summary - Sets the text that is displayed in the map's Address Bar
     * @param {string} addressBarText - the text
     * @returns {void} - | {@link void} no return value
    */
    this.SetAddressBarText = function (addressBarText) { return setAddressBarText(addressBarText); }

    /**
     * @public
     * @function
     * @summary - Returns the text displayed in the map's Address Bar
     * @returns {string} - | {@link string} the text
    */
    this.GetAddressBarText = function () { return getAddressBarText(); }

    /**
     * @public
     * @function
     * @summary - Sets the text that is displayed when the user clicks the '?' button in the map's Address Bar
     * @param {string} addressBarHelpStr - the text
     * @returns {void} - | {@link void} no return value
    */
    this.SetAddressBarHelp = function (addressBarHelpStr) { return setAddressBarHelp(addressBarHelpStr); }

    /**
     * @public
     * @function
     * @summary - Opens a GeoQuery page for the given address
     * @param {string} addressStr - the address
     * @returns {void} - | {@link void} no return value
    */
    this.GoDBByAddress = function (addressStr) { goDBByAddress(addressStr); }

    /**
     * @public
     * @function
     * @summary - Opens a GeoQuery page for the given coordinates
     * @param {tf.types.mapCoordinates} pointCoords - the coordinates
     * @returns {void} - | {@link void} no return value
    */
    this.GoDBByCoords = function (pointCoords) { goDBByCoords(pointCoords); }

    /**
     * @public
     * @function
     * @summary - Opens a GeoQuery page for the coordinates at the center of the map
     * @returns {void} - | {@link void} no return value
    */
    this.GoDBByCenterCoords = function () { goDBByCenterCoords(); }

    /**
     * @public
     * @function
     * @summary - Allows or prevents the map from opening a GeoQuery page corresponding to the map coordinates double clicked by the user
     * @param {boolean} bool - Set to <b>true</b> to allow, <b>false</b> to prevent
     * @returns {void} - | {@link void} no return value
    */
    this.SetGoDBOnDoubleClick = function (bool) { setGoDBOnDoubleClick(bool); }

    /**
     * @public
     * @function
     * @summary - Determines if the map is allowed to open a GeoQuery page corresponding to the map coordinates double clicked by the user
     * @returns {boolean} - | {@link boolean} <b>true</b> if it is allowed, <b>false</b> otherwise
    */
    this.GetGoDBOnDoubleClick = function () { return getGoDBOnDoubleClick(); }

    /**
     * @public
     * @function
     * @summary - Allows or prevents automatic re-centering to the coordinates clicked by the user
     * @param {boolean} bool - Set to <b>true</b> to allow, <b>false</b> to prevent
     * @returns {void} - | {@link void} no return value
    */
    this.SetUsePanOnClick = function (bool) { setUsePanOnClick(bool); }

    /**
     * @public
     * @function
     * @summary - Determines if the map is allowed to automatically re-center to the coordinates clicked by the user
     * @returns {boolean} - | {@link boolean} <b>true</b> if it is allowed, <b>false</b> otherwise
    */
    this.IsUsingPanOnClick = function () { return isUsingPanOnClick(); }

    this.AnimatedSetRotation = function (newRotationRad, animationTime) { return animatedSetRotation(newRotationRad, animationTime); }

    this.AnimatedResetRotation = function () { return animatedResetRotation(); }

    /**
     * @public
     * @function
     * @summary - Rotates the map clockwise to the given angle
     * @param {number} rotationDeg - The angle in degrees
     * @returns {void} - | {@link void} no return value
    */
    this.SetRotationDeg = function (rotationDeg) { return setRotationDeg(rotationDeg); }

    /**
     * @public
     * @function
     * @summary - Obtains the clockwise map rotation angle
     * @returns {number} - | {@link number} the angle in degrees
    */
    this.GetRotationDeg = function (rotationDeg) { return getRotationDeg(); }

    /**
     * @public
     * @function
     * @summary - Rotates the map clockwise to the given angle
     * @param {number} rotationRad - The angle in radians
     * @returns {void} - | {@link void} no return value
    */
    this.SetRotationRad = function (rotationRad) { return setRotationRad(rotationRad); }

    /**
     * @public
     * @function
     * @summary - Obtains the clockwise map rotation angle
     * @returns {number} - | {@link number} the angle in radians
    */
    this.GetRotationRad = function (rotationRad) { return getRotationRad(); }

    /**
     * @public
     * @function
     * @summary - Translates the given pixel coordinates into map coordinates
     * @param {tf.types.pixelCoordinates} pixelCoords - the pixel coordinates
     * @returns {tf.types.mapCoordinates} - | {@link tf.types.mapCoordinates} the map coordinates
    */
    this.PixelToMapCoords = function (pixelCoords) { return pixelToMapCoords(pixelCoords); }
    this.ActualPixelToMapCoords = function (pointCoords) { return actualPixelToMapCoords(pointCoords); }

    /**
     * @public
     * @function
     * @summary - Translates the given map coordinates into pixel coordinates
     * @param {tf.types.mapCoordinates} pointCoords - the map coordinates
     * @returns {tf.types.pixelCoordinates} - | {@link tf.types.pixelCoordinates} the pixel coordinates
    */
    this.MapToPixelCoords = function (pointCoords) { return mapToPixelCoords(pointCoords); }
    this.ActualMapToPixelCoords = function (pointCoords) { return actualMapToPixelCoords(pointCoords); }

    /**
     * @public
     * @function
     * @summary - Obtains the distance in pixels between two map given coordinates
     * @param {tf.types.mapCoordinates} pointCoords1 - the first map coordinates
     * @param {tf.types.mapCoordinates} pointCoords2 - the second map coordinates
     * @returns {number} - | {@link number} the distance between the map coordinates in pixels
    */
    this.GetPixelDistance = function (pointCoords1, pointCoords2) { return getPixelDistance(pointCoords1, pointCoords2); }

    /**
     * @public
     * @function
     * @summary - Obtains the distance in pixels between the center of the map and the given map coordinates
     * @param {tf.types.mapCoordinates} pointCoords - the given map coordinates
     * @returns {number} - | {@link number} the distance between the map center and the map coordinates in pixels
    */
    this.GetPixelDistanceFromCenter = function (pointCoords) { return getPixelDistanceFromCenter(pointCoords); }

    /**
     * @public
     * @function
     * @summary - Checks if the given map coordinates are displayed at the same pixel coordinates as the map center
     * @param {tf.types.mapCoordinates} pointCoords - the given map coordinates
     * @returns {boolean} - | {@link boolean} <b>true</b> if the pixel coordinates of the center coincide with the pixel coordinates of the given the map coordinates, <b>false</b> otherwise
    */
    this.IsSamePixelAsCenter = function (pointCoords) { return isSamePixelAsCenter(pointCoords); }

    /**
     * @public
     * @function
     * @summary - Checks if the given map coordinates are within the current map viewing area
     * @param {tf.types.mapCoordinates} pointCoords - the given map coordinates
     * @returns {boolean} - | {@link boolean} <b>true</b> if the pixel coordinates of given coordinates are visible, <b>false</b> otherwise
    */
    this.GetAreMapCoordsVisible = function (pointCoords) { return getAreMapCoordsVisible(pointCoords); }

    /**
     * @public
     * @function
     * @summary - Recenters the map to the given coordinates
     * @param {tf.types.mapCoordinates} pointCoords - the new map center coordinates
     * @returns {void} - | {@link void} no return value
    */
    this.SetCenter = function (pointCoords) { setCenter(pointCoords); }

    /**
     * @public
     * @function
     * @summary - Recenters the map to the given coordinates and changes the map level to the given level
     * @param {tf.types.mapCoordinates} pointCoords - the new map center coordinates
     * @param {tf.types.mapLevel} level - the new map level
     * @returns {void} - | {@link void} no return value
    */
    this.SetCenterAndLevel = function (pointCoords, level) { setCenterAndLevel(pointCoords, level); }

    /**
     * @public
     * @function
     * @summary - Retrieves the current map center coordinates
     * @returns {tf.types.mapCoordinates} - | {@link tf.types.mapCoordinates} the map center coordinates
    */
    this.GetCenter = function () { return getCenter(); }

    /**
     * @public
     * @function
     * @summary - Sets the map level
     * @param {tf.types.mapLevel} level - the desired map level
     * @returns {void} - | {@link void} no return value
    */
    this.SetLevel = function (level) { setLevel(level); }

    /**
     * @public
     * @function
     * @summary - Gets the current map level
     * @returns {tf.types.mapLevel} - | {@link tf.types.mapLevel} the current map level
    */
    this.GetLevel = function () { return getLevel(); }

    /**
     * @public
     * @function
     * @summary - Sets the map resolution
     * @param {tf.types.mapResolution} resolution - the desired map resolution
     * @returns {void} - | {@link void} no return value
    */
    this.SetResolution = function (resolution) { setResolution(resolution); }

    /**
     * @public
     * @function
     * @summary - Gets the current map resolution
     * @returns {tf.types.mapResolution} - | {@link tf.types.mapResolution} the current map resolution
    */
    this.GetResolution = function () { return getResolution() }

    /**
     * @public
     * @function
     * @summary - Incrementally changes the map level to the given level if it differs from the current map level. If the given level matches the current
     * map level no animation is performed and the optional callback is immediatelly notified
     * @param {tf.types.mapLevel} newLevel - the desired new level
     * @param {tf.types.MapEventCallBack} callBack - if defined, receives a notification when the animation ends
     * @param {number} duration - the duration of the animation per level changed, in milliseconds, defaults to {@link tf.consts.defaultMapAnimatedDurationPerLevelMillis}
     * @param {boolean} notifyListeners - Set to <b>true</b> to send event notifications during the animation, defaults to {@link void}
     * @param {tf.types.EasingFunction} easing - if not defined defaults to {@link tf.units.EaseInAndOut}
     * @returns {void} - | {@link void} no return value
    */
    this.AnimatedSetLevel = function (newLevel, callBack, durationPerLevel, notifyListeners, easing) { return animatedSetLevel(newLevel, callBack, durationPerLevel, notifyListeners, easing); }

    /**
     * @public
     * @function
     * @summary - Incrementally recenters the map to the given map coordinates if their corresponding pixel coordinates differ from those of the center of the map, 
     * otherwise [SetCenter]{@link tf.map.Map#SetCenter} is performed instead of an animation, and the optional calback is notified immediately
     * @param {tf.types.mapCoordinates} pointCoords - the new map center coordinates
     * @param {tf.types.MapEventCallBack} callBack - if defined, receives a notification when the animation ends
     * @param {number} duration - the duration of the animation, in milliseconds, defaults to {@link tf.consts.defaultMapAnimatedCenterDurationMillis}
     * @param {boolean} notifyListeners - Set to <b>true</b> to send event notifications during the animation, defaults to {@link void}
     * @param {tf.types.EasingFunction} easing - if not defined defaults to {@link tf.units.EaseInAndOut}
     * @returns {void} - | {@link void} no return value
    */
    this.AnimatedSetCenter = function (pointCoords, callBack, duration, notifyListeners, easing) { animatedSetCenter(pointCoords, callBack, duration, notifyListeners, easing); }

    /**
     * @public
     * @function
     * @summary - Recenters the map to the given coordinates, uses incremental animation if the new center coordinates are visible
     * @param {tf.types.mapCoordinates} pointCoords - the new map center coordinates
     * @param {number} duration - the duration of the animation, in milliseconds, defaults to {@link tf.consts.defaultMapAnimatedCenterDurationMillis}
     * @returns {void} - | {@link void} no return value
    */
    this.AnimatedSetCenterIfDestVisible = function (pointCoords, duration) { animatedSetCenterIfDestVisible(pointCoords, duration); }

    /**
     * @public
     * @function
     * @summary - Checks if the map is performing an animation
     * @returns {boolean} - | {@link boolean} <b>true</b> if an animation is in progress, <b>false</b> otherwise
    */
    this.GetIsAnimating = function () { return isAnimating; }

    /**
     * @public
     * @function
     * @summary - Starts a map animation
     * @param {tf.types.MapAnimationCallBack} callBack - the animation callback
     * @param {object} optionalScope - optional JavaScript scope used with <b>callBack</b>
     * @returns {void} - | {@link void} no return value
    */
    this.StartAnimation = function (callBack, optionalScope) { return startAnimation(callBack, optionalScope); }

    /**
     * @public
     * @function
     * @summary - Stops an ongoing map animation
     * @returns {void} - | {@link void} no return value
    */
    this.EndAnimation = function () { return endAnimation(); }

    /**
     * @public
     * @function
     * @summary - Calls a TerraFly service to determine the map coordinates corresponding to the given address and performs a "fly" animation to re-center the map to those coordinates
     * @param {string} addressStr - the address
     * @returns {void} - | {@link void} no return value
    */
    this.FlyToAddress = function (addressStr) { return flyToAddress(addressStr); }

    /**
     * @public
     * @function
     * @summary - Retrieves the visible map extent
     * @returns {tf.types.mapExtent} - | {@link tf.types.mapExtent} the map extent
    */
    this.GetVisibleExtent = function () { return getVisibleExtent(); }

    /**
     * @public
     * @function
     * @summary - Sets the visible map extent
     * @param {tf.types.mapExtent} extent - the new map extent
     * @returns {void} - | {@link void} no return value
    */
    this.SetVisibleExtent = function (extent) { return setVisibleExtent(extent); }

    /**
     * @public
     * @function
     * @summary - Removes the given layer instance from the map
     * @param {tf.types.mapLayer} layerInstance - the layer instance
     * @returns {void} - | {@link void} no return value
    */
    this.RemoveLayer = function (layerInstance) { removeLayer(layerInstance); }

    /**
     * @public
     * @function
     * @summary - Adds a [Feature Layer]{@link tf.map.FeatureLayer} to the map
     * @param {tf.types.AddFeatureLayerSettings} layerSettings - layer instance creation settings
     * @returns {tf.map.FeatureLayer} - | {@link tf.map.FeatureLayer} the added feature layer
    */
    this.AddFeatureLayer = function (layerSettings) { return addFeatureLayer(layerSettings); }

    /**
     * @public
     * @function
     * @summary - Notifies the map that its container may have been resized
     * @returns {void} - | {@link void} no return value
    */
    this.OnResize = function () { return onResize(); }

    /**
     * @public
     * @function
     * @summary - Obtains the size of the map in pixels
     * @returns {tf.types.pixelCoordinates} - | {@link tf.types.pixelCoordinates} the size of the map in pixels
    */
    this.GetActualPixelSize = function () { return getActualPixelSize(); }

    /**
     * @public
     * @function
     * @summary - Moves the map center by a pixel offset
     * @param {tf.types.pixelCoordinates} pixelOffset - the offset
     * @returns {void} - | {@link void} no return value
    */
    this.PanByPixelOffset = function (pixelOffset) { panByPixelOffset(pixelOffset); }

    /**
     * @public
     * @function
     * @summary - Adds a listener for the given map event name
     * @param {tf.types.mapEventName} eventName - the name of the map event
     * @param {tf.types.MapEventCallBack} callBack - the callback for event notifications
     * @returns {tf.events.EventListener} - | {@link tf.events.EventListener} the event listener
    */
    this.AddListener = function (eventName, callBack) { return allEventDispatchers.AddListener(eventName, callBack); }

    /**
     * @public
     * @function
     * @summary - Adds one or more listeners for the given map event names
     * @param {tf.types.EventNamesAndCallBacks} eventNamesAndCallBacks - the event names and callbacks
     * @returns {tf.types.EventNamesAndListeners} - | {@link tf.types.EventNamesAndListeners} the event names and listeners
    */
    this.AddListeners = function (eventNamesAndCallBacks) { return allEventDispatchers.AddListeners(eventNamesAndCallBacks); }

    /**
     * @public
     * @function
     * @summary - Shows or hides the map center image overlay
     * @param {boolean} bool - set to <b>true</b> to dislay the center image, <b>false</b> to hide it
     * @returns {void} - | {@link void} no return value
    */
    this.ShowMapCenter = function (bool) { return showMapCenter(bool); }

    this.GetMapCenterElem = function () { return mapCenterButton; }

    /**
     * @public
     * @function
     * @summary - Checks if the map center image overlay is visible
     * @returns {boolean} - | {@link boolean} <b>true</b> if visible, <b>false</b> otherwise
    */
    this.IsShowingMapCenter = function () { return isShowingMapCenter; }

    this.GetLayersPopup = function () { return layersPopup; }

    this.ShowLayerList = function (bool) {
        var isShowingNow = isShowingMapLayers();
        if (isShowingNow != (bool = !!bool)) { toggleMapLayers(); }
    }

    this.GetIsShowingLayerList = function () { return isShowingMapLayers(); }

    /**
     * @public
     * @function
     * @summary - Shows or hides map panels
     * @param {tf.types.mapPanelNamesString} strPanels - a string containing the names of panels to be shown, panels not listed are hidden
     * @returns {void} - | {@link void} no return value
    */
    this.ShowPanels = function (strPanels) { return showPanels(strPanels); }

    /**
     * @public
     * @function
     * @summary - Shows or hides a map panel
     * @param {tf.types.mapPanelName} strPanel - the map panel
     * @param {boolean} showBool - <b>true</b> to show the panel, <b>false</b> to hide it
     * @returns {void} - | {@link void} no return value
    */
    this.ShowPanel = function (strPanel, showBool) { return showPanel(strPanel, showBool); }

    this.GetPanelElement = function (strPanel) { return getPanelElement(strPanel); }

    /**
     * @public
     * @function
     * @summary - Retrieves the current visibility state of a map panel
     * @param {tf.types.mapPanelName} strPanel - the map panel
     * @returns {boolean} - | {@link boolean} <b>true</b> if the panel is visible, <b>false</b> otherwise
    */
    this.IsPanelShowing = function (strPanel) { return isPanelShowing(strPanel); }

    /**
     * @public
     * @function
     * @summary - Shows or hides the full screen button
     * @param {boolean} bool - <b>true</b> to show, <b>false</b> to hide
     * @returns {void} - | {@link void} no return value
    */
    this.SetFullScreenButtonVisibility = function (bool) { showPanel(tf.consts.panelNameFullscreen, bool); }

    /**
     * @public
     * @function
     * @summary - Shows or hides the TerraFly Map Logo
     * @param {boolean} bool - <b>true</b> to show, <b>false</b> to hide
     * @returns {void} - | {@link void} no return value
    */
    this.SetLogoVisibility = function (visible) { return setLogoVisibility(visible); }

    /**
     * @public
     * @function
     * @summary - Shows the map full screen mode
     * @returns {void} - | {@link void} no return value
    */
    this.FullScreen = function () { return onFullScreen(); }

    /**
     * @public
     * @function
     * @summary - Toggles the map between full screen and normal modes
     * @returns {void} - | {@link void} no return value
    */
    this.ToggleMapFullScreen = function () { return toggleMapFullScreen(); }

    /**
     * @public
     * @function
     * @summary - Sets the map type 
     * @param {tf.types.mapType} type - the map type
     * @returns {void} - | {@link void} no return value
    */
    this.SetMapType = function (type) { setMapType(type, true); }

    /**
     * @public
     * @function
     * @summary - Gets the map type 
     * @returns {tf.types.mapType} - | {@link tf.types.mapType} the map type
    */
    this.GetMapType = function () { return currentMode; }

    /**
     * @public
     * @function
     * @summary - Sets the source of Aerial map tiles
     * @param {tf.types.mapAerialSource} source - the source
     * @returns {void} - | {@link void} no return value
    */
    this.SetSource = function (source) { setSource(source, true); }

    /**
     * @public
     * @function
     * @summary - Gets the source of Aerial map tiles
     * @returns {tf.types.mapAerialSource} - | {@link tf.types.mapAerialSource} the source
    */
    this.GetSource = function () { return currentSource; }

    /**
     * @public
     * @function
     * @summary - Sets the values of the [Hybrid]{@link tf.consts.typeNameHybrid} and [Map]{@link tf.consts.typeNameMap} [Legend Strings]{@link tf.types.legendString}
     * @param {tf.types.legendString} legendStrHybrid - used with [Hybrid]{@link tf.consts.typeNameHybrid} type
     * @param {tf.types.legendString} legendStrMap - used with [Map]{@link tf.consts.typeNameMap} type
     * @returns {void} - | {@link void} no return value
    */
    this.SetLegend = function (legendStrHybrid, legendStrMap) { setLegend(legendStrHybrid, legendStrMap); }

    /**
     * @public
     * @function
     * @summary - Checks if map interactions (pan, zoom, etc.) are allowed
     * @returns {boolean} - | {@link boolean} <b>true</b> if interactions are allowed, <b>false</b> otherwise
    */
    this.GetHasInteractions = function () { return getHasInteractions(); }

    /**
     * @public
     * @function
     * @summary - Allows or prevents map interactions (pan, zoom, etc.)
     * @param {boolean} bool - set to <b>true</b> to allow interactions, <b>false</b> to prevent interactions
     * @returns {void} - | {@link void} no return value
    */
    this.SetHasInteractions = function (bool) { setHasInteractions(bool); }

    /**
     * @public
     * @function
     * @summary - Shows the Address Bar
     * @returns {void} - | {@link void} no return value
    */
    this.ShowAddressBar = function () { showAddressBar(); }

    /**
     * @public
     * @function
     * @summary - Hides the Address Bar
     * @returns {void} - | {@link void} no return value
    */
    this.HideAddressBar = function () { hideAddressBar(); }

    /**
     * @public
     * @function
     * @summary - Toggles the Address Bar visibility state
     * @returns {void} - | {@link void} no return value
    */
    this.ToggleAddressBar = function () { toggleAddressBar(); }

    /**
     * @public
     * @function
     * @summary - Checks if the Address Bar is visible
     * @returns {boolean} - | {@link boolean} <b>true</b> if the bar is visible, <b>false</b> otherwise
    */
    this.IsShowingAddressBar = function () { return isShowingAddressBar(); }

    /**
     * @public
     * @function
     * @summary - Shows the Message Popup
     * @param {HTMLElementLike} contents - the contents to be displayed
     * @returns {void} - | {@link void} no return value
    */
    this.ShowMessage = function (contents) { showMessage(contents); }

    /**
     * @public
     * @function
     * @summary - Hides the Message Popup
     * @returns {void} - | {@link void} no return value
    */
    this.HideMessage = function () { hideMessage(); }

    /**
     * @public
     * @function
     * @summary - Toggles the Message Popup visibility state
     * @returns {void} - | {@link void} no return value
    */
    this.ToggleMessage = function () { toggleMessage(); }

    /**
     * @public
     * @function
     * @summary - Checks if the Message Popup is visible
     * @returns {boolean} - | {@link boolean} <b>true</b> if the popup is visible, <b>false</b> otherwise
    */
    this.IsShowingMessage = function () { return isShowingMessage(); }

    /**
     * @public
     * @function
     * @summary - Sets the time after which the Message Popup automatically hides itself
     * @param {number} timeoutSecs - the time in seconds
     * @returns {void} - | {@link void} no return value
    */
    this.SetMessageTimeout = function (timeoutSecs) { setMessageTimeout(timeoutSecs); }

    /**
     * @public
     * @function
     * @summary - Hides any visible control popups (layers, types, sources, etc.)
     * @returns {void} - | {@link void} no return value
    */
    this.HideOpenControlPopups = function () { hideOpenControlPopups(); }

    /**
     * @public
     * @function
     * @summary - Hides any visible popups (information, location, message)
     * @returns {void} - | {@link void} no return value
    */
    this.HideOpenPopups = function () { hideOpenPopups(); }

    /**
     * @public
     * @function
     * @summary - Checks if the Information Popup is visible
     * @returns {boolean} - | {@link boolean} <b>true</b> if the popup is visible, <b>false</b> otherwise
    */
    this.IsShowingInfoPopup = function () { return isShowingInfoWindow(); }

    /**
     * @public
     * @function
     * @summary - Toggles the visibility state of the Information Popup
     * @returns {void} - | {@link void} no return value
    */
    this.ToggleInfoPopup = function () { toggleInfoWindow(); }

    /**
     * @public
     * @function
     * @summary - Hides the Information Popup
     * @returns {void} - | {@link void} no return value
    */
    this.HideInfoPopup = function () { hideInfoWindow(); }

    /**
     * @public
     * @function
     * @summary - Shows the Information Popup
     * @param {string} title - title of the popup
     * @param {HTMLElementLike} content - content of the popup
     * @param {tf.types.mapCoordinates} pointCoords - map coordinates associated with the popup
     * @returns {void} - | {@link void} no return value
    */
    this.ShowInfoPopup = function (title, content, pointCoords) { showInfoWindow(title, content, pointCoords); }

    /**
     * @public
     * @function
     * @summary - Checks if the Information Popup is pinned
     * @returns {boolean} - | {@link boolean} <b>true</b> if the popup is pinned, <b>false</b> otherwise
    */
    this.IsInfoPopupPinned = function () { return infoWindowPinned; }

    /**
     * @public
     * @function
     * @summary - Toggles the pinned state of the Information Popup
     * @returns {void} - | {@link void} no return value
    */
    this.ToggleInfoPopupPin = function () { toggleInfoWindowPin(); }

    /**
     * @public
     * @function
     * @summary - Allows the user to interactivelly define a rectangular map area for information download from a TerraFly service
     * @returns {void} - | {@link void} no return value
    */
    this.StartDownloadInteraction = function () { return startDownloadInteraction(); }

    /**
     * @public
     * @function
     * @summary - Cancels an ongoing Download interaction
     * @returns {void} - | {@link void} no return value
    */
    this.CancelDownloadInteraction = function () { return cancelDownloadInteraction(); }

    /**
     * @public
     * @function
     * @summary - Allows the user to interactivelly measure distances and areas
     * @returns {void} - | {@link void} no return value
    */
    this.StartMeasureInteraction = function () { return startMeasureInteraction(); }

    /**
     * @public
     * @function
     * @summary - Cancels an ongoing Measure interaction
     * @returns {void} - | {@link void} no return value
    */
    this.CancelMeasureInteraction = function () { return cancelMeasureInteraction(); }

    /**
     * @public
     * @function
     * @summary - Collapses or expands the Overview Map according to the given parameter
     * @param {boolean} bool - set to <b>true</b> to collapse the Overview Map, <b>false</b> to expand it
     * @returns {void} - | {@link void} no return value
    */
    this.SetOverviewMapCollapsed = function (bool) {
        if (!!mapControls[tf.consts.panelNameOverview] && mapControls[tf.consts.panelNameOverview].isOn) { mapControls[tf.consts.panelNameOverview].control.setCollapsed(!!bool); }
    }

    /**
     * @public
     * @function
     * @summary - Checks if the Overview Map is collapsed
     * @returns {boolean} - | {@link boolean} <b>true</b> if the Overview Map is collapsed, <b>false</b> otherwise
    */
    this.IsOverviewMapCollapsed = function () { return !!mapControls[tf.consts.panelNameOverview] && mapControls[tf.consts.panelNameOverview].isOn && mapControls[tf.consts.panelNameOverview].control.getCollapsed(); }

    /**
     * @public
     * @function
     * @summary - Sets map view options
     * @param {tf.types.MapViewSettings} viewSettings - view options
     * @returns {void} - | {@link void} no return value
    */
    this.SetView = function (viewSettings) { return setView(viewSettings); }

    /**
     * @public
     * @function
     * @summary - Sets a custom Map Tile layer source along with its {@link tf.consts.typeNameHybrid} opacity
     * @param {tf.types.mapTileServerUrl} mapLayerSourceURLSet - alternative map engine
     * @param {tf.types.opacity01} mapLayerSourceHybridModeOpacitySet - opacity used when the map type is set to {@link tf.consts.typeNameHybrid}
     * @returns {void} - | {@link void} no return value
    */
    this.SetMapLayerSource = function (mapLayerSourceURLSet, mapLayerSourceHybridModeOpacitySet) {
        return setMapLayerSource(mapLayerSourceURLSet, mapLayerSourceHybridModeOpacitySet);
    }

    /**
     * @public
     * @function
     * @summary - Shows or hides all keyed features in the given list
     * @param {tf.map.KeyedFeatureList} keyedFeatureList - the list
     * @param {boolean} showOrHideBool - <b>true</b> to show the features, <b>false</b> to hide them
     * @param {string} styleName - optional feature style name
     * @returns {void} - | {@link void} no return value
    */
    this.ShowAllKeyedFeatures = function (keyedFeatureList, showOrHideBool, styleName) { return showAllKeyedFeatures(keyedFeatureList, showOrHideBool, styleName); }

    /**
     * @public
     * @function
     * @summary - Shows or hides the keyed features in the given list whose keys are included in the given list of keys
     * @param {tf.map.KeyedFeatureList} keyedFeatureList - the list
     * @param {enumerable} keyList - an enumerable containing the keys of the features to be shown or hidden
     * @param {boolean} showOrHideBool - <b>true</b> to show the features, <b>false</b> to hide them
     * @param {string} styleName - optional feature style name
     * @returns {void} - | {@link void} no return value
    */
    this.ShowSomeKeyedFeatures = function (keyedFeatureList, keyList, showOrHideBool, styleName) { return showSomeKeyedFeatures(keyedFeatureList, keyList, showOrHideBool, styleName); }

    /**
     * @public
     * @function
     * @summary - Shows or hides one keyed feature
     * @param {tf.map.KeyedFeature} keyedFeature - the feature
     * @param {boolean} showOrHideBool - <b>true</b> to show the features, <b>false</b> to hide them
     * @param {string} styleName - optional feature style name
     * @returns {void} - | {@link void} no return value
    */
    this.ShowKeyedFeature = function (keyedFeature, showOrHideBool, styleName) { return showKeyedFeature(feature, showOrHideBool, styleName); }

    /**
     * @public
     * @function
     * @summary - Checks if a given keyed feature is being shown
     * @param {tf.map.KeyedFeature} keyedFeature - the feature
     * @returns {boolean} - | {@link boolean} <b>true</b> if the feature is being shown, <b>false</b> otherwise
    */
    this.GetIsShowingKeyedFeature = function (keyedFeature) { return getIsShowingKeyedFeature(keyedFeature); }

    /**
     * @public
     * @function
     * @summary - Obtains the map feature layer for showing a given keyed feature, if one exists
     * @param {tf.map.KeyedFeature} keyedFeature - the feature
     * @returns {tf.map.FeatureLayer} - | {@link tf.map.FeatureLayer} the feature layer, or null if none exists
    */
    this.GetLayerForKeyedFeature = function (keyedFeature) { return getLayerForKeyedFeature(keyedFeature); }

    /**
     * @public
     * @function
     * @summary - Obtains the map feature layer for showing a given keyed feature list, if one exists
     * @param {tf.map.KeyedFeatureList} keyedFeatureList - the feature list
     * @returns {tf.map.FeatureLayer} - | {@link tf.map.FeatureLayer} the feature layer, or null if none exists
    */
    this.GetLayerForKeyedFeatureList = function (keyedFeatureList) { return getLayerForKeyedFeatureList(keyedFeatureList); }

    /**
     * @public
     * @function
     * @summary - Obtains a map feature layer given its name, if one exists
     * @param {string} name - the feature layer name
     * @returns {tf.map.FeatureLayer} - | {@link tf.map.FeatureLayer} the feature layer, or null if none exists
    */
    this.GetLayerByName = function (name) { return getLayerByName(name); }

    /**
     * @private
     * @function
     * @summary - adds a deprecated {@link TLayer} instance to the map
     * @param {tf.types.FeatureLayerSettings} layerSettings - layer creation settings
     * @returns {TLayer} - the deprecated TLayer instance
     * @deprecated This function will soon be removed
    */
    this.deprecatedAddLegacyLayer = function (layerSettings) { return addLegacyLayer(layerSettings); }

    /**
     * @private
     * @function
     * @summary - Requests the map to immediately initiate a render cycle. Should not be called from within a render cycle (e.g. during a map {@link tf.consts.mapPostComposeEvent} event)
     * @returns {void} - | {@link void} no return value
    */
    this.renderNow = function () { return renderNow(); }

    /**
     * @private
     * @function
     * @summary - Adds an HTML overlay to the map
     * @param {tf.map.HTMLOverlay} mapHTMLOverlay - the overlay instance
     * @returns {void} - | {@link void} no return value
    */
    this.addHTMLOverlay = function (mapHTMLOverlay) { if (!!mapHTMLOverlay && mapHTMLOverlay instanceof tf.map.HTMLOverlay) { olMap.addOverlay(mapHTMLOverlay.getAPIOverlay()); } }

    /**
     * @private
     * @function
     * @summary - Removes an HTML overlay from the map
     * @param {tf.map.HTMLOverlay} mapHTMLOverlay - the overlay instance
     * @returns {void} - | {@link void} no return value
    */
    this.removeHTMLOverlay = function (mapHTMLOverlay) { if (!!mapHTMLOverlay && mapHTMLOverlay instanceof tf.map.HTMLOverlay) { olMap.removeOverlay(mapHTMLOverlay.getAPIOverlay()); } }

    /**
     * @private
     * @function
     * @summary - Adds an HTML control to the map
     * @param {tf.map.HTMLControl} mapHTMLControl - the control instance
     * @returns {void} - | {@link void} no return value
    */
    this.addHTMLControl = function (mapHTMLControl) { if (!!mapHTMLControl && mapHTMLControl instanceof tf.map.HTMLControl) { olMap.addControl(mapHTMLControl.getAPIControl()); } }

    /**
     * @private
     * @function
     * @summary - Removes an HTML control from the map
     * @param {tf.map.HTMLControl} mapHTMLControl - the control instance
     * @returns {void} - | {@link void} no return value
    */
    this.removeHTMLControl = function (mapHTMLControl) { if (!!mapHTMLControl && mapHTMLControl instanceof tf.map.HTMLControl) { olMap.removeControl(mapHTMLControl.getAPIControl()); } }

    function showAllKeyedFeatures(keyedFeatureList, showOrHideBool, styleNameForShow) {
        if (keyedFeatureList instanceof tf.map.KeyedFeatureList) {
            var featureLayer = getLayerForKeyedFeatureList(keyedFeatureList);
            if (!!featureLayer) {
                if (!!showOrHideBool) {
                    var keyedList = keyedFeatureList.GetKeyedList();
                    var keyedItemList = keyedList.GetKeyedItemList();
                    for (var i in keyedItemList) { featureLayer.AddKeyedFeature(keyedFeatureList.GetFeature(keyedItemList[i].GetKey()), styleNameForShow, true); }
                    featureLayer.AddWithheldFeatures();
                } else { featureLayer.RemoveAllFeatures(); }
            }
        }
    }

    function showSomeKeyedFeatures(keyedFeatureList, keyList, showOrHideBool, styleNameForShow) {
        if (keyedFeatureList instanceof tf.map.KeyedFeatureList && typeof keyList === "object") {
            var featureLayer = getLayerForKeyedFeatureList(keyedFeatureList);
            if (!!featureLayer) {
                var keyedList = keyedFeatureList.GetKeyedList();
                showOrHideBool = !!showOrHideBool;
                for (var i in keyList) {
                    var keyedItem = keyedList.GetItem(keyList[i]);
                    if (!!keyedItem) {
                        var keyedFeature = keyedFeatureList.GetFeature(keyedItem.GetKey());
                        if (showOrHideBool) { featureLayer.AddKeyedFeature(keyedFeature, styleNameForShow, true); } else { featureLayer.DelKeyedFeature(keyedFeature, true); }
                    }
                }
                if (showOrHideBool) { featureLayer.AddWithheldFeatures(); } else { featureLayer.DelWithheldFeatures(); }
            }
        }
    }

    function showFeature(keyedFeature, showOrHideBool, styleNameForShow) {
        var featureLayer = getLayerForKeyedFeature(keyedFeature);
        if (!!featureLayer) { if (!!showOrHideBool) { featureLayer.AddKeyedFeature(keyedFeature, styleNameForShow, false); } else { featureLayer.DelKeyedFeature(keyedFeature, false); } }
    }

    function getIsShowingKeyedFeature(keyedFeature) {
        var featureLayer = getLayerForKeyedFeature(keyedFeature);
        return !!featureLayer ? featureLayer.ContainsKeyedFeature(keyedFeature) : false;
    }

    function getLayerForKeyedFeature(keyedFeature) { return tf.js.GetIsInstanceOf(keyedFeature, tf.map.KeyedFeature) ? getLayerByName(keyedFeature.GetLayerName()) : null; }
    function getLayerForKeyedFeatureList(keyedFeatureList) { return tf.js.GetIsInstanceOf(keyedFeatureList, tf.map.KeyedFeatureList) ? getLayerByName(keyedFeatureList.GetLayerName()) : null; }
    function getLayerByName(name) { return layersByName[name]; }

    var mapLayerSourceURL = null;
    var mapLayerSourceHybridModeOpacity = 1;
    var mapLayerSourceURLWasSet = false;

    function setMapLayerSource(mapLayerSourceURLSet, mapLayerSourceHybridModeOpacitySet) {
        mapLayerSourceURL = !!mapLayerSourceURLSet && typeof mapLayerSourceURLSet == "string" && mapLayerSourceURLSet.length > 0 ? mapLayerSourceURLSet : null;
        mapLayerSourceHybridModeOpacity = tf.js.GetFloatNumberInRange(mapLayerSourceHybridModeOpacitySet, 0.0, 1.0, 1.0);
        mapLayerSourceURLWasSet = false;
        setVectorLayerParams();
    }

    var useMapNik2 = null;
    var firstFeatureOnly = true;
    var infoFeatureName = "Info";
    var theThis = null;
    var mapButtonDimEmStr;
    var baseLayersPopup = null;
    var layersPopup = null;
    var typesPopup = null;
    var sourcesPopup = null;
    var infoWindowPopup = null;
    var locInfoWindowPopup = null;
    var messagePopup = null;
    var addressPopup = null;
    var downloadPopup = null;
    var measurePopup = null;
    var zIndexPopups = [];

    var baseNotification;

    function addToZIndexPopups(popup, theThis) {
        if (popup) {
            zIndexPopups.push(popup);
            popup.SetZIndex(minZIndexPopup++);
            popup.SetOnClickTitle(function () { return onClickMessagePopup(popup); }, theThis);
        }
    }

    function promoteToTopZIndex(popup) {
        if (popup) {
            var currentZIndex = popup.GetZIndex();

            if (currentZIndex < minZIndexPopup - 1) {
                var nZIndexPopups = zIndexPopups.length;
                var topZIndex = nZIndexPopups + minZIndexPopup;

                popup.SetZIndex(topZIndex);
                minZIndexPopup = topZIndex + 1;

                if (topZIndex > maxZIndex + nZIndexPopups) {
                    for (var i = 0 ; i < nZIndexPopups ; i++) {
                        var adjustedZIndex = zIndexPopups[i].GetZIndex() - startMinZIndexPopup;

                        zIndexPopups[i].SetZIndex(adjustedZIndex);
                    }
                    minZIndexPopup = startMinZIndexPopup + nZIndexPopups;
                }
            }
        }
    }

    var olMap = null;
    var olView = null;

    var rasterLayer = null;
    var vectorLayer = null;

    var vectorLayerSource = null, rasterLayerSource = null;

    var mapEngine = null, currentMode = null, currentSource = null;

    var mapFeatureLayers = [];
    var hiddenMapFeatureLayers = [];

    var invalidLatLon = -999;
    var invalidZoom = -1;
    var invalidRes = 0;

    var currentRes = invalidRes;
    var currentLevel = invalidZoom;
    var currentLat = invalidLatLon;
    var currentLon = invalidLatLon;

    var styles = tf.GetStyles();

    var containerAll = null, mapContainerAllObj = null, mapContainerObj = null, mapContainerAll = null, mapContainer = null;
    var mapControlContainerObj, mapControlContainerHTML;

    var maxZIndex = 500;
    var initialZIndex = 1;
    var zIndex = initialZIndex;

    var isShowingMapCenter = true;
    var mapCenterButton = null;

    var minZIndexPopup = 0;
    var startMinZIndexPopup = 0;

    var hoverListener;

    function createDivs(containerAllSet) {
        containerAll = tf.dom.GetHTMLElementFrom(containerAllSet);

        mapContainerAllObj = new tf.dom.Div({ cssClass: styles.mapContainerClass });
        mapContainerObj = new tf.dom.Div({ cssClass: styles.mapSubContainerClass });

        //mapControlContainerObj = new tf.dom.Div({ cssClass: styles.mapContainerClass });
        mapControlContainerObj = new tf.dom.Div({ cssClass: styles.GetUnPaddedDivClassNames(false, false) });
        mapControlContainerHTML = mapControlContainerObj.GetHTMLElement();

        mapControlContainerHTML.style.backgroundColor = "rgba(255, 0, 0, 0.6)";
        //mapControlContainerHTML.title = "hello, world.";

        mapContainerAll = mapContainerAllObj.GetHTMLElement();
        mapContainer = mapContainerObj.GetHTMLElement();

        hoverListener = new tf.events.DOMMouseEnterLeaveListener({
            target: containerAll, callBack: function (notification) {
                var target = notification.event.target;
                if (containerAll == target) {
                    if (!notification.isInHover) {
                        if (!containerAll.contains(document.activeElement)) {
                            hoverOutOfPossibleHoveredFeature();
                            //console.log('hovered out');
                        }
                    }
                }
                return true;
            }, optionalScope: theThis, callBackSettings: null
        });

        mapContainerObj.AppendTo(mapContainerAll);
        mapControlContainerObj.AppendTo(mapContainerAll);

        /*mapContainer.style.zIndex = zIndex++;
        mapContainer.style.height = "200%";
        mapContainer.style.width = "200%";
        mapContainer.style.transform = "translate(-50%, -50%)";*/

        minZIndexPopup = zIndex + 200;
        startMinZIndexPopup = minZIndexPopup;

        if (!settings.noNativeControls) {
            //var dim = subStyles.mapButtonDimEmNumber;
            var dim = (subStyles.locationPopupContentFontSizeEmNumber * 2);

            htmlFeedDiv = new tf.dom.Div({ cssClass: styles.dLayerInfoClass });

            var htmlFeedDivStyle = htmlFeedDiv.GetHTMLElement().style;

            htmlFeedDivStyle.textAlign = 'center';
            htmlFeedDivStyle.display = 'inline';

            var toggleBtn = styles.AddButtonDivRightMargin(new tf.ui.SvgGlyphBtn({
                style: styles.mapSvgGlyphInPopupClass, glyph: tf.styles.SvgGlyphCloseXName,
                onClick: toggleLocInfoWindow, tooltip: tf.consts.mapLocationPopupHideTip, dim: dim + "em"
            }));

            toggleBtn.GetHTMLElement().style.display = 'inline-block';

            infoPopupDiv = new tf.dom.Div({ cssClass: styles.unPaddedInlineBlockDivClass });
            infoPopupDiv.AddContent(toggleBtn);
            infoPopupDiv.AddContent(htmlFeedDiv);
        }

        if (!!containerAll) { mapContainerAllObj.AppendTo(containerAll); }
    }

    var olSourceVector = null;
    var olLayer = null;
    var privateTLayer = null;
    var userPosFeature = null;
    var userPosLocationFeature = null;

    var olInfoFeature = null;
    var olLocFeature = null;

    function privateNotifyTLayerVisibilityChange(tLayer) { if (layersPopup) { layersPopup.UpdateLayerVisibilityFromMap(); } }

    function privateSetDeleteCmdCallBack(tLayer, deleteCmdCallBack) { if (tLayer) { tLayer.exportSetDeleteCmdCallBack = deleteCmdCallBack; } }

    function removeLayer(layerObj) {
        if (tf.js.GetIsMapFeatureLayer(layerObj)) {

            var isHidden = layerObj.GetIsHidden();
            var layerArray = isHidden ? hiddenMapFeatureLayers : mapFeatureLayers;
            var index = layerArray.indexOf(layerObj);

            if (index != -1) {

                var layerName = layerObj.GetName();

                if (tf.js.GetIsNonEmptyString(layerName)) { delete layersByName[layerName]; }

                layerObj.RemoveAllFeatures();
                layerObj.exportSetDeleteCmdCallBack.call(layerObj);
                layerArray.splice(index, 1);

                if (!isHidden) { refreshLayersPopup(); }
            }
        }
    }

    function addLegacyLayer(layerSettings) { return doAddFeatureLayer(layerSettings, true); }
    function addFeatureLayer(layerSettings) { return doAddFeatureLayer(layerSettings, false); }

    function doAddFeatureLayer(layerSettings, isLegacy) {
        var featureLayer = null;
        var settingsUse = tf.js.ShallowMerge(layerSettings);
        var canAddLayer = true;
        var layerName = null;

        if (tf.js.GetIsNonEmptyString(settingsUse.name)) {
            if (!(canAddLayer = !getLayerByName(layerName = settingsUse.name))) {
                tf.GetDebug().LogIfTest("tf.map.Map: adding layer with duplicate name: " + layerName);
            }
        }

        if (canAddLayer) {
            settingsUse = tf.js.ShallowMerge(settingsUse, {
                map: theThis,
                olMap: olMap,
                notifyDelFeatures: privateNotifyDelFeatures,
                notifyVisibilityChange: privateNotifyTLayerVisibilityChange,
                setDeleteCmdCallBack: privateSetDeleteCmdCallBack
            });

            featureLayer = !!isLegacy ? new TLayer(settingsUse) : (settingsUse.overrideClass == undefined ? new tf.map.FeatureLayer(settingsUse) : new settingsUse.overrideClass(settingsUse)) ;
            if (!!layerName) { layersByName[layerName] = featureLayer; }
            if (!!featureLayer.GetIsHidden()) { hiddenMapFeatureLayers.push(featureLayer); } else { mapFeatureLayers.push(featureLayer); refreshLayersPopup(); }
        }

        return featureLayer;
    }

    function panByPixelOffset(pixelOffset) {
        if (tf.js.GetIsArrayWithMinLength(pixelOffset, 2)) {
            var x = tf.js.GetFloatNumber(pixelOffset[0], 0);
            var y = tf.js.GetFloatNumber(pixelOffset[1], 0);
            if (x != 0 || y != 0) {
                var center = getCenter();
                var sCenter = mapToPixelCoords(center);
                sCenter.X += x; sCenter.Y += y;
                var newCenter = pixelToMapCoords([sCenter.X, sCenter.Y]);
                setCenter(newCenter);
            }
        }
    }

    function getOLViewCenter() { return olView.getCenter(); }
    function getCenterCoords() { return tf.units.OL2TM(getOLViewCenter()); }

    function getCenter() {
        var center = getCenterCoords();
        center.Longitude = center[0];
        center.Latitude = center[1];
        return center;
    }

    function getPixelDistance(pointCoords1, pointCoords2) {
        var P1 = mapToPixelCoords(pointCoords1);
        var P2 = mapToPixelCoords(pointCoords2);
        var distanceX = P1[0] - P2[0];
        var distanceY = P1[1] - P2[1];
        var distanceSQ = (distanceX * distanceX) + (distanceY * distanceY);
        return Math.sqrt(distanceSQ);

    }

    function isSamePixelAs(pointCoords1, pointCoords2) { return getPixelDistance(pointCoords1, pointCoords2) == 0; };

    function getPixelDistanceFromCenter(pointCoords) {
        return getPixelDistance(/*[currentLon, currentLat]*/getCenter(), pointCoords);
    }

    function isSamePixelAsCenter(pointCoords) { return getPixelDistanceFromCenter(pointCoords) == 0; }

    function actualPixelToMapCoords(pointCoords) {
        var mapCoords = olMap.getCoordinateFromPixel(pointCoords);
        if (!tf.js.GetIsArrayWithMinLength(mapCoords, 2)) { mapCoords = [0, 0]; }
        else { mapCoords = tf.units.OL2TM(mapCoords); }
        return mapCoords;
    }

    function pixelToMapCoords(pointCoords) { return actualPixelToMapCoords(actualToVirtualPixelCoords(pointCoords)); }

    function actualMapToPixelCoords(pointCoords) {
        var pixelCoords = olMap.getPixelFromCoordinate(tf.units.TM2OL(pointCoords));
        if (!tf.js.GetIsArrayWithMinLength(pixelCoords, 2)) { pixelCoords = [0, 0]; }
        return pixelCoords;
    }

    function mapToPixelCoords(pointCoords) { return virtualToActualPixelCoords(actualMapToPixelCoords(pointCoords)); }

    var lastContainerAllClientW, lastContainerAllClientH;

    function onResize() {
        var newWidth = mapContainerAll.clientWidth;
        var newHeight = mapContainerAll.clientHeight;
        //console.log('attempt resize: ' + newWidth + ' x ' + newHeight);
        if (lastContainerAllClientW != newWidth || lastContainerAllClientH != newHeight) {
            //console.log('resize: ' + newWidth + ' x ' + newHeight);
            olMap.setSize([lastContainerAllClientW = newWidth, lastContainerAllClientH = newHeight]);
            olMap.updateSize();
            //theThis.Render();
        }
    }

    function getActualPixelSize() {
        if (olMap) { return olMap.getSize(); }
        else if (mapContainerAll) { return [mapContainerAll.clientWidth, mapContainerAll.clientHeight]; }
        return [0, 0];
    }

    function setLogoVisibility(visible) { return showPanel(tf.consts.panelNameTFLogo, !!visible); }

    var addressBarIsShowing = undefined;
    //var locInfoWindowIsShowing = undefined;
    var locInfoWindowIsShowing = false;
    //var locInfoWindowIsShowing = true;

    function getPanelElement(strPanel) {
        var elem;
        if (tf.js.GetIsNonEmptyString(strPanel)) {
            var strPanelLower = strPanel.toLowerCase();
            var panelControl = mapControls[strPanelLower];
            elem = !!panelControl ? panelControl.control : undefined;
        }
        return elem;
    }

    function showPanel(strPanel, showBool) {
        if (tf.js.GetIsNonEmptyString(strPanel)) {
            var strPanelLower = strPanel.toLowerCase();
            var panelControl = mapControls[strPanelLower];

            if (!panelControl) { checkCreateControl(strPanelLower); }

            if (!!panelControl) {
                if ((showBool = !!showBool) != panelControl.isOn) {
                    if (panelControl.isOn = !panelControl.isOn) {
                        if (panelControl.control) {
                            olMap.addControl(panelControl.control);
                            switch (strPanelLower) {
                                case tf.consts.panelNameOverview:
                                    if (!overviewMapClickHooked) {
                                        tryHookCount = 0;
                                        hookOverviewMapClick();
                                    }
                                    break;
                                case tf.consts.panelNameAddress:
                                    if (addressBarIsShowing === undefined || addressBarIsShowing == true) { showAddressBar(); }
                                    break;
                                case tf.consts.panelNameMapLocation:
                                    setUseRevGeocoderOnMoveEnd(showLocInfoWindowOnMoveEnd);
                                    if (locInfoWindowIsShowing === undefined || locInfoWindowIsShowing == true) { showLocInfoWindow(); }
                                    break;
                            }
                        }
                    }
                    else {
                        olMap.removeControl(panelControl.control);
                        switch (strPanelLower) {
                            case tf.consts.panelNameAddress:
                                addressBarIsShowing = isShowingAddressBar();
                                hideAddressBar();
                                break;
                            case tf.consts.panelNameMapLocation:
                                locInfoWindowIsShowing = isShowingLocInfoWindow();
                                hideLocInfoWindow();
                                setUseRevGeocoderOnMoveEnd(false);
                                break;
                        }
                    }
                }
            }
        }
    }

    function isPanelShowing(strPanel) {
        var isVisible = false;
        if (tf.js.GetIsNonEmptyString(strPanel)) {
            var panelControl = mapControls[strPanel.toLowerCase()];
            if (!!panelControl) { isVisible = panelControl.isOn; }
        }
        return isVisible;
    }

    function showPanels(strPanels) {
        if (tf.js.GetIsNonEmptyString(strPanels)) {

            strPanels = strPanels.split(tf.consts.charSplitStrings);

            var nParams = strPanels.length;
            var paramShown = [];
            var allstrPanels = tf.consts.allPanelNames;
            var allstrPanelsLen = allstrPanels.length;
            var showAddress = true;
            var showMapLocation = true;
            var showMapScale = true;
            var showMapRotate = true;
            var showUserLocation = true;

            for (var i = 0 ; i < nParams ; ++i) {
                var paramName = strPanels[i].toLowerCase();

                if (paramName == tf.consts.panelNameNoAddress) { showAddress = false; }
                else if (paramName == tf.consts.panelNameNoMapLocation) { showMapLocation = false; }
                else if (paramName == tf.consts.panelNameNoMapRotate) { showMapRotate = false; }
                else if (paramName == tf.consts.panelNameNoMapScale) { showMapScale = false; }
                else if (paramName == tf.consts.panelNameNoUserLocation) { showUserLocation = false; }
                else {
                    for (var j = 0 ; j < allstrPanelsLen ; ++j) {
                        var thisPanelParam = allstrPanels[j];
                        if (thisPanelParam == paramName) {
                            paramShown[j] = true;
                            showPanel(paramName, true);
                            break;
                        }
                    }
                }
            }

            for (var j = 0 ; j < allstrPanelsLen ; ++j) { var thisPanelShown = paramShown[j]; if (!thisPanelShown) { showPanel(allstrPanels[j], false); } }

            showPanel(tf.consts.panelNameAddress, showAddress);
            showPanel(tf.consts.panelNameMapLocation, showMapLocation);
            showPanel(tf.consts.panelNameMapRotate, showMapRotate);
            showPanel(tf.consts.panelNameMapScale, showMapScale);
            showPanel(tf.consts.panelNameUserLocation, showUserLocation);
        }
    }

    function setLegend(legendStrHybrid, legendStrMap) {
        //tf.GetDebug().LogIfTest("setting legend");
        var legendStrHybridUse = tf.js.GetNonEmptyString(legendStrHybrid, "");
        var legendStrMapUse = tf.js.GetNonEmptyString(legendStrMap, "");
        var decodedHybridLegend = new tf.map.aux.LegendDecoder(legendStrHybridUse);
        var decodedMapLayers = useMapNik2 ? new tf.map.aux.LegendDecoder(legendStrMapUse) : null;

        if (!!baseLayersPopup) {
            baseLayersPopup.SetLegend(decodedHybridLegend, decodedMapLayers);
            refreshLayersPopup();
        }
    }

    function isShowingPopup(popup) { return !!popup && popup.IsShowing(); }
    function showInfoPopup(popup) { if (!!popup) { hideOpenControlPopups(); popup.Show(true); } }
    function showControlPopup(popup) { if (!!popup) { hideOpenControlPopups(); showInfoPopup(popup); } }
    function hidePopup(popup) { !!popup && popup.Show(false); }
    function togglePopup(popup) { if (isShowingPopup(popup)) { hidePopup(popup); } else { showPopup(popup); } }
    function toggleControlPopup(popup) { if (isShowingPopup(popup)) { hidePopup(popup); } else { showControlPopup(popup); } }

    function isShowingMapType() { return isShowingPopup(typesPopup); }
    function showMapType() { showControlPopup(typesPopup); }
    function hideMapType() { hidePopup(typesPopup); }
    function toggleMapType() { toggleControlPopup(typesPopup); }

    function isShowingAddressBar() { return isShowingPopup(addressPopup); }
    function toggleAddressBar() { toggleControlPopup(addressPopup); }
    function hideAddressBar() { hidePopup(addressPopup); }
    function showAddressBar() { showControlPopup(addressPopup); }

    function isShowingMapLayers() { return isShowingPopup(layersPopup); }
    function showMapLayers() {
        if (mapFeatureLayers.length > 0) {
            showControlPopup(layersPopup);
        }
        else {
            showMapBaseLayers();
        }
    }
    function hideMapLayers() { hidePopup(layersPopup); }
    function toggleMapLayers() {
        if (isShowingMapLayers()) {
            hideMapLayers();
        }
        else {
            showMapLayers();
        }
    }

    function isShowingMapSource() { return isShowingPopup(sourcesPopup); }
    function showMapSource() { showControlPopup(sourcesPopup); }
    function hideMapSource() { hidePopup(sourcesPopup); }
    function toggleMapSource() { toggleControlPopup(sourcesPopup); }

    function isShowingMapBaseLayers() { return isShowingPopup(baseLayersPopup); }
    function showMapBaseLayers() { if (baseLayersPopup && baseLayersPopup.GetHasLegend()) { showControlPopup(baseLayersPopup); } }
    function hideMapBaseLayers() { hidePopup(baseLayersPopup); }
    function toggleMapBaseLayers() { toggleControlPopup(baseLayersPopup); }

    function hideOpenControlPopups() {
        //hideAddressBar();
        hideMapType();
        hideMapLayers();
        hideMapSource();
        hideMapBaseLayers();
    }

    function hideOpenPopups() {
        hideInfoWindow();
        hideLocInfoWindow();
        hideMessage();
        hideOpenControlPopups();
    }


    var mapControls = [];

    function privateSetSource(source) { setSource(source, false); }

    function privateSetMode(mode) { setMapType(mode, false); }

    function privateInfoOnClose() { hideInfoWindow(); }

    function privateLocInfoOnClose() {
        //hideLocInfoWindow();
    }

    function privateMessageOnClose() { hideMessage(); }

    function privateHasLegendCallBack() { return baseLayersPopup ? baseLayersPopup.GetHasLegend() : false; }

    function refreshLayersPopup() { if (layersPopup) { layersPopup.RefreshContent(); } }

    function onClickMessagePopup(thePopup) {
        if (thePopup.IsShowing()) {
            var promote = true;
            if (thePopup == messagePopup) {
                if (isShowingMessage()) {
                    if (messageHideInterval) {
                        clearMessageInterval();
                        thePopup.ShowTitleColorInfo(true);
                    }
                    else { hideMessage(); }
                }
            }
            else if (thePopup == infoWindowPopup) { toggleInfoWindowPin(); }
            else if (thePopup == locInfoWindowPopup) { promote = false; }
            if (promote && thePopup.IsShowing()) { promoteToTopZIndex(thePopup); }
        }
    }

    var currentHString = "";
    var currentMString = "";

    var curMapServerIndex = 0, curRasterServerIndex;

    var defaultMapnikStringH = "osm_water,osm_buildings,osm_roads,osm_road_names,osm_place_names";
    var defaultMapnikStringM = "osm_land,osm_landuse,osm_water,osm_buildings,osm_roads,osm_road_names,osm_place_names";

    var currentMapnikStringH = defaultMapnikStringH;
    var currentMapnikStringM = defaultMapnikStringM;

    var getVectorTileFunction = null;

    function getMapLayerSourceURL(tileCoordZXY) {
        var thisURL = mapLayerSourceURL;
        thisURL = thisURL.replace("\{x\}", tileCoordZXY[1].toString());
        thisURL = thisURL.replace("\{y\}", (-tileCoordZXY[2] - 1).toString());
        //thisURL = thisURL.replace("\{y\}", tileCoordZXY[2].toString());
        thisURL = thisURL.replace("\{z\}", tileCoordZXY[0].toString());
        return thisURL;
    }

    function isHybridMode() { return currentMode == tf.consts.typeNameHybrid; }

    function getMapnik1VectorTile(tileCoordZXY, pixelRatio, projection) {
        var thisURL = undefined;

        if (!!mapLayerSourceURL) { thisURL = getMapLayerSourceURL(tileCoordZXY); }
        else {
            var usingHybrid = isHybridMode();
            var mapURLPrefix = "http://terranode-";
            var mapURLs = ["163", "167", "170", "246"];
            var nURLs = mapURLs.length;

            var mapPrefixStr = ".cs.fiu.edu/cache_mapnik/Default.aspx?TargetImageType=png&style=BT&Composite=";

            var mapType = usingHybrid ? "HYBRID" : "MAP";
            var strUse = usingHybrid ? currentHString : currentMString;

            var mapSuffixStr = "&projType=merc&type=" + mapType + "&x=" + tileCoordZXY[1] + "&y=" + (-tileCoordZXY[2] - 1) + "&z=" + tileCoordZXY[0];
            var mapFullStr = mapPrefixStr + strUse + mapSuffixStr;

            if (curMapServerIndex == nURLs) { curMapServerIndex = 0; }

            thisURL = mapURLPrefix + mapURLs[curMapServerIndex++] + mapFullStr;
        }
        return thisURL;
    }

    function getMapnik2VectorTile(tileCoordZXY, pixelRatio, projection) {
        var thisURL = undefined;

        if (!!mapLayerSourceURL) { thisURL = getMapLayerSourceURL(tileCoordZXY); }
        else {
            var usingHybrid = isHybridMode();
            var mapURLPrefix = "http://131.94.133.";
            var nMapURLIPs = mapURLIPs.length;
            var service = usingHybrid ? "vmix" : "vector";
            var mapURLMiddle = "/TileService/" + service + ".aspx?projection=bing&styleset=";
            var mapStyle = usingHybrid ? "hybrid" : "map";
            var layersStr = usingHybrid ? currentMapnikStringH : currentMapnikStringM;
            var basicLayersStr = "&layers=" + layersStr;//"osm_land,osm_landuse,osm_water,osm_buildings,osm_roads,osm_road_names,osm_place_names";
            var mapURLSuffix = "&x=" + tileCoordZXY[1] + "&y=" + (-tileCoordZXY[2] - 1) + "&z=" + tileCoordZXY[0];

            if (curMapServerIndex >= nMapURLIPs) { curMapServerIndex = 0; }

            thisURL = mapURLPrefix + mapURLIPs[curMapServerIndex++] + mapURLMiddle + mapStyle + basicLayersStr + mapURLSuffix;
        }
        return thisURL;
    }

    function setVectorLayerParams() {
        if (vectorLayerSource) {
            var usingHybrid = isHybridMode();

            if (!!mapLayerSourceURL) {
                vectorLayer.setOpacity(usingHybrid ? mapLayerSourceHybridModeOpacity : 1);
                rasterLayer.setOpacity(usingHybrid ? 1.0 - mapLayerSourceHybridModeOpacity : 1);
            }
        }
    }

    function refreshVectorLayer() {
        if (!!vectorLayer) {
            vectorLayerSource = new ol.source.XYZ({ tileUrlFunction: getVectorTileFunction, crossOrigin: 'anonymous' }); vectorLayer.setSource(vectorLayerSource);
        }
    }
    function refreshRasterLayer() {
        if (!!rasterLayer) {
            rasterLayerSource = new ol.source.XYZ({ tileUrlFunction: getRasterTileFunction, crossOrigin: 'anonymous' }); rasterLayer.setSource(rasterLayerSource);
        }
    }

    function privateNotifyLegendOptionChange() { if (!mapLayerSourceURL) { refreshVectorLayer(); } }

    function privateNotifyLegendStringChange(currentHStringSet, currentMStringSet) {

        if (useMapNik2) {
            currentMapnikStringH = baseLayersPopup.GetHasLegendH() ? currentHStringSet : tf.js.GetNonEmptyString(currentHStringSet, defaultMapnikStringH);
            currentMapnikStringM = baseLayersPopup.GetHasLegendM() ? currentMStringSet : tf.js.GetNonEmptyString(currentMStringSet, defaultMapnikStringM);
        }
        else { currentHString = currentHStringSet; currentMString = currentMStringSet; }

        setVectorLayerParams();
    }

    var singleAttribution = null;
    var olOverviewMapControl = null;
    var olScaleLineControl = null;
    var olRotateControl = null;

    var rotationDuration = 250;

    var isUsScaleUnits = false;

    function toggleScaleUnits() {
        isUsScaleUnits = !isUsScaleUnits;
        setScaleUnits();
        mergeWithBaseAndNotifyListeners(tf.consts.mapToggleScaleUnitEvent);
    }

    function setScaleUnits() {
        if (!!olScaleLineControl) {
            var unitsName = isUsScaleUnits ? "us" : "metric";
            olScaleLineControl.setUnits(unitsName);
        }
    }

    function createScaleLineControl() {
        var targetUse = tf.dom.GetHTMLElementFrom(settings.scaleElemTarget);
        if (!targetUse) { targetUse = mapControlContainerHTML; }
        olScaleLineControl = new ol.control.ScaleLine({ target: targetUse });

        mapControls[tf.consts.panelNameMapScale] = { control: olScaleLineControl, isOn: false };

        olScaleLineControl.element.addEventListener("click", function () { toggleScaleUnits(); }); setScaleUnits();
    }

    function checkCreateControl(controlName) {
        var controlObj;
        switch (controlName) {
            case tf.consts.panelNameAddress:
                controlObj = new tf.map.ui.CustomControl(theThis, styles.mapAddressButtonClass, "A", showAddressBar, { tipLabel: tf.consts.addressBarName, imageLabel: getSearchButtonImg(), target: mapControlContainerHTML });
                break;
            case tf.consts.panelNameZoom:
                controlObj = new ol.control.Zoom({ zoomInLabel: tf.map.ui.CreateMapButtonTextSpan("+"), zoomOutLabel: tf.map.ui.CreateMapButtonTextSpan("-"), target: mapControlContainerHTML });
                break;
            case tf.consts.panelNameLayers:
                controlObj = new tf.map.ui.CustomControl(theThis, styles.mapLayersButtonClass, "L", showMapLayers, { tipLabel: tf.consts.mapLayersName, imageLabel: getLayersButtonImg(), target: mapControlContainerHTML });
                break;
            case tf.consts.panelNameType:
                controlObj = new tf.map.ui.CustomControl(theThis, styles.mapTypeButtonClass, "T", showMapType, { tipLabel: tf.consts.mapTypesName, imageLabel: getTypeButtonImg(), target: mapControlContainerHTML });
                break;
            case tf.consts.panelNameMeasure:
                controlObj = new tf.map.ui.CustomControl(theThis, styles.mapMeasureButtonClass, "M", startMeasureInteraction, { tipLabel: tf.consts.mapMeasureName, imageLabel: getMeasureButtonImg(), target: mapControlContainerHTML });
                break;
        }
        if (controlObj != undefined) { mapControls[controlName] = { control: controlObj, isOn: false }; }
    }

    function createMapControls(allControls, skipScaleLineControl) {

        if (allControls) {
            var controlNames = [tf.consts.panelNameAddress, tf.consts.panelNameZoom, tf.consts.panelNameLayers, tf.consts.panelNameType, tf.consts.panelNameMeasure];

            for (var i in controlNames) { checkCreateControl(controlNames[i]); }

            mapControls[tf.consts.panelNameDownload] = {
                control: new tf.map.ui.CustomControl(theThis, styles.mapDownloadButtonClass, "D", startDownloadInteraction, { tipLabel: tf.consts.mapDownloadName, imageLabel: getDownloadButtonImg(), target: mapControlContainerHTML }),
                isOn: false
            };

            mapControls[tf.consts.panelNameSource] = {
                control: new tf.map.ui.CustomControl(theThis, styles.mapSourceButtonClass, "S", showMapSource, { tipLabel: tf.consts.mapSourcesName, target: mapControlContainerHTML }),
                isOn: false
            };

            mapControls[tf.consts.panelNameFullscreen] = {
                control: new tf.map.ui.CustomControl(theThis, styles.mapFullScreenButtonClass, getFullScreenLabelNormal(), toggleMapFullScreen, { tipLabel: tf.consts.fullScreenToolTipNormal, target: mapControlContainerHTML }),
                isOn: false
            };

            mapControls[tf.consts.panelNameMapLocation] = {
                control: new tf.map.ui.CustomControl(theThis, styles.mapLocationButtonClass, "C", toggleLocInfoWindowShow, {
                    tipLabel: showLocInfoWindowOnMoveEnd ? tf.consts.mapLocationHideTip : tf.consts.mapLocationShowTip, imageLabel: getMapLocationButtonImg(), target: mapControlContainerHTML
                }),
                isOn: false
            };

            if (!!navigator.geolocation) {
                mapControls[tf.consts.panelNameUserLocation] = {
                    control: new tf.map.ui.CustomControl(theThis, styles.mapUserLocationButtonClass, "U", buttonRequestCenterToUserLocation, {
                        tipLabel: tf.consts.centerToUserLocationTip, imageLabel: getMapUserLocationButtonImg(), target: mapControlContainerHTML
                    }),
                    isOn: false
                };
            }

            var defaultMap2RasterImageUrls = [];
            var nURLIPs = mapURLIPs.length;

            for (var i = 0; i < nURLIPs; ++i) {
                var thisURL = 'http://131.94.133.' + mapURLIPs[i] + '/TileService/rmix.aspx?projection=bing&x={x}&y={y}&z={z}';
                defaultMap2RasterImageUrls.push(thisURL);
            }

            olOverviewMapControl = new ol.control.OverviewMap({
                layers: [new ol.layer.Tile({ source: new ol.source.XYZ({ urls: defaultMap2RasterImageUrls, crossOrigin: 'anonymous' }) })],
                className: 'ol-overviewmap',
                collapseLabel: tf.map.ui.CreateMapButtonTextSpan("\u00BB"),
                label: tf.map.ui.CreateMapButtonTextSpan("\u00AB"),
                collapsed: true, target: mapControlContainerHTML
            });

            mapControls[tf.consts.panelNameOverview] = {
                control: olOverviewMapControl,
                isOn: false
            };

            olRotateControl = new ol.control.Rotate({
                autoHide: false,
                label: tf.map.ui.CreateMapButtonTextSpan("\u21e7"),
                tipLabel: "Reset Map Rotation",
                resetNorth: function () {
                    var currentRotation = getRotationRad();
                    if (currentRotation == 0) {
                        showMessage(
                            "- Hold down SHIFT & ALT then Click & Drag to rotate<br/>" +
                            "- On touch screens, use two fingers to rotate "
                        );
                    }
                    else {
                        currentRotation = currentRotation % (2 * Math.PI);
                        if (currentRotation < -Math.PI) { currentRotation += 2 * Math.PI; }
                        if (currentRotation > Math.PI) { currentRotation -= 2 * Math.PI; }
                        animatedResetRotation();
                    }
                },
                target: mapControlContainerHTML
            });

            olRotateControl.element.style.zIndex = 1;
            mapControls[tf.consts.panelNameMapRotate] = { control: olRotateControl, isOn: false };
        }

        //poweredByTerraFlySVG = '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" enable-background="new 0 0 66 58" viewBox="0 0 66 58" height="100%" width="100%" y="0px" x="0px" version="1.1"><g><path d="M60.262,17.214c-3.436-2.931-9.344-2.097-15.352,1.575c4.221-1.991,8.189-2.166,10.611-0.042   c4.215,3.7,2.146,12.954-4.627,20.673C44.123,47.139,35.217,50.398,31,46.698c-2.393-2.1-2.758-5.987-1.392-10.369   c-3.021,6.815-3.053,13.151,0.52,16.2C35.365,57,46.357,52.715,54.68,42.963C62.998,33.211,65.5,21.683,60.262,17.214z" fill="#00519E" /><g ><g ><path d="M7.104,31.737H4.948V25.52H3v-1.763h6.046v1.763H7.104V31.737z" fill="#00519E" /><path d="M20.032,25.444c0.185,0,0.362,0.016,0.529,0.042l0.12,0.023l-0.19,2.014     c-0.175-0.044-0.416-0.065-0.726-0.065c-0.466,0-0.804,0.107-1.015,0.319c-0.211,0.211-0.317,0.519-0.317,0.919v3.041H16.3     v-6.185h1.588l0.332,0.988h0.104c0.178-0.327,0.426-0.592,0.745-0.795C19.387,25.544,19.708,25.444,20.032,25.444z" fill="#00519E" /><path d="M25.276,25.444c0.186,0,0.362,0.016,0.529,0.042l0.12,0.023l-0.19,2.014     c-0.175-0.044-0.417-0.065-0.726-0.065c-0.466,0-0.805,0.107-1.016,0.319c-0.21,0.211-0.316,0.519-0.316,0.919v3.041h-2.134     v-6.185h1.588l0.333,0.988h0.104c0.179-0.327,0.427-0.592,0.745-0.795C24.631,25.544,24.952,25.444,25.276,25.444z" fill="#00519E" /><path d="M30.821,31.737l-0.41-0.821h-0.042c-0.289,0.358-0.581,0.6-0.879,0.732     c-0.299,0.131-0.684,0.195-1.157,0.195c-0.582,0-1.041-0.173-1.375-0.522c-0.335-0.35-0.502-0.84-0.502-1.473     c0-0.659,0.229-1.15,0.688-1.471c0.458-0.323,1.123-0.504,1.991-0.544l1.031-0.033v-0.087c0-0.51-0.25-0.763-0.752-0.763     c-0.451,0-1.024,0.151-1.719,0.457L27.078,26c0.72-0.372,1.629-0.556,2.729-0.556c0.792,0,1.406,0.196,1.841,0.589     c0.435,0.393,0.652,0.942,0.652,1.648v4.056H30.821z M29.238,30.338c0.259,0,0.479-0.081,0.663-0.246     c0.184-0.162,0.276-0.375,0.276-0.638v-0.481l-0.492,0.024c-0.702,0.024-1.053,0.282-1.053,0.773     C28.633,30.149,28.835,30.338,29.238,30.338z" fill="#00519E" /><path d="M12.376,31.843c-1.03,0-1.829-0.272-2.398-0.82c-0.57-0.547-0.854-1.326-0.854-2.338     c0-1.044,0.264-1.846,0.792-2.404s1.28-0.837,2.259-0.837c0.932,0,1.651,0.241,2.158,0.728c0.508,0.486,0.762,1.186,0.762,2.099     v0.688c0,0,0.017,0.181-0.056,0.234c-0.059,0.045-0.27,0.028-0.27,0.028h-3.489c0.015,0.346,0.142,0.616,0.379,0.812     c0.239,0.195,0.563,0.296,0.975,0.296c0.375,0,0.72-0.038,1.034-0.107c0.279-0.062,0.577-0.165,0.898-0.308     c0.014-0.005,0.067-0.036,0.092-0.026c0.037,0.013,0.032,0.058,0.032,0.058v1.446c-0.335,0.172-0.68,0.289-1.037,0.355     C13.296,31.812,12.87,31.843,12.376,31.843z M12.25,26.895c-0.251,0-0.461,0.079-0.63,0.238     c-0.168,0.157-0.268,0.405-0.297,0.745h1.834c-0.008-0.298-0.093-0.538-0.255-0.717C12.741,26.984,12.523,26.895,12.25,26.895z" fill="#00519E" /></g><g ><path d="M33.332,35.92c-0.302,0-0.575-0.047-0.82-0.139v-0.924c0.28,0.096,0.524,0.145,0.734,0.145     c0.332,0,0.588-0.135,0.766-0.406c0.178-0.271,0.324-0.656,0.432-1.159l1.488-7.087h-1.264l0.084-0.439l1.35-0.433l0.148-0.654     c0.203-0.874,0.482-1.491,0.838-1.852c0.355-0.36,0.881-0.54,1.58-0.54c0.176,0,0.391,0.025,0.645,0.076     c0.252,0.05,0.447,0.106,0.59,0.167l-0.283,0.845c-0.332-0.126-0.631-0.19-0.898-0.19c-0.379,0-0.672,0.106-0.875,0.318     c-0.201,0.213-0.365,0.599-0.494,1.163l-0.162,0.708h1.559l-0.164,0.832h-1.553l-1.52,7.191c-0.17,0.826-0.43,1.428-0.785,1.809     C34.373,35.73,33.908,35.92,33.332,35.92z M39.697,32.698h-1.102l2.176-10.193h1.102L39.697,32.698z" fill="#00519E" /><path d="M42.285,25.518h1.102l0.482,3.57c0.045,0.301,0.086,0.744,0.129,1.332     c0.041,0.588,0.062,1.062,0.062,1.418H44.1c0.152-0.379,0.342-0.817,0.57-1.311c0.225-0.493,0.393-0.832,0.504-1.021l2.129-3.989     h1.166l-4.559,8.397c-0.406,0.752-0.807,1.272-1.207,1.565c-0.395,0.294-0.873,0.439-1.434,0.439     c-0.314,0-0.619-0.047-0.918-0.139v-0.886c0.275,0.081,0.561,0.119,0.859,0.119c0.357,0,0.666-0.109,0.92-0.331     c0.254-0.221,0.504-0.547,0.744-0.979l0.498-0.89L42.285,25.518z" fill="#00519E" /></g></g></g><text xml:space="preserve" style="font-style:normal;font-weight:normal;font-size:7.5px;line-height:125%;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#bfbfbf;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;" x="3.3413041" y="7.6913047" ><tspan x="3.3413041" y="7.6913047">powered by</tspan></text> <text y="7.1869569" x="3.0891302" style="font-style:normal;font-weight:normal;font-size:7.5px;line-height:125%;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;fill:#000000;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" xml:space="preserve"><tspan y="7.1869569" x="3.0891302">powered by</tspan></text> </svg>';

        var logoOptions = { target: mapControlContainerHTML };
        var usingLogoSVG;

        if (usingLogoSVG = tf.js.GetIsNonEmptyString(settings.logoSVGHTML)) {
            logoOptions.innerHTML = settings.logoSVGHTML;
        }
        else { logoOptions.imageLabel = tf.platform.GetPoweredByTerraFlyLogo(); }

        mapControls[tf.consts.panelNameTFLogo] = { control: new tf.map.ui.CustomLogo(theThis, styles.mapTFLogoControlClass, logoOptions), isOn: false };

        if (usingLogoSVG) {
            mapControls[tf.consts.panelNameTFLogo].control.GetHTMLElement().style.padding = "4px";
        }

        if (!skipScaleLineControl) { createScaleLineControl(); }
    }

    var hasBeforeRender;

    function animatedSetRotation(newRotationRad, rotationDurationUse) {
        var currentRotation = getRotationRad();
        if (currentRotation != newRotationRad) {
            if (rotationDurationUse == undefined) { rotationDurationUse = rotationDuration; }
            if (hasBeforeRender) {
                olMap.beforeRender(ol.animation.rotate({
                    rotation: currentRotation,
                    duration: rotationDurationUse,
                    easing: ol.easing.easeOut
                }));
                setRotationRad(newRotationRad);
            }
            else {
                olView.animate({
                    rotation: newRotationRad,
                    duration: rotationDurationUse,
                    easing: ol.easing.easeOut
                }, function (animationConcludedOK) {
                    /*setTimeout(function () {
                        var normalizedAngle = tf.units.NormalizeAngle0To2PI(newRotationRad) - 2 * Math.PI;
                        console.log(normalizedAngle);
                        setRotationRad(normalizedAngle);
                    }, 10);*/
                    if (!animationConcludedOK) {
                        setRotationRad(newRotationRad);
                    }
                });
            }
        }
    }

    function animatedResetRotation() {
        var currentRotation = getRotationRad();
        if (currentRotation != 0) {
            animatedSetRotation(0);
        }
        /*var currentRotation = getRotationRad();
        if (currentRotation != 0) {
            if (hasBeforeRender) {
                currentRotation = currentRotation % (2 * Math.PI);
                if (currentRotation < -Math.PI) { currentRotation += 2 * Math.PI; }
                if (currentRotation > Math.PI) { currentRotation -= 2 * Math.PI; }
                olMap.beforeRender(ol.animation.rotate({
                    rotation: currentRotation,
                    duration: rotationDuration,
                    easing: ol.easing.easeOut
                }));
                setRotationRad(0);
            }
            else {
                olView.animate({
                    rotation: 0,
                    duration: rotationDuration,
                    easing: ol.easing.easeOut
                }, function (animationConcludedOK) {
                    if (!animationConcludedOK) {
                        setRotationRad(0);
                    }
                });
            }
        }*/
    }

    function getLayersForLayersPopup() { return mapFeatureLayers; }

    function createMapPopups() {

        var containerForAddressAndMessage = !!containerAll ? containerAll : mapContainerAll;

        baseLayersPopup =
            useMapNik2 ?
            new tf.map.ui.Mapnik2Popup(mapContainerAll, theThis, privateNotifyLegendStringChange, privateNotifyLegendOptionChange, mapControls[tf.consts.panelNameLayers].control, undefined) :
            new tf.map.ui.Mapnik1Popup(mapContainerAll, theThis, privateNotifyLegendStringChange, privateNotifyLegendOptionChange, mapControls[tf.consts.panelNameLayers].control, undefined);

        layersPopup = new tf.map.ui.LayersPopup(mapContainerAll, theThis, privateHasLegendCallBack, mapControls[tf.consts.panelNameLayers].control, showMapBaseLayers, getLayersForLayersPopup);

        addressPopup = new tf.map.ui.AddressBar(containerForAddressAndMessage, theThis, mapControls[tf.consts.panelNameAddress].control);

        typesPopup = new tf.map.ui.TypesPopup(mapContainerAll, theThis, privateSetMode, mapControls[tf.consts.panelNameType].control);

        sourcesPopup = new tf.map.ui.SourcesPopup(mapContainerAll, theThis, privateSetSource, mapControls[tf.consts.panelNameSource].control);

        locInfoWindowPopup = new tf.map.ui.LocationPopup(mapContainerAll);
        locInfoWindowPopup.SetOnClose(privateLocInfoOnClose, theThis);
        locInfoWindowPopup.SetZIndex(99);

        infoWindowPopup = new tf.map.ui.InfoPopup(mapContainerAll);
        infoWindowPopup.SetOnClose(privateInfoOnClose, theThis);
        addToZIndexPopups(infoWindowPopup, theThis);

        messagePopup = new tf.map.ui.MessagePopup(containerForAddressAndMessage);
        messagePopup.SetOnClose(privateMessageOnClose, theThis);
        //messagePopup.Show(false);
        addToZIndexPopups(messagePopup, theThis);
    }

    function setNewExtent(overviewDiv) {
        try {
            var offset = overviewDiv.helper.position();
            var divSize = [overviewDiv.helper.width(), overviewDiv.helper.height()];
            var mapSize = map.getPixelSize();
            var c = map.getView().getResolution();
            var xMove = offset.left * (Math.abs(mapSize[0] / divSize[0]));
            var yMove = offset.top * (Math.abs(mapSize[1] / divSize[1]));
            var bottomLeft = [0 + xMove, mapSize[1] + yMove];
            var topRight = [mapSize[0] + xMove, 0 + yMove];
            var left = map.getCoordinateFromPixel(bottomLeft);
            var top = map.getCoordinateFromPixel(topRight);
            var extent = [left[0], left[1], top[0], top[1]];
            map.getView().fit(extent, mapSize);
            map.getView().setResolution(c);
        }
        catch (exception) { }
    }

    var overviewMapElem = null, overviewBoxElem = null, overviewBoxParent = null;

    function onClickOverviewMap(notification) {

        var ovMap = olOverviewMapControl.getOverviewMap();
        var evTarget = tf.events.GetEventTarget(notification.event);
        var mouseOffset = tf.events.GetMouseEventCoords(notification.event);

        if (!evTarget || !mouseOffset) { return; }

        var clickX = mouseOffset[0];
        var clickY = mouseOffset[1];

        if (evTarget != overviewMapElem) {
            if (evTarget == overviewBoxElem) {
                clickX += overviewBoxParent.offsetLeft;
                clickY += overviewBoxParent.offsetTop;
            }
            else {
                clickX += evTarget.offsetLeft;
                clickY += evTarget.offsetTop;
            }
        }

        var coordinate = tf.units.OL2TM(ovMap.getCoordinateFromPixel([clickX, clickY]));
        setCenter(coordinate);
    }

    var tryHookCount = 0;
    var overviewMapClickHooked = false;

    function hookOverviewMapClick() {
        console.log('hookOverviewMapClick try');
        overviewMapElem = document.getElementsByClassName("ol-overviewmap-map");

        if (overviewMapElem.length > 0) {
            overviewMapClickHooked = true;
            overviewMapElem = overviewMapElem[0];

            overviewBoxElem = document.getElementsByClassName("ol-overviewmap-box");

            if (overviewBoxElem.length > 0) {
                overviewMapElem.style.cursor = 'pointer';
                overviewBoxElem = overviewBoxElem[0];
                overviewBoxParent = overviewBoxElem.parentNode;
                new tf.events.DOMClickListener({ target: overviewMapElem, callBack: onClickOverviewMap, optionalScope: theThis, callBackSettings: undefined });
            }
        }
        else {
            if (++tryHookCount < 10) {
                setTimeout(hookOverviewMapClick, 1000);
            }
            else {
                console.log('hookOverviewMapClick failed');
            }
        }
    }

    function createRasterAndVectorLayers() {
        vectorLayerSource = new ol.source.XYZ({ tileUrlFunction: getVectorTileFunction, crossOrigin: 'anonymous' });
        rasterLayerSource = new ol.source.XYZ({ tileUrlFunction: getRasterTileFunction, crossOrigin: 'anonymous' });

        rasterLayer = new ol.layer.Tile({ source: rasterLayerSource });
        vectorLayer = new ol.layer.Tile({ source: vectorLayerSource });

        olMap.addLayer(rasterLayer);
        olMap.addLayer(vectorLayer);
    }

    function setMapType(mode, updatePopup) {
        var modeSet = tf.js.GetNonEmptyString(mode, tf.consts.defaultSourceName);

        modeSet = modeSet.toLowerCase();

        var oldMode = currentMode;

        if (!currentMode || currentMode != modeSet) {

            var rasterVisible = false, vectorVisible = false;

            switch (modeSet) {
                default:
                case tf.consts.typeNameHybrid:
                    rasterVisible = vectorVisible = true;
                    currentMode = tf.consts.typeNameHybrid;
                    break;
                case tf.consts.typeNameMap:
                    vectorVisible = true;
                    currentMode = tf.consts.typeNameMap;
                    break;
                case tf.consts.typeNameAerial:
                    rasterVisible = true;
                    currentMode = tf.consts.typeNameAerial;
                    break;
            }

            rasterLayer.setVisible(rasterVisible);
            vectorLayer.setVisible(vectorVisible);

            if (updatePopup) { if (typesPopup) { typesPopup.UpdateModeFromMap(); } }

            refreshVectorLayer();
            setVectorLayerParams();
            mergeWithBaseAndNotifyListeners(tf.consts.mapTypeChangeEvent, { oldType: oldMode, newType: currentMode });
        }
    }

    function setSource(source, updatePopup) {
        var sourceSet = tf.js.GetNonEmptyString(source, tf.consts.defaultSourceName);

        if (!currentSource || currentSource != sourceSet) {
            currentSource = sourceSet;
            if (!!updatePopup) { if (sourcesPopup) { sourcesPopup.UpdateSourceFromMap(); } }
            refreshRasterLayer();
        }
    }

    function getRasterTileFunction(tileCoordZXY, pixelRatio, projection) {
        var thisURL = undefined;
        var mapURLPrefix = "http://131.94.133.";
        var nMapURLIPs = mapURLIPs.length;
        var mapURLMiddle = "/TileService/rmix.aspx?projection=bing&source=" + currentSource;
        var mapURLSuffix = "&x=" + tileCoordZXY[1] + "&y=" + (-tileCoordZXY[2] - 1) + "&z=" + tileCoordZXY[0];

        if (curMapServerIndex >= nMapURLIPs) { curMapServerIndex = 0; }

        thisURL = mapURLPrefix + mapURLIPs[curMapServerIndex++] + mapURLMiddle + mapURLSuffix;
        return thisURL;
    }

    function setCenter(pointCoords) {
        if (tf.js.GetIsArrayWithMinLength(pointCoords, 2)) {
            var center = tf.units.TM2OL(pointCoords);
            olView.setCenter(center);
        }
    }

    function setCenterAndLevel(pointCoords, level) { setCenter(pointCoords); setLevel(level); }

    function getResolution() { return olView.getResolution(); }

    function setResolution(resolution) {
        resolution = tf.js.GetFloatNumber(resolution, tf.units.GetResolutionByLevel(tf.consts.defaultLevel));
        if (resolution != currentRes) {
            olView.setResolution(resolution);
            currentRes = getResolution();
            resChanged = true;
            var level = tf.units.GetLevelByResolution(currentRes);
            if (!isAnimating) {
                onDelayResEnd.DelayCallBack();
            }
            if (level != currentLevel) {
                currentLevel = level;
                if (!isAnimating) {
                    onDelayZoomEnd.DelayCallBack();
                }
            }
        }
    }

    function getLevel() { return currentLevel; }

    function setLevel(level) {
        level = tf.js.GetLevelFrom(level);
        if (level != currentLevel) {
            currentLevel = level;
            olView.setZoom(level);
            currentRes = getResolution();
            resChanged = levelChanged = true;
            if (!isAnimating) {
                onDelayResEnd.DelayCallBack();
                onDelayZoomEnd.DelayCallBack();
            }
        }
    }

    function setView(viewSettings) {
        viewSettings = tf.js.GetValidObjectFrom(viewSettings);

        var extent = viewSettings.extent;
        var minLevel = tf.js.GetLevelFrom(viewSettings.minLevel);
        var maxLevel = tf.js.GetLevelFrom(viewSettings.maxLevel);

        if (minLevel > maxLevel) { var t = minLevel; minLevel = maxLevel; maxLevel = t; }

        var levelNow = getLevel();
        var center = olView.getCenter();

        if (levelNow < minLevel) { levelNow = minLevel; }
        if (levelNow > maxLevel) { levelNow = maxLevel; }

        var tmExtent;

        if (tf.js.GetIsArrayWithLength(extent, 4)) {
            tmExtent = extent.slice(0);
            extent = ol.extent.applyTransform(extent, ol.proj.getTransform(tf.consts.tmSystem, tf.consts.olSystem));
        }
        else {
            extent = undefined;
        }

        var enableRotation = viewSettings.enableRotation !== undefined ? !!viewSettings.enableRotation : true;

        var newSettings = {
            //constrainRotation: 4,
            enableRotation: enableRotation,
            maxZoom: maxLevel,
            minZoom: minLevel,
            center: center,
            zoom: levelNow,
            extent: extent
        };

        var newOLView = new ol.View(newSettings);

        olMap.setView(olView = newOLView);

        originalViewConstrainResolution = olView.constrainResolution;

        hookUpOLViewEvents();

        newSettings.extent = tmExtent;

        mergeWithBaseAndNotifyListeners(tf.consts.mapViewSettingsChangedEvent, newSettings);
    }

    function hookUpOLViewEvents() {
        olView.on('change:resolution', function (event) {
            var newLevel = tf.units.GetLevelByResolution(currentRes = getResolution());
            resChanged = true;
            levelChanged = newLevel != currentLevel;
            currentLevel = newLevel;
            if (!isAnimating) {
                onDelayResEnd.DelayCallBack();
                if (levelChanged) { onDelayZoomEnd.DelayCallBack(); }
            }
            //tf.GetDebug().LogIfTest('level: ' + currentLevel + ' res: ' + currentRes);
        }, theThis);
        olView.on('change:rotation', function (event) {
            if (!isAnimating) {
                onDelayRotEnd.DelayCallBack();
            }
            //tf.GetDebug().LogIfTest('level: ' + currentLevel + ' res: ' + currentRes);
        }, theThis);
    }

    var userPosLocationStyleSpecs = { marker: true, label: '.', zindex: 1, border_color: "#00f", border_width: 2, marker_color: "#000", font_color: "#fff", font_height: 16 };

    function buttonRequestCenterToUserLocation() { return requestCenterToUserLocation(true, true); }

    function updateUserLocation() { return requestCenterToUserLocation(false, false); }

    function requestCenterToUserLocation(showCoordinates, panToBool) {
        if (!!navigator.geolocation) { navigator.geolocation.getCurrentPosition(function (position) { centerToUserLocation(position, showCoordinates, panToBool); }, failedGeoLoc); }
    }

    function failedGeoLoc(err) { }

    var userPosFeatureAlreadyAdded = false;

    function centerToUserLocation(position, showCoordinates, panToBool) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        if (panToBool) {
            //panTo(lat, lon);
            setCenter([lon, lat]);
        }
        userPosFeature.SetPointCoords([lon, lat]);
        userPosLocationFeature.SetPointCoords([lon, lat]);
        userPosLocationFeature.ChangeStyle(tf.js.ShallowMerge(userPosLocationStyleSpecs, { label: 'User at: ( ' + lat.toFixed(6) + ',' + lon.toFixed(6) + ' )' }));
        if (!userPosFeatureAlreadyAdded) {
            privateTLayer.AddMapFeature(userPosFeature);
            userPosFeatureAlreadyAdded = true;
        }
    }

    function hideUserLocation() {
        if (userPosFeatureAlreadyAdded) {
            privateTLayer.DelMapFeature(userPosFeature);
            userPosFeatureAlreadyAdded = false;
        }
    }

    var olInteractions, olInteractionsCopy, mapDrawInteraction, onDelayMoveEnd, onDelayZoomEnd, onDelayResEnd, onDelayRotEnd;
    
    function createOLInteractions(canRotate) {
        return new ol.interaction.defaults({
            altShiftDragRotate: canRotate,
            pinchRotate: canRotate,
            doubleClickZoom: false
        });
    }

    function createOLViewAndMap(canRotate) {

        olView = new ol.View({
            //enableRotation: false,
            maxZoom: tf.consts.maxLevel/*,
            minZoom: tf.consts.minLevel*/
        });

        var olControl = ol.control.defaults(
            //{ attribution: false, rotate: false, zoom: false }).extend([new ol.control.Rotate({ autoHide: /*false*/true })/*, new ol.control.ScaleLine()*/]
            { attribution: false, rotate: false, zoom: false }
        );

        olInteractions = createOLInteractions(canRotate);
        olInteractionsCopy = new ol.Collection();
        olInteractionsCopy.extend(olInteractions.getArray());

        olMap = new ol.Map({
            loadTilesWhileAnimating: true,
            loadTilesWhileInteracting: true,
            renderer: 'canvas',
            target: mapContainer,
            view: olView,
            controls: olControl,
            interactions: olInteractions
        });

        hasBeforeRender = !!tf.js.GetFunctionOrNull(olMap.beforeRender);

        originalViewConstrainResolution = olView.constrainResolution;

        createRasterAndVectorLayers();

        olSourceVector = new ol.source.Vector();
        olLayer = new ol.layer.Vector({ source: olSourceVector/*, visible: true*/, zIndex: mapPrivateLayerZIndex });
        olLayer.setVisible(true);
        olMap.addLayer(olLayer);

        privateTLayer = addFeatureLayer({ isVisible: true, isHidden: true, color: "#fff", zIndex: mapPrivateLayerZIndex - 1 });

        /*privateTLayer = new tf.map.FeatureLayer(theThis, olMap, "", "", true, true, "#fff", null, null,
            false, null, null, null, false, null, mapPrivateLayerZIndex - 1
            );*/

        //privateTLayer.AddMarker(tf.consts.defaultLatitude, tf.consts.defaultLongitude, "hello, world.");

        var snapToPixel = false;

        var circle_radius = 16;
        var userPosGeom = new tf.map.FeatureGeom({ type: "point", coordinates: [tf.consts.defaultLongitude, tf.consts.defaultLatitude] });

        var userPosStyleSpecs = [
            { circle: true, circle_radius: circle_radius + 2, fill: true, fill_color: "#ebebeb", fill_alpha: 60, zindex: 2, snaptopixel: snapToPixel },
            { circle: true, circle_radius: circle_radius - 2, fill: false, fill_color: "#abf", line: true, line_color: "#00a", line_width: 1, zindex: 3, snaptopixel: snapToPixel },
            { circle: true, circle_radius: circle_radius - 8, fill: true, fill_color: "#f84", line: true, line_color: "#00f", line_width: 1, zindex: 4, snaptopixel: snapToPixel }
        ];
        var userPosHoverStyleSpecs = [
            tf.js.ShallowMerge(userPosStyleSpecs[0], { fill_color: "#fbfbfb" }),
            tf.js.ShallowMerge(userPosStyleSpecs[1], { line_width: 2 }),
            { circle: true, circle_radius: circle_radius - 8, fill: true, fill_color: "#f84", line: true, line_color: "#00f", line_width: 1, zindex: 4, snaptopixel: snapToPixel }
        ];

        userPosFeature = new tf.map.Feature({ geom: userPosGeom, style: userPosStyleSpecs, hoverStyle: userPosHoverStyleSpecs });

        userPosLocationFeature = new tf.map.Feature({ geom: userPosGeom, style: userPosLocationStyleSpecs });

        userPosFeature.SetOnHoverInOutListener(onHoverInOutUserPosFeature);
    }

    function onHoverInOutUserPosFeature() {
        if (userPosFeature.GetIsInHover()) {
            privateTLayer.AddMapFeature(userPosLocationFeature);
        }
        else { privateTLayer.DelMapFeature(userPosLocationFeature); }
    }

    var levelChanged, resChanged, posChanged;

    function checkSizePopups() {
        if (addressPopup) { addressPopup.OnContainerResize(); }
        if (measurePopup) { measurePopup.OnContainerResize(); }
        if (baseLayersPopup) { baseLayersPopup.OnContainerResize(); }
        if (infoWindowPopup) { infoWindowPopup.OnContainerResize(); }
        if (layersPopup) { layersPopup.OnContainerResize(); }
        if (sourcesPopup) { sourcesPopup.OnContainerResize(); }
        if (typesPopup) { typesPopup.OnContainerResize(); }
        if (locInfoWindowPopup) { locInfoWindowPopup.OnContainerResize(); }
        if (messagePopup) { messagePopup.OnContainerResize(); }
    }

    function addPointMarker(pointCoords, style, name) {
        var lat = tf.js.GetLatitudeFrom(pointCoords[1]);
        var lon = tf.js.GetLongitudeFrom(pointCoords[0]);

        var markerPoint = new ol.geom.Point([lon, lat]).transform(tf.consts.tmSystem, tf.consts.olSystem);
        var olFeature = new ol.Feature({ geometry: markerPoint, markerName: name });

        olFeature.setStyle(style);
        olSourceVector.addFeature(olFeature);

        return olFeature;
    }


    function getFullScreenLabelNormal() { return styles.GetUnicodeDoubleHorArrow(); }
    function getFullScreenLabelFull() { return styles.GetUnicodeXClose(); }

    function getSearchButtonImg() { return new tf.ui.SvgGlyphBtn({ style: styles.mapSvgGlyphInButtonClass, glyph: tf.styles.SvgGlyphMagnifyingLensName, dim: mapButtonDimEmStr, noChangeOnHover: true }); }
    function getLayersButtonImg() { return new tf.ui.SvgGlyphBtn({ style: styles.mapSvgGlyphInButtonClass, glyph: tf.styles.SvgGlyphMapLayersName, dim: mapButtonDimEmStr, noChangeOnHover: true }); }
    function getMeasureButtonImg() { return new tf.ui.SvgGlyphBtn({ style: styles.mapSvgGlyphInButtonClass, glyph: tf.styles.SvgGlyphMeasuringTapeName, dim: mapButtonDimEmStr, noChangeOnHover: true }); }
    function getDownloadButtonImg() { return new tf.ui.SvgGlyphBtn({ style: styles.mapSvgGlyphInButtonClass, glyph: tf.styles.SvgGlyphDownloadName, dim: mapButtonDimEmStr, noChangeOnHover: true }); }
    function getTypeButtonImg() { return new tf.ui.SvgGlyphBtn({ style: styles.mapSvgGlyphInButtonClass, glyph: tf.styles.SvgGlyphEarthName, dim: mapButtonDimEmStr, noChangeOnHover: true }); }
    function getMapLocationButtonImg() { return new tf.ui.SvgGlyphBtn({ style: styles.mapSvgGlyphInButtonClass, glyph: tf.styles.SvgGlyphBullsEye2Name, dim: mapButtonDimEmStr, noChangeOnHover: true }); }
    function getMapUserLocationButtonImg() { return new tf.ui.SvgGlyphBtn({ style: styles.mapSvgGlyphInButtonClass, glyph: tf.styles.SvgGlyphUserLocationName, dim: mapButtonDimEmStr, noChangeOnHover: true }); }

    function getMapInfoPinImgSrc() { return tf.platform.MakePlatformPath("image/pin260pinned.png"); }
    function getMapInfoUnPinImgSrc() { return tf.platform.MakePlatformPath("image/pin260.png"); }

    var pinInfoMarkerSrc = getMapInfoPinImgSrc();
    var unPinInfoMarkerSrc = getMapInfoUnPinImgSrc();

    function makeMarkerStyle(pinFile, pinAnchor) {
        var markerStyle =
            [new ol.style.Style({
                image: new ol.style.Icon({
                    crossOrigin: "",
                    src: pinFile,
                    anchor: pinAnchor
                })
            })];

        return markerStyle;
    }

    function createInfoMarkerStyle(pinned) {
        var aPin = pinned ? pinInfoMarkerSrc : unPinInfoMarkerSrc;
        return makeMarkerStyle(aPin, [0.5, 0.05]);
    }

    var pinInfoMarker = createInfoMarkerStyle(true);
    var unPinInfoMarker = createInfoMarkerStyle(false);

    function showInfoMarker(pointCoords) {
        olInfoFeature = addPointMarker(pointCoords, unPinInfoMarker, infoFeatureName);
    }

    function hideInfoMarker() {
        if (olInfoFeature) {
            olSourceVector.removeFeature(olInfoFeature);
            olInfoFeature = null;
        }
    }

    var infoWindowPinned = false;

    function toggleInfoWindowPin() {
        if (olInfoFeature) {
            infoWindowPinned = !infoWindowPinned;
            var markerUse = infoWindowPinned ? pinInfoMarker : unPinInfoMarker;
            olInfoFeature.setStyle(markerUse);
            infoWindowPopup.ShowTitleColorInfo(infoWindowPinned);
        }
    }


    function isShowingInfoWindow() { return infoWindowPopup ? infoWindowPopup.IsShowing() : false; }

    function hideInfoWindow() {
        if (isShowingInfoWindow()) {
            hideInfoMarker();
            infoWindowPopup.ShowTitleColorInfo(false);
            infoWindowPopup.Show(false);
            infoWindowPinned = false;
        }
    }

    function toggleInfoWindow() {
        if (isShowingInfoWindow()) { hideInfoWindow(); } else { showInfoWindow(); }
    }

    function showInfoWindow(title, content, pointCoords) {
        if (infoWindowPopup) {
            if (!infoWindowPinned) {
                if (!!content) {
                    //hideOpenControlPopups();
                    hideInfoMarker();
                    showInfoMarker(pointCoords);
                    infoWindowPopup.SetTitle(title);
                    infoWindowPopup.SetContent(content);
                    promoteToTopZIndex(infoWindowPopup);
                    infoWindowPopup.Show(true);
                }
            }
        }
    }

    var showLocInfoWindowOnMoveEndByDefault;
    var showLocInfoWindowOnMoveEnd;

    function setLocInfoWindowShow() {
        setUseRevGeocoderOnMoveEnd(showLocInfoWindowOnMoveEnd);
        if (!showLocInfoWindowOnMoveEnd) {
            hideLocInfoWindow();
            mapControls[tf.consts.panelNameMapLocation].control.ChangeToolTip(tf.consts.mapLocationShowTip);
        }
        else {
            showLocInfoWindow();
            mapControls[tf.consts.panelNameMapLocation].control.ChangeToolTip(tf.consts.mapLocationHideTip);
        }
    }

    function toggleLocInfoWindowShow() {
        showLocInfoWindowOnMoveEnd = !showLocInfoWindowOnMoveEnd;
        setLocInfoWindowShow();
    }

    function toggleLocInfoWindow() { if (isShowingLocInfoWindow()) { hideLocInfoWindow(); } else { showLocInfoWindow(); } }

    function isShowingLocInfoWindow() { return locInfoWindowPopup ? locInfoWindowPopup.IsShowing() : false; }

    function hideLocInfoWindow() {
        if (isShowingLocInfoWindow()) {
            locInfoWindowPopup.Show(false);
        }
    }

    function showLocInfoWindow() {
        if (locInfoWindowPopup) {
            /*promoteToTopZIndex(locInfoWindowPopup);*/
            locInfoWindowPopup.Show(true);
        }
    }

    var infoPopupDiv = null;
    var htmlFeedDiv = null;

    function updateLocInfoWindow(myLabel, myContent, useUpdatedColor) {
        locInfoWindowPopup.ShowTitleColorInfo(!!useUpdatedColor);
        locInfoWindowPopup.SetTitle(typeof myLabel == "string" && myLabel.length > 0 ? myLabel : "Location");
        htmlFeedDiv.ClearContent();
        if (typeof myContent === "string") { htmlFeedDiv.GetHTMLElement().innerHTML = myContent; } else { htmlFeedDiv.AddContent(myContent); }
        locInfoWindowPopup.SetContent(infoPopupDiv);
        if (showLocInfoWindowOnMoveEnd) { if (!isShowingLocInfoWindow()) { showLocInfoWindow(); } }
    }

    var messagePinned = false;

    function setMessageTimeout(timeoutSecs) {
        messageTimeoutSecs = (typeof timeoutSecs == "number" && timeoutSecs >= 0) ? timeoutSecs : defaultmessageTimeoutSecs;
    }

    function isShowingMessage() { return isShowingPopup(messagePopup); }

    function showMessage(content) {
        if (messagePopup && !messagePinned) {
            clearMessageInterval();
            messagePopup.SetContent(content);
            messagePopup.ShowTitleColorInfo(false);
            promoteToTopZIndex(messagePopup);
            showInfoPopup(messagePopup);
            setMessageTimeoutObject();
        }
    }

    function toggleMessage() { if (isShowingMessage()) { hideMessage() } else { showMessage(); } }

    function hideMessage() {
        if (isShowingMessage()) {
            clearMessageInterval();
            hidePopup(messagePopup);
            messagePinned = false;
        }
    }

    var messageHideInterval = null;
    var defaultmessageTimeoutSecs = 5;
    var messageTimeoutSecs = defaultmessageTimeoutSecs;

    function clearMessageInterval() {
        if (messageHideInterval) {
            clearInterval(messageHideInterval);
            messageHideInterval = null;
        }
    }

    function setMessageTimeoutObject() {
        if (messageTimeoutSecs) {
            messageHideInterval = setTimeout(hideMessage, messageTimeoutSecs * 1000);
        }
    }

    function whenMapResolutionChanges(atGivenResolution) {
        if (decodedLegendH != undefined) {
            var res = atGivenResolution != undefined ? atGivenResolution : getResolution();
            if (useMapNik2) {
                currentMapnikStringH = tf.js.GetLegendCompositesStrs(decodedLegendH, res).m2;
                currentMapnikStringM = tf.js.GetLegendCompositesStrs(decodedLegendM, res).m2
            }
            else {
                currentHString = tf.js.GetLegendCompositesStrs(decodedLegendH, res).m1H;
                currentMString = tf.js.GetLegendCompositesStrs(decodedLegendH, res).m1M;
            }
            setVectorLayerParams();
            //privateNotifyLegendOptionChange();
        }
        else {
            if (!!baseLayersPopup) {
                if (resChanged) { baseLayersPopup.OnResolutionChange(currentRes); }
            }
        }
    }

    function onNotifyMoveEnd() {
        whenMapResolutionChanges();
        mergeWithBaseAndNotifyListeners(tf.consts.mapMoveEndEvent, makeCurrentLatLonNotification());
        levelChanged = false;
        posChanged = false;
    }

    function createLevelResolutionNotification() { return { level: currentLevel, resolution: currentRes }; }
    function createLevelRotationNotification() { return { rotation_rad: getRotationRad(), rotation_deg: getRotationDeg() }; }

    function onNotifyResolutionEnd() {
        whenMapResolutionChanges();
        mergeWithBaseAndNotifyListeners(tf.consts.mapResolutionChangeEvent, createLevelResolutionNotification());
        resChanged = false;
    }

    function onNotifyRotationEnd() {
        mergeWithBaseAndNotifyListeners(tf.consts.mapRotationChangeEvent, createLevelRotationNotification());
    }

    function onNotifyZoomEnd() {
        mergeWithBaseAndNotifyListeners(tf.consts.mapLevelChangeEvent, createLevelResolutionNotification());
        levelChanged = false;
    }

    var minAniSpeed = 100;
    var maxAniSpeed = 9999999999;

    function makeAnimatedCallBackNotification() {
        return mergeWithBaseNotification(tf.js.ShallowMerge(makeCurrentLatLonNotification(), createLevelResolutionNotification()));
    }

    function notifyAnimationEnd(callBack) {
        if (!!(callBack = tf.js.GetFunctionOrNull(callBack))) {
            var notification = makeAnimatedCallBackNotification();
            setTimeout(function () { callBack(notification); }, 1);
            //callBack(notification);
        }
    }

    function animatedSetLevel(newLevel, callBack, durationPerLevel, notifyListeners, easing) {

        newLevel = tf.js.GetLevelFrom(newLevel);

        var levelDiff = Math.abs(currentLevel - newLevel);

        if (levelDiff != 0) {

            durationPerLevel = tf.js.GetFloatNumberInRange(durationPerLevel, minAniSpeed, maxAniSpeed, tf.consts.defaultMapAnimatedDurationPerLevelMillis);
            var speed = levelDiff * durationPerLevel;

            if (speed <= 0) { speed = 10; }

            startAnimation(function (request) {
                var nextStep;

                if (request.step == 0) {
                    nextStep = {
                        duration: speed,
                        resolution: tf.units.GetResolutionByLevel(newLevel),
                        notifyListeners: !!notifyListeners
                    };
                    if (tf.js.GetFunctionOrNull(easing)) { nextStep.easing = easing; }
                }
                else {
                    notifyAnimationEnd(callBack); callBack = null;
                }
                return nextStep;
            }, theThis);
        }
        else { notifyAnimationEnd(callBack); }
    }

    function animatedSetCenter(pointCoords, callBack, duration, notifyListeners, easing) {

        //return setCenter(pointCoords);
        if (isSamePixelAsCenter(pointCoords)) {
            setCenter(pointCoords);
            notifyAnimationEnd(callBack);
        }
        else {
            var latitude = tf.js.GetLatitudeFrom(pointCoords[1]);
            var longitude = tf.js.GetLongitudeFrom(pointCoords[0]);

            duration = tf.js.GetFloatNumberInRange(duration, minAniSpeed, maxAniSpeed, tf.consts.defaultMapAnimatedCenterDurationMillis);

            var center = getCenter();

            startAnimation(function (request) {
                var nextStep;
                if (request.step == 0) {
                    nextStep = {
                        duration: duration,
                        center: [longitude, latitude],
                        notifyListeners: !!notifyListeners
                    };
                    if (tf.js.GetFunctionOrNull(easing)) { nextStep.easing = easing; }
                }
                else if (!!callBack) { notifyAnimationEnd(callBack); callBack = null; }
                return nextStep;
            }, theThis);
        }
    }

    function animatedSetCenterIfDestVisible(pointCoords, speed) {
        if (getAreMapCoordsVisible(pointCoords)) { animatedSetCenter(pointCoords, speed, null, false); } else { setCenter(pointCoords); }
    }

    var hasInteractions = true;
    var hadZoomControl = false;

    function getHasInteractions() { return hasInteractions; }

    function setHasInteractions(bool) {
        bool = !!bool;

        if (bool != hasInteractions) {
            if (bool) { addInteractions(); }
            else { removeInteractions(); }
        }
    }

    function removeInteractions() {
        if (hasInteractions) {
            olInteractions.clear();
            if (hadZoomControl = !!mapControls[tf.consts.panelNameZoom] && mapControls[tf.consts.panelNameZoom].isOn) { showPanel(tf.consts.panelNameZoom, false); }
            hasInteractions = false;
        }
    }

    function addInteractions() {
        if (!hasInteractions) {
            olInteractions.extend(olInteractionsCopy.getArray());
            if (hadZoomControl) { showPanel(tf.consts.panelNameZoom, true); }
            if (!!mapDrawInteraction) {
                mapDrawInteraction.Restore();
            }
            hadZoomControl = false;
            hasInteractions = true;
        }
    }

    var vidParamStr = null;

    function setVIDParamStr(vidParamStrSet) { vidParamStr = typeof vidParamStrSet === "string" && vidParamStrSet.length > 0 ? vidParamStrSet : null; }
    function getVIDParamStr() { return vidParamStr; }

    var passTroughString = null;

    function setTFPassThroughString(passThroughStringSet) {
        passTroughString = tf.js.GetNonEmptyString(passThroughStringSet, null);
        if (tf.js.GetIsNonEmptyString(passTroughString)) { if (passTroughString.charAt(0) != '&') { passTroughString = '&' + passTroughString; } }
    }
    function getTFPassTroughString() { return passTroughString; }

    var revGeocoder = null;

    function isUsingRevGeocoderOnMoveEnd() { return revGeocoder != null && revGeocoder.IsListeningToMoveEnd(); }
    function setUseRevGeocoderOnMoveEnd(bool) { if (revGeocoder) { revGeocoder.SetListenToMoveEnd(bool); } }

    var tDBPage = null;
    var geoCodeFlyer = null;

    function onEndGeoCodeFlyer(Lat, Lon, ErrorMsg, GeoCodeResult) {
        if (isUsingRevGeocoderOnMoveEnd()) {
            if (geoCodeFlyer == null || !geoCodeFlyer.DidMove()) { revGeocoder.TryShowGeocode(Lat, Lon, ErrorMsg, GeoCodeResult); }
            //revGeocoder.TryShowGeocode(Lat, Lon, ErrorMsg, GeoCodeResult);
        }
        else if (tf.js.GetIsNonEmptyString(ErrorMsg)) { showMessage(ErrorMsg); }
    }

    function flyToAddress(addressStr) {
        var tryToFly = true;

        if (geoCodeFlyer) {
            geoCodeFlyer.Cancel();
            if (tryToFly = geoCodeFlyer.WasCancelled() || geoCodeFlyer.HasCompleted()) { geoCodeFlyer = null; }
        }

        if (tryToFly) {
            if (tf.js.GetIsNonEmptyString(addressStr)) {
                geoCodeFlyer = new tf.map.aux.GeoCodeFlyer(theThis, onEndGeoCodeFlyer, addressStr);
                new tf.services.Geocoder({
                    address: addressStr, callBack: function (data) {
                        var pointCoords = !!data ? data.pointCoords : [0, 0];
                        geoCodeFlyer.DelayCallBack(pointCoords[1], pointCoords[0], data.errormsg, data.geocoderlevel);
                    }
                });
                //TGetLatLngByAddress(addressStr, geoCodeFlyer.DelayCallBack);
            }
        }
        return tryToFly;
    }

    function defaultMapOnClick(notification) { animatedSetCenter(notification.eventCoords); }

    var panOnClickListener = null;

    function AfterMapOnClickFlyEnds(lat, lon) { }

    function setUsePanOnClick(bool) {
        if ((bool = !!bool) != isUsingPanOnClick()) {
            if (bool) { panOnClickListener = allEventDispatchers.AddListener(tf.consts.mapClickEvent, defaultMapOnClick); }
            else { panOnClickListener.OnDelete(); panOnClickListener = null; }
        }
    }

    function isUsingPanOnClick() { return panOnClickListener != null; }

    function goDBByAddress(addressStr) { if (tDBPage) { tDBPage.GoDBByAddress(addressStr); } }
    function goDBByCoords(pointCoords) { if (tDBPage) { tDBPage.GoDBByCoords(pointCoords); } }
    function GoDBByCenterCoords() { if (tDBPage) { tDBPage.GoDBByCenterCoords(); } }

    var goDBOnDoubleClick = true;

    function setGoDBOnDoubleClick(bool) { goDBOnDoubleClick = !!bool; }
    function getGoDBOnDoubleClick() { return goDBOnDoubleClick; }


    function setAddressBarHelp(addressBarHelpStr) {
        if (addressPopup) {
            typeof addressBarHelpStr !== "string" && (addressBarHelpStr = "");
            addressPopup.SetAddressBarHelp(addressBarHelpStr);
        }
    }
    function setAddressBarText(addressBarText) {
        if (addressPopup) {
            typeof addressBarText !== "string" && (addressBarText = "");
            addressPopup.SetAddressBarText(addressBarText);
        }
    }

    function getAddressBarText() { return addressPopup ? addressPopup.GetAddressBarText() : ''; }

    function setRotationDeg(rotationDeg) { return setRotationRad(tf.units.DegreesToRadians(rotationDeg)); }
    function getRotationDeg() { return tf.units.RadiansToDegrees(getRotationRad()); }

    function setRotationRad(rotationRad) { olView.setRotation(tf.js.GetFloatNumber(rotationRad, 0)); }
    function getRotationRad() { return olView.getRotation(); }

    function doDownloadQuery(downloadExtent, utmExtent) {
        if (!!downloadExtent) {
            var passthroughParam = getTFPassTroughString();

            if (!passthroughParam) { passthroughParam = ''; }

            var strUrl =
                "http://vn4.cs.fiu.edu/cgi-bin/tfrectdisp.cgi?" +
                passthroughParam +
                "&dt=51306.25" +
                "&X1l=" + downloadExtent[0] +
                "&Y1l=" + downloadExtent[3] +
                "&X2l=" + downloadExtent[2] +
                "&Y2l=" + downloadExtent[1] +
                "&Source=best_available" +
                "&Res=" + getResolution() +
                "&Overlay=wcity";

            window.open(strUrl, "_blank");
        }
    }

    function onConfirmDownload() {
        var downloadExtent = mapDrawInteraction.GetMapExtent();
        var utmExtent = mapDrawInteraction.GetBoxExtent();
        if (downloadExtent) {
            doDownloadQuery(downloadExtent, utmExtent);
            cancelInteraction();
        }
        else {
            showMessage("<p/>First: Click/Touch to select a rectangular area.<p/>Then: Press the button to download.");
        }
    }

    function startInteraction(type, onEnd) { hideOpenControlPopups(); if (!!mapDrawInteraction) { mapDrawInteraction.Start(type, onEnd); } }
    function cancelInteraction() { if (!!mapDrawInteraction) { mapDrawInteraction.Cancel(); } }

    function cancelDownloadInteraction() { if (!!downloadPopup) { downloadPopup.Show(false); } }

    function startDownloadInteraction() {
        if (!downloadPopup) {
            downloadPopup = new tf.map.ui.DownloadBar(mapContainerAll, theThis,
                mapControls[tf.consts.panelNameDownload].control,
                cancelInteraction, onConfirmDownload, theThis);
        }
        downloadPopup.Show(true);
        startInteraction('box', cancelDownloadInteraction);
    }

    function cancelMeasureInteraction() { if (measurePopup) { measurePopup.Show(false); } }

    function privateOnChangeMeasureType() { cancelInteraction(); startMeasureInteraction(); }

    function startMeasureInteraction() {
        if (!measurePopup) {
            measurePopup = new tf.map.ui.MeasureBar(mapContainerAll, theThis,
                mapControls[tf.consts.panelNameMeasure].control,
                cancelInteraction, privateOnChangeMeasureType, theThis);
        }
        measurePopup.Show(true);
        startInteraction(measurePopup.GetIsMeasuringDistances() ? 'lines' : 'poly', cancelMeasureInteraction);
    }

    function createCenterMapButton(visibleBool) {
        var mapCenterButtonElem;
        var dimMapCenter = "16rem";
        if (tf.js.GetIsNonEmptyString(settings.mapCenterSVG)) {
            mapCenterButton = new tf.dom.Div({ cssClass: styles.GetUnPaddedDivClassNames(false, false) });
            mapCenterButtonElem = mapCenterButton.GetHTMLElement();
            mapCenterButtonElem.innerHTML = settings.mapCenterSVG;
            mapCenterButtonElem.style.width = mapCenterButtonElem.style.height = dimMapCenter;
            mapCenterButtonElem.style.fill = "white";
        }
        else {
            mapCenterButton = new tf.ui.SvgGlyphBtn({ style: true, glyph: tf.styles.SvgGlyphBullsEye2Name, dim: dimMapCenter, noChangeOnHover: true });
            mapCenterButtonElem = mapCenterButton.GetHTMLElement();
        }
        styles.ApplySnapToCenterStyle(mapCenterButtonElem);
        mapContainerAll.appendChild(mapCenterButtonElem);
        mapCenterButtonElem.style.display = visibleBool ? 'block' : 'none';
        mapCenterButtonElem.style.pointerEvents = 'none';
        mapCenterButtonElem.style.position = 'absolute';
        mapCenterButtonElem.style.opacity = "0.30";
        styles.AddHorShadowStyle(mapCenterButton);
        styles.AddDefaultOpacityTransitionStyle(mapCenterButton);
        mapCenterButtonElem.style.zIndex = zIndex + 5;
    }

    function onNotifyFullScreen() {
        var fullScreenPanel = mapControls[tf.consts.panelNameFullscreen];
        if (!!fullScreenPanel) {
            if (tf.browser.GetIsFullScreen()) {
                fullScreenPanel.control.ChangeTitle(getFullScreenLabelFull(), tf.consts.fullScreenToolTipFull);
            } else {
                fullScreenPanel.control.ChangeTitle(getFullScreenLabelNormal(), tf.consts.fullScreenToolTipNormal);
            }
        }
        mergeWithBaseAndNotifyListeners(tf.consts.mapFullScreenEvent);
        onResize();
    }

    function onFullScreen() {
        if (!!containerAll) {
            if (!tf.browser.GetIsFullScreen()) {
                if (tf.dom.GetHTMLElementFrom(settings.fullScreenContainer)) {
                    tf.browser.RequestFullScreen(settings.fullScreenContainer);
                }
                else {
                    tf.browser.RequestFullScreen(document.body);
                }
            }
        }
    }

    function toggleMapFullScreen() {
        if (tf.browser.GetIsFullScreen()) { tf.browser.ExitFullScreen(); } else { theThis.FullScreen(); }
    }

    function getVisibleExtent() {
        return ol.extent.applyTransform(olView.calculateExtent(olMap.getSize()), ol.proj.getTransform(tf.consts.olSystem, tf.consts.tmSystem));
    }

    function getDisplayVisibleExtent() {
        return ol.extent.applyTransform(olView.calculateExtent(olMap.getSize()), ol.proj.getTransform(tf.consts.olSystem, tf.consts.tmSystem));
    }

    function setVisibleExtent(extent) {
        extent = tf.js.GetMapExtentFrom(extent);

        if (extent[0] != extent[2] && extent[1] != extent[3]) {
            //var size = olMap.getSize();
            var size = theThis.GetPixelSize();
            var mapW = size[0], mapH = size[1];

            if (mapW > 0 && mapH > 0) {
                var extentMidLon = extent[0] + (extent[2] - extent[0]) / 2;
                var extentMidLat = extent[1] + (extent[3] - extent[1]) / 2;

                var extentFeature = new tf.map.FeatureGeom({ type: "linestring", coordinates: [[extent[0], extentMidLat], [extent[2], extentMidLat]] });
                var extentWM = extentFeature.GetLength();

                extentFeature = new tf.map.FeatureGeom({ type: "linestring", coordinates: [[extentMidLon, extent[1]], [extentMidLon, extent[3]]] });
                var extentHM = extentFeature.GetLength();

                var res1 = extentWM / mapW, res2 = extentHM / mapH;
                var res = res1 > res2 ? res1 : res2 ;

                setResolution(res);
                setCenter([extentMidLon, extentMidLat]);
            }
        }
    }

    function getAreMapCoordsInExtent(pointCoords, extent) {
        var lat = tf.js.GetLatitudeFrom(pointCoords[1]);
        var lon = tf.js.GetLongitudeFrom(pointCoords[0]);
        var isIn = extent[1] <= lat && extent[3] >= lat && extent[0] <= lon && extent[2] >= lon;
        return isIn;
    }

    function getAreMapCoordsVisible(pointCoords) { return getAreMapCoordsInExtent(pointCoords, getVisibleExtent()); }

    function getPixelCoordsAreVisible(xPixel, yPixel) {
        var pointCoords = pixelToMapCoords(xPixel, yPixel);
        return getAreMapCoordsVisible(pointCoords);
    }

    function render() { return !!olMap ? olMap.render() : false; }
    function renderNow() { return !!olMap ? olMap.renderSync() : false; }

    function eventIsOnMap(e) {
        //tf.GetDebug().LogIfTest(e.browserEvent.target.className);
        return e.originalEvent.target.className == "ol-unselectable"
    }

    var lastHoveredFeature = null;

    function hoverOutOfPossibleHoveredFeature() {
        var center = getCenter();
        hoverIntoFeature(null, center[0], center[1]);
    }

    function privateNotifyDelFeatures(arg) {
        if (!!arg) {
            if (arg instanceof ol.Feature) {
                var mapFeature = arg.getProperties().mapFeature;
                if (mapFeature === lastHoveredFeature) {
                    hoverOutOfPossibleHoveredFeature();
                }
            }
            else if (typeof arg === "object") {
                for (var i in arg) {
                    var thisArg = arg[i];
                    if (thisArg instanceof ol.Feature) {
                        var mapFeature = thisArg.getProperties().mapFeature;
                        if (mapFeature === lastHoveredFeature) {
                            hoverOutOfPossibleHoveredFeature();
                            break;
                        }
                    }
                }
            }
        }
    }

    function hoverOutOfLastHoveredFeature(nextHoverFeature, lat, lon) {
        if (!!lastHoveredFeature) {
            var notification = mergeWithBaseNotification(tf.js.ShallowMerge(makeKeyedFeatureLatLonNotification(lastHoveredFeature, lat, lon, undefined), {
                nextKeyedFeature: getKeyedFeatureFromMapFeature(nextHoverFeature), nextFeature: nextHoverFeature, isInHover: false
            }));
            lastHoveredFeature.onHoverInOut(notification);
            doNotifyListeners(tf.consts.mapFeatureHoverInOutEvent, notification);
            lastHoveredFeature = null;
        }
    }

    function makeFeatureClusterNotification(featureCluster) { return !!featureCluster ? { featureCluster: featureCluster } : undefined; }

    function hoverIntoFeature(mapFeature, lat, lon, featureCluster) {
        if (mapFeature != lastHoveredFeature) {
            hoverOutOfLastHoveredFeature(mapFeature, lat, lon);
            if (!!mapFeature) {
                var notification = mergeWithBaseNotification(tf.js.ShallowMerge(makeKeyedFeatureLatLonNotification(mapFeature, lat, lon, featureCluster), {
                    prevKeyedFeature: getKeyedFeatureFromMapFeature(lastHoveredFeature), prevFeature: lastHoveredFeature, isInHover: true
                }));
                mapFeature.onHoverInOut(notification);
                doNotifyListeners(tf.consts.mapFeatureHoverInOutEvent, notification);
            }
            lastHoveredFeature = mapFeature;
        }
    }

    function createFeatureCluster(clusterFeature, features) {
        var clusterGeom = clusterFeature.getGeometry();
        var clusterGeomExtent = clusterGeom.getExtent();
        var clusterCoords = tf.units.OL2TM([clusterGeomExtent[0], clusterGeomExtent[1]]);
        var clusterFeatures;
        if (!!features && features.length > 1) {
            clusterFeatures = [];
            for (var i = 0, len = features.length ; i < len ; ++i) {
                var feature = features[i], props = feature.getProperties(), mapFeature = props.mapFeature;
                if (mapFeature) { clusterFeatures.push(mapFeature); }
            }
        }
        return { clusterFeatures: clusterFeatures, clusterCoords: clusterCoords };
    }

    function onPointerDrag(e) {
        if (eventIsOnMap(e)) {
            var hitMapFeature = false;
            var mapFeatures = [];
            var pixelCoords = actualToVirtualPixelCoords(e.pixel);
            var featureCluster;

            isDragging = true;

            if (!isDraggingOnMap) {
                olMap.forEachFeatureAtPixel(pixelCoords, function (feature, layer) {
                    if (feature) {
                        var features = feature.get('features');
                        if (features) {
                            featureCluster = createFeatureCluster(feature, features);
                            feature = features[0];
                        }
                        if (feature) {
                            var props = feature.getProperties();
                            var mapFeature = props.mapFeature;
                            if (mapFeature) {
                                mapFeatures.push(mapFeature);
                                if (firstFeatureOnly) { return true; }
                            }
                            else if (props.markerName == infoFeatureName) {
                                hitMapFeature = true;
                                return true;
                            }
                        }
                    }
                });
            }

            if (!hitMapFeature) {
                var mapEventNotification = { mapEvent: e };
                var actualCoordinate = tf.units.OL2TM(e.coordinate);
                var coordinate = actualPixelToMapCoords(pixelCoords);
                var lat = coordinate[1], lon = coordinate[0];
                var needNotifyMap = isDraggingOnMap;
                if (!needNotifyMap) {
                    var nMapFeatures = mapFeatures.length;
                    for (var i = 0; i < nMapFeatures; ++i) {
                        var mapFeature = mapFeatures[i];
                        var notification = tf.js.ShallowMerge(mergeWithBaseNotification(makeKeyedFeatureLatLonNotification(mapFeature, lat, lon, featureCluster)), mapEventNotification);
                        doNotifyListeners(tf.consts.mapFeatureMouseDragEvent, notification);
                        if (firstFeatureOnly) { break; }
                    }
                    if (nMapFeatures == 0) { needNotifyMap = isDraggingOnMap = true; }
                }
                if (needNotifyMap) {
                    mergeWithBaseAndNotifyListeners(tf.consts.mapMouseDragEvent,
                        tf.js.ShallowMerge(tf.js.ShallowMerge(makeFeatureClusterNotification(featureCluster),
                            makePixelNotification(makeLatLonNotification(lat, lon, actualCoordinate), pixelCoords, e.pixel)), mapEventNotification));
                }
            }
        }
    }

    function onPointerMove(e) {
        if (eventIsOnMap(e)) {
            var hitMapFeature = false;
            var mapFeatures = [];
            var pixelCoords = actualToVirtualPixelCoords(e.pixel);
            var featureCluster;
            olMap.forEachFeatureAtPixel(pixelCoords, function (feature, layer) {
                if (feature) {
                    var features = feature.get('features');
                    if (features) {
                        featureCluster = createFeatureCluster(feature, features);
                        feature = features[0];
                    }
                    if (feature) {
                        var props = feature.getProperties();
                        var mapFeature = props.mapFeature;
                        if (mapFeature) {
                            mapFeatures.push(mapFeature);
                            if (firstFeatureOnly) { return true; }
                        }
                        else if (props.markerName == infoFeatureName) {
                            hitMapFeature = true;
                            return true;
                        }
                    }
                }
            });

            if (!hitMapFeature) {
                var mapEventNotification = { mapEvent: e };
                var nMapFeatures = mapFeatures.length;
                var actualCoordinate = tf.units.OL2TM(e.coordinate);
                var coordinate = actualPixelToMapCoords(pixelCoords);
                var lat = coordinate[1], lon = coordinate[0];
                var rollOverHandled = false;

                for (var i in mapFeatures) {
                    var mapFeature = mapFeatures[i];
                    var notification = tf.js.ShallowMerge(mergeWithBaseNotification(makeKeyedFeatureLatLonNotification(mapFeature, lat, lon, featureCluster)), mapEventNotification);
                    hoverIntoFeature(mapFeature, lat, lon, featureCluster);
                    rollOverHandled = mapFeature.onMouseMove(notification);
                    if (!rollOverHandled) { doNotifyListeners(tf.consts.mapFeatureMouseMoveEvent, notification); }
                    if (rollOverHandled || firstFeatureOnly) { break; }
                }
                if (nMapFeatures == 0) { hoverIntoFeature(null, lat, lon, featureCluster); }
                mapEventNotification.nMapFeatures = nMapFeatures;
                mergeWithBaseAndNotifyListeners(tf.consts.mapMouseMoveEvent,
                    tf.js.ShallowMerge(tf.js.ShallowMerge(makeFeatureClusterNotification(featureCluster),
                    makePixelNotification(makeLatLonNotification(lat, lon, actualCoordinate), pixelCoords, e.pixel)), mapEventNotification));
            }
        }
    }

    function onPointerInstantClick(e) {
        if (eventIsOnMap(e)) {

            if (!mapDrawInteraction || !mapDrawInteraction.GetIsInteracting()) {
                var pixelCoords = actualToVirtualPixelCoords(e.pixel);
                var actualCoordinate = tf.units.OL2TM(e.coordinate);
                var coordinate = actualPixelToMapCoords(pixelCoords);
                var lat = coordinate[1], lon = coordinate[0];
                var hitPrivateMapFeature = false;
                var mapFeatures = [];
                var featureCluster;

                olMap.forEachFeatureAtPixel(pixelCoords, function (feature, layer) {
                    var features = feature.get('features');
                    if (features) {
                        featureCluster = createFeatureCluster(feature, features);
                        feature = features[0];
                    }
                    if (feature) {
                        var props = feature.getProperties();
                        if (!!props) {
                            var mapFeature = props.mapFeature;
                            if (!!mapFeature) { mapFeatures.push(mapFeature); }
                            else { var name = props.markerName; if (name == infoFeatureName) { hitPrivateMapFeature = true; toggleInfoWindowPin(); return true; } }
                        }
                    }
                }, theThis);

                if (!hitPrivateMapFeature) {

                    var mapEventNotification = { mapEvent: e };
                    var nMapFeatures = mapFeatures.length;
                    var clickHandled = false;
                    var clusterNotification = makeFeatureClusterNotification(featureCluster);

                    for (var i in mapFeatures) {
                        var mapFeature = mapFeatures[i];
                        var notification = tf.js.ShallowMerge(mergeWithBaseNotification(makeKeyedFeatureLatLonNotification(mapFeature, lat, lon, featureCluster)), mapEventNotification);
                        clickHandled = mapFeature.onClick(notification);
                        if (!clickHandled) { doNotifyListeners(tf.consts.mapFeatureInstantClickEvent, notification); }
                        if (clickHandled || firstFeatureOnly) { break; }
                    }

                    if (nMapFeatures == 0) {
                        mergeWithBaseAndNotifyListeners(tf.consts.mapInstantClickEvent, tf.js.ShallowMerge(
                            tf.js.ShallowMerge(clusterNotification,
                                makePixelNotification(makeLatLonNotification(lat, lon, actualCoordinate), pixelCoords, e.pixel), mapEventNotification)));
                    }
                }
            }
        }
    }

    function onPointerClick(e) {
        if (eventIsOnMap(e)) {

            if (!mapDrawInteraction || !mapDrawInteraction.GetIsInteracting()) {
                var pixelCoords = actualToVirtualPixelCoords(e.pixel);
                var actualCoordinate = tf.units.OL2TM(e.coordinate);
                var coordinate = actualPixelToMapCoords(pixelCoords);
                var lat = coordinate[1], lon = coordinate[0];
                var hitPrivateMapFeature = false;
                var mapFeatures = [];
                var featureCluster;

                olMap.forEachFeatureAtPixel(pixelCoords, function (feature, layer) {
                    var features = feature.get('features');
                    if (features) {
                        featureCluster = createFeatureCluster(feature, features);
                        feature = features[0];
                    }
                    if (feature) {
                        var props = feature.getProperties();
                        if (!!props) {
                            var mapFeature = props.mapFeature;
                            if (!!mapFeature) { mapFeatures.push(mapFeature); }
                            else { var name = props.markerName; if (name == infoFeatureName) { hitPrivateMapFeature = true; toggleInfoWindowPin(); return true; } }
                        }
                    }
                }, theThis);

                if (!hitPrivateMapFeature) {

                    var mapEventNotification = { mapEvent: e };
                    var nMapFeatures = mapFeatures.length;
                    var clickHandled = false;
                    var clusterNotification = makeFeatureClusterNotification(featureCluster);

                    for (var i in mapFeatures) {
                        var mapFeature = mapFeatures[i];
                        var notification = tf.js.ShallowMerge(mergeWithBaseNotification(makeKeyedFeatureLatLonNotification(mapFeature, lat, lon, featureCluster)), mapEventNotification);
                        clickHandled = mapFeature.onClick(notification);
                        if (!clickHandled) { doNotifyListeners(tf.consts.mapFeatureClickEvent, notification); }
                        if (clickHandled || firstFeatureOnly) { break; }
                    }

                    if (nMapFeatures == 0) {
                        mergeWithBaseAndNotifyListeners(tf.consts.mapClickEvent, tf.js.ShallowMerge(
                            tf.js.ShallowMerge(clusterNotification,
                            makePixelNotification(makeLatLonNotification(lat, lon, actualCoordinate), pixelCoords, e.pixel), mapEventNotification)));
                    }
                }
            }
        }
    }

    function onPointerDoubleClick(e) {
        if (eventIsOnMap(e)) {

            if (!mapDrawInteraction || !mapDrawInteraction.GetIsInteracting()) {
                var pixelCoords = actualToVirtualPixelCoords(e.pixel);
                var actualCoordinate = tf.units.OL2TM(e.coordinate);
                var coordinate = actualPixelToMapCoords(pixelCoords);
                var lat = coordinate[1], lon = coordinate[0];
                var hitPrivateMapFeature = false;
                var mapFeatures = [];
                var featureCluster;

                olMap.forEachFeatureAtPixel(pixelCoords, function (feature, layer) {
                    var features = feature.get('features');
                    if (features) {
                        featureCluster = createFeatureCluster(feature, features);
                        feature = features[0];
                    }
                    if (feature) {
                        var props = feature.getProperties();
                        if (!!props) {
                            var mapFeature = props.mapFeature;
                            if (!!mapFeature) { mapFeatures.push(mapFeature); }
                            else { var name = props.markerName; if (name == infoFeatureName) { hitPrivateMapFeature = true; toggleInfoWindowPin(); return true; } }
                        }
                    }
                }, theThis);

                if (!hitPrivateMapFeature) {

                    var mapEventNotification = { mapEvent: e };
                    var nMapFeatures = mapFeatures.length;
                    var clickHandled = false;

                    for (var i in mapFeatures) {
                        var mapFeature = mapFeatures[i];
                        var notification = tf.js.ShallowMerge(mergeWithBaseNotification(makeKeyedFeatureLatLonNotification(mapFeature, lat, lon, featureCluster)), mapEventNotification);
                        clickHandled = mapFeature.onDoubleClick(notification);
                        if (!clickHandled) { doNotifyListeners(tf.consts.mapFeatureDblClickEvent, notification); }
                        if (clickHandled || firstFeatureOnly) { break; }
                    }

                    if (nMapFeatures == 0) {
                        if (goDBOnDoubleClick) { goDBByCoords(coordinate); } else {
                            mergeWithBaseAndNotifyListeners(tf.consts.mapDblClickEvent,
                                tf.js.ShallowMerge(tf.js.ShallowMerge(makeFeatureClusterNotification(featureCluster),
                                makePixelNotification(makeLatLonNotification(lat, lon, actualCoordinate), pixelCoords, e.pixel))), mapEventNotification);
                        }
                    }
                }
            }
        }
    }

    this.onMoveEnd = function (e) { return onMoveEnd(e); }

    function onMoveStart(e) {
        var center = getCenter();
        var lat = center.Latitude, lon = center.Longitude;

        if (currentLat != lat && currentLon != lon) {
            currentLat = lat; currentLon = lon;
        }
        if (!isAnimating) {
            mergeWithBaseAndNotifyListeners(tf.consts.mapMoveStartEvent, makeCurrentLatLonNotification());
        }
    }

    function onMoveEnd(e) {
        var center = getCenter();
        var lat = center.Latitude, lon = center.Longitude;

        //hideOpenControlPopups();

        if (currentLat != lat && currentLon != lon) {
            currentLat = lat; currentLon = lon;
        }
        if (!isAnimating) {
            var endRes = getResolution();
            if (currentRes != endRes) {
                currentRes = endRes;
                onDelayResEnd.DelayCallBack();
                //console.log('delayed res on moveend');
                var endLevel = getLevel();
                if (currentLevel != endLevel) {
                    currentLevel = endLevel;
                    onDelayZoomEnd.DelayCallBack();
                    //console.log('delayed level on moveend');
                }
            }
            onDelayMoveEnd.DelayCallBack();
        }
    }

    function setMapEngine(mapEngineSet) {
        mapEngine = tf.map.GetMapEngineFrom(mapEngineSet);
        getVectorTileFunction = (useMapNik2 = (mapEngine !== tf.consts.mapnikEngine)) ? getMapnik2VectorTile : getMapnik1VectorTile;
    }

    //function getMapPinImgSrc() { return tf.platform.MakePlatformPath("image/mappin.png"); }

    function getKeyedFeatureFromMapFeature(mapFeature) {
        return !!mapFeature && !!tf.js.GetFunctionOrNull(mapFeature.GetKeyedFeature) ? mapFeature.GetKeyedFeature() : null;
    }

    function getMapFeatureFromMapFeature(mapFeature) {
        return !!mapFeature && !!tf.js.GetFunctionOrNull(mapFeature.GetMapFeature) ? mapFeature.GetMapFeature() : null;
    }

    function mergeWithBaseNotification(notification) { return tf.js.ShallowMerge(notification, baseNotification); }

    function doNotifyListeners(eventName, notification) {
        if (notification.sender !== theThis) {
            tf.GetDebug().LogIfTest("map: notify without sender");
        }
        allEventDispatchers.Notify(eventName, tf.js.ShallowMerge(/*mergeWithBaseNotification(*/notification/*)*/, { eventName: eventName }));
    }

    function mergeWithBaseAndNotifyListeners(eventName, notification) { return doNotifyListeners(eventName, mergeWithBaseNotification(notification)); }

    function makeLatLonNotification(lat, lon, actualCoords) {
        var eventCoords = [lon, lat]; if (actualCoords == undefined) { actualCoords = eventCoords; }
        return { eventCoords: eventCoords, actualEventCoords: actualCoords };
    }

    function makeCurrentLatLonNotification() { return makeLatLonNotification(currentLat, currentLon); }

    function makePixelNotification(notification, pixel, actualPixel) { return tf.js.ShallowMerge(notification, { pixelCoords: pixel, actualPixelCoords: actualPixel }); }

    function makeKeyedFeatureNotification(mapFeature) {
        var mapFeatureUse = getMapFeatureFromMapFeature(mapFeature);
        if (!mapFeatureUse) { mapFeatureUse = mapFeature; }
        return { keyedFeature: getKeyedFeatureFromMapFeature(mapFeatureUse), mapFeature: mapFeatureUse, styleName: mapFeatureUse.getStyleName() };
    }

    function makeKeyedFeatureLatLonNotification(mapFeature, lat, lon, featureCluster) {
        return tf.js.ShallowMerge(makeKeyedFeatureNotification(mapFeature), makeLatLonNotification(lat, lon), makeFeatureClusterNotification(featureCluster));
    }

    function addFeatureLayers(multiLayerSettings) {
        var layers = {};
        if (tf.js.GetIsValidObject(multiLayerSettings)) {
            for (var i in multiLayerSettings) {
                var thisLayerSettings = multiLayerSettings[i];

                if (tf.js.GetIsValidObject(thisLayerSettings)) {
                    var thisLayer = addFeatureLayer(thisLayerSettings);
                    if (!!thisLayer) { layers[thisLayer.GetName()] = thisLayer; }
                }
            }
        }
        return layers;
    }

    function showMapCenter(show) {
        if (!!mapCenterButton) {
            if (isShowingMapCenter != (show = !!show)) {
                //styles.ChangeOpacityVisibilityClass(mapCenterButton, isShowingMapCenter = show);
                tf.dom.GetHTMLElementFrom(mapCenterButton).style.display = !!(isShowingMapCenter = show) ? 'block' : 'none';
            }
        }
    }

    function checkNotifyListeners() {
        if (levelChanged) { onNotifyZoomEnd(); }
        if (resChanged) { onNotifyResolutionEnd(); }
        if (posChanged) { onNotifyMoveEnd(); }
    }

    function preRender(map, frameState) {
        if (isAnimating) {
            if (frameState.time <= animationSpecs.start + animationSpecs.duration) {
                if (frameState.time >= animationSpecs.start) {
                    //var easing = ol.easing.inAndOut;
                    //var easing = ol.easing.linear;
                    var easing = animationSpecs.easing;
                    var delta = 1 - easing((frameState.time - animationSpecs.start) / animationSpecs.duration);

                    if (animationSpecs.sourceCenter) {
                        var deltaX = animationSpecs.sourceCenter[0] - animationSpecs.endCenter[0];
                        var deltaY = animationSpecs.sourceCenter[1] - animationSpecs.endCenter[1];
                        frameState.viewState.center[0] = animationSpecs.endCenter[0] + delta * deltaX;
                        frameState.viewState.center[1] = animationSpecs.endCenter[1] + delta * deltaY;
                        var center = tf.units.OL2TM(frameState.viewState.center);
                        var newLon = center[0], newLat = center[1];
                        posChanged = newLon != currentLon || newLat != currentLat;
                        currentLat = newLat;
                        currentLon = newLon;
                    }

                    if (animationSpecs.sourceRes !== undefined) {
                        var deltaResolution = animationSpecs.sourceRes - animationSpecs.endRes;
                        var newRes;
                        var newLevel = tf.units.GetLevelByResolution(frameState.viewState.resolution = newRes = animationSpecs.endRes + delta * deltaResolution)
                        resChanged = newRes != currentRes;
                        levelChanged = newLevel != currentLevel;
                        currentLevel = newLevel;
                        currentRes = newRes;
                    }
                    if (animationSpecs.sourceRotation !== undefined) {
                        var deltaRotation = tf.units.GetShortestArcBetweenAngles(animationSpecs.endRotation, animationSpecs.sourceRotation)
                        frameState.viewState.rotation = animationSpecs.endRotation + delta * deltaRotation;
                    }
                    if (animationSpecs.notifyListeners) { checkNotifyListeners(); }
                    else { if (resChanged || levelChanged) { whenMapResolutionChanges(); } }
                }
            }
            else { getNextAnimationStep(); }

            if (isAnimating) {
                render();
            }
            else { checkNotifyListeners(); }
            return isAnimating;
        }
        else {
            var center = tf.units.OL2TM(frameState.viewState.center);
            currentLat = center[1];
            currentLon = center[0];
            currentRes = frameState.viewState.resolution;
        }
        return isAnimating;
    }

    this.GetInstantCenter = function () { return [currentLon, currentLat]; }
    //this.GetInstantRotationRad = function () { }
    this.GetInstantResolution = function () { return currentRes; }

    function callAnimationCallBack() {
        return !!animationCallBack ? animationCallBack.call(animationOptionalScope, { sender: theThis, step: animationStep++ }) : null;
    }

    function endAnimation() {
        if (isAnimating) {
            if (!!animationCallBack) { animationStep = -1; callAnimationCallBack(); animationCallBack = null; }
            isAnimating = false;
            render();
        }
    }

    function getNextAnimationStep() {
        if (isAnimating) {
            var nextStep = callAnimationCallBack();

            if (tf.js.GetIsValidObject(nextStep)) {
                var nextCenter = nextStep.center !== undefined ? tf.js.GetMapCoordsFrom(nextStep.center) : undefined;
                var nextRes = nextStep.resolution !== undefined ? nextStep.resolution : undefined;
                var nextRotation = nextStep.rotation !== undefined ? nextStep.rotation : undefined;
                var duration = nextStep.duration !== undefined ? nextStep.duration : 1000;
                var notifyListeners = nextStep.notifyListeners !== undefined ? !!nextStep.notifyListeners : false;
                var easing = tf.js.GetFunctionOrNull(nextStep.easing) ? nextStep.easing : tf.units.EaseInAndOut;
                var olEndCenter = nextCenter !== undefined ? tf.units.TM2OL(nextCenter) : undefined;

                animationSpecs = {
                    notifyListeners: notifyListeners,
                    sourceRes: nextRes !== undefined ? getResolution() : undefined,
                    sourceCenter: nextCenter !== undefined ? getOLViewCenter() : undefined,
                    sourceRotation: nextRotation !== undefined ? getRotationRad() : undefined,
                    endRes: nextRes,
                    endCenter: olEndCenter,
                    endRotation: nextRotation !== undefined ? nextRotation : undefined,
                    duration: duration,
                    easing: easing,
                    start: Date.now()
                };

                if (hasBeforeRender) {
                    if (nextCenter != undefined) { setCenter(nextCenter); }
                    if (nextRes !== undefined) { setResolution(nextRes); }
                    if (nextRotation !== undefined) { setRotationRad(nextRotation); }
                }
                else {
                    olView.animate({
                        rotation: nextRotation,
                        center: olEndCenter,
                        resolution: nextRes,
                        duration: duration,
                        easing: easing//ol.easing.easeOut
                    }, function (animationConcludedOK) {
                        if (!animationConcludedOK) {
                            if (nextCenter != undefined) { setCenter(nextCenter); }
                            if (nextRes !== undefined) { setResolution(nextRes); }
                            if (nextRotation !== undefined) { setRotationRad(nextRotation); }
                        }
                        endAnimation();
                    });
                }
            }
            else { endAnimation(); }
        }
    }

    function startAnimation(animationCallBackSet, animationOptionalScopeSet) {
        var wasAnimating = isAnimating;
        endAnimation();
        if (!!(animationCallBack = tf.js.GetFunctionOrNull(animationCallBackSet))) {
            if (hasBeforeRender) { if (!wasAnimating) { olMap.beforeRender(preRender); } }
            animationStep = 0;
            animationOptionalScope = animationOptionalScopeSet;
            isAnimating = true;
            getNextAnimationStep();
        }
    }

    var vectorContext, clientWantsToContinueAnimation, lastComposeEventName;

    function continueAnimation() { clientWantsToContinueAnimation = true; }

    function showFeatureImmediately(mapFeature) {
        if (mapFeature instanceof tf.map.Feature) {
            if (!!vectorContext) {
                var APIStyle = mapFeature.getAPIStyle();
                for (var i in APIStyle) { vectorContext.drawFeature(mapFeature.getAPIFeature(), APIStyle[i]); }
            }
        }
    }

    this.onComposeEvent = function (eventName, event, otherOLMap) { return onComposeEvent(eventName, event, false, otherOLMap); }

    function onComposeEvent(eventName, event, isSelfEvent, otherOLMap) {
        lastComposeEventName = eventName;
        vectorContext = event.vectorContext;
        clientWantsToContinueAnimation = false;
        mergeWithBaseAndNotifyListeners(eventName, { showFeatureImmediately: showFeatureImmediately, continueAnimation: continueAnimation, canvas: event.context.canvas });
        if (eventName == tf.consts.mapPostComposeEvent) {
            mergeWithBaseAndNotifyListeners(tf.consts.mapPostPostComposeEvent, { showFeatureImmediately: showFeatureImmediately, continueAnimation: continueAnimation, canvas: event.context.canvas });
        }
        vectorContext = undefined;
        if (clientWantsToContinueAnimation) { if (!!otherOLMap) { otherOLMap.render(); } else { render(); } }
        clientWantsToContinueAnimation = false;
    }

    var decodedLegendH, decodedLegendM;

    function setDecodedLegends(decodedLegendHSet, decodedLegendMSet, atResolution) {
        decodedLegendH = decodedLegendHSet;
        decodedLegendM = decodedLegendMSet;
        privateNotifyLegendOptionChange();
        whenMapResolutionChanges(atResolution);
    }

    function initialize() {

        styles = tf.GetStyles();
        subStyles = styles.GetSubStyles();

        showLocInfoWindowOnMoveEndByDefault = true; 
        showLocInfoWindowOnMoveEnd = false;

        isAnimating = false;

        currentSource = "best_available";

        if (settings.messageTimeout !== undefined) { setMessageTimeout(settings.messageTimeout); }

        if (tf.js.GetIsNonEmptyString(settings.vidParam)) { setVIDParamStr(settings.vidParam); }
        if (tf.js.GetIsNonEmptyString(settings.passThroughString)) { setTFPassThroughString(settings.passThroughString); }

        levelChanged = resChanged = posChanged = false;

        mapButtonDimEmStr = subStyles.mapButtonDimEmNumber + "em";

        baseNotification = { sender: theThis };
        layersByName = {};

        settings = tf.js.GetValidObjectFrom(settings);

        linkTargetStr = tf.js.GetIsNonEmptyString(settings.linkTargetStr) ? settings.linkTargetStr : '_top';

        id = tf.GetGlobalCounter().GetNext() + '';

        allEventDispatchers = new tf.events.MultiEventNotifier({ eventNames: tf.consts.allMapEventNames });

        setMapEngine(settings.mapEngine);

        if (tf.js.GetIsNonEmptyString(settings.mapLayerSourceURL)) { setMapLayerSource(settings.mapLayerSourceURL, settings.mapLayerSourceHybridModeOpacity); }

        createDivs(settings.container);

        var bkImgDataImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wAAAIDen//TAAAAfUlEQVRYhe2UsQ3AIAwETcYJ+w9BRQNZhI7mU0VCiBYuhV1Z/gKJO31IucjM7I7RVvPUajvza3k9Oa1LrUspF3376rYrt9MPzntoXRp/ZDfzOf+PAxQCXMLgPUAjwCX0HsAR4BJ6D+AIcAm9B3AEuITeAzgCXELvARwBLuELoBEJ6ZpdtuYAAAAASUVORK5CYII=";
        mapContainerAll.style.backgroundImage = "url('" + bkImgDataImage + "')";

        //var bkImgStr = tf.platform.MakePlatformPath("image/mapBack.png");
        //mapContainerAll.style.backgroundImage = "url('" + bkImgStr + "')";

        var delayCallBack = 300;

        onDelayMoveEnd = new tf.events.DelayedCallBack(delayCallBack, onNotifyMoveEnd, theThis);
        onDelayZoomEnd = new tf.events.DelayedCallBack(delayCallBack, onNotifyZoomEnd, theThis);
        onDelayResEnd = new tf.events.DelayedCallBack(delayCallBack, onNotifyResolutionEnd, theThis);
        onDelayRotEnd = new tf.events.DelayedCallBack(100, onNotifyRotationEnd, theThis);

        new tf.events.DOMFullScreenChangeListener({ callBack: onNotifyFullScreen, optionalScope: theThis });

        setSource(settings.mapAerialSource);

        var canRotate = settings.canRotate != undefined ? !!settings.canRotate : true;

        var receivedMapLegends = false;

        var initialRes, initialLevel;

        if (settings.resolution !== undefined) {
            initialRes = tf.js.GetFloatNumber(settings.resolution, tf.units.GetResolutionByLevel(tf.consts.defaultLevel));
        }
        else {
            initialLevel = tf.js.GetLevelFrom(settings.level);
            initialRes = tf.units.GetResolutionByLevel(initialLevel);
        }


        if (receivedMapLegends = settings.decodedLegendH != undefined) {
            setDecodedLegends(settings.decodedLegendH, settings.decodedLegendM, initialRes);
        }

        createOLViewAndMap(canRotate);
        setMapType(settings.mapType);

        createMapControls(!settings.noNativeControls, settings.noScaleLine);

        if (!settings.noNativePopups) { createMapPopups(); }

        var center = tf.js.GetMapCoordsFrom(settings.center);
        var lon = tf.js.GetLongitudeFrom(center[0]);
        var lat = tf.js.GetLatitudeFrom(center[1]);

        if (initialLevel != undefined) {
            setCenterAndLevel([lon, lat], initialLevel);
        }
        else {
            setCenter([lon, lat]);
            setResolution(initialRes);
        }

        createCenterMapButton(tf.js.GetBoolFromValue(settings.showMapCenter, true));

        if (!settings.noNativeControls) {
            mapDrawInteraction = new tf.map.aux.MapDrawInteraction(theThis, olMap, olSourceVector);
        }

        olMap.on("click", onPointerInstantClick, theThis);
        olMap.on("moveend", onMoveEnd, theThis);
        olMap.on("movestart", onMoveStart, theThis);
        olMap.on("pointermove", onPointerMove, theThis);
        olMap.on("pointerdrag", onPointerDrag, theThis);
        olMap.on("singleclick", onPointerClick, theThis);
        olMap.on("dblclick", onPointerDoubleClick, theThis);
        olMap.on('change:size', function (event) { checkSizePopups(); mergeWithBaseAndNotifyListeners(tf.consts.mapResizedEvent); }, theThis);
        olMap.on('precompose', function (event) { mapCanvas = event.context.canvas; onComposeEvent(tf.consts.mapPreComposeEvent, event, true); }, theThis);
        olMap.on('postcompose', function (event) { mapCanvas = event.context.canvas; onComposeEvent(tf.consts.mapPostComposeEvent, event, true); }, theThis);
        olMap.on('postrender', function (event) { mergeWithBaseAndNotifyListeners(tf.consts.mapPostRenderEvent, { event: event, canvas: mapCanvas }); }, theThis);

        if (tf.js.GetIsValidObject(settings.viewSettings)) { setView(settings.viewSettings); } else { hookUpOLViewEvents(); }

        if (!settings.noNativeControls) {
            tDBPage = new tf.map.aux.GoDBPage({ map: theThis, linkTargetStr: linkTargetStr });
        }

        if (!!mapControls[tf.consts.panelNameOverview] && mapControls[tf.consts.panelNameOverview].isOn) { setTimeout(hookOverviewMapClick, 500); }

        if (tf.js.GetIsNonEmptyString(settings.addressBarText)) { setAddressBarText(settings.addressBarText); }
        if (tf.js.GetIsNonEmptyString(settings.addressBarHelp)) { setAddressBarHelp(settings.addressBarHelp); }

        if (tf.js.GetIsNonEmptyString(settings.panels)) { showPanels(settings.panels); }
        else {
            if (!settings.noNativeControls) {
                showPanel(tf.consts.panelNameMapRotate, true);
            }
            showPanel(tf.consts.panelNameMapScale, true);
        }

        if (!settings.noNativeControls) {
            revGeocoder = new tf.map.aux.RevGeocoder(theThis, updateLocInfoWindow, locInfoWindowPopup);
            if (showLocInfoWindowOnMoveEndByDefault && isPanelShowing(tf.consts.panelNameMapLocation)) {
                showLocInfoWindowOnMoveEnd = true;
            }
            setLocInfoWindowShow();
        }

        if (tf.js.GetIsBoolean(settings.panOnClick)) { setUsePanOnClick(settings.panOnClick); }
        if (tf.js.GetIsBoolean(settings.goDBOnDoubleClick)) { setGoDBOnDoubleClick(settings.goDBOnDoubleClick); }

        if (!receivedMapLegends) {
            if (tf.js.GetIsNonEmptyString(settings.legendH)) { setTimeout(function () { setLegend(settings.legendH, settings.legendM); }, 500); }
            //if (tf.js.GetIsNonEmptyString(settings.legendH)) { setLegend(settings.legendH, settings.legendM); }
        }

        isDraggingOnMap = isDragging = false;
        documentClickListener = new tf.events.DOMClickListener({ target: document, callBack: onEndDragByDoc, optionalScope: theThis, callBackSettings: null });
        documentTouchUpListener = tf.events.AddDOMEventListener(document, tf.consts.DOMEventNamesTouchEnd, onEndDragByDoc);
    }

    var documentClickListener, documentTouchUpListener;
    var isDraggingOnMap, isDragging;

    function onEndDragByDoc() {
        if (isDraggingOnMap || isDragging) {
            isDraggingOnMap = isDragging = false;
            //console.log('notified end drag');
            mergeWithBaseAndNotifyListeners(tf.consts.mapEndDragEvent);
        }
    }

    function getDragPan() {
        var dragPan;
        olMap.getInteractions().forEach(function (interaction) { if (interaction instanceof ol.interaction.DragPan) { dragPan = interaction; } }, this);
        return dragPan;
    }

    function removeDragPan() {
        var dragPan = getDragPan();
        if (!!dragPan) {
            dragPan.setActive(false);
            olView.cancelAnimations();
            if (!!olView.setHint) {
                olView.setHint(ol.ViewHint.INTERACTING, -1);
            }
            else if (tf.js.GetIsArrayWithMinLength(olView.o, 2) && olView.o[1] > 0) {
                --olView.o[1];
            }
            olMap.getInteractions().remove(dragPan);
        }
    }

    function addDragPan() {
        var dragPan = getDragPan();
        if (!!dragPan) {
            dragPan.setActive(true);
        }
        if (!dragPan) {
            olMap.addInteraction(new ol.interaction.DragPan({ kinetic: new ol.Kinetic(-0.005, 0.05, 100), map: olMap }));
            olView.cancelAnimations();
            //olMap.on("moveend", onMoveEnd, theThis);
        }
    }

    (function actualConstructor(theMapThis) { theThis = theMapThis; initialize(); })(this);
};
