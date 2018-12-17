"use strict";

/**
 * A {@link string} that uniquely identifies a JavaScript {@link object} within a collection of JavaScript [objects]{@link object}
 * @public
 * @typedef {string} tf.types.Key
 */

/**
 * A callback function that can be passed in the creation of [Keyed List]{@link tf.js.KeyedList} instances to selectively prevent data items from being added to that list.<br>
 * This callback can also be used selectively alter the contents of data retrieved from remote services before it is incorporated into a [Keyed Item]{@link tf.js.KeyedItem}
 * @public
 * @callback tf.types.FilterAddItem
 * @param {object} itemData - the candidate data object, which this callback is allowed to alter
 * @returns {boolean} - | {@link boolean} <b>true</b> if the item data can be added to the list, <b>false</b> otherwise
 */

/**
 * An object passed to {@link tf.types.NeedsUpdateItemData} callbacks containing the current data object associated with a [Keyed Item]{@link tf.js.KeyedItem} and a new data item to replace it
 * @public
 * @typedef {object} tf.types.NeedsUpdateItemDataObject
 * @property {object} itemData - the data object currently associated with the keyed item instance
 * @property {object} itemDataSet - the candidate new data object
 */

/**
 * A callback function that can be passed in the creation of [Keyed Item]{@link tf.js.KeyedItem} instances to determine if the instance's data needs 
 * to be updated from a new data object. Use this callback to compare freshly retrieved data from a remote service with the data currently stored
 * in the instance, and prevent unnecessary update notifications if the data has not changed
 * @public
 * @callback tf.types.NeedsUpdateItemData
 * @param {tf.types.NeedsUpdateItemDataObject} updateObj - contains the data object currently associated with the keyed item instance and the candidate new data object
 * @returns {boolean} - | {@link boolean} <b>true</b> if an update is needed, <b>false</b> otherwise
 */

/**
 * A callback function that must be provided in the creation of [Keyed List]{@link tf.js.KeyedList} instances to extract [Keys]{@link tf.types.Key} from the type of [data objects]{@link object} 
 * that are associated with the [Keyed Items]{@link tf.js.KeyedItem} in the list
 * @public
 * @callback tf.types.GetKeyFromData
 * @param {object} data - an object of the type stored by the [Keyed Items]{@link tf.js.KeyedItem} in the list
 * @returns {tf.types.Key} - | {@link tf.types.Key} the key extracted from <b>data</b>, or {@link void} if a key could not be extracted
 */

/**
 * Settings used in the creation of [Keyed Item]{@link tf.js.KeyedItem} instances
 * @public
 * @typedef {object} tf.types.KeyedItemSettings
 * @property {tf.js.KeyedList} list - the associated [Keyed List]{@link tf.js.KeyedList} instance
 * @property {tf.types.Key} key - the key
 * @property {object} itemData - the data
 * @property {tf.types.NeedsUpdateItemData} needsUpdateItemData - a callback that determines if the item's data needs to be updated from a new data object
*/

/**
 * @public
 * @class
 * @summary Each Keyed Item instance implements a standard key/value pair data structure, and belongs to a single [Keyed List]{@link tf.js.KeyedList} instance.
 * Keyed Items are created by calling the [AddOrGetItem]{@link tf.js.KeyedList#AddOrGetItem} function of a Keyed List
 * @param {tf.types.KeyedItemSettings} settings - keyed item creation settings
 */
tf.js.KeyedItem = function (settings) {

    var theThis, list, lastTimeUpdated, itemData, key, needsUpdateDataMethod;

    this.GetListName = function () { return !!list ? list.GetName() : ""; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Keyed list]{@link tf.js.KeyedList} instance associated with this keyed item instance
     * @returns {tf.js.KeyedList} - | {@link tf.js.KeyedList} the list instance
    */
    this.GetList = function () { return list; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Key]{@link tf.types.Key} associated with this keyed item instance
     * @returns {tf.types.Key} - | {@link tf.types.Key} the key
    */
    this.GetKey = function () { return key; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Data object]{@link object} associated with this keyed item instance
     * @returns {tf.types.Key} - | {@link tf.types.Key} the key
    */
    this.GetData = function () { return itemData; }

    /**
     * @public
     * @function
     * @summary - Retrieves the last time the data associated with this keyed item instance was updated
     * @returns {Date} - | {@link Date} the date
    */
    this.GetLastTimeUpdated = function () { return lastTimeUpdated; }

    /**
     * @public
     * @function
     * @summary - Notifies registered listeners of the [Items Updated Event]{@link tf.consts.keyedListUpdatedItemsEvent} of the associated 
     * [KeyedList]{@link tf.js.KeyedList} that this Keyed Item instance has been updated. 
     * Use this function instead of [Update]{@link tf.js.KeyedItem#Update] when the data associated with a Keyed Item instance is retrieved with 
     * the [GetData]{@link tf.js.KeyedItem#GetData] function and then directly modified in place
     * @returns {void} - | {@link void} no return value
    */
    this.NotifyUpdated = function () { notifyUpdated(); }

    /**
     * @public
     * @function
     * @summary - Replaces the data object associated with this Keyed Item instance with the given new data object, provided
     * that <b>itemDataSet</b> is a valid object and that the [Key]{@link tf.types.Key} extracted from it matches this instance's Key.
     * Registered listeners of the [Items Updated Event]{@link tf.consts.keyedListUpdatedItemsEvent} of the associated 
     * [KeyedList]{@link tf.js.KeyedList} are notified if the update occurs
     * @param {object} itemDataSet - the new data
     * @returns {boolean} - | {@link boolean} <b>true</b> if an update was performed, <b>false</b> otherwise
    */
    this.Update = function (itemDataSet) { return update(itemDataSet, false); }

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
     * @summary - Updates the data object associated with this keyed item from the given data object. This function bypasses the associated [KeyedList]{@link tf.js.KeyedList} notification
     * and is meant to be used internally by the API
     * @param {object} itemDataSet - the new data
     * @returns {boolean} - | {@link boolean} <b>true</b> if an update was performed, <b>false</b> otherwise
    */
    this.privateUpdate = function (itemDataSet) { return update(itemDataSet, true); }

    function doUpdate(itemDataSet) {
        var wasUpdated = false;
        lastTimeUpdated = new Date();
        if (tf.js.GetIsValidObject(itemDataSet)) {
            if (wasUpdated = ((!itemData) || (!needsUpdateDataMethod) || (needsUpdateDataMethod({ sender: theThis, itemData: itemData, itemDataSet: itemDataSet })))) {
                itemData = itemDataSet;
            }
        }
        return wasUpdated;
    }

    function notifyUpdated() {
        if (!!list && !!key) {
            list.NotifyItemUpdated(theThis);
        }
    }

    function update(itemDataSet, isUpdateFromList) {
        var updated ;

        if (!!list && !!key && list.GetKeyFromData(itemDataSet) == key) {
            if (isUpdateFromList) { updated = doUpdate(itemDataSet); }
            else { itemData = null; updated = doUpdate(itemDataSet); list.NotifyItemUpdated(theThis); }
        }
        return updated;
    }

    function onDelete() { }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        list = tf.js.GetIsInstanceOf(settings.list, tf.js.KeyedList) ? settings.list : null;
        key = settings.key;
        needsUpdateDataMethod = tf.js.GetFunctionOrNull(settings.needsUpdateItemData);
        doUpdate(settings.itemData);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * Notifications sent by {@link tf.js.KeyedList} instances. Properties are available in notifications that require them
 * @public
 * @typedef {object} tf.types.KeyedListEventNotification
 * @property {tf.map.KeyedList} sender - the instance sending the notification
 * @property {tf.types.keyedListEventName} eventName - the name of the event
 * @property {enumerable<tf.js.KeyedItem>} items - the associated keyed items
 * @property {enumerable<tf.types.Key>} keyes - the associated keys
*/

/**
 * A callback function that can be passed to the function {@link tf.js.KeyedList#AddListener} to start receiving keyed list event notifications
 * @public
 * @callback tf.types.KeyedListEventCallBack
 * @param {tf.types.KeyedListEventNotification} notification - the notification
 * @returns {void} - | {@link void} no return value
 */

/**
 * Settings used in the creation of [Keyed IteList]{@link tf.js.KeyedList} instances
 * @public
 * @typedef {object} tf.types.KeyedListSettings
 * @property {string} name - the name associated with the Keyed List instance
 * @property {tf.types.GetKeyFromData | enumerable<tf.types.GetKeyFromData>} getKeyFromItemData - a mandatory callback capable of extracting a [Key]{@link tf.types.Key} from 
 * the type of data stored by the [Keyed Items]{@link tf.js.KeyedItem} in this Keyed List.
 * <br>To create nested Keyed Lists of depth <b>N</b> use an {@link enumerable}
 * containing <b>N</b> instances of {@link tf.types.GetKeyFromData}; each {@link tf.types.GetKeyFromData} is used in the creation of a nested Keyed List, beginning with the topmost list
 * @property {tf.types.FilterAddItem} filterAddItem - an optional callback to selectivelly prevent data items from being added to this Keyed List instance
 * @property {tf.types.NeedsUpdateItemData} needsUpdateItemData - an optional callback that determines if an item's data needs to be updated from a new data object
 * @property {boolean} keepNotUpdated - if set to <b>true</b> prevents the Keyed List from removing items that were not updated from a new data set, defaults to {@link void}
 * @property {tf.types.Key} key - <b>applications do not define this property directly.</b> It is only meaningful for Keyed List instances that are items in another Keyed List, and it is 
 * automatically defined by the parent Keyed List during the creation of nested Keyed Lists
*/

/**
 * @public
 * @class
 * @summary - Each Keyed List instance implements a standard collection of key/value pairs with unique keys.<br>
 * - Keyed Lists dispatch notifications to registered [Event Listeners]{@link tf.events.EventListener} when standard list operations (Add, Update, and Delete) are performed on it.<br>
 * - Keyed Lists may be used to store key/value pairs retrieved from a remote service.<br>
 * - One or more [Keyed Feature Lists]{@link tf.map.KeyedFeatureList} can be associated with a Keyed List to automate the creation, update, and deletion of [Keyed Features]{@link tf.map.KeyedFeature} 
 * specified by the the list's [Keyed Items]{@link tf.js.KeyedItem}<br>
 * - Keyed Lists are created to either store instances of [Keyed Items]{@link tf.js.KeyedItem} or to store sub-instances of Keyed Lists, which are all updated from the same data set, 
 * and can be nested to arbitraty depths.<br>
 * - Nested Keyed Lists may be used to automatically maintain and query binary relationships (of cardinalities 1:n, n:1, or n:m) between [Keyed Items]{@link tf.js.KeyedItem} stored in other Keyed Lists.<br>
 * - The creation of nested Keyed List instances is automatically performed during the creation of the topmost Keyed List instance, based on the number and order of 
 * [Key extraction callbacks]{@link tf.types.GetKeyFromData} that are specified for it.
 * @param {tf.types.KeyedListSettings} settings - keyed list creation settings
*/
tf.js.KeyedList = function (settings) {

    var theThis, lastTimeUpdated, makePrivateKey, list, keyList, itemCount, itemCountAfterUpdate, name, keepNotUpdated, needsUpdateItemData;
    var allEventDispatchers, filterAddItemCallBack, getKeyFromDataFunction, settingsGetKeyFromData, isListOfLists, key, cachedItemDatas;
    var aggregateDispatcher;

    /**
     * @public
     * @function
     * @summary - Retrieves the name of this keyed list
     * @returns {string} - | {@link string} the name
    */
    this.GetName = function () { return name; }

    /**
     * @public
     * @function
     * @summary - Checks if the items in this Keyed List instance are also Keyed Lists
     * @returns {boolean} - | {@link boolean} <b>true</b> if items are also Keyed Lists, <b>false</b> otherwise
    */
    this.GetIsListOfLists = function () { return isListOfLists; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Key]{@link tf.types.Key} associated with this Keyed List instance. This Key is only meaningful if this Keyed List instance is an item of another Keyed List instance
     * @returns {tf.types.Key} - | {@link tf.types.Key} the key
    */
    this.GetKey = function () { return key; }

    /**
     * @public
     * @function
     * @summary - Assuming that a [Key]{@link tf.types.Key} is extracted from the given [itemData]{@link object}, this function performs one of the following actions:<br>
     * -- if this Keyed List instance contains a [Keyed Item]{@link tf.js.KeyedItem} with a matching Key, this function returns that item, and itemData is otherwise ignored<br>
     * -- if this Keyed List instance does not contain a [Keyed Item]{@link tf.js.KeyedItem} with a matching Key, this function creates a new one using 
     * Key and itemData, adds it to the list, and returns the newly created item
     * @param {object} itemData - a custom, application defined, JavaScript object from which a [Key]{@link tf.types.Key} can extracted using the {@link tf.types.GetKeyFromData} callback
     * provided on the creation settings of this Keyed List instance
     * @returns {tf.js.KeyedItem} - | {@link tf.js.KeyedItem} a Keyed Item instance - either pre-existing or newly created with <b>itemData</b>, or {@link void} if a Key cannot be extracted from <b>itemData</b>
    */
    this.AddOrGetItem = function (itemData) { return addOrGetItem(itemData, true).item; }

    /**
     * @public
     * @function
     * @summary - Removes the given [Keyed Item]{@link tf.js.KeyedItem} from this Keyed List instance
     * @param {tf.js.KeyedItem} keyedItem - the Keyed Item to be removed
     * @returns {boolean} - | {@link boolean} <b>true</b> if the item was removed, <b>false</b> if the the list does not contain the item
    */
    this.RemoveItem = function (keyedItem, skipNofify, skipAggregateNotify) { return removeItem(keyedItem, !skipNofify, skipAggregateNotify); }

    /**
     * @public
     * @function
     * @summary - Removes the [Keyed Item]{@link tf.js.KeyedItem} matching the given [Key]{@link {tf.types.Key} from this Keyed List instance
     * @param {tf.types.Key} itemKey - the given Key
     * @returns {boolean} - | {@link boolean} <b>true</b> if the item was removed, <b>false</b> if the the list does not contain an item matching <b>itemKey</b>
    */
    this.RemoveItemByKey = function (itemKey, skipNofify, skipAggregateNotify) { return removeItemByKey(itemKey, !skipNofify, skipAggregateNotify); }

    /**
     * @public
     * @function
     * @summary - Removes all [Keyed Items]{@link tf.js.KeyedItem} from this Keyed List instance
     * @returns {void} - | {@link void} no return value
    */
    this.RemoveAllItems = function (skipNotify, skipAggregateNotify) { return removeAll(!skipNotify, skipAggregateNotify); }

    /**
     * @public
     * @function
     * @summary - Checks if this Keyed List instance contains a [Keyed Item]{@link tf.js.KeyedItem} matching the given [Key]{@link {tf.types.Key}
     * @param {tf.types.Key} itemKey - the given Key
     * @returns {boolean} - | {@link boolean} <b>true</b> if the list contains a matching item for <b>itemKey</b>, <b>false</b> otherwise
    */
    this.HasKey = function (itemKey) { return hasKey(itemKey); }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Keyed Item]{@link tf.js.KeyedItem} matching the given [Key]{@link {tf.types.Key}, if any
     * @param {tf.types.Key} itemKey - the given Key
     * @returns {tf.js.KeyedItem} - | {@link tf.js.KeyedItem} the Keyed Item instance matching <b>itemKey</b>, or {@link void} if no matching item is found
    */
    this.GetItem = function (itemKey) { return getItem(itemKey); }

    /**
     * @public
     * @function
     * @summary - Retrieves the number of [Keyed Items]{@link tf.js.KeyedItem} currently in this Keyed List instance
     * @returns {number} - | {@link number} the number of items
    */
    this.GetItemCount = function () { return itemCount; }
    this.GetItemCountAfterUpdate = function () { return itemCountAfterUpdate; }

    /**
     * @public
     * @function
     * @summary - Retrieves an enumerable containing all the Keyed Items in this Keyed List instance. Applications should not alter the contents of these items, only retrieve information from them
     * @returns {enumerable<tf.js.KeyedItem>} - | {@link enumerable}<{@link tf.js.KeyedItem}> all the items
    */
    this.GetKeyedItemList = function () { return tf.js.ShallowMerge(list); }

    this.GetFirstKeyedItem = function () {
        var kil = theThis.GetKeyedItemList();
        for (var i in kil) { return kil[i]; }
        return undefined;
    };

    /**
     * @public
     * @function
     * @summary - Retrieves an enumerable containing all the Keys in this Keyed List instance. Applications should not alter the contents of these keys, only retrieve information from them
     * @returns {enumerable<tf.types.Key>} - | {@link enumerable}<{@link tf.types.Key}> all the keyes
    */
    this.GetKeyList = function () { return tf.js.ShallowMerge(keyList); }

    /**
     * @public
     * @function
     * @summary - Extracts a [Key]{@link tf.types.Key} from the given [itemData]{@link object}
     * @param {object} itemData - a custom, application defined, JavaScript object from which a [Key]{@link tf.types.Key} can extracted using the {@link tf.types.GetKeyFromData} callback
     * provided on the creation settings of this Keyed List instance
     * @returns {tf.types.Key} - | {@link tf.types.Key} the extracted Key, or {@link void} if a Key cannot be extracted from <b>itemData</b>
    */
    this.GetKeyFromData = function (data) { return getKeyFromDataFunction(data); }

    /**
     * @public
     * @function
     * @summary - Retrieves the last time this Keyed List instance was [updated from a new list]{@link tf.js.KeyedList#UpdateFromNewData}
     * @returns {Date} - | {@link Date} the date
    */
    this.GetLastTimeUpdated = function () { return lastTimeUpdated; }

    /**
     * @public
     * @function
     * @summary - Updates this Keyed List instance with the contents of the given <b>newData</b>. Removes from the list any [Keyed Items]{@link tf.js.KeyedItem} whose
     * keys are not present in <b>newData</b>, unless the property [keepNotUpdated]{@link tf.types.KeyedListSettings} was set to <b>true</b> during the creation of this Keyed List instance.
     * Notifies listeners of any events that occur during the update.
     * @param {enumerable<object>} newData - an enumerable containing custom, application defined, JavaScript objects from which [Keys]{@link tf.types.Key} can extracted using the {@link tf.types.GetKeyFromData} callback
     * provided on the creation settings of this Keyed List instance
     * @returns {void} - | {@link void} no return value
    */
    this.UpdateFromNewData = function (newData) { return updateFromNewData(newData); }

    this.AddAggregateListener = function (callBack) { return aggregateDispatcher.Add(callBack); }

    /**
     * @public
     * @function
     * @summary - Adds a listener for the given event name
     * @param {tf.types.keyedListEventName} eventName - the name of the event
     * @param {tf.types.KeyedListEventCallBack} callBack - the callback for event notifications
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
     * @summary - Sends the given <b>callBack</b> a [Items Added Event]{@link tf.consts.keyedListAddedItemsEvent} with all keyed items currently in this list
     * @param {tf.types.KeyedListEventCallBack} callBack - the callback
     * @returns {void} - | {@link void} no return value
    */
    this.NotifyItemsAdded = function (callBack) {
        if (tf.js.GetFunctionOrNull(callBack)) {
            if (itemCount > 0) {
                callBack(makeEventNotification(tf.consts.keyedListAddedItemsEvent, list, keyList));
            }
        }
    }

    this.NotifyItemsUpdatedByKeys = function (keyList) {
        if (keyList != undefined) {
            var notifyItems = [], notifyKeys = [];
            for (var i in keyList) {
                var thisKey = keyList[i], thisItem = getItem(thisKey);
                if (!!thisItem) { notifyItems.push(thisItem); notifyKeys.push(thisKey); }
            }
            if (notifyItems.length > 0) { notifyListItemUpdate(notifyItems, notifyKeys); }
        }
    }

    /**
     * @public
     * @function
     * @summary - Notifies listeners of the [Items Updated Event]{@link tf.consts.keyedListUpdatedItemsEvent} with all keyed items currently in this list
     * @param {tf.types.KeyedListEventCallBack} callBack - the callback
     * @returns {void} - | {@link void} no return value
    */
    this.NotifyItemsUpdated = function (itemList) {
        if (itemCount > 0) {
            if (itemList != undefined) {
                var notifyItems = [], notifyKeys = [];
                for (var i in itemList) {
                    var thisItem = itemList[i];
                    if (hasItem(thisItem)) { notifyItems.push(thisItem); notifyKeys.push(thisItem.GetKey()); }
                }
                if (notifyItems.length > 0) { notifyListItemUpdate(notifyItems, notifyKeys); }
            }
            else {
                notifyListItemUpdate(list, keyList);
            }
        }
    }

    /**
     * @private
     * @function
     * @summary - This function is used internally by the API to implement Keyed Item / List Update notifications
     * @param {tf.js.KeyedItem} keyedItem - the item
     * @returns {void} - | {@link void} no return value
    */
    this.NotifyItemUpdated = function (keyedItem) { if (hasItem(keyedItem)) { notifyListItemUpdate([keyedItem], [keyedItem.GetKey()]); } }

    /**
     * @private
     * @function
     * @summary - Adds the given given [itemData]{@link object} to the update cache for later update by the function {@link tf.js.KeyedList#UpdateFromItemDataCache}.
     * This function is used internally by the API to implement Keyed List nesting
     * @param {object} itemData - a custom, application defined, JavaScript object from which a [Key]{@link tf.types.Key} can extracted using the {@link tf.types.GetKeyFromData} callback
     * provided on the creation settings of this Keyed List instance
     * @returns {void} - | {@link void} no return value
    */
    this.AddItemDataToUpdateCache = function (itemData) { return addItemDataToUpdateCache(itemData); }

    /**
     * @private
     * @function
     * @summary - Updates this Keyed List instance from the contents added to its update by the function {@link tf.js.KeyedList#AddItemDataToUpdateCache}.
     * This function is used internally by the API to implement Keyed List nesting
     * @returns {void} - | {@link void} no return value
    */
    this.UpdateFromItemDataCache = function (itemData) { return updateFromItemDataCache(); }

    /**
     * @private
     * @function
     * @summary - Marks this instance for deletion
     * @returns {void} - | {@link void} no return value
    */
    this.OnDelete = function () { return onDelete(); }

    function onDelete() { notifyListEvent(tf.consts.keyedListDeleteEvent, list, keyList); removeAll(false, true); allEventDispatchers.OnDelete(); }

    function makeEventNotification(eventName, items, keys) { return { sender: theThis, eventName: eventName, items: items, keys: keys }; }

    function notifyListEvent(eventName, items, keys, aggregateNotifySettings) {
        var notified = allEventDispatchers.Notify(eventName, makeEventNotification(eventName, items, keys));
        aggregateNotify(aggregateNotifySettings);
        return notified;
    }

    function notifyListItemAdd(items, keys, skipAggregateNotify) {
        notifyListEvent(tf.consts.keyedListAddedItemsEvent, items, keys, (skipAggregateNotify ? undefined : { added: true, addedItems: items, addedKeys: keys }));
    }
    function notifyListItemUpdate(items, keys, skipAggregateNotify) {
        notifyListEvent(tf.consts.keyedListUpdatedItemsEvent, items, keys, (skipAggregateNotify ? undefined : { updated: true, updatedItems: items, updatedKeys: keys }));
    }
    function notifyListItemDelete(items, keys, skipAggregateNotify) {
        notifyListEvent(tf.consts.keyedListDeletedItemsEvent, items, keys, (skipAggregateNotify ? undefined : { deleted: true, deletedItems: items, deletedKeys: keys }));
    }

    function removeItemByKey(itemKey, notify, skipAggregateNotify) { var item = getItem(itemKey); return !!item ? removeItem(item, notify, skipAggregateNotify) : false; }

    function hasKey(theKey) { return !!list[tf.js.MakeObjectKey (theKey)]; }
    function hasItem(theItem) { return !!theItem && (isListOfLists ? theItem instanceof tf.js.KeyedList : theItem instanceof tf.js.KeyedItem) && hasKey(theItem.GetKey()); }
    function getItem(theKey) { return hasKey(theKey) ? list[tf.js.MakeObjectKey (theKey)] : null; }

    function removeAll(doNotify, skipAggregateNotify) { for (var i in list) { removeItem(list[i], doNotify, skipAggregateNotify); } }

    function removeItems(items, keys, skipAggregateNotify) {
        if (!!items) {
            notifyListItemDelete(items, keys, skipAggregateNotify);
            for (var i in items) { removeItem(items[i], false, true); }
        }
    }

    function removeItem(theItem, notify, skipAggregateNotify) {
        if (hasItem(theItem)) {
            var itemKey = theItem.GetKey();
            var privateKey = makePrivateKey(itemKey);
            if (!!notify) { notifyListItemDelete([theItem], [itemKey], skipAggregateNotify); }
            theItem.OnDelete();
            delete keyList[privateKey];
            delete list[privateKey];
            --itemCount;
            return true;
        }
        return false;
    }

    function getNotUpdated() {
        var items = [], keys = [];
        for (var i in list) { var theItem = list[i]; if (theItem.GetLastTimeUpdated() < lastTimeUpdated) { items.push(theItem); keys.push(theItem.GetKey()); } }
        return { foundSome: !!items.length, items: items, keys: keys };
    }

    function addOrGetItem(itemData, notify) {
        var item = null;
        var itemKey = getKeyFromDataFunction(itemData);
        var isExisting = false;

        if (!!itemKey) {
            if (!(isExisting = !!(item = getItem(itemKey)))) {
                if (!filterAddItemCallBack || filterAddItemCallBack(itemData)) {
                    if (isListOfLists) {
                        item = new tf.js.KeyedList({
                            key: itemKey,
                            getKeyFromItemData: settingsGetKeyFromData,
                            needsUpdateItemData: needsUpdateItemData
                        });
                    }
                    else {
                        item = new tf.js.KeyedItem({
                            list: theThis,
                            key: itemKey,
                            itemData: itemData,
                            needsUpdateItemData: needsUpdateItemData
                        });
                    }
                    var privateKey = makePrivateKey(itemKey);
                    keyList[privateKey] = itemKey;
                    list[privateKey] = item;
                    ++itemCount;
                    if (!!notify) { notifyListItemAdd([item], [itemKey]); }
                }
            }
        }
        return { isExisting: isExisting, item: item, key: itemKey };
    }

    function addItemDataToUpdateCache (itemData) { if (!!itemData) { if (!cachedItemDatas) { cachedItemDatas = [] } cachedItemDatas.push(itemData); } }

    function updateFromItemDataCache() { var updated = false; if (!!cachedItemDatas) { updated = updateFromNewData(cachedItemDatas); cachedItemDatas = null; } return updated; }

    function updateFromNewData(newData) {
        var addedItems = [], addedKeys = [];
        var updatedItems = [], updatedKeys = [], notUpdated;
        var seenKeys = {}, seenUpdatedKeys = {}, listsToUpdate = {};

        lastTimeUpdated = new Date();

        if (!!newData) {
            var newListUse = tf.js.GetIsArray(newData) ? newData : [newData];

            for (var i in newListUse) {
                var itemData = newListUse[i];
                var addedOrGotten = addOrGetItem(itemData, false);
                var isExistingItem = addedOrGotten.isExisting, item = addedOrGotten.item, key = addedOrGotten.key;

                if (isExistingItem) {
                    if (isListOfLists) {
                        item.AddItemDataToUpdateCache(itemData);
                        if (!seenKeys[key]) { if (!listsToUpdate[key]) { listsToUpdate[key] = item; } }
                    }
                    else {
                        if (item.privateUpdate(itemData)) {
                            if (!seenKeys[key]) { if (!seenUpdatedKeys[key]) { seenUpdatedKeys[key] = key; updatedItems.push(item); updatedKeys.push(key); } }
                        }
                    }
                }
                else if (!!item) {
                    if (isListOfLists) { item.AddItemDataToUpdateCache(itemData); }
                    seenKeys[key] = item;
                    addedItems.push(item); addedKeys.push(key);
                }
            }
        }

        var addedSome = addedItems.length > 0;

        if (addedSome) { if (isListOfLists) { for (var i in addedItems) { addedItems[i].UpdateFromItemDataCache(); } } }

        if (isListOfLists) { for (var i in listsToUpdate) { var listItem = listsToUpdate[i]; if (listItem.UpdateFromItemDataCache()) { updatedKeys.push(i); updatedItems.push(listItem); } } }

        var updatedSome = updatedItems.length > 0, deletedSome;

        itemCountAfterUpdate = itemCount;

        if (!keepNotUpdated) {
            notUpdated = getNotUpdated();
            if (deletedSome = notUpdated.foundSome) {
                itemCountAfterUpdate -= notUpdated.items.length;
            }
        }
        else {
            notUpdated = { items: [], keys: [] };
            deletedSome = false;
        }

        var madeChanges = addedSome || updatedSome || deletedSome;

        if (madeChanges) {
            aggregateNotify({
                added: addedSome,
                addedItems: addedItems,
                addedKeys: addedKeys,
                updated: updatedSome,
                updatedItems: updatedItems,
                updatedKeys: updatedKeys,
                deleted: deletedSome,
                deletedItems: notUpdated.items,
                deletedKeys: notUpdated.keys
            });
        }

        if (addedSome) { notifyListItemAdd(addedItems, addedKeys, true); }
        if (updatedSome) { notifyListItemUpdate(updatedItems, updatedKeys, true); }
        if (deletedSome) { removeItems(notUpdated.items, notUpdated.keys, true); }

        return madeChanges;
    }

    function getNullKey() { return null; }

    function setKeyFromDataCallBack() {
        getKeyFromDataFunction = undefined;
        isListOfLists = false;

        settingsGetKeyFromData = settings.getKeyFromItemData;

        if (!!settingsGetKeyFromData) {
            if (typeof settingsGetKeyFromData === "function") {
                getKeyFromDataFunction = tf.js.GetFunctionOrNull(settingsGetKeyFromData);
            }
            else if (tf.js.GetIsNonEmptyArray(settingsGetKeyFromData)) {
                getKeyFromDataFunction = tf.js.GetFunctionOrNull(settingsGetKeyFromData[0]);
                settingsGetKeyFromData = settingsGetKeyFromData.slice(1);
                if (!(isListOfLists = settingsGetKeyFromData.length > 0)) {
                    settingsGetKeyFromData = null;
                }
            }
        }
        
        if (!getKeyFromDataFunction) { getKeyFromDataFunction = getNullKey; }
    }

    function aggregateNotify(notifySettings) {
        if (tf.js.GetIsValidObject(notifySettings)) {
            var defaultSettings = { added: false, updated: false, deleted: false };
            aggregateDispatcher.Notify(tf.js.ShallowMerge(defaultSettings, notifySettings, { sender: theThis }));
        }
    }

    function initialize() {
        aggregateDispatcher = new tf.events.EventNotifier({ eventName: "agg" });
        allEventDispatchers = new tf.events.MultiEventNotifier({ eventNames: tf.consts.allKeyedListEventNames });
        makePrivateKey = tf.js.MakeObjectKey;
        list = {}; keyList = {}; itemCount = itemCountAfterUpdate = 0;
        settings = tf.js.GetValidObjectFrom(settings);
        name = settings.name;
        needsUpdateItemData = tf.js.GetFunctionOrNull(settings.needsUpdateItemData);
        keepNotUpdated = tf.js.GetBoolFromValue(settings.keepNotUpdated, false);
        filterAddItemCallBack = tf.js.GetFunctionOrNull(settings.filterAddItem);
        key = settings.key;
        setKeyFromDataCallBack();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * A callback function that must be provided in the creation of [Keyed Lists Periodic Refresh]{@link tf.js.KeyedListsPeriodicRefresh} instances to 
 * preprocess the data returned by the remote service into an {@link enumerable} used to update the [Keyed List]{@link tf.js.KeyedList} instances 
 * managed by the Periodic Refresh via their [UpdateFromNewData]{@link tf.js.KeyedList#UpdateFromNewData} functions.
 * @public
 * @callback tf.types.PreProcessServiceData
 * @param {object} data - an object returned from the remote service
 * @returns {enumerable<object>} - | {@link enumerable}<{@link object}> the parameter to be passed to [UpdateFromNewData]{@link tf.js.KeyedList#UpdateFromNewData}
 */

/**
 * Notifications sent by [Keyed Lists Periodic Refresh]{@link tf.js.KeyedListsPeriodicRefresh} instances. Properties are available in notifications that require them
 * @public
 * @typedef {object} tf.types.KeyedListsPeriodicRefreshNotification
 * @property {tf.js.KeyedListsPeriodicRefresh} sender - the instance sending the notification
*/

/**
 * A callback function that receives notifications from a [Keyed Lists Periodic Refresh]{@link tf.js.KeyedListsPeriodicRefresh} instance
 * @public
 * @callback tf.types.KeyedListsPeriodicRefreshCallBack
 * @param {tf.types.KeyedListsPeriodicRefreshNotification} notification - the notification
 * @returns {void} - | {@link void} no return value
 */

/**
 * Settings used in the creation of [Keyed Lists Periodic Refresh]{@link tf.js.KeyedListsPeriodicRefresh} instances
 * @public
 * @typedef {object} tf.types.KeyedListsPeriodicRefreshSettings
 * @property {enumerable<tf.js.KeyedList | tf.types.KeyedListSettings>} keyedLists - a non-empty enumerable whose elements can be a mix of pre-existing [Keyed Lists]{@link tf.js.KeyedList} 
 * instances or settings used in the creation of new lists
 * @property {tf.types.PreProcessServiceData} preProcessServiceData - a mandatory callback that transforms raw data returned from a service into data digestible by [Keyed List]{@link tf.js.KeyedList} instances
 * @property {string | tf.types.GetUrlFunction} serviceURL - a mandatory url to access, either the url string itself or a function that returns an url string
 * @property {number} refreshMillis - The desired number of milliseconds between periodic refreshes
 * @property {boolean} useRedirect - if set to <b>true</b> requests are sent using a redirect proxy, to avoid cross domain violations
 * @property {boolean} refreshOnCreate - if set to <b>true</b> the first request is sent immediately upon creation of this instance
 * @property {tf.types.KeyedListsPeriodicRefreshCallBack} onCreated - a callback notified upon completion of the first refresh operation 
 * @property {tf.types.KeyedListsPeriodicRefreshCallBack} refreshCallback - a callback notified upon completion of the each refresh operation
 * @property {boolean} retryOnFail - if set to <b>true</b> requests are re-sent immediately upon failure, defaults to {@link void}
*/

/**
 * @public
 * @class
 * @summary Instances of Keyed Lists Periodic Refresh retrieve data from remote services to update one or more [Keyed List]{@link tf.js.KeyedList} instances, using 
 * their respective [UpdateFromNewData]{@link tf.js.KeyedList#UpdateFromNewData} functions. Instances can work with pre-existing Keyed Lists or create new ones
 * @param {tf.types.KeyedListsPeriodicRefreshSettings} settings - Keyed Lists Periodic Refresh creation settings
*/
tf.js.KeyedListsPeriodicRefresh = function (settings) {

    var defaultRefreshTimeOutMillis = 1000 * 60 * 10;
    var theThis, periodicJSONGet, keyedListsByName, keyedLists, refreshMillis, newData;
    var refreshCallback, onCreatedCallback, refreshListeners, refreshCount, isDeleted;

    /**
     * @public
     * @function
     * @summary - Retrieves by name one of the [Keyed Lists]{@link tf.js.KeyedList} associated with this instance
     * @param {string} listName - the name of the list
     * @returns {tf.js.KeyedList} - | {@link tf.js.KeyedList} the list, if a list named <b>listName</b> is found
    */
    this.GetKeyedList = function (listName) { return getKeyedList(listName); }

    /**
     * @public
     * @function
     * @summary - Triggers an immediate refresh
     * @returns {void} - | {@link void} no return value
    */
    this.RefreshNow = function () { return refreshNow(); }

    /**
     * @public
     * @function
     * @summary - Retrieves the number of refresh operations performed by this instance
     * @returns {number} - | {@link number} the number of refreshes
    */
    this.GetRefreshCount = function () { return refreshCount; }

    /**
     * @public
     * @function
     * @summary - Checks if a refresh operation is in progress (a request was sent, but a response has not been received)
     * @returns {boolean} - | {@link boolean } <b>true</b> if a refresh is in progress, <b>false</b> otherwise
    */
    this.GetIsRefreshing = function () { return periodicJSONGet.GetIsRefreshing(); }

    /**
     * @public
     * @function
     * @summary - Adds a listener for list refresh events
     * @param {tf.types.KeyedListsPeriodicRefreshCallBack} callBack - the callback for event notifications
     * @returns {tf.events.EventListener} - | {@link tf.events.EventListener} the event listener
    */
    this.AddOnRefreshListener = function (callBack) { return addListener(refreshListeners, callBack); }

    /**
     * @private
     * @function
     * @summary - Marks this instance for deletion
     * @returns {void} - | {@link void} no return value
    */
    this.OnDelete = function () { return onDelete(); }

    this.RefreshFromData = function (data) {
        if (periodicJSONGet) {
            periodicJSONGet.RefreshFromData(data);
        }
    };

    function getKeyedList(listName) { return keyedListsByName[listName]; }

    function onDelete() {
        isDeleted = true;
        if (periodicJSONGet) { periodicJSONGet.OnDelete(); periodicJSONGet = null; }
        refreshListeners = deleteListener(refreshListeners);
        for (var i in keyedLists) { keyedLists[i].OnDelete(); } keyedLists = null; keyedListsByName = {};
    }

    function deleteListener(theListener) { if (!!theListener) { theListener.OnDelete(); } return null; }

    function refreshNow() { if (periodicJSONGet) { periodicJSONGet.RefreshNow(); } }

    function onNotifyRefresh() { return refreshListeners.Notify({ sender: theThis }); }

    function updateFromNewData(data) {
        ++refreshCount;
        if (!refreshMillis) { periodicJSONGet.Cancel(); }

        var notify = true;

        if (!data) {
            if (settings.retryOnFail) {
                notify = false;
                tf.GetDebug().LogIfTest("KeyedListsPeriodicRefresh: retrying JSON download");
                setTimeout(refreshNow, 1000);
                //refreshNow();
            }
        }

        if (notify) {
            var newData = settings.preProcessServiceData(data);
            for (var i in keyedLists) { keyedLists[i].UpdateFromNewData(newData); }
        }
    }

    function notifyRefresh() { if (!!refreshCallback) { refreshCallback({ sender: theThis }); } onNotifyRefresh(); }

    function onListLoaded(notification) { if (!isDeleted) { updateFromNewData(notification.data); notifyRefresh(); } }

    function onListLoadedFirstTime(notification) {
        if (!isDeleted) {
            periodicJSONGet.ChangeCallBack(onListLoaded);
            updateFromNewData(notification.data);
            if (!!onCreatedCallback) { var occb = onCreatedCallback; onCreatedCallback = null; occb({ sender: theThis }); }
            notifyRefresh();
        }
    }

    function createPeriodicRefresh() {
        var autoRefresh = ((refreshMillis = tf.js.GetNonNegativeIntFrom(settings.refreshMillis)) > 0);
        periodicJSONGet = new tf.ajax.PeriodicJSONGet({
            url: settings.serviceURL,
            refreshMillis: refreshMillis ? refreshMillis : defaultRefreshTimeOutMillis,
            autoRefresh: autoRefresh,
            onRefresh: onListLoadedFirstTime,
            optionalScope: theThis,
            useRedirect: settings.useRedirect,
            JSONDecode: settings.JSONDecode,
            postParams: settings.postParams,
            requestHeaders: settings.requestHeaders
        });
        if (tf.js.GetBoolFromValue(settings.refreshOnCreate, true)) { periodicJSONGet.RefreshNow(); }
        else {
            periodicJSONGet.ChangeCallBack(onListLoaded);
            if (!!onCreatedCallback) { var occb = onCreatedCallback; onCreatedCallback = null; occb({ sender: theThis }); }
        }
    }

    function initialize() {

        keyedLists = [];
        keyedListsByName = {};

        if (!!settings && typeof settings === "object" && !!settings.keyedLists && tf.js.GetIsArray(settings.keyedLists)) {
            isDeleted = false;
            refreshListeners = new tf.events.EventNotifier();
            refreshCallback = tf.js.GetFunctionOrNull(settings.refreshCallback);
            onCreatedCallback = tf.js.GetFunctionOrNull(settings.onCreated);
            for (var i in settings.keyedLists) {
                var keyedList = settings.keyedLists[i];

                if (!!keyedList) {
                    if (!(keyedList instanceof tf.js.KeyedList)) { keyedList = tf.js.GetIsValidObject(keyedList) ? new tf.js.KeyedList(keyedList) : null; }
                    if (!!keyedList) { keyedLists.push(keyedList); keyedListsByName[keyedList.GetName()] = keyedList; }
                }
            }

            if (keyedLists.length) { createPeriodicRefresh(); }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
