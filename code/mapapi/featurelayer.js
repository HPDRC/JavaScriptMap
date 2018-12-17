"use strict";

/**
 * Map level ranges used by {@link tf.types.mapLayer} instances to constrain layer visibility to the given range
 * @public
 * @typedef {object} tf.types.MinMaxLevels
 * @property {tf.types.mapLevel} minLevel the minimum level at which the layer instance is displayed
 * @property {tf.types.mapLevel} maxLevel the maximum level at which the layer instance is displayed
*/

/**
 * Settings used in the creation of [Feature Layer]{@link tf.map.FeatureLayer} instances
 * @private
 * @typedef {object} tf.types.FeatureLayerSettings
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
 * Notifications sent by {@link tf.map.FeatureLayer} instances. Properties are available in notifications that require them
 * @public
 * @typedef {object} tf.types.MapFeatureLayerEventNotification
 * @property {tf.map.FeatureLayer} sender - the instance sending the notification
 * @property {tf.types.mapFeatureLayerEventName} eventName - the name of the event
*/

/**
 * A callback function that can be passed to the function [Add Listener]{@link tf.map.FeatureLayer#AddListener} of a [Feature Layer]{@link tf.map.FeatureLayer} instance to start receiving event notifications from it
 * @public
 * @callback tf.types.MapFeatureLayerEventCallBack
 * @param {tf.types.MapFeatureLayerEventNotification} notification - the notification
 * @returns {void} - | {@link void} no return value
 */

/**
 * @public
 * @class
 * @summary Feature Layers group map features for display on the [TerraFly HTerraMap]{@link tf.map.Map}. 
 * Instances of this class are created by calling the function [AddFeatureLayer]{@link tf.map.Map#AddFeatureLayer} of a [Map]{@link tf.map.Map} instance
 * @param {tf.types.FeatureLayerSettings} settings - feature layer creation settings
 */
