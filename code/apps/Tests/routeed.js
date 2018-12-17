"use strict";

tf.helpers.RouteEd = function (settings) {
    var theThis, routesLoader, routes, styles, urlapiApp, appSpecs;
    var singleAppHCFOnTheSide, singleAppMapContentOnTheSide, twoHorPaneLayout, HCFLayout, appSpecs, dLayers, appSizer, map;
    var routesKeyedList, routeTable;
    var routesLayer, shapesLayer, pointsLayer, stopsLayer, busesLayer, mlsLayer, mapMonitor;
    var routesAreLoaded, appIsCreated;
    var stops, stopsShown, shapes, buses, busesShown, trips;
    var busUpdateDelay, stopUpdateDelay;
    var lastSelectedRoute, lastSelectedDir, lastSelectedShape, lastSelectedPointShape, lastSelectedShapeStart, lastSelectedShapeEnd, lastSelectedTrip, lastSelectedShapeId;
    var showingPoints;
    var mls, mlsFeature, mlsPointFeatures;

    function onShowHidePoints() {
        showingPoints = !showingPoints;
        if (lastSelectedShapeId != undefined) {
            doSelectShape(lastSelectedShapeId);
        }
        updateMLSFeature();
    }

    function getMLSStyle(isHover) {
        var lineWidth = isHover ? 8 : 6, zindex = isHover ? 5 : 1;
        var color = "#0b0";
        var style = { line: true, line_color: color, line_width: lineWidth, zindex: zindex };
        return isHover ? [{ line: true, line_color: "#000", line_width: 15, zindex: 3 }, { line: true, line_color: "#fff", line_width: 12, zindex: 4 }, style] : style;
    }

    function getMLSPointStyle(isHover) {
        var circleRadius = isHover ? 5 : 4;
        var fillOpacity = isHover ? 100 : 100;
        var fillColor = isHover ? "#0f0" : "#0b0";
        var zindex = isHover ? 9 : 7;
        var line_color = "#fff";
        var styleCircle1 = { circle: true, circle_radius: circleRadius, line: true, line_color: line_color, fill: true, fill_color: fillColor, fill_opacity: fillOpacity, zindex: zindex + 1 };
        var styleCircle2 = { circle: true, circle_radius: circleRadius + 3, fill: true, fill_color: "#000", zindex: zindex, line: true, line_color: line_color, line_width: 1 };
        return [styleCircle2, styleCircle1];
    }

    function updateMLSFeature() {
        if (mlsPointFeatures) {
            for (var i in mlsPointFeatures) {
                mlsLayer.DelMapFeature(mlsPointFeatures[i]);
            }
            mlsPointFeatures = undefined;
        }
        if (mlsFeature) {
            mlsLayer.DelMapFeature(mlsFeature);
            mlsFeature = undefined;
        }
        if (!!mls) {
            var mlsLen = mls.length;

            if (mlsLen > 0) {

                var geometry = {
                    type: "multilinestring",
                    coordinates: mls,
                    style: getMLSStyle(false),
                    hoverStyle: getMLSStyle(true)
                };

                mlsFeature = new tf.map.Feature(geometry);
                mlsLayer.AddMapFeature(mlsFeature);

                if (showingPoints) {
                    geometry.type = "multipoint";
                    geometry.style = getMLSPointStyle(false);
                    geometry.hoverStyle = getMLSPointStyle(true);
                    for (var i in mls) {
                        mlsPointFeatures = [];
                        geometry.coordinates = mls[i];
                        var mlsPointFeature = new tf.map.Feature(geometry);
                        mlsLayer.AddMapFeature(mlsPointFeature);
                        mlsPointFeatures.push(mlsPointFeature);
                    }
                }
            }
        }
    }

    function addPointToMLS(pointCoords) {
        if (!!mls) { var lsIndex = mls.length - 1; mls[lsIndex].push(pointCoords); }
        else { mls = []; mls[0] = [pointCoords]; }
        updateMLSFeature();
    }

    function onClearMLS() { mls = undefined; updateMLSFeature(); }

    function onClearCurrentLS() {
        if (!!mls) {
            var lsLen = mls.length;
            if (lsLen > 1) { mls = mls.slice(0, lsLen - 1); }
            else { mls = undefined; }
        }
        updateMLSFeature();
    }

    function onClearLastPt() {
        if (!!mls) {
            var lsLen = mls.length;
            if (lsLen > 0) {
                var ls = mls[lsLen - 1];
                var lslsLen = ls.length;
                if (lslsLen > 0) { mls[lsLen - 1] = ls.slice(0, lslsLen - 1); }
            }
            else { mls = undefined; }
        }
        updateMLSFeature();
    }

    function onSaveCurrentLS() { if (!!mls) { mls.push([]); } updateMLSFeature(); }

    function addToolbarButtons() {
        var dim = "1.4em";
        var buttonDim = "1.6em";
        var usePointsButton = new tf.ui.TextBtn({
            style: true, label: "Points", dim: dim, tooltip: "Show/hide points",
            onClick: onShowHidePoints
        });
        usePointsButton.GetHTMLElement().style.display = 'block';
        urlapiApp.AddToToolBar(styles.AddButtonDivMargins(usePointsButton));

        var clearMLSButton = new tf.ui.TextBtn({
            style: true, label: "Clear", dim: dim, tooltip: "clear multi line string",
            onClick: onClearMLS
        });

        var clearLSButton = new tf.ui.TextBtn({
            style: true, label: "Clear seg", dim: dim, tooltip: "clear current line string",
            onClick: onClearCurrentLS
        });

        var clearPtButton = new tf.ui.TextBtn({
            style: true, label: "Del pt", dim: dim, tooltip: "delete last added point",
            onClick: onClearLastPt
        });

        var saveLSButton = new tf.ui.TextBtn({
            style: true, label: "Save", dim: dim, tooltip: "save current line string",
            onClick: onSaveCurrentLS
        });

        urlapiApp.AddToToolBar(styles.AddButtonDivMargins(clearMLSButton));
        urlapiApp.AddToToolBar(styles.AddButtonDivMargins(clearLSButton));
        urlapiApp.AddToToolBar(styles.AddButtonDivMargins(clearPtButton));
        urlapiApp.AddToToolBar(styles.AddButtonDivMargins(saveLSButton));
    }

    function onCreated() {
        singleAppHCFOnTheSide = urlapiApp.GetSingleAppHCFOnTheSide();
        twoHorPaneLayout = (singleAppMapContentOnTheSide = singleAppHCFOnTheSide.GetSingleAppMapContentOnTheSide()).GetLeftSeparatorRightLayout();
        HCFLayout = singleAppHCFOnTheSide.GetHCFLayout();
        map = singleAppMapContentOnTheSide.GetMap();
        map.ShowMapCenter(false);
        var addLayerSettings = {
            name: "routes", isVisible: true, isHidden: false, useClusters: false,
            zIndex: 10
        };

        routesLayer = map.AddFeatureLayer(addLayerSettings);
        addLayerSettings.name = "shapes";
        addLayerSettings.zIndex = 11;
        shapesLayer = map.AddFeatureLayer(addLayerSettings);

        addLayerSettings.name = "points";
        addLayerSettings.zIndex = 12;
        pointsLayer = map.AddFeatureLayer(addLayerSettings);

        addLayerSettings.name = "stops";
        addLayerSettings.zIndex = 13;
        stopsLayer = map.AddFeatureLayer(addLayerSettings);

        addLayerSettings.name = "buses";
        addLayerSettings.zIndex = 14;
        busesLayer = map.AddFeatureLayer(addLayerSettings);

        addLayerSettings.name = "mls";
        addLayerSettings.zIndex = 15;
        mlsLayer = map.AddFeatureLayer(addLayerSettings);

        dLayers = singleAppMapContentOnTheSide.GetDLayers();
        appSizer = singleAppMapContentOnTheSide.GetAppContainerSizer();
        twoHorPaneLayout.SetRightSideCollapsed(false);

        addToolbarButtons();

        appIsCreated = true;
        checkReadyToRun();
    }

    function doSelectRoute(item, selectBool) {
        var lineFeatures = tf.js.GetObjProperty(item, "lineFeatures");
        for (var i in lineFeatures) {
            var lineFeature = lineFeatures[i].lineFeature;
            lineFeature.SetIsAlwaysInHover(selectBool);
        }
        if (!selectBool) { removeLastSelectedShape(); }
        lastSelectedTrip = undefined;
    }

    function removeLastSelectedShape() {
        lastSelectedShapeId = undefined;
        if (lastSelectedShape) { shapesLayer.DelMapFeature(lastSelectedShape); lastSelectedShape = undefined; }
        if (lastSelectedPointShape) { shapesLayer.DelMapFeature(lastSelectedPointShape); lastSelectedPointShape = undefined; }
        if (lastSelectedShapeStart) { shapesLayer.DelMapFeature(lastSelectedShapeStart); lastSelectedShapeStart = undefined; }
        if (lastSelectedShapeEnd) { shapesLayer.DelMapFeature(lastSelectedShapeEnd); lastSelectedShapeEnd = undefined; }
    }

    function selectRoute(item) {
        lastSelectedDir = undefined;
        var hadStops = stopsShown != undefined;
        var hadBuses = busesShown != undefined;
        if (lastSelectedRoute) { doSelectRoute(lastSelectedRoute, false); hideStops(); hideBuses(); }
        if (lastSelectedRoute = item) { doSelectRoute(lastSelectedRoute, true); if (hadStops) { showStops(); } if (hadBuses) { showBuses(); } }
    }

    function selectRouteIfNotSelected(item) {
        if (item != lastSelectedRoute) { selectRoute(item); } else { removeLastSelectedShape(); refreshStops(); refreshBuses(); }
    }

    function doSelectDir(item, dir, selectBool) {
        lastSelectedTrip = undefined;
        var lineFeatures = tf.js.GetObjProperty(item, "lineFeatures");
        for (var i in lineFeatures) {
            var lineFeature = lineFeatures[i].lineFeature;
            var doSelect = selectBool && i == dir;
            lineFeature.SetIsAlwaysInHover(doSelect);
        }
        refreshStops();
        refreshBuses();
    }

    function selectDir(item, dir) {
        selectRouteIfNotSelected(item);
        if (lastSelectedDir = dir) { doSelectDir(item, lastSelectedDir, true); }
    }

    function doSelectShape(shapeId) {
        removeLastSelectedShape();
        var shape = shapes[shapeId];
        if (!!shape) {
            lastSelectedShapeId = shapeId;
            var shapeFeature = shape.shapeProps;
            if (shapeFeature == undefined) {
                createShapeFeatures(shape, undefined, undefined);
                shapeFeature = shape.shapeProps;
            }
            if (shapeFeature) {
                shapesLayer.AddMapFeature(lastSelectedShape = shapeFeature.shapeFeature);
                if (showingPoints) {
                    shapesLayer.AddMapFeature(lastSelectedPointShape = shapeFeature.pointFeature);
                }
                shapesLayer.AddMapFeature(lastSelectedShapeStart = shapeFeature.startFeature);
                shapesLayer.AddMapFeature(lastSelectedShapeEnd = shapeFeature.endFeature);
            }
        }
    }

    function selectShape(item, dir, shapeId) {
        lastSelectedTrip = undefined;
        selectRouteIfNotSelected(item);
        if (lastSelectedDir = dir) { doSelectDir(item, lastSelectedDir, true); }
        doSelectShape(shapeId);
    }

    function selectRouteExtent(item) {
        selectRouteIfNotSelected(item);
        var extent = undefined;
        var lineFeatures = tf.js.GetObjProperty(item, "lineFeatures");
        for (var i in lineFeatures) {
            var lineFeature = lineFeatures[i].lineFeature;
            var lineFeatureExtent = lineFeature.GetGeom().GetExtent();
            extent = (extent == undefined) ? lineFeatureExtent : tf.js.MergeMapExtents(extent, lineFeatureExtent);
            map.SetVisibleExtent(tf.js.ScaleMapExtent(extent, 1.2));
        }
    }

    function hideStops() {
        for (var i in stopsShown) {
            stopsLayer.DelMapFeature(stopsShown[i]);
        }
        stopsShown = undefined;
    }

    function getStopStyle(item, isHover) {
        var style = { circle: true, circle_radius: isHover ? 6 : 4, fill: true, fill_color: "#fff", line: true, line_width: 2, line_color: "#000", zindex: 1 };
        if (isHover) {
            var stopName = item.props.name;
            var nameStyle = { marker: true, label: stopName, zindex: 3 };
            style.zindex = 2;
            style = [style, nameStyle];
        }
        return style;
    }

    function createStopMapFeatures(stop) {
        if (stop.mapFeature == undefined) {
            var stopGeometry = {
                type: 'point',
                style: getStopStyle(stop, false),
                hoverStyle: getStopStyle(stop, true)
            }
            stopGeometry.coordinates = stop.props.pointCoords;
            stop.mapFeature = new tf.map.Feature(stopGeometry);
        }
    }

    function addStopShown(stop) {
        createStopMapFeatures(stop);
        var stopId = stop.props.StopID;
        if (stopsShown[stopId] == undefined) {
            stopsShown[stopId] = stop.mapFeature;
            stopsLayer.AddMapFeature(stop.mapFeature, false);
            stop.mapFeature.stop = stop;
            addStopUpdate(stop);
        }
    }

    function showStops() {
        hideStops();
        if (lastSelectedRoute) {
            stopsShown = {};
            if (lastSelectedTrip) {
                var stopIds = lastSelectedTrip.stopIds;
                for (var iStopId in stopIds) {
                    var stopId = stopIds[iStopId];
                    var stop = stops[stopId];
                    if (stop) { addStopShown(stop); }
                }
            }
            else {
                var item = lastSelectedRoute, itemData = item.GetData();
                var directions = itemData.directions;
                for (var iDir in directions) {
                    var dir = directions[iDir], stopIds = dir.stopIds;
                    var willShow = lastSelectedDir == undefined || lastSelectedDir == dir.name;
                    if (willShow) {
                        for (var iStopId in stopIds) {
                            var stopId = stopIds[iStopId];
                            var stop = stops[stopId];
                            if (stop) { addStopShown(stop); }
                        }
                    }
                }
            }
            stopsLayer.AddWithheldFeatures();
        }
    }

    function showHideStops(item) {
        if (item == lastSelectedRoute) {
            if (stopsShown != undefined) { hideStops(); }
            else { showStops(); }
        }
        else {
            selectRoute(item);
            showStops();
        }
    }

    function refreshStops() { if (stopsShown != undefined) { hideStops(); showStops(); } }

    function hideBuses() {
        for (var i in busesShown) {
            busesLayer.DelMapFeature(busesShown[i]);
        }
        busesShown = undefined;
    }

    function getBusStyle(item, isHover) {
        var style = { shape: true, shape_npoints: 4, shape_radius: isHover ? 8 : 6, fill: true, fill_color: "#aaf", line: true, line_width: 2, line_color: "#000", zindex: 1 };
        if (isHover) {
            var busName = item.props.Direction + ' ' + item.props.BusName + ' ' + item.props.ServiceDirection;
            //var busName = 'bus';
            var nameStyle = { marker: true, label: busName, zindex: 3 };
            style.zindex = 2;
            style = [style, nameStyle];
        }
        return style;
    }

    var busIsUpdating = {};

    function busUpdate(bus) {
        if (bus) {
            var props = bus.props;
            var busId = props.BusID;
            if (busIsUpdating[busId]) {
                if (buses[busId]) {
                    routesLoader.GetBus(busId, function (data) {
                        if (data) {
                            if (buses[busId]) {
                                if (data.BusID == busId) {
                                    var busIsShowing = busesShown != undefined && busesShown[busId] != undefined;
                                    if (props.pointCoords[0] != data.pointCoords[0] || props.pointCoords[1] != data.pointCoords[1]) {
                                        props.Longitude = data.Longitude;
                                        props.Latitude = data.Latitude;
                                        props.pointCoords = data.pointCoords;
                                        bus.mapFeature.SetPointCoords(props.pointCoords);
                                        if (busIsShowing) {
                                            new tf.map.PointsStyleAnimator({
                                                maps: [map], pointProviders: [data.pointCoords], duration: busUpdateDelay / 2,
                                                getStyle: function (elapsed01) {
                                                    var radius = 10 + Math.pow(elapsed01, 1 / 2) * 16;
                                                    var opacity = 1 - Math.pow(elapsed01, 3);
                                                    var line_width = (2 - elapsed01);
                                                    var drawOpacity = opacity * 50;
                                                    var flashStyle = {
                                                        circle: true, circle_radius: radius, snapToPixel: false,
                                                        //fill: false, fill_color: "#fff", fill_opacity: drawOpacity / 3,
                                                        line: true, line_width: line_width, line_color: "#f00", line_opacity: drawOpacity
                                                    };
                                                    return flashStyle;
                                                }
                                            });
                                        }
                                    }
                                    //else { console.log(busId); }
                                    if (busIsShowing) {
                                        setTimeout(function () { return busUpdate(bus) }, busUpdateDelay);
                                    }
                                    else {
                                        if (busIsUpdating[busId] != undefined) {
                                            delete busIsUpdating[busId];
                                            //console.log('deleted bus update: ' + busId);
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            console.log('must delete bus not updated with id: ' + busId + ' and name: ' + props.BusName);
                        }
                    });
                }
            }
        }
    }

    function addBusUpdate(bus) {
        if (bus) {
            var props = bus.props;
            var busId = props.BusID;
            if (!busIsUpdating[busId]) {
                busIsUpdating[busId] = true;
                busUpdate(bus);
                //console.log('added bus update: ' + busId);
            }
            else {
                //console.log('skipped add bus update: ' + busId);
            }
        }
    }

    var stopIsUpdating = {};

    function stopUpdate(stop) {
        if (stop) {
            var props = stop.props;
            var stopId = props.StopID;
            if (stopIsUpdating[stopId]) {
                if (stops[stopId]) {
                    routesLoader.GetStop(stopId, function (data) {
                        if (data) {
                            if (stops[stopId]) {
                                var stopIsShowing = stopsShown != undefined && stopsShown[stopId] != undefined;
                                if (stopIsShowing) {

                                    setTimeout(function () { return stopUpdate(stop) }, stopUpdateDelay);
                                }
                                else {
                                    if (stopIsUpdating[stopId] != undefined) {
                                        delete stopIsUpdating[stopId];
                                        //console.log('deleted stop update: ' + stopId);
                                    }
                                }
                            }
                        }
                        else {
                            console.log('stop not updated with id: ' + stopId);
                        }
                    });
                }
            }
        }
    }

    function addStopUpdate(stop) {
        if (stop) {
            var props = stop.props;
            var stopId = props.StopID;
            if (!stopIsUpdating[stopId]) {
                stopIsUpdating[stopId] = true;
                stopUpdate(stop);
                //console.log('added stop update: ' + stopId);
            }
            else {
                //console.log('skipped add stop update: ' + stopId);
            }
        }
    }

    function showBuses() {
        hideBuses();
        if (lastSelectedRoute) {
            var item = lastSelectedRoute, itemData = item.GetData();
            var directions = itemData.directions;
            busesShown = {};
            for (var iDir in directions) {
                var dir = directions[iDir], busIds = dir.buses;
                var willShow = lastSelectedDir == undefined || lastSelectedDir == dir.name;
                if (willShow) {
                    for (var iBusId in busIds) {
                        var busId = busIds[iBusId];
                        var bus = buses[busId];
                        if (bus) {
                            var busGeometry = {
                                type: 'point',
                                style: getBusStyle(bus, false),
                                hoverStyle: getBusStyle(bus, true)
                            }
                            if (bus.mapFeature == undefined) {
                                busGeometry.coordinates = bus.props.pointCoords;
                                bus.mapFeature = new tf.map.Feature(busGeometry);
                                bus.mapFeature.bus = bus;
                            }
                            if (busesShown[busId] == undefined) {
                                busesShown[busId] = bus.mapFeature;
                                busesLayer.AddMapFeature(bus.mapFeature, false);
                                addBusUpdate(bus);
                            }
                        }
                    }
                }
            }
            busesLayer.AddWithheldFeatures();
        }
    }

    function showHideBuses(item) {
        if (item == lastSelectedRoute) {
            if (busesShown != undefined) { hideBuses(); }
            else { showBuses(); }
        }
        else {
            selectRoute(item);
            showBuses();
        }
    }

    function refreshBuses() { if (busesShown != undefined) { hideBuses(); showBuses(); } }

    function getRouteDirShapeLabelOnClick(item, dir, shape) { return function () { selectShape(item, dir, shape); }; }
    function getRouteDirLabelOnClick(item, dir) { return function () { selectDir(item, dir); }; }
    function getRouteLabelOnClick(item) { return function () { return selectRoute(item); }; }
    function getExtentLabelOnClick(item) { return function () { return selectRouteExtent(item); } }
    function getStopsLabelOnClick(item) { return function () { return showHideStops(item); } }
    function getBusesLabelOnClick(item) { return function () { return showHideBuses(item); } }

    function getRouteRowContent(notification) {
        var keyedItem = notification.keyedItem;
        var content = null;

        if (!!keyedItem) {
            var marginsFunction = function (x) { return x; }
            //var marginsFunction = styles.AddButtonDivTopBottMargins;
            var data = keyedItem.GetData();
            var props = data.props;

            content = new tf.dom.Div({ cssClass: styles.dLayerInfoClass });

            var contentStyle = content.GetHTMLElement().style;

            contentStyle.textAlign = 'left';
            contentStyle.width = "100%";
            contentStyle.border = "2px solid navy";
            contentStyle.borderRadius = "6px";

            var dim = "1.4em";
            var buttonDim = "1.6em";
            var totalTotalPoints = 0;
            var routeLabelButtonText = props.RouteID + ': ' + props.RouteAliasLong;
            var routeLabelButton = new tf.ui.TextBtn({
                style: true, label: routeLabelButtonText, dim: dim, tooltip: props.RouteDescription,
                onClick: getRouteLabelOnClick(keyedItem)
            });

            routeLabelButton.GetHTMLElement().style.display = 'block';

            content.AddContent(marginsFunction(routeLabelButton));

            var labelButton;

            var extentButton = new tf.ui.TextBtn({
                style: true, label: "extent", dim: dim, tooltip: "set map extent",
                onClick: getExtentLabelOnClick(keyedItem)
            });

            content.AddContent(styles.AddButtonDivLeftMargin(styles.AddButtonDivTopBottMargins(marginsFunction(extentButton))));

            var stopsButton = new tf.ui.TextBtn({
                style: true, label: "stops", dim: dim, tooltip: "view bus stops",
                onClick: getStopsLabelOnClick(keyedItem)
            });

            content.AddContent(styles.AddButtonDivLeftMargin(styles.AddButtonDivTopBottMargins(marginsFunction(stopsButton))));

            var busesButton = new tf.ui.TextBtn({
                style: true, label: "buses", dim: dim, tooltip: "view buses",
                onClick: getBusesLabelOnClick(keyedItem)
            });

            content.AddContent(styles.AddButtonDivLeftMargin(styles.AddButtonDivTopBottMargins(marginsFunction(busesButton))));

            var directions = data.directions;

            for (var i in directions) {
                var divDir = new tf.dom.Div({ cssClass: styles.GetPaddedDivClassNames(false, false) });
                var dir = directions[i];
                var dirName = dir.name;
                var directionLabelButton = new tf.ui.TextBtn({
                    style: true, label: dirName, dim: dim, tooltip: dirName,
                    onClick: getRouteDirLabelOnClick(keyedItem, i)
                });
                divDir.AddContent(marginsFunction(directionLabelButton));
                var divDirStyle = divDir.GetHTMLElement().style;
                //divDirStyle.borderLeft = divDirStyle.borderRight = divDirStyle.borderBottom = "1px solid black";
                divDirStyle.border = "1px solid black";
                divDirStyle.borderRadius = "4px";

                var divShapes = new tf.dom.Div({ cssClass: styles.GetPaddedDivClassNames(false, false) });
                var shapeIds = dir.shapeIds;
                var totalPoints = 0;

                for (var s in shapeIds) {
                    //var divShape = new tf.dom.Div({ cssClass: styles.GetPaddedDivClassNames(true, false) });
                    var shapeId = shapeIds[s];
                    var shape = shapes[shapeId];
                    var len = shape.coordinates.length;
                    totalPoints += len;
                    labelButton = new tf.ui.TextBtn({
                        style: true, label: shapeId + '(' + len + ')', dim: dim, tooltip: dirName + ' ' + shapeId,
                        onClick: getRouteDirShapeLabelOnClick(keyedItem, i, shapeId)
                    });
                    //divShape.AddContent(marginsFunction(labelButton));
                    //divShapes.AddContent(divShape);
                    divShapes.AddContent(styles.AddButtonDivMargins(labelButton));
                }

                directionLabelButton.SetText(dir.name + '(' + totalPoints + ')');

                divDir.AddContent(divShapes);

                content.AddContent(divDir);

                totalTotalPoints += totalPoints;
            }
        }

        routeLabelButton.SetText(routeLabelButtonText + '(' + totalTotalPoints + ')');

        appSizer.UpdateMapSizes();

        return { sender: theThis, content: content };
    }

    function createTable(tables, keyedList, tableSettings, rowSettings, getRowContent, index, title) {
        var settings = {
            keyedList: keyedList, optionalScope: theThis, tableSettings: tableSettings, rowSettings: rowSettings,
            properties: {}, getRowContent: getRowContent
        };
        var table = new tf.ui.KeyedTable(settings)
        tables.push({ table: table, dLayer: null, index: index, title: title });
        return table;
    }

    function createRoutesTable(tables) {
        var tableSettings = tf.js.ShallowMerge(appSpecs.routeTableStyle, { selectOnHover: appSpecs.routeTableSelectOnHover, onSelect: onRouteRowSelect });
        routeTable = createTable(tables, routesKeyedList, tableSettings, { style: appSpecs.routeTableRowStyle, selectedStyle: appSpecs.routeTableRowHoverStyle }, getRouteRowContent, 0, "routes");
    }

    function onRouteRowSelect(notification) {
        /*if (!notification.isClick) {
            if (!!notification.selected) {
                var selItem = notification.selected.GetKeyedItem();
                if (selItem != lastSelectedRoute) {
                    selectRoute(selItem);
                }
            }
        }*/
    }

    function initTables() {
        var tables = [];
        createRoutesTable(tables);
        return tables;
    }

    function onAppSpecsLoaded(appSpecsSet) {
        appSpecs = appSpecsSet;
    }

    function getRouteColor(item) { return '#' + item.GetData().props.RouteColor; }

    function getRouteStyle(item, isHover, isShape, isPoint) {
        var color = getRouteColor(item);
        if (isPoint) {
            var circleRadius = isHover ? 4 : 3;
            var fillOpacity = isHover ? 100 : 0;
            var fillColor = isHover ? "#fff" : "#f00";
            var styleCircle1 = { circle: true, circle_radius: circleRadius, line: true, line_color: "#fff", fill: true, fill_color: fillColor, fill_opacity: fillOpacity, zindex: 2 };
            var styleCircle2 = { circle: true, circle_radius: circleRadius + 2, fill: true, fill_color: "#000", zindex: 1 };
            return [styleCircle2, styleCircle1];
        }
        else {
            var lineWidth = isHover ? 5 : 3, zindex = isHover ? 5 : 1;
            if (isShape) { lineWidth += 3; color = "#000"; }
            var style = { line: true, line_color: color, line_width: lineWidth, zindex: zindex };
            return isHover ? [{ line: true, line_color: "#000", line_width: 15, zindex: 3 }, { line: true, line_color: "#fff", line_width: 12, zindex: 4 }, style] : style;
        }
    }

    function copyRoutes(routeSource) { routes = []; for (var i in routeSource) { routes.push(routeSource[i]); } }

    function onFeatureClick(notification) {
        var mapFeature = notification.mapFeature;
        if (!!mapFeature.bus) {
            var bus = mapFeature.bus;
            var props = bus.props;
            var tripId = props.TripID;
            var trip = trips[tripId];
            if (trip) {
                var shapeId = trip.shapeId;
                doSelectShape(shapeId);
                lastSelectedTrip = trip;
                refreshStops();
            }
            else {
                console.log('bus ' + props.BusID + ' has unknown trip: ' + tripId);
            }
        }
        else if (!!mapFeature.stop) {
            console.log('stop');
        }
        else if (!!mapFeature.route) {
            setTimeout(function () { routeTable.GetRowFromKeyedItem(mapFeature.route).Select(true, true); }, 100);
            if (mapFeature.shape) {
                var shape = mapFeature.shape;
                var shapeCoordinates = shape.coordinates;
                var ptMouse = notification.eventCoords;
                var hitTest = tf.helpers.HitTestMapCoordinatesArray(shapeCoordinates, ptMouse);
                var minInd = hitTest.minDistanceIndex;
                if (minInd >= 0) {
                    var ptHit = shapeCoordinates[minInd];
                    var shapeLen = shapeCoordinates.length;
                    if (minInd < shapeLen - 1) {
                        var ptHit2 = shapeCoordinates[minInd + 1];
                        if (tf.units.GetDistanceInMetersBetweenMapCoords(ptHit2, ptMouse) < tf.units.GetDistanceInMetersBetweenMapCoords(ptHit, ptMouse)) {
                            ptHit = ptHit2;
                        }
                    }
                    addPointToMLS(ptHit);
                }
            }
        }
    }

    function checkReadyToRun() {
        if (routesAreLoaded && appIsCreated) {
            routesKeyedList.UpdateFromNewData(routes);
            var mapEventSettings = {};
            mapEventSettings[tf.consts.mapFeatureClickEvent] = onFeatureClick;
            mapMonitor = map.AddListeners(mapEventSettings);
            urlapiApp.UpdateCurTableFooter();
        }
    }

    var itpaHost = "http://192.168.0.81/api/v1/";

    function getRemoteJSON(url, then) {
        new tf.ajax.JSONGet().Request(url, function (notification) { then(notification); });
    }

    function getGarageLineStyle(props, isHover) {
        var color = "#f00";
        var lineWidth = isHover ? 5 : 3, zindex = isHover ? 5 : 1;
        var style = { line: true, line_color: color, line_width: lineWidth, zindex: zindex };
        return isHover ? [{ line: true, line_color: "#000", line_width: 15, zindex: 3 }, { line: true, line_color: "#fff", line_width: 12, zindex: 4 }, style] : style;
    }

    function getShapeStyle(isHover, isPoint) {
        if (isPoint) {
            var circleRadius = isHover ? 4 : 3;
            var fillOpacity = isHover ? 100 : 100;
            var fillColor = isHover ? "#f00" : "#fff";
            var zindex = isHover ? 8 : 6;
            var line_color = "#fff";
            var styleCircle1 = { circle: true, circle_radius: circleRadius, line: true, line_color: line_color, fill: true, fill_color: fillColor, fill_opacity: fillOpacity, zindex: zindex + 1 };
            var styleCircle2 = { circle: true, circle_radius: circleRadius + 3, fill: true, fill_color: "#000", zindex: zindex, line: true, line_color: line_color, line_width: 1 };
            return [styleCircle2, styleCircle1];
        }
        else {
            var lineWidth = isHover ? 8 : 6, zindex = isHover ? 5 : 1;
            var color = "#000";
            var style = { line: true, line_color: color, line_width: lineWidth, zindex: zindex };
            return isHover ? [{ line: true, line_color: "#000", line_width: 15, zindex: 3 }, { line: true, line_color: "#fff", line_width: 12, zindex: 4 }, style] : style;
        }
    }


    function createShapeFeatures(shape, route, coordinatesToAppend) {
        if (shape) {
            var shapeId = shape.shapeId;
            var dirCoords = shape.coordinates;
            var shapeStyle = getShapeStyle(false, false);
            var shapeHoverStyle = getShapeStyle(true, false);
            var pointStyle = getShapeStyle(false, true);
            var pointHoverStyle = getShapeStyle(true, true);
            var shapeGeometry = {
                type: 'linestring', style: shapeStyle, hoverStyle: shapeHoverStyle,
                coordinates: dirCoords
            };
            var pointGeometry = {
                type: 'multipoint', style: pointStyle, hoverStyle: pointHoverStyle,
                coordinates: dirCoords
            };

            if (coordinatesToAppend) { coordinatesToAppend.push(dirCoords); }

            var shapeFeature = new tf.map.Feature(shapeGeometry);
            var pointFeature = new tf.map.Feature(pointGeometry);

            shapeFeature.shape = shape;
            pointFeature.shape = shape;

            var startCoords = dirCoords[0];
            var startFeatureGeometry = {
                type: 'point',
                coordinates: startCoords,
                style: { marker: true, label: "start" }
            };

            var startFeature = new tf.map.Feature(startFeatureGeometry);
            startFeature.shape = shape;

            var endCoords = dirCoords[dirCoords.length - 1];
            var endFeatureGeometry = {
                type: 'point',
                coordinates: endCoords,
                style: { marker: true, label: "end" }
            };

            var endFeature = new tf.map.Feature(endFeatureGeometry);
            endFeature.shape = shape;

            var shapeProps = {
                pointFeature: pointFeature, shapeFeature: shapeFeature, shapeId: shapeId, coordinates: dirCoords, startFeature: startFeature, endFeature: endFeature
            };

            shape.shapeProps = shapeProps;
            if (route != undefined) {
                pointFeature.route = route;
                shapeFeature.route = route;
            }
        }
    }

    function initialize() {

        showingPoints = true;

        styles = tf.GetStyles(tf.styles.GetGraphiteAPIStyleSpecifications());

        busUpdateDelay = 10000;
        stopUpdateDelay = 10000;

        var settings = {};

        //tf.helpers.LoadRoutesToFile("allRoutes");
        //tf.helpers.LoadRoutesToFile("routes2", { "95": true });

/*
GPE_PALMETTO_MMC_BBC, GPE_PALMETTO_BBC_MMC, GPE_DOLPHIN_BBC_MMC, GPE_DOLPHIN_MMC_BBC, CATS_SHUTTLE, GPE_TURNPIKE_BBC_MMC, GPE_TURNPIKE_MMC_BBC
11-Eastbound 11-Westbound
150 Miami Beach Airport Flyer-Eastbound 150 Miami Beach Airport Flyer-Westbound
212 Sweetwater Circulator-Eastbound 212 Sweetwater Circulator-Westbound
71-Northbound 71-Southbound
200 Cutler Bay Local-Clockwise
297 27th Avenue Orange MAX-Northbound 297 27th Avenue Orange MAX-Southbound
301 Dade-Monroe Express-Northbound 301 Dade-Monroe Express-Southbound
302 Card Sound Express-Northbound 302 Card Sound Express-Southbound
51 Flagler MAX-Eastbound 51 Flagler MAX-Westbound
36-Eastbound 36-Westbound
34 Busway Flyer-Northbound 34 Busway Flyer-Southbound
288 Kendall Cruiser-Eastbound 288 Kendall Cruiser-Westbound
123 South Beach Local-CntrClockwise 123 South Beach Local-Clockwise
137 West Dade Connection-Northbound 137 West Dade Connection-Southbound
238 East-West Connection-Eastbound 238 East-West Connection-Westbound
7-Eastbound 7-Westbound
24-Eastbound 24-Westbound
8-Eastbound 8-Westbound
95 Express Golden Glades-Northbound 95 Express Golden Glades-Southbound
*/

        //return ['34', '95', '123', '150', '200', '288', '297', '301', '302', '7', '8', '11', '24', '36', '51', '71', '137', '212', '238'];



        var routeIds = [/*4005926, 4005566, 4005562, 4005922, */11, 150, 212, 71, 200, 297, 301, 302, 51, 36, 34, 288, 123, 137, 238, 7, 24, 8, 95];
        //var routeIds = [7, 24, 8, 95];
        var routeIdList = {};

        for (var i in routeIds) { routeIdList['' + routeIds[i]] = true; }

        routesLoader = new tf.helpers.RouteLoader({
            loadStops: false,
            loadBuses: false,
            routeIdList: routeIdList,
            onLoaded: function (notification) {
                routesLoader = notification.sender;
                copyRoutes(notification.routes);
                //stops = notification.stops;
                shapes = notification.shapes;
                //buses = notification.buses;
                //trips = notification.trips;
                routesAreLoaded = true;
                checkReadyToRun();
            }
        });

        //copyRoutes(routes2);
        //copyRoutes(glb_routes);

        routesKeyedList = new tf.js.KeyedList({
            name: "routes",
            getKeyFromItemData: function (itemData) { return itemData.props.RouteID; },
            needsUpdateItemData: function (itemData) { return true; },
            filterAddItem: function (itemData) { return true; }
        });
        
        routesKeyedList.AddListener(tf.consts.keyedListAddedItemsEvent, function (notification) {
            for (var i in notification.items) {
                var item = notification.items[i], itemData = item.GetData();

                var directions = itemData.directions;
                var style = getRouteStyle(item, false, false), hoverStyle = getRouteStyle(item, true, false);
                var shapeStyle = getRouteStyle(item, false, true), shapeHoverStyle = getRouteStyle(item, true, true);
                var pointStyle = getRouteStyle(item, false, true, true), pointHoverStyle = getRouteStyle(item, true, true, true);
                var lineFeatures = {};

                for (var iDir in directions) {
                    var dir = directions[iDir];
                    var lineGeometry = {
                        type: 'multilinestring', style: style, hoverStyle: hoverStyle,
                        coordinates: []
                    };

                    var shapeIds = dir.shapeIds;

                    for (var iShapeId in shapeIds) {
                        var shape = shapes[shapeIds[iShapeId]];
                        createShapeFeatures(shape, item, lineGeometry.coordinates);
                    }

                    var lineFeature = new tf.map.Feature(lineGeometry);

                    lineFeatures[iDir] = { lineFeature: lineFeature, dir: iDir };
                    tf.js.SetObjProperty(lineFeature, "keyedItem", item);
                    lineFeature.route = item;
                    routesLayer.AddMapFeature(lineFeature);
                }

                tf.js.SetObjProperty(item, "lineFeatures", lineFeatures);

                //if (itemData.props.RouteID == "95") { tf.GetDebug().FileLog("created95", geometry); }
            }
        });

        var appSpecs = {
            "replaceURLParams": {
                //"lat": 25.813894,
                //"lon": -80.122650,
                //"level": 15,
                "level": 12,
                "fmap": "m2",
                "panels": "address+zoom+legend+type+measure+download+maplocation+userlocation+overview+fullscreen+source",
                "legendh": "{Cities::~Capitals:Capitals_WorldMap@wm_Capitals-120-6000;Capitals:Capitals_WorldMap@wm_Capitals-6000-15000;~Metro:Big_Cities_over_million_WorldMap@wm_Cities_Greater_900K-120-5000;Metro:Big_Cities_over_million_WorldMap@wm_Cities_Greater_900K-5000-15000;~Cities:Cities_WorldMap@wm_Cities_75K_to_900K-120-2400+wm_Cities_Greater_900K-120-2400+wm_Cities_Unknownpop-120-2400;Cities:Cities_WorldMap@wm_Cities_75K_to_900K-2400-15000+wm_Cities_Greater_900K-2400-15000+wm_Cities_Unknownpop-2400-15000;};{Hubs::~Ports:Marine_Ports_WorldMap@wm_Marine_Ports-120-360;Ports:Marine_Ports_WorldMap@wm_Marine_Ports-360-2000;~Railway:Railway_Stations_WorldMap@wm_Railway_Stations-120-240;~Airports:Airports_WorldMap@wm_Airports-120-240;};{Water::Bays:Seas_and_Bays_WorldMap@wm_Seas_Bays-120-2000;Glaciers:Glaciers_WorldMap@wm_Glacier-120-4000;~Rivers_B:Lake_and_River_contours_WorldMap@wm_Water_Poly-120-500;~Great_Lakes_L:Great_Lakes_labels_WorldMap@WM_GREAT_LAKES_NAME-120-4000;~Great_Lakes_B:Great_Lakes_contours_WorldMap@wm_Great_Lakes-120-4000;OSM-water:Lake_and_River_contours_from_Open_Street_Maps@osm_water-0-4000;};{Regions::~Admin_L:States_and_Provinces_names_labeled_WorldMap@wm_World_Admin_name-120-2000;~Admin_B:States_and_Provinces_boundaries_WorldMap@wm_World_Admin-120-2000;~Countries_L:Nation_names_labeled_WorldMap@nation_name-2000-5000;Countries_L:Nation_names_labeled_WorldMap@nation_name-5000-30000;~Countries_B:Nations_boundaries_WorldMap@wm_World_Nations-120-15000;OSM-Admin:Administrative_boundaries_from_Open_Street_Maps@osm_admin-0-60000;};{Parcels::FA-address:Addresses_from_First_American_Parcel_Data@fa_address-0-0.5;FA-owner:Property_owner_from_First_American_Parcel_Data@fa_owner-0-0.5;~lines:Property_lines,_from_First_American@fa_parcel-0-1;lines:Property_lines,_from_First_American@fa_parcel-1-2;OSM-buildings:Building_contours_from_Open_Street_Maps@osm_buildings-0-7;};{People::population:People_per_block_per_Census_2000@blk_pop-0-5;income:Aggregate_Neighborhood_Income_and_number_of_homes,_per_Census-2000@bg_mhinc-0.7-10+blkgrpy-0.7-10;};{Services::~business:Yellow_Pages@nypages-0-1.2;business:Yellow_Pages@nypages-1.2-5;food:Restaurants_from_NavTeq@nv_restrnts-0-10;doctors:Physicians_specialties@physicianspecialty-0-5;};Landmarks:Cultural_Landmarks_WorldMap@wm_Cultural_Landmarks-120-240;Utilities:Utilities_WorldMap@wm_Utilities-120-720;Environment:Hydrology@prism-0-120;~Places:Places@gnis2-0-6+hotels-0-6;Places:Places@gnis2-6-24+hotels-6-24;OSM-place-names:Place_names_labeled_from_Open_Street_Maps@osm_place_names-0-30000;{Roads::lines:Road_lines_from_NavTeq@street-0-2000;names:Road_names_labeled_from_NavTeq@street_names-0-240;~OSM-lines:Road_lines_from_Open_Street_Maps@osm_roads-0.5-7000;OSM-lines:Road_lines_from_Open_Street_Maps@osm_roads-0-0.5;~OSM-names:Road_names_labeled_from_Open_Street_Maps@osm_road_names-0-7000;~routes:Routes_WorldMap@wm_Major_Routes-120-1000+wm_Minor_Routes-120-1000;routes:Routes_WorldMap@wm_Major_Routes-1000-5000+wm_Minor_Routes-1000-5000;~railways:Railroad_WorldMap@wm_Railroad_Track-120-2000;};{Towns::~borders:Borders@incorp-0-120;~towns:Cities,_towns@wtown-0-60;};plugin_photo;",
                "legendm": "{OSM::~buildings:Building_outlines@osm_buildings-0-60;~land:Land@osm_land-0-240000;~landuse:Land_usage_information@osm_landuse-0-7000;~place_names:Names_for_country,state,city_and_other small_places@osm_place_names-0-15000;~road_names:Road_names@osm_road_names-0-240;~roads:Roads@osm_roads-0-7000;~water:Water_outlines@osm_water-0-15000;};",
                "address": "",
                "vid": "",
                "passthrough": "",
                "tflogo": "0",
                "type": "map",
                "source": "best_available",
                "rgpopup": 5,
                "help": "<span><b>Double Click</b>: Local Data Reports and Queries<br /><b>Drag</b>: Browse the map<br />Buttons: <b>Full Screen</b>, <b>Reset Rotation</b>, <b>Search Location</b>, <b>Zoom</b>, <b>Map Layers</b><br /><br />Address bar examples:<br />1 Flagler St, Miami, FL<br />Miami<br />Miami, FL<br />33139<br />25.77 -80.19 (coordinates)</span>",
            },

            "separatorStyle": { "backgroundColor": "rgba(0,107,133, 0.8)", "borderLeft": "1px solid#abebfb", "borderRight": "1px solid #00b" },

            "pageStyle": { "color": "#004" },

            "headerStyle": { "backgroundColor": "#333" },
            "contentStyle": { "backgroundColor": "#888" },
            "footerStyle": { "backgroundColor": "#333", "fontSize": "1.2em", "textShadow": "1px 1px 1px #9c9c9c", "color": "#fff" },

            "titleStyle": { "backgroundColor": "#333", "fontSize": "1.5em", "verticalAlign": "middle", "textShadow": "1px 1px 1px #9c9c9c", "color": "#fff" },

            "documentTitle": "MDT View",

            "logoBkColor": "#fff",
            "logoStyle": { "border": "1px solid #ddf" },
            "appLogoImgStr": "./image/hotel.svg",

            "routeTableStyle": { "backgroundColor": "#000" },

            "routeTableRowStyle": {
                "tf-shadow": [-2, -2, 4, "rgba(0,0,0,0.6)"],
                "textShadow": "1px 1px 1px #333",
                "border": "2px solid #fff",
                "backgroundColor": "rgba(255, 255, 255, 0.3)", "color": "#fff", "borderRadius": "8px", "margin": "4px", "padding": "4px", "width": "14em"
            },
            "routeTableRowHoverStyle": {
                "tf-shadow": [3, 3, 6, "rgba(0,0,0,0.8)"],
                "textShadow": "2px 2px 2px #000",
                "border": "2px dotted #000",
                "backgroundColor": "rgba(255, 255, 255, 0.9)", "color": "#fff", "borderRadius": "10px", "margin": "2px", "marginTop": "4px", "marginLeft": "4px", "padding": "8px", "width": "14em"
            },

            "routeTableSelectOnHover": true,
        };

        settings.onCreated = onCreated;

        settings.fullURL = {};
        settings.fullURL[tf.consts.paramNameAppSpecs] = appSpecs;
        
        settings.onAppSpecsLoaded = onAppSpecsLoaded;
        //settings.onRefresh = onRefresh;
        settings.initTables = initTables;
        settings.documentTitle = "MDT View";

        urlapiApp = new tf.urlapi.AppFromSpecs(settings);
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};


/*

    incidents:

        http://www.flhsmv.gov/fhp/traffic/crs_hb04.htm


*/