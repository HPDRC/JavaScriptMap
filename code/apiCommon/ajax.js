"use strict";

/**
 * Notifications sent by {@link tf.ajax.GetRequest} instances
 * @public
 * @typedef {object} tf.types.AjaxNotification
 * @property {tf.ajax.GetRequest} sender - the instance sending the notification
 * @property {object} httpRequest - the request object
 * @property {object} requestProps - the object that was used in the creation of the [GetRequest]{@link tf.ajax.GetRequest} instance
*/

/**
 * A callback function that can be used in the creation of instances of [GetRequest]{@link tf.ajax.GetRequest}
 * @public
 * @callback tf.types.AjaxCallBack
 * @param {tf.types.AjaxNotification} notification - the notification
 * @returns {void} - | {@link void} no return value
 */

/**
 * Settings used in the creation of [GetRequest]{@link tf.ajax.GetRequest} instances
 * @public
 * @typedef {object} tf.types.AjaxSettings
 * @property {string} url - the url to access
 * @property {tf.types.AjaxCallBack} onDataLoaded - the callback function that receives the data after it is retrieved
 * @property {boolean} useRedirect - if set to <b>true</b> the request is sent using a redirect proxy, to avoid cross domain violations
 * @property {string} overrideMimeType - a string containing the desired Mime type of the resource being retrieved
 * @property {object} requestProps - an object that will be passed to the callback function
 * @property {boolean} autoSend - if set to <b>true</b> the request is sent automatically upon creation of the {@link tf.ajax.GetRequest} instance, defaults to <b>false</b>
 * @property {object} optionalScope - optional scope used when applying the callback function
*/

/**
 * @public
 * @class
 * @summary Create an instance of this class to retrieve data from a given url pointing to a service or data file
 * @param {tf.types.AjaxSettings} settings - request creation settings
 */
