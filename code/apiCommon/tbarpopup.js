"use strict";

/**
 * class tf.ui.ToolBarPopup - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} container - parameter description?
 * @param {?} rectProvider - parameter description?
*/
tf.ui.ToolBarPopup = function (container, rectProvider) {

    var styles = tf.GetStyles();
    var formatDiv = styles.GetUnPaddedDivClassNames(true, false);

    var focusElem = null;
    var isVisible = false;

    var updateButtonRect = true;
    var exactLeftPxNumber = undefined;
    var exactTopPxNumber = undefined;

/**
 * method tf.ui.ToolBarPopup.SetFocusElem - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} focusElem - parameter description?
*/
    this.SetFocusElem = function (focusElem) { return setFocusElem (focusElem) ;}

/**
 * method tf.ui.ToolBarPopup.Show - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} bool - parameter description?
*/
    this.Show = function (bool) { show(bool); }
/**
 * method tf.ui.ToolBarPopup.IsShowing - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.IsShowing = function () { return isShowing(); }
/**
 * method tf.ui.ToolBarPopup.Toggle - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Toggle = function () { toggle(); }

/**
 * method tf.ui.ToolBarPopup.AddContent - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} content - parameter description?
 * @param {?} noRightBar - parameter description?
 * @param {?} noWrapper - parameter description?
*/
    this.AddContent = function (content, noRightBar, noWrapper) { return addContent(content, noRightBar, noWrapper); }

    //this.GetHTMLElement = function () { return popup; }

    var theThis = null;

    var popupObj = null;
    var popup = null;

    function setFocusElem(focusElemSet) { focusElem = tf.dom.GetHTMLElementFrom (focusElemSet);}

    function checkUpdateButtonRect() {
        if (updateButtonRect) {
            var rect = rectProvider ? rectProvider.getBoundingClientRect() : { left:0, top: 0, right: 0, bottom: 0 };
            if (rect.left != rect.right) {
                var containerRect = container.getBoundingClientRect();

                exactLeftPxNumber = rect.left - containerRect.left;
                exactTopPxNumber = rect.top - containerRect.top;
                updateButtonRect = false;
                //setTimeout(checkUpdateButtonRect, 500);
                calcStyles();
            }
            else {
                setTimeout(checkUpdateButtonRect, 500);
            }
        }
    }

    function show(bool) {
        bool = !!bool;
        if (isVisible != bool) {
            if (bool) { checkUpdateButtonRect(); }
            if (isVisible != bool) { styles.ChangeOpacityVisibilityClass(popup, isVisible = bool); if (isVisible) { if (!!focusElem) { focusElem.focus(); } } }
        }
    }

    function isShowing() { return isVisible }
    function toggle() { show(!isShowing()); }

    function addContent(content, noRightBar, noWrapper) {
        if (!!content) {
            if (!!noWrapper) {
                if (!noRightBar) { tf.dom.AddCSSClass(content, styles.rightBorderSeparatorLightClass); }
                content.AppendTo(popup);
            }
            else {
                var divContentObj = new tf.dom.Div({ cssClass: formatDiv });

                if (!noRightBar) { tf.dom.AddCSSClass(divContentObj, styles.rightBorderSeparatorLightClass); }

                styles.ApplyMiddleVerticalAlignStyle(divContentObj);

                divContentObj.AddContent(content);
                divContentObj.AppendTo(popup);
            }
        }
    }

    function calcStyles() {
        var maxWidthStr, maxHeightStr;
        var leftStr = exactLeftPxNumber + "px";
        var topStr = exactTopPxNumber + "px" ;

        popup.style.left = leftStr;
        popup.style.top = topStr;

        popup.style.maxWidth = "calc(100% - " + leftStr + ")";
        popup.style.maxHeight = "calc(100% - " + topStr + ")";
    }

    function initialSetup() {

        popupObj = new tf.dom.Div({ cssClass: styles.mapToolBarContainerClass + " " + styles.opacityVisibilityHideClass });

        rectProvider = tf.dom.GetHTMLElementFrom(rectProvider);
        popup = popupObj.GetHTMLElement();
        popup.style.zIndex = 100;

        popupObj.AppendTo(container);
        calcStyles();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialSetup(); })(this);
};
