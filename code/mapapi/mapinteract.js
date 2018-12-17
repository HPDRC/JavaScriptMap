"use strict";

/**
 * class tf.map.aux.MapDrawInteraction - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} tMap - parameter description?
 * @param {?} olMap - parameter description?
 * @param {?} olSourceVector - parameter description?
*/
tf.map.aux.MapDrawInteraction = function (tMap, olMap, olSourceVector) {

    var theThis = null;
    var styles = tf.GetStyles();

    var measureDecimals = 3;

    var olInteraction = null;
    var type = null;
    var geometryFunction = undefined;
    var maxPoints = undefined;

    var drawFeature = null;
    var pointFeatures = [];
    var boxExtent = null;
    var mapExtent = null;

    var areaOverlay = null;

    var interactionType = null;
    var savedGeom = null;
    var savedCoords = null;
    var savedStyle = null;

    var measureOverlays = [];
    var totalLenMeters = 0;
    var lastLenMeters = 0;
    var lastZIndexMeasure = 0;

    var onEndCallBack = null;

/**
 * method tf.map.aux.MapDrawInteraction.Start - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} typeSet - parameter description?
 * @param {?} onEndCallBackSet - parameter description?
*/
    this.Start = function (typeSet, onEndCallBackSet) {
        if (!!typeSet && typeof typeSet == "string") {
            interactionType = typeSet;
            switch (typeSet.toLowerCase()) {
                case 'box': return startBox(onEndCallBackSet); break;
                case 'poly': return startPoly(onEndCallBackSet); break;
                case 'lines': return startLines(onEndCallBackSet); break;
                default: interactionType = ''; break;
            }
        }
    }

/**
 * method tf.map.aux.MapDrawInteraction.GetLastIntereractionType - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetLastIntereractionType = function () { return interactionType; }
/**
 * method tf.map.aux.MapDrawInteraction.GetIsInteracting - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetIsInteracting = function () { return !!olInteraction; }

/**
 * method tf.map.aux.MapDrawInteraction.GetBoxExtent - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetBoxExtent = function () { return boxExtent; }
/**
 * method tf.map.aux.MapDrawInteraction.GetMapExtent - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetMapExtent = function () { return mapExtent; }

/**
 * method tf.map.aux.MapDrawInteraction.GetSavedGeom - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetSavedGeom = function () { return savedGeom; }
/**
 * method tf.map.aux.MapDrawInteraction.GetSavedCoords - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetSavedCoords = function () { return savedCoords; }

/**
 * method tf.map.aux.MapDrawInteraction.Restore - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Restore = function () { return restore(); }
/**
 * method tf.map.aux.MapDrawInteraction.Cancel - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Cancel = function () { return cancel(); }

    function drawBoxGeom(coords, geom) {
        if (!geom) { geom = new ol.geom.Polygon(null); }

        savedGeom = geom;

        var start = coords[0];
        var end = coords[1];

        var minX, maxX, minY, maxY;

        if (start[0] < end[0]) { minX = start[0]; maxX = end[0] } else { minX = end[0]; maxX = start[0]; }
        if (start[1] < end[1]) { minY = start[1]; maxY = end[1] } else { minY = end[1]; maxY = start[1]; }

        savedCoords[0] = [minX, minY];
        savedCoords[1] = [maxX, maxY];

        geom.setCoordinates([[[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY], [minX, minY]]]);

        return geom;
    }

    function boxDrawStart(e) { removeDrawFeature(); }
    function boxDrawEnd(e) {

        boxExtent = [savedCoords[0][0], savedCoords[0][1], savedCoords[1][0], savedCoords[1][1]];
        mapExtent = ol.extent.applyTransform(boxExtent, ol.proj.getTransform(tf.consts.olSystem, tf.consts.tmSystem));

        var centerMapLon = (mapExtent[0] + mapExtent[2]) / 2;
        var centerMapLat = (mapExtent[1] + mapExtent[3]) / 2;

        drawFeature = new ol.Feature({ geometry: savedGeom });
        //drawFeature.setStyle(dragBoxStyle);
        olSourceVector.addFeature(drawFeature);
        tMap.AnimatedSetCenterIfDestVisible([centerMapLon, centerMapLat]);
    }

    function startBox(onEndCallBackSet) {
        cancel();
        type = 'LineString';
        geometryFunction = drawBoxGeom;
        maxPoints = 2;
        return createAndAdd(boxDrawStart, boxDrawEnd, onEndCallBackSet);
    }

    function updateMeasures() {
        var nMeasures = measureOverlays.length;
        var nCoords = savedCoords.length;

        var lastSegmentStart = savedCoords[nCoords - 2];
        var lastSegmentEnd = savedCoords[nCoords - 1];

        var startX = lastSegmentStart[0], startY = lastSegmentStart[1];
        var endX = lastSegmentEnd[0], endY = lastSegmentEnd[1];

        var centerSegX = (startX + endX * 3) / 4;
        var centerSegY = (startY + endY * 3) / 4;

        var startMap = tf.units.OL2TM([startX, startY]);
        var endMap = tf.units.OL2TM([endX, endY]);

        var segLenMeters = tf.units.GetDistanceInMetersBetweenMapCoords(startMap, endMap);

        if (!isFinite(segLenMeters) || isNaN(segLenMeters)) { segLenMeters = 0; }

        var segKM = segLenMeters / 1000;
        var mksPartial, otherPartial;
        var useKM = (totalLenMeters + segLenMeters) > 1000 || segLenMeters > 1000;

        if (useKM) {
            mksPartial = segKM.toFixed(measureDecimals) + " km";
            otherPartial = (segKM * 0.62137).toFixed(measureDecimals) + " mi";
        }
        else {
            mksPartial = segLenMeters.toFixed(measureDecimals) + " m";
            otherPartial = tf.units.GetMetersToFeet(segLenMeters).toFixed(measureDecimals) + " ft";
        }

        var label;
        var isNewMeasure = nMeasures < nCoords - 1;

        if (totalLenMeters > 0) {
            var totalLenM = totalLenMeters + segLenMeters;
            var totalKM = totalLenM / 1000;
            var mksTotal, otherTotal;

            if (totalLenM > 1000) {
                mksTotal = totalKM.toFixed(measureDecimals) + " km";
                otherTotal = (totalKM * 0.62137).toFixed(measureDecimals) + " mi";
            }
            else {
                mksTotal = totalLenM.toFixed(measureDecimals) + " m";
                otherTotal = tf.units.GetMetersToFeet(totalLenM).toFixed(measureDecimals) + " ft";
            }

            label = mksTotal + ' [' + mksPartial + "]<br/><br/>" + otherTotal + ' [' + otherPartial + ']';
        }
        else {
            label = mksPartial + "<br/><br/>" + otherPartial;
        }

        var lastMeasureOverlay;

        if (isNewMeasure) {
            var geom = new ol.geom.Point([centerSegX, centerSegY]);
            var lastMeasureOverlay = createTextOverlay(label);
            measureOverlays.push(lastMeasureOverlay);
            olMap.addOverlay(lastMeasureOverlay.olOverlay);
            totalLenMeters += lastLenMeters;
        }
        else {
            lastMeasureOverlay = measureOverlays[nMeasures - 1];
        }

        lastLenMeters = segLenMeters;

        lastMeasureOverlay.container.innerHTML = label;
        //lastMeasureOverlay.olOverlay.setPosition([centerSegX, centerSegY]);
        lastMeasureOverlay.olOverlay.setPosition([endX, endY]);
    }

    function getCenter(geom) {
        var tx = 0, ty = 0;
        var coords = !!geom && !!geom.getCoordinates ? geom.getCoordinates() : null;
        var len = coords ? coords.length : 0;

        if (len > 0) {
            coords = coords[0];
            len = coords ? coords.length : 0;

            for (var i = 0 ; i < len ; i++) {
                tx += coords[i][0];
                ty += coords[i][1];
            }
            if (len > 0) {
                tx /= len;
                ty /= len;
            }
        }
        return [tx, ty];
    }

    function updateArea() {
        var area = !!savedGeom ? savedGeom.getArea() : 0;

        if (areaOverlay == null) {
            areaOverlay = createTextOverlay("");
            olMap.addOverlay(areaOverlay.olOverlay);
        }

        if (!!areaOverlay) {
            var center = getCenter(savedGeom);

            areaOverlay.olOverlay.setPosition(center);

            var areaSqFt = tf.units.GetSquareMetersToSquareFeet(area);
            var areaAcres = tf.units.GetAcresFromSquareMeters(area);

            areaOverlay.container.innerHTML = area.toFixed(measureDecimals) + " sq m<br/>" + areaSqFt.toFixed(measureDecimals) + " sq ft<br/>" + areaAcres.toFixed(measureDecimals) + " acres";
        }
    }

    function removeArea() {
        if (!!areaOverlay) {
            olMap.removeOverlay(areaOverlay.olOverlay);
            areaOverlay = null;
        }
    }

    function drawPolyGeom(coords, geom) {
        if (!savedGeom) {
            geom = new ol.geom.Polygon(null);
        }
        savedCoords = coords;
        savedGeom = geom;
        geom.setCoordinates(savedCoords);
        updateArea();
        return geom;
    }

    function polyDrawStart(e) {
        //removeArea();
        removePointFeatures();
        removeDrawFeature();
    }

    function polyDrawEnd(e) {
        drawFeature = new ol.Feature({ geometry: savedGeom });
        olSourceVector.addFeature(drawFeature);
        //createPointFeatures();
        savedCoords = null;
        savedGeom = null;
    }

    function startPoly(onEndCallBackSet) {
        cancel();
        type = 'Polygon';
        geometryFunction = drawPolyGeom;
        maxPoints = undefined;
        return createAndAdd(polyDrawStart, polyDrawEnd, onEndCallBackSet);
    }

    function drawLinesGeom(coords, geom) {
        if (!geom) {
            geom = new ol.geom.LineString(null);
            savedCoords[0] = coords[0];
            savedCoords[1] = coords[1];
        }
        else {
            var len = coords.length;
            var slen = savedCoords.length;
            var lastCoord = coords[len - 1];

            if (slen == len) {
                savedCoords[slen - 1] = lastCoord;
            } else {
                savedCoords.push(lastCoord);
            }
        }
        updateMeasures();
        savedGeom = geom;
        geom.setCoordinates(savedCoords);
        return geom;
    }

    function linesDrawStart(e) {
        removeArea();
        removeMeasures();
        removeDrawFeature();
        removePointFeatures();
    }

    function linesDrawEnd(e) {
        var geom = savedGeom;
        var coords = geom.getCoordinates();
        var nCoords = coords.length;

        if (nCoords > 1) {
            coords.splice(nCoords - 1, 1);
            geom.setCoordinates(coords);
            savedCoords = coords;

            var nOverlays = measureOverlays.length;

            if (nOverlays > 1) {
                olMap.removeOverlay(measureOverlays[nOverlays - 1].olOverlay);
                olMap.removeOverlay(measureOverlays[nOverlays - 2].olOverlay);
                measureOverlays.splice(nOverlays - 2, 2);
            }
        }
        drawFeature = new ol.Feature({ geometry: savedGeom });
        olSourceVector.addFeature(drawFeature);
        createPointFeatures();
        savedCoords = [];
        savedGeom = null;
    }

    function startLines(onEndCallBackSet) {
        cancel();
        type = 'LineString';
        geometryFunction = drawLinesGeom;
        maxPoints = undefined;
        return createAndAdd(linesDrawStart, linesDrawEnd, onEndCallBackSet);
    }

    function createAndAdd(onDrawStart, onDrawEnd, onEndCallBackSet) {
        savedCoords = [];
        savedGeom = null;
        onEndCallBack = typeof onEndCallBackSet === "function" ? onEndCallBackSet : null;
        olInteraction = new ol.interaction.Draw({ type: type, freehandCondition: ol.events.condition.never, geometryFunction: geometryFunction, maxPoints: maxPoints/*, source: olSourceVector*/ });
        olInteraction.on('drawstart', onDrawStart);
        olInteraction.on('drawend', onDrawEnd);
        olMap.addInteraction(olInteraction);
    }

    function restore() { if (olInteraction) { olMap.addInteraction(olInteraction); } }

    function removeMeasures() {
        totalLenMeters = 0;
        lastLenMeters = 0;
        lastZIndexMeasure = 0;
        if (!!measureOverlays) {
            var nOverlays = measureOverlays.length;
            for (var i = 0 ; i < nOverlays ; ++i) {
                olMap.removeOverlay(measureOverlays[i].olOverlay);
            }
            measureOverlays = [];
        }
    }

    function removeDrawFeature() {
        if (drawFeature) {
            olSourceVector.removeFeature(drawFeature);
            drawFeature = null;
        }
    }

    function createPointFeatures() {
        var pointGeom = new ol.geom.MultiPoint(savedCoords);
        var pointFeature = new ol.Feature({ geometry: pointGeom });
        olSourceVector.addFeature(pointFeature);
        pointFeatures.push(pointFeature);
    }

    function removePointFeatures() {
        if (!!pointFeatures) {
            var nElems = pointFeatures.length;
            for (var i = 0 ; i < nElems ; ++i) {
                olSourceVector.removeFeature(pointFeatures[i]);
            }
            pointFeatures = [];
        }
    }

    function cancel() {
        boxExtent = null; mapExtent = null;
        removeArea();
        removeDrawFeature();
        removeMeasures();
        removePointFeatures();
        if (olInteraction) {
            olMap.removeInteraction(olInteraction); olInteraction = null;
            if (!!onEndCallBack) {
                onEndCallBack.call(tMap, theThis);
            }
        }
    }

    function createOLOverlay(overlayContainer) {
        var olOverlay = new ol.Overlay({
            positioning: 'center-center',
            element: overlayContainer,
            stopEvent: false
        });
        return { olOverlay: olOverlay, container: overlayContainer };
    }

    function createTextOverlay(text) {
        var divElem = new tf.dom.Div({ cssClass: styles.mapMeasureOverlayDivClass }).GetHTMLElement();
        divElem.style.zIndex = ++lastZIndexMeasure;
        divElem.innerHTML = text;
        return createOLOverlay(divElem);
    }

    function initialize() { }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);

};
