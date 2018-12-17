"use strict";

/**
 * A callback function that listens to events notified by [App Container Sizer]{@link tf.layout.AppContainerSizer} instances
 * @public
 * @callback tf.types.AppContainerSizerCallBack
 * @param {object} notification - the notification
 * @param {tf.layout.AppContainerSizer} notification.sender - the instance sending the notification
 * @param {tf.types.pixelCoordinates} notification.dims - the current dimensions of the container
 * @returns {void} - | {@link void} no return value
 */

/**
 * @public
 * @class
 * @summary A {@link singleton} instance of App Container Sizer is created by an application to automatically resize its
 * top container when the Browser window changes size. App Container Sizer automatically notifies layout changes to an arbitrary number 
 * of [maps]{@link tf.map.Map} and event listeners
 * @param {object} settings - creation settings
 * @param {HTMLElementLike} settings.container - Mandatory property, the top application container
 * @param {boolean} settings.fitContainerToWindow - if <b>true</b> the <b>container</b> is resized to match the Browser window size, 
 * set to <b>false</b> when the application is running in a sub-container, defaults to <b>true</b>
 * @param {string} settings.documentTitle - if defined, sets the HTML document's <b>title</b>
 * @param {tf.types.AppContainerSizerCallBack} settings.onResize - optional callback for resize events
 */
tf.layout.AppContainerSizer = function (settings) {

    var theThis, fitContainerToWindow, onResizeDelayCallBack, onMapResizeDelayCallBack, container, containerElem, maps, resizeListeners;

    /**
     * @public
     * @function
     * @summary - Retrieves the {@link HTMLElementLike} container associated with this instance
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the container
    */
    this.GetContainer = function () { return container; }

    /**
     * @public
     * @function
     * @summary - Programmatically triggers a resize, executing the same logic as when the Browser window changes size, including notifying map instances and listeners
     * @returns {void} - | {@link void} no return value
    */
    this.OnResize = function () { return onDelayedResize(); }

    /**
     * @public
     * @function
     * @summary - Programmatically triggers map size updates, does not notify listeners
     * @returns {void} - | {@link void} no return value
    */
    this.UpdateMapSizes = function () { return onDelayedMapResize(); }

    /**
     * @public
     * @function
     * @summary - Adds a callback listener for resize events
     * @param {tf.types.AppContainerSizerCallBack} callBack - the callback for event notifications
     * @returns {tf.events.EventListener} - | {@link tf.events.EventListener} the event listener
    */
    this.AddResizeListener = function (callBack) { return resizeListeners.Add(callBack); }

    /**
     * @public
     * @function
     * @summary - Adds the given [map]{@link tf.map.Map} to the list of maps that are notified of resize events
     * @param {tf.map.Map} map - the given map
     * @returns {void} - | {@link void} no return value
    */
    this.AddMap = function (map) { return addMap(map); }

    /**
     * @public
     * @function
     * @summary - Removes the given [map]{@link tf.map.Map} from the list of maps that are notified of resize events
     * @param {tf.map.Map} map - the given map
     * @returns {void} - | {@link void} no return value
    */
    this.DelMap = function (map) { return delMap(map); }

    function addMap(map) { if (!!(map = tf.js.GetMapFrom(map))) { var id = map.GetID(); if (!maps[id]) { maps[id] = map; } } }
    function delMap(map) { if (!!(map = tf.js.GetMapFrom(map))) { var id = map.GetID(); if (!!maps[id]) { delete maps[id]; } } }

    function updateMapSizes() {
        for (var i in maps) { maps[i].OnResize(); }
    }

    function onResize() {
        if (!!container) {
            var winW, winH;
            if (fitContainerToWindow) { var winDims = tf.dom.FitContainerToWindowDims(container); winW = winDims[0]; winH = winDims[1]; }
            else { winW = containerElem.clientWidth; winH = containerElem.clientHeight; }
            resizeListeners.Notify({ sender: theThis, dims: [winW, winH] });
            onDelayedMapResize();
            //updateMapSizes();
        }
    }

    function onDelayedResize() {
        if (!!onResizeDelayCallBack) {
            onResizeDelayCallBack.DelayCallBack();
        }
    }

    function onDelayedMapResize() {
        updateMapSizes();
        if (!!onMapResizeDelayCallBack) {
            onMapResizeDelayCallBack.DelayCallBack();
        }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings); maps = {}; resizeListeners = new tf.events.EventNotifier();
        fitContainerToWindow = tf.js.GetBoolFromValue(settings.fitContainerToWindow, true);
        if (tf.js.GetIsNonEmptyString(settings.documentTitle)) { document.title = settings.documentTitle; tf.GetStyles().AddBodyStyle(); }

        if (containerElem = tf.dom.GetHTMLElementFrom(container = settings.container)) {
            /*if (fitContainerToWindow) {*/
                resizeListeners.Add(settings.onResize);
                onResizeDelayCallBack = new tf.events.DelayedCallBack(250, onResize);
                onMapResizeDelayCallBack = new tf.events.DelayedCallBack(250, updateMapSizes);
                tf.events.AddDOMEventListener(window, tf.consts.DOMEventNamesResize, onDelayedResize);
                new tf.events.DOMFullScreenChangeListener({ callBack: onDelayedResize, optionalScope: theThis });
                if (!!settings.useUpdateSizesInterval) {
                    setInterval(updateMapSizes, 5000);
                }
            //}
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * @public
 * @class
 * @summary Single Pane is an [Insertable]{@link tf.dom.Insertable} implementing a layout with a single pane
 * @extends {tf.dom.Insertable}
 */
tf.layout.SinglePane = function () {

    var theThis, container;

    /**
     * @public
     * @function
     * @summary - Retrieves the {@link HTMLElementLike} container associated with this instance
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the container
    */
    this.GetContainer = function () { return container; }

    function initialize() {
        container = new tf.dom.Div({ cssClass: tf.GetStyles().appContainerClass });
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: container });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.layout.SinglePane, tf.dom.Insertable);

/**
 * @public
 * @class
 * @summary Top Bot is an [Insertable]{@link tf.dom.Insertable} implementing a layout with a top pane and a bottom pane
 * @extends {tf.dom.Insertable}
 */
tf.layout.TopBot = function () {
    var theThis = null, container = null, top = null, bot = null;

    /**
     * @public
     * @function
     * @summary - Retrieves the {@link HTMLElementLike} container associated with this instance
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the container
    */
    this.GetContainer = function () { return container; }

    /**
     * @public
     * @function
     * @summary - Retrieves the top pane {@link HTMLElementLike} container
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the container
    */
    this.GetTop = function () { return top; }

    /**
     * @public
     * @function
     * @summary - Retrieves the bottom pane {@link HTMLElementLike} container
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the container
    */
    this.GetBot = function () { return bot; }

    function initialize() {
        var styles = tf.GetStyles();
        var unpaddedBlockDivClass = styles.unpaddedBlockDivClass;
        (container = new tf.dom.Div({ cssClass: styles.appContainerClass })).AddContent(
            top = new tf.dom.Div({ cssClass: unpaddedBlockDivClass }),
            bot = new tf.dom.Div({ cssClass: unpaddedBlockDivClass }));
        bot.GetHTMLElement().style.position = top.GetHTMLElement().style.position = "relative";
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: container.GetHTMLElement() });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.layout.TopBot, tf.dom.Insertable);

/**
 * @public
 * @class
 * @summary Left Right is an [Insertable]{@link tf.dom.Insertable} implementing a layout with two side by side panes
 * @extends {tf.dom.Insertable}
 */
tf.layout.LeftRight = function () {
    var theThis = null, container = null, left = null, right = null;

    /**
     * @public
     * @function
     * @summary - Retrieves the {@link HTMLElementLike} container associated with this instance
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the container
    */
    this.GetContainer = function () { return container; }

    /**
     * @public
     * @function
     * @summary - Retrieves the left pane {@link HTMLElementLike} container
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the container
    */
    this.GetLeft = function () { return left; }

    /**
     * @public
     * @function
     * @summary - Retrieves the right pane {@link HTMLElementLike} container
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the container
    */
    this.GetRight = function () { return right; }

    function initialize() {
        var styles = tf.GetStyles();
        (container = new tf.dom.Div({ cssClass: styles.appContainerClass })).AddContent(
            right = new tf.dom.Div({ cssClass: styles.rightSideContainerClass }),
            left = new tf.dom.Div({ cssClass: styles.leftSideContainerClass }));
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: container.GetHTMLElement() });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.layout.LeftRight, tf.dom.Insertable);

/**
 * @public
 * @class
 * @summary Left Mid Right is an [Insertable]{@link tf.dom.Insertable} implementing a layout with three side by side panes
 * @extends {tf.dom.Insertable}
 */
tf.layout.LeftMidRight = function () {
    var theThis, container, left, mid, right;

    /**
     * @public
     * @function
     * @summary - Retrieves the {@link HTMLElementLike} container associated with this instance
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the container
    */
    this.GetContainer = function () { return container; }

    /**
     * @public
     * @function
     * @summary - Retrieves the left pane {@link HTMLElementLike} container
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the container
    */
    this.GetLeft = function () { return left; }

    /**
     * @public
     * @function
     * @summary - Retrieves the middle pane {@link HTMLElementLike} container
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the container
    */
    this.GetMid = function () { return mid; }

    /**
     * @public
     * @function
     * @summary - Retrieves the right pane {@link HTMLElementLike} container
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the container
    */
    this.GetRight = function () { return right; }

    function initialize() {
        var styles = tf.GetStyles();
        (container = new tf.dom.Div({cssClass: styles.appContainerClass})).AddContent(
            right = new tf.dom.Div({cssClass: styles.rightSideContainerClass}),
            left = new tf.dom.Div({cssClass: styles.floatLeftSideContainerClass}),
            mid = new tf.dom.Div({ cssClass: styles.leftSideContainerClass }));
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: container.GetHTMLElement() });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.layout.LeftMidRight, tf.dom.Insertable);

/**
 * A callback function that listens to events notified by [Left Separator Right]{@link tf.layout.LeftSeparatorRight} instances
 * @public
 * @callback tf.types.LeftSeparatorRightCallBack
 * @param {object} notification - the notification
 * @param {tf.layout.LeftSeparatorRight} notification.sender - the instance sending the notification
 * @returns {void} - | {@link void} no return value
 */

/**
 * @public
 * @class
 * @summary Left Separator Right is an [Insertable]{@link tf.dom.Insertable} implementing a layout with two side by side panes and a vertical separator betweeen them. 
 * Its variable width right side pane is programmatically collapsible, and automatically toggles its collapsed state in response to [click]{@link tf.consts.DOMEventNamesClick} events
 * @param {object} settings - creation settings
 * @param {tf.types.LeftSeparatorRightCallBack} settings.onLayoutChange - optional callback to receive layout change notifications
 * @param {object} settings.optionalScope - optional scope used with <b>onLayoutChange</b>
 * @param {tf.types.CSSStyleSpecs} settings.separatorStyle - optional CSS style specifications to be applied to the vertical separator
 * @param {boolean} settings.initiallyCollapsed - if set to <b>false</b> starts with the right pane uncollapsed, if <b>true</b> or <b>void</b> the right side starts collapsed
 * @extends {tf.dom.Insertable}
 */
tf.layout.LeftSeparatorRight = function (settings) {

    var theThis, onLayoutChangeCallBack, optionalScope, styles, isCollapsed, isShowingSeparator;
    var containerAll, containerAllObj;
    var leftSideContainerObj, leftSideContainer;
    var leftRightSideSeparatorObj, leftRightSideSeparator;
    var rightSideContainerObj, rightSideContainer;
    var onClick, rightIsShowing;

    /**
     * @public
     * @function
     * @summary - Retrieves the {@link HTMLElementLike} container associated with this instance
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the container
    */
    this.GetContainer = function () { return containerAllObj; }

    /**
     * @public
     * @function
     * @summary - Retrieves the left pane {@link HTMLElementLike} container
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the container
    */
    this.GetLeft = function () { return leftSideContainerObj; }

    /**
     * @public
     * @function
     * @summary - Retrieves the right pane {@link HTMLElementLike} container
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the container
    */
    this.GetRight = function () { return rightSideContainerObj; }

    /**
     * @public
     * @function
     * @summary - Determines if the right side pane is currently collapsed
     * @returns {bool} - | {@link bool} <b>true</b> if yes, <b>false</b> otherwise
    */
    this.GetIsRightSideCollapsed = function () { return isCollapsed; }

    /**
     * @public
     * @function
     * @summary - Toggles the right side pane's collapsed status
     * @returns {void} - | {@link void} no return value
    */
    this.ToggleRightSideCollapsed = function () { onClickSeparator(); }

    /**
     * @public
     * @function
     * @summary - Sets the right side pane's collapsed status
     * @param {boolean} bool - set to <b>true</b> to collapse the right side pane, <b>false</b> to expand it
     * @returns {void} - | {@link void} no return value
    */
    this.SetRightSideCollapsed = function (bool) { return setRightSideCollapsed(bool); }

    this.SetIsShowingSeparator = function (showBool) { if ((showBool = !!showBool) != isShowingSeparator) { isShowingSeparator = showBool; updatePaneVisibility(); notifyLayoutChange(); } }

    function notifyLayoutChange() { if (!!onLayoutChangeCallBack) { onLayoutChangeCallBack.call(settings.optionalScope, { sender: theThis }); } }

    function onClickSeparator(notification) { isCollapsed = !isCollapsed; updatePaneVisibility(); notifyLayoutChange(); }
    function setRightSideCollapsed(bool) { isCollapsed = !!bool; updatePaneVisibility(); notifyLayoutChange(); }

    function updatePaneVisibility() {
        if (!!containerAll) {
            var separatorWillShow = isShowingSeparator;
            var rightWillShow = separatorWillShow && (!isCollapsed);

            rightIsShowing = rightWillShow;
            leftRightSideSeparator.style.display = separatorWillShow ? 'block' : 'none';
            rightSideContainer.style.display = rightWillShow ? 'block' : 'none';
            leftRightSideSeparator.title = rightWillShow ? "Collapse" : "Restore";
        }
       
    }

    function initialize() {

        styles = tf.GetStyles();
        isShowingSeparator = true;
        isCollapsed = true;
        rightIsShowing = false;

        settings = tf.js.GetValidObjectFrom(settings);

        onLayoutChangeCallBack = tf.js.GetFunctionOrNull(settings.onLayoutChange);

        containerAll = (containerAllObj = new tf.dom.Div({ cssClass: styles.appContainerClass })).GetHTMLElement();

        leftSideContainerObj = new tf.dom.Div({ cssClass: styles.leftSideContainerClass });
        leftSideContainer = leftSideContainerObj.GetHTMLElement();

        leftRightSideSeparatorObj = new tf.dom.Div({ cssClass: styles.leftRightSideSeparatorClass });
        leftRightSideSeparator = leftRightSideSeparatorObj.GetHTMLElement();

        onClick = new tf.events.DOMClickListener({ target: leftRightSideSeparator, callBack: onClickSeparator, optionalScope: theThis, callBackSettings: null });

        rightSideContainerObj = new tf.dom.Div({ cssClass: styles.rightSideContainerClass });
        rightSideContainer = rightSideContainerObj.GetHTMLElement();
        rightSideContainerObj.AppendTo(containerAllObj);
        leftRightSideSeparatorObj.AppendTo(containerAllObj);
        leftSideContainerObj.AppendTo(containerAllObj);

        if (tf.js.GetIsValidObject(settings.separatorStyle)) {
            styles.ApplyStyleProperties(leftRightSideSeparatorObj, settings.separatorStyle);
        }

        if (tf.js.GetIsFalseNotUndefined(settings.initiallyCollapsed)) {
            isCollapsed = false;
        }
        updatePaneVisibility();

        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: containerAllObj });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
}
tf.js.InheritFrom(tf.layout.LeftSeparatorRight, tf.dom.Insertable);

/**
 * A callback function that listens to events notified by [Header Content Footer]{@link tf.layout.HeaderContentFooter} instances
 * @public
 * @callback tf.types.HeaderContentFooterCallBack
 * @param {object} notification - the notification
 * @param {tf.layout.HeaderContentFooter} notification.sender - the instance sending the notification
 * @returns {void} - | {@link void} no return value
 */

/**
 * @public
 * @class
 * @summary Header Content Footer is an [Insertable]{@link tf.dom.Insertable} implementing a vertical layout divided into Header, Content, and Footer panes.
 * Its width is variable, depending on the content if its panes, and it assumes the full height of its container. The Header pane displays the TerraFly logo along with an optional application defined
 * logo, and may contain an arbitrary number of application defined add-ons such as options, toolbars, and information panels.
 * The Content pane stretches the midsection of the layout and is suitable for displaying application defined scrollable content, such as [Keyed Table]{@link tf.ui.KeyedTable} instances,
 * or plain [Table]{@link tf.ui.Table} instances. The Footer pane is positioned at the bottom of the layout, its visibility status automatically adjusts to changes in the height of the layout,
 * and can be programmatically controlled
 * @param {object} settings - creation settings
 * @param {tf.types.HeaderContentFooterCallBack} settings.onLayoutChange - optional callback to receive layout change notifications
 * @param {object} settings.optionalScope - optional scope used with <b>onLayoutChange</b>
 * @param {string} settings.appLogoImgStr - optional url to an application defined logo image to be displayed with the TerraFly logo in the Header pane
 * @param {color} settings.logoBkColor - optional background color used on the logo subcontainer of the Header pane, ignored if <b>logoStyle</b> is defined
 * @param {tf.types.CSSStyleSpecs} settings.logoStyle - optional CSS style specifications to be applied to the logo subcontainer of the Header pane
 * @param {tf.types.CSSStyleSpecs} settings.pageStyle - optional CSS style specifications to be applied to layout container
 * @param {tf.types.CSSStyleSpecs} settings.headerStyle - optional CSS style specifications to be applied to the Header pane
 * @param {tf.types.CSSStyleSpecs} settings.contentStyle - optional CSS style specifications to be applied to the Content pane
 * @param {tf.types.CSSStyleSpecs} settings.footerStyle - optional CSS style specifications to be applied to the Footer pane
 * @extends {tf.dom.Insertable}
 */
tf.layout.HeaderContentFooter = function (settings) {

    var theThis, styles, subStyles, onLayoutChangeCallBack, pageObj, headerObj, contentObj, footerObj;
    var page, header, content, footer, headerContentObj, logoObj, tfLogoImgObj, appLogoImgObj, optionalScope;
    var headerAddOnObj, footerContentObj, isShowingFooter, isFooterAutoHidden;

    /**
     * @public
     * @function
     * @summary - Creates a container [Div]{@link tf.dom.Div} suitable for adding to this layout's header pane with the functions 
     * [SetHeader]{@link tf.layout.HeaderContainerFooter#SetHeader} or [AddToHeader]{@link tf.layout.HeaderContainerFooter#AddToHeader}.
     * The container returned can be used to display toolbars or other application defined content
     * @returns {tf.dom.Div} - | {@link tf.dom.Div} the container
    */
    this.CreateUnPaddedDivForHeader = function () { return new tf.dom.Div({ cssClass: styles.unPaddedBlockDivClass }); }

    /**
     * @public
     * @function
     * @summary - Replaces the contents of the <b>Header</b> pane with the given element, triggers a layout change event
     * @param {HTMLElementLike} elem - the given element
     * @returns {void} - | {@link void} no return value
    */
    this.SetHeader = function (elem) { return changeContent(headerAddOnObj, elem); }

    /**
     * @public
     * @function
     * @summary - Adds the given element to the contents of the <b>Header</b> pane, triggers a layout change event
     * @param {HTMLElementLike} elem - the given element
     * @returns {void} - | {@link void} no return value
    */
    this.AddToHeader = function (elem) { return addToHeader(elem); }

    this.AddAfterLogo = function (elem) { return addAfterLogo(elem); }

    /**
     * @public
     * @function
     * @summary - Replaces the contents of the <b>Content</b> pane with the given element, triggers a layout change event
     * @param {HTMLElementLike} elem - the given element
     * @returns {void} - | {@link void} no return value
    */
    this.SetContent = function (elem) { return changeContent(contentObj, elem); }

    /**
     * @public
     * @function
     * @summary - Replaces the contents of the <b>Footer</b> pane with the given element, triggers a layout change event
     * @param {HTMLElementLike} elem - the given element
     * @returns {void} - | {@link void} no return value
    */
    this.SetFooter = function (elem) { return changeContent(footerContentObj, elem); }

    /**
     * @public
     * @function
     * @summary - Triggers a layout change event. This function should be called when the visibility status or the dimensions of sub-contents 
     * of this layout are programmatically modified. This function should not be called in addition to calling the layout's functions SetHeader, AddToHeader, 
     * SetContent or SetFooter, which all automatically trigger layout change events
     * @param {HTMLElementLike} elem - the given element
     * @returns {void} - | {@link void} no return value
    */
    this.NotifyLayoutChange = function () { return notifyLayoutChange(); }

    /**
     * @public
     * @function
     * @summary - Notifies the layout that its container may have been resized
     * @returns {void} - | {@link void} no return value
    */
    this.OnResize = function () { return onResize(); }

    /**
     * @public
     * @function
     * @summary - Checks if the footer has been automatically hidden in response to changes in the layout height
     * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
    */
    this.GetIsFooterAutoHidden = function () { return isFooterAutoHidden; }

    /**
     * @public
     * @function
     * @summary - Checks if the footer is visible when the layout height permits it
     * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
    */
    this.GetIsShowingFooter = function () { return isShowingFooter; }

    /**
     * @public
     * @function
     * @summary - Shows or hides the <b>footer</b> pane
     * @param {boolean} bool - set to <b>true</b> to dislay the footer pane, when the layout's height permits it, <b>false</b> to hide it
     * @returns {void} - | {@link void} no return value
    */
    this.SetIsShowingFooter = function (showBool) { if ((showBool = !!showBool) != isShowingFooter) { isShowingFooter = showBool; onResize(); } }

    function notifyLayoutChange() { if (!!onLayoutChangeCallBack) { onLayoutChangeCallBack.call(optionalScope, { sender: theThis }); } }
    function changeContent(parent, elem) { parent.ClearContent(); parent.AddContent(elem); notifyLayoutChange(); }
    function addAfterLogo(elem) {
        headerContentObj.InsertContentAfter(elem, logoObj); notifyLayoutChange();
    }
    function addToHeader(elem) { headerContentObj.InsertContentBefore(elem, headerAddOnObj); notifyLayoutChange(); }
    function onLogoImageLoaded() { onResize(); }

    function onResize() {
        //var containerw = page.clientWidth;
        var containerh = page.clientHeight;
        var headerh = header.clientHeight;
        var footerWillShow = isShowingFooter && (containerh - headerh >= 100);
        var contentWillShow = containerh > headerh;

        content.style.display = contentWillShow ? 'block' : 'none';
        footer.style.display = footerWillShow ? 'block' : 'none';

        if (contentWillShow) {
            var footerh = footer.clientHeight;
            var contenth = footerWillShow ? containerh - (headerh + footerh) : containerh - (headerh);
            content.style.height = contenth + "px";
        }
        isFooterAutoHidden = footerWillShow;
    }

    function initialize() {

        styles = tf.GetStyles();
        subStyles = styles.GetSubStyles();

        isShowingFooter = true;
        isFooterAutoHidden = false;

        var appLogoImgStr = tf.js.GetNonEmptyString(settings.appLogoImgStr, "");
        var logoBkColor = tf.js.GetNonEmptyString(settings.logoBkColor, "#00a");
        var noBorderBlockDivClasses = styles.GetPaddedDivClassNames(false, false);

        onLayoutChangeCallBack = tf.js.GetFunctionOrNull(settings.onLayoutChange);
        optionalScope = settings.optionalScope;

        pageObj = new tf.dom.Div({ cssClass: styles.hcfLayoutClass });
        headerObj = new tf.dom.Div({ cssClass: styles.hcfLayoutHeaderClass });
        contentObj = new tf.dom.Div({ cssClass: styles.hcfLayoutContentClass });
        footerObj = new tf.dom.Div({ cssClass: styles.hcfLayoutFooterClass });

        page = pageObj.GetHTMLElement();
        header = headerObj.GetHTMLElement();
        content = contentObj.GetHTMLElement();
        footer = footerObj.GetHTMLElement();

        headerContentObj = new tf.dom.Div({ cssClass: noBorderBlockDivClasses });
        styles.ApplyStyleProperties(headerContentObj, subStyles.textAlignCenterStyle);

        footerContentObj = new tf.dom.Div({ cssClass: noBorderBlockDivClasses });
        styles.ApplyStyleProperties(footerContentObj, subStyles.textAlignCenterStyle);

        logoObj = new tf.dom.Div({ cssClass: styles.unPaddedBlockDivClass });
        var logoElem = logoObj.GetHTMLElement(), logoStyle = logoElem.style;
        logoStyle.backgroundColor = logoBkColor;
        logoStyle.borderRadius = "4px";
        logoElem.title = tf.js.GetNonEmptyString(settings.documentTitle, "");
        //logoElem.title = 'LOGO';

        tfLogoImgObj = new tf.dom.Img({ src: tf.platform.GetPoweredByTerraFlyLogoImgStr(), cssClass: styles.imgLogoStyleClass, onLoad: onLogoImageLoaded });
        appLogoImgObj = new tf.dom.Img({ src: appLogoImgStr, cssClass: styles.imgLogoStyleClass, onLoad: onLogoImageLoaded });

        logoObj.AddContent(appLogoImgObj);
        logoObj.AddContent(tfLogoImgObj);

        headerAddOnObj = new tf.dom.Div({ cssClass: styles.unPaddedBlockDivClass });

        //headerAddOnObj.GetHTMLElement().title = "HEADER_ADD_ON";

        logoObj.AppendTo(headerContentObj);
        headerAddOnObj.AppendTo(headerContentObj);
        headerContentObj.AppendTo(headerObj);

        //headerContentObj.GetHTMLElement().title = "HEADER_CONTENT";

        footerContentObj.AppendTo(footerObj);

        function tryApplyStyle(obj, style) { if (tf.js.GetIsValidObject(style)) { styles.ApplyStyleProperties(obj, style); } }

        tryApplyStyle(pageObj, settings.pageStyle);
        tryApplyStyle(contentObj, settings.contentStyle);
        tryApplyStyle(headerObj, settings.headerStyle);
        tryApplyStyle(footerObj, settings.footerStyle);
        tryApplyStyle(logoObj, settings.logoStyle);

        headerObj.AppendTo(pageObj);
        contentObj.AppendTo(pageObj);
        footerObj.AppendTo(pageObj);

        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: pageObj });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.layout.HeaderContentFooter, tf.dom.Insertable);
