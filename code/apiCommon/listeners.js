"use strict";

// tf.events

/**
 * @public
 * @function
 * @summary - Stops propagation of the given {@link DOMEvent}
 * @param {DOMEvent} event - the event
 * @returns {void} - | {@link void} no return value
*/
tf.events.StopDOMEvent = function (event) {
    //tf.GetDebug().LogIfTest('.');
    if (!event) { if (window.event) { event = window.event; } }
    if (!!event && typeof event === "object") {
        //if (event.stopPropagation) { event.stopPropagation(); }
        if (event.cancelBubble !== undefined) { event.cancelBubble = true; }
        if (event.returnValue != null) { event.returnValue = false; }
        if (event.preventDefault) { event.preventDefault(); }
        if (event.cancel != null) { event.cancel = true; }
    }
    return false;
};

/**
 * @public
 * @class
 * @summary Delayed Call Back instances receive an arbitrary number notifications during a maximum given period of time, before delivering only the last one of these notifications to the given callback.
 * Use Delayed Call Back to avoid reacting immediately to each instance of an event that may fire in rapid succession during a short period of time
 * @param {number} callBackDelay - the number of milliseconds during which notifications are delayed
 * @param {function} callBack - the callback
 * @param {object} optionalScope - optional scope used with <b>callBack</b>
 */
