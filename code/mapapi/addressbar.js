"use strict";

/**
 * class tf.map.ui.AddressBar - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} container - parameter description?
 * @param {?} tMap - parameter description?
 * @param {?} rectProvider - parameter description?
*/
tf.map.ui.AddressBar = function (container, tMap, rectProvider) {

    var theThis, tBarPopup, inputObj, input, styles, subStyles, goMapButton, goDBButton, goHelpButton, inputListItem, buttonDim, geoLocation, addressBarHelpStr;

/**
 * method tf.map.ui.AddressBar.Show - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} bool - parameter description?
*/
    this.Show = function (bool) { return show (bool) ; }
/**
 * method tf.map.ui.AddressBar.IsShowing - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.IsShowing = function () { return isShowing(); }
/**
 * method tf.map.ui.AddressBar.Toggle - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Toggle = function () { return toggle(); }

/**
 * method tf.map.ui.AddressBar.OnContainerResize - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.OnContainerResize = function () { return onContainerResize(); }

/**
 * method tf.map.ui.AddressBar.SetAddressBarText - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} addressBarText - parameter description?
*/
    this.SetAddressBarText = function (addressBarText) { return setAddressBarText(addressBarText); }
/**
 * method tf.map.ui.AddressBar.GetAddressBarText - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetAddressBarText = function () { return getAddressBarText(); }

/**
 * method tf.map.ui.AddressBar.SetAddressBarHelp - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} addressBarHelpStr - parameter description?
*/
    this.SetAddressBarHelp = function (addressBarHelpStr) { return setAddressBarHelp(addressBarHelpStr); }

    function show(bool) {
        return tBarPopup ? tBarPopup.Show(bool) : false;
    }
    function isShowing () { return tBarPopup ? tBarPopup.IsShowing() : false; }
    function toggle () {return tBarPopup ? tBarPopup.Toggle() : false; }

    function setAddressBarHelp(addressBarHelpStrSet) { addressBarHelpStr = tf.js.GetNonEmptyString(addressBarHelpStrSet, tf.consts.defaultHelp); }
    function setAddressBarText(addressBarText) { inputObj.SetValue(addressBarText); }
    function getAddressBarText() { return inputObj.GetValue(); }

    function getKeyNumFromEvent(e) { return (typeof e === "object") ? (window.event && e.keyCode) ? e.keyCode : (e.which ? e.which : 0) : 0; }

    function handleKeyPressed(e) {
        if (isShowing ()) {
            var key = getKeyNumFromEvent(e);
            if (key == 13) { goMap(); }
        }
    }

    function goMap() {
        var address = getAddressBarText();
        if (address.length > 0) { tMap.FlyToAddress(address); }
        else if (!!geoLocation) { geoLocation.getCurrentPosition(successGeoLoc, failedGeoLoc); }
    }

    function successGeoLoc(position) {
        /*setAddressBarText (position.coords.latitude + "," + position.coords.longitude) ;*/
        //tMap.PanTo(position.coords.latitude, position.coords.longitude);
        tMap.SetCenter([position.coords.longitude, position.coords.latitude]);
    }

    function successGeoLocDB(position) { tMap.GoDBByCoords(position);}

    function failedGeoLoc(err) {
        /*if (err.code == 1) { error("The user denied the request for location information.") } 
        else if (err.code == 2) { error("Your location information is unavailable.") } 
        else if (err.code == 3) { error("The request to get your location timed out.") } 
        else { error("An unknown error occurred while requesting your location.") }*/
    }

    function goDB() {
        var address = getAddressBarText();
        if (address.length > 0) { tMap.GoDBByAddress(address); }
        else if (!!geoLocation) { geoLocation.getCurrentPosition(successGeoLocDB, failedGeoLoc); }
    }

    function goHelp() { tMap.ShowMessage(addressBarHelpStr); }

    function onContainerResize() {
        /*var buttons = [goMapButton, goDBButton, goHelpButton];

        for (var button in buttons) {
            var style = buttons[button].GetHTMLElement().style;
            style.display = 'inline-block' ;
        }*/

        /*var listItemHeight = inputListItem.GetHTMLElement().clientHeight;
        var barHeight = tBarPopup.GetHTMLElement().clientHeight;
        var showButtons = listItemHeight * 1.1 > barHeight;

        if (!showButtons) {
            for (var button in buttons) {
                var style = buttons[button].GetHTMLElement().style;
                style.display = showButtons ? 'inline-block' : 'none';
            }
        }*/
    }

    function initialSetup() {
        geoLocation = navigator.geolocation;
        styles = tf.GetStyles();
        subStyles = styles.GetSubStyles();

        buttonDim = subStyles.mapButtonDimEmNumber + "em";

        addressBarHelpStr = tf.consts.defaultHelp;

        tBarPopup = new tf.ui.ToolBarPopup(container, rectProvider);
        inputListItem = new tf.dom.Div({ cssClass: tf.GetStyles().GetPaddedDivClassNames(true, false) });

        inputObj = new tf.dom.TextInput({ id: 'tf-address-input', label: "Enter an address or a place", value: "", tooltip: "Type in an address, or lat/lon coordinates" });
        input = inputObj.GetHTMLElement();

        var onKeyPress = function () { var evt = arguments[0] || event; return handleKeyPressed(evt); }

        tf.events.AddDOMEventListener(input, "keyup", onKeyPress);

        //input.size = 30;
        input.size = 24;
        input.style.fontSize = subStyles.addressBarFontSize;
        inputObj.AppendTo(inputListItem);

        var useLight = false;

        useLight = styles.mapSvgGlyphInPopupClass;

        var closeButton = styles.AddButtonDivLeftRightMargins(
            new tf.ui.SvgGlyphBtn({ style: useLight, glyph: tf.styles.SvgGlyphMagnifyingLensName, onClick: toggle, tooltip: "Close address bar", dim: buttonDim }));

        goMapButton = styles.AddButtonDivLeftMargin(
            new tf.ui.SvgGlyphBtn({ style: useLight, glyph: tf.styles.SvgGlyphMapPinName, onClick: goMap, tooltip: "Move the Map to this Address", dim: buttonDim }));
        goDBButton = styles.AddButtonDivLeftMargin(
            new tf.ui.SvgGlyphBtn({ style: useLight, glyph: tf.styles.SvgGlyphInfoName, onClick: goDB, tooltip: "Get Local Reports for this Address", dim: buttonDim }));
        goHelpButton = styles.AddButtonDivLeftMargin(
            new tf.ui.SvgGlyphBtn({ style: useLight, glyph: tf.styles.SvgGlyphQuestionMarkName, onClick: goHelp, tooltip: "Get Help Information", dim: buttonDim }));

        //inputListItem.GetHTMLElement().title = "hello, world.";

        tBarPopup.AddContent(closeButton, false);
        tBarPopup.AddContent(inputListItem, true);
        inputListItem.AddContent(goMapButton, goDBButton, goHelpButton);
        //tBarPopup.AddContent(goMapButton);
        //tBarPopup.AddContent(goDBButton);
        //tBarPopup.AddContent(goHelpButton, true);
        //tBarPopup.SetFocusElem(inputObj);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialSetup(); })(this);
};

/**
 * class tf.map.ui.DownloadBar - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} container - parameter description?
 * @param {?} tMap - parameter description?
 * @param {?} rectProvider - parameter description?
 * @param {?} onCloseCallBack - parameter description?
 * @param {?} onDownloadCallBack - parameter description?
 * @param {?} theThisOnCallBack - parameter description?
*/
tf.map.ui.DownloadBar = function (container, tMap, rectProvider, onCloseCallBack, onDownloadCallBack, theThisOnCallBack) {

/**
 * method tf.map.ui.DownloadBar.Show - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} bool - parameter description?
*/
    this.Show = function (bool) { return show(bool); }
/**
 * method tf.map.ui.DownloadBar.IsShowing - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.IsShowing = function () { return isShowing(); }
/**
 * method tf.map.ui.DownloadBar.Toggle - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Toggle = function () { return toggle(); }

    var theThis = null;
    var tBarPopup = null;

    function show(bool) { return tBarPopup ? tBarPopup.Show(bool) : false; }
    function isShowing() { return tBarPopup ? tBarPopup.IsShowing() : false; }
    function toggle() { return tBarPopup ? tBarPopup.Toggle() : false; }

    function onClickDownload() {
        if (typeof onDownloadCallBack == "function") {
            onDownloadCallBack.call(theThisOnCallBack, theThis);
        }
    }

    function initialSetup() {
        tBarPopup = new tf.ui.ToolBarPopup(container, rectProvider);

        var inputListItem = new tf.dom.Div({ cssClass: tf.GetStyles().GetPaddedDivClassNames(false, false) });
        var contentSpan = new tf.dom.Span();
        var styles = tf.GetStyles();
        var subStyles = styles.GetSubStyles();
        var buttonDim = subStyles.mapControlFontSizeEmNumber + "em";

        var downloadButton = new tf.ui.TextBtn({ style: styles.mapTextBtnClass, label: "Download", onClick: onClickDownload, tooltip: "Click here to download", dim: buttonDim });

        contentSpan.AddContent("Select map area to ")

        contentSpan.GetHTMLElement().style.fontSize = buttonDim;//subStyles.mapControlFontSize;
        styles.ApplyStyleProperties(contentSpan, subStyles.textShadowStyle);

        inputListItem.AddContent(contentSpan, downloadButton);

        var closeButton = styles.CloseXButtonForPopup(false, onCloseCallBack, buttonDim);

        closeButton.GetHTMLElement().style.transform = "";
        closeButton = styles.AddButtonDivRightMargin(closeButton);

        tBarPopup.AddContent(closeButton, false, false);
        tBarPopup.AddContent(inputListItem, true);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialSetup(); })(this);
};

/**
 * class tf.map.ui.MeasureBar - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} container - parameter description?
 * @param {?} tMap - parameter description?
 * @param {?} rectProvider - parameter description?
 * @param {?} onCloseCallBack - parameter description?
 * @param {?} onChangeTypeCallBack - parameter description?
 * @param {?} theThisOnCallBack - parameter description?
*/
tf.map.ui.MeasureBar = function (container, tMap, rectProvider, onCloseCallBack, onChangeTypeCallBack, theThisOnCallBack) {

/**
 * method tf.map.ui.MeasureBar.Show - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} bool - parameter description?
*/
    this.Show = function (bool) { return show(bool); }
/**
 * method tf.map.ui.MeasureBar.IsShowing - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.IsShowing = function () { return isShowing(); }
/**
 * method tf.map.ui.MeasureBar.Toggle - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Toggle = function () { return toggle(); }

/**
 * method tf.map.ui.MeasureBar.OnContainerResize - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.OnContainerResize = function () { return onContainerResize(); }

/**
 * method tf.map.ui.MeasureBar.GetIsMeasuringDistances - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetIsMeasuringDistances = function () { return measuringDistances; }

    var theThis = null;
    var tBarPopup = null;

    var measureTypeButton = null;
    var measuringDistances = true;

    var distancesName = "Distances";
    var areasName = "Areas";

    function show(bool) { return tBarPopup ? tBarPopup.Show(bool) : false; }
    function isShowing() { return tBarPopup ? tBarPopup.IsShowing() : false; }
    function toggle() { return tBarPopup ? tBarPopup.Toggle() : false; }

    function onClickType() {
        if (measuringDistances = !measuringDistances) {
            measureTypeButton.SetText(distancesName);
        }
        else {
            measureTypeButton.SetText(areasName);
        }
        if (typeof onChangeTypeCallBack == "function") {
            onChangeTypeCallBack.call(theThisOnCallBack, theThis);
        }
    }

    function onContainerResize() {
        //var popup = tBarPopup.GetHTMLElement();
        //popup.style.width = popup.style.height = "0px";
        //popup.style.width = popup.style.height = "auto";
    }

    function initialSetup() {
        tBarPopup = new tf.ui.ToolBarPopup(container, rectProvider);

        var inputListItem = new tf.dom.Div({ cssClass: tf.GetStyles().GetPaddedDivClassNames(false, false) });
        var contentSpan = new tf.dom.Span();
        var styles = tf.GetStyles();
        var subStyles = styles.GetSubStyles();
        var buttonDim = subStyles.mapControlFontSizeEmNumber + "em";

        measureTypeButton = new tf.ui.TextBtn({ style: styles.mapTextBtnClass, label: measuringDistances ? distancesName : areasName, onClick: onClickType, tooltip: "Click or touch the map to measure", dim: buttonDim });

        contentSpan.AddContent("Measuring ");

        contentSpan.GetHTMLElement().style.fontSize = buttonDim;//subStyles.mapControlFontSize;
        styles.ApplyStyleProperties(contentSpan, subStyles.textShadowStyle);

        inputListItem.AddContent(contentSpan, measureTypeButton);

        var closeButton = styles.CloseXButtonForPopup(false, onCloseCallBack, buttonDim);

        closeButton.GetHTMLElement().style.transform = "";
        closeButton = styles.AddButtonDivRightMargin(closeButton);

        tBarPopup.AddContent(closeButton, false, false);
        tBarPopup.AddContent(inputListItem, true);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialSetup(); })(this);
};