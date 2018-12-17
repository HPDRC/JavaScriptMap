"use strict";

/**
 * class tf.ui.VideoTrackPlayer - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} tMap - parameter description?
 * @param {?} backgroundColorSet - parameter description?
 * @param {?} backgroundImgSet - parameter description?
 * @param {?} onCloseCallBack - parameter description?
 * @param {?} onCloseCallBackThis - parameter description?
*/
tf.ui.VideoTrackPlayer = function (tMap, backgroundColorSet, backgroundImgSet, onCloseCallBack, onCloseCallBackThis) {

    var theThis, debug, styles, onTouchDevice;
    var iconScale, zIndexStartMapFeature, zIndexendMapFeature, zIndexPoly, zIndexPolyDash, zIndexcurPosMapFeature, zIndexHoverMarker;
    var polyColor, polyLineWidth, dashLineColor, dashLineWidth, dashStyle;
    var mapRollOverListener, mapResizedListener;
    var tLayer, startMapFeature, endMapFeature, curPosMapFeature, hoverPosMapFeature, tPoly, tPolyDash, hoverPosMapFeatureVisible;
    var videoPopup, trackingOnMap, rotatingMap, isPlaying;
    var dLayersOpacityBeforePlay, usingGeocodingBeforePlay, hadAddressBarBeforePlay, showingAddressBeforePlay, rotationBeforePlay;
    var lastPathTitle, lastSpeedAltIndex, lastSpeed, lastAlt, lastVideoIndexPath, lastVideoTime01, lastTimePlay, lastHoverPlayTime01,
        lastHoverPlayIndex, lastHoverRotation, lastPlayMarkerRotation, lastIsShowingMiniVideo;
    var path, directions, times, pathLength, minMaxSpeedAlt, speedConversion, speedUnit, altConversion, altUnit;
    var time01Next, timeNext, videoPopupLightButton, showingSpeed, speedButton, altButton;
    var speedAltCanvasObj, speedAltCanvasElem, speedAltMouseListener, isHoveringOverSpeedAlt, altSpeedHover01, graphBar;

/**
 * method tf.ui.VideoTrackPlayer.Show - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} bool - parameter description?
*/
    this.Show = function (bool) { if (videoPopup) { videoPopup.Show(bool); theThis.OnContainerResize();} }
/**
 * method tf.ui.VideoTrackPlayer.IsShowing - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.IsShowing = function () { return videoPopup ? videoPopup.IsShowing() : false; }
/**
 * method tf.ui.VideoTrackPlayer.Toggle - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Toggle = function () { theThis.Show(!theThis.IsShowing()); }

/**
 * method tf.ui.VideoTrackPlayer.OnContainerResize - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.OnContainerResize = function () { return onContainerResize(); }

/**
 * method tf.ui.VideoTrackPlayer.Play - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} videoURL - parameter description?
 * @param {?} pathGeometry - parameter description?
 * @param {?} path - parameter description?
 * @param {?} directions - parameter description?
 * @param {?} times - parameter description?
 * @param {?} timeStart - parameter description?
 * @param {?} speedConversion - parameter description?
 * @param {?} speedUnit - parameter description?
 * @param {?} altConversion - parameter description?
 * @param {?} altUnit - parameter description?
*/
    this.Play = function (videoURL, pathGeometry, path, directions, times, timeStart, speedConversion, speedUnit, altConversion, altUnit) {
        return play(videoURL, path, directions, times, timeStart, speedConversion, speedUnit, altConversion, altUnit);
    }
/**
 * method tf.ui.VideoTrackPlayer.Stop - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Stop = function () { return stop(); }
/**
 * method tf.ui.VideoTrackPlayer.OnDelete - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.OnDelete = function () { return onDelete(); }

/**
 * method tf.ui.VideoTrackPlayer.GetIsPlaying - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetIsPlaying = function () { return isPlaying; }

    function onContainerResize() {
        videoPopup.OnContainerResize();
        speedAltCanvasObj.Repaint();
    }

    function onDelete() {
        if (mapRollOverListener) { mapRollOverListener.OnDelete(); mapRollOverListener = null; }
        if (mapResizedListener) { mapResizedListener.OnDelete(); mapResizedListener = null; }
        if (tLayer) {
            tMap.RemoveLayer(tLayer); tLayer = null;
            startMapFeature = endMapFeature = curPosMapFeature = hoverPosMapFeature = tPoly = tPolyDash = null;
            hoverPosMapFeatureVisible = false;
        }
    }

    function stop() { return onStopPlayVideo(false); }

    function saveStateBeforePlay() {
        usingGeocodingBeforePlay = tMap.IsPanelShowing(tf.consts.panelNameMapLocation);
        hadAddressBarBeforePlay = tMap.IsPanelShowing(tf.consts.paramNameAddress);
        showingAddressBeforePlay = tMap.IsShowingAddressBar();
        rotationBeforePlay = tMap.GetRotationRad();

        tMap.ShowPanel(tf.consts.paramNameAddress, false);
        tMap.ShowPanel(tf.consts.panelNameMapLocation, false);
    }

    function restoreStateAfterPlay() {
        if (usingGeocodingBeforePlay) { tMap.ShowPanel(tf.consts.panelNameMapLocation, true); }
        if (hadAddressBarBeforePlay) { tMap.ShowPanel(tf.consts.paramNameAddress, true); }
        tMap.SetRotationRad(rotationBeforePlay);
        if (videoPopup.IsShowing()) { videoPopup.Show(false); }
    }

    function resetLasts() {
        lastPathTitle = ''; lastSpeedAltIndex = 0; lastSpeed = 0; lastAlt = 0; lastVideoIndexPath = 0; lastVideoTime01 = 0; lastTimePlay = -1;
        lastHoverPlayTime01 = 0; lastHoverPlayIndex = 0; lastHoverRotation = lastPlayMarkerRotation = 0;
        path = null, directions = null, times = null, pathLength = 0;
        minMaxSpeedAlt = null;
        lastIsShowingMiniVideo = false;
    }

    function onStopPlayVideo(willPlayAnotherBool) {
        if (isPlaying) {
            tLayer.SetVisible(false);
            videoPopup.Stop();
            resetLasts();
            if (!willPlayAnotherBool) {
                restoreStateAfterPlay();
                isPlaying = false;
                if (typeof onCloseCallBack === "function") {
                    onCloseCallBack.call(onCloseCallBackThis, theThis);
                }
            }
        }
    }

    function createPolyFromPath(layerUse, path) {
        var coords = tf.helpers.GetCoordinatesFromLatLonArray(path);
        var style = { line: true, fill: true, line_color: polyColor, line_width: 1, line_alpha: 100, fill_color: "#fff", fill_alpha: 50 };
        var feature = new tf.map.Feature({ geom: new tf.map.FeatureGeom({ type: "linestring", coordinates: coords }), style: style });
        layerUse.AddMapFeature(feature);
        return feature;
    }

    function makeTemporaryStr(str) { return '[' + str + ']'; }
    function makeSpeedStr(speedMPH, isTemporary) { var speedStr = (tf.js.GetFloatNumber(speedMPH, 0) * speedConversion).toFixed(0) + ' ' + speedUnit; return isTemporary ? makeTemporaryStr(speedStr) : speedStr; }
    function makeAltStr(altFeet, isTemporary) { var altStr = (tf.js.GetFloatNumber(altFeet, 0) * altConversion).toFixed(0) + ' ' + altUnit; return isTemporary ? makeTemporaryStr(altStr) : altStr; }

    function play(videoURL, pathSet, directionsSet, timesSet, timeStart, speedConversionSet, speedUnitSet, altConversionSet, altUnitSet) {
        var wasPlaying = isPlaying;

        if (wasPlaying) { onStopPlayVideo(true); } else { saveStateBeforePlay(); }

        path = pathSet; directions = directionsSet; times = timesSet;

        speedConversion = speedConversionSet;
        speedUnit = speedUnitSet ;
        altConversion = altConversionSet ;
        altUnit = altUnitSet;

        pathLength = path.length;

        minMaxSpeedAlt = tf.helpers.CalcMinMaxSpeedAlt(path);

        var pathItem0 = path[0], pathItemN = path[pathLength - 1];

        startMapFeature.SetPointCoords([pathItem0.lon, pathItem0.lat]);
        curPosMapFeature.SetPointCoords([pathItem0.lon, pathItem0.lat]);
        endMapFeature.SetPointCoords([pathItemN.lon, pathItemN.lat]);

        if (tPoly) { tLayer.DelMapFeature(tPoly); }
        if (tPolyDash) { tLayer.DelMapFeature(tPolyDash); }

        tPoly = createPolyFromPath(tLayer, path);
        tPolyDash = createPolyFromPath(tLayer, path);

        tPoly.ChangeStyle({ line_width: polyLineWidth, zindex: 1 });
        tPolyDash.ChangeStyle({ line_width: dashLineWidth, line_color: dashLineColor, line_dash: dashStyle, zindex: 2 });

        lastPathTitle = pathItem0.timestamp;
        videoPopup.ChangeTitle(lastPathTitle);

        videoPopup.SetVideoURL(videoURL);
        tLayer.SetVisible(true);
        onVideoSeekTo(timeStart);
        videoPopup.Show(true);
        if (showingSpeed) { onShowSpeedGraph(); } else { onShowAltGraph(); }
        speedAltCanvasObj.Repaint();

        isPlaying = true;
    }

    var asyncTime01, asyncTime;

    function onVideoTimeUpdate(videoPlayer, time01, time) {
        var nSecsTime = Math.floor(time);
        asyncTime01 = time01;
        asyncTime = time;
        if (lastTimePlay != nSecsTime) {
            time01Next = time01;
            timeNext = time;
            setTimeout(asyncTimeUpdate, 50);
        }
    }

    function asyncTimeUpdate() {

        var time01 = time01Next; var time = timeNext;
        var playTime = getPathIndexFromTime01(time01, time);
        var indexPath = playTime.indexPath;
        var hasGPS = playTime.hasGPS;
        var nSecsTime = Math.floor(time);

        if (lastTimePlay != nSecsTime) {

            //tf.GetDebug().LogIfTest("TimeUpdate");

            lastTimePlay = nSecsTime;
            lastVideoTime01 = time01;
            lastVideoIndexPath = indexPath;

            var hoverVisible = hoverPosMapFeatureVisible;

            if (indexPath < pathLength) {

                var pathItem = path[indexPath];

                lastPlayMarkerRotation = getMapRotation(indexPath, lastPlayMarkerRotation);

                curPosMapFeature.SetPointCoords([pathItem.lon, pathItem.lat]);

                if (trackingOnMap) { tMap.SetCenter([pathItem.lon, pathItem.lat]); }

                lastPathTitle = pathItem.timestamp;

                if (!hasGPS) { lastPathTitle += ' [ no GPS data ]' }

                if (!(hoverVisible || videoPopup.GetIsMiniVideoShowing())) {
                    videoPopup.ChangeTitle(lastPathTitle);
                    updateSpeedAlt(indexPath, pathItem.speed, pathItem.altitude, false);
                }

                if (rotatingMap) {
                    tMap.SetRotationRad(lastPlayMarkerRotation);
                    curPosMapFeature.ChangeStyle({ rotation_rad: 0 });
                }
                else {
                    tMap.SetRotationRad(0);
                    curPosMapFeature.ChangeStyle({ rotation_rad: -lastPlayMarkerRotation });
                }
            }

            if (hoverVisible) { updateHoverPreview(lastHoverPlayTime01, lastHoverPlayIndex); }
            else { speedAltCanvasObj.Repaint(); }
        }
    }

    function getPathIndexFromTime01(time01, time) {
        var pathIndex = { indexPath: 0, hasGPS: false };

        if (pathLength > 0) {
            if (!!times) {
                var nTimes = times.length;
                if (nTimes > 0) {
                    if (time01 < 0) { time01 = 0; } else if (time01 > 1) { time01 = 1; }

                    var indexTimes = Math.floor(nTimes * time01);
                    //var indexTimes = Math.floor((nTimes - 1) * time01);
                    pathIndex = times[indexTimes];
                }
            }
        }
        return pathIndex;
    }

    function onMiniVideoChange(videoPlayer, isShowingMiniVideo, pos01) {
        var index = -1;
        if (isShowingMiniVideo != lastIsShowingMiniVideo) {
            if (lastIsShowingMiniVideo = isShowingMiniVideo) {
                if (pathLength > 0) {
                    index = getPathIndexFromTime01(pos01).indexPath;
                    var pathItem = path[index];
                    startHoverPreview(pos01, index, false);
                }
            }
            else { stopHoverPreview(false); }
        }

        if (isShowingMiniVideo) { if (index == -1) { index = getPathIndexFromTime01(pos01).indexPath; } updateHoverPreview(pos01, index, false); }
        else { updateLastSpeedAlt(false); }
    }

    function onToggleTrack() { trackingOnMap = !trackingOnMap; }
    function onToggleRotate() { rotatingMap = !rotatingMap; }

    function updateButtonLightDark() {
        speedButton.SetStyle(videoPopupLightButton ? !showingSpeed : showingSpeed);
        altButton.SetStyle(videoPopupLightButton ? showingSpeed : !showingSpeed);
        speedAltCanvasObj.Repaint();
    }
    function onShowSpeedGraph() { graphBar.SetData(path, "speed", minMaxSpeedAlt.minSpeed, minMaxSpeedAlt.maxSpeed); showingSpeed = true; updateButtonLightDark(); }
    function onShowAltGraph() { graphBar.SetData(path, "altitude", minMaxSpeedAlt.minAlt, minMaxSpeedAlt.maxAlt); showingSpeed = false; updateButtonLightDark(); }
    
    function onMouseAtSpeedAlt(notification) {
        var isHovering = notification.isInHover;

        if (isHovering != isHoveringOverSpeedAlt) { isHoveringOverSpeedAlt = isHovering; speedAltCanvasObj.Repaint(); }

        var width = speedAltCanvasElem.offsetWidth;

        altSpeedHover01 = graphBar.GetTime01FromGraphCol(notification.mouseCoords[0]);
        var pathIndex = getPathIndexFromTime01(altSpeedHover01).indexPath;

        //tf.GetDebug().LogIfTest(notification.eventName);

        switch (notification.eventName) {
            case "mouseout":
                stopHoverPreview(true);
                break;
            case 'mousedown':
                tf.GetDocMouseListener().SetCapture(onMouseAtSpeedAlt, theThis, null);
                if (hoverPosMapFeatureVisible) { stopHoverPreview(true); }
                onVideoSeekTo(altSpeedHover01);
                break;
            case 'mouseup':
                tf.GetDocMouseListener().ReleaseCapture();
                break;
            case 'mousemove':
                if (!onTouchDevice) {
                    if (notification.isInDrag) {
                        if (hoverPosMapFeatureVisible) { stopHoverPreview(true); }
                        onVideoSeekTo(altSpeedHover01);
                    }
                    else {
                        if (!hoverPosMapFeatureVisible) { startHoverPreview(altSpeedHover01, pathIndex, true); }
                        else { updateHoverPreview(altSpeedHover01, pathIndex, true); }
                    }
                }
                break;
        }
    }

    function createVideoPopup() {

        videoPopup = new tf.ui.VideoPopup(tMap.GetMapMapContainer(), backgroundColorSet, backgroundImgSet);
        videoPopup.SetZIndex(1000);
        videoPopup.SetOnClose(onStopPlayVideo, theThis);
        videoPopup.SetOnTimeUpdate(onVideoTimeUpdate, theThis);
        videoPopup.SetOnMiniVideoChangeCallBack(onMiniVideoChange, theThis);

        videoPopupLightButton = videoPopup.GetIsButtonLight();
        var buttonDim = videoPopup.GetToolBarButtonDim();
        var glyphLib = tf.ui.GetSvgGlyphLib();

        videoPopup.AddToolBarButton(
            new tf.ui.SvgGlyphToggleBtn({
                style: videoPopupLightButton, onClick: onToggleRotate, dim: buttonDim, isToggled: !rotatingMap,
                glyph: tf.styles.SvgGlyphNoCompassName, tooltip: "Stop auto heading", toggledGlyph: tf.styles.SvgGlyphCompassName, toggledTooltip: "Auto heading"
            }));
        videoPopup.AddToolBarButton(
            new tf.ui.SvgGlyphToggleBtn({
                style: videoPopupLightButton, onClick: onToggleTrack, dim: buttonDim, isToggled: !trackingOnMap,
                glyph: tf.styles.SvgGlyphNoTargetName, tooltip: "Stop auto positioning", toggledGlyph: tf.styles.SvgGlyphTargetName, toggledTooltip: "Auto positioning"
            }));

        speedButton = new tf.ui.TextBtn({ style: videoPopupLightButton ? !showingSpeed : showingSpeed, label: "", onClick: onShowSpeedGraph, tooltip: "current speed", dim: buttonDim });
        altButton = new tf.ui.TextBtn({ style: videoPopupLightButton ? showingSpeed : !showingSpeed, label: "", onClick: onShowAltGraph, tooltip: "current altitude", dim: buttonDim });

        var minWidthSpeedAltButtons = "1em";
        var speedButtonElem = speedButton.GetHTMLElement(); speedButtonElem.style.minWidth = minWidthSpeedAltButtons;
        var altButtonElem = altButton.GetHTMLElement(); altButtonElem.style.minWidth = minWidthSpeedAltButtons;

        videoPopup.AddToolBarButton(styles.AddButtonDivTopBottMargins(styles.AddButtonDivRightMargin(altButton)));
        videoPopup.AddToolBarButton(styles.AddButtonDivTopBottMargins(styles.AddButtonDivLeftRightMargins(speedButton)));

        graphBar = new tf.canvas.GraphBar();

        speedAltCanvasObj = new tf.dom.Canvas();
        speedAltCanvasObj.SetRepaint(graphBar.GetRepaintFunction(), theThis);
        speedAltCanvasElem = speedAltCanvasObj.GetHTMLElement();

        speedAltMouseListener = new tf.events.DOMMouseListener({ target: speedAltCanvasElem, callBack: onMouseAtSpeedAlt, optionalScope: theThis, callBackSettings: undefined });

        speedAltCanvasElem.style.width = "1px";
        speedAltCanvasElem.style.height = "16px";

        videoPopup.AddContent(speedAltCanvasObj);
    }

    function onVideoSeekTo(pos01) { videoPopup.SetPos01(pos01); }

    function getMapRotation(pathIndex, lastRotation) { return (directions && pathIndex >= 0 && pathIndex < pathLength) ? directions[pathIndex] - (Math.PI / 2): lastRotation; }

    function onClickFeature(notification) {
        var mapFeature = notification.mapFeature;

        if (!!mapFeature) {
            if (mapFeature == tPoly || mapFeature == tPolyDash) {
                var hitTest = tf.helpers.HitTestRoute(path, times, notification.eventCoords[1], notification.eventCoords[0]); onVideoSeekTo(hitTest.time01);
            }
            else if (mapFeature == startMapFeature) { }
            else if (mapFeature == endMapFeature) { }
            else if (mapFeature == curPosMapFeature) { }
            else if (mapFeature == hoverPosMapFeature) {
                onVideoSeekTo(lastHoverPlayTime01);
                tLayer.DelMapFeature(hoverPosMapFeature);
                hoverPosMapFeatureVisible = false;
                videoPopup.ShowMiniVideo(false, 0);
            }
        }
    }

    function onRollOverRoute(coords) {
        var hitTest = tf.helpers.HitTestRoute(path, times, coords[1], coords[0]);
        debugOut('rolling over route');
        if (!hoverPosMapFeatureVisible) { startHoverPreview(hitTest.time01, hitTest.index, true); }
        else { updateHoverPreview(hitTest.time01, hitTest.index, true); }
    }

    function onMouseMoveFeature(notification) {
        var mapFeature = notification.mapFeature;

        if (!!mapFeature) {
            if (mapFeature == tPoly || mapFeature == tPolyDash) {
                onRollOverRoute(notification.eventCoords);
            }
        }
    }

    function startHoverPreview(hover01, indexPath, activateMiniVideoBool) {
        var pathItem = path[indexPath];

        lastHoverPlayTime01 = hover01;
        lastHoverPlayIndex = indexPath;
        lastHoverRotation = getMapRotation(indexPath, 0);

        hoverPosMapFeature.SetPointCoords([pathItem.lon, pathItem.lat]);
        hoverPosMapFeature.ChangeStyle({ rotation_rad: tMap.GetRotationRad() - lastHoverRotation });
        tLayer.AddMapFeature(hoverPosMapFeature);
        hoverPosMapFeatureVisible = true;

        if (activateMiniVideoBool) { videoPopup.ShowMiniVideo(true, hover01); }

        videoPopup.ChangeTitle(makeTemporaryStr(pathItem.timestamp));
        updateSpeedAltFromItem(indexPath, pathItem, true);
        speedAltCanvasObj.Repaint();
    }

    function updateHoverPreview(hover01, pathIndex, updateMiniVideoBool) {
        if (hoverPosMapFeatureVisible) {
            lastHoverPlayTime01 = hover01;
            lastHoverPlayIndex = pathIndex;

            if (!!path) {
                var pathItem = path[pathIndex];
                if (pathItem) {
                    hoverPosMapFeature.SetPointCoords([pathItem.lon, pathItem.lat]);
                    videoPopup.ChangeTitle(makeTemporaryStr(pathItem.timestamp)); updateSpeedAltFromItem(pathIndex, pathItem, true);
                }
            }
            if (updateMiniVideoBool) { videoPopup.ShowMiniVideo(true, hover01); }

            lastHoverRotation = getMapRotation(pathIndex, lastHoverRotation);
            hoverPosMapFeature.ChangeStyle({ rotation_rad: tMap.GetRotationRad() - lastHoverRotation });
            speedAltCanvasObj.Repaint();

        }
    }

    function stopHoverPreview(deactivateMiniVideoBool) {
        if (hoverPosMapFeatureVisible) {
            tLayer.DelMapFeature(hoverPosMapFeature);
            hoverPosMapFeatureVisible = false;
        }
        if (!!deactivateMiniVideoBool) { videoPopup.ShowMiniVideo(false, 0); }

        videoPopup.ChangeTitle(lastPathTitle);

        if (path) {
            var lastPathItem = path[lastVideoIndexPath];

            if (lastPathItem) { updateSpeedAltFromItem(lastVideoIndexPath, lastPathItem, false); }
        }
        speedAltCanvasObj.Repaint();
    }

    function debugOut() { if (!!debug) { debug.LogIfTest.apply(null, arguments); } }

    function onRollOverMap(notification) {
        debugOut('rolling over map');
        if (notification.sender == tMap) { stopHoverPreview(true); }
    }

    function updateSpeedAltFromItem(indexPath, pathItem, isTemporaryBool) {
        return updateSpeedAlt(indexPath, pathItem.speed, pathItem.altitude, isTemporaryBool);
    }

    function updateLastSpeedAlt(isTemporaryBool) { updateSpeedAlt(lastSpeedAltIndex, lastSpeed, lastAlt, isTemporaryBool); }

    function updateSpeedAlt(indexPath, speedMPH, altFeet, isTemporary) {
        speedMPH = tf.js.GetFloatNumber(speedMPH, 0);
        altFeet = tf.js.GetFloatNumber(altFeet, 0);
        lastSpeedAltIndex = indexPath;
        lastSpeed = speedMPH;
        lastAlt = altFeet;
        var speedStr = makeSpeedStr(speedMPH, isTemporary), altStr = makeAltStr(altFeet, isTemporary);
        speedButton.SetText(speedStr);
        altButton.SetText(altStr);
        graphBar.SetCurIndex(lastVideoIndexPath);
        graphBar.SetIsInHover(isTemporary);
        if (isTemporary) { graphBar.SetHoverIndex(indexPath); } 
    }

    function onPreCompose(notification) {
        //asyncTime, asyncTime01
        if (asyncTime01 !== undefined) {
            var playTime = getPathIndexFromTime01(asyncTime01, asyncTime);
            var indexPath = playTime.indexPath;
            if (indexPath < pathLength) {
                var pathItem = path[indexPath], pointCoords;

                if (indexPath < pathLength - 1) {
                    var nextPathItem = path[indexPath + 1];
                    var timeInPathSeg = (asyncTime - Math.floor(asyncTime));
                    //tf.GetDebug().LogIfTest(asyncTime01 + ' ' + asyncTime + ' ' + indexPath + ' ' + timeInPathSeg);
                    pointCoords = [
                        pathItem.lon + (nextPathItem.lon - pathItem.lon) * timeInPathSeg,
                        pathItem.lat + (nextPathItem.lat - pathItem.lat) * timeInPathSeg
                    ];
                }
                else {
                    pointCoords = [pathItem.lon, pathItem.lat];
                }

                //lastPlayMarkerRotation = getMapRotation(indexPath, lastPlayMarkerRotation);

                curPosMapFeature.SetPointCoords(pointCoords);
                //if (trackingOnMap) { tMap.SetCenter(pointCoords); }

                if (rotatingMap) {
                    //tMap.SetRotationRad(lastPlayMarkerRotation);
                    curPosMapFeature.ChangeStyle({ rotation_rad: 0 });
                }
                else {
                    tMap.SetRotationRad(0);
                    curPosMapFeature.ChangeStyle({ rotation_rad: -lastPlayMarkerRotation });
                }

            }
            notification.continueAnimation();
        }
    }

    function createMapObjects() {

        var zIndex = 0;

        zIndexStartMapFeature = zIndex++; zIndexendMapFeature = zIndex++; zIndexPoly = zIndex++; zIndexPolyDash = zIndex++; zIndexcurPosMapFeature = zIndex++; zIndexHoverMarker = zIndex++;

        var startEndAlphaStyle = 50;
        var startEndStyle = { marker: true, marker_color: "#07375f", font_height: 20, font_color: "#FFFFFF", border_color: "#a4a4a4", marker_alpha: startEndAlphaStyle };
        var directionFileName = tf.platform.MakePlatformPath("image/direction.png");
        var curPosMapFeatureStyle = { border_alpha: 0, border_width: 0, scale: iconScale, zindex: zIndexcurPosMapFeature, icon: true, icon_url: directionFileName };
        var hoverPosMapFeatureStyle = { border_alpha: 0, border_width: 0, scale: (iconScale * 0.8), zindex: zIndexHoverMarker, icon: true, icon_url: directionFileName };

        tMap.ShowMapCenter(false);

        tLayer = tMap.AddFeatureLayer({ isHidden: true, isVisible: false, zIndex: 1000 });

        tLayer.AddMapFeature(startMapFeature = new tf.map.Feature({ type: "point", coordinates: [0, 0], style: tf.js.ShallowMerge(startEndStyle, { label: "Start", zindex: zIndexStartMapFeature }) }));
        tLayer.AddMapFeature(endMapFeature = new tf.map.Feature({ type: "point", coordinates: [0, 0], style: tf.js.ShallowMerge(startEndStyle, { label: "End", zindex: zIndexendMapFeature }) }));

        tLayer.AddMapFeature(curPosMapFeature = new tf.map.Feature({ type: "point", coordinates: [0, 0], style: curPosMapFeatureStyle }));
        hoverPosMapFeature = new tf.map.Feature({ type: "point", coordinates: [0, 0], style: hoverPosMapFeatureStyle });

        hoverPosMapFeatureVisible = false;

        tMap.AddListener(tf.consts.mapFeatureClickEvent, onClickFeature);
        tMap.AddListener(tf.consts.mapFeatureMouseMoveEvent, onMouseMoveFeature);

        mapRollOverListener = tMap.AddListener(tf.consts.mapMouseMoveEvent, onRollOverMap);
        mapResizedListener = tMap.AddListener(tf.consts.mapResizedEvent, onContainerResize);

        //tMap.AddListener(tf.consts.mapPreComposeEvent, onPreCompose);

    }

    function initialize() {
        //debug = tf.GetDebug();
        styles = tf.GetStyles();
        iconScale = 0.08;
        onTouchDevice = tf.browser.HasTouch();
        polyColor = "#FF2222"; polyLineWidth = 8; dashLineColor = "#000"; dashLineWidth = 1; dashStyle = [12, 6];
        hoverPosMapFeatureVisible = false;
        trackingOnMap = true;
        rotatingMap = true;
        showingSpeed = true;
        speedConversion = 1;
        altConversion = 1;
        dLayersOpacityBeforePlay = 1;
        lastIsShowingMiniVideo = isPlaying = isHoveringOverSpeedAlt = usingGeocodingBeforePlay = hadAddressBarBeforePlay = showingAddressBeforePlay = videoPopupLightButton = false;
        lastPathTitle = '';
        speedUnit = '';
        altUnit = '';
        rotationBeforePlay = time01Next = timeNext = zIndexStartMapFeature = zIndexendMapFeature = zIndexPoly = zIndexPolyDash = zIndexcurPosMapFeature = zIndexHoverMarker = pathLength = altSpeedHover01 =
            lastHoverPlayIndex = lastHoverRotation = lastPlayMarkerRotation = lastHoverPlayTime01 = lastSpeedAltIndex = lastSpeed = lastAlt = lastVideoIndexPath = lastVideoTime01 = 0;
        lastTimePlay = -1;

        createVideoPopup();
        createMapObjects();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