tf.events.DelayedCallBack = function (callBackDelay, callBack, optionalScope) {

    var theThis, theDelay, theCallBack, theThisForCallBack, lastNotificationTime, waitingForTimeOut, theNotification;

    /**
     * @public
     * @function
     * @summary - Use this function with an event listener to delay event notifications
     * @returns {void} - | {@link void} no return value
    */
    this.DelayCallBack = function () {
        lastNotificationTime = +new Date(); theNotification = arguments;
        if (waitingForTimeOut == undefined) { waitingForTimeOut = setTimeout(delayCallBack, theDelay); }
    }

    /**
     * @public
     * @function
     * @summary - Use this function to cancel a pending delayed callback
     * @returns {void} - | {@link void} no return value
    */
    this.CancelCallBack = function () {
        if (waitingForTimeOut != undefined) { clearTimeout(waitingForTimeOut); waitingForTimeOut = undefined; }
    }

    /**
     * @public
     * @function
     * @summary - Use this function to execute a pending callback immediatelly
     * @returns {void} - | {@link void} no return value
    */
    this.CallBackNow = function () { theThis.CancelCallBack(); doCallBack(); }

    /**
     * @public
     * @function
     * @summary - Determines if a there is a pending callback request
     * @returns {bool} - | {@link bool} <b>true</b> if a callback request is pending, <b>false</b> otherwise
    */
    this.GetHasPendingCallBack = function () { return waitingForTimeOut != undefined; }

    this.ChangeDelay = function (newCallBackDelay) { theDelay = newCallBackDelay; }

    function doCallBack() { theCallBack.apply(theThisForCallBack, theNotification); }

    function delayCallBack() { if (+new Date() - lastNotificationTime < theDelay) { waitingForTimeOut = setTimeout(delayCallBack, theDelay); } else { waitingForTimeOut = undefined; doCallBack(); } }

    function initialize() {
        theDelay = callBackDelay;
        theCallBack = callBack;
        theThisForCallBack = optionalScope;
        lastNotificationTime = +new Date(1, 1, 2000, 12, 0, 0);
        waitingForTimeOut = undefined;
        theNotification = null;
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * Settings used in the creation of [Dom Event Listener]{@link tf.events.DOMEventListener} instances
 * @public
 * @typedef {object} tf.types.DOMEventListenerSettings
 * @property {HTMLElementLike} target - the element whose events will be notified
 * @property {tf.types.DOMEventName} eventName - the name of the event to listen for
 * @property {tf.types.DOMEventListenerCallBack} callBack - to receive event notifications
*/

/**
 * @public
 * @class
 * @summary DOM Event Listener instances are created by calling the API function [AddDomEventListener]{@link tf.events.AddDOMEventListener}
 * @param {DOMEventListenerSettings} settings - creation settings
 */

tf.events.DOMEventListener = function (settings) {
    var theThis, target, eventName, callBack;

    /**
     * @public
     * @function
     * @summary - Use this function to delete the event listener and stop receiving notifications
     * @returns {void} - | {@link void} no return value
    */
    this.OnDelete = function () { if (!!callBack) { tf.events.DelDOMEventListener(target, eventName, callBack); callBack = null; } }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (!!(callBack = tf.js.GetFunctionOrNull(settings.callBack)) &&
            !!tf.dom.GetDOMEventListenerFrom(settings.target) &&
            !!tf.js.GetIsNonEmptyString(settings.eventName)) {
            eventName = settings.eventName;
            target = settings.target;
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * Notifications sent by [Multi Dom Event Listener]{@link tf.events.MultiDOMEventListener} instances
 * @public
 * @typedef {object} tf.types.MultiDOMEventListenerNotification
 * @property {tf.events.MultiDOMEventListener} sender - the instance sending the notification
 * @property {DOMEvent} event - the event being notified
 * @property {tf.types.DOMEventName} eventName - the name of the event being notified
 * @property {HTMLElementLike} target - the element whose event is being notified
 * @property {object} callBackSettings - application defined properties, provided in the creation of the {@link tf.events.MultiDOMEventListener} instance
*/

/**
 * A callback function that can be used in the creation of [AddDOMEventListener]{@link tf.events.MultiDOMEventListener} instances
 * @public
 * @callback tf.types.MultiDOMEventListenerCallBack
 * @param {tf.types.MultiDOMEventListenerNotification} notification - the notification
 * @returns {void} - | {@link void} no return value
 */

/**
 * Settings used in the creation of [Multi Dom Event Listener]{@link tf.events.MultiDOMEventListener} instances
 * @public
 * @typedef {object} tf.types.MultiDOMEventListenerSettings
 * @property {HTMLElementLike} target - the element whose events will be notified
 * @property {enumerable<tf.types.DOMEventName>} eventNames - the names of the events to listen for
 * @property {tf.types.MultiDOMEventListenerCallBack} callBack - to receive event notifications
 * @property {object} optionalScope - optional scope used with <b>callBack</b>
 * @property {object} callBackSettings - application defined properties, provided in the creation of the {@link tf.events.MultiDOMEventListener} instance
 * @property {function} onPreNotify - optional callback that receives, and may alter, each notification object before it is sent to listeners
 * @property {object} preNotifyScope - optional scope used with <b>onPreNotify</b>
*/

/**
 * @public
 * @class
 * @summary Multi DOM Event Listener instances notify one or more [DOMEvents]{@link DOMEvent} to a single callback
 * @param {MultiDOMEventListenerSettings} settings - creation settings
 */
tf.events.MultiDOMEventListener = function (settings) {
    var theThis, domObj, target, DOMListeners, callBack, optionalScope, callBackSettings, preNotify, preNotifyScope, lastEvent, lastEventName;

    this.GetDomObj = function () { return domObj; }

    /**
     * @public
     * @function
     * @summary - Retrieves the element whose events are being monitored
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the element
    */
    this.GetTarget = function () { return target; }

    /**
     * @public
     * @function
     * @summary - Retrieves the last event received and notified
     * @returns {DOMEvent} - | {@link DOMEvent} the element
    */
    this.GetLastEvent = function () { return lastEvent; }

    /**
     * @public
     * @function
     * @summary - Retrieves the name last event received and notified
     * @returns {tf.types.DOMEventName} - | {@link tf.types.DOMEventName} the name of the last event
    */
    this.GetLastEventName = function () { return lastEventName; }

    /**
     * @public
     * @function
     * @summary - Use this function to delete the event listeners associated with this instance and stop receiving notifications
     * @returns {void} - | {@link void} no return value
    */
    this.OnDelete = function () { if (!!DOMListeners) { for (var i in DOMListeners) { DOMListeners[i].OnDelete(); } DOMListeners = null; } }

    this.ChangeCallBackSettings = function (newCallBackSettings) { callBackSettings = newCallBackSettings; }

    function notifyEvent(eventNotification) {
        var retVal = callBack.call(optionalScope, eventNotification);
        return retVal != undefined ? retVal : true;
    }

    function onReceivedEvent(event, eventName) {
        if (!event) { if (window.event) { event = window.event; } }
        switch (eventName) {
            case tf.consts.DOMEventNamesClick:
                //tf.events.StopDOMEvent(event);
                break;
            default:
                break;
        }
        lastEventName = eventName;
        lastEvent = event;
        var eventNotification = { sender: theThis, callBackSettings: callBackSettings, event: event, eventName: eventName, target: target, domObj: domObj };
        if (!!preNotify) { preNotify.call(preNotifyScope, eventNotification); }
        return notifyEvent(eventNotification);
    }

    function makeEventNotificationCallBack(eventName) { return function (event) { return onReceivedEvent(event, eventName) }; }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (!!tf.dom.GetDOMEventListenerFrom(settings.target) &&
            !!tf.js.GetIsValidObject(settings.eventNames) &&
            !!(callBack = tf.js.GetFunctionOrNull(settings.callBack))) {

            optionalScope = settings.optionalScope;
            domObj = settings.domObj;
            target = settings.target;
            callBackSettings = settings.callBackSettings;
            preNotify = tf.js.GetFunctionOrNull(settings.onPreNotify);
            preNotifyScope = settings.preNotifyScope;

            DOMListeners = [];
            for (var i in settings.eventNames) {
                var eventName = settings.eventNames[i];
                if (tf.js.GetIsNonEmptyString(eventName)) {
                    DOMListeners.push(tf.events.AddDOMEventListener(target, eventName, makeEventNotificationCallBack(eventName)));
                }
            }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * Notifications sent by {@link tf.events.DOMFullScreenChangeListener} instances
 * @public
 * @typedef {object} tf.types.DOMFullScreenChangeListenerNotification
 * @property {tf.events.DOMFullScreenChangeListener} sender - the instance sending the notification
 * @property {DOMEvent} event - the event being notified
 * @property {object} callBackSettings - application defined properties, provided in the creation of the {@link tf.events.DOMFullScreenChangeListener} instance
*/

/**
 * A callback function that can be used in the creation of instances of [DOM Full Screen Change Listener]{@link tf.events.DOMFullScreenChangeListener}
 * @public
 * @callback tf.types.DOMFullScreenChangeListenerCallBack
 * @param {tf.types.DOMFullScreenChangeListenerNotification} notification - the notification
 * @returns {void} - | {@link void} no return value
 */

/**
 * Settings used in the creation of [DOM Full Screen Change Listener]{@link tf.events.DOMFullScreenChangeListener} instances
 * @public
 * @typedef {object} tf.types.DOMFullScreenChangeListenerSettings
 * @property {tf.types.DOMFullScreenChangeListenerCallBack} callBack - to receive event notifications
 * @property {object} optionalScope - optional scope used with <b>callBack</b>
 * @property {object} callBackSettings - application defined properties, to be passed to <b>callBack</b> during notifications
*/

/**
 * @public
 * @class
 * @summary DOM Full Screen Change Listener instances report to a given callback when the Browser enters or leaves full screen mode
 * @param {tf.types.DOMFullScreenChangeListenerSettings} settings - creation settings
 */
tf.events.DOMFullScreenChangeListener = function (settings) {

    var theThis, onDelayFullScreen, optionalScope, callBack, callBackSettings, DOMListeners;

    /**
     * @public
     * @function
     * @summary - Checks if fullscreen mode is currently on
     * @returns {bool} - | {@link bool} <b>true</b> if in fullscreen mode, <b>false</b> otherwise
    */
    this.GetIsFullScreen = function () { return tf.browser.GetIsFullScreen(); }

    /**
     * @public
     * @function
     * @summary - Use this function to delete the event listener and stop receiving notifications
     * @returns {void} - | {@link void} no return value
    */
    this.OnDelete = function () { if (!!DOMListeners) { for (var i in DOMListeners) { DOMListeners[i].OnDelete(); } DOMListeners = null; } }

    function onFullScreenChange(evt) {
        callBack.call(optionalScope, { sender: theThis, callBackSettings: callBackSettings, event: evt });
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (!!tf.js.GetFunctionOrNull(settings.callBack)) {
            optionalScope = settings.optionalScope;
            callBack = settings.callBack;
            callBackSettings = settings.callBackSettings;
            onDelayFullScreen = new tf.events.DelayedCallBack(50, onFullScreenChange, theThis);
            DOMListeners = [];
            for (var i in tf.consts.allFullScreenEventNames) {
                DOMListeners.push(tf.events.AddDOMEventListener(document, tf.consts.allFullScreenEventNames[i], onDelayFullScreen.DelayCallBack));
            }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * Settings used in the creation of [DOM Click Listener]{@link tf.events.DOMClickListener} instances
 * @public
 * @typedef {object} tf.types.DOMClickListenerSettings
 * @property {HTMLElementLike} target - the element whose click events will be monitored
 * @property {tf.types.MultiDOMEventListenerCallBack} callBack - to receive event notifications
 * @property {object} optionalScope - optional scope used with <b>callBack</b>
 * @property {object} callBackSettings - application defined properties, to be passed to <b>callBack</b> during notifications
*/

/**
 * @public
 * @class
 * @summary DOM Click Listener instances report [click]{@link tf.consts.DOMEventNamesClick} [DOM Events]{@link DOMEvent} to a given callback
 * @param {tf.types.DOMClickListenerSettings} settings - creation settings
 * @extends {tf.events.MultiDOMEventListener}
 */
tf.events.DOMClickListener = function (settings) {

    var theThis;

    function onPreNotify(notification) {
        switch (notification.eventName) {
            case tf.consts.DOMEventNamesClick:
                //tf.events.StopDOMEvent(notification.event);
                break;
            default:
                break;
        }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        var eventNames = [tf.consts.DOMEventNamesClick];
        var settingsUse = tf.js.ShallowMerge(settings, { eventNames: eventNames, onPreNotify: onPreNotify, preNotifyScope: theThis });
        tf.events.MultiDOMEventListener.call(theThis, settingsUse);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.events.DOMClickListener, tf.events.MultiDOMEventListener);

tf.events.DOMChangeListener = function (settings) {

    var theThis;

    function onPreNotify(notification) {
        switch (notification.eventName) {
            case tf.consts.DOMEventNamesChange:
                //tf.events.StopDOMEvent(notification.event);
                break;
            default:
                break;
        }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        var eventNames = [tf.consts.DOMEventNamesChange];
        var settingsUse = tf.js.ShallowMerge(settings, { eventNames: eventNames, onPreNotify: onPreNotify, preNotifyScope: theThis });
        tf.events.MultiDOMEventListener.call(theThis, settingsUse);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.events.DOMClickListener, tf.events.MultiDOMEventListener);

/**
 * Settings used in the creation of [DOM Click Listener]{@link tf.events.DOMClickListener} instances
 * @public
 * @typedef {object} tf.types.DOMClickListenerSettings
 * @property {HTMLElementLike} target - the element whose click events will be monitored
 * @property {tf.types.MultiDOMEventListenerCallBack} callBack - to receive event notifications
 * @property {object} optionalScope - optional scope used with <b>callBack</b>
 * @property {object} callBackSettings - application defined properties, to be passed to <b>callBack</b> during notifications
*/

/**
 * @public
 * @class
 * @summary DOM Click Listener instances report [click]{@link tf.consts.DOMEventNamesClick} [DOM Events]{@link DOMEvent} to a given callback
 * @param {tf.types.DOMClickListenerSettings} settings - creation settings
 * @extends {tf.events.MultiDOMEventListener}
 */
tf.events.DOMWheelListener = function (settings) {
    var theThis, isFireFox;

    function onPreNotify(notification) {
        var isUp = false;
        var event = notification.event;
        switch (notification.eventName) {
            case tf.consts.DOMEventNamesDOMMouseScroll:
                isUp = event.detail < 0;
                break;
            case tf.consts.DOMEventNamesMouseWheel:
                isUp = event.wheelDelta > 0;
                break;
            default:
                break;
        }
        notification.isUp = isUp;
        if (tf.js.GetFunctionOrNull(event.preventDefault)) { event.preventDefault(); }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        isFireFox = tf.browser.GetBrowserType().isFireFox;
        var eventNames = isFireFox ? [tf.consts.DOMEventNamesDOMMouseScroll] : [tf.consts.DOMEventNamesMouseWheel];
        var settingsUse = tf.js.ShallowMerge(settings, { eventNames: eventNames, onPreNotify: onPreNotify, preNotifyScope: theThis });
        tf.events.MultiDOMEventListener.call(theThis, settingsUse);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.events.DOMWheelListener, tf.events.MultiDOMEventListener);

/**
 * Notifications sent by {@link tf.events.DOMHoverListener} instances contain the properties of {@link tf.types.MultiDOMEventListenerNotification} plus:
 * @public
 * @typedef {object} tf.types.DOMHoverListenerNotification
 * @property {boolean} isInHover - <b>true</b> in [MouseOver]{@link tf.consts.DOMEventNamesMouseOver} events, <b>false</b> in [MouseOut]{@link tf.consts.DOMEventNamesMouseOut} events
 * @property {tf.types.pixelCoordinates} mouseCoords - the mouse pointer coordinates associated with the event
*/

/**
 * A callback function that can be used in the creation of instances of [DOM Hover Listener]{@link tf.events.DOMHoverListener}
 * @public
 * @callback tf.types.DOMHoverListenerCallBack
 * @param {tf.types.DOMHoverListenerNotification} notification - the notification
 * @returns {void} - | {@link void} no return value
 */

/**
 * Settings used in the creation of [DOM Hover Listener]{@link tf.events.DOMHoverListener} instances
 * @public
 * @typedef {object} tf.types.DOMHoverListenerSettings
 * @property {HTMLElementLike} target - the element whose hover events will be monitored
 * @property {tf.types.DOMHoverListenerCallBack} callBack - to receive event notifications
 * @property {object} optionalScope - optional scope used with <b>callBack</b>
 * @property {object} callBackSettings - application defined properties, to be passed to <b>callBack</b> during notifications
*/

/**
 * @public
 * @class
 * @summary DOM Hover Listener instances report [MouseOver]{@link tf.consts.DOMEventNamesMouseOver} and [MouseOut]{@link tf.consts.DOMEventNamesMouseOut} 
 * [DOM Events]{@link DOMEvent} to a given callback
 * @param {tf.types.DOMHoverListenerSettings} settings - creation settings
 * @extends {tf.events.MultiDOMEventListener}
 */
tf.events.DOMHoverListener = function (settings) {

    var theThis, isInHover, lastPos;

    /**
     * @public
     * @function
     * @summary - Checks if the last event received was a [MouseOver]{@link tf.consts.DOMEventNamesMouseOver} event
     * @returns {boolean} - | {@link boolean} <b>true</b> if the last event was a MouseOver event, <b>false</b> otherwise
    */
    this.GetIsInHover = function () { return isInHover; }

    /**
     * @public
     * @function
     * @summary - Retrieves the mouse pointer position in the last event received and notified
     * @returns {tf.types.pixelCoordinates} - | {@link tf.types.pixelCoordinates} the last position
    */
    this.GetLastPos = function () { return lastPos; }

    function onPreNotify(notification) {
        lastPos = notification.mouseCoords = tf.events.GetMouseEventCoords(notification.event);
        switch (notification.eventName) {
            case tf.consts.DOMEventNamesMouseOver:
                isInHover = notification.isInHover = true;
                break;
            case tf.consts.DOMEventNamesMouseOut:
                isInHover = notification.isInHover = false;
                break;
        }
    }

    function initialize() {
        isInHover = false;
        var eventNames = [tf.consts.DOMEventNamesMouseOver, tf.consts.DOMEventNamesMouseOut];
        var settingsUse = tf.js.ShallowMerge(settings, { eventNames: eventNames, onPreNotify: onPreNotify, preNotifyScope: theThis });
        tf.events.MultiDOMEventListener.call(theThis, settingsUse);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.events.DOMHoverListener, tf.events.MultiDOMEventListener);

/**
 * @public
 * @class
 * @summary DOM MouseEnterLeave Listener instances report [MouseEnter]{@link tf.consts.DOMEventNamesMouseEnter} and [MouseLeave]{@link tf.consts.DOMEventNamesMouseLeave} 
 * [DOM Events]{@link DOMEvent} to a given callback
 * @param {tf.types.DOMHoverListenerSettings} settings - creation settings
 * @extends {tf.events.MultiDOMEventListener}
 */
tf.events.DOMMouseEnterLeaveListener = function (settings) {

    var theThis, isInHover, lastPos;

    /**
     * @public
     * @function
     * @summary - Checks if the last event received was a [MouseEnter]{@link tf.consts.DOMEventNamesMouseEnter} event
     * @returns {boolean} - | {@link boolean} <b>true</b> if the last event was a MouseEnter event, <b>false</b> otherwise
    */
    this.GetIsInHover = function () { return isInHover; }

    /**
     * @public
     * @function
     * @summary - Retrieves the mouse pointer position in the last event received and notified
     * @returns {tf.types.pixelCoordinates} - | {@link tf.types.pixelCoordinates} the last position
    */
    this.GetLastPos = function () { return lastPos; }

    function onPreNotify(notification) {
        lastPos = notification.mouseCoords = tf.events.GetMouseEventCoords(notification.event);
        switch (notification.eventName) {
            case tf.consts.DOMEventNamesMouseEnter:
                isInHover = notification.isInHover = true;
                break;
            case tf.consts.DOMEventNamesMouseLeave:
                isInHover = notification.isInHover = false;
                break;
        }
    }

    function initialize() {
        isInHover = false;
        var eventNames = [tf.consts.DOMEventNamesMouseEnter, tf.consts.DOMEventNamesMouseLeave];
        var settingsUse = tf.js.ShallowMerge(settings, { eventNames: eventNames, onPreNotify: onPreNotify, preNotifyScope: theThis });
        tf.events.MultiDOMEventListener.call(theThis, settingsUse);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.events.DOMMouseEnterLeaveListener, tf.events.MultiDOMEventListener);

/**
 * @public
 * @class
 * @summary DOM MouseEnterLeave Listener instances report [MouseEnter]{@link tf.consts.DOMEventNamesMouseEnter} and [MouseLeave]{@link tf.consts.DOMEventNamesMouseLeave} 
 * [DOM Events]{@link DOMEvent} to a given callback
 * @param {tf.types.DOMHoverListenerSettings} settings - creation settings
 * @extends {tf.events.MultiDOMEventListener}
 */
tf.events.DOMFocusBlurListener = function (settings) {

    var theThis, hasFocus;

    /**
     * @public
     * @function
     * @summary - Checks if the last event received was a [Focus]{@link tf.consts.DOMEventNamesFocus} event
     * @returns {boolean} - | {@link boolean} <b>true</b> if the last event was a Focus event, <b>false</b> otherwise
    */
    this.GetHasFocus = function () { return hasFocus; }

    function onPreNotify(notification) {
        //if (notification.event.target == theThis.GetTarget()) {
            switch (notification.eventName) {
                case tf.consts.DOMEventNamesFocus:
                    hasFocus = notification.hasFocus = true;
                    break;
                case tf.consts.DOMEventNamesBlur:
                    hasFocus = notification.hasFocus = false;
                    break;
            }
        //}
    }

    function initialize() {
        hasFocus = false;
        var eventNames = [tf.consts.DOMEventNamesFocus, tf.consts.DOMEventNamesBlur];
        var settingsUse = tf.js.ShallowMerge(settings, { eventNames: eventNames, onPreNotify: onPreNotify, preNotifyScope: theThis });
        tf.events.MultiDOMEventListener.call(theThis, settingsUse);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.events.DOMFocusBlurListener, tf.events.MultiDOMEventListener);

/**
 * Notifications sent by {@link tf.events.DOMMouseListener} contain the properties of {@link tf.types.MultiDOMEventListenerNotification} plus:
 * @public
 * @typedef {object} tf.types.DOMMouseListenerNotification
 * @property {boolean} isInHover - <b>true</b> if the mouse pointer is currently hovering <b>target</b>, <b>false</b> otherwise
 * @property {boolean} isInDrag - <b>true</b> if the mouse pointer is currently down, <b>false</b> otherwise
 * @property {tf.types.pixelCoordinates} mouseCoords - the mouse pointer coordinates associated with the event
*/

/**
 * A callback function that can be used in the creation of instances of [DOM Mouse Listener]{@link tf.events.DOMMouseListener}
 * @public
 * @callback tf.types.DOMMouseListenerCallBack
 * @param {tf.types.DOMMouseListenerNotification} notification - the notification
 * @returns {void} - | {@link void} no return value
 */

/**
 * Settings used in the creation of [DOM Mouse Listener]{@link tf.events.DOMMouseListener} instances
 * @public
 * @typedef {object} tf.types.DOMMouseListenerSettings
 * @property {HTMLElementLike} target - the element whose hover events will be monitored
 * @property {tf.types.DOMMouseListenerCallBack} callBack - to receive event notifications
 * @property {object} optionalScope - optional scope used with <b>callBack</b>
 * @property {object} callBackSettings - application defined properties, to be passed to <b>callBack</b> during notifications
*/

/**
 * @public
 * @class
 * @summary DOM Mouse Listener instances report [mouse pointer related events]{@link tf.types.DOMMouseEventName} to a given callback
 * @param {tf.types.DOMMouseListenerSettings} settings - creation settings
 * @extends {tf.events.MultiDOMEventListener}
 */
tf.events.DOMMouseListener = function (settings) {

    var theThis, isInHover, isInDrag, lastPos;

    /**
     * @public
     * @function
     * @summary - Checks if the mouse pointer is currently hovering <b>target</b>
     * @returns {bool} - | {@link bool} <b>true</b> if yes, <b>false</b> otherwise
    */
    this.GetIsInHover = function () { return isInHover; }

    /**
     * @public
     * @function
     * @summary - Checks if the mouse pointer is being dragged<b>target</b>
     * @returns {bool} - | {@link bool} <b>true</b> if yes, <b>false</b> otherwise
    */
    this.GetIsInDrag = function () { return isInDrag; }

    /**
     * @public
     * @function
     * @summary - Retrieves the mouse pointer position in the last event received and notified
     * @returns {tf.types.pixelCoordinates} - | {@link tf.types.pixelCoordinates} the last position
    */
    this.GetLastPos = function () { return lastPos; }

    function onPreNotify(notification) {
        lastPos = notification.mouseCoords = tf.events.GetMouseEventCoords(notification.event);
        switch (notification.eventName) {
            case tf.consts.DOMEventNamesMouseOver:
                isInHover = notification.isInHover = true;
                break;
            case tf.consts.DOMEventNamesMouseOut:
                isInHover = notification.isInHover = false;
                break;
            case tf.consts.DOMEventNamesMouseDown:
                isInDrag = notification.isInDrag = true;
                break;
            case tf.consts.DOMEventNamesMouseUp:
                isInDrag = notification.isInDrag = false;
                break;
        }
    }

    function initialize() {
        isInDrag = isInHover = false;
        lastPos = [0, 0];
        var settingsUse = tf.js.ShallowMerge(settings, { eventNames: tf.consts.allMouseEventNames, onPreNotify: onPreNotify, preNotifyScope: theThis });
        tf.events.MultiDOMEventListener.call(theThis, settingsUse);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.events.DOMMouseListener, tf.events.MultiDOMEventListener);

/**
 * @public
 * @class 
 * @summary The {@link singleton} instance of this class, obtainable by calling {@link tf.GetDocMouseListener},
 * sends notifications of [mouse related events]{@link tf.types.DOMMouseEventName} targetted to the HTML document.
*/
tf.events.DocMouseListener = function () {

    var theThis, mouseListener, callBack, optionalScope, callBackSettings;

    /**
     * @public
     * @function
     * @summary - Starts sending notifications to the given callback, using the optional scope and callback settings 
     * @param {tf.types.MultiDOMEventListenerCallBack} callBack - to receive event notifications
     * @param {object} optionalScope - optional scope used with <b>callBack</b>
     * @param {object} callBackSettings - optional application defined properties passed to <b>callBack</b> on notifications
     * @returns {void} - | {@link void} no return value
    */
    this.SetCapture = function (callBack, optionalScope, callBackSettings) { return setCapture(callBack, optionalScope, callBackSettings); }

    /**
     * @public
     * @function
     * @summary - Stops sending notifications to the callback previously set with the [SetCapture]{@link tf.events.DocMouseListener#SetCapture} function
     * @returns {void} - | {@link void} no return value
    */
    this.ReleaseCapture = function () { return releaseCapture(); }

    /**
     * @public
     * @function
     * @summary - Checks if notifications are currently being sent to a callback
     * @returns {bool} - | {@link bool} <b>true</b> if yes, <b>false</b> otherwise
    */
    this.GetIsCaptured = function () { return !!callBack; }

    function setCapture(callBackSet, optionalScopeSet, callBackSettingsSet) {
        releaseCapture();
        //tf.GetDebug().LogIfTest("docMouse: set capture");
        if (!!(callBack = tf.js.GetFunctionOrNull(callBackSet))) {
            mouseListener = new tf.events.DOMMouseListener({ target: document, callBack: onMouse, optionalScope: theThis, callBackSettings: undefined });
            optionalScope = optionalScopeSet;
            callBackSettings = callBackSettingsSet;
        }
    }

    function releaseCapture() {
        if (!!callBack) {
            //tf.GetDebug().LogIfTest("docMouse: release capture");
            callBack = optionalScope = callBackSettings = undefined;
            mouseListener.OnDelete();
        }
    }

    function onMouse(notification) {
        var retVal = true;

        if (!!callBack) {
            if ((retVal = callBack.call(optionalScope, notification)) === undefined) { retVal = true; }
            else if (retVal) { tf.events.StopDOMEvent(notification.event); }
        }

        return retVal;
    }

    function initialize() {
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * @public
 * @function
 * @summary - Retrieves the target of the DOM Event
 * @param {DOMEvent} ev - the event
 * @returns {HTMLElement} - | {@link HTMLElement} the event target
*/
tf.events.GetEventTarget = function (ev) { if (!!ev) { if (ev.srcElement) { return ev.srcElement; } else if (ev.originalTarget) { return ev.originalTarget; } } return null; }

/**
 * @public
 * @function
 * @summary - Retrieves the Pixel Coordinates associated with the mouse DOM Event
 * @param {DOMEvent} ev - the event
 * @returns {tf.types.pixelCoordinates} - | {@link tf.types.pixelCoordinates} the event's pixel coordinates
*/
tf.events.GetMouseEventCoords = function (ev) {
    if (tf.js.GetIsValidObject(ev)) {
        if (ev.offsetX !== undefined) { return [ev.offsetX, ev.offsetY] }
        else if (ev.layerX != undefined) { return [ev.layerX, ev.layerY]; }
    }
    return [0, 0];
}

/**
 * Notifications sent to DOM Event Listeners
 * @public
 * @typedef {object} tf.types.DOMEventListenerNotification
 * @property {DOMEvent} event - the event being notified
*/

/**
 * A callback function that can be used with the function [AddDOMEventListener]{@link tf.events.AddDOMEventListener}
 * @public
 * @callback tf.types.DOMEventListenerCallBack
 * @param {tf.types.DOMEventListenerNotification} notification - the notification
 * @returns {void} - | {@link void} no return value
 */

/**
 * @public
 * @function
 * @summary - Directs notifications of the given event name on the given target to the given callback, 
 * returns a [Dom Event Listener]{@link tf.events.DOMEventListener} instance
 * @param {HTMLElementLike} target - the element whose events will be notified
 * @param {tf.types.DOMEventName} eventName - the name of the event to listen for
 * @param {tf.types.DOMEventListenerCallBack} callBack - to receive event notifications
 * @returns {tf.events.DOMEventListener} - | {@link tf.events.DOMEventListener} the listener
*/
tf.events.AddDOMEventListener = function (target, eventName, callBack) {
    var listener = null;
    if (tf.js.GetFunctionOrNull(callBack)) {
        if (target = tf.dom.GetDOMEventListenerFrom(target)) {
            if (tf.js.GetIsNonEmptyString(eventName)) {
                if (target.addEventListener) { target.addEventListener(eventName, callBack, true); }
                else if (target.attachEvent) { target.attachEvent("on" + eventName, callBack); }
                else { target["on" + eventName] = callBack; }
                listener = new tf.events.DOMEventListener({ target: target, eventName: eventName, callBack: callBack });
            }
        }
    }
    return listener;
}

/**
 * @public
 * @function
 * @summary - Stops directing notifications of the given event name on the given target to the given callback
 * @property {HTMLElementLike} target - the element whose events are being notified
 * @property {tf.types.DOMEventName} eventName - the name of the event that is being listen for
 * @property {tf.types.DOMEventListenerCallBack} callBack - to stop receiving event notifications
 * @returns {void} - | {@link void} no return value
*/
tf.events.DelDOMEventListener = function (target, eventName, callBack) {
    if (tf.js.GetFunctionOrNull(callBack)) {
        if (target = tf.dom.GetDOMEventListenerFrom(target)) {
            if (tf.js.GetIsNonEmptyString(eventName)) {
                if (target.removeEventListener) { target.removeEventListener(eventName, callBack, true); }
                else if (target.detachEvent) { target.detachEvent("on" + eventName, callBack); }
                else { target["on" + eventName] = undefined; }
            }
        }
    }
}

/**
 * Settings used in the creation of [EventListener]{@link tf.events.EventListener} instances
 * @private
 * @typedef {object} tf.types.EventListenerSettings
 * @property {string} key - unique identifier
 * @property {function} deleteCallBack - a callback used by the listener to delete itself
*/

/**
 * @public
 * @class
 * @summary Applications do not create instances of this class directly. They are obtained from TerraFly API classes that include <b>AddListener</b> functions
 * @param {tf.types.EventListenerSettings} settings - event listener creation settings
 */
tf.events.EventListener = function (settings) {

    var theThis, onDeleteCallBack, key;

    /**
     * @public
     * @function
     * @summary - Removes this event listener
     * @returns {void} - | {@link void} no return value
    */
    this.OnDelete = function () { if (!!onDeleteCallBack) { var localRef = onDeleteCallBack; onDeleteCallBack = null; localRef(theThis); } }

    /**
     * @private
     * @function
     * @summary - Retrieves the listener's unique identifier
     * @returns {string} - | {@link string} the listener's unique identifier
    */
    this.GetKey = function () { return key; }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        key = settings.key;
        onDeleteCallBack = tf.js.GetFunctionOrNull(settings.deleteCallBack);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * Settings used in the creation of [Event Notifier]{@link tf.events.EventNotifier} instances
 * @public
 * @typedef {object} tf.types.EventNotifierSettings
 * @property {string} eventName - the application defined name of the event
*/

/**
 * @public
 * @class
 * @summary Event Notifier instances implement event notifications for a single application defined event name, provided on creation.
 * During their lifetime, Event Notifiers create [Event Listeners]{@link tf.event.EventListener} for given callback functions, 
 * and relay notifications to these callbacks upon request
 * @param {tf.types.EventNotifierSettings} settings - creation settings
 */
tf.events.EventNotifier = function (settings) {

    var theThis, eventName, listeners, keyCount, count;

    /**
     * @public
     * @function
     * @summary - Retrieves the name of the event provided in the creation of this Notifier instance
     * @returns {string} - | {@link string} the name
    */
    this.GetEventName = function () { return eventName; }

    /**
     * @public
     * @function
     * @summary - Adds the given callback to the list of notification recipients
     * @param {function} callBack - a function capable of receiving notifications sent by this Notifier instance
     * @returns {tf.events.EventListener} - | {@link tf.events.EventListener} an Event Listener
    */
    this.Add = function (callBack) { return add(callBack); }

    /**
     * @public
     * @function
     * @summary - Notifies [Event Listeners]{@link tf.event.EventListener} previously added to an event
     * @param {...*} notificationArgument - any number of arguments to be used in the notifications sent to listeners
     * @returns {void} - | {@link void} no return value
    */
    this.Notify = function () {
        for (var i in listeners) {
            try { listeners[i].callBackFunction.apply(undefined, arguments); }
            catch (e) {
                console.log('exception during EventNotifier notification');
            }
        }
    }

    /**
     * @public
     * @function
     * @summary - Removes all [Event Listeners]{@link tf.event.EventListener}
     * @returns {void} - | {@link void} no return value
    */
    this.OnDelete = function () { return onDelete(); }

    this.GetListenerCount = function () { return count; }

    function onDelete() { for (var i in listeners) { listeners[i].listener.OnDelete(); } listeners = []; }

    function isListener(theListener) { return !!theListener && theListener instanceof tf.events.EventListener; }

    function deleteCallBack(theListener) {
        if (isListener(theListener)) { var key = tf.js.MakeObjectKey(theListener.GetKey()); if (!!listeners[key]) { delete listeners[key]; } --count; }
    }

    function add(callbackFunction) {
        var listener = null;
        if (!!tf.js.GetFunctionOrNull(callbackFunction)) {
            ++count;
            ++keyCount;
            listeners[tf.js.MakeObjectKey(keyCount)] = { listener: listener = new tf.events.EventListener({ key: keyCount, deleteCallBack: deleteCallBack }), callBackFunction: callbackFunction };
        }
        return listener;
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        eventName = tf.js.GetNonEmptyString(settings.eventName, "");
        listeners = {};
        count = keyCount = 0;
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * Settings used in the creation of [Multi Event Notifier]{@link tf.events.MultiEventNotifier} instances
 * @public
 * @typedef {object} tf.types.MultiEventNotifierSettings
 * @property {enumerable<string>} eventNames - application defined event names for each of which an [Event Notifier]{@link tf.events.EventNotifier} instance is created
*/

/**
 * @public
 * @class
 * @summary Multi Event Notifier instances manage a variable number of [Event Notifiers]{@link tf.event.EventNotifier} 
 * automating listening and notification functionality for an arbitrary number of application defined event names, which may be specified
 * on creation and/or dynamically added and removed.
 * Instances of this class are used throughout the API (by [Maps]{@link tf.map.Map}, [Keyed Feature Lists]{@link tf.map.KeyedFeatureList}, [Keyed Lists]{@link tf.js.KeyedList}, etc.)
 * to implement listening and notification of their respective event names
 * @param {tf.types.MultiEventNotifierSettings} settings - creation settings
 */
tf.events.MultiEventNotifier = function (settings) {

    var theThis, notifiers;

    /**
     * @public
     * @function
     * @summary - Adds the given callback to the [Event Notifier]{@link tf.events.EventNotifier} associated with the given event name
     * @param {string} eventName - one of the event names associated with this Multi Event Notifier instance
     * @param {function} callBack - a function capable of receiving notifications sent by the Event Notifier associated with <b>eventName</b>
     * @returns {tf.events.EventListener} - | {@link tf.events.EventListener} an Event Listener, or {@link void} if <b>eventName</b> is not associated with this instance
    */
    this.AddListener = function (eventName, callBack) { return addListener(eventName, callBack); }

    /**
     * @public
     * @function
     * @summary - Adds one or more listeners for the given event names
     * @param {tf.types.EventNamesAndCallBacks} eventNamesAndCallBacks - the event names and callbacks
     * @returns {tf.types.EventNamesAndListeners} - | {@link tf.types.EventNamesAndListeners} the event names and listeners
    */
    this.AddListeners = function (eventNamesAndCallBacks) { return addListeners(eventNamesAndCallBacks); }

    /**
     * @public
     * @function
     * @summary - Notifies [Event Listeners]{@link tf.event.EventListener} previously added to the given event name
     * @param {string} eventName - one of the event names associated with this Multi Event Notifier instance
     * @param {...*} notificationArgument - any number of arguments to be used in the notifications sent to listeners
     * @returns {void} - | {@link void} no return value
    */
    this.Notify = function (eventName) {
        if (!!eventName && notifiers[eventName]) { notifiers[eventName].Notify.apply(null, Array.prototype.slice.call(arguments, 1)); }
    }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Event Notifier]{@link tf.event.EventNotifier} instance associated with the given event name, if any
     * @param {string} eventName - one of the event names associated with this Multi Event Notifier instance
     * @returns {tf.events.EventNofifier} - | {@link tf.events.EventNofifier} the Event Notifier, or {@link void} if <b>eventName</b> is not associated with this instance
    */
    this.GetNotifier = function (eventName) { return getNotifier(eventName); }

    /**
     * @public
     * @function
     * @summary - Adds an [Event Notifier]{@link tf.event.EventNotifier} instance associated with the given event name
     * @param {string} eventName - an application defined event name
     * @returns {tf.events.EventNofifier} - | {@link tf.events.EventNofifier} the Event Notifier
    */
    this.AddNotifier = function (eventName) { return addNotifier(eventName); }

    /**
     * @public
     * @function
     * @summary - Deletes the [Event Notifier]{@link tf.event.EventNotifier} instance associated with the given event name, if any
     * @param {string} eventName - an application defined event name
     * @returns {void} - | {@link void} no return value
    */
    this.DelNotifier = function (eventName) { return delNotifier(eventName); }

    /**
     * @public
     * @function
     * @summary - Removes all [Event Notifiers]{@link tf.event.EventNotifier}
     * @returns {void} - | {@link void} no return value
    */
    this.OnDelete = function () { return onDelete(); }

    function getNotifier(eventName) { return !!eventName ? notifiers[eventName] : null; }

    function addListener(eventName, callBackFunction) {
        var listener = null;
        if (!!eventName && !!callBackFunction) { if (!!notifiers[eventName]) { listener = notifiers[eventName].Add(callBackFunction); } }
        return listener;
    }

    function addListeners(eventNamesAndCallBacks) {
        var listeners = {};
        if (tf.js.GetIsValidObject(eventNamesAndCallBacks)) {
            for (var thisEventName in eventNamesAndCallBacks) {
                var listenerSet = getNotifier(thisEventName);
                if (!!listenerSet) {
                    var thisCallBack = tf.js.GetFunctionOrNull(eventNamesAndCallBacks[thisEventName]);
                    if (!!thisCallBack) { listeners[thisEventName] = listenerSet.Add(thisCallBack); }
                }
            }
        }
        return listeners;
    }

    function delNotifier(eventName) {
        if (!!eventName && !!notifiers[eventName]) { notifiers[eventName].OnDelete(); delete notifiers[eventName]; }
    }

    function addNotifier(eventName) {
        if (!!eventName) {
            if (!!notifiers[eventName]) {
                tf.GetDebug().LogIfTest('tf.events.MultiEventNotifier: adding duplicate listener for event name: ' + eventName);
            }
            else { notifiers[eventName] = new tf.events.EventNotifier({ eventName: eventName }); }
        }
    }

    function onDelete() { for (var i in notifiers) { delNotifier(i); } }

    function createListenerSets(eventNames) {
        notifiers = {}; if (!!eventNames && typeof eventNames === "object") { for (var i in eventNames) { addNotifier(eventNames[i]); } }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        createListenerSets(settings.eventNames);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * @public
 * @function
 * @summary - Deletes one or more listeners for the given event names
 * @param {tf.types.EventNamesAndListeners} eventNamesAndListeners - the event names and listeners
 * @returns {void} - | {@link void} no return value
*/
tf.events.DeleteListeners = function (eventNamesAndListeners) {
    if (tf.js.GetIsValidObject(eventNamesAndListeners)) {
        for (var i in eventNamesAndListeners) {
            var listener = eventNamesAndListeners[i];

            if (tf.js.GetIsInstanceOf(listener, tf.events.EventListener)) {
                listener.OnDelete();
                delete eventNamesAndListeners[i];
            }
        }
    }
}

/**
 * A JavaScript {@link object} whose single property name is an API event name and its value is a callBack function to receive notifications of that event
 * @public
 * @typedef {tf.types.EventNameAndCallBack} tf.types.EventNameAndCallBack
 * @property {string} callBack - an event name and callBack pair, the event name is the property name
 * @example
 * // Declares an association between the onMapMoveEnd callBack and the name of the tf.consts.mapMoveEndEvent event
 * var eventNameAndCallBack = {} ; eventNameAndCallBack[tf.consts.mapMoveEndEvent] = onMapMoveEnd;
 * @see {@link tf.types.EventNamesAndCallBacks}
 */

/**
 * An {@link enumerable} of {@link tf.types.EventNameAndCallBack} items that can be created as a group
 * @public
 * @typedef {tf.types.EventNamesAndCallBacks} tf.types.EventNamesAndCallBacks
 * @example
 * // Add listeners to 3 map events
 * var eventNamesAndCallBacks = {} ;
 * eventNamesAndCallBacks[tf.consts.mapMoveEndEvent] = onMapMoveEnd;
 * eventNamesAndCallBacks[tf.consts.mapMouseMoveEvent] = onMapMouseMoveOrClick;
 * eventNamesAndCallBacks[tf.consts.mapClickEvent] = onMapMouseMoveOrClick;
 * var eventNamesAndListeners = [map]{@link tf.map.Map}.[AddListeners]{@link tf.map.Map#AddListeners}(eventNamesAndCallBacks);
 * // When the listeners are no longer needed, dispose of them as a group
 * [tf.events.DeleteListeners]{@link tf.events.DeleteListeners}(eventNamesAndListeners);
 * @see [map]{@link tf.map.Map}[AddListeners]{@link tf.map.Map#AddListeners}
 * @see [DeleteListeners]{@link tf.events.DeleteListeners}
 */


/**
 * A JavaScript {@link object} whose single property name is an API event name and its value is an instance of [EventListener]{@link tf.events.EventListener}. 
 * Applications do not create these objects direction, they are obtained by calling API functions that create and return them.
 * @public
 * @typedef {tf.types.EventNameAndListener} tf.types.EventNameAndListener
 * @property {string} theEventListener - an event name and listener par
 * @see {@link tf.types.EventNamesAndCallBacks}
 */


/**
 * An {@link enumerable} of {@link tf.types.EventNameAndListener} items that can be disposed of as a group
 * @public
 * @typedef {tf.types.EventNamesAndListeners} tf.types.EventNamesAndListeners
 * @see [map]{@link tf.map.Map}[AddListeners]{@link tf.map.Map#AddListeners}
 * @see [DeleteListeners]{@link tf.events.DeleteListeners}
 */

