"use strict";

/**
 * Settings used in the creation of [Popup]{@link tf.ui.Popup} instances
 * @public
 * @typedef {object} tf.types.popupSettings
 * @property {HTMLElementLike} container - Mandatory property, the container where the popup is located
 * @property {string} titleStr - Optional popup title, can be changed after creation
 * @property {HTMLElementSize} marginHor - optional horizontal margins (applies to both left and right), defaults to "0px"
 * @property {HTMLElementSize} marginVer - optional vertical margins (applies to both top and bottom), defaults to "0px"
 * @property {HTMLElementSize} maxWidth - optional maximum width, defaults to {@link void}
 * @property {HTMLElementSize} maxHeight - optional maximum height, defaults to {@link void}
 * @property {tf.types.horizontalPositioning} textAlign - Optional HTML text align for the popup container, including the location of the popup title
 * @property {tf.types.horizontalPositioning} horPos - optional horizontal positioning, defaults to {@link tf.consts.positioningCenter}
 * @property {tf.types.verticalPositioning} verPos - optional vertical positioning, defaults to {@link tf.consts.positioningCenter}
 * @property {HTMLElementLike} rectProvider - if defined, the left/top coordinates of the popup are matched to the left/top coordinates of this element
 * @property {colorWithOptionalAlpha} bkColor - optional background color used by the popup's content, default value depends on the current API style
 * @property {HTMLElementSize} fontSize - optional font size used by the popup's content, default value depends on the current API style
 * @property {boolean} noTitle - if set to <b>true</b> hides the popup's title, defaults to {@link void}
 * @property {number} zIndex - if defined, sets the zIndex of the popup. Defaults to 100
 */

/**
 * @public
 * @class
 * @summary Create instances of this class to display popups on any {@link HTMLElementLike} container, including the [TerraFly HTerraMap]{@link tf.map.Map} container
 * @param {tf.types.popupSettings} settings - creation settings
 */
tf.ui.Popup = function (settings) {

    var theThis, styles, subStyles, isVisible, updateButtonRect, rectProvider, exactLeftPxNumber, exactTopPxNumber;
    var theOnCloseThis, theOnCloseCallBack, captionObj;
    var popupObj, divPopupTitleObj, contentObj, container, popup, divPopupTitle, content, captionElem ;

    /**
     * @public
     * @function
     * @summary - Shows or hides the popup
     * @param {boolean} bool - <b>true</b> to show, <b>false</b> to hide
     * @returns {void} - | {@link void} no return value
    */
    this.Show = function (bool) { show(bool); }

    /**
     * @public
     * @function
     * @summary - Checks if the popup is visible
     * @returns {boolean} - | {@link boolean} <b>true</b> if visible, <b>false</b> otherwise
    */
    this.IsShowing = function () { return isShowing(); }

    /**
     * @public
     * @function
     * @summary - Toggles popup's visibility state
     * @returns {void} - | {@link void} no return value
    */
    this.Toggle = function () { toggle(); }

    /**
     * @public
     * @function
     * @summary - Sets the callBack for the popup's close button click event, the popup closes and the callback is notified
     * @param {function} callBack - the callBack function, the popup instance object is passed to it on notifications
     * @param {object} optionalScope - optional JavaScript scope used in the callBack
     * @returns {void} - | {@link void} no return value
    */
    this.SetOnClose = function (callBack, optionalScope) { theOnCloseThis = optionalScope; theOnCloseCallBack = tf.js.GetFunctionOrNull(callBack); }

    /**
     * @public
     * @function
     * @summary - Sets the callBack for the popup's title click event
     * @param {function} callBack - the callBack function, the popup instance object is passed to it on notifications
     * @param {object} optionalScope - optional JavaScript scope used in the callBack
     * @returns {void} - | {@link void} no return value
    */
    this.SetOnClickTitle = function (callBack, optionalScope) {
        if (divPopupTitle) {
            new tf.events.DOMClickListener({ target: captionObj, callBack: callBack, optionalScope: optionalScope, callBackSettings: undefined });
        }
    }

    /**
     * @public
     * @function
     * @summary - Retrieves the popup's title container
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the container
    */
    this.GetTitleContainer = function () { return divPopupTitle; }

    /**
     * @public
     * @function
     * @summary - Changes the popup's tile
     * @param {string} titleStr - the new title
     * @returns {void} - | {@link void} no return value
    */
    this.ChangeTitle = function (titleStr) { changeTitle(titleStr); }

    /**
     * @public
     * @function
     * @summary - Sets the tooltip text for the popup's tile
     * @param {string} toolTipStr - the tooltip
     * @returns {void} - | {@link void} no return value
    */
    this.SetTitleToolTip = function (toolTipStr) { typeof toolTipStr === "string" && !!divPopupTitle && (divPopupTitle.title = toolTipStr); }

    /**
     * @public
     * @function
     * @summary - Sets popup's zIndex
     * @param {number} zIndex - the zIndex
     * @returns {void} - | {@link void} no return value
    */
    this.SetZIndex = function (zIndex) { if (typeof zIndex == "number" && popup) { popup.style.zIndex = zIndex; } }

    /**
     * @public
     * @function
     * @summary - Gets popup's zIndex
     * @returns {number} - | {@link number} the zIndex
    */
    this.GetZIndex = function () { return popup ? popup.style.zIndex : 0; }

    /**
     * @public
     * @function
     * @summary - Notifies the popup that its container may have been resized
     * @returns {void} - | {@link void} no return value
    */
    this.OnContainerResize = function () { return onContainerResize(); }

    /**
     * @public
     * @function
     * @summary - Removes the popup's current content, if any
     * @returns {void} - | {@link void} no return value
    */
    this.ClearContent = function () { return clearContent(); }

    /**
     * @public
     * @function
     * @summary - Replaces the popup's content with new content
     * @param {HTMLContent} content - the new content
     * @returns {void} - | {@link void} no return value
    */
    this.SetContent = function (content) { if (contentObj) { if (tf.js.GetIsString(content)) { setHtmlContent(content); } else { setElemContent(content); } } }

    /**
     * @public
     * @function
     * @summary - Adds new content to the popup's existing content
     * @param {HTMLContent} content - the new content
     * @returns {void} - | {@link void} no return value
    */
    this.AddContent = function (content) { return addElemContent(content); }

    this.GetHTMLElement = function () { return popup; }

    function clearContent() { if (contentObj) { contentObj.ClearContent(); }}

    function setHtmlContent (htmlContent) {
        clearContent();
        if (contentObj) { content.innerHTML = typeof htmlContent === "string" ? htmlContent : "&nbsp;"; }
        onContainerResize();
    }

    function setElemContent (elem) { clearContent(); addElemContent(elem); }

    function addElemContent(elem) {
        if (contentObj) {
            if (elem.AppendTo) { elem.AppendTo(content); } else if (elem = tf.dom.GetHTMLElementFrom(elem)) { content.appendChild(elem); } onContainerResize();
        }
    }

    function onClose() { if (theOnCloseCallBack) { theOnCloseCallBack.call(theOnCloseThis); } show(false); }

    function show(bool) {
        bool = !!bool;
        if (isVisible != bool) {
            if (bool) { checkUpdateButtonRect(); onContainerResize(true); }
            styles.ChangeOpacityVisibilityClass(popup, isVisible = bool);
            if (bool) { popup.focus(); }
        }
    }
    function isShowing() { return isVisible; }
    function toggle() { show(!isShowing()); }

    function changeTitle(titleStr) { if (captionElem) { if (typeof titleStr == "string") { captionElem.innerHTML = titleStr; } } }

    function createTitle() {
        var classNames = styles.GetPaddedDivClassNames(true, false);
        var closeButton = styles.CloseXButtonForPopup(false, onClose);

        captionObj = new tf.dom.Div({ cssClass: classNames });
        divPopupTitleObj = new tf.dom.Div({ cssClass: styles.popupCaptionClass });
        divPopupTitle = divPopupTitleObj.GetHTMLElement();
        captionElem = captionObj.GetHTMLElement();
        closeButton.AppendTo(divPopupTitleObj);
        divPopupTitleObj.AddContent(captionElem);
    }

    function onContainerResize(forceCheck) {
        var canDisplay = true;

        content.style.overflowX = "visible";
        content.style.overflowY = "visible";

        content.style.maxWidth = content.style.maxHeight = 'none';
        content.style.width = content.style.height = null;

        var popupRect = popup.getBoundingClientRect();
        var contentRect = content.getBoundingClientRect();

        if (contentRect.bottom > popupRect.bottom) {
            var contentHeight = content.clientHeight;
            var contentClientHeight = content.clientHeight;
            var contentBorderH = (contentHeight - contentClientHeight);
            var popupPaddingHeight = subStyles.popupContainerPaddingPxNumber;
            var maxBot = popupRect.bottom;
            var maxHeight = maxBot - contentRect.top - popupPaddingHeight - contentBorderH;
            content.style.height = maxHeight + "px";
        }

        content.style.overflowX = "auto";
        content.style.overflowY = "auto";

        return canDisplay;
    }

    function calcStyles() {
        //if (isVisible) {
            var maxWidthStr, maxHeightStr;
            var padding = subStyles.popupContainerPaddingPxNumber, padding2 = 2 * padding;

            if (!!rectProvider) {
                var leftStr = "calc(" + exactLeftPxNumber + "px - " + padding + "px - " + settings.marginHor + ")";
                var topStr = "calc(" + exactTopPxNumber + "px - " + padding + "px - " + settings.marginVer + ")";

                popup.style.left = leftStr;
                popup.style.top = topStr;

                maxWidthStr = "calc(" + settings.maxWidth + " - " + padding2 + "px - " + settings.marginHor /*+ " - " + settings.marginHor*/ + " - " + exactLeftPxNumber + "px)";
                maxHeightStr = "calc(" + settings.maxHeight + " - " + padding2 + "px - " + settings.marginVer /*+ " - " + settings.marginVer*/ + " - " + exactTopPxNumber + "px)";
            }
            else {
                maxWidthStr = "calc(" + settings.maxWidth + " - " + padding2 + "px - " + settings.marginHor /*+ " - " + settings.marginHor*/ + ")";
                maxHeightStr = "calc(" + settings.maxHeight + " - " + padding2 + "px - " + settings.marginVer /*+ " - " + settings.marginVer*/ + ")";
            }

            popup.style.maxWidth = maxWidthStr;
            popup.style.maxHeight = maxHeightStr;
        //}
    }

    function checkUpdateButtonRect() {
        if (updateButtonRect) {
            var rect = rectProvider ? rectProvider.getBoundingClientRect() : { left: 0, top: 0, right: 0, bottom: 0 };
            if (rect.left != rect.right) {
                var containerRect = container.getBoundingClientRect();

                exactLeftPxNumber = rect.left - containerRect.left;
                exactTopPxNumber = rect.top - containerRect.top;
                updateButtonRect = false;
                calcStyles();
                onContainerResize();
            }
        }
    }

    function initialize() {

        styles = tf.GetStyles();
        subStyles = styles.GetSubStyles();
        isVisible = false;
        updateButtonRect = false;

        if (container = tf.dom.GetHTMLElementFrom(settings.container)) {

            var defaultTitle = "Popup", defaultMaxWH = "100%", defaultHVPos = tf.consts.positioningCenter;
            var defaultMarginPXNumber = 0, defaultMarginPXStr = defaultMarginPXNumber + "px";

            var defaultOptions = {
                titleStr: defaultTitle, horPos: defaultHVPos, verPos: defaultHVPos, bkColor: subStyles.popupContentBkColor, fontSize: subStyles.popupContentFontSizeEmNumber + "em",
                maxWidth: defaultMaxWH, maxHeight: defaultMaxWH, marginVer: defaultMarginPXNumber, marginHor: defaultMarginPXNumber, textAlign: "left", zIndex: 100
            };

            settings = tf.js.ShallowMerge(defaultOptions, settings);
            popupObj = new tf.dom.Div({ cssClass: styles.popupContainerClass + " " + styles.opacityVisibilityHideClass });

            popup = popupObj.GetHTMLElement();
            popup.style.zIndex = settings.zIndex;

            if (!settings.noTitle) { createTitle(); }

            contentObj = new tf.dom.Div({ cssClass: styles.popupContentClass });

            content = contentObj.GetHTMLElement();
            content.style.fontSize = settings.fontSize;
            content.style.backgroundColor = settings.bkColor;

            popupObj.AddContent(divPopupTitleObj);
            popupObj.AddContent(contentObj);

            settings.maxWidth = tf.js.GetDimFromStrOrPxNumber(settings.maxWidth, defaultMaxWH);
            settings.maxHeight = tf.js.GetDimFromStrOrPxNumber(settings.maxHeight, defaultMaxWH);

            var padding = subStyles.popupContainerPaddingPxNumber;
            var paddingPx = padding + "px";

            settings.marginHor = tf.js.GetDimFromStrOrPxNumber(settings.marginHor, defaultMarginPXStr);
            settings.marginVer = tf.js.GetDimFromStrOrPxNumber(settings.marginVer, defaultMarginPXStr);

            calcStyles();

            if (!(rectProvider = tf.dom.GetHTMLElementFrom(settings.rectProvider))) {
                popup.style.marginLeft = "calc(" + settings.marginHor + " - " + paddingPx + ")";
                popup.style.marginRight = "calc(" + settings.marginHor + " - " + paddingPx + ")";
                popup.style.marginTop = "calc(" + settings.marginVer + " - " + paddingPx + ")";
                popup.style.marginBottom = "calc(" + settings.marginVer + " - " + paddingPx + ")";
                styles.ApplySnapStyle(popupObj, settings);
            }
            else { updateButtonRect = true; }

            changeTitle(settings.titleStr);
            popup.style.textAlign = settings.textAlign;
            popupObj.AppendTo(container);

            styles.ChangeOpacityVisibilityClass(popup, isVisible);
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};