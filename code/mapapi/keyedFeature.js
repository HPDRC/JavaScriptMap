"use strict";

/**
 * Settings used in the creation of [Keyed Feature]{@link tf.map.KeyedFeature} instances
 * @public
 * @typedef {object} tf.types.KeyedFeatureSettings
 * @property {tf.map.KeyedFeatureList} featureList - the associated [Keyed Feature List]{@link tf.map.KeyedFeatureList} instance
 * @property {tf.js.KeyedItem} keyedItem - the associated [Keyed Item]{@link tf.js.KeyedItem} instance
 * @property {tf.types.GetGeoJSONGeometryCallBack} getGeometryFromData - a callback capable of retrieving [GeoJSON Geometry]{@link tf.types.GeoJSONGeometry} from the keyed item's data
 * @property {tf.types.NamedFeatureStyleSettings} styleSettings - style settings
*/

/**
 * @public
 * @class
 * @summary Keyed Map Features can be displayed in one or more [Feature Layers]{@link tf.map.FeatureLayer} of different [Maps]{@link tf.map.Map}.
 * Each instance of this class manages one instance of [Map Feature with Named Styles]{@link tf.map.FeatureWithNamedStyles} and is
 * uniquely associated with an instance of [Keyed Item]{@link tf.js.KeyedItem}.
 * Applications do not create Keyed Features directly, they are automatically created and deleted by their associated [Keyed Feature Lists]{@link tf.map.KeyedFeatureList}
 * @param {tf.types.KeyedFeatureSettings} settings - keyed feature creation settings
 */
