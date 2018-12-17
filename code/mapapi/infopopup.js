"use strict";

/**
 * class tf.map.ui.InfoPopup - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} container - parameter description?
*/
tf.map.ui.InfoPopup = function (container) {

    var theThis = null;

    var colorInfo = null;
    var popup = null;
    var divTitle = null;
    var colorPopupSaved = null;
    var divContainerElem = null;

/**
 * method tf.map.ui.InfoPopup.ShowTitleColorInfo - ?
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
            var colorUse = bool ? colorInfo : colorPopupSaved;
            divTitle.style.backgroundColor = colorUse;
            popup.SetTitleToolTip(bool? "Unpin" : "Pin");
        }
    }

/**
 * method tf.map.ui.InfoPopup.SetOnClickTitle - ?
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
 * method tf.map.ui.InfoPopup.SetZIndex - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} zIndex - parameter description?
*/
    this.SetZIndex = function (zIndex) { popup && popup.SetZIndex (zIndex) ; }
/**
 * method tf.map.ui.InfoPopup.GetZIndex - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetZIndex = function () { return popup ? popup.GetZIndex() : 0;}

/**
 * method tf.map.ui.InfoPopup.SetOnClose - ?
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
 * method tf.map.ui.InfoPopup.SetTitle - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} titleStr - parameter description?
*/
    this.SetTitle = function (titleStr) { popup && popup.ChangeTitle(titleStr); }
/**
 * method tf.map.ui.InfoPopup.SetContent - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} content - parameter description?
*/
    this.SetContent = function (content) { if (popup) { return popup.SetContent(content); } }

/**
 * method tf.map.ui.InfoPopup.Show - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} bool - parameter description?
*/
    this.Show = function (bool) { if (popup) { popup.Show(bool); } }
/**
 * method tf.map.ui.InfoPopup.IsShowing - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.IsShowing = function () { return popup ? popup.IsShowing() : false; }
/**
 * method tf.map.ui.InfoPopup.Toggle - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Toggle = function () { this.Show(!this.IsShowing()); }

/**
 * method tf.map.ui.InfoPopup.OnContainerResize - ?
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
            //bkColor: "rgba(10, 10, 10, 0.5)",
            container: container,
            titleStr: "Information",
            marginHor: (4 * subStyles.mapButtonMarginEmNumber + subStyles.mapButtonDimEmNumber) + "em",
            marginVer: (1 * subStyles.mapButtonMarginEmNumber + subStyles.mapButtonDimEmNumber) + "em",
            maxHeight: "50%",
            horPos: "left",
            verPos: "bottom",
            fontSize: subStyles.infoPopupContentFontSizeEmNumber + "em"
        });

        divTitle = popup.GetTitleContainer();
        divContainerElem = tf.dom.GetHTMLElementFrom(container);

        popup.SetTitleToolTip("Pin");

        colorInfo = "rgba(251,127,0,1)";
        colorPopupSaved = divTitle.style.backgroundColor;
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
}