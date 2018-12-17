"use strict";

/**
 * Notifications sent by {@link tf.map.KeyedFeatureList} instances. Properties are available in notifications that require them
 * @public
 * @typedef {object} tf.types.KeyedFeatureListEventNotification
 * @property {tf.map.KeyedFeatureList} sender - the instance sending the notification
 * @property {tf.types.keyedFeatureListEventName} eventName - the name of the event
 * @property {enumerable<tf.map.KeyedFeature>} items - the associated keyed features
 * @property {enumerable<tf.types.Key>} keyes - the associated keys
*/

/**
 * A callback function that can be passed to the function {@link tf.map.KeyedFeatureList#AddListener} to start receiving keyed feature list event notifications
 * @public
 * @callback tf.types.KeyedFeatureListEventCallBack
 * @param {tf.types.KeyedFeatureListEventNotification} notification - the notification
 * @returns {void} - | {@link void} no return value
 */

/**
 * Settings used in the creation of [Keyed Feature List]{@link tf.map.KeyedFeatureList} instances
 * @public
 * @typedef {object} tf.types.KeyedFeatureListSettings
 * @property {tf.js.KeyedList} keyedList - the associated [Keyed List]{@link tf.js.KeyedList} instance
 * @property {string} layerName - the name of [Feature Layers]{@link tf.map.FeatureLayer} allowed to display the [Keyed Features]{@link tf.map.KeyedFeature} in this list. 
 * Defaults to the name of the associated [Keyed List]{@link tf.js.KeyedList} instance. Applications may define this property to override the default settings
 * @property {tf.types.PropertyName} propertyName - The name of the [Keyed Item]{@link tf.js.KeyedItem} property to be associated with [Keyed Features]{@link tf.map.KeyedFeature} in this list
 * Defaults to {@link tf.consts.KeyedFeatureProperty}. Applications must uniquely define this property if more than one [Keyed Feature List]{@link tf.map.KeyedFeatureList} will be associated with
 * the given <b>[keyedList]{@link tf.js.KeyedList}</b>
 * @property {tf.types.GetGeoJSONGeometryCallBack} getGeometryFromData - a callback capable of retrieving [GeoJSON Geometry]{@link tf.types.GeoJSONGeometry} from a keyed item's data,
 defaults to {@link tf.js.GetGeoJSONGeometryFrom}
 * @property {tf.types.NamedFeatureStyleSettings} featureStyleSettings - feature style settings
*/

/**
 * @public
 * @class
 * @summary Each instance of this class is associated with a single [Keyed List]{@link tf.js.KeyedList} instance and is responsible automating the creation, update,
 * and deletion of the [Keyed Features]{@link tf.map.KeyedFeature} corresponding to the [Keyed Items]{@link tf.js.KeyedItem} that are added, updated, and deleted from that list.
 * @param {tf.types.KeyedFeatureListSettings} settings - keyed feature list creation settings
 */
