"use strict";

tf.consts.measureColorTicDefaultHybrid = "#fff";
tf.consts.measureColorTicDefaultMap = "#1E90FF";


tf.js.CalcVertexInfos = function (lineString, area, distanceFunction) {
    var vertexInfos = [];
    if (tf.js.GetIsNonEmptyArray(lineString)) {
        var distanceFunctionUse = tf.js.GetFunctionOrNull(distanceFunction) ? distanceFunction : tf.units.GetHaversineDistance;
        var nPoints = lineString.length;
        if (nPoints > 0) {
            var thisPoint = lineString[0], totalDistance = 0;
            var twoPI = 2 * Math.PI;
            var minRotateTextAngle = Math.PI / 2;
            var maxRotateTextAngle = 3 * minRotateTextAngle;
            for (var i = 1; i < nPoints + 1; ++i) {
                var nextPoint = i < nPoints ? lineString[i] : lineString[0];
                var midCoords = [thisPoint[0] + (nextPoint[0] - thisPoint[0]) / 2, thisPoint[1] + (nextPoint[1] - thisPoint[1]) / 2]
                var distanceToNext = distanceFunctionUse(thisPoint, nextPoint);
                var headingToNext = tf.units.NormalizeAngle0To2PI(tf.units.GetMapHeading(thisPoint, nextPoint));
                var normal = Math.PI - headingToNext;
                var textDirection = twoPI - headingToNext;
                var endTextAlign;

                if (distanceToNext <= 0) { distanceToNext = 0.000001; }

                var uprightTextDirection = textDirection;

                if (textDirection > minRotateTextAngle && textDirection < maxRotateTextAngle) { textDirection += Math.PI; endTextAlign = "right"; }
                else { endTextAlign = "left"; }

                var textFlowDirection = tf.units.NormalizeAngle0To2PI(textDirection + Math.PI / 2);

                var vertexInfo = {
                    coords: thisPoint.slice(0), nextCoords: nextPoint.slice(0), midCoords: midCoords,
                    headingToNext: headingToNext, normal: normal, uprightTextDirection: uprightTextDirection, textDirection: textDirection, textFlowDirection: textFlowDirection, endTextAlign: endTextAlign,
                    distanceToNext: distanceToNext, totalDistance: totalDistance,
                    index: i
                };

                if (i == nPoints) { vertexInfo.area = area; }

                vertexInfos.push(vertexInfo);

                thisPoint = nextPoint;
                totalDistance += distanceToNext;
            }
        }
    }
    return vertexInfos;
};

