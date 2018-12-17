"use strict";

tf.webgl = {

};

tf.g_WebGL = null;

tf.webgl.GetWebGL = function () { if (!tf.g_WebGL) { tf.g_WebGL = new tf.webgl.WebGL(); } return tf.g_WebGL; }

tf.webgl.WebGL = function (settings) {
    var theThis, contextName, requestAnimFrame, cancelAnimFrame;

    this.RequestAnimFrame = function (callback, element) {
        return tf.js.GetFunctionOrNull(callback) ? requestAnimFrame(callback, element) : undefined;
    }
    this.CancelAnimFrame = function (requestID) { return requestID !== undefined ? cancelAnimFrame(requestID) : undefined; }

    this.GetHasWebGL = function () { return getHasWebGL(); }

    this.GetContextName = function () { return contextName; }

    function getHasWebGL() { return contextName !== undefined; }

    function getContextName() {
        var contextNames = ['experimental-webgl', 'webgl', 'webkit-3d', 'moz-webgl'];
        var canvas = document.createElement('canvas');
        for (var i in contextNames) {
            try {
                var cn = contextNames[i], context = canvas.getContext(cn);
                if (!!context && tf.js.GetFunctionOrNull(context.getParameter)) {
                    contextName = cn;
                    break;
                }
            }
            catch (e) { }
        }
    }

    function initialize() {
        requestAnimFrame = window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
                    return window.setTimeout(callback, 1000 / 60);
                };
        cancelAnimFrame = window.cancelAnimationFrame ||
                window.webkitCancelAnimationFrame ||
                window.mozCancelAnimationFrame ||
                window.oCancelAnimationFrame ||
                window.msCancelAnimationFrame ||
                window.clearTimeout;
        if (window.WebGLRenderingContext) {
            getContextName();
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
