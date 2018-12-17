"use strict";

/**
 * class tf.map.ui.MessagePopup - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} container - parameter description?
*/
tf.map.ui.MessagePopup = function (container) {

    var theThis = null;

    var colorMsgPin = null;
    var colorTextPin = null;
    var popup = null;
    var divTitle = null;
    var colorPopupSaved = null;

/**
 * method tf.map.ui.MessagePopup.SetOnClickTitle - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} callBack - parameter description?
 * @param {?} optionalScope - parameter description?
*/
    this.SetOnClickTitle = function (callBack, optionalScope) { if (popup) { popup.SetOnClickTitle(callBack, optionalScope); } }

/**
 * method tf.map.ui.MessagePopup.ShowTitleColorInfo - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} bool - parameter description?
*/
    this.ShowTitleColorInfo = function (bool) {
        if (!!divTitle) {
            bool = !!bool;
            var colorUse = !!bool ? colorMsgPin : colorPopupSaved;
            divTitle.style.backgroundColor = colorUse;
            popup.SetTitleToolTip(bool ? "Close" : "Pin");
        }
    }

/**
 * method tf.map.ui.MessagePopup.SetZIndex - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} zIndex - parameter description?
*/
    this.SetZIndex = function (zIndex) { popup && popup.SetZIndex(zIndex); }
/**
 * method tf.map.ui.MessagePopup.GetZIndex - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetZIndex = function () { return popup ? popup.GetZIndex() : 0; }

/**
 * method tf.map.ui.MessagePopup.SetOnClose - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} callBack - parameter description?
 * @param {?} optionalScope - parameter description?
*/
    this.SetOnClose = function (callBack, optionalScope) { popup.SetOnClose(callBack, optionalScope); }

/**
 * method tf.map.ui.MessagePopup.SetTitle - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} titleStr - parameter description?
*/
    this.SetTitle = function (titleStr) { popup && popup.ChangeTitle(titleStr); }
/**
 * method tf.map.ui.MessagePopup.SetContent - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} content - parameter description?
*/
    this.SetContent = function (content) { if (popup) { return popup.SetContent(content); } }

/**
 * method tf.map.ui.MessagePopup.Show - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} bool - parameter description?
*/
    this.Show = function (bool) { if (popup) { popup.Show(bool); } }
/**
 * method tf.map.ui.MessagePopup.IsShowing - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.IsShowing = function () { return popup ? popup.IsShowing() : false; }
/**
 * method tf.map.ui.MessagePopup.Toggle - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Toggle = function () { this.Show(!this.IsShowing()); }

/**
 * method tf.map.ui.MessagePopup.OnContainerResize - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.OnContainerResize = function () { onContainerResize(); }

    function onContainerResize() { if (popup) { popup.OnContainerResize(); } }

    function initialize() {
        var styles = tf.GetStyles(), subStyles = styles.GetSubStyles();

        popup = new tf.ui.Popup({
            container: container,
            titleStr: "Message",
            horPos: "center",
            verPos: "center",
            fontSize: subStyles.infoPopupContentFontSizeEmNumber + "em"
        });

        divTitle = popup.GetTitleContainer();

        popup.SetTitleToolTip("Pin");

        colorMsgPin = "#ddd"
        colorTextPin = subStyles.darkTextColor;
        colorPopupSaved = divTitle.style.backgroundColor;
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
}