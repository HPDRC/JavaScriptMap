"use strict";

tf.apps.HotelDemo = {};

tf.apps.HotelDemo.RoutingServerURL = undefined;

tf.apps.HotelDemo.DemoPlayerWidth = 160;
tf.apps.HotelDemo.DemoPlayerHeight = tf.apps.HotelDemo.DemoPlayerWidth * 9 / 16;
tf.apps.HotelDemo.DemoLoopTime = 1600;
tf.apps.HotelDemo.MovingPointPropertyName = 'movingPoint';
tf.apps.HotelDemo.GuestPropertyName = 'guest';
tf.apps.HotelDemo.ShuttlePropertyName = 'shuttle';
tf.apps.HotelDemo.MovingPointKeyedItemName = "mpky";
tf.apps.HotelDemo.PersonRowPropsName = "pron";

tf.apps.HotelDemo.DestinationRoute = function (settings) {

    var theThis, coords, start, end, totalTime, labelStart, labelEnd, mode, totalDistance, viaIndices;

    this.GetCoords = function () { return coords; }
    this.GetStart = function () { return start; }
    this.GetEnd = function () { return end; }
    this.GetLabelStart = function () { return labelStart; }
    this.GetLabelEnd = function () { return labelEnd; }
    this.GetTotalTime = function () { return totalTime; }
    this.GetTotalDistance = function () { return totalDistance; }
    this.GetMode = function () { return mode; }
    this.GetViaIndices = function () { return viaIndices; }

    function initialize() {
        if (tf.js.GetIsValidObject(settings) && tf.js.GetLooksLikeLineStringCoords(settings.coords)) {
            coords = settings.coords;
            start = settings.start;
            end = settings.end;
            totalTime = settings.total_time;
            totalDistance = settings.total_distance;
            labelStart = settings.labelStart;
            labelEnd = settings.labelEnd;
            mode = settings.mode;
            viaIndices = settings.viaIndices;
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.apps.HotelDemo.DestinationRoutes = function (settings) {
    var theThis, currentIndex, routes, destinationCoords, destinationLabels, footDistance, bikeFootDistance, bikeChance01;

    this.OnDelete = function () { return onDelete(); }
    this.GetRandomRoute = function (callBack, optionalScope, optionalStartIndex, optionalEndIndex) { return getRandomRoute(callBack, optionalScope, optionalStartIndex, optionalEndIndex); }
    this.GetNDestinations = function () { return getNDestinations(); }
    this.GetIsValid = function () { return getIsValid(); }

    function onDelete() { destinationCoords = null; }

    function getIsValid() { return !!destinationCoords; }
    function getNDestinations() { return getIsValid() ? destinationCoords.length : 0; }

    function tryRoute(route) {
        var start = route.startIndex, end = route.endIndex;
        var startCoords = destinationCoords[start], endCoords = destinationCoords[end];
        var mode;

        if (!route.tried) {
            var distance = tf.units.GetDistanceInMetersBetweenMapCoords(startCoords, endCoords);

            route.tried = true;
            if (distance < footDistance) { mode = "foot"; }
            else if (distance < bikeFootDistance) { mode = Math.random() < bikeChance01 ? "bicycle" : "foot"; }
            else { mode = "car"; }
        }
        else {
            var nModesTried = route.modesTried.length;

            if (nModesTried == 3) { route.completed = route.failed = true; }
            else {
                switch (route.lastModeTried) {
                    case 'car': if (nModesTried == 1) { mode = 'bicycle'; } else { route.completed = route.failed = true; } break;
                    case 'foot': mode = nModesTried == 1 ? 'bicycle' : 'car'; break;
                    case 'bicycle': mode = nModesTried == 1 ? 'foot' : 'car'; break;
                }
            }
        }

        if (!route.failed) {
            route.modesTried.push(route.lastModeTried = mode);

            new tf.services.Routing({
                serverURL: tf.apps.HotelDemo.RoutingServerURL,
                findAlternatives: false,
                level: 18,
                lineStringCoords: [startCoords, endCoords], mode: mode, optionalScope: theThis,
                callBack: function (start, end, startCoords, endCoords) {
                    return function (notification) {
                        if (getIsValid()) {
                            if (tf.js.GetIsValidObject(notification)) {
                                var coords = notification.route_geometry;

                                if (tf.js.GetLooksLikeLineStringCoords(coords)) {
                                    route.completed = true;

                                    if (!!tf.apps.HotelDemo.RoutingServerURL) {
                                        switch (mode) {
                                            case 'foot':
                                                notification.route_summary.total_time *= 10;
                                                break;
                                            case 'bicycle':
                                                notification.route_summary.total_time *= 3;
                                                break;
                                        }
                                    }

                                    route.route = new tf.apps.HotelDemo.DestinationRoute({
                                        coords: coords, start: start, end: end, total_time: notification.route_summary.total_time * 1000, total_distance: notification.route_summary.total_distance,
                                        labelStart: destinationLabels[start], labelEnd: destinationLabels[end], mode: mode, viaIndices: notification.via_indices
                                    });
                                    routes[start].goodRoutes.push(route.route);
                                    for (var i in route.notifyMps) {
                                        var nmp = route.notifyMps[i]; notifyRouteLoaded(nmp.callBack, nmp.optionalScope, route.route);
                                    }
                                    route.notifyMps = [];
                                }
                            }
                            if (!route.completed) { setTimeout(function () { tryRoute(route); }, 250); }
                        }
                    }
                }(start, end, mode, startCoords, endCoords)
            });
        }
        else {
            tf.GetDebug().LogIfTest("route failed: " + destinationLabels[start] + '(' + start + ') to ' + destinationLabels[end] + '(' + end + ')');
            for (var i in route.notifyMps) { var nmp = route.notifyMps[i]; notifyRouteLoaded(nmp.callBack, nmp.optionalScope, null); }
        }
    }

    function getRandomRoute(callBack, optionalScope, optionalStartIndex, optionalEndIndex) {
        if (getIsValid() && !!tf.js.GetFunctionOrNull(callBack)) {
            var nDest = getNDestinations();
            var start = optionalStartIndex !== undefined ? tf.js.GetIntNumberInRange(optionalStartIndex, 0, nDest - 1, 0) : Math.floor(Math.random() * nDest);
            var end, foundRoute;

            if (optionalStartIndex !== undefined) {
                if (start !== optionalStartIndex) { tf.GetDebug.LogIfTest('getRandomRoute: starts differ: ' + start + ' ' + optionalStartIndex); }
            }
            else { tf.GetDebug.LogIfTest('getRandomRoute: undefined start index, using: ' + start); }

            if (optionalEndIndex !== undefined) { optionalEndIndex = tf.js.GetIntNumberInRange(optionalEndIndex, 0, nDest - 1, 0); }

            if (optionalEndIndex !== undefined && optionalEndIndex !== start) { end = optionalEndIndex; }
            else { end = Math.floor(Math.random() * nDest); if (end == start) { if (start == nDest - 1) { end = 0; } else { ++end; } } }

            var route = routes[start][end];

            if (!!route) {
                if (route.completed) {
                    if (route.failed) {
                        var goodRoutes = routes[start].goodRoutes;
                        var goodRoute = !!goodRoutes.length ? goodRoutes[Math.floor(Math.random() * goodRoutes.length)] : null;
                        //if (!!goodRoute) { tf.GetDebug().LogIfTest('got good route'); }
                        notifyRouteLoaded(callBack, optionalScope, goodRoute);
                    }
                    else {
                        notifyRouteLoaded(callBack, optionalScope, route.route);
                    }
                }
                else {
                    route.notifyMps.push({ callBack: callBack, optionalScope: optionalScope });
                    if (!route.tried) { tryRoute(route); }
                }
            }
        }
    }

    function notifyRouteLoaded(callBack, optionalScope, route) {
        setTimeout(function () { callBack.call(optionalScope, { sender: theThis, route: route }); }, 100);
    }

    function createRouteObj(startIndex, endIndex) {
        return {
            notifyMps: [], completed: false, tried: false, failed: false,
            startIndex: startIndex, endIndex: endIndex, route: null, modesTried: [], lastModeTried: ""
        };
    }

    function initialize() {
        if (tf.js.GetIsValidObject(settings) && tf.js.GetLooksLikeLineStringCoords(settings.destinationCoords)) {
            var defaultFootDistance = 500, defaultBikeFootDistance = 2000, defaultBikeChance01 = 0.4;

            destinationCoords = settings.destinationCoords;
            if (!(tf.js.GetIsValidObject(destinationLabels = settings.destinationLabels))) { destinationLabels = []; }
            footDistance = tf.js.GetFloatNumberInRange(settings.footDistance, 0, 10000, defaultFootDistance);
            bikeFootDistance = tf.js.GetFloatNumberInRange(settings.bikeFootDistance, footDistance, 100000, defaultBikeFootDistance);
            bikeChance01 = tf.js.GetFloatNumberInRange(settings.bikeChance01, 0, 1, defaultBikeChance01);

            var nDests = destinationCoords.length;

            routes = [];

            for (var i = 0 ; i < nDests ; ++i) {
                routes[i] = [];
                routes[i].goodRoutes = [];
                for (var j = 0 ; j < nDests ; ++j) { routes[i].push(createRouteObj(i, j)); }
            }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.apps.HotelDemo.MovingPoint = function (settings) {

    var theThis, pointFeature, routeFeature, startTime, startIndex, endIndex, coords, destinationRoutes, newRouteRequested, notifyStartRoute,
        routeTime, loopTime, label, labelStart, labelEnd, nRoutes, nRoutesAway, layer, mode, alwaysHover, isDeleted, index, keyedItem, route, showingRouteFeature,
        getAnimationTime, requestNewRouteCallBack, isGoingHome, inShuttle, wasLastInShuttle, nShuttleStops, stopEnteredShuttle;

    this.IncNShuttleStops = function () { ++nShuttleStops; }
    this.GetNShuttleStops = function () { return nShuttleStops; }
    this.WasLastInShuttle = function () { return !!wasLastInShuttle; }
    this.IsInShuttle = function () { return !!inShuttle; }
    this.GetStopEnteredShuttle = function () { return stopEnteredShuttle; }
    this.TakeShuttle = function (shuttle, stopEnteredShuttleSet) {
        nShuttleStops = 0;
        if (!!(inShuttle = shuttle)) {
            var shuttleCoords = inShuttle.GetPointCoords();
            destroyRouteFeature();
            doRefreshMapFeature([shuttleCoords], 'foot');
            wasLastInShuttle = true;
            nRoutesAway++;
            nRoutes++;
            stopEnteredShuttle = stopEnteredShuttleSet;
        }
        else { }
    }

    this.SetIsGoingHome = function (bool) { isGoingHome = !!bool; }
    this.GetIsGoingHome = function () { return !!isGoingHome; }

    this.GetPointFeature = function () { return pointFeature; }

    this.ShowRoute = function (bool) { return showRoute(bool); }
    this.IsShowingRoute = function () { return showingRouteFeature; }

    this.GetCurRoute = function () { return route; }
    this.GetNRoutes = function () { return nRoutes; }
    this.GetNRoutesAway = function () { return nRoutesAway; }
    this.GetRouteStartIndex = function () { return startIndex; }
    this.SetRouteStartIndex = function (startIndexSet) { if ((startIndex = startIndexSet) == 0) { nRoutesAway = 0; } }
    this.RequestNewRoute = function () { return requestNewRoute(); }

    this.GetKeyedItem = function () { return keyedItem; }

    this.GetIndex = function () { return index; }
    this.GetLabel = function () { return label; }

    this.OnDelete = function () { return onDelete(); }
    this.GetIsDeleted = function () { return isDeleted; }

    this.SetAlwaysHover = function (bool) { return setAlwaysHover(bool); }
    this.GetAlwaysHover = function () { return alwaysHover }

    this.UpdatePosition = function () { return updatePosition(); }

    this.GetPointCoords = function () { return (!isDeleted && !!pointFeature) ? pointFeature.GetPointCoords() : null; }

    this.SetPointCoords = function (coords, mode) { return doRefreshMapFeature([coords], mode); }

    this.AnimatedCenterOnMap = function (map) {
        if (!isDeleted && tf.js.GetMapFrom(map)) {
            if (!!pointFeature) { map.AnimatedSetCenterIfDestVisible(pointFeature.GetPointCoords()); }
        }
    }

    this.CenterOnMap = function (map) {
        if (!isDeleted && tf.js.GetMapFrom(map)) {
            if (!!pointFeature) { map.SetCenter(pointFeature.GetPointCoords()); }
        }
    }

    function onDelete() {
        if (!isDeleted) {
            isDeleted = true;
            if (showingRouteFeature) { showRoute(false); }
            if (!!pointFeature) { if (!!layer) { layer.DelMapFeature(pointFeature); layer = null; } pointFeature = null; }
            //coords = null;
        }
    }

    function updatePosition() {
        if (!isDeleted) {
            if (!!inShuttle) {
                var pointCoords = inShuttle.GetPointCoords();
                if (!!pointCoords) {
                    pointFeature.SetPointCoords(pointCoords);
                }
            }
            else if ((!!coords) && (!newRouteRequested)) {
                var offTime = getAnimationTime() - startTime, pos;

                if (offTime < loopTime) {
                    var time01 = tf.units.EaseInAndOut(offTime / loopTime);
                    var indexFloat = coords.length * time01;
                    var index = Math.floor(indexFloat);
                    indexFloat -= index;
                    indexFloat = tf.units.EaseInAndOut(indexFloat);
                    var nextIndex = index == coords.length - 1 ? index : index + 1;
                    var thisCoord = coords[index], nextCoord = coords[nextIndex];
                    pos = [
                        thisCoord[0] + (nextCoord[0] - thisCoord[0]) * indexFloat,
                        thisCoord[1] + (nextCoord[1] - thisCoord[1]) * indexFloat
                    ];
                }
                else { pos = coords[coords.length - 1]; startIndex = endIndex; requestNewRoute(); }
                if (!!pointFeature) { pointFeature.SetPointCoords(pos); }
            }
        }
    }

    function setAlwaysHover(bool) { if (alwaysHover != (bool = !!bool)) { alwaysHover = bool; if (pointFeature) { pointFeature.RefreshStyle(); } } }

    function doGetStyle(mapFeature, isHover) {
        var snaptopixel = true;
        var iconSrc = tf.js.GetIsValidObject(settings.iconSrcs) ? settings.iconSrcs[mode] : null;
        var willHover = isHover || alwaysHover;
        var startZIndex = willHover ? 20 : 10;
        var pointStyle = [{
            circle: true, circle_radius: 12, line: true, line_color: "#960", line_opacity: 100, line_width: 2, zindex: startZIndex + 0, snaptopixel: snaptopixel
        }, {
            circle: true, circle_radius: 11, line: true, line_color: "#000", line_opacity: 80, line_width: 1, zindex: startZIndex + 1, snaptopixel: snaptopixel, fill: true, fill_color: "#fff", fill_opacity: 70
        }];

        if (!!iconSrc) {
            pointStyle.push({
                icon: true, icon_img: iconSrc.image, icon_anchor: iconSrc.anchor, scale: 1, icon_size: iconSrc.size, snaptopixel: snaptopixel, zindex: startZIndex + 2
            });
        }

        if (willHover) {
            pointStyle.push({
                marker: true, label: label, zindex: startZIndex + 3, marker_color: "#3399ff", marker_verpos: "top", marker_horpos: "right", marker_opacity: 80, line: true, "font_height": 14, font_color: "#fff",
                border_color: "#f00"
            });
        }
        return pointStyle;
    }

    function getStyle(mapFeature) { return doGetStyle(mapFeature, false); }
    function getHoverStyle(mapFeature) { return doGetStyle(mapFeature, true); }

    var routeFeatureInLayer;

    function addRouteFeatureToLayer() {
        if (!!layer) {
            if (!!routeFeature) { if (!routeFeatureInLayer) { layer.AddMapFeature(routeFeature); routeFeatureInLayer = true; } }
        }
    }

    function delRouteFeatureFromLayer() {
        if (!!layer) {
            if (!!routeFeature) { if (routeFeatureInLayer) { layer.DelMapFeature(routeFeature); routeFeatureInLayer = false; } }
        }
    }

    function showRoute(bool) {
        if (showingRouteFeature != (bool = !!bool)) {
            if (showingRouteFeature = bool) {
                if (!routeFeature) { createRouteFeature(); }
                addRouteFeatureToLayer();
            }
            else { delRouteFeatureFromLayer(); }
        }
    }

    function destroyRouteFeature() {
        if (!!routeFeature) {
            delRouteFeatureFromLayer();
            routeFeature = null;
        }
    }

    function createRouteFeature() {
        if (!inShuttle) {
            var routeStyle = [{ line: true, line_width: 9, line_color: "#c00", zindex: 0, snaptopixel: false }, {
                line: true, line_width: 2, line_color: "#fff", zindex: 1, line_dash: [16, 4], snaptopixel: false
            }];
            routeFeature = new tf.map.Feature({ type: "linestring", coordinates: coords, style: routeStyle });
        }
    }

    function refreshRouteFeature() {
        var isShowingRoute = showingRouteFeature;
        if (showingRouteFeature) {
            showRoute(false);
            createRouteFeature();
            showRoute(true);
        }
        else if (!!routeFeature) {
            destroyRouteFeature();
        }
    }

    function doRefreshMapFeature(coords, modeSet) {
        if (!!coords) {
            mode = modeSet;
            if (!!pointFeature) {
                if (!!layer) { layer.DelMapFeature(pointFeature); }
                pointFeature.SetPointCoords(coords[0]);
                pointFeature.RefreshStyle();
            }
            else {
                pointFeature = new tf.map.Feature({ type: "point", coordinates: coords[0], style: getStyle, hoverStyle: getHoverStyle });
                tf.js.SetObjProperty(pointFeature, tf.apps.HotelDemo.MovingPointKeyedItemName, keyedItem);
                tf.js.SetObjProperty(pointFeature, tf.apps.HotelDemo.MovingPointPropertyName, theThis);
            }
            if (!!layer) { layer.AddMapFeature(pointFeature); }
        }
    }

    function refreshMapFeature() { doRefreshMapFeature(coords, mode); }

    function startRoute(routeSet) {
        if (!isDeleted) {
            if (!routeSet) { tf.GetDebug().LogIfTest('MovingPoint: starting invalid route'); }

            newRouteRequested = false;

            route = routeSet;

            var distance = route.GetTotalDistance();
            routeTime = route.GetTotalTime();
            var speed = tf.units.GetKMHToMPH(distance / routeTime * 3600 / 1000);

            nRoutes++;

            //tf.GetDebug().LogIfTest('route# ' + nRoutes);

            startTime = getAnimationTime();

            if (nRoutes == 1) { startTime -= (Math.random() * 0.5) * routeTime; }

            mode = route.GetMode();
            startIndex = route.GetStart();

            if (startIndex == 0) { nRoutesAway = 0; } else { ++nRoutesAway; }

            endIndex = route.GetEnd();
            coords = route.GetCoords();
            loopTime = routeTime;
            labelStart = route.GetLabelStart();
            labelEnd = route.GetLabelEnd();
            if (!!notifyStartRoute) { notifyStartRoute({ sender: theThis, route: route }); }
            refreshMapFeature();
            refreshRouteFeature();
        }
    }

    function onRouteNotified(routeSet) {
        if (!isDeleted) {
            newRouteRequested = false;
            if (tf.js.GetIsValidObject(routeSet)) { startRoute(routeSet); wasLastInShuttle = false; }
            else { setTimeout(requestNewRoute, 250); }
        }
    }

    function onRouteLoaded(notification) {
        var routeSet = (tf.js.GetIsValidObject(notification) && tf.js.GetIsValidObject(notification.route)) ? notification.route : null;
        if (!!routeSet && !!isGoingHome) { nRoutesAway = 0; }
        onRouteNotified(routeSet);
    }

    function doRequestNewRoute(dummyNotification) {
        var random = Math.random(), goHome;

        switch (nRoutesAway) {
            case 0: goHome = false; break;
            case 1: goHome = random < 0.33; break;
            case 2: goHome = random < 0.5; break;
            case 3: goHome = random < 0.67; break;
            default: goHome = random < 0.9; break;
        }

        isGoingHome = goHome;

        var endIndexUse = !!goHome ? 0 : undefined;

        destinationRoutes.GetRandomRoute(onRouteLoaded, theThis, startIndex, endIndexUse);
    }

    function requestNewRoute() {
        if (!newRouteRequested) {
            newRouteRequested = true;
            //mode = 'foot'; refreshMapFeature();
            requestNewRouteCallBack({ sender: theThis, setRoute: onRouteNotified });
        }
    }

    function defaultGetAnimationTime() { return Date.now(); }

    function initialize() {
        showingRouteFeature = false;
        isDeleted = false;
        label = tf.js.GetNonEmptyString(settings.label, "");
        startIndex = settings.startIndex;
        destinationRoutes = settings.destinationRoutes;
        notifyStartRoute = tf.js.GetFunctionOrNull(settings.onStartRoute);
        if (!(requestNewRouteCallBack = tf.js.GetFunctionOrNull(settings.requestNewRoute))) { requestNewRouteCallBack = doRequestNewRoute; }
        //requestNewRouteCallBack = doRequestNewRoute;
        if (!(getAnimationTime = tf.js.GetFunctionOrNull(settings.getAnimationTime))) { getAnimationTime = defaultGetAnimationTime; }
        if (settings.keyedList) { keyedItem = settings.keyedList.AddOrGetItem(theThis); }
        layer = settings.layer;
        nShuttleStops = 0;
        nRoutes = 0;
        nRoutesAway = 0;
        alwaysHover = false;
        index = settings.index;
        requestNewRoute();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.apps.HotelDemo.MovingPoints = function (settings) {
    var theThis, isDeleted, movingPoints, nPointsCreated, nPointsToCreate, destinationRoutes, creatingPoints, layer, iconSrcs, getLabel, notifyCreated,
        onStartRoute, getAnimationTime, keyedList, requestNewPersonRoute;

    this.OnDelete = function (cleanUpCallBack) { return onDelete(cleanUpCallBack); }
    this.UpdatePositions = function () { if (!isDeleted) { for (var i in movingPoints) { var mp = movingPoints[i]; mp.UpdatePosition(); } } }

    function onDelete(cleanUpCallBack) {
        if (!isDeleted) {
            clearPoints(cleanUpCallBack);
            isDeleted = true;
        }
    }

    function clearPoints(cleanUpCallBack) {
        if (!isDeleted) {
            cleanUpCallBack = tf.js.GetFunctionOrNull(cleanUpCallBack);
            for (var i in movingPoints) {
                var mp = movingPoints[i]; if (!!mp) { if (!!cleanUpCallBack) { cleanUpCallBack(mp); } mp.OnDelete(); }
            }
            movingPoints = null; nPointsCreated = 0;
        }
    }

    function getDefaultLabel(index) { return '#' + (index + 1) + ' ' + tf.helpers.GetRandomFirstLastName(); }

    function createPoint() {

        if (!isDeleted) {
            if (nPointsCreated < nPointsToCreate) {
                if (!movingPoints) { movingPoints = []; }
                var randVal = Math.random();
                var index = movingPoints.length;
                var label = getLabel(index);
                var mp = new tf.apps.HotelDemo.MovingPoint({
                    keyedList: keyedList,
                    iconSrcs: iconSrcs,
                    destinationRoutes: destinationRoutes,
                    startIndex: 0,
                    layer: layer,
                    label: label,
                    index: index,
                    onStartRoute: onStartRoute,
                    requestNewRoute: requestNewPersonRoute,
                    getAnimationTime: getAnimationTime
                });

                movingPoints.push(mp);

                if (!!notifyCreated) { setTimeout(function () { notifyCreated({ sender: theThis, point: mp }); }, 100); }

                if (++nPointsCreated < nPointsToCreate) {
                    var timeOut = Math.floor(Math.random() * 100) + 10;
                    setTimeout(createPoint, timeOut);
                }
            }
        }
    }

    function createPoints(number) {
        nPointsToCreate = tf.js.GetIntNumberInRange(number, 0, 10000, 200);
        createPoint();
    }

    function initialize() {
        if (!(isDeleted = (!tf.js.GetIsValidObject(settings)) || !tf.js.GetIsInstanceOf(settings.destinationRoutes, tf.apps.HotelDemo.DestinationRoutes))) {
            destinationRoutes = settings.destinationRoutes;
            layer = settings.layer;
            iconSrcs = settings.iconSrcs;
            if (!(getLabel = tf.js.GetFunctionOrNull(settings.getLabel))) { getLabel = getDefaultLabel; }
            notifyCreated = tf.js.GetFunctionOrNull(settings.onPointCreated);
            onStartRoute = tf.js.GetFunctionOrNull(settings.onStartRoute);
            getAnimationTime = tf.js.GetFunctionOrNull(settings.getAnimationTime);
            requestNewPersonRoute = tf.js.GetFunctionOrNull(settings.requestNewRoute);
            keyedList = settings.keyedList;
            nPointsCreated = 0;
            createPoints(settings.nPoints);
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.apps.HotelDemo.Shuttle = function (settings) {

    var theThis, pointFeature, startTime, coords, notifyStartRoute, route, lastIndex, totalPauseTime, timeEndPause, isPaused, notifyStop,
        routeTime, loopTime, label, nRoutes, layer, map, alwaysHover, isDeleted, index, keyedItem, getAnimationTime, stops, routeName, lastPauseStop, guests;

    this.SetGuests = function (guestsSet) { guests = guestsSet; }
    this.GetGuests = function () { return guests; }

    this.GetPointFeature = function () { return pointFeature; }
    this.GetPointCoords = function () { return !!pointFeature ? pointFeature.GetPointCoords() : null; }

    this.GetRouteName = function () { return routeName; }

    this.GetNRoutes = function () { return nRoutes; }

    this.GetKeyedItem = function () { return keyedItem; }

    this.GetIndex = function () { return index; }
    this.GetLabel = function () { return label; }

    this.OnDelete = function () { return onDelete(); }
    this.GetIsDeleted = function () { return isDeleted; }

    this.SetAlwaysHover = function (bool) { return setAlwaysHover(bool); }
    this.GetAlwaysHover = function () { return alwaysHover }

    this.UpdatePosition = function () { return updatePosition(); }

    this.AnimatedCenterOnMap = function (map) {
        if (!isDeleted && tf.js.GetMapFrom(map)) {
            if (!!pointFeature) { map.AnimatedSetCenterIfDestVisible(pointFeature.GetPointCoords()); }
        }
    }

    this.CenterOnMap = function (map) {
        if (!isDeleted && tf.js.GetMapFrom(map)) {
            if (!!pointFeature) { map.SetCenter(pointFeature.GetPointCoords()); }
        }
    }

    this.GetIsPaused = function () { return isPaused; }
    this.GetLastPauseStop = function () { return lastPauseStop; }

    this.GetStop = function (stopIndex) { return stops[stopIndex + '']; }

    function onDelete() {
        if (!isDeleted) {
            isDeleted = true;
            if (!!pointFeature) { if (!!layer) { layer.DelMapFeature(pointFeature); layer = null; } pointFeature = null; }
        }
    }

    function getIsLight() { return index % 2 == 0; }

    function makeStop(stopIndex, isStop) {
        lastPauseStop = stops[stopIndex + ''];
        if (!!map) {
            var color = getIsLight() ? "#39f" : "#00c";
            new tf.map.PointsStyleAnimator({
                maps: [map], pointProviders: [pointFeature.GetPointCoords()], duration: 5000,
                getStyle: function (elapsed01) {
                    var radius = 20 + Math.pow(elapsed01, 1 / 2) * 16;
                    var opacity = 1 - Math.pow(elapsed01, 2);
                    var line_width = (2 - elapsed01);
                    var drawOpacity = opacity * 50;
                    var flashStyle = {
                        circle: true, circle_radius: radius, snapToPixel: false,
                        line: true, line_width: line_width, line_color: color, line_opacity: drawOpacity
                    };
                    return flashStyle;
                }
            });
        }
        if (!!notifyStop) {
            notifyStop({ sender: theThis, stopIndex: stopIndex, isStop: isStop, stop: stops[stopIndex + ''] });
        }
    }

    var stopPauseTime = 60000;

    function getCoordsIndexForTime(offTime) {
        var time01 = tf.units.EaseInAndOut(offTime / loopTime) * 0.9999;
        var indexFloat = coords.length * time01;
        var index = Math.floor(indexFloat);
        return { time01: time01, indexFloat: indexFloat, index: index };
    }

    function updatePosition() {
        if (!!coords) {
            if (!isDeleted) {
                var animationTime = getAnimationTime();

                if (isPaused) {
                    if (!(isPaused = (animationTime < timeEndPause))) {
                        makeStop(lastIndex, false);
                        startTime += stopPauseTime;
                    }
                }
                if (!isPaused) {
                    var offTime = animationTime - startTime, pos;

                    if (offTime < loopTime) {
                        var ci = getCoordsIndexForTime(offTime);
                        var time01 = ci.time01;
                        var indexFloat = ci.indexFloat;
                        var index = ci.index;
                        var didStop;

                        if (index != lastIndex) {
                            for (var i = lastIndex + 1 ; i <= index && !didStop ; ++i) {
                                if (isStop(i)) {
                                    isPaused = true;
                                    makeStop(i, true);
                                    lastIndex = i;
                                    didStop = true;
                                }
                            }
                            if (!didStop) {
                                lastIndex = index;
                            }
                        }

                        if (didStop) {
                            isPaused = true;
                            timeEndPause = animationTime + stopPauseTime;
                            totalPauseTime += stopPauseTime;
                            pos = coords[lastIndex];
                        }
                        else {
                            indexFloat -= index;
                            indexFloat = tf.units.EaseInAndOut(indexFloat);

                            var nextIndex = index == coords.length - 1 ? index : index + 1;

                            var thisCoord = coords[index], nextCoord = coords[nextIndex];
                            pos = [
                                thisCoord[0] + (nextCoord[0] - thisCoord[0]) * indexFloat,
                                thisCoord[1] + (nextCoord[1] - thisCoord[1]) * indexFloat
                            ];
                        }
                    }
                    else { pos = coords[coords.length - 1]; startRoute(); }
                    if (!!pointFeature) { pointFeature.SetPointCoords(pos); }
                }
            }
        }
    }

    function setAlwaysHover(bool) { if (alwaysHover != (bool = !!bool)) { alwaysHover = bool; if (pointFeature) { pointFeature.RefreshStyle(); } } }

    function doGetStyle(mapFeature, isHover) {
        var snaptopixel = true;
        var iconSrc = tf.js.GetIsValidObject(settings.iconSrcs) ? settings.iconSrcs["bus"] : null;
        var willHover = isHover || alwaysHover;
        var startZIndex = willHover ? 40 : 30;
        var color = getIsLight() ? "#39f" : "#00c";
        var pointStyle = [{
            circle: true, circle_radius: 20, line: true, line_color: color, line_opacity: 100, line_width: 2, zindex: startZIndex + 0, snaptopixel: snaptopixel
        }, {
            circle: true, circle_radius: 19, line: true, line_color: "#000", line_opacity: 80, line_width: 1, zindex: startZIndex + 1, snaptopixel: snaptopixel, fill: true, fill_color: "#fff", fill_opacity: 70
        }];

        if (!!iconSrc) {
            pointStyle.push({
                icon: true, icon_img: iconSrc.image, icon_anchor: iconSrc.anchor, scale: 0.09, icon_size: iconSrc.size, snaptopixel: snaptopixel, zindex: startZIndex + 2
            });
        }

        if (willHover) {
            pointStyle.push({
                marker: true, label: label, zindex: startZIndex + 3, marker_color: "#3399ff", marker_verpos: "top", marker_horpos: "right", marker_opacity: 80, line: true, "font_height": 14, font_color: "#fff",
                border_color: "#f00"
            });
        }
        return pointStyle;
    }

    function getStyle(mapFeature) { return doGetStyle(mapFeature, false); }
    function getHoverStyle(mapFeature) { return doGetStyle(mapFeature, true); }

    function refreshMapFeature() {
        if (!!pointFeature) { if (!!layer) { layer.DelMapFeature(pointFeature); } }
        pointFeature = new tf.map.Feature({ type: "point", coordinates: coords[0], style: getStyle, hoverStyle: getHoverStyle });
        tf.js.SetObjProperty(pointFeature, tf.apps.HotelDemo.MovingPointKeyedItemName, keyedItem);
        tf.js.SetObjProperty(pointFeature, tf.apps.HotelDemo.MovingPointPropertyName, theThis);
        if (!!layer) { layer.AddMapFeature(pointFeature); }
    }

    function startRoute() {
        if (!isDeleted) {
            nRoutes++;
            lastIndex = -1;
            startTime = getAnimationTime();
            totalPauseTime = 0;
            isPaused = false;
            loopTime = routeTime;
            if (!!notifyStartRoute) { notifyStartRoute({ sender: theThis, route: route }); }
            refreshMapFeature();
        }
    }

    function defaultGetAnimationTime() { return Date.now(); }

    function isStop(routeIndex) { return stops[routeIndex + '']; }

    function initRoute() {
        if (tf.js.GetIsValidObject(route)) {
            routeTime = route.GetTotalTime();
            coords = route.GetCoords();
            startRoute();
            startTime -= (routeTime - settings.startTime);
            var co = getCoordsIndexForTime(startTime);
            lastIndex = co.index - 1;
            for (var i = 0; i < lastIndex ; ++i) {
                if (isStop(i)) {
                    lastPauseStop = stops[i]; break;
                }
            }
        }
        else { isDeleted = true; }
    }

    function initialize() {
        isDeleted = false;
        label = tf.js.GetNonEmptyString(settings.label, "");
        notifyStartRoute = tf.js.GetFunctionOrNull(settings.onStartRoute);
        notifyStop = tf.js.GetFunctionOrNull(settings.onStop);
        if (!(getAnimationTime = tf.js.GetFunctionOrNull(settings.getAnimationTime))) { getAnimationTime = defaultGetAnimationTime; }
        if (settings.keyedList) { keyedItem = settings.keyedList.AddOrGetItem(theThis); }
        if (!!(layer = settings.layer)) { map = layer.GetMap(); }
        stops = settings.stops,
        nRoutes = 0;
        alwaysHover = false;
        index = settings.index;
        route = settings.route;
        routeName = settings.routeName;
        if (!tf.js.GetIsValidObject(stops = settings.stops)) { stops = {}; }
        initRoute();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.apps.HotelDemo.Shuttles = function (settings) {
    var theThis, isDeleted, movingPoints, nPairsCreated, nShuttlePairs, creatingPoints, layer, iconSrcs, getLabel, notifyCreated, onStop,
        onStartRoute, getAnimationTime, route, invertRoute, invertedRoute, totalTime, timeBetweenTwos, invertedStops, stops,
        invertedRouteName, routeName, keyedList;

    this.OnDelete = function (cleanUpCallBack) { return onDelete(cleanUpCallBack); }
    this.UpdatePositions = function () { if (!isDeleted) { for (var i in movingPoints) { var mp = movingPoints[i]; mp.UpdatePosition(); } } }

    function onDelete(cleanUpCallBack) { if (!isDeleted) { clearPoints(cleanUpCallBack); isDeleted = true; } }

    function clearPoints(cleanUpCallBack) {
        if (!isDeleted) {
            cleanUpCallBack = tf.js.GetFunctionOrNull(cleanUpCallBack);
            for (var i in movingPoints) { var mp = movingPoints[i]; if (!!mp) { if (!!cleanUpCallBack) { cleanUpCallBack(mp); } mp.OnDelete(); } }
            movingPoints = null; nPairsCreated = 0;
        }
    }

    function getDefaultLabel(index) { return '#' + (index + 1) + ' ' + tf.helpers.GetRandomFirstLastName(); }

    function createPoint(startTime) {
        if (!isDeleted) {
            var routeUse = invertRoute ? invertedRoute : route;
            var stopsUse = invertRoute ? invertedStops : stops;
            var routeNameUse = invertRoute ? invertedRouteName : routeName;
            if (!movingPoints) { movingPoints = []; }
            var randVal = Math.random();
            var index = movingPoints.length;
            var label = getLabel(index);
            var mp = new tf.apps.HotelDemo.Shuttle({
                keyedList: keyedList,
                startTime: startTime,
                route: routeUse,
                routeName: routeNameUse,
                stops: stopsUse,
                iconSrcs: iconSrcs,
                layer: layer,
                label: label,
                index: index,
                onStartRoute: onStartRoute,
                onStop: onStop,
                //getAnimationTime: function () { return getAnimationTime() - startTime }
                getAnimationTime: getAnimationTime
            });

            invertRoute = !invertRoute;

            movingPoints.push(mp);

            if (!!notifyCreated) { setTimeout(function () { notifyCreated({ sender: theThis, point: mp }); }, 100); }
        }
    }

    function createPointPairs() {
        for (nPairsCreated = 0 ; nPairsCreated < nShuttlePairs; ++nPairsCreated) {
            //createPoint(nPairsCreated * timeBetweenTwos);
            createPoint(nPairsCreated * timeBetweenTwos);
            createPoint((nPairsCreated + 0.5) * timeBetweenTwos);
        }
    }

    function initialize() {
        if (!(isDeleted = !tf.js.GetIsValidObject(settings))) {
            layer = settings.layer;
            iconSrcs = settings.iconSrcs;
            if (!(getLabel = tf.js.GetFunctionOrNull(settings.getLabel))) { getLabel = getDefaultLabel; }
            notifyCreated = tf.js.GetFunctionOrNull(settings.onPointCreated);
            onStartRoute = tf.js.GetFunctionOrNull(settings.onStartRoute);
            onStop = tf.js.GetFunctionOrNull(settings.onStop);
            getAnimationTime = tf.js.GetFunctionOrNull(settings.getAnimationTime);
            keyedList = settings.keyedList;
            route = settings.route,
            invertedRoute = settings.invertedRoute;
            stops = settings.stops;
            invertedStops = settings.invertedStops;
            routeName = settings.routeName;
            invertedRouteName = settings.invertedRouteName;
            nPairsCreated = 0;
            invertRoute = false;
            totalTime = settings.totalTime;
            nShuttlePairs = tf.js.GetIntNumberInRange(settings.nShuttlePairs, 0, 10000, 200);
            timeBetweenTwos = (settings.totalTime / nShuttlePairs);
            createPointPairs();
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.apps.HotelDemo.Settings = function (settings) {

    var theThis, styles, formContainer, formContainerElem, nFloorsRadios, nRoomsRadios, optionsChecks, preserveHotelPositionCheck,
        preserveHotelPosition, panelContainer, panelContainerElem, allContainer, allContainerElem, speedRadios, onAnimationSpeedCallBack,
        nRoomsPerFloor, nFloors, nShuttlePairs, nShuttlePairsRadios, playPauseButton;

    var preserveHotelPositionStr = "Preserve Hotel Position";
    var timeRealStr = "Real Time";
    var time10xStr = "10x";
    var time100xStr = "100x";

    this.SetIsPaused = function (bool) { if (!!playPauseButton) { playPauseButton.SetIsToggled(bool); } }

    this.OnToggle = function () { return onToggle(); }

    this.GetSelection = function () {
        return { nRoomsPerFloor: nRoomsPerFloor, nFloors: nFloors, nShuttlePairs: nShuttlePairs, preserveHotelPosition: preserveHotelPosition };
    }

    function onToggle() { tf.dom.ToggleDisplayBlockNone(formContainer); }

    function onNRoomsChanged(notification) { nRoomsPerFloor = parseInt(notification, 10); }
    function onNFloorsChanged(notification) { nFloors = parseInt(notification, 10); }
    function onNShuttlePairsChanged(notification) { nShuttlePairs = parseInt(notification, 10) / 2; }

    function onOptionChanged(notification) {
        switch (notification) {
            case preserveHotelPositionStr:
                preserveHotelPositionCheck.SetIsChecked(preserveHotelPosition = !preserveHotelPosition);
                break;
        }
    }

    function onAnimationSpeedChanged(notification) {
        if (!!onAnimationSpeedCallBack) {
            var speed;
            switch (notification) {
                default: case timeRealStr: speed = 1; break;
                case time10xStr: speed = 10; break;
                case time100xStr: speed = 100; break;
            }
            onAnimationSpeedCallBack(speed);
        }
    }

    function initialize() {
        styles = tf.GetStyles();

        preserveHotelPosition = true;

        var onAnimationPlayPauseCallBack;

        if (tf.js.GetIsValidObject(settings)) {
            onAnimationSpeedCallBack = tf.js.GetFunctionOrNull(settings.onAnimationSpeedChange);
            onAnimationPlayPauseCallBack = tf.js.GetFunctionOrNull(settings.onAnimationPlayPause);
        } else { settings = {} ; }

        allContainer = new tf.dom.Div({ cssClass: tf.GetStyles().unPaddedBlockDivClass });
        allContainerElem = allContainer.GetHTMLElement();

        formContainer = new tf.dom.Div({ cssClass: styles.inputFormClass });
        formContainerElem = formContainer.GetHTMLElement();

        panelContainer = new tf.dom.Div({ cssClass: styles.inputFormClass });
        panelContainerElem = panelContainer.GetHTMLElement();

        var checkedOptions = {};

        checkedOptions[preserveHotelPositionStr] = true;

        var nFloorsSelections = [["1", "One floor"], ["20", "20 floors"], ["50", "50 floors"]];
        var nRoomsSelections = [["1", "One room per floor"], ["10", "10 rooms per floor"], ["20", "20 rooms per floor"]];
        var nShuttlePairsSelections = [["0", "No Shuttles"], ["2", "Two Shuttles"], ["4", "Four Shuttles"], ["6", "Six Shuttles"]];
        var optionsChecksSelections = [[preserveHotelPositionStr, "Uncheck to move the hotel to the current center of the map"]];

        var divFloors, divRooms, divShuttles, divOptions;

        panelContainerElem.style.textAlign = formContainerElem.style.textAlign = "center";

        var defaultNRoomsPerFloor = 10, defaultNFloors = 20;

        switch (nRoomsPerFloor = tf.js.GetIntNumberInRange(settings.nroomsperfloor, 1, 20, defaultNRoomsPerFloor)) {
            case 1: case 10: case 20: break; default: nRoomsPerFloor = defaultNRoomsPerFloor;
        }
        switch (nFloors = tf.js.GetIntNumberInRange(settings.nfloors, 1, 50, defaultNFloors)) {
            case 1: case 20: case 50: break; default: nFloors = defaultNFloors;
        }
        nShuttlePairs = tf.js.GetIntNumberInRange(settings.nshuttlepairs, 0, 3, 3);

        (divFloors = new tf.dom.Div({ cssClass: tf.GetStyles().paddedBlockDivClass })).AddContent("Floors: ",
            nFloorsRadios = new tf.ui.RadioOrCheckListFromData({
                isRadioList: true, onClick: onNFloorsChanged, data: nFloorsSelections, isInline: true, noSeparators: true,
                selRadioName: nFloors.toString()
            }));

        (divRooms = new tf.dom.Div({ cssClass: tf.GetStyles().unPaddedBlockDivClass })).AddContent("Rooms: ",
            nRoomsRadios = new tf.ui.RadioOrCheckListFromData({
                isRadioList: true, onClick: onNRoomsChanged, data: nRoomsSelections, isInline: true, noSeparators: true,
                selRadioName: nRoomsPerFloor.toString()
            }));

        (divShuttles = new tf.dom.Div({ cssClass: tf.GetStyles().unPaddedBlockDivClass })).AddContent("Shuttles: ",
            nShuttlePairsRadios = new tf.ui.RadioOrCheckListFromData({
                isRadioList: true, onClick: onNShuttlePairsChanged, data: nShuttlePairsSelections, isInline: true, noSeparators: true,
                selRadioName: (2 * nShuttlePairs).toString()
            }));

        (divOptions = new tf.dom.Div({ cssClass: tf.GetStyles().unPaddedBlockDivClass })).AddContent(

            optionsChecks = new tf.ui.RadioOrCheckListFromData({
                isRadioList: false, onClick: onOptionChanged, data: optionsChecksSelections, isInline: false, checkedBoxes: checkedOptions
            }));

        preserveHotelPositionCheck = optionsChecks.GetButton(preserveHotelPositionStr);

        formContainer.AddContent(divFloors, divRooms, divShuttles, divOptions);

        formContainerElem.style.display = 'none';

        var divSelections;
        var speedSelections = [[timeRealStr, "Animate guests in real time"], [time10xStr, "Animated guests 10 times faster than real time"], [time100xStr, "Animated guests 100 times faster than real time"]];

        var buttonDim = "1.5em";

        playPauseButton = new tf.ui.SvgGlyphToggleBtn({
            style: true, onClick: function () {
                if (!!onAnimationPlayPauseCallBack) { onAnimationPlayPauseCallBack(); }
            }, dim: buttonDim, isToggled: false,
            glyph: tf.styles.SvgGlyphPauseName, tooltip: "Pause Animation", toggledGlyph: tf.styles.SvgGlyphPlayName, toggledTooltip: "Resume Animation"
        });

        (divSelections = new tf.dom.Div({ cssClass: tf.GetStyles().unPaddedBlockDivClass })).AddContent(styles.AddButtonDivLeftMargin(styles.AddButtonDivTopBottMargins(playPauseButton)),
            speedRadios = new tf.ui.RadioOrCheckListFromData({
                isRadioList: true, onClick: onAnimationSpeedChanged, data: speedSelections, isInline: true,
                selRadioName: time10xStr
            }));

        panelContainer.AddContent(divSelections);

        allContainer.AddContent(styles.AddButtonDivTopBottMargins(formContainer), styles.AddButtonDivTopBottMargins(panelContainer));

        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: allContainerElem });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.apps.HotelDemo.Settings, tf.dom.Insertable);

/**
 * class tf.apps.HotelDemo.Demo - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} settings - parameter description?
*/
tf.apps.HotelDemo.Demo = function (settings) {
    var theThis, styles, urlapiApp, appSpecs, preComposeListener, hotelFeature, destinationRoutes, iconMemImgs, nFloors, nRoomsPerFloor, trackingMp, showingHistoryMp;

    var shuttleRouteTotalDistance, shuttleRouteTotalTime, shuttleRouteViaIndices, lastCheckedAnimationTime, animationTime, shuttleInverseRouteViaIndices,
        shuttleRouteFeature, shuttleInverseRouteFeature, allShuttleStops, shuttleStops, shuttleInvertedStops, guestTable, shuttleTable, isAnimationPaused, animationSpeed;

    var nDLayersProcessed, peopleKeyedList, shuttleKeyedList, demoSettings, movingPoints, hotelShuttles, shuttlePointsFeature, shuttleInversePointsFeature;
    var destCategories, shuttleCategories, destinationCoords, destinationLabels, shuttleRouteCoords, peopleLayer, routeLayer, hotelPointCoords;

    var singleAppHCFOnTheSide, singleAppMapContentOnTheSide, twoHorPaneLayout, HCFLayout, appSpecs, dLayers, appSizer, map, curBikeVideoClip;

    var usingDefaultDLayers, radius_km, defaultRadiusKM;

    function onAnimationPlayPause() { isAnimationPaused = !isAnimationPaused; }
    function onAnimationSpeedChange(newSpeed) {
        animationSpeed = newSpeed; demoSettings.SetIsPaused(isAnimationPaused = false);
    }

    function resetAnimationData() {
        nDLayersProcessed = 0;
        shuttleRouteCoords = []; destinationCoords = []; destinationLabels = [];
        peopleKeyedList.RemoveAllItems();
        shuttleKeyedList.RemoveAllItems();
    }

    function removePointsFeature(pointsFeature) {
        if (!!pointsFeature) {
            for (var i in pointsFeature) {
                routeLayer.DelMapFeature(pointsFeature[i]);
            }
        }
        return null;
    }

    function setTrackingMp(mp) {
        if (!!mp) {
            map.ShowPanel(tf.consts.panelNameMapLocation, false);
            if (isAnimationPaused) { mp.AnimatedCenterOnMap(map); }
            trackingMp = mp;
            mp.SetAlwaysHover(true);
        }
        else {
            map.ShowPanel(tf.consts.panelNameMapLocation, true);
            trackingMp = null;
        }
    }

    function stopVideo(mp) {
        var ky = mp.GetKeyedItem();
        var props = tf.js.GetObjProperty(ky, tf.apps.HotelDemo.PersonRowPropsName);
        if (!!props) {
            var videoDiv = props.videoDiv;
            var videoDivElem = videoDiv.GetHTMLElement();

            if (!!props.liveStreamPlayer) {
                props.liveStreamPlayer.OnDelete();
                delete props.liveStreamPlayer;
            }
            if (!!props.video) {
                props.video.pause();
                props.video.src = '';
                props.video.load();
                videoDivElem.removeChild(props.video);
                delete props.video;
            }
            videoDivElem.style.display = 'none';
        }
    }

    function createMP4VideoPlayer(mp4src, swapBool) {
        var video = document.createElement('video');
        video.style.display = 'block';
        video.style.position = 'relative';
        video.style.border = 'none';
        video.style.zIndex = 200;
        if (!!swapBool) {
            video.style.width = tf.apps.HotelDemo.DemoPlayerHeight + "px";
            video.style.height = tf.apps.HotelDemo.DemoPlayerWidth + "px";
        }
        else {
            video.style.width = tf.apps.HotelDemo.DemoPlayerWidth + "px";
            video.style.height = tf.apps.HotelDemo.DemoPlayerHeight + "px";
        }
        video.controls = true;
        video.loop = true;
        //video.style.backgroundColor = backgroundColor;
        video.autoplay = 'true';
        video.src = mp4src;
        return video;
    }

    function getNextBikeVideoClip() {
        var server = "http://terafly.us/VideoClips/";
        var clips = ["20160102_154644.mp4", "20160102_154653.mp4", "20160102_155005.mp4", "20160102_155911.mp4", "20160102_160018.mp4"];
        if (curBikeVideoClip == undefined || curBikeVideoClip == clips.length) { curBikeVideoClip = 0; }
        return server + clips[curBikeVideoClip++];
    }

    function refreshAnimation() {
        showingHistoryMp = null;
        setTrackingMp(null);

        if (!!hotelShuttles) { hotelShuttles.OnDelete(stopVideo); hotelShuttles = null; }
        if (!!movingPoints) { movingPoints.OnDelete(stopVideo); movingPoints = null; }

        if (demoSettings.GetSelection().preserveHotelPosition) { map.SetCenter(hotelPointCoords); }
        if (!!hotelFeature) { hotelFeature.SetPointCoords(hotelPointCoords = map.GetCenter()); }

        if (!!shuttleRouteFeature) { routeLayer.DelMapFeature(shuttleRouteFeature); shuttleRouteFeature = null; }
        if (!!shuttleInverseRouteFeature) { routeLayer.DelMapFeature(shuttleInverseRouteFeature); shuttleInverseRouteFeature = null; }

        shuttlePointsFeature = removePointsFeature(shuttlePointsFeature);
        shuttleInversePointsFeature = removePointsFeature(shuttleInversePointsFeature);

        resetAnimationData();
    }

    function initAnimation() {

        destCategories = tf.js.GetIsValidObject(appSpecs.destCategories) ? appSpecs.destCategories : null;
        shuttleCategories = tf.js.GetIsValidObject(appSpecs.shuttleCategories) ? appSpecs.shuttleCategories : null;

        demoSettings = new tf.apps.HotelDemo.Settings({
            onAnimationSpeedChange: onAnimationSpeedChange, onAnimationPlayPause: onAnimationPlayPause,
            nfloors: appSpecs.fullURL.nfloors, nroomsperfloor: appSpecs.fullURL.nroomsperfloor, nshuttlepairs: appSpecs.fullURL.nshuttlepairs
        });

        function getLabelFromData(data) { return data.GetLabel(); }

        peopleKeyedList = new tf.js.KeyedList({ name: "Guests", getKeyFromItemData: getLabelFromData });
        shuttleKeyedList = new tf.js.KeyedList({ name: "Shuttles", getKeyFromItemData: getLabelFromData });

        resetAnimationData();
    }

    function dLayersPreProcessServiceData(data) {
        if (tf.js.GetIsValidObject(data) && tf.js.GetIsArrayWithMinLength(data.features, 1)) {
            var doProcessDLayer = true, processForShuttleRoute = true;
            var catIdStr = data["category id"];
            if (!!destCategories) { doProcessDLayer = destCategories[catIdStr]; }
            if (!!shuttleCategories) { doProcessDLayer = shuttleCategories[catIdStr]; }
            if (doProcessDLayer) {
                var features = data.features;
                for (var i in features) {
                    var thisFeature = features[i];
                    var props = thisFeature.properties;
                    var distance = parseFloat(props.distance);
                    if (distance / 1000 < radius_km) {
                        var pointCoords = tf.js.GetMapCoordsFrom(thisFeature.geometry.coordinates);
                        if (pointCoords[0]) {
                            destinationCoords.push(pointCoords);
                            destinationLabels.push(props.Display_Label);
                            if (processForShuttleRoute) { shuttleRouteCoords.push(pointCoords); }
                        }
                    }
                    else {
                        break;
                    }
                }
            }
        }

        nDLayersProcessed++;
        checkLastDLayerLoaded() ;
    }

    function checkLastDLayerLoaded() {
        if (dLayers != null) {
            if (nDLayersProcessed == dLayers.GetCount()) {

                var dist, minCoord, maxDist;

                for (var i in destinationCoords) {
                    var c = destinationCoords[i];
                    var d = tf.units.GetDistanceInMetersBetweenMapCoords(c, hotelPointCoords);
                    if (dist === undefined || d < dist) { minCoord = c; dist = d; }
                    if (maxDist === undefined || d > maxDist) { maxDist = d; }
                }

                if (minCoord !== undefined) {
                    hotelPointCoords = minCoord;
                    if (!!hotelFeature) { hotelFeature.SetPointCoords(minCoord); }
                }

                var footDistance = appSpecs.footDistance, bikeFootDistance = appSpecs.bikeFootDistance;

                if (maxDist !== undefined) {
                    bikeFootDistance = maxDist / 2;
                    if (footDistance >= bikeFootDistance / 2) {
                        footDistance = bikeFootDistance / 2
                    }
                }

                destinationCoords.splice(0, 0, hotelPointCoords);
                destinationLabels.splice(0, 0, "Hotel");

                destinationRoutes = new tf.apps.HotelDemo.DestinationRoutes({
                    destinationCoords: destinationCoords, destinationLabels: destinationLabels,
                    footDistance: footDistance,
                    bikeFootDistance: bikeFootDistance,
                    bikeChance01: appSpecs.bikeChance01
                });

                loadIconImages();
            }
        }
    }

    function onPreCompose(notification) {
        if (!!hotelShuttles) { hotelShuttles.UpdatePositions(); }
        if (!!movingPoints) {
            movingPoints.UpdatePositions();
            if (!!trackingMp && peopleLayer.GetIsVisible()) {
                var pointFeature = trackingMp.GetPointFeature();
                new tf.map.PointsStyleAnimator({
                    maps: [map], pointProviders: [pointFeature], duration: 500,
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
                if (!isAnimationPaused) { trackingMp.CenterOnMap(map); }
            }
            notification.continueAnimation();
        }
    }

    function makeShuttleName(index) { return "Shuttle #" + (index + 1); }

    function makeStops(viaIndices, coords) {
        var isStop = {}, count = 0, allStops = [], nDest = destinationCoords.length;
        var maxDistance = 150;
        for (var i in viaIndices) {
            var thisIndex = viaIndices[i];
            var thisCoord = coords[thisIndex];
            var label = '', destinationIndex;
            for (var j = 0 ; j < nDest ; ++j) {
                var thisDistance = tf.units.GetDistanceInMetersBetweenMapCoords(destinationCoords[j], thisCoord);

                if (thisDistance < maxDistance) {
                    label = destinationLabels[j];
                    destinationIndex = j;
                    var destkey = destinationIndex + '';
                    if (allShuttleStops[destkey] == undefined) { allShuttleStops[destkey] = { guests: [], label: label }; }
                    break;
                }
            }
            if (!label.length) { tf.GetDebug().LogIfTest('stop destination not found: ' + i); }
            var obj = { index: parseInt(i, 10), count: count++, label: label, destinationIndex: destinationIndex };
            isStop[thisIndex + ''] = obj;
            allStops.push(obj);
        }

        if (!!allStops.length) {
            var len = allStops.length;

            for (var i = 0 ; i < len ; ++i) {
                var nextIndex = i == len - 1 ? 0 : i + 1;
                var thisStop = allStops[i];
                var nextStop = allStops[nextIndex];
                thisStop.next = nextStop;
            }
        }

        return isStop;
    }

    function getIndexedCoords(coords, indices) { var c = []; for (var i in indices) { c.push(coords[indices[i]]); } return c; }

    function createStopLabelStyle(index, routeName) {
        var label = "stop " + routeName + (index + 1);
        return {
            marker: true, label: label, zindex: 32, marker_color: "#3399ff", marker_verpos: "top", marker_horpos: "right", marker_opacity: 80, line: true, "font_height": 14, font_color: "#fff",
            border_color: "#f00"
        };
    }

    function createStops(stopCoords, stopStyles, routeName) {
        var stopFeatures = [];
        var localStyle = stopStyles.slice(0);

        for (var i in stopCoords) {
            var hoverStyle = localStyle.slice(0);
            hoverStyle.push(tf.js.ShallowMerge(localStyle, createStopLabelStyle(parseInt(i, 10), routeName)));
            var stopFeature = new tf.map.Feature({ type: "point", coordinates: stopCoords[i], style: stopStyles, hoverStyle: hoverStyle });
            stopFeatures.push(stopFeature);
            routeLayer.AddMapFeature(stopFeature);
        }
        return stopFeatures;
    }

    function onShuttleOppositeRouteLoaded(notification) {
        lastCheckedAnimationTime = animationTime = undefined;

        var oppositeCoords, realOppositeCoords;

        if (tf.js.GetIsValidObject(notification) && tf.js.GetLooksLikeLineStringCoords(notification.route_geometry)) {
            oppositeCoords = notification.route_geometry;
            shuttleInverseRouteViaIndices = notification.via_indices;
            realOppositeCoords = true;
        }
        else {
            oppositeCoords = shuttleRouteCoords.slice(0);
            oppositeCoords.reverse();
            shuttleInverseRouteViaIndices = shuttleRouteViaIndices.slice(0);
            shuttleInverseRouteViaIndices.reverse();
            realOppositeCoords = false;
        }

        var routeStyle = [
            { line: true, line_width: 6, line_color: "#000", zindex: 0, snaptopixel: false },
            { line: true, line_width: 4, line_color: "#00c", zindex: 1, snaptopixel: false },
            { line: true, line_width: 2, line_color: "#fff", zindex: 2, line_dash: [16, 16], snaptopixel: false }
        ];

        var basePointRadius = 10;
        var angleA = Math.PI / 8;

        var routePointsStyle = [{
            shape: true, shape_radius: basePointRadius, shape_points: 4, line: true, line_width: 2, line_color: "#00c", zindex: 30, snaptopixel: false, rotation_rad: angleA
        }, {
            shape: true, shape_radius: basePointRadius - 2, shape_points: 4, line: true, line_width: 2, line_color: "#fff", zindex: 30, snaptopixel: false, rotation_rad: angleA
        }, {
            shape: true, shape_radius: basePointRadius - 4, shape_points: 4, line: true, line_width: 1, line_color: "#00c", fill: true, fill_color: "#39f", fill_opacity: 100, zindex: 31, snaptopixel: false, rotation_rad: angleA
        }];

        var routeInversePointsStyle = [{
            shape: true, shape_radius: basePointRadius - 2, shape_points: 4, line: true, line_width: 2, line_color: "#00c", zindex: 30, snaptopixel: false, rotation_rad: -angleA
        }, {
            shape: true, shape_radius: basePointRadius - 4, shape_points: 4, line: true, line_width: 2, line_color: "#fff", zindex: 30, snaptopixel: false, rotation_rad: -angleA
        }, {
            shape: true, shape_radius: basePointRadius - 6, shape_points: 4, line: true, line_width: 1, line_color: "#00c", fill: true, fill_color: "#00c", fill_opacity: 100, zindex: 31, snaptopixel: false, rotation_rad: -angleA
        }];

        //function findIndex(coords, point) { var i = 0; for (i = 0 ; i < coords.length ; ++i) { if (coords[i][0] == point[0] && coords[i][1] == point[1]) { return i; } } return -1; }

        var averageDist = shuttleRouteTotalDistance / shuttleRouteCoords.length;

        function removeCloseIndices(indices, minGap) {
            var len = indices.length;
            var removed = [], nRemain = len;

            for (var i = 0 ; i < len ; i++) { removed.push(false); }

            for (var i = 0 ; i < len / 2 && nRemain > 2 ; i++) {
                var rightIndex = len - i - 1;
                var left = indices[i];
                var leftPlusOne = indices[i + 1];
                var leftGap = leftPlusOne - left;
                var right = indices[rightIndex];
                var rightMinusOne = indices[rightIndex - 1];
                var rightGap = right - rightMinusOne;

                if (leftGap < minGap) {
                    removed[i + 1] = true;
                    --nRemain;
                }
                if (rightGap < minGap) {
                    removed[rightIndex - 1] = true;
                    --nRemain;;
                }
            }

            var newIndices = [];

            for (var i = 0 ; i < len ; ++i) {
                if (!removed[i]) {
                    newIndices.push(indices[i]);
                }
            }
            return newIndices;
        }

        var minIndexDist = 20;

        shuttleRouteViaIndices = removeCloseIndices(shuttleRouteViaIndices, 20);
        shuttleInverseRouteViaIndices = removeCloseIndices(shuttleInverseRouteViaIndices, 20);

        shuttleRouteCoords = tf.units.SplitLineStringSegments(shuttleRouteCoords, averageDist * 2, true, shuttleRouteViaIndices);

        oppositeCoords = tf.units.SplitLineStringSegments(oppositeCoords, averageDist * 2, true, shuttleInverseRouteViaIndices);

        var shuttleStopCoords = getIndexedCoords(shuttleRouteCoords, shuttleRouteViaIndices);
        var shuttleInverseStopCoords = getIndexedCoords(oppositeCoords, shuttleInverseRouteViaIndices);

        shuttleRouteFeature = new tf.map.Feature({ type: "linestring", coordinates: shuttleRouteCoords, style: routeStyle });
        routeLayer.AddMapFeature(shuttleRouteFeature);

        if (realOppositeCoords) {
            var inverseRouteStyle = [
                { line: true, line_width: 6, line_color: "#000", zindex: 0, snaptopixel: false },
                { line: true, line_width: 4, line_color: "#fff", zindex: 1, snaptopixel: false },
                { line: true, line_width: 2, line_color: "#00c", zindex: 2, line_dash: [16, 16], snaptopixel: false }
            ];
            shuttleInverseRouteFeature = new tf.map.Feature({ type: "linestring", coordinates: oppositeCoords, style: inverseRouteStyle });
            routeLayer.AddMapFeature(shuttleInverseRouteFeature);
        }

        var routeName = "A", invertedRouteName = "B";

        shuttlePointsFeature = createStops(shuttleStopCoords, routePointsStyle, routeName);
        shuttleInversePointsFeature = createStops(shuttleInverseStopCoords, routeInversePointsStyle, invertedRouteName);

        var route = new tf.apps.HotelDemo.DestinationRoute({
            coords: shuttleRouteCoords, start: hotelPointCoords, end: hotelPointCoords, total_time: shuttleRouteTotalTime, total_distance: shuttleRouteTotalDistance,
            labelStart: "Hotel", labelEnd: "Hotel", mode: "car", viaIndices: shuttleRouteViaIndices
        });

        var invertedRoute = new tf.apps.HotelDemo.DestinationRoute({
            coords: oppositeCoords, start: hotelPointCoords, end: hotelPointCoords, total_time: shuttleRouteTotalTime, total_distance: shuttleRouteTotalDistance,
            labelStart: "Hotel", labelEnd: "Hotel", mode: "car", viaIndices: shuttleInverseRouteViaIndices
        });

        allShuttleStops = {};

        shuttleStops = makeStops(shuttleRouteViaIndices, shuttleRouteCoords);
        shuttleInvertedStops = makeStops(shuttleInverseRouteViaIndices, oppositeCoords);

        if (!hotelShuttles) {

            var totalTime = route.GetTotalTime();
            var selection = demoSettings.GetSelection();

            hotelShuttles = new tf.apps.HotelDemo.Shuttles({
                keyedList: shuttleKeyedList,
                totalTime: totalTime,
                layer: peopleLayer, iconSrcs: iconMemImgs, nShuttlePairs: selection.nShuttlePairs,
                getLabel: makeShuttleName,
                routeName: routeName,
                invertedRouteName: invertedRouteName,
                route: route,
                stops: shuttleStops,
                invertedRoute: invertedRoute,
                invertedStops: shuttleInvertedStops,
                onPointCreated: onShuttleCreated,
                onStartRoute: onShuttleStartedRoute,
                onStop: onShuttleStopped,
                getAnimationTime: getAnimationTime
            });
        }

        createPeople();
    }

    function onShuttleRouteLoaded(notification, ch) {
        var doCreatePeople = true;
        if (tf.js.GetIsValidObject(notification)) {
            var coords = notification.route_geometry;

            if (tf.js.GetLooksLikeLineStringCoords(coords)) {
                shuttleRouteCoords = coords;
                shuttleRouteTotalDistance = notification.route_summary.total_distance;
                shuttleRouteTotalTime = notification.route_summary.total_time * 1000;
                shuttleRouteViaIndices = notification.via_indices;
                var inverseCh = ch.slice(0);
                inverseCh.reverse();
                doCreatePeople = false;
                getShuttleRoute(inverseCh, onShuttleOppositeRouteLoaded);
            }
            else {
                var len = ch.length;

                if (len > 5) {
                    var index = Math.floor(Math.random() * (len - 2)) + 1;
                    tf.GetDebug().LogIfTest("removing point " + index + " from shuttle route");
                    ch.splice(index, 1);
                    doCreatePeople = false;
                    getShuttleRoute(ch, onShuttleRouteLoaded);
                }
                else { tf.GetDebug().LogIfTest("giving up on shuttle route"); }
            }
        }
        if (doCreatePeople) { createPeople(); }
    }

    function getShuttleRoute(ch, callBack) {
        new tf.services.Routing({
            serverURL: tf.apps.HotelDemo.RoutingServerURL,
            findAlternatives: false,
            level: 18,
            lineStringCoords: ch, mode: "car",
            callBack: function (notification) { return callBack(notification, ch); },
            optionalScope: theThis
        });
    }

    function createShuttleRoute() {
        var selection = demoSettings.GetSelection();

        if (selection.nShuttlePairs > 0) {
            var ch = tf.map.GetConvexHull(shuttleRouteCoords);
            var minIndex, minDist;

            for (var i in ch) {
                var d = tf.units.GetDistanceInMetersBetweenMapCoords(hotelPointCoords, ch[i]);
                if (minIndex === undefined || d < minDist) { minDist = d; minIndex = i; }
            }

            if (minIndex !== undefined) {
                minIndex = tf.js.GetIntNumberInRange(minIndex, 0, ch.length - 1, 0);
                if (minDist > 0) { ch.splice(minIndex, 0, hotelPointCoords); }
                var startPart = ch.slice(minIndex);
                var endPart = ch.slice(0, minIndex);
                ch = startPart.concat(endPart);
                ch.push(hotelPointCoords);
            }

            //nHullPointsProcessed = 1; reachableHullPoints = []; candidateHullPoints = ch; checkNextHullPoint();
            getShuttleRoute(ch, onShuttleRouteLoaded);
        }
        else {
            createPeople();
        }
    }

    function loadIconImages() {
        if (!iconMemImgs) {
            var imgSrcs = ["./image/car.png", "./image/bike.png", "./image/walk.png", "./image/bus.png" ];

            new tf.dom.ImgsPreLoader({
                imgSrcs: imgSrcs, onAllLoaded: function (preLoader) {
                    var iconImgs = preLoader.GetImgs();

                    iconMemImgs = {
                        car: { image: iconImgs[0], anchor: [0.5, 0.5], size: iconImgs[0].GetDimensions() },
                        bicycle: { image: iconImgs[1], anchor: [0.5, 0.5], size: iconImgs[1].GetDimensions() },
                        foot: { image: iconImgs[2], anchor: [0.5, 0.5], size: iconImgs[2].GetDimensions() },
                        bus: { image: iconImgs[3], anchor: [0.5, 0.5], size: iconImgs[3].GetDimensions() }
                    };

                    routeLayer = map.AddFeatureLayer({ name: "Routes", description: "Shuttle routes", isVisible: true, isHidden: false, zIndex: 1 });
                    peopleLayer = map.AddFeatureLayer({ name: "Guests", description: "Hotel guests", isVisible: true, isHidden: false, zIndex: 20 });

                    //var hotelImageFile = tf.platform.MakePlatformPath("image/svg/hotel.svg");
                    var hotelImageFile = "./image/hotel.png";
                    var hotelIconAnchor = [0.5, 0]; // [0.5, 0.5]
                    var roundRectIconAnchor = [0.5, 0];

                    hotelFeature = new tf.map.Feature({
                        type: "point", coordinates: hotelPointCoords,
                        style: [{
                            round_rect: true, round_rect_width: 48, round_rect_height: 48, round_rect_radius: 10, line: true,
                            line_width: 2, line_color: "#37b", fill: true, fill_color: "#fff", fill_opacity: 60, icon_anchor: roundRectIconAnchor, zindex: 18
                        }, {
                            icon: true, icon_url: hotelImageFile, scale: 0.75, icon_anchor: hotelIconAnchor, zindex: 19
                        }]
                    });

                    peopleLayer.AddMapFeature(hotelFeature);

                    createShuttleRoute();
                }
            });
        }
        else {
            createShuttleRoute();
        }
    }

    function onFeatureHoverInOut(notification) {
        if (notification.isInHover) {

            var curTableIndex = urlapiApp.GetCurTableIndex();
            if (curTableIndex == 0 || curTableIndex == 1) {
                var props = tf.js.GetObjProperty(notification.mapFeature, tf.apps.HotelDemo.MovingPointPropertyName);

                if (!!props) {
                    var ki = props.GetKeyedItem();
                    if (!!ki) {
                        if (curTableIndex == 0) { guestTable.GetRowFromKeyedItem(ki).Select(true, true); }
                        else { shuttleTable.GetRowFromKeyedItem(ki).Select(true, true); }
                    }
                }
            }
        }
    }

    function onFeatureClick(notification) {
        var props = tf.js.GetObjProperty(notification.mapFeature, tf.apps.HotelDemo.MovingPointPropertyName);

        if (!!props) {
            var ki = props.GetKeyedItem();

            props.SetAlwaysHover(!props.GetAlwaysHover());
            if (!!ki) {
                var isGuest = !!tf.js.GetObjProperty(props, tf.apps.HotelDemo.GuestPropertyName);
                var tableNumber = isGuest ? 0 : 1, table = isGuest ? guestTable : shuttleTable;
                urlapiApp.GotoTable(tableNumber);
                setTimeout(function () { table.GetRowFromKeyedItem(ki).Select(true, true); }, 100);
            }
        }
    }

    function onToggleSettings() { demoSettings.OnToggle(); appSizer.OnResize(); }

    function onCreated() {
        styles = tf.GetStyles();
        singleAppHCFOnTheSide = urlapiApp.GetSingleAppHCFOnTheSide();
        twoHorPaneLayout = (singleAppMapContentOnTheSide = singleAppHCFOnTheSide.GetSingleAppMapContentOnTheSide()).GetLeftSeparatorRightLayout();
        HCFLayout = singleAppHCFOnTheSide.GetHCFLayout();
        map = singleAppMapContentOnTheSide.GetMap();

        map.ShowMapCenter(false);
        hotelPointCoords = map.GetCenter();
        dLayers = singleAppMapContentOnTheSide.GetDLayers();
        appSizer = singleAppMapContentOnTheSide.GetAppContainerSizer();
        twoHorPaneLayout.SetRightSideCollapsed(false);
        preComposeListener = map.AddListener(tf.consts.mapPreComposeEvent, onPreCompose);
        var mapEventSettings = {};
        var mapMonitor;

        mapEventSettings[tf.consts.mapFeatureHoverInOutEvent] = onFeatureHoverInOut;
        mapEventSettings[tf.consts.mapFeatureClickEvent] = onFeatureClick;
        mapMonitor = map.AddListeners(mapEventSettings);

        urlapiApp.AddToToolBar(styles.AddButtonDivMargins(
            new tf.ui.SvgGlyphBtn({
                style: urlapiApp.GetToolBarSvgButtonStyle(), glyph: tf.styles.SvgGlyphGearName, onClick: onToggleSettings,
                tooltip: "Hotel Settings", dim: urlapiApp.GetToolBarButtonDim()
            })));

        var div = HCFLayout.CreateUnPaddedDivForHeader();

        div.AddContent(demoSettings);
        urlapiApp.AddToToolBar(div);
    }

    function onAppSpecsLoaded(appSpecsSet) {
        appSpecs = appSpecsSet;
        var useUSRouting;

        if (usingDefaultDLayers) {
            appSpecs.destCategories = {
                "wikix2015": true,
                "iypages_demographics": true,
                "us_restaurants": true,
                "iypages_demographics_sic_clustering": true
            };

            appSpecs.shuttleCategories = {
                "us_restaurants": true,
                "wikix2015": true,
                "iypages_demographics_sic_clustering": true
            };
        }

        radius_km = tf.js.GetFloatNumberInRange(parseFloat(appSpecs.fullURL.radius_km), 0.1, 999999, defaultRadiusKM);

        if (!(useUSRouting = (appSpecs.fullURL.otherrouting === undefined))) {
            tf.apps.HotelDemo.RoutingServerURL = "http://router.project-osrm.org/";
        }

        initAnimation();
    }

    function onRefresh() { refreshAnimation(); }

    function onShuttleCreated(notification) {
        if (notification.sender === hotelShuttles) {
            var point = notification.point;
            var props = {};
            tf.js.SetObjProperty(point, tf.apps.HotelDemo.ShuttlePropertyName, props);
            if (urlapiApp.GetCurTableIndex() == 1) { urlapiApp.UpdateCurTableFooter(); }
        }
    }

    function onUpdateShuttleTableRow(notification) {
        var sender = notification.sender;
        var ky = sender.GetKeyedItem();

        var props = tf.js.GetObjProperty(ky, tf.apps.HotelDemo.PersonRowPropsName);
        if (!!props) {
            var span = props.currentTripSpan;
            var locationStr, lastPauseStop = sender.GetLastPauseStop(), routeName = sender.GetRouteName();

            if (sender.GetIsPaused()) {
                var lastStopLabel = !!lastPauseStop ? lastPauseStop.label : '';

                if (!!lastStopLabel.length) { lastStopLabel = ' (' + lastStopLabel + ')'; }
                locationStr = "stopped at: " + routeName + (lastPauseStop.index + 1) + lastStopLabel;
            }
            else {
                if (!!lastPauseStop) {
                    var nextStop = lastPauseStop.next;
                    var lastStopLabel = !!nextStop ? nextStop.label : '';

                    if (!!lastStopLabel.length) { lastStopLabel = ' (' + lastStopLabel + ')'; }
                    locationStr = "next: " + routeName + (lastPauseStop.next.index + 1) + lastStopLabel;
                }
            }

            var guests = sender.GetGuests();
            var nGuests = !!guests ? guests.length : 0;
            var nGuestsStr = nGuests > 0 ? nGuests > 1 ? ('(' + nGuests + ' guests)') : "(1 guest)" : "";
            var allText = "route: " + routeName + " - trip# " + sender.GetNRoutes() + nGuestsStr;
            if (!!locationStr) {
                allText += "<br/>" + locationStr;
            }

            span.GetHTMLElement().innerHTML = allText;

            //span.ClearContent();
            //span.AddContent("route: " + routeName + " - trip# " + sender.GetNRoutes());
            //if (!!locationStr) { span.AddContent(locationStr); }
        }
        else { tf.GetDebug().LogIfTest("onUpdateShuttleTableRow without keyedItem"); }
    }

    function guestGetsOutOfShuttle(guestsOut, i, outStatusStr, inStatusStr, stopDestinationIndex) {
        var prob = Math.random() < 0.5;
        var thisGuest = guestsOut[i];
        var mpOut = thisGuest.sender;
        var getOut;

        if (getOut = (mpOut.GetStopEnteredShuttle() != stopDestinationIndex)) {
            var nShuttleStops = mpOut.GetNShuttleStops();
            var minProb;

            switch (nShuttleStops) {
                case 0: minProb = 0.3; break;
                case 1: minProb = 0.6; break;
                case 2: minProb = 0.85; break;
                default: minProb = 0.99; break;
            }

            getOut = prob < minProb;

            if (getOut) {
                setPersonStatus(mpOut, outStatusStr);
                mpOut.TakeShuttle(null);
                mpOut.SetRouteStartIndex(stopDestinationIndex);
                requestNewPersonRoute(thisGuest);
            }
            else {
                mpOut.IncNShuttleStops();
                setPersonStatus(mpOut, inStatusStr);
            }
        }
        return getOut;
    }

    function onShuttleStopped(notification) {
        var sender = notification.sender;
        var senderLabel = sender.GetLabel();
        var lastPauseStop = sender.GetLastPauseStop();
        var shuttleStop = !!lastPauseStop ? !!allShuttleStops ? allShuttleStops[lastPauseStop.destinationIndex + ''] : null : null;

        if (!!shuttleStop) {
            if (sender.GetIsPaused()) {
                var guestsOut = sender.GetGuests();

                if (!!guestsOut) {
                    var nOut = guestsOut.length;

                    if (nOut > 0) {
                        var statusStr = "at: " + lastPauseStop.label + "<br/>out of " + senderLabel;
                        var nextStop = lastPauseStop.next;
                        var nextStopLabel = !!nextStop ? nextStop.label : '';
                        var inStatusStr = "in " + senderLabel;
                        var guestsLeftInBus = [];

                        if (nextStopLabel.length > 0) { inStatusStr += '<br/>to: ' + nextStopLabel; }

                        for (var i = 0 ; i < nOut ; ++i) {
                            if (!guestGetsOutOfShuttle(guestsOut, i, statusStr, inStatusStr, lastPauseStop.destinationIndex)) {
                                guestsLeftInBus.push(guestsOut[i]);
                            }
                        }
                        sender.SetGuests(guestsLeftInBus);
                    }
                }
            }
            else {
                var guestsIn = shuttleStop.guests;
                var nIn = guestsIn.length;

                if (nIn > 0) {
                    var nextStop = lastPauseStop.next;
                    var nextStopLabel = !!nextStop ? nextStop.label : '';
                    var statusStr = "in " + senderLabel;
                    var inBusMps = sender.GetGuests();
                    var maxIn = 30;

                    if (nextStopLabel.length > 0) { statusStr += '<br/>to: ' + nextStopLabel; }

                    if (inBusMps) { for (var i in inBusMps) { setPersonStatus(inBusMps[i].sender, statusStr); } if ((maxIn -= inBusMps.length) < 0) { maxIn = 0; } }
                    else { inBusMps = []; }

                    if (nIn > maxIn) { nIn = maxIn; }

                    if (nIn > 0) {
                        for (var i = 0 ; i < nIn ; ++i) {
                            var thisGuest = guestsIn[i];
                            var mpIn = thisGuest.sender;
                            mpIn.TakeShuttle(sender, lastPauseStop.destinationIndex);
                            addPersonHistory(mpIn, senderLabel);
                            setPersonStatus(mpIn, statusStr)
                            inBusMps.push(thisGuest);
                        }
                        /*shuttleStop.guests =*/ shuttleStop.guests.splice(0, nIn);
                        sender.SetGuests(inBusMps);
                    }
                }
            }
        }
        onUpdateShuttleTableRow(notification);
    }

    function onShuttleStartedRoute(notification) { onUpdateShuttleTableRow(notification); }

    function getShuttleRowContent(notification) {
        var keyedItem = notification.keyedItem;
        var content = null;

        if (!!keyedItem) {
            var mp = keyedItem.GetData();

            content = new tf.dom.Div({ cssClass: tf.GetStyles().dLayerInfoClass });

            var dim = "1.4em";
            var buttonDim = "1.6em";

            var labelButton = new tf.ui.TextBtn({
                style: true, label: mp.GetLabel(), dim: dim, tooltip: "Toggle Map Label",
                onClick: function () { mp.SetAlwaysHover(!mp.GetAlwaysHover()) }
            });

            var locateButton = new tf.ui.SvgGlyphBtn({
                style: true, glyph: tf.styles.SvgGlyphUserLocationName, tooltip: "Locate", dim: buttonDim,
                onClick: function () {
                    if (trackingMp != mp) { setTrackingMp(null); mp.AnimatedCenterOnMap(map); }
                    mp.SetAlwaysHover(true);
                }
            });

            var trackButton = new tf.ui.SvgGlyphBtn({
                style: true, glyph: tf.styles.SvgGlyphBullsEye2Name, tooltip: "Track", dim: buttonDim,
                onClick: function () { if (trackingMp == mp) { setTrackingMp(null); } else { setTrackingMp(mp); } }
            });

            var videoButton = new tf.ui.SvgGlyphBtn({
                style: true, glyph: tf.styles.SvgGlyphUploadVideoName, tooltip: "Toggle Video", dim: buttonDim,
                onClick: function () {
                    var ky = mp.GetKeyedItem();
                    var props = tf.js.GetObjProperty(ky, tf.apps.HotelDemo.PersonRowPropsName);
                    var videoDiv = props.videoDiv;
                    var videoDivElem = videoDiv.GetHTMLElement();

                    if (videoDivElem.style.display == 'none') {
                        var video = createMP4VideoPlayer("http://alaska.cs.fiu.edu/mvideo/test/mov/FileSave/916e9f7e-76c3-4b30-bdd0-07085a1fec5f/video.m4v");
                        videoDivElem.style.display = 'block';
                        props.video = video;
                        videoDiv.AddContent(video);
                    }
                    else { stopVideo(mp); }
                }
            });

            var span = tf.urlapi.CreateInfoWindowSpan("-");
            var span2 = tf.urlapi.CreateInfoWindowSpan("-");
            var videoDiv = new tf.dom.Div({ cssClass: tf.GetStyles().unPaddedBlockDivClass });

            var props = { currentTripSpan: span, historySpan: span2, historyText: 'Hotel', videoDiv: videoDiv };
            var span1Style = span.GetHTMLElement().style;
            var span2Style = span2.GetHTMLElement().style;

            span1Style.padding = "2px";
            span1Style.borderRadius = "4px";

            span2Style.display = 'none';
            videoDiv.GetHTMLElement().style.display = 'none';

            tf.js.SetObjProperty(keyedItem, tf.apps.HotelDemo.PersonRowPropsName, props);

            content.AddContent(styles.AddButtonDivRightMargin(styles.AddButtonDivTopBottMargins(labelButton)));
            content.AddContent(styles.AddButtonDivRightMargin(styles.AddButtonDivTopBottMargins(locateButton)));
            content.AddContent(styles.AddButtonDivRightMargin(styles.AddButtonDivTopBottMargins(trackButton)));
            content.AddContent(styles.AddButtonDivRightMargin(styles.AddButtonDivTopBottMargins(videoButton)));

            content.AddContent(span);
            content.AddContent(span2);
            content.AddContent(videoDiv);
        }

        appSizer.UpdateMapSizes();

        return { sender: theThis, content: content };
    }

    function getAnimationTime() {
        var now = Date.now();
        if (lastCheckedAnimationTime === undefined) { lastCheckedAnimationTime = now; animationTime = 0; }
        else {
            if (!isAnimationPaused) {
                animationTime += (now - lastCheckedAnimationTime) * animationSpeed;
            }
            lastCheckedAnimationTime = now;
        }
        return animationTime;
    }

    function checkIfMpGoesHome(mp) {
        var goHome = false;
        if (!mp.GetIsGoingHome()) {
            var random = Math.random();
            switch (mp.GetNRoutesAway()) {
                case 0: goHome = false; break;
                case 1: goHome = random < 0.33; break;
                case 2: goHome = random < 0.5; break;
                case 3: goHome = random < 0.67; break;
                default: goHome = random < 0.9; break;
            }
        }
        mp.SetIsGoingHome(goHome);
        return goHome;
    }

    function requestMpRoute(request, startIndex, endIndexUse) {
        var mp = request.sender;
        destinationRoutes.GetRandomRoute(function (notification) {
            var routeSet = (tf.js.GetIsValidObject(notification) && tf.js.GetIsValidObject(notification.route)) ? notification.route : null;
            request.setRoute.call(mp, routeSet);
        }, theThis, startIndex, endIndexUse);
    }

    function requestNewPersonRoute(request) {
        var mp = request.sender;

        var startIndex = mp.GetRouteStartIndex();
        var shuttleStop = !!allShuttleStops ? allShuttleStops[startIndex + ''] : null;
        var tookShuttle = false;

        if (!!shuttleStop) {
            if (!(mp.IsInShuttle() || mp.WasLastInShuttle())) {
                var prob = Math.random();
                var minProb = startIndex == 0 ? 0.4 : 0.75;
                //var minProb = 0.75;
                if (prob < minProb) {
                    shuttleStop.guests.push(request);
                    mp.SetPointCoords(destinationCoords[startIndex], 'foot');
                    setPersonStatus(mp, "at: " + shuttleStop.label + "<br/>waiting for shuttle");
                    tookShuttle = true;
                }
            }
        }

        if (!tookShuttle) {
            var goHome = checkIfMpGoesHome(mp), endIndexUse = !!goHome ? 0 : undefined;
            requestMpRoute(request, startIndex, endIndexUse);
        }
    }

    function setHotelDimensions(nFloorsSet, nRoomsPerFloorSet) {
        nFloors = tf.js.GetIntNumberInRange(nFloorsSet, 1, 50, 20);
        nRoomsPerFloor = tf.js.GetIntNumberInRange(nRoomsPerFloorSet, 1, 20, 10)
    }

    function getFloorRoomNumberFromIndex(index) {
        var floorNumber = Math.floor(index / nRoomsPerFloor) + 1;
        var roomNumber = (index % nRoomsPerFloor) + 1;
        var roomNumberStr = (roomNumber < 10) ? '0' + roomNumber : roomNumber;
        var fullRoomNumber = '' + floorNumber + roomNumberStr;
        return { floor: floorNumber, room: roomNumber, floorRoomStr: fullRoomNumber };
    }

    function makeRandomName(index) {
        return '#' + getFloorRoomNumberFromIndex(index).floorRoomStr + ' ' + tf.helpers.GetRandomFirstLastName();
    }


    function onPersonCreated(notification) {
        if (notification.sender === movingPoints) {
            var point = notification.point;
            var labels = point.GetLabel().split(' ');
            var frm = getFloorRoomNumberFromIndex(point.GetIndex());
            var props = { floor: frm.floor, room: frm.room, floorRoomStr: frm.floorRoomStr, firstName: labels[1], lastName: labels[2] };
            tf.js.SetObjProperty(point, tf.apps.HotelDemo.GuestPropertyName, props);
            if (urlapiApp.GetCurTableIndex() == 0) { urlapiApp.UpdateCurTableFooter(); }
        }
    }

    function setPersonStatus(mp, statusStr) {
        var ky = mp.GetKeyedItem();
        var props = tf.js.GetObjProperty(ky, tf.apps.HotelDemo.PersonRowPropsName);
        if (props) {
            var span = props.currentTripSpan;
            span.GetHTMLElement().innerHTML = statusStr;
        }
        else { tf.GetDebug().LogIfTest("setPersonStatus without props"); }
    }

    function addPersonHistory(mp, historyStr) {
        var ky = mp.GetKeyedItem();
        var props = tf.js.GetObjProperty(ky, tf.apps.HotelDemo.PersonRowPropsName);
        if (props) {
            var span = props.historySpan;
            props.historyText = historyStr + ', ' + props.historyText;
            span.GetHTMLElement().innerHTML = props.historyText;
        }
        else { tf.GetDebug().LogIfTest("addPersonHistory without props"); }
    }

    function addPersonTrip(mp, tripNumber, tripMode, tripDest) {
        var ky = mp.GetKeyedItem();
        var props = tf.js.GetObjProperty(ky, tf.apps.HotelDemo.PersonRowPropsName);
        if (props) {
            var allText = "trip# " + tripNumber + ', by ' + tripMode + ',<br/>' + "to: " + tripDest;
            setPersonStatus(mp, allText)
            addPersonHistory(mp, tripDest);
        }
        else { tf.GetDebug().LogIfTest("addPersonTrip without props"); }
    }

    function onPersonStartedRoute(notification) {
        var sender = notification.sender, route = notification.route, mode = route.GetMode(), dest = route.GetLabelEnd();
        addPersonTrip(sender, sender.GetNRoutes(), mode, dest);
    }

    function createPeople() {

        var selection = demoSettings.GetSelection();

        setHotelDimensions(selection.nFloors, selection.nRoomsPerFloor);

        var nPoints = nFloors * nRoomsPerFloor;
        movingPoints = new tf.apps.HotelDemo.MovingPoints({
            keyedList: peopleKeyedList,
            destinationRoutes: destinationRoutes, layer: peopleLayer, iconSrcs: iconMemImgs, nPoints: nPoints, getLabel: makeRandomName, onPointCreated: onPersonCreated,
            onStartRoute: onPersonStartedRoute, getAnimationTime: getAnimationTime, requestNewRoute: requestNewPersonRoute
        });
    }

    function showHistory(mp, bool) {
        var ky = mp.GetKeyedItem();
        var props = tf.js.GetObjProperty(ky, tf.apps.HotelDemo.PersonRowPropsName);
        var historySpan = props.historySpan;
        var historySpanStyle = historySpan.GetHTMLElement().style;
        historySpanStyle.display = !!bool ? 'inline-block' : 'none';
        appSizer.UpdateMapSizes();
    }

    function toggleHistory(mp) {
        if (mp == showingHistoryMp) { showHistory(mp, false); showingHistoryMp = null; }
        else {
            if (!!showingHistoryMp) { showHistory(showingHistoryMp, false); }
            showHistory(showingHistoryMp = mp, true);
        }
    }

    function getGuestRowContent(notification) {
        var keyedItem = notification.keyedItem;
        var content = null;

        if (!!keyedItem) {
            var mp = keyedItem.GetData();

            content = new tf.dom.Div({ cssClass: tf.GetStyles().dLayerInfoClass });

            var dim = "1.4em";
            var buttonDim = "1.6em";

            var labelButton = new tf.ui.TextBtn({
                style: true, label: mp.GetLabel(), dim: dim, tooltip: "Toggle Map Label",
                onClick: function () { mp.SetAlwaysHover(!mp.GetAlwaysHover()) }
            });

            labelButton.GetHTMLElement().style.display = 'block';

            var historyButton = new tf.ui.SvgGlyphBtn({
                style: true, glyph: tf.styles.SvgGlyphMapDirectionsName, tooltip: "Toggle Trip History", dim: buttonDim,
                onClick: function () { toggleHistory(mp); }
            });

            var locateButton = new tf.ui.SvgGlyphBtn({
                style: true, glyph: tf.styles.SvgGlyphUserLocationName, tooltip: "Locate", dim: buttonDim,
                onClick: function () {
                    if (trackingMp != mp) { setTrackingMp(null); mp.AnimatedCenterOnMap(map); }
                    mp.SetAlwaysHover(true);
                }
            });

            var trackButton = new tf.ui.SvgGlyphBtn({
                style: true, glyph: tf.styles.SvgGlyphBullsEye2Name, tooltip: "Track", dim: buttonDim,
                onClick: function () { if (trackingMp == mp) { setTrackingMp(null); } else { setTrackingMp(mp); } }
            });

            var routeButton = new tf.ui.SvgGlyphBtn({
                style: true, glyph: tf.styles.SvgGlyphRoadName, tooltip: "Toggle Current Route Visibility", dim: buttonDim,
                onClick: function () { mp.ShowRoute(!mp.IsShowingRoute()) }
            });

            var videoButton = new tf.ui.SvgGlyphBtn({
                style: true, glyph: tf.styles.SvgGlyphUploadVideoName, tooltip: "Toggle Video", dim: buttonDim,
                onClick: function () {
                    var ky = mp.GetKeyedItem();
                    var props = tf.js.GetObjProperty(ky, tf.apps.HotelDemo.PersonRowPropsName);
                    var videoDiv = props.videoDiv;
                    var videoDivElem = videoDiv.GetHTMLElement();

                    if (videoDivElem.style.display == 'none') {
                        var mode = mp.GetCurRoute().GetMode();

                        videoDivElem.style.display = 'block';

                        if (mode == 'car') {
                            var video = createMP4VideoPlayer("http://alaska.cs.fiu.edu/mvideo/test/mov/FileSave/916e9f7e-76c3-4b30-bdd0-07085a1fec5f/video.m4v");
                            props.video = video;
                            videoDiv.AddContent(video);
                        }
                        else if (mode == 'bicycle') {
                            var video = createMP4VideoPlayer(getNextBikeVideoClip(), false);
                            props.video = video;
                            videoDiv.AddContent(video);
                        }
                        else {
                            props.liveStreamPlayer = new tf.ui.LiveStreamPlayer({ container: videoDiv, width: tf.apps.HotelDemo.DemoPlayerWidth, height: tf.apps.HotelDemo.DemoPlayerHeight });
                            props.liveStreamPlayer.PlayStream("rtmp://alaska.cs.fiu.edu:1935/live/hotel");
                        }
                    }
                    else { stopVideo(mp); }
                }
            });

            var span = tf.urlapi.CreateInfoWindowSpan("-");
            var span2 = tf.urlapi.CreateInfoWindowSpan("-");
            var videoDiv = new tf.dom.Div({ cssClass: tf.GetStyles().unPaddedBlockDivClass });

            var props = { currentTripSpan: span, historySpan: span2, historyText: 'Hotel', videoDiv: videoDiv };

            var span1Style = span.GetHTMLElement().style;
            var span2Style = span2.GetHTMLElement().style;

            span2Style.padding = span1Style.padding = "2px";
            span2Style.display = 'none';
            span1Style.borderRadius = span2Style.borderRadius = "4px";
            videoDiv.GetHTMLElement().style.display = 'none';

            tf.js.SetObjProperty(keyedItem, tf.apps.HotelDemo.PersonRowPropsName, props);

            content.AddContent(styles.AddButtonDivTopBottMargins(labelButton));
            content.AddContent(styles.AddButtonDivRightMargin(styles.AddButtonDivTopBottMargins(historyButton)));
            content.AddContent(styles.AddButtonDivRightMargin(styles.AddButtonDivTopBottMargins(locateButton)));
            content.AddContent(styles.AddButtonDivRightMargin(styles.AddButtonDivTopBottMargins(trackButton)));
            content.AddContent(styles.AddButtonDivRightMargin(styles.AddButtonDivTopBottMargins(routeButton)));
            content.AddContent(styles.AddButtonDivRightMargin(styles.AddButtonDivTopBottMargins(videoButton)));

            content.AddContent(span);
            content.AddContent(span2);
            content.AddContent(videoDiv);
        }

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

    function createGuestTable(tables) {
        var tableSettings = tf.js.ShallowMerge(appSpecs.guestTableStyle, { selectOnHover: appSpecs.guestTableSelectOnHover, onSelect: onGuestRowSelect });
        guestTable = createTable(tables, peopleKeyedList, tableSettings, { style: appSpecs.guestTableRowStyle, selectedStyle: appSpecs.guestTableRowHoverStyle }, getGuestRowContent, 0, "Guests");
    }

    function createShuttleTable(tables) {
        var tableSettings = tf.js.ShallowMerge(appSpecs.shuttleTableStyle, { selectOnHover: appSpecs.shuttleTableSelectOnHover, onSelect: onShuttleRowSelect });
        shuttleTable = createTable(tables, shuttleKeyedList, tableSettings, { style: appSpecs.shuttleTableRowStyle, selectedStyle: appSpecs.shuttleTableRowHoverStyle }, getShuttleRowContent, 1, "Shuttles");
    }

    function onGuestRowSelect(notification) { }
    function onShuttleRowSelect(notification) { }

    function initTables() {
        var tables = [];
        createGuestTable(tables);
        createShuttleTable(tables);
        return tables;
    }

    function initialize() {

        tf.dom.AddScript("./js/jquery-1.9.1.min.js");
        tf.dom.AddScript("./js/jwplayer.js");

        defaultRadiusKM = 3;

        settings = tf.js.GetValidObjectFrom(settings);

        var defaultURLParams = {
            "lat": 25.813894,
            "lon": -80.122650,
            "level": 15,
            "fmap": "m2",
            "panels": "tflogo+address+zoom+legend+type+measure+download+maplocation+userlocation+overview+fullscreen+source",
            "legendh": "{Cities::~Capitals:Capitals_WorldMap@wm_Capitals-120-6000;Capitals:Capitals_WorldMap@wm_Capitals-6000-15000;~Metro:Big_Cities_over_million_WorldMap@wm_Cities_Greater_900K-120-5000;Metro:Big_Cities_over_million_WorldMap@wm_Cities_Greater_900K-5000-15000;~Cities:Cities_WorldMap@wm_Cities_75K_to_900K-120-2400+wm_Cities_Greater_900K-120-2400+wm_Cities_Unknownpop-120-2400;Cities:Cities_WorldMap@wm_Cities_75K_to_900K-2400-15000+wm_Cities_Greater_900K-2400-15000+wm_Cities_Unknownpop-2400-15000;};{Hubs::~Ports:Marine_Ports_WorldMap@wm_Marine_Ports-120-360;Ports:Marine_Ports_WorldMap@wm_Marine_Ports-360-2000;~Railway:Railway_Stations_WorldMap@wm_Railway_Stations-120-240;~Airports:Airports_WorldMap@wm_Airports-120-240;};{Water::Bays:Seas_and_Bays_WorldMap@wm_Seas_Bays-120-2000;Glaciers:Glaciers_WorldMap@wm_Glacier-120-4000;~Rivers_B:Lake_and_River_contours_WorldMap@wm_Water_Poly-120-500;~Great_Lakes_L:Great_Lakes_labels_WorldMap@WM_GREAT_LAKES_NAME-120-4000;~Great_Lakes_B:Great_Lakes_contours_WorldMap@wm_Great_Lakes-120-4000;OSM-water:Lake_and_River_contours_from_Open_Street_Maps@osm_water-0-4000;};{Regions::~Admin_L:States_and_Provinces_names_labeled_WorldMap@wm_World_Admin_name-120-2000;~Admin_B:States_and_Provinces_boundaries_WorldMap@wm_World_Admin-120-2000;~Countries_L:Nation_names_labeled_WorldMap@nation_name-2000-5000;Countries_L:Nation_names_labeled_WorldMap@nation_name-5000-30000;~Countries_B:Nations_boundaries_WorldMap@wm_World_Nations-120-15000;OSM-Admin:Administrative_boundaries_from_Open_Street_Maps@osm_admin-0-60000;};{Parcels::FA-address:Addresses_from_First_American_Parcel_Data@fa_address-0-0.5;FA-owner:Property_owner_from_First_American_Parcel_Data@fa_owner-0-0.5;~lines:Property_lines,_from_First_American@fa_parcel-0-1;lines:Property_lines,_from_First_American@fa_parcel-1-2;OSM-buildings:Building_contours_from_Open_Street_Maps@osm_buildings-0-7;};{People::population:People_per_block_per_Census_2000@blk_pop-0-5;income:Aggregate_Neighborhood_Income_and_number_of_homes,_per_Census-2000@bg_mhinc-0.7-10+blkgrpy-0.7-10;};{Services::~business:Yellow_Pages@nypages-0-1.2;business:Yellow_Pages@nypages-1.2-5;food:Restaurants_from_NavTeq@nv_restrnts-0-10;doctors:Physicians_specialties@physicianspecialty-0-5;};Landmarks:Cultural_Landmarks_WorldMap@wm_Cultural_Landmarks-120-240;Utilities:Utilities_WorldMap@wm_Utilities-120-720;Environment:Hydrology@prism-0-120;~Places:Places@gnis2-0-6+hotels-0-6;Places:Places@gnis2-6-24+hotels-6-24;OSM-place-names:Place_names_labeled_from_Open_Street_Maps@osm_place_names-0-30000;{Roads::lines:Road_lines_from_NavTeq@street-0-2000;names:Road_names_labeled_from_NavTeq@street_names-0-240;~OSM-lines:Road_lines_from_Open_Street_Maps@osm_roads-0.5-7000;OSM-lines:Road_lines_from_Open_Street_Maps@osm_roads-0-0.5;~OSM-names:Road_names_labeled_from_Open_Street_Maps@osm_road_names-0-7000;~routes:Routes_WorldMap@wm_Major_Routes-120-1000+wm_Minor_Routes-120-1000;routes:Routes_WorldMap@wm_Major_Routes-1000-5000+wm_Minor_Routes-1000-5000;~railways:Railroad_WorldMap@wm_Railroad_Track-120-2000;};{Towns::~borders:Borders@incorp-0-120;~towns:Cities,_towns@wtown-0-60;};plugin_photo;",
            "legendm": "{OSM::~buildings:Building_outlines@osm_buildings-0-60;~land:Land@osm_land-0-240000;~landuse:Land_usage_information@osm_landuse-0-7000;~place_names:Names_for_country,state,city_and_other small_places@osm_place_names-0-15000;~road_names:Road_names@osm_road_names-0-240;~roads:Roads@osm_roads-0-7000;~water:Water_outlines@osm_water-0-15000;};",
            "address": "",
            "vid": "",
            "passthrough": "",
            "tflogo": "1",
            "type": "map",
            "source": "best_available",
            "rgpopup": 5,
            "help": "<span><b>Double Click</b>: Local Data Reports and Queries<br /><b>Drag</b>: Browse the map<br />Buttons: <b>Full Screen</b>, <b>Reset Rotation</b>, <b>Search Location</b>, <b>Zoom</b>, <b>Map Layers</b><br /><br />Address bar examples:<br />1 Flagler St, Miami, FL<br />Miami<br />Miami, FL<br />33139<br />25.77 -80.19 (coordinates)</span>",
            "nfloors": 20,
            "nroomsperfloor": 10,
            "nshuttlepairs": 3
        };

        var defaultSpecs = "./specs.txt";

        var params = tf.urlapi.ParseURLAPIParameters(settings.fullURL, defaultURLParams);
        params[tf.consts.paramNameAppSpecs] = tf.js.GetNonEmptyString(params[tf.consts.paramNameAppSpecs], defaultSpecs);

        var useDebugResultSets = false;

        var defaultDLayerData1 = useDebugResultSets ? "./wikix2015-results.txt" : "http://n00.cs.fiu.edu/cgi-bin/arquery.cgi?category=wikix2015&vid=&tfaction=shortdisplayflash&filetype=.xml";
        var defaultDLayerData2 = useDebugResultSets ? "./iypages_demographics-results.txt" : "http://n00.cs.fiu.edu/cgi-bin/arquery.cgi?category=iypages_demographics&vid=&tfaction=shortdisplayflash&filetype=.xml";
        var defaultDLayerData3 = useDebugResultSets ? "./us_restaurants-results.txt" : "http://n00.cs.fiu.edu/cgi-bin/arquery.cgi?category=us_restaurants&vid=&tfaction=shortdisplayflash&filetype=.xml";
        var defaultDLayerData4 = useDebugResultSets ? "./iypages_demographics_sic_clustering-results.txt" : "http://n00.cs.fiu.edu/cgi-bin/arquery.cgi?category=iypages_demographics_sic_clustering&vid=&tfaction=shortdisplayflash&filetype=.xml&place_name=Query+stores&extraref=1&arcriteria=1&sic|=store+stores";

        var defaultDLayers = {
            "dLayerMarkerStyle1": [{
                "marker": "true", "font_height": 13, "font_color": "#000", "border_color": "#000", "border_width": 2, "zindex": 2, "line_opacity": 60,
                "line_width": 3, "line_color": "#fff", "marker_arrowlength": 14, "label": "$[L]", "marker_color": "#ffe57f", "marker_horpos": "left", "marker_verpos": "center", marker_opacity: 55, border_opacity: 60
            }, {
                "circle": "true", "circle_radius": 7, "line": true, "line_color": "#000", "line_width": 1, "zindex": 1
            }, {
                "circle": "true", "circle_radius": 6, "line": true, "line_color": "#fff59f", "line_width": 2, "fill": false, "zindex": 1
            }, {
                "circle": "true", "circle_radius": 4, "line": true, "line_color": "#000", "line_width": 1, "zindex": 1
            }],
            "dLayerMarkerHoverStyle1": [{
                "marker": "true", "font_height": 14, "font_color": "#ff0", "border_color": "#000", "border_width": 3, "zindex": 4,
                "line_width": 3, "line_color": "#00a",
                "marker_arrowlength": 12, "label": "$[L]", "marker_color": "#fff59f", "marker_horpos": "left", "marker_verpos": "center"
            }, {
                "circle": "true", "circle_radius": 7, "line": true, "line_color": "#000", "line_width": 1, "zindex": 1
            }, {
                "circle": "true", "circle_radius": 6, "line": true, "line_color": "#fff59f", "line_width": 2, "fill": true, "fill_color": "#fff59f", "fill_opacity": 50, "zindex": 4
            }, {
                "circle": "true", "circle_radius": 4, "line": true, "line_color": "#000", "line_width": 1, "zindex": 1
            }
            ],

            "dlayerlegend1": "WikiArticle-QUERY",
            "dlayerdata1": defaultDLayerData1,
            "dlayerselect1": "true",
            "dlayerfield1": "L",
            "dlayercolor1": "#ffe57f,0",

            "dLayerMarkerStyle2": [{
                "marker": "true", "font_height": 13, "font_color": "#000", "border_color": "#000", "border_width": 2, "zindex": 2,
                "line_color": "#fff", "marker_arrowlength": 16, "label": "$[L]", "marker_color": "#ffb27f", marker_opacity: 55, border_opacity: 60
            }, {
                "circle": "true", "circle_radius": 7, "line": true, "line_color": "#000", "line_width": 1, "zindex": 1
            }, {
                "circle": "true", "circle_radius": 6, "line": true, "line_color": "#ffb27f", "line_width": 2, "fill": false, "zindex": 1
            }, {
                "circle": "true", "circle_radius": 4, "line": true, "line_color": "#000", "line_width": 1, "zindex": 1
            }],
            "dLayerMarkerHoverStyle2": [{
                "marker": "true", "font_height": 14, "font_color": "#00b", "border_color": "#000", "border_width": 3, "zindex": 4, "line_color": "#000",
                "marker_arrowlength": 14, "label": "$[L]", "marker_color": "#ffd49f"
            }, {
                "shape": "true", "shape_points": 3, "shape_radius": 12, "line": true, "line_color": "#000", "line_width": 1, "zindex": 3
            }, {
                "shape": "true", "shape_points": 3, "shape_radius": 9, "line": true, "line_color": "#ffd49f", "line_width": 3, "fill": true, "fill_color": "#ffd49f", "fill_opacity": 50, "zindex": 3
            }, {
                "shape": "true", "shape_points": 3, "shape_radius": 6, "line": true, "line_color": "#000", "line_width": 1, "zindex": 3
            }],

            "dlayerlegend2": "Business-QUERY",
            "dlayerdata2": defaultDLayerData2,
            "dlayerselect2": "false",
            "dlayerfield2": "L",
            "dlayercolor2": "#ffb27f,0",

            "dLayerMarkerStyle3": [{
                "round_rect": true, zindex: 1, round_rect_width: 24, round_rect_height: 30, round_rect_radius: 6, line: true, line_color: "#005b86", line_width: 2, fill: true, fill_color: "#fff", fill_opacity: 70,
                icon_anchor: [0.5, 0.88], snaptopixel: true
            }, {
                "icon": "true", "icon_url": "./image/restaurants.png", "zindex": 2, scale: 1,
                icon_anchor: [0.5, 1], snaptopixel: true
            }
            ],
            "dLayerMarkerHoverStyle3": [{
                "round_rect": true, zindex: 1, round_rect_width: 24, round_rect_height: 30, round_rect_radius: 6, line: true, line_color: "#005b86", line_width: 2, fill: true, fill_color: "#fff", fill_opacity: 100,
                icon_anchor: [0.5, 0.88], snaptopixel: true
            }, {
                "icon": "true", "icon_url": "./image/restaurants.png", "zindex": 4, scale: 1,
                icon_anchor: [0.5, 1], snaptopixel: true
            }, {
                "marker": "true", "font_height": 14, "font_color": "#ffe", "border_color": "#000", "border_width": 2, "zindex": 4,
                "line_width": 2, "line_color": "#009",
                "marker_arrowlength": 16, "label": "$[Display_Label]", "marker_color": "#005b86", "marker_horpos": "right", "marker_verpos": "center", snaptopixel: true
            }
            ],

            "dlayerlegend3": "Restaurant-QUERY",
            "dlayerdata3": defaultDLayerData3,
            "dlayerselect3": "true",
            "dlayerfield3": "L",
            "dlayercolor3": "#7fb2ff,0",

            "dLayerMarkerStyle4": [{
                "marker": "true", "font_height": 13, "font_color": "#000", "border_color": "#000", "border_width": 2, "zindex": 2, "line_opacity": 60,
                "line_width": 3, "line_color": "#fff", "marker_arrowlength": 14, "label": "$[L]", "marker_color": "#bfbfef", "marker_horpos": "right", "marker_verpos": "bottom", marker_opacity: 55, border_opacity: 60
            }, {
                "circle": "true", "circle_radius": 7, "line": true, "line_color": "#000", "line_width": 1, "zindex": 1
            }, {
                "circle": "true", "circle_radius": 6, "line": true, "line_color": "#bfbfef", "line_width": 2, "fill": false, "zindex": 1
            }, {
                "circle": "true", "circle_radius": 4, "line": true, "line_color": "#000", "line_width": 1, "zindex": 1
            }
            ],

            "dLayerMarkerHoverStyle4": [{
                "marker": "true", "font_height": 14, "font_color": "#fff", "border_color": "#000", "border_width": 3, "zindex": 4,
                "line_width": 3, "line_color": "#000",
                "marker_arrowlength": 12, "label": "$[L]", "marker_color": "#cfcfff", "marker_horpos": "right", "marker_verpos": "bottom"
            }, {
                "circle": "true", "circle_radius": 7, "line": true, "line_color": "#000", "line_width": 1, "zindex": 1
            }, {
                "circle": "true", "circle_radius": 6, "line": true, "line_color": "#cfcfff", "line_width": 2, "fill": true, "fill_color": "#f5ff9f", "fill_opacity": 50, "zindex": 4
            }, {
                "circle": "true", "circle_radius": 4, "line": true, "line_color": "#000", "line_width": 1, "zindex": 1
            }
            ],

            "dlayerlegend4": "Stores-QUERY",
            "dlayerdata4": defaultDLayerData4,
            "dlayerselect4": "true",
            "dlayerfield4": "L",
            "dlayercolor4": "#7fb2ff,0",

            "dLayerMarkerStyle5": {
                "icon": "true", "icon_url": "$[L]", "zindex": 1, scale: 1.5
            },
            "dLayerMarkerHoverStyle5": [{
                "icon": "true", "icon_url": "$[L]", "zindex": 3, scale: 2
            }, {
                "marker": "true", "font_height": 14, "font_color": "#fff", "border_color": "#00a", "border_width": 2, "zindex": 2, "line_color": "#000", "line_width": 3,
                "marker_arrowlength": 16, "label": "$[Display_Label]", "marker_color": "#9fffd5", "marker_horpos": "right", "marker_verpos": "center", marker_opacity: 55, border_opacity: 60
            }
            ],

            "dlayerlegend5": undefined

            /*"dlayerlegend5": "Image-QUERY",
            "dlayerdata5": "http://acorn.cs.fiu.edu/cgi-bin/arquery.cgi?tester=&category=alta&vid=&tfaction=shortdisplayflash&filetype=.xml",
            "dlayerselect5": "true",
            "dlayerfield5": "L",
            "dlayercolor5": "#7fe5ff,0",

            "dlayerlegend6": undefined*/
        };

        if (!tf.js.GetIsNonEmptyArray(tf.urlapi.GetDLayersInfoFromURLParameters (params))) {
            params = tf.js.ShallowMerge(params, defaultDLayers);
            usingDefaultDLayers = true;
        }

        settings.onCreated = onCreated;

        animationSpeed = 10;

        settings.fullURL = params;
        settings.dLayersPreProcessServiceData = dLayersPreProcessServiceData;
        settings.onAppSpecsLoaded = onAppSpecsLoaded;
        settings.onRefresh = onRefresh;
        settings.initTables = initTables;

        urlapiApp = new tf.urlapi.AppFromSpecs(settings);
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

var g_HotelDemo = new tf.apps.HotelDemo.Demo({ fullURL: window.location.href });