tf.js.CalcClippedVertexInfo = function (map, vi, nPoints, optionalExtent, optionalMapRotation, distanceFunction, clipFunction) {
    var pvi;
    var extent = optionalExtent != undefined ? optionalExtent : map.GetVisibleExtent();
    var distanceFunctionUse = tf.js.GetFunctionOrNull(distanceFunction) ? distanceFunction : tf.units.GetHaversineDistance;
    var clipFunctionUse = tf.js.GetFunctionOrNull(clipFunction) ? clipFunction : tf.js.ClipLineSegment;
    var lineClip = clipFunctionUse(extent, vi.coords, vi.nextCoords);
    if (lineClip.intersects) {
        var mapRotation = optionalMapRotation != undefined ? optionalMapRotation : map.GetRotationRad();
        var coordsPx = map.ActualMapToPixelCoords(vi.coords);
        var nextCoordsPx = map.ActualMapToPixelCoords(vi.nextCoords);
        var midCoordsPx = map.ActualMapToPixelCoords(vi.midCoords);
        var coordsClip = lineClip.startCoord;
        var nextCoordsClip = lineClip.endCoord;
        var coordsClipPx = map.ActualMapToPixelCoords(coordsClip);
        var nextCoordsClipPx = map.ActualMapToPixelCoords(nextCoordsClip);
        var lengthXPx = nextCoordsPx[0] - coordsPx[0];
        var lengthYPx = nextCoordsPx[1] - coordsPx[1];
        var lengthSegPxSq = lengthXPx * lengthXPx + lengthYPx * lengthYPx;
        var lengthSegPx = Math.sqrt(lengthSegPxSq);
        var textDirectionWithRotation = vi.textDirection + mapRotation;
        var coordsIsVisible = !lineClip.clippedStart;
        var nextCoordsIsVisible = !lineClip.clippedEnd;
        var invisibleStartDistance = distanceFunctionUse(vi.coords, coordsClip);
        var invisibleEndDistance = distanceFunctionUse(vi.nextCoords, nextCoordsClip);
        pvi = {
            vi: vi,
            coordsPx: coordsPx, nextCoordsPx: nextCoordsPx, midCoordsPx: midCoordsPx,
            coordsClip: coordsClip, nextCoordsClip: nextCoordsClip, coordsClipPx: coordsClipPx, nextCoordsClipPx: nextCoordsClipPx,
            coordsIsVisible: coordsIsVisible, nextCoordsIsVisible: nextCoordsIsVisible,
            invisibleStartDistance: invisibleStartDistance, invisibleEndDistance: invisibleEndDistance,
            lengthXPx: lengthXPx, lengthYPx: lengthYPx, lengthSegPxSq: lengthSegPxSq, lengthSegPx: lengthSegPx,
            textDirectionWithRotation: textDirectionWithRotation,
            isLast: vi.index == nPoints
        };
    }
    return pvi;
};

tf.js.CalcDisplayDistances = function (totalDistance, useUSScale, mapResolution, distances3Units) {
    var distanceTicScaleInMeters0 = 100;
    var distanceTicScaleInMetersTry = distanceTicScaleInMeters0 * mapResolution;
    var useMiles = totalDistance > 1609;
    var distanceChoicesUse = useUSScale ? (useMiles ? distances3Units.distancesInMiles : distances3Units.distancesInFeet) : distances3Units.distancesInMeters;
    var distanceUnitText;

    if (useUSScale) { if (useMiles) { distanceUnitText = 'mi'; } else { distanceUnitText = 'ft'; } }
    else { if (totalDistance > 999.5) { distanceUnitText = "km"; } else { distanceUnitText = "m"; } }

    var indexDistance = tf.js.BinarySearchGetExactOrNextIndex(distanceChoicesUse, distanceTicScaleInMetersTry, function (a, b) { return a < b ? -1 : (a > b ? 1 : 0); })

    var distanceMarkScaleInMeters = distanceChoicesUse[indexDistance];
    var distanceTicScaleInMeters = distanceMarkScaleInMeters / 10;
    var offsetMetersEndSegText = (distanceTicScaleInMeters0 / 8) * mapResolution;
    var nTics = Math.floor(totalDistance / distanceTicScaleInMeters);

    return {
        distanceUnitText: distanceUnitText,
        distanceMarkScaleInMeters: distanceMarkScaleInMeters, distanceTicScaleInMeters: distanceTicScaleInMeters,
        offsetMetersEndSegText: offsetMetersEndSegText, nTics: nTics
    }
};

tf.js.FormatDistanceText = function (distanceInMeters, distanceUnitText, isArea) {
    var distanceText;
    if (distanceInMeters > 0) {
        var divisor;
        //if (isArea && distanceUnitText == 'ft' && distanceInMeters > 5280 * 10) { distanceUnitText = 'mi'; }
        switch (distanceUnitText) {
            default: case 'm': divisor = 1; break;
            case 'km': divisor = 1000; break;
            case 'mi': divisor = 1609.34; break;
            case 'ft': divisor = 0.3048; break;
        }
        if (isArea) { divisor *= divisor; }
        distanceInMeters /= divisor;
        distanceText = '' + distanceInMeters.toFixed(3);
        var countZeros = 0, len = distanceText.length;
        while (len > 1 && distanceText[len - 1] == '0') { --len; ++countZeros; }
        if (countZeros > 0) {
            distanceText = distanceText.slice(0, -countZeros);
            if (distanceText[distanceText.length - 1] == '.') { distanceText = distanceText.slice(0, -1); }
        }
        distanceText += ' ' + distanceUnitText;
        if (isArea) { distanceText += "\u00B2"; }
    }
    else { distanceText = "0"; }
    return distanceText;
};

