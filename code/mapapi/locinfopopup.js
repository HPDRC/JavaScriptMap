"use strict";

/**
 * class tf.map.ui.LocationPopup - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} container - parameter description?
*/
tf.map.ui.LocationPopup = function (container) {

    var theThis = null;

    var popup = null;
    var divTitle = null;
    var divContainerElem = null;
    var colorLocInfo = null;
    var colorPopupSaved = null;

/**
 * method tf.map.ui.LocationPopup.ShowTitleColorInfo - ?
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
            var colorUse = !!bool ? colorLocInfo : colorPopupSaved;
            divTitle.style.backgroundColor = colorUse;
            //popup.SetTitleToolTip(bool ? "Unpin" : "Pin");
        }
    }

/**
 * method tf.map.ui.LocationPopup.SetOnClickTitle - ?
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
 * method tf.map.ui.LocationPopup.SetZIndex - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} zIndex - parameter description?
*/
    this.SetZIndex = function (zIndex) { popup && popup.SetZIndex(zIndex); }
/**
 * method tf.map.ui.LocationPopup.GetZIndex - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetZIndex = function () { return popup ? popup.GetZIndex() : 0; }

/**
 * method tf.map.ui.LocationPopup.SetOnClose - ?
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
 * method tf.map.ui.LocationPopup.SetTitle - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} titleStr - parameter description?
*/
    this.SetTitle = function (titleStr) { popup && popup.ChangeTitle(titleStr); }
/**
 * method tf.map.ui.LocationPopup.SetContent - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} content - parameter description?
*/
    this.SetContent = function (content) { if (popup) { return popup.SetContent(content); } }

/**
 * method tf.map.ui.LocationPopup.Show - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} bool - parameter description?
*/
    this.Show = function (bool) { if (popup) { popup.Show(bool); } }
/**
 * method tf.map.ui.LocationPopup.IsShowing - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.IsShowing = function () { return popup ? popup.IsShowing() : false; }
/**
 * method tf.map.ui.LocationPopup.Toggle - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Toggle = function () { this.Show(!this.IsShowing()); }

/**
 * method tf.map.ui.LocationPopup.OnContainerResize - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.OnContainerResize = function () { onContainerResize(); }

    function onContainerResize() { if (popup) { popup.OnContainerResize(); } }

    function initialize() {
        var styles = tf.GetStyles();
        var subStyles = styles.GetSubStyles();

        popup = new tf.ui.Popup({
            container: container,
            noTitle: true,
            titleStr: "Map Center",
            marginHor: (6 * subStyles.mapButtonMarginEmNumber + subStyles.mapButtonDimEmNumber) + "em",
            marginVer: subStyles.mapLocationButtonTopEmNumber + "em",
            maxHeight: "50%",
            maxWidth: "100%",
            horPos: "right",
            verPos: "top",
            fontSize: subStyles.locationPopupContentFontSizeEmNumber + "em",
            textAlign: "right"
        });

        divTitle = popup.GetTitleContainer();
        divContainerElem = tf.dom.GetHTMLElementFrom(container);
        //popup.SetTitleToolTip("Pin");

        colorLocInfo = "rgba(2,249,15,1.0)";
        colorPopupSaved = !!divTitle ? divTitle.style.backgroundColor : colorLocInfo;
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
}