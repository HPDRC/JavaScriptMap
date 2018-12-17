"use strict";


/**
 * An icon anchor are horizontal and vertical offset factors of the icon's width and height, respectivelly and in that order, used to displace 
 * the icon from the feature's point coordinates: [0.5, 0.5] places the icon centered at the point coordinates, [0.5, 1.0] places the icon centered horizontally and
 * above the map coordinates, [0.0, 0.0] places the icon to the left and below the map coordinates, etc.
 * @public
 * @typedef {array<number,number>} tf.types.iconAnchor
*/

/**
 * A callback function that, upon request, returns an instance of [Map Feature Style]{@link tf.map.FeatureStyle} to be used with the given map feature
 * @public
 * @callback tf.types.MapFeatureStyleFunction
 * @param {tf.map.Feature|tf.map.KeyedFeature} mapFeature - the feature for which a style is requested
 * @returns {tf.map.FeatureStyle} - | {@link tf.map.FeatureStyle} the instance
 */

/**
 * A type accepted by many API functions and is either an instance of [Map Feature Style]{@link tf.map.FeatureStyle}, 
 * a [Map Feature Style Settings]{@link tf.types.MapFeatureStyleSettings} object, an array of [Map Feature Style Settings]{@link tf.types.MapFeatureStyleSettings},
 * of a function that returns an instance of [Map Feature Style]{@link tf.map.FeatureStyle}
 * @public
 * @typedef {tf.types.MapFeatureStyleSettings|array<tf.types.MapFeatureStyleSettings>|tf.types.MapFeatureStyleFunction} tf.types.MapFeatureStyleLike
*/

/**
 * An {@link object} with a Map feature style property and a Map feature style hover property
 * @public
 * @typedef {object} tf.types.MapFeatureStyleAndHoverStyle
 * @property {tf.types.MapFeatureStyleLike} style - a map feature style
 * @property {tf.types.MapFeatureStyleLike} hoverStyle - a style assumed by a map feature when the mouse pointer is hovering over it
*/

/**
 * An {@link object} whose property name specifies the style name and whose property value is a [Map Feature Style and Hover Style]{@link tf.types.MapFeatureStyleAndHoverStyle}
 * @public
 * @typedef {object} tf.types.NamedMapFeatureStyleAndHoverStyles
*/

/**
 * An {@link object} used in the creation of [Keyed Features]{@link tf.map.KeyedFeature} and [Map Features with Named Styles]{@link tf.map.FeatureWithNamedStyles}.
 * Specifies either a single default style/hoverStyle pair using the properties <b>style</b> and <b>hoverStyle</b>, or an enumerable of named style/hoverStyle pairs
 * @public
 * @typedef {object} tf.types.NamedFeatureStyleSettings
 * @property {enmumerable<tf.types.NamedMapFeatureStyleAndHoverStyles>} styles - an enumerable of named styles, if not defined <b>style</b> and <b>hoverStyle</b> are mandatory, 
 * and used to create a feature with the default style name ({@link tf.consts.defaultMapFeatureStyleName}). When defined, if none of the named styles is
 * named {@link tf.consts.defaultMapFeatureStyleName}, the first style is used as the default style.
 * @property {tf.types.MapFeatureStyleLike} style - the map feature style, mandatory if <b>styles</b> is not defined
 * @property {tf.types.MapFeatureStyleLike} hoverStyle - the style assumed by the map feature when the mouse pointer is hovering over it, mandatory if <b>styles</b> is not defined
*/

/**
 * @private
 * @function
 * @summary - Returns the given parameter if it is an instance of {@link tf.map.FeatureStyle} or a {@link function}, otherwise 
 * creates and returns a new instance of {@link tf.map.FeatureStyle} initialized with the given parameter. Used internally by the API
 * @param {tf.types.MapFeatureStyleLike} fromFeatureStyleSettingsObjectOrFunction - the given parameter
 * @returns {tf.types.MapFeatureStyleLike} - | {@link tf.types.MapFeatureStyleLike} the instance
*/
tf.map.GetOrCreateFeatureStyle = function (fromFeatureStyleSettingsObjectOrFunction) {
    var featureStyle, featureStyleSettings;

    if (!!fromFeatureStyleSettingsObjectOrFunction) {
        if ((fromFeatureStyleSettingsObjectOrFunction instanceof tf.map.FeatureStyle) || tf.js.GetFunctionOrNull(fromFeatureStyleSettingsObjectOrFunction)) {
            featureStyle = fromFeatureStyleSettingsObjectOrFunction;
        }
        else if (tf.js.GetIsValidObject(fromFeatureStyleSettingsObjectOrFunction)) { featureStyleSettings = fromFeatureStyleSettingsObjectOrFunction; }
    }

    if (!featureStyle) { featureStyle = new tf.map.FeatureStyle(featureStyleSettings); }

    return featureStyle;
}

/**
 * An object whose properties specify the visual attributes used to display [Map Features]{@link tf.map.Feature} on the [Map]{@link tf.map.Map}.
 * @public
 * @typedef {object} tf.types.MapFeatureStyleSettings
 *
 * @property {boolean} circle - Used with [point geometries]{@link tf.types.GeoJSONGeometryType} to display a circle at the point coordinates. Mutually exclusive
 * with other <b>point</b> styles. Uses the properties <b>circle_radius</b>, and the properties related to <b>line</b>, and <b>fill</b>
 *
 * @property {boolean} icon - Used with [point geometries]{@link tf.types.GeoJSONGeometryType} to display an image at the point coordinates. Mutually exclusive
 * with other <b>point</b> styles. Uses the property <b>icon_anchor</b> and either <b>icon_url</b>, or both <b>icon_img</b> and <b>icon_size</b>
 *
 * @property {boolean} marker - Used with [point geometries]{@link tf.types.GeoJSONGeometryType} to display a text bubble (a marker) pointing to the feature's coordinates. Mutually exclusive
 * with other <b>point</b> styles. Uses the properties <b>label</b> (the text), <b>font</b>, <b>font_height</b>, <b>font_color</b>, <b>font_opacity</b>, <b>border_color</b>, <b>border_opacity</b>,
 * <b>border_width</b>, <b>marker_color</b>, <b>marker_opacity</b>, and properties related to <b>line</b> (for optinal text stroke)
 *
 * @property {boolean} shape - Used with [point geometries]{@link tf.types.GeoJSONGeometryType} to display the shape of a regular polygon or a star at the point coordinates. Mutually exclusive
 * with other <b>point</b> styles. Controls shape settings with the properties <b>shape_points</b> and either the property <b>shape_radius</b>, or both <b>shape_radius1</b> and <b>shape_radius2</b>.
 * Uses the properties related with <b>line</b> and <b>fill</b>
 *
 * @property {boolean} text - Used with [point geometries]{@link tf.types.GeoJSONGeometryType} to display text at or near the point coordinates. Mutually exclusive
 * with other <b>point</b> styles. Uses the properties <b>label</b> (the text), <b>font</b>, <b>text_offsetx</b>, <b>text_offsety</b>, <b>text_align</b>, <b>text_baseline</b>,
 * and the properties related with <b>line</b> and <b>fill</b> for text stroke and fill respectivelly
 *
 * @property {boolean} round_rect - Used with [point geometries]{@link tf.types.GeoJSONGeometryType} to display a rectangle with rounded corners at or near the point coordinates. Mutually exclusive
 * with other <b>point</b> styles. Uses the properties <b>round_rect_width</b>, <b>round_rect_height</b>, <b>round_rect_radius</b>, and the properties related with <b>line</b> 
 * and <b>fill</b>
 *
 * @property {boolean} fill - Used with <b>fill_color</b> and <b>fill_opacity</b> to determine how shapes, circles, texts, and round_rects are filled
 *
 * @property {boolean} line - Used with <b>line_color</b>, <b>line_dash</b>, <b>line_opacity</b>, and <b>line_width</b> to determine how lines in shapes, circles, markers, round_rects,
 * and geometries other than <b>point</b> are drawn
 *
 * @property {number} border_width - In pixels, used with <b>marker<b>
 *
 * @property {number} circle_radius - In pixels, used with <b>circle</b>
 *
 * @property {tf.types.opacity0100} fill_alpha - <b>deprecated</b> Use <b>fill_opacity</b> instead
 *
 * @property {hexColor} fill_color - Used with <b>fill</b>
 *
 * @property {tf.types.opacity0100} fill_opacity - Opacity component for <b>fill_color</b>, used <b>fill</b>
 *
 * @property {tf.types.opacity0100} font_alpha - <b>deprecated</b> Use <b>font_opacity</b> instead
 *
 * @property {hexColor} font_color - Used only in conjunction with both the <b>font</b> property and the <b>marker</b> property
 *
 * @property {tf.types.opacity0100} font_opacity - Opacity component for <b>font_color</b>, used <b>font</b>
 *
 * @property {number} font_height - In pixels, used with <b>font</b> in conjunction with <b>marker</b>
 *
 * @property {string} font - Used with <b>font</b>, may include font size information, except when used in conjunction with <b>marker</b>
 *
 * @property {tf.types.iconAnchor} icon_anchor - Used with <b>icon</b>
 *
 * @property {HTMLElement} icon_img - An HTML img that has been preloaded, used with <b>icon</b>, requires <b>icon_size</b>, and is and mutually exclusive with <b>icon_url</b>
 *
 * @property {tf.types.pixelCoordinates} icon_size - The size of <b>icon_img</b> in pixels, required when using <b>icon_img</b>
 *
 * @property {string} icon_url - The location of an image file used with <b>icon</b> and mutually exclusive with <b>icon_img</b>
 *
 * @property {string} label - Text content used with <b>marker</b> and <b>text</b>
 *
 * @property {tf.types.opacity0100} line_alpha - <b>deprecated</b> Use <b>line_opacity</b> instead
 *
 * @property {string} line_cap - Used with <b>line</b>, one of "butt", "round", or "square", Defaults to "round"
 *
 * @property {hexColor} line_color - Used with <b>line</b>
 *
 * @property {array<number,number>} line_dash - Used with <b>line</b> to create a dashed line style instead of a solid style
 *
 * @property {string} line_join - Used with <b>line</b>, one of "bevel", "round", or "miter", Defaults to "round"
 *
 * @property {tf.types.opacity0100} line_opacity - Opacity component for <b>line_color</b>
 *
 * @property {number} line_width - Used with <b>line</b>
 *
 * @property {tf.types.opacity0100} marker_alpha - <b>deprecated</b> Use <b>marker_opacity</b> instead
 *
 * @property {number} marker_arrowlength - Used with <b>marker</b> to set the length of the callout arrow
 *
 * @property {hexColor} marker_color - The background color of the text bubble, used with <b>marker</b>
 *
 * @property {tf.types.opacity0100} marker_opacity - Opacity component for <b>marker_color</b>
 *
 * @property {tf.types.horizontalPositioning} marker_horpos - Horizontal positioning for <b>marker</b>, defaults to {@link tf.consts.positioningCenter}
 *
 * @property {tf.types.verticalPositioning} marker_verpos - Vertical positioning for <b>marker</b>, defaults to {@link tf.consts.positioningTop}
 *
 * @property {tf.types.opacity01} opacity - Controls the overall opacity of <b>icon</b>, <b>marker</b>, and <b>round_rect</b> styles
 *
 * @property {boolean} rotate_with_map - Used with [point geometries]{@link tf.types.GeoJSONGeometryType}, if set to <b>true</b> rotates the map feature style with the map, defaults to {@link void}
 *
 * @property {number} rotation_rad - Controls the rotational angle of <b>point</b> styles
 *
 * @property {number} round_rect_width - Used with <b>round_rect</b>
 *
 * @property {number} round_rect_height - Used with <b>round_rect</b>
 *
 * @property {number} round_rect_radius - Used with <b>round_rect</b>
 *
 * @property {number} scale - Controls the scale of <b>icon</b>, <b>marker</b>, and <b>round_rect</b> styles, defaults to 1
 *
 * @property {number} shape_radius - Controls the radius of the <b>shape</b> polygon, mutually exclusive with <b>shape_radius1</b> and <b>shape_radius2</b>
 *
 * @property {number} shape_radius1 - Controls the outer radius of the <b>shape</b> star, mutually exclusive with </b>shape_radius</b>, may be used with <b>shape_radius2</b>
 *
 * @property {number} shape_radius2 - Controls the inner radius of the <b>shape</b> star, mutually exclusive with </b>shape_radius</b>, may be used in addition to <b>shape_radius1</b>
 *
 * @property {number} shape_points - Controls the number of points (vertices) of the <b>shape</b> polygon or star
 *
 * @property {boolean} snaptopixel - Used by all <b>point</b> styles, if set <b>true</b> rounds coordinates to the closest pixel, producing crisper results, if <b>false</b> 
 * produces smoother results for animation. Defaults to <b>true</b>
 *
 * @property {number} text_offsetx - Horizontal offset, in pixels, used with <b>text</b>
 *
 * @property {number} text_offsety - Vertical offset, in pixels, used with <b>text</b>
 *
 * @property {string} text_align - HTML Canvas text align, one of 'left', 'right', 'center', 'end', 'start', defaults to 'start'
 *
 * @property {string} text_baseline - HTML Canvas text baseline, one of:  'bottom', 'top', 'middle', 'alphabetic', 'hanging', 'ideographic', defaults to 'alphabetic'
 *
 * @property {number} zindex - Controls the order in which sub styles are rendered, defaults to 0, used by all styles
 *
 * @see [Map Feature Style]{@link tf.map.FeatureStyle}
 * @see [Map Feature Sub Style]{@link tf.map.FeatureSubStyle}
 * @see {@link tf.map.Feature}
 */

/**
 * @public
 * @class
 * @summary Map Feature Sub Style instances describe the visual attributes used to display [Map Features]{@link tf.map.Feature} on the [Map]{@link tf.map.Map}.
 * @param {tf.types.MapFeatureStyleSettings} settings - creation settings
 */
tf.map.FeatureSubStyle = function (settings) {

    var theThis, debug, attrGetters, thisInstanceSettings, APISubStyle;

    /**
     * @public
     * @function
     * @summary - Changes the attributes of this Feature Sub Style instance based on the given settings
     * @param {tf.types.MapFeatureStyleSettings} styleSettings - the given settings
     * @returns {void} - | {@link void} no return value
    */
    this.UpdateAttributesFrom = function (styleSettings) { return updateAttributesFrom(styleSettings); }

    /**
     * @private
     * @function
     * @summary - Returns underlying map engine object associated with this sub style
     * @returns {ol.style} - | the map engine object
    */
    this.GetAPISubStyle = function () { return APISubStyle; }

/**
 * method tf.map.FeatureSubStyle.SetAttribute - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} attrName - parameter description?
 * @param {?} attrVal - parameter description?
*/
    //this.SetAttribute = function (attrName, attrVal) { return setAttribute(attrName, attrVal, false); }
/**
 * method tf.map.FeatureSubStyle.GetAttribute - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} attrName - parameter description?
*/
    //this.GetAttribute = function (attrName) { return getAttribute(attrName); }

    function createStarSubStyle() {
        return new ol.style.RegularShape({
            opacity: thisInstanceSettings.opacity,
            rotation: thisInstanceSettings.rotation_rad,
            //scale: thisInstanceSettings.scale,

            radius1: thisInstanceSettings.font_height,
            radius2: thisInstanceSettings.font_height / 2,
            stroke: new ol.style.Stroke({
                color: tf.js.GetRGBAColor(thisInstanceSettings.border_color, thisInstanceSettings.border_color, thisInstanceSettings.border_opacity),
                width: thisInstanceSettings.border_width
            }),
            fill: new ol.style.Fill({
                color: tf.js.GetRGBAColor(thisInstanceSettings.marker_color, thisInstanceSettings.marker_color, thisInstanceSettings.marker_opacity)
            }),
            points: 5
        });
    }

    function createTextCanvasSubStyle() {
        //var triW = thisInstanceSettings.font_height / 2;

        var options = {

            label: !!thisInstanceSettings.label ? thisInstanceSettings.label : '',
            font_height: thisInstanceSettings.font_height,
            font: thisInstanceSettings.font,
            arrow_length: thisInstanceSettings.marker_arrowlength,
            line_color: thisInstanceSettings.line_color,
            line_opacity: thisInstanceSettings.line_opacity,
            line_width: thisInstanceSettings.line_width,
            font_color: thisInstanceSettings.font_color,
            font_opacity: thisInstanceSettings.font_opacity,
            border_line_color: thisInstanceSettings.border_color,
            border_line_opacity: thisInstanceSettings.border_opacity,
            border_line_width: thisInstanceSettings.border_width,
            fill_color: thisInstanceSettings.marker_color,
            fill_opacity: thisInstanceSettings.marker_opacity,
            horpos: thisInstanceSettings.marker_horpos,
            verpos: thisInstanceSettings.marker_verpos
        };

        var memImage = tf.canvas.CreateMemoryImage({ drawFunction: tf.canvas.DrawTextMarkerImage, drawSettings: options });
        var textImageSubStyle = null;

        try {
            textImageSubStyle = new ol.style.Icon({
                opacity: thisInstanceSettings.opacity,
                rotation: thisInstanceSettings.rotation_rad,
                scale: thisInstanceSettings.scale,
                //src: memImage.image,
                img: memImage.image,
                imgSize: [memImage.image.width, memImage.image.height],
                anchor: memImage.anchor
            });
        }
        catch (e) { textImageSubStyle = null; }
        return textImageSubStyle;
    }

    function createRoundRectSubStyle() {
        var memImage = tf.canvas.CreateMemoryImage({
            canvas: null,
            drawFunction: tf.canvas.DrawRoundRect,
            drawSettings: {
                width: thisInstanceSettings.round_rect_width,
                height: thisInstanceSettings.round_rect_height,
                radius: thisInstanceSettings.round_rect_radius,
                fill: thisInstanceSettings.fill,
                fill_color: tf.js.GetRGBAColor(thisInstanceSettings.fill_color, thisInstanceSettings.fill_color, thisInstanceSettings.fill_opacity),
                line: thisInstanceSettings.line,
                line_color: tf.js.GetRGBAColor(thisInstanceSettings.line_color, thisInstanceSettings.line_color, thisInstanceSettings.line_opacity),
                line_width: thisInstanceSettings.line_width,
                line_dash: thisInstanceSettings.line_dash
            }
        });
        var styleSettings = {
            //src: memImage.image,
            img: memImage.image,
            imgSize: [memImage.image.width, memImage.image.height],
            anchor: thisInstanceSettings.icon_anchor
        };
        //var styleSettings = { src: tf.GetStyles().GetHiddenCanvas(), anchor: thisInstanceSettings.icon_anchor };
        return new ol.style.Icon(completeSubStyleSettings(styleSettings, true, true, false));
    }

    function createStrokeSubStyle() {
        return new ol.style.Stroke({
            color: tf.js.GetRGBAColor(thisInstanceSettings.line_color, thisInstanceSettings.line_color, thisInstanceSettings.line_opacity),
            width: thisInstanceSettings.line_width,
            lineDash: thisInstanceSettings.line_dash,
            lineCap: thisInstanceSettings.line_cap,
            lineJoin: thisInstanceSettings.line_join
        });
    }

    function createFillSubStyle() {
        return new ol.style.Fill({ color: tf.js.GetRGBAColor(thisInstanceSettings.fill_color, thisInstanceSettings.fill_color, thisInstanceSettings.fill_opacity) });
    }

    function completeSubStyleSettings(styleSettings, styleUsesOpacity, styleUsesScale, styleUsesDraw) {
        if (!!styleUsesOpacity) {
            styleSettings.opacity = thisInstanceSettings.opacity;
            styleSettings.snapToPixel = thisInstanceSettings.snaptopixel;
        }
        if (thisInstanceSettings.rotate_with_map) { styleSettings.rotateWithView = true; }
        styleSettings.rotation = thisInstanceSettings.rotation_rad;
        if (!!styleUsesScale) { styleSettings.scale = thisInstanceSettings.scale; }
        if (!!styleUsesDraw) {
            if (thisInstanceSettings.line) { styleSettings.stroke = createStrokeSubStyle() };
            if (thisInstanceSettings.fill) { styleSettings.fill = createFillSubStyle() };
        }
        return styleSettings;
    }

    function createCircleSubStyle() {
        var styleSettings = { radius: thisInstanceSettings.circle_radius };
        return new ol.style.Circle(completeSubStyleSettings(styleSettings, true, false, true));
    }

    function createRegularShapeSubStyle() {
        var styleSettings = { radius: thisInstanceSettings.shape_radius, radius1: thisInstanceSettings.shape_radius1, radius2: thisInstanceSettings.shape_radius2, points: thisInstanceSettings.shape_points };
        return new ol.style.RegularShape(completeSubStyleSettings(styleSettings, true, false, true));
    }

    function createIconSubStyle() {
        var styleSettings = {
            crossOrigin: "",
            src: thisInstanceSettings.icon_url, anchor: thisInstanceSettings.icon_anchor, img: thisInstanceSettings.icon_img, imgSize: thisInstanceSettings.icon_size, offset: thisInstanceSettings.icon_offset
        };
        return new ol.style.Icon(completeSubStyleSettings(styleSettings, true, true, false));
    }

    function createTextSubStyle() {
        var styleSettings = {
            text: !!thisInstanceSettings.label ? thisInstanceSettings.label : '',
            font: thisInstanceSettings.font,
            offsetX: thisInstanceSettings.text_offsetx,
            offsetY: thisInstanceSettings.text_offsety,
            textAlign: thisInstanceSettings.text_align,
            textBaseline: thisInstanceSettings.text_baseline
        };
        return new ol.style.Text(completeSubStyleSettings(styleSettings, false, false, true));
    }

    function createMarkerStyle() {
        var styleSettings = {};
        var label = typeof thisInstanceSettings.label === "string" ? thisInstanceSettings.label : "";
        var labelLen = label.length;
        var hasLabel = labelLen > 0 && (label.charAt(0) != '.');

        //hasLabel = false;
        if (hasLabel) { styleSettings.image = createTextCanvasSubStyle(); } else { styleSettings.image = createStarSubStyle(); }
        return styleSettings;
    }

    function createAPISubStyle() {
        var styleSettings = {};

        if (thisInstanceSettings.marker) {
            styleSettings = createMarkerStyle();
        }
        else if (thisInstanceSettings.icon) {
            styleSettings.image = createIconSubStyle();
        }
        else if (thisInstanceSettings.circle) {
            styleSettings.image = createCircleSubStyle();
        }
        else if (thisInstanceSettings.shape) {
            styleSettings.image = createRegularShapeSubStyle();
        }
        else if (thisInstanceSettings.round_rect) {
            styleSettings.image = createRoundRectSubStyle();
        }
        else if (thisInstanceSettings.text) {
            styleSettings.text = createTextSubStyle();
        }
        else {
            if (thisInstanceSettings.line) { styleSettings.stroke = createStrokeSubStyle() };
            if (thisInstanceSettings.fill) { styleSettings.fill = createFillSubStyle() };
        }
        styleSettings.zIndex = thisInstanceSettings.zindex;
        return new ol.style.Style(styleSettings);
    }

    function get01NumberFromValue0100 (fromValue0100, defaultValue01) {
        return ((fromValue0100 = tf.js.GetFloatNumber(fromValue0100, -1)) == -1) ? defaultValue01 : tf.js.GetFloatNumberInRange(fromValue0100 / 100, 0, 1, defaultValue01);
    }

    function setAttribute(attrName, attrVal, dontUpdateAPISubStyleBool) {
        var didSet = false;
        if (!!attrName && typeof attrName === "string" && attrName.length) {
            var attrGetter = attrGetters[attrName.toLowerCase()];
            if (typeof attrGetter === "function") {
                var newVal = attrGetter(attrVal, thisInstanceSettings[attrName]);
                if (!!debug) {
                    debug.LogIfTest('requested [' + attrName + '] = ' + attrVal);
                    debug.LogIfTest('+assigned [' + attrName + '] = ' + newVal);
                }
                didSet = true;
                thisInstanceSettings[attrName] = newVal;
                if (!dontUpdateAPISubStyleBool) { updateAPISubStyle(); }
            }
        }
        return didSet;
    }
    function getAttribute(attrName) { return thisInstanceSettings[attrName]; }

    function updateAPISubStyle() { APISubStyle = createAPISubStyle(); }

    function updateAttributesFrom(newSettings) {
        var didSet = false;
        if (typeof newSettings === "string") { newSettings = newSettings.length ? tf.js.ParseLegacyFormatString(newSettings) : null; }
        if (!!newSettings && typeof newSettings === "object") {
            for (var attr in newSettings) {
                if (setAttribute(attr, newSettings[attr], true)) { didSet = true; }
            }
            if (didSet) {
                updateAPISubStyle();
            }
        }
        return didSet;
    }

    function getValue01(value, defaultValue) { return tf.js.GetFloatNumberInRange(value, 0, 1, defaultValue); }
    function getAlpha(value, defaultValue) {
        return get01NumberFromValue0100(value, defaultValue);
    }
    function getColor(value, defaultValue) { return tf.js.GetHexColorStr(value, defaultValue); }
    function getTwoElementNumberArray(value, defaultValue) {
        var returnValue = defaultValue;
        if (!!value) {
            if (typeof value === "string") {
                var values = value.split(',');
                var nValues = values.length;
                if (nValues == 2) {
                    for (var i in values) {
                        var defaultV = !!defaultValue ? defaultValue[i] : undefined;
                        values[i] = tf.js.GetFloatNumber(values[i], defaultV);
                    }
                    returnValue = values;
                }
            }
            else if (typeof value === "object" && value.length == 2) {
                for (var i in value) {
                    var defaultV = !!defaultValue ? defaultValue[i] : undefined;
                    value[i] = tf.js.GetFloatNumber(value[i], defaultV);
                }
                returnValue = value;
            }
        }
        return returnValue;
    }

    function getRadius(value, defaultValue) { return value === undefined || value == null ? undefined : Math.abs(tf.js.GetFloatNumber(value, defaultValue)); }

    function getStringOrUndefined(value, defaultValue) { return !!value ? tf.js.GetNonEmptyString(value, defaultValue) : undefined; }

    function getImgObject(value, defaultValue) { if (!(value = tf.dom.GetHTMLElementFrom((value)))) { value = defaultValue; } return value; }

    function get_border_opacity(value, defaultValue) { return getAlpha(value, defaultValue); }
    function get_border_color(value, defaultValue) { return getColor(value, defaultValue) }
    function get_border_width(value, defaultValue) { return tf.js.GetNonNegativeIntFrom(value, defaultValue); }
    function get_circle(value, defaultValue) { return tf.js.GetBoolFromValue(value, defaultValue); }
    function get_circle_radius(value, defaultValue) { return getRadius(value, defaultValue); }
    function get_fill(value, defaultValue) { return tf.js.GetBoolFromValue(value, defaultValue); }
    function get_fill_opacity(value, defaultValue) { return getAlpha(value, defaultValue); }
    function get_fill_color(value, defaultValue) { return getColor(value, defaultValue); }
    function get_font_opacity(value, defaultValue) { return getAlpha(value, defaultValue); }
    function get_font_color(value, defaultValue) { return getColor(value, defaultValue); }
    function get_font_height(value, defaultValue) { return tf.js.GetIntNumberInRange(value, 8, 120, defaultValue); }
    function get_font(value, defaultValue) { return tf.js.GetNonEmptyString(value, defaultValue); }
    function get_icon(value, defaultValue) { return tf.js.GetBoolFromValue(value, defaultValue); }
    function get_icon_anchor(value, defaultValue) { return getTwoElementNumberArray(value, defaultValue); }
    function get_icon_offset(value, defaultValue) { return getTwoElementNumberArray(value, defaultValue); }
    function get_icon_size(value, defaultValue) { return getTwoElementNumberArray(value, defaultValue); }
    function get_icon_img(value, defaultValue) { return getImgObject(value, defaultValue); }
    function get_icon_url(value, defaultValue) { return tf.js.GetNonEmptyString(value, defaultValue); }

    function get_label(value, defaultValue) { return tf.js.GetNonEmptyString(value, defaultValue); }

    function get_line_cap(value, defaultValue) { return tf.js.GetNonEmptyString(value, defaultValue); }
    function get_line_join(value, defaultValue) { return tf.js.GetNonEmptyString(value, defaultValue); }
    function get_line(value, defaultValue) { return tf.js.GetBoolFromValue(value, defaultValue); }
    function get_line_opacity(value, defaultValue) { return getAlpha(value, defaultValue); }
    function get_line_color(value, defaultValue) { return getColor(value, defaultValue); }
    //function get_line_dash(value, defaultValue) { return getTwoElementNumberArray(value, defaultValue); }
    function get_line_dash(value, defaultValue) { return value == undefined ? defaultValue : value; }
    //function get_line_width(value, defaultValue) { return tf.js.GetNonNegativeIntFrom(value, defaultValue); }
    function get_line_width(value, defaultValue) { return tf.js.GetFloatNumber(value, defaultValue); }
    function get_marker(value, defaultValue) { return tf.js.GetBoolFromValue(value, defaultValue); }
    function get_marker_opacity(value, defaultValue) { return getAlpha(value, defaultValue); }
    function get_marker_arrowlength(value, defaultValue) { return tf.js.GetFloatNumber(value, defaultValue); }
    function get_marker_color(value, defaultValue) { return getColor(value, defaultValue); }
    function get_opacity(value, defaultValue) { return getValue01(value, defaultValue); }

    function get_rotate_with_view(value, defaultValue) { return tf.js.GetBoolFromValue(value, defaultValue); }
    function get_rotation_rad(value, defaultValue) { return tf.js.GetFloatNumber(value, defaultValue); }

    function get_scale(value, defaultValue) { return value !== undefined ? tf.js.GetFloatNumber(value, defaultValue) : value; }

    function get_shape(value, defaultValue) { return tf.js.GetBoolFromValue(value, defaultValue); }
    function get_shape_radius(value, defaultValue) { return getRadius(value, defaultValue); }
    function get_shape_radius1(value, defaultValue) { return getRadius(value, defaultValue); }
    function get_shape_radius2(value, defaultValue) { return getRadius(value, defaultValue); }
    function get_shape_points(value, defaultValue) { return tf.js.GetNonNegativeIntFrom(value, defaultValue); }

    function get_snaptopixel(value, defaultValue) { return tf.js.GetBoolFromValue(value, defaultValue); }

    function get_round_rect(value, defaultValue) { return tf.js.GetBoolFromValue(value, defaultValue); }
    function get_round_rect_width(value, defaultValue) { return tf.js.GetFloatNumber(value, defaultValue); }
    function get_round_rect_height(value, defaultValue) { return tf.js.GetFloatNumber(value, defaultValue); }
    function get_round_rect_radius(value, defaultValue) { return tf.js.GetFloatNumber(value, defaultValue); }

    function get_text(value, defaultValue) { return tf.js.GetBoolFromValue(value, defaultValue); }

    function get_marker_horpos(value, defaultValue) { return getStringOrUndefined(value, defaultValue); }
    function get_marker_verpos(value, defaultValue) { return getStringOrUndefined(value, defaultValue); }

    function get_text_align(value, defaultValue) { return getStringOrUndefined(value, defaultValue); }
    function get_text_baseline(value, defaultValue) { return getStringOrUndefined(value, defaultValue); }

    function get_text_offsetx(value, defaultValue) { return tf.js.GetFloatNumber(value, defaultValue); }
    function get_text_offsety(value, defaultValue) { return tf.js.GetFloatNumber(value, defaultValue); }
    function get_zindex(value, defaultValue) { return tf.js.GetNonNegativeIntFrom(value, defaultValue); }

    function initialize() {

        //debug = tf.GetDebug();

        var subStyles = tf.GetStyles().GetSubStyles();

        settings = tf.js.GetValidObjectFrom(settings);

        attrGetters = {
            border_alpha: get_border_opacity,
            border_color: get_border_color,
            border_opacity: get_border_opacity,
            border_width: get_border_width,
            circle: get_circle,
            circle_radius: get_circle_radius,
            fill: get_fill,
            fill_alpha: get_fill_opacity,
            fill_color: get_fill_color,
            fill_opacity: get_fill_opacity,
            font_alpha: get_font_opacity,
            font_color: get_font_color,
            font_opacity: get_font_opacity,
            font_height: get_font_height,
            font: get_font,
            icon: get_icon,
            icon_anchor: get_icon_anchor,
            icon_offset: get_icon_offset,
            icon_img: get_icon_img,
            icon_size: get_icon_size,
            icon_url: get_icon_url,
            label: get_label,
            marker: get_marker,
            marker_alpha: get_marker_opacity,
            marker_arrowlength: get_marker_arrowlength,
            marker_color: get_marker_color,
            marker_opacity: get_marker_opacity,

            marker_horpos: get_marker_horpos,
            marker_verpos: get_marker_verpos,

            opacity: get_opacity,
            line: get_line,
            line_alpha: get_line_opacity,
            line_cap: get_line_cap,
            line_color: get_line_color,
            line_dash: get_line_dash,
            line_join: get_line_join,
            line_opacity: get_line_opacity,
            line_width: get_line_width,

            rotate_with_map: get_rotate_with_view,
            rotation_rad: get_rotation_rad,

            round_rect: get_round_rect,
            round_rect_width: get_round_rect_width,
            round_rect_height: get_round_rect_height,
            round_rect_radius: get_round_rect_radius,

            scale: get_scale,
            shape: get_shape,
            shape_radius: get_shape_radius,
            shape_radius1: get_shape_radius1,
            shape_radius2: get_shape_radius2,
            shape_points: get_shape_points,

            snaptopixel: get_snaptopixel,

            text: get_text,
            text_align: get_text_align,
            text_baseline: get_text_baseline,
            text_offsetx: get_text_offsety,
            text_offsety: get_text_offsety,
            zindex: get_zindex
        };

        var defaultMapFeatureStyleSettings = {

            border_opacity: 1,
            border_color: "#000",
            border_width: 2,

            circle: false,
            circle_radius: 20,

            fill: false,

            fill_opacity: 1,
            fill_color: "#fff",

            font_opacity: 1,
            font_color: subStyles.darkTextColor,
            font_height: subStyles.markerFontSizePXNumber,
            font: subStyles.markerFontFamily,

            icon: false,

            icon_anchor: [0.5, 0.5],
            icon_img: undefined,
            icon_offset: [0, 0],
            icon_url: undefined,
            icon_size: undefined,

            label: '',

            line: false,

            line_opacity: 1,
            line_cap: "round",
            line_join: "round",
            line_color: "#000",
            line_dash: [20, 0],
            line_width: 1,

            marker: false,
            marker_opacity: 1,
            marker_arrowlength: 12,
            marker_color: "#3399FF",

            marker_horpos : tf.consts.positioningCenter,
            marker_verpos : tf.consts.positioningTop,

            opacity: 1,

            rotate_with_map: false,
            rotation_rad: 0,

            round_rect: false,
            round_rect_width: 10,
            round_rect_height: 10,
            round_rect_radius: 0,

            scale: 1.0,

            shape: false,
            shape_radius: undefined,
            shape_radius1: undefined,
            shape_radius2: undefined,
            shape_points: 4,

            snaptopixel: true,

            text: false,
            text_offsetx: 0,
            text_offsety: 0,
            text_align: undefined,
            text_baseline: undefined,

            zindex: 1
        };

        thisInstanceSettings = tf.js.ShallowMerge(defaultMapFeatureStyleSettings);
        updateAttributesFrom(settings);
        updateAPISubStyle();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * @public
 * @class
 * @summary Map Feature Style instances contain one or more [Map Feature Sub Style]{@link tf.map.FeatureSubStyle} instances
 * that together describe the visual attributes used to display [Map Features]{@link tf.map.Feature} on the [Map]{@link tf.map.Map}.
 * @param {tf.types.MapFeatureStyleSettings|array<tf.types.MapFeatureStyleSettings>} settings - creation settings, use a single 
 * settings object to create a single SubStyle, or an {@link array} of settings objects, one for each SubStyle to be created
 */
tf.map.FeatureStyle = function (settings) {

    var theThis, debug, APIStyle, subStyles;

    /**
     * @public
     * @function
     * @summary - Retrieves the number of [Feature Sub Style]{@link tf.map.FeatureSubStyle} instances associated with this Feature Style instance
     * @returns {number} - | {@link number} the number of instances
    */
    this.GetCount = function () { return !!subStyles ? subStyles.length : 0; }

    /**
     * @public
     * @function
     * @summary - Retrieves a [Feature Sub Style]{@link tf.map.FeatureSubStyle} instance associated with this Feature Style instance by the given index
     * @param {number} index - the given index
     * @returns {tf.map.FeatureSubStyle} - | {@link tf.map.FeatureSubStyle} the instance, or {@link void} if <b>index</b> is invalid
    */
    this.Get = function (index) { return index >= 0 && index < theThis.GetCount() ?  subStyles[index] : null; }

    /**
     * @public
     * @function
     * @summary - Changes the attributes of all [Feature Sub Style]{@link tf.map.FeatureSubStyle} instances of this Feature Style instance based on the given settings
     * @param {tf.types.MapFeatureStyleSettings} styleSettings - the given settings
     * @returns {void} - | {@link void} no return value
    */
    this.UpdateAttributesFrom = function (styleSettings) { return updateAttributesFrom(styleSettings); }

    /**
     * @private
     * @function
     * @summary - Returns underlying map engine object associated with this sub style
     * @returns {ol.style} - | the map engine object
    */
    this.getAPIStyle = function () { return APIStyle; }

/**
 * method tf.map.FeatureStyle.GetSubStyles - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    //this.GetSubStyles = function () { return subStyles; }

/**
 * method tf.map.FeatureStyle.SetAttribute - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} attrName - parameter description?
 * @param {?} attrVal - parameter description?
*/
    //this.SetAttribute = function (attrName, attrVal) { return subStyles[0].SetAttribute(attrName, attrVal, false); }
/**
 * method tf.map.FeatureStyle.GetAttribute - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} attrName - parameter description?
*/
    //this.GetAttribute = function (attrName) { return subStyles[0].GetAttribute(attrName); }

    function updateAttributesFrom(newSettings) {
        var updated = false;
        if (!!newSettings) {
            if (tf.js.GetIsNonEmptyArray(newSettings)) {
                var maxIndex = subStyles.length < newSettings.length ? subStyles.length : newSettings.length;
                for (var index = 0 ; index < maxIndex ; index++) {
                    if (subStyles[index].UpdateAttributesFrom(newSettings[i])) {
                        updated = true;
                    }
                }
            }
            else {
                updated = subStyles[0].UpdateAttributesFrom(newSettings);
            }
        }
        if (updated) { updateAPIStyle(); }
        return updated;
    }

    function createAPIStyle() { var apiStyle = []; for (var subStyle in subStyles) { apiStyle.push(subStyles[subStyle].GetAPISubStyle()); } return apiStyle; }

    function updateAPIStyle() { APIStyle = createAPIStyle(); }

    function getMapFeatureSubStyleFrom(theStyle) {
        return theStyle instanceof tf.map.FeatureSubStyle ? theStyle : new tf.map.FeatureSubStyle(theStyle) ;
    }

    function initialize() {

        subStyles = [];

        if (tf.js.GetIsNonEmptyArray(settings)) {
            var nStyles = settings.length;

            subStyles.push(getMapFeatureSubStyleFrom(settings[0]));

            for (var i = 1 ; i < nStyles ; i++) {
                subStyles.push(getMapFeatureSubStyleFrom(settings[i]));
            }
        }
        if (!subStyles.length) { subStyles.push(getMapFeatureSubStyleFrom(settings)); }
        updateAPIStyle();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
