"use strict";

/**
 * method tf.map.ui.CreateMapButtonTextSpan - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} innerHTML - parameter description?
*/
tf.map.ui.CreateMapButtonTextSpan = function (innerHTML) {
    var span = document.createElement('span'); span.className = "ol-button-text-span";
    span.innerHTML = tf.js.GetNonEmptyString(innerHTML) ? innerHTML : "";
    return span;
}

/**
 * class tf.map.ui.CustomControl - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} tMap - parameter description?
 * @param {?} className - parameter description?
 * @param {?} innerHTML - parameter description?
 * @param {?} callBack - parameter description?
 * @param {?} opt_options - parameter description?
*/
tf.map.ui.CustomControl = function (tMap, className, innerHTML, callBack, opt_options) {

/**
 * method tf.map.ui.CustomControl.GetHTMLElement - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetHTMLElement = function () { return divElement; }

/**
 * method tf.map.ui.CustomControl.GetButton - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetButton = function () { return button; }
/**
 * method tf.map.ui.CustomControl.ChangeTitle - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} str - parameter description?
 * @param {?} tooltipStr - parameter description?
*/
    this.ChangeTitle = function (str, tooltipStr) { if (button) { button.innerHTML = str; button.title = tooltipStr; } }
/**
 * method tf.map.ui.CustomControl.ChangeToolTip - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} tooltipStr - parameter description?
*/
    this.ChangeToolTip = function (tooltipStr) { if (button) { button.title = tooltipStr; } }

    var options = tf.js.GetValidObjectFrom(opt_options);
    var tipLabel = options.tipLabel ? options.tipLabel : '';
    var imageLabel = options.imageLabel ? options.imageLabel : null;
    var button = document.createElement('button');
    var divElement = document.createElement('div');
    var onClick = null;

    button.title = tipLabel;

    if (imageLabel) { imageLabel.AppendTo(button); }
    else { button.appendChild(tf.map.ui.CreateMapButtonTextSpan(innerHTML)); }

    if (callBack) {
        new tf.events.DOMClickListener({ target: button, callBack: callBack, optionalScope: undefined, callBackSettings: undefined });
    }

    typeof className !== "string" && (className = '');

    divElement.style.zIndex = 1;
    divElement.className = className + " ol-unselectable ol-control";
    divElement.appendChild(button);

    ol.control.Control.call(this, {
        target: opt_options.target,
        hover: false, highlightOnly: false, element: divElement
    });
};
tf.js.InheritFrom(tf.map.ui.CustomControl, ol.control.Control);

/**
 * class tf.map.ui.CustomLogo - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} tMap - parameter description?
 * @param {?} className - parameter description?
 * @param {?} opt_options - parameter description?
*/
tf.map.ui.CustomLogo = function (tMap, className, opt_options) {

/**
 * method tf.map.ui.CustomLogo.GetHTMLElement - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetHTMLElement = function () { return divElement; }

    var options = tf.js.GetValidObjectFrom(opt_options);
    var imageLabel = options.imageLabel ? options.imageLabel : null;
    var divElement = document.createElement('div');
    var innerHTML = options.innerHTML;

    typeof className !== "string" && (className = '') ;

    divElement.className = className + " ol-unselectable";
    if (imageLabel) { imageLabel.AppendTo(divElement); }

    if (innerHTML != undefined) {
        divElement.innerHTML = innerHTML;
    }

    ol.control.Control.call(this, { hover: false, highlightOnly: false, element: divElement });
};
tf.js.InheritFrom(tf.map.ui.CustomLogo, ol.control.Control);