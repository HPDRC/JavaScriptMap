"use strict";

/**
 * @public
 * @function
 * @summary - Traces a circle on the given context, at the given center, and with the given diameter, using {@link tf.canvas.ellipse}
 * @param {canvasContext} ctx - context on which to draw the circle
 * @param {number} aX - horizontal center coordinate
 * @param {number} aY - vertical center coordinate
 * @param {number} aDiameter - diameter
 * @returns {void} - | {@link void} no return value
*/
tf.canvas.circle = function (ctx, aX, aY, aDiameter) { tf.canvas.ellipse(ctx, aX, aY, aDiameter, aDiameter); }

/**
 * @public
 * @function
 * @summary - Traces an axis-aligned ellipse on the given context, at the given center, and with the given diameters, using <b>bezierCurveTo</b>, does
 * not fill or stroke the traced geometry
 * @param {canvasContext} ctx - context on which to draw the ellipse
 * @param {number} aX - horizontal center coordinate
 * @param {number} aY - vertical center coordinate
 * @param {number} aWidth - horizontal diameter
 * @param {number} aHeight - vertical diameter
 * @returns {void} - | {@link void} no return value
*/
tf.canvas.ellipse = function (ctx, aX, aY, aWidth, aHeight) {
    var hB = (aWidth / 2) * .5522848, vB = (aHeight / 2) * .5522848,
        eX = aX + aWidth, eY = aY + aHeight, mX = aX + aWidth / 2, mY = aY + aHeight / 2;
    ctx.moveTo(aX, mY);
    ctx.bezierCurveTo(aX, mY - vB, mX - hB, aY, mX, aY);
    ctx.bezierCurveTo(mX + hB, aY, eX, mY - vB, eX, mY);
    ctx.bezierCurveTo(eX, mY + vB, mX + hB, eY, mX, eY);
    ctx.bezierCurveTo(mX - hB, eY, aX, mY + vB, aX, mY);
}

/**
 * @public
 * @function
 * @summary - Strokes and fills a rectangle with rounded corners on the given context
 * @param {canvasContext} ctx - context on which to draw the rectangle
 * @param {number} x - the rectangle's leftmost coordinate
 * @param {number} y - the rectangle's topmost coordinate
 * @param {number} width - the width of the rectangle
 * @param {number} height - the height of the rectangle
 * @param {number} radius - the radius of the rectangle's rounded corners
 * @param {boolean} fill - if <b>true</b> the rectangle is filled with the current fill color, defaults to {@link void}
 * @param {boolean} stroke - if <b>true</b> the rectangle is stroked with the current stroke color and width, defaults to {@link void}
 * @returns {void} - | {@link void} no return value
*/
tf.canvas.StrokeFillRoundRect = function (ctx, x, y, width, height, radius, fill, stroke, dontTranslate) {
    stroke = tf.js.GetBoolFromValue(stroke, false);
    fill = tf.js.GetBoolFromValue(fill, false);
    if (fill || stroke) {
        if (!dontTranslate) { ctx.translate(0.5, 0.5); }
        var minDim = width < height ? width : height;
        radius = tf.js.GetFloatNumberInRange(radius, 0, minDim / 2);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (stroke) { ctx.stroke(); }
        if (fill) { ctx.fill(); }
    }
}

/**
 * @public
 * @function
 * @summary - Strokes and fills a bubble on the given HTML5 canvas context, with an arrow callout going up from its left top corner
 * @param {canvasContext} ctx - the canvas context to draw on
 * @param {tf.types.pixelCoordinates} leftTop - left and top coordinates
 * @param {tf.types.pixelCoordinates} widthHeight - width and height dimensions 
 * @param {number} arrowHeight - in pixels, determines how far from the bubble the callout arrow ends
 * @param {number} radius - in pixels, used for rounding corners and determining the width of the callout arrow
*/
tf.canvas.StrokeFillBubbleLT = function (ctx, x, y, w, h, arrowHeight, radius) {
    var r = x + w;
    var b = y + h;
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x, y - arrowHeight);
    ctx.lineTo(x + radius * 2, y);
    ctx.lineTo(r - radius, y);
    ctx.quadraticCurveTo(r, y, r, y + radius);
    ctx.lineTo(r, y + h - radius);
    ctx.quadraticCurveTo(r, b, r - radius, b);
    ctx.lineTo(x + radius, b);
    ctx.quadraticCurveTo(x, b, x, b - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
}

