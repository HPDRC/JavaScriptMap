"use strict";

/**
 * class tf.ui.HorSplitter - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} splitterObj - parameter description?
 * @param {?} topObj - parameter description?
 * @param {?} botObj - parameter description?
 * @param {?} resizeCallBack - parameter description?
 * @param {?} resizeCallBackThis - parameter description?
*/
tf.ui.HorSplitter = function (splitterObj, topObj, botObj, resizeCallBack, resizeCallBackThis) {

    var theThis = null;

    var docMouse = tf.GetDocMouseListener();

    var splitterDiv, topDiv = null, botDiv = null;
    var mouseListenerSplitter = null;
    var mouseListenerDoc = null;

    var isDragging = false;
    var releaseEventName = docMouse.GetReleaseEventName();

/**
 * method tf.ui.HorSplitter.GetIsDragging - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetIsDragging = function () { return isDragging; }

    var heightTop = null;
    var heightBot = null;

    var yStartDrag = null;

    function startDrag(event) {
        tf.GetDebug().LogIfTest("Splitter Start");
        stopDrag();
        docMouse.SetCapture(onMouseOnSplitter, theThis, null);
        isDragging = true;
        heightTop = topDiv.offsetHeight;
        heightBot = botDiv.offsetHeight;
        yStartDrag = event.screenY;
    }

    function continueDrag(event, eventName) {
        if (isDragging) {
            tf.GetDebug().LogIfTest("Splitter Drag: " + eventName);
            var yDrag = event.screenY;
            var offset = yDrag - yStartDrag;
            var newHeightTop = heightTop + offset;
            var newHeightBot = heightBot - offset;
            topDiv.style.height = newHeightTop + "px";
            botDiv.style.height = newHeightBot + "px";
            notifyResize();
        }
    }

    function stopDrag() {
        if (isDragging) {
            docMouse.ReleaseCapture();
            tf.GetDebug().LogIfTest("Splitter Stop");
            isDragging = false;
        }
    }

    function onMouseOnSplitter(mouseListener, argumentsArray, event, eventName, posX, posY) {
        tf.GetDebug().LogIfTest('needs adjust parameters');
        if (isDragging) { if (eventName == 'mouseup' || eventName == "touchend" || eventName == "touchcancel") { stopDrag(); } else if (eventName != releaseEventName) { continueDrag(event, eventName); } }
        else if (eventName == 'mousedown' || eventName == "touchstart") { startDrag(event); }
        return isDragging;
    }

    function notifyResize() { if (!!resizeCallBack) { resizeCallBack.call(resizeCallBackThis, theThis); } }

    function initialize() {
        resizeCallBack = typeof resizeCallBack === "function" ? resizeCallBack : null;
        splitterDiv = splitterObj.GetHTMLElement();
        topDiv = topObj.GetHTMLElement();
        botDiv = botObj.GetHTMLElement();
        mouseListenerSplitter = new tf.events.DOMMouseListener({ target: splitterDiv, callBack: onMouseOnSplitter, optionalScope: theThis, callBackSettings: undefined });
    }

    (function actualConstructor(theThisSet) {
        theThis = theThisSet;
        initialize();
    })(this);
};
