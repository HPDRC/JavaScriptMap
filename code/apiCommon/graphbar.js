"use strict";

/**
 * class tf.canvas.GraphBar - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
*/
tf.canvas.GraphBar = function () {

    var values, attributeName, minValue, maxValue, deltaValues, nValues;

    var isInHover = false, curIndex = undefined, hoverIndex = undefined;

/**
 * method tf.canvas.GraphBar.GetTime01FromGraphCol - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} graphCol - parameter description?
*/
    this.GetTime01FromGraphCol = function (graphCol) { return tf.js.NumberClip ((graphCol - graphLeft) / graphWidth, 0, 1); }

/**
 * method tf.canvas.GraphBar.GetRepaintFunction - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetRepaintFunction = function () { return repaint; }
/**
 * method tf.canvas.GraphBar.SetData - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} valuesSet - parameter description?
 * @param {?} attributeNameSet - parameter description?
 * @param {?} minValueSet - parameter description?
 * @param {?} maxValueSet - parameter description?
*/
    this.SetData = function (valuesSet, attributeNameSet, minValueSet, maxValueSet) {
        values = valuesSet;
        attributeName = attributeNameSet;
        minValue = minValueSet;
        maxValue = maxValueSet;

        nValues = values.length;
        deltaValues = maxValue - minValue;
    }

/**
 * method tf.canvas.GraphBar.SetIsInHover - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} bool - parameter description?
*/
    this.SetIsInHover = function (bool) { isInHover = !!bool; }
/**
 * method tf.canvas.GraphBar.GetIsInHover - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetIsInHover = function () { return isInHover; }
/**
 * method tf.canvas.GraphBar.SetCurIndex - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} curIndexSet - parameter description?
*/
    this.SetCurIndex = function (curIndexSet) { curIndex = curIndexSet; }
/**
 * method tf.canvas.GraphBar.SetHoverIndex - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} hoverIndexSet - parameter description?
*/
    this.SetHoverIndex = function (hoverIndexSet) { hoverIndex = hoverIndexSet; }

    var theThis = null;
    var styles = tf.GetStyles();
    var subStyles = styles.GetSubStyles();

    var graphLineW = 2;
    var graphLineHalfW = graphLineW / 2;
    var graphRadiusCur = 3;
    var graphDiameterCur = 2 * graphRadiusCur;

    var graphPixW, graphPixH, graphTop, graphBot, graphHeight, graphLeft, graphRight, graphWidth;

    function calcDims(pixWidth, pixHeight) {
        graphPixW = pixWidth;
        graphPixH = pixHeight;

        graphTop = graphRadiusCur + 1;
        graphBot = graphPixH - graphRadiusCur;
        graphHeight = graphBot - graphTop - 1;
        graphLeft = graphRadiusCur;
        graphRight = graphPixW - graphRadiusCur;
        graphWidth = graphRight - graphLeft - 1;
    }

    function paintIndexMarker(canvasCtx, lineColor, backGroundColor, curCol, curRow) {
        canvasCtx.strokeStyle = lineColor;
        canvasCtx.beginPath(); canvasCtx.moveTo(curCol, 1); canvasCtx.lineTo(curCol, graphPixH); canvasCtx.closePath(); canvasCtx.stroke();

        canvasCtx.fillStyle = backGroundColor;
        canvasCtx.beginPath(); tf.canvas.circle(canvasCtx, curCol - graphRadiusCur, curRow - graphRadiusCur, graphDiameterCur); canvasCtx.closePath(); canvasCtx.fill(); canvasCtx.stroke();

        canvasCtx.fillStyle = lineColor;
        canvasCtx.beginPath(); canvasCtx.fillRect(curCol - 0.5, curRow - 0.5, 1, 1); canvasCtx.closePath(); canvasCtx.stroke();
    }

    function getPixCol(index) { return nValues > 0 ? graphWidth / (nValues - 1) * index + graphLeft : 0; }

    function getPixRowForValue(value) {
        var thisDelta = value - minValue;
        var delta01 = thisDelta / deltaValues;
        var row = graphHeight * delta01;
        return graphPixH - (row + graphTop);
    }

    function getPixRowForIndex(index) {
        var middleRow = graphTop + graphHeight / 2;
        return deltaValues > 0 && index < nValues && nValues > 0 ? getPixRowForValue(values[index][attributeName]) : middleRow;
    }

    function paintIndex(canvasCtx, lineColor, backGroundColor, index) { paintIndexMarker(canvasCtx, lineColor, backGroundColor, getPixCol(index), getPixRowForIndex(index)); }

    function repaint(theCanvasObj, canvasCtx, pixWidth, pixHeight) {

        calcDims(pixWidth, pixHeight);

        var borderColor = subStyles.borderLightColor;
        var backGroundColor = styles.GetButtonBGColor(false);
        var lineColor = styles.GetButtonBGColor(true);

        if (isInHover) { var temp = lineColor; lineColor = backGroundColor; backGroundColor = temp; }

        canvasCtx.lineWidth = 1;
        canvasCtx.strokeStyle = borderColor;
        canvasCtx.fillStyle = backGroundColor;
        canvasCtx.imageSmoothingEnabled = false;

        //canvasCtx.imageSmoothingEnabled = true;
        //canvasCtx.translate(0.5, 0.5);

        canvasCtx.beginPath();
        canvasCtx.fillRect(0, 0, graphPixW, graphPixH);
        canvasCtx.strokeRect(0, 0, graphPixW, graphPixH);
        canvasCtx.closePath();

        canvasCtx.lineWidth = graphLineW;
        canvasCtx.strokeStyle = lineColor;

        canvasCtx.beginPath();

        var prev = nValues ? values[0] : null;
        var prevCol = graphLeft, prevRow = getPixRowForIndex(0);

        for (var i in values) {
            var cur = values[i], col = getPixCol(i), row = getPixRowForIndex(i);
            canvasCtx.moveTo(prevCol, prevRow); canvasCtx.lineTo(col, row);
            prevCol = col; prevRow = row; prev = cur;
        }

        canvasCtx.closePath();
        canvasCtx.stroke();

        if (curIndex !== undefined) { paintIndex(canvasCtx, lineColor, backGroundColor, curIndex); }

        if (isInHover && hoverIndex !== undefined) { paintIndex(canvasCtx, borderColor, backGroundColor, hoverIndex); }

        if (maxValue > 0 && minValue < 0) {
            var zeroRow = getPixRowForValue(0);
            canvasCtx.strokeStyle = "rgba(192, 0, 0, 0.5)"; canvasCtx.lineWidth = 0; canvasCtx.setLineDash([7, 14]);
            canvasCtx.beginPath(); canvasCtx.moveTo(graphLeft, zeroRow); canvasCtx.lineTo(graphRight, zeroRow); canvasCtx.closePath();
            canvasCtx.stroke();
        }
    }

    function initialize() { }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};