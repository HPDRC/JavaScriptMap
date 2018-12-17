"use strict";

tf.helpers.RouteLoader = function (settings) {

    var mainURL = "http://www.miamidade.gov/transit/WebServices/";
    var getRoutesService = mainURL + "BusRoutes/";
    var getRoutesDirectionsService = mainURL + "BusRouteDirections/";
    var getRouteShapeIdsService = mainURL + "BusRouteShapesByRoute/";
    var getRouteShapeService = mainURL + "BusRouteShape/?ShapeID=";
    var getRouteStopsService = mainURL + "BusRouteStops/";
    var getBusesService = mainURL + "Buses/";
    var getBusesRouteShapesByTrip = mainURL + "BusRouteShapesByTrip/"
    var getBusTrackerService = mainURL + "BusTracker/";

    var theThis;
    var routes, shapes, stops, buses, trips, nStops, nShapes, nBuses, nRoutes, nTrips;
    var onLoaded, routeIdList;
    var nShapesLoading, nShapeIdsLoading, nRouteStopsLoading, linesLoaded, busesLoaded, nTripsLoading;
    var loadingStops, loadingBuses;

    this.GetStop = function (stopId, thenCallBack) { return getStop(stopId, thenCallBack); }

    this.GetBus = function (busId, thenCallBack) { return getBus(busId, thenCallBack); }

    function getJSONFromService(url, thenCallBack) {
        if (!!(thenCallBack = tf.js.GetFunctionOrNull(thenCallBack))) {
            new tf.ajax.GetRequest({
                onDataLoaded: function (notification) {
                    var httpRequest = notification.httpRequest;
                    if (httpRequest.status == 200 && !!httpRequest.responseXML) {
                        var data = tf.helpers.XML2Object(httpRequest.responseXML.documentElement);
                        if (!!data) { thenCallBack(data); }
                    }
                },
                optionalScope: theThis,
                url: url,
                autoSend: true,
                useRedirect: true
            });
        }
    }

    function getStop(stopId, thenCallBack) {
        if (thenCallBack = tf.js.GetFunctionOrNull(thenCallBack)) {
            var url = getBusTrackerService;
            if (stopId != undefined) { url += '?StopID=' + stopId; }
            getJSONFromService(url, function (data) {
                var data = tf.js.GetIsValidObject(data.Record) ? data.Record : undefined;
                if (!!data) {
                    //data.pointCoords = [parseFloat(data.Longitude), parseFloat(data.Latitude)];
                }
                else { console.log('getStop failed for stopId: ' + stopId); }
                thenCallBack(data);
            });
        }
    }

    function getBus(busId, thenCallBack) {
        if (thenCallBack = tf.js.GetFunctionOrNull(thenCallBack)) {
            var url = getBusesService;
            if (busId != undefined) { url += '?BusID=' + busId; }
            getJSONFromService(url, function (data) {
                var data = tf.js.GetIsValidObject(data.Record) ? data.Record : undefined;
                if (!!data) {
                    data.pointCoords = [parseFloat(data.Longitude), parseFloat(data.Latitude)];
                }
                else { console.log('getBus failed for busId: ' + busId );}
                thenCallBack(data);
            });
        }
    }

    function loadShape(shapeId) {
        var shape = shapes[shapeId] ;
        if (shape == undefined) {
            ++nShapesLoading;
            shape = shapes[shapeId] = { shapeId: shapeId, coordinates: undefined };
            var url = getRouteShapeService + shapeId;
            getJSONFromService(url, function (data) {
                if (tf.js.GetIsArray(data.Record)) {
                    var coords = [];
                    data = data.Record;
                    for (var i in data) {
                        var d = data[i];
                        coords.push([parseFloat(d.Longitude), parseFloat(d.Latitude)]);
                    }
                    shape.coordinates = coords;
                    --nShapesLoading;
                    ++nShapes;
                    checkAllLoaded();
                }
            });
        }
        checkAllLoaded();
    }

    function loadShapes(routeid, dir) {
        var route = routes[routeid];
        if (!!route) {
            var routeDir = route.directions[dir];
            if (!!routeDir) {
                var shapeIds = routeDir.shapeIds;
                if (!!shapeIds) {
                    for (var i in shapeIds) {
                        var shapeId = shapeIds[i];
                        loadShape(shapeId);
                    }
                }
            }
        }
    }

    function loadShapeIds(routeid, dir) {
        var route = routes[routeid];
        if (!!route) {
            var url = getRouteShapeIdsService + "?RouteID=" + routeid + "&Dir=" + dir;
            getJSONFromService(url, function (data) {
                var shapeIds = {};
                if (tf.js.GetIsArray(data.Record)) {
                    data = data.Record;
                    for (var i in data) { var d = data[i]; shapeIds[d.ShapeID] = d.ShapeID; }
                }
                else if (tf.js.GetIsValidObject(data.Record)) {
                    shapeIds[data.Record.ShapeID] = data.Record.ShapeID;
                }
                route.directions[dir].shapeIds = shapeIds;
                --nShapeIdsLoading;
                loadShapes(routeid, dir);
                checkAllLoaded();
            });
        }
    }

    function doLoadStops(routeid, dir, tripid, thenCallBack) {
        var url = getRouteStopsService + "?RouteID=" + routeid + "&Dir=" + dir;
        if (tripid != undefined) { url += "&TripID=" + tripid; }
        ++nRouteStopsLoading;
        getJSONFromService(url, function (data) {
            thenCallBack(data);
            --nRouteStopsLoading;
            checkAllLoaded();
        });
    }

    function loadStops(routeid, dir) {
        var route = routes[routeid];
        if (!!route) {
            doLoadStops(routeid, dir, undefined, function (data) {
                if (tf.js.GetIsArray(data.Record)) {
                    /*<StopID>6936</StopID><StopName>NW 2 AV & NW 22 LN</StopName><Sequence>81</Sequence><Latitude>25.799005</Latitude><Longitude>-80.199108</Longitude>*/
                    var stopIds = [], sequence = 1;
                    data = data.Record;
                    for (var i in data) {
                        var d = data[i], sid = d.StopID;
                        if (d.Sequence != sequence) {
                            if (d.Sequence < sequence) {
                                console.log('stop ' + d.Sequence + 'out of sequence for route: ' + routeid);
                            }
                        }
                        ++sequence;
                        var existingStop = stops[sid];
                        if (existingStop == undefined) {
                            existingStop = stops[sid] = {
                                props: { pointCoords: [parseFloat(d.Longitude), parseFloat(d.Latitude)], name: d.StopName, StopID: sid },
                                nuses: 1, routesAndDirs: [{ routeid: routeid, dir: dir }]
                            };
                            ++nStops;
                        }
                        else {
                            if (existingStop.props.pointCoords[0] != parseFloat(d.Longitude) || existingStop.props.pointCoords[1] != parseFloat(d.Latitude)) {
                                console.log('stop coords differ in usage ' + sid);
                            }
                            ++existingStop.nuses;
                            existingStop.routesAndDirs.push({ routeid: routeid, dir: dir });
                        }
                        stopIds.push(sid);
                    }
                    route.directions[dir].stopIds = stopIds;
                }
                else {
                    console.log('failed to get stops array for route: ' + routeid);
                }
                checkAllLoaded();
            });
        }
    }

    function loadLines() {
        getJSONFromService(getRoutesDirectionsService, function (data) {
            if (tf.js.GetIsArray(data = data.Record)) {
                for (var i in data) {
                    //<RouteID>1</RouteID> <Direction>Southbound</Direction>
                    var d = data[i], rid = d.RouteID, r = routes[rid];
                    if (!!r) {
                        var dir = d.Direction;
                        var rd = d = r.directions[dir];
                        if (!!rd) {
                            console.log('duplicate direction: ' + dir + ' listed for route route: ' + rid);
                        }
                        else {
                            r.directions[dir] = { name: dir, shapeIds: {}, buses: {} };
                            loadShapeIds(rid, dir);
                            ++nShapeIdsLoading;
                            if (loadingStops) {
                                loadStops(rid, dir);
                            }
                        }
                    }
                    else {
                        //console.log('direction given to unknown route: ' + rid);
                    }
                }
                linesLoaded = true;
            }
        });
    }

    function onAllLoaded() {
        onLoaded({
            sender: theThis,
            routes: routes, shapes: shapes, stops: stops, buses: buses, trips: trips,
            nRoutes: nRoutes, nShapes: nShapes, nStops: nStops, nBuses: nBuses, nTrips: nTrips
        });
    }

    function checkAllLoaded() {
        if (busesLoaded && linesLoaded && (nShapeIdsLoading == 0) && (nShapesLoading == 0) && (nTripsLoading == 0) && (nRouteStopsLoading == 0)) {
            for (var i in trips) {
                var shapeId = trips[i].shapeId;
                var shape = shapes[shapeId];
                if (shape == undefined) {
                    console.log('trip with unknown shape: ' + trip.tripId)
                }
            }
            onAllLoaded();
        }
    }

    function loadTrip(tripId, routeId, dir) {
        var trip = trips[tripId];

        if (trip == undefined) {
            ++nTripsLoading;
            ++nTrips;
            trip = trips[tripId] = { tripId: tripId, shapeId: undefined, nuses: 1, stopIds: {}, nStops: 0 };
            var url = getBusesRouteShapesByTrip + "?TripID=" + tripId;
            getJSONFromService(url, function (data) {
                var shapeIds = {};
                if (tf.js.GetIsArray(data.Record)) {
                    console.log('unexpected trip with more than one route shape id: ' + tripId)
                }
                else if (tf.js.GetIsValidObject(data.Record)) {
                    loadShape(trips[tripId].shapeId = data.Record.ShapeID);
                }
                doLoadStops(routeId, dir, tripId, function (data) {
                    if (tf.js.GetIsArray(data.Record)) {
                        /*<StopID>6936</StopID><StopName>NW 2 AV & NW 22 LN</StopName><Sequence>81</Sequence><Latitude>25.799005</Latitude><Longitude>-80.199108</Longitude>*/
                        var stopIds = [];
                        data = data.Record;
                        for (var i in data) {
                            var d = data[i], sid = d.StopID;
                            trip.stopIds[sid] = sid;
                        }
                        trip.nStops = data.length;
                    }
                    --nTripsLoading;
                    checkAllLoaded();
                });
            });
        }
        else {
            ++trip.nuses;
            console.log('trip being reused: ' + tripId);
        }
        checkAllLoaded();
    }

    function loadBuses() {
        getJSONFromService(getBusesService, function (data) {
            if (tf.js.GetIsArray(data = data.Record)) {
                buses = {};
                trips = {};
                for (var i in data) {
                    var d = data[i], rid = d.RouteID;
                    if (routeIdList == undefined || routeIdList[rid]) {
                        var bid = d.BusID;
                        var route = routes[rid];
                        if (buses[bid] != undefined) { console.log('Duplicate bus id in bus service: ' + bid); }
                        d.pointCoords = [parseFloat(d.Longitude), parseFloat(d.Latitude)];
                        buses[bid] = { props: d };
                        loadTrip(d.TripID, rid, d.ServiceDirection);
                        if (route) {
                            var bdir = d.ServiceDirection;
                            var dir = route.directions[bdir];

                            if (dir) {
                                if (dir.buses[bid] != undefined) { console.log('Bus id in bus service: ' + bid + ' inserted more than once into route: ' + rid + ' direction: ' + bdir); }
                                dir.buses[bid] = d.BusID;
                            }
                            else { console.log('Bus id with unknown direction in route in bus service: ' + bid + ' route:' + rid + ' dir: ' + bdir); }
                        }
                        else { console.log('Bus id without route in bus service: ' + bid + ' route:' + rid); }
                        ++nBuses;
                    }
                }
                busesLoaded = true;
                checkAllLoaded();
            }
        });
        checkAllLoaded();
    }

    function loadRoutes() {
        getJSONFromService(getRoutesService, function (data) {
            if (tf.js.GetIsArray(data = data.Record)) {
                routes = {};
                stops = {};
                for (var i in data) {
                    var d = data[i], rid = d.RouteID;
                    if (routeIdList == undefined || routeIdList[rid]) {
                        routes[rid] = { directions: {}, props: d };
                        ++nRoutes;
                    }
                }
                if (loadingBuses) {
                    loadBuses();
                }
                else {
                    busesLoaded = true;
                }
                loadLines();
            }
        });
        checkAllLoaded();
    }

    function initialize() {
        nRouteStopsLoading = nShapesLoading = nShapeIdsLoading = nTripsLoading = 0;
        nTrips = nShapes = nBuses = nStops = nRoutes = 0;
        shapes = {};
        if (tf.js.GetIsValidObject(settings)) {
            loadingStops = !!settings.loadStops;
            loadingBuses = !!settings.loadBuses;
            if (onLoaded = tf.js.GetFunctionOrNull(settings.onLoaded)) {
                routeIdList = settings.routeIdList;
                loadRoutes();
            }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.helpers.LoadRoutesToFile = function (name, routeIdList) {
    new tf.helpers.RouteLoader({
        routeIdList: routeIdList,
        onLoaded: function (notification) {
            if (tf.js.GetIsValidObject(notification.routes)) {
                tf.GetDebug().FileLog(name, notification.routes);
            }
        }
    });
}
