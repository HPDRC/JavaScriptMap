"use strict";

/**
 * A callback function to receive the notification that a [Single Map App]{@link tf.urlapi.SingleMap} has finalized its creation process
 * @public
 * @callback tf.types.SingleMapAppCreationCallBack
 * @param {object} notification - the notification
 * @param {tf.urlapi.SingleMapApp} notification.sender - the instance sending the notification
 * @returns {void} - | {@link void} no return value
 */

/**
 * @public
 * @class
 * @summary A Single Map App creates and configures a [Map]{@link tf.map.Map} instance based on given url parameters and 
 * adds it to a given container; it also creates an [App Container Sizer]{@link tf.layout.AppContainerSizer}
 * to keeps the map and the given layout container correctly sized. Depending on url parameters,
 * a [DLayer List]{@link tf.urlapi.DLayerList} instance may be created
 * @param {object} settings - creation settings
 * @param {HTMLElementLike} settings.layout - used as Single Map App's layout
 * @param {HTMLElementLike} settings.mapContainer - container where the single map instance is created, may be the same as <b>layout</b>
 * @param {HTMLElementLike} settings.parentContainer - if defined, <b>layout</b> is appended to it, if undefined <b>layout</b> becomes the top application layout
 * @param {HTMLElementLike} settings.fullScreenContainer - defines the container to be displayed in fullscreen, if not defined, <b>document.body</b> is displayed in fullscreen
 * @param {string} settings.documentTitle - if defined, sets the title of the HTML page
 * @param {boolean} settings.allowDLayers - set to <b>false</b> to prevent the creation of a [DLayer List]{@link tf.urlapi.DLayerList} specified by [URL Parameters]{@link tf.types.URLParameters}, defaults to <b>true</b>
 * @param {function} settings.dLayersPreProcessDataItem - passed to [DLayer List]{@link tf.urlapi.DLayerList}, defaults to {@link void} 
 * @param {function} settings.dLayersPreProcessServiceData - passed to [DLayer List]{@link tf.urlapi.DLayerList}, defaults to {@link void} 
 * @param {tf.types.SingleMapAppCreationCallBack} settings.onCreated - optional callback to receive a notification when the creation process of this instance is complete
 * @param {tf.types.AppContainerSizerCallBack} settings.onResize - optional callback passed to [App Container Sizer]{@link tf.layout.AppContainerSizer}
 * @param {tf.types.URLParameters} settings.fullURL - optional parameters to initialize the map, dlayers
 * @see [Single Map Single Pane App]{@link tf.urlapi.SingleMapSinglePaneApp}
 */
tf.urlapi.SingleMapApp = function (settings) {
    var theThis, map, dLayers, parameters, appContainerSizer, appContainerLayout, createdCallBack, perspectiveMap, perspectiveDLayers;

    /**
     * @public
     * @function
     * @summary - Retrieves the application's [URLParameters Object]{@link tf.types.URLParametersObject}
     * @returns {tf.types.URLParametersObject} - | {@link tf.types.URLParametersObject} the url parameters object
    */
    this.GetParameters = function () { return parameters; }

    /**
     * @public
     * @function
     * @summary - Retrieves the layout instance set in the creation of this Single Map App instance
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the url parameters object
    */
    this.GetAppContainerLayout = function () { return appContainerLayout; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [App Container Sizer]{@link tf.layout.AppContainerSizer} instance created by this Single Map App instance
     * @returns {tf.layout.AppContainerSizer} - | {@link tf.layout.AppContainerSizer} the instance
    */
    this.GetAppContainerSizer = function () { return appContainerSizer; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Map]{@link tf.map.Map} instance created by this Single Map App instance
     * @returns {tf.layout.AppContainerSizer} - | {@link tf.layout.AppContainerSizer} the instance
    */
    this.GetMap = function () { return map; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [DLayer List]{@link tf.urlapi.DLayerList} instance created by this Single Map App instance, if any
     * @returns {tf.urlapi.DLayerList} - | {@link tf.urlapi.DLayerList} the instance
    */
    this.GetDLayers = function () { return dLayers; }

    this.GetPerspectiveMap = function () { return perspectiveMap; }

    this.GetPerspectiveDLayers = function () { return perspectiveDLayers; }

    /**
     * @public
     * @function
     * @summary - Triggers a resize event
     * @returns {void} - | {@link void} no return value
    */
    this.Resize = function () { if (!!appContainerSizer) { appContainerSizer.OnResize(); } }

    /**
     * @public
     * @function
     * @summary - Updates the size of the map
     * @returns {void} - | {@link void} no return value
    */
    this.UpdateMapSize = function () { if (!!appContainerSizer) { appContainerSizer.UpdateMapSizes(); } }

    function onMapCreated(notification) {
        appContainerSizer.AddMap(map = notification.maps[0]);
        dLayers = notification.dLayers[0];
        perspectiveMap = notification.perspectiveMaps[0];
        perspectiveDLayers = notification.perspectiveDLayers[0];
        parameters = notification.parameters;
        if (!!createdCallBack) { setTimeout(function () { createdCallBack({ sender: theThis }); }, 1); }
        appContainerSizer.OnResize();
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);

        if (tf.dom.GetHTMLElementFrom(settings.layout)) {
            var documentTitle = tf.js.GetNonEmptyString(settings.documentTitle, tf.consts.URLAPIDocumentTitle);
            var parentContainerUse = tf.dom.GetHTMLElementFrom(settings.parentContainer);
            var fitContainerToWindow = !parentContainerUse;

            appContainerLayout = settings.layout;

            if (!parentContainerUse) { parentContainerUse = document.body; }
            createdCallBack = tf.js.GetFunctionOrNull(settings.onCreated);
            appContainerLayout.AppendTo(parentContainerUse);
            appContainerSizer = new tf.layout.AppContainerSizer({
                documentTitle: documentTitle, onResize: settings.onResize, container: appContainerLayout, fitContainerToWindow: fitContainerToWindow,
                useUpdateSizesInterval: settings.useUpdateSizesInterval
            });
            tf.urlapi.CreateURLAPIMaps({
                optionalScope: theThis, onCreated: onMapCreated, mapContainers: [settings.mapContainer],
                fullScreenContainer: settings.fullScreenContainer,
                parameters: settings.fullURL,
                allowDLayers: tf.js.GetBoolFromValue(settings.allowDLayers, true), 
                dLayersPreProcessDataItem: settings.dLayersPreProcessDataItem,
                dLayersPreProcessServiceData: settings.dLayersPreProcessServiceData
            });
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * @public
 * @class
 * @summary A Single Map Single Pane App combines a [Single Map App]{@link tf.urlapi.SingleMapApp} with a [Single Pane Layout]{@link tf.layout.SinglePane}
 * and provides a complete framework for applications that display a single map on a single pane using [URL Parameters]{tf.types.URLParameters}
 * @param {object} settings - creation settings
 * @param {HTMLElementLike} settings.parentContainer - if defined, <b>layout</b> is appended to it, if undefined the <b>Single Pane Layout</b> becomes the top application layout
 * @param {string} settings.documentTitle - if defined, sets the title of the HTML page
 * @param {boolean} settings.allowDLayers - set to <b>false</b> to prevent the creation of a [DLayer List]{@link tf.urlapi.DLayerList} specified by [URL Parameters]{@link tf.types.URLParameters}, defaults to <b>true</b>
 * @param {function} settings.dLayersPreProcessDataItem - passed to [DLayer List]{@link tf.urlapi.DLayerList}, defaults to {@link void} 
 * @param {function} settings.dLayersPreProcessServiceData - passed to [DLayer List]{@link tf.urlapi.DLayerList}, defaults to {@link void} 
 * @param {tf.types.SingleMapAppCreationCallBack} settings.onCreated - optional callback to receive a notification when the creation process of this instance is complete
 * @param {tf.types.AppContainerSizerCallBack} settings.onResize - optional callback passed to [App Container Sizer]{@link tf.layout.AppContainerSizer}
 * @param {tf.types.URLParameters} settings.fullURL - optional parameters to initialize the map, dlayers
 * @extends {tf.urlapi.SingleMapApp}
 * @see [Single Pane Layout]{@link tf.layout.SinglePane}
 */
tf.urlapi.SingleMapSinglePaneApp = function (settings) {
    var theThis = null;

    /**
     * @public
     * @function
     * @summary - Retrieves the [Single Pane Layout]{@link tf.layout.SinglePane} instance associated with this Single Map Single Pane App instance
     * @returns {tf.layout.SinglePane} - | {@link tf.layout.SinglePane} the instance
    */
    this.GetSinglePaneLayout = function () { return theThis.GetAppContainerLayout(); }

    function initialize() {
        //tf.GetStyles(tf.styles.GetGraphiteAPIStyleSpecifications());
        var localSettings = tf.js.ShallowMerge(settings);
        localSettings.mapContainer = localSettings.layout = new tf.layout.SinglePane();
        tf.urlapi.SingleMapApp.call(theThis, localSettings);
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
}
tf.js.InheritFrom(tf.urlapi.SingleMapSinglePaneApp, tf.urlapi.SingleMapApp);

/**
 * @public
 * @class
 * @summary A Single Map Content On The Side App combines a [Single Map App]{@link tf.urlapi.SingleMapApp} with a [Left Separator Right Layout]{@link tf.layout.LeftSeparatorRight}
 * @param {object} settings - creation settings
 * @param {HTMLElementLike} settings.parentContainer - if defined, <b>layout</b> is appended to it, if undefined the <b>Single Pane Layout</b> becomes the top application layout
 * @param {string} settings.documentTitle - if defined, sets the title of the HTML page
 * @param {boolean} settings.allowDLayers - set to <b>false</b> to prevent the creation of a [DLayer List]{@link tf.urlapi.DLayerList} specified by [URL Parameters]{@link tf.types.URLParameters}, defaults to <b>true</b>
 * @param {function} settings.dLayersPreProcessDataItem - passed to [DLayer List]{@link tf.urlapi.DLayerList}, defaults to {@link void} 
 * @param {function} settings.dLayersPreProcessServiceData - passed to [DLayer List]{@link tf.urlapi.DLayerList}, defaults to {@link void} 
 * @param {tf.types.SingleMapAppCreationCallBack} settings.onCreated - optional callback to receive a notification when the creation process of this instance is complete
 * @param {tf.types.AppContainerSizerCallBack} settings.onResize - optional callback passed to [App Container Sizer]{@link tf.layout.AppContainerSizer}
 * @param {tf.types.URLParameters} settings.fullURL - optional parameters to initialize the map, dlayers
 * @param {tf.types.LeftSeparatorRightCallBack} settings.onLayoutChange - optional callback to receive layout change notifications
 * @param {tf.types.CSSStyleSpecs} settings.separatorStyle - optional CSS style specifications to be applied to the vertical separator
 * @extends {tf.urlapi.SingleMapApp}
 * @see [Left Separator Right Layout]{@link tf.layout.LeftSeparatorRight}
 */
tf.urlapi.SingleMapContentOnTheSide = function (settings) {
    var theThis, leftSeparatorRightLayout, onLayoutChangeCallBack;

    /**
     * @public
     * @function
     * @summary - Retrieves the [Left Separator Right Layout]{@link tf.layout.LeftSeparatorRight} instance associated with this Single Map Single Pane App instance
     * @returns {tf.layout.LeftSeparatorRight} - | {@link tf.layout.LeftSeparatorRight} the instance
    */
    this.GetLeftSeparatorRightLayout = function () { return theThis.GetAppContainerLayout(); }

    /**
     * @public
     * @function
     * @summary - Triggers a layout change event
     * @returns {void} - | {@link void} no return value
    */
    this.OnLayoutChange = function () { return onLayoutChange(); }

    function onResize(notification) { onLayoutChange(notification); }

    function onLayoutChange(notification) {
        theThis.UpdateMapSize();
        if (!!onLayoutChangeCallBack) {
            if (!tf.js.GetIsValidObject(notification)) { notification = { sender: theThis }; }
            onLayoutChangeCallBack(notification);
        }
    }

    function initialize() {
        var localSettings = tf.js.ShallowMerge(settings);
        onLayoutChangeCallBack = tf.js.GetFunctionOrNull(localSettings.onLayoutChange);
        localSettings.layout = leftSeparatorRightLayout = new tf.layout.LeftSeparatorRight({
            optionalScope: theThis, onLayoutChange: onLayoutChange, separatorStyle: localSettings.separatorStyle,
            initiallyCollapsed: localSettings.initiallyCollapsed
        });
        if (!localSettings.noMap) { localSettings.mapContainer = localSettings.layout.GetLeft(); }
        tf.urlapi.SingleMapApp.call(theThis, localSettings);
        theThis.GetAppContainerSizer().AddResizeListener(onResize);
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.urlapi.SingleMapContentOnTheSide, tf.urlapi.SingleMapApp);

/**
 * @public
 * @class
 * @summary A Single Map HCF On The Side App combines a [Single Map App]{@link tf.urlapi.SingleMapApp} with a [Left Separator Right Layout]{@link tf.layout.LeftSeparatorRight} 
 * containing a [Header Content Footer]{@link tf.layout.HeaderContentFooter} sub-layout and provides a complete framework for applications that display a single map and
 * tables on the side
 * @param {object} settings - creation settings
 * @param {HTMLElementLike} settings.parentContainer - if defined, <b>layout</b> is appended to it, if undefined the <b>Single Pane Layout</b> becomes the top application layout
 * @param {string} settings.documentTitle - if defined, sets the title of the HTML page
 * @param {boolean} settings.allowDLayers - set to <b>false</b> to prevent the creation of a [DLayer List]{@link tf.urlapi.DLayerList} specified by [URL Parameters]{@link tf.types.URLParameters}, defaults to <b>true</b>
 * @param {function} settings.dLayersPreProcessDataItem - passed to [DLayer List]{@link tf.urlapi.DLayerList}, defaults to {@link void} 
 * @param {function} settings.dLayersPreProcessServiceData - passed to [DLayer List]{@link tf.urlapi.DLayerList}, defaults to {@link void} 
 * @param {tf.types.SingleMapAppCreationCallBack} settings.onCreated - optional callback to receive a notification when the creation process of this instance is complete
 * @param {tf.types.AppContainerSizerCallBack} settings.onResize - optional callback passed to [App Container Sizer]{@link tf.layout.AppContainerSizer}
 * @param {tf.types.URLParameters} settings.fullURL - optional parameters to initialize the map, dlayers
 * @param {tf.types.HeaderContentFooterCallBack} settings.onLayoutChange - optional callback to receive layout change notifications
 * @param {tf.types.CSSStyleSpecs} settings.separatorStyle - optional CSS style specifications to be applied to the vertical separator
 * @param {string} settings.appLogoImgStr - optional url to an application defined logo image to be displayed with the TerraFly logo in the Header pane
 * @param {color} settings.logoBkColor - optional background color used on the logo subcontainer of the Header pane, ignored if <b>logoStyle</b> is defined
 * @param {tf.types.CSSStyleSpecs} settings.logoStyle - optional CSS style specifications to be applied to the logo subcontainer of the Header pane
 * @param {tf.types.CSSStyleSpecs} settings.pageStyle - optional CSS style specifications to be applied to layout container
 * @param {tf.types.CSSStyleSpecs} settings.headerStyle - optional CSS style specifications to be applied to the Header pane
 * @param {tf.types.CSSStyleSpecs} settings.contentStyle - optional CSS style specifications to be applied to the Content pane
 * @param {tf.types.CSSStyleSpecs} settings.footerStyle - optional CSS style specifications to be applied to the Footer pane
 * @see [Single Map App]{@link tf.urlapi.SingleMapApp}
 * @see [Left Separator Right Layout]{@link tf.layout.LeftSeparatorRight}
 * @see [Header Content Footer Layout]{@link tf.layout.HeaderContentFooter}
 */
tf.urlapi.SingleMapHCFOnTheSideApp = function (settings) {
    var theThis = null, singleAppContentOnTheSide = null, HCFLayout = null;

    /**
     * @public
     * @function
     * @summary - Retrieves the [Single Map App]{@link tf.urlapi.SingleMapApp} instance associated with this Single Map Single Pane App instance
     * @returns {tf.urlapi.SingleMapApp} - | {@link tf.urlapi.SingleMapApp} the instance
    */
    this.GetSingleAppMapContentOnTheSide = function () { return singleAppContentOnTheSide; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Header Content Footer Layout]{@link tf.layout.HeaderContentFooter} instance associated with this Single Map Single Pane App instance
     * @returns {tf.layout.HeaderContentFooter} - | {@link tf.layout.HeaderContentFooter} the instance
    */
    this.GetHCFLayout = function () { return HCFLayout; }

    function onAppLayoutChange() {
        if (HCFLayout) { HCFLayout.OnResize(); }
    }

    function onHCFLayoutChange() {
        if (singleAppContentOnTheSide) { singleAppContentOnTheSide.OnLayoutChange(); }
    }

    function initialize() {
        var localSettings = tf.js.ShallowMerge(settings);
        localSettings.onLayoutChange = onAppLayoutChange;
        localSettings.useUpdateSizesInterval = true;
        singleAppContentOnTheSide = new tf.urlapi.SingleMapContentOnTheSide(localSettings);
        singleAppContentOnTheSide.GetLeftSeparatorRightLayout().GetRight().AddContent(
            HCFLayout = new tf.layout.HeaderContentFooter({
                onLayoutChange: onHCFLayoutChange, appLogoImgStr: localSettings.appLogoImgStr, logoBkColor: localSettings.logoBkColor,
                pageStyle: localSettings.pageStyle, contentStyle: tf.js.ShallowMerge(localSettings.contentStyle, { overflow: 'hidden' }), headerStyle: localSettings.headerStyle,
                footerStyle: localSettings.footerStyle, logoStyle: localSettings.logoStyle,
                documentTitle: localSettings.documentTitle
            }));
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * @public
 * @function
 * @summary - Examines the URL parameters and creates either a [Single Map Single Pane App]{@link tf.urlapi.SingleMapSinglePaneApp} instance implementing the URL-API,
 * or one of the applications that are nativelly supported by the TerraFly API
 * @param {object} settings - creation settings
 * @param {tf.types.URLParameters} settings.fullURL - optional parameters to initialize the map, dlayers
 * @returns {tf.urlapi.SingleMapSinglePaneApp} - | {@link tf.urlapi.SingleMapSinglePaneApp} the instance
*/
tf.urlapi.CreateURLAPIApp = function (settings) {
    var urlapiApp = null;

    settings = tf.js.GetValidObjectFrom(settings);

    var params = tf.urlapi.ParseURLAPIParameters(settings.fullURL);
    var appSpecs = params[tf.consts.paramNameAppSpecs];

    if (tf.js.GetIsValidObject(appSpecs) || tf.js.GetNonEmptyString(appSpecs)) {
        settings.fullURL = params; urlapiApp = new tf.urlapi.AppFromSpecs(settings);
    }

    if (!urlapiApp) {
        tf.GetStyles(tf.styles.GetGraphiteAPIStyleSpecifications());
        //urlapiApp = new tf.urlapi.SingleMapSinglePaneApp(settings);
        urlapiApp = new tf.urlapi.URLAPIApp(settings);
    }

    return urlapiApp;
}

/**
 * class tf.urlapi.AppFromSpecs - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} settings - parameter description?
*/
tf.urlapi.AppFromSpecs = function (settings) {
    var theThis, styles, subStyles, singleAppHCFOnTheSide, singleAppMapContentOnTheSide, twoHorPaneLayout, HCFLayout, appSpecs, dLayers;
    var tables, headerDiv, toolBar, curTableIndex, titleDiv, titleObj, appSizer, tablesByDLayerIndex, map, settingsOnRefresh, settingsInitTables, prevTable;
    var className = "AppFromSpecs";
    var noRefreshButton;
    var nextTableButton, prevTableButton;
    var eventDispatcher, tableChangeEventName;

    this.AddTableChangeListener = function (callBack) { return addTableChangeListener(callBack); }

    function addTableChangeListener(callBack) { return eventDispatcher.AddListener(tableChangeEventName, callBack); }

    this.GotoTable = function (tableIndex) { return gotoTable(tableIndex); }
    this.GetTableScroller = function (tableIndex) { return getTableScroller(tableIndex); }
    this.GetCurTableIndex = function () { return curTableIndex; }
    this.UpdateCurTableFooter = function () { return updateCurTableFooter(); }

    this.GetToolBar = function () { return toolBar; }
    this.AddToHeader = function (elem) { if (!!elem) { headerDiv.AddContent(elem); }}
    this.AddToToolBar = function (elem) { if (!!elem) { toolBar.AddContent(elem); } }
    this.GetToolBarButtonDim = function () { return getToolBarButtonDim(); }
    this.GetToolBarSvgButtonStyle = function () { return getToolBarSvgButtonStyle(); }

    this.GetSingleAppHCFOnTheSide = function () { return singleAppHCFOnTheSide; }

    this.GetTitleDiv = function () { return titleDiv; }

    this.GetPrevButton = function () { return prevTableButton; }
    this.GetNextButton = function () { return nextTableButton; }

    this.GetMap = function () { return map; }
    this.GetHCFLayout = function () { return HCFLayout; }
    this.GetAppSizer = function () { return appSizer; }
    this.GetTwoHorPaneLayout = function () { return twoHorPaneLayout; }

/**
 * method tf.urlapi.AppFromSpecs.GetAppSpecs - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetAppSpecs = function () { return appSpecs; }

    this.AddListenersToMap = function (map) { return addListenersToMap(map); }

    function onLayoutChange() { if (singleAppHCFOnTheSide) { singleAppHCFOnTheSide.OnLayoutChange(); } }

    function getRowContent(notification) {
        var keyedItem = notification.keyedItem;
        var rowContentData = notification.properties;
        var content = null;

        if (!!keyedItem && !!rowContentData) {
            var props = keyedItem.GetData().properties;
            var dLayerIndex = rowContentData.dLayerIndex;
            var rowContentSpecs = appSpecs["dlayerrowcontent" + dLayerIndex];

            if (tf.js.GetIsValidObject(rowContentSpecs)) {
                content = new tf.dom.Div({ cssClass: tf.GetStyles().dLayerInfoClass });
                for (var i in rowContentSpecs) {
                    var thisContent = rowContentSpecs[i];
                    if (tf.js.GetIsString(thisContent)) { content.AddContent(tf.js.ReplaceWithValues(thisContent, props)); }
                    else if (tf.js.GetIsValidObject(thisContent) && tf.js.GetIsNonEmptyString(thisContent.type)) {
                        var hRef, src;
                        switch (thisContent.type) {
                            case 'image':
                                src = tf.js.ReplaceWithValues(thisContent.src, props);
                                if (tf.js.GetIsNonEmptyString(src)) { content.AddContent(tf.urlapi.CreateInfoWindowImg(src)); }
                                break;
                            case 'link':
                                hRef = tf.js.ReplaceWithValues(thisContent.href, props);
                                if (tf.js.GetIsNonEmptyString(hRef)) {
                                    content.AddContent(tf.urlapi.CreateInfoWindowLink(
                                        hRef,
                                        tf.js.ReplaceWithValues(thisContent.label, props, 'link'),
                                        tf.js.ReplaceWithValues(thisContent.tooltip, props, 'click to follow link'),
                                        tf.js.ReplaceWithValues(thisContent.target, props, '_top')));
                                }
                                break;
                            case 'imagelink':
                                hRef = tf.js.ReplaceWithValues(thisContent.href, props);
                                src = tf.js.ReplaceWithValues(thisContent.src, props);
                                if (tf.js.GetIsNonEmptyString(hRef) && tf.js.GetIsNonEmptyString(src)) {
                                    var link = tf.urlapi.CreateInfoWindowLink(
                                        hRef,
                                        null,
                                        tf.js.ReplaceWithValues(thisContent.tooltip, props, 'click to follow link'),
                                        tf.js.ReplaceWithValues(thisContent.target, props, '_top'));
                                    link.AddContent(tf.urlapi.CreateInfoWindowImg(src));
                                    content.AddContent(link);
                                }
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
            else {
                content = props.Display_Label;
                if (content == '.') {
                    content = props.Display_Summary_Longer_Text;
                }
            }
        }

        appSizer.UpdateMapSizes();

        return { sender: theThis, content: content };
    }

    function updateCurTableFooter() {
        updateFooter(tables[curTableIndex].table, tables[curTableIndex].dLayer);
    }

    function onRefresh() {
        if (!!settingsOnRefresh) { settingsOnRefresh(); }
        if (dLayers) {
            dLayers.RefreshAll();
            updateCurTableFooter();
            appSizer.UpdateMapSizes();
        }
    }

    function onPrevTable() { gotoTable(curTableIndex - 1); }
    function onNextTable() { gotoTable(curTableIndex + 1); }

    function hidePrevTable() {
        if (!!prevTable) {
            prevTable.tableScrollerDiv.GetHTMLElement().style.display = 'none';
            prevTable = undefined;
        }
    }

    function getTableScroller(tableIndex) {
        var tableScroller;
        if (tableIndex >= 0 && tableIndex < tables.length) {
            tableScroller = tables[tableIndex].tableScrollerDiv;
        }
        return tableScroller;
    }

    function onNotifyTableChange(attrs) { eventDispatcher.Notify(tableChangeEventName, tf.js.ShallowMerge(attrs, { sender: theThis, tableIndex: curTableIndex })); }

    function gotoTable(newTableIndex) {
        if (newTableIndex >= tables.length) { newTableIndex = 0; }
        else if (newTableIndex < 0) { newTableIndex = tables.length - 1; }
        if (curTableIndex === undefined || curTableIndex != newTableIndex) {
            hidePrevTable();
            var prevCurTableIndex = curTableIndex;
            var table = tables[curTableIndex = newTableIndex], strTitle;
            prevTable = table;
            prevTable.tableScrollerDiv.GetHTMLElement().style.display = 'block';
            //HCFLayout.SetContent(table.table);
            if (!!table.dLayer) {
                strTitle = table.dLayer.GetName();
                dLayers.MoveToTopZIndex(table.dLayer);
            }
            else {
                strTitle = tf.js.GetIsNonEmptyString(table.title) ? table.title : "";
            }
            titleDiv.innerHTML = strTitle;
            updateFooter(table.table, table.dLayer);
            onNotifyTableChange({ prevTableIndex: prevCurTableIndex });
        }
        appSizer.UpdateMapSizes();
    }

    function getToolBarButtonDim() { return subStyles.mapButtonDimEmNumber + "em" }
    function getToolBarSvgButtonStyle() { return true; }

    function createToolBar() {
        var glyphLib = tf.ui.GetSvgGlyphLib();
        var buttonDim = getToolBarButtonDim();
        var refreshButton = null, useLight = getToolBarSvgButtonStyle();
        //useLight = styles.CreateSvgGlyphClasses("#000", "#fff", "#ff0", "#00F");

        toolBar = HCFLayout.CreateUnPaddedDivForHeader();
        //toolBar.GetHTMLElement().title = "TOOLBAR";
        styles.AddBorderTop(toolBar, true);
        styles.AddBorderBottom(toolBar, true);
        var tbStyle = toolBar.GetHTMLElement().style;
        tbStyle.textAlign = 'left';
        //tbStyle.position = 'relative'; // setting this breaks menus
        if (!noRefreshButton) {
            toolBar.AddContent(refreshButton = styles.AddButtonDivMargins(
                new tf.ui.SvgGlyphBtn({ style: useLight, glyph: tf.styles.SvgGlyphRefreshName, onClick: onRefresh, tooltip: "Refresh", dim: buttonDim })
                ));
        }
        if (tables.length > 1) {
            toolBar.AddContent(prevTableButton = styles.AddButtonDivMargins(
                new tf.ui.SvgGlyphBtn({ style: useLight, glyph: tf.styles.SvgGlyphLeftArrowName, onClick: onPrevTable, tooltip: "Prev", dim: buttonDim })
                ));
            toolBar.AddContent(nextTableButton = styles.AddButtonDivMargins(
                new tf.ui.SvgGlyphBtn({ style: useLight, glyph: tf.styles.SvgGlyphRightArrowName, onClick: onNextTable, tooltip: "Next", dim: buttonDim })
                ));
        }
        HCFLayout.AddToHeader(toolBar);
        //HCFLayout.AddAfterLogo(toolBar);
    }

    function updateFooter(table, dLayer) {
        var footerStrHtml = '', hasRecords = true;

        if (!!dLayer) { if (dLayer.GetIsRefreshing()) { footerStrHtml = "Searching..."; hasRecords = false; } }

        if (hasRecords) {
            var nRecords = table.GetKeyedList().GetItemCount();

            if (nRecords == 0) { footerStrHtml = "No records found"; }
            else {
                var recordStr = nRecords > 1 ? " records " : " record ";
                footerStrHtml = nRecords + recordStr + "found";
            }
        }
        HCFLayout.SetFooter(footerStrHtml);
    }

    function panToFeature(map, mapFeature) { map.AnimatedSetCenterIfDestVisible(mapFeature.GetPointCoords()); }

    function onRowSelect(notification) {
        var table = notification.keyedTable;
        var props = table.GetProperties();
        if (props.index == curTableIndex) {
            if (notification.selected !== notification.prevSelected || notification.isClick) {
                var dLayer = props.dLayer;
                var map = dLayer.GetMap();
                var featureList = dLayer.GetFeatureList();
                if (!!featureList) {
                    var keyedItem = notification.selected.GetKeyedItem();
                    if (!!keyedItem) {
                        var mapFeature = featureList.GetFeature(keyedItem.GetKey());
                        if (!!mapFeature) {
                            panToFeature(map, mapFeature);
                            tf.urlapi.ShowdLayerInfoWindow(mapFeature.GetMapFeature());
                        }
                    }
                }
            }
        }
    }

    function onTableChanged(notification) {
        appSizer.UpdateMapSizes();
        var table = notification.sender;
        var props = table.GetProperties();
        if (props.index == curTableIndex) {
            updateFooter(table, props.dLayer);
        }
    }

    function onFeatureHoverInOut(notification) {
        if (notification.isInHover) {
            var props = tf.js.GetObjProperty(notification.mapFeature, tf.consts.DLayerProperty);

            if (tf.js.GetIsValidObject(props)) {
                if (!props.map.IsInfoPopupPinned()) {
                    var dLayer = props.dLayer;
                    var table = getTableForDLayer(dLayer);

                    if (!!table) {
                        if (table.index == curTableIndex) {
                            var keyedFeature = notification.keyedFeature;
                            var keyedItem = keyedFeature.GetKeyedItem();
                            table.table.GetRowFromKeyedItem(keyedItem).Select(true, true);
                        }
                    }
                }
            }
        }
    }

    function onFeatureClick(notification) {
        var props = tf.js.GetObjProperty(notification.mapFeature, tf.consts.DLayerProperty);

        if (tf.js.GetIsValidObject(props)) {
            var dLayer = props.dLayer;
            var table = getTableForDLayer(dLayer);

            if (!!table) {
                var keyedFeature = notification.keyedFeature;

                //new tf.services.Routing({ fromCoords: [tf.consts.defaultLongitude, tf.consts.defaultLatitude], toCoords: keyedFeature.GetPointCoords(), callBack: onRoute, optionalScope: theThis});

                var keyedItem = keyedFeature.GetKeyedItem();
                gotoTable(table.index);
                if (props.map.IsInfoPopupPinned()) {
                    props.map.ToggleInfoPopupPin();
                    tf.urlapi.ShowdLayerInfoWindow(notification.mapFeature);
                }
                setTimeout(function () { table.table.GetRowFromKeyedItem(keyedItem).Select(true, true); }, 100);
            }
        }
    }

    function getTableForDLayer(dLayer) { return tablesByDLayerIndex[dLayer.GetIndex()]; }

    function addListenersToMap(map) {
        if (!!(map = tf.js.GetMapFrom(map))) {
            var mapEventSettings = {};
            var mapMonitor;

            mapEventSettings[tf.consts.mapFeatureHoverInOutEvent] = onFeatureHoverInOut;
            mapEventSettings[tf.consts.mapFeatureClickEvent] = onFeatureClick;
            mapMonitor = map.AddListeners(mapEventSettings);
        }
    }

    function createTables() {
        var nDLayers = !!dLayers ? dLayers.GetCount() : 0;

        addListenersToMap(map);
        tables = !!settingsInitTables ? settingsInitTables() : [];
        tablesByDLayerIndex = {};

        for (var i = 0 ; i < nDLayers ; i++) {
            var dLayer = !!dLayers ? dLayers.Get(i) : null;
            var dLayerIndex = i + 1;

            if (dLayer) {
                var tableSettings = appSpecs["dlayertablestyle" + dLayerIndex];

                if (!!tableSettings) {
                    var selectOnHover = appSpecs["dlayerselectonhover" + dLayerIndex];

                    tableSettings = tf.js.ShallowMerge(tableSettings, { selectOnHover: selectOnHover, onSelect: onRowSelect });

                    var table = dLayer.CreateKeyedTable({
                        optionalScope: theThis,
                        onContentChange: onTableChanged,
                        tableSettings: tableSettings,
                        rowSettings: { style: appSpecs['dlayerrowstyle' + dLayerIndex], selectedStyle: appSpecs['dlayerrowhover' + dLayerIndex] },
                        properties: { dLayer: dLayer, dLayerIndex: dLayerIndex, index: tables.length },
                        getRowContent: getRowContent
                    });

                    var tableElem = { table: table, dLayer: dLayer, index: tables.length };

                    tablesByDLayerIndex[dLayer.GetIndex()] = tableElem;
                    tables.push(tableElem);
                }
            }
        }

        if (tf.js.GetIsArrayWithMinLength(tables, 1)) {
            titleObj = HCFLayout.CreateUnPaddedDivForHeader();
            titleDiv = titleObj.GetHTMLElement();

            createToolBar();

            styles.ApplyTextAlignCenterStyle(titleObj);
            titleDiv.style.verticalAlign = "middle";
            titleDiv.style.paddingTop = titleDiv.style.paddingBottom = "2px";

            if (tf.js.GetIsValidObject(appSpecs.titleStyle)) {
                styles.ApplyStyleProperties(titleObj, appSpecs.titleStyle);
            }

            HCFLayout.AddToHeader(titleObj);

            var tableAllDiv = new tf.dom.Div(), tableAllDivE = tableAllDiv.GetHTMLElement();

            tableAllDivE.style.overflow = "hidden";
            tableAllDivE.style.height = "100%";

            for (var i in tables) {
                var table = tables[i];
                var tableScrollerDiv = new tf.dom.Div(), tableScrollerDivE = tableScrollerDiv.GetHTMLElement();
                var tableElem = table.table.GetHTMLElement();
                tableScrollerDiv.AddContent(tableElem);
                tableScrollerDivE.style.display = 'none';
                tableScrollerDivE.style.overflow = "hidden";
                tableScrollerDivE.style.overflowY = "scroll";
                tableScrollerDivE.style.height = "100%";
                table.tableScrollerDiv = tableScrollerDiv;
                tableAllDiv.AddContent(tableScrollerDiv);
            }

            HCFLayout.SetContent(tableAllDiv);

            gotoTable(0);
        }
    }

    function onMapCreated() {
        twoHorPaneLayout = (singleAppMapContentOnTheSide = singleAppHCFOnTheSide.GetSingleAppMapContentOnTheSide()).GetLeftSeparatorRightLayout();
        HCFLayout = singleAppHCFOnTheSide.GetHCFLayout();
        map = singleAppMapContentOnTheSide.GetMap();
        dLayers = singleAppMapContentOnTheSide.GetDLayers();
        appSizer = singleAppMapContentOnTheSide.GetAppContainerSizer();
        twoHorPaneLayout.SetRightSideCollapsed(false);
        headerDiv = HCFLayout.CreateUnPaddedDivForHeader();
        HCFLayout.AddToHeader(headerDiv);
        createTables();
        if (tf.js.GetFunctionOrNull(settings.onCreated)) { settings.onCreated({ sender: theThis }); }
    }

    var propsRecorded = true;
    var settingsFilterDLayerRecord;
    var recordFiltered = false;

    function filterDLayerRecord(props) {
        if (!recordFiltered) {
            recordFiltered = true;
            if (props.UC_X1 !== undefined) {
                var UC_X1 = tf.js.GetLongitudeFrom(props.UC_X1);
                var UC_X2 = tf.js.GetLongitudeFrom(props.UC_X2);
                var UC_X3 = tf.js.GetLongitudeFrom(props.UC_X3);
                var UC_X4 = tf.js.GetLongitudeFrom(props.UC_X4);
                var UC_Y1 = tf.js.GetLatitudeFrom(props.UC_Y1);
                var UC_Y2 = tf.js.GetLatitudeFrom(props.UC_Y2);
                var UC_Y3 = tf.js.GetLatitudeFrom(props.UC_Y3);
                var UC_Y4 = tf.js.GetLatitudeFrom(props.UC_Y4);
                var v1 = [UC_X1, UC_Y1], v2 = [UC_X2, UC_Y2], v3 = [UC_X3, UC_Y3], v4 = [UC_X4, UC_Y4];
                props.additionalFeatureSpecs = [
                    {
                        type: "linestring", coordinates: [v1, v2, v3, v4, v1],
                        style: [{ line: true, line_color: "#fff", line_width: 4 }, { line: true, line_color: "#000", line_width: 2 }]
                    }
                ];
                props.hoverFeatureSpecs = [
                    {
                        type: "polygon", coordinates: [[v1, v2, v3, v4]],
                        style: { line: true, line_color: "#00a", line_width: 4, fill: true, fill_color: "#fff", fill_opacity: 40, zindex: 2 }
                    },
                    { type: "point", coordinates: v1, style: { marker: true, label: "v1" } },
                    { type: "point", coordinates: v2, style: { marker: true, label: "v2" } },
                    { type: "point", coordinates: v3, style: { marker: true, label: "v3" } },
                    { type: "point", coordinates: v4, style: { marker: true, label: "v4" } }
                ];
            }
            if (!propsRecorded) {
                tf.GetDebug().FileLog("alta", props);
                propsRecorded = true;
            }
        }
        if (!!settingsFilterDLayerRecord) { settingsFilterDLayerRecord(props); }
    }

    function onFontLoaded() {
        styles = tf.GetStyles(appSpecs.APIStyleSpecs); subStyles = styles.GetSubStyles();
        noRefreshButton = settings.noRefreshButton;
        settingsFilterDLayerRecord = tf.js.GetFunctionOrNull(settings.dLayersPreProcessDataItem);
        settingsOnRefresh = tf.js.GetFunctionOrNull(settings.onRefresh);
        settingsInitTables = tf.js.GetFunctionOrNull(settings.initTables);
        appSpecs.fullURL = tf.js.ShallowMerge(settings.fullURL, appSpecs.replaceURLParams);
        appSpecs.onCreated = onMapCreated;
        appSpecs.initiallyCollapsed = appSpecs.initiallyCollapsed;
        appSpecs.dLayersPreProcessDataItem = tf.js.GetBoolFromValue(appSpecs.filterDLayerRecord, false) ? filterDLayerRecord : settingsFilterDLayerRecord;
        //appSpecs.dLayersPreProcessDataItem = filterDLayerRecord;
        appSpecs.dLayersPreProcessServiceData = tf.js.GetFunctionOrNull(settings.dLayersPreProcessServiceData);
        if (tf.js.GetFunctionOrNull(settings.onAppSpecsLoaded)) { settings.onAppSpecsLoaded(appSpecs); }
        singleAppHCFOnTheSide = new tf.urlapi.SingleMapHCFOnTheSideApp(appSpecs);
    }

    function onAppSpecsLoaded(appSpecsSet) {

        if (tf.js.GetIsValidObject(appSpecs = appSpecsSet)) {
            var loadFonts = false;

            if (tf.js.GetIsValidObject(appSpecs.APIStyleSpecs)) {
                if (tf.js.GetIsNonEmptyString(appSpecs.APIStyleSpecs.googleFonts)) {
                    loadFonts = true;
                    tf.dom.AddLink("http://fonts.googleapis.com/css?family=" + appSpecs.APIStyleSpecs.googleFonts, "stylesheet", "text/css", onFontLoaded);
                }
            }
            if (!loadFonts) { onFontLoaded(); }
            //appSpecs.APIStyleSpecs.fontFamily = "Roboto Condensed";
            //appSpecs.APIStyleSpecs.markerFontFamily = "Roboto Condensed";
            //onFontLoaded();
        }
        else {
            tf.GetDebug().LogIfTest("AppFromSpecs: invalid file specs content");
        }
    }

    function onSettingsLoaded(notification) { onAppSpecsLoaded(notification.data); }

    function initialize() {
        var debugStr;
        tableChangeEventName = "tblxng";
        eventDispatcher = new tf.events.MultiEventNotifier({ eventNames: [tableChangeEventName] });
        if (tf.js.GetIsValidObject(settings)) {
            if (tf.js.GetIsValidObject(settings.fullURL)) {
                var specsURL = settings.fullURL[tf.consts.paramNameAppSpecs];
                if (tf.js.GetIsValidObject(specsURL)) { onAppSpecsLoaded(specsURL); }
                else if (tf.js.GetNonEmptyString(specsURL)) {
                    var downloadObj = new tf.ajax.JSONGet();
                    downloadObj.Request(specsURL, onSettingsLoaded, theThis, null, false);
                }
                else { debugStr = "'settings." + tf.consts.paramNameAppSpecs + "' are missing"; }
            }
            else { debugStr = "'settings.fullURL' must be an object"; }
        }
        else { debugStr = "invalid 'settings'"; }
        if (!!debugStr) { tf.GetDebug().LogIfTest(className + ": " + debugStr); }
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