tf.map.KeyedFeatureList = function (settings) {

    var theThis, keyedList, keyedListName, featureStyleSettings, listMonitor, getGeometryFromData, layerName, propertyName, allEventDispatchers;

    /**
     * @public
     * @function
     * @summary - Adds a listener for the given event name
     * @param {tf.types.keyedFeatureListEventName} eventName - the name of the event
     * @param {tf.types.KeyedFeatureListEventCallBack} callBack - the callback for event notifications
     * @returns {tf.events.EventListener} - | {@link tf.events.EventListener} the event listener
    */
    this.AddListener = function (eventName, callbackFunction) { return allEventDispatchers.AddListener(eventName, callbackFunction); }

    /**
     * @public
     * @function
     * @summary - Adds one or more listeners for the given event names
     * @param {tf.types.EventNamesAndCallBacks} eventNamesAndCallBacks - the event names and callbacks
     * @returns {tf.types.EventNamesAndListeners} - | {@link tf.types.EventNamesAndListeners} the event names and listeners
    */
    this.AddListeners = function (eventNamesAndCallBacks) { return allEventDispatchers.AddListeners(eventNamesAndCallBacks); }

    /**
     * @public
     * @function
     * @summary - Sends the given <b>callBack</b> a [Features Added Event]{@link tf.consts.keyedFeaturesAddedEvent} with all keyed features currently in this keyed feature list
     * @param {tf.types.KeyedFeatureListEventCallBack} callBack - the callback
     * @returns {void} - | {@link void} no return value
    */
    this.NotifyFeaturesAdded = function (callBack) { if (tf.js.GetFunctionOrNull(callBack)) { return notifyFeaturesAdded(); } }

    /**
     * @public
     * @function
     * @summary - Shows or hides all keyed features in this keyed feature list on the given map instance
     * @param {tf.map.Map} map - the map instance
     * @param {boolean} showOrHideBool - <b>true</b> to show the features, <b>false</b> to hide them
     * @param {string} styleName - optional feature style name
     * @returns {void} - | {@link void} no return value
    */
    this.ShowAllOnMap = function (map, showOrHideBool, styleName) { return showAllOnMap(map, showOrHideBool, styleName); }

    /**
     * @public
     * @function
     * @summary - Shows or hides some keyed features in this keyed feature list on the given map instance
     * @param {tf.map.Map} map - the map instance
     * @param {enumerable} keyList - an enumerable containing the keys of the features to be shown or hidden
     * @param {boolean} showOrHideBool - <b>true</b> to show the features, <b>false</b> to hide them
     * @param {string} styleName - optional feature style name
     * @returns {void} - | {@link void} no return value
    */
    this.ShowSomeOnMap = function (map, keyList, showOrHideBool, styleName) { return showSomeOnMap(map, keyList, showOrHideBool, styleName); }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Keyed List]{@link tf.js.KeyedList} instance associated with this keyed feature list
     * @returns {tf.js.KeyedList} - | {@link tf.js.KeyedList} the keyed list instance
    */
    this.GetKeyedList = function () { return keyedList; }

    /**
     * @public
     * @function
     * @summary - Retrieves the name of the [Keyed List]{@link tf.js.KeyedList} instance associated with this keyed feature list
     * @returns {string} - | {@link string} the name
    */
    this.GetKeyedListName = function () { return keyedListName; }

    /**
     * @public
     * @function
     * @summary - Retrieves the name of [Feature Layers]{@link tf.map.FeatureLayer} allowed to display the [Keyed Features]{@link tf.map.KeyedFeature} in this keyed feature list
     * @returns {string} - | {@link string} the name
    */
    this.GetLayerName = function () { return layerName; }

    /**
     * @public
     * @function
     * @summary - Retrieves the name of the [Keyed Item]{@link tf.js.KeyedItem} property that is associated with [Keyed Features]{@link tf.map.KeyedFeature} in this keyed list
     * @returns {tf.types.PropertyName} - | {@link tf.types.PropertyName} the name
    */
    this.GetPropertyName = function () { return propertyName; }

    /**
     * method tf.map.KeyedFeatureList.GetPointFeaturesCloseTo - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
     * @param {?} coords - parameter description?
     * @param {?} radiusInMeters - parameter description?
     * @param {?} sortBool - parameter description?
    */
    this.GetPointFeaturesCloseTo = function (coords, radiusInMeters, sortBool) { return getPointFeaturesCloseTo(coords, radiusInMeters, sortBool); }

    /**
     * @public
     * @function
     * @summary - Forces the re-creation of one or more of the keyed feature's named styles whose keyes are given
     * @param {enumerable} keyList - an enumerable containing the keys of the features whose styles are to be refreshed
     * @param {string | enumerable<string>} styleNameOrNames - the name of the style to refresh, or an enumerable of style names to refresh
     * @returns {void} - | {@link void} no return value
    */
    this.RefreshStyle = function (keyList, styleNameOrNames) { return refreshStyle(keyList, styleNameOrNames); }

    /**
     * @public
     * @function
     * @summary - Retrieves an {@link enumerable} of [Keyed Features]{@link tf.map.KeyedFeature} whose keyes are given
     * @param {enumerable} keyList - an enumerable containing the keys of the features to be retrieved
     * @returns {enumerable<tf.map.KeyedFeature>} - | {@link enumerable}<{@link tf.map.KeyedFeature}> the keyed features
    */
    this.GetFeatures = function (keyList) { return getFeatures(keyList); }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Keyed Feature]{@link tf.map.KeyedFeature} whose key is given, if one exists
     * @param {tf.types.Key} itemKey - the key
     * @returns {tf.map.KeyedFeature} - | {@link tf.map.KeyedFeature} the keyed feature or {@link void}
    */
    this.GetFeature = function (itemKey) { return getFeature(itemKey); }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Keyed Feature]{@link tf.map.KeyedFeature} associated with the given [Keyed Item]{@link tf.js.KeyedItem}, if one exists
     * @param {tf.js.KeyedItem} keyedItem - the keyed item
     * @returns {tf.map.KeyedFeature} - | {@link tf.map.KeyedFeature} the keyed feature or {@link void}
    */
    this.GetFeatureFromItem = function (keyedItem) { return getFeatureFromItem(keyedItem); }

    /**
     * @private
     * @function
     * @summary - Marks this instance for deletion
     * @returns {void} - | {@link void} no return value
    */
    this.OnDelete = function () { return onDelete(); }

    function compareDistances(obj1, obj2) { return obj1.distance < obj2.distance ? -1 : obj1.distance > obj2.distance ? 1 : 0; }

    function getPointFeaturesCloseTo(coords, radiusInMeters, sortBool) {
        var pointFeatureKeys = [];

        if (!!coords) {
            var keyedItemList = getKeyedItemList();

            if (!!keyedItemList) {
                var coordsUse = tf.js.GetMapCoordsFrom(coords);
                var radius = tf.js.GetFloatNumber(radiusInMeters, 1000);

                sortBool = !!sortBool;

                for (var i in keyedItemList) {
                    var keyedItem = keyedItemList[i];
                    var itemKey = keyedItem.GetKey();
                    var feature = getFeature(itemKey).GetMapFeature();

                    if (feature.GetIsPoint()) {
                        var featureCoords = feature.GetGeom().GetPointCoords();

                        if (!!featureCoords) {
                            var featureDistance = tf.units.GetDistanceInMetersBetweenMapCoords(featureCoords, coordsUse);
                            if (featureDistance <= radius) {
                                if (sortBool) {
                                    pointFeatureKeys.push({ itemKey: itemKey, distance: featureDistance });
                                }
                                else {
                                    pointFeatureKeys.push(itemKey);
                                }
                            }
                        }
                    }
                }

                if (sortBool && !!pointFeatureKeys.length) {
                    pointFeatureKeys.sort(compareDistances);

                    var itemKeys = [], itemDistances = [];

                    for (var i in pointFeatureKeys) {
                        itemKeys.push(pointFeatureKeys[i].itemKey);
                        itemDistances.push(pointFeatureKeys[i].distance);
                    }

                    pointFeatureKeys.sortedKeyesAndDistances = { itemKeys: itemKeys, itemDistances: itemDistances };
                }
            }
        }
        return pointFeatureKeys;
    }

    function showAllOnMap(map, showOrHideBool, styleNameForShow) {
        if (tf.js.GetIsMap(map)) { map.ShowAllKeyedFeatures(theThis, showOrHideBool, styleNameForShow); }
    }

    function showSomeOnMap(map, keyList, showOrHideBool, styleNameForShow) {
        if (tf.js.GetIsMap(map)) { map.ShowSomeKeyedFeatures(theThis, keyList, showOrHideBool, styleNameForShow); }
    }

    function refreshStyle(keyList, styleNameOrNames) {
        keyList = null;
        if (!tf.js.GetIsValidObject(keyList)) { keyList = keyedList.GetKeyList(); }
        for (var i in keyList) {
            var feature = getFeature(keyList[i]);

            if (!!feature) { feature.RefreshStyle(styleNameOrNames); }
        }
    }

    function onCreated(theList) {
        var onCreated = tf.js.GetFunctionOrNull(settings.onCreated);
        if (!!onCreated) { onCreated(theThis); }
    }

    function onDelete() {
        deleteAllFeatures();
        if (!!monitor) { monitor.OnDelete(); monitor = null; }
        coreList = backendList = timedRefreshList = keyedList = null;
    }

    function getFeatures(keyList) {
        var features = [];

        if (!keyList) { keyList = keyedList.GetKeyList(); }

        for (var i in keyList) {
            var key = keyList[i];
            var feature = getFeature(key);
            if (!!feature) { features.push(feature); }
        }
        return features;
    }

    function getFeature(itemKey) { return !!keyedList ? getFeatureFromItem(keyedList.GetItem(itemKey)) : null; }

    function getFeatureFromItem(keyedItem) { return tf.js.GetObjProperty(keyedItem, propertyName); }
    function setFeatureToItem(keyedItem, feature) { return tf.js.SetObjProperty(keyedItem, propertyName, feature); }
    function deleteFeatureFromItem(keyedItem) { var feature = getFeatureFromItem(keyedItem); if (!!feature) { feature.OnDelete(); setFeatureToItem(keyedItem, null); } }

    function createFeatureForItem(keyedItem) {
        /*if (keyedListName == "occupancy") {
            console.log(keyedListName);
        }*/
        var keyedFeature;
        setFeatureToItem(keyedItem, keyedFeature = new tf.map.KeyedFeature({
            featureList: theThis,
            keyedItem: keyedItem,
            getGeometryFromData: getGeometryFromData,
            styleSettings: featureStyleSettings
        }));
        return keyedFeature;
    }

    function getKeyedItemList() { return !!keyedList ? keyedList.GetKeyedItemList() : []; }
    function getKeyList() { return !!keyedList ? keyedList.GetKeyList() : []; }

    function deleteAllFeatures() {
        var keyedItemList = getKeyedItemList();
        var keyList = getKeyList();
        allFeatures.Notify(featuresDeletedListener, keyedItemList, keyList);
        for (var i in keyedItemList) { deleteFeatureFromItem(keyedItemList[i]); }
    }

    function onListDeleted(monitor) { deleteAllFeatures(); }

    function doNotification(eventName, notification) {
        allEventDispatchers.Notify(eventName, tf.js.ShallowMerge(notification, { sender: theThis, eventName: eventName }));
    }

    function doNotifyFeaturesAdded(items, keys) {
        doNotification(tf.consts.keyedFeaturesAddedEvent, { items: items, keys: keys });
    }

    function notifyFeaturesAdded() { if (!!keyedList) { doNotifyFeaturesAdded(keyedList.GetKeyedItemList(), keyedList.GetKeyList()); } }

    function objToArray(items) {
        if (!tf.js.GetIsArray(items)) {
            var localItems = [];
            for (var i in items) { localItems.push(items[i]); }
            items = localItems;
        }
        return items;
    }

    function onListItemsAdded(notification) {
        var items = objToArray(notification.items);
        var keys = objToArray(notification.keys);
        var addedItems = [], addedKeys = [];
        for (var i = items.length - 1 ; i >= 0; --i) {
            var item = items[i], key = keys[i];
            var itemFeature = createFeatureForItem(item);
            if (!!itemFeature.GetMapFeature()) { addedItems.push(item); addedKeys.push(key); }
            else { deleteFeatureFromItem(item); }
            //else { console.log('created deleted'); }
        }
        if (addedItems.length) { doNotifyFeaturesAdded(addedItems, addedKeys); }
    }

    function onListItemsUpdated(notification) {
        var items = objToArray(notification.items);
        var keys = objToArray(notification.keys);
        var updatedItems = [], updatedKeys = [];
        var addedItems = [], addedKeys = [];
        var delItems = [], delKeys = [];
        for (var i in items) {
            var item = items[i];
            var key = keys[i];
            var itemFeature = getFeatureFromItem(item);

            if (!!itemFeature) {
                var result = itemFeature.UpdateFromItem();
                if (result.updated) { updatedItems.push(item); updatedKeys.push(key); }
                else if (result.created) { addedItems.push(item); addedKeys.push(key); }
                else if (result.deleted) { delItems.push(item); delKeys.push(key); }
            }
            else {
                itemFeature = createFeatureForItem(item);
                if (!!itemFeature.GetMapFeature()) { addedItems.push(item); addedKeys.push(key); }
                else { deleteFeatureFromItem(item); }
            }
        }
        if (addedItems.length) { doNotification(tf.consts.keyedFeaturesAddedEvent, { items: addedItems, keys: addedKeys }); }
        if (updatedItems.length) { doNotification(tf.consts.keyedFeaturesUpdatedEvent, { items: updatedItems, keys: updatedKeys }); }
        if (delItems.length) { onListItemsDeleted({ items: delItems, keys: delKeys, sender: notification.sender }); }
    }

    function onListItemsDeleted(notification) {
        var items = notification.items;
        doNotification(tf.consts.keyedFeaturesDeletedEvent, { items: items, keys: notification.keys });
        for (var i in items) { deleteFeatureFromItem(items[i]); }
    }

    function initialize() {

        allEventDispatchers = new tf.events.MultiEventNotifier({ eventNames: tf.consts.allKeyedFeaturesEventNames });

        if (typeof settings === "object") {

            keyedList = settings.keyedList;

            if (!!keyedList && keyedList instanceof tf.js.KeyedList) {

                featureStyleSettings = tf.js.ShallowMerge(settings.featureStyleSettings);

                if (typeof featureStyleSettings.styles === "object") {
                    for (var style in featureStyleSettings.styles) {
                        var theStyle = featureStyleSettings.styles[style];
                        if (typeof theStyle === "object") {
                            theStyle.style = tf.map.GetOrCreateFeatureStyle(theStyle.style);
                            if (!!theStyle.hoverStyle) { theStyle.hoverStyle = tf.map.GetOrCreateFeatureStyle(theStyle.hoverStyle); }
                        }
                    }
                }
                else {
                    featureStyleSettings.style = tf.map.GetOrCreateFeatureStyle(featureStyleSettings.style, null);
                    if (!!featureStyleSettings.hoverStyle) {
                        featureStyleSettings.hoverStyle = tf.map.GetOrCreateFeatureStyle(featureStyleSettings.hoverStyle, null);
                    }
                }

                layerName = tf.js.GetNonEmptyString(settings.layerName, keyedListName = keyedList.GetName());
                propertyName = tf.js.GetNonEmptyString(settings.propertyName, tf.consts.KeyedFeatureProperty);
                getGeometryFromData = tf.js.GetGeoJSONGeometryFunctionFrom(settings.getGeometryFromData);

                var listeners = {};
                listeners[tf.consts.keyedListDeleteEvent] = onListDeleted;
                listeners[tf.consts.keyedListAddedItemsEvent] = onListItemsAdded;
                listeners[tf.consts.keyedListUpdatedItemsEvent] = onListItemsUpdated;
                listeners[tf.consts.keyedListDeletedItemsEvent] = onListItemsDeleted;
                listMonitor = keyedList.AddListeners(listeners);
                keyedList.NotifyItemsAdded(onListItemsAdded);
            }
        }

        setTimeout(onCreated, 10);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
