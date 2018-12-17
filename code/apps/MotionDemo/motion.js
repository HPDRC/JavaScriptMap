"use strict";

tf.apps.MotionDemo = {};

tf.apps.MotionDemo.movingBkColor = '#0b0';
tf.apps.MotionDemo.movingLastBkColor = '#003366';
tf.apps.MotionDemo.stoppedBkColor = '#d00';
tf.apps.MotionDemo.stoppedForFSBkColor = '#d88';

tf.apps.MotionDemo.FSBkColor = '#F9DF00';

tf.apps.MotionDemo.DayMapDisplay = function (settings) {
    var theThis, isShowing, isDeleted, map, day, layer, dayExtent, extentScale;
    var fsFeatures, motionFeatures, motionRouteFeatures;
    var maxViaCoordsSend, routeCoordsPieces, routeFailed, finishedRequestingParts, nPartsArrived, nPartsRequested, motionViaCoords;
    var onClickCallBack, clickListener, clickListenerBubble, mapBubble, curEventIndex, mapOverlay, animateButton, currentEvent;
    var animateTimeout, animateMillis;

    this.GetDay = function () { return day; }
    this.Show = function (bool) { return show(bool); }
    this.IsShowing = function () { return isShowing; }
    this.OnDelete = function () { return onDelete(); }
    this.SetExtent = function () { return setExtent(); }
    this.NextEvent = function () { return gotoEvent(curEventIndex + 1); }
    this.PrevEvent = function () { return gotoEvent(curEventIndex - 1); }
    this.GotoEvent = function (eventIndex) { return gotoEvent(eventIndex); }
    this.OnAnimationToggle = function () { return onAnimationToggle(); }

    function clearAnimateTimeout() { if (!!animateTimeout) { clearTimeout(animateTimeout); animateTimeout = null; } }
    function setAnimateTimeout() { clearAnimateTimeout(); animateTimeout = setTimeout(onAnimate, animateMillis); }

    function onAnimationToggle() { if (animateButton.GetIsToggled()) { clearAnimateTimeout(); } else { setAnimateTimeout(); } }

    function onAnimate() { animateTimeout = null; if (!isDeleted) { if (isShowing) { gotoEvent(curEventIndex + 1); } } }

    function gotoEvent(eventIndex) {
        clearAnimateTimeout();
        if (!isDeleted) {

            if (currentEvent) {
                var mapFeature = currentEvent.dayFeature;
                currentEvent = null;
                mapFeature.RefreshStyle();
            }

            var dayData = day.GetData(), routeEvents = dayData.routeEvents, nEvents = routeEvents.length, lastEvent = nEvents - 1;

            eventIndex = tf.js.GetIntNumberInRange(eventIndex, -1, nEvents, curEventIndex);

            if (eventIndex < 0) { eventIndex = lastEvent; } else if (eventIndex > lastEvent) { eventIndex = 0; }

            if (eventIndex >= 0 && eventIndex < nEvents) {
                curEventIndex = eventIndex;
                var event = routeEvents[eventIndex];
                var coords = event.GetData().geometry.coordinates;
                var routeSpan = event.eventSpan;

                currentEvent = event;
                event.dayFeature.RefreshStyle();

                if (!!routeSpan && !!mapOverlay) {
                    mapOverlay.SetContent(routeSpan);
                    mapOverlay.SetPointCoords(coords);
                }

                if (mapBubble) {
                    map.AnimatedSetCenterIfDestVisible(coords);
                    mapBubble.SetCenter(coords);
                }
            }

            if (!animateButton.GetIsToggled() && isShowing) { setAnimateTimeout(); }
        }
    }

    function onDelete() {
        if (!isDeleted) {
            if (!!clickListener) { clickListener.OnDelete(); clickListener = null; }
            if (!!clickListenerBubble) { clickListenerBubble.OnDelete(); clickListenerBubble = null; }
            if (!!preComposeListener) { preComposeListener.OnDelete(); preComposeListener = null; }
            show(false); fsFeatures = null; motionFeatures = null; motionRouteFeatures = null;
            isDeleted = true;
        }
    }

    function onClick(notification) {
        if (!isDeleted) {
            var mapFeature = notification.mapFeature;
            if (!!mapFeature) {
                if (mapFeature.dayMapDisplay == theThis) {
                    gotoEvent(mapFeature.record.GetData().indexInDaysEvent);
                    if (!!onClickCallBack) { onClickCallBack(notification); }
                }
            }
        }
    }

    function setExtent() { if (!isDeleted) { map.SetVisibleExtent(dayExtent); } }

    function showMotionRouteFeatures(bool) {
        if (!isDeleted) {
            if (!!bool) { for (var i in motionRouteFeatures) { layer.AddMapFeature(motionRouteFeatures[i]); } }
            else { for (var i in motionRouteFeatures) { layer.DelMapFeature(motionRouteFeatures[i]); } }
        }
    }

    function show(bool) {
        if (!isDeleted) {
            if (isShowing !== (bool = !!bool)) {
                if (isShowing = bool) {
                    animateButton.SetIsToggled(true);
                    for (var i in fsFeatures) { layer.AddMapFeature(fsFeatures[i]); }
                    for (var i in motionFeatures) { layer.AddMapFeature(motionFeatures[i]); }
                    showMotionRouteFeatures(true);
                    gotoEvent(curEventIndex);
                    setExtent();
                }
                else {
                    for (var i in fsFeatures) { layer.DelMapFeature(fsFeatures[i]); }
                    for (var i in motionFeatures) { layer.DelMapFeature(motionFeatures[i]); }
                    showMotionRouteFeatures(false);
                }
            }
        }
    }

    function checkFinishedLoadingParts() {
        if (!isDeleted) { if (!motionRouteFeatures) { if (finishedRequestingParts) { if (nPartsArrived == nPartsRequested) { createMotionRouteFeatures(); } } } }
    }

    function onMotionRoutePartLoaded(notification, viaCoords, partIndex) {
        if (!isDeleted || routeFailed) {
            if (tf.js.GetIsValidObject(notification)) {
                var coords = notification.route_geometry;
                if (tf.js.GetLooksLikeLineStringCoords(coords)) {
                    if (routeCoordsPieces === undefined) { routeCoordsPieces = []; }
                    routeCoordsPieces[partIndex] = coords;
                }
                else {
                    routeCoordsPieces[partIndex] = viaCoords;
                    tf.GetDebug().LogIfTest('index ' + partIndex + ':' + notification.status_message);
                }
            }
            nPartsArrived++;
            checkFinishedLoadingParts();
        }
    }

    function requestMotionRouteFeature() {
        var nCoords = motionViaCoords.length;
        
        if (nCoords > 1) {
            nPartsArrived = 0;
            nPartsRequested = nCoords - 1;
            for (var i = 0 ; i < nPartsRequested ; ++i) {
                var lineStringCoords = [motionViaCoords[i].coord, motionViaCoords[i + 1].coord];
                new tf.services.Routing({
                    findAlternatives: false,
                    level: 18,
                    mode: motionViaCoords[i].record.isMotion ? "car" : "car",
                    lineStringCoords: lineStringCoords,
                    optionalScope: theThis,
                    callBack: function (viaCoords, partIndex) { return function (notification) { onMotionRoutePartLoaded(notification, viaCoords, partIndex); } }(lineStringCoords, i)
                });
            }
            finishedRequestingParts = true;
            checkFinishedLoadingParts();
        }
    }

    function createMotionRouteFeature(index, line_width, routeStyle) {
        var coords = routeCoordsPieces[index], success = coords.length > 2;
        var record = motionViaCoords[index].record;
        var recordData = record.GetData();
        var isMotion = !!recordData.isMotion;
        var line_color, zindex, lineWidth;

        if (isMotion) {
            var isMoving = recordData.isMoving;
            line_color = "#00c";
            zindex = isMoving ? 0 : 2;
            lineWidth = isMoving ? line_width : line_width - 2;
        }
        else {
            line_color = !!success ? "#0cc" : "#c00";
            zindex = 4;
            lineWidth = line_width - 4;
        }

        var style = [], hoverStyle = [];
        style[0] = tf.js.ShallowMerge(routeStyle[0], { line_color: line_color, line_width: lineWidth, zindex: zindex });
        style[1] = tf.js.ShallowMerge(routeStyle[1], { zindex: zindex + 1 });
        hoverStyle[0] = tf.js.ShallowMerge(style[0], { zindex: zindex + 2, line_width: lineWidth + 1, line_color: "#c80" });
        hoverStyle[1] = tf.js.ShallowMerge(style[1], { zindex: zindex + 3, line_color: "#ff8" });
        var motionRouteFeature = new tf.map.Feature({ type: "linestring", coordinates: coords, style: style, hoverStyle: hoverStyle });
        motionRouteFeature.dayMapDisplay = theThis;
        motionRouteFeature.isRoute = true;
        motionRouteFeature.record = record;
        if (isMotion) { motionRouteFeature.motion = record; } else { motionRouteFeature.fs = record; }
        motionRouteFeatures.push(motionRouteFeature);
        if (isShowing) { layer.AddMapFeature(motionRouteFeature); }
    }

    function createMotionRouteFeatures() {
        if (!isDeleted) {
            if (tf.js.GetIsNonEmptyArray(routeCoordsPieces)) {
                var motionArray = day.GetData().motionArray;
                var nPieces = routeCoordsPieces.length;

                if (nPieces > 1) {
                    var line_width = 7;
                    var routeStyle = [{ line: true, line_width: line_width, zindex: 0, snaptopixel: false, line_opacity: 90 }, {
                        line: true, line_width: 2, line_color: "#fff", zindex: 1, line_dash: [16, 8], snaptopixel: false
                    }];

                    motionRouteFeatures = [];

                    for (var i = 0 ; i < nPieces ; ++i) {
                        createMotionRouteFeature(i, line_width, routeStyle);
                    }
                }
            }
        }
    }

    function getMotionFeatureStyle(record, recordIndex, isHover, nRecords) {
        var recordData = record.GetData(), recordProps = recordData.properties;
        var zindex = 6, style;
        var labelIndex = recordIndex + 1; if (labelIndex < 10) { labelIndex = ' ' + labelIndex + ' '; }
        var label = recordIndex < nRecords ? '' + labelIndex : labelIndex + ' end';
        var isLastBool = recordIndex == nRecords - 1;
        var bkColor = recordData.bkColor;
        var borderColor = !!isLastBool ? "#fff" : "#00f";

        var featureStyle = {
            marker: true, marker_color: bkColor, marker_verpos: "center", marker_horpos: "center", marker_opacity: 70,
            line_opacity: 60, line_width: 1, line_color: "#333", line: true, font_height: 14, font_color: "#fff", border_color: borderColor
        };

        if (record == currentEvent) {
            style = tf.js.ShallowMerge(featureStyle, { label: label, zindex: zindex + 1, font_height: 18, marker_opacity: 100 });
        }
        else {
            if (isHover) {
                var featureHoverStyle = [
                    tf.js.ShallowMerge(featureStyle, { font_height: 16, marker_opacity: 100 }), {
                        marker: true, marker_color: bkColor, marker_verpos: "bottom", marker_horpos: "right", marker_opacity: 100,
                        line_opacity: 60, line_width: 1, line_color: "#333", line: true, font_height: 14, font_color: "#fff", border_color: borderColor
                    }];
                var hoverLabel = recordIndex < nRecords ? recordProps.Start_Address : recordProps.End_Address;
                style = [tf.js.ShallowMerge(featureHoverStyle[0], { label: label, zindex: zindex + 2 }), tf.js.ShallowMerge(featureHoverStyle[1], { label: hoverLabel, zindex: zindex + 1 })];
            }
            else {
                style = tf.js.ShallowMerge(featureStyle, { label: label, zindex: zindex });
            }
        }
        return style;
    }

    function getFSFeatureStyle(record, recordIndex, isHover, nRecords) {
        var recordData = record.GetData(), recordProps = recordData.properties;
        var zindex = 6, label, style;
        var labelIndex = recordIndex + 1; if (labelIndex < 10) { labelIndex = ' ' + labelIndex + ' '; }
        var label = '' + labelIndex;

        var featureStyle = {
            marker: true, marker_color: tf.apps.MotionDemo.FSBkColor, marker_verpos: "center", marker_horpos: "center", marker_opacity: 80,
            line_opacity: 60, line_width: 1, line: true, line_color: "#688184", font_height: 14, font_color: "#000", border_color: "#00b"
        };

        if (record == currentEvent) {
            style = tf.js.ShallowMerge(featureStyle, { label: label, zindex: zindex + 1, font_height: 18, marker_opacity: 100 });
        }
        else {
            if (isHover) {
                var featureHoverStyle = [
                    tf.js.ShallowMerge(featureStyle, { font_height: 16, marker_opacity: 100 }), {
                        marker: true, marker_color: tf.apps.MotionDemo.FSBkColor, marker_verpos: "top", marker_horpos: "right", marker_opacity: 100,
                        line_opacity: 60, line_width: 1, line: true, line_color: "#688184", font_height: 14, font_color: "#000", border_color: "#00b"
                    }];

                var hoverLabel = recordProps.Service_Address;
                style = [tf.js.ShallowMerge(featureHoverStyle[0], { label: label, zindex: zindex + 2 }), tf.js.ShallowMerge(featureHoverStyle[1], { label: hoverLabel, zindex: zindex + 1 })];
            }
            else {
                style = tf.js.ShallowMerge(featureStyle, { label: label, zindex: zindex });
            }
        }
        return style;
    }

    function createFeatures() {
        var dayData = day.GetData(), motionArray = dayData.motionArray, nMotions = motionArray.length;

        motionViaCoords = [];

        if (nMotions > 0) {
            for (var i in motionArray) {
                var record = motionArray[i], recordData = record.GetData(), recordGeom = recordData.geometry, recordCoords = recordGeom.coordinates;
                motionViaCoords.push({ coord: recordCoords, record: record });
            }
            var lastEvent = motionArray[nMotions - 1], lastEventData = lastEvent.GetData();
            if (lastEventData.isMotion) {
                var props = lastEventData.properties;
                motionViaCoords.push({ coord: [props.Ending_Longitude, props.Ending_Latitude], record: lastEvent });
            }
        }

        requestMotionRouteFeature();

        var extent, routeEvents = dayData.routeEvents, nEvents = routeEvents.length, lastEvent = nEvents - 1;

        fsFeatures = [];
        motionFeatures = [];

        for (var i = 0 ; i < nEvents ; ++i) {
            var record = routeEvents[i], recordData = record.GetData(), recordProps = recordData.properties, recordGeom = recordData.geometry;
            var index = recordData.indexInDay, count = recordData.countInDay, isMotion = recordData.isMotion;
            var getStyle, featureArray, fieldName;

            if (isMotion) { getStyle = getMotionFeatureStyle; featureArray = motionFeatures; fieldName = "motion"; }
            else { getStyle = getFSFeatureStyle; featureArray = fsFeatures; fieldName = "fs"; }

            var style = function (getStyle, record, index, count) { return function () { return getStyle(record, index, false, count); } }(getStyle, record, index, count);
            var hoverStyle = function (getStyle, record, index, count) { return function () { return getStyle(record, index, true, count); } }(getStyle, record, index, count);
            var featureCoords = recordGeom.coordinates;
            var feature = new tf.map.Feature({ type: "point", coordinates: featureCoords, style: style, hoverStyle: hoverStyle });

            featureArray.push(feature);
            feature.dayMapDisplay = theThis;
            feature.record = feature[fieldName] = record;
            record.dayFeature = feature;
            if (extent == undefined) { extent = [featureCoords[0], featureCoords[1], featureCoords[0], featureCoords[1]]; }
            else { extent = tf.js.UpdateMapExtent(extent, featureCoords); }
        }
        extent = tf.js.ScaleMapExtent(extent, extentScale);
        //tf.GetDebug().AddExtent(extent, layer);
        if (!dayExtent) { dayExtent = extent; } else { dayExtent = tf.js.MergeMapExtents(dayExtent, extent); }

        curEventIndex = 0;
        gotoEvent(0);
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        animateMillis = 500;
        isShowing = false;
        extentScale = 1.2;
        maxViaCoordsSend = 25;
        map = tf.js.GetMapFrom(settings.map);
        layer = tf.js.GetIsValidObject(settings.layer) ? settings.layer : null;
        day = tf.js.GetIsInstanceOf(settings.day, tf.js.KeyedItem) ? settings.day : null;
        if (!!map && !!day && !!layer) {
            isDeleted = false;
            mapBubble = settings.mapBubble;
            mapOverlay = settings.mapOverlay;
            animateButton = settings.animateButton;
            createFeatures();
            if (!!(onClickCallBack = tf.js.GetFunctionOrNull(settings.onClick))) {
                clickListener = map.AddListener(tf.consts.mapFeatureClickEvent, onClick);
                clickListenerBubble = mapBubble.AddListener(tf.consts.mapFeatureClickEvent, onClick);
                //preComposeListener = map.AddListener(tf.consts.mapPreComposeEvent, onPreCompose);
            }
        }
        else { isDeleted = true; }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.apps.MotionDemo.Settings = function (settings) {

    var theThis, styles, formContainer, formContainerElem, yearRadios, monthRadios, optionsChecks, preservePositionCheck,
        preservePosition, allContainer, allContainerElem,
        year, month, appSizer;
    var monthShortNames, monthLongNames;
    var yearsPopup;
    var divYearsElem, divMonthsElem;
    var yearButton, monthButton, divYears, divMonths;

    var preservePositionStr = "Preserve Demo Position";

    this.OnToggle = function () { return onToggle(); }

    this.GetDateTitle = function () {
        return year + '-' + monthLongNames[month - 1];
    }

    this.GetSelection = function () {
        return { year: year, month: month, preservePosition: preservePosition };
    }

    function toggleBlockDiv(div, otherDiv) {
        if (div.style.display == 'none') {
            if (otherDiv) { otherDiv.style.display = 'none'; }
            div.style.display = 'block';
        }
        else { div.style.display = 'none'; }
        appSizer.OnResize();
    }

    function onToggle() {
        return toggleBlockDiv(formContainerElem);
    }

    function onYearChanged(notification) {
        year = parseInt(notification, 10);
        yearButton.SetText(year + '');
        toggleBlockDiv(divYearsElem);
    }

    function onMonthChanged(notification) {
        month = parseInt(notification, 10);
        monthButton.SetText(monthShortNames[month - 1]);
        toggleBlockDiv(divMonthsElem);
    }

    function onOptionChanged(notification) {
        switch (notification) {
            case preservePositionStr: preservePositionCheck.SetIsChecked(preservePosition = !preservePosition); break;
            default: break;
        }
    }

    function initialize() {
        styles = tf.GetStyles();

        preservePosition = true;

        appSizer = settings.appSizer;

        monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        monthLongNames = ["January", "February", "March", "April", "May", "June", "July", "August", "Septemper", "October", "November", "December"];

        allContainer = new tf.dom.Div({ cssClass: tf.GetStyles().unPaddedBlockDivClass });
        allContainerElem = allContainer.GetHTMLElement();
        allContainerElem.style.position = 'relative';

        formContainer = new tf.dom.Div({ cssClass: styles.inputFormClass });
        formContainerElem = formContainer.GetHTMLElement();

        year = settings.year;
        month = settings.month;

        function makeMonthName(i) { return i + ' (' + monthShortNames[i - 1] + ')' }

        var divButtons, divOptions;
        var dim = "1.4em", buttonDim = "1.6em";
        var optionsChecksSelections = [[preservePositionStr, "Uncheck to move the demo to the current center of the map"]];
        var yearSelections = []; for (var i = 2011 ; i <= 2015 ; ++i) { yearSelections.push([i + '', 'select records from the year ' + i]); }
        var monthSelections = []; for (var i = 1 ; i <= 12 ; ++i) { monthSelections.push([makeMonthName(i), 'select records from the month of ' + monthLongNames[i - 1]]); }
        var checkedOptions = {};

        checkedOptions[preservePositionStr] = true;

        (divMonths = new tf.dom.Div({ cssClass: tf.GetStyles().unPaddedBlockDivClass })).AddContent(
            monthRadios = new tf.ui.RadioOrCheckListFromData({
                isRadioList: true, onClick: onMonthChanged, data: monthSelections, isInline: true, noSeparators: true,
                selRadioName: makeMonthName(month)
            }));

        (divYears = new tf.dom.Div({ cssClass: tf.GetStyles().unPaddedBlockDivClass })).AddContent(
            yearRadios = new tf.ui.RadioOrCheckListFromData({
                isRadioList: true, onClick: onYearChanged, data: yearSelections, isInline: true, noSeparators: true,
                selRadioName: year + ''
            }));

        divYearsElem = divYears.GetHTMLElement();
        divMonthsElem = divMonths.GetHTMLElement();

        divYearsElem.style.display = 'none';
        divYearsElem.style.maxWidth = "16em";
        divMonthsElem.style.display = 'none';
        divMonthsElem.style.maxWidth = "16em";

        (divButtons = new tf.dom.Div({ cssClass: tf.GetStyles().paddedBlockDivClass })).AddContent(
            styles.AddButtonDivMargins(yearButton = new tf.ui.TextBtn({
                style: true, label: year + '', dim: dim, tooltip: "Select Year",
                onClick: function () {
                    toggleBlockDiv(divYearsElem, divMonthsElem);
                }
            })),
            styles.AddButtonDivMargins(monthButton = new tf.ui.TextBtn({
                style: true, label: monthShortNames[month - 1] + '', dim: dim, tooltip: "Select Month",
                onClick: function () {
                    toggleBlockDiv(divMonthsElem, divYearsElem);
                }
            }))
        );

        (divOptions = new tf.dom.Div({ cssClass: tf.GetStyles().unPaddedBlockDivClass })).AddContent(
            optionsChecks = new tf.ui.RadioOrCheckListFromData({
                isRadioList: false, onClick: onOptionChanged, data: optionsChecksSelections, isInline: false, checkedBoxes: checkedOptions
            }));

        preservePositionCheck = optionsChecks.GetButton(preservePositionStr);

        formContainer.AddContent(divButtons, divYears, divMonths, divOptions);
        formContainerElem.style.display = 'block';
        allContainer.AddContent(styles.AddButtonDivTopBottMargins(formContainer));

        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: allContainerElem });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.apps.MotionDemo.Settings, tf.dom.Insertable);

/**
 * class tf.apps.MotionDemo.MotionDemo - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} settings - parameter description?
*/
tf.apps.MotionDemo.MotionDemo = function (settings) {

    var theThis, urlapiApp, styles, subStyles, singleAppHCFOnTheSide, singleAppMapContentOnTheSide,
        twoHorPaneLayout, HCFLayout, appSpecs, dLayers, appSizer, map, dayLayer,
        params, appCenter, tables;
    var motionKeyedList, motionTimedRefresh, motionLoaded, FSKeyedList, FSTimedRefresh, fsLoaded, daysKeyedList;
    var motionTable, FSTable, mapLoaded, showingYear, showingMonth, daysTable;
    var defaultYear, defaultMonth, showingDateDiv;
    var demoSettings, tableRowWidth, daysTableIndex, motionTableIndex, FSTableIndex;
    var dayDisplaying;
    var driverName, defaultDriverName, unknownMotionAddressLabel;
    var debug;

    function log(str) { if (!!debug) { debug.LogIfTest(str); } }

    function createTableRowContentDiv() {
        var content = new tf.dom.Div({ cssClass: styles.dLayerInfoClass }); content.GetHTMLElement().style.width = tableRowWidth; return content;
    }

    function getFeatureListFromData(data) {
        var parsedData = [];
        if (tf.js.GetIsValidObject(data) && tf.js.GetIsNonEmptyArray(data.features) &&
            tf.js.GetHasGeoJSONGeometryProperties(data.features[0].geometry)) {
            parsedData = data.features;
        }
        return parsedData;
    }

    function logWaiting() {
        if (!mapLoaded) { log('waiting for map...'); } if (!fsLoaded) { log('waiting for fs...'); } if (!motionLoaded) { log('waiting for motion...'); }
    }

    function assignIndices(toArray) {
        var len = toArray.length; for (var i = 0 ; i < len ; ++i) { var data = toArray[i].GetData(); data.indexInDay = i; data.countInDay = len; }
    }

    function checkStartEnds(toArray) {
        var maxIndex = toArray.length - 1;
        var nFailed = 0;
        for (var i = 0 ; i < maxIndex ; ++i) {
            var data1 = toArray[i].GetData(), props1 = data1.properties;
            var data2 = toArray[i + 1].GetData(), props2 = data2.properties;
            var coordsEnd1 = [tf.js.GetLongitudeFrom(props1.Ending_Longitude), tf.js.GetLatitudeFrom(props1.Ending_Latitude),]
            var coordsStart2 = [tf.js.GetLongitudeFrom(props2.Start_Longitude), tf.js.GetLatitudeFrom(props2.Start_Latitude), ]
            var timeEnd1 = props1.End_Event_Time;
            var timeStart2 = props2.Start_Event_Time;
            var odometerEnd1 = props1.End_Odometer_Km;
            var odometerStart2 = props2.Start_Odometer_Km;
            if (!(data1.endsWhereNextStarts = coordsEnd1[0] == coordsStart2[0] && coordsEnd1[1] == coordsStart2[1] && timeEnd1 == timeStart2 && odometerEnd1 == odometerStart2)) {
                ++nFailed;
            }
        }
        if (maxIndex >= 0) { toArray[maxIndex].GetData().endsWhereNextStarts = true; }
        return nFailed;
    }

    function checkMotionStartMovingEndStopping(toArray) {
        var failedStartMoving, failedEndStopping;
        var len = toArray.length;

        if (len > 1) {
            var first = toArray[0], last = toArray[len - 1];
            failedStartMoving = !first.GetData().isMoving;
            failedEndStopping = last.GetData().isMoving;
        }
        return { failedStartMoving: !!failedStartMoving, failedEndStopping: !!failedEndStopping };
    }

    function calcActualStopTime(index, toArray) {
        var elem = toArray[index], elemData = elem.GetData();
        
        if (elemData.isMotion && !elemData.isMoving) {
            var len = toArray.length, lastFSTime, nextMotion;
            for (var i = index + 1 ; i < len ; ++i) {
                var futureElem = toArray[i], futureData = futureElem.GetData();
                if (futureData.isFS) { lastFSTime = futureData.dateTime; }
                else { break; }
            }
            if (lastFSTime !== undefined) {
                elemData.wasForFS = true;
                elemData.serviceMinutes = elemData.nMinutes - Math.round((elemData.endDateTime - lastFSTime) / (1000 * 60));
                elemData.displayServiceDuration = tf.js.ConvertToHourMinute((lastFSTime - elemData.dateTime) / 1000);
            }
        }
    }

    function calcActualStopTimes(toArray) { var len = toArray.length; for (var i = 0 ; i < len ; ++i) { calcActualStopTime(i, toArray); } }

    function assignMotionAndFSDayIndices() {
        var days = daysKeyedList.GetKeyedItemList();

        for (var i in days) {
            var day = days[i], dayData = day.GetData(), motionArray = dayData.motionArray;
            assignIndices(dayData.fsArray);
            assignIndices(motionArray);
            dayData.nFailedStartEndChain = checkStartEnds(motionArray);
            if (dayData.nFailedStartEndChain > 0) {
                log(dayData.key + ' failed start end chain ' + dayData.nFailedStartEndChain + ' time(s)');
            }
            var smes = checkMotionStartMovingEndStopping (motionArray);
            if (dayData.failedStartMoving = smes.failedStartMoving) {
                log(dayData.key + ' failed start moving');
            }
            if (dayData.failedEndStopping = smes.failedEndStopping) {
                log(dayData.key + ' failed end stopping');
            }

            var routeEvents = dayData.motionArray.concat(dayData.fsArray);
            routeEvents.sort(sortByDataDateTime);
            calcActualStopTimes(dayData.routeEvents = routeEvents);

            var nMotion = motionArray.length;

            for (var j = 0; j < nMotion ; ++j) {
                var record = motionArray[j], isLastBool = j == nMotion - 1, recordData = record.GetData();
                recordData.bkColor = !!isLastBool ? tf.apps.MotionDemo.movingLastBkColor : recordData.isMoving ? tf.apps.MotionDemo.movingBkColor :
                    recordData.wasForFS ? tf.apps.MotionDemo.stoppedForFSBkColor : tf.apps.MotionDemo.stoppedBkColor;
            }
        }
    }

    function sortByDataDateTime(a, b) { return a.GetData().dateTime - b.GetData().dateTime; }

    function addOrGetDayKeyedItem(key) {
        var item;
        if (!(item = daysKeyedList.GetItem(key))) { item = daysKeyedList.AddOrGetItem({ key: key, fsArray: [], motionArray: [] }); }
        return item;
    }

    function getDayKeyFromDate(date) { return date.toLocaleDateString(); }

    function createDayKeyedItems() {
        var relatedItems = tf.js.ObjectToArray(FSKeyedList.GetKeyedItemList()).concat(tf.js.ObjectToArray(motionKeyedList.GetKeyedItemList())).sort(sortByDataDateTime);
        for (var i in relatedItems) {
            var relatedItem = relatedItems[i], relatedData = relatedItem.GetData();
            var dayItem = addOrGetDayKeyedItem(getDayKeyFromDate(relatedData.date));
            var dayData = dayItem.GetData();
            var relatedArray = relatedData.isMotion ? dayData.motionArray : dayData.fsArray;
            relatedArray.push(relatedItem);
            relatedData.day = dayItem;
            relatedData.indexInDaysEvent = parseInt(i, 10);
        }
    }

    function onResourceLoaded() {
        if (!!appSizer) {
            appSizer.OnResize();
        }
        if (!!debug) { logWaiting(); }
        if (mapLoaded && fsLoaded && motionLoaded) {
            log('all loaded');
            createDayKeyedItems();
            assignMotionAndFSDayIndices();
            daysKeyedList.NotifyItemsUpdated();
            motionKeyedList.NotifyItemsUpdated();
            FSKeyedList.NotifyItemsUpdated();
        }
        if (!!tables) {
            urlapiApp.UpdateCurTableFooter();
        }
    }

    function stopDayDisplaying() {
        if (!!dayDisplaying) {
            daysKeyedList.NotifyItemUpdated(dayDisplaying.GetDay());
            dayDisplaying.Show(false); dayDisplaying = null;
        }
    }

    function onClickDayDisplay(notification) {
        var mapFeature = notification.mapFeature;
        if (!!mapFeature) {
            if (mapFeature.fs) { gotoFS(mapFeature.fs); }
            else if (!!mapFeature.motion) { gotoMotion(mapFeature.motion); }
        }
    }

    function setDayDisplaying(day) {
        if (!!day) {
            var dayData = day.GetData(), dayDisplay = dayData.dayDisplay;
            var curDayDisplaying = dayDisplaying, displayThisDay;
            stopDayDisplaying();
            if (!!dayDisplay) { displayThisDay = dayDisplay != curDayDisplaying; }
            else {
                dayDisplay = dayData.dayDisplay = new tf.apps.MotionDemo.DayMapDisplay({
                    map: map, day: day, layer: dayLayer, onClick: onClickDayDisplay, mapBubble: mapInBubble,
                    mapOverlay: mapOverlay, animateButton: animateButton
                });
                displayThisDay = true;
            }
            if (displayThisDay) {
                dayDisplaying = dayDisplay; dayDisplaying.Show(true);
                dLayers.RefreshAll();
            }
        }
        else { stopDayDisplaying(); }
        styles.ChangeOpacityVisibilityClass(mapBubble, !!dayDisplaying);
        styles.ChangeOpacityVisibilityClass(dayDisplayControl, !!dayDisplaying);
        mapOverlay.SetVisible(!!dayDisplaying);
    }

    function createDayEventElem(event, isLastBool) {
        var eventData = event.GetData(), eventProps = eventData.properties;
        var isMotion = eventData.isMotion;
        var eventText;
        var bkColor;
        var textColor;
        var eventDiv = new tf.dom.Div({ cssClass: tf.GetStyles().paddedBlockDivClass });
        var eventDivElem = eventDiv.GetHTMLElement()

        if (!!isMotion) {
            eventText = makeMotionSpanText(event, false);
            bkColor = eventData.bkColor;
            styles.ApplyStyleProperties(eventDiv, { "textShadow": "1px 1px 1px #333", color: "#fff", backgroundColor:"rgba(255, 255, 255, 0.3)" });
            eventDivElem.style.border = isLastBool ? "2px dotted #fff" : "2px dotted #00b";
        }
        else {
            bkColor = tf.apps.MotionDemo.FSBkColor;
            eventText = makeFSSpanText(event, false);
            styles.ApplyStyleProperties(eventDiv, { "textShadow": "1px 1px 2px #688184", "color": "#000", fontSize: "1.25em" });
            eventDivElem.style.border = "2px dashed #00b";
        }
        eventDivElem.innerHTML = eventText;;
        eventDivElem.style.backgroundColor = bkColor;
        eventDivElem.style.marginBottom = '2px';
        eventDivElem.style.borderRadius = "6px";
        return eventDiv;
    }

    function getDaysRowContent(notification) {
        var keyedItem = notification.keyedItem;
        var content = null;

        if (!!keyedItem) {
            var data = keyedItem.GetData();
            var fsCount = data.fsArray.length;
            var motionCount = data.motionArray.length;
            var spanText =
                data.key + '<br/>' +
                motionCount + ' motion records<br/>' +
                fsCount + ' fs records<br/>';

            if (data.nFailedStartEndChain > 0) { spanText += data.nFailedStartEndChain + ' failed start/end chain' + '<br>'; }
            if (data.failedStartMoving) { spanText += 'failed start moving' + '<br>'; }
            if (data.failedEndStopping) { spanText += 'failed end stopping' + '<br>'; }

            var span = tf.urlapi.CreateInfoWindowSpan(spanText);
            var spanElem = span.GetHTMLElement();
            var goButton, motionButton, fsButton;
            var dim = "1.4em";
            var buttonDim = "1.5em";

            spanElem.style.borderRadius = "4px";
            spanElem.style.padding = "3px";

            styles.AddButtonDivRightMargin(goButton = new tf.ui.SvgGlyphToggleBtn({
                style: true, onClick: function () {
                    setDayDisplaying (keyedItem);
                }, dim: buttonDim, isToggled: true,
                glyph: tf.styles.SvgGlyphStopName, tooltip: "Stop displaying this day", toggledGlyph: tf.styles.SvgGlyphPlayName, toggledTooltip: "Display this day on the map"
            }));

            if (motionCount > 0) {
                styles.AddButtonDivRightMargin(motionButton = new tf.ui.TextBtn({
                    style: true, label: "Motion 1", dim: dim, tooltip: "Go to this day's first motion",
                    onClick: function (motion) { return function () { gotoMotion(motion); } }(data.motionArray[0])
                }));
            }

            if (fsCount > 0) {
                styles.AddButtonDivRightMargin(fsButton = new tf.ui.TextBtn({
                    style: true, label: "FS 1", dim: dim, tooltip: "Go to this day's first FS",
                    onClick: function (fs) { return function () { gotoFS(fs); } }(data.fsArray[0])
                }));
            }

            var routeEvents = data.routeEvents;
            var events, historyButton;

            if (tf.js.GetIsNonEmptyArray(routeEvents)) {
                var nRouteEvents = routeEvents.length, lastRouteEventIndex = nRouteEvents - 1;
                events = new tf.dom.Div({ cssClass: tf.GetStyles().unPaddedBlockDivClass });
                var eventsElem = events.GetHTMLElement();

                for (var i = 0 ; i < nRouteEvents ; ++i) {
                    var event = routeEvents[i], isLast = i == lastRouteEventIndex;
                    var eventDiv = createDayEventElem(event, isLast);
                    styles.ApplyStyleProperties(routeEvents[i].eventSpan = createDayEventElem(event, isLast), { "tf-shadow": [0, 0, 4, "rgba(0,0,0,0.6)"] });
                    events.AddContent(eventDiv);
                }

                eventsElem.style.display = 'none';

                historyButton = new tf.ui.SvgGlyphBtn({
                    style: true, glyph: tf.styles.SvgGlyphMapDirectionsName, tooltip: "Toggle Trip History", dim: buttonDim,
                    onClick: function () { tf.dom.ToggleDisplayBlockNone(eventsElem); }
                });
            }

            content = createTableRowContentDiv();
            content.AddContent(goButton, motionButton, fsButton, historyButton, span, events);
        }

        return { sender: theThis, content: content };
    }

    function createDays(title) {
        daysKeyedList = new tf.js.KeyedList({
            name: title, keepNotUpdated: false,
            getKeyFromItemData: function (data) { return data.key;},
            needsUpdateItemData: function () { return true; },
            filterAddItem: function (data) { return data.key !== undefined }
        });
    }

    function gotoTableRow(tableIndex, table, rowKeyedItem) {
        urlapiApp.GotoTable(tableIndex); setTimeout(function () { table.GetRowFromKeyedItem(rowKeyedItem).Select(true, true); }, 100);
    }

    function gotoDay(day) { gotoTableRow(daysTableIndex, daysTable, day); }
    function gotoMotion(motion) { gotoTableRow(motionTableIndex, motionTable, motion); }
    function gotoFS(fs) { gotoTableRow(FSTableIndex, FSTable, fs); }

    function createDayButton(day) {
        var dayButton;
        if (!!day) {
            var key = day.GetKey(), dim = "1.4em";
            styles.AddButtonDivMargins(dayButton = new tf.ui.TextBtn({
                style: true, label: "Day: " + key, dim: dim, tooltip: "Go to this day",
                onClick: function () { gotoDay(day); }
            }));
        }
        return dayButton;
    }

    function makeMotionSpanText(keyedItem, useFullDate) {
        var spanText = '';
        if (!!keyedItem) {
            var data = keyedItem.GetData(), props = data.properties;

            if (!useFullDate && data.endsWhereNextStarts) {
                if (!!useFullDate) {
                    spanText =
                        props.Lvm_State_Type_Name + '<br>' +
                        props.Start_Event_Time + '<br/>' +
                        props.Start_Address + '<br/>' +
                        'duration ' + data.displayMinutes;//'minutes: ' + data.nMinutes;
                }
                else {
                    spanText =
                        props.Lvm_State_Type_Name + ' ' +
                        data.displayHour + '<br/>' +
                        props.Start_Address + '<br/>' +
                        'duration ' + data.displayMinutes;//'minutes: ' + data.nMinutes;
                }
            }
            else {
                spanText =
                    props.Lvm_State_Type_Name + '<br>' +
                    props.Start_Event_Time + '<br/>' +
                    props.Start_Address + '<br/>' +
                    parseFloat(props.Start_Odometer_Km).toFixed(2) + ' km<br>' +
                    'end: ' + props.End_Event_Time + '<br/>' +
                    props.End_Address + '<br/>' +
                    parseFloat(props.End_Odometer_Km).toFixed(2) + ' km<br>' +
                    'minutes: ' + data.nMinutes;
            }

            if (data.serviceMinutes !== undefined) {
                if (data.wasForFS) {
                    //spanText += ' (service ' + data.serviceMinutes + ')';
                    spanText += ' | service ' + data.displayServiceDuration;
                }
                else if (data.serviceMinutes != data.nMinutes) {
                    spanText += ' (actual ' + data.serviceMinutes + ')';
                }
            }

            if (data.indexInDay !== undefined) {
                spanText = (data.indexInDay + 1) + '/' + data.countInDay + ' ' + spanText + '<br/>';
            }
        }
        return spanText;
    }

    function getMotionRowContent(notification) {
        var keyedItem = notification.keyedItem;
        var content = null;

        if (!!keyedItem) {
            var data = keyedItem.GetData(), props = data.properties;
            var dayButton = createDayButton(data.day);
            var spanText = makeMotionSpanText(keyedItem, true);
            var span = tf.urlapi.CreateInfoWindowSpan(spanText);
            var spanElem = span.GetHTMLElement();

            spanElem.style.borderRadius = "4px";
            spanElem.style.padding = "2px";

            content = createTableRowContentDiv();
            content.AddContent(dayButton, span);
        }

        return { sender: theThis, content: content };
    }

    function getDateFromMotionField(timeField) {
        var theDate;
        if (timeField !== undefined) {
            var date = timeField, year = parseInt(date.substring(0, 4), 10),
                month = parseInt(date.substring(5, 7), 10), day = parseInt(date.substring(8, 10), 10);
            var hour = parseInt(date.substring(11, 13), 10), minute = parseInt(date.substring(14, 16), 10), second = parseInt(date.substring(17, 19), 10);

            theDate = new Date(year, month - 1, day, hour, minute, second);
        }
        else { theDate = new Date(); }
        return theDate;
    }

    function createMotion(title) {
        motionKeyedList = (motionTimedRefresh = new tf.js.KeyedListsPeriodicRefresh({
            retryOnFail: true, useRedirect: false, refreshMillis: 0, refreshOnCreate: false,
            refreshCallback: function () {
                motionLoaded = true;
                onResourceLoaded();
            },
            preProcessServiceData: function (data) {
                data = getFeatureListFromData(data);
                for (var i in data) {
                    var d = data[i], p = d.properties;
                    d.date = getDateFromMotionField(p.Start_Event_Time);
                    d.endDate = getDateFromMotionField(p.End_Event_Time);
                    d.isMotion = true;
                    d.dateTime = d.date.getTime();
                    d.endDateTime = d.endDate.getTime();
                    d.nMinutes = Math.round((d.endDateTime - d.dateTime) / (1000 * 60));
                    d.displayMinutes = tf.js.ConvertToHourMinute((d.endDateTime - d.dateTime) / 1000);
                    d.displayHour = d.date.toTimeString().split(' ')[0];
                    d.isMoving = p.Lvm_State_Type_Name == "Moving";
                    if (p.Start_Address === undefined) { p.Start_Address = unknownMotionAddressLabel; /*if (!!debug) { log('motion without Start_Address ' + JSON.stringify(p)); }*/ }
                    if (p.End_Address === undefined) { p.End_Address = unknownMotionAddressLabel; /*if (!!debug) { log('motion without End_Address' + JSON.stringify(p)); }*/ }
                }
                data.sort(function (a, b) { return a.dateTime - b.dateTime; });
                return data;
            },
            serviceURL: function () {
                var center = appSpecs.appCenter, coordsStr = "&lat=" + center[1] + "&long=" + center[0];
                var baseURL = "http://acorn.cs.fiu.edu/cgi-bin/arquery.cgi?tester=&vid=nist.gov&category=testMotion&tfaction=shortdisplayflash&filetype=.json&numfind=100000" + coordsStr + "&arcriteria=1";
                var prevMonth = showingMonth - 1;
                var yearStr = '' + showingYear, yearStr2;
                var prevMonthStr = prevMonth < 10 ? '0' + prevMonth : '' + prevMonth;
                var minDateStr = yearStr + '-' + prevMonthStr + '-99', maxDateStr;

                if (showingMonth == 12) {
                    maxDateStr = (showingYear + 1) + '-00-00';
                }
                else {
                    var nextMonth = showingMonth + 1;
                    var nextMonthStr = nextMonth < 10 ? '0' + nextMonth : '' + nextMonth;
                    maxDateStr = yearStr + '-' + nextMonthStr + '-00';
                }

                var fullURL = baseURL + "&Start_Event_Time>" + minDateStr + "&Start_Event_Time<" + maxDateStr + "&Name=" + driverName;

                //log(fullURL);

                return fullURL;
            },
            keyedLists: [{
                name: title, keepNotUpdated: false,
                getKeyFromItemData: function (data) {
                    return data.properties.Start_Event_Time;
                },
                needsUpdateItemData: function () { return true; },
                filterAddItem: function (data) {
                    var success = data.properties.Start_Event_Time !== undefined;
                    if (!success) { log('rejecting FS record: ' + JSON.stringify(data)); }
                    return success;
                }
            }]
        })).GetKeyedList(title);
    }

    function makeFSSpanText(keyedItem, useFullDate) {
        var spanText = '';
        if (!!keyedItem) {
            var data = keyedItem.GetData(), props = data.properties;
            if (!!useFullDate) {
                spanText =
                    'Finished' + ' ' + data.displayDate + '<br/>' +
                    props.Service_Address + ', ' + props.Service_Zip + '<br/>' +
                    'coord level: ' + props.coord_level + '<br/>';
            }
            else {
                spanText =
                    'Finished' + ' ' + data.displayFinishTime + '<br/>' +
                    props.Service_Address + '<br/>'/* +
                    'coord level: ' + props.coord_level + '<br/>'*/;
            }
            if (data.indexInDay !== undefined) {
                spanText = (data.indexInDay + 1) + '/' + data.countInDay + ' ' + spanText;
            }
        }
        return spanText;
    }

    function getFSRowContent(notification) {
        var keyedItem = notification.keyedItem;
        var content = null;

        if (!!keyedItem) {
            var data = keyedItem.GetData(), props = data.properties;
            var dayButton = createDayButton(data.day);
            var spanText = makeFSSpanText(keyedItem, true);
            var span = tf.urlapi.CreateInfoWindowSpan(spanText);
            var spanElem = span.GetHTMLElement();

            spanElem.style.borderRadius = "4px";
            spanElem.style.padding = "2px";
            content = createTableRowContentDiv();
            content.AddContent(dayButton, span);
        }

        return { sender: theThis, content: content };
    }

    function createFS(title) {
        FSKeyedList = (FSTimedRefresh = new tf.js.KeyedListsPeriodicRefresh({
            retryOnFail: true, useRedirect: false, refreshMillis: 0, refreshOnCreate: false,
            refreshCallback: function () {
                fsLoaded = true;
                onResourceLoaded();
            },
            preProcessServiceData: function (data) {
                data = getFeatureListFromData(data);
                for (var i in data) {
                    var d = data[i];
                    var date = d.properties.Service_Date, yearStr = date.substring(0, 4), year = parseInt(yearStr, 10),
                        monthStr = date.substring(4, 6), month = parseInt(monthStr, 10), dayStr = date.substring(6, 8), day = parseInt(dayStr, 10);
                    var finishTime = d.properties.Finish_Time;
                    var hour = 0, minute = 0;

                    if (finishTime !== undefined) {
                        var len = finishTime.length;

                        switch (len) {
                            case 4:
                                hour = parseInt(finishTime.substring(0, 2), 10);
                                minute = parseInt(finishTime.substring(2, 4), 10);
                                break;
                            case 3:
                                hour = parseInt(finishTime.substring(0, 1), 10);
                                minute = parseInt(finishTime.substring(1, 3), 10);
                                break;
                            default:
                                log('unexpected finish time len: ' + len + ' - finish time: ' + finishTime);
                                break;
                        }
                    }

                    var hourStr = hour < 10 ? '0' + hour : '' + hour, minuteStr = minute < 10 ? '0' + minute : '' + minute;

                    if (d.properties.Service_Zip === undefined) { d.properties.Service_Zip = '?????'; log('no zip'); }

                    while (d.properties.Service_Zip.length < 5) { d.properties.Service_Zip = '0' + d.properties.Service_Zip; /*log('.');*/ }

                    d.isFS = true;
                    d.endDate = d.date = new Date(year, month - 1, day, hour, minute);
                    d.endDateTime = d.dateTime = d.date.getTime();
                    d.displayFinishTime = hourStr + ':' + minuteStr;
                    d.displayDate = yearStr + '-' + monthStr + '-' + dayStr + ' ' + d.displayFinishTime;
                }
                data.sort(function (a, b) { return a.dateTime - b.dateTime; });
                return data;
            },
            serviceURL: function () {
                var center = appSpecs.appCenter, coordsStr = "&lat=" + center[1] + "&long=" + center[0];
                var baseURL = "http://acorn.cs.fiu.edu/cgi-bin/arquery.cgi?tester=&vid=nist.gov&category=testFS_gc&tfaction=shortdisplayflash&filetype=.json&numfind=100000" + coordsStr + "&arcriteria=1";
                var prevMonth = showingMonth - 1;
                var yearStr = '' + showingYear, yearStr2;
                var prevMonthStr = prevMonth < 10 ? '0' + prevMonth : '' + prevMonth;
                var minDateStr = yearStr + prevMonthStr + '99', maxDateStr;

                if (showingMonth == 12) {
                    maxDateStr = (showingYear + 1) + '0000';
                }
                else {
                    var nextMonth = showingMonth + 1;
                    var nextMonthStr = nextMonth < 10 ? '0' + nextMonth : '' + nextMonth;
                    maxDateStr = yearStr + nextMonthStr + '00';
                }

                var fullURL = baseURL + "&Service_Date>" + minDateStr + "&Service_Date<" + maxDateStr + "&Name=" + driverName;

                //log(fullURL);

                return fullURL;
            },
            keyedLists: [{
                name: title, keepNotUpdated: false,
                getKeyFromItemData: function (data) {
                    if (data.properties.Finish_Time === undefined) { log('Finish_Time is undefined'); return null; }
                    return data.properties.Service_Date + data.properties.Finish_Time;
                },
                needsUpdateItemData: function () { return true; },
                filterAddItem: function (data) {
                    var success = data.properties.Finish_Time !== undefined;
                    if (!success) { log('rejecting FS record: ' + JSON.stringify(data)); }
                    return success;
                }
            }]
        })).GetKeyedList(title);
    }

    var mapBubble, mapInBubble, dayDisplayControl, mapOverlay, animateButton;
    var rightMarginPX = 8;

    function createDayDisplayControl() {
        var marginStr = rightMarginPX + "px";
        var style = {
            display: "block",
            position: "absolute", right: marginStr, bottom: marginStr, fontSize: "2em", backgroundColor: "rgba(192,192,192,0.5)", borderRadius: "8px", border: "2px solid navy",
            "tf-shadow": [0, 0, 4, "rgba(0,0,0,0.6)"], zIndex: 2
        };
        var div, buttonDim = "1.2em";

        (div = new tf.dom.Div({ cssClass: tf.GetStyles().paddedBlockDivClass })).AddContent(

            styles.ApplyStyleProperties(styles.AddButtonDivMargins(animateButton = new tf.ui.SvgGlyphToggleBtn({
                style: true, onClick: function () {
                    if (!!dayDisplaying) {
                        dayDisplaying.OnAnimationToggle();
                    }
                }, dim: buttonDim, isToggled: true,
                glyph: tf.styles.SvgGlyphPauseName, tooltip: "Pause animation", toggledGlyph: tf.styles.SvgGlyphPlayName, toggledTooltip: "Animate event progression"
                }),
                { verticalAlign: "middle" })
            ),

            styles.AddButtonDivMargins(
                new tf.ui.SvgGlyphBtn({ style: true, glyph: tf.styles.SvgGlyphArrowToStartName, onClick: function () { dayDisplaying.GotoEvent(0); }, tooltip: "Go to first event", dim: buttonDim })
            ),
            styles.AddButtonDivMargins(
                new tf.ui.SvgGlyphBtn({ style: true, glyph: tf.styles.SvgGlyphLeftArrowName, onClick: function () { dayDisplaying.PrevEvent(); }, tooltip: "Go to previous event", dim: buttonDim })
            ),
            styles.AddButtonDivMargins(
                new tf.ui.SvgGlyphBtn({ style: true, glyph: tf.styles.SvgGlyphRightArrowName, onClick: function () { dayDisplaying.NextEvent(); }, tooltip: "Go to next event", dim: buttonDim })
            ),
            styles.AddButtonDivMargins(
                new tf.ui.SvgGlyphBtn({ style: true, glyph: tf.styles.SvgGlyphArrowToEndName, onClick: function () { dayDisplaying.GotoEvent(-1); }, tooltip: "Go to last event", dim: buttonDim })
            ),
            styles.AddButtonDivMargins(new tf.ui.TextBtn({
                style: true, label: 'Extent', tooltip: "Set map to day's extent",
                onClick: function () {
                    var extent = map.GetVisibleExtent();
                    dayDisplaying.SetExtent();
                }
            })),

            styles.AddButtonDivMargins(new tf.ui.TextBtn({
                style: true, label: 'Inset', tooltip: "Show/Hide map inset",
                onClick: function () {
                    tf.dom.ToggleDisplayBlockNone(mapBubble);
                    mapInBubble.OnResize();
                }
            }))
        );

        styles.ApplyStyleProperties(dayDisplayControl = div, style);
        dayDisplayControl.AppendTo(map.GetMapMapContainer());
        styles.ChangeOpacityVisibilityClass(dayDisplayControl, false);
    }

    function createMapBubble() {
        var margin = rightMarginPX + "px";
        var dayDisplayElem = dayDisplayControl.GetHTMLElement();
        var heightDayDisplay = dayDisplayElem.offsetHeight;
        var bottomMargin = (heightDayDisplay + 2 * rightMarginPX) + "px";
        var containerStyles = {
            inherits: [subStyles.cursorDefaultStyle, subStyles.noSelectStyle],
            backgroundColor: "#000", color: "#fc0",
            border: "2px dashed #fc0", borderRadius: "10px", padding: "0px",
            width: "50%", height: "35%", maxWidth: "50em", maxHeight: "50em",
            "tf-shadow": [0, 0, 8, "rgba(0,0,0,0.6)"],
            position: "absolute", right: margin, bottom: bottomMargin,
            display: "block", zIndex: 1, opacity: 1
        };

        mapBubble = new tf.dom.Div({ cssClass: styles.GetUnPaddedDivClassNames(false, false) });

        styles.ApplyStyleProperties(mapBubble, containerStyles);

        mapInBubble = map.CreateMapWithSameLayers(mapBubble);
        mapInBubble.SetHasInteractions(true);

        mapBubble.AppendTo(map.GetMapMapContainer());

        appSizer.AddMap(mapInBubble);
        urlapiApp.AddListenersToMap(mapInBubble);

        dLayers.AddListenersToMap(mapInBubble);

        styles.ChangeOpacityVisibilityClass(mapBubble, false);
    }

    function onCreated(notification) {
        styles = tf.GetStyles();
        subStyles = styles.GetSubStyles();
        singleAppHCFOnTheSide = urlapiApp.GetSingleAppHCFOnTheSide();
        twoHorPaneLayout = (singleAppMapContentOnTheSide = singleAppHCFOnTheSide.GetSingleAppMapContentOnTheSide()).GetLeftSeparatorRightLayout();
        HCFLayout = singleAppHCFOnTheSide.GetHCFLayout();
        map = singleAppMapContentOnTheSide.GetMap();
        map.SetGoDBOnDoubleClick(false);
        map.ShowPanel(tf.consts.panelNameOverview, false);
        dLayers = singleAppMapContentOnTheSide.GetDLayers();
        dayLayer = map.AddFeatureLayer({ name: "dayDisplay", description: "dayDisplay", isVisible: true, isHidden: true, zIndex: 1 });
        appSizer = singleAppMapContentOnTheSide.GetAppContainerSizer();
        twoHorPaneLayout.SetRightSideCollapsed(false);
        map.ShowMapCenter(false);

        mapOverlay = new tf.map.HTMLOverlay({ map: map, autoPan: false, isVisible: false });
        mapOverlay.SetPositioning(tf.consts.positioningRight, tf.consts.positioningCenter);
        mapOverlay.SetOffset([-12, 0]);

        createDayDisplayControl();
        createMapBubble();
        mapLoaded = true;
        onResourceLoaded();

        var snaptopixel = false;
        var startZIndex = 10;

        demoSettings = new tf.apps.MotionDemo.Settings({ year: showingYear, month: showingMonth, appSizer: appSizer });

        urlapiApp.AddToToolBar(styles.AddButtonDivMargins(
            new tf.ui.SvgGlyphBtn({
                style: urlapiApp.GetToolBarSvgButtonStyle(), glyph: tf.styles.SvgGlyphGearName, onClick: function () { demoSettings.OnToggle(); },
                tooltip: "Settings", dim: urlapiApp.GetToolBarButtonDim()
            })));

        var div = HCFLayout.CreateUnPaddedDivForHeader();

        div.AddContent(demoSettings);
        urlapiApp.AddToToolBar(div);

        div = HCFLayout.CreateUnPaddedDivForHeader();

        div.AddContent(showingDateDiv = new tf.dom.Div({ cssClass: tf.GetStyles().paddedBlockDivClass }));

        if (tf.js.GetIsValidObject(appSpecs.titleStyle)) {
            styles.ApplyStyleProperties(showingDateDiv, tf.js.ShallowMerge(appSpecs.titleStyle, { textAlign: "center" }));
        }

        urlapiApp.AddToToolBar(div);

        updateShowingDate();
    }

    function onAppSpecsLoaded(appSpecsSet) {
        settings.fullURL = appSpecsSet.fullURL;
        appSpecs = appSpecsSet;
        appCenter = appSpecs.appCenter;
        showingYear = tf.js.GetIntNumberInRange(settings.fullURL.year, 2011, 2015, defaultYear);
        showingMonth = tf.js.GetIntNumberInRange(settings.fullURL.month, 1, 12, defaultMonth);
        driverName = tf.js.GetNonEmptyString(settings.fullURL.driver, defaultDriverName);
        tableRowWidth = tf.js.GetNonEmptyString(appSpecs.tableRowWidth, "14em");
        FSTimedRefresh.RefreshNow();
        motionTimedRefresh.RefreshNow();
    }

    function deleteDaysKeyedList() {
        var items = daysKeyedList.GetKeyedItemList();
        setDayDisplaying(null);
        for (var i in items) {
            var data = items[i].GetData();
            if (!!data.dayDisplay) { data.dayDisplay.OnDelete(); delete data.dayDisplay; }
        }
        daysKeyedList.RemoveAllItems();
    }

    function onRefresh() {
        var sel = demoSettings.GetSelection();
        showingYear = sel.year;
        showingMonth = sel.month;
        if (sel.preservePosition) { map.SetCenter(appCenter); } else { appCenter = map.GetCenter(); }
        deleteDaysKeyedList();
        motionLoaded = fsLoaded = false;
        FSKeyedList.RemoveAllItems();
        motionKeyedList.RemoveAllItems();
        FSTimedRefresh.RefreshNow();
        motionTimedRefresh.RefreshNow();
        updateShowingDate();
    }

    function updateShowingDate() { showingDateDiv.GetHTMLElement().innerHTML = 'showing: ' + demoSettings.GetDateTitle(); }

    function createTable(tables, keyedList, tableSettings, rowSettings, getRowContent, index, title) {
        var settings = {
            keyedList: keyedList, optionalScope: theThis, tableSettings: tableSettings, rowSettings: rowSettings,
            properties: {}, getRowContent: getRowContent
        };
        var table = new tf.ui.KeyedTable(settings)
        tables.push({ table: table, dLayer: null, index: index, title: title });
        return table;
    }

    function onMotionRowSelect() { }
    function onFSRowSelect() { }
    function onDaysRowSelect() { }

    function createFSTable(tables) {
        var tableSettings = tf.js.ShallowMerge(appSpecs.FSTableStyle, { selectOnHover: appSpecs.FSTableSelectOnHover, onSelect: onFSRowSelect });
        FSTableIndex = tables.length;
        FSTable = createTable(tables, FSKeyedList, tableSettings, { style: appSpecs.FSTableRowStyle, selectedStyle: appSpecs.FSTableRowHoverStyle }, getFSRowContent, 0, "FS");
    }

    function createMotionTable(tables) {
        var tableSettings = tf.js.ShallowMerge(appSpecs.motionTableStyle, { selectOnHover: appSpecs.motionTableSelectOnHover, onSelect: onMotionRowSelect });
        motionTableIndex = tables.length;
        motionTable = createTable(tables, motionKeyedList, tableSettings, { style: appSpecs.motionTableRowStyle, selectedStyle: appSpecs.motionTableRowHoverStyle }, getMotionRowContent, 1, "Motion");
    }

    function createDaysTable(tables) {
        var tableSettings = tf.js.ShallowMerge(appSpecs.daysTableStyle, { selectOnHover: appSpecs.daysTableSelectOnHover, onSelect: onDaysRowSelect });
        daysTableIndex = tables.length;
        daysTable = createTable(tables, daysKeyedList, tableSettings, { style: appSpecs.daysTableRowStyle, selectedStyle: appSpecs.daysTableRowHoverStyle }, getDaysRowContent, 1, "Days");
    }

    function initTables() { tables = []; createDaysTable(tables); createMotionTable(tables); createFSTable(tables); return tables; }

    function initialize() {

        defaultYear = 2015;
        defaultMonth = 3;

        unknownMotionAddressLabel = "[ Unknown address ]";
        driverName = defaultDriverName = "Jeffrey+G.+Ault";

        var defaultURLParams = {
            "_year": defaultYear,
            "_month": defaultMonth,
            "driver": driverName,

            "lat": 41.646505,
            "lon": -71.204835,
            "level": 15,
            "fmap": "m2",
            "panels": "tflogo+address+zoom+legend+type+measure+download+maplocation+userlocation+overview+fullscreen+source",
            "legendh": "{Cities::~Capitals:Capitals_WorldMap@wm_Capitals-120-6000;Capitals:Capitals_WorldMap@wm_Capitals-6000-15000;~Metro:Big_Cities_over_million_WorldMap@wm_Cities_Greater_900K-120-5000;Metro:Big_Cities_over_million_WorldMap@wm_Cities_Greater_900K-5000-15000;~Cities:Cities_WorldMap@wm_Cities_75K_to_900K-120-2400+wm_Cities_Greater_900K-120-2400+wm_Cities_Unknownpop-120-2400;Cities:Cities_WorldMap@wm_Cities_75K_to_900K-2400-15000+wm_Cities_Greater_900K-2400-15000+wm_Cities_Unknownpop-2400-15000;};{Hubs::~Ports:Marine_Ports_WorldMap@wm_Marine_Ports-120-360;Ports:Marine_Ports_WorldMap@wm_Marine_Ports-360-2000;~Railway:Railway_Stations_WorldMap@wm_Railway_Stations-120-240;~Airports:Airports_WorldMap@wm_Airports-120-240;};{Water::Bays:Seas_and_Bays_WorldMap@wm_Seas_Bays-120-2000;Glaciers:Glaciers_WorldMap@wm_Glacier-120-4000;~Rivers_B:Lake_and_River_contours_WorldMap@wm_Water_Poly-120-500;~Great_Lakes_L:Great_Lakes_labels_WorldMap@WM_GREAT_LAKES_NAME-120-4000;~Great_Lakes_B:Great_Lakes_contours_WorldMap@wm_Great_Lakes-120-4000;OSM-water:Lake_and_River_contours_from_Open_Street_Maps@osm_water-0-4000;};{Regions::~Admin_L:States_and_Provinces_names_labeled_WorldMap@wm_World_Admin_name-120-2000;~Admin_B:States_and_Provinces_boundaries_WorldMap@wm_World_Admin-120-2000;~Countries_L:Nation_names_labeled_WorldMap@nation_name-2000-5000;Countries_L:Nation_names_labeled_WorldMap@nation_name-5000-30000;~Countries_B:Nations_boundaries_WorldMap@wm_World_Nations-120-15000;OSM-Admin:Administrative_boundaries_from_Open_Street_Maps@osm_admin-0-60000;};{Parcels::FA-address:Addresses_from_First_American_Parcel_Data@fa_address-0-0.5;FA-owner:Property_owner_from_First_American_Parcel_Data@fa_owner-0-0.5;~lines:Property_lines,_from_First_American@fa_parcel-0-1;lines:Property_lines,_from_First_American@fa_parcel-1-2;OSM-buildings:Building_contours_from_Open_Street_Maps@osm_buildings-0-7;};{People::population:People_per_block_per_Census_2000@blk_pop-0-5;income:Aggregate_Neighborhood_Income_and_number_of_homes,_per_Census-2000@bg_mhinc-0.7-10+blkgrpy-0.7-10;};{Services::~business:Yellow_Pages@nypages-0-1.2;business:Yellow_Pages@nypages-1.2-5;food:Restaurants_from_NavTeq@nv_restrnts-0-10;doctors:Physicians_specialties@physicianspecialty-0-5;};Landmarks:Cultural_Landmarks_WorldMap@wm_Cultural_Landmarks-120-240;Utilities:Utilities_WorldMap@wm_Utilities-120-720;Environment:Hydrology@prism-0-120;~Places:Places@gnis2-0-6+hotels-0-6;Places:Places@gnis2-6-24+hotels-6-24;OSM-place-names:Place_names_labeled_from_Open_Street_Maps@osm_place_names-0-30000;{Roads::lines:Road_lines_from_NavTeq@street-0-2000;names:Road_names_labeled_from_NavTeq@street_names-0-240;~OSM-lines:Road_lines_from_Open_Street_Maps@osm_roads-0.5-7000;OSM-lines:Road_lines_from_Open_Street_Maps@osm_roads-0-0.5;~OSM-names:Road_names_labeled_from_Open_Street_Maps@osm_road_names-0-7000;~routes:Routes_WorldMap@wm_Major_Routes-120-1000+wm_Minor_Routes-120-1000;routes:Routes_WorldMap@wm_Major_Routes-1000-5000+wm_Minor_Routes-1000-5000;~railways:Railroad_WorldMap@wm_Railroad_Track-120-2000;};{Towns::~borders:Borders@incorp-0-120;~towns:Cities,_towns@wtown-0-60;};",
            "legendm": "{OSM::~buildings:Building_outlines@osm_buildings-0-60;~land:Land@osm_land-0-240000;~landuse:Land_usage_information@osm_landuse-0-7000;~place_names:Names_for_country,state,city_and_other small_places@osm_place_names-0-15000;~road_names:Road_names@osm_road_names-0-240;~roads:Roads@osm_roads-0-7000;~water:Water_outlines@osm_water-0-15000;};",
            "address": "",
            "vid": "",
            "passthrough": "",
            "tflogo": "1",
            "type": "map",
            "source": "best_available",
            "rgpopup": 5,
            "help": "<span><b>Double Click</b>: Local Data Reports and Queries<br /><b>Drag</b>: Browse the map<br />Buttons: <b>Full Screen</b>, <b>Reset Rotation</b>, <b>Search Location</b>, <b>Zoom</b>, <b>Map Layers</b><br /><br />Address bar examples:<br />1 Flagler St, Miami, FL<br />Miami<br />Miami, FL<br />33139<br />25.77 -80.19 (coordinates)</span>",
        };
        var defaultSpecs = "./specs.txt";

        debug = tf.GetDebug();

        createDays("days"); createMotion("motion"); createFS("fs");

        settings = tf.js.GetValidObjectFrom(settings);

        params = tf.urlapi.ParseURLAPIParameters(settings.fullURL, defaultURLParams);
        params[tf.consts.paramNameAppSpecs] = tf.js.GetNonEmptyString(params[tf.consts.paramNameAppSpecs], defaultSpecs);

        settings.fullURL = params;

        settings.onAppSpecsLoaded = onAppSpecsLoaded;
        settings.onRefresh = onRefresh;
        settings.initTables = initTables;
        settings.onCreated = onCreated;

        urlapiApp = new tf.urlapi.AppFromSpecs(settings);
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

var g_MotionDemo = new tf.apps.MotionDemo.MotionDemo({ fullURL: window.location.href });
