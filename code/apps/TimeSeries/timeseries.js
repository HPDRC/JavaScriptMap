"use strict";

tf.apps.TimeSeries = function () {

    var engineUrl = "http://terranode-246.cs.fiu.edu/scripts/demo_rendering_engine/rendering_engine.py";

    var theThis, debug, styles;
    var singleMapApp, tMap, boundsFeature, onDelayTimeSeries;
    var lastCenter = [0,0], lastRes, lastExtent, lastDim;
    var progressPanel, buttonStopPlay, progressMarkersDiv, topBotLayout, topLayoutStyle, botLayoutStyle, mapDiv, sourceSelPopup, sourcesSelButton, sourcesSelButtonStyle;
    var firstTime = true, tilesAreLoaded = false;
    var allSourcesAndDates, selectedSourcesAndDates, requestCount, nTilesLoaded, nTilesToLoad, nTilesSelected, prevMapFeature;
    var selectedIndex = -1, lastSelectedIndex = -1, lastTimeClicked;
    var isPlaying = false, aniInterval, selectedSourceName;
    var allSourcesUrlParam = "All", sourcesUrlParamName = "sources";
    var progressBarItemIdPrefix = "progressBarItemId";

    var sourcesForTesting = allSourcesUrlParam + "+COUNTY_1FT+COUNTY_3INCH+DOR_1FT+NAIP_1M+USGS_1M+USGS_30CM+USGS_75CM+USGS_AP_CIR+USGS_BW_3INCH";

    // change these to customize styles and behavior

    var defaultLat = 25.7875, defaultLon = -80.1892, defaultRes = 1.2;
    var autoPlay = true;
    var timePerFrame = 2000, timeBlend = 500;
    var inlineSourceSelection = true;
    var mapMarginFactor = 0.15;
    var layoutsMarginEMNumber = 0.25;
    var topBottomSeparatorEMNumber = 0.2;
    var heightProgressPanel = "55px";
    var dimPlayPausePanelNumber = 22;
    var topBottomSeparatorColor = "#00a";
    var backgroundColor = "#0cb";
    var dateWidth = 70;

    var stopImageBkURL = "url('http://tf-app1.cs.fiu.edu/timeseries/image/btn_tsStop.gif')";
    var playImageBkURL = "url('http://tf-app1.cs.fiu.edu/timeseries/image/btn_tsPlay.gif')";
    var bkgImageNoDate = "url(http://tf-app1.cs.fiu.edu/timeseries/image/ts_ProgressBar_NoDate.gif)";
    var bkImageWithDate = "url('http://tf-app1.cs.fiu.edu/timeseries/image/ts_ProgressBar_WithDate.gif')";
    var bkImageSelected = "url('http://tf-app1.cs.fiu.edu/timeseries/image/ts_ProgressBar_Selected.gif')";

    // Public methods used by event handlers of some HTML elements created using innerHTML

    this.ClickOnDate = function (itemID) { return clickOnDate(itemID); }
    this.ClickOnPlayStopButton = function () { return clickOnPlayStopButton(); }

    function delayedTimeSeries() { onDelayTimeSeries.DelayCallBack(); }

    function timeSeries() {
        cleanAnimation(); requestTiles(); if (autoPlay && firstTime) { clickOnPlayStopButton(); firstTime = false; }
    }

    function clickOnPlayStopButton() {
        buttonStopPlay.style.backgroundImage = (!(isPlaying = !isPlaying)) ? playImageBkURL : stopImageBkURL;
        if (!isPlaying) { StopAni(); } else { PlayAni(); }
    }

    function setProgressBarItemsBackground() {
        for (var i = 0; i < (selectedSourcesAndDates.length) ; i++) {
            var obj = document.getElementById(progressBarItemIdPrefix + i);
            if (obj != null) { obj.style.backgroundImage = bkImageWithDate; obj.style.backgroundRepeat = "no-repeat"; }
        }
    }

    function clickOnDate(itemID) {
        setProgressBarItemsBackground();
        lastSelectedIndex = selectedIndex;
        if (itemID < 0) { itemID = 0; }
        if (itemID >= nTilesSelected) { itemID = 0; }
        selectedIndex = itemID;
        var obj = document.getElementById(progressBarItemIdPrefix + itemID);
        if (obj != null) { obj.style.backgroundImage = bkImageSelected; }
        lastTimeClicked = new Date().getTime();
        tMap.Render();
    }

    function nextFrame() {
        if (!tilesAreLoaded) { return; }
        clickOnDate(selectedIndex + 1);
    }

    function ensureAniIntervalIsCreated() { if (!aniInterval) { aniInterval = setInterval(nextFrame, timePerFrame); } }
    function clearAniInterval() { if (aniInterval) { clearInterval(aniInterval); aniInterval = null; } }
    function renewAniInterval() { if (aniInterval) { clearAniInterval(); ensureAniIntervalIsCreated(); } }
    function PlayAni() { ensureAniIntervalIsCreated(); }
    function StopAni() { clearAniInterval(); }

    function onTileLoaded(data, index, requestIndex) {
        if (requestIndex == requestCount) {
            if (index < allSourcesAndDates.length) {
                allSourcesAndDates[index].img = data;
                if (data.GetIsValid()) {
                    allSourcesAndDates[index].mapFeature = new tf.map.Feature({
                        type: "point", coordinates: lastCenter, style: { icon: true, icon_img: data, icon_size: lastDim, snaptopixel: false, rotate_with_map: true, scale: tf.browser.GetDevicePixelRatio() }
                    });
                }
                if (++nTilesLoaded == nTilesToLoad) { tilesAreLoaded = true; updateSelectedSources(); }
            }
        }
        else { if (!!debug) { debug.LogIfTest("discarding stale tile request"); } }
    }

    function makeTileLoadedNotification(index) { return function (data) { return onTileLoaded(data, index, requestCount); }; }

    function onRasterSourceList(data) {
        if (tf.js.GetIsValidObject(data)) {
            if (data.success) {
                var sources = data.sources;

                allSourcesAndDates = [];

                for (var i in sources) {
                    var source = sources[i], name = source.name;
                    for (var j in source.dates) {
                        var date = source.dates[j], year = date.substring(0, 4), month = date.substring(4, 6), day = date.substring(6, 8);
                        allSourcesAndDates.push({ name: name, date: date, dateDate: new Date(year, month - 1, day), displayDate: month + '/' + day + '/' + year });
                    }
                }

                allSourcesAndDates.sort(function (a, b) { return a.dateDate.getTime() - b.dateDate.getTime(); });
                nTilesToLoad = allSourcesAndDates.length;

                for (var i in allSourcesAndDates) {
                    var asad = allSourcesAndDates[i];
                    new tf.services.RasterMosaic({ extent: lastExtent, source: asad.name, date: asad.date, dim: lastDim, callBack: makeTileLoadedNotification(parseInt(i, 10)), optionalScope: theThis });
                    //new tf.services.RasterMosaic({ leftTop: [lastExtent[0], lastExtent[3]], level: tMap.GetLevel(), source: asad.name, date: asad.date, dim: lastDim, callBack: makeTileLoadedNotification(i), optionalScope: theThis });
                }
            }
        }
    }

    function updateSelectedSources() {
        selectedSourcesAndDates = [];
        if (selectedSourceName !== allSourcesUrlParam.toLowerCase()) {
            for (var i in allSourcesAndDates) {
                var source = allSourcesAndDates[i], name = source.name;
                if (name.toLowerCase() === selectedSourceName) { selectedSourcesAndDates.push(source); }
            }
        }
        else { selectedSourcesAndDates = allSourcesAndDates; }
        nTilesSelected = selectedSourcesAndDates.length;
        updateProgressBar();
    }

    function calcDays() {
        var daysArray = [], count = selectedSourcesAndDates.length;
        if (count > 1) {
            var date0 = selectedSourcesAndDates[0].dateDate, date1;
            for (var i = 1; i < count; ++i) { daysArray.push(tf.units.GetDaysBetweenDates(date1 = selectedSourcesAndDates[i].dateDate, date0)); date0 = date1; }
        }
        return daysArray;
    }

    function updateProgressBar() {
        var pxBetweenDates = [];
        var pxBetweenNotch = [];
        var totalDays = 0;
        var totalWidth = progressMarkersDiv.GetHTMLElement().offsetWidth;
        var daysBetweenSelectedSources = calcDays();

        for (var i = 0; i < daysBetweenSelectedSources.length; i++) { totalDays += daysBetweenSelectedSources[i]; }

        // get table elements width
        var emptyWidth = totalWidth - (dateWidth * selectedSourcesAndDates.length + 10 * 3 + 22);
        var usedWidth = 0;

        for (var i = 0; i < daysBetweenSelectedSources.length - 1; i++) {
            var btwDates = Math.floor(0.5 + daysBetweenSelectedSources[i] / totalDays * emptyWidth);
            var btwNotch = btwDates + dateWidth - 10;
            if (i == 0) { btwNotch += (dateWidth / 2 - 5); }
            pxBetweenDates.push(btwDates);
            pxBetweenNotch.push(btwNotch);
            usedWidth += btwDates;
        }

        var tailWidth = emptyWidth - usedWidth;
        var strInnerHTML = "";

        pxBetweenDates.push(tailWidth);
        pxBetweenNotch.push(tailWidth + (dateWidth - 10) * 1.5);

        if (selectedSourcesAndDates.length != 0) {
            // for bar
            strInnerHTML += "<table width='100%' height='20px' border='0' cellspacing='0' cellpadding='0'>";
            strInnerHTML += "<tr><td id='" + progressBarItemIdPrefix + "0' width='10px' onclick='g_timeSeries.ClickOnDate(0)'></td>";

            for (var i = 0; i < daysBetweenSelectedSources.length; i++) {
                strInnerHTML += "<td width='" + pxBetweenNotch[i] + "px' style='background-position: top left; " +
                    "background-image: url(\"http://tf-app1.cs.fiu.edu/timeseries/image/ts_ProgressBar_NoDate.gif\");" +
                    "background-repeat: repeat'></td><td id='" + progressBarItemIdPrefix + (i + 1) +
                    "' width='10px' onclick='g_timeSeries.ClickOnDate(" + (i + 1) + ")'></td>";
            }
            strInnerHTML += "</tr></table>";
            // for date
            strInnerHTML += "<table width='100%' height='20px' border='0' cellspacing='0' cellpadding='0'>";
            strInnerHTML += "<tr style='font:verdana;font-size:14px'><td width='" + dateWidth + "px'>" + selectedSourcesAndDates[0].displayDate + "</td>";
            for (var i = 0; i < daysBetweenSelectedSources.length; i++) {
                strInnerHTML += "<td width='" + pxBetweenDates[i] + "px'</td><td width='" + dateWidth + "px'>" + selectedSourcesAndDates[i + 1].displayDate + "</td>";
            }
            strInnerHTML += "</tr></table>";
        }

        progressMarkersDiv.GetHTMLElement().innerHTML = strInnerHTML;
        if (selectedIndex >= 0 && selectedIndex < selectedSourcesAndDates.length) { clickOnDate(selectedIndex); } else { clickOnDate(0); }
    }

    function getMidPixelCoords(mapCoords) {
        return tMap.PixelToMapCoords(tMap.MapToPixelCoords(mapCoords));
    }

    function getMapCenter() { return getMidPixelCoords(tMap.GetCenter()); }

    function requestTiles() {
        tilesAreLoaded = false;
        ++requestCount;
        boundsFeature = null;
        nTilesLoaded = 0;
        nTilesSelected = 0;
        lastCenter = getMapCenter();
        lastRes = tMap.GetResolution();
        lastExtent = tf.js.ScaleMapExtent(tMap.GetVisibleExtent(), 1 - (2 * mapMarginFactor));
        var leftTop = getMidPixelCoords([lastExtent[0], lastExtent[3]]), leftBottom = getMidPixelCoords([lastExtent[0], lastExtent[1]]),
            rightTop = getMidPixelCoords([lastExtent[2], lastExtent[3]]), rightBottom = getMidPixelCoords([lastExtent[2], lastExtent[1]]);
        var pixRatio = tf.browser.GetDevicePixelRatio();
        lastDim = [Math.round(tMap.GetPixelDistance(leftTop, rightTop)), Math.round(tMap.GetPixelDistance(leftTop, leftBottom))];
        boundsFeature = new tf.map.Feature({
            type: "point", coordinates: lastCenter, style: {
                round_rect: true, round_rect_width: (lastDim[0] + 2) * pixRatio, round_rect_height: (lastDim[1] + 2) * pixRatio, round_rect_radius: 10, line: true,
                line_width: 2, line_color: "#ff0", line_dash: [20, 2], fill: false, fill_color: "#fff", fill_opacity: 60, icon_anchor: [0.5, 0.5], zindex: 2,
                rotate_with_map: true
            }
        });
        new tf.services.RasterSourceList({ level: tMap.GetLevel(), extent: lastExtent, callBack: onRasterSourceList, optionalScope: theThis });
    }

    function onPostCompose(notification) {
        if (tilesAreLoaded) {
            if ((selectedIndex != -1) && (!!selectedSourcesAndDates) && (selectedIndex < nTilesSelected) && (!!selectedSourcesAndDates[selectedIndex].mapFeature)) {
                var theMap = notification.sender, showFeatureImmediately = notification.showFeatureImmediately, continueAnimation = notification.continueAnimation;
                var center = getMapCenter(), res = theMap.GetResolution();
                var centerTolerance = 0.0001;
                if (Math.abs(center[0] - lastCenter[0]) < centerTolerance && Math.abs(center[1] - lastCenter[1]) < centerTolerance && res == lastRes) {
                    var mapFeature = selectedSourcesAndDates[selectedIndex].mapFeature, prevMapFeatureUse;
                    var opacity01 = 1, prevOpacity01 = 0;

                    if (!!lastTimeClicked && !!prevMapFeature) {
                        var timeDiff = new Date().getTime() - lastTimeClicked;
                        if (timeDiff <= timeBlend) { opacity01 = timeDiff / timeBlend; } else { opacity01 = 1; }
                        if (opacity01 < 1) { prevMapFeatureUse = prevMapFeature; }
                    }

                    if (prevMapFeatureUse) {
                        prevMapFeatureUse.ChangeStyle({ opacity: 1 });
                        showFeatureImmediately(prevMapFeatureUse);
                    }
                    mapFeature.ChangeStyle({ opacity: opacity01 });
                    showFeatureImmediately(mapFeature);

                    if (boundsFeature) { showFeatureImmediately(boundsFeature); }

                    if (opacity01 < 1) { continueAnimation(); } else {
                        prevMapFeature = mapFeature;
                    }
                }
            }
        }
    }

    function createInterfaceItems() {
        var verticalAlign = "top";
        var dimPlayPausePanelPx = dimPlayPausePanelNumber + "px";
        var progressPanel = new tf.dom.Div({ cssClass: styles.unPaddedBlockDivClass });
        var progressPanelCSSStyle = { textAlign: 'center', width: "100%", height: "100%", verticalAlign: verticalAlign, backgroundColor: backgroundColor };
        var playPauseButtonDiv = new tf.dom.Div({ cssClass: styles.GetPaddedDivClassNames(true, true) });
        var playPauseButtonDivStyleElem = playPauseButtonDiv.GetHTMLElement();
        var playPauseButtonDivStyle = playPauseButtonDivStyleElem.style;
        var playPauseButtonDivCSSStyle = { textAlign: 'center', width: dimPlayPausePanelPx, height: "100%", verticalAlign: verticalAlign, backgroundColor: backgroundColor };
        var playPauseButtonBkg = autoPlay ? stopImageBkURL : playImageBkURL;
        var playPauseInnerHtml = '<input id="PlayStopButtonId" ' +
            'type="button" value="" onclick="return g_timeSeries.ClickOnPlayStopButton()" ' +
            'style="display:block;border-style: none;background-image: ' +
            playPauseButtonBkg + '; ' +
            'background-repeat: no-repeat; width: ' + dimPlayPausePanelPx + '; height:' + dimPlayPausePanelPx + ';background-color: ' + backgroundColor + ';" />';

        playPauseButtonDivStyleElem.innerHTML = playPauseInnerHtml;
        progressPanel.AddContent(playPauseButtonDiv);
        progressMarkersDiv = new tf.dom.Div({ cssClass: styles.GetUnPaddedDivClassNames(true, false) });

        var marginPxNumber = 5;
        var marginPxStr = marginPxNumber + "px";
        var widthCalc = "calc(100% - " + (marginPxNumber * 4 + dimPlayPausePanelNumber) + "px)";
        var progressMarkersDivCSSStyle = {
            marginTop: "10px", verticalAlign: verticalAlign, marginRight: marginPxStr, marginLeft: marginPxStr,
            backgroundColor: backgroundColor, backgroundImage: bkgImageNoDate, backgroundRepeatX: 'repeat',
            height: dimPlayPausePanelPx, width: widthCalc
        };

        progressPanel.AddContent(progressMarkersDiv);
        styles.ApplyStyleProperties(progressMarkersDiv, progressMarkersDivCSSStyle);
        styles.ApplyStyleProperties(progressPanel, progressPanelCSSStyle);
        progressPanel.AppendTo(topBotLayout.GetBot());
    }

    function cleanAnimation() { prevMapFeature = null; tilesAreLoaded = false; selectedIndex = -1; lastSelectedIndex = -1; tMap.Render(); }
    function onSourcesPopupClose() { sourcesSelButtonStyle.display = 'inline-block'; }
    function buttonSourcesClicked() {
        if (!!sourceSelPopup) { sourcesSelButtonStyle.display = 'none'; sourceSelPopup.Show(true); }
    }
    function onChangeSource(newSourceStr) { selectedSourceName = newSourceStr.toLowerCase(); updateSelectedSources(); }

    function setSourcesFromURLParameters(sourcesStr) {
        selectedSourceName = allSourcesUrlParam;
        if (sourcesStr = tf.js.GetNonEmptyString(sourcesStr)) {
            sourcesStr = sourcesStr.split('+');

            if (sourcesStr.length) {
                selectedSourceName = sourcesStr[0];
                if (sourcesStr.length > 1) {
                    var topLayout = topBotLayout.GetTop();
                    var sourcesSelButton = new tf.ui.TextBtn({ style: true, label: "Sources", onClick: buttonSourcesClicked, tooltip: "Select Image Sources", dim: 30 });
                    var sourcesSelButtonStyleSpecs = { position: 'absolute', bottom: '0.5em', marginLeft: '50%', transform: "translate(-50%, 0)", zIndex: 1 };

                    sourceSelPopup = new tf.ui.RadioOrCheckPopupFromData({
                        isRadioList: true, optionalScope: theThis, title: "Sources", data: sourcesStr, isInline: inlineSourceSelection, onClick: onChangeSource,
                        onClose: onSourcesPopupClose, container: topLayout, horPos: "center", verPos: "bottom", marginVer: "0.5em", zIndex: 1
                    });

                    styles.ApplyStyleProperties(sourcesSelButton, sourcesSelButtonStyleSpecs);
                    sourcesSelButtonStyle = sourcesSelButton.GetHTMLElement().style;
                    sourcesSelButton.AppendTo(topLayout);
                }
            }
        }
        selectedSourceName = selectedSourceName.toLowerCase();
    }

    function onMapLoaded() {
        var parameters = singleMapApp.GetParameters();
        setSourcesFromURLParameters(parameters[sourcesUrlParamName]);
        tMap = singleMapApp.GetMap();
        tMap.ShowMapCenter(false);
        tMap.SetView({ minLevel: 9, maxLevel: tf.consts.maxLevel });
        tMap.AddListener(tf.consts.mapMoveEndEvent, delayedTimeSeries);
        tMap.AddListener(tf.consts.mapResolutionChangeEvent, delayedTimeSeries);
        tMap.AddListener(tf.consts.mapPostComposeEvent, onPostCompose);
        createInterfaceItems();
        buttonStopPlay = document.getElementById("PlayStopButtonId");
    }

    function resizeAppLayout(winDims) {
        var marginEM = layoutsMarginEMNumber + "em", marginEM2 = (layoutsMarginEMNumber * 2) + "em";
        var separatorEMStr = topBottomSeparatorEMNumber + "em", heightBot = heightProgressPanel;

        topLayoutStyle.margin = botLayoutStyle.margin = marginEM;
        topLayoutStyle.marginBottom = botLayoutStyle.marginTop = "0px";
        topLayoutStyle.height = 'calc(100% - ' + heightBot + ' - ' + marginEM2 + ' - ' + separatorEMStr + ')';
        botLayoutStyle.height = heightBot;
        botLayoutStyle.top = separatorEMStr;
        botLayoutStyle.overflow = "hidden";
        if (!!sourceSelPopup) { sourceSelPopup.OnContainerResize(); }
        delayedTimeSeries();
    }

    function createAppLayout() {
        (topBotLayout = new tf.layout.TopBot()).AppendTo(document.body);
        topBotLayout.GetHTMLElement().style.backgroundColor = topBottomSeparatorColor;
        var top = topBotLayout.GetTop();
        (mapDiv = new tf.dom.Div({ cssClass: styles.mapContainerClass })).AppendTo(top);
        topLayoutStyle = top.GetHTMLElement().style;
        botLayoutStyle = topBotLayout.GetBot().GetHTMLElement().style;
    }

    function initialize() {

        debug = tf.GetDebug();
        styles = tf.GetStyles();

        var t = TGetBrowserType();
        var v = TBrowserIsCompatible();

        var sourcesUse = allSourcesUrlParam;
        var defaultParams = "&" + tf.consts.paramNameLat + "=" + defaultLat +
            "&" + tf.consts.paramNameLon + "=" + defaultLon +
            "&" + tf.consts.paramNameRes + "=" + defaultRes +
            "&" + sourcesUrlParamName + "=" + sourcesUse;
        //var overrideParams = "&" + sourcesUrlParamName + "=" + sourcesForTesting;
        var overrideParams = "";

        requestCount = 0;
        onDelayTimeSeries = new tf.events.DelayedCallBack(250, timeSeries);
        createAppLayout();
        singleMapApp = new tf.urlapi.SingleMapApp({
            app: theThis, layout: topBotLayout, fullURL: tf.urlapi.ModifyURLParamString(window.location.href, defaultParams, overrideParams),
            mapContainer: mapDiv, onCreated: onMapLoaded, onResize: resizeAppLayout, documentTitle: tf.consts.TimeSeriesDocumentTitle
        });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

var g_timeSeries = new tf.apps.TimeSeries();