tf.ajax.GetRequest = function (settings) {

    var theThis, httpRequest, urlToDownload, onDataLoaded, requestProps, autoSendBool, wasSent, wasAborted, wasReceived, isValid, overrideMimeType, usePost, postParams, contentType, requestHeaders;

    /**
     * @public
     * @function
     * @summary - Sends the request if it is valid and has not been previously sent
     * @returns {void} - | {@link void} no return value
    */
    this.Send = function () { return send(); }

    /**
     * @public
     * @function
     * @summary - Cancels the request if it is in progress
     * @returns {void} - | {@link void} no return value
    */
    this.Cancel = function () { return cancel(); }

    /**
     * @public
     * @function
     * @summary - Checks if the request was cancelled
     * @returns {boolean} - | {@link boolean } <b>true</b> if the request was cancelled, <b>false</b> otherwise
    */

    this.WasCancelled = function () { return wasAborted; }
    /**
     * @public
     * @function
     * @summary - Checks if the request is valid
     * @returns {boolean} - | {@link boolean } <b>true</b> if the request if valid, <b>false</b> otherwise
    */
    this.GetIsValid = function () { return isValid; }

    /**
     * @public
     * @function
     * @summary - Checks if the request was sent
     * @returns {boolean} - | {@link boolean } <b>true</b> if the request was sent, <b>false</b> otherwise
    */
    this.WasSent = function () { return wasSent; }

    /**
     * @public
     * @function
     * @summary - Checks if the request is in progress (was sent, but a response has not been received)
     * @returns {boolean} - | {@link boolean } <b>true</b> if the request is in progress, <b>false</b> otherwise
    */
    this.GetIsInProgress = function () { return getIsInProgress(); }

    /**
     * @public
     * @function
     * @summary - Checks if a response for the request was received
     * @returns {boolean} - | {@link boolean } <b>true</b> if a response was received, <b>false</b> otherwise
    */
    this.WasReceived = function () { return wasReceived; }

    function getIsInProgress() { return wasSent && !wasAborted && !wasReceived; }
    function send() {
        if (!wasSent && isValid) {
            try {
                var verb = usePost ? 'POST' : 'GET';
                httpRequest.open(verb, urlToDownload, true);
                if (httpRequest.setRequestHeader) {
                    if (contentType != undefined) { httpRequest.setRequestHeader("Content-type", contentType); }
                    if (!!requestHeaders) {
                        for (var key in requestHeaders) {
                            var value = requestHeaders[key];
                            if (!!value) {
                                httpRequest.setRequestHeader(key, value);
                            }
                        }
                    }
                }
                httpRequest.onreadystatechange = onReadyStateChange;
                httpRequest.send(postParams);
            }
            catch (Exception) {
                isValid = false;
            }
            wasSent = isValid;
            if (!isValid) { notify(undefined, requestProps); }
        }
    }
    function cancel() { if (getIsInProgress()) { if (httpRequest) { httpRequest.abort(); httpRequest = null; wasAborted = true; } } }

    function notify(httpRequest, requestProps) {
        if (!!onDataLoaded) {
            try {
                onDataLoaded.call(settings.optionalScope, { sender: theThis, httpRequest: httpRequest, requestProps: requestProps });
            }
            catch (e) {
                //console.log('exception during AJAX notification: ' + e.message);
                console.log('exception during AJAX notification: ' + e);
            }
        }
    }

    function onReadyStateChange() {
        if (!wasAborted) {
            if (httpRequest.readyState == 4) {
                //if (!!onDataLoaded) { onDataLoaded(httpRequest, httpRequest.status, requestProps); }
                //if (!!onDataLoaded) { onDataLoaded.call(settings.optionalScope, { sender: theThis, httpRequest: httpRequest, requestProps: requestProps }); }
                notify(httpRequest, requestProps);
                wasReceived = true;
                httpRequest = null;
            }
            else {
                //tf.GetDebug().LogIfTest( "state:" + httpRequest.readyState);
                //	0: not initialized.
                //	1: connection established.
                //	2: request received.
                //	3: answer in process.
                //	4: finished.
            }
        }
    }

    function createHttpRequest() {
        if (window.XMLHttpRequest) {
            // Mozilla, Safari,...
            try {
                httpRequest = new XMLHttpRequest({ mozSystem: true });
                if (httpRequest.overrideMimeType) {
                    if (!!overrideMimeType) { httpRequest.overrideMimeType(overrideMimeType); }
                }
            }
            catch (e) { httpRequest = null; }
        }
        else if (window.ActiveXObject) {
            // IE
            try { httpRequest = new ActiveXObject("Msxml2.XMLHTTP"); }
            catch (e) { try { httpRequest = new ActiveXObject("Microsoft.XMLHTTP"); } catch (e) { httpRequest = null; } }
        }
        //if (httpRequest) { httpRequest.onreadystatechange = onReadyStateChange; } else { isValid = false; }
        isValid = !!httpRequest;
    }

    function initialize() {
        wasSent = wasAborted = wasReceived = false;
        onDataLoaded = tf.js.GetFunctionOrNull(settings.onDataLoaded);
        urlToDownload = tf.js.GetNonEmptyString(settings.url, null);
        if (isValid = (!!urlToDownload && !!onDataLoaded)) {
            if (!!settings.useRedirect) { urlToDownload = tf.platform.GetURL() + "RedirectStream.aspx?URL=" + escape(urlToDownload); }
            //tf.GetDebug().LogIfTest(urlToDownload);
            overrideMimeType = tf.js.GetNonEmptyString(settings.overrideMimeType, 'text/xml');
            requestProps = settings.requestProps;
            autoSendBool = !!settings.autoSend;
            usePost = !!settings.usePost;
            postParams = !!settings.postParams ? settings.postParams : null;
            contentType = settings.contentType;
            requestHeaders = settings.requestHeaders;
            createHttpRequest();
            if (!!autoSendBool) {
                if (isValid) { send(); }
                else { setTimeout(function () { notify(undefined, requestProps); }, 10); }
            }
        }
    }

    (function construct(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * Notifications sent by {@link tf.ajax.JSONGet} instances
 * @public
 * @typedef {object} tf.types.JSONNotification
 * @property {tf.ajax.JSONGet} sender - the instance sending the notification
 * @property {object} data - the JavaScript object obtained from the JSON data
 * @property {object} requestProps - the object that was used in the call to {tf.ajax.JSONGet#Request}
*/

/**
 * A callback function that can be passed to the function {@link tf.ajax.JSONGet#Request} to receive the result of the request
 * @public
 * @callback tf.types.JSONCallBack
 * @param {tf.types.JSONNotification} notification - the notification
 * @returns {void} - | {@link void} no return value
 */

/**
 * A callback function that can be passed to the function {@link tf.ajax.JSONGet#Request} to provide an url string
 * @public
 * @callback tf.types.GetUrlFunction
 * @returns {string} - | {@link string} an url string
 */

/**
 * @public
 * @class
 * @summary Create an instance of this class to retrieve JavaScript objects from JSON data obtained from a given url pointing to a service or data file
 */
tf.ajax.JSONGet = function () {

    var theThis, downloadObj, callBack, optionalScope, overrideMimeType, JSONDecode;

    /**
     * @public
     * @function
     * @summary - Sends the request specified by the parameters
     * @param {string | tf.types.GetUrlFunction} url - the url to access, either the url string itself or a function that returns an url string
     * @param {tf.types.JSONCallBack} onDataLoaded - the callback function that receives the JavaScript object after it is retrieved
     * @param {object} optionalScope - optional scope used when applying the callback function
     * @param {object} requestProps - an object that will be passed to the callback function
     * @param {boolean} useRedirect - if set to <b>true</b> the request is sent using a redirect proxy, to avoid cross domain violations
     * @returns {void} - | {@link void} no return value
    */
    this.Request = function (url, onDataLoaded, optionalScope, requestProps, useRedirect, overrideMimeType, JSONDecode, postParams, requestHeaders) {
        return request(url, onDataLoaded, optionalScope, requestProps, useRedirect, overrideMimeType, JSONDecode, postParams, requestHeaders);
    }

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
     * @summary - Cancels the request if it is in progress
     * @returns {void} - | {@link void} no return value
    */
    this.Cancel = function () { return cancel(); }

    function cancel() { if (downloadObj) { downloadObj.Cancel(); downloadObj = null; } }

    function request(fromURL, callBackSet, optionalScopeSet, requestPropsSet, useRedirectSet, overrideMimeType, JSONDecode, postParams, requestHeaders) {
        if (tf.js.GetFunctionOrNull(fromURL)) { fromURL = fromURL(); }

        if (tf.js.GetNonEmptyString(fromURL)) {

            //tf.GetDebug().LogIfTest(fromURL);

            var mimeType = tf.js.GetNonEmptyString(overrideMimeType, 'application/json');
            var decode = tf.js.GetFunctionOrNull(JSONDecode);

            callBack = tf.js.GetFunctionOrNull(callBackSet);
            optionalScope = optionalScopeSet;
            cancel();
            var usePost, contentType;
            //if (postParams != undefined) { usePost = true, contentType = "application/json"; }
            if (postParams != undefined) { usePost = true, contentType = "application/json; charset=utf-8"; }
            downloadObj = new tf.ajax.GetRequest({
                optionalScope: theThis, url: fromURL, onDataLoaded: onDataLoaded,
                requestProps: { clientProps: requestPropsSet, JSONDecode: decode },
                contentType: contentType,
                usePost: usePost,
                postParams: postParams,
                requestHeaders: requestHeaders,
                overrideMimeType: mimeType, useRedirect: useRedirectSet, autoSend: true
            });
        }
    }

    function onDataLoaded(notification) {
        downloadObj = null;
        var notificationProps = notification.requestProps;
        var decode = notificationProps.JSONDecode;
        var data, httpRequest = notification.httpRequest;
        if (httpRequest.status >= 200 && httpRequest.status < 300 || httpRequest.status === 304) {
            if (!!decode) { data = decode(httpRequest); }
            else { data = httpRequest.responseText; if (!!data) { data = tf.js.JSONParse(data); } }
        }
        if (!!callBack) { callBack.call(optionalScope, { sender: theThis, data: data, requestProps: notificationProps.clientProps }); }
        data = null;
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; })(this);
};

/**
 * A callback function that can be used in the creation of instances of {@link tf.ajax.PeriodicJSONGet}
 * @public
 * @callback tf.types.PeriodicJSONCallBack
 * @param {tf.types.PeriodicJSONNotification} notification - the notification
 * @returns {void} - | {@link void} no return value
 */


/**
 * Notifications sent by {@link tf.ajax.PeriodicJSONGet} instances
 * @public
 * @typedef {object} tf.types.PeriodicJSONNotification
 * @property {tf.ajax.PeriodicJSONGet} sender - the instance sending the notification
 * @property {object} data - the JavaScript object obtained from the JSON data
 * @property {object} requestProps - the object that was used in the creation of the call to {tf.ajax.JSONGet#Request}
*/

/**
 * Settings used in the creation of {@link tf.ajax.PeriodicJSONGet} instances
 * @public
 * @typedef {object} tf.types.PeriodicJSONSettings
 * @property {string | tf.types.GetUrlFunction} url - the url to access, either the url string itself or a function that returns an url string
 * @property {tf.types.PeriodicJSONCallBack} OnRefresh - the callback function that receives JavaScript objects that are retrieved
 * @property {object} optionalScope - optional scope used when applying the callback function
 * @property {boolean} autoRefresh - if set to <b>true</b> requests are sent periodically
 * @property {number} refreshMillis - The desired number of milliseconds between periodic refreshes
 * @property {boolean} useRedirect - if set to <b>true</b> requests are sent using a redirect proxy, to avoid cross domain violations
 *
*/

/**
 * @public
 * @class
 * @summary Create an instance of this class to periodically retrieve JavaScript objects from JSON data obtained from a given url pointing to a service or data file
 * @param {tf.types.PeriodicJSONSettings} settings - request creation settings
 */
tf.ajax.PeriodicJSONGet = function (settings) {

    var theThis, refreshCallBack, isDeleted, lastRefreshTime, actualLastRefreshTime, refreshTimeoutObj;
    var downloadObj, lastData, lastProps, minRefreshTimeOut, maxRefreshTimeOut, defRefreshTimeOut, optionalScope, url, useRedirect, refreshTimeOutMillis, autoRefresh;
    var JSONDecode, postParams, requestHeaders;

    var debug;

    /**
     * @public
     * @function
     * @summary - Returns the last time a JavaScript object was retrieved
     * @returns {Date} - | {@link Date} a Date
    */
    this.GetLastRefreshTime = function () { return actualLastRefreshTime; }

    /**
     * @public
     * @function
     * @summary - Checks if the request is in progress (was sent, but a response has not been received)
     * @returns {boolean} - | {@link boolean } <b>true</b> if the request is in progress, <b>false</b> otherwise
    */
    this.GetIsRefreshing = function () { return !!downloadObj && downloadObj.GetIsInProgress(); }

    /**
     * @public
     * @function
     * @summary - This function must be called when the {@link tf.ajax.PeriodicJSONGet} instance is no longer needed
     * @returns {void} - | {@link void} no return value
    */
    this.OnDelete = function () { return onDelete(); }

    /**
     * @public
     * @function
     * @summary - Call this function to change the callBack function
     * @param {tf.types.PeriodicJSONCallBack} newRefreshCallBack - a new callback function to receive JavaScript objects
     * @returns {void} - | {@link void} no return value
    */
    this.ChangeCallBack = function (newRefreshCallBack) { return changeCallBack(newRefreshCallBack); }

    /**
     * @public
     * @function
     * @summary - Triggers an immediate refresh
     * @returns {void} - | {@link void} no return value
    */
    this.RefreshNow = function () { return onRefresh(); }

    /**
     * @public
     * @function
     * @summary - Cancels the current request if one is in progress
     * @returns {void} - | {@link void} no return value
    */
    this.Cancel = function () { return cancel(); }

    this.RefreshFromData = function (data) {
        lastData = data;
        notifyRefreshCallBack();
    };

    function cancel() { if (downloadObj) { downloadObj.Cancel(); } }

    function onDelete() {
        isDeleted = true;
        if (downloadObj) { downloadObj.Cancel(); }
        destroyRefreshTimeOut();
        refreshCallBack = null;
    }

    function notifyRefreshCallBack() {
        if (!!refreshCallBack) {
            try {
                refreshCallBack.call(optionalScope, { sender: theThis, data: lastData }); lastData = null;
            }
            catch (e) {
                console.log('exception during Periodic notification');
            }
        }
    }

    function onDataLoaded(notification) {
        if (notification.requestProps == lastProps) {
            actualLastRefreshTime = lastRefreshTime = new Date();
            lastData = notification.data;
            //if (!!debug) { debug.LogIfTest("lastProps: " + lastProps); }
            if (lastProps > 10000) { lastProps = 0; }
            //setTimeout(notifyRefreshCallBack, 10);
            notifyRefreshCallBack();
            resetRefreshTimeout();
        }
        else { if (!!debug) { debug.LogIfTest("PeriodicJSONGet: skipping stale response: " + notification.requestProps + ' last requested ' + lastProps); } }
    }

    function onRefresh() { downloadObj.Request(url, onDataLoaded, theThis, lastProps = ++lastProps, useRedirect, undefined, JSONDecode, postParams, requestHeaders); }
    function destroyRefreshTimeOut() { if (!!refreshTimeoutObj) { clearTimeout(refreshTimeoutObj); refreshTimeoutObj = null; } }
    function resetRefreshTimeout() { destroyRefreshTimeOut(); if (!!autoRefresh) { refreshTimeoutObj = setTimeout(onRefresh, refreshTimeOutMillis); } }

    function doSetRefreshTimeOutMillis(newRefreshTimeOutMillis) {
        refreshTimeOutMillis = tf.js.GetFloatNumberInRange(newRefreshTimeOutMillis, minRefreshTimeOut, maxRefreshTimeOut, defRefreshTimeOut);
    }

    function setRefreshTimeOutMillis(newRefreshTimeOutMillis) {
        doSetRefreshTimeOutMillis(newRefreshTimeOutMillis);
        resetRefreshTimeout();
        if (!!lastRefreshTime) { lastRefreshTime = new Date(); }
    }

    function changeCallBack(newRefreshCallBack) { if (!isDeleted) { refreshCallBack = tf.js.GetFunctionOrNull(newRefreshCallBack); } }

    function setAutoRefresh(autoRefreshSet) { autoRefresh = tf.js.GetBoolFromValue(autoRefreshSet, true); }

    function initialize() {
        debug = tf.GetDebug();

        JSONDecode = settings.JSONDecode;
        postParams = settings.postParams;
        requestHeaders = settings.requestHeaders;
        optionalScope = settings.optionalScope;
        url = settings.url;
        useRedirect = tf.js.GetBoolFromValue(settings.useRedirect, false);

        setAutoRefresh(settings.autoRefresh);

        lastProps = 0;
        minRefreshTimeOut = 1000; // two seconds
        maxRefreshTimeOut = 1000 * 60 * 60 * 24; // once a day
        defRefreshTimeOut = 5 * minRefreshTimeOut;
        downloadObj = new tf.ajax.JSONGet();
        isDeleted = false;
        changeCallBack(settings.onRefresh);

        if ((!!refreshCallBack) && (!!url)) { setRefreshTimeOutMillis(settings.refreshMillis); }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

