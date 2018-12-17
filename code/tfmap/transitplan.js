"use strict";

tf.Transit.PlanTripSteps = {
    fromStartLocation: 0,
    walkFromStartToStop: 1,
    takeTripAtStop: 2,
    leaveTripAtStop: 3,
    walkFromStopToNearbyStop: 4,
    walkFromStopToEndLocation: 5,
    arriveAtEndLocation: 1000
};

tf.Transit.WalkCalls = function (settings) {
    var theThis, onCompleteCB, walkCalls, nWalkCallsToMake, nWalkCallsCompleted, isFinished;

    this.GetSettings = function () { return settings; }

    this.Cancel = function () {
        if(!isFinished) {
            isFinished = true;
            if (walkCalls.length > 0) {
                var wc = walkCalls;
                walkCalls = [];
                for (var i in wc) {
                    wc[i].routing.Cancel();
                }
            }
        }
    }

    function checkWalkCallsCompleted() {
        if (!isFinished) {
            if (nWalkCallsCompleted == nWalkCallsToMake) {
                isFinished = true;
                if (!!onCompleteCB) {
                    var occb = onCompleteCB, wcs = walkCalls;
                    onCompleteCB = undefined;
                    walkCalls = [];
                    occb({ sender: theThis, walkCalls: wcs });
                }
            }
        }
    }

    function onWalkCallCompleted(notification) {
        if (!isFinished) {
            ++nWalkCallsCompleted;
            walkCalls[notification.requestProps.index].notification = notification;
            checkWalkCallsCompleted();
        }
    }

    function makeWalkCall(fromTo) {
        var index = walkCalls.length;
        var lineStringCoords = [fromTo.fromCoords.slice(0), fromTo.toCoords.slice(0)];
        var routing =  new tf.services.Routing({
            findAlternatives: false, level: 18, lineStringCoords: lineStringCoords,
            mode: tf.consts.routingServiceModeFoot, optionalScope: theThis, instructions: true,
            callBack: onWalkCallCompleted, requestProps: { index: index }
        });
        walkCalls.push({ routing: routing });
    }

    function initialize() {
        nWalkCallsCompleted = nWalkCallsToMake = 0;
        walkCalls = [];
        isFinished = false;
        if(tf.js.GetIsValidObject(settings) && !!settings.fromToCoords) {
            if (!!(onCompleteCB = tf.js.GetFunctionOrNull(settings.onCompleted))) {
                var fromToCoords = settings.fromToCoords;
                if (!tf.js.GetIsArray(fromToCoords)) { fromToCoords = [fromToCoords]; }
                if ((nWalkCallsToMake = fromToCoords.length) > 0) {
                    for (var i = 0; i < nWalkCallsToMake; ++i) { makeWalkCall(fromToCoords[i]); }
                }
            }
        }
        checkWalkCallsCompleted();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.Transit.PlanService = function (settings) {
    var theThis, planSettings, defaultErrorMessage, instructionsAndRouteGeom, superCancel, onFullDirectionsLoadedCB;
    var walkCalls;

    this.GetInstructionsAndRouteGeom = function () { return instructionsAndRouteGeom; }

    this.GetPlan = function (from, to) {
        var dateRequested = new Date(), dateRequestedTimeStamp = tf.js.GetTimeStampFromDate(dateRequested);
        planSettings.date = dateRequestedTimeStamp;
        planSettings.x1 = from[0];
        planSettings.y1 = from[1];
        planSettings.x2 = to[0];
        planSettings.y2 = to[1];
        theThis.RefreshNow(planSettings);
    }

    function getInstructionsAndRouteGeom(data) {
        var success = false, extent, total_distance = 0, total_time = 0;
        var instructions = [];
        var mapFeatureGeom;
        var message = defaultErrorMessage;

        clearWalkCalls();

        if (tf.js.GetIsValidObject(data) && (data.success)) {
            if (data.nPlans > 0) {
                var plan = data.plans[0], steps = plan.steps, nSteps = steps.length;
                var lastStep = steps[nSteps - 1], prevStep;
                var lastLengthInMeters = 0;
                var routeCoords = [];
                var fromToCoords = [];
                total_time = plan.endHMS - plan.startHMS;
                total_distance = (lastStep.tripkm + lastStep.walkkm) * 1000;
                for (var i = 0; i < nSteps; ++i) {
                    var step = steps[i], coords = step.coords;
                    var lengthInMeters = (step.tripkm + step.walkkm) * 1000;
                    var instructionData = {
                        index: i,
                        step: step,
                        geometry: { type: 'point', coordinates: coords },
                        properties: { instructionCode: step.type, streetName: "", instruction: step.desc, lengthMeters: lengthInMeters - lastLengthInMeters, postTurnDirection: 0 }
                    };
                    lastLengthInMeters = lengthInMeters;
                    var hms = tf.js.TranslateHourMinSec(step.hms);
                    switch (step.type) {
                        case tf.Transit.PlanTripSteps.walkFromStartToStop:
                            instructionData.fromCoords = data.startCoords;
                            instructionData.toCoords = coords;
                            break;
                        case tf.Transit.PlanTripSteps.walkFromStopToNearbyStop:
                            instructionData.fromCoords = prevStep.coords;
                            instructionData.toCoords = coords;
                            break;
                        case tf.Transit.PlanTripSteps.walkFromStopToEndLocation:
                            instructionData.fromCoords = prevStep.coords;
                            instructionData.toCoords = coords;
                            break;
                        case tf.Transit.PlanTripSteps.leaveTripAtStop:
                        case tf.Transit.PlanTripSteps.takeTripAtStop:
                            instructionData.properties.instruction = hms.HM + " - " + instructionData.properties.instruction;
                            break;
                    }
                    if (instructionData.fromCoords != undefined) {
                        fromToCoords.push({ fromCoords: instructionData.fromCoords, toCoords: instructionData.toCoords, instructionData: instructionData });
                    }
                    instructions.push(instructionData);
                    extent = tf.js.UpdateMapExtent(extent, coords);
                    routeCoords.push(coords.slice(0));
                    prevStep = step;
                }
                message = "Found route between points"
                success = true;
                var mapFeatureGeomSettings = { type: 'linestring', coordinates: routeCoords };
                mapFeatureGeom = new tf.map.FeatureGeom(mapFeatureGeomSettings);
                if (fromToCoords.length > 0) {
                    walkCalls = new tf.Transit.WalkCalls({ fromToCoords: fromToCoords, onCompleted: onWalkCallsCompleted });
                }
            }
        }
        return {
            plan: plan, transitInstructions: true, total_distance: total_distance, total_time: total_time,
            instructions: instructions, message: message, routeGeom: mapFeatureGeom, success: success, extent: extent
        };
    };

    function preProcessServiceData(data) {
        instructionsAndRouteGeom = getInstructionsAndRouteGeom(data);
        checkFullDirectionsLoaded();
        return undefined;
    }

    function cancelHook() {
        clearWalkCalls();
        superCancel.apply(theThis, arguments);
    }

    function clearWalkCalls() { if (!!walkCalls) { walkCalls.Cancel(); walkCalls = undefined; } }

    function onWalkCallsCompleted(notification) {
        var wkSettings = notification.sender.GetSettings();
        var fromToCoords = wkSettings.fromToCoords;
        var wc = notification.walkCalls;
        if (fromToCoords.length == wc.length) {
            var totalDiffMeters = 0;
            var nInstructions = instructionsAndRouteGeom.instructions.length;
            for (var i = 0; i < fromToCoords.length; ++i) {
                var fromToItem = fromToCoords[i], instructionData = fromToItem.instructionData;
                var walkNotification = wc[i].notification;
                if (!!walkNotification && tf.js.GetIsValidObject(walkNotification.route_summary)) {
                    var fromMeters = instructionData.properties.lengthMeters;
                    var toMeters = walkNotification.route_summary.total_distance;
                    var thisDiffMeters = toMeters - fromMeters;
                    var thisDiffKM = thisDiffMeters / 1000;
                    totalDiffMeters += thisDiffMeters;
                    instructionData.properties.lengthMeters = toMeters;
                    for (var j = instructionData.index; j < nInstructions; ++j) {
                        var id = instructionsAndRouteGeom.instructions[j], step = id.step;
                        step.walkkm += thisDiffKM;
                    }
                }
            }
            instructionsAndRouteGeom.total_distance += totalDiffMeters;
        }
        walkCalls = undefined;
        checkFullDirectionsLoaded();
    }

    function checkFullDirectionsLoaded() { if (walkCalls == undefined) { onFullDirectionsLoaded(); } }

    function onFullDirectionsLoaded() { if (!!onFullDirectionsLoadedCB) { onFullDirectionsLoadedCB({ sender: theThis }); } }

    function initialize() {
        onFullDirectionsLoadedCB = tf.js.GetFunctionOrNull(settings.onFullDirectionsLoaded);
        defaultErrorMessage = "Transit server not available ";
        planSettings = {
            x1: 0, y1: 0, x2: 0, y2: 0,
            r1: 3,    // km
            r2: 3,    // km
            maxmins: 180,
            maxtrips: 3,
            maxstopr: 2,  //km
            maxplans: 1,
            mintripdist: 0.5    //km
        };
        instructionsAndRouteGeom = getInstructionsAndRouteGeom(undefined);
        tf.Transit.BackendService.call(theThis, tf.js.ShallowMerge({ serviceName: "plans", preProcessServiceData: preProcessServiceData }, settings));
        superCancel = theThis.Cancel;
        theThis.Cancel = cancelHook;
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.Transit.PlanService, tf.Transit.BackendService);
