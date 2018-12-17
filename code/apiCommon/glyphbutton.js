"use strict";

/**
 * CSS Style specification of an [SVG Glyph]{@link tf.ui.SvgGlyph} instance. May be set to a [CSS Style Name]{@link tf.types.CSSStyleName} created
 * with the function [CreateSvgGlyphClasses]{@link tf.styles.Styles#CreateSvgGlyphClasses}, or to a {@link boolean} value, in which case
 * a <b>true</b> value selects the API's default <b>light</b> style settings, otherwise the default <b>dark</b> style settings are used
 * @public
 * @typedef {boolean|tf.types.CSSStyleName} tf.types.SvgGlyphStyle
 */

/**
 * Glyph specification of an [SVG Glyph]{@link tf.ui.SvgGlyph} instance. Can be either a [Custom Glyph Specification]{@link tf.types.SVGGlyphSpecs} 
 * or a [Pre-defined SVG glyph name]{@link tf.types.PredefinedSVGGlyphName}
 * @public
 * @typedef {tf.types.SVGGlyphSpecs|tf.types.PredefinedSVGGlyphName} tf.types.SvgGlyphGlyph
 */

/**
 * An object used in the creation of [SVG Glyph]{@link tf.ui.SvgGlyph} instances
 * @public
 * @typedef {object} tf.types.SvgGlyphBtnSettings
 * @property {tf.types.SvgGlyphStyle} style - the given style
 * @property {tf.types.SvgGlyphGlyph} glyph - the given glyph
 * @property {boolean} noChangeOnHover -  if set to <b>true</b> prevents the glyph from changing style when 
 * hovered by the mouse pointer. Valid only when <b>svgGlyphStyle</b> is {@link boolean}, otherwise ignored, defaults to {@link void}
 */

/**
 * @public
 * @class
 * @summary - SVG Glyph is an [Insertable]{@link tf.dom.Insertable} implementing the <b>'svg'</b> HTML element
 * @param {tf.types.SvgGlyphBtnSettings} settings - creation settings
 * @extends {tf.dom.Insertable}
*/
tf.ui.SvgGlyph = function (settings) {

    var svgNS, styles, theThis, svgLightClass, svgDarkClass, style, svg, g, paths;

    /**
     * @public
     * @function
     * @summary - Retrieves this instance's style
     * @returns {tf.types.SvgGlyphStyle} - | {@link tf.types.SvgGlyphStyle} the style
    */
    this.GetStyle = function () { return style; }

    /**
     * @public
     * @function
     * @summary - Sets this instance's style to the given style
     * @param {tf.types.SvgGlyphStyle} style - the given style
     * @returns {void} - | {@link void} no return value
    */
    this.SetStyle = function (style) { return setStyle(style); }

    /**
     * @public
     * @function
     * @summary - Sets this instance's glyph to the given glyph
     * @param {tf.types.SvgGlyphGlyph} glyph - the given glyph
     * @returns {void} - | {@link void} no return value
    */
    this.ChangeGlyph = function (glyph) { clearPaths(); addPaths(glyph); }

    function clearPaths() { var nPaths = paths.length; if (nPaths) { for (var i in paths) { g.removeChild(paths[i]); } paths = []; } }

    function addPathStr(oneglyph) {
        if (tf.js.GetIsValidObject(oneglyph) && oneglyph.d) {
            var path = document.createElementNS(svgNS, 'path');
            var d = oneglyph.d;
            var style = oneglyph.style;
            var fill = oneglyph.fill;

            path.setAttributeNS(null, 'd', d);
            if (style) { path.setAttributeNS(null, 'style', style); }
            if (fill) { path.setAttributeNS(null, 'fill', fill); }
            paths.push(path);
            g.appendChild(path);
        }
    }

    function addPaths(glyphSet) {
        if (tf.js.GetIsString(glyphSet)) { glyphSet = tf.ui.GetSvgGlyphLib().GetGlyphByName(glyphSet); }
        if (tf.js.GetIsValidObject(glyphSet) && glyphSet.W && glyphSet.H) {
            svg.setAttributeNS(null, 'viewBox', '0 0 ' + glyphSet.W + ' ' + glyphSet.H);
            var paths = glyphSet.paths;
            for (var i in paths) { addPathStr(paths[i]); }
        } else { addPathStr(glyphSet); }
    }

    function setStyle(styleSet) {
        if (tf.js.GetIsNonEmptyString(styleSet)) { svg.setAttributeNS(null, 'class', style = styleSet); }
        else { style = !!styleSet; svg.setAttributeNS(null, 'class', style ? svgLightClass : svgDarkClass); }
    }

    function createSvgAndG() {
        var paddingDim = tf.js.GetNonEmptyString(settings.paddingDim, "0px"), maxDim = "calc(100% - " + paddingDim + " - " + paddingDim + ")";
        svg = document.createElementNS(svgNS, "svg");
        svg.setAttributeNS(null, 'width', maxDim);
        svg.setAttributeNS(null, 'height', maxDim);
        svg.style.border = svg.style.caption = svg.style.margin = "0px";
        svg.style.padding = paddingDim;
        //svg.style.display = 'inline-block';
        svg.style.display = 'block'; // setting to block breaks the vertical positioning of "closeXButtons"
        setStyle(settings.style);
        svg.appendChild(g = document.createElementNS(svgNS, 'g'));
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        svgNS = "http://www.w3.org/2000/svg";
        styles = tf.GetStyles();
        paths = [];
        var makeIconBool = tf.js.GetBoolFromValue(settings.noChangeOnHover, false);
        svgLightClass = makeIconBool ? styles.svgGlyphLightNoHoverStyleClass : styles.svgGlyphLightStyleClass;
        svgDarkClass = makeIconBool ? styles.svgGlyphDarkNoHoverStyleClass : styles.svgGlyphDarkStyleClass;
        createSvgAndG();
        addPaths(settings.glyph);
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: svg });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.ui.SvgGlyph, tf.dom.Insertable);

/**
 * An object used in the creation of [SVG Glyph Button]{@link tf.ui.SvgGlyphBtn} instances
 * @public
 * @typedef {object} tf.types.SvgGlyphBtnSettings
 * @property {tf.types.SvgGlyphStyle} style - the given style
 * @property {tf.types.SvgGlyphGlyph} glyph - the given glyph
 * @property {boolean} noChangeOnHover -  if set to <b>true</b> prevents the glyph from changing style when 
 * hovered by the mouse pointer. Valid only when <b>svgGlyphStyle</b> is {@link boolean}, otherwise ignored, defaults to {@link void}
 * @property {HTMLElementSizeOrPxNumber} dim - the button's dimensions
 * @property {tf.types.MultiDOMEventListenerCallBack} onClick - sets a [Click Listener]{@link tf.events.DOMClickListener} for the button
 * @property {string} tooltip - tool tip text
 */

/**
 * @public
 * @class
 * @summary - SVG Glyph Button is an [Insertable]{@link tf.dom.Insertable} containing an [SVG Glyph]{@link tf.ui.SvgGlyph} instance and implementing a user interface button
 * @param {tf.types.SvgGlyphBtnSettings} settings - creation settings
 * @extends {tf.dom.Insertable}
*/
tf.ui.SvgGlyphBtn = function (settings) {

    var theThis, defaultDim, divObj, div, svg, onclickCallBack;

    /**
     * @public
     * @function
     * @summary - Retrieves the style of the associated [SVG Glyph]{@link tf.ui.SvgGlyph} instance
     * @returns {tf.types.SvgGlyphStyle} - | {@link tf.types.SvgGlyphStyle} the style
    */
    this.GetStyle = function () { return svg ? svg.GetStyle() : null; }

    /**
     * @public
     * @function
     * @summary - Sets the style of the associated [SVG Glyph]{@link tf.ui.SvgGlyph} instance to the given style
     * @param {tf.types.SvgGlyphStyle} style - the given style
     * @returns {void} - | {@link void} no return value
    */
    this.SetStyle = function (style) { if (!!svg) { svg.SetStyle(style); } }

    /**
     * @public
     * @function
     * @summary - Changes the glyph of the associated [SVG Glyph]{@link tf.ui.SvgGlyph} instance to the given glyph
     * @param {tf.types.SvgGlyphGlyph} glyph - the given glyph
     * @returns {void} - | {@link void} no return value
    */
    this.ChangeGlyph = function (glyph) { if (!!svg) { svg.ChangeGlyph(glyph); } }

    /**
     * @public
     * @function
     * @summary - Changes the tooltip text of this SVG Glyph Button instance to the given text
     * @param {string} tooltip - the given text
     * @returns {void} - | {@link void} no return value
    */
    this.ChangeToolTip = function (tooltip) { return changeToolTip(tooltip); }

    this.SetSize = function (dim) { return setSize(dim); }

    function changeToolTip(toolTipStr) {
        if (tf.js.GetIsNonEmptyString(toolTipStr)) { div.title = toolTipStr; }
        else { if (div.title !== undefined) { delete div.title; } }
    }

    function onClickHandler(notification) {
        tf.events.StopDOMEvent(notification.event);
        if (!!onclickCallBack) { onclickCallBack.call(null, notification); }
        return false;
    }

    function setSize(dim) {
        dim = tf.js.GetDimFromStrOrPxNumber(dim, defaultDim);
        div.style.width = div.style.height = dim;
    }

    function setCallBack(callBackSet) { onclickCallBack = tf.js.GetFunctionOrNull(callBackSet); }

    function initialize() {
        settings = tf.js.GetIsValidObject(settings) ? settings : {};
        defaultDim = "1em";
        divObj = new tf.dom.Div({ cssClass: tf.GetStyles().divSvgGlyphBtnClass });
        div = divObj.GetHTMLElement();
        setSize(settings.dim);
        setCallBack(settings.onClick);
        new tf.events.DOMClickListener({ target: div, callBack: onClickHandler, optionalScope: theThis, callBackSettings: null });
        svg = new tf.ui.SvgGlyph(settings);
        changeToolTip(settings.tooltip);
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: divObj });
        divObj.AddContent(svg);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.ui.SvgGlyphBtn, tf.dom.Insertable);

/**
 * An object used in the creation of [SVG Glyph Button]{@link tf.ui.SvgGlyphToggleBtn} instances
 * @public
 * @typedef {object} tf.types.SvgGlyphToggleBtnSettings
 * @property {tf.types.SvgGlyphStyle} style - the given style
 * @property {tf.types.SvgGlyphGlyph} glyph - the given glyph
 * @property {tf.types.SvgGlyphGlyph} toggledGlyph - the given toggled glyph
 * @property {boolean} noChangeOnHover -  if set to <b>true</b> prevents the glyph from changing style when 
 * hovered by the mouse pointer. Valid only when <b>svgGlyphStyle</b> is {@link boolean}, otherwise ignored, defaults to {@link void}
 * @property {HTMLElementSizeOrPxNumber} dim - the button's dimensions
 * @property {tf.types.MultiDOMEventListenerCallBack} onClick - sets a [Click Listener]{@link tf.events.DOMClickListener} for the button
 * @property {string} tooltip - tool tip text
 * @property {string} toggledTooltip - toggled tool tip text
 * @property {boolean} isToggled -  sets the initial toggled state of the button
 */

/**
 * @public
 * @class
 * @summary - SVG Glyph Toggle Button is an [Insertable]{@link tf.dom.Insertable} containing an [SVG Glyph Button]{@link tf.ui.SvgGlyphBtn} instance
 * that automatically changes its glyph and tooltip in response to [Click]{@link tf.consts.DOMEventNamesClick} events
 * @param {tf.types.SvgGlyphToggleBtnSettings} settings - creation settings
 * @extends {tf.dom.Insertable}
*/
tf.ui.SvgGlyphToggleBtn = function (settings) {

    var theThis, theButton, isToggled, onclickCallBack, glyph, toolTipStr, toggledGlyph, toggledToolTipStr;

    /**
     * @public
     * @function
     * @summary - Sets the toggled state of this SVG Glyph Toggle Button instance to the given state
     * @param {boolean} isToggled - <b>true</b> for toggled state, <b>false</b> for normal state
     * @returns {void} - | {@link void} no return value
    */
    this.SetIsToggled = function (isToggled) { return setIsToggled(isToggled); }

    /**
     * @public
     * @function
     * @summary - Retrieves the toggled state of this SVG Glyph Toggle Button instance
     * @returns {boolean} - | {@link boolean} <b>true</b> if in toggled state, <b>false</b> if in normal state
    */
    this.GetIsToggled = function () { return getIsToggled(); }

    /**
     * @public
     * @function
     * @summary - Toggles the toggled state of this SVG Glyph Toggle Button instance
     * @returns {void} - | {@link void} no return value
    */
    this.ToggleToggled = function () { return toggleToggled(); }

    /**
     * @public
     * @function
     * @summary - Retrieves the style of the associated [SVG Glyph Button]{@link tf.ui.SvgGlyphBtn} instance
     * @returns {tf.types.SvgGlyphStyle} - | {@link tf.types.SvgGlyphStyle} the style
    */
    this.GetStyle = function () { return theButton.GetStyle(); }

    /**
     * @public
     * @function
     * @summary - Sets the style of the associated [SVG Glyph Button]{@link tf.ui.SvgGlyphBtn} instance to the given style
     * @param {tf.types.SvgGlyphStyle} style - the given style
     * @returns {void} - | {@link void} no return value
    */
    this.SetStyle = function (style) { return theButton.SetStyle(style); }

    function changeImage() {
        if (isToggled) { theButton.ChangeToolTip(toggledToolTipStr); theButton.ChangeGlyph(toggledGlyph); }
        else { theButton.ChangeToolTip(toolTipStr); theButton.ChangeGlyph(glyph); }
    }

    function setIsToggled(isToggledSet) { if ((isToggledSet = !!isToggledSet) != isToggled) { isToggled = isToggledSet; changeImage(); } }
    function getIsToggled() { return isToggled; }
    function toggleToggled() { setIsToggled(!getIsToggled()); }

    function myOnClickCallBack(notification) { toggleToggled(); return (!!onclickCallBack) ? onclickCallBack(notification) : false; }

    function initialize() {

        settings = tf.js.GetValidObjectFrom(settings);

        isToggled = tf.js.GetBoolFromValue(settings.isToggled, false);
        onclickCallBack = tf.js.GetFunctionOrNull(settings.onClick);
        glyph = settings.glyph;
        toggledGlyph = settings.toggledGlyph;
        toolTipStr = settings.tooltip;
        toggledToolTipStr = settings.toggledTooltip;

        theButton = new tf.ui.SvgGlyphBtn({
            paddingDim: settings.paddingDim,
            style: settings.style,
            glyph: isToggled ? toggledGlyph : glyph,
            onClick: myOnClickCallBack,
            tooltip: isToggled ? toggledToolTipStr : toolTipStr,
            dim: settings.dim });
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: theButton });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.ui.SvgGlyphToggleBtn, tf.dom.Insertable);

/**
 * An object used in the creation of [Click Open Close]{@link tf.ui.ClickOpenClose} instances
 * @public
 * @typedef {object} tf.types.ClickOpenCloseSettings
 * @property {tf.types.SvgGlyphStyle} style - the given style
 * @property {HTMLElementSizeOrPxNumber} dim - the button's dimensions
 * @property {tf.types.MultiDOMEventListenerCallBack} onClick - sets a [Click Listener]{@link tf.events.DOMClickListener} for the button
 * @property {boolean} isOpen -  sets the initial open state of the button
 * @property {HTMLElementLike} divOpenClose - container whose visibility state will be toggled by the button
 */

/**
 * @public
 * @class
 * @summary - Click Open Close is an [Insertable]{@link tf.dom.Insertable} containing an [SVG Glyph Toggle Button]{@link tf.ui.SvgGlyphToggleBtn} instance
 * that automatically changes its image and tooltip in response to [Click]{@link tf.consts.DOMEventNamesClick} events, and also 
 * controls the visibility state of a given HTML container
 * @param {tf.types.ClickOpenCloseSettings} settings - creation settings
 * @extends {tf.dom.Insertable}
*/
tf.ui.ClickOpenClose = function (settings) {

    var theThis, button, divOpenClose, callBack;

    /**
     * @public
     * @function
     * @summary - Sets a container whose visibility state will be controlled by the button, 
     * and optionally modifies the [Click Listener]{@link tf.events.DOMClickListener} for the button
     * @param {HTMLElementLike} divOpenClose - the HTML container
     * @param {tf.types.MultiDOMEventListenerCallBack} callBack - if defined, sets the new listener, can be set to null to remove a previously set listener
     * @returns {void} - | {@link void} no return value
    */
    this.SetDivOpenClose = function (divOpenClose, callBack) { return setDivOpenClose(divOpenClose, callBack) }

    /**
     * @public
     * @function
     * @summary - Sets the open state of this Click Open Close instance to the given state
     * @param {boolean} isOpen - <b>true</b> for open state, <b>false</b> for close state
     * @returns {void} - | {@link void} no return value
    */
    this.SetIsOpen = function (isOpen) { button.SetIsToggled(isOpen); checkOpenClose(); }

    /**
     * @public
     * @function
     * @summary - Retrieves the open state of this Click Open Close instance
     * @returns {boolean} - | {@link boolean} <b>true</b> if in open state, <b>false</b> if in close state
    */
    this.GetIsOpen = function () { return button.GetIsToggled(); }

    /**
     * @public
     * @function
     * @summary - Toggles the open / close state of this Click Open Close instance
     * @returns {void} - | {@link void} no return value
    */
    this.Toggle = function () { button.Toggle(); checkOpenClose(); }

    function checkOpenClose(notification) {
        if (!!divOpenClose) {
            divOpenClose.style.display = button.GetIsToggled() ? 'block' : 'none';
            if (!!callBack) { callBack.call(null, notification); }
        }
    }

    function setDivOpenClose (divOpenCloseSet, callBackSet) {
        divOpenClose = tf.dom.GetHTMLElementFrom(divOpenCloseSet);
        if (callBackSet !== undefined) { callBack = tf.js.GetFunctionOrNull(callBackSet); }
    }

    function myOnClickCallBack(notification) { checkOpenClose(notification); return false; }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);

        setDivOpenClose(settings.divOpenClose, settings.onClick);
        button = new tf.ui.SvgGlyphToggleBtn({
            style: settings.style, onClick: myOnClickCallBack, dim: settings.dim, isToggled: settings.isOpen,
            glyph: tf.styles.SvgGlyphTriangleRightName, tooltip: "Open", toggledGlyph: tf.styles.SvgGlyphTriangleDownName, toggledTooltip: "Close"
        });
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: button });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.ui.ClickOpenClose, tf.dom.Insertable);