/*
map, ctx, pvi, distances, mapRotation, showIntermediateLenghts, colorTicNormalHybrid, colorTicNormalMap,
    optionalMapResolution, optionalShowingHybrid, optionalHybridTextStyle, optionalMapTextStyle
*/

tf.js.DrawMeasuredVertex = function (drawSettings) {

    var pixelRatio = tf.browser.GetDevicePixelRatio();

    function showText(textShowSettings, ctx, theText, textX, textY, textDirection, textAlign) {
        var fontSize = parseInt(textShowSettings.fontSize, 10) * pixelRatio + 'px';
        ctx.font = textShowSettings.fontWeight + " " + fontSize + " " + textShowSettings.fontFamily;
        ctx.textAlign = textAlign != undefined ? textAlign : "center";
        ctx.textBaseline = 'middle';

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (!tf.browser.Type.isFireFox) {
            ctx.shadowColor = "rgba(255,255,255,1)";
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }

        ctx.translate(textX * pixelRatio, textY * pixelRatio);
        ctx.rotate(textDirection);

        ctx.fillStyle = textShowSettings.textFill;
        ctx.strokeStyle = textShowSettings.textLine;
        ctx.lineWidth = textShowSettings.lineWidth * pixelRatio;
        ctx.strokeText(theText, 0, 0);
        ctx.fillText(theText, 0, 0);

        ctx.restore();
    };

    function showDistanceText(textShowSettings, ctx, distanceInMeters, textX, textY, textDirection, textAlign, showingHybrid, distanceUnitText) {
        showText(textShowSettings, ctx, tf.js.FormatDistanceText(distanceInMeters, distanceUnitText, false), textX, textY, textDirection, textAlign);
    };

    function showAreaText(textShowSettings, ctx, areaInSqMeters, textX, textY, textDirection, textAlign, showingHybrid, distanceUnitText) {
        showText(textShowSettings, ctx, tf.js.FormatDistanceText(areaInSqMeters, distanceUnitText, true), textX, textY, textDirection, textAlign);
    };

    function offsetMetersInSegToPixelCoords(pvi, offsetMetersInSeg) {
        var vi = pvi.vi, segLen = vi.distanceToNext > 0 ? vi.distanceToNext : 0.000001;
        var dSeg = offsetMetersInSeg / segLen;
        var xPx = pvi.coordsPx[0] + dSeg * pvi.lengthXPx;
        var yPx = pvi.coordsPx[1] + dSeg * pvi.lengthYPx;
        return [xPx, yPx];
    };

    var largerFontSize = drawSettings.largerFontSize != undefined ? drawSettings.largerFontSize : "16px";
    var map = drawSettings.map;
    var showingHybrid = drawSettings.showingHybrid != undefined ? !!drawSettings.showingHybrid : map.GetMapType() != tf.consts.typeNameMap;

    var textShowSettings = drawSettings.textStyle != undefined ? drawSettings.textStyle :
        (showingHybrid ?
            { fontFamily: "Roboto", lineWidth: 4, textFill: "#fff", textLine: "rgba(0, 0, 0, 0.7)", fontSize: "12px", fontWeight: "400" } :
            { fontFamily: "Roboto", lineWidth: 1, textFill: "#000", textLine: "rgba(30, 144, 255, 0.7)", fontSize: "11px", fontWeight: "300" });

    var endTextShowSettings = drawSettings.endTextStyle != undefined ?
        tf.js.ShallowMerge(textShowSettings, drawSettings.endTextStyle) : tf.js.ShallowMerge(textShowSettings, { fontSize: largerFontSize });

    var distances = drawSettings.distances;
    var distanceUnitText = distances.distanceUnitText;
    var distanceMarkScaleInMeters = distances.distanceMarkScaleInMeters;
    var distanceTicScaleInMeters = distances.distanceTicScaleInMeters;
    var offsetMetersEndSegText = distances.offsetMetersEndSegText;
    var nTics = distances.nTics;

    var pvi = drawSettings.pvi;
    var vi = pvi.vi;
    var res = drawSettings.resolution != undefined ? drawSettings.resolution : map.GetResolution();
    var distanceDisplace0 = 2 * res, distanceDisplace = 6 * res, startDisplaceHeight = 0.3;
    var heightText = 2.5, textEndSegOffsetPxInt = 36, textEndSegOffsetVal = textEndSegOffsetPxInt * textEndSegOffsetPxInt;

    var displacedMid = tf.units.DisplaceMapCoords(vi.midCoords, vi.normal, distanceDisplace);
    var displacedMidPx = map.ActualMapToPixelCoords(displacedMid);
    var displaceXPx = displacedMidPx[0] - pvi.midCoordsPx[0], displaceYPx = displacedMidPx[1] - pvi.midCoordsPx[1];

    var colorTic = drawSettings.colorTic != undefined ? drawSettings.colorTic : (showingHybrid ? tf.consts.measureColorTicDefaultHybrid : tf.consts.measureColorTicDefaultMap);

    var distanceAtSegStart = vi.totalDistance, distanceAtSegEnd = distanceAtSegStart + vi.distanceToNext;
    var startVisibleDistance = distanceAtSegStart + pvi.invisibleStartDistance;
    var endVisibleDistance = distanceAtSegEnd - pvi.invisibleEndDistance;
    var firstTicIndex = startVisibleDistance / distanceTicScaleInMeters;
    var firstTicIndexInt = Math.floor(firstTicIndex);

    if (firstTicIndex != firstTicIndexInt) { ++firstTicIndexInt; }

    var lastTicIndex = endVisibleDistance / distanceTicScaleInMeters;
    var lastTicIndexInt = Math.floor(lastTicIndex);

    //lastTicIndexInt = firstTicIndexInt - 1;

    var ctx = drawSettings.ctx;

    for (var iTicIndex = firstTicIndexInt; iTicIndex <= lastTicIndexInt; ++iTicIndex) {
        var distanceTic = iTicIndex * distanceTicScaleInMeters;
        var distanceInSegMeters = distanceTic - distanceAtSegStart;
        var ticCoordsPx = offsetMetersInSegToPixelCoords(pvi, distanceInSegMeters);
        var xPx = ticCoordsPx[0] + displaceXPx * startDisplaceHeight;
        var yPx = ticCoordsPx[1] + displaceYPx * startDisplaceHeight;
        var heightTic, colorTic, widthTic, needText = false;

        if (iTicIndex % 5 == 0) {
            if (iTicIndex % 2 == 0) {
                heightTic = 1.25; widthTic = 2; colorTic = colorTic;
                //needText = vi.distanceToNext > distanceInSegMeters + 1 * distanceTicScaleInMeters;
                needText = !drawSettings.skipScaleText;
            }
            else { heightTic = 1; widthTic = 2; colorTic = colorTic; }
        }
        else { heightTic = 0.75; widthTic = 1; colorTic = colorTic; }

        if (!drawSettings.skipTics) {
            var xPx2 = xPx + displaceXPx * heightTic;
            var yPx2 = yPx + displaceYPx * heightTic;

            ctx.beginPath();
            ctx.strokeStyle = colorTic;
            ctx.lineWidth = widthTic * pixelRatio;
            ctx.moveTo(xPx * pixelRatio, yPx * pixelRatio);
            ctx.lineTo(xPx2 * pixelRatio, yPx2 * pixelRatio);
            ctx.closePath(); ctx.fill(); ctx.stroke();
        }

        if (needText) {
            var xPxT = ticCoordsPx[0] + displaceXPx * heightText;
            var yPxT = ticCoordsPx[1] + displaceYPx * heightText;
            showDistanceText(textShowSettings, ctx, distanceTic, xPxT, yPxT, pvi.textDirectionWithRotation, "center", showingHybrid, distanceUnitText);
        }
    }

    var needEndSegDistance = (drawSettings.showIntermediateLenghts && lastTicIndex > firstTicIndex + 1 )|| pvi.isLast;

    if (needEndSegDistance) {
        var distanceToShowAt = vi.distanceToNext + offsetMetersEndSegText + (12 * res);
        var textSegCoordsPx = offsetMetersInSegToPixelCoords(pvi, distanceToShowAt);
        var xPxT = textSegCoordsPx[0];
        var yPxT = textSegCoordsPx[1];
        var showSettingsUse = pvi.isLast ? endTextShowSettings : textShowSettings;

        showDistanceText(showSettingsUse, ctx, distanceAtSegEnd, xPxT, yPxT, pvi.textDirectionWithRotation, vi.endTextAlign, showingHybrid, distanceUnitText);
        if (vi.area != undefined) {
            var rotation = drawSettings.rotation != undefined ? drawSettings.rotation : map.GetRotationRad();
            var textDisplaceDistance = 18 * res;
            var displacedTextMid = tf.units.DisplaceMapCoords(vi.midCoords, vi.uprightTextDirection + rotation, textDisplaceDistance);
            var displacedTextMidPx = map.ActualMapToPixelCoords(displacedTextMid);
            var xPxT2 = displacedTextMidPx[0];
            var yPxT2 = displacedTextMidPx[1];
            showAreaText(showSettingsUse, ctx, vi.area, xPxT2, yPxT2, pvi.textDirectionWithRotation, "center", showingHybrid, distanceUnitText);
        }
    }

    return lastTicIndexInt - firstTicIndexInt + 1;
};


