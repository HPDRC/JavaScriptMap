"use strict";

tf.dom.StyleSheet = function (settings) {
    var theThis, allRules, usingInsert, styleElem, styleSheet, rules, nRules;

    this.GetAllRules = function () { return allRules; }
    this.GetIsActive = function () { return styleElem != undefined; }

    this.AddStyles = function (styleOrStyleArray) {
        if (styleOrStyleArray != undefined) {
            if (styleOrStyleArray.length == undefined) { styleOrStyleArray = [styleOrStyleArray]; }
            var nStyles = styleOrStyleArray.length;
            for (var i = 0; i < nStyles; ++i) {
                var thisStyle = styleOrStyleArray[i];
                if (thisStyle != undefined && thisStyle.styleName != undefined) {
                    updateOrInsertRule(thisStyle.styleName, addStyleProperties(thisStyle));
                }
            }
        }
    }

    function unCamelize(name) {
        var newName = '', nChars = typeof name === "string" ? name.length : 0;
        for (var i = 0; i < nChars; ++i) {
            var thisChar = name[i], thisCharLower = thisChar.toLowerCase();
            newName += thisChar == thisCharLower ? thisChar : "-" + thisCharLower;
        }
        return newName;
    };

    function addStyleProperties(style, styleStr) {
        typeof styleStr !== "string" && (styleStr = '');
        var prop;
        for (var property in style) {
            if (style.hasOwnProperty(property)) {
                if (property != 'styleName') {
                    if (property == 'inherits') {
                        if (typeof (prop = style[property]) === "object") {
                            if (prop.length) { for (var p in prop) { if (prop.hasOwnProperty(p)) { styleStr = addStyleProperties(prop[p], styleStr); } } }
                            else { styleStr = addStyleProperties(prop, styleStr) }
                        }
                    }
                    else switch (property) {
                        case "tf-shadow":
                            break;
                        default:
                            prop = style[property]; property = unCamelize(property); styleStr += property + ' : ' + prop + '; ';
                            break;
                    }
                }
            }
        }
        return styleStr;
    }

    function updateOrInsertRule(selector, style) { return updateRule(selector, style) || insertRule(selector, style); }

    function updateRule(selector, style) {
        var updatedOK = false;
        var existingRule = allRules[selector];
        if (!!existingRule) {
            try {
                existingRule.style.cssText = style;
                updatedOK = true;
                allRules[selector] = style;
            }
            catch (exception) {
                updatedOK = false;
                //console.log('failed to update css selector ' + selector + ' ' + exception);
            }
            allRules[selector] = styleSheet[nRules];
        }
        return updatedOK
    }

    function insertRule(selector, style) {
        var insertedOK = false;
        if (!!styleSheet) {
            nRules = rules.length;
            try {
                if (usingInsert) { styleSheet.insertRule(selector + "{" + style + "}", nRules); } else { styleSheet.addRule(selector, style); }
                insertedOK = true;
                allRules[selector] = style;
            }
            catch (exception) {
                insertedOK = false;
            }
        }
        return insertedOK;
    }

    function createStyleSheet() {
        var head = settings.document.getElementsByTagName("head");

        if (head != undefined && head.length > 0) {
            styleElem = settings.document.createElement("style");
            styleElem.type = "text/css";
            head[0].appendChild(styleElem);
            if (!!(styleSheet = styleElem.sheet != undefined ? styleElem.sheet : (styleElem.styleSheet != undefined ? styleElem.styleSheet : undefined))) {
                if (!(rules = getStyleSheetRules(styleSheet))) { styleSheet = undefined; }
            }
            if (styleSheet != undefined) {
                if (!(usingInsert = (typeof styleSheet.insertRule == "function"))) {
                    if (typeof styleSheet.addRule != "function") {
                        styleSheet = undefined;
                    }
                }
            }
            if (styleSheet == undefined) { styleElem = undefined; }
        }
    }

    function getStyleSheetRules(styleSheet) {
        var rules;
        if (!!styleSheet) {
            try {
                var mediaType = typeof styleSheet.media;
                rules = mediaType == "string" ? styleSheet.rules : (mediaType == "object" ? styleSheet.cssRules : null);

                if (!rules) {
                    if (!!styleSheet.sheet && !!styleSheet.sheet.cssRules) {
                        rules = styleSheet.sheet.cssRules;
                    }
                }
            } catch (e) {
                //console.log('could not find style sheet rules');
                rules = undefined;
            }
        }
        return rules;
    }

    function initialize() {
        usingInsert = false;
        allRules = {};
        createStyleSheet();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * An object whose properties specify some of the visual attributes used by the TerraFly API, used in the creation of the [Styles]{@link tf.styles.Styles} {@link singleton}
 * @private
 * @typedef {object} tf.types.APIStyleSpecs
 * @property {string} fontFamily - default font family
 * @property {string} markerFontFamily - default font family for displaying text features on the map
 * @property {number} mapButtonDimEmNumber - dimension of map buttons
 * @property {number} mapButtonMarginEmNumber - margin of map buttons
 * @property {number} mapButtonSpacingEmNumber - spacing of map buttons
 * @property {number} mapScaleLineBkColor - background color of the map scale line
 * @property {colorWithOptionalAlpha} mapScaleLineBkColor - background color of the map scale line
 * @property {number} mapScaleLineBorderRadiusPxNumber - border radius of the map scale line
 * @property {number} mapScaleLinePaddingPxNumber - padding of the map scale line
 * @property {string} mapScaleLineBorder - border of the map scale line, example: "1px solid #07375f"
 * @property {number} mapScaleLineFontSizeEmNumber - font size of the map scale line
 * @property {number} mapScaleLineMarginPxNumber - line margin of the map scale line
 * @property {colorWithOptionalAlpha} mapScaleLineFontColor - text color of the map scale line
 * @property {number} overviewMapWidthPxNumber - width of the overview map, in pixels
 * @property {number} overviewMapHeightPxNumber - height of the overview map, in pixels
 * @property {number} overviewMapBorderWidthPxNumberNumber - border width of the overview map border, in pixels
 * @property {string} overviewMapBoxBorder - border of the overview map inner box, example: "2px dotted rgba(255,255,255,1.0)"
 * @property {string} tfLogoBorderRadius - border radius of the TerraFly logo displayed on the map, example: "10%"
 * @property {HTMLElementSize} tfLogoWidth - width of the TerraFly logo displayed on the map, example: "8em"
 * @property {HTMLElementSize} tfLogoHeight - height of the TerraFly logo displayed on the map, example: "8em"
 * @property {tf.types.opacity01} tfLogoOpacity - opacity of the TerraFly logo displayed on the map, example: 0.8
 * @property {colorWithOptionalAlpha} tfLogoBkColor - background color of the TerraFly logo displayed on the map
 * @property {string}  tfLogoBorder - border of the TerraFly logo displayed on the map, example: "1px solid rgba(128,128,128,0.3)"
 * @property {number} mapControlLineHeightEmNumber - line height of text in map controls
 * @property {colorWithOptionalAlpha} mapControlTextColor - text color of map controls
 * @property {number} maxHeightLogoImageEmNumber - maximum height of logos
 * @property {number} maxWidthLogoImageEmNumber - maximum width of logos
 * @property {number} imageThumbWidthEmNumber - maximum dimension of thumbnail images
 * @property {number} infoPopupContentFontSizeEmNumber - font size for map Info Popups
 * @property {number} locationPopupContentFontSizeEmNumber - font size for map Location Popups
 * @property {number} mapControlFontSizeEmNumber - font size for map buttons
 * @property {string} mapControlFontWeight - font weight for for map buttons, example: "700"
 * @property {number} popupContentFontSizeEmNumber - font size for popup contents
 * @property {number} topFontSizePXNumber - font size for top container, changing this default also impacts any element sizes that are defined in EM units
 * @property {number} markerFontSizePXNumber - default font size for displaying text features on the map
 * @property {number} buttonBorderRadiusPxNumber - button border radius
 * @property {number} buttonMarginTopBottomPxNumber - button vertical margins
 * @property {number} buttonMarginLeftRightPxNumber - button horizontal margins
 * @property {number} textButtonPaddingTopBottomPxNumber - text button vertical padding
 * @property {number} textButtonPaddingLeftRightPxNumber - text button horizontal padding
 * @property {number} paddingPxNumber - padding for padded containers
 * @property {number} popupContainerPaddingPxNumber - padding for padded popup containers
 * @property {number} popupCaptionBorderRadiusPXNumber - border radius for popup captions
 * @property {number} popupCaptionBorderRadiusPXNumber - border radius for popup captions
 * @property {number} popupContentPaddingPXNumber - popup content padding
 * @property {number} popupContentBorderRadiusPXNumber - popup content border radius
 * @property {number} svgButtonBorderRadiusPercentNumber - border radius for svg buttons
 * @property {colorWithOptionalAlpha} lightTextColor - light style text color
 * @property {colorWithOptionalAlpha} darkTextColor - dark style text color
 * @property {colorWithOptionalAlpha} disabledTextColor - color for disabled or grayed out text
 * @property {colorWithOptionalAlpha} borderLightColor - light style container separator color
 * @property {colorWithOptionalAlpha} borderDarkColor - dark style container separator color
 * @property {colorWithOptionalAlpha} defaultButtonBk - default button background color
 * @property {colorWithOptionalAlpha} defaultButtonFill - default button fill color
 * @property {colorWithOptionalAlpha} buttonShapedLinkBkColor - background color for links shaped like buttons
 * @property {colorWithOptionalAlpha} buttonShapedLinkTextColor - text color for links shaped like buttons
 * @property {number} buttonShapedLinkMarginPxNumber - margin for links shaped like buttons
 * @property {string} buttonShapedLinkTextShadow - text shadow for links shaped like buttons, example: "1px 1px 1px #333"
 * @property {string} buttonShapedLinkTextShadowHover - text shadow for links shaped like buttons, example: "1px 1px 1px #ccc"
 * @property {colorWithOptionalAlpha} buttonShapedLinkHoverBkColor - background color for links shaped like buttons
 * @property {colorWithOptionalAlpha} buttonShapedLinkHoverTextColor - text color for links shaped like buttons
 * @property {colorWithOptionalAlpha} mapControlBkColor - map control background color
 * @property {colorWithOptionalAlpha} mapControlHoverBkColor - map control background color on hover
 * @property {colorWithOptionalAlpha} mapControlButtonBkColor- map button background color
 * @property {colorWithOptionalAlpha} mapControlButtonHoverBkColor - map button background color on hover
 * @property {colorWithOptionalAlpha} popupContentBkColor - popup content background color
 * @property {colorWithOptionalAlpha} containerDarkBackgroundColor - dark style container background color
 * @property {colorWithOptionalAlpha} containerDarkSelBackgroundColor - dark style selected container background color
 * @property {colorWithOptionalAlpha} hcfLayoutContainerBkColor - {@link tf.layout.HeaderContentFooter} container default background color
 * @property {colorWithOptionalAlpha} popupCaptionBackgroundColor - popup caption background color
 * @property {colorWithOptionalAlpha} separatorBackgroundColor - layout separator background color
 * @property {colorWithOptionalAlpha} buttonLightBkg - light style button background color
 * @property {colorWithOptionalAlpha} buttonLightFill - light style button fill/text color
 * @property {colorWithOptionalAlpha} buttonDarkBkg - dark style button background color
 * @property {colorWithOptionalAlpha} buttonDarkFill - dark style button fill/text color
 * @property {colorWithOptionalAlpha} lightTextDivBtnColor - light style text button text color
 * @property {colorWithOptionalAlpha} darkTextDivBtnColor - dark style text button text color
 * @property {colorWithOptionalAlpha} textInputBackgroundColor - background color for text input
 * @property {colorWithOptionalAlpha} dLayerSpanBackgroundColor - background color for dLayer text spans
 * @property {colorWithOptionalAlpha} mapPopupTextButtonTextColor - text color of map buttons in popups
 * @property {colorWithOptionalAlpha} mapPopupTextButtonBkColor - background color of map buttons in popups
 * @property {colorWithOptionalAlpha} dLayerSpanBackgroundColor - background color for dLayer text spans
 * @property {colorWithOptionalAlpha} inputFormBkColor - background color for input forms
 * @property {number} inputFormBorderRadiusPxNumber - border radius for input forms
 * @property {number} imgFramePaddingBorderWidthEmNumber - padding used in image frames, for best results coordinate size with <b>imgFrameBorder</b>
 * @property {string} imgFrameBorder - border used in image frames, for best results coordinate size with <b>imgFramePaddingBorderWidthEmNumber</b>
 * @property {string} textShadow -default text shadow style, with light color shadow, example: "1px 1px 1px #eee"
 * @property {string} darkTextShadow - default text shadow style, with dark color shadow, example: "1px 1px 1px #333"
 * @property {string} textShadowSelRadioCheckStyle - text shadow for selected radio button and check box labels, example: "1px 2px 2px #ddd"
 * @property {string} borderSeparatorLineSpecs - used for border separators, example: "1px solid"
 * @property {string} mapZoomInBorderRadius - used for the map's zoom in button, example: "2px 2px 0 0"
 * @property {string} mapZoomOutBorderRadius - used for the map's zoom out button, example: "0 0 2px 2px"
 * @property {number} verticalSeparatorWidthEMNumber - width of vertical layout separators
 * @property {number} horizontalSeparatorHeightEMNumber - height of horizontal layout separators
*/

/**
 * @public
 * @function
 * @summary - Returns the default TerraFly style specifications, used in the creation of the [Styles]{@link tf.styles.Styles} {@link singleton}
 * @returns {tf.types.APIStyleSpecs} - the default specifications
*/
tf.styles.GetDefaultAPIStyleSpecifications = function () {

    var mapButtonDimEmNumber = 2.25;
    var mapControlFontSizeEmNumber = mapButtonDimEmNumber - 0.5;
    var popupContentFontSizeEmNumber = mapButtonDimEmNumber - 0.75;
    var fontFamily = "Arial,Verdana,Geneva,Lucida,Arial,Helvetica,sans-serif";
    //var fontFamily = "'SourceSansPro-regular',Verdana,Geneva,Lucida,Arial,Helvetica,sans-serif";

    var niceDarkColor = "#07375f";
    var niceLightTextColor = "#fff";

    var niceButtonBkColor = "#456DA7";
    var niceButtonFillColor = "#fff";

    var imgFramePaddingBorderWidthEmNumber = 0.15;

    var dLayerSpanBackgroundColor = "#ffd";

    var textShadow = '1px 1px 1px #eee';
    var darkTextShadow = '1px 1px 1px #333';
    var textShadowSelRadioCheck = '1px 2px 2px #ddd';

    var borderSeparatorLineSpecs = "1px solid";

    var textInputBackgroundColor = "#fff";

    var mapZoomInBorderRadius = "2px 2px 0 0";
    var mapZoomOutBorderRadius = "0 0 2px 2px";

    var mapControlLineHeightEmNumber = 0.4;
    var mapControlTextColor = "#00618b";
    var mapScaleLineBkColor = "rgba(255,255,255,0.7)";
    var mapScaleLineBorderRadiusPxNumber = 4;
    var mapScaleLinePaddingPxNumber = 2;
    var mapScaleLineBorder = "1px solid " + mapControlTextColor;
    var mapScaleLineFontSizeEmNumber = 0.9;
    var mapScaleLineMarginPxNumber = 1;
    var mapScaleLineFontColor = mapControlTextColor;
    var mapSubLegendBkColor = "#e4f4ff";

    var tfLogoBorderRadius = "10%";
    var tfLogoWidth = "8em";
    var tfLogoHeight = "8em";
    var tfLogoOpacity = "0.8";
    var tfLogoBkColor = "rgba(255,255,255,0.3)";
    var tfLogoBorder = "1px solid rgba(128,128,128,0.3)";

    var mapControlFontWeight = "700";

    var overviewMapWidthPxNumber = 200;
    var overviewMapHeightPxNumber = 200;
    var overviewMapBorderWidthPxNumberNumber = 2;
    var overviewMapBoxBorder = "2px dotted rgba(255,255,255,1.0)";

    var buttonShapedLinkBkColor = niceButtonBkColor;
    var buttonShapedLinkTextColor = niceButtonFillColor;

    var buttonShapedLinkHoverBkColor = "#0869bf";
    var buttonShapedLinkHoverTextColor = "#fdfff0";

    //var mapPopupTextButtonTextColor = niceButtonBkColor;
    //var mapPopupTextButtonBkColor = "#fff";

    var mapPopupTextButtonTextColor = "#fff";
    var mapPopupTextButtonBkColor = niceButtonBkColor;

    var buttonShapedLinkTextShadow = "1px 1px 1px #333";
    var buttonShapedLinkTextShadowHover = "1px 1px 1px #999";

    var buttonShapedLinkMarginPxNumber = 2;

    var inputFormBkColor = "#fff";

    var inputFormBorderRadiusPxNumber = 6;

    //this.QuietJSDoc = function() { }

    return {

        fontFamily: fontFamily,
        markerFontFamily: fontFamily,

        inputFormBkColor: inputFormBkColor,
        inputFormBorderRadiusPxNumber: inputFormBorderRadiusPxNumber,

        mapZoomInBorderRadius: mapZoomInBorderRadius,
        mapZoomOutBorderRadius: mapZoomOutBorderRadius,

        mapPopupTextButtonTextColor:mapPopupTextButtonTextColor,
        mapPopupTextButtonBkColor:mapPopupTextButtonBkColor,

        textInputBackgroundColor: textInputBackgroundColor,
        borderSeparatorLineSpecs: borderSeparatorLineSpecs,

        textShadow: textShadow,
        darkTextShadow: darkTextShadow,
        textShadowSelRadioCheck: textShadowSelRadioCheck,

        dLayerSpanBackgroundColor: dLayerSpanBackgroundColor,

        overviewMapWidthPxNumber :overviewMapWidthPxNumber,
        overviewMapHeightPxNumber :overviewMapHeightPxNumber,
        overviewMapBorderWidthPxNumberNumber :overviewMapBorderWidthPxNumberNumber,
        overviewMapBoxBorder : overviewMapBoxBorder,

        mapButtonDimEmNumber: mapButtonDimEmNumber,
        mapButtonMarginEmNumber: 0.33,
        mapButtonSpacingEmNumber: 0.75,
        mapScaleLineBkColor: mapScaleLineBkColor,
        mapScaleLineBorderRadiusPxNumber: mapScaleLineBorderRadiusPxNumber,
        mapScaleLinePaddingPxNumber: mapScaleLinePaddingPxNumber,
        mapScaleLineBorder: mapScaleLineBorder,
        mapScaleLineFontSizeEmNumber: mapScaleLineFontSizeEmNumber,
        mapScaleLineMarginPxNumber: mapScaleLineMarginPxNumber,
        mapScaleLineFontColor: mapScaleLineFontColor,
        mapControlFontWeight: mapControlFontWeight,
        mapSubLegendBkColor: mapSubLegendBkColor,

        tfLogoBorderRadius: tfLogoBorderRadius,
        tfLogoWidth: tfLogoWidth,
        tfLogoHeight: tfLogoHeight,
        tfLogoOpacity: tfLogoOpacity,
        tfLogoBkColor: tfLogoBkColor,
        tfLogoBorder: tfLogoBorder,

        mapControlLineHeightEmNumber: mapControlLineHeightEmNumber,
        mapControlTextColor: mapControlTextColor,

        maxHeightLogoImageEmNumber: 4.5,
        maxWidthLogoImageEmNumber: 12,
        imageThumbWidthEmNumber: 8,

        infoPopupContentFontSizeEmNumber: 1.2,
        locationPopupContentFontSizeEmNumber: 1,

        mapControlFontSizeEmNumber: mapControlFontSizeEmNumber,
        popupContentFontSizeEmNumber: popupContentFontSizeEmNumber,

        topFontSizePXNumber: 12,
        markerFontSizePXNumber: 14,

        buttonBorderRadiusPxNumber: 3,
        buttonMarginTopBottomPxNumber: 2,
        buttonMarginLeftRightPxNumber: 6,

        textButtonPaddingTopBottomPxNumber: 2,
        textButtonPaddingLeftRightPxNumber: 5,

        paddingPxNumber: 4,
        popupContainerPaddingPxNumber: 8,
        popupCaptionBorderRadiusPXNumber: 5,

        popupContentPaddingPXNumber: 5,
        popupContentBorderRadiusPXNumber: 10,

        svgButtonBorderRadiusPercentNumber: 20,

        lightTextColor: niceLightTextColor,
        darkTextColor: niceDarkColor,
        disabledTextColor: "#a4a4a4",

        borderLightColor: "#BFBFBF",
        borderDarkColor: niceDarkColor,

        defaultButtonBk: niceButtonBkColor,
        defaultButtonFill: niceButtonFillColor,

        buttonShapedLinkBkColor: buttonShapedLinkBkColor,
        buttonShapedLinkTextColor: buttonShapedLinkTextColor,
        buttonShapedLinkTextShadow: buttonShapedLinkTextShadow,

        buttonShapedLinkHoverBkColor: buttonShapedLinkHoverBkColor,
        buttonShapedLinkHoverTextColor: buttonShapedLinkHoverTextColor,
        buttonShapedLinkTextShadowHover: buttonShapedLinkTextShadowHover,

        buttonShapedLinkMarginPxNumber: buttonShapedLinkMarginPxNumber,

        mapControlBkColor: "rgba(244,244,254,.75)",
        mapControlHoverBkColor: "rgba(244,244,254,0.9)",
        mapControlButtonHoverBkColor: "rgba(255,255,255,1)",
        mapControlButtonBkColor: "rgba(244,244,254,.6)",

        popupContentBkColor: "rgb(219, 232, 241)",

        containerDarkBackgroundColor: niceDarkColor,
        containerDarkSelBackgroundColor: "rgb(25,182,0)",

        hcfLayoutContainerBkColor: niceDarkColor,

        popupCaptionBackgroundColor: "#eeeeee",
        separatorBackgroundColor: "#FF8800",

        buttonLightBkg: niceButtonBkColor,
        buttonLightFill: niceButtonFillColor,

        buttonDarkBkg: niceButtonFillColor,
        buttonDarkFill: niceButtonBkColor,

        lightTextDivBtnColor: niceLightTextColor,
        darkTextDivBtnColor: niceDarkColor,

        imgFramePaddingBorderWidthEmNumber: imgFramePaddingBorderWidthEmNumber,
        imgFrameBorder: imgFramePaddingBorderWidthEmNumber + "em solid " + niceDarkColor,

        verticalSeparatorWidthEMNumber: 0.85,
        horizontalSeparatorHeightEMNumber: 0.85
    };
};

/**
 * @public
 * @function
 * @summary - Returns the default TerraFly style specifications, used in the creation of the [Styles]{@link tf.styles.Styles} {@link singleton}
 * @returns {tf.types.APIStyleSpecs} - the default specifications
*/
tf.styles.GetGraphiteAPIStyleSpecifications = function () {
    var APIStyleSpecs = {
        separatorBackgroundColor: "rgba(0,107,133, 0.8)",
        inputFormBkColor: "rgba(128,128,128,0.5)",
        mapPopupTextButtonTextColor: "rgba(255,255,255,1)",
        mapPopupTextButtonBkColor: "rgba(0,0,0,0.7)",
        mapSubLegendBkColor: "rgba(0,0,0,0.5)",
        buttonShapedLinkBkColor: "rgba(0,0,0,0.5)",
        buttonShapedLinkTextColor: "rgba(255,255,255,1)",
        buttonShapedLinkHoverBkColor: "#fff",
        buttonShapedLinkMarginPxNumber: 1,
        buttonShapedLinkHoverTextColor: "rgba(0,0,0,1)",
        topFontSizePXNumber: 12,
        darkTextColor: "#eef",
        paddingPxNumber: "6",
        popupCaptionBorderRadiusPXNumber: 16,
        popupContentBkColor: "rgba(192, 192, 192, 0.6)",
        popupCaptionBackgroundColor: "rgba(210, 210, 210, 0.6)",
        mapControlButtonBkColor: "rgba(192, 192, 192, 0.7)",
        mapControlButtonHoverBkColor: "rgba(244, 244, 244, 0.7)",
        buttonDarkFill: "rgba(0, 0, 0, 0.7)",
        dLayerSpanBackgroundColor: "rgba(32, 32, 32, 1)",
        textShadow: '1px 1px 1px #000',
        darkTextShadow: '1px 1px 1px #fff',
        textShadowSelRadioCheck: '1px 1px 1px #333',
        borderSeparatorLineSpecs: "1px solid",
        textInputBackgroundColor: "#000",
        mapZoomInBorderRadius: "5px 5px 0 0",
        mapZoomOutBorderRadius: "0 0 5px 5px",
        mapControlFontWeight: "700",
        mapScaleLineBkColor: "rgba(255,255,255,0.5)",
        mapScaleLineBorderRadiusPxNumber: 4,
        mapScaleLinePaddingPxNumber: 2,
        mapScaleLineBorder: "1px solid #07375f",
        mapScaleLineFontSizeEmNumber: 0.9,
        mapScaleLineMarginPxNumber: 4,
        mapScaleLineFontColor: "rgba(0, 0, 0, 0.7)",
        tfLogoBorderRadius: "10%",
        tfLogoWidth: "8em",
        tfLogoHeight: "8em",
        tfLogoOpacity: 0.8,
        tfLogoBkColor: "rgba(255,255,255,0.3)",
        tfLogoBorder: "1px solid rgba(128,128,128,0.3)",
        mapControlLineHeightEmNumber: 0,
        mapControlTextColor: "rgba(0, 0, 0, 1)",
        overviewMapWidthPxNumber: 300,
        overviewMapHeightPxNumber: 200,
        overviewMapBorderWidthPxNumberNumber: 1,
        overviewMapBoxBorder: "2px dotted red"
    };
    return tf.js.ShallowMerge(tf.styles.GetDefaultAPIStyleSpecifications(), APIStyleSpecs);
};

/**
 * @public
 * @class
 * @summary - The {@link singleton} instance of this class, obtainable by calling {@link tf.GetStyles}().[GetSubStyles]{@link tf.styles.Styles#GetSubStyles}(),
 * includes the pre-defined [CSS Style Specifications]{@link tf.types.CSSStyleSpecs} used by the API
 * @param {tf.styles.Styles} styles - the {@link singleton} [Styles]{@link tf.styles.Styles} instance
 * @param {tf.types.APIStyleSpecs} alternativeSpecs - if defined, overrides the default API style specifications
*/
tf.styles.SubStyles = function (styles, alternativeSpecs) {

    var theThis;

    var mapButtonDimEmNumber, mapButtonMarginEmNumber, mapButtonSpacingEmNumber, topLeftButtonEmNumber, topRightButtonEmNumber;
    var maxHeightLogoImageEmNumber, maxWidthLogoImageEmNumber, borderSeparatorLightSpecs, borderSeparatorDarkSpecs, borderSeparatorButtonBkSpecs;
    var textButtonPaddingTopBottomPxNumber, textButtonPaddingLeftRightPxNumber;
    var buttonBorderRadiusPxNumber, buttonMarginTopBottomPxNumber, buttonMarginLeftRightPxNumber;
    var svgButtonBorderRadiusPercentNumber;
    var verticalSeparatorWidthEMNumber, horizontalSeparatorHeightEMNumber;
    var paddingPxNumber, popupCaptionBorderRadiusPXNumber, popupContentPaddingPXNumber, popupContentBorderRadiusPXNumber, dLayerSpanBackgroundColor;
    var textShadow, darkTextShadow, textShadowSelRadioCheck, borderSeparatorLineSpecs, textInputBackgroundColor, mapZoomInBorderRadius, mapZoomOutBorderRadius;
    var mapScaleLineBkColor;
    var mapScaleLineBorderRadiusPxNumber;
    var mapScaleLinePaddingPxNumber;
    var mapScaleLineBorder;
    var mapScaleLineFontSizeEmNumber;
    var mapScaleLineMarginPxNumber;
    var mapScaleLineFontColor, mapControlFontWeight;
    var tfLogoBorderRadius;
    var tfLogoWidth;
    var tfLogoHeight;
    var tfLogoOpacity;
    var tfLogoBkColor;
    var tfLogoBorder;
    var mapControlLineHeightEmNumber;
    var mapControlTextColor;
    var overviewMapWidthPxNumber;
    var overviewMapHeightPxNumber;
    var overviewMapBorderWidthPxNumberNumber;
    var overviewMapBoxBorder;
    var mapPopupTextButtonTextColor, mapPopupTextButtonBkColor;
    var buttonShapedLinkTextShadow, buttonShapedLinkTextShadowHover;
    var buttonShapedLinkMarginPxNumber;
    var inputFormBkColor;
    var inputFormBorderRadiusPxNumber;

    /*this.popupContainerPaddingPxNumber=null;
    this.lightTextColor=null; this.darkTextColor=null; this.disabledTextColor=null; this.borderLightColor=null; this.defaultButtonBk=null; this.defaultButtonFill=null; 
    this.buttonShapedLinkBkColor=null; this.buttonShapedLinkTextColor=null;
    this.buttonShapedLinkHoverBkColor=null; this.buttonShapedLinkHoverTextColor=null;
    this.topFontSizePXNumber=null; this.markerFontSizePXNumber=null;
    this.textButtonHeightDelta=null;
    this.imageThumbWidthEmNumber=null; this.imageThumbSquareHeightEmNumber=null; this.imageThumbRectHeightEmNumber=null;
    this.mapButtonDimEmNumber=null; this.mapButtonMarginEmNumber=null;
    this.mapLocationButtonTopEmNumber=null;
    this.mapControlBkColor=null; this.mapControlHoverBkColor=null; this.mapControlButtonHoverBkColor=null; this.mapControlButtonBkColor=null;
    this.containerDarkBackgroundColor=null; this.containerDarkSelBackgroundColor=null; this.hcfLayoutContainerBkColor=null; this.popupCaptionBackgroundColor=null; this.separatorBackgroundColor=null;
    this.buttonLightBkg=null; this.buttonLightFill=null; this.buttonDarkBkg=null; this.buttonDarkFill=null; this.lightTextDivBtnColor=null; this.darkTextDivBtnColor=null;

    this.imgFramePaddingBorderWidthEmNumber=null; this.imgFrameBorder=null; this.mapSubLegendBkColor = null*/

    /**
     * @public
     * @function
     * @summary - Retrieves the [Styles]{@link tf.styles.Styles} {@link singleton}
     * @returns {tf.styles.Styles} - | {@link tf.styles.Styles} the {@link singleton}
    */
    this.GetStyles = function () { return styles; }

    /**
     * @public
     * @function
     * @summary - Creates HTML Shadow [Style Specifications]{@link tf.types.CSSStyleSpecs} that can be applied
     * with the function [ApplyStyleProperties]{@link tf.style.Styles#ApplyStyleProperties} or used as a building block of
     * another style specification
     * @param {number} offXPxNumber - horizontal offset, in pixels
     * @param {number} offYPxNumber - vertical offset, in pixels
     * @param {number} blurPxNumber - blur radius, in pixels
     * @param {colorWithOptionalAlpha} shadowColorStr - color
     * @returns {tf.types.CSSStyleSpecs} - | {@link tf.types.CSSStyleSpecs} the specifications
    */
    this.CreateShadowStyle = function (offXPxNumber, offYPxNumber, blurPxNumber, shadowColorStr) { return createShadowStyle(offXPxNumber, offYPxNumber, blurPxNumber, shadowColorStr); }

    /**
     * @public
     * @function
     * @summary - Creates custom [Style Specifications]{@link tf.types.CSSStyleSpecs} used by [SVG Glyph Button]{@link tf.ui.SvgGlyphBtn} instances to customize 
     * the <b>glyph</b> and <b>background</b> colors displayed in normal and hover states
     * @param {color} glyphColor - normal glyph color
     * @param {color} backgroundColor - normal background color
     * @param {color} glyphColorHover - glyph color on hover
     * @param {color} backgroundColorHover - background color on hover
     * @returns {tf.types.CSSStyleAndHoverSpecifications} - | {@link tf.types.CSSStyleAndHoverSpecifications} the style specifications
    */
    this.CreateSvgGlyphStyles = function (glyphColor, backgroundColor, glyphColorHover, backgroundColorHover) { return createSvgGlyphStyles(glyphColor, backgroundColor, glyphColorHover, backgroundColorHover); }

    /**
     * @public
     * @function
     * @summary - Creates custom [Style Specifications]{@link tf.types.CSSStyleSpecs} used by [Text Button]{@link tf.ui.TextBtn} instances to customize the <b>text</b> and <b>background</b> colors displayed 
     * in normal and hover states
     * @param {color} textColor - normal text color
     * @param {color} backgroundColor - normal background color
     * @param {color} textColorHover - text color on hover
     * @param {color} backgroundColorHover - background color on hover
     * @returns {tf.types.CSSStyleAndHoverSpecifications} - | {@link tf.types.CSSStyleAndHoverSpecifications} the style specifications
    */
    this.CreateTextDivBtnStyles = function (textColor, backgroundColor, textColorHover, backgroundColorHover) { return createTextDivBtnStyles(textColor, backgroundColor, textColorHover, backgroundColorHover); }

    this.mapControlFontSizeEmNumber = null;
    this.popupContentFontSizeEmNumber = null;
    this.popupContentBkColor = null;
    this.addressBarFontSize = null;
    this.infoPopupContentFontSizeEmNumber = null;
    this.locationPopupContentFontSizeEmNumber = null;

    /*
    this.fontFaceStyleContentStr=null;
    this.popupCaptionBorderRadiusStyle=null; this.popupContentPaddingStyle=null; this.popupContentBorderRadiusStyle=null; this.textShadowStyle=null; this.darkTextShadowStyle=null;
    this.seShadowStyle=null; this.horShadowStyle=null;
    this.textShadowSelRadioCheckStyle=null; this.defaultWidthHeightRadioCheckStyle=null; this.defaultRightPaddingRadioCheckStyle=null;
    this.paddingStyle=null; this.paddingLeftRightStyle=null; this.separatorBkColorStyle=null; this.rightSideContainerBkColorStyle=null; this.hcfLayoutContainerBkColorStyle =null;
    this.popupCaptionBackgroundColorStyle=null; this.divIconCursorStyle=null; this.noBorderMarginPaddingStyle=null; this.verticalSeparatorWidthStyle=null; this.horizontalSeparatorHeightStyle=null;
    this.darkTextColorStyle=null; this.lightTextColorStyle=null; this.disabledTextColorStyle=null; this.defaultButtonBkStyle=null; this.buttonBorderRadiusStyle=null;
    this.appContainerStyle=null; this.mapContainerStyle=null; this.mapSubContainerStyle=null; this.popupMapToolBarBaseStyle=null; this.mapToolBarContainerStyle=null;
    this.topSeparatorLightStyle=null; this.bottomBorderSeparatorLightStyle=null;
    this.bottomBorderSeparatorDarkStyle=null; this.rightBorderSeparatorLightStyle=null; this.rightBorderSeparatorDarkStyle=null;
    this.popupContainerStyle=null; this.popupContentStyle=null; this.spanStyle=null; this.spanCursorPointerStyle=null;
    this.appContainerBaseStyle=null; this.hcfLayoutStyle=null; this.hcfLayoutHeaderStyle=null; this.hcfLayoutFooterStyle=null; this.hcfLayoutContentStyle=null;
    this.buttonShapedLinkStyle=null; this.buttonShapedLinkHoverStyle=null; this.dLayerInfoStyle=null; this.dLayerInfoImgStyle=null; this.dLayerInfoLinkStyle=null; this.dLayerInfoLinkHoverStyle=null; this.dLayerInfoSpanStyle=null;
    this.inputTextPlaceholderStyle=null; this.inputTextStyle=null; this.radioCheckStyle=null; this.radioCheckWithDimStyle=null; this.radioCheckLabelStyle=null; this.radioCheckRemoveDefaultStyle=null; this.radioCheckLabelCheckedStyle=null;
    this.radioLabelStyle=null; this.radioRadioStyle=null; this.radioRadioAndLabelCheckedStyle=null; this.radioRadioAndLabelStyleBefore=null; this.radioRadioAndLabelSelStyleBefore=null;
    this.checkLabelStyle=null; this.checkCheckStyle=null; this.checkCheckAndLabelCheckedStyle=null; this.checkCheckAndLabelStyleBefore=null; this.checkCheckAndLabelSelStyleBefore=null;
    this.mapMeasureOverlayDivStyle=null; this.imgStyleBase=null; this.logoMaxWidthHeightStyle=null; this.imgLogoStyle=null;
    this.imgFullWidthHeightStyle=null; this.imgDefaultFrameStyle=null; this.divWithImgBkkSizeStyle=null;
    this.divWithImgBkStyle=null; this.imgForInfoWindowStyle=null; this.buttonStyleBase=null; this.svgGlyphStyleBase=null; this.svgGlyphLightNoHoverStyle=null; this.svgGlyphLightStyle=null; this.svgGlyphLightStyleHover=null;
    this.svgGlyphDarkNoHoverStyle=null; this.svgGlyphDarkStyle=null; this.svgGlyphDarkStyleHover=null; this.divSvgGlyphStyle=null;
    this.buttonDivMarginTopStyle=null; this.buttonDivMarginBotStyle=null; this.buttonDivTopBotMarginsStyle=null; this.buttonDivMarginLeftStyle=null; this.buttonDivMarginRightStyle=null; this.buttonDivLeftRightMarginsStyle=null;
    this.buttonDivAllMarginsStyle=null; this.divSvgGlyphBtnStyle=null; this.divSvgGlyphIconStyle=null;
    this.textButtonStyleBase=null; this.textDivBtnLightStyle=null; this.textDivBtnLightStyleHover=null; this.textDivBtnDarkStyle=null; this.textDivBtnDarkStyleHover=null;
    this.paddedBlockDivStyle=null; this.paddedInlineBlockDivStyle=null; this.paddedBlockDivWithBorderSeparatorStyle=null; this.paddedInlineBlockDivWithBorderSeparatorStyle=null;
    this.unPaddedBlockDivStyle=null; this.unPaddedInlineBlockDivStyle=null; this.leftSideContainerStyle=null; this.floatLeftSideContainerStyle=null; this.leftRightSideSeparatorStyle=null;
    this.rightSideContainerStyle=null; this.bottomContainerStyle=null; this.topBottomSeparatorStyle=null;
    this.listContentStyle=null; this.inputFormStyle=null; this.mapButtonLeftMarginStyle=null; this.mapButtonRightMarginStyle=null;
    this.mapAddressButtonStyle=null; this.mapZoomStyle=null; this.mapLayersButtonStyle=null; this.mapTypeButtonStyle=null; this.mapMeasureButtonStyle=null;
    this.mapDownloadButtonStyle=null; this.mapSourceButtonStyle=null; this.mapFullScreenButtonStyle=null;
    this.mapViewPortUnSelectableStyle=null; this.mapZoomInBorderRadiusStyle=null; this.mapZoomOutBorderRadiusStyle=null; this.mapZoomSliderStyle=null;
    this.transitionOpacityToVisibleStyle=null; this.transitionOpacityToInvisibleStyle=null;
    this.mapLocationButtonStyle=null; this.mapUserLocationButtonStyle=null; this.mapRotateStyle=null; this.mapRotateHiddenStyle=null;
    this.popupContentBkColorStyle=null; this.mapCompassStyle=null; this.mapButtonTextSpanStyle=null; this.mapScaleLineStyle=null; this.mapScaleLineInnerStyle=null;
    this.mapControlBkColorStyle=null; this.mapControlHoverBkColorStyle=null; this.mapControlButtonHoverBkColorStyle=null; this.mapControlButtonBkColorStyle=null;
    this.mapControlStyle=null; this.mapControlHoverStyle=null;
    this.mapControlButtonLineHeightStyle=null; this.mapControlButtonTextColorStyle=null; this.mapControlButtonWidthHeightStyle=null;
    this.mapControlButtonStyle=null; this.mapControlButtonFocusHoverStyle=null; this.mapControlButtonMozFocusInnerStyle=null;

    this.mapOverviewMapStyle=null; this.mapOverviewMapUnCollapsibleStyle=null; this.mapOverviewMapButtonStyle=null; this.mapOverviewMapMapStyle=null;
    this.mapOverviewMapButtonNotCollapsedStyle=null; this.mapOverviewMapButtonCollapsedStyle=null; this.mapOverviewMapNotCollapsedStyle=null;
    this.mapOverviewMapBoxStyle=null;

    this.mapTFLogoControlStyle=null; this.popupCaptionStyle=null; this.bodyStyle=null;*/

    /**
     * specifies 1px margin
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.margin1PXStyle = null;
    /**
     * specifies opacity 0 and visibility hidden, used in transitions
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.opacityVisibilityHideStyle = null;
    /**
     * specifies opacity 1 and visibility show, used in transitions
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.opacityVisibilityShowStyle = null;
    /**
     * specifies the default visibility transition
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.defaultOpacityVisibilityTransitionStyle = null;
    /**
     * specifies a visibility transition faster than the default
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.fasterOpacityVisibilityTransitionStyle = null;
    /**
     * specifies float left used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.floatLeftStyle = null;
    /**
     * specifies float right used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.floatRightStyle = null;
    /**
     * specifies float none used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.floatNoneStyle = null;
    /**
     * specifies the top container font size, inherited by sub containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.topFontSizeStyle = null;
    /**
     * specifies the default fount style, inherited by sub containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.defaultFontStyle = null;
    /**
     * specifies font size inheritance
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.fontSizeInheritStyle = null;
    /**
     * specifies radio button checked
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.defaultRadioCheckedStyle = null;
    /**
     * specifies radio button unchecked
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.defaultRadioUnCheckedStyle = null;
    /**
     * specifies check box checked
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.defaultCheckCheckedStyle = null;
    /**
     * specifies check box unchecked
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.defaultCheckUnCheckedStyle = null;
    /**
     * specifies default font size and style, inherited by sub containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.defaultFontAndTopSizeStyle = null;
    /**
     * specifies inheritance of font size
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.defaultFontSizeInheritStyle = null;
    /**
     * specifies visibility hidden, used in transitions
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.visibilityHiddenStyle = null;
    /**
     * specifies visibility visible, used in transitions
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.visibilityVisibleStyle = null;
    /**
     * specifies opacity 0 (fully transparent), used in transitions
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.opacityZeroStyle = null;
    /**
     * specifies opacity 1 (fully opaque), used in transitions
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.opacityOneStyle = null;
    /**
     * specifies no border, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.noBorderStyle = null;
    /**
     * specifies no border spacing, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.noBorderSpacingStyle = null;
    /**
     * specifies no margin, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.noMarginStyle = null;
    /**
     * specifies no padding, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.noPaddingStyle = null;
    /**
     * specifies position absolute, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.positionAbsoluteStyle = null;
    /**
     * specifies position relative, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.positionRelativeStyle = null;
    /**
     * specifies transparent background, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.transparentBackgroundStyle = null;
    /**
     * specifies the light background used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.whiteBackgroundStyle = null;
    /**
     * specifies the background used in text input boxes
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.textInputBackgroundStyle = null;
    /**
     * specifies no pointer events, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.noPointerEventsStyle = null;
    /**
     * specifies all pointer events, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.allPointerEventsStyle = null;
    /**
     * specifies a mouse pointer suitable for clickable interface items (usually a hand)
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.cursorPointerStyle = null;
    /**
     * specifies the default mouse pointer (usually the regular arrow pointer)
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.cursorDefaultStyle = null;
    /**
     * specifies that an element's transform will frequently be changed
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.willChangeTransformStyle = null;
    /**
     * specifies no outline, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.noOutlineStyle = null;
    /**
     * specifies 100% width
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.fullWidthStyle = null;
    /**
     * specifies 100% height
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.fullHeightStyle = null;
    /**
     * specifies inherited width
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.inheritWidthStyle = null;
    /**
     * specifies inherited height
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.inheritHeightStyle = null;
    /**
     * specifies auto width
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.autoWidthStyle = null;
    /**
     * specifies auto height
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.autoHeightStyle = null;
    /**
     * specifies auto width and height
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.autoWidthAutoHeightStyle = null;
    /**
     * specifies 100% width and height
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.fullWidthHeightStyle = null;
    /**
     * specifies 100% width and auto height
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.fullWidthAutoHeightStyle = null;
    /**
     * specifies auto width and 100% height
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.autoWidthFullHeightStyle = null;
    /**
     * specifies inherited width and height
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.inheritWidthHeightStyle = null;
    /**
     * specifies inline-block display, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.inlineBlockStyle = null;
    /**
     * specifies block display, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.blockStyle = null;
    /**
     * specifies none display (hides the element), used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.noneDisplayStyle = null;
    /**
     * specifies overflow hidden, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.overflowHiddenStyle = null;
    /**
     * specifies overflow auto, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.overflowAutoStyle = null;
    /**
     * specifies overflow scroll in the vertical direction, used on some containers like vertical lists and tables
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.overflowYScrollStyle = null;
    /**
     * specifies middle vertical align, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.middleVerticalAlignStyle = null;
    /**
     * specifies inherit vertical align, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.inheritVerticalAlignStyle = null;
    /**
     * specifies center text alignment, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.textAlignCenterStyle = null;
    /**
     * specifies left text alignment, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.textAlignLeftStyle = null;
    /**
     * specifies no border radius, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.noBorderRadiusStyle = null;
    /**
     * specifies no border, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.borderNoneStyle = null;
    /**
     * specifies no user selection allowed, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.noSelectStyle = null;
    /**
     * specifies an image is not draggable, used on some images
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.notDraggableStyle = null;
    /**
     * specifies no text decoration, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.noTextDecorationStyle = null;
    /**
     * specifies subcontainer positioning to the left edge of the parent container, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.snapLeftStyle = null;
    /**
     * specifies subcontainer positioning to the right edge of the parent container, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.snapRightStyle = null;
    /**
     * specifies subcontainer positioning to the top edge of the parent container, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.snapTopStyle = null;
    /**
     * specifies subcontainer positioning to the bottom edge of the parent container, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.snapBotStyle = null;
    /**
     * specifies subcontainer positioning to the horizontal center of the parent container, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.snapCenterHorStyle = null;
    /**
     * specifies subcontainer positioning to the vertical center of the parent container, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.snapCenterVerStyle = null;
    /**
     * specifies subcontainer positioning to both the horizontal and vertical center of the parent container, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.snapCenterStyle = null;
    /**
     * specifies subcontainer positioning to the left top corner of the parent container, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.snapLeftTopStyle = null;
    /**
     * specifies subcontainer positioning to the right top corner of the parent container, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.snapRightTopStyle = null;
    /**
     * specifies subcontainer positioning to the left bottom corner of the parent container, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.snapLeftBotStyle = null;
    /**
     * specifies subcontainer positioning to the right top corner of the parent container, used on some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.snapRightBotStyle = null;
    /**
     * specifies popup caption border radius, used with popups
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.popupCaptionBorderRadiusStyle = null;
    /**
     * specifies popup content padding border radius, used with popups
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.popupContentPaddingStyle = null;
    /**
     * specifies popup content border radius, used with popups
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.popupContentBorderRadiusStyle = null;
    /**
     * specifies the default text shadow
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.textShadowStyle = null;
    /**
     * specifies a text shadow darker than the default
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.darkTextShadowStyle = null;
    /**
     * specifies a South East shadow, used by some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.seShadowStyle = null;
    /**
     * specifies a horizontal (East) shadow, used by some containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.horShadowStyle = null;
    /**
     * specifies the text shadow used by selected radio buttons and check boxes
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.textShadowSelRadioCheckStyle = null;
    /**
     * specifies the dimensions used by radio button and check box images
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.defaultWidthHeightRadioCheckStyle = null;
    /**
     * specifies the right padding used by radio button and check box images to separate the label from the button/box
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.defaultRightPaddingRadioCheckStyle = null;
    /**
     * specifies padding used by padded containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.paddingStyle = null;
    /**
     * specifies padding used by padded containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.paddingLeftRightStyle = null;
    /**
     * specifies background color for containers used as layout separators
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.separatorBkColorStyle = null;
    /**
     * specifies background color for containers used on the right side of layouts
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.rightSideContainerBkColorStyle = null;
    /**
     * specifies background color for head content footer layout container
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.hcfLayoutContainerBkColorStyle = null;
    /**
     * specifies background color for popup captions
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.popupCaptionBackgroundColorStyle = null;
    /**
     * specifies cursor for non-clickable icons
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.divIconCursorStyle = null;
    /**
     * specifies no border, margin, padding, used on unpadded containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.noBorderMarginPaddingStyle = null;
    /**
     * specifies width for containers used as vertical layout separators
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.verticalSeparatorWidthStyle = null;
    /**
     * specifies height for containers used as horizontal layout separators
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.horizontalSeparatorHeightStyle = null;
    /**
     * specifies text color used in the API's dark style settings
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.darkTextColorStyle = null;
    /**
     * specifies text color used in the API's light style settings
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.lightTextColorStyle = null;
    /**
     * specifies disabled text color
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.disabledTextColorStyle = null;
    /**
     * specifies default button background color
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.defaultButtonBkStyle = null;
    /**
     * specifies default button background color
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.buttonBorderRadiusStyle = null;
    /**
     * specifies application containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.appContainerStyle = null;
    /**
     * specifies map containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.mapContainerStyle = null;
    /**
     * specifies map sub containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.mapSubContainerStyle = null;
    /**
     * specifies map popup and toolbar containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.popupMapToolBarBaseStyle = null;
    /**
     * specifies map toolbar containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.mapToolBarContainerStyle = null;
    /**
     * specifies top separators used in the API's light style settings
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.topSeparatorLightStyle = null;
    /**
     * specifies bottom separators used in the API's light style settings
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.bottomBorderSeparatorLightStyle = null;
    /**
     * specifies bottom separators used in the API's dark style settings
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.bottomBorderSeparatorDarkStyle = null;
    /**
     * specifies right separators used in the API's light style settings
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.rightBorderSeparatorLightStyle = null;
    /**
     * specifies right separators used in the API's dark style settings
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.rightBorderSeparatorDarkStyle = null;
    /**
     * specifies left separators used in the API's light style settings
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.leftBorderSeparatorLightStyle = null;
    /**
     * specifies left separators used in the API's dark style settings
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.leftBorderSeparatorDarkStyle = null;
    /**
     * specifies popup containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.popupContainerStyle = null;
    /**
     * specifies popup content
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.popupContentStyle = null;
    /**
     * specifies spans
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.spanStyle = null;
    /**
     * specifies clickable spans with a pointer cursor
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.spanCursorPointerStyle = null;
    /**
     * specifies application containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.appContainerBaseStyle = null;
    /**
     * specifies header content footer layout containers
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.hcfLayoutStyle = null;
    /**
     * specifies header containers in header content footer layouts
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.hcfLayoutHeaderStyle = null;
    /**
     * specifies footer containers in header content footer layouts
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.hcfLayoutFooterStyle = null;
    /**
     * specifies content containers in header content footer layouts
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.hcfLayoutContentStyle = null;
    /**
     * specifies button shaped links
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.buttonShapedLinkStyle = null;
    /**
     * specifies button shaped links in hover state
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.buttonShapedLinkHoverStyle = null;
    /**
     * specifies dlayer info popup content
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.dLayerInfoStyle = null;
    /**
     * specifies dlayer info popup image content
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.dLayerInfoImgStyle = null;
    /**
     * specifies dlayer info popup link content
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.dLayerInfoLinkStyle = null;
    /**
     * specifies dlayer info popup link content in hover state
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.dLayerInfoLinkHoverStyle = null;
    /**
     * specifies dlayer info popup span content
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.dLayerInfoSpanStyle = null;
    /**
     * specifies text input placeholders
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.inputTextPlaceholderStyle = null;
    /**
     * specifies the background color for input forms
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.inputFormBkStyle = null;
    /**
     * specifies text input text
     * @public
     * @type {tf.types.CSSStyleSpecs}
    */
    this.inputTextStyle = null;
    /**
     * specifies custom radio button part. Used internally by the API
     * @private
     * @type {tf.types.CSSStyleSpecs}
    */
    this.radioCheckStyle = null;
    /**
     * specifies custom radio button part. Used internally by the API
     * @private
     * @type {tf.types.CSSStyleSpecs}
    */
    this.radioCheckWithDimStyle = null;
    /**
     * specifies custom radio button part. Used internally by the API
     * @private
     * @type {tf.types.CSSStyleSpecs}
    */
    this.radioCheckLabelStyle = null;
    /**
     * specifies custom radio button part. Used internally by the API
     * @private
     * @type {tf.types.CSSStyleSpecs}
    */
    this.radioCheckRemoveDefaultStyle = null;
    /**
     * specifies custom radio button part. Used internally by the API
     * @private
     * @type {tf.types.CSSStyleSpecs}
    */
    this.radioCheckLabelCheckedStyle = null;
    /**
     * specifies custom radio button part. Used internally by the API
     * @private
     * @type {tf.types.CSSStyleSpecs}
    */
    this.radioLabelStyle = null;
    /**
     * specifies custom radio button part. Used internally by the API
     * @private
     * @type {tf.types.CSSStyleSpecs}
    */
    this.radioRadioStyle = null;
    /**
     * specifies custom radio button part. Used internally by the API
     * @private
     * @type {tf.types.CSSStyleSpecs}
    */
    this.radioRadioAndLabelCheckedStyle = null;
    /**
     * specifies custom radio button part. Used internally by the API
     * @private
     * @type {tf.types.CSSStyleSpecs}
    */
    this.radioRadioAndLabelStyleBefore = null;
    /**
     * specifies custom radio button part. Used internally by the API
     * @private
     * @type {tf.types.CSSStyleSpecs}
    */
    this.radioRadioAndLabelSelStyleBefore = null;
    /**
     * specifies custom check box part. Used internally by the API
     * @private
     * @type {tf.types.CSSStyleSpecs}
    */
    this.checkLabelStyle = null;
    /**
     * specifies custom check box part. Used internally by the API
     * @private
     * @type {tf.types.CSSStyleSpecs}
    */
    this.checkCheckStyle = null;
    /**
     * specifies custom check box part. Used internally by the API
     * @private
     * @type {tf.types.CSSStyleSpecs}
    */
    this.checkCheckAndLabelCheckedStyle = null;
    /**
     * specifies custom check box part. Used internally by the API
     * @private
     * @type {tf.types.CSSStyleSpecs}
    */
    this.checkCheckAndLabelStyleBefore = null;
    /**
     * specifies custom check box part. Used internally by the API
     * @private
     * @type {tf.types.CSSStyleSpecs}
    */
    this.checkCheckAndLabelSelStyleBefore = null;

    this.mapMeasureOverlayDivStyle = null;
    this.imgStyleBase = null;
    this.logoMaxWidthHeightStyle = null;
    this.imgLogoStyle = null;
    this.imgFullWidthHeightStyle = null;
    this.imgDefaultFrameStyle = null;
    this.divWithImgBkkSizeStyle = null;
    this.divWithImgBkStyle = null;
    this.imgForInfoWindowStyle = null;
    this.buttonStyleBase = null;
    this.svgGlyphStyleBase = null;
    this.svgGlyphLightNoHoverStyle = null;
    this.svgGlyphLightStyle = null;
    this.svgGlyphLightStyleHover = null;
    this.svgGlyphDarkNoHoverStyle = null;
    this.mapSvgGlyphInButtonStyle = null;
    this.mapSvgGlyphInPopupStyle = null;
    this.mapSvgGlyphInPopupHoverStyle = null;
    this.svgGlyphDarkStyle = null;
    this.svgGlyphDarkStyleHover = null;
    this.divSvgGlyphStyle = null;
    this.buttonDivMarginTopStyle = null;
    this.buttonDivMarginBotStyle = null;
    this.buttonDivTopBotMarginsStyle = null;
    this.buttonDivMarginLeftStyle = null;
    this.buttonDivMarginRightStyle = null;
    this.buttonDivLeftRightMarginsStyle = null;
    this.buttonDivAllMarginsStyle = null;
    this.divSvgGlyphBtnStyle = null;
    this.divSvgGlyphIconStyle = null;
    this.textButtonStyleBase = null;
    this.textDivBtnLightStyle = null;
    this.textDivBtnLightStyleHover = null;
    this.textDivBtnDarkStyle = null;
    this.textDivBtnDarkStyleHover = null;
    this.paddedBlockDivStyle = null;
    this.paddedInlineBlockDivStyle = null;
    this.paddedBlockDivWithBorderSeparatorStyle = null;
    this.paddedInlineBlockDivWithBorderSeparatorStyle = null;
    this.unPaddedBlockDivStyle = null;
    this.unPaddedInlineBlockDivStyle = null;
    this.leftSideContainerStyle = null;
    this.floatLeftSideContainerStyle = null;
    this.leftRightSideSeparatorStyle = null;
    this.rightSideContainerStyle = null;
    this.bottomContainerStyle = null;
    this.topBottomSeparatorStyle = null;
    this.listContentStyle = null;
    this.inputFormStyle = null;
    this.mapButtonLeftMarginStyle = null;
    this.mapButtonRightMarginStyle = null;
    this.mapAddressButtonStyle = null;
    this.mapZoomStyle = null;
    this.mapLayersButtonStyle = null;
    this.mapTypeButtonStyle = null;
    this.mapMeasureButtonStyle = null;
    this.mapDownloadButtonStyle = null;
    this.mapSourceButtonStyle = null;
    this.mapFullScreenButtonStyle = null;
    this.mapViewPortUnSelectableStyle = null;
    this.mapZoomInBorderRadiusStyle = null;
    this.mapZoomOutBorderRadiusStyle = null;
    this.mapZoomSliderStyle = null;
    this.transitionOpacityToVisibleStyle = null;
    this.transitionOpacityToInvisibleStyle = null;
    this.mapLocationButtonStyle = null;
    this.mapUserLocationButtonStyle = null;
    this.mapRotateStyle = null;
    this.mapRotateHiddenStyle = null;
    this.popupContentBkColorStyle = null;
    this.mapCompassStyle = null;
    this.mapButtonTextSpanStyle = null;
    this.mapScaleLineStyle = null;
    this.mapScaleLineInnerStyle = null;
    this.mapControlBkColorStyle = null;
    this.mapControlHoverBkColorStyle = null;
    this.mapControlButtonHoverBkColorStyle = null;
    this.mapControlButtonBkColorStyle = null;
    this.mapControlStyle = null;
    this.mapControlHoverStyle = null;
    this.mapControlButtonLineHeightStyle = null;
    this.mapControlButtonTextColorStyle = null;
    this.mapControlButtonWidthHeightStyle = null;
    this.mapControlButtonStyle = null;
    this.mapControlButtonFocusHoverStyle = null;
    this.mapControlButtonMozFocusInnerStyle = null;

    this.mapOverviewMapStyle = null;
    //this.mapOverviewMapUnCollapsibleStyle = null;
    this.mapOverviewMapButtonStyle = null;
    this.mapOverviewMapMapStyle = null;
    this.mapOverviewMapButtonNotCollapsedStyle = null;
    this.mapOverviewMapButtonCollapsedStyle = null;
    this.mapOverviewMapNotCollapsedStyle = null;
    this.mapOverviewMapBoxStyle = null;

    this.mapTFLogoControlStyle = null;
    this.popupCaptionStyle = null;
    this.bodyStyle = null;

    function createConstantStyles() {
        var zeroDim = "0px";

        borderSeparatorLightSpecs = borderSeparatorLineSpecs + " " + theThis.borderLightColor;
        borderSeparatorDarkSpecs = borderSeparatorLineSpecs + " " + theThis.borderDarkColor;
        borderSeparatorButtonBkSpecs = borderSeparatorLineSpecs + " " + theThis.defaultButtonBk;

        theThis.margin1PXStyle = { margin: "1px" };

        theThis.defaultOpacityVisibilityTransitionStyle = { transition: "opacity .15s ease-in-out, visibility 0.15s ease-in-out, margin-top 0s 1s" };
        theThis.fasterOpacityVisibilityTransitionStyle = { transition: "opacity .10s ease-in-out, visibility .10s ease-in-out, margin-top 0s 1s" };

        theThis.floatLeftStyle = { "float": "left" };
        theThis.floatRightStyle = { "float": "right" };
        theThis.floatNoneStyle = { "float": "none" };

        theThis.defaultRadioCheckedStyle = { content: "'\\25cf'" };
        theThis.defaultRadioUnCheckedStyle = { content: "'\\25cb'" };

        theThis.defaultCheckCheckedStyle = { content: "'\\2611'" };
        theThis.defaultCheckUnCheckedStyle = { content: "'\\2610'" };

        theThis.topFontSizeStyle = { fontSize: theThis.topFontSizePXNumber + "px" };
        theThis.defaultFontStyle = { fontFamily: theThis.fontFamily };
        theThis.fontSizeInheritStyle = { fontSize: 'inherit' };

        theThis.defaultFontAndTopSizeStyle = { inherits: [theThis.defaultFontStyle, theThis.topFontSizeStyle] };
        theThis.defaultFontSizeInheritStyle = { inherits: [theThis.defaultFontStyle, theThis.fontSizeInheritStyle] };

        theThis.visibilityHiddenStyle = { visibility: 'hidden' };
        theThis.visibilityVisibleStyle = { visibility: 'visible' };

        theThis.opacityZeroStyle = { opacity: '0' };
        theThis.opacityOneStyle = { opacity: '1' };

        theThis.opacityVisibilityHideStyle = { inherits: [theThis.opacityZeroStyle, theThis.visibilityHiddenStyle], marginTop: "-10000px" };
        theThis.opacityVisibilityShowStyle = { inherits: [theThis.opacityOneStyle, theThis.visibilityVisibleStyle], marginTop: "auto" };

        theThis.noBorderStyle = { border: zeroDim };
        theThis.noBorderSpacingStyle = { borderSpacing: zeroDim };
        theThis.noMarginStyle = { margin: zeroDim };
        theThis.noPaddingStyle = { padding: zeroDim };

        theThis.positionAbsoluteStyle = { position: 'absolute' };
        theThis.positionRelativeStyle = { position: 'relative' };
        theThis.transparentBackgroundStyle = { backgroundColor: 'rgba(0,0,0,0.0)' };
        theThis.whiteBackgroundStyle = { backgroundColor: '#fff' };
        theThis.textInputBackgroundStyle = { background: textInputBackgroundColor };
        theThis.noPointerEventsStyle = { pointerEvents: 'none' };
        theThis.allPointerEventsStyle = { pointerEvents: 'all' };

        theThis.cursorPointerStyle = { cursor: 'pointer' };
        theThis.cursorDefaultStyle = { cursor: 'default' };

        theThis.willChangeTransformStyle = { willChange: "transform" };

        theThis.noOutlineStyle = { outline: 0 };

        theThis.fullWidthStyle = { width: "100%" };
        theThis.fullHeightStyle = { height: "100%" }

        theThis.inheritWidthStyle = { width: "inherit" };
        theThis.inheritHeightStyle = { height: "inherit" };

        theThis.autoWidthStyle = { width: 'auto' };
        theThis.autoHeightStyle = { height: 'auto' };
        theThis.autoWidthAutoHeightStyle = { inherits: [theThis.autoWidthStyle, theThis.autoHeightStyle] }
        theThis.fullWidthHeightStyle = { inherits: [theThis.fullWidthStyle, theThis.fullHeightStyle] }
        theThis.fullWidthAutoHeightStyle = { inherits: [theThis.fullWidthStyle, theThis.autoHeightStyle] };
        theThis.autoWidthFullHeightStyle = { inherits: [theThis.autoWidthStyle, theThis.fullHeightStyle] };
        theThis.inheritWidthHeightStyle = { inherits: [theThis.inheritWidthStyle, theThis.inheritHeightStyle] }

        theThis.inlineBlockStyle = { display: 'inline-block' };
        theThis.blockStyle = { display: 'block' };
        theThis.noneDisplayStyle = { display: 'none' };

        theThis.overflowHiddenStyle = { overflow: 'hidden' };
        theThis.overflowAutoStyle = { overflow: 'auto' };
        theThis.overflowYScrollStyle = { overflowY: 'scroll' };

        theThis.middleVerticalAlignStyle = { verticalAlign: 'middle' };
        theThis.inheritVerticalAlignStyle = { verticalAlign: 'inherit' };

        theThis.textAlignCenterStyle = { textAlign: 'center' };
        theThis.textAlignLeftStyle = { textAlign: 'left' };

        theThis.noBorderRadiusStyle = { borderRadius: "0px" };
        theThis.borderNoneStyle = { border: 'none' };

        theThis.noSelectStyle = {
            "-webkit-touch-callout": "none",
            "-webkit-user-select": "none",
            "-khtml-user-select": "none",
            "-moz-user-select": "none",
            "-ms-user-select": "none",
            "user-select": "none",
            "-webkit-tap-highlight-color": "transparent"
        };

        theThis.notDraggableStyle = { draggable: "false" };

        theThis.noTextDecorationStyle = { textDecoration: 'none' };

        theThis.snapLeftStyle = { left: zeroDim };
        theThis.snapRightStyle = { right: zeroDim };
        theThis.snapTopStyle = { top: zeroDim };
        theThis.snapBotStyle = { bottom: zeroDim };

        theThis.snapCenterHorStyle = { left: "50%", transform: "translate(-50%, 0)" };
        theThis.snapCenterVerStyle = { top: "50%", transform: "translate(0, -50%)" };
        theThis.snapCenterStyle = { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };

        theThis.snapLeftTopStyle = { inherits: [theThis.snapLeftStyle, theThis.snapTopStyle] };
        theThis.snapRightTopStyle = { inherits: [theThis.snapRightStyle, theThis.snapTopStyle] };

        theThis.snapLeftBotStyle = { inherits: [theThis.snapLeftStyle, theThis.snapBotStyle] };
        theThis.snapRightBotStyle = { inherits: [theThis.snapRightStyle, theThis.snapBotStyle] };

        theThis.mapViewPortUnSelectableStyle = { inherits: [theThis.noSelectStyle] };

        theThis.mapZoomSliderStyle = { inherits: [theThis.transparentBackgroundStyle, theThis.opacityZeroStyle, theThis.visibilityHiddenStyle], top: "-100em" };

        theThis.divWithImgBkkSizeStyle = { backgroundSize: "100% 100%" };
    }

    function getMapButtonTopEmNumber(isLeft, indexTopToBottom) {
        var top = !!isLeft ? topLeftButtonEmNumber : topRightButtonEmNumber;
        return top + indexTopToBottom * (mapButtonDimEmNumber + 2 * mapButtonSpacingEmNumber);
    }

    function createMapButtonStyle(isLeft, indexTopToBottom) {
        var inheritStyle = !!isLeft ? theThis.mapButtonLeftMarginStyle : theThis.mapButtonRightMarginStyle;
        var top = getMapButtonTopEmNumber(isLeft, indexTopToBottom);
        return { inherits: [inheritStyle], top: top + "em" };
    }

    function createMapComponentsStyles() {

        theThis.mapZoomInBorderRadiusStyle = { borderRadius: mapZoomInBorderRadius };
        theThis.mapZoomOutBorderRadiusStyle = { borderRadius: mapZoomOutBorderRadius };

        var addressBarTopEmNumber = mapButtonMarginEmNumber;
        var zoomTopEmNumber = addressBarTopEmNumber + mapButtonDimEmNumber + 2 * mapButtonSpacingEmNumber;

        topRightButtonEmNumber = mapButtonMarginEmNumber;
        topLeftButtonEmNumber = zoomTopEmNumber + 2 * mapButtonDimEmNumber + 3 * mapButtonSpacingEmNumber;

        theThis.addressBarFontSize = (mapButtonDimEmNumber / 2 + 0.2) + "em";

        var mapButtonDimEmStr = mapButtonDimEmNumber + "em";
        var mapButtonMarginEmStr = mapButtonMarginEmNumber + "em";

        theThis.mapButtonLeftMarginStyle = { left: mapButtonMarginEmStr };
        theThis.mapButtonRightMarginStyle = { right: mapButtonMarginEmStr };

        theThis.mapAddressButtonStyle = { inherits: [theThis.mapButtonLeftMarginStyle], top: addressBarTopEmNumber + "em" };
        theThis.mapZoomStyle = { inherits: [theThis.mapButtonLeftMarginStyle], top: zoomTopEmNumber + "em", zIndex: 1 };
        theThis.mapLayersButtonStyle = createMapButtonStyle(true, 0);
        theThis.mapTypeButtonStyle = createMapButtonStyle(true, 1);
        theThis.mapMeasureButtonStyle = createMapButtonStyle(true, 2);
        theThis.mapDownloadButtonStyle = createMapButtonStyle(true, 3);
        theThis.mapSourceButtonStyle = createMapButtonStyle(true, 4);

        theThis.mapFullScreenButtonStyle = createMapButtonStyle(false, 0);
        theThis.mapLocationButtonStyle = createMapButtonStyle(false, 1);
        theThis.mapUserLocationButtonStyle = createMapButtonStyle(false, 2);
        theThis.mapRotateStyle = { inherits: [theThis.transitionOpacityToVisibleStyle, theThis.mapButtonRightMarginStyle], top: getMapButtonTopEmNumber(false, 3) + "em" };
        theThis.mapRotateHiddenStyle = { inherits: [theThis.opacityZeroStyle, theThis.visibilityHiddenStyle, theThis.transitionOpacityToInvisibleStyle] };

        theThis.mapLocationButtonTopEmNumber = getMapButtonTopEmNumber(false, 1);

        var mapControlFontSizeStyle = { fontSize: theThis.mapControlFontSizeEmNumber + "em" };
        var mapControlButtonFontWeightStyle = { fontWeight: mapControlFontWeight };

        theThis.mapScaleLineStyle = {
            inherits: [theThis.mapButtonLeftMarginStyle], background: mapScaleLineBkColor, borderRadius: mapScaleLineBorderRadiusPxNumber + "px", bottom: mapButtonMarginEmStr,
            padding: mapScaleLinePaddingPxNumber + "px", position: "absolute", zIndex: 1, cursor: "pointer"
        };
        theThis.mapScaleLineInnerStyle = {
            inherits: [mapControlButtonFontWeightStyle],
            border: mapScaleLineBorder, borderTop: "none", color: mapScaleLineFontColor,
            fontSize: mapScaleLineFontSizeEmNumber + "em", textAlign: "center", margin: mapScaleLineMarginPxNumber + "px", willChange: "contents,width"
        };

        theThis.mapControlButtonWidthHeightStyle = { width: mapButtonDimEmStr, height: mapButtonDimEmStr };

        theThis.mapOverviewMapStyle = { inherits: [theThis.mapButtonRightMarginStyle], bottom: mapButtonMarginEmStr, zIndex: 1 };

        var tfLogoTop = (2 * mapButtonMarginEmNumber + zoomTopEmNumber) + "em";
        var tfLogoLeft = (3 * mapButtonMarginEmNumber + 2 * mapButtonDimEmNumber) + "em";

        theThis.mapTFLogoControlStyle = {
            inherits: [theThis.positionAbsoluteStyle, theThis.noPointerEventsStyle],
            borderRadius: tfLogoBorderRadius, top: tfLogoTop, left: tfLogoLeft, width: tfLogoHeight, height: tfLogoWidth, opacity: tfLogoOpacity,
            backgroundColor: tfLogoBkColor,
            border: tfLogoBorder
        };

        theThis.mapCompassStyle = { inherits: [theThis.blockStyle, theThis.willChangeTransformStyle, mapControlFontSizeStyle, mapControlButtonFontWeightStyle] };

        theThis.mapButtonTextSpanStyle = { inherits: [theThis.blockStyle, mapControlFontSizeStyle, mapControlButtonFontWeightStyle, theThis.cursorPointerStyle] };

        theThis.mapControlBkColorStyle = { backgroundColor: theThis.mapControlBkColor };
        theThis.mapControlHoverBkColorStyle = { backgroundColor: theThis.mapControlBkColor };
        theThis.mapControlButtonHoverBkColorStyle = { backgroundColor: theThis.mapControlButtonHoverBkColor };
        theThis.mapControlButtonBkColorStyle = { backgroundColor: theThis.mapControlButtonBkColor };
        theThis.mapControlButtonLineHeightStyle = { lineHeight: mapControlLineHeightEmNumber + "em" };
        theThis.mapControlButtonTextColorStyle = { color: mapControlTextColor };

        theThis.mapControlStyle = { inherits: [theThis.horShadowStyle, theThis.positionAbsoluteStyle, theThis.mapControlBkColorStyle, theThis.cursorPointerStyle], borderRadius: "3px", padding: "1px" };
        theThis.mapControlHoverStyle = { inherits: [theThis.mapControlHoverBkColorStyle] };
        theThis.mapControlButtonFocusHoverStyle = { inherits: [theThis.noTextDecorationStyle, theThis.mapControlButtonHoverBkColorStyle] };
        theThis.mapControlButtonStyle = {
            inherits: [theThis.noPaddingStyle, theThis.blockStyle, theThis.noTextDecorationStyle, theThis.borderNoneStyle, theThis.textAlignCenterStyle, theThis.mapControlButtonBkColorStyle,
            theThis.mapControlButtonWidthHeightStyle, mapControlButtonFontWeightStyle, theThis.margin1PXStyle, theThis.noBorderRadiusStyle, theThis.mapControlButtonLineHeightStyle,
            theThis.mapControlButtonTextColorStyle]
        };

        theThis.mapControlButtonMozFocusInnerStyle = { inherits: [theThis.borderNoneStyle, theThis.noPaddingStyle] };

        var ovewviewMapBorderWidthPxNumber = overviewMapBorderWidthPxNumberNumber + "px";

        //theThis.mapOverviewMapUnCollapsibleStyle = { bottom: "0", left: "0", borderRadius: "0 4px 0 0" };
        //theThis.mapOverviewMapButtonStyle = { inherits: [theThis.inlineBlockStyle] };
        theThis.mapOverviewMapButtonStyle = { inherits: [theThis.mapControlButtonStyle] };
        //theThis.mapOverviewMapMapStyle = { border: "1px solid #000", height: "200px", margin: "2px", width: "200px" };
        theThis.mapOverviewMapMapStyle = { margin: ovewviewMapBorderWidthPxNumber, width: overviewMapWidthPxNumber + "px", height: overviewMapHeightPxNumber + "px" };
        theThis.mapOverviewMapButtonNotCollapsedStyle = { inherits: [theThis.positionAbsoluteStyle], bottom: ovewviewMapBorderWidthPxNumber, left: ovewviewMapBorderWidthPxNumber };
        theThis.mapOverviewMapButtonCollapsedStyle = { inherits: [theThis.noneDisplayStyle] };
        theThis.mapOverviewMapNotCollapsedStyle = { inherits: [theThis.seShadowStyle], backgroundColor: theThis.mapControlBkColor };
        theThis.mapOverviewMapBoxStyle = { border: overviewMapBoxBorder };
    }

    function createDLayerStyles() {
        theThis.dLayerInfoStyle = { inherits: [theThis.noBorderMarginPaddingStyle, theThis.inlineBlockStyle, theThis.textShadowStyle], maxWidth: "17em" };
        theThis.dLayerInfoImgStyle = { inherits: [theThis.fullWidthAutoHeightStyle, theThis.middleVerticalAlignStyle] };

        theThis.dLayerInfoLinkStyle = { inherits: [theThis.buttonShapedLinkStyle] };
        theThis.dLayerInfoLinkHoverStyle = { inherits: [theThis.buttonShapedLinkHoverStyle] };

        theThis.dLayerInfoSpanStyle = { inherits: [theThis.blockStyle, theThis.textShadowStyle], backgroundColor: dLayerSpanBackgroundColor, margin: "0.15em" };
    }

    function createShadowStyle(offXPxNumber, offYPxNumber, blurPxNumber, shadowColorStr) {
        var paramStr = offXPxNumber + "px " + offYPxNumber + "px " + blurPxNumber + "px " + shadowColorStr;
        var dropShadowParamStr = "drop-shadow(" + paramStr + ")";
        return { "-moz-box-shadow": paramStr, "-webkit-filter": dropShadowParamStr, filter: dropShadowParamStr };
    }

    function createRadioCheckStyles() {
        theThis.radioCheckStyle = { inherits: [theThis.noBorderMarginPaddingStyle, theThis.middleVerticalAlignStyle] };
        theThis.radioCheckWithDimStyle = { inherits: [theThis.radioCheckStyle, theThis.defaultRightPaddingRadioCheckStyle] };
        //theThis.radioCheckWithDimStyle = { inherits: [theThis.radioCheckStyle, theThis.defaultWidthHeightRadioCheckStyle, theThis.defaultRightPaddingRadioCheckStyle] };
        theThis.radioCheckLabelStyle = { inherits: [theThis.radioCheckStyle, theThis.blockStyle, theThis.cursorPointerStyle, theThis.textAlignLeftStyle/*, theThis.autoWidthAutoHeightStyle*/, theThis.floatNoneStyle] };
        theThis.radioCheckRemoveDefaultStyle = { inherits: [theThis.radioCheckStyle, theThis.positionAbsoluteStyle, theThis.opacityZeroStyle, theThis.visibilityHiddenStyle] };
        theThis.radioCheckLabelCheckedStyle = { inherits: [theThis.radioCheckStyle, theThis.textShadowSelRadioCheckStyle] };

        theThis.radioLabelStyle = { inherits: [theThis.radioCheckLabelStyle] };
        theThis.radioRadioStyle = { inherits: [theThis.radioCheckRemoveDefaultStyle] };
        theThis.radioRadioAndLabelCheckedStyle = { inherits: [theThis.radioCheckLabelCheckedStyle] };
        theThis.radioRadioAndLabelStyleBefore = { inherits: [theThis.radioCheckWithDimStyle, theThis.defaultRadioUnCheckedStyle] };
        theThis.radioRadioAndLabelSelStyleBefore = { inherits: [theThis.radioCheckWithDimStyle, theThis.defaultRadioCheckedStyle] };

        theThis.checkLabelStyle = { inherits: [theThis.radioCheckLabelStyle] };
        theThis.checkCheckStyle = { inherits: [theThis.radioCheckRemoveDefaultStyle] };
        theThis.checkCheckAndLabelCheckedStyle = { inherits: [theThis.radioCheckLabelCheckedStyle] };
        theThis.checkCheckAndLabelStyleBefore = { inherits: [theThis.radioCheckWithDimStyle, theThis.defaultCheckUnCheckedStyle] };
        theThis.checkCheckAndLabelSelStyleBefore = { inherits: [theThis.radioCheckWithDimStyle, theThis.defaultCheckCheckedStyle] };
    }

    function createSvgGlyphStyles(glyphColor, backgroundColor, glyphColorHover, backgroundColorHover) {
        var style = { inherits: [theThis.svgGlyphStyleBase, theThis.cursorPointerStyle], backgroundColor: backgroundColor, fill: glyphColor };
        var hoverStyle = { backgroundColor: backgroundColorHover, fill: glyphColorHover };
        return { style: style, hoverStyle: hoverStyle };
    }

    function createTextDivBtnStyles(textColor, backgroundColor, textColorHover, backgroundColorHover) {
        var style = { inherits: [theThis.textButtonStyleBase], backgroundColor: backgroundColor, color: textColor };
        var hoverStyle = { backgroundColor: backgroundColorHover, color: textColorHover };
        return { style: style, hoverStyle: hoverStyle };
    }

    function createAppStyles() {

        theThis.popupCaptionBorderRadiusStyle = { borderRadius: popupCaptionBorderRadiusPXNumber + 'px' };

        theThis.popupContentPaddingStyle = { padding: popupContentPaddingPXNumber + "px" }

        theThis.popupContentBorderRadiusStyle = { borderRadius: popupContentBorderRadiusPXNumber + "px" }

        theThis.textShadowStyle = { textShadow: textShadow };
        theThis.darkTextShadowStyle = { textShadow: darkTextShadow };

        theThis.seShadowStyle = createShadowStyle(3, 3, 3, "rgba(0,0,0,0.6)");
        theThis.horShadowStyle = createShadowStyle(0, 1, 4, "rgba(0,0,0,0.6)");
        //theThis.seShadowStyle = { "tf-shadow": [3, 3, 3, "rgba(0,0,0,0.6)"] };
        //theThis.horShadowStyle = { "tf-shadow": [0, 1, 4, "rgba(0,0,0,0.6)"] };

        theThis.textShadowSelRadioCheckStyle = { textShadow: textShadowSelRadioCheck };
        theThis.defaultWidthHeightRadioCheckStyle = { width: "1em", height: "1em" };    // not actually shown, because check or radio image component is hidden and replaced by content before
        theThis.defaultRightPaddingRadioCheckStyle = { paddingRight: "0.2em" };

        theThis.paddingStyle = { padding: paddingPxNumber + "px" };
        theThis.paddingLeftRightStyle = { paddingLeft: paddingPxNumber + "px", paddingRight: paddingPxNumber + "px" };

        theThis.separatorBkColorStyle = { backgroundColor: theThis.separatorBackgroundColor };

        theThis.rightSideContainerBkColorStyle = { backgroundColor: theThis.containerDarkBackgroundColor };

        theThis.hcfLayoutContainerBkColorStyle = { backgroundColor: theThis.hcfLayoutContainerBkColor };

        theThis.popupCaptionBackgroundColorStyle = { backgroundColor: theThis.popupCaptionBackgroundColor };

        theThis.divIconCursorStyle = { inherits: theThis.cursorDefaultStyle };

        theThis.noBorderMarginPaddingStyle = { inherits: [theThis.noBorderStyle, theThis.noBorderSpacingStyle, theThis.noMarginStyle, theThis.noPaddingStyle] };

        theThis.verticalSeparatorWidthStyle = { width: verticalSeparatorWidthEMNumber + "em"};
        theThis.horizontalSeparatorHeightStyle = { height: horizontalSeparatorHeightEMNumber + "em" };

        theThis.darkTextColorStyle = { color: theThis.darkTextColor };
        theThis.lightTextColorStyle = { color: theThis.lightTextColor };
        theThis.disabledTextColorStyle = { color: theThis.disabledTextColor };

        theThis.defaultButtonBkStyle = { backgroundColor: theThis.defaultButtonBk };

        theThis.buttonBorderRadiusStyle = { borderRadius: buttonBorderRadiusPxNumber + "px" };

        theThis.appContainerStyle = {
            inherits: [theThis.fullWidthHeightStyle, theThis.blockStyle, theThis.overflowHiddenStyle, theThis.defaultFontAndTopSizeStyle, theThis.noSelectStyle, theThis.positionRelativeStyle],
            lineHeight: "initial"
        };

        theThis.mapContainerStyle = {
            inherits: [theThis.fullWidthHeightStyle, theThis.blockStyle, theThis.overflowHiddenStyle, theThis.noSelectStyle, theThis.middleVerticalAlignStyle,
                theThis.defaultFontAndTopSizeStyle, theThis.positionRelativeStyle], borderRadius: "inherit",
            lineHeight: "initial"
        };

        theThis.mapSubContainerStyle = {
            inherits: [theThis.fullWidthHeightStyle, theThis.blockStyle, theThis.overflowHiddenStyle, theThis.noSelectStyle, theThis.middleVerticalAlignStyle,
                theThis.fontSizeInheritStyle, theThis.positionRelativeStyle], borderRadius: "inherit",
            lineHeight: "initial"
        };

        theThis.popupMapToolBarBaseStyle = {
            inherits: [theThis.noBorderMarginPaddingStyle, theThis.blockStyle, theThis.positionAbsoluteStyle, theThis.noSelectStyle,
                theThis.darkTextColorStyle, theThis.defaultFontStyle]
        };

        theThis.mapToolBarContainerStyle = {
            inherits: [theThis.popupMapToolBarBaseStyle, theThis.fasterOpacityVisibilityTransitionStyle, theThis.middleVerticalAlignStyle, theThis.popupCaptionBackgroundColorStyle,
                theThis.seShadowStyle, theThis.popupCaptionBorderRadiusStyle]
        };

        theThis.topSeparatorLightStyle = { borderTop: borderSeparatorLightSpecs };
        theThis.bottomBorderSeparatorLightStyle = { borderBottom: borderSeparatorLightSpecs };
        theThis.rightBorderSeparatorLightStyle = { borderRight: borderSeparatorLightSpecs };
        theThis.leftBorderSeparatorLightStyle = { borderLeft: borderSeparatorLightSpecs };

        theThis.topBorderSeparatorDarkStyle = { borderTop: borderSeparatorDarkSpecs };
        theThis.bottomBorderSeparatorDarkStyle = { borderBottom: borderSeparatorDarkSpecs };
        theThis.rightBorderSeparatorDarkStyle = { borderRight: borderSeparatorDarkSpecs };
        theThis.leftBorderSeparatorDarkStyle = { borderLeft: borderSeparatorDarkSpecs };

        theThis.popupContainerStyle = {
            inherits: [theThis.popupMapToolBarBaseStyle, theThis.defaultOpacityVisibilityTransitionStyle, theThis.overflowHiddenStyle,
                theThis.textAlignLeftStyle, theThis.transparentBackgroundStyle, theThis.seShadowStyle, theThis.noPointerEventsStyle],
            padding: theThis.popupContainerPaddingPxNumber + "px"
        };

        theThis.popupContentStyle = {
            inherits: [theThis.noBorderMarginPaddingStyle, theThis.blockStyle, theThis.popupContentBkColorStyle, theThis.borderLightStyle,
                theThis.popupContentBorderRadiusStyle, theThis.popupContentPaddingStyle, theThis.textAlignLeftStyle, theThis.allPointerEventsStyle]
        };

        theThis.spanStyle = { inherits: [theThis.noBorderMarginPaddingStyle, theThis.middleVerticalAlignStyle, theThis.transparentBackgroundStyle, theThis.cursorDefaultStyle] };
        theThis.spanCursorPointerStyle = { inherits: [theThis.spanStyle, theThis.cursorPointerStyle] };

        theThis.appContainerBaseStyle = { inherits: [theThis.unPaddedBlockDivStyle, theThis.lightTextColor, theThis.hcfLayoutContainerBkColorStyle, theThis.overflowHiddenStyle] };

        theThis.hcfLayoutStyle = { inherits: [theThis.appContainerBaseStyle, theThis.fullHeightStyle] };
        theThis.hcfLayoutHeaderStyle = { inherits: [theThis.appContainerBaseStyle, theThis.textAlignCenterStyle, theThis.bottomBorderSeparatorLightStyle], top: "0em" };
        theThis.hcfLayoutFooterStyle = { inherits: [theThis.appContainerBaseStyle, theThis.textAlignCenterStyle, theThis.topSeparatorLightStyle], bottom: "0em" };
        theThis.hcfLayoutContentStyle = { inherits: [theThis.appContainerBaseStyle, theThis.overflowYScrollStyle] };

        theThis.inputTextPlaceholderStyle = { inherits: [theThis.defaultFontSizeInheritStyle, theThis.disabledTextColorStyle] };
        theThis.inputTextStyle = {
            inherits: [theThis.noBorderMarginPaddingStyle, theThis.noOutlineStyle, theThis.defaultFontSizeInheritStyle, theThis.darkTextColorStyle, theThis.seShadowStyle,
            theThis.textShadowStyle, theThis.textInputBackgroundStyle, theThis.paddingLeftRightStyle]
        };

        createRadioCheckStyles();

        theThis.mapMeasureOverlayDivStyle = {
            inherits: [theThis.blockStyle, theThis.cursorDefaultStyle, theThis.noBorderMarginPaddingStyle, theThis.paddingStyle, theThis.textAlignCenterStyle,
            theThis.middleVerticalAlignStyle, theThis.noPointerEventsStyle, theThis.noSelectStyle], fontSize: "1.2em", color: "#128", borderRadius: "0.5em",
            border: "1px solid #3e3e3e", backgroundColor: "rgba(255, 255, 255, 0.6)", textShadow: "2px 3px 3px #ddd"
        };

        theThis.imgStyleBase = { inherits: [theThis.noBorderMarginPaddingStyle, theThis.notDraggableStyle, theThis.noSelectStyle] };

        theThis.logoMaxWidthHeightStyle = { minWidth: (maxWidthLogoImageEmNumber / 2) + "em", maxWidth: maxWidthLogoImageEmNumber + "em", maxHeight: maxHeightLogoImageEmNumber + "em" };

        theThis.imgLogoStyle = { inherits: [theThis.imgStyleBase, theThis.inheritHeightStyle, theThis.autoWidthStyle, theThis.noPointerEventsStyle, theThis.logoMaxWidthHeightStyle, theThis.middleVerticalAlignStyle] };

        theThis.imgFullWidthHeightStyle = { inherits: [theThis.imgStyleBase, theThis.fullWidthHeightStyle] };

        theThis.imgDefaultFrameStyle = {
            inherits: [theThis.whiteBackgroundStyle],
            border: theThis.imgFrameBorder,
            margin: theThis.imgFramePaddingBorderWidthEmNumber + "em",
            color: "#FFFFFF"
        };

        theThis.divWithImgBkStyle = {
            inherits: [theThis.noBorderMarginPaddingStyle, theThis.imgDefaultFrameStyle, theThis.inheritVerticalAlignStyle,
                theThis.divWithImgBkkSizeStyle, theThis.inlineBlockStyle, theThis.middleVerticalAlignStyle],
            width: theThis.imageThumbWidthEmNumber + "em"
        };

        theThis.imgForInfoWindowStyle = { inherits: [theThis.imgDefaultFrameStyle], align: "center", padding: "0px", height: "12em", width: "auto" };

        theThis.buttonStyleBase = {
            inherits: [theThis.noBorderMarginPaddingStyle, theThis.middleVerticalAlignStyle, theThis.textAlignCenterStyle, theThis.buttonBorderRadiusStyle, theThis.cursorPointerStyle]
        };

        theThis.svgGlyphStyleBase = {
            inherits: [theThis.buttonStyleBase, theThis.blockStyle, theThis.transparentBackgroundStyle],
            stroke: "#000", strokeWidth: "0%", strokeLinejoin: "round",
            borderRadius: svgButtonBorderRadiusPercentNumber + "%"
        };

        theThis.svgGlyphLightNoHoverStyle = { inherits: [theThis.svgGlyphStyleBase, theThis.divIconCursorStyle], fill: theThis.buttonLightFill };

        theThis.svgGlyphLightStyle = { inherits: [theThis.svgGlyphLightNoHoverStyle, theThis.cursorPointerStyle], backgroundColor: theThis.buttonLightBkg };

        theThis.svgGlyphLightStyleHover = { backgroundColor: theThis.buttonLightFill, fill: theThis.buttonLightBkg };

        theThis.svgGlyphDarkNoHoverStyle = { inherits: [theThis.svgGlyphStyleBase, theThis.divIconCursorStyle], fill: theThis.buttonDarkFill };

        theThis.mapSvgGlyphInButtonStyle = { inherits: [theThis.svgGlyphStyleBase, theThis.divIconCursorStyle], fill: mapControlTextColor };

        theThis.mapSvgGlyphInPopupStyle = { inherits: [theThis.svgGlyphStyleBase, theThis.divIconCursorStyle], fill: mapControlTextColor };
        theThis.mapSvgGlyphInPopupHoverStyle = { inherits: [theThis.svgGlyphStyleBase, theThis.divIconCursorStyle], backgroundColor: mapControlTextColor, fill: theThis.mapControlButtonHoverBkColor };

        theThis.svgGlyphDarkStyle = { inherits: [theThis.svgGlyphDarkNoHoverStyle, theThis.cursorPointerStyle] };

        theThis.svgGlyphDarkStyleHover = { backgroundColor: theThis.buttonDarkFill, fill: theThis.buttonDarkBkg };

        theThis.divSvgGlyphStyle = { inherits: [theThis.noBorderMarginPaddingStyle, theThis.inlineBlockStyle, theThis.middleVerticalAlignStyle] };

        theThis.buttonDivMarginTopStyle = { marginTop: buttonMarginTopBottomPxNumber + "px" };
        theThis.buttonDivMarginBotStyle = { marginBottom: buttonMarginTopBottomPxNumber + "px" };

        theThis.buttonDivTopBotMarginsStyle = { inherits: [theThis.buttonDivMarginTopStyle, theThis.buttonDivMarginBotStyle] };

        theThis.buttonDivMarginLeftStyle = { marginLeft: buttonMarginLeftRightPxNumber + "px" };
        theThis.buttonDivMarginRightStyle = { marginRight: buttonMarginLeftRightPxNumber + "px" };

        theThis.buttonDivLeftRightMarginsStyle = { inherits: [theThis.buttonDivMarginLeftStyle, theThis.buttonDivMarginRightStyle] };

        theThis.buttonDivAllMarginsStyle = { inherits: [theThis.buttonDivTopBotMarginsStyle, theThis.buttonDivLeftRightMarginsStyle] };

        theThis.divSvgGlyphBtnStyle = { inherits: [theThis.divSvgGlyphStyle] };
        theThis.divSvgGlyphIconStyle = { inherits: [theThis.divSvgGlyphStyle, theThis.divIconCursorStyle] };

        theThis.textButtonStyleBase = {
            inherits: [theThis.buttonStyleBase, theThis.inlineBlockStyle, theThis.autoWidthStyle, theThis.buttonBorderRadiusStyle],
            paddingTop: textButtonPaddingTopBottomPxNumber + "px",
            paddingBottom: textButtonPaddingTopBottomPxNumber + "px",
            paddingLeft: textButtonPaddingLeftRightPxNumber + "px",
            paddingRight: textButtonPaddingLeftRightPxNumber + "px"
        };

        theThis.textDivBtnLightStyle = { inherits: theThis.textButtonStyleBase, color: theThis.lightTextDivBtnColor, backgroundColor: theThis.buttonLightBkg, textShadow: buttonShapedLinkTextShadow };

        theThis.textDivBtnLightStyleHover = { color: theThis.darkTextDivBtnColor, backgroundColor: theThis.buttonLightFill, textShadow: "none" };

        theThis.textDivBtnDarkStyle = { inherits: theThis.textButtonStyleBase, color: theThis.darkTextDivBtnColor, backgroundColor: theThis.buttonDarkBkg };

        theThis.textDivBtnDarkStyleHover = { color: theThis.lightTextDivBtnColor, backgroundColor: theThis.buttonDarkFill };

        theThis.mapTextBtnStyle = { inherits: [theThis.textButtonStyleBase], color: mapPopupTextButtonTextColor, backgroundColor: mapPopupTextButtonBkColor, textShadow: buttonShapedLinkTextShadow };
        theThis.mapTextBtnStyleHover = { inherits: [theThis.darkTextShadowStyle], backgroundColor: mapPopupTextButtonTextColor, color: mapPopupTextButtonBkColor, textShadow: buttonShapedLinkTextShadowHover };

        theThis.buttonShapedLinkStyle = {
            inherits: [theThis.textButtonStyleBase, theThis.noTextDecorationStyle],
            borderTop: borderSeparatorLightSpecs,
            borderLeft: borderSeparatorLightSpecs,
            borderBottom: borderSeparatorButtonBkSpecs,
            borderRight: borderSeparatorButtonBkSpecs,

            color: theThis.buttonShapedLinkTextColor,
            backgroundColor: theThis.buttonShapedLinkBkColor,
            textShadow: buttonShapedLinkTextShadow,

            margin: buttonShapedLinkMarginPxNumber + "px"
        };

        theThis.buttonShapedLinkHoverStyle = {
            borderTop: borderSeparatorButtonBkSpecs,
            borderLeft: borderSeparatorButtonBkSpecs,
            borderBottom: borderSeparatorLightSpecs,
            borderRight: borderSeparatorLightSpecs,

            color: theThis.buttonShapedLinkHoverTextColor,
            backgroundColor: theThis.buttonShapedLinkHoverBkColor,
            textShadow: buttonShapedLinkTextShadowHover
        };

        createDLayerStyles();

        theThis.paddedBlockDivStyle = { inherits: [theThis.noBorderMarginPaddingStyle, theThis.paddingStyle, theThis.blockStyle] };

        theThis.paddedInlineBlockDivStyle = { inherits: [theThis.noBorderMarginPaddingStyle, theThis.paddingStyle, theThis.inlineBlockStyle] };

        theThis.paddedBlockDivWithBorderSeparatorStyle = { inherits: [theThis.paddedBlockDivStyle, theThis.bottomBorderSeparatorLightStyle] };

        theThis.paddedInlineBlockDivWithBorderSeparatorStyle = { inherits: [theThis.paddedInlineBlockDivStyle, theThis.rightBorderSeparatorLightStyle] };

        theThis.unPaddedBlockDivStyle = { inherits: [theThis.noBorderMarginPaddingStyle, theThis.blockStyle] };

        theThis.unPaddedInlineBlockDivStyle = { inherits: [theThis.noBorderMarginPaddingStyle, theThis.inlineBlockStyle] };

        theThis.leftSideContainerStyle = { inherits: [theThis.unPaddedBlockDivStyle, theThis.autoWidthFullHeightStyle, theThis.overflowHiddenStyle] };

        theThis.floatLeftSideContainerStyle = { inherits: [theThis.unPaddedBlockDivStyle, theThis.autoWidthFullHeightStyle, theThis.overflowHiddenStyle, theThis.floatLeftStyle] };

        theThis.leftRightSideSeparatorStyle = {
            inherits: [theThis.unPaddedBlockDivStyle, theThis.fullHeightStyle, theThis.overflowHiddenStyle, theThis.separatorBkColorStyle,
                theThis.middleVerticalAlignStyle, theThis.textAlignCenterStyle, theThis.floatRightStyle, theThis.verticalSeparatorWidthStyle, theThis.positionRelativeStyle,
            theThis.leftBorderSeparatorLightStyle, theThis.rightBorderSeparatorDarkStyle]
        };

        theThis.rightSideContainerStyle = { inherits: [theThis.unPaddedBlockDivStyle, theThis.fullHeightStyle, theThis.overflowHiddenStyle, theThis.floatRightStyle, theThis.rightSideContainerBkColorStyle, theThis.lightTextColorStyle] };

        theThis.bottomContainerStyle = { inherits: [theThis.unPaddedBlockDivStyle, theThis.fullWidthStyle, theThis.overflowHiddenStyle, theThis.whiteBackgroundStyle] };

        theThis.topBottomSeparatorStyle = {
            inherits: [theThis.unPaddedBlockDivStyle, theThis.fullWidthStyle, theThis.overflowHiddenStyle, theThis.separatorBkColorStyle, theThis.middleVerticalAlignStyle, theThis.textAlignCenterStyle, theThis.horizontalSeparatorHeightStyle]
        };

        theThis.listContentStyle = { inherits: [theThis.unPaddedBlockDivStyle, theThis.bottomBorderSeparatorLightStyle, theThis.hcfLayoutContainerBkColorStyle] };

        theThis.inputFormBkStyle = { backgroundColor: theThis.inputFormBkColor };

        theThis.inputFormStyle = { inherits: [theThis.unPaddedBlockDivStyle, theThis.inputFormBkStyle, theThis.darkTextColorStyle, theThis.textAlignCenterStyle], borderRadius: inputFormBorderRadiusPxNumber + "px" };

        var platformURL = tf.platform.GetURL();

        theThis.fontFaceStyleContentStr =
            "font-family: 'SourceSansPro-Regular';" +
            "src: url('" + platformURL + "fonts/SourceSansPro-Regular.eot');" +
            "src: local('?'), url('" + platformURL + "fonts/SourceSansPro-Regular.woff') format('woff'), url('" + platformURL +
            "fonts/SourceSansPro-Regular.ttf') format('truetype'), url('" + platformURL + "fonts/SourceSansPro-Regular.svg') format('svg');" +
            "font-weight: normal;" +
            "font-style: normal;";

        theThis.transitionOpacityToVisibleStyle = { transition: "opacity .25s linear,visibility 0s linear" };
        theThis.transitionOpacityToInvisibleStyle = { transition: "opacity .25s linear,visibility 0s linear .25s" };

        createMapComponentsStyles();

        theThis.popupContentBkColorStyle = { backgroundColor: theThis.popupContentBkColor };

        theThis.popupCaptionStyle = {
            inherits: [theThis.inlineBlockStyle, theThis.noBorderMarginPaddingStyle, theThis.popupCaptionBackgroundColorStyle, theThis.seShadowStyle, theThis.bottomBorderSeparatorLightStyle,
                theThis.rightBorderSeparatorLightStyle, theThis.textShadowStyle, theThis.cursorDefaultStyle, theThis.darkTextColorStyle, theThis.positionRelativeStyle,
                theThis.popupCaptionBorderRadiusStyle, theThis.allPointerEventsStyle],
                fontSize: theThis.mapControlFontSizeEmNumber + "em"
        };

        theThis.bodyStyle = { inherits: [theThis.noBorderMarginPaddingStyle, theThis.fullWidthHeightStyle, theThis.whiteBackgroundStyle, theThis.defaultFontStyle, theThis.topFontSizeStyle] };
    }

    function initLiteralValues(specifications) {

        borderSeparatorLineSpecs = specifications.borderSeparatorLineSpecs;
        textInputBackgroundColor = specifications.textInputBackgroundColor;

        mapPopupTextButtonTextColor = specifications.mapPopupTextButtonTextColor;
        mapPopupTextButtonBkColor = specifications.mapPopupTextButtonBkColor;

        mapScaleLineBkColor = specifications.mapScaleLineBkColor ;
        mapScaleLineBorderRadiusPxNumber = specifications.mapScaleLineBorderRadiusPxNumber ;
        mapScaleLinePaddingPxNumber = specifications.mapScaleLinePaddingPxNumber ;
        mapScaleLineBorder = specifications.mapScaleLineBorder ;
        mapScaleLineFontSizeEmNumber = specifications.mapScaleLineFontSizeEmNumber ;
        mapScaleLineMarginPxNumber = specifications.mapScaleLineMarginPxNumber ;
        mapScaleLineFontColor = specifications.mapScaleLineFontColor;
        mapControlFontWeight = specifications.mapControlFontWeight;
        theThis.mapSubLegendBkColor = specifications.mapSubLegendBkColor;
        tfLogoBorderRadius = specifications.tfLogoBorderRadius ;
        tfLogoWidth = specifications.tfLogoWidth ;
        tfLogoHeight = specifications.tfLogoHeight ;
        tfLogoOpacity = specifications.tfLogoOpacity ;
        tfLogoBkColor = specifications.tfLogoBkColor ;
        tfLogoBorder = specifications.tfLogoBorder ;
        mapControlLineHeightEmNumber = specifications.mapControlLineHeightEmNumber ;
        mapControlTextColor = specifications.mapControlTextColor;

        overviewMapWidthPxNumber = specifications.overviewMapWidthPxNumber;
        overviewMapHeightPxNumber = specifications.overviewMapHeightPxNumber;
        overviewMapBorderWidthPxNumberNumber = specifications.overviewMapBorderWidthPxNumberNumber;
        overviewMapBoxBorder = specifications.overviewMapBoxBorder;

        mapZoomInBorderRadius = specifications.mapZoomInBorderRadius;
        mapZoomOutBorderRadius = specifications.mapZoomOutBorderRadius;

        dLayerSpanBackgroundColor = specifications.dLayerSpanBackgroundColor;
        textShadow = specifications.textShadow;
        darkTextShadow = specifications.darkTextShadow;
        textShadowSelRadioCheck = specifications.textShadowSelRadioCheck;

        mapButtonDimEmNumber = specifications.mapButtonDimEmNumber;
        mapButtonMarginEmNumber = specifications.mapButtonMarginEmNumber;
        mapButtonSpacingEmNumber = specifications.mapButtonSpacingEmNumber;

        maxHeightLogoImageEmNumber = specifications.maxHeightLogoImageEmNumber;
        maxWidthLogoImageEmNumber = specifications.maxWidthLogoImageEmNumber;

        theThis.mapButtonDimEmNumber = mapButtonDimEmNumber;
        theThis.mapButtonMarginEmNumber = mapButtonMarginEmNumber;

        theThis.mapControlBkColor = specifications.mapControlBkColor;
        theThis.mapControlHoverBkColor = specifications.mapControlHoverBkColor;
        theThis.mapControlButtonHoverBkColor = specifications.mapControlButtonHoverBkColor;
        theThis.mapControlButtonBkColor = specifications.mapControlButtonBkColor;

        buttonMarginTopBottomPxNumber = specifications.buttonMarginTopBottomPxNumber;
        buttonMarginLeftRightPxNumber = specifications.buttonMarginLeftRightPxNumber;

        buttonBorderRadiusPxNumber = specifications.buttonBorderRadiusPxNumber;

        textButtonPaddingTopBottomPxNumber = specifications.textButtonPaddingTopBottomPxNumber;
        textButtonPaddingLeftRightPxNumber = specifications.textButtonPaddingLeftRightPxNumber;

        theThis.lightTextColor = specifications.lightTextColor;
        theThis.darkTextColor = specifications.darkTextColor;
        theThis.disabledTextColor = specifications.disabledTextColor;

        theThis.borderLightColor = specifications.borderLightColor;

        theThis.defaultButtonBk = specifications.defaultButtonBk;
        theThis.defaultButtonFill = specifications.defaultButtonFill;

        theThis.buttonShapedLinkBkColor = specifications.buttonShapedLinkBkColor;
        theThis.buttonShapedLinkTextColor = specifications.buttonShapedLinkTextColor;
        theThis.buttonShapedLinkHoverBkColor = specifications.buttonShapedLinkHoverBkColor;
        theThis.buttonShapedLinkHoverTextColor = specifications.buttonShapedLinkHoverTextColor;

        buttonShapedLinkTextShadow = specifications.buttonShapedLinkTextShadow;
        buttonShapedLinkTextShadowHover = specifications.buttonShapedLinkTextShadowHover;

        buttonShapedLinkMarginPxNumber = specifications.buttonShapedLinkMarginPxNumber;

        svgButtonBorderRadiusPercentNumber = specifications.svgButtonBorderRadiusPercentNumber;

        verticalSeparatorWidthEMNumber = specifications.verticalSeparatorWidthEMNumber;
        horizontalSeparatorHeightEMNumber = specifications.horizontalSeparatorHeightEMNumber;

        paddingPxNumber = specifications.paddingPxNumber;
        theThis.popupContainerPaddingPxNumber = specifications.popupContainerPaddingPxNumber;
        popupCaptionBorderRadiusPXNumber = specifications.popupCaptionBorderRadiusPXNumber;

        popupContentPaddingPXNumber = specifications.popupContentPaddingPXNumber;
        popupContentBorderRadiusPXNumber = specifications.popupContentBorderRadiusPXNumber;

        theThis.textButtonHeightDelta = textButtonPaddingTopBottomPxNumber * 2;

        theThis.topFontSizePXNumber = specifications.topFontSizePXNumber;
        theThis.markerFontSizePXNumber = specifications.markerFontSizePXNumber;

        theThis.imageThumbWidthEmNumber = specifications.imageThumbWidthEmNumber;
        theThis.imageThumbSquareHeightEmNumber = theThis.imageThumbWidthEmNumber;
        theThis.imageThumbRectHeightEmNumber = theThis.imageThumbWidthEmNumber * 9 / 16;

        theThis.popupContentBkColor = specifications.popupContentBkColor;

        theThis.mapControlFontSizeEmNumber = specifications.mapControlFontSizeEmNumber;

        theThis.popupContentFontSizeEmNumber = specifications.popupContentFontSizeEmNumber;

        theThis.infoPopupContentFontSizeEmNumber = specifications.infoPopupContentFontSizeEmNumber;
        theThis.locationPopupContentFontSizeEmNumber = specifications.locationPopupContentFontSizeEmNumber;

        theThis.fontFamily = specifications.fontFamily;
        theThis.markerFontFamily = specifications.markerFontFamily;

        theThis.containerDarkBackgroundColor = specifications.containerDarkBackgroundColor;
        theThis.containerDarkSelBackgroundColor = specifications.containerDarkSelBackgroundColor;

        theThis.hcfLayoutContainerBkColor = specifications.hcfLayoutContainerBkColor;

        theThis.popupCaptionBackgroundColor = specifications.popupCaptionBackgroundColor;

        theThis.separatorBackgroundColor = specifications.separatorBackgroundColor;

        theThis.buttonLightBkg = specifications.buttonLightBkg;
        theThis.buttonLightFill = specifications.buttonLightFill;

        theThis.buttonDarkBkg = specifications.buttonDarkBkg;
        theThis.buttonDarkFill = specifications.buttonDarkFill;

        theThis.lightTextDivBtnColor = specifications.lightTextDivBtnColor;
        theThis.darkTextDivBtnColor = specifications.darkTextDivBtnColor;

        theThis.imgFramePaddingBorderWidthEmNumber = specifications.imgFramePaddingBorderWidthEmNumber;
        theThis.imgFrameBorder = specifications.imgFrameBorder;

        theThis.inputFormBkColor = specifications.inputFormBkColor;
        inputFormBorderRadiusPxNumber = specifications.inputFormBorderRadiusPxNumber;
    }

    function initialize() {

        var specs = tf.styles.GetDefaultAPIStyleSpecifications();
        //var specs = tf.styles.GetGraphiteAPIStyleSpecifications();

        if (tf.js.GetIsValidObject(alternativeSpecs)) { specs = tf.js.ShallowMerge(specs, alternativeSpecs); }

        initLiteralValues(specs);
        createConstantStyles();
        createAppStyles();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * @public
 * @class
 * @summary The {@link singleton} instance of this class, obtainable by calling {@link tf.GetStyles}(),
 * includes the pre-defined [CSS Style Names]{@link tf.types.CSSStyleName} used by the API, 
 * style related functions, and access to other style [singletons]{@link singleton}, like
 * the [CSS Style Creator]{@link tf.styles.CSSStyleCreator}, and [Sub Styles]{@link tf.styles.SubStyles},
 * containing pre-defined [CSS Style Specifications]{@link tf.types.CSSStyleSpecs}
 * @param {tf.types.APIStyleSpecs} alternativeSpecs - if defined, overrides the default API style specifications
 */
tf.styles.Styles = function (alternativeSpecs) {

    var theThis, styleCreator, subStyles, hiddenCanvas, supportedTransformProp;

    var dotPrefix = '.';

    var lightClassName = "light", darkClassName = "dark";
    var cssClassPrefix = "tf-";
    var divBaseClass = cssClassPrefix + "div-";
    var imgBaseClass = cssClassPrefix + "img-";
    var spanBaseClass = cssClassPrefix + "span-";
    var linkBaseClass = cssClassPrefix + "link-";
    var inputBaseClass = cssClassPrefix + "input-";
    var mapBaseClass = cssClassPrefix + "map-";
    var utilBaseClass = cssClassPrefix + "u-";
    var svgGlyphStyleBaseClass = cssClassPrefix + "glyph-svg-";
    var textDivBtnStyleBaseClass = cssClassPrefix + "btn-div-";
    var borderBaseClass = cssClassPrefix + "border-";

    var svgGlyphStyleNoHoverClass = "nohover-";

    var imgPreSelectorStr = "img.", svgPreSelectorStr = "svg.", divPreSelectorStr = 'div.', linkPreSelectorStr = 'a.';

    var imgPosSelectorStr = " img", spanPosSelectorStr = " span", linkPosSelectorStr = " a", labelPosSelectorStr = " label";
    var buttonPosSelectorStr = " button", inputPosSelectorStr = " input";

    var inputTypeRadioPosSelectorStr = inputPosSelectorStr + '[type="radio"]';
    var inputTypeCheckPosSelectorStr = inputPosSelectorStr + '[type="checkbox"]';

    var focusSelectorStr = ":focus", hoverSelectorStr = ":hover", checkedSelectorStr = ":checked";
    var linkSelectorStr = ":link", visitedSelectorStr = ":visited", activeSelectorStr = ":active";
    var beforeSelectorStr = "::before";

    var blockSuffix = "block-", inlineBlockSuffix = "inlineblock-", paddedSuffix = "padded", unPaddedSuffix = "un" + paddedSuffix;

    /**
     * @public
     * @function
     * @summary - Retrieves the {@link singleton} instance of [CSS Style Creator]{@link tf.styles.CSSStyleCreator}
     * @returns {tf.styles.CSSStyleCreator} - | {@link tf.styles.CSSStyleCreator} the {@link singleton}
    */
    this.GetStyleCreator = function () { return styleCreator; }

    /**
     * @public
     * @function
     * @summary - Retrieves the {@link singleton} instance of [Sub Styles]{@link tf.styles.SubStyles}
     * @returns {tf.styles.SubStyles} - | {@link tf.styles.SubStyles} the {@link singleton}
    */
    this.GetSubStyles = function () { return subStyles; }

    /**
     * @protected
     * @function
     * @summary - Retrieves a pre-created HTML5 canvas for internal use by the API
     * @returns {HTMLElement} - | {@link HTMLElement} the hidden canvas
    */
    this.GetHiddenCanvas = function () { return hiddenCanvas; }

    /**
     * @public
     * @function
     * @summary - Creates custom CSS styles and classes used by [SVG Glyph Button]{@link tf.ui.SvgGlyphBtn} instances to customize 
     * the <b>glyph</b> and <b>background</b> colors displayed in normal and hover states
     * @param {color} glyphColor - normal glyph color
     * @param {color} backgroundColor - normal background color
     * @param {color} glyphColorHover - glyph color on hover
     * @param {color} backgroundColorHover - background color on hover
     * @returns {tf.types.CSSStyleName} - | {@link tf.types.CSSStyleName} a CSS style/class
    */
    this.CreateSvgGlyphClasses = function (glyphColor, backgroundColor, glyphColorHover, backgroundColorHover) {
        return createSvgGlyphClasses(glyphColor, backgroundColor, glyphColorHover, backgroundColorHover);
    }

    /**
     * @public
     * @function
     * @summary - Creates custom CSS styles and classes used by [Text Button]{@link tf.ui.TextBtn} instances to customize the <b>text</b> and <b>background</b> colors displayed 
     * in normal and hover states
     * @param {color} textColor - normal text color
     * @param {color} backgroundColor - normal background color
     * @param {color} textColorHover - text color on hover
     * @param {color} backgroundColorHover - background color on hover
     * @returns {tf.types.CSSStyleName} - | {@link tf.types.CSSStyleName} a CSS style/class
    */
    this.CreateTextDivBtnClasses = function (textColor, backgroundColor, textColorHover, backgroundColorHover, addStyle, addStyleHover) {
        return createTextDivBtnClasses(textColor, backgroundColor, textColorHover, backgroundColorHover, addStyle, addStyleHover);
    }

    /**
     * @public
     * @function
     * @summary - Rotates the given element by the given angle, in degrees, by changing a specific [CSS style statement]{@link tf.types.CSSStyleStatement} of that element
     * @param {HTMLElementLike} elem - the given element
     * @param {number} angle - the given angle in degrees
     * @returns {void} - | {@link void} no return value
    */
    this.RotateByDegree = function (elem, angle) {
        var transformStr = theThis.GetSupportedTransformProperty();
        if (!!transformStr) {
            if (elem = tf.dom.GetHTMLElementFrom(elem)) {
                elem.style[transformStr] = theThis.GetRotateByDegreeTransformStr(angle);
            }
        }
    }

    this.GetSupportedTransformProperty = function () { return supportedTransformProp; }

    this.GetRotateByDegreeTransformStr = function (angle) {
        var degStr = tf.js.GetFloatNumberInRange(angle, -360 * 10, 360 * 10, 0) + "deg";
        return "rotate(" + degStr + ")";
    }

    /**
     * @public
     * @function
     * @summary - Gradually changes the visibility state of the given element to the given state by changing specific [CSS style statements]{@link tf.types.CSSStyleStatement} of that element
     * @param {HTMLElementLike} elem - the given element
     * @param {boolean} bool - <b>true</b> to make the element visible, <b>false</b> to make it invisible
     * @returns {void} - | {@link void} no return value
    */
    this.ChangeOpacityVisibilityClass = function (elem, bool) {
        if (elem = tf.dom.GetHTMLElementFrom(elem)) {
            var classIn, classOut;
            if (!!bool) { classIn = theThis.opacityVisibilityShowClass; classOut = theThis.opacityVisibilityHideClass; }
            else { classOut = theThis.opacityVisibilityShowClass; classIn = theThis.opacityVisibilityHideClass; }
            tf.dom.ReplaceCSSClass(elem, classOut, classIn);
            /*var style = !!bool ? subStyles.opacityVisibilityShowStyle : subStyles.opacityVisibilityHideStyle;
            theThis.ApplyStyleProperties(elem, style);*/
        }
    }

    /**
     * @public
     * @function
     * @summary - Applies the given style specifications to the given element
     * @param {HTMLElementLike} elem - the given element
     * @param {tf.types.CSSStyleSpecs} cssStyleSpecs - the given specifications
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the given element
    */
    this.ApplyStyleProperties = function (elem, cssStyleSpecs) { styleCreator.ApplyStyleProperties(elem, cssStyleSpecs); return elem; }

    /**
     * @public
     * @function
     * @summary - Adds a default bottom border separator to the given element
     * @param {HTMLElementLike} elem - the given element
     * @param {boolean} lightBool - set to <b>true</b> to use the API's default <b>light</b> style settings, otherwise the default <b>dark</b> style settings are used
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the given element
    */
    this.AddBorderBottom = function (elem, lightBool) {
        return theThis.ApplyStyleProperties (elem, !!lightBool ? subStyles.bottomBorderSeparatorLightStyle : subStyles.bottomBorderSeparatorDarkStyle);
    }

    /**
     * @public
     * @function
     * @summary - Adds a default top border separator to the given element
     * @param {HTMLElementLike} elem - the given element
     * @param {boolean} lightBool - set to <b>true</b> to use the API's default <b>light</b> style settings, otherwise the default <b>dark</b> style settings are used
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the given element
    */
    this.AddBorderTop = function (elem, lightBool) {
        return theThis.ApplyStyleProperties(elem, !!lightBool ? subStyles.topSeparatorLightStyle : subStyles.topBorderSeparatorDarkStyle);
    }

    /**
     * @public
     * @function
     * @summary - Retrieves button background color used by the API
     * @param {boolean} selectedBool - set to <b>true</b> to retrieve the selected state color, otherwise the normal state color is returned
     * @returns {color} - | {@link color} the color
    */
    this.GetButtonBGColor = function (selectedBool) { return !!selectedBool ? subStyles.defaultButtonBk : subStyles.defaultButtonFill }

    /**
     * @public
     * @function
     * @summary - Retrieves CSS style/class name used by API border separators, always returns the <b>light</b> style settings class/style
     * @param {boolean} inlineBool - set to <b>true</b> to retrieve a right border separator, otherwise the bottom separator is returned
     * @returns {tf.types.CSSStyleName} - | {@link tf.types.CSSStyleName} the s
    */
    this.GetBorderSeparatorClassName = function (inlineBool) { return !!inlineBool ? this.rightBorderSeparatorLightClass : this.bottomBorderSeparatorLightClass; }

    /**
     * @public
     * @function
     * @summary - Retrieves CSS style/class name used by API in the creation of <b>padded</b> [Div]{@link tf.dom.Div} instances
     * @param {boolean} inlineBool - set to <b>true</b> to retrieve an <b>inline-block</b> style with optional right border separator, otherwise a <b>block</b> div style with optional bottom separator is returned
     * @param {boolean} borderSeparatorBool - set to <b>true</b> to add a border separator, defaults to {@link void}
     * @returns {tf.types.CSSStyleName} - | {@link tf.types.CSSStyleName} the color
    */
    this.GetPaddedDivClassNames = function (inlineBool, borderSeparatorBool) {
        var classNames = '';
        if (!!inlineBool) { classNames = this.paddedInlineBlockDivClass; } else { classNames = this.paddedBlockDivClass; }
        if (!!borderSeparatorBool) { classNames += ' ' + theThis.GetBorderSeparatorClassName(inlineBool); }
        return classNames;
    }

    /**
     * @public
     * @function
     * @summary - Retrieves CSS style/class name used by API in the creation of <b>unpadded</b> [Div]{@link tf.dom.Div} instances
     * @param {boolean} inlineBool - set to <b>true</b> to retrieve an <b>inline-block</b> style with optional right border separator, otherwise a <b>block</b> div style with optional bottom separator is returned
     * @param {boolean} borderSeparatorBool - set to <b>true</b> to add a border separator, defaults to {@link void}
     * @returns {tf.types.CSSStyleName} - | {@link tf.types.CSSStyleName} the color
    */
    this.GetUnPaddedDivClassNames = function (inlineBool, borderSeparatorBool) {
        var classNames = '';
        if (!!inlineBool) { classNames = this.unPaddedInlineBlockDivClass; } else { classNames = this.unPaddedBlockDivClass; }
        if (!!borderSeparatorBool) { classNames += ' ' + theThis.GetBorderSeparatorClassName(inlineBool); }
        return classNames;
    }

    /**
     * @public
     * @function
     * @summary - Retrieves a <b>unicode</b> character suitable for display as a double horizontal arrow
     * @returns {character} - | {@link character} the character
    */
    this.GetUnicodeDoubleHorArrow = function () { return '\u2194'; }

    /**
     * @public
     * @function
     * @summary - Retrieves a <b>unicode</b> character suitable for display as an X that resembles a "close" button
     * @returns {character} - | {@link character} the character
    */
    this.GetUnicodeXClose = function () { return '\u00d7'; }

    /**
     * @public
     * @function
     * @summary - Retrieves CSS style/class name used by API in the creation of [Radio Button Lists]{@link tf.ui.RadioButtonList}
     * @returns {tf.types.CSSStyleName} - | {@link tf.types.CSSStyleName} the color
    */
    this.GetRadioItemClasses = function () { return theThis.radioClass + " " + theThis.radioLabelClass; }

    /**
     * @public
     * @function
     * @summary - Retrieves CSS style/class name used by API in the creation of [Check Box Lists]{@link tf.ui.CheckBoxList}
     * @returns {tf.types.CSSStyleName} - | {@link tf.types.CSSStyleName} the color
    */
    this.GetCheckItemClasses = function () { return theThis.checkClass + " " + theThis.checkLabelClass; }

    /**
     * @public
     * @function
     * @summary - Changes the position style of the given element to 'relative'
     * @param {HTMLElementLike} elem - the given element
     * @returns {void} - | {@link void} no return value
    */
    this.ApplyPositionRelativeStyle = function (elem) { return theThis.ApplyStyleProperties(elem, subStyles.positionRelativeStyle); }

    /**
     * @public
     * @function
     * @summary - Changes the position style of the given element to 'absolute'
     * @param {HTMLElementLike} elem - the given element
     * @returns {void} - | {@link void} no return value
    */
    this.ApplyPositionAbsoluteStyle = function (elem) { return theThis.ApplyStyleProperties(elem, subStyles.positionAbsoluteStyle); }

    /**
     * @public
     * @function
     * @summary - Applies styles used by the API on [Div]{@link tf.dom.Div} instances with image backgrounds
     * @param {HTMLElementLike} elem - the given element
     * @returns {void} - | {@link void} no return value
    */
    this.ApplyDivWithImgBkStyle = function (elem) { return theThis.ApplyStyleProperties(elem, subStyles.divWithImgBkStyle); }

    /**
     * @public
     * @function
     * @summary - Applies styles used by the API on [Div]{@link tf.dom.Div} instances containing text
     * @param {HTMLElementLike} elem - the given element
     * @param {boolean} darkTextColorBool - set to <b>true</b> to use the API's default <b>dark</b> text color style settings, otherwise the default <b>light</b> style settings are used
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the given element
    */
    this.ApplyTextColorStyle = function (elem, darkTextColorBool) { return theThis.ApplyStyleProperties(elem, !!darkTextColorBool ? subStyles.darkTextColorStyle : subStyles.lightTextColorStyle); }

    /**
     * @public
     * @function
     * @summary - Applies styles used by the API on [Div]{@link tf.dom.Div} instances to align items vertically
     * @param {HTMLElementLike} elem - the given element
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the given element
    */
    this.ApplyMiddleVerticalAlignStyle = function (elem) { return theThis.ApplyStyleProperties(elem, subStyles.middleVerticalAlignStyle); }

    /**
     * @public
     * @function
     * @summary - Applies styles used by the API on [Div]{@link tf.dom.Div} instances to align text on the center
     * @param {HTMLElementLike} elem - the given element
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the given element
    */
    this.ApplyTextAlignCenterStyle = function (elem) { return theThis.ApplyStyleProperties(elem, subStyles.textAlignCenterStyle); }

    /**
     * @public
     * @function
     * @summary - Applies styles used by the API on [Div]{@link tf.dom.Div} instances to float them
     * @param {HTMLElementLike} elem - the given element
     * @param {boolean} isLeftBool - set to <b>true</b> for float <b>left</b> styles, otherwise float <b>right</b> styles are applied
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the given element
    */
    this.ApplyFloatStyle = function (elem, isLeftBool) { styleCreator.ApplyStyleProperties(tf.dom.GetHTMLElementFrom(elem), !!isLeftBool ? subStyles.floatLeftStyle : subStyles.floatRightStyle); return elem; }

    /**
     * @public
     * @function
     * @summary - Applies styles used by the API on [Div]{@link tf.dom.Div} instances to achieve opacity transition effects
     * @param {HTMLElementLike} elem - the given element
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the given element
    */
    this.AddDefaultOpacityTransitionStyle = function (elem) { return theThis.ApplyStyleProperties(elem, subStyles.defaultOpacityVisibilityTransitionStyle); }

    /**
     * @public
     * @function
     * @summary - Applies styles used by the API on [Div]{@link tf.dom.Div} instances to achieve the API's default shadow effect
     * @param {HTMLElementLike} elem - the given element
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the given element
    */
    this.AddDefaultShadowStyle = function (elem) { styleCreator.ApplyStyleProperties(tf.dom.GetHTMLElementFrom(elem), subStyles.seShadowStyle); return elem; }

    /**
     * @public
     * @function
     * @summary - Applies styles used by the API on [Div]{@link tf.dom.Div} instances to achieve the API's alternative shadow effect
     * @param {HTMLElementLike} elem - the given element
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the given element
    */
    this.AddHorShadowStyle = function (elem) { styleCreator.ApplyStyleProperties(tf.dom.GetHTMLElementFrom(elem), subStyles.horShadowStyle); return elem; }

    /**
     * @public
     * @function
     * @summary - Applies styles used by the API on [Div]{@link tf.dom.Div} instances to set their horizontal and vertical button margins
     * @param {HTMLElementLike} elem - the given element
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the given element
    */
    this.AddButtonDivMargins = function (elem) { styleCreator.ApplyStyleProperties(tf.dom.GetHTMLElementFrom(elem), subStyles.buttonDivAllMarginsStyle); return elem; }

    /**
     * @public
     * @function
     * @summary - Applies styles used by the API on [Div]{@link tf.dom.Div} instances to set their vertical button margins
     * @param {HTMLElementLike} elem - the given element
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the given element
    */
    this.AddButtonDivTopBottMargins = function (elem) { styleCreator.ApplyStyleProperties(tf.dom.GetHTMLElementFrom(elem), subStyles.buttonDivTopBotMarginsStyle); return elem; }

    /**
     * @public
     * @function
     * @summary - Applies styles used by the API on [Div]{@link tf.dom.Div} instances to set their horizontal button margins
     * @param {HTMLElementLike} elem - the given element
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the given element
    */
    this.AddButtonDivLeftRightMargins = function (elem) { styleCreator.ApplyStyleProperties(tf.dom.GetHTMLElementFrom(elem), subStyles.buttonDivLeftRightMarginsStyle); return elem; }

    /**
     * @public
     * @function
     * @summary - Applies styles used by the API on [Div]{@link tf.dom.Div} instances to set their left button margin
     * @param {HTMLElementLike} elem - the given element
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the given element
    */
    this.AddButtonDivLeftMargin = function (elem) { styleCreator.ApplyStyleProperties(tf.dom.GetHTMLElementFrom(elem), subStyles.buttonDivMarginLeftStyle); return elem; }

    /**
     * @public
     * @function
     * @summary - Applies styles used by the API on [Div]{@link tf.dom.Div} instances to set their right button margin
     * @param {HTMLElementLike} elem - the given element
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the given element
    */
    this.AddButtonDivRightMargin = function (elem) { styleCreator.ApplyStyleProperties(tf.dom.GetHTMLElementFrom(elem), subStyles.buttonDivMarginRightStyle); return elem; }

    /**
     * @public
     * @function
     * @summary - Applies styles used by the API on [Div]{@link tf.dom.Div} instances to center them relative to their containers
     * @param {HTMLElementLike} elem - the given element
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the given element
    */
    this.ApplySnapToCenterStyle = function (elem) {
        if (!!elem) {
            var domElement = !!elem.GetHTMLElement ? tf.dom.GetHTMLElementFrom(elem) : elem;
            if (!!domElement) { styleCreator.ApplyStyleProperties(domElement, subStyles.snapCenterStyle); }
        }
        return elem;
    }

    /**
     * @public
     * @function
     * @summary - Applies styles used by the API on [Div]{@link tf.dom.Div} instances to position them relative to their containers
     * @param {HTMLElementLike} elem - the given element
     * @param {object} options - snap positioning options
     * @param {tf.types.horizontalPositioning} options.horPos - horizontal positioning
     * @param {tf.types.verticalPositioning} options.verPos - vertical positioning
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the given element
    */
    this.ApplySnapStyle = function (elem, options) {
        var domElement = tf.dom.GetHTMLElementFrom(elem);

        if (!!domElement) {
            var snapStyleHor;
            var snapStyleVer;
            var singleSnapStyle;

            switch (options.horPos) {
                case tf.consts.positioningLeft: snapStyleHor = subStyles.snapLeftStyle; break;
                case tf.consts.positioningRight: snapStyleHor = subStyles.snapRightStyle; break;
            }

            switch (options.verPos) {
                case tf.consts.positioningTop: snapStyleVer = subStyles.snapTopStyle; break;
                case tf.consts.positioningBottom: snapStyleVer = subStyles.snapBotStyle; break;
            }

            if (!snapStyleHor) {
                if (!snapStyleVer) { singleSnapStyle = subStyles.snapCenterStyle; }
                else { snapStyleHor = subStyles.snapCenterHorStyle; }
            }
            if (!snapStyleVer) { snapStyleVer = subStyles.snapCenterVerStyle; }

            if (singleSnapStyle) { styleCreator.ApplyStyleProperties(domElement, singleSnapStyle); }
            else {
                styleCreator.ApplyStyleProperties(domElement, snapStyleHor);
                styleCreator.ApplyStyleProperties(domElement, snapStyleVer);
            }
        }

        return elem;
    }

    /**
     * @public
     * @function
     * @summary - Creates an [SVG Glyph Button]{@link tf.ui.SvgGlyphBtn} with an X glyph that can be used as a <b>close</b> button on popups and elsewhere
     * @param {boolean} lightBool - set to <b>true</b> to use the API's default <b>light</b> style settings, otherwise the default <b>dark</b> style settings are used
     * @param {tf.types.MultiDOMEventListenerCallBack} onClickCallBack - callback for [Click]{@link tf.consts.DOMEventNamesClick} events
     * @param {HTMLElementSizeOrPxNumber} dim - button dimension
     * @param {string} toolTipStr - optional tooltip
     * @returns {tf.ui.SvgGlyphBtn} - the instance
    */
    this.CloseXButtonForPopup = function (lightBool, onClickCallBack, dim, toolTipStr) {
        !!dim && (dim = subStyles.mapControlFontSizeEmNumber + "em");
        !!!toolTipStr && (toolTipStr = 'Close');
        var btn = new tf.ui.SvgGlyphBtn({ style: lightBool, glyph: tf.styles.SvgGlyphCloseXName, onClick: onClickCallBack, tooltip: toolTipStr, dim: dim });
        var btnDiv = btn.GetHTMLElement();
        //btnDiv.style.top = "50%";
        //btnDiv.style.transform = "translateY(-25%)";
        //btnDiv.style.transform = "translateY(-50%)";
        styleCreator.ApplyStyleProperties(btnDiv, subStyles.buttonDivMarginLeftStyle);
        return btn;
    }

    /**
     * @public
     * @function
     * @summary - Creates an [Img]{@link tf.dom.Img} instance from the given source, will "100%" width and height styles
     * @param {string} imgSrc - the given source
     * @returns {tf.dom.Img} - | {@link tf.dom.Img} the instance
    */
    this.CreateImageFullWidthHeight = function (imgSrc) { return new tf.dom.Img({ src: imgSrc, cssClass: tf.GetStyles().imgFullWidthHeightClass }); }

    /**
     * @public
     * @function
     * @summary - Creates a [Div]{@link tf.dom.Div} instance with the given text settings
     * @param {boolean} darkTextColorBool - set to <b>true</b> to use the API's default <b>dark</b> text color style settings, otherwise the default <b>light</b> style settings are used
     * @returns {tf.dom.Div} - | {@link tf.dom.Div} the instance
    */
    this.CreateListContentItem = function (darkTextColorBool) {
        var styles = tf.GetStyles();
        return styles.ApplyTextColorStyle(styles.ApplyMiddleVerticalAlignStyle(new tf.dom.Div({ cssClass: styles.paddedInlineBlockDivClass })), darkTextColorBool);
    }

    /**
     * @public
     * @function
     * @summary - Creates a [Div]{@link tf.dom.Div} instance with a background image from the given source
     * @param {string} imgSrc - the given source
     * @param {boolean} rectangularImageBool - set to <b>true</b> to create with 16x9 aspect ratio, otherwise a square is created
     * @returns {tf.dom.Div} - | {@link tf.dom.Div} the instance
    */
    this.CreateListContentItemWithImgBk = function (imgSrc, rectangularImageBool) {
        var styles = tf.GetStyles(), subStyles = styles.GetSubStyles();
        var divObj = styles.ApplyDivWithImgBkStyle(theThis.CreateListContentItem(false)), div = divObj.GetHTMLElement();
        div.style.height = (!!rectangularImageBool ? subStyles.imageThumbRectHeightEmNumber : subStyles.imageThumbSquareHeightEmNumber) + "em";
        div.style.backgroundImage = "url('" + imgSrc + "')";
        return divObj;
    }

    /**
     * @public
     * @function
     * @summary - Applies styles used by the API on the HTML document body
     * @returns {void} - | {@link void} no return value
    */
    this.AddBodyStyle = function () { return addBodyStyle(); }

    /**
     * used for application containers
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.appContainerClass = divBaseClass + "app";
    /**
     * used for [Map]{@link tf.map.Map} containers
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.mapContainerClass = divBaseClass + "map-container";
    /**
     * used for [Map]{@link tf.map.Map} sub-containers
     * @private
     * @type {tf.types.CSSStyleName}
    */
    this.mapSubContainerClass = divBaseClass + "map";

    /**
     * used for layout sub-containers
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.leftSideContainerClass = divBaseClass + "left";
    /**
     * used for layout sub-containers
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.floatLeftSideContainerClass = divBaseClass + "floatLeft";
    /**
     * used for layout sub-containers
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.leftRightSideSeparatorClass = divBaseClass + "leftright";
    /**
     * used for layout sub-containers
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.rightSideContainerClass = divBaseClass + "right";
    /**
     * used for layout sub-containers
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.bottomContainerClass = divBaseClass + "bot";
    /**
     * used for layout sub-containers
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.topBottomSeparatorClass = divBaseClass + "topbot";

    /**
     * used for layout sub-containers
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.listContentClass = divBaseClass + "listcnt";

    /**
     * default used by {@link tf.dom.TextInput}
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.inputFormClass = divBaseClass + "inputForm";

    /**
     * block display padded div 
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.paddedBlockDivClass = divBaseClass + blockSuffix + paddedSuffix;

    /**
     * inline-block display padded div 
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.paddedInlineBlockDivClass = divBaseClass + inlineBlockSuffix + paddedSuffix;

    /**
     * block display padded div with a bottom border separator
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.paddedBlockDivWithBorderSeparatorClass = divBaseClass + "block-padded-bordersep";

    /**
     * inline-block display padded div with a right border separator
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.paddedInlineBlockDivWithBorderSeparatorClass = divBaseClass + "inline-block-padded-bordersep";

    /**
     * block display unpadded div
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.unPaddedBlockDivClass = divBaseClass + blockSuffix + unPaddedSuffix;

    /**
     * inline-block display unpadded div
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.unPaddedInlineBlockDivClass = divBaseClass + inlineBlockSuffix + unPaddedSuffix;

    /**
     * div with background image
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.divWithImgBkClass = divBaseClass + "imgbk";

    /**
     * div used with map measure
     * @private
     * @type {tf.types.CSSStyleName}
    */
    this.mapMeasureOverlayDivClass = divBaseClass + "mapoverlay";

    /**
     * div used with logos
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.imgLogoStyleClass = imgBaseClass + "logo";

    /**
     * used by {@link tf.dom.Img} with "100%" width and height
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.imgFullWidthHeightClass = imgBaseClass + "fullwh";

    /**
     * used by {@link tf.dom.Img} in map's info window
     * @private
     * @type {tf.types.CSSStyleName}
    */
    this.imgForInfoWindowClass = imgBaseClass + "infow";

    /**
     * used by {@link tf.ui.SvgGlyph} light style without hover
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.svgGlyphLightNoHoverStyleClass = svgGlyphStyleBaseClass + svgGlyphStyleNoHoverClass + lightClassName;
    /**
     * used by {@link tf.ui.SvgGlyph} light style
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.svgGlyphLightStyleClass = svgGlyphStyleBaseClass + lightClassName;

    /**
     * used by {@link tf.ui.SvgGlyph} dark style without hover
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.svgGlyphDarkNoHoverStyleClass = svgGlyphStyleBaseClass + svgGlyphStyleNoHoverClass + darkClassName;
    /**
     * used by {@link tf.ui.SvgGlyph} dark style
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.svgGlyphDarkStyleClass = svgGlyphStyleBaseClass + darkClassName;

    /**
     * used by {@link tf.ui.SvgGlyphBtn}
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.divSvgGlyphBtnClass = svgGlyphStyleBaseClass + "svgglyphbtndiv";

    /**
     * used by {@link tf.ui.TextBtn} light style
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.textDivBtnLightStyleClass = textDivBtnStyleBaseClass + lightClassName;
    /**
     * used by {@link tf.ui.TextBtn} dark style
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.textDivBtnDarkStyleClass = textDivBtnStyleBaseClass + darkClassName;
    /**
     * used by {@link tf.ui.TextBtn} map style
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.mapTextBtnClass = textDivBtnStyleBaseClass + "map";

    /**
     * bottom separator light style
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.bottomBorderSeparatorLightClass = borderBaseClass + "botlight";
    /**
     * bottom separator dark style
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.bottomBorderSeparatorDarkClass = borderBaseClass + "botdark";

    /**
     * right separator light style
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.rightBorderSeparatorLightClass = borderBaseClass + "rightlight";
    /**
     * right separator dark style
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.rightBorderSeparatorDarkClass = borderBaseClass + "rightdark";

    /**
     * used by {@link tf.ui.RadioButtonWithLabel}
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.radioClass = "tf-radio";
    /**
     * used by {@link tf.ui.RadioButtonWithLabel}
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.radioLabelClass = this.radioClass + "-label";

    /**
     * used by {@link tf.ui.CheckBoxWithLabel}
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.checkClass = "tf-check";
    /**
     * used by {@link tf.ui.CheckBoxWithLabel}
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.checkLabelClass = this.checkClass + "-label";

    /**
     * used by {@link tf.ui.Popup} captions
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.popupCaptionClass = divBaseClass + "popupcaption";

    /**
     * used by {@link tf.ui.Popup} container
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.popupContainerClass = divBaseClass + "popupcontainer";
    /**
     * used by {@link tf.ui.Popup} content
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.popupContentClass = divBaseClass + "popupcontent";

    /**
     * used by map toolbars
     * @private
     * @type {tf.types.CSSStyleName}
    */
    this.mapToolBarContainerClass = divBaseClass + "maptoolbarcontainer";

    /**
     * used by {@link tf.dom.Span}
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.spanClass = spanBaseClass + "span";
    /**
     * used by {@link tf.dom.Span}
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.spanCursorPointerClass = spanBaseClass + "spanCursorPointer";

    /**
     * used by {@link tf.urlapi.DLayer} in map Info Popups
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.dLayerInfoClass = divBaseClass + "dLayerInfo";

    /**
     * used by {@link tf.layout.HeaderContentFooter} layouts
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.hcfLayoutClass = divBaseClass + "hcfpage";
    /**
     * used by {@link tf.layout.HeaderContentFooter} layouts
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.hcfLayoutHeaderClass = divBaseClass + "hcfhrd";
    /**
     * used by {@link tf.layout.HeaderContentFooter} layouts
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.hcfLayoutFooterClass = divBaseClass + "hcfftr";
    /**
     * used by {@link tf.layout.HeaderContentFooter} layouts
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.hcfLayoutContentClass = divBaseClass + "hcfcnt";

    /**
     * used by {@link tf.dom.Link}
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.buttonShapedLinkClass = linkBaseClass + "buttonshape";

    /**
     * used by {@link tf.dom.TextInput}
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.inputTextClass = inputBaseClass + "input";

    /**
     * used by map controls
     * @private
     * @type {tf.types.CSSStyleName}
    */
    this.mapTFLogoControlClass = mapBaseClass + "tflogo";
    /**
     * used by map controls
     * @private
     * @type {tf.types.CSSStyleName}
    */
    this.mapAddressButtonClass = mapBaseClass + "addressbtn";
    /**
     * used by map controls
     * @private
     * @type {tf.types.CSSStyleName}
    */
    this.mapLayersButtonClass = mapBaseClass + "layersbtn";
    /**
     * used by map controls
     * @private
     * @type {tf.types.CSSStyleName}
    */
    this.mapTypeButtonClass = mapBaseClass + "typebtn";
    /**
     * used by map controls
     * @private
     * @type {tf.types.CSSStyleName}
    */
    this.mapMeasureButtonClass = mapBaseClass + "measurebtn";
    /**
     * used by map controls
     * @private
     * @type {tf.types.CSSStyleName}
    */
    this.mapDownloadButtonClass = mapBaseClass + "downloadbtn";
    /**
     * used by map controls
     * @private
     * @type {tf.types.CSSStyleName}
    */
    this.mapSourceButtonClass = mapBaseClass + "sourcebtn";
    /**
     * used by map controls
     * @private
     * @type {tf.types.CSSStyleName}
    */
    this.mapLocationButtonClass = mapBaseClass + "centerbtn";
    /**
     * used by map controls
     * @private
     * @type {tf.types.CSSStyleName}
    */
    this.mapUserLocationButtonClass = mapBaseClass + "userlocbtn";
    /**
     * used by map controls
     * @private
     * @type {tf.types.CSSStyleName}
    */
    this.mapFullScreenButtonClass = mapBaseClass + "fullscreenbtn";

    /**
     * used for visibility transitions
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.opacityVisibilityShowClass = utilBaseClass + "show";
    /**
     * used for visibility transitions
     * @public
     * @type {tf.types.CSSStyleName}
    */
    this.opacityVisibilityHideClass = utilBaseClass + "hide";

    /**
     * used by map controls
     * @private
     * @type {tf.types.CSSStyleName}
    */
    this.mapSvgGlyphInButtonClass = mapBaseClass + "svgglyphinbutton";

    function createSvgGlyphClasses(glyphColor, backgroundColor, glyphColorHover, backgroundColorHover) {
        var className = svgGlyphStyleBaseClass + tf.GetGlobalCounter().GetNext();
        var svgStyles = subStyles.CreateSvgGlyphStyles(glyphColor, backgroundColor, glyphColorHover, backgroundColorHover);
        var styles = [
            { styleName: svgPreSelectorStr + className, inherits: svgStyles.style },
            { styleName: svgPreSelectorStr + className + hoverSelectorStr, inherits: svgStyles.hoverStyle }
        ];
        styleCreator.CreateStyles(styles);
        return className;
    }

    function createTextDivBtnClasses(textColor, backgroundColor, textColorHover, backgroundColorHover, addStyle, addStyleHover) {
        var className = textDivBtnStyleBaseClass + tf.GetGlobalCounter().GetNext();
        var divStyles = subStyles.CreateTextDivBtnStyles(textColor, backgroundColor, textColorHover, backgroundColorHover);
        var styles = [
            { styleName: divPreSelectorStr + className, inherits: tf.js.ShallowMerge(addStyle, divStyles.style) },
            { styleName: divPreSelectorStr + className + hoverSelectorStr, inherits: tf.js.ShallowMerge(addStyleHover, divStyles.hoverStyle) }
        ];
        styleCreator.CreateStyles(styles);
        return className;
    }

    function addBodyStyle() { styleCreator.CreateStyle({ styleName: "body", inherits: subStyles.bodyStyle }); }

    function getFirstSupportedElementProp (propArrayOrObject) {
        var propFound = null;
        if (tf.js.GetIsValidObject(propArrayOrObject)) {
            var rootStyle = document.documentElement.style;
            for (var i in propArrayOrObject) { var thisProp = propArrayOrObject[i]; if (thisProp in rootStyle) { propFound = thisProp; break; } }
        }
        return propFound;
    }


    function findSupportedElementProps() {
        supportedTransformProp = getFirstSupportedElementProp(['transform', 'MozTransform', 'WebkitTransform', 'msTransform', 'OTransform']);
    }

    function createHiddenCanvas() {
        hiddenCanvas = document.createElement('canvas');
        var hiddenCanvasStyle = hiddenCanvas.style;
        hiddenCanvasStyle.display = 'none';
        hiddenCanvasStyle.width = "10em";
        hiddenCanvasStyle.height = "10em";
        hiddenCanvasStyle.zIndex = -100;
    }

    function createLiteralStyles() {
        var literalStyles = [];
        for (var literalStyle in literalStyles) { var thisStyle = literalStyles[literalStyle]; if (thisStyle.styleName) { styleCreator.CreateRawStyle(thisStyle.selector, thisStyle.style); } }
    }

    function createStyles() {
        var styles = [

            { styleName: dotPrefix + theThis.appContainerClass, inherits: subStyles.appContainerStyle },

            { styleName: dotPrefix + theThis.mapContainerClass, inherits: subStyles.mapContainerStyle },

            { styleName: dotPrefix + theThis.mapSubContainerClass, inherits: subStyles.mapSubContainerStyle },

            { styleName: dotPrefix + theThis.leftSideContainerClass, inherits: subStyles.leftSideContainerStyle },

            { styleName: dotPrefix + theThis.floatLeftSideContainerClass, inherits: subStyles.floatLeftSideContainerStyle },

            { styleName: dotPrefix + theThis.leftRightSideSeparatorClass, inherits: subStyles.leftRightSideSeparatorStyle },
            { styleName: dotPrefix + theThis.rightSideContainerClass, inherits: subStyles.rightSideContainerStyle },
            { styleName: dotPrefix + theThis.bottomContainerClass, inherits: subStyles.bottomContainerStyle },
            { styleName: dotPrefix + theThis.topBottomSeparatorClass, inherits: subStyles.topBottomSeparatorStyle },

            { styleName: dotPrefix + theThis.listContentClass, inherits: subStyles.listContentStyle },

            { styleName: dotPrefix + theThis.inputFormClass, inherits: subStyles.inputFormStyle },

            { styleName: dotPrefix + theThis.popupContainerClass, inherits: subStyles.popupContainerStyle },
            { styleName: dotPrefix + theThis.popupContentClass, inherits: subStyles.popupContentStyle },
            { styleName: dotPrefix + theThis.mapToolBarContainerClass, inherits: subStyles.mapToolBarContainerStyle },

            { styleName: dotPrefix + theThis.paddedBlockDivClass, inherits: subStyles.paddedBlockDivStyle },
            { styleName: dotPrefix + theThis.paddedInlineBlockDivClass, inherits: subStyles.paddedInlineBlockDivStyle },

            { styleName: dotPrefix + theThis.paddedBlockDivWithBorderSeparatorClass, inherits: subStyles.paddedBlockDivWithBorderSeparatorStyle },
            { styleName: dotPrefix + theThis.paddedInlineBlockDivWithBorderSeparatorClass, inherits: subStyles.paddedInlineBlockDivWithBorderSeparatorStyle },

            { styleName: dotPrefix + theThis.unPaddedBlockDivClass, inherits: subStyles.unPaddedBlockDivStyle },
            { styleName: dotPrefix + theThis.unPaddedInlineBlockDivClass, inherits: subStyles.unPaddedInlineBlockDivStyle },

            { styleName: dotPrefix + theThis.divWithImgBkClass, inherits: subStyles.divWithImgBkStyle },

            { styleName: dotPrefix + theThis.inputTextClass + ":-moz-placeholder", inherits: subStyles.inputTextPlaceholderStyle },
            { styleName: dotPrefix + theThis.inputTextClass + "::-moz-placeholder", inherits: subStyles.inputTextPlaceholderStyle },
            { styleName: dotPrefix + theThis.inputTextClass + ":-ms-input-placeholder", inherits: subStyles.inputTextPlaceholderStyle },
            { styleName: dotPrefix + theThis.inputTextClass + "::-webkit-input-placeholder", inherits: subStyles.inputTextPlaceholderStyle },

            { styleName: dotPrefix + theThis.inputTextClass + "::-ms-clear", inherits: subStyles.noneDisplayStyle },

            { styleName: dotPrefix + theThis.inputTextClass + ", " + dotPrefix + theThis.inputTextClass + inputPosSelectorStr + ", " + dotPrefix + theThis.inputTextClass + inputPosSelectorStr + focusSelectorStr, inherits: subStyles.inputTextStyle },

            { styleName: dotPrefix + theThis.radioLabelClass + labelPosSelectorStr, inherits: subStyles.radioLabelStyle },
            { styleName: dotPrefix + theThis.radioClass + inputTypeRadioPosSelectorStr, inherits: subStyles.radioRadioStyle },
            { styleName: dotPrefix + theThis.radioClass + inputTypeRadioPosSelectorStr + checkedSelectorStr + " +" + labelPosSelectorStr, inherits: subStyles.radioRadioAndLabelCheckedStyle },
            { styleName: dotPrefix + theThis.radioClass + inputTypeRadioPosSelectorStr + ", " + dotPrefix + theThis.radioLabelClass + labelPosSelectorStr + beforeSelectorStr, inherits: subStyles.radioRadioAndLabelStyleBefore },
            { styleName: dotPrefix + theThis.radioClass + inputTypeRadioPosSelectorStr + checkedSelectorStr + " +" + labelPosSelectorStr + beforeSelectorStr, inherits: subStyles.radioRadioAndLabelSelStyleBefore },

            { styleName: dotPrefix + theThis.checkLabelClass + labelPosSelectorStr, inherits: subStyles.checkLabelStyle },
            { styleName: dotPrefix + theThis.checkClass + inputTypeCheckPosSelectorStr, inherits: subStyles.checkCheckStyle },
            { styleName: dotPrefix + theThis.checkClass + inputTypeCheckPosSelectorStr + checkedSelectorStr + " +" + labelPosSelectorStr, inherits: subStyles.checkCheckAndLabelCheckedStyle },
            { styleName: dotPrefix + theThis.checkClass + inputTypeCheckPosSelectorStr + ", " + dotPrefix + theThis.checkLabelClass + labelPosSelectorStr + beforeSelectorStr, inherits: subStyles.checkCheckAndLabelStyleBefore },
            { styleName: dotPrefix + theThis.checkClass + inputTypeCheckPosSelectorStr + checkedSelectorStr + " +" + labelPosSelectorStr + beforeSelectorStr, inherits: subStyles.checkCheckAndLabelSelStyleBefore },

            { styleName: dotPrefix + theThis.mapMeasureOverlayDivClass, inherits: subStyles.mapMeasureOverlayDivStyle },

            { styleName: dotPrefix + theThis.hcfLayoutClass, inherits: subStyles.hcfLayoutStyle },
            { styleName: dotPrefix + theThis.hcfLayoutHeaderClass, inherits: subStyles.hcfLayoutHeaderStyle },
            { styleName: dotPrefix + theThis.hcfLayoutFooterClass, inherits: subStyles.hcfLayoutFooterStyle },
            { styleName: dotPrefix + theThis.hcfLayoutContentClass, inherits: subStyles.hcfLayoutContentStyle },

            { styleName: dotPrefix + theThis.popupCaptionClass, inherits: subStyles.popupCaptionStyle },

            { styleName: dotPrefix + theThis.spanClass, inherits: subStyles.spanStyle },
            { styleName: dotPrefix + theThis.spanCursorPointerClass, inherits: subStyles.spanCursorPointerStyle },

            { styleName: dotPrefix + theThis.dLayerInfoClass, inherits: subStyles.dLayerInfoStyle },
            { styleName: dotPrefix + theThis.dLayerInfoClass + imgPosSelectorStr, inherits: subStyles.dLayerInfoImgStyle },
            { styleName: dotPrefix + theThis.dLayerInfoClass + linkPosSelectorStr, inherits: subStyles.dLayerInfoLinkStyle },

            { styleName: dotPrefix + theThis.dLayerInfoClass + linkPosSelectorStr + linkSelectorStr, inherits: subStyles.dLayerInfoLinkStyle },
            { styleName: dotPrefix + theThis.dLayerInfoClass + linkPosSelectorStr + visitedSelectorStr, inherits: subStyles.dLayerInfoLinkStyle },

            { styleName: dotPrefix + theThis.dLayerInfoClass + linkPosSelectorStr + hoverSelectorStr, inherits: subStyles.dLayerInfoLinkHoverStyle },

            { styleName: dotPrefix + theThis.dLayerInfoClass + linkPosSelectorStr + activeSelectorStr, inherits: subStyles.dLayerInfoLinkStyle },

            { styleName: dotPrefix + theThis.dLayerInfoClass + spanPosSelectorStr, inherits: subStyles.dLayerInfoSpanStyle },

            { styleName: linkPreSelectorStr + theThis.buttonShapedLinkClass, inherits: subStyles.buttonShapedLinkStyle },
            { styleName: linkPreSelectorStr + theThis.buttonShapedLinkClass + hoverSelectorStr, inherits: subStyles.buttonShapedLinkHoverStyle },

            { styleName: imgPreSelectorStr + theThis.imgLogoStyleClass, inherits: subStyles.imgLogoStyle },
            { styleName: imgPreSelectorStr + theThis.imgFullWidthHeightClass, inherits: subStyles.imgFullWidthHeightStyle },

            { styleName: imgPreSelectorStr + theThis.imgForInfoWindowClass, inherits: subStyles.imgForInfoWindowStyle },

            { styleName: svgPreSelectorStr + theThis.svgGlyphLightNoHoverStyleClass, inherits: subStyles.svgGlyphLightNoHoverStyle },
            { styleName: svgPreSelectorStr + theThis.svgGlyphLightStyleClass, inherits: subStyles.svgGlyphLightStyle },
            { styleName: svgPreSelectorStr + theThis.svgGlyphLightStyleClass + hoverSelectorStr, inherits: subStyles.svgGlyphLightStyleHover },

            { styleName: svgPreSelectorStr + theThis.svgGlyphDarkNoHoverStyleClass, inherits: subStyles.svgGlyphDarkNoHoverStyle },
            { styleName: svgPreSelectorStr + theThis.svgGlyphDarkStyleClass, inherits: subStyles.svgGlyphDarkStyle },
            { styleName: svgPreSelectorStr + theThis.svgGlyphDarkStyleClass + hoverSelectorStr, inherits: subStyles.svgGlyphDarkStyleHover },

            { styleName: svgPreSelectorStr + theThis.mapSvgGlyphInPopupClass, inherits: subStyles.mapSvgGlyphInPopupStyle },
            { styleName: svgPreSelectorStr + theThis.mapSvgGlyphInPopupClass + hoverSelectorStr, inherits: subStyles.mapSvgGlyphInPopupHoverStyle },

            { styleName: svgPreSelectorStr + theThis.mapSvgGlyphInButtonClass, inherits: subStyles.mapSvgGlyphInButtonStyle },

            { styleName: dotPrefix + theThis.divSvgGlyphBtnClass, inherits: subStyles.divSvgGlyphBtnStyle },

            { styleName: divPreSelectorStr + theThis.textDivBtnLightStyleClass, inherits: subStyles.textDivBtnLightStyle },
            { styleName: divPreSelectorStr + theThis.textDivBtnLightStyleClass + hoverSelectorStr, inherits: subStyles.textDivBtnLightStyleHover },

            { styleName: divPreSelectorStr + theThis.textDivBtnDarkStyleClass, inherits: subStyles.textDivBtnDarkStyle },
            { styleName: divPreSelectorStr + theThis.textDivBtnDarkStyleClass + hoverSelectorStr, inherits: subStyles.textDivBtnDarkStyleHover },

            { styleName: divPreSelectorStr + theThis.mapTextBtnClass, inherits: subStyles.mapTextBtnStyle },
            { styleName: divPreSelectorStr + theThis.mapTextBtnClass + hoverSelectorStr, inherits: subStyles.mapTextBtnStyleHover },

            { styleName: dotPrefix + theThis.bottomBorderSeparatorLightClass, inherits: subStyles.bottomBorderSeparatorLightStyle },
            { styleName: dotPrefix + theThis.bottomBorderSeparatorDarkClass, inherits: subStyles.bottomBorderSeparatorDarkStyle },

            { styleName: dotPrefix + theThis.rightBorderSeparatorLightClass, inherits: subStyles.rightBorderSeparatorLightStyle },
            { styleName: dotPrefix + theThis.rightBorderSeparatorDarkClass, inherits: subStyles.rightBorderSeparatorDarkStyle },

            { styleName: dotPrefix + theThis.mapTFLogoControlClass, inherits: subStyles.mapTFLogoControlStyle },
            { styleName: dotPrefix + theThis.mapAddressButtonClass, inherits: subStyles.mapAddressButtonStyle },
            { styleName: dotPrefix + theThis.mapLayersButtonClass, inherits: subStyles.mapLayersButtonStyle },
            { styleName: dotPrefix + theThis.mapTypeButtonClass, inherits: subStyles.mapTypeButtonStyle },
            { styleName: dotPrefix + theThis.mapMeasureButtonClass, inherits: subStyles.mapMeasureButtonStyle },
            { styleName: dotPrefix + theThis.mapDownloadButtonClass, inherits: subStyles.mapDownloadButtonStyle },
            { styleName: dotPrefix + theThis.mapSourceButtonClass, inherits: subStyles.mapSourceButtonStyle },
            { styleName: dotPrefix + theThis.mapLocationButtonClass, inherits: subStyles.mapLocationButtonStyle },
            { styleName: dotPrefix + theThis.mapUserLocationButtonClass, inherits: subStyles.mapUserLocationButtonStyle },
            { styleName: dotPrefix + theThis.mapFullScreenButtonClass, inherits: subStyles.mapFullScreenButtonStyle },

            { styleName: ".ol-viewport .ol-unselectable", inherits: subStyles.mapViewPortUnSelectableStyle },

            { styleName: ".ol-zoom", inherits: subStyles.mapZoomStyle },
            { styleName: ".ol-zoom .ol-zoom-in", inherits: subStyles.mapZoomInBorderRadiusStyle },
            { styleName: ".ol-zoom .ol-zoom-out", inherits: subStyles.mapZoomOutBorderRadiusStyle },
            { styleName: ".ol-zoomslider", inherits: subStyles.mapZoomSliderStyle },
            { styleName: ".ol-rotate", inherits: subStyles.mapRotateStyle },
            { styleName: ".ol-rotate.ol-hidden", inherits: subStyles.mapRotateHiddenStyle },
            { styleName: ".ol-compass", inherits: subStyles.mapCompassStyle },
            { styleName: ".ol-scale-line", inherits: subStyles.mapScaleLineStyle },
            { styleName: ".ol-scale-line-inner", inherits: subStyles.mapScaleLineInnerStyle },

            { styleName: ".ol-control", inherits: subStyles.mapControlStyle },
            { styleName: ".ol-control" + hoverSelectorStr, inherits: subStyles.mapControlHoverStyle },
            { styleName: ".ol-control" + buttonPosSelectorStr + focusSelectorStr + ", " + ".ol-control" + buttonPosSelectorStr + hoverSelectorStr, inherits: subStyles.mapControlButtonFocusHoverStyle },
            { styleName: ".ol-control" + buttonPosSelectorStr, inherits: subStyles.mapControlButtonStyle },
            { styleName: ".ol-control" + buttonPosSelectorStr + "::-moz-focus-inner", inherits: subStyles.mapControlButtonMozFocusInnerStyle },

            { styleName: ".ol-overviewmap", inherits: subStyles.mapOverviewMapStyle },
            { styleName: ".ol-overviewmap.ol-uncollapsible", inherits: subStyles.mapOverviewMapUnCollapsibleStyle },
            { styleName: ".ol-overviewmap .ol-overviewmap-map, .ol-overviewmap" + buttonPosSelectorStr, inherits: subStyles.mapControlButtonStyle },
            { styleName: ".ol-overviewmap .ol-overviewmap-map", inherits: subStyles.mapOverviewMapMapStyle },
            { styleName: ".ol-overviewmap:not(.ol-collapsed)" + buttonPosSelectorStr, inherits: subStyles.mapOverviewMapButtonNotCollapsedStyle },
            { styleName: ".ol-overviewmap.ol-collapsed .ol-overviewmap-map, .ol-overviewmap.ol-uncollapsible" + buttonPosSelectorStr, inherits: subStyles.mapOverviewMapButtonCollapsedStyle },
            { styleName: ".ol-overviewmap:not(.ol-collapsed)", inherits: subStyles.mapOverviewMapNotCollapsedStyle },
            { styleName: ".ol-overviewmap-box", inherits: subStyles.mapOverviewMapBoxStyle },

            { styleName: ".ol-button-text-span", inherits: subStyles.mapButtonTextSpanStyle },

            { styleName: dotPrefix + theThis.opacityVisibilityShowClass, inherits: subStyles.opacityVisibilityShowStyle },
            { styleName: dotPrefix + theThis.opacityVisibilityHideClass, inherits: subStyles.opacityVisibilityHideStyle },

            {}
        ];

        styleCreator.CreateStyles(styles);
    }

    function initialize() {
        styleCreator = new tf.styles.CSSStyleCreator(theThis);
        subStyles = new tf.styles.SubStyles(theThis, alternativeSpecs);
        createHiddenCanvas();
        findSupportedElementProps();
        //styleCreator.CreateRawStyle("@font-face", subStyles.fontFaceStyleContentStr);
        createLiteralStyles();
        createStyles();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