/**
 * @public
 * @function
 * @summary - Strokes and fills a bubble on the given HTML5 canvas context, with an arrow callout going down from its left bottom corner
 * @param {canvasContext} ctx - the canvas context to draw on
 * @param {tf.types.pixelCoordinates} leftTop - left and top coordinates
 * @param {tf.types.pixelCoordinates} widthHeight - width and height dimensions 
 * @param {number} arrowHeight - in pixels, determines how far from the bubble the callout arrow ends
 * @param {number} radius - in pixels, used for rounding corners and determining the width of the callout arrow
*/
tf.canvas.StrokeFillBubbleLB = function (ctx, x, y, w, h, arrowHeight, radius) {
    var r = x + w;
    var b = y + h;
    ctx.moveTo(x + radius, y);
    ctx.lineTo(r - radius, y);
    ctx.quadraticCurveTo(r, y, r, y + radius);
    ctx.lineTo(r, y + h - radius);
    ctx.quadraticCurveTo(r, b, r - radius, b);
    ctx.lineTo(x + radius * 2, b);
    ctx.lineTo(x, b + arrowHeight);
    ctx.lineTo(x + radius, b);
    ctx.quadraticCurveTo(x, b, x, b - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
}

/**
 * @public
 * @function
 * @summary - Strokes and fills a bubble on the given HTML5 canvas context, with an arrow callout going up from its right top corner
 * @param {canvasContext} ctx - the canvas context to draw on
 * @param {tf.types.pixelCoordinates} leftTop - left and top coordinates
 * @param {tf.types.pixelCoordinates} widthHeight - width and height dimensions 
 * @param {number} arrowHeight - in pixels, determines how far from the bubble the callout arrow ends
 * @param {number} radius - in pixels, used for rounding corners and determining the width of the callout arrow
*/
tf.canvas.StrokeFillBubbleRT = function (ctx, x, y, w, h, arrowHeight, radius) {
    var r = x + w;
    var b = y + h;
    ctx.moveTo(x + radius, y);
    ctx.lineTo(r - radius * 2, y);
    ctx.lineTo(r, y - arrowHeight);
    ctx.lineTo(r - radius, y);
    ctx.quadraticCurveTo(r, y, r, y + radius);
    ctx.lineTo(r, y + h - radius);
    ctx.quadraticCurveTo(r, b, r - radius, b);
    ctx.lineTo(x + radius, b);
    ctx.quadraticCurveTo(x, b, x, b - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
}

/**
 * @public
 * @function
 * @summary - Strokes and fills a bubble on the given HTML5 canvas context, with an arrow callout going down from its right bottom corner
 * @param {canvasContext} ctx - the canvas context to draw on
 * @param {tf.types.pixelCoordinates} leftTop - left and top coordinates
 * @param {tf.types.pixelCoordinates} widthHeight - width and height dimensions 
 * @param {number} arrowHeight - in pixels, determines how far from the bubble the callout arrow ends
 * @param {number} radius - in pixels, used for rounding corners and determining the width of the callout arrow
*/
tf.canvas.StrokeFillBubbleRB = function (ctx, x, y, w, h, arrowHeight, radius) {
    var r = x + w;
    var b = y + h;
    ctx.moveTo(x + radius, y);
    ctx.lineTo(r - radius, y);
    ctx.quadraticCurveTo(r, y, r, y + radius);
    ctx.lineTo(r, y + h - radius);
    ctx.quadraticCurveTo(r, b, r - radius, b);
    ctx.lineTo(r - radius, b);
    ctx.lineTo(r, b + arrowHeight);
    ctx.lineTo(r - 2 * radius, b);
    ctx.lineTo(x + radius, b);
    ctx.quadraticCurveTo(x, b, x, b - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
}

/**
 * @public
 * @function
 * @summary - Strokes and fills a bubble on the given HTML5 canvas context, with an arrow callout going up from its the middle of its top edge
 * @param {canvasContext} ctx - the canvas context to draw on
 * @param {tf.types.pixelCoordinates} leftTop - left and top coordinates
 * @param {tf.types.pixelCoordinates} widthHeight - width and height dimensions 
 * @param {number} arrowHeight - in pixels, determines how far from the bubble the callout arrow ends
 * @param {number} radius - in pixels, used for rounding corners and determining the width of the callout arrow
*/
tf.canvas.StrokeFillBubbleMidT = function (ctx, x, y, w, h, arrowHeight, radius) {
    var r = x + w;
    var b = y + h;
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w / 2 - radius / 2, y);
    ctx.lineTo(x + w / 2, y - arrowHeight);
    ctx.lineTo(x + w / 2 + radius / 2, y);
    ctx.lineTo(x + radius * 2, y);
    ctx.lineTo(r - radius, y);
    ctx.quadraticCurveTo(r, y, r, y + radius);
    ctx.lineTo(r, y + h - radius);
    ctx.quadraticCurveTo(r, b, r - radius, b);
    ctx.lineTo(x + radius, b);
    ctx.quadraticCurveTo(x, b, x, b - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
}

/**
 * @public
 * @function
 * @summary - Strokes and fills a bubble on the given HTML5 canvas context, with an arrow callout going down from its the middle of its bottom edge
 * @param {canvasContext} ctx - the canvas context to draw on
 * @param {tf.types.pixelCoordinates} leftTop - left and top coordinates
 * @param {tf.types.pixelCoordinates} widthHeight - width and height dimensions 
 * @param {number} arrowHeight - in pixels, determines how far from the bubble the callout arrow ends
 * @param {number} radius - in pixels, used for rounding corners and determining the width of the callout arrow
*/
tf.canvas.StrokeFillBubbleMidB = function (ctx, x, y, w, h, arrowHeight, radius) {
    var r = x + w;
    var b = y + h;
    ctx.moveTo(x + radius, y);
    ctx.lineTo(r - radius, y);
    ctx.quadraticCurveTo(r, y, r, y + radius);
    ctx.lineTo(r, y + h - radius);
    ctx.quadraticCurveTo(r, b, r - radius, b);
    ctx.lineTo(x + w / 2 + radius / 2, b);
    ctx.lineTo(x + w / 2, b + arrowHeight);
    ctx.lineTo(x + w / 2 - radius / 2, b);
    ctx.lineTo(x + radius, b);
    ctx.quadraticCurveTo(x, b, x, b - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
}

/**
 * @public
 * @function
 * @summary - Strokes and fills a bubble on the given HTML5 canvas context, with an arrow callout going up from its the middle of its right edge
 * @param {canvasContext} ctx - the canvas context to draw on
 * @param {tf.types.pixelCoordinates} leftTop - left and top coordinates
 * @param {tf.types.pixelCoordinates} widthHeight - width and height dimensions 
 * @param {number} arrowHeight - in pixels, determines how far from the bubble the callout arrow ends
 * @param {number} radius - in pixels, used for rounding corners and determining the width of the callout arrow
*/
tf.canvas.StrokeFillBubbleMidR = function (ctx, x, y, w, h, arrowHeight, radius) {
    var r = x + w;
    var b = y + h;
    ctx.moveTo(x + radius, y);
    ctx.lineTo(r - radius, y);
    ctx.quadraticCurveTo(r, y, r, y + radius);
    ctx.lineTo(r + arrowHeight, y + h / 2);
    ctx.lineTo(r, b - radius);
    ctx.quadraticCurveTo(r, b, r - radius, b);
    ctx.lineTo(x + radius, b);
    ctx.quadraticCurveTo(x, b, x, b - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
}

/**
 * @public
 * @function
 * @summary - Strokes and fills a bubble on the given HTML5 canvas context, with an arrow callout going down from its the middle of its left edge
 * @param {canvasContext} ctx - the canvas context to draw on
 * @param {tf.types.pixelCoordinates} leftTop - left and top coordinates
 * @param {tf.types.pixelCoordinates} widthHeight - width and height dimensions 
 * @param {number} arrowHeight - in pixels, determines how far from the bubble the callout arrow ends
 * @param {number} radius - in pixels, used for rounding corners and determining the width of the callout arrow
*/
tf.canvas.StrokeFillBubbleMidL = function (ctx, x, y, w, h, arrowHeight, radius) {
    var r = x + w;
    var b = y + h;
    ctx.moveTo(x + radius, y);
    ctx.lineTo(r - radius, y);
    ctx.quadraticCurveTo(r, y, r, y + radius);
    ctx.lineTo(r, y + h - radius);
    ctx.quadraticCurveTo(r, b, r - radius, b);
    ctx.lineTo(x + radius, b);
    ctx.quadraticCurveTo(x, b, x, b - radius);
    ctx.lineTo(x - arrowHeight, y + h / 2);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
}

/**
 * @public
 * @function
 * @summary - Draws a rectangle with rounded corners from the left top coordinates of given context to the given dimensions.
 * Can be used with {@link tf.canvas.CreateMemoryImage}
 * @param {canvasContext} ctx - context on which to draw the rectangle
 * @param {object} settings - drawing settings
 * @param {number} settings.width - rectangle width in pixels
 * @param {number} settings.height - rectangle height in pixels
 * @param {number} settings.radius - rounded corners radius in pixels
 * @param {boolean} settings.fill - if <b>true</b> the rectangle is filled, defaults to <b>false</b>
 * @param {colorWithOptionalAlpha} settings.fill_color - fill color
 * @param {boolean} settings.line - if <b>true</b> the rectangle is stroked, defaults to <b>false</b>
 * @param {colorWithOptionalAlpha} settings.line_color - stroke color
 * @param {number} settings.line_width - stroke width in pixels
 * @returns {tf.types.iconAnchor} - | {@link tf.types.iconAnchor} the rectangle's anchor
*/
tf.canvas.DrawRoundRect = function (ctx, settings) {

    var defaultSettings = { width: 10, height: 10, radius: 2, fill: false, fill_color: "#fff", line: false, line_color: "#000", line_width: 1 };
    var settings = tf.js.ShallowMerge(defaultSettings, settings);
    var width = settings.width, height = settings.height, radius = settings.radius, fill = !!settings.fill, stroke = !!settings.line, strokeW = 0;

    if (!settings.dontTranslate) { ctx.translate(0.5, 0.5); }
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    ctx.beginPath();
    ctx.clearRect(0, 0, width, height);
    //ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (stroke) { ctx.strokeStyle = settings.line_color; ctx.lineWidth = strokeW = settings.line_width; }
    if (fill) { ctx.fillStyle = settings.fill_color; }
    if (settings.line_dash !== undefined) {
        ctx.setLineDash(settings.line_dash);
    }
    tf.canvas.StrokeFillRoundRect(ctx, strokeW / 2, strokeW / 2, width - strokeW, height - strokeW, radius, fill, stroke, settings.dontTranslate);
    ctx.closePath();
    return [0.5, 0.5];
}

/**
 * @public
 * @function
 * @summary - Draws a bubble around given text with an optional callout arrow. Used to implement the <b>marker</b> style in [Map Feature Sub Style]{@link tf.map.FeatureSubStyle}
 * instances. Can be used with {@link tf.canvas.CreateMemoryImage}
 * @param {canvasContext} ctx - context on which to draw the rectangle
 * @param {object} settings - marker settings
 * @param {string} settings.label - the text
 * @param {number} settings.font - the text font, without size
 * @param {hexColor} settings.font_color - text font color
 * @param {number} settings.font_height - the text height, in pixels
 * @param {tf.types.opacity0100} settings.font_opacity - text font opacity
 * @param {hexColor} settings.line_color - text stroke color
 * @param {tf.types.opacity0100} settings.line_opacity - text stroke opacity
 * @param {number} settings.border_line_color - border stroke color
 * @param {tf.types.opacity0100} settings.border_line_opacity - border stroke opacity
 * @param {number} settings.border_line_width - border stroke width in pixels
 * @param {number} settings.fill_color - bubble fill color
 * @param {tf.types.opacity0100} settings.fill_opacity - bubble fill opacity
 * @param {number} settings.arrowHeight - in pixels, determines how far from the bubble the callout arrow ends
 * @param {number} settings.radius - in pixels, used for rounding corners and determining the width of the callout arrow
 * @param {tf.types.horizontalPositioning} settings.horPos - horizontal positioning of the bubble
 * @param {tf.types.verticalPositioning} settings.verPos - vertical positioning of the bubble
 * @returns {tf.types.iconAnchor} - | {@link tf.types.iconAnchor} the marker's anchor
*/
tf.canvas.DrawTextMarkerImage = function (ctx, settings) {

    settings = tf.js.GetValidObjectFrom(settings);

    //var horPos = tf.js.GetNonEmptyString(settings.horpos, tf.consts.positioningLeft);
    var horPos = tf.js.GetNonEmptyString(settings.horpos, tf.consts.positioningCenter);
    //var horPos = tf.js.GetNonEmptyString(settings.horpos, tf.consts.positioningRight);

    var verPos = tf.js.GetNonEmptyString(settings.verpos, tf.consts.positioningTop);
    //var verPos = tf.js.GetNonEmptyString(settings.verpos, tf.consts.positioningCenter);
    //var verPos = tf.js.GetNonEmptyString(settings.verpos, tf.consts.positioningBottom);

    var isLeft, isCenterHor, isTop, isCenterVer;
    var strokeFunction, iconAnchor = [0.5, 0.5];

    switch (horPos.toLowerCase()) {
        default:
        case tf.consts.positioningCenter: isCenterHor = true; isLeft = false; iconAnchor[0] = 0.5; break;
        case tf.consts.positioningLeft: isCenterHor = false; isLeft = true; iconAnchor[0] = 1; break;
        case tf.consts.positioningRight: isCenterHor = false; isLeft = false; iconAnchor[0] = 0; break;
    }

    switch (verPos.toLowerCase()) {
        case tf.consts.positioningCenter: isCenterVer = true; isTop = false; iconAnchor[1] = 0.5; break;
        case tf.consts.positioningTop: isCenterVer = false; isTop = true; iconAnchor[1] = 1; break;
        case tf.consts.positioningBottom: isCenterVer = false; isTop = false; iconAnchor[1] = 0; break;
    }

    var label = tf.js.GetNonEmptyString(settings.label, '');
    var textStrokeColor = settings.line_color != null ? settings.line_color : "0xFFFFFF";
    var textStrokeOpac = settings.line_opacity != null ? settings.line_opacity : 0.2;
    var textStrokeWidth = settings.line_width != null ? settings.line_width : 0;
    var textFillColor = settings.font_color != null ? settings.font_color : "0x000000";
    var textFillOpac = settings.font_opacity != null ? settings.font_opacity : 1.0;
    var olTextStrokeColor = tf.js.GetRGBAColor(textStrokeColor, textStrokeColor, textStrokeOpac);
    var olTextFillColor = tf.js.GetRGBAColor(textFillColor, textFillColor, textFillOpac);
    var bgStrokeColor = settings.border_line_color != null ? settings.border_line_color : "0x000000";
    var bgStrokeOpac = settings.border_line_opacity != null ? settings.border_line_opacity : 1.0;
    var bgStrokeWidth = settings.border_line_width != null ? settings.border_line_width : 2;
    var bgFillColor = settings.fill_color != null ? settings.fill_color : "0xffb27f";
    var bgFillOpac = settings.fill_opacity != null ? settings.fill_opacity : 1.0;
    var olBGStrokeColor = tf.js.GetRGBAColor(bgStrokeColor, bgStrokeColor, bgStrokeOpac);
    var olBGFillColor = tf.js.GetRGBAColor(bgFillColor, bgFillColor, bgFillOpac);
    var styles = tf.GetStyles(), subStyles = styles.GetSubStyles();
    var defaultFontHeighPX = subStyles.markerFontSizePXNumber;
    var aFontHeightPX = settings.font_height != null ? tf.js.GetIntNumberInRange(settings.font_height, 8, 20, defaultFontHeighPX) : defaultFontHeighPX;
    var defaultFontName = subStyles.markerFontFamily;
    var aFontName = typeof settings.font === "string" && settings.font.length ? settings.font : defaultFontName;
    var aFont = aFontHeightPX + "px " + aFontName;
    var arrow_length = settings.arrow_length ? settings.arrow_length : 12;
    var marginPix = 2;
    var marginL = marginPix, marginR = marginPix, marginT = marginPix + 1, marginB = marginPix - 1, marginX = marginL + marginR, marginY = marginT + marginB;

    ctx.font = aFont;
    ctx.strokeStyle = olTextStrokeColor;
    ctx.lineWidth = textStrokeWidth;
    ctx.fillStyle = olTextFillColor;

    if (!settings.dontTranslate) { ctx.translate(0.5, 0.5); }

    var wText = ctx.measureText(label).width;
    var hText = aFontHeightPX /*+ textStrokeWidth*/;

    //var textL = marginL + textStrokeWidth / 2;
    var textL = marginL + textStrokeWidth / 2 - 1;
    //var textT = marginT /*+ textStrokeWidth / 2*/;
    var textT = marginT - 1;


    var textBubbleW = wText + marginX + textStrokeWidth;
    //var textBubbleH = hText + marginY + textStrokeWidth;
    var textBubbleH = hText + marginY + textStrokeWidth + 1;

    textL += bgStrokeWidth / 2;
    textT += bgStrokeWidth / 2;

    textBubbleW += 2 * bgStrokeWidth;
    textBubbleH += 2 * bgStrokeWidth;

    var canvasW = textBubbleW - bgStrokeWidth + 1;
    var canvasH = textBubbleH + arrow_length - bgStrokeWidth;

    var xStrokeCoord = bgStrokeWidth / 2;
    var yStrokeCoord = bgStrokeWidth / 2;

    if (isLeft) {
        if (isTop) {
            strokeFunction = tf.canvas.StrokeFillBubbleRB;
        }
        else if (isCenterVer) {
            strokeFunction = tf.canvas.StrokeFillBubbleMidR;
            canvasW += arrow_length;
            canvasH -= arrow_length;
        }
        else {
            strokeFunction = tf.canvas.StrokeFillBubbleRT;
            yStrokeCoord += arrow_length;
            textT += arrow_length;
        }
    }
    else if (isCenterHor) {
        if (isTop) {
            strokeFunction = tf.canvas.StrokeFillBubbleMidB;
        }
        else if (isCenterVer) {
            strokeFunction = tf.canvas.StrokeFillRoundRect;
            canvasH -= arrow_length;
        }
        else {
            strokeFunction = tf.canvas.StrokeFillBubbleMidT;
            yStrokeCoord += arrow_length;
            textT += arrow_length;
        }
    }
    else {
        if (isTop) {
            strokeFunction = tf.canvas.StrokeFillBubbleLB;
        }
        else if (isCenterVer) {
            strokeFunction = tf.canvas.StrokeFillBubbleMidL;
            canvasW += arrow_length;
            canvasH -= arrow_length;
            xStrokeCoord += arrow_length;
            textL += arrow_length;
        }
        else {
            strokeFunction = tf.canvas.StrokeFillBubbleLT;
            yStrokeCoord += arrow_length;
            textT += arrow_length;
        }
    }

    var radius = tf.js.NumberClip((hText + marginY) * 0.35, 1, 10000);

    ctx.canvas.width = canvasW;
    ctx.canvas.height = canvasH;

    ctx.font = aFont;

    ctx.lineCap = "square";
    ctx.lineJoin = "round";

    //ctx.beginPath();

    ctx.clearRect(0, 0, canvasW, canvasH);
    //ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = olBGStrokeColor;
    ctx.lineWidth = bgStrokeWidth;
    ctx.fillStyle = olBGFillColor;

    if (isCenterHor && isCenterVer) { tf.canvas.StrokeFillRoundRect(ctx, xStrokeCoord, yStrokeCoord, textBubbleW - 2 * bgStrokeWidth, textBubbleH - 2 * bgStrokeWidth, radius, true, true, settings.dontTranslate); }
    else {
        ctx.beginPath();
        strokeFunction(ctx, xStrokeCoord, yStrokeCoord, textBubbleW - 2 * bgStrokeWidth, textBubbleH - 2 * bgStrokeWidth, arrow_length, radius, settings.dontTranslate);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }

    //ctx.closePath();

    ctx.strokeStyle = olTextStrokeColor;
    ctx.lineWidth = textStrokeWidth;
    ctx.textBaseline = 'top';

    if (tf.browser.GetBrowserType().isFireFox) { textT += 2; }

    if (textStrokeWidth > 0) {
        //ctx.fillStyle = olTextStrokeColor;
        //ctx.fillText(label, textL + textStrokeWidth, textT + textStrokeWidth);
        ctx.strokeText(label, textL, textT);
    }

    ctx.fillStyle = olTextFillColor;
    ctx.fillText(label, textL, textT);

    return iconAnchor;
}

/**
 * A callback that can be used with the function [CreateMemoryImage]{@link tf.canvas.CreateMemoryImage}
 * @public
 * @callback tf.types.CreateMemoryImageDrawFunction
 * @param {canvasContext} ctx - context to draw on
 * @param {object} settings - draw settings whose contents vary depending on the callback
 * @returns {tf.types.iconAnchor} - | {@link tf.types.iconAnchor} the drawing's anchor
*/

/**
 * Object returned by the function [CreateMemoryImage]{@link tf.canvas.CreateMemoryImage}
 * @public
 * @typedef tf.types.CreateMemoryImageResult
 * @property {string} image - an HTML string that can be used in places where an <b>img</b> can be used
 * @property {tf.types.iconAnchor} anchor - the image's anchor
*/

/**
 * @public
 * @function
 * @summary - Uses the given callback to draw arbitrary content on the returned memory image, created with <b>toDataURL</b>
 * @param {object} settings - image creation settings
 * @param {tf.types.CreateMemoryImageDrawFunction} settings.drawFunction - the callback to draw content
 * @param {object} settings.drawSettings - object passed to <b>drawFunction</b>
 * @returns {tf.types.CreateMemoryImageResult} - | {@link tf.types.CreateMemoryImageResult} the image and it's anchor
*/
tf.canvas.CreateMemoryImage = function (settings) {

    settings = tf.js.GetValidObjectFrom(settings);
    var drawFunction = tf.js.GetFunctionOrNull(settings.drawFunction);
    var image, anchor;

    if (!!drawFunction) {
        //var useCanvas = !!settings.canvas ? settings.canvas : tf.GetStyles().GetHiddenCanvas();
        var useCanvas = document.createElement('canvas');
        var ctx = useCanvas.getContext("2d");
        //ctx.save();
        anchor = drawFunction(ctx, settings.drawSettings);
        //image = useCanvas.toDataURL("image/png");
        //image = ctx;
        //ctx.restore();
    }
    return { image: useCanvas, anchor: anchor };//{ image: image, anchor: anchor };
}

/**
 * method tf.canvas.PaintSlider - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} canvasElem - parameter description?
 * @param {?} width - parameter description?
 * @param {?} height - parameter description?
 * @param {?} thumbConstDim - parameter description?
 * @param {?} roundRectRadius - parameter description?
 * @param {?} backFillColor - parameter description?
 * @param {?} backStrokeColor - parameter description?
 * @param {?} thumbStrokeColor - parameter description?
 * @param {?} thumbFillColor - parameter description?
 * @param {?} thumbStrokeColorNoHover - parameter description?
 * @param {?} thumbFillColorNoHover - parameter description?
 * @param {?} mouseFillColor - parameter description?
 * @param {?} pos01 - parameter description?
 * @param {?} isInHover - parameter description?
 * @param {?} mouse01 - parameter description?
*/
tf.canvas.PaintSlider = function (
    canvasElem,
    width,
    height,
    thumbConstDim,
    roundRectRadius,
    backFillColor,
    backStrokeColor,
    thumbStrokeColor,
    thumbFillColor,
    thumbStrokeColorNoHover,
    thumbFillColorNoHover,
    mouseFillColor,
    pos01,
    isInHover,
    mouse01) {

    var fill = true;
    var stroke = true;

    canvasElem.width = width;
    canvasElem.height = height;

    var ctx = canvasElem.getContext("2d");

    ctx.save();

    ctx.translate(0.5, 0.5);

    ctx.canvas.width = width;
    ctx.canvas.height = height;

    ctx.beginPath();

    ctx.clearRect(0, 0, width, height);

    ctx.closePath();

    ctx.beginPath();

    ctx.fillStyle = backFillColor;
    ctx.strokeStyle = backStrokeColor;

    ctx.lineWidth = 2;

    tf.canvas.StrokeFillRoundRect(ctx, roundRectRadius / 2, roundRectRadius / 2, width - roundRectRadius, height - roundRectRadius, roundRectRadius, fill, stroke);

    ctx.closePath();

    var mid = Math.round(width * pos01);

    ctx.beginPath();

    if (isInHover) {
        var midMouse = Math.round(width * mouse01);

        ctx.lineWidth = 1;

        ctx.strokeStyle = "#fff";
        ctx.fillStyle = mouseFillColor;

        ctx.fillRect(midMouse - thumbConstDim + 1, 1, thumbConstDim + 1, height - 2);
        //ctx.strokeRect(midMouse - thumbConstDim, 1, thumbConstDim + 1, height - 2);
    }
    else {
        ctx.fillStyle = thumbStrokeColorNoHover;
        ctx.fillStyle = thumbFillColorNoHover;
        ctx.fillRect(2, 2, mid, height - 4);
    }

    ctx.closePath();

    ctx.lineWidth = 2;

    mid = Math.round(width * pos01);

    ctx.beginPath();

    ctx.strokeStyle = thumbStrokeColor;
    ctx.fillStyle = thumbFillColor;

    ctx.fillRect(mid - thumbConstDim + 1, 0, thumbConstDim + 1, height);
    //ctx.strokeRect(mid - thumbConstDim, 0, thumbConstDim + 1, height);

    ctx.closePath();

    ctx.restore();
};

/**
 * class tf.dom.Canvas - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
*/
tf.dom.Canvas = function () {

    var theThis = null, canvasElem = null, canvasCtx = null, repaintCallBack = null, repaintCallBackThis = null;

/**
 * method tf.dom.Canvas.Repaint - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Repaint = function () { return paintCanvas(); }

/**
 * method tf.dom.Canvas.SetRepaint - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} repaintCallBackSet - parameter description?
 * @param {?} repaintCallBackThisSet - parameter description?
*/
    this.SetRepaint = function (repaintCallBackSet, repaintCallBackThisSet) {
        repaintCallBack = tf.js.GetFunctionOrNull(repaintCallBackSet);
        repaintCallBackThis = repaintCallBackThisSet;
    }

    function paintCanvas() {
        if (!!repaintCallBack) {
            var pixWidth = canvasElem.clientWidth; var pixHeight = canvasElem.clientHeight; canvasElem.width = pixWidth; canvasElem.height = pixHeight;
            canvasCtx.save(); repaintCallBack.call(repaintCallBackThis, theThis, canvasCtx, pixWidth, pixHeight); canvasCtx.restore();
        }
    }

    function initialize() {
        var divObj = new tf.dom.Div({ cssClass: tf.GetStyles().GetUnPaddedDivClassNames(false, true) });
        canvasElem = document.createElement('canvas');
        canvasElem.style.width = '100%';
        canvasElem.style.height = '100%';
        canvasCtx = canvasElem.getContext("2d");
        divObj.AddContent(canvasElem);
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: divObj.GetHTMLElement() });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
}
tf.js.InheritFrom(tf.dom.Canvas, tf.dom.Insertable);

/**
 * class tf.ui.CanvasSlider - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} initPos01 - parameter description?
 * @param {?} controlHeight - parameter description?
 * @param {?} hoverDrawBool - parameter description?
*/
tf.ui.CanvasSlider = function (initPos01, controlHeight, hoverDrawBool) {

    var theThis, docMouseListener, styles;
    var paintSlider, slideConstDim, thumbConstDim;
    var divObj, divElem, canvasElem, pos01, hover01, mouse01;
    var thumbFillColorHover, thumbStrokeColorHover, backFillColorHover, backStrokeColorHover;
    var thumbFillColorNoHover, thumbStrokeColorNoHover, backFillColorNoHover, backStrokeColorNoHover;
    var thumbFillColor, thumbStrokeColor, backFillColor, backStrokeColor;
    var mouseFillColor;
    var mouseMoveCallBack, thisMouseMoveCallBack;
    var clickCallBack, thisClickCallBack;
    var hoverCallBack, thisHoverCallBack;
    var hoverListener;
    var isInHover;
    var isInDrag;

/**
 * method tf.ui.CanvasSlider.GetIsInDrag - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetIsInDrag = function () { return isInDrag; }
/**
 * method tf.ui.CanvasSlider.GetIsInHover - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetIsInHover = function () { return isInHover; }
/**
 * method tf.ui.CanvasSlider.GetHover01 - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetHover01 = function () { return hover01; }
/**
 * method tf.ui.CanvasSlider.GetMouse01 - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetMouse01 = function () { return mouse01; }

/**
 * method tf.ui.CanvasSlider.SetOnClickListener - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} theCallBack - parameter description?
 * @param {?} theThisForCallBack - parameter description?
*/
    this.SetOnClickListener = function (theCallBack, theThisForCallBack) {
        clickCallBack = typeof theCallBack === "function" ? theCallBack : null;
        thisClickCallBack = theThisForCallBack;
    }

/**
 * method tf.ui.CanvasSlider.SetOnHoverListener - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} theCallBack - parameter description?
 * @param {?} theThisForCallBack - parameter description?
*/
    this.SetOnHoverListener = function (theCallBack, theThisForCallBack) {
        hoverCallBack = typeof theCallBack === "function" ? theCallBack : null;
        thisHoverCallBack = theThisForCallBack;
    }

/**
 * method tf.ui.CanvasSlider.SetOnMouseMoveListener - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} theCallBack - parameter description?
 * @param {?} theThisForCallBack - parameter description?
*/
    this.SetOnMouseMoveListener = function (theCallBack, theThisForCallBack) {
        mouseMoveCallBack = typeof theCallBack === "function" ? theCallBack : null;
        thisMouseMoveCallBack = theThisForCallBack;
    }

/**
 * method tf.ui.CanvasSlider.Repaint - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Repaint = function () { paintCanvas(); }

/**
 * method tf.ui.CanvasSlider.SetPos01 - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} pos01Set - parameter description?
*/
    this.SetPos01 = function (pos01Set) { return setPos01(pos01Set, true); }
/**
 * method tf.ui.CanvasSlider.GetPos01 - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetPos01 = function () { return pos01; }
/**
 * method tf.ui.CanvasSlider.SetColors - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} thumbFillColorSet - parameter description?
 * @param {?} thumbStrokeColorSet - parameter description?
 * @param {?} backFillColorSet - parameter description?
 * @param {?} backStrokeColorSet - parameter description?
*/
    this.SetColors = function (thumbFillColorSet, thumbStrokeColorSet, backFillColorSet, backStrokeColorSet) { return setColors(thumbFillColorSet, thumbStrokeColorSet, backFillColorSet, backStrokeColorSet); }

/**
 * method tf.ui.CanvasSlider.SetMouseFillColor - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} mouseFillColorSet - parameter description?
*/
    this.SetMouseFillColor = function (mouseFillColorSet) { mouseFillColor = mouseFillColorSet; paintCanvas(); }

    function setColors(thumbFillColorSet, thumbStrokeColorSet, backFillColorSet, backStrokeColorSet) {
        thumbFillColor = thumbFillColorSet;
        thumbStrokeColor = thumbStrokeColorSet;
        backFillColor = backFillColorSet;
        backStrokeColor = backStrokeColorSet;
    }

    function setPos01(pos01Set, doRepaint) {
        pos01 = tf.js.GetFloatNumberInRange(pos01Set, 0, 1, 0.5);
        if (doRepaint) { paintCanvas(); }
    }

    function setPosSlideColors(hoverColorsBool) {
        if (!!hoverColorsBool && hoverDrawBool) {
            setColors(thumbFillColorHover, thumbStrokeColorHover, backFillColorHover, backStrokeColorHover);
        }
        else {
            setColors(thumbFillColorNoHover, thumbStrokeColorNoHover, backFillColorNoHover, backStrokeColorNoHover);
        }
    }

    function paintCanvas() {
        var roundRectRadius = 2;
        paintSlider(canvasElem, divElem.clientWidth, divElem.clientHeight, thumbConstDim, roundRectRadius,
            backFillColor, backStrokeColor, thumbStrokeColor, thumbFillColor, thumbStrokeColorNoHover, thumbFillColorNoHover, mouseFillColor,
            pos01, isInHover && !isInDrag && hoverDrawBool, mouse01);
    }

    function notifyPos01Change() { if (clickCallBack) { clickCallBack.call(thisClickCallBack, theThis, pos01); } }

    function onMouseEvent(ev) {
        var mousePosXY = !!ev.mouseCoords ? ev.mouseCoords : tf.events.GetMouseEventCoords(ev);
        var width = divElem ? divElem.offsetWidth : 0;
        var click01;
        
        if (width > 0) {
            mousePosXY[0] = tf.js.NumberClip(mousePosXY[0], 0, width);
            click01 = mousePosXY[0] / width;
        }
        else {
            click01 = 0;
        }

        if (isInDrag) {
            if (click01 != pos01) {
                setPos01(click01, true);
                notifyPos01Change();
            }
        }
        else if (click01 != mouse01) { mouse01 = click01; }

        if (mouseMoveCallBack) {
            mouseMoveCallBack.call(thisClickCallBack, theThis, mouse01);
        }
    }

    function onMouseDnSlide(ev) { isInDrag = true; /*docMouseListener.SetCapture(onMouseEvent, theThis, null);*/ onMouseEvent(ev); }

    function onMouseUpSlide(ev) { isInDrag = false; /*docMouseListener.ReleaseCapture();*/ onMouseEvent(ev); }

    function onMouseMoveSlide(ev) { onMouseEvent(ev); }

    var wasInHover = false;

    function onHover() {

        if (isInHover = hoverListener.GetIsInHover()) {
            isInDrag = false;
        }

        setPosSlideColors(isInHover);

        if (wasInHover != isInHover) {
            wasInHover = isInHover;
            paintCanvas();
        }

        var mousePosXY = tf.events.GetMouseEventCoords(hoverListener.GetLastEvent());

        var width = divElem ? divElem.offsetWidth : 0;
        var click01 = width ? mousePosXY[0] / width : 0;

        if (click01 != hover01) {
            hover01 = click01;
            if (hoverCallBack) { hoverCallBack.call(thisHoverCallBack, theThis, hover01); }
        }
    }

    function initialize() {

        styles = tf.GetStyles();

        paintSlider = tf.canvas.PaintSlider;
        slideConstDim = controlHeight ? controlHeight : "0.8em";
        thumbConstDim = 4;

        mouseFillColor = styles.GetSubStyles().disabledTextColor;

        thumbFillColorHover = "#FFF"; thumbStrokeColorHover = styles.GetButtonBGColor(true); backFillColorHover = styles.GetButtonBGColor(true); backStrokeColorHover = "#333";
        thumbFillColorNoHover = styles.GetButtonBGColor(true); thumbStrokeColorNoHover = styles.GetButtonBGColor(true); backFillColorNoHover = "#fff"; backStrokeColorNoHover = "#bfbfbf";

        thumbFillColor = thumbFillColorNoHover;
        thumbStrokeColor = thumbStrokeColorNoHover;
        backFillColor = backFillColorHover;
        backStrokeColor = backStrokeColorHover;

        isInHover = isInDrag = false;

        docMouseListener = tf.GetDocMouseListener();
        hoverDrawBool = !!hoverDrawBool;

        divObj = new tf.dom.Div({ cssClass: styles.unPaddedBlockDivClass });
        divElem = divObj.GetHTMLElement();

        canvasElem = document.createElement('canvas');
        canvasElem.style.width = '100%';
        canvasElem.style.height = '100%';

        divElem.style.height = slideConstDim;
        divElem.style.width = "1px";

        var listeners = {
            "mousemove": onMouseMoveSlide,
            "mouseup": onMouseUpSlide,
            "mousedown": onMouseDnSlide
        };

        for (var i in listeners) { tf.events.AddDOMEventListener(divElem, i, listeners[i]); }

        hoverListener = new tf.events.DOMHoverListener({ target: divElem, callBack: onHover, optionalScope: theThis, callBackSettings: null });

        setPos01(initPos01, false);

        setPosSlideColors(false);

        divObj.AddContent(canvasElem);

        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: divObj });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.ui.CanvasSlider, tf.dom.Insertable);