/*
vertexInfos, showArea, distances3Units, *extent, *rotation, *useUSScale, *resolution, *showIntermediateLenghts, *showingHybrid, *colorTic, *colorSeg, *textStyle, *distanceFunction, *clipFunction
*/
tf.js.DrawMeasuredVertices = function (drawSettings) {

    var distances, vertexExtent;
    var nTicsDrawn = 0, nTics = 0;
    var totalDistance = 0, area = 0;
    var vertexInfos = drawSettings.vertexInfos;

    if (tf.js.GetIsNonEmptyArray(vertexInfos)) {
        var nPoints = vertexInfos.length;
        if (nPoints >= 2) {
            var map = drawSettings.map;
            var extent = drawSettings.extent != undefined ? drawSettings.extent : map.GetVisibleExtent();
            var rotation = drawSettings.rotation != undefined ? drawSettings.rotation : map.GetRotationRad();
            var showArea = !!drawSettings.showArea;

            if (nPoints == 2) { nPoints = 1; showArea = false } else { if (!showArea) { --nPoints; } }

            var isUSScale = drawSettings.useUSScale != undefined ? !!drawSettings.useUSScale : map.GetIsUSScaleUnits();
            var res = drawSettings.resolution != undefined ? drawSettings.resolution : map.GetResolution();

            var distanceFunctionUse = tf.js.GetFunctionOrNull(drawSettings.distanceFunction) ? drawSettings.distanceFunction : tf.units.GetHaversineDistance;
            var clipFunctionUse = tf.js.GetFunctionOrNull(drawSettings.clipFunction) ? drawSettings.clipFunction : tf.js.ClipLineSegment;

            totalDistance = vertexInfos[nPoints - 1].totalDistance + vertexInfos[nPoints - 1].distanceToNext;
            distances = tf.js.CalcDisplayDistances(totalDistance, isUSScale, res, drawSettings.distances3Units);

            var pvis = [];

            for (var i = 0; i < nPoints; ++i) {
                var vi = vertexInfos[i], pvi = tf.js.CalcClippedVertexInfo(map, vi, nPoints, extent, rotation, distanceFunctionUse, clipFunctionUse);
                if (vi.area != undefined) { area = vi.area; }
                vertexExtent = tf.js.UpdateMapExtent(vertexExtent, vi.coords);
                vertexExtent = tf.js.UpdateMapExtent(vertexExtent, vi.nextCoords);
                if (pvi != undefined) { pvis.push(pvi); }
            }

            var npvis = pvis.length;

            if (npvis > 0) {
                var pixelRatio = tf.browser.GetDevicePixelRatio();

                var showingHybrid = drawSettings.showingHybrid != undefined ? drawSettings.showingHybrid : map.GetMapType() != tf.consts.typeNameMap;
                var colorTic = drawSettings.colorTic != undefined ? drawSettings.colorTic : (showingHybrid ? tf.consts.measureColorTicDefaultHybrid : tf.consts.measureColorTicDefaultMap);
                var showIntermediateLenghts = drawSettings.showIntermediateLenghts != undefined ? !!drawSettings.showIntermediateLenghts : true;
                var ctx = drawSettings.ctx;

                nTics = distances.nTics;
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.setLineDash([]);
                if (!drawSettings.skipEdges) {
                    var segWidth = drawSettings.lineWidth != undefined ? drawSettings.lineWidth : 1;
                    var colorSeg = drawSettings.colorSeg != undefined ? drawSettings.colorSeg : (showingHybrid ? tf.consts.measureColorTicDefaultMap : tf.consts.measureColorTicDefaultHybrid);
                    for (var i = 0; i < npvis; ++i) {
                        var pvi = pvis[i];
                        ctx.beginPath();
                        ctx.strokeStyle = colorSeg;
                        ctx.lineWidth = segWidth * pixelRatio;
                        ctx.moveTo(pvi.coordsClipPx[0] * pixelRatio, pvi.coordsClipPx[1] * pixelRatio);
                        ctx.lineTo(pvi.nextCoordsClipPx[0] * pixelRatio, pvi.nextCoordsClipPx[1] * pixelRatio);
                        ctx.closePath(); ctx.fill(); ctx.stroke();
                    }
                }

                if (!drawSettings.skipMeasures) {
                    var drawVertexSettings = {
                        map: map,
                        ctx: ctx,
                        skipScaleText: drawSettings.skipScaleText,
                        skipTics: drawSettings.skipTics,
                        distances: distances,
                        rotation: rotation,
                        showIntermediateLenghts: showIntermediateLenghts,
                        colorTic: colorTic,
                        resolution: res,
                        showingHybrid: showingHybrid,
                        textStyle: drawSettings.textStyle,
                        largerFontSize: drawSettings.largerFontSize
                    };

                    for (var i = 0; i < npvis; ++i) { drawVertexSettings.pvi = pvis[i]; nTicsDrawn += tf.js.DrawMeasuredVertex(drawVertexSettings); }
                }

                ctx.restore();
            }
        }
    }
    return { nTicsDrawn: nTicsDrawn, nTics: nTics, distances: distances, vertexExtent: vertexExtent, totalDistance: totalDistance, area: area };
};



/*
tf.js.GetTextHeight = function (font) {
    var result = {};
    var text = document.createElement('span');
    var block = document.createElement('div');
    var div = document.createElement('div');
    var body = document.body;

    text.innerHTML = "Hg";
    text.style.fontFamily = font;

    block.style.display = "inline-block";
    block.style.width = "1px";
    block.style.height = "0px";

    div.appendChild(text, block);
    body.appendChild(div);

    try {
        block.style.verticalAlign = "baseline";
        result.ascent = block.offsetTop - text.offsetTop;
        block.style.verticalAlign = "bottom";
        result.height = block.offsetTop - text.offsetTop;
        result.descent = result.height - result.ascent;

    } finally { body.removeChild(div); }

    return result;
};
*/
