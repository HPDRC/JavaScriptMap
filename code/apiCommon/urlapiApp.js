"use strict";

tf.urlapi.URLAPIApp = function (settings) {
    var theThis, onCreatedCallBack;

    function onMapCreated(notification) {
        if (!!onCreatedCallBack) { onCreatedCallBack(notification); }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);

        onCreatedCallBack = tf.js.GetFunctionOrNull(settings.onCreated);

        var params = tf.urlapi.ParseURLAPIParameters(settings.fullURL);

        settings.fullURL = params;
        //settings.fullURL[tf.consts.mapLayerSourceName] = 'http://tile.openstreetmap.org/{z}/{x}/{y}.png';
        settings.onCreated = onMapCreated;
        tf.urlapi.SingleMapSinglePaneApp.call(theThis, settings);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.urlapi.URLAPIApp, tf.urlapi.SingleMapSinglePaneApp);