tf.map.FeatureLayer = function (settings)
{
    var debug;
    var theThis, tMap, olMap, strLayerName, strLayerDesc, notifyVisibilityChange, notifyDelFeatures, isVisible, isHidden, isForcedInvisible;
    var zIndex, opacity, olSourceVector, olClusterSource, olLayerVector;
    var featuresAddWithheld, featuresDelWithheld, styleCache, textFont, keyedFeatureList;
    var useClusters, clusterFeatureDistance, clusterStyle, clusterLabelStyle;
    var clustersIconFileName, clustersIconAnchor, clustersIconScale, showClusterCount;
    var allEventDispatchers;

    this.GetUsesClusters = function () { return useClusters; }
    this.SetUseClusters = function (bool) {
        if (useClusters != (bool = !!bool)) {
            useClusters = bool;
            var features = olSourceVector.getFeatures();
            createSourceVector();
            olSourceVector.addFeatures(features);
        }
    }

    /**
     * @public
     * @function
     * @summary - Adds a listener for the given map feature layer event name
     * @param {tf.types.mapFeatureLayerEventName} eventName - the name of the event
     * @param {tf.types.MapFeatureLayerEventCallBack} callBack - the callback for event notifications
     * @returns {tf.events.EventListener} - | {@link tf.events.EventListener} the event listener
    */
    this.AddListener = function (eventName, callBack) { return allEventDispatchers.AddListener(eventName, callBack); }

    /**
     * @public
     * @function
     * @summary - Retrieves the associated [Map]{@link tf.map.Map} instance
     * @returns {tf.map.Map} - | {@link tf.map.Map} the map instance
    */
    this.GetMap = function () { return tMap; }

    /**
     * @public
     * @function
     * @summary - Retrieves layer's name
     * @returns {string} - | {@link string} the name
    */
    this.GetName = function () { return strLayerName; }

    /**
     * @public
     * @function
     * @summary - Retrieves layer's description
     * @returns {string} - | {@link string} the description
    */
    this.GetDesc = function () { return strLayerDesc; }

    /**
     * @public
     * @function
     * @summary - Changes the layer's description
     * @param {string} newDescStr - the new description
     * @returns {void} - | {@link void} no return value
    */
    this.ChangeDescription = function (newDescStr) {
        if (tf.js.GetIsString(newDescStr)) { if (newDescStr != strLayerDesc) { strLayerDesc = newDescStr; doNotifyVisibilityChange(); } }
    }

    /**
     * @public
     * @function
     * @summary - Checks if the layer is hidden from the Layers Popup
     * @returns {boolean} - | {@link boolean} <b>true</b> if hidden, <b>false</b> otherwise
    */
    this.GetIsHidden = function () { return isHidden; }

    /**
     * @public
     * @function
     * @summary - Changes the layer's opacity
     * @param {tf.types.opacity01} opacity - the new opacity
     * @returns {void} - | {@link void} no return value
    */
    this.SetOpacity = function (opacity) { return setOpacity(opacity); }

    /**
     * @public
     * @function
     * @summary - Retrieves the layer's opacity
     * @returns {tf.types.opacity01} - | {@link tf.types.opacity01} the opacity
    */
    this.GetOpacity = function () { return getOpacity(); }

    /**
     * @public
     * @function
     * @summary - Changes the layer's zIndex
     * @param {number} zindex - the new zIndex
     * @returns {void} - | {@link void} no return value
    */
    this.SetZIndex = function (zindex) { return setZIndex(zindex); }

    /**
     * @public
     * @function
     * @summary - Retrieves the layer's zIndex
     * @returns {number} - | {@link number} the zIndex
    */
    this.GetZIndex = function () { return getZIndex(); }

    /**
     * @private
     * @function
     * @summary - Sets the minumum and maximum map levels at which this layer instance is displayed
     * @param {tf.types.mapLevel} minLevel the minimum level
     * @param {tf.types.mapLevel} maxLevel the maximum level
     * @returns {void} - | {@link void} no return value
    */
    this.SetMinMaxLevels = function (minLevel, maxLevel) { return setMinMaxLevels(minLevel, maxLevel); }

    this.SetIsForcedInvisible = function (bool) {
        if (isForcedInvisible != (bool = tf.js.GetBoolFromValue(bool))) {
            isForcedInvisible = bool;
            updateLayerVisibility();
        }
    }

    this.GetIsForcedInvisible = function () { return isForcedInvisible; }

    /**
     * @public
     * @function
     * @summary - Shows or hides the layer
     * @param {boolean} bool - <b>true</b> to show, <b>false</b> to hide
     * @returns {void} - | {@link void} no return value
    */
    this.SetVisible = function (bool) {
        if (isVisible != (bool = tf.js.GetBoolFromValue(bool))) {
            isVisible = bool;
            updateLayerVisibility();
            doNotifyVisibilityChange();
        }
    }

    /**
     * @public
     * @function
     * @summary - Checks if the layer is visible
     * @returns {boolean} - | {@link boolean} <b>true</b> if visible, <b>false</b> otherwise
    */
    this.GetIsVisible = function () { return /*olLayerVector.getVisible();*/ isVisible; }

    /**
     * @public
     * @function
     * @summary - Toggles layers's visibility state
     * @returns {void} - | {@link void} no return value
    */
    this.ToggleIsVisible = function () { return theThis.SetVisible(!isVisible); }

    /**
     * @public
     * @function
     * @summary - Adds all features that were withheld for group / bulk addition
     * @returns {void} - | {@link void} no return value
    */
    this.AddWithheldFeatures = function () {
        if (featuresAddWithheld.length) { olSourceVector.addFeatures(featuresAddWithheld); }
        featuresAddWithheld = [];
    }

    /**
     * @public
     * @function
     * @summary - Removes all features that were withheld for group / bulk removal
     * @returns {void} - | {@link void} no return value
    */
    this.DelWithheldFeatures = function () {
        if (featuresDelWithheld.length) {
            if (!!notifyDelFeatures) { notifyDelFeatures(featuresDelWithheld); }
            for (var i in featuresDelWithheld) {
                olSourceVector.removeFeature(featuresDelWithheld[i]);
            }
        }
        featuresDelWithheld = [];
    }

    /**
     * @public
     * @function
     * @summary - Adds one keyed feature to the layer
     * @param {tf.map.KeyedFeature} keyedFeature - the feature
     * @param {string} styleName - optional feature style name
     * @param {boolean} withHoldAddFeature - if <b>true</b> the feature is effectively added only when the function [AddWithheldFeatures]{@link tf.map.FeatureLayer#AddWithheldFeatures} 
     * is called, to improve performance when adding a large number of features in sequence. if <b>false</b> the feature is immediately added
     * @returns {void} - | {@link void} no return value
    */
    this.AddKeyedFeature = function (keyedFeature, styleName, withHoldAddFeature) { return addKeyedFeature(keyedFeature, styleName, withHoldAddFeature); }

    /**
     * @public
     * @function
     * @summary - Checks if the layer contains the given keyed feature
     * @param {tf.map.KeyedFeature} keyedFeature - the keyed feature
     * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
    */
    this.ContainsKeyedFeature = function (keyedFeature) { return containsKeyedFeature(keyedFeature); }

    /**
     * @public
     * @function
     * @summary - Removes one keyed feature from the layer
     * @param {tf.map.KeyedFeature} keyedFeature - the feature
     * @param {boolean} withHoldDelFeature - if <b>true</b> the feature is effectively deleted only when the function [DelWithheldFeatures]{@link tf.map.FeatureLayer#DelWithheldFeatures} 
     * is called, to improve performance when removing a large number of features in sequence. if <b>false</b> the feature is immediately removed
     * @returns {void} - | {@link void} no return value
    */
    this.DelKeyedFeature = function (keyedFeature, withHoldDelFeature) { return delKeyedFeature(keyedFeature, withHoldDelFeature); }

    /**
     * @public
     * @function
     * @summary - Adds one map feature to the layer
     * @param {tf.map.Feature} mapFeature - the feature
     * @param {boolean} withHoldAddFeature - if <b>true</b> the feature is effectively added only when the function [AddWithheldFeatures]{@link tf.map.FeatureLayer#AddWithheldFeatures} 
     * is called, to improve performance when adding a large number of features in sequence. if <b>false</b> the feature is immediately added
     * @returns {void} - | {@link void} no return value
    */
    this.AddMapFeature = function (mapFeature, withHoldAddFeature) { return addMapFeature(mapFeature, withHoldAddFeature); }

    /**
     * @public
     * @function
     * @summary - Removes one map feature from the layer
     * @param {tf.map.Feature} mapFeature - the feature
     * @param {boolean} withHoldDelFeature - if <b>true</b> the feature is effectively deleted only when the function [DelWithheldFeatures]{@link tf.map.FeatureLayer#DelWithheldFeatures} 
     * is called, to improve performance when removing a large number of features in sequence. if <b>false</b> the feature is immediately removed
     * @returns {void} - | {@link void} no return value
    */
    this.DelMapFeature = function (mapFeature, withholdDelFeature) { return delMapFeature(mapFeature, withholdDelFeature) }

    /**
     * @public
     * @function
     * @summary - Determines if the this layer contains the given feature
     * @param {tf.map.Feature} mapFeature - the feature
     * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
    */
    this.ContainsMapFeature = function (mapFeature) {
        return !!olSourceVector && tf.js.GetIsInstanceOf(mapFeature, tf.map.Feature) && !!olSourceVector.getFeatureById(mapFeature.getAPIFeature().getId());
    }

    /**
     * @public
     * @function
     * @summary - Removes all features from the layer
     * @returns {void} - | {@link void} no return value
    */
    this.RemoveAllFeatures = function () {
        if (!!notifyDelFeatures) { notifyDelFeatures(olSourceVector.getFeatures()) };
        keyedFeatureList = {};
        createSourceVector();
    }

    function updateLayerVisibility() { if (!!olLayerVector) { olLayerVector.setVisible(isVisible && !isForcedInvisible); } }

    function notifyListeners(eventName, extraAttributes) { allEventDispatchers.Notify(eventName, tf.js.ShallowMerge(extraAttributes, { sender: theThis, eventName: eventName })); }

    function doNotifyVisibilityChange() {
        if (!!notifyVisibilityChange) { notifyVisibilityChange.call(tMap, this); }
        notifyListeners(tf.consts.mapFeatureLayerVisibilityChangeEvent, { isVisible: isVisible });
    }

    function getOpacity() { return olLayerVector.getOpacity(); }

    function setOpacity(opacitySet) {
        opacitySet = tf.js.GetFloatNumberInRange(opacitySet, 0, 1, 1);
        if (opacity != opacitySet) {
            opacity = opacitySet;
            if (!!olLayerVector) { olLayerVector.setOpacity(opacity); }
        }
    }

    function getZIndex() { return zIndex; /*olLayerVector.getZIndex();*/ }

    function setZIndex(zIndexSet) {
        zIndexSet = tf.js.GetFloatNumber(zIndexSet, 0);
        if (zIndex != zIndexSet) {
            zIndex = zIndexSet;
            if (!!olLayerVector) { olLayerVector.setZIndex(zIndex); }
        }
    }

    function addMapFeature(mapFeature, withholdAddFeature) {
        if (!!mapFeature || mapFeature instanceof tf.map.Feature) {
            var APIFeature = mapFeature.getAPIFeature();
            if (!!withholdAddFeature) { featuresAddWithheld.push(APIFeature); } else { olSourceVector.addFeature(APIFeature); }
        }
    }

    function delMapFeature(mapFeature, withholdDelFeature) {
        if (mapFeature instanceof tf.map.Feature || (mapFeature !== undefined && tf.js.GetFunctionOrNull(mapFeature.getAPIFeature))) {
            var APIFeature = mapFeature.getAPIFeature();
            if (!!withholdDelFeature) { featuresDelWithheld.push(APIFeature); } else {
                if (!!notifyDelFeatures) { notifyDelFeatures(APIFeature); }
                olSourceVector.removeFeature(APIFeature);
            }
        }
    }

    function addKeyedFeature(keyedFeature, styleName, withHoldAddFeature) {
        if (keyedFeature instanceof tf.map.KeyedFeature) {
            var keyedFeatureKey = keyedFeature.GetFeatureKey();
            var listItem = keyedFeatureList[keyedFeatureKey];

            if (!listItem) {
                var mapFeature = keyedFeature.GetMapFeature(styleName);
                if (!!mapFeature) {
                    keyedFeatureList[keyedFeatureKey] = { keyedFeature: keyedFeature, styleName: styleName, mapFeature: mapFeature };
                    addMapFeature(mapFeature, withHoldAddFeature);
                }
            }
            /*else { tf.GetDebug().LogIfTest('adding double keyed!'); }*/
        }
    }

    function containsKeyedFeature(keyedFeature) {
        return keyedFeature instanceof tf.map.KeyedFeature && keyedFeatureList[keyedFeature.GetFeatureKey()] !== undefined;
    }

    function delKeyedFeature(keyedFeature, withHoldDelFeature) {
        if (keyedFeature instanceof tf.map.KeyedFeature) {
            var keyedFeatureKey = keyedFeature.GetFeatureKey();
            var listItem = keyedFeatureList[keyedFeatureKey];

            if (!!listItem) {
                //var styleName = listItem.styleName;
                var mapFeature = listItem.mapFeature;
                delete keyedFeatureList[keyedFeatureKey];
                //delMapFeature(keyedFeature.GetMapFeature(styleName), withHoldDelFeature);
                delMapFeature(mapFeature, withHoldDelFeature);
            }
            /*else { tf.GetDebug().LogIfTest('deleting unexisting key!'); }*/
        }
    }

    function removeFromOLMap() { if (olLayerVector) { olMap.removeLayer(olLayerVector); olLayerVector = null; } }

    function clusterStyleFunction(feature, resolution) {
        var features = feature.get('features');
        var size = features.length;
        var style = null;

        if (size == 1) {
            var props = features [0].getProperties();
            if (props != null) { var mapFeature = props.mapFeature; if (mapFeature) { style = mapFeature.getAPIStyle(); } }
        }

        if (!style) {

            style = styleCache[size];

            if (!style) {
                if (!!clusterStyle) {
                    if (!!clusterLabelStyle) {
                        clusterLabelStyle = tf.js.ShallowMerge(clusterLabelStyle, { label: size.toString() });
                        if (tf.js.GetIsArray(clusterStyle)) {
                            var allStyle = clusterStyle.slice(0); allStyle.push(clusterLabelStyle) ;
                            var clusterS = tf.map.GetOrCreateFeatureStyle(allStyle);
                            style = clusterS.getAPIStyle();
                        }
                        else {
                            var allStyle;
                            if (clusterStyle.style == undefined && clusterStyle.hoverStyle == undefined) {
                                allStyle = [clusterStyle, clusterLabelStyle];
                            }
                            else {
                                var cstyle = clusterStyle.style;
                                var choverStyle = !!clusterStyle.hoverStyle ? clusterStyle.hoverStyle : cstyle;
                                allStyle = {
                                    /*style: [cstyle, clusterLabelStyle],
                                    hoverStyle: [choverStyle, clusterLabelStyle]*/
                                    style: cstyle
                                };
                                allStyle = [cstyle, clusterLabelStyle];
                            }
                            var clusterS = tf.map.GetOrCreateFeatureStyle(allStyle);
                            style = clusterS.getAPIStyle();
                        }
                    }
                    else {
                        var clusterS = tf.map.GetOrCreateFeatureStyle(clusterStyle);
                        style = clusterS.getAPIStyle();
                    }
                }
                else { style = [new ol.style.Style({ zindex:100, text: new ol.style.Text({ text: size.toString(), font: textFont, fill: new ol.style.Fill({ color: '#000' }) }) })]; }

                styleCache[size] = style;
            }
        }
        return style;
    }

    this.SetClusterFeatureDistance = function (newDistance) {
        if (useClusters && !!olClusterSource && newDistance != clusterFeatureDistance) {
            olClusterSource.setDistance(clusterFeatureDistance = newDistance);
        }
    }

    function createSourceVector() {
        var newLayerVector = !olLayerVector;

        olSourceVector = new ol.source.Vector();

        if (useClusters) {

            (typeof clustersIconFileName === "string" && clustersIconFileName.length > 0) || (clustersIconFileName = null);

            olClusterSource = new ol.source.Cluster({ distance: clusterFeatureDistance, source: olSourceVector });

            if (newLayerVector) {
                olLayerVector = new ol.layer.Vector({
                    source: olClusterSource, visible: isVisible, style: clusterStyleFunction, zIndex: zIndex, opacity: opacity,// renderOrder: zIndex,
                    updateWhileAnimating: true, updateWhileInteracting: true
                });
            }
            else {
                olLayerVector.setStyle(clusterStyleFunction);
                olLayerVector.setSource(olClusterSource);
            }
        }
        else {
            if (newLayerVector) {
                olLayerVector = new ol.layer.Vector({
                    source: olSourceVector, visible: isVisible, zIndex: zIndex, opacity: opacity,// renderOrder: zIndex,
                    updateWhileAnimating: true, updateWhileInteracting: true
                });
            }
            else {
                olLayerVector.setSource(olSourceVector);
            }
        }

        if (newLayerVector) { olMap.addLayer(olLayerVector); }
    }

    function setMinMaxLevels(minLevel, maxLevel) {
        var minMaxLevels = tf.js.GetMinMaxLevelsFrom(minLevel, maxLevel);

        minLevel = minMaxLevels.minLevel;
        maxLevel = minMaxLevels.maxLevel;

        var minRes = tf.units.GetResolutionByLevel(minLevel);
        var maxRes = tf.units.GetResolutionByLevel(maxLevel);

        olLayerVector.setMinResolution(minRes);
        olLayerVector.setMaxResolution(maxRes);
    }

    this.SetClusterStyle = function (newClusterStyle) {
        if (useClusters) {
            styleCache = {};
            clusterStyle = newClusterStyle;
            olClusterSource.forEachFeature(function(feature) {
                var props = feature.getProperties();
                var mapFeature = props.mapFeature;
                if (mapFeature) {
                    mapFeature.RefreshStyle();
                }
            });
        }
    }

    function initialize() {

        zIndex = 0;
        opacity = 1;

        featuresAddWithheld = [];
        featuresDelWithheld = [];

        styleCache = {};

        keyedFeatureList = {};

        isForcedInvisible = false;

        allEventDispatchers = new tf.events.MultiEventNotifier({ eventNames: tf.consts.allMapFeatureLayerEventNames });

        textFont = tf.GetStyles().GetSubStyles().markerFontFamily;

        strLayerName = tf.js.GetNonEmptyString(settings.name, '');
        strLayerDesc = tf.js.GetNonEmptyString(settings.description, '');
        isVisible = tf.js.GetBoolFromValue(settings.isVisible, true);
        isHidden = tf.js.GetBoolFromValue(settings.isHidden, false);
        if (settings.zIndex !== undefined) { setZIndex(settings.zIndex); }
        if (settings.opacity !== undefined) { setOpacity(settings.opacity); }

        tMap = tf.js.GetMapFrom(settings.map);
        olMap = settings.olMap;
        notifyDelFeatures = tf.js.GetFunctionOrNull(settings.notifyDelFeatures);
        notifyVisibilityChange = tf.js.GetFunctionOrNull(settings.notifyVisibilityChange);

        useClusters = tf.js.GetBoolFromValue(settings.useClusters, false);
        clusterFeatureDistance = tf.js.GetIntNumberInRange(settings.clusterFeatureDistance, 5, 1000, 24);
        clusterStyle = tf.js.GetIsValidObject(settings.clusterStyle) ? settings.clusterStyle : null;
        clusterLabelStyle = tf.js.GetIsValidObject(settings.clusterLabelStyle) ? settings.clusterLabelStyle : null;

        if (tf.js.GetFunctionOrNull(settings.setDeleteCmdCallBack)) { settings.setDeleteCmdCallBack.call(tMap, theThis, removeFromOLMap); }

        createSourceVector();

        if (tf.js.GetIsValidObject(settings.minMaxLevels)) { setMinMaxLevels(settings.minMaxLevels.minLevel, settings.minMaxLevels.maxLevel); }
    }

    (function actualConstructor(theLayerThis) { theThis = theLayerThis; initialize(); })(this);
};