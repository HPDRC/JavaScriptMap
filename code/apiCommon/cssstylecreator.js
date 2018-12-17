"use strict";

/**
 * An {@link object} with two [CSS Style Specifications]{@link tf.types.CSSStyleSpecs}, for normal and hover states
 * @public
 * @typedef {object} tf.types.CSSStyleAndHoverSpecifications
 * @property {tf.types.CSSStyleSpecs} style - regular style used by the {@link HTMLElementLike} 
 * @property {tf.types.CSSStyleSpecs} hoverStyle - style used by the {@link HTMLElementLike} when the mouse pointer is hovering over it
*/

/**
 * A string containing the name of a Cascading Style Sheet style created by [CSS Style Creator]{@link tf.styles.CSSStyleCreator} 
 * or one of the pre-defined class names provided by [Styles]{@link tf.styles.Styles}. CSSStyleNames can be assigned to the <b>class</b> attribute of an [HTMLElement]{@link HTMLElement}
 * either directly or using the function [AddCSSClass]{@link tf.dom.AddCSSClass}
 * @public
 * @typedef {string} tf.types.CSSStyleName
 */

/**
 * A single CSS Style statement, a component part of [CSS Style Specs]{@link tf.types.CSSStyleSpecs}. Examples: backgroundColor: "#f0f", or, textAlign: "left"
 * @public
 * @typedef {object} tf.types.CSSStyleStatement
 * @property {string} propertyName - the string value of a camelized <b>propertyName</b> is assigned to the corresponding unCamelized <b>propertyname</b>, if it is a known HTML css style property
*/

/**
 * CSS Style definitions, used by [CSS Style Creator]{@link tf.styles.CSSStyleCreator}, [Sub Styles]{@link tf.styles.SubStyles}, and [Styles]{@link tf.styles.Styles}
 * @public
 * @typedef {object} tf.types.CSSStyleSpecs
 * @property {tf.types.CSSStyleName} styleName - the name of the style being created, a mandatory property
 * @property {tf.types.CSSStyleSpecs|enumerable<tf.types.CSSStyleSpecs>} inherits - an optional property implementing style inheritance
 * @property {...tf.types.CSSStyleStatement} statements - zero or more style statements
 * @example
 * // creates a style specification for background color
 * var backgroundSpecs = { backgroundColor: "#707" };
 * // creates a style specification for text color
 * var textColorSpecs = { color: "#42f831" };
 * // creates a style specification for font size
 * var fontSizeSpecs = { fontSize: "1em" };
 * // creates a style specification combining previously defined specifications and adding a new one
 * var textSpecs = { inherits: [textColorSpecs, fontSizeSpecs], fontWeight: "500" };
 * // creates a style specification combining inherited specifications, and specifying a styleName
 * var containerSpecs = { styleName: "myContainerClass", inherits: [textSpecs, backgroundSpecs], border: "1px solid #000" };
*/

/**
 * @public
 * @class
 * @summary The {@link singleton} instance of this class, obtainable by calling {@link tf.GetStyles}().[GetStyleCreator]{@link tf.styles.Styles#GetStyleCreator}(),
 * implements programmatic / run time creation of global CSS classes and application of custom CSS styles to individual {@link HTMLElementLike} instances
 * @param {tf.styles.Styles} styles - the {@link singleton} [Styles]{@link tf.styles.Styles} instance
 */
tf.styles.CSSStyleCreator = function (styles) {

    var theThis, hasHead, head, allRules, styleSheetForNewStyles, styleSheetForNewStylesRules;

    /**
     * @public
     * @function
     * @summary - Creates a new CSS style based on the given specifications
     * @param {tf.types.CSSStyleSpecs} cssStyleSpecs - the given specifications
     * @returns {void} - | {@link void} no return value
    */
    this.CreateStyle = function (cssStyleSpecs) { return createStyle(cssStyleSpecs); }

    /**
     * @public
     * @function
     * @summary - Creates an arbitrary number of new CSS styles based on the given specifications
     * @param {enumerable<tf.types.CSSStyleSpecs>} cssStyleSpecs - an enumerable of specifications
     * @returns {void} - | {@link void} no return value
    */
    this.CreateStyles = function (cssStyleSpecs) { return createStyles(cssStyleSpecs); }

    /**
     * @public
     * @function
     * @summary - Creates a new CSS style with the given name based on the given raw style string
     * @param {tf.types.CSSStyleName} styleName - the style name
     * @param {string } styleStr - a style specification in CSS file syntax
     * @returns {void} - | {@link void} no return value
    */
    this.CreateRawStyle = function (styleName, styleStr) { return createRawStyle(styleName, styleStr); }

    /**
     * @public
     * @function
     * @summary - Applies the given style specifications to the given element
     * @param {HTMLElementLike} elem - the given element
     * @param {tf.types.CSSStyleSpecs} cssStyleSpecs - the given specifications
     * @returns {void} - | {@link void} no return value
    */
    this.ApplyStyleProperties = function (elem, style) { return applyStyleProperties(elem, style); }

    /**
     * @private
     * @function
     * @summary - Debugging mechanism used internally by the API
     * @returns {void} - | {@link void} no return value
    */
    this.LogStyles = function () { return logStyles(); }

    function applyStyleProperties(elem, style) {
        var prop;
        if (elem = tf.dom.GetHTMLElementFrom(elem)) {
            for (var property in style) {
                if (style.hasOwnProperty(property)) {
                    if (property != 'styleName') {
                        if (property == 'inherits') {
                            if (typeof (prop = style[property]) === "object") {
                                if (prop.length) { for (var p in prop) { if (prop.hasOwnProperty(p)) { applyStyleProperties(elem, prop[p]); } } }
                                else { applyStyleProperties(elem, prop) }
                            }
                        }
                        else switch (property) {
                            case "tf-shadow":
                                var shadowData = style[property];
                                if (tf.js.GetIsArrayWithMinLength(shadowData, 4)) {
                                    applyStyleProperties(elem, styles.GetSubStyles().CreateShadowStyle(shadowData[0], shadowData[1], shadowData[2], shadowData[3]));
                                }
                                break;
                            default:
                                elem.style[property] = style[property];
                                break;
                        }
                    }
                }
            }
        }
    }

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
                            var shadowData = style[property];
                            if (tf.js.GetIsArrayWithMinLength(shadowData, 4)) {
                                styleStr = addStyleProperties(styles.GetSubStyles().CreateShadowStyle(shadowData[0], shadowData[1], shadowData[2], shadowData[3]), styleStr);
                            }
                            break;
                        default:
                            prop = style[property]; property = tf.js.UnCamelize(property); styleStr += property + ' : ' + prop + '; ';
                            break;
                    }
                }
            }
        }
        return styleStr;
    }

    function createStyles(styleArray) {
        if (tf.js.GetIsValidObject(styleArray)) { for (var i in styleArray) { createStyle(styleArray[i]); } }
    }

    function createStyle(style) {
        if (tf.js.GetIsValidObject(style) && tf.js.GetIsNonEmptyString(style.styleName)) {
            var styleStr = '';
            createRawStyle(style.styleName, addStyleProperties(style, styleStr));
        }
    }

    function getStyleSheetRules(styleSheet) {
        var rules = null;
        if (!!styleSheet) {
            try {
                var mediaType = typeof styleSheet.media;
                rules = mediaType == "string" ? styleSheet.rules : (mediaType == "object" ? styleSheet.cssRules : null);

                if (!rules) {
                    if (!!styleSheet.sheet && !!styleSheet.sheet.cssRules) {
                        rules = styleSheet.sheet.cssRules;
                    }
                }
            } catch (e) { rules = null; }
        }
        return rules;
    }

    function getLastAvailableStyleSheet() {
        var styleSheet = null, rules = null, styleSheets = document.styleSheets, nStyleSheets = !!styleSheets ? styleSheets.length : 0;

        if (nStyleSheets > 0) {
            for (var i = nStyleSheets - 1; i >= 0 && !styleSheet ; --i) {
                var thisStyleSheet = styleSheets[i];

                try {
                    if (!thisStyleSheet.disabled) {
                        var media = thisStyleSheet.media;
                        var mediaType = typeof media;
                        var mediaText = mediaType == "string" ? media : (mediaType == "object" ? media.mediaText : null);

                        if (mediaText == "" || (mediaText.indexOf("screen") != -1) || (mediaText.indexOf("all") != -1)) {
                            if (!(rules = getStyleSheetRules(styleSheet = thisStyleSheet))) { styleSheet = null; }
                        }
                    }
                }
                catch (exception){
                    //console.log(exception);
                }
            }
        }
        return { styleSheet: styleSheet, rules: rules };
    }

    function createNewStyleSheet() {
        var styleSheet = null, rules = null;

        if (hasHead) {
            var styleElem;

            if (styleElem = document.createElement("style")) {
                styleElem.type = "text/css"; head[0].appendChild(styleElem);
                if (styleElem.sheet != undefined) {
                    styleSheet = styleElem.sheet;
                }
                else if (styleElem.styleSheet != undefined) {
                    styleSheet = styleElem.styleSheet;
                }
                if (!!styleSheet) {
                    if (!(rules = getStyleSheetRules(styleSheet))) { styleSheet = null; }
                }
            }
        }

        return { styleSheet: styleSheet, rules: rules };
    }

    function getLastOrCreateNewStyleSheet() {
        var lastAvailableStyleSheet = getLastAvailableStyleSheet();

        if (!lastAvailableStyleSheet.styleSheet) { lastAvailableStyleSheet = createNewStyleSheet(); }

        styleSheetForNewStyles = lastAvailableStyleSheet.styleSheet;
        styleSheetForNewStylesRules = lastAvailableStyleSheet.rules;
    }

    function createRawStyle(selector, style) {
        if (typeof selector === "string" && selector.length > 0 && typeof style === "string" && style.length > 0) {
            var lowerCaseSelector = selector.toLowerCase(), existingRule = allRules[lowerCaseSelector];

            if (!!existingRule) {
                try {
                    existingRule.style.cssText = style;
                }
                catch (exception) {
                    //tf.GetDebug().LogIfTest("css exception (change existing rule)" + selector + " " + exception);
                }
            }
            else if (!!styleSheetForNewStylesRules) {
                try {
                    var nRules = styleSheetForNewStylesRules.length;

                    if (typeof styleSheetForNewStyles.insertRule === "function") {
                        styleSheetForNewStyles.insertRule(selector + "{" + style + "}", nRules);
                    }
                    else {
                        styleSheetForNewStyles.addRule(selector, style);
                    }
                    allRules[lowerCaseSelector] = styleSheetForNewStylesRules[nRules];
                }
                catch (exception) {
                    //tf.GetDebug().LogIfTest("css exception (insert new rule)" + selector + " " + exception);
                }
            }
        }
    }

    function loadAllRules() {
        var styleSheets = document.styleSheets, nStyleSheets = !!styleSheets ? styleSheets.length : 0;

        allRules = [];

        if (nStyleSheets > 0) {
            for (var styleSheet in styleSheets) {
                if (styleSheets.hasOwnProperty(styleSheet)) {
                    var thisStyleSheet = styleSheets[styleSheet];

                    if (!thisStyleSheet.disabled) {
                        try {
                            var rules = getStyleSheetRules(thisStyleSheet);

                            if (!!rules) {
                                for (var rule in rules) {
                                    if (rules.hasOwnProperty(rule)) {
                                        var thisRule = rules[rule];

                                        if (thisRule.selectorText) { allRules[thisRule.selectorText.toLowerCase()] = thisRule; }
                                        else {
                                            // @ something
                                        }
                                    }
                                }
                            }
                        }
                        catch (exception) {
                        }
                    }
                }
            }
        }
    }

    function logStyles() {
        var styleSheets = document.styleSheets, nStyleSheets = !!styleSheets ? styleSheets.length : 0;

        if (nStyleSheets > 0) {
            var logStr = '';
            for (var styleSheet in styleSheets) {
                if (styleSheets.hasOwnProperty(styleSheet)) {
                    var thisStyleSheet = styleSheets[styleSheet];

                    if (!thisStyleSheet.disabled) {
                        var rules = getStyleSheetRules(thisStyleSheet);
                        var nRules = rules ? rules.length : 0;

                        for (var rule in rules) {
                            if (rules.hasOwnProperty(rule)) {
                                var thisRule = rules[rule];
                                logStr += thisRule.cssText;
                            }
                        }
                    }
                }
            }
            tf.GetDebug().SaveAsTextFile("stylesheets", logStr);
        }
    }

    function initialize() {
        head = document.getElementsByTagName("head");
        hasHead = head && head.length > 0;
        loadAllRules();
        getLastOrCreateNewStyleSheet();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.styles.CreateCSSClasses = function (cssClasses) {
    if (tf.js.GetIsValidObject(cssClasses)) {
        var styles = tf.GetStyles(), styleCreator = styles.GetStyleCreator(), cssStyles = [];
        for (var i in cssClasses) { var cssStr = cssClasses[i], cssName = '.' + i; cssStyles.push({ styleName: cssName, inherits: cssStr }); }
        styleCreator.CreateStyles(cssStyles);
    }
};

tf.styles.AddRangeClasses = function (addRangeSettings) {
    var className = addRangeSettings.className;
    var cssClassesUse = addRangeSettings.cssClasses;
    cssClassesUse[className] = {};
    cssClassesUse[className + " input[type=range]"] = { "-webkit-appearance": "none", inherits: [addRangeSettings.rangeSettings] };
    cssClassesUse[className + " input[type=range]::-ms-tooltip"] = { display: "none" };
    cssClassesUse[className + " input[type=range]:focus"] = { outline: "none" };
    cssClassesUse[className + " input[type=range]::-ms-track"] = { inherits: [addRangeSettings.trackSettings] };
    cssClassesUse[className + " input[type=range]::-moz-range-track"] = { inherits: [addRangeSettings.trackSettings] };
    cssClassesUse[className + " input[type=range]::-webkit-slider-runnable-track"] = { inherits: [addRangeSettings.trackSettings] };
    cssClassesUse[className + " input[type=range]::-moz-range-thumb"] = { inherits: [addRangeSettings.thumbSettings] };
    cssClassesUse[className + " input[type=range]::-ms-thumb"] = { inherits: [addRangeSettings.thumbSettings] };
    cssClassesUse[className + " input[type=range]::-webkit-slider-thumb"] = {
        inherits: [addRangeSettings.thumbSettings], "-webkit-appearance": "none", marginTop: 2 - (addRangeSettings.thumbHeightInt + addRangeSettings.thumbBorderInt) / 2 + "px"
    };
};
