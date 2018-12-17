"use strict";

/**
 * Settings used in the creation of [Map Feature]{@link tf.map.Feature} instances
 * @public
 * @typedef {object} tf.types.MapFeatureSettings
 * @property {tf.map.FeatureGeom} geom - a geometry instance to be associated with the map feature, if this property is not defined, then <b>type</b> and <b>coordinates</b> are mandatory
 * @property {tf.types.GeoJSONGeometryType} type - the map feature type, mandatory if <b>geom</b> is not defined
 * @property {tf.types.GeoJSONGeometryCoordinates} coordinates - the map feature coordinates, mandatory if <b>geom</b> is not defined
 * @property {tf.types.MapFeatureStyleLike} style - the map feature style
 * @property {tf.types.MapFeatureStyleLike} hoverStyle - the style assumed by the map feature when the mouse pointer is hovering over it
 * @property {tf.map.KeyedFeature} keyedFeature - the keyed feature instance associated with this map feature, if any
 * @property {tf.map.FeatureWithNamedStyles} mapFeatureWithNamedStyles - the map feature with named styles instance associated with this map feature, if any
 * @property {string} styleName - the style name, used by map features that are associated with instances of {@link tf.map.MapFeatureWithNamedStyles}
*/

tf.map.nextFeatureId = 0;

/**
 * @public
 * @class
 * @summary Map Features can be displayed in one or more [Feature Layers]{@link tf.map.FeatureLayer} of the same or different [Maps]{@link tf.map.Map} using a single geometry and set of styles 
 * @param {tf.types.MapFeatureSettings} settings - map feature creation settings
 */
tf.map.Feature = function (settings) {
    var theThis, mapFeatureStyle, mapFeatureNormalStyle, mapFeatureHoverStyle, mapFeatureGeom;
    var APIFeature, keyedFeature, mapFeatureWithNamedStyles, styleName;
    var onRollOverListener, onClickListener, onDoubleClickListener, onHoverInOutListener;
    var isInHover, alwaysInHover, processInHover, id;

    this.GetSettings = function () { return settings; }

    this.SetStyles = function (style, hoverStyle) {
        if (tf.js.GetIsInstanceOf(style, tf.map.FeatureStyle) && tf.js.GetIsInstanceOf(hoverStyle, tf.map.FeatureStyle)) {
            mapFeatureNormalStyle = style;
            mapFeatureHoverStyle = hoverStyle;
            theThis.RefreshStyle();
        }
    }

    /**
     * @public
     * @function
     * @summary - Changes the geometry of a feature
     * @param {tf.map.FeatureGeom} geom - the new geometry
     * @returns {void} - | {@link void} no return value
    */
    this.SetGeom = function (geom) {
        if (tf.js.GetIsInstanceOf(geom, tf.map.FeatureGeom) && ((!mapFeatureGeom) || (mapFeatureGeom.GetType() == geom.GetType()))) { mapFeatureGeom = geom; refreshGeom(); return true; } return false;
    }

    /**
     * @public
     * @function
     * @summary - Retrieves the geometry instance associated with this feature
     * @returns {tf.map.FeatureGeom} - | {@link tf.map.FeatureGeom} the geometry
    */
    this.GetGeom = function () { return mapFeatureGeom; }

    /**
     * @public
     * @function
     * @summary - Retrieves the style instance associated with this feature
     * @returns {tf.map.FeatureStyle} - | {@link tf.map.FeatureStyle} the style
    */
    this.GetStyle = function () { return mapFeatureStyle; }

    /**
     * @public
     * @function
     * @summary - Forces the re-creation of the feature geometry
     * @returns {void} - | {@link void} no return value
    */
    this.RefreshGeom = function () { return refreshGeom(); }

    /**
     * @public
     * @function
     * @summary - Forces the re-creation of the feature style
     * @returns {void} - | {@link void} no return value
    */
    this.RefreshStyle = function () { return refreshStyle(); }

    /**
     * @public
     * @function
     * @summary - Changes the features's style
     * @param {tf.types.MapFeatureStyleLike} strStyleOrObj - map feature style settings
     * @returns {void} - | {@link void} no return value
    */
    this.ChangeStyle = function (strStyleOrObj) { return changeStyle(strStyleOrObj); }

    /**
     * @public
     * @function
     * @summary - Checks if the type of geometry associated with this feature is "point"
     * @returns {boolean} - | {@link boolean} <b>true</b> if the geometry type is "point", <b>false</b> otherwise
    */
     this.GetIsPoint = function () { return !!mapFeatureGeom ? mapFeatureGeom.GetIsPoint() : false; }

    /**
     * @public
     * @function
     * @summary - Changes the map coordinates of a "point" feature
     * @param {tf.types.mapCoordinates} pointCoords - the feature coordinates
     * @returns {void} - | {@link void} no return value
    */
     this.SetPointCoords = function (pointCoords) { if (!!mapFeatureGeom && mapFeatureGeom.SetPointCoords(pointCoords)) { refreshGeom(); return true; } return false; }

    /**
     * @public
     * @function
     * @summary - Retrieves the current coordinates of a "point" feature
     * @returns {tf.types.mapCoordinates} - | {@link tf.types.mapCoordinates} the coordinates
    */
     this.GetPointCoords = function () { return theThis.GetIsPoint() ? mapFeatureGeom.GetPointCoords() : theThis.GetMidExtentCoords(); }

     this.GetMidExtentCoords = function () { return tf.js.GetMidExtentCoord(theThis.GetExtent()); }

     this.GetExtent = function () { return !!mapFeatureGeom ? mapFeatureGeom.GetExtent() : undefined; }

     this.GetClosestPoint = function (pointCoords) { return !!mapFeatureGeom ? mapFeatureGeom.GetClosestPoint(pointCoords) : undefined; }

    /**
     * @public
     * @function
     * @summary - Sets a listener for {@link tf.consts.mapFeatureHoverInOutEvent} map events associated with this feature, replacing the previous listener, if any
     * @param {tf.types.MapEventCallBack} callBack - the callback for event notifications
     * @returns {void} - | {@link void} no return value
    */
     this.SetOnHoverInOutListener = function (callBack) { onHoverInOutListener = tf.js.GetFunctionOrNull(callBack); }

    /**
     * @public
     * @function
     * @summary - Sets a listener for {@link tf.consts.mapFeatureMouseMoveEvent} map events associated with this feature, replacing the previous listener, if any
     * @param {tf.types.MapEventCallBack} callBack - the callback for event notifications
     * @returns {void} - | {@link void} no return value
    */
     this.SetOnMouseMoveListener = function (callbackFunction) { onRollOverListener = tf.js.GetFunctionOrNull(callbackFunction); }

    /**
     * @public
     * @function
     * @summary - Sets a listener for {@link tf.consts.mapFeatureClickEvent} map events associated with this feature, replacing the previous listener, if any
     * @param {tf.types.MapEventCallBack} callBack - the callback for event notifications
     * @returns {void} - | {@link void} no return value
    */
     this.SetOnClickListener = function (callbackFunction) { onClickListener = tf.js.GetFunctionOrNull(callbackFunction); }

    /**
     * @public
     * @function
     * @summary - Sets a listener for {@link tf.consts.mapFeatureDblClickEvent} map events associated with this feature, replacing the previous listener, if any
     * @param {tf.types.MapEventCallBack} callBack - the callback for event notifications
     * @returns {void} - | {@link void} no return value
    */
     this.SetOnDoubleClickListener = function (callbackFunction) { onDoubleClickListener = tf.js.GetFunctionOrNull(callbackFunction); }

    /**
     * @public
     * @function
     * @summary - Checks if the feature is currently being hovered over
     * @returns {boolean} - | {@link boolean} <b>true</b> if the feature is being hovered over, <b>false</b> otherwise
    */
     this.GetIsInHover = function () { return isInHover; }

     this.GetIsAlwaysInHover = function () { return alwaysInHover; }
     this.SetIsAlwaysInHover = function (bool) { if (alwaysInHover != (bool = !!bool)) { alwaysInHover = bool; setHoverNonHoverStyle() }; }

     this.GetIsDisplayingInHover = function () { return isInHover || alwaysInHover; }

     this.GetProcessInHover = function () { return processInHover; }
     this.SetProcessInHover = function (bool) { if (processInHover != (bool = !!bool)) { processInHover = bool; setHoverNonHoverStyle() }; }

    /**
     * @public
     * @function
     * @summary - Retrieves the keyed feature instance associated with this map feature, if any
     * @returns {tf.map.KeyedFeature} - | {@link tf.map.KeyedFeature} the keyed feature
    */
     this.GetKeyedFeature = function () { return keyedFeature; }

    /**
     * @public
     * @function
     * @summary - Retrieves the map feature with named styles instance associated with this map feature, if any
     * @returns {tf.map.FeatureWithNamedStyles} - | {@link tf.map.FeatureWithNamedStyles} the map feature with named styles instance
    */
     this.GetMapFeatureWithNamedStyles = function () { return mapFeatureWithNamedStyles; }

    /**
     * @public
     * @function
     * @summary - Receives {@link tf.consts.mapFeatureHoverInOutEvent} event notifications from maps, notifies a listener, if one is set
     * @param {tf.types.MapEventNotification} notification - the notification
     * @returns {void} - | {@link void} no return value
    */
     this.onHoverInOut = function (notification) { return onHoverInOut(notification); }

    /**
     * @public
     * @function
     * @summary - Receives {@link tf.consts.mapFeatureMouseMoveEvent} event notifications from maps, notifies a listener, if one is set
     * @param {tf.types.MapEventNotification} notification - the notification
     * @returns {void} - | {@link void} no return value
    */
     this.onMouseMove = function (notification) { return notifyListener(onRollOverListener, notification); }

    /**
     * @public
     * @function
     * @summary - Receives {@link tf.consts.mapFeatureClickEvent} event notifications from maps, notifies a listener, if one is set
     * @param {tf.types.MapEventNotification} notification - the notification
     * @returns {void} - | {@link void} no return value
    */
     this.onClick = function (notification) { return notifyListener(onClickListener, notification); }

    /**
     * @public
     * @function
     * @summary - Receives {@link tf.consts.mapFeatureDblClickEvent} event notifications from maps, notifies a listener, if one is set
     * @param {tf.types.MapEventNotification} notification - the notification
     * @returns {void} - | {@link void} no return value
    */
     this.onDoubleClick = function (notification) { return notifyListener(onDoubleClickListener, notification); }

    /**
     * @private
     * @function
     * @summary - Returns underlying map engine object associated with this feature's geometry
     * @returns {ol.Feature} - | the map engine object
    */
     this.getAPIFeature = function () { return APIFeature; }

    /**
     * @private
     * @function
     * @summary - Returns underlying map engine object associated with this feature's style
     * @returns {ol.Style} - | the map engine object
    */
     this.getAPIStyle = function () { return getAPIStyle(); }

    /**
     * @private
     * @function
     * @summary - Returns the style name set when this instance was created
     * @returns {string} - | {@link string} the style name
    */
     this.getStyleName = function () { return styleName; }

     function notifyListener(theListener, notification) { if (!!theListener) { theListener(notification); } }

     function setHoverNonHoverStyle() {
         var useHover = (!!processInHover && !!isInHover) || alwaysInHover;
         mapFeatureStyle = !!useHover ? mapFeatureHoverStyle : mapFeatureNormalStyle;
         refreshStyle();
     }

    function onHoverInOut(notification) {
        isInHover = notification.isInHover;
        if (!!mapFeatureHoverStyle) { setHoverNonHoverStyle(); }
        notifyListener(onHoverInOutListener, notification);
    }

    function styleFunction (feature, resolution) {
        var APIStyle;

        if (feature instanceof ol.feature) {
            var mapFeature = feature.getProperties().mapFeature;
            if (mapFeature) { APIStyle = null; }
        }

        return APIStyle;
    }

    function doGetAPIStyle(fromFeatureStyle) {
        var APIStyle = null;

        if (fromFeatureStyle instanceof tf.map.FeatureStyle) { APIStyle = fromFeatureStyle.getAPIStyle(); }
        else if (typeof fromFeatureStyle === "function") {
            var obj = !!keyedFeature ? keyedFeature : theThis;
            var style = tf.map.GetOrCreateFeatureStyle(fromFeatureStyle(obj, theThis));
            APIStyle = style instanceof (tf.map.FeatureStyle) ? style.getAPIStyle() : null ;
        }
        return APIStyle;
    }

    function getAPIStyle() { return doGetAPIStyle(mapFeatureStyle); }

    function refreshGeom() {
        if (!!APIFeature) {
            //APIFeature.setGeometry(null);
            APIFeature.setGeometry(mapFeatureGeom.getAPIGeom());
        }
    }

    function refreshStyle() {
        if (!!APIFeature) {
            //APIFeature.setStyle(null);
            //APIFeature.setStyle(mapFeatureStyle.getAPIStyle());
            APIFeature.setStyle(getAPIStyle());
        }
    }
    function refreshFeature() { refreshGeom(); refreshStyle(); }

    function changeStyle(strStyleOrObj) {
        if (strStyleOrObj instanceof tf.map.FeatureStyle) {
            mapFeatureStyle = strStyleOrObj;
            refreshStyle();
        }
        else if (mapFeatureStyle instanceof tf.map.FeatureStyle) {
            mapFeatureStyle.UpdateAttributesFrom(strStyleOrObj);
            refreshStyle();
        }
    }

    function updateAPIFeature() {
        APIFeature = new ol.Feature({ mapFeature: theThis });
        APIFeature.setId(id);
        refreshFeature();
    }

    function initialize() {
        isInHover = false;
        alwaysInHover = false;
        processInHover = true;
        id = ++tf.map.nextFeatureId;
        keyedFeature = settings.keyedFeature;
        mapFeatureWithNamedStyles = settings.mapFeatureWithNamedStyles instanceof tf.map.FeatureWithNamedStyles ? settings.mapFeatureWithNamedStyles : null;
        mapFeatureNormalStyle = mapFeatureStyle = tf.map.GetOrCreateFeatureStyle(settings.style);
        mapFeatureHoverStyle = !!settings.hoverStyle ? tf.map.GetOrCreateFeatureStyle(settings.hoverStyle) : null;
        mapFeatureGeom = settings.geom instanceof tf.map.FeatureGeom ? settings.geom : new tf.map.FeatureGeom({ type: settings.type, coordinates: settings.coordinates });
        styleName = tf.js.GetNonEmptyString(settings.styleName, "");
        updateAPIFeature();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * Settings used in the creation of [Map Feature]{@link tf.map.Feature} instances
 * @public
 * @typedef {object} tf.types.MapFeatureWithNamedStylesSettings
 * @property {tf.map.FeatureGeom} geom - a geometry instance to be associated with the map feature, if this property is not defined, then <b>type</b> and <b>coordinates</b> are mandatory
 * @property {tf.types.GeoJSONGeometryType} type - the map feature type, mandatory if <b>geom</b> is not defined
 * @property {tf.types.GeoJSONGeometryCoordinates} coordinates - the map feature coordinates, mandatory if <b>geom</b> is not defined
 * @property {tf.types.NamedFeatureStyleSettings} styleSettings - style settings
 * @property {tf.map.KeyedFeature} keyedFeature - the keyed feature instance associated with this map feature, if any
*/

/**
 * @public
 * @class
 * @summary Map Features with Named Styles can be displayed in one or more [Feature Layers]{@link tf.map.FeatureLayer} of the same or different [Maps]{@link tf.map.Map}. 
 * Each instance of this class manages one or more instances of [Map Feature]{@link tf.map.Feature}, all sharing the same geometry instance, and each with a different set of named styles 
 * @param {tf.types.MapFeatureWithNamedStylesSettings} settings - map feature creation settings
 */
tf.map.FeatureWithNamedStyles = function (settings) {
    var theThis, keyedFeature, mapFeatures, mapFeatureGeom;

    /**
     * @public
     * @function
     * @summary - Retrieves the geometry instance associated with this feature
     * @returns {tf.map.FeatureGeom} - | {@link tf.map.FeatureGeom} the geometry
    */
    this.GetGeom = function () { return mapFeatureGeom; }

    this.SetGeom = function (geom) {
        if (tf.js.GetIsInstanceOf(geom, tf.map.FeatureGeom) && ((!mapFeatureGeom) || (mapFeatureGeom.GetType() == geom.GetType()))) {
            mapFeatureGeom = geom;
            for (var i in mapFeatures) { mapFeatures[i].SetGeom(geom); }
            return true;
        }
        return false;
    }


    this.GetExtent = function () { return !!mapFeatureGeom ? mapFeatureGeom.GetExtent() : undefined; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Map Feature]{@link tf.map.Feature} associated with the given style name
     * @param {string} styleName - the name of the style
     * @returns {tf.map.Feature} - | {@link tf.map.Feature} the map feature
    */
    this.GetMapFeature = function (styleName) { return getMapFeature(styleName); }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Map Feature Style]{@link tf.map.FeatureStyle} associated with the given style name
     * @param {string} styleName - the name of the style
     * @returns {tf.map.FeatureStyle} - | {@link tf.map.FeatureStyle} the map feature style
    */
    this.GetStyle = function (styleName) { return getMapFeatureStyle(styleName).GetStyle(); }

    /**
     * @public
     * @function
     * @summary - Forces the re-creation of one or more of the feature's named styles
     * @param {string | enumerable<string>} styleNameOrNames - the name of the style to refresh, or an enumerable of style names to refresh
     * @returns {void} - | {@link void} no return value
    */
    this.RefreshStyle = function (styleNameOrNames) { return refreshStyle(styleNameOrNames); }

    this.RefreshGeom = function () { for (var i in mapFeatures) { mapFeatures[i].RefreshGeom(); } }

    this.SetIsAlwaysInHover = function (setBool, styleNameOrNames) { return setIsAlwaysInHover(setBool, styleNameOrNames); }

    /**
     * @public
     * @function
     * @summary - Checks if the type of geometry associated with this map feature is "point"
     * @returns {boolean} - | {@link boolean} <b>true</b> if the geometry type is "point", <b>false</b> otherwise
    */
    this.GetIsPoint = function () { return !!mapFeatureGeom ? mapFeatureGeom.GetIsPoint() : false; }

    /**
     * @public
     * @function
     * @summary - Changes the map coordinates of a "point" feature
     * @param {tf.types.mapCoordinates} pointCoords - the feature coordinates
     * @returns {void} - | {@link void} no return value
    */
    this.SetPointCoords = function (pointCoords) { return setPointCoords(pointCoords); }

    /**
     * @public
     * @function
     * @summary - Retrieves the current coordinates of a "point" feature
     * @returns {tf.types.mapCoordinates} - | {@link tf.types.mapCoordinates} the coordinates
    */
    this.GetPointCoords = function () { return !!mapFeatureGeom ? mapFeatureGeom.GetPointCoords() : [0,0]; }

    this.GetClosestPoint = function (pointCoords) { return !!mapFeatureGeom ? mapFeatureGeom.GetClosestPoint(pointCoords) : undefined; }

    /**
     * @public
     * @function
     * @summary - Retrieves the keyed feature instance associated with this map feature, if any
     * @returns {tf.map.KeyedFeature} - | {@link tf.map.KeyedFeature} the keyed feature
    */
    this.GetKeyedFeature = function () { return keyedFeature; }

    /**
     * @private
     * @function
     * @summary - Returns underlying map engine object associated with feature of the given style name
     * @param {string} styleName - the name of the style
     * @returns {ol.Feature} - | the map engine object
    */
    this.getAPIFeature = function (styleName) { return getMapFeature(styleName).getAPIFeature(); }

    /**
     * @private
     * @function
     * @summary - Returns underlying map engine object associated with feature of the given style name
     * @param {string} styleName - the name of the style
     * @returns {ol.Style} - | the map engine object
    */
    this.getAPIStyle = function (styleName) { return getMapFeature(styleName).getAPIStyle(); }

    function getMapFeature(styleName) {
        if (!styleName || !tf.js.GetIsNonEmptyString (styleName) || !mapFeatures[styleName]) {
            styleName = tf.consts.defaultMapFeatureStyleName;
        }
        return mapFeatures[styleName];
    }

    function setPointCoords(pointCoords) {
        if (!!mapFeatureGeom) {
            if (mapFeatureGeom.SetPointCoords(pointCoords)) {
                for (var i in mapFeatures) { mapFeatures[i].RefreshGeom(); }
            }
        }
    }

    function getMapFeatureStyle(styleName) { var mapFeature = getMapFeature(styleName); return mapFeature ? mapFeature.GetStyle() : null; }

    function doSetIsAlwaysInHover(setBool, styleName) { var mapFeature = getMapFeature(styleName); if (mapFeature) { mapFeature.SetIsAlwaysInHover(setBool); } }

    function setIsAlwaysInHover(setBool, styleNameOrNames) {
        if (tf.js.GetIsArray(styleNameOrNames)) {
            for (var i in styleNameOrNames) { doSetIsAlwaysInHover(setBool, styleNameOrNames[i]); }
        }
        else {
            if (styleNameOrNames == undefined) { for (var i in mapFeatures) { doSetIsAlwaysInHover(setBool, i); } }
            else { doSetIsAlwaysInHover(setBool, styleNameOrNames); }
        }
    }

    function doRefreshStyle(styleName) { var mapFeature = getMapFeature(styleName); return mapFeature ? mapFeature.RefreshStyle() : false; }

    function refreshStyle(styleNameOrNames) {
        var refreshed = false;
        if (tf.js.GetIsArray(styleNameOrNames)) {
            for (var i in styleNameOrNames) { refreshed = doRefreshStyle(styleNameOrNames[i]) || refreshed; }
        }
        else {
            if (styleNameOrNames == undefined) { for (var i in mapFeatures) { refreshed = doRefreshStyle(i) || refreshed; } }
            else { refreshed = doRefreshStyle(styleNameOrNames); }
        }
        return refreshed;
    }

    function initialize() {

        keyedFeature = settings.keyedFeature instanceof tf.map.KeyedFeature ? settings.keyedFeature : null;
        mapFeatureGeom = settings.geom instanceof tf.map.FeatureGeom ? settings.geom : new tf.map.FeatureGeom({ type: settings.type, coordinates: settings.coordinates });

        var propagateSettings = tf.js.ShallowMerge(settings, { geom: mapFeatureGeom, mapFeatureWithNamedStyles: theThis });

        settings = tf.js.GetValidObjectFrom(settings);

        var styleSettings = tf.js.GetValidObjectFrom(settings.styleSettings);

        if (tf.js.GetIsValidObject(styleSettings.styles)) {
            var firstFeature = null;
            var styles = styleSettings.styles;

            mapFeatures = {};

            for (var styleName in styles) {
                var theStyle = styles[styleName];
                if (typeof theStyle === "object") {
                    propagateSettings.style = tf.map.GetOrCreateFeatureStyle (theStyle.style);
                    propagateSettings.hoverStyle = tf.map.GetOrCreateFeatureStyle(theStyle.hoverStyle);
                    propagateSettings.styleName = styleName;

                    var thisFeature = new tf.map.Feature(propagateSettings);

                    mapFeatures[styleName] = thisFeature;
                    if (!firstFeature) { firstFeature = thisFeature; }
                }
            }

            if (!!firstFeature) {
                if (mapFeatures[tf.consts.defaultMapFeatureStyleName] === undefined) {
                    mapFeatures[tf.consts.defaultMapFeatureStyleName] = firstFeature;
                }
            }
            else {
                mapFeatures = null;
            }
        }
        else {
            propagateSettings.style = styleSettings.style;
            propagateSettings.hoverStyle = styleSettings.hoverStyle;
        }

        if (!mapFeatures) {
            propagateSettings.styleName = tf.consts.defaultMapFeatureStyleName;
            mapFeatures = {};
            mapFeatures[tf.consts.defaultMapFeatureStyleName] = new tf.map.Feature(propagateSettings);
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