tf.map.KeyedFeature = function (settings) {

    var theThis, debug, featureList, keyedItem, keyedItemKey, keyedListName, layerName, propertyName, mapFeature, styleSettings;
    var markerSettings, getGeometryFromData, isDeleted;

    /**
     * @public
     * @function
     * @summary - Retrieves the [Keyed Feature List]{@link tf.map.KeyedFeatureList} instance associated with this keyed feature instance
     * @returns {tf.map.KeyedFeatureList} - | {@link tf.map.KeyedFeatureList} the list instance
    */
    this.GetFeatureList = function () { return featureList; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Keyed Item]{@link tf.js.KeyedItem} instance associated with this keyed feature instance
     * @returns {tf.js.KeyedItem} - | {@link tf.js.KeyedItem} the item instance
    */
    this.GetKeyedItem = function () { return keyedItem; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Key]{@link tf.types.Key} of the [Keyed Item]{@link tf.js.KeyedItem} instance associated with this keyed feature instance
     * @returns {tf.types.Key} - | {@link tf.types.Key} the key
    */
    this.GetKeyedItemKey = function () { return keyedItemKey; }

    /**
     * @public
     * @function
     * @summary - Retrieves the name of the [Keyed List]{@link tf.js.KeyedList} containing the [Keyed Item]{@link tf.js.KeyedItem} instance associated with this keyed feature instance
     * @returns {string} - | {@link string} the name
    */
    this.GetKeyedListName = function () { return keyedListName; }

    /**
     * @public
     * @function
     * @summary - Retrieves the name of the [Feature Layer]{@link tf.map.FeatureLayer] instance where this keyed feature instance can be displayed
     * @returns {string} - | {@link string} the name
    */
    this.GetLayerName = function () { return layerName; }

    /**
     * @public
     * @function
     * @summary - Retrieves the name of the [Keyed Item]{@link tf.js.KeyedItem} instance property associated with this keyed feature instance
     * @returns {tf.types.PropertyName} - | {@link tf.types.PropertyName} the name
    */
    this.GetPropertyName = function () { return propertyName; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Key]{@link tf.types.Key} associated with this keyed feature instance
     * @returns {tf.types.Key} - | {@link tf.types.Key} the key
    */
    this.GetFeatureKey = function () { return keyedListName + ':' + propertyName + ':' + keyedItemKey; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Map Feature]{@link tf.map.Feature} associated with the given style name
     * @param {string} styleName - the name of the style
     * @returns {tf.map.Feature} - | {@link tf.map.Feature} the map feature
    */
    this.GetMapFeature = function (styleName) { return mapFeature ? mapFeature.GetMapFeature(styleName) : null; }

    this.GetGeom = function () { return mapFeature ? mapFeature.GetGeom() : undefined; }
    this.SetGeom = function (geom) { if (!!mapFeature) { mapFeature.SetGeom(geom); } }

    /**
     * @public
     * @function
     * @summary - Forces the re-creation of one or more of the feature's named styles
     * @param {string | enumerable<string>} styleNameOrNames - the name of the style to refresh, or an enumerable of style names to refresh
     * @returns {void} - | {@link void} no return value
    */
    this.RefreshStyle = function (styleNameOrNames) { if (mapFeature) { mapFeature.RefreshStyle(styleNameOrNames); } }

    this.RefreshGeom = function (styleNameOrNames) { if (mapFeature) { mapFeature.RefreshGeom(); } }

    this.SetIsAlwaysInHover = function (setBool, styleNameOrNames) { if (mapFeature) { mapFeature.SetIsAlwaysInHover(setBool, styleNameOrNames); } }

    /**
     * @public
     * @function
     * @summary - Checks if the type of geometry associated with this feature is "point"
     * @returns {boolean} - | {@link boolean} <b>true</b> if the geometry type is "point", <b>false</b> otherwise
    */
    this.GetIsPoint = function () { return mapFeature ? mapFeature.GetIsPoint() : false; }

    /**
     * @public
     * @function
     * @summary - Changes the map coordinates of a "point" feature
     * @param {tf.types.mapCoordinates} pointCoords - the feature coordinates
     * @returns {void} - | {@link void} no return value
    */
    this.SetPointCoords = function (pointCoords) { return mapFeature ?  mapFeature.SetPointCoords(pointCoords) : false; }

    /**
     * @public
     * @function
     * @summary - Retrieves the current coordinates of a "point" feature
     * @returns {tf.types.mapCoordinates} - | {@link tf.types.mapCoordinates} the coordinates
    */
    this.GetPointCoords = function () { return mapFeature ? mapFeature.GetPointCoords() : [0,0]; }

    this.GetExtent = function () { return mapFeature ? mapFeature.GetExtent() : undefined; }

    /**
     * @public
     * @function
     * @summary - Updates the map feature from its associated [Keyed Item]{@link tf.js.KeyedItem} instance, currently only the coordinates of point features are updated
     * @returns {void} - | {@link void} no return value
    */
    this.UpdateFromItem = function () { return updateFromItem(); }

    /**
     * @private
     * @function
     * @summary - Marks this instance for deletion
     * @returns {void} - | {@link void} no return value
    */
    this.OnDelete = function () { return onDelete(); }

    /**
     * @private
     * @function
     * @summary - Checks if this instance has been marker for deletion
     * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
    */
    this.IsDeleted = function () { return isDeleted; }

    function onDelete() {
        //if (!!debug) { debug.LogIfTest('deleting feature ' + makeFeatureDesc()); }
        mapFeature = null;
        keyedItem = null;
        isDeleted = true;
    }

    function makeFeatureDesc() { return '"' + layerName + ' ' + keyedItem.GetKey() + '"'; }

    function updateFromItem() {
        var updated = false, created = false, deleted = false;
        if (!isDeleted) {
            var itemData = keyedItem.GetData();

            if (!!itemData) {
                var geometry = getGeometryFromData(itemData);

                if (!!geometry) {

                    if (!mapFeature) {
                        created = createFromItem();
                    }
                    else {
                        if (mapFeature.GetIsPoint()) {
                            var nowCoords = mapFeature.GetPointCoords();
                            if (!!nowCoords) {
                                if (nowCoords[0] != geometry.coordinates[0] || nowCoords[1] != geometry.coordinates[1]) {
                                    mapFeature.SetPointCoords(geometry.coordinates);
                                    updated = true;
                                }
                            }
                        }
                        else {
                            var geom = new tf.map.FeatureGeom(geometry);
                            mapFeature.SetGeom(geom);
                            updated = true;
                        }
                    }
                }
                else {
                    if (!!mapFeature) {
                        deleted = true;
                    }
                }
            }
        } //else { console.log('here'); }
        return { updated: updated, deleted: deleted, created: created };
    }

    function resolveFeatureStyles (settings) {
        if (tf.js.GetIsValidObject(settings)) {
            if (tf.js.GetIsValidObject(settings.styles)) {
                for (var style in settings.styles) {
                    var theStyle = settings.styles[style];
                    if (tf.js.GetIsValidObject(theStyle)) {
                        theStyle.style = tf.map.GetOrCreateFeatureStyle(theStyle.style);
                        if (!!theStyle.hoverStyle) { theStyle.hoverStyle = tf.map.GetOrCreateFeatureStyle(theStyle.hoverStyle); }
                    }
                }
            }
            else {
                settings.style = tf.map.GetOrCreateFeatureStyle(settings.style);
                if (!!settings.hoverStyle) { settings.hoverStyle = tf.map.GetOrCreateFeatureStyle(settings.hoverStyle); }
            }
        }
        else { settings = {}; }
        return settings;
    }

    function createFromItem() {
        var itemData = keyedItem.GetData();

        mapFeature = null;

        if (!!itemData) {
            var geometry = getGeometryFromData(itemData);
            if (!!geometry) {
                styleSettings = resolveFeatureStyles(styleSettings);
                var mapFeatureGeom = new tf.map.FeatureGeom({ type: geometry.type, coordinates: geometry.coordinates, simplifyTolerance: styleSettings.simplifyTolerance });
                mapFeature = new tf.map.FeatureWithNamedStyles({ keyedFeature: theThis, geom: mapFeatureGeom, styleSettings: styleSettings });
            }
        }
        return mapFeature != null;
    }

    function initialize() {
        //debug = tf.GetDebug();
        isDeleted = false;
        featureList = settings.featureList;
        keyedItem = settings.keyedItem;
        keyedItemKey = keyedItem.GetKey();
        styleSettings = settings.styleSettings;
        if (!tf.js.GetIsValidObject(styleSettings)) { styleSettings = tf.helpers.CopyDefaultMapFeatureStyleSettings(); }
        if ((featureList instanceof tf.map.KeyedFeatureList) && (keyedItem instanceof tf.js.KeyedItem)) {
            if (!!(getGeometryFromData = tf.js.GetFunctionOrNull(settings.getGeometryFromData))) {
                keyedListName = keyedItem.GetList().GetName();
                layerName = featureList.GetLayerName();
                propertyName = featureList.GetPropertyName();
                if (!createFromItem()) {
                    //isDeleted = true;
                    //onDelete();
                }
            }
            else {
                featureList = keyedItem = styleSettings = null;
                isDeleted = true;
            }
        }
        else {
            featureList = keyedItem = styleSettings = null;
            isDeleted = true;
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
