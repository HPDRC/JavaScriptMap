"use strict";

tf.map.SimplifyLSCoords = function (lsCoords, simplifyTolerance) {
    var newCoords;
    if (tf.js.GetLooksLikeLineStringCoords(lsCoords) && simplifyTolerance != undefined) {
        var APIGeom = new ol.geom.LineString(lsCoords);
        APIGeom.transform(tf.consts.tmSystem, tf.consts.olSystem);
        APIGeom = APIGeom.simplify(simplifyTolerance);
        APIGeom.transform(tf.consts.olSystem, tf.consts.tmSystem);
        newCoords = APIGeom.getCoordinates();
    }
    return newCoords;
}

tf.map.SimplifyMLSCoords = function (mlsCoords, simplifyTolerance) {
    var newCoords;
    if (tf.js.GetLooksLineMultiLineStringCoords(mlsCoords) && simplifyTolerance != undefined) {
        var nLS = mlsCoords.length;
        newCoords = [];
        for (var i = 0 ; i < nLS ; ++i) { newCoords.push(tf.map.SimplifyLSCoords(mlsCoords[i], simplifyTolerance)); }
    }
    return newCoords;
}

tf.map.MLSSegMerger = function (settings) {
    var theThis, doLogErrors, myName, coordMap, nCoordsMap, nCoords, segMap, nSegsMap, nSegs, newMLS, segsProcess, nSegsProcess;

    this.Merge = function (mlsGeom, simplifyTolerance) { return merge(mlsGeom, simplifyTolerance); }

    function logError(errorStr) { if (doLogErrors) { console.log(myName + ': ' + errorStr); } }

    function addNewLS() { var newLS = []; newMLS.coordinates.push(newLS); return newLS; }

    function getCoordsAreDifferent(coord1, coord2) { return coord1[0] != coord2[0] || coord1[1] != coord2[1]; }

    function makeCoordKey(coord) { var lon = coord[0], lat = coord[1]; var key = '' + lon + '|' + lat; return key; }
    function makeSegKey(coord1, coord2) {
        var lon1 = coord1[0], lat1 = coord1[1], lon2 = coord2[0], lat2 = coord2[1], minLon, maxLon, minLat, maxLat;
        if (lon1 < lon2) { minLon = lon1; maxLon = lon2; } else { minLon = lon2; maxLon = lon1; }
        if (lat1 < lat2) { minLat = lat1; maxLat = lat2; } else { minLat = lat2; maxLat = lat1; }
        return makeCoordKey([minLon, minLat]) + '-' + makeCoordKey([maxLon, maxLat]);
    }

    function reset() { segMap = {}; coordMap = {}; segsProcess = {}; nCoordsMap = nCoords = nSegsMap = nSegs = nSegsProcess = 0; newMLS = { type: 'multilinestring', coordinates: [] } }

    function addCoordToMap(coord) {
        var coordKey = makeCoordKey(coord), coordEntry = coordMap[coordKey];
        ++nCoords;
        if (coordEntry == undefined) { ++nCoordsMap; coordEntry = coordMap[coordKey] = { count: 1, coordKey: coordKey, coord: coord, nSegs: 0, segMap: {} }; }
        else { ++coordEntry.count; }
    }

    function addSegToCoord(coordKey, segKey) {
        var coordEntry = coordMap[coordKey];
        if (!!coordEntry) {
            if (coordEntry.segMap[segKey] == undefined) { ++coordEntry.nSegs; coordEntry.segMap[segKey] = segKey; }
            else { logError('adding segment to coordinate more than once'); }
        } else { logError('adding segment to unmapped coordinate'); }
    }

    function delSegFromCoordObj(coordObj, segKey) {
        if (!!coordObj) {
            if (coordObj.segMap[segKey] != undefined) { delete coordObj.segMap[segKey]; --coordObj.nSegs; }
            else { logError('deleting non existing segment from coord'); }
        }
    }

    function addSegToMap(coord1, coord2) {
        ++nSegs;
        if (getCoordsAreDifferent(coord1, coord2)) {
            var segKey = makeSegKey(coord1, coord2), segEntry = segMap[segKey];
            if (segEntry == undefined) {
                var coord1K = makeCoordKey(coord1), coord2K = makeCoordKey(coord2);
                ++nSegsMap;
                segEntry = segMap[segKey] = { count: 1, segKey: segKey, coord1: coord1, coord2: coord2, coord1K: coord1K, coord2K: coord2K };
                addSegToCoord(coord1K, segKey);
                addSegToCoord(coord2K, segKey);
                segsProcess[segKey] = segEntry;
            }
            else { ++segEntry.count; }
        } else { logError('mls contains ls with zero length segment'); }
    }

    function addLSCoordsToMap(lsCoords) { for (var i in lsCoords) { addCoordToMap(lsCoords[i]); } }
    function addLSSegsToMap(lsCoords) { var nSegs = lsCoords.length - 1; for (var i = 0 ; i < nSegs ; ++i) { addSegToMap(lsCoords[i], lsCoords[1 + i]); } nSegsProcess = nSegsMap; }

    function getSegObjWithMaxCountFromMap(theMap) { var maxCount = 0, maxSegObj; for (var i in theMap) { var s = theMap[i]; if (s.count > maxCount) { maxCount = s.count; maxSegObj = s; } } return maxSegObj; }
    function getProcessSegObjWithMaxCount() { return getSegObjWithMaxCountFromMap(segsProcess); }

    function delSegToProcess(segKey) {
        if (segsProcess[segKey] != undefined) { delete segsProcess[segKey]; --nSegsProcess; } else { logError('deleting invalid seg to process'); }
    }

    function getNextSegObjToProcess() { var nextSegObj = getProcessSegObjWithMaxCount(); if (!!nextSegObj) { delSegToProcess(nextSegObj.segKey); } return nextSegObj; }

    function getOtherCoordObj(segObj, coordObj) {
        var otherCoordObj;
        if (!!segObj && !!coordObj) {
            var coordKey = coordObj.coordKey;
            if (segObj.coord1K == coordKey) { otherCoordObj = coordMap[segObj.coord2K]; }
            else if (segObj.coord2K == coordKey) { otherCoordObj = coordMap[segObj.coord1K]; }
        }
        return otherCoordObj;
    }

    function removeFirstSegKeyFromCoordObj(coordObj) {
        var firstSegKey, nSegs = coordObj.nSegs;
        if (nSegs > 0) {
            for (var i in coordObj.segMap) { firstSegKey = coordObj.segMap[i]; delete coordObj.segMap[i]; break; }
            --coordObj.nSegs;
        }
        return firstSegKey;
    }

    function continueLS(theLS, addToEndBool) {
        var continued = false, coordInLSIndex, functionAddToLS;

        if (addToEndBool) { coordInLSIndex = theLS.length - 1; functionAddToLS = theLS.push; }
        else { coordInLSIndex = 0; functionAddToLS = theLS.unshift; }

        var coordInLS = theLS[coordInLSIndex], coordInLSKey = makeCoordKey(coordInLS), coordInLSObj = coordMap[coordInLSKey];

        if (!!coordInLSObj) {
            if (coordInLSObj.nSegs > 0) {
                var nextSegKey = removeFirstSegKeyFromCoordObj(coordInLSObj), nextSeg = segsProcess[nextSegKey];
                if (!!nextSeg) {
                    var otherCoordObj = getOtherCoordObj(nextSeg, coordInLSObj);
                    if (!!otherCoordObj) {
                        delSegToProcess(nextSegKey);
                        delSegFromCoordObj(otherCoordObj, nextSegKey);
                        functionAddToLS.call(theLS, otherCoordObj.coord);
                        continued = true;
                    } else { logError('cannot find other coord on seg to process'); }
                } else { logError('cannot find coord seg to process'); }
            }
        } else { logError('cannot find ls coord object to add to'); }
        return continued;
    }

    function createNewLS() {
        var created = false;
        if (nSegsProcess > 0) {
            var nextSegObj = getNextSegObjToProcess();
            if (!!nextSegObj) {
                var segKey = nextSegObj.segKey;
                var coord1K = nextSegObj.coord1K, coord2K = nextSegObj.coord2K;
                var coord1Obj = coordMap[coord1K], coord2Obj = coordMap[coord2K];
                if (!!coord1Obj && !!coord2Obj) {
                    var newLS = addNewLS();
                    delSegFromCoordObj(coord1Obj, segKey);
                    delSegFromCoordObj(coord2Obj, segKey);
                    newLS.push(coord1Obj.coord);
                    newLS.push(coord2Obj.coord);
                    while (continueLS(newLS, true)) { }
                    while (continueLS(newLS, false)) { }
                    created = true;
                } else { logError('segment with missing coordinates'); }
            } else { logError('cannot find the next seg obj to process'); }
        }
        return created;
    }

    function merge(mlsGeom, simplifyTolerance) {
        reset();
        if (tf.js.GetLooksLikeMultiLineStringGeom(mlsGeom)) {
            var mlsCoords = mlsGeom.coordinates, nLSs = mlsCoords.length;
            for (var iLS = 0; iLS < nLSs; ++iLS) { addLSCoordsToMap(mlsCoords[iLS]); }
            for (var iLS = 0; iLS < nLSs; ++iLS) { addLSSegsToMap(mlsCoords[iLS]); }
            while (createNewLS()) { }
            if (simplifyTolerance != undefined) { newMLS.coordinates = tf.map.SimplifyMLSCoords(newMLS.coordinates, simplifyTolerance); }
        }
        return newMLS;
    }

    function initialize() { myName = "MLSSegMerger"; settings = tf.js.GetValidObjectFrom(settings); doLogErrors = !!settings.logErrors; }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.map.RouteShapeEditor = function (settings) {

    var theThis, styles, onUpdateSizeDelayCallBack, topDiv;
    var isEditing;
    var map, mlsLayer, mlsSmallLayer;
    var mlsGeom, mlsSmallGeom;
    var title;
    var controlWrapper;
    var titleDivE, editInstructionsDivE, titleButton;
    var statusButtonEnabledClasses, statusButtonDisabledClasses;
    var titleControl;
    var lsFeatures;
    var lsSmallFeatures;
    var onCloseCB;
    var routesSegmentsControl;
    var normalShapePanelObj, smallShapePanelObj, customShapePanelObj;
    var normalShapeSegmentsList, smallShapeSegmentsList;
    var normalShapeTitleDivE, smallShapeTitleDivE, statsShapeTitleDivE;
    var segmentButtonCache;
    var segButtonVisibleClasses, segButtonHiddenClasses;
    var showingPoints, showingSmallPoints;
    var lsButtons, lsSmallButtons;
    var instructionsControl, instructionsControlE, instructionsControlES, instructionsContent, instructionsContentE, instructionsContentES;
    var selectedContent, selectedContentE, selectedContentES;
    var colorSelected;
    var lastHoverInstruction;
    var lastSelectedFeature, lastSelectedLS, lastSelectedPoint;
    var routeSelectedTitleE, routeSelectedButtonsCustomPoint, routeSelectedButtonsCustomLS;
    var routeSelectedButtonsWrapper;
    var hoveredVerb, selectedVerb;
    var isMovingPoint, isAddingPoint, isAddingPointBefore;
    var segStartMarker, segEndMarker, isShowingStartEnd;
    var editProps;
    var toaster;
    var normalControlWrapperES, smallControlWrapperES, statsControlWrapperES;
    var minZIndex, ownsMap;
    var textShadowBlack;
    var buttonDim, textDim;
    var mlsMerger;

    this.GetToaster = function () { return toaster; }
    this.GetIsEditing = function () { return isEditing; }
    this.Edit = function (editSettings) { return edit(editSettings); }
    this.OnResize = function () { return onResize(); }
    this.OnClose = function (isConfirmed) { return onClose(isConfirmed); }

    function edit(editSettings) {
        if (!isEditing) {
            if (tf.js.GetIsValidObject(editSettings)) {
                isEditing = true;
                mlsGeom = tf.js.CopyMultiLineStringGeom(editSettings.mlsGeom);
                if (tf.js.CountMLSPoints(mlsGeom) == 0) { mlsGeom = undefined; }
                mlsSmallGeom = tf.js.CopyMultiLineStringGeom (editSettings.mlsSmallGeom);
                title = tf.js.GetNonEmptyString(editSettings.title, "Route shape editor");
                titleButton.SetText(title);
                isEditing = true;
                editProps = editSettings.props;
                startEdit();
            }
        }
    }

    function getMLSStyle(isHover, isSmall) {
        return function (mapFeature) {
            var lineWidth = 2, zindex, color, addHoverLineWidth = 4, addLargeLineWidth = 10, lineColor = "#66f";

            if (isHover) { lineWidth += addHoverLineWidth; if (isSmall) { lineColor = colorSelected;; } }

            if (isSmall) { lineWidth = isHover ? 8 : 4; zindex = isHover ? 21 : 12; color = lineColor; }
            else { lineWidth += addLargeLineWidth; zindex = isHover ? 11 : 1; color = "#f66"; }

            var style = [{ line: true, line_color: "#fff", line_width: lineWidth + 2, zindex: zindex - 1, snaptopixel: false
            }, { line: true, line_color: color, line_width: lineWidth, zindex: zindex, snaptopixel: false }];

            return style;
        }
    }

    function getPointStyle(isHover, isSmall) {
        return function (mapFeature) {
            var lineWidth = 2, zindex, color, fillColor, addHoverLineWidth = 4, addLargeLineWidth = -2, lineColor = "#00b";

            if (isHover) { lineWidth += addHoverLineWidth; if (isSmall) { lineColor = colorSelected; } }

            if (isSmall) { lineWidth = isHover ? 8 : 4; zindex = isHover ? 31 : 22; color = lineColor; fillColor = "#fff"; }
            else { lineWidth += addLargeLineWidth; zindex = isHover ? 22 : 13; color = "#f66"; fillColor = "#000"; }

            var style = [{
                circle: true, line: true, circle_radius: lineWidth + 2, line_color: lineColor, line_width: 2, zindex: zindex - 1, snaptopixel: false
            }, { circle: true, line: true, circle_radius: lineWidth, line_color: color, line_width: 1, zindex: zindex, snaptopixel: false, fill: true, fill_opacity: 50, fill_color: fillColor }];

            return style;
        }
    }

    function getCustomShapeName() { return !!mlsGeom ? "Custom" : "Shape"; }
    function getShapeName(isSmall) { return isSmall ? getCustomShapeName() : "Model"; }

    function setShapeTitle(isSmall, geom, titleDivE) {
        var innerHTML = getShapeName(isSmall) + ':';
        innerHTML += ' <b>' + geom.coordinates.length + '</b> segments, <b>' + tf.js.CountMLSPoints(geom) + "</b> points";
        titleDivE.innerHTML = innerHTML;
    }

    function updateStats() {
        var count = tf.js.CountMLSPoints(mlsGeom);
        var countSmall = tf.js.CountMLSPoints(mlsSmallGeom);
        var statsHTML = "( Custom : Model ) ratio is <b>" + (count != 0 ? (countSmall / count * 100).toFixed(1) : '?') + '%</b>';
        statsShapeTitleDivE.innerHTML = statsHTML;
    }

    function updateSmallMlsTitleAndStats() {
        setShapeTitle(true, mlsSmallGeom, smallShapeTitleDivE);
        updateStats();
    }

    function doSetExtentFromGeom(geom) {
        if (!!geom) {
            geom.style = getMLSStyle(false, false);
            geom.hoverStyle = getMLSStyle(true, false);

            var feature = new tf.map.Feature(geom);
            var extent = feature.GetExtent();

            if (!!extent) {
                extent = tf.js.ScaleMapExtent(extent, 1.4);
                map.SetVisibleExtent(extent);
            }
        }
    }

    function setExtentFromGeom() { return doSetExtentFromGeom(!!mlsGeom ? mlsGeom : mlsSmallGeom); }

    function startEdit() {
        var geomStyle = { line: true, line_width: 4, line_color: "#000" };
        var geomSmallStyle = { line: true, line_width: 2, line_color: "#fff" };

        titleControl.GetHTMLElement().style.display = routesSegmentsControl.GetHTMLElement().style.display = 'block';
        isShowingStartEnd = isAddingPoint = isMovingPoint = false;

        //showingPoints = showingSmallPoints = true;    // keep commented to preserve these flags between edit sessions
        lastSelectedFeature = lastSelectedLS = lastSelectedPoint = undefined;

        updateShowHidePointsButton(smallShapePanelObj.showPointsButton, showingSmallPoints);
        setShapeTitle(true, mlsSmallGeom, smallShapeTitleDivE);

        if (!!mlsGeom) {
            normalControlWrapperES.display = statsControlWrapperES.display = 'block';
            updateShowHidePointsButton(normalShapePanelObj.showPointsButton, showingPoints);
            customShapePanelObj.cloneButton.GetHTMLElement().style.display = 'inline-block';
            setShapeTitle(false, mlsGeom, normalShapeTitleDivE);
        }
        else {
            customShapePanelObj.cloneButton.GetHTMLElement().style.display =
                normalControlWrapperES.display = statsControlWrapperES.display = 'none';
        }

        updateStats();
        addFeatures();
        setTimeout(function () { onResize(); setTimeout(function () { setExtentFromGeom(); }, 50) }, 10);
    }

    function removeFeatureFromLayer(feature) {
        if (!tf.js.GetIsArray(feature)) { feature = [feature]; }
        for (var i in feature) {
            var f = feature[i];
            if (!!f && f.visible) {
                f.layer.DelMapFeature(f.feature);
                f.visible = false;
                removeFeatureFromLayer(f.pointsFeature);
            }
        }
    }

    function addFeatureToLayer(feature, withholdAdd) {
        if (!tf.js.GetIsArray(feature)) { feature = [feature]; }
        for (var i in feature) {
            var f = feature[i];
            if (!!f && !f.visible) {
                f.layer.AddMapFeature(f.feature, withholdAdd);
                f.visible = true;
                var showPoints = f.isSmall ? showingSmallPoints : showingPoints;
                if (showPoints) { addFeatureToLayer(f.pointsFeature, withholdAdd); }
            }
        }
    }

    function toggleFeature(feature) { if (!!feature) { if (feature.visible) { removeFeatureFromLayer(feature); } else { addFeatureToLayer(feature, false); } } }

    function makeSegmentCacheKey(isSmall, segmentIndex) { return (isSmall ? '0-' : '1-') + segmentIndex; }

    function updateButtonStyle(button, positiveClass, negativeClass, isPositive) {
        if (!!button) {
            button.SetStyle(isPositive ? positiveClass : negativeClass);
            styles.ApplyStyleProperties(button, textShadowBlack);
        }
    }

    function updateSegVisibleButton(button, isVisible) { return updateButtonStyle(button, segButtonVisibleClasses, segButtonHiddenClasses, isVisible); }

    function updateVisibleStyle(segmentButton) {
        if (!tf.js.GetIsArray(segmentButton)) { segmentButton = [segmentButton]; }

        for (var i in segmentButton) {
            var sb = segmentButton[i];
            var feature = getFeatureFromSegmentButton(sb);
            var isVisible = !!feature ? feature.visible : false;
            var title = isVisible ? 'Hide' : 'Show';
            title += ' segment ' + (1 + sb.segmentIndex) + ' (' + sb.pointCount + ' points)';
            sb.ChangeToolTip(title);
            updateSegVisibleButton(sb, isVisible);
        }
    }

    function getFeatureFromSegmentButton(segmentButton) {
        var feature;
        if (!!segmentButton) {
            var isSmall = segmentButton.isSmall;
            var featureArray = isSmall ? lsSmallFeatures : lsFeatures;
            feature = featureArray[segmentButton.segmentIndex];
        }
        return feature;
    }

    function getOnClickSegmentButton(cacheKey) {
        return function (notification) {
            var segmentButton = segmentButtonCache[cacheKey];
            var feature = getFeatureFromSegmentButton(segmentButton);
            if (!!feature) {
                toggleFeature(feature);
                updateVisibleStyle(segmentButton);
            }
            return false;
        };
    }

    function createSegmentButton(isSmall, segmentIndex, pointCount) {
        var cacheKey = makeSegmentCacheKey(isSmall, segmentIndex) ;
        var segmentButton = segmentButtonCache[cacheKey];
        if (!segmentButton) {
            segmentButton = styles.AddButtonDivMargins(new tf.ui.TextBtn({
                dim: textDim, style: true, label: '' + (1 + segmentIndex), tooltip: 'Show / Hide this segment', onClick: getOnClickSegmentButton(cacheKey)
            }));
            segmentButton.segmentIndex = segmentIndex;
            segmentButton.isSmall = isSmall;
            segmentButtonCache[cacheKey] = segmentButton;
            //console.log('created new segment button: ' + segmentIndex);
        }
        //else { console.log('reusing segment button from cache: ' + segmentIndex); }
        if (!!segmentButton) { segmentButton.pointCount = pointCount; }
        updateVisibleStyle(segmentButton);
        return segmentButton;
    }

    function makeLSGeom(isSmall, coordinates) {
        return {
            type: 'linestring',
            coordinates: coordinates,
            style: getMLSStyle(false, isSmall),
            hoverStyle: getMLSStyle(true, isSmall)
        };
    }

    function makePointGeom(isSmall, coordinates) {
        return {
            type: 'point',
            coordinates: coordinates,
            style: getPointStyle(false, isSmall),
            hoverStyle: getPointStyle(true, isSmall)
        };
    }

    function createPointFeature(segIndex, pointIndex, layer, pointCoords, isSmall) {
        var pointGeom = makePointGeom(isSmall, pointCoords);
        var pointFeature = new tf.map.Feature(pointGeom);
        var pointFeatureObj = { visible: false, feature: pointFeature, layer: layer, isSmall: isSmall };
        pointFeature.props = { isMLSPoint: true, isSmall: isSmall, segIndex: segIndex, pointIndex: pointIndex };
        return pointFeatureObj;
    }

    function createLSFeature(segIndex, layer, lsCoords, isSmall) {
        var lsGeom = makeLSGeom(isSmall, lsCoords);
        var lsFeature = new tf.map.Feature(lsGeom);
        var lsFeatureObj = { visible: false, feature: lsFeature, layer: layer, isSmall: isSmall };
        var len = lsCoords.length;
        var pointsFeature = [];

        lsFeature.props = { isMLSSeg: true, isSmall: isSmall, segIndex: segIndex };

        for (var i = 0; i < len ; ++i) {
            var thisCoords = lsCoords[i];
            pointsFeature.push(createPointFeature(segIndex, i, layer, thisCoords, isSmall));
        }
        lsFeatureObj.pointsFeature = pointsFeature;
        return lsFeatureObj;
    }

    function addMLSFeatures(layer, geom, isSmall) {
        var lsFeatures = [];
        if (!!geom && tf.js.GetIsNonEmptyArray(geom.coordinates)) {
            var coordsLength = geom.coordinates.length;

            for (var i = 0 ; i < coordsLength ; ++i) {
                var lsCoords = geom.coordinates[i];
                if (tf.js.GetIsNonEmptyArray(lsCoords) && tf.js.GetIsArrayWithMinLength(lsCoords[0], 2)) {
                    var lsFeatureObj = createLSFeature(i, layer, lsCoords, isSmall);
                    lsFeatures.push(lsFeatureObj);
                }
            }
            addFeatureToLayer(lsFeatures, true);
            layer.AddWithheldFeatures();
        }
        return { lsFeatures: lsFeatures, layer: layer, isSmall: isSmall };
    }

    function createSegmentButtons(shapeSegmentsList, isSmall, howMany, geom) {
        var segmentButtons = [];
        var coords = geom.coordinates;
        for (var i = 0 ; i < howMany; ++i) {
            var segmentButton = createSegmentButton(isSmall, i, coords[i].length);
            shapeSegmentsList.AddContent(segmentButton);
            segmentButtons.push(segmentButton);
        }
        return segmentButtons;
    }

    function addModelFeatures() {
        if (!!mlsGeom) {
            var added = addMLSFeatures(mlsLayer, mlsGeom, false);
            lsFeatures = added.lsFeatures;
            lsButtons = createSegmentButtons(normalShapeSegmentsList, false, lsFeatures.length, mlsGeom);
        }
    }

    function addCustomFeatures() {
        var added = addMLSFeatures(mlsSmallLayer, mlsSmallGeom, true);
        lsSmallFeatures = added.lsFeatures;
        lsSmallButtons = createSegmentButtons(smallShapeSegmentsList, true, lsSmallFeatures.length, mlsSmallGeom);
    }

    function addFeatures() { addModelFeatures(); addCustomFeatures(); }

    function removeStartEnd() {
        if (!!isShowingStartEnd) { mlsSmallLayer.DelMapFeature(segStartMarker); mlsSmallLayer.DelMapFeature(segEndMarker); isShowingStartEnd = false; }
    }

    function removeSmallFeatures() { removeStartEnd(); removeFeatureFromLayer(lsSmallFeatures); lsSmallFeatures = undefined; }
    function removeModelFeatures() { removeFeatureFromLayer(lsFeatures); lsFeatures = lsSmallFeatures = undefined; }

    function removeFeatures() { removeSmallFeatures(); removeModelFeatures(); }

    function replaceSmallMLS(newMLS) {
        lastSelectedFeature = lastSelectedLS = lastSelectedPoint = undefined;
        removeSmallFeatures();
        smallShapeSegmentsList.ClearContent();
        //mlsSmallGeom = tf.js.CopyMultiLineStringGeom(newMLS);
        mlsSmallGeom = newMLS;
        addCustomFeatures();
        forceRefreshDisplay();
        updateSmallMlsTitleAndStats();
    }

    function onClose(isConfirmed) {
        if (isEditing) {
            removeFeatures();
            isEditing = false;
            instructionsControlES.display = titleControl.GetHTMLElement().style.display = routesSegmentsControl.GetHTMLElement().style.display = 'none';
            normalShapeSegmentsList.ClearContent();
            smallShapeSegmentsList.ClearContent();
            var geom = isConfirmed ? tf.js.CopyMultiLineStringGeom(mlsSmallGeom) : undefined;
            if (!!onCloseCB) { onCloseCB({ sender: theThis, isConfirmed: isConfirmed, props: editProps, geom: geom }); }
        }
    }

    function confirm() { onClose(true); }
    function cancel() { onClose(false); }

    function getOnStopEdit(confirmed) { return function (notification) { return confirmed ? confirm() : cancel(); } }

    function createTitleControl() {
        controlWrapper = new tf.dom.Div({ cssClass: controlWrapperClassName });

        var titleDiv = new tf.dom.Div({ cssClass: titleClassName });

        titleButton = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: true, label: '', tooltip: "Click to set map extent", onClick: setExtentFromGeom
        }));

        titleDiv.AddContent(titleButton);

        controlWrapper.AddContent(titleDiv);

        if (!settings.noSaveCancel) {
            var buttonsDiv = new tf.dom.Div({ cssClass: buttonsClassName });

            var saveButton = styles.AddButtonDivMargins(new tf.ui.TextBtn({
                dim: textDim, style: statusButtonEnabledClasses, label: 'Save', tooltip: "Save Shape", onClick: getOnStopEdit(true)
            }));

            var cancelButton = styles.AddButtonDivMargins(new tf.ui.TextBtn({
                dim: textDim, style: statusButtonDisabledClasses, label: 'Cancel', tooltip: "Cancel", onClick: getOnStopEdit(false)
            }));

            styles.ApplyStyleProperties(saveButton, textShadowBlack);
            styles.ApplyStyleProperties(cancelButton, textShadowBlack);

            buttonsDiv.AddContent(saveButton, cancelButton);
            buttonsDiv.GetHTMLElement().style.textAlign = 'right';

            controlWrapper.AddContent(buttonsDiv)
        }

        titleControl = new tf.dom.Div({ cssClass: topClassName + " " + titleControlClassName });
        titleControl.AddContent(controlWrapper);
        titleControl.GetHTMLElement().style.display = 'none';
    }

    function updateShowHidePointsButton(button, showPoints) {
        var showHideStr = (showPoints ? 'Hide' : 'Show');
        var buttonTitle = showHideStr + ' points';
        var buttonToolTip = buttonTitle + ' of visible segments';
        button.SetText(buttonTitle);
        button.ChangeToolTip(buttonToolTip);
        updateSegVisibleButton(button, showPoints);
    }

    function getOnShowHidePoints(isSmall) {
        return function (notification) {
            var button, features, showPoints;
            
            if (isSmall) {
                button = smallShapePanelObj.showPointsButton;
                features = lsSmallFeatures;
                showPoints = showingSmallPoints = !showingSmallPoints;
            }
            else {
                button = normalShapePanelObj.showPointsButton;
                features = lsFeatures;
                showPoints = showingPoints = !showingPoints;
            }

            for (var i in features) {
                var f = features[i];
                if (f.visible) {
                    if (showPoints) { addFeatureToLayer(f.pointsFeature); }
                    else { removeFeatureFromLayer(f.pointsFeature); }
                }
            }
            updateShowHidePointsButton(button, showPoints);
            return false;
        };
    }

    function getOnShowAll(isSmall) {
        return function (notification) {
            var features = isSmall ? lsSmallFeatures : lsFeatures;
            var buttons = isSmall ? lsSmallButtons : lsButtons;
            var layer = isSmall ? mlsSmallLayer : mlsLayer;
            addFeatureToLayer(features, true);
            layer.AddWithheldFeatures();
            updateVisibleStyle(buttons);
            return false;
        }
    }

    function getOnHideAll(isSmall) {
        return function (notification) {
            var features = isSmall ? lsSmallFeatures : lsFeatures;
            var buttons = isSmall ? lsSmallButtons : lsButtons;
            removeFeatureFromLayer(features);
            updateVisibleStyle(buttons);
            return false;
        }
    }

    function hasOperationOnGoing() { return isMovingPoint || isAddingPoint; }

    function continueAddPoint(atPointCoords) {
        if (isAddingPoint) {
            if (lastSelectedPoint) {
                var props = lastSelectedPoint.props;
                var segIndex = props.segIndex, pointIndex = props.pointIndex;
                var lsFeature = lsSmallFeatures[segIndex];
                var lsArray = mlsSmallGeom.coordinates[segIndex];
                var len = lsArray.length;
                var nextPointIndex = isAddingPointBefore ? pointIndex : pointIndex + 1;
                var pointCoords = atPointCoords != undefined ? atPointCoords : lsArray[pointIndex].slice(0);
                var pointFeature = createPointFeature(segIndex, nextPointIndex, mlsSmallLayer, pointCoords, true);

                lsArray.splice(nextPointIndex, 0, pointCoords);

                lsFeature.pointsFeature.splice(nextPointIndex, 0, pointFeature);

                ++len;

                for (var i = nextPointIndex + 1 ; i < len ; ++i) {
                    var pf = lsFeature.pointsFeature[i];
                    ++pf.feature.props.pointIndex;
                }

                addFeatureToLayer(pointFeature);

                lsFeature.feature.SetGeom(new tf.map.FeatureGeom(makeLSGeom(props.isSmall, lsArray)));

                var segBtn = lsSmallButtons[segIndex];

                ++segBtn.pointCount;
                updateVisibleStyle(segBtn);

                selectFeature(pointFeature.feature);

                isMovingPoint = true;
                updateSmallMlsTitleAndStats();
                forceRefreshDisplay();
            }
            else { isAddingPoint = false; }
        }
    }

    function addBeforeOrAfterSelPoint(addBeforeBool, atPointCoords) {
        if (!hasOperationOnGoing() && lastSelectedPoint) {
            isAddingPointBefore = !!addBeforeBool;
            isAddingPoint = true;
            continueAddPoint(atPointCoords);
        }
    }

    function getOnAddBeforeOrAfterSelPoint(addBeforeBool) { return function (notification) { addBeforeOrAfterSelPoint(addBeforeBool); return false; } }

    function addStartEndSelSeg(addBeforeBool) {
        if (!hasOperationOnGoing() && lastSelectedLS) {
            var props = lastSelectedLS.props;
            if (props.isSmall) {
                var segIndex = props.segIndex;
                var lsFeature = lsSmallFeatures[segIndex];
                var pointsFeatures = lsFeature.pointsFeature;
                var len = pointsFeatures.length;

                if (len > 0) {
                    var pointIndex = addBeforeBool ? 0 : len - 1;
                    var selectedPointFeature = lsFeature.pointsFeature[pointIndex];
                    selectFeature(selectedPointFeature.feature);
                    isAddingPointBefore = !!addBeforeBool;
                    isAddingPoint = true;
                    continueAddPoint();
                }
            }
        }
    }

    function getOnAddStartEndSelSeg(addBeforeBool) { return function (notification) { addStartEndSelSeg(addBeforeBool); return false; } }

    function forceRefreshDisplay() { setTimeout(function () { instructionsControlES.display = 'none'; }, 100); }

    function addSegment(pointCoords, continueAdd) {
        if (!hasOperationOnGoing()) {
            if (tf.js.GetIsNonEmptyArray(pointCoords)) {
                var newCoords;
                var nNewCoords;

                if (tf.js.GetIsArray(pointCoords[0])) {
                    nNewCoords = pointCoords.length;
                    newCoords = [];
                    for (var i in pointCoords) { newCoords.push(pointCoords[i].slice(0)); }
                }
                else {
                    nNewCoords = 1;
                    newCoords = [pointCoords.slice(0)];
                }

                var nSegs = lsSmallFeatures.length;
                var lsFeatureObj = createLSFeature(nSegs, mlsSmallLayer, newCoords, true);
                var lsFeature = lsFeatureObj.feature;

                mlsSmallGeom.coordinates.push(newCoords);
                lsSmallFeatures.push(lsFeatureObj);
                addFeatureToLayer(lsFeatureObj);

                var segButton = createSegmentButton(true, nSegs, nNewCoords);
                lsSmallButtons.push(segButton);
                smallShapeSegmentsList.AddContent(segButton);

                updateSmallMlsTitleAndStats();

                if (continueAdd) {
                    selectFeature(lsFeatureObj.pointsFeature[0].feature);
                    addBeforeOrAfterSelPoint(false);
                }
                else { selectFeature(lsFeature); }
            }
        }
    }

    function delSegment(segIndex) {
        var nSegs = lsSmallFeatures.length;
        if (segIndex >= 0 && segIndex < nSegs) {
            var lsFeature = lsSmallFeatures[segIndex];
            var isSelFeature = lsFeature.feature == lastSelectedLS;

            if (!isSelFeature) {
                for (var i in lsFeature.pointsFeature) {
                    var pf = lsFeature.pointsFeature[i];
                    if (pf.feature == lastSelectedPoint) { isSelFeature = true; break; }
                }
            }
            else { removeStartEnd(); }

            if (isSelFeature) { lastSelectedFeature = lastSelectedLS = lastSelectedPoint = undefined; }

            removeFeatureFromLayer(lsFeature);
            lsSmallFeatures.splice(segIndex, 1);
            mlsSmallGeom.coordinates.splice(segIndex, 1);

            var len = lsSmallFeatures.length;

            for (var i = segIndex ; i < len ; ++i) {
                lsFeature = lsSmallFeatures[i];
                --lsFeature.feature.props.segIndex;
                for (var j in lsFeature.pointsFeature) { var pf = lsFeature.pointsFeature[j]; --pf.feature.props.segIndex; }
                if (i < len) {
                    var thisButton = lsSmallButtons[i], nextButton = lsSmallButtons[i + 1];
                    thisButton.pointCount = nextButton.pointCount;
                    updateVisibleStyle(thisButton);
                }
            }

            smallShapeSegmentsList.GetHTMLElement().removeChild(lsSmallButtons[len].GetHTMLElement());
            lsSmallButtons.pop();
            updateSmallMlsTitleAndStats();
            forceRefreshDisplay();
        }
    }

    function delLastSelectedSeg() { if (!hasOperationOnGoing() && lastSelectedLS) { return delSegment(lastSelectedLS.props.segIndex); } }

    function delLastSelectedPoint() {
        if (!hasOperationOnGoing() && lastSelectedPoint) {
            var props = lastSelectedPoint.props;
            var segIndex = props.segIndex, pointIndex = props.pointIndex;
            var lsFeature = lsSmallFeatures[segIndex];
            var lsArray = mlsSmallGeom.coordinates[segIndex];
            var len = lsArray.length;

            if (len > 1) {
                lsArray.splice(pointIndex, 1);

                var pointFeature = lsFeature.pointsFeature[pointIndex];

                lsFeature.pointsFeature.splice(pointIndex, 1);

                --len;

                for (var i = pointIndex ; i < len ; ++i) {
                    var pf = lsFeature.pointsFeature[i];
                    --pf.feature.props.pointIndex;
                }

                removeFeatureFromLayer(pointFeature);
                lastSelectedFeature = lastSelectedPoint = undefined;

                lsFeature.feature.SetGeom(new tf.map.FeatureGeom(makeLSGeom(props.isSmall, lsArray)));

                var segBtn = lsSmallButtons[segIndex];

                --segBtn.pointCount;
                updateVisibleStyle(segBtn);

                if (pointIndex >= len) { --pointIndex; }
                selectFeature(lsFeature.pointsFeature[pointIndex].feature);
                updateSmallMlsTitleAndStats();
                forceRefreshDisplay();
            }
            else { delSegment(segIndex); }
        }
    }

    function makeFeaturePropsName(verb, props) {
        var title = verb ? verb + ' ' : '';
        var typeName = props.isSmall ? " custom " : " model ";
        if (!mlsGeom) { typeName = " "; }
        var name = 'seg ' + (1 + props.segIndex);
        if (props.isMLSPoint) { name += ' point ' + (1 + props.pointIndex); }
        title += typeName + name;
        return title;
    }

    function makePointInstruction(verb, props) {
        var isSmall = props.isSmall;
        var instructionStr = makeFeaturePropsName(verb, props);
        if (isSmall) {
            instructionStr +=
                '<br/>- click to select' +
                '<br/>- double-click to move' +
                '<br/>- control-double-click to delete' +
                '<br/>- shift-click to add after' +
                '<br/>- control-shift-click to add before' +
                '';
        }
        instructionStr += '<br/>';
        return instructionStr;
    }

    function makeEdgeInstruction(verb, props) {
        var isSmall = props.isSmall;
        var instructionStr = makeFeaturePropsName(verb, props);
        if (isSmall) {
            instructionStr +=
                '<br/>- click to select' +
                '<br/>- shift-click to add point' +
                '<br/>- control-double-click to delete' +
                '';
        }
        else {
            instructionStr +=
                '<br/>- double-click to clone' +
                '';
        }
        instructionStr += '<br/>';
        return instructionStr;
    }

    function selectFeature(mapFeature) {
        if (!!lastSelectedFeature) {
            removeStartEnd();
            lastSelectedFeature.SetIsAlwaysInHover(false);
            lastSelectedFeature = lastSelectedPoint = lastSelectedLS = undefined;
        }
        var props = !!mapFeature ? mapFeature.props : undefined;
        if (!!props) {
            if (props.isSmall) {
                if (props.isMLSPoint) {
                    lastSelectedFeature = lastSelectedPoint = mapFeature;
                }
                else if (props.isMLSSeg) {
                    lastSelectedFeature = lastSelectedLS = mapFeature;
                }
            }
            if (!!lastSelectedFeature) {
                lastSelectedFeature.SetIsAlwaysInHover(true);
            }
        }
        if (!!lastSelectedFeature) {
            var title = makeFeaturePropsName(selectedVerb, props);
            routeSelectedTitleE.innerHTML = title;
            routeSelectedButtonsWrapper.ClearContent();
            if (props.isMLSPoint) {
                routeSelectedButtonsWrapper.AddContent(routeSelectedButtonsCustomPoint);
            }
            else if (props.isMLSSeg) {
                routeSelectedButtonsWrapper.AddContent(routeSelectedButtonsCustomLS);
                showStartEnd();
            }
        }
    }

    function showStartEnd() {
        if (!!lastSelectedLS) {
            var props = lastSelectedLS.props;
            var segIndex = props.segIndex;
            var lsArray = mlsSmallGeom.coordinates[segIndex];
            var len = lsArray.length;
            if (len > 0) {
                segStartMarker.SetPointCoords(lsArray[0]);
                segEndMarker.SetPointCoords(lsArray[len - 1]);
                mlsSmallLayer.AddMapFeature(segStartMarker);
                mlsSmallLayer.AddMapFeature(segEndMarker);
                isShowingStartEnd = true;
            }
        }
    }

    function mapListener(notification) {

        if (isEditing) {
            var mapFeature = notification.mapFeature;
            var props = !!mapFeature ? mapFeature.props : undefined;
            var instructionStr = undefined;
            var pointFeature, edgeFeature, foundFeature, isSmall;
            var canStartSegment;
            var mapEvent = notification.mapEvent;
            var hasControl = !!mapEvent ? mapEvent.originalEvent.ctrlKey : false;
            var hasShift = !!mapEvent ? mapEvent.originalEvent.shiftKey : false;
            var doneSomething = false;

            if (!!props) {
                if (props.isMLSPoint) { foundFeature = pointFeature = mapFeature; isSmall = props.isSmall; }
                else if (props.isMLSSeg) { foundFeature = edgeFeature = mapFeature; isSmall = props.isSmall; }
            }

            if (isMovingPoint) {
                var moveCoords = notification.eventCoords;
                var propsMove = lastSelectedPoint.props;
                var moveSegIndex = propsMove.segIndex, pointIndex = propsMove.pointIndex;
                var moveLSFeature = lsSmallFeatures[moveSegIndex];
                var moveLSArray = mlsSmallGeom.coordinates[moveSegIndex];

                lastSelectedPoint.SetPointCoords(moveCoords);
                moveLSArray[pointIndex] = moveCoords;
                moveLSFeature.feature.SetGeom(new tf.map.FeatureGeom(makeLSGeom(propsMove.isSmall, moveLSArray)));
                var name;
                if (isAddingPoint) {
                    name = makeFeaturePropsName('adding:', lastSelectedPoint.props);
                    name += '<br />- click to position and add next';
                    name += '<br />- double click to stop adding';
                }
                else {
                    name = makeFeaturePropsName('moving:', lastSelectedPoint.props);
                    name += '<br />- click to stop';
                }
                lastHoverInstruction = name;
            }

            switch (notification.eventName) {
                case tf.consts.mapMouseMoveEvent:
                    canStartSegment = !hasOperationOnGoing();
                    break;
                case tf.consts.mapClickEvent:
                    if (isMovingPoint) {
                        isMovingPoint = false;
                        if (isAddingPoint) { continueAddPoint(); }
                    }
                    else if (!hasOperationOnGoing()) { selectFeature(undefined); }
                    break;
                case tf.consts.mapDblClickEvent:
                    if (!hasOperationOnGoing()) { addSegment(notification.eventCoords, true); }
                    break;
                case tf.consts.mapFeatureClickEvent:
                    doneSomething = false;
                    if (isMovingPoint) {
                        doneSomething = true;
                        isMovingPoint = false;
                        if (isAddingPoint) { continueAddPoint(); }
                    }
                    else {
                        if (hasControl) {
                            doneSomething = true;
                            addSegment(notification.eventCoords, true);
                        }
                        else {
                            if (foundFeature && isSmall) {
                                doneSomething = true;
                                selectFeature(mapFeature);
                                if (hasShift) {
                                    if (props.isMLSPoint) { addBeforeOrAfterSelPoint(!hasControl); }
                                    else if (props.isMLSSeg) {
                                        var hitSegIndex = props.segIndex;
                                        var hitArray = mlsSmallGeom.coordinates[hitSegIndex];
                                        var result = tf.helpers.HitTestMapCoordinatesArray(hitArray, notification.eventCoords);
                                        if (!!result.closestPoint) {
                                            var hitLSFeature = lsSmallFeatures[hitSegIndex];
                                            var hitPointFeature = hitLSFeature.pointsFeature[result.minDistanceIndex];
                                            selectFeature(hitPointFeature.feature);
                                            setTimeout(function () {
                                                addBeforeOrAfterSelPoint(false, result.closestPoint);
                                            }, 100);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    canStartSegment = !doneSomething;
                    break;
                case tf.consts.mapFeatureDblClickEvent:
                    if (!hasOperationOnGoing()) {
                        if (foundFeature) {
                            if (isSmall) {
                                selectFeature(mapFeature);
                                if (hasControl) {
                                    if (props.isMLSPoint) { delLastSelectedPoint(); }
                                    else { delLastSelectedSeg(); }
                                }
                                else { isMovingPoint = props.isMLSPoint; }
                            }
                            else if (props.isMLSSeg) {
                                var normalSegIndex = props.segIndex;
                                var normalLSArray = mlsGeom.coordinates[normalSegIndex];
                                addSegment(normalLSArray, false);
                            }
                        }
                    }
                    else if (isAddingPoint) {
                        if (foundFeature == lastSelectedFeature) {
                            isAddingPoint = false;
                            isMovingPoint = false;
                            delLastSelectedPoint();
                        }
                    }
                    else if (isMovingPoint) {
                        isMovingPoint = false;
                    }
                    break;
                case tf.consts.mapFeatureMouseMoveEvent:
                    canStartSegment = !hasOperationOnGoing();
                    break;
                case tf.consts.mapFeatureHoverInOutEvent:
                    if (!hasOperationOnGoing()) {
                        if (notification.isInHover && !hasOperationOnGoing()) { lastHoverInstruction = !!pointFeature ? makePointInstruction(hoveredVerb, props) : (!!edgeFeature ? makeEdgeInstruction(hoveredVerb, props) : undefined); }
                        else { lastHoverInstruction = undefined; }
                    }
                    break;
            }

            var lastHoverInstructionUse = lastHoverInstruction;

            if (canStartSegment) {
                if (lastHoverInstructionUse != undefined) {
                    lastHoverInstructionUse += '- control-click to start a new segment<br />'
                }
                else {
                    lastHoverInstructionUse = "- double-click map to start a new segment<br />";
                }
            }

            if (lastHoverInstructionUse != undefined) { if (instructionStr != undefined) { instructionStr += lastHoverInstructionUse; } else { instructionStr = lastHoverInstructionUse; } }

            var hasInstructions = instructionStr != undefined;
            var hasSelected = lastSelectedFeature != undefined && !isMovingPoint;

            if (hasInstructions) {
                instructionsContentE.innerHTML = instructionStr;
                instructionsContentES.display = 'block';
            }
            else { instructionsContentES.display = 'none'; }

            if (hasSelected) { selectedContentES.display = 'block'; }
            else { selectedContentES.display = 'none'; }

            if (hasInstructions || hasSelected) { instructionsControlES.display = 'block'; }
            else { instructionsControlES.display = 'none'; }
        }
    }

    function createSegmentsTitle(title) {
        var titleDiv = new tf.dom.Div({ cssClass: routeSegmentsTitleClassName });
        var titleDivE = titleDiv.GetHTMLElement();
        titleDivE.innerHTML = title;
        return titleDiv;
    }

    function createSegmentsPanel(isSmall) {
        var panelDiv = new tf.dom.Div({ cssClass: routeSegmentsControlPanelClassName });

        var showAllButton = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: true, label: 'Show All', tooltip: 'Show All Segments', onClick: getOnShowAll(isSmall)
        }));

        var hideAllButton = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: true, label: 'Hide All', tooltip: 'Hide All Segments', onClick: getOnHideAll(isSmall)
        }));

        var showPointsButton = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: true, label: 'Hide Points', tooltip: 'Show / Hide points of visible segments', onClick: getOnShowHidePoints(isSmall)
        }));

        updateSegVisibleButton(showPointsButton, true);
        panelDiv.AddContent(showAllButton, hideAllButton, showPointsButton);

        return { panelDiv: panelDiv, showAllButton: showAllButton, hideAllButton: hideAllButton, showPointsButton: showPointsButton };
    }

    function onClearCustom() {
        replaceSmallMLS({ type: 'multilinestring', coordinates: [] });
        toaster.Toast({ text: "Shape cleared" });
        return false;
    }

    var cloneToast;
    function onCloneCustom() {
        if (!!cloneToast) { cloneToast.Close(); }
        cloneToast = toaster.Toast({ text: "Cloning model shape...", timeout: 0 });
        setTimeout(function () {
            replaceSmallMLS(tf.js.CopyMultiLineStringGeom(mlsGeom));;
            cloneToast.Close();
            cloneToast = toaster.Toast({ text: "Model shape was cloned" });
        }, 10);
        return false;
    }

    var mergeToast;
    function onMergeCustom() {
        if (!!mergeToast) { mergeToast.Close(); }
        mergeToast = toaster.Toast({ text: "Merging segments in shape...", timeout: 0 });
        setTimeout(function () {
            replaceSmallMLS(mlsMerger.Merge(mlsSmallGeom));
            mergeToast.Close();
            mergeToast = toaster.Toast({ text: "Segments were merged" });
        }, 10);
        return false;
    }

    var simplifyToast;
    function onSimplifyCustom() {
        if (!!simplifyToast) { simplifyToast.Close(); }
        simplifyToast = toaster.Toast({ text: "Simplifying points in shape...", timeout: 0 });
        setTimeout(function () {
            //var simplifyTolerance = 5;
            var simplifyTolerance = 1;
            replaceSmallMLS({ type: 'multilinestring', coordinates: tf.map.SimplifyMLSCoords(mlsSmallGeom.coordinates, simplifyTolerance) });
            simplifyToast.Close();
            simplifyToast = toaster.Toast({ text: "Shape points were simplified" });
        }, 10);
        return false;
    }
    
    function createCustomSegmentsPanel() {
        var panelDiv = new tf.dom.Div({ cssClass: routeSegmentsControlPanelClassName });

        var clearButton = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: true, label: 'Clear', tooltip: 'Delete all segments', onClick: onClearCustom
        }));

        var cloneButton = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: true, label: 'Clone', tooltip: 'Replace with a copy of the model shape', onClick: onCloneCustom
        }));

        var mergeButton = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: true, label: 'Merge', tooltip: 'Merge redundant segments', onClick: onMergeCustom
        }));

        var simplifyButton = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: true, label: 'Simplify', tooltip: 'Reduce the number of points', onClick: onSimplifyCustom
        }));

        panelDiv.AddContent(clearButton, cloneButton, mergeButton, simplifyButton);

        return { panelDiv: panelDiv, clearButton: clearButton, cloneButton: cloneButton, mergeButton: mergeButton, simplifyButton: simplifyButton };
    }

    function createSegmentsControl() {
        var normalControlWrapper = new tf.dom.Div({ cssClass: routesSegmentsControlWrapperClassName });
        var smallControlWrapper = new tf.dom.Div({ cssClass: routesSegmentsControlWrapperClassName });
        var statsControlWrapper = new tf.dom.Div({ cssClass: routesSegmentsControlWrapperClassName });

        normalControlWrapperES = normalControlWrapper.GetHTMLElement().style;
        smallControlWrapperES = smallControlWrapper.GetHTMLElement().style;
        statsControlWrapperES = statsControlWrapper.GetHTMLElement().style;

        var normalShapeTitleDiv = createSegmentsTitle("Model Shape");
        var smallShapeTitleDiv = createSegmentsTitle("Custom Shape");
        var statsShapeTitleDiv = createSegmentsTitle("Statistics");

        normalShapeTitleDivE = normalShapeTitleDiv.GetHTMLElement();
        smallShapeTitleDivE = smallShapeTitleDiv.GetHTMLElement();
        statsShapeTitleDivE = statsShapeTitleDiv.GetHTMLElement();

        normalShapePanelObj = createSegmentsPanel(false);
        smallShapePanelObj = createSegmentsPanel(true);

        customShapePanelObj = createCustomSegmentsPanel();

        normalShapeSegmentsList = new tf.dom.Div({ cssClass: routeSegmentsListClassName });
        smallShapeSegmentsList = new tf.dom.Div({ cssClass: routeSegmentsListClassName });

        normalControlWrapper.AddContent(normalShapeTitleDiv, normalShapePanelObj.panelDiv, normalShapeSegmentsList);
        smallControlWrapper.AddContent(smallShapeTitleDiv, smallShapePanelObj.panelDiv, customShapePanelObj.panelDiv, smallShapeSegmentsList);
        statsControlWrapper.AddContent(statsShapeTitleDiv);

        var routeSegmentsControlScroller = new tf.dom.Div({ cssClass: routeSegmentsControlScrollerClassName });

        routesSegmentsControl = new tf.dom.Div({ cssClass: topClassName + " " + routesSegmentsControlName });

        routeSegmentsControlScroller.AddContent(normalControlWrapper, smallControlWrapper, statsControlWrapper);
        routesSegmentsControl.AddContent(routeSegmentsControlScroller);

        routesSegmentsControl.GetHTMLElement().style.display = 'none';
    }

    function createSelCustomPointButtons(container) {
        var moveB = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: true, label: 'Move', tooltip: 'Move selected point', onClick: function (notification) {
                if (!hasOperationOnGoing() && !!lastSelectedPoint) {
                    isMovingPoint = true;
                    forceRefreshDisplay();
                }
            }
        }));
        var addBeforeB = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: true, label: 'Add Before', tooltip: 'Add point(s) before this point', onClick: getOnAddBeforeOrAfterSelPoint(true)
        }));
        var addAfterB = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: true, label: 'Add After', tooltip: 'Add point(s) after this point', onClick: getOnAddBeforeOrAfterSelPoint(false)
        }));
        var delB = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: true, label: 'Delete', tooltip: 'Delete this point', onClick: delLastSelectedPoint
        }));
        container.AddContent(moveB, addBeforeB, addAfterB, delB);
    }

    function createSelCustomLSButtons(container) {
        var addStartB = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: true, label: 'Add Start', tooltip: 'Add point(s) before the start of this segment', onClick: getOnAddStartEndSelSeg(true)
        }));
        var addAEndB = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: true, label: 'Add End', tooltip: 'Add point(s) after the end of this segment', onClick: getOnAddStartEndSelSeg(false)
        }));
        var delB = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: true, label: 'Delete', tooltip: 'Delete this segment', onClick: delLastSelectedSeg
        }));
        container.AddContent(addStartB, addAEndB, delB);
    }

    function createInstructionsControl() {
        var scroller = new tf.dom.Div({ cssClass: routeSegmentsControlScrollerClassName });

        instructionsControl = new tf.dom.Div({ cssClass: topClassName + " " + routesSegmentsInstructionClassName });
        instructionsControlE = instructionsControl.GetHTMLElement();
        instructionsControlES = instructionsControlE.style;
        instructionsControlES.display = 'none';
        instructionsControlES.textAlign = 'left';

        instructionsContent = new tf.dom.Div({ cssClass: routeSegmentsTitleClassName });
        instructionsContentE = instructionsContent.GetHTMLElement();
        instructionsContentES = instructionsContentE.style;
        instructionsContentES.display = 'none';
        instructionsContentE.title = 'Available actions';

        selectedContent = new tf.dom.Div({ cssClass: routeInstructionsContentClassName });
        selectedContentE = selectedContent.GetHTMLElement();
        selectedContentES = selectedContentE.style;
        selectedContentES.display = 'none';

        var routeSelectedTitle = new tf.dom.Div({ cssClass: routeSegmentsTitleClassName });
        routeSelectedTitleE = routeSelectedTitle.GetHTMLElement();
        routeSelectedTitleE.title = 'Currently selected item';

        routeSelectedButtonsWrapper = new tf.dom.Div();

        routeSelectedButtonsCustomPoint = new tf.dom.Div({ cssClass: routeSegmentsControlPanelClassName });
        createSelCustomPointButtons(routeSelectedButtonsCustomPoint);

        routeSelectedButtonsCustomLS = new tf.dom.Div({ cssClass: routeSegmentsControlPanelClassName });
        createSelCustomLSButtons(routeSelectedButtonsCustomLS);

        selectedContent.AddContent(routeSelectedTitle, routeSelectedButtonsWrapper);

        scroller.AddContent(instructionsContent, selectedContent);
        instructionsControl.AddContent(scroller);
    }

    function create() {
        var layerZIndex = minZIndex;
        var layerSettings = { name: "", isVisible: true, isHidden: true, useClusters: false, zIndex: layerZIndex };

        if (ownsMap) {
            var panels = tf.consts.panelNameNoAddress + '+' + tf.consts.panelNameNoMapLocation + '+' + tf.consts.panelNameNoUserLocation;
            var topFullScreenMapHolderDiv = new tf.dom.Div({ cssClass: topFullScreenMapHolderDivClassName });
            var mapSettings = tf.js.ShallowMerge({
                mapEngine: tf.consts.mapnik2Engine, mapType: tf.consts.typeNameMap, mapSource: tf.consts.sourceName_best_available,
                container: topFullScreenMapHolderDiv, panels: panels, extent: undefined, viewSettings: undefined,
                level: 16, showMapCenter: false, showScale: true, center: tf.consts.defaultMapCenter
            });
            map = new tf.map.Map(mapSettings);
            topDiv.AddContent(topFullScreenMapHolderDiv);
        }

        map.ShowMapCenter(false);
        map.SetHasInteractions(true);
        map.SetGoDBOnDoubleClick(false);
        map.SetUsePanOnClick(false);
        map.SetView({ minLevel: 11, maxLevel: 18 });

        map.AddListener(tf.consts.mapMouseMoveEvent, mapListener);
        map.AddListener(tf.consts.mapClickEvent, mapListener);
        map.AddListener(tf.consts.mapDblClickEvent, mapListener);
        map.AddListener(tf.consts.mapFeatureClickEvent, mapListener);
        map.AddListener(tf.consts.mapFeatureDblClickEvent, mapListener);
        map.AddListener(tf.consts.mapFeatureMouseMoveEvent, mapListener);
        map.AddListener(tf.consts.mapFeatureHoverInOutEvent, mapListener);

        layerSettings.name = "Full Shape";
        ++layerSettings.zIndex;
        mlsLayer = map.AddFeatureLayer(layerSettings);

        layerSettings.name = "Custom Shape";
        ++layerSettings.zIndex;
        mlsSmallLayer = map.AddFeatureLayer(layerSettings);

        createTitleControl();
        createSegmentsControl();
        createInstructionsControl();

        topDiv.AddContent(titleControl, routesSegmentsControl, instructionsControl);
    }

    function onResize() { map.OnResize(); return false; }

    function getStartEndMarkerStyle(isStart, isHover) {
        var zindex = isHover ? 41 : 40;
        var label = isStart ? 'start' : 'end';
        var markerOpacity = isHover ? 100 : 80;
        var lineWidth = 1;
        var markerStyle = {
            marker_horpos: "center", marker_verpos: "bottom",
            marker: true, label: label, font_height: isHover ? 16 : 14, zindex: zindex, marker_color: isHover ? "#ffd" : "#fff", font_color: isHover ? "#008" : "#008",
            line_width: lineWidth, line_color: "#ffffff", marker_opacity: markerOpacity, border_opacity: 60, border_color: "#000"
        };
        return markerStyle;
    }

    function getStartEndMarkerGeom(isStart) { return { type: 'point', coordinates: [0, 0], style: getStartEndMarkerStyle(isStart, false), hoverStyle: getStartEndMarkerStyle(isStart, true) }; }

    var controlWrapperClassName, titleClassName, buttonsClassName, topClassName, titleControlClassName, routeSegmentsTitleClassName, routeSegmentsListClassName,
        routesSegmentsControlWrapperClassName, routeSegmentsControlPanelClassName, routeSegmentsControlScrollerClassName, routesSegmentsControlName, routesSegmentsInstructionClassName,
        routeInstructionsContentClassName, topFullScreenMapHolderDivClassName, tableToastClassName;

    function createCSSClasses() {
        var controlWrapperStyles = { margin: "0px", padding: "0px", border: "none", display: "block" };

        controlWrapperClassName = tf.GetNextDynCSSClassName();

        var titleStyles = { padding: "4px", fontSize: "90%", backgroundColor: "rgba(255, 255, 255, 0.7)", marginBottom: "4px", display: "block", borderBottom: "1px solid brown" };

        titleClassName = tf.GetNextDynCSSClassName();

        var buttonsStyles = { display: "block", border: "none", padding: "2px", marginTop: "2px", borderTop: "1px solid rgba(255, 255, 255, 0.7)" };

        buttonsClassName = tf.GetNextDynCSSClassName();

        var topStyles = {
            position: "absolute", margin: "4px", border: "2px solid red", borderRadius: "6px", fontSize: "18px", lineHeight: "20px", color: "darkblue",
            backgroundColor: "orange", textShadow: "2px 2px 3px white", cursor: "default", display: "block", zIndex: "10", textAlign: "center", boxShadow: "2px 2px 4px 1px rgba(0,0,0,0.75)"
        };

        topClassName = tf.GetNextDynCSSClassName();

        var titleControlStyles = { left: "20px", top: "20px" };
        titleControlClassName = tf.GetNextDynCSSClassName();

        var routeSegmentsTitleStyles = {
            backgroundColor: "rgba(255, 255, 255, 0.7)", color: "#008", border: "1px solid blue", borderBottom: "1px solid orange",
            margin: "0px", lineHeight: "20px", fontSize: "14px", fontWeight: "500", padding: "4px", borderTopLeftRadius: "6px", borderTopRightRadius: "6px"
        };
        routeSegmentsTitleClassName = tf.GetNextDynCSSClassName();

        var routeSegmentsListStyles = { paddingTop: "2px", paddingBottom: "2px", borderLeft: "1px solid blue", borderRight: "1px solid blue", borderTop: "1px solid gold" };
        routeSegmentsListClassName = tf.GetNextDynCSSClassName();

        var routesSegmentsControlWrapperStyles = { overflow: "hidden", backgroundColor: "transparent", width: "100%", height: "100%", border: "none" };
        routesSegmentsControlWrapperClassName = tf.GetNextDynCSSClassName();

        var routeSegmentsControlPanelStyles = { paddingTop: "2px", paddingBottom: "2px", borderLeft: "1px solid blue", borderRight: "1px solid blue", borderTop: "1px solid gold" };
        routeSegmentsControlPanelClassName = tf.GetNextDynCSSClassName();

        var routeSegmentsControlScrollerStyles = { width: "100%" };
        routeSegmentsControlScrollerClassName = tf.GetNextDynCSSClassName();

        var routesSegmentsControlStyles = { right: "20px", bottom: "20px", overflow: "auto", maxWidth: "25%", maxHeight: "calc(100% - 44px)" };
        routesSegmentsControlName = tf.GetNextDynCSSClassName();

        var routesSegmentsInstructionStyles = { left: "20px", bottom: "20px", overflow: "auto", maxHeight: "calc(100% - 44px)" };
        routesSegmentsInstructionClassName = tf.GetNextDynCSSClassName();

        var routeInstructionsContentStyles = { textAlign: "left", borderTop: "1px solid gold" };
        routeInstructionsContentClassName = tf.GetNextDynCSSClassName();

        var topFullScreenMapHolderDivStyles = {
            display: "block", position: "absolute", left: "0px", top: "0px", width: "100%", height: "100%", border: "none",
            margin: "0px", padding: "0px"
        };
        topFullScreenMapHolderDivClassName = tf.GetNextDynCSSClassName();

        var tableToastStyle = {
            border: "2px solid red", borderRadius: "6px", padding: "8px", fontSize: "18px", lineHeight: "20px", color: "darkblue", backgroundColor: "orange",
            textShadow: "2px 2px 3px white", cursor: "default"
        };
        tableToastClassName = tf.GetNextDynCSSClassName();

        var cssStyles = [
            { styleName: '.' + tableToastClassName, inherits: tableToastStyle },
            { styleName: '.' + topFullScreenMapHolderDivClassName, inherits: topFullScreenMapHolderDivStyles },
            { styleName: '.' + routeInstructionsContentClassName, inherits: routeInstructionsContentStyles },
            { styleName: '.' + routesSegmentsInstructionClassName, inherits: routesSegmentsInstructionStyles },
            { styleName: '.' + routesSegmentsControlName, inherits: routesSegmentsControlStyles },
            { styleName: '.' + routeSegmentsControlScrollerClassName, inherits: routeSegmentsControlScrollerStyles },
            { styleName: '.' + routeSegmentsControlPanelClassName, inherits: routeSegmentsControlPanelStyles },
            { styleName: '.' + routesSegmentsControlWrapperClassName, inherits: routesSegmentsControlWrapperStyles },
            { styleName: '.' + routeSegmentsListClassName, inherits: routeSegmentsListStyles },
            { styleName: '.' + routeSegmentsTitleClassName, inherits: routeSegmentsTitleStyles },
            { styleName: '.' + titleControlClassName, inherits: titleControlStyles },
            { styleName: '.' + controlWrapperClassName, inherits: controlWrapperStyles },
            { styleName: '.' + titleClassName, inherits: titleStyles },
            { styleName: '.' + buttonsClassName, inherits: buttonsStyles },
            { styleName: '.' + topClassName, inherits: topStyles }
        ];

        styles.GetStyleCreator().CreateStyles(cssStyles);
    }

    function initialize() {

        buttonDim = "16px";
        textDim = buttonDim;

        mlsMerger = new tf.map.MLSSegMerger({ logErrors: false });

        if (ownsMap = !tf.js.GetMapFrom(settings.map)) { topDiv = settings.topDiv; }
        else { map = settings.map; topDiv = map.GetMapMapContainer(); }

        minZIndex = settings.minZIndex ? settings.minZIndex : 50;

        showingPoints = settings.showPoints != undefined ? settings.showPoints : true;
        showingSmallPoints = settings.showCustomPoints != undefined ? settings.showCustomPoints : true;

        onCloseCB = tf.js.GetFunctionOrNull(settings.onClose);
        styles = tf.GetStyles();
        createCSSClasses();

        textShadowBlack = { textShadow: "1px 1px 1px #000" };

        statusButtonEnabledClasses = styles.CreateTextDivBtnClasses("white", "green", "white", "darkgreen");
        statusButtonDisabledClasses = styles.CreateTextDivBtnClasses("white", "red", "white", "darkred");

        segButtonVisibleClasses = styles.CreateTextDivBtnClasses("white", "green", "white", "darkgreen");
        segButtonHiddenClasses = styles.CreateTextDivBtnClasses("white", "red", "white", "darkred");

        segmentButtonCache = {};

        colorSelected = "#ffaa00";
        hoveredVerb = 'hover:';
        selectedVerb = 'selected:';

        segStartMarker = new tf.map.Feature(getStartEndMarkerGeom(true));
        segEndMarker = new tf.map.Feature(getStartEndMarkerGeom(false));

        isEditing = false;

        create();

        var toasterStyle = { zIndex: 20, position: "absolute", right: "0px", top: "0px" };

        toaster = new tf.ui.Toaster({
            container: topDiv, timeout: 2000, className: "", style: toasterStyle, toastClassName: tableToastClassName, toastStyle: {
                display: "inline-block", margin: "6px", boxShadow: "3px 3px 6px rgba(0,0,0,0.5)"
            }, addBefore: false//, closeOnClick: false
        });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.map.FullScreenRouteShapeEditor = function (settings) {
    var theThis, fullScreenDiv, routeShapeEditor, onCloseRSECB, onFSDResize;

    this.GetIsEditing = function () { return routeShapeEditor.GetIsEditing(); }
    this.Edit = function (editSettings) { return edit(editSettings); }
    this.OnClose = function (isConfirmed) { return routeShapeEditor.OnClose(isConfirmed); }

    function edit(editSettings) { if (!routeShapeEditor.GetIsEditing()) { fullScreenDiv.Show(true); routeShapeEditor.Edit(editSettings); } }

    function onCloseRSE(notification) { fullScreenDiv.Show(false); if (!!onCloseRSECB) { onCloseRSECB(notification); } }

    function onWindowResize(notification) {
        routeShapeEditor.OnResize(); if (!!onFSDResize) { onFSDResize(notification); } return false;
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        var rseSettings = tf.js.GetValidObjectFrom(settings.editorSettings);
        var fsdSettings = tf.js.GetValidObjectFrom(settings.fullScreenSettings);
        onCloseRSECB = tf.js.GetFunctionOrNull(rseSettings.onClose);
        onFSDResize = tf.js.GetFunctionOrNull(fsdSettings.onResize);
        fullScreenDiv = new tf.ui.FullScreenDiv(tf.js.ShallowMerge(fsdSettings, { onResize: onWindowResize }));
        routeShapeEditor = new tf.map.RouteShapeEditor(tf.js.ShallowMerge(rseSettings, { onClose: onCloseRSE, topDiv: fullScreenDiv.GetTopDiv() }));
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

