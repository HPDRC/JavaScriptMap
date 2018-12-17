"use strict";

tf.map.MapSphere = new ol.Sphere(6378137);

tf.js.GetLegendCompositesStrs = function (decodedLegend, atGivenResolution) {
    var m1H = "", m1M = "", m2 = "";

    function getCompositesPartials(visible, composites) {
        var count = 0, m1Mpartial = "", m1Hpartial = "", m2partial = "";
        if (visible && tf.js.GetIsNonEmptyArray(composites)) {
            var tolerance = 0.00001;
            var nComposites = composites.length;
            var separatorM1 = "";
            var separatorM2 = "";
            for (var i = 0; i < nComposites; ++i) {
                var composite = composites[i];
                var willAdd = atGivenResolution == undefined ? true : (composite.min - tolerance <= atGivenResolution && composite.max + tolerance >= atGivenResolution);
                if (willAdd) {
                    m1Mpartial += separatorM1 + composite.prefix + composite.suffixM;
                    m1Hpartial += separatorM1 + composite.prefix + composite.suffixH;
                    m2partial += separatorM2 + composite.value;
                    separatorM1 = "+";
                    separatorM2 = ",";
                    ++count;
                }
            }
        }
        return { count: count, m1Mpartial: m1Mpartial, m1Hpartial: m1Hpartial, m2partial: m2partial };
    }

    function addCompositePartials(alreadyAdded, compositePartials) {
        var willAdd = compositePartials.count > 0;
        if (willAdd) {
            var m1MSeparator = alreadyAdded ? '+' : '';
            var m2Separator = alreadyAdded ? ',' : '';
            m1M += m1MSeparator + compositePartials.m1Mpartial;
            m1H += m1MSeparator + compositePartials.m1Hpartial;
            m2 += m2Separator + compositePartials.m2partial;
        }
        return willAdd;
    }

    if (tf.js.GetIsNonEmptyArray(decodedLegend)) {
        var nItems = decodedLegend.length, added = false;
        for (var i = 0; i < nItems; ++i) {
            var item = decodedLegend[i];
            if (tf.js.GetIsNonEmptyArray(item.groups)) {
                var nGroups = item.groups.length;
                for (var j = 0; j < nGroups ; ++j) {
                    if (addCompositePartials(added, getCompositesPartials(item.groups[j].visible, item.groups[j].composites))) { added = true; }
                }
            }
            else { if (addCompositePartials(added, getCompositesPartials(item.visible, item.composites))) { added = true }; }
        }
    }

    return { m1H: m1H, m1M: m1M, m2: m2 };
};

tf.js.DecodeLegend = function(legendStr) {
    var result = [];

    function readVisibleNameDesc(nameAndDesc, forceVisible) {
        var visible = !!forceVisible, name = "", desc = "";
        if (tf.js.GetIsNonEmptyString(nameAndDesc)) {
            var split = nameAndDesc.split(':'), name = split[0].replace(/\_/g, ' ');
            if (name.length > 0) { if (name[0] == '~') { visible = true; name = name.substr(1); } }
            if (split.length > 1) { desc = split[1].replace(/\_/g, ' '); } else { desc = name; }
        }
        return { visible: visible, name: name, desc: desc };
    };

    function readComposite(compositeStr) {
        var result;
        if (tf.js.GetIsNonEmptyString(compositeStr)) {
            var parts = compositeStr.split("-"), nParts = parts.length;
            var composite = { prefix: "", value: "", suffixM: "", suffixH: "", min: 10e10, max: -1 };
            // e.g. street.l_ else downward compatible else e.g. flpropertiesyear-0-0.15
            if (nParts == 1) { composite.value = composite.prefix = compositeStr; composite.min = -1; composite.max = 150; }
            else if (nParts == 2) {
                composite.value = composite.prefix = compositeStr;
                var digitMin = parts[1].substr(0, 1), digitMax = parts[1].substr(1, 1);
                if (digitMin == "_") { composite.min = 0; }
                else { composite.min = Math.pow(2, (parseInt(digitMin, 10))); if (composite.min > 150) composite.min = 150; }
                if (digitMax == "_") { composite.max = 0.999; }
                else { composite.max = Math.pow(2, (parseInt(digitMax, 10) + 1)) - 0.001; if (composite.max > 150) composite.max = 150; }
            }
            else if ((nParts == 3) || (nParts == 4)) {
                composite.prefix = parts[0] + "-" + parts[1] + "-" + parts[2] + "-";
                composite.value = parts[0];
                composite.min = parseFloat(parts[1]);
                composite.max = parseFloat(parts[2]);
                if (composite.min > composite.max) { swap = composite.min; composite.min = composite.max; composite.max = swap; }
                if (nParts == 4) {
                    var suffixes = parts[3].split("||");
                    composite.suffixH = suffixes[0];
                    composite.suffixM = (suffixes.length == 2) ? suffixes[1] : suffixes[0];
                }
            }
            else { composite = undefined; }
            result = composite;
        }
        return result;
    };

    function readComposites(compositesStr) {
        var composites = [];
        var max = undefined, min = undefined;
        if (tf.js.GetIsNonEmptyString(compositesStr)) {
            var compositesArray = compositesStr.split('+'), nComposites = compositesArray.length;
            for (var i = 0; i < nComposites; ++i) {
                var ce = readComposite(compositesArray[i]);
                if (ce != undefined) {
                    if (min == undefined || min > ce.min) { min = ce.min; }
                    if (max == undefined || max > ce.max) { max = ce.max; }
                    composites.push(ce);
                }
            }
        }
        return { composites: composites, min: min, max: max };
    };

    function readGroups(groupStr, forceVisible) {
        var result = [];
        if (tf.js.GetIsNonEmptyString(groupStr)) {
            var groups = groupStr.split(';'), nGroups = groups.length;
            if (nGroups > 0) {
                for (var i = 0; i < nGroups; ++i) {
                    var group = groups[i], element = undefined;
                    var nameAndComposites = group.split('@');
                    if (nameAndComposites.length == 2) {
                        var compositesResult = readComposites(nameAndComposites[1]);
                        if (compositesResult.composites.length > 0) {
                            element = tf.js.ShallowMerge(compositesResult, readVisibleNameDesc(nameAndComposites[0], forceVisible));
                        }
                    }
                    if (element != undefined) { result.push(element); }
                }
            }
        }
        return result;
    };

    if (tf.js.GetIsNonEmptyString(legendStr)) {
        var groupSets = legendStr.split("};"), nGroupSets = groupSets.length;
        for (var i = 0; i < nGroupSets; ++i) {
            var groupSet = groupSets[i], groupSetLen = groupSet.length, element = undefined;
            if (groupSetLen > 0) {
                var beforeGroupSetAndGroupSet = groupSet.split('{');
                if (beforeGroupSetAndGroupSet.length == 2) {
                    var groups = readGroups(beforeGroupSetAndGroupSet[0]);
                    if (groups.length > 0) { result.push.apply(result, groups); }
                    groupSet = beforeGroupSetAndGroupSet[1];
                    groupSetLen = groupSet.length;
                }
                if (groupSetLen) {
                    var nameAndGroups = groupSet.split('::');
                    if (nameAndGroups.length == 2) {
                        var visibleNameDesc = readVisibleNameDesc(nameAndGroups[0]);
                        var groups = readGroups(nameAndGroups[1], visibleNameDesc.visible);
                        if (groups.length > 0) { element = { groups: groups, name: visibleNameDesc.name, desc: visibleNameDesc.desc }; }
                    }
                }
            }
            if (element != undefined) { result.push(element); }
        }
    }
    return result;
};

// DOMParser support for browsers that may lack it, slightly adapted from https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
(function (DOMParser) {
    var proto = DOMParser.prototype, nativeParse = proto.parseFromString;
    // Firefox/Opera/IE throw errors on unsupported types
    try {
        // WebKit returns null on unsupported types
        if ((new DOMParser()).parseFromString("", "text/html")) {
            // text/html parsing is natively supported
            return;
        }
    } catch (ex) { }
    proto.parseFromString = function (markup, type) {
        if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
            var doc = document.implementation.createHTMLDocument("");
            if (markup.toLowerCase().indexOf('<!doctype') > -1) { doc.documentElement.innerHTML = markup; }
            else { doc.body.innerHTML = markup; }
            return doc;
        } else { return nativeParse.apply(this, arguments); }
    };
}(DOMParser));

/*if (!String.prototype.trim) {
    Object.defineProperty(String.prototype, 'trim', {
        value: function () { return this.replace(/^\s+|\s+$/g, ''); },
        writable: false, enumerable: false, configurable: false
    });
}*/

/**
 * @public
 * @function
 * @summary - Retrieves the {@link tf.events.DocMouseListener} singleton
 * @returns {tf.events.DocMouseListener} - | {@link tf.events.DocMouseListener} the singleton
*/
tf.GetDocMouseListener = function () { if (!tf.g_DocMouseListener) { tf.g_DocMouseListener = new tf.events.DocMouseListener(); } return tf.g_DocMouseListener; }

/**
 * @public
 * @function
 * @summary - Retrieves the {@link tf.styles.Styles} singleton
 * @param {tf.types.APIStyleSpecs} alternativeSpecs - overrides the default API style specifications, if defined the first time an application calls this function
 * @returns {tf.styles.Styles} - | {@link tf.styles.Styles} the singleton
*/
tf.GetStyles = function (alternativeSpecs) { if (!tf.g_Styles) { tf.g_Styles = new tf.styles.Styles(alternativeSpecs); } return tf.g_Styles; }

/**
 * @public
 * @function
 * @summary - Retrieves the {@link tf.js.Counter} singleton
 * @returns {tf.js.Counter} - | {@link tf.js.Counter} the singleton
*/
tf.GetGlobalCounter = function () { if (!tf.g_Counter) { tf.g_Counter = new tf.js.Counter(); } return tf.g_Counter; }

tf.GetNextDynCSSClassName = function () { return "tf-dyn-css-" + tf.GetGlobalCounter().GetNext(); }

/**
 * @public
 * @function
 * @summary - Retrieves the {@link tf.Debug} singleton
 * @returns {tf.Debug} - | {@link tf.Debug} the singleton
*/
tf.GetDebug = function () { if (!tf.g_Debug) { tf.g_Debug = new tf.Debug(); } return tf.g_Debug; }

/**
 * @public
 * @function
 * @summary - Retrieves a JavaScript {@link object} from an XML node, such as one in httpRequest.responseXML.documentElement
 * @param {object} XMLNode - the given XML node
 * @returns {object} - | {@link object} the object
*/
tf.helpers.XML2Object = function (XMLNode) {

    var dataObj = {};

    function Add(name, value) {
        if (dataObj[name]) { if (!tf.js.GetIsArray(dataObj[name])) { dataObj[name] = [dataObj[name]]; } dataObj[name][dataObj[name].length] = value; }
        else { dataObj[name] = value; }
    };

    if (tf.js.GetIsValidObject(XMLNode) && tf.js.GetIsValidObject(XMLNode.attributes) && tf.js.GetIsValidObject(XMLNode.childNodes)) {
        var c, cn;
        for (c = 0; cn = XMLNode.attributes[c]; ++c) { Add(cn.name, cn.value); }

        for (c = 0; cn = XMLNode.childNodes[c]; ++c) {
            if (cn.nodeType == 1) {
                if (cn.childNodes.length == 1 && cn.firstChild.nodeType == 3) { Add(cn.nodeName, cn.firstChild.nodeValue); }
                else { Add(cn.nodeName, tf.helpers.XML2Object(cn)); }
            }
        }
    }
    return dataObj;
};

/**
 * @public
 * @function
 * @summary - Retrieves a JavaScript {@link object} from an XML string
 * @param {string} XMLString - the given XML string
 * @returns {object} - | {@link object} the object
*/
tf.helpers.XMLString2Object = function (XMLString) {
    var dataObj = {};

    if (tf.js.GetIsNonEmptyString(XMLString)) {
        var doc = new DOMParser().parseFromString(XMLString, "application/xml");
        if (tf.js.GetIsValidObject(doc) && tf.js.GetIsValidObject(doc.documentElement)) {
            dataObj = tf.helpers.XML2Object(doc.documentElement);
        }
    }
    return dataObj;
};

tf.js.ParseSplitStringWithSeparators = function (str, separator) {
    var result = {};
    if (tf.js.GetIsNonEmptyString(str) && tf.js.GetIsNonEmptyString(separator)) {
        str = str.split(separator);
        var nStr = str.length;
        for (var i = 0; i < nStr; ++i) {
            var thisStr = str[i];
            result[thisStr.toLowerCase()] = thisStr;
        }
    }
    return result;
};

tf.js.AddStringWithSeparators = function (strBeingAddedTo, strToBeAdded, separator) {
    if (tf.js.GetIsNonEmptyString(strToBeAdded) && tf.js.GetIsNonEmptyString(separator)) {
        if (tf.js.GetIsNonEmptyString(strBeingAddedTo)) { strBeingAddedTo += separator + strToBeAdded; }
        else { strBeingAddedTo = strToBeAdded; }
    }
    return strBeingAddedTo;
};

tf.js.AddStringsWithSeparatorsIfAbsent = function (strBeingAddedTo, strsToBeAdded, separator) {
    if (tf.js.GetIsNonEmptyString(separator)) {
        var parsed = tf.js.ParseSplitStringWithSeparators(strBeingAddedTo, separator);
        if (tf.js.GetIsValidObject(parsed)) {
            if (!tf.js.GetIsNonEmptyArray(strsToBeAdded)) { strsToBeAdded = [strsToBeAdded]; }
            var nStrsToBeAdded = strsToBeAdded.length;
            for (var i = 0; i < nStrsToBeAdded; ++i) {
                var strToBeAdded = strsToBeAdded[i];
                if (tf.js.GetIsNonEmptyString(strToBeAdded)) {
                    if (!parsed[strToBeAdded]) {
                        strBeingAddedTo = tf.js.AddStringWithSeparators(strBeingAddedTo, strToBeAdded, separator);
                    }
                }
            }
        }
    }
    return strBeingAddedTo;
};

/**
 * Object returned by {@link tf.helpers.HitTestMapCoordinatesArray}
 * @public
 * @typedef {object} tf.types.HitTestCoordinatesArrayResult
 * @property {number} minDistance - the minimum distance
 * @property {number} minDistanceIndex - the index of the array containing the initial coordinates of the segment where the minimum distance was found
 */

tf.helpers.HitTestSegment = function (segStart, segEnd, coordinates) {
    var distance, closestPoint, angle = 0;
    var isStart = false, isEnd = false, isSeg = false;
    var proj;

    if (tf.js.GetIsArrayWithMinLength(segStart, 2) && tf.js.GetIsArrayWithMinLength(segEnd, 2) && tf.js.GetIsArrayWithMinLength(coordinates, 2)) {
        var startLon = segStart[0], startLat = segStart[1];
        var endLon = segEnd[0], endLat = segEnd[1];
        if (startLon == endLon && startLat == endLat) { closestPoint = [startLon, startLat]; isEnd = true; proj = 1; }
        else {
            var coordsLon = coordinates[0], coordsLat = coordinates[1];
            var lonCoordsToStart = coordsLon - startLon, latCoordsToStart = coordsLat - startLat;
            var lonEndToStart = endLon - startLon, latEndToStart = endLat - startLat;
            var distEndStart = lonEndToStart * lonEndToStart + latEndToStart * latEndToStart;
            var proj = (lonCoordsToStart * lonEndToStart + latCoordsToStart * latEndToStart) / distEndStart;

            if (proj < 0) { closestPoint = [startLon, startLat]; isStart = true; proj = 0; }
            else if (proj > 1) { closestPoint = [endLon, endLat]; isEnd = true; proj = 1; }
            else {
                closestPoint = [startLon + lonEndToStart * proj, startLat + latEndToStart * proj];
                isSeg = true;
            }
        }
        //distance = tf.units.GetDistanceInMetersBetweenMapCoords(coordinates, closestPoint);
        distance = tf.units.GetHaversineDistance(coordinates, closestPoint);
        var w = (coordinates[0] - segStart[0]) * (segEnd[1] - segStart[1]) - (coordinates[1] - segStart[1]) * (segEnd[0] - segStart[0]);
        angle = w == 0 ? 0 : (w > 0 ? 1 : -1);
    }
    return { distance: distance, closestPoint: closestPoint, isStart: isStart, isEnd: isEnd, isSeg: isSeg, proj: proj, angle: angle };
};

/**
 * @public
 * @function
 * @summary - Calculates the minimum distance between given map coordinates and a given segment defined by an array of map coordinates
 * @param {array<tf.types.mapCoordinates>} mapCoordinatesArray - the array of map coordinates defining a segment
 * @param {tf.types.mapCoordinates} coordinates - the given coordinates
 * @returns {tf.types.HitTestCoordinatesArrayResult} - | {@link tf.types.HitTestCoordinatesArrayResult} the result
*/

tf.helpers.HitTestMapCoordinatesArray = function(mapCoordinatesArray, coordinates, startSegIndex, startMinProj, endSegIndex, acceptDistance, angleSign, minDistanceDelta) {
    var minDistance = -1;
    var minDistanceIndex = -1;
    var closestPoint = undefined, proj = undefined, angle = 0;

    if (tf.js.GetIsArrayWithMinLength(mapCoordinatesArray, 1) && tf.js.GetIsArrayWithMinLength(mapCoordinatesArray[0], 2) && tf.js.GetIsArrayWithMinLength(coordinates, 2)) {
        var nSegs = mapCoordinatesArray.length - 1;
        var mapCoordinatesArrayUse;

        if (nSegs == 0) { mapCoordinatesArrayUse = [mapCoordinatesArray[0], mapCoordinatesArray[0]]; nSegs = 1; }
        else { mapCoordinatesArrayUse = mapCoordinatesArray; }

        if (startSegIndex == undefined) { startSegIndex = 0; }
        if (startMinProj == undefined) { startMinProj = 0; }

        if (acceptDistance == undefined) { acceptDistance = 0; }

        if (minDistanceDelta == undefined || minDistanceDelta < 0) { minDistanceDelta = 0; }

        for (var i = startSegIndex ; i < nSegs; ++i) {
            var startSeg = mapCoordinatesArrayUse[i];
            var endSeg = mapCoordinatesArrayUse[1 + i];
            var hitSeg = tf.helpers.HitTestSegment(startSeg, endSeg, coordinates);
            if (hitSeg.distance != undefined && hitSeg.proj > startMinProj && (minDistance == -1 || (hitSeg.distance + minDistanceDelta) < minDistance)) {
                if (angleSign === undefined || ((angleSign >= 0 && hitSeg.angle >= 0) || (angleSign <= 0 && hitSeg.angle <= 0))) {
                    minDistance = hitSeg.distance;
                    closestPoint = !!hitSeg.closestPoint ? hitSeg.closestPoint.slice(0) : undefined;
                    minDistanceIndex = i;
                    proj = hitSeg.proj;
                    angle = hitSeg.angle;
                    if (endSegIndex != undefined && i >= endSegIndex) { break; }
                    if (minDistance < acceptDistance) {
                        break;
                    }
                }
            }
            startMinProj = 0;
        }
    }
    //else { console.log('invalid array'); }

    return { minDistance: minDistance, minDistanceIndex: minDistanceIndex, closestPoint: closestPoint, proj: proj, angle: angle };
}

/**
 * @public
 * @function
 * @summary - Calculates the average coordinates of a given array of map coordinates
 * @param {array<tf.types.mapCoordinates>} mapCoordinatesArray - the array of map coordinates
 * @param {boolean} skipLastCoordBool - if <b>true</b> the last coordinate in the array is not included in the average
 * @returns {tf.types.mapCoordinates} - | {@link tf.types.mapCoordinates} the average coordinates
*/
tf.helpers.CalcAverageCoordinates = function (coordsArray, skipLastCoordBool) {
    var avg = [0, 0];

    if (tf.js.GetIsNonEmptyArray(coordsArray) && tf.js.GetIsArrayWithLength(coordsArray[0], 2)) {
        var nCoords = 0;
        var length = coordsArray.length;

        skipLastCoordBool = !!skipLastCoordBool;

        for (var i in coordsArray) {
            var coords = coordsArray[i];

            if (!!coords) {
                if (coords.length == 2) {
                    avg[0] += coords[0];
                    avg[1] += coords[1];
                    nCoords++;
                }
                else { break; }
            }
            else { break; }
            if (skipLastCoordBool && i == length - 2) { break; }
        }
        if (nCoords) { avg[0] /= nCoords; avg[1] /= nCoords; }
    }
    return avg;
}

// tf.dom

tf.dom.SelectAndCopyToClipboard = function (elem) {
    return tf.dom.SelectAndCopyToDocClipboard(document, elem);
};

tf.dom.SelectAndCopyToDocClipboard = function (theDoc, elem) {
    var ok = false;
    var eleme = tf.dom.GetHTMLElementFrom(elem);
    if (eleme) {
        try {
            eleme.select();
            theDoc.execCommand('copy');
            ok = true;
        }
        catch (e) { }
    }
    return ok;
};

tf.dom.OnRangeChange = function (rangeInputElmt, listener) {

    rangeInputElmt = tf.dom.GetHTMLElementFrom(rangeInputElmt);

    var inputEvtHasNeverFired = true;
    var rangeValue = { current: undefined, mostRecent: undefined };

    function onInput(evt) {
        inputEvtHasNeverFired = false;
        rangeValue.current = evt.target.value;
        if (rangeValue.current !== rangeValue.mostRecent) { listener(evt, rangeValue); }
        rangeValue.mostRecent = rangeValue.current;
    }

    function onChange(evt) { if (inputEvtHasNeverFired) { listener(evt, rangeValue); } }

    rangeInputElmt.addEventListener("input", onInput);
    rangeInputElmt.addEventListener("change", onChange);
};

tf.dom.IsVerticalScrollElementVisible = function (scrollerElem, subElem, marginInt) {
    var isVisible = true, offsetScrollToMakeVisible = 0;
    var marginIntUse = marginInt != undefined ? marginInt : 10;
    if (!!(scrollerElem = tf.dom.GetHTMLElementFrom(scrollerElem)) && !!(subElem = tf.dom.GetHTMLElementFrom(subElem))) {
        var listCurTop = scrollerElem.scrollTop, listCurBot = listCurTop + scrollerElem.offsetHeight;
        var elemCurTop = subElem.offsetTop, elemCurBot = elemCurTop + subElem.offsetHeight;
        var topOffset = elemCurTop - listCurTop;

        if (elemCurBot > listCurBot) {
            isVisible = false;
            offsetScrollToMakeVisible = elemCurBot - listCurBot;
            elemCurTop += offsetScrollToMakeVisible;
        }

        if (elemCurTop < listCurTop) {
            isVisible = false;
            offsetScrollToMakeVisible = elemCurTop - listCurTop;
        }
    }
    return { isVisible: isVisible, offSetScroll: listCurTop + offsetScrollToMakeVisible };
};

tf.dom.IsVerticalScrollElementVisibleOld = function (scrollerElem, subElem, marginInt) {
    var isVisible = false, offsetScrollToMakeVisible = 0;
    var marginIntUse = marginInt != undefined ? marginInt : 10;
    if (!!(scrollerElem = tf.dom.GetHTMLElementFrom(scrollerElem)) && !!(subElem = tf.dom.GetHTMLElementFrom(subElem))) {
        var topOffset = subElem.offsetTop - scrollerElem.offsetTop;
        var curTop = scrollerElem.scrollTop, curBot = curTop + scrollerElem.offsetHeight;
        if (topOffset > curBot - marginIntUse) {
            isVisible = false;
            offsetScrollToMakeVisible = topOffset - marginIntUse;
        }
        else if (topOffset < curTop + marginIntUse) {
            isVisible = false;
            offsetScrollToMakeVisible = topOffset - marginIntUse;
        }
        else {
            isVisible = true;
        }
    }
    return { isVisible: isVisible, offSetScroll: offsetScrollToMakeVisible };
};

tf.dom.IsLastVerticalScrollElemVisible = function (scrollerElem, marginInt) {
    var isVisible = { isVisible: true, offsetScroll: 0 } ;
    if (!!(scrollerElem = tf.dom.GetHTMLElementFrom(scrollerElem))) {
        var lastChild = scrollerElem.lastChild;
        if (!!lastChild) {
            isVisible = tf.dom.IsVerticalScrollElementVisible(scrollerElem, lastChild, marginInt);
        }
    }
    return isVisible;
};

tf.dom.ScrollVerticallyToEnsureVisible = function (scrollerElem, subElem, marginInt) {
    var scrollInfo = tf.dom.IsVerticalScrollElementVisible(scrollerElem, subElem, marginInt);
    var scrolled = !scrollInfo.isVisible;
    if (scrolled) {
        tf.dom.GetHTMLElementFrom(scrollerElem).scrollTop = scrollInfo.offSetScroll;
    }
    return scrolled;
};

tf.dom.ScrollVerticallyToEnd = function (scrollerElem) {
    if (!!(scrollerElem = tf.dom.GetHTMLElementFrom(scrollerElem))) {
        scrollerElem.scrollTop = scrollerElem.scrollHeight;
    }
};

tf.dom.ScrollHorizontallyToEnsureVisible = function (scrollerElem, subElem) {
    var scrolled = false;
    if (!!(scrollerElem = tf.dom.GetHTMLElementFrom(scrollerElem)) && !!(subElem = tf.dom.GetHTMLElementFrom(subElem))) {
        var leftOffset = subElem.offsetLeft - scrollerElem.offsetLeft;
        var curLeft = scrollerElem.scrollLeft, curRight = curLeft + scrollerElem.offsetWidth;
        if (scrolled = (leftOffset > curRight - 10 || leftOffset < curLeft)) { scrollerElem.scrollLeft = leftOffset; }
    }
    return scrolled;
}

tf.dom.SetDisplayStyle = function (elem, verb) {
    if (elem = tf.dom.GetHTMLElementFrom(elem)) { elem.style.display = verb; }
}

tf.dom.ToggleDisplayStyle = function(elem, verb1, verb2) {
    if (elem = tf.dom.GetHTMLElementFrom(elem)) { elem.style.display = elem.style.display == verb1 ? verb2 : verb1; }
}

tf.dom.ToggleDisplayBlockNone = function (elem) { return tf.dom.ToggleDisplayStyle(elem, 'block', 'none'); }

tf.dom.SetDisplayBlockNone = function (elem, bool) { return tf.dom.SetDisplayStyle(elem, !!bool? 'block' : 'none'); }

/**
 * @public
 * @function
 * @summary - Inserts an HTML <b>'script'</b> into the Documents head
 * @param {string} scriptSrc - the source url of the script
 * @param {function} callBack - if defined, called when the script finishes loading
 * @returns {void} - | {@link void} no return value
*/
tf.dom.AddScript = function (scriptSrc, callBack, customDoc) {
    if (tf.js.GetIsNonEmptyString(scriptSrc)) {
        var docUse = customDoc != undefined ? customDoc : document;
        var script = docUse.createElement('script'); script.type = "text/javascript"; script.src = scriptSrc;
        if (tf.js.GetFunctionOrNull(callBack)) { script.onload = callBack; }
        docUse.head.appendChild(script);
    }
}

tf.dom.AddScripts = function (scripts, callBack, customDoc) {
    var nScriptsLoaded = 0, nScriptsToLoad = 0, notified = false;
    function onScriptLoaded() {
        if (!notified) {
            if (++nScriptsLoaded >= nScriptsToLoad) {
                notified = true;
                callBack();
            }
        }
    }
    if (tf.js.GetIsNonEmptyArray(scripts)) {
        var nScripts = scripts.length;
        for (var i = 0; i < nScripts; ++i) {
            tf.dom.AddScript(scripts[i], onScriptLoaded, customDoc);
        }
    }
};

/**
 * @public
 * @function
 * @summary - Inserts an HTML <b>'link'</b> into the Documents head
 * @param {string} hRef - the href url of the link
 * @param {string} rel - the rel attribute of the link
 * @param {string} type - the type attribute of the link
 * @param {function} callBack - if defined, called when the link finishes loading
 * @returns {void} - | {@link void} no return value
*/
tf.dom.AddLink = function (hRef, rel, type, callBack) {
    if (tf.js.GetIsNonEmptyString(hRef)) {
        var link = document.createElement('link');
        if (tf.js.GetFunctionOrNull(callBack)) { link.onload = callBack; }
        link.href = hRef;
        if (tf.js.GetIsNonEmptyString(rel)) { link.rel = rel; }
        if (tf.js.GetIsNonEmptyString(type)) { link.type = type; }
        document.head.appendChild(link);
    }
}

/**
 * @public
 * @function
 * @summary - Inserts an HTML <b>'link'</b> into the Documents head to a google font from font.googleapis.com
 * @param {string} fontSpecs - specification of the fonts to retrieve, example: "Cantarell|Tangerine:bold,bolditalic|Inconsolata:italic|Droid+Sans"
 * @param {function} callBack - if defined, called when the font is ready for use
 * @returns {void} - | {@link void} no return value
*/
tf.dom.AddGoogleFont = function (fontSpecs, callBack) {
    if (tf.js.GetIsNonEmptyString(fontSpecs)) { tf.dom.AddLink("http://fonts.googleapis.com/css?family=" + fontSpecs, "stylesheet", "text/css", callBack); }
}

/**
 * @public
 * @function
 * @summary - Calculates the current pixel dimensions of the Browser's window
 * @returns {tf.types.pixelCoordinates} - | {@link tf.types.pixelCoordinates} the dimensions
*/
tf.dom.GetWindowDims = function () {
    var w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0];
    var winW = w.innerWidth || e.clientWidth || g.clientWidth, winH = w.innerHeight || e.clientHeight || g.clientHeight;
    return [winW - 1, winH - 1];
}

/**
 * @public
 * @function
 * @summary - Calculates the current pixel dimensions of the Browser's window and resizes the given container to the calculated dimensions
 * @param {HTMLElementLike} container - the container to be resized
 * @returns {tf.types.pixelCoordinates} - | {@link tf.types.pixelCoordinates} the dimensions
*/
tf.dom.FitContainerToWindowDims = function (container) {
    var winDims = tf.dom.GetWindowDims();
    var containerUse = tf.dom.GetHTMLElementFrom(container);

    if (!!containerUse) {
        var containerStyle = containerUse.style;
        containerStyle.width = containerStyle.maxWidth = winDims[0] + "px";
        containerStyle.height = containerStyle.maxHeight = winDims[1] + "px";
    }
    return winDims;
}

/**
 * @public
 * @function
 * @summary - Determines if the given parameter is an {@link HTMLNode}
 * @param {object} node - the node candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if node is an {@link HTMLNode}, <b>false</b> otherwise
*/
tf.dom.GetIsHTMLNode = function (node) {
    return (
      typeof Node === "object" ? node instanceof Node :
      node && typeof node === "object" && typeof node.nodeType === "number" && typeof node.nodeName === "string"
    );
}

/**
 * @public
 * @function
 * @summary - Determines if the given parameter is an {@link HTMLElement}
 * @param {object} node - the element candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if node is an {@link HTMLElement}, <b>false</b> otherwise
*/
tf.dom.GetIsHTMLElement = function (element) {
    return tf.js.GetIsValidObject(element) && element.nodeType === 1 && typeof element.nodeName === "string";
    /*return (
      typeof HTMLElement === "object" ? element instanceof HTMLElement : //DOM2
      element && typeof element === "object" && element !== null && element.nodeType === 1 && typeof element.nodeName === "string"
  );*/
}

/**
 * @public
 * @function
 * @summary - Retrieves the {@link HTMLElement associated with the given object, if any
 * @param {object} element - the object from which to retrive an HTMLElement
 * @returns {HTMLElement} - | {@link HTMLElement} the retrieved {@link HTMLElement}, or {@link void}
*/
tf.dom.GetHTMLElementFrom = function (element) {
    if (!!element) {
        if (!tf.dom.GetIsHTMLElement(element)) {
            if (tf.js.GetIsNonEmptyString(element)) { element = document.getElementById(element); }
            else if (tf.js.GetIsValidObject(element) && tf.js.GetFunctionOrNull(element.GetHTMLElement)) { element = element.GetHTMLElement(); }
            else { element = null; }
        }
    }
    return element;
}

/**
 * @private
 * @function
 * @summary - Retrieves the a DOM event listener target from the given element
 * @param {object} element - the object from which to retrive a DOM event listener target
 * @returns {object} - | {@link object} the retrieved DOM event listener target
*/
tf.dom.GetDOMEventListenerFrom = function (element) {
    if (!!element) {
        if (!tf.dom.GetIsHTMLElement(element)) {
            if (tf.js.GetIsNonEmptyString(element)) { element = document.getElementById(element); }
            else if (tf.js.GetIsValidObject(element) && tf.js.GetFunctionOrNull(element.GetHTMLElement)) { element = element.GetHTMLElement(); }
        }
        if (!tf.js.GetIsValidObject(element)) { element = null; }
    }
    return element;
}

tf.dom.GetElemClassName = function(elem) {
    return elem instanceof SVGElement ? (((elem.className ? elem.className.baseVal : elem.getAttribute('class'))) || '') : elem.className;
}

tf.dom.SetElemClassName = function (elem, elemClassName) {
    if (elem instanceof SVGElement) {
        if (elem.className) {
            elem.className.baseVal = elemClassName;
        }
        else {
            elem.setAttribute('class', elemClassName);
        }
    }
    else {
        return elem.className = elemClassName;
    }
}

/**
 * @public
 * @function
 * @summary - Checks if the given element contains the given CSS style/class name among its class names
 * @param {HTMLElementLike} elem - the element to check
 * @param {tf.types.CSSStyleName} cssStyleName - the CSS style/class name
 * @returns {boolean} - | {@link boolean} <b>true</b> if the given class name is one of the classes of <b>elem</b>, <b>false</b> otherwise
 * @see [AddCSSClass]{@link tf.dom.AddCSSClass}, [RemoveCSSClass]{@link tf.dom.RemoveCSSClass}, and [ReplaceCSSClass]{@link tf.dom.ReplaceCSSClass}
*/
tf.dom.GetContainsCSSClass = function (elem, cssStyleName) {
    if (elem = tf.dom.GetHTMLElementFrom(elem)) {
        return tf.js.GetNonEmptyString(cssStyleName) && new RegExp('(\\s+|^)' + cssStyleName + '(\\s+|$)').test(tf.dom.GetElemClassName(elem));
    }
    return false;
}

/**
 * @public
 * @function
 * @summary - Adds the given CSS style/class name to the class names associated with the given element
 * @param {HTMLElementLike} elem - the element
 * @param {tf.types.CSSStyleName} cssStyleName - the CSS style/class name
 * @returns {void} - | {@link void} no return value
 * @see [RemoveCSSClass]{@link tf.dom.RemoveCSSClass}, [ReplaceCSSClass]{@link tf.dom.ReplaceCSSClass}, and [GetContainsCSSClass]{@link tf.dom.GetContainsCSSClass}
*/
tf.dom.AddCSSClass = function (elem, cssStyleName) {
    if ((elem = tf.dom.GetHTMLElementFrom(elem)) && (!!cssStyleName)) {
        if (!tf.js.GetIsArray(cssStyleName)) { cssStyleName = cssStyleName.split(' '); }
        var elemClassName = tf.dom.GetElemClassName(elem);
        for (var i = 0, len = cssStyleName.length; i < len; ++i) {
            if (cssStyleName[i] && !new RegExp('(\\s+|^)' + cssStyleName[i] + '(\\s+|$)').test(elemClassName)) {
                elemClassName = elemClassName.trim() + ' ' + cssStyleName[i];
            }
        }
        tf.dom.SetElemClassName(elem, elemClassName);
    }
}

/**
 * @public
 * @function
 * @summary - Removes the given CSS style/class name from the class names associated with the given element
 * @param {HTMLElementLike} elem - the element
 * @param {tf.types.CSSStyleName} cssClassStr - the CSS style/class name
 * @returns {void} - | {@link void} no return value
 * @see [AddCSSClass]{@link tf.dom.AddCSSClass}, [ReplaceCSSClass]{@link tf.dom.ReplaceCSSClass}, and [GetContainsCSSClass]{@link tf.dom.GetContainsCSSClass}
*/
tf.dom.RemoveCSSClass = function (elem, cssStyleName) {
    if ((elem = tf.dom.GetHTMLElementFrom(elem)) && (!!cssStyleName)) {
        if (!tf.js.GetIsArray(cssStyleName)) { cssStyleName = cssStyleName.split(' '); }
        var elemClassName = tf.dom.GetElemClassName(elem);
        for (var i = 0, len = cssStyleName.length; i < len; ++i) {
            elemClassName = elemClassName.replace(new RegExp('(\\s+|^)' + cssStyleName[i] + '(\\s+|$)'), ' ').trim();
        }
        tf.dom.SetElemClassName(elem, elemClassName);
    }
}

/**
 * @public
 * @function
 * @summary - Replaces a given CSS style/class name with another style/class name among the style/class names associated with the given element
 * @param {HTMLElementLike} elem - the element
 * @param {tf.types.CSSStyleName} cssStyleNameOld - the existing CSS style/class name to be replaced
 * @param {tf.types.CSSStyleName} cssStyleNameNew - the new CSS class style/name to replace <b>cssStyleNameOld</b>
 * @returns {void} - | {@link void} no return value
 * @see [AddCSSClass]{@link tf.dom.AddCSSClass}, [RemoveCSSClass]{@link tf.dom.RemoveCSSClass}, and [GetContainsCSSClass]{@link tf.dom.GetContainsCSSClass}
*/
tf.dom.ReplaceCSSClass = function (elem, cssStyleNameOld, cssStyleNameNew) { tf.dom.RemoveCSSClass(elem, cssStyleNameOld); tf.dom.AddCSSClass(elem, cssStyleNameNew); }


tf.dom.ReplaceCSSClassCondition = function (elem, condition, classTrue, classFalse) {
    if (!!condition) { tf.dom.ReplaceCSSClass(elem, classFalse, classTrue); }
    else { tf.dom.ReplaceCSSClass(elem, classTrue, classFalse); }
}

/**
 * @private
 * @function
 * @summary - Adds the given child element to the list of children of the given parent element, uses JavaScript <b>appendChild</b>
 * @param {HTMLElementLike} childElem - the child element
 * @param {HTMLElementLike} parentElem - the parent element
 * @returns {void} - | {@link void} no return value
*/
tf.dom.AppendTo = function (childElem, parentElem) {
    if ((parentElem = tf.dom.GetHTMLElementFrom(parentElem)) && (childElem = tf.dom.GetHTMLElementFrom(childElem))) {
        if (tf.js.GetFunctionOrNull(parentElem.appendChild)) {
            parentElem.appendChild(childElem);
        }
    }
}

/**
 * @private
 * @function
 * @summary - Adds the given child element to the list of children of the given parent element, uses child's <b>AppendTo</b> function, if defined
 * @param {HTMLElementLike} child - the child element
 * @param {HTMLElementLike} parent - the parent element
 * @returns {void} - | {@link void} no return value
*/
tf.dom.AddContent = function (child, parent) {
    if (tf.js.GetIsValidObject(child) && tf.js.GetIsValidObject(parent)) {
        if (tf.js.GetFunctionOrNull(child.AppendTo)) { child.AppendTo(parent); }
        else {
            var childElem = tf.dom.GetHTMLElementFrom(child), parentElem = tf.dom.GetHTMLElementFrom(parent);
            if (!!childElem && !!parentElem) { parentElem.appendChild(childElem); }
        }
    }
}

/**
 * @public
 * @function
 * @summary - Removes all children from the given element
 * @param {HTMLElementLike} elem - the element
 * @returns {void} - | {@link void} no return value
*/
tf.dom.RemoveAllChildren = function (elem) { if (elem = tf.dom.GetHTMLElementFrom(elem)) { var lastChild; while (lastChild = elem.lastChild) { elem.removeChild(lastChild); } } }

/**
 * @public
 * @function
 * @summary - Creates an unique id for {@link HTMLElement} using {@link tf.GetGlobalCounter}
 * @param {string} withPrefix - an application defined prefix for the id
 * @returns {string} - | {@link string} the id
*/
tf.dom.CreateDomElementID = function (withPrefix) { return withPrefix + tf.GetGlobalCounter().GetNext() + ''; }

// tf.js

/**
 * @public
 * @function
 * @summary - Creates an {@link object} containing the combined properties of the given objects
 * @param {...object} object - any number of comma separated objects
 * @returns {object} - | {@link object} the merged object
*/
tf.js.ShallowMerge = function () {
    var merged = {}, nContent = arguments.length;

    for (var i = 0 ; i < nContent ; ++i) {
        var thisContent = arguments[i];

        if (!!thisContent && typeof thisContent === "object") {
            for (var property in thisContent) { if (thisContent.hasOwnProperty(property)) { merged[property] = thisContent[property]; } }
        }
    }
    return merged;
}

/**
 * @public
 * @function
 * @summary - Checks if the given candidate is of type {@link boolean}
 * @param {*} candidate - the candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsBoolean = function (candidate) { return typeof candidate === "boolean"; }

/**
 * @public
 * @function
 * @summary - Checks if the given candidate is a {@link string}
 * @param {*} candidate - the candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsString = function (candidate) { return !!candidate && typeof candidate === "string"; }

/**
 * @public
 * @function
 * @summary - Checks if the given candidate is a {@link string} with at least <b>length</b> characters
 * @param {*} candidate - the candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsStringWithMinLength = function (candidate, length) { return tf.js.GetIsString(candidate) && candidate.length >= length; }

tf.js.GetIsStringWithLength = function (candidate, length) { return tf.js.GetIsString(candidate) && candidate.length == length; }


/**
 * @public
 * @function
 * @summary - Checks if the given candidate is a {@link string} with at least one character
 * @param {*} candidate - the candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsNonEmptyString = function (candidate) { return tf.js.GetIsString(candidate) && !!candidate.length; }

/**
 * @public
 * @function
 * @summary - Returns the given object if it is a {@link string} with at least one character, otherwise returns the given default
 * @param {object} fromString - the non empty string candidate
 * @param {string} optionalDefaultString - the default string, can be {@link void}
 * @returns {string} - | {@link string} <b>fromString</b> or <b>optionalDefaultString</b>
*/
tf.js.GetNonEmptyString = function (fromString, optionalDefaultString) { return tf.js.GetIsNonEmptyString(fromString) ? fromString : optionalDefaultString; }

/**
 * @public
 * @function
 * @summary - Checks if the given candidate is an {@link array}
 * @param {*} candidate - the candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsArray = function (candidate) {
    if (!!candidate) {
        if (candidate.constructor === Array) { return true; }
        if (tf.js.GetFunctionOrNull(candidate)) { return false; }
        if (!tf.js.GetIsString(candidate) && candidate.length !== undefined) { return typeof candidate.length == 'number'; }
    }
    return false;
    
}

/**
 * @public
 * @function
 * @summary - Checks if the given candidate is an {@link array} with at least one element
 * @param {*} candidate - the candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsNonEmptyArray = function (candidate) { return tf.js.GetIsArray(candidate) && !!candidate.length; }

/**
 * @public
 * @function
 * @summary - Checks if the given candidate is an {@link array} with a number of elements equal to the given length
 * @param {*} candidate - the candidate
 * @param {number} length - the length
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsArrayWithLength = function (candidate, length) { return tf.js.GetIsArray(candidate) && candidate.length == length; }

/**
 * @public
 * @function
 * @summary - Checks if the given candidate is an {@link array} with a number of elements equal to the given length
 * @param {*} candidate - the candidate
 * @param {number} length - the length
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsArrayWithLength = function (candidate, length) { return tf.js.GetIsArray(candidate) && candidate.length == length; }


/**
 * @public
 * @function
 * @summary - Checks if the given candidate is an {@link array} with a number of elements greater or equal to the given length
 * @param {*} candidate - the candidate
 * @param {number} length - the length
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsArrayWithMinLength = function (candidate, length) { return tf.js.GetIsArray(candidate) && candidate.length >= length; }

/**
 * @public
 * @function
 * @summary - Checks if the given object is a valid {@link object}
 * @param {*} candidate - the candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsValidObject = function (candidate) { return !!candidate && (typeof candidate === "object"); }

/**
 * @public
 * @function
 * @summary - Returns the given object if it is a valid {@link object}, otherwise returns an empty object {}
 * @param {*} candidate - the candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetValidObjectFrom = function (candidate) { return tf.js.GetIsValidObject(candidate) ? candidate : {} ; }

/**
 * @public
 * @function
 * @summary - Returns the given candidate if it is a valid {@link function}, or {@link void} otherwise
 * @param {*} fromFunction - the candidate
 * @returns {function} - | {@link function} <b>fromFunction</b> or {@link void}
*/
tf.js.GetFunctionOrNull = function (fromFunction) { return typeof fromFunction === "function" ? fromFunction : null; }

/**
 * @private
 * @function
 * @summary - Parses the given string in JSON format using JavaScript's <b>eval</b> function. Fallback in case Browser does not support JSON. Used internally by the API
 * @param {string} str - a string in JSON format
 * @returns {object} - | {@link object} the object
*/
tf.js.JSONParseWithEval = function (str) { return tf.js.GetNonEmptyString(str) ? eval('(' + str + ')') : null; }

/**
 * @public
 * @function
 * @summary - Parses the given string in JSON format
 * @param {string} str - a string in JSON format
 * @returns {object} - | {@link object} the object
*/
tf.js.JSONParse = function (str) {
    var parsed = null;
    var jsonParse = (!!JSON && !!JSON.parse) ? JSON.parse : tf.js.JSONParseWithEval;

    try { parsed = jsonParse(str); }
    catch (e) {
        if (jsonParse != tf.js.JSONParseWithEval) { try { parsed = tf.js.JSONParseWithEval(str); } catch (e) { parsed = null; } } else { parsed = null; }
        if (!parsed) { tf.GetDebug().LogIfTest("exception on JSON decode"); }
    }
    return parsed;
}

/**
 * @public
 * @function
 * @summary - Retrieves the URL where a the script of the given file name was loaded from
 * @param {string} scriptFileName - the script file name
 * @returns {string} - | {@link string} the the URL
*/
tf.js.GetURLOfScript = function (scriptFileName) {
    var scriptURL;

    if (typeof scriptFileName === "string") {
        var scriptElements = document.getElementsByTagName('script');
        var i, element;

        for (i = 0; element = scriptElements[i]; ++i) {
            var myfile = element.src, index = myfile.indexOf(scriptFileName);
            if (index >= 0) { scriptURL = myfile.substring(0, index); break; }
        }
    }
    return scriptURL;
}

/**
 * @public
 * @function
 * @summary - Returns a valid {@link hexColor} parsed from the given color, or the given default color if parsing fails
 * @param {hexColor|deprecatedColor} fromColorStr - the given color
 * @param {hexColor} defaultColorStr - the default color
 * @returns {hexColor} - | {@link hexColor} a valid color
*/
tf.js.GetHexColorStr = function (fromColorStr, defaultColorStr) {

    var returnColorStr = defaultColorStr;

    if (typeof fromColorStr == "string") {
        if (fromColorStr.length > 0) {
            if (fromColorStr[0] != '#') {
                if (fromColorStr.indexOf("0x") == 0) {
                    returnColorStr = '#' + fromColorStr.substr(2);
                }
                else {
                    fromColorStr = parseInt(fromColorStr, 10);
                    returnColorStr = "#" + fromColorStr.toString(16);
                }
            }
            else {
                returnColorStr = fromColorStr;
            }
        }
    }
    else if (typeof fromColorStr == "number") {
        returnColorStr = "#" + fromColorStr.toString(16);
    }
    return returnColorStr;
}

/**
 * @public
 * @function
 * @summary - Returns a valid {@link rgbaColor} or {@link rgbColor} parsed from the given color and using the given opacity
 * @param {hexColor|deprecatedColor} fromColorStr - the given color
 * @param {hexColor} defaultColorStr - the default color, used if parsing of <b>fromColorStr</b> fails
 * @param {tf.types.opacity01} opacity - the given opacity
 * @returns {rgbaColor|rgbColor} - | {@link rgbaColor}|{@link rgbColor} a valid color, returns {@link rgbColor} if <b>opacity</b> is <b>1</b>
*/
tf.js.GetRGBAColor = function (fromColorStr, defaultColorStr, opacity) {

    var rgbaColor = "rgb(0,0,0)";

    fromColorStr = tf.js.GetHexColorStr(fromColorStr, defaultColorStr);

    if (fromColorStr) {
        var len = fromColorStr.length;
        var nPerColor = len == 7 ? 2 : (len == 4 ? 1 : 0);

        if (nPerColor && fromColorStr.charAt(0) == '#') {
            var r = parseInt(fromColorStr.substr(1, nPerColor), 16);
            var g = parseInt(fromColorStr.substr(1 + nPerColor, nPerColor), 16);
            var b = parseInt(fromColorStr.substr(1 + 2 * nPerColor, nPerColor), 16);

            if (nPerColor == 1) {
                r = r * 16 + r;
                g = g * 16 + g;
                b = b * 16 + b;
            }

            var needOpacity = false;

            if (typeof opacity == "number") {
                opacity = opacity < 0.0 ? 0.0 : (opacity > 1.0 ? 1.0 : opacity);
                needOpacity = opacity != 1.0;
            }
            rgbaColor = needOpacity ? "rgba(" + r + "," + g + "," + b + "," + opacity + ")" : "rgb(" + r + "," + g + "," + b + ")";
        }
    }

    return rgbaColor;
}

/**
 * @public
 * @function
 * @summary - Returns a random {@link hexColor}
 * @returns {hexColor} - | {@link hexColor} a random color
*/
tf.js.GetRandomHexColorStr = function () { return '#' + Math.floor(Math.random() * 16777215).toString(16); }

/**
 * @public
 * @function
 * @summary - Calculates the gray [color component]{@link tf.types.rgbColorComponent} approximately equivalent to the combined <b>"brightness"</b> of the given rgb components
 * @param {tf.types.rgbColorComponents} rgb - the given components
 * @returns {tf.types.rgbColorComponent} - | {@link tf.types.rgbColorComponent} the gray value
*/
tf.js.GetGrayFromRGB = function (rgb) { return rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114; }

/**
 * @public
 * @function
 * @summary - Retrieves the rgb components of a given color
 * @param {hexColor|deprecatedColor} fromColorStr - the given color
 * @param {hexColor} defaultColorStr - the default color, used if parsing of <b>fromColorStr</b> fails
 * @returns {tf.types.rgbColorComponents} - | {@link tf.types.rgbColorComponents} the rgb components
*/
tf.js.GetRGBFromColor = function (fromColorStr, defaultColorStr) {

    var r = 255, g = 255, b = 255;

    fromColorStr = tf.js.GetHexColorStr(fromColorStr, defaultColorStr);

    if (fromColorStr) {
        var len = fromColorStr.length;
        var nPerColor = len == 7 ? 2 : (len == 4 ? 1 : 0);

        if (nPerColor && fromColorStr.charAt(0) == '#') {
            var r = parseInt(fromColorStr.substr(1, nPerColor), 16);
            var g = parseInt(fromColorStr.substr(1 + nPerColor, nPerColor), 16);
            var b = parseInt(fromColorStr.substr(1 + 2 * nPerColor, nPerColor), 16);
            if (nPerColor == 1) {
                r += r << 4;
                g += g << 4;
                b += b << 4;
            }
        }
    }

    return { r: r, g: g, b: b };
}

/**
 * @public
 * @function
 * @summary - Checks if the parameter is a valid JavaScript {@link number}
 * @param {object} aNumber - the given candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsValidNumber = function (aNumber) { return (Number(aNumber) === aNumber) && isFinite(aNumber); }

/**
 * @public
 * @function
 * @summary - Checks if the parameter is a valid JavaScript non negative {@link number}
 * @param {object} aNumber - the given candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsNonNegativeNumber = function (aNumber) { return tf.js.GetIsValidNumber(aNumber) && aNumber >= 0; }

/**
 * @public
 * @function
 * @summary - Checks if the parameter is a valid JavaScript positive {@link number}
 * @param {object} aNumber - the given candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsPositiveNumber = function (aNumber) { return tf.js.GetIsValidNumber(aNumber) && aNumber > 0; }

/**
 * @public
 * @function
 * @summary - Checks if the parameter is a valid JavaScript integer {@link number}
 * @param {object} aNumber - the given candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsInt = function (aNumber) { return tf.js.GetIsValidNumber(aNumber) && (aNumber % 1 === 0); }

/**
 * @public
 * @function
 * @summary - Checks if the parameter is a valid JavaScript non negative integer {@link number}
 * @param {object} aNumber - the given candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsNonNegativeInt = function (aNumber) { return tf.js.GetIsInt(aNumber) && tf.js.GetIsNonNegativeNumber(aNumber); }

/**
 * @public
 * @function
 * @summary - Checks if the parameter is a valid JavaScript positive integer {@link number}
 * @param {object} aNumber - the given candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsPositiveInt = function (aNumber) { return tf.js.GetIsInt(aNumber) && tf.js.GetIsPositiveNumber(aNumber); }

/**
 * @public
 * @function
 * @summary - Retrieves a valid non negative integer from the given parameter, or returns the given default value
 * @param {string|number} aNumber - the given candidate, strings are parsed in base 10
 * @param {number} defaultValue - the given default
 * @returns {number} - | {@link number} <b>aNumber</b> or <b>defaultValue</b>
*/
tf.js.GetNonNegativeIntFrom = function (aNumber, defaultValue) {
    tf.js.GetIsNonEmptyString(aNumber) && (aNumber = parseInt(aNumber, 10));
    return tf.js.GetIsNonNegativeInt(aNumber) ? aNumber : (defaultValue !== undefined ? defaultValue : 0);
}

/**
 * @public
 * @function
 * @summary - Retrieves a valid positive integer from the given parameter, or returns the given default value
 * @param {string|number} aNumber - the given candidate, [strings]{@link string} are parsed in base 10
 * @param {number} defaultValue - the given default
 * @returns {number} - | {@link number} <b>aNumber</b> or <b>defaultValue</b>
*/
tf.js.GetPositiveIntFrom = function (aNumber, defaultValue) {
    tf.js.GetIsNonEmptyString(aNumber) && (aNumber = parseInt(aNumber, 10));
    return tf.js.GetIsPositiveInt(aNumber) ? aNumber : (defaultValue !== undefined ? defaultValue : 1);
}

/**
 * @public
 * @function
 * @summary - Constrains the given value into the given range
 * @param {number} original - the given value
 * @param {number} minValue - the given minimum acceptable value
 * @param {number} maxValue - the given maximum acceptable value
 * @returns {number} - | {@link number} a number in the given range
*/
tf.js.NumberClip = function (original, minValue, maxValue) { return original < minValue ? minValue : (original > maxValue ? maxValue : original); }

/**
 * @public
 * @function
 * @summary - Retrieves a valid {@link number} from the given number or the given default number
 * @param {number|string|void} fromValue - the given number
 * @param {number} defaultValue - default used when a {@link number} cannot be extracted from <b>fromValue</b>
 * @returns {number} - | {@link number} a valid number
*/
tf.js.GetFloatNumber = function (fromValue, defaultValue) {
    if (fromValue !== undefined) {
        if (typeof fromValue === "string") { fromValue = parseFloat(fromValue); }
        if (typeof fromValue !== "number" || !isFinite(fromValue)) { fromValue = defaultValue; }
    }
    else { fromValue = defaultValue; }
    return fromValue;
}

/**
 * @public
 * @function
 * @summary - Retrieves a valid {@link number} from the given number or the given default number, constrained to the given range
 * @param {number|string|void} fromValue - the given number
 * @param {number} minValue - the given minimum acceptable value
 * @param {number} maxValue - the given maximum acceptable value
 * @param {number} defaultValue - default used when a {@link number} cannot be extracted from <b>fromValue</b>
 * @returns {number} - | {@link number} a valid number
*/
tf.js.GetFloatNumberInRange = function (fromValue, minValue, maxValue, defaultValue) {
    fromValue = tf.js.GetFloatNumber(fromValue, defaultValue);
    return tf.js.NumberClip(fromValue, minValue, maxValue);
}

/**
 * @public
 * @function
 * @summary - Retrieves a valid integer {@link number} from the given number or the given default number, constrained to the given range
 * @param {number|string|void} fromValue - the given number
 * @param {number} minValue - the given minimum acceptable value
 * @param {number} maxValue - the given maximum acceptable value
 * @param {number} defaultValue - default used when a {@link number} cannot be extracted from <b>fromValue</b>
 * @returns {number} - | {@link number} a valid number
*/
tf.js.GetIntNumberInRange = function (fromValue, minValue, maxValue, defaultValue) {
    return Math.floor(tf.js.GetFloatNumberInRange(fromValue, minValue, maxValue, defaultValue));
}

/**
 * @public
 * @function
 * @summary - Checks if the given parameter is a {boolean} <b>false</b>
 * @param {boolean|string|void} value - the given candidate, "false", "FALSE", "False", etc. are acceptable <b>false</b> values
 * @returns {boolean} - | {@link boolean} <b>true</b> if <b>value</b> is <b>false</b>, <b>false</b> otherwise
*/
tf.js.GetIsFalseNotUndefined = function (value) { return value === undefined ? false : ! tf.js.GetBoolFromValue(value, false); }

/**
 * @public
 * @function
 * @summary - Retrieves a valid {@link boolean} value from the given parameter
 * @param {boolean|string|void} fromValue - the given candidate, "false", "FALSE", "False", etc. are acceptable <b>false</b> values
 * @param {boolean|void} defaultOrFalseIfUndefined - default used when a {@link boolean} cannot be extracted from <b>fromValue</b>, defaults to <b>false</b> if undefined
 * @returns {boolean} - | {@link boolean} <b>true</b> if <b>value</b> is <b>true</b>, <b>false</b> otherwise
*/
tf.js.GetBoolFromValue = function (fromValue, defaultOrFalseIfUndefined) {
    if (typeof fromValue === "boolean") { return fromValue; }
    if (typeof fromValue === "string") { return fromValue.length > 0 && fromValue.toLowerCase() !== 'false'; }
    return defaultOrFalseIfUndefined === undefined ? false : !!defaultOrFalseIfUndefined;
}

/**
 * @public
 * @function
 * @summary - Retrieves a valid {@link tf.types.latitude} from the given latitude, defaults to {@link tf.consts.defaultLatitude}
 * @param {number|string|void} latitude - the given latitude
 * @returns {tf.types.latitude} - | {@link tf.types.latitude} a valid latitude
*/
tf.js.GetLatitudeFrom = function (latitude) { return tf.js.GetFloatNumberInRange(latitude, tf.consts.minLatitude, tf.consts.maxLatitude, tf.consts.defaultLatitude); }

/**
 * @public
 * @function
 * @summary - Retrieves a valid {@link tf.types.longitude} from the given longitude, defaults to {@link tf.consts.defaultLongitude}
 * @param {number|string|void} longitude - the given longitude
 * @returns {tf.types.longitude} - | {@link tf.types.longitude} a valid longitude
*/
tf.js.GetLongitudeFrom = function (longitude) { return tf.js.GetFloatNumberInRange(longitude, tf.consts.minLongitude, tf.consts.maxLongitude, tf.consts.defaultLongitude); }

/**
 * @public
 * @function
 * @summary - Creates a random valid {@link tf.types.latitude}
 * @returns {tf.types.latitude} - | {@link tf.types.latitude} a random valid latitude
*/
tf.js.GetRandomLatitude = function () { return Math.random() * tf.consts.latitudeRange - tf.consts.maxLatitude; }

/**
 * @public
 * @function
 * @summary - Creates a random valid {@link tf.types.longitude}
 * @returns {tf.types.longitude} - | {@link tf.types.longitude} a random valid longitude
*/
tf.js.GetRandomLongitude = function () { return Math.random() * tf.consts.longitudeRange - tf.consts.maxLongitude; }

/**
 * @public
 * @function
 * @summary - Retrieves a valid {@link tf.types.mapLevel} from the given level, defaults to {@link tf.consts.defaultLevel}
 * @param {number|string|void} level - the given level
 * @returns {tf.types.mapLevel} - | {@link tf.types.mapLevel} a valid level
*/
tf.js.GetLevelFrom = function (level) { return tf.js.GetIntNumberInRange(level, tf.consts.minLevel, tf.consts.maxLevel, tf.consts.defaultLevel); }

/**
 * @public
 * @function
 * @summary - Validates and retrieves [MinMaxLevels]{@link tf.types.MinMaxLevels} from the given minimum and maximum levels
 * @param {tf.types.mapLevel} minLevel - the minimum level
 * @param {tf.types.mapLevel} maxLevel - the maximum level
 * @returns {tf.types.MinMaxLevels} - | {@link tf.types.MinMaxLevels} the validated minimum and maximum levels
*/
tf.js.GetMinMaxLevelsFrom = function (minLevel, maxLevel) {
    if (minLevel === undefined) { minLevel = tf.consts.minLevel; }
    if (maxLevel === undefined) { maxLevel = tf.consts.maxLevel; }

    minLevel = tf.js.GetLevelFrom(minLevel);
    maxLevel = tf.js.GetLevelFrom(maxLevel);

    if (minLevel < maxLevel) { var t = minLevel; minLevel = maxLevel; maxLevel = t; }

    return { minLevel: minLevel, maxLevel: maxLevel };
}

tf.js.GetMidExtentCoord = function (extent) {
    var midCoord;
    if (tf.js.GetIsArrayWithMinLength(extent, 4)) {
        extent[0] = tf.js.GetLongitudeFrom(extent[0]);
        extent[1] = tf.js.GetLatitudeFrom(extent[1]);
        extent[2] = tf.js.GetLongitudeFrom(extent[2]);
        extent[3] = tf.js.GetLatitudeFrom(extent[3]);

        midCoord = [extent[0] + (extent[2] - extent[0]) / 2, extent[1] + (extent[3] - extent[1]) / 2];
    }
    return midCoord;
};

/**
 * @public
 * @function
 * @summary - Retrieves a valid {@link tf.types.mapExtent} from the given extent
 * @param {tf.types.mapExtent} extent - the given extent
 * @returns {tf.types.mapExtent} - | {@link tf.types.mapExtent} a valid extent
*/
tf.js.GetMapExtentFrom = function (extent) {
    if (tf.js.GetIsArrayWithMinLength(extent, 4)) {
        extent[0] = tf.js.GetLongitudeFrom(extent[0]);
        extent[1] = tf.js.GetLatitudeFrom(extent[1]);
        extent[2] = tf.js.GetLongitudeFrom(extent[2]);
        extent[3] = tf.js.GetLatitudeFrom(extent[3]);

        if (extent[0] > extent[2]) { var t = extent[0]; extent[0] = extent[2]; extent[2] = t; }
        if (extent[1] > extent[3]) { var t = extent[1]; extent[1] = extent[3]; extent[3] = t; }
    }
    else {
        extent = [tf.consts.defaultLongitude, tf.consts.defaultLatitude, tf.consts.defaultLongitude, tf.consts.defaultLatitude];
    }
    return extent;
}

/**
 * @public
 * @function
 * @summary - Checks if the given [map extent]{@link tf.types.mapExtent} contains the given [map coordinate]{@link tf.types.mapCoordinates}
 * @param {tf.types.mapExtent} extent - the given extent
 * @param {tf.types.mapCoordinates} coord - the given coordinate
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetExtentContainsCoord = function (extent, coord) {
    extent = tf.js.GetMapExtentFrom(extent);
    coord = tf.js.GetMapCoordsFrom(coord);
    return coord[0] >= extent[0] && coord[0] <= extent[2] && coord[1] >= extent[1] && coord[1] <= extent[3];
}

/**
 * @public
 * @function
 * @summary - Updates the given [map extent]{@link tf.types.mapExtent} to include the given [map coordinate]{@link tf.types.mapCoordinates}
 * @param {tf.types.mapExtent} extent - the given extent
 * @param {tf.types.mapCoordinates} coord - the given coordinate
 * @returns {tf.types.mapExtent} - | {@link tf.types.mapExtent} the updated extent
*/
tf.js.UpdateMapExtent = function (extent, coord) {
    coord = tf.js.GetMapCoordsFrom(coord);
    if (extent == undefined) { extent = [coord[0], coord[1], coord[0], coord[1]]; }
    else {
        extent = tf.js.GetMapExtentFrom(extent);
        if (extent[0] > coord[0]) { extent[0] = coord[0]; } else if (extent[2] < coord[0]) { extent[2] = coord[0]; }
        if (extent[1] > coord[1]) { extent[1] = coord[1]; } else if (extent[3] < coord[1]) { extent[3] = coord[1]; }
    }
    return extent;
}

tf.js.GetExtentCenter = function (extent) { return tf.js.GetIsArrayWithMinLength(extent, 4) ? [extent[0] + (extent[2] - extent[0]) / 2, extent[1] + (extent[3] - extent[1]) / 2] : undefined; }

/**
 * @public
 * @function
 * @summary - Merges the given [map extents]{@link tf.types.mapExtent}
 * @param {tf.types.mapExtent} extent1 - a given extent
 * @param {tf.types.mapExtent} extent2 - a given extent
 * @returns {tf.types.mapExtent} - | {@link tf.types.mapExtent} the merged extent
*/
tf.js.MergeMapExtents = function (extent1, extent2) {
    extent1 = tf.js.GetMapExtentFrom(extent1);
    extent2 = tf.js.GetMapExtentFrom(extent2);
    var extent = extent1.slice(0);
    extent = tf.js.UpdateMapExtent(extent, [extent2[0], extent2[1]]);
    extent = tf.js.UpdateMapExtent(extent, [extent2[2], extent2[3]]);
    return extent;
}

/**
 * @public
 * @function
 * @summary - Scales the given {@link tf.types.mapExtent} to the given scale multiplier
 * @param {tf.types.mapExtent} extent - the given extent
 * @param {number} scale - the given multiplier
 * @returns {tf.types.mapExtent} - | {@link tf.types.mapExtent} the scaled extent
*/
tf.js.ScaleMapExtent = function (extent, scale) {
    extent = tf.js.GetMapExtentFrom(extent); scale = tf.js.GetFloatNumber(scale, 1);
    var extentHW = (extent[2] - extent[0]) / 2, extentHH = (extent[3] - extent[1]) / 2;
    var extentCX = extent[0] + extentHW, extentCY = extent[1] + extentHH;
    extentHW *= scale; extentHH *= scale;
    return [extentCX - extentHW, extentCY - extentHH, extentCX + extentHW, extentCY + extentHH];
}

tf.js.GetPolyGeomFromExtent = function (extent) {
    extent = tf.js.GetMapExtentFrom(extent);
    var topLeft = [extent[0], extent[1]], topRight = [extent[2], extent[1]], bottomRight = [extent[2], extent[3]], bottomLeft = [extent[0], extent[3]];
    return {
        type: 'polygon',
        coordinates: [[topLeft, topRight, bottomRight, bottomLeft, topLeft]]
    };
};

/**
 * @public
 * @function
 * @summary - Returns an array containing all properties in the given {@link object}
 * @param {object} theObject - the given object
 * @returns {array} - | {@link array} the array containing <b>theObject</b>'s properties
*/
tf.js.ObjectToArray = function (object) {
    var array = []; for (var i in object) { array.push(object[i]); }
    return array;
}

/**
 * @public
 * @function
 * @summary - Extracts an {@link HTMLElementSize} from the given dimension
 * @param {HTMLElementSizeOrPxNumber} dim - the given dimension, [numbers]{@link number} are treated as pixel dimensions
 * @param {HTMLElementSize} defaultDim - the default dimension
 * @returns {HTMLElementSize} - | {@link HTMLElementSize} the size
*/
tf.js.GetDimFromStrOrPxNumber = function (dim, defaultDim) {
    if (typeof dim === "number") { return dim + 'px' };
    if (typeof dim !== "string" || !dim.length) { return defaultDim; }
    return dim;
}

/**
 * @public
 * @function
 * @summary - Converts the give number of seconds into "HH:MM:SS" format
 * @param {number} numberOfSeconds - the given number of seconds
 * @returns {string} - | {@link string} the number of seconds in "HH:MM:SS" format
*/
tf.js.ConvertToHHMMSS = function (numberOfSeconds) {
    var sec_num = Math.abs(tf.js.GetFloatNumber(numberOfSeconds, 0)), hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60), seconds = Math.floor(sec_num - (hours * 3600) - (minutes * 60));
    if (hours < 10) { hours = "0" + hours; } if (minutes < 10) { minutes = "0" + minutes; } if (seconds < 10) { seconds = "0" + seconds; }
    var timeStr = hours + ':' + minutes + ':' + seconds;
    return timeStr;
}

/**
 * @public
 * @function
 * @summary - Converts the give number of seconds into "HH:MM:SS" format, adds "HH" only if necessary, uses "M" instead of "MM" when possible
 * @param {number} numberOfSeconds - the given number of seconds
 * @returns {string} - | {@link string} the number of seconds in "HH:MM:SS" format
*/
tf.js.ConvertToHHMMSSBrief = function (numberOfSeconds) {
    var sec_num = tf.js.GetFloatNumber(numberOfSeconds, 0);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = Math.floor(sec_num - (hours * 3600) - (minutes * 60));

    if (hours < 10) { if (hours > 0) { hours = "0" + hours + ':' } else { hours = ''; } }
    if (minutes < 10) { if (minutes > 0) { if (hours > 0) { minutes = "0" + minutes + ':'; } else { minutes = minutes + ':'; } } else { minutes = '0:'; } }
    if (seconds < 10) { seconds = "0" + seconds; }
    var time = hours + minutes + seconds;
    return time;
}

/**
 * @public
 * @function
 * @summary - Converts the give number of seconds into "HH:MM:SS" format, adds "HH" only if necessary, uses "M" instead of "MM" when possible
 * @param {number} numberOfSeconds - the given number of seconds
 * @returns {string} - | {@link string} the number of seconds in "HH:MM:SS" format
*/
tf.js.ConvertToHourMinute = function (numberOfSeconds) {
    var sec_num = tf.js.GetFloatNumber(numberOfSeconds, 0);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var time;
    if (!!hours) {
        if (minutes < 10) { minutes = '0' + minutes; }
        time = hours + 'h:' + minutes + 'm';
    }
    else {
        time = minutes + 'm';
    }
    return time;
}

tf.js.ConvertToHourMinute2 = function (numberOfSeconds) {
    var sec_num = tf.js.GetFloatNumber(numberOfSeconds, 0);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var time;
    if (!!hours) {
        if (minutes == 0) { time = hours + ' ' + (hours != 1 ? 'hours' : 'hour'); }
        else { time = hours + ' h ' + minutes + ' min'; }
    }
    else { time = minutes + ' min'; }
    return time;
}

/**
 * @public
 * @function
 * @summary - Removes the last character from the given string if it matches the given character
 * @param {string} fromStr - the given string
 * @param {string} theChar - the given character
 * @returns {string} - | {@link string} the string with the character removed
*/
tf.js.ClipEndingChar = function (fromStr, theChar) {
    var fromStrUse = tf.js.GetNonEmptyString(fromStr, "");
    var charUse = tf.js.GetNonEmptyString(theChar, "");
    if (!!fromStrUse && !!charUse) {
        var fromStrUseLen = fromStrUse.length;
        if (fromStrUse.charAt(fromStrUseLen - 1) == charUse.charAt(0)) {
            fromStrUse = fromStrUse.substring(0, --fromStrUseLen);
        }
    }
    return fromStrUse;
}

/**
 * @public
 * @function
 * @summary - Removes parenthesis, '(' and ')', from the start and end of the given string, if present
 * @param {string} fromStr - the given string
 * @returns {string} - | {@link string} the string without parenthesis
*/
tf.js.RemoveParenthesisFrom = function (fromStr) {
    var strUse = tf.js.GetNonEmptyString(fromStr);

    if (strUse) {
        if (strUse.charAt(0) == '(') { strUse = strUse.slice(1); }
        if (!!strUse.length) { if (strUse.charAt(strUse.length - 1) == ')') { strUse = strUse.slice(0, -1); } }
    }
    return strUse;
}

/**
 * @public
 * @function
 * @summary - Removes brackets, '[' and ']', from the start and end of the given string, if present
 * @param {string} fromStr - the given string
 * @returns {string} - | {@link string} the string without brackets
*/
tf.js.RemoveBracketsFrom = function (fromStr) {
    var strUse = tf.js.GetNonEmptyString(fromStr);

    if (strUse) {
        if (strUse.charAt(0) == '[') { strUse = strUse.slice(1); }
        if (!!strUse.length) { if (strUse.charAt(strUse.length - 1) == ']') { strUse = strUse.slice(0, -1); } }
    }
    return strUse;
}

/**
 * @public
 * @function
 * @summary - Capitalizes the first letter of the given string
 * @param {string} string - the given string
 * @returns {string} - | {@link string} the string with the first letter capitalized
*/
tf.js.CapitaliseFirstLetter = function (string) {
    if (tf.js.GetIsNonEmptyString(string)) { string = string.charAt(0).toUpperCase() + string.slice(1); }
    return string;
}

/**
 * @public
 * @function
 * @summary - Capitalizes the first letter of the given string, after converting it to lower case
 * @param {string} string - the given string
 * @returns {string} - | {@link string} the string with only the first letter capitalized
*/
tf.js.CapitaliseFirstLetterOnly = function (string) {
    if (tf.js.GetIsNonEmptyString(string)) { string = tf.js.CapitaliseFirstLetter(string.toLowerCase()) }
    return string;
}

/**
 * @public
 * @function
 * @summary - Retrieves a random element from the given array, or {@link void} if the given array is invalid or empty
 * @param {array<*>} theArray - the given array
 * @returns {*} - | {@link *} a random element from the array, or {@link void} if none is available
*/
tf.js.GetRandomArrayElement = function (theArray) { return tf.js.GetIsNonEmptyArray(theArray) ? theArray[Math.floor(Math.random() * theArray.length)] : null; }

/**
 * @public
 * @function
 * @summary - Determines if the given candidate is an instance of a given type
 * @param {*} obj - the given candidate
 * @param {object} type - the given type
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsInstanceOf = function (obj, type) { return !!obj && !!type && (obj instanceof type); }

tf.js.GetIsInstanceOf2 = function (obj, type) { return !!obj && !!type && (obj.type == true); }

/**
 * @public
 * @function
 * @summary - Determines if the given candidate is an instance of the [TerraFly Map]{@link tf.map.Map}
 * @param {*} obj - the given candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsMap = function (obj) { return tf.js.GetIsInstanceOf(obj, tf.map.Map); }

/**
 * @public
 * @function
 * @summary - Determines if the given candidate is an instance of [Feature Layer]{@link tf.map.FeatureLayer}
 * @param {*} obj - the given candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsMapFeatureLayer = function (obj) { return tf.js.GetIsInstanceOf(obj, tf.map.FeatureLayer); }

/**
 * @public
 * @function
 * @summary - Determines if the given candidate is an instance of [Map Feature]{@link tf.map.Feature}
 * @param {*} obj - the given candidate
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.js.GetIsMapFeature = function (obj) { return tf.js.GetIsInstanceOf(obj, tf.map.Feature); }

/**
 * @public
 * @function
 * @summary - Retrieves the given candidate instance of the [TerraFly Map]{@link tf.map.Map} or {@link void} if the candidate is not a valid map
 * @param {*} mapCandidate - the given candidate
 * @returns {tf.map.Map} - | {@link tf.map.Map} <b>mapCandidate</b> or {@link void}
*/
tf.js.GetMapFrom = function (mapCandidate) {
    return tf.js.GetIsMap(mapCandidate) ? mapCandidate : null;
    /*var map = !!tMapCandidate && typeof tMapCandidate === "object" ? tMapCandidate : null;

    if (!!map) {
        if (!tf.js.GetIsMap(map)) {
            while (!!map && tf.js.GetFunctionOrNull(map.GetMap)) { map = map.GetMap(); }
            if (!tf.js.GetIsMap(map)) { map = null; }
        }
    }

    return map;*/
}

/**
 * @private
 * @function
 * @summary - Makes a standard [API Key]{@link tf.types.Key} from a given application defined key. Used internally by the API
 * @param {*} key - the given key
 * @returns {tf.types.Key} - | {@link tf.types.Key} the key
*/
tf.js.MakeObjectKey = function (key) { return !!key ? '#' + key : null; }

/**
 * @public
 * @function
 * @summary - Determines if the given {@link object} has the necessary properties of a [GeoJSON Geometry]{@link tf.types.GeoJSONGeometry}
 * @param {object} obj - the given object
 * @returns {boolean} - | {@link boolean} <b>true</b> if <b>obj</b> has GeoJSON geometry attributes, <b>false</b> otherwise
*/
tf.js.GetHasGeoJSONGeometryProperties = function (obj) {
    if (tf.js.GetIsValidObject(obj) && tf.js.GetIsNonEmptyString(obj.type)) {
        var minLen = obj.type.toLowerCase() == "point" ? 2 : 1;
        return tf.js.GetIsArrayWithMinLength(obj.coordinates, minLen);
    }
    return false;
}

/**
 * @public
 * @function
 * @summary - Returns the given {@link object} if it has the <b>geometry</b> property with the necessary sub-properties of a [GeoJSON Geometry]{@link tf.types.GeoJSONGeometry}
 * @param {object} obj - the given object
 * @returns {tf.types.GeoJSONGeometry} - | {@link tf.types.GeoJSONGeometry} <b>obj</b> or {@link void} if <b>obj</b> lacks the necessary properties
*/
tf.js.GetGeoJSONGeometryFrom = function (obj) {
    var geometry = null;

    if (tf.js.GetIsValidObject(obj)) {
        var geom = obj.geometry;
        if (tf.js.GetIsValidObject(geom) && tf.js.GetIsNonEmptyString(geom.type) && tf.js.GetIsNonEmptyArray(geom.coordinates)) { geometry = geom; }
    }

    return geometry;
}

/**
 * @public
 * @function
 * @summary - Returns a valid [GeoJSON extracting callback]{@link tf.types.GetGeoJSONGeometryCallBack} from the given candidate
 * @param {*} getGeometryFromDataFunction - the given candidate
 * @returns {tf.types.GetGeoJSONGeometryCallBack} - | {@link tf.types.GetGeoJSONGeometryCallBack} a valid GeoJSON extracting callback, defaults to {@link tf.js.GetGeoJSONGeometryFrom}
 * @see [Keyed Feature Lists]{@link tf.map.KeyedFeatureList} and [Keyed Feature List Settings]{@link tf.types.KeyedFeatureListSettings}
*/
tf.js.GetGeoJSONGeometryFunctionFrom = function (getGeometryFromDataFunction) {
    if (!(getGeometryFromDataFunction = tf.js.GetFunctionOrNull(getGeometryFromDataFunction))) {
        getGeometryFromDataFunction = tf.js.GetGeoJSONGeometryFrom;
    }
    return getGeometryFromDataFunction;
}

/**
 * @public
 * @function
 * @summary - Determines if the given <b>coords</b> look like [GeoJSON linestring coordinates]{@link tf.types.GeoJSONGeometryType},
 * i.e. coords is an array with 2 or more elements and its first element is also an array with 2 or more elements
 * @param {object} coords - the given coordinates
 * @returns {boolean} - | {@link boolean} <b>true</b> if the given coordinates seem to be linestring coordinates
*/
tf.js.GetLooksLikeLineStringCoords = function (coords) {
    return tf.js.GetIsArrayWithMinLength(coords, 2) && tf.js.GetIsArrayWithMinLength(coords[0], 2);
}

tf.js.GetLooksLineMultiLineStringCoords = function (coords) {
    return tf.js.GetIsArrayWithLength(coords, 0) || (tf.js.GetIsArrayWithMinLength(coords, 1) && tf.js.GetLooksLikeLineStringCoords(coords[0]));
}

tf.js.GetLooksLikeMultiLineStringGeom = function (geom) {
    return tf.js.GetIsValidObject(geom) && tf.js.GetIsNonEmptyString(geom.type) && geom.type.toLowerCase() == "multilinestring" && tf.js.GetLooksLineMultiLineStringCoords(geom.coordinates);
    /*if (!tf.js.GetIsValidObject(geom)) { return false; }
    if (!tf.js.GetIsNonEmptyString(geom.type)) { return false;}
    if (geom.type.toLowerCase() != "multilinestring") { return false; }
    if (!tf.js.GetLooksLineMultiLineStringCoords(geom.coordinates)) { return false; }
    return true;*/
}

tf.js.GetLSVertexDistancesMeters = function (pointCoords) {
    var distances = [];
    if (tf.js.GetLooksLikeLineStringCoords(pointCoords)) {
        distances = [];
        var len = pointCoords.length, totalDist = 0;
        distances.push(totalDist);
        for (var i = 1; i < len; ++i) {
            totalDist += tf.units.GetHaversineDistance(pointCoords[i - 1], pointCoords[i]);
            distances.push(totalDist);
        }
    }
    return distances;
};

tf.js.InterpolateCoords = function (startCoord, endCoord, proj01) {
    return [startCoord[0] + (endCoord[0] - startCoord[0]) * proj01, startCoord[1] + (endCoord[1] - startCoord[1]) * proj01];
};

tf.js.GetLSPointAt = function (fromLS, index, proj) {
    var point;
    if (index >= 0 && proj >= 0 && proj <= 1) {
        if (tf.js.GetLooksLikeLineStringCoords(fromLS)) {
            var lsLen = fromLS.length;
            if (index < lsLen - 1) {
                var thisCoord = fromLS[index], nextCoord = fromLS[index + 1];
                point = tf.js.InterpolateCoords(thisCoord, nextCoord, proj);
            }
            else if (index == lsLen - 1) {
                //if (proj != 1) { console.log('proj should be 1 at end ' + proj); }
                point = fromLS[index]
            } //else { console.log('invalid index ' + index + ' for len ' + lsLen); }
        } //else { console.log('does not look like a line string'); }
    } //else { console.log('negative index or invalid proj: ' + index + ' ' + proj); }
    return point;
};

tf.js.GetLSPointAtDistanceMeters = function (pointCoords, pointDistances, atPointDistanceMeters) {
    if (tf.js.GetLooksLikeLineStringCoords(pointCoords) && tf.js.GetIsArrayWithMinLength(pointDistances, pointCoords.length)) {
        var length = pointCoords.length;
        var totalDistance = pointDistances[length - 1];
        var indexFound = tf.js.BinarySearch(pointDistances, atPointDistanceMeters, function (a, b) { return a - b; });
        if (indexFound < 0) {
            var insertIndex = -(indexFound + 1);
            if (insertIndex > 0) {
                if (insertIndex < length) {
                    var prevIndex = insertIndex - 1, nextIndex = insertIndex;
                    var prevDist = pointDistances[prevIndex], nextDist = pointDistances[nextIndex];
                    var distInSegment = nextDist - prevDist;
                    var distOffset = atPointDistanceMeters - prevDist;
                    var proj = distInSegment != 0 ? distOffset / distInSegment : 0;
                    if (proj > 1) {
                        console.log('invalid proj');
                    }
                    return { pointCoords: tf.js.GetLSPointAt(pointCoords, prevIndex, proj), index: prevIndex, proj: proj };
                }
                else { return { pointCoords: pointCoords[pointCoords.length - 1], index: pointCoords.length - 1, proj: 0 }; }
            }
            else { return { pointCoords: pointCoords[0], index: 0, proj: 0 }; }
        }
        else { return { pointCoords: pointCoords[indexFound], index: indexFound, proj: 0 }; }
    }
    return { pointCoords: undefined, index: -1, proj: 0 };
};

tf.js.GetDistanceMetersAtIndexProj = function (pointCoords, pointDistances, index, proj) {
    var distance = 0;
    if (tf.js.GetLooksLikeLineStringCoords(pointCoords) && tf.js.GetIsArrayWithMinLength(pointDistances, pointCoords.length)) {
        var length = pointCoords.length;
        if (index < 0) { index = 0; proj = 0; }
        else if (index >= length - 1) { index = length - 1; proj = 0; }
        if (proj < 0) { proj = 0; } else if (proj > 1) { proj = 1; }
        distance = pointDistances[index];
        if (proj) { distance += (pointDistances[index + 1] - distance) * proj; }
    }
    return distance;
};

tf.js.CreatePartialLS = function(fromLS, sindex, sproj, eindex, eproj) {
    var lsLen = tf.js.GetLooksLikeLineStringCoords(fromLS) ? fromLS.length : 0;
    var partialLS = [];
    if (lsLen > 1) {
        if (sindex >= 0 && eindex < lsLen && sindex <= eindex) {
            var nMidCoords = eindex - sindex;
            if (nMidCoords > 0) {
                partialLS = fromLS.slice(sindex + 1, sindex + nMidCoords);
            }
            var startCoord = fromLS[sindex], afterStart = fromLS[sindex + 1];
            var newStartCoord = tf.js.InterpolateCoords(startCoord, afterStart, sproj);
            var endCoord = fromLS[eindex];
            var newEndCoord;
            if (eindex < lsLen - 1) {
                var afterEnd = fromLS[eindex + 1];
                /*newEndCoord = [
                    endCoord[0] + (afterEnd[0] - endCoord[0]) * eproj,
                    endCoord[1] + (afterEnd[1] - endCoord[1]) * eproj
                ];*/
                newEndCoord = tf.js.InterpolateCoords(endCoord, afterEnd, eproj);
            }
            else {
                newEndCoord = endCoord;
            }
            partialLS.unshift(newStartCoord);
            partialLS.push(newEndCoord);
        }
    }
    return partialLS;
}

tf.js.CopyLineStringCoords = function(lineStringCoords) {
    var result = [];
    if (tf.js.GetIsArrayWithMinLength(lineStringCoords, 1) && tf.js.GetIsArrayWithMinLength(lineStringCoords[0], 2)) {
        for (var i in lineStringCoords) {
            var lsc = lineStringCoords[i];
            if (tf.js.GetIsArrayWithMinLength(lsc, 2)) {
                result.push([tf.js.GetLongitudeFrom(lsc[0]), tf.js.GetLatitudeFrom(lsc[1])]);
            }
        }
    }
    return result;
}

tf.js.CopyMultiLineStringCoords = function (mlsCoords) {
    var result = [];
    if (tf.js.GetIsNonEmptyArray(mlsCoords)) {
        for (var i in mlsCoords) {
            var ls = mlsCoords[i];
            var lsCopy = tf.js.CopyLineStringCoords(ls);
            if (!!lsCopy) { result.push(lsCopy); }
        }
    }
    return result;
}

tf.js.CopyMultiLineStringGeom = function (geom) {
    var result = { type: 'multilinestring', coordinates: [] };
    if (tf.js.GetIsValidObject(geom) && tf.js.GetIsNonEmptyArray(geom.coordinates)) {
        result.coordinates = tf.js.CopyMultiLineStringCoords(geom.coordinates);
    }
    return result;
}

tf.js.CountMLSPoints = function(mls) {
    var totalPoints = 0;
    if (tf.js.GetIsValidObject(mls) && tf.js.GetIsNonEmptyArray(mls.coordinates)) {
        for (var i in mls.coordinates) {
            var ls = mls.coordinates[i];
            if (tf.js.GetIsNonEmptyArray(ls)) {
                if (tf.js.GetIsArrayWithMinLength(ls[0], 2)) {
                    totalPoints += ls.length;
                }
            }
        }
    }
    return totalPoints;
}

/**
 * @public
 * @function
 * @summary - Extracts standard [Map Coordinates]{@link tf.types.mapCoordinates} from the given coordinates
 * @param {tf.types.mapCoordinates|deprecatedMapCoords1|deprecatedMapCoords2|deprecatedMapCoords3|deprecatedMapCoords4} coords - the given coordinates
 * @returns {tf.types.mapCoordinates} - | {@link tf.types.mapCoordinates} map coordinates
*/
tf.js.GetMapCoordsFrom = function (coords) {
    var latitude, longitude;
    if (tf.js.GetIsArrayWithMinLength(coords, 2)) { latitude = coords[1]; longitude = coords[0]; }
    else if (typeof coords === "object") {
        if (coords.lat !== undefined) { latitude = coords.lat; longitude = coords.lon; }
        else if (coords.Lat != undefined) { latitude = coords.Lat; longitude = coords.Lon; }
        else if (coords.latitude != undefined) { latitude = coords.latitude; longitude = coords.longitude; }
        else if (coords.Latitude != undefined) { latitude = coords.Latitude; longitude = coords.Longitude; }
    }

    if (latitude === undefined) { latitude = 0; longitude = 0; }
    else { latitude = tf.js.GetLatitudeFrom(latitude); longitude = tf.js.GetLongitudeFrom(longitude); }

    return [longitude, latitude];
}

/**
 * @private
 * @function
 * @summary - Implements a basic inheritance pattern. Used internally by the API
 * @param {object} subClass - the subclass
 * @param {object} superClass - the superclass
 * @returns {void} - | {@link void} no return value
*/
tf.js.InheritFrom = function (subClass, superClass) { return ol.inherits(subClass, superClass); }

/**
 * @public
 * @function
 * @summary - Creates and sets to the given value, or deletes, the given property of the given object
 * @param {object} toObj - the object to which the property will be set
 * @param {string} propertyName - the name of the property to be set
 * @param {object|void} propertyObj - the value of the property to be set, if {@link void} the property <b>propertyName<b> is deleted from <b>toObj</b>
 * @returns {void} - | {@link void} no return value
 * @see {@link tf.js.GetObjProperty} and {@link tf.types.KnownAPIPropertyName}
*/
tf.js.SetObjProperty = function (toObj, propertyName, propertyObj) {
    if (tf.js.GetIsValidObject(toObj) && tf.js.GetIsNonEmptyString(propertyName) && ((! propertyObj) || tf.js.GetIsValidObject(propertyObj))) {
        if (!!propertyObj) { toObj[propertyName] = propertyObj; } else if (!!toObj[propertyName]) { delete toObj[propertyName]; }
    }
}

/**
 * @public
 * @function
 * @summary - Retrieves given property from the given object
 * @param {object} fromObj - the object from which the property will be retrieved
 * @param {string} propertyName - the name of the property to retrieve
 * @returns {object} - | {@link object} the retrieved property, or {@link void} if <b>fromObj</b> does not contain a property named <b>propertyName</b>
 * @see {@link tf.js.SetObjProperty} and {@link tf.types.KnownAPIPropertyName}
*/
tf.js.GetObjProperty = function (fromObj, propertyName) {
    var propertyObj = undefined;
    if (tf.js.GetIsValidObject(fromObj) && tf.js.GetIsNonEmptyString(propertyName)) { propertyObj = fromObj[propertyName]; }
    return propertyObj;
}

/**
 * @public
 * @function
 * @summary - Retrieves a regular expression used by the API to retrieve attribute name references from
 * inside strings, example: to reference an attribute named "tempCelsius" in a string use "The temperature in Celsius is $[tempCelsius], it's a sunny day";
 * the regular expression captures the string enclosed inside brackets that immediately follow a $ sign
 * @returns {RegExp} - | {@link RegExp} the regular expression
*/
tf.js.GetFindReferenceInStringRegExp = function () { return /\$\[(\w+)\]/; }

/**
 * @public
 * @function
 * @summary - Replaces references made in the given string with values from attributes of the given object,
 * or a default given value
 * @param {string} strToReplace - the given string including references
 * @param {object} objectWithValues - the object from which attribute values will be retrieved
 * @param {string} defaultStr - the given default string, used if <b>objectWithValues</b> does not contain a referenced attribute
 * @param {RegExp} attributeNameMatch - if defined, used to locate attribute name references in <b>strToReplace</b>, defaults to
 * the regular expression obtained with the function {@link tf.js.GetFindReferenceInStringRegExp}
 * @returns {string} - | {@link string} the string with replacements
*/
tf.js.ReplaceWithValues = function (strToReplace, objectWithValues, defaultStr, attributeNameMatch) {
    var strReplaced = defaultStr;

    if (tf.js.GetIsString(strToReplace)) {
        strReplaced = strToReplace;
        if (tf.js.GetIsValidObject(objectWithValues)) {
            if (attributeNameMatch === undefined) { attributeNameMatch = tf.js.GetFindReferenceInStringRegExp(); }
            if (tf.js.GetIsInstanceOf(attributeNameMatch, RegExp)) {
                var match;
                while (match = attributeNameMatch.exec(strReplaced)) {
                    var propsVal = objectWithValues[match[1]];
                    if (!tf.js.GetIsString(propsVal)) {
                        if (propsVal !== undefined && tf.js.GetFunctionOrNull(propsVal.toString)) {
                            propsVal = propsVal.toString();
                        }
                        else {
                            propsVal = '';
                        }
                    }
                    strReplaced = strReplaced.replace(match[0], propsVal);
                }
            }
        }
    }
    return strReplaced;
}

/**
 * @public
 * @function
 * @summary - Replaces references in string attributes of the given object with the same named attribute values of another given object
 * @param {object} objectToReplace - the object whose string attribute values will be replaced
 * @param {object} objectWithValues - the object from which attribute values will be retrieved
 * @param {RegExp} attributeNameMatch - if defined, used to locate attribute name references in the string attributes of <b>objectToReplace</b>, defaults to
 * the regular expression obtained with the function {@link tf.js.GetFindReferenceInStringRegExp}
 * @returns {object} - | {@link object} the object with attribute replacements
*/
tf.js.ReplaceObjectWithValues = function (objectToReplace, objectWithValues, attributeNameMatch) {
    if (attributeNameMatch === undefined) { attributeNameMatch = tf.js.GetFindReferenceInStringRegExp(); }
    if (tf.js.GetIsValidObject(objectToReplace) && tf.js.GetIsValidObject(objectWithValues) && tf.js.GetIsInstanceOf(attributeNameMatch, RegExp)) {
        for (var property in objectToReplace) {
            if (objectToReplace.hasOwnProperty(property)) {
                var propertyVal = objectToReplace[property];
                if (tf.js.GetIsNonEmptyString(propertyVal)) { objectToReplace[property] = tf.js.ReplaceWithValues(propertyVal, objectWithValues, propertyVal, attributeNameMatch); }
            }
        }
    }
    return objectToReplace;
}

tf.js.Spline1D = function (startCoord, startControlCoord, endControlCoord, endCoord) {
    var theThis, C1, C2, C3, C4;

    this.GetStartCoord = function () { return C4; }
    this.GetEndCoord = function () { return C1; }
    this.GetControlCoord = function (startControlBool) { return !!startControlBool ? C3 : C2; }

    this.GetCoord = function (t) {
        var t2 = t * t, t3 = t2 * t, invT = 1 - t, invT2 = invT * invT, invT3 = invT2 * invT;
        return C1 * t3 + 3 * (C2 * t2 * invT + C3 * t * invT2) + C4 * invT3;
    }

    this.GetVelocity = function (t) {
        var invT = 1 - t;
        return 3 * ((invT * invT * (C3 - C4)) + (t * t * (C1 - C2))) + 6 * invT * t * (C2 - C3);
    }

    this.GetAcceleration = function (t) { return 6 * ((1 - t) * (C2 - 2 * C3 + C4) + t * (C1 - 2 * C2 + C3)); }

    function initialize() {
        C1 = tf.js.GetFloatNumber(endCoord, 0);
        C2 = tf.js.GetFloatNumber(endControlCoord, 0);
        C3 = tf.js.GetFloatNumber(startControlCoord, 0);
        C4 = tf.js.GetFloatNumber(startCoord, 0);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.js.Spline2D = function (startCoords, startControlCoords, endControlCoords, endCoords) {
    var theThis, splines;

    this.GetStartCoords = function () { return [splines[0].GetStartCoord(), splines[1].GetStartCoord()]; }
    this.GetEndCoords = function () { return [splines[0].GetEndCoord(), splines[1].GetEndCoord()]; }
    this.GetControlCoords = function (startControlBool) { return [splines[0].GetControlCoord(startControlBool), splines[1].GetControlCoord(startControlBool)]; }

    this.GetCoords = function (t) { return [splines[0].GetCoord(t), splines[1].GetCoord(t)]; }
    this.GetVelocity = function (t) { return [splines[0].GetVelocity(t), splines[1].GetVelocity(t)]; }
    this.GetAcceleration = function (t) { return [splines[0].GetAcceleration(t), splines[1].GetAcceleration(t)]; }

    function initialize() {
        var zz = [0, 0];
        startCoords = tf.js.GetIsArrayWithMinLength(startCoords, 2) ? startCoords.slice(0) : zz,
        startControlCoords = tf.js.GetIsArrayWithMinLength(startControlCoords, 2) ? startControlCoords.slice(0) : zz,
        endControlCoords = tf.js.GetIsArrayWithMinLength(endControlCoords, 2) ? endControlCoords.slice(0) : zz,
        endCoords = tf.js.GetIsArrayWithMinLength(endCoords, 2) ? endCoords.slice(0) : zz,
        splines = [
            new tf.js.Spline1D(startCoords[0], startControlCoords[0], endControlCoords[0], endCoords[0]),
            new tf.js.Spline1D(startCoords[1], startControlCoords[1], endControlCoords[1], endCoords[1])
        ];
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * @public
 * @function
 * @summary - Retrieves the URL to the "Powered by TerraFly" logo in this platform of the <b>TerraFly API</b>
* @returns {string} - | {@link string} the logo URL
*/
tf.platform.GetPoweredByTerraFlyLogoImgStr = function () {
    return "http://tf-core.cs.fiu.edu/hterramap/image/svg/poweredByTF.svg";
    //return tf.platform.MakePlatformPath("image/svg/poweredByTF.svg");
}

/**
 * @public
 * @function
 * @summary - Retrieves the ["Powered by TerraFly" logo]{@link tf.dom.Img} from this platform of the <b>TerraFly API</b>
* @returns {tf.dom.Img} - | {@link tf.dom.Img} the logo
*/
tf.platform.GetPoweredByTerraFlyLogo = function () { return tf.GetStyles().CreateImageFullWidthHeight(tf.platform.GetPoweredByTerraFlyLogoImgStr()); }

/**
* @public
* @function
* @summary - Retrieves the full url to a resource in this platform of the <b>TerraFly API</b> given a relative path
* @param {string} srcRelPathNoLeadingSlash - the relative path, without a leading '\' or '/' character
* @returns {string} - | {@link string} the full url
*/
tf.platform.MakePlatformPath = function (srcRelPathNoLeadingSlash) { return tf.platform.GetURL() + srcRelPathNoLeadingSlash; }

// tf.units

/**
 * @public
 * @function
 * @summary - An [Easing Function]{@link tf.types.EasingFunction} that starts slow and speeds up
 * @param {tf.types.value01} t - the input value
 * @return {tf.types.value01} - | {@link tf.types.value01} the output value
 */
tf.units.EaseIn = function (t) { return Math.pow(t, 3); }; 

/**
 * @public
 * @function
 * @summary - An [Easing Function]{@link tf.types.EasingFunction} that starts fast and slows down
 * @param {tf.types.value01} t - the input value
 * @return {tf.types.value01} - | {@link tf.types.value01} the output value
 */
tf.units.EaseOut = function (t) { return 1 - ol.easing.easeIn(1 - t); };

/**
 * @public
 * @function
 * @summary - An [Easing Function]{@link tf.types.EasingFunction} that starts slow, speeds up, and then slows down again
 * @param {tf.types.value01} t - the input value
 * @return {tf.types.value01} - | {@link tf.types.value01} the output value
 */
tf.units.EaseInAndOut = function (t) { return 3 * t * t - 2 * t * t * t; }

/**
 * @public
 * @function
 * @summary - An [Easing Function]{@link tf.types.EasingFunction} that maintains the same rate of variation as its argument,
 * and can be used to achieve constant speed over time
 * @param {tf.types.value01} t - the input value
 * @return {tf.types.value01} - | {@link tf.types.value01} the output value
 */
tf.units.EaseLinear = function (t) { return t; }

/**
 * @public
 * @function
 * @summary - Retrieves the number of milliseconds in one day
 * @returns {number} - | {@link number} the number of milliseconds in one day
*/
tf.units.GetOneDayMillis = function () { return 24 * 60 * 60 * 1000; }

/**
 * @public
 * @function
 * @summary - Retrieves the number of days between two given dates
 * @param {Date} date1 - a date
 * @param {Date} date2 - a date
 * @returns {number} - | {@link number} the number of days between the two given dates
*/
tf.units.GetDaysBetweenDates = function (date1, date2) { return Math.round(Math.abs((date1.getTime() - date2.getTime()) / (tf.units.GetOneDayMillis()))); }

/**
 * @public
 * @function
 * @summary - Retrieves the {@link tf.units.UtmGdcConverter} singleton
 * @returns {tf.units.UtmGdcConverter} - | {@link tf.units.UtmGdcConverter} the singleton
*/
tf.units.GetUtmGdcConverter = function () { if (!tf.g_UtmGdcConverter) { tf.g_UtmGdcConverter = new tf.units.UtmGdcConverter(); } return tf.g_UtmGdcConverter; }

/**
 * @public
 * @function
 * @summary - Retrieves the {@link tf.units.LevelResolutionConverter} singleton
 * @returns {tf.units.LevelResolutionConverter} - | {@link tf.units.LevelResolutionConverter} the singleton
*/
tf.units.GetLevelResolutionConverter = function () { if (!tf.g_LevelResolutionConverter) { tf.g_LevelResolutionConverter = new tf.units.LevelResolutionConverter(); } return tf.g_LevelResolutionConverter; }

/**
 * @public
 * @function
 * @summary - Converts an angle in degrees to radians
 * @param {number} angle - in degrees
 * @returns {number} - | {@link number} angle in radians
*/
tf.units.DegreesToRadians = function (angle) { angle = tf.js.GetFloatNumber(angle, 0); return Math.PI * angle / 180; }

/**
 * @public
 * @function
 * @summary - Converts an angle in radians to degrees
 * @param {number} angle - in radians
 * @returns {number} - | {@link number} angle in degrees
*/
tf.units.RadiansToDegrees = function (angle) { angle = tf.js.GetFloatNumber(angle, 0); return 180 * angle / Math.PI; }

/**
 * @public
 * @function
 * @summary - Calculates the total distance in meters between the given <b>coords</b>, that should be formatted like [GeoJSON linestring coordinates]{@link tf.types.GeoJSONGeometryType},
 * i.e. coords is an array with 2 or more elements and its first element is also an array with 2 or more elements
 * @param {object} coords - the given coordinates
 * @param {boolean} wrapBool - if <b>true</b> adds the distance between the first and last points, defaults to {@link void}
 * @returns {number} - | {@link number} the total distance in meters
*/
tf.units.GetTotalDistanceInMeters = function (pointCoords, wrapBool) {
    var totalDist = 0;

    if (tf.js.GetLooksLikeLineStringCoords(pointCoords)) {
        var len = pointCoords.length, lastCoord = len - 1;
        for (var i = 0 ; i < lastCoord ; ++i) {
            totalDist += tf.units.GetDistanceInMetersBetweenMapCoords(pointCoords[i], pointCoords[i + 1]);
        }
        if (!!wrapBool) { totalDist += tf.units.GetDistanceInMetersBetweenMapCoords(pointCoords[0], pointCoords[lastCoord]); }
    }

    return totalDist;
}

tf.units.GetTotalHaversineDistanceInMeters = function (pointCoords, wrapBool) {
    var totalDist = 0;

    if (tf.js.GetLooksLikeLineStringCoords(pointCoords)) {
        var len = pointCoords.length, lastCoord = len - 1;
        for (var i = 0 ; i < lastCoord ; ++i) {
            totalDist += tf.units.GetHaversineDistance(pointCoords[i], pointCoords[i + 1]);
        }
        if (!!wrapBool) { totalDist += tf.units.GetHaversineDistance(pointCoords[0], pointCoords[lastCoord]); }
    }

    return totalDist;
}

tf.units.SplitSegment = function (startPoint, endPoint, nSplits) {
    var splitPoints = [];

    if ((startPoint = tf.js.GetMapCoordsFrom(startPoint)) !== undefined &&
        (endPoint = tf.js.GetMapCoordsFrom(endPoint)) !== undefined) {

        var X = startPoint[0], Y = startPoint[1], offX = endPoint[0] - X, offY = endPoint[1] - Y;

        for (var j = 0 ; j < nSplits ; ++j) {
            var mult = (j + 1) / (nSplits + 1);
            var dX = offX * mult, dY = offY * mult;
            splitPoints.push([X + dX, Y + dY]);
        }
    }

    return splitPoints;
}

tf.units.SplitLineStringSegments = function (pointCoords, maxSegDist, wrapBool, indicesArray) {

    if (tf.js.GetLooksLikeLineStringCoords(pointCoords) && maxSegDist !== undefined && tf.js.GetIsNonNegativeNumber(maxSegDist)) {
        var len = pointCoords.length, lastCoord = len - 1;
        var indexInIndices = 0, nIndices;
        if (tf.js.GetIsNonEmptyArray(indicesArray)) { nIndices = indicesArray.length; indexInIndices = 0; } else { indicesArray = null; }
        for (var i = 0 ; i < lastCoord ; ++i) {
            var pt1 = pointCoords[i], pt2 = pointCoords[i + 1];
            var thisDist = tf.units.GetDistanceInMetersBetweenMapCoords(pt1, pt2);

            if (!!indicesArray) { while (indexInIndices < nIndices && indicesArray[indexInIndices] <= i) { ++ indexInIndices; } }

            if (thisDist > maxSegDist) {
                var nSplits = Math.floor(thisDist / maxSegDist) + 1;
                var splitPoints = tf.units.SplitSegment(pt1, pt2, nSplits);
                for (var j = 0 ; j < splitPoints.length ; ++j) { pointCoords.splice(i + j + 1, 0, splitPoints[j]); }
                if (!!indicesArray) { for (var ind = indexInIndices ; ind < nIndices ; ind++) { indicesArray[ind] += (nSplits); } }
                i += nSplits;
                lastCoord += nSplits;
            }
        }
        if (!!wrapBool) {
            var pt1 = pointCoords[lastCoord], pt2 = pointCoords[0];
            var thisDist = tf.units.GetDistanceInMetersBetweenMapCoords(pt1, pt2);

            if (thisDist > maxSegDist) {
                var nSplits = Math.floor(thisDist / maxSegDist) + 1;
                var splitPoints = tf.units.SplitSegment(pt1, pt2, nSplits);
                pointCoords = pointCoords.concat(splitPoints);
            }
        }
    }

    return pointCoords;
}

tf.units.DisplaceMapCoords = function(mapCoords, angleRad, distanceInMeters) {
    var mc = tf.js.GetMapCoordsFrom(mapCoords);
    var lat = mapCoords[1], lon = mapCoords[0];
    distanceInMeters = distanceInMeters / 6378137;
    var latRad = tf.units.DegreesToRadians(lat);
    var lonRad = tf.units.DegreesToRadians(lon);
    var newLatRad = Math.asin(Math.sin(latRad) * Math.cos(distanceInMeters) +
        Math.cos(latRad) * Math.sin(distanceInMeters) * Math.cos(angleRad));
    var newLonRad = lonRad + Math.atan2(Math.sin(angleRad) * Math.sin(distanceInMeters) * Math.cos(latRad),
        Math.cos(distanceInMeters) - Math.sin(latRad) * Math.sin(newLatRad));

    return (isNaN(newLatRad) || isNaN(newLonRad)) ? [0, 0] : [tf.units.RadiansToDegrees(newLonRad), tf.units.RadiansToDegrees(newLatRad)];
}

/**
 * @public
 * @function
 * @summary - Calculates the distance in meters between two given map coordinates
 * @param {tf.types.mapCoordinates} pointCoords1 - map coordinates 1
 * @param {tf.types.mapCoordinates} pointCoords2 - map coordinates 2
 * @returns {number} - | {@link number} the distance in meters
*/
tf.units.GetDistanceInMetersBetweenMapCoords = function (pointCoords1, pointCoords2) {
    var meters1 = tf.units.Degrees2Meters(pointCoords1);
    var meters2 = tf.units.Degrees2Meters(pointCoords2);
    var dx = meters2[0] - meters1[0], dy = meters2[1] - meters1[1];
    return Math.sqrt(dx * dx + dy * dy);
}

tf.js.CalcPolyAreaInSquareMeters = function (lineString, isClosed) {
    var area = 0;
    if (tf.js.GetLooksLikeLineStringCoords(lineString)) {
        var lineStringUse = !!isClosed ? lineString : lineString.slice(0);
        if (!isClosed) { lineStringUse.push(lineString[0]); }
        area = Math.abs(tf.map.MapSphere.geodesicArea(lineStringUse));
    }
    return area;
};

tf.units.GetHaversineDistance = function (c1, c2) {
    var REarth = 6378137;
    var toRad = Math.PI / 180;
    var lat1 = toRad * c1[1];
    var lat2 = toRad * c2[1];
    var deltaLatBy2 = (lat2 - lat1) / 2;
    var deltaLonBy2 = (toRad * (c2[0] - c1[0])) / 2;
    var a = Math.sin(deltaLatBy2) * Math.sin(deltaLatBy2) +
        Math.sin(deltaLonBy2) * Math.sin(deltaLonBy2) *
        Math.cos(lat1) * Math.cos(lat2);
    return 2 * REarth * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * @public
 * @function
 * @summary - Calculates the heading from the given start to end coordinates
 * @param {tf.types.mapCoordinates} start - start coordinates
 * @param {tf.types.mapCoordinates} end - end coordinates
 * @returns {number} - | {@link number} the angle in radians
*/
tf.units.GetMapHeading = function (start, end) {
    var heading = 0;

    if (tf.js.GetIsArrayWithMinLength(start, 2) && tf.js.GetIsArrayWithMinLength(end, 2)) {
        var fromLon = start[0], toLon = end[0], fromLat = start[1], toLat = end[1];
        var deltaX = (toLon - fromLon);
        var deltaY = (toLat - fromLat);
        heading = Math.atan2(deltaY, deltaX);
    }
    return heading;
};

tf.units.GetMapHeading1 = function (p1, p2) {
    var toRad = Math.PI / 180;
    var lon1 = p1[0] * toRad, lon2 = p2[0] * toRad;
    var lat1 = p1[1] * toRad, lat2 = p2[1] * toRad;
    var a = Math.sin(lon2 - lon1) * Math.cos(lat2);
    var b = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    return Math.atan2(a, b);
};

/**
 * @public
 * @function
 * @summary - Normalizes the given angle to the [0..2*PI] range
 * @param {number} angle - the given angle, in radians
 * @returns {number} - | {@link number} the normalized angle, in radians
*/
tf.units.NormalizeAngle0To2PI = function (a) {
    var TwoPI = Math.PI * 2;
    var nAngle = ((a % TwoPI) + TwoPI) % TwoPI;
    var tolerance = 0.00001;
    if (Math.abs(nAngle) < tolerance || Math.abs(TwoPI = nAngle) < tolerance) { nAngle = 0; }
    return nAngle;
}

/**
 * @public
 * @function
 * @summary - Calculates the smallest arc between two given angles
 * @param {number} fromAngle - the given initial angle, in radians
 * @param {number} toAngle - the given final angle, in radians
 * @returns {number} - | {@link number} the smallest arc, in radians
*/
tf.units.GetShortestArcBetweenAngles = function (fromAngle, toAngle) {
    var PI = Math.PI, twoPI = PI + PI, threePI = twoPI + PI;
    return ((((toAngle - fromAngle) % twoPI) + threePI) % twoPI) - PI;
}

/**
 * @public
 * @class
 * @summary The {@link singleton} instance of this class, obtainable by calling {@link tf.units.GetUtmGdcConverter},
 * converts {@link tf.types.mapCoordinates} to and from {@link tf.types.mapUTMCoordinates}
*/
tf.units.UtmGdcConverter = function () {
    var RADIANS_PER_DEGREE = 0.0174532925199432957692;
    var DEGREES_PER_RADIAN = 57.2957795130823208768;
    var CScale = 0.9996;
    var A = 6378137, F = 1 / 298.257223563, C = (A) * (1 - F);
    var Eps2 = (F) * (2.0 - F), Eps25 = 0.25 * (Eps2), Epps2 = (Eps2) / (1.0 - Eps2), EF = F / (2.0 - F), Epsp2 = 0;
    var Con = (1.0 - Eps2), Con2 = 2 / (1.0 - Eps2), Con6 = 0.166666666666667, Con24 = 4 * .0416666666666667 / (1 - Eps2), Con120 = 0.00833333333333333, Con720 = 4 * 0.00138888888888888 / (1 - Eps2);
    var polx2b_i = 3.0 / 8.0 * (1.0 * Eps2 + 1.0 / 4.0 * Math.pow(Eps2, 2) + 15.0 / 128.0 * Math.pow(Eps2, 3) - 455.0 / 4096.0 * Math.pow(Eps2, 4));
    var polx3b_i = 15.0 / 256.0 * (1.0 * Math.pow(Eps2, 2) + 3.0 / 4.0 * Math.pow(Eps2, 3) - 77.0 / 128.0 * Math.pow(Eps2, 4));
    var polx4b_i = 35.0 / 3072.0 * (Math.pow(Eps2, 3) - 41.0 / 32.0 * Math.pow(Eps2, 4));
    var polx5b_i = -315.0 / 131072.0 * Math.pow(Eps2, 4);
    var poly1b = 1.0 - (1.0 / 4.0 * Eps2) - (3.0 / 64.0 * Math.pow(Eps2, 2)) - (5.0 / 256.0 * Math.pow(Eps2, 3)) - (175.0 / 16384.0 * Math.pow(Eps2, 4));
    var poly2b = polx2b_i * -2.0 + polx3b_i * 4.0 - polx4b_i * 6.0 + polx5b_i * 8.0;
    var poly3b = polx3b_i * -8.0 + polx4b_i * 32.0 - polx5b_i * 80.0;
    var poly4b = polx4b_i * -32.0 + polx5b_i * 192.0;
    var poly5b = polx5b_i * -128.0;
    var polx1a_i = 1.0 - Eps2 / 4.0 - 3.0 / 64.0 * Math.pow(Eps2, 2) - 5.0 / 256.0 * Math.pow(Eps2, 3) - 175.0 / 16384.0 * Math.pow(Eps2, 4);
    var polx2a_i = 3.0 / 2.0 * EF - 27.0 / 32.0 * Math.pow(EF, 3);
    var polx4a_i = 21.0 / 16.0 * Math.pow(EF, 2) - 55.0 / 32.0 * Math.pow(EF, 4);
    var polx6a_i = 151.0 / 96.0 * Math.pow(EF, 3);
    var polx8a_i = 1097.0 / 512.0 * Math.pow(EF, 4);
    var conap = A * polx1a_i;
    var polx2b = polx2a_i * 2.0 + polx4a_i * 4.0 + polx6a_i * 6.0 + polx8a_i * 8.0;
    var polx3b = polx4a_i * -8.0 - polx6a_i * 32.0 - 80.0 * polx8a_i;
    var polx4b = polx6a_i * 32.0 + 192.0 * polx8a_i;
    var polx5b = -128.0 * polx8a_i;

    /**
     * @public
     * @function
     * @summary - Converts UTM coordinates into Map coordinates
     * @param {tf.types.mapUTMCoordinates} xyzoneCoords - UTM coordinates
     * @returns {tf.types.mapCoordinates} - | {@link tf.types.mapCoordinates} map coordinates
    */
    this.UtmToGdc = function (xyzoneCoords) {
        var latitude = 0, longitude = 0;

        if (tf.js.GetIsArrayWithLength(xyzoneCoords, 3)) {
            var x = xyzoneCoords[0];
            var y = xyzoneCoords[1];
            var zone = xyzoneCoords[2];
            var hemisphere_north = zone >= 0; if (!hemisphere_north) { zone = -zone; }
            var source_x = (x - 500000.0) / 0.9996;
            var source_y = hemisphere_north ? y / 0.9996 : (y - 1.0E7) / 0.9996;
            var u = source_y / conap, su = Math.sin(u), cu = Math.cos(u), su2 = su * su; // TEST U TO SEE IF AT POLES
            var xlon0 = (6.0 * (zone) - 183.0) / DEGREES_PER_RADIAN;
            /* THE SNYDER FORMULA FOR PHI1 IS OF THE FORM: PHI1=U+POLY2A*Sin(2U)+POLY3A*Sin(4U)+POLY4ASin(6U)+...
            BY USINGG MULTIPLE ANGLE TRIGONOMETRIC IDENTITIES AND APPROPRIATE FACTORING JUST THE SINE AND COSINE ARE REQUIRED NOW READY TO GET PHI1 */
            var temp = polx2b + su2 * (polx3b + su2 * (polx4b + su2 * polx5b));
            var phi1 = u + su * cu * temp;
            // COMPUTE VARIABLE COEFFICIENTS FOR FINAL RESULT COMPUTE THE VARIABLE COEFFICIENTS OF THE LAT AND LON EXPANSIONS
            var sp = Math.sin(phi1), sp2 = sp * sp, cp = Math.cos(phi1), cp2 = cp * cp, tp = sp / cp, tp2 = tp * tp;
            var eta2 = Epsp2 * cp2; // note 2015-10-14 Epsp2 is always 0 => eta2 is always 0
            var top = 0.25 - (sp2 * (Eps2 / 4));
            // inline sq root
            var rn = A / ((0.25 - Eps25 * sp2 + 0.9999944354799 / 4) + (0.25 - Eps25 * sp2) / (0.25 - Eps25 * sp2 + 0.9999944354799 / 4));
            var b3 = 1.0 + tp2 + tp2 + eta2, b4 = 5 + tp2 * (3 - 9 * eta2) + eta2 * (1 - 4 * eta2);
            var b5 = 5 + tp2 * (tp2 * 24.0 + 28.0) + eta2 * (tp2 * 8.0 + 6.0);
            var b6 = 46.0 - 3.0 * eta2 + tp2 * (-252.0 - tp2 * 90.0);

            b6 = eta2 * (b6 + eta2 * tp2 * (tp2 * 225.0 - 66.0));
            b6 += 61.0 + tp2 * (tp2 * 45.0 + 90.0);

            var d1 = source_x / rn, d2 = d1 * d1;
            latitude = (phi1 - tp * top * (d2 * (Con2 + d2 * ((-Con24) * b4 + d2 * Con720 * b6)))) * DEGREES_PER_RADIAN;
            longitude = (xlon0 + d1 * (1.0 + d2 * (-Con6 * b3 + d2 * Con120 * b5)) / cp) * DEGREES_PER_RADIAN;
        }
        return [longitude, latitude];
    }

    /**
     * @public
     * @function
     * @summary - Converts Map coordinates into UTM coordinates
     * @param {tf.types.mapCoordinates} lonLatCoords - Map coordinates
     * @returns {tf.types.mapUTMCoordinates} - | {@link tf.types.mapUTMCoordinates} UTM coordinates
    */
    this.GdcToUtm = function (lonLatCoords) {
        var x = 0, y = 0, zone = 0;

        if (tf.js.GetIsArrayWithLength(lonLatCoords, 2)) {
            var longitude = lonLatCoords[0];
            var latitude = lonLatCoords[1];
            var hemisphere_north = latitude >= 0;
            var source_lat = latitude * RADIANS_PER_DEGREE, source_lon = longitude * RADIANS_PER_DEGREE;
            var s1 = Math.sin(source_lat), c1 = Math.cos(source_lat), tx = s1 / c1, s12 = s1 * s1;
            // USE IN-LINE SQUARE ROOT
            var rn = A / ((0.25 - Eps25 * s12 + .9999944354799 / 4) + (0.25 - Eps25 * s12) / (0.25 - Eps25 * s12 + 0.9999944354799 / 4));

            // Compute Zone
            zone = (source_lon * 30.0 / 3.1415926 + 31); zone = zone <= 0 ? 1 : zone >= 61 ? 60 : zone;

            // this statement is very important. zone should be an integer. there would be a large deviation without it.
            if ((zone % 1) != 0) { zone = zone - (zone % 1); }

            // COMPUTE UTM COORDINATES
            var axlon0 = (zone * 6 - 183) * RADIANS_PER_DEGREE;
            var al = (source_lon - axlon0) * c1;
            var sm = s1 * c1 * (poly2b + s12 * (poly3b + s12 * (poly4b + s12 * poly5b))); sm = A * (poly1b * source_lat + sm);
            var tn2 = tx * tx, cee = Epps2 * c1 * c1, al2 = al * al;
            var poly1 = 1.0 - tn2 + cee;
            var poly2 = 5.0 + tn2 * (tn2 - 18.0) + cee * (14.0 - tn2 * 58.0);

            // COMPUTE EASTING
            x = (CScale * rn * al * (1.0 + al2 * (0.166666666666667 * poly1 + 0.00833333333333333 * al2 * poly2))) + 5.0E5;

            //COMPUTE NORTHING
            poly1 = 5.0 - tn2 + cee * (cee * 4.0 + 9.0);
            poly2 = 61.0 + tn2 * (tn2 - 58.0) + cee * (270.0 - tn2 * 330.0);

            y = CScale * (sm + rn * tx * al2 * (0.5 + al2 * (0.0416666666666667 * poly1 + 0.00138888888888888 * al2 * poly2)));
            if (source_lat < 0.0) { y += 1.0E7; }

            // compute isnorth
            if (!hemisphere_north) { zone = -zone; }
        }
        return [x, y, zone];
    }
};

/**
 * @public
 * @function
 * @summary - Converts Map coordinates into UTM coordinates
 * @param {tf.types.mapCoordinates} lonLatCoords - Map coordinates
 * @returns {tf.types.mapUTMCoordinates} - | {@link tf.types.mapUTMCoordinates} UTM coordinates
*/
tf.units.GdcToUtm = function (lonlatCoords) { return tf.units.GetUtmGdcConverter().GdcToUtm(lonlatCoords); }

/**
 * @public
 * @function
 * @summary - Converts UTM coordinates into Map coordinates
 * @param {tf.types.mapUTMCoordinates} xyzoneCoords - UTM coordinates
 * @returns {tf.types.mapCoordinates} - | {@link tf.types.mapCoordinates} map coordinates
*/
tf.units.UtmToGdc = function (xyzoneCoords) { return tf.units.GetUtmGdcConverter().UtmToGdc(xyzoneCoords); }

/**
 * @public
 * @class
 * @summary The {@link singleton} instance of this class, obtainable by calling {@link tf.units.GetLevelResolutionConverter},
 * converts {@link tf.types.mapLevel} values to and from {@link tf.types.mapResolution} values
*/
tf.units.LevelResolutionConverter = function () {
    var theThis, zoomLevels, maxLevels, minResolutions;

    /**
     * @public
     * @function
     * @summary - Obtains the map level corresponding to the given map resolution
     * @param {tf.types.mapResolution} resolution - the given map resolution
     * @returns {tf.types.mapLevel} - | {@link tf.types.mapLevel} the corresponding map level
    */
    this.GetLevelByResolution = function (resolution) {
        resolution = tf.js.GetFloatNumber(resolution, tf.consts.defaultRes);
        var level = 0; while (level < maxLevels - 1 && resolution < minResolutions[level]) { ++level; }
        return level + 1;
    }

    /**
     * @public
     * @function
     * @summary - Obtains the map resolution corresponding to the given map level
     * @param {tf.types.mapLevel} level - the given map level
     * @returns {tf.types.mapResolution} - | {@link tf.types.mapResolution} the corresponding map resolution
    */
    this.GetResolutionByLevel = function (level) { return zoomLevels[tf.js.GetIntNumberInRange(level, tf.consts.minLevel, maxLevels/*tf.consts.maxLevel*/, tf.consts.defaultLevel) - 1]; }

    function initialize() {
        var sqrt2 = Math.SQRT2;

        minResolutions = [];
        zoomLevels = [];

        //LatlongData
        zoomLevels[0] = 78271.5170; zoomLevels[1] = 39135.7585; zoomLevels[2] = 19567.8792; zoomLevels[3] = 9783.9396;
        zoomLevels[4] = 4891.9698; zoomLevels[5] = 2445.9849; zoomLevels[6] = 1222.9925; zoomLevels[7] = 611.4962;
        zoomLevels[8] = 305.7481; zoomLevels[9] = 152.8741;
        // UTMData
        zoomLevels[10] = 76.8; zoomLevels[11] = 38.4; zoomLevels[12] = 19.2; zoomLevels[13] = 9.6;
        zoomLevels[14] = 4.8; zoomLevels[15] = 2.4; zoomLevels[16] = 1.2; zoomLevels[17] = 0.6;
        zoomLevels[18] = 0.3; zoomLevels[19] = 0.15; zoomLevels[20] = 0.075;
        zoomLevels[21] = 0.0375; zoomLevels[22] = 0.01875; zoomLevels[23] = 0.009375; zoomLevels[24] = 0.0046875;

        maxLevels = zoomLevels.length;

        for (var i = 0 ; i < maxLevels ; ++i) { minResolutions[i] = zoomLevels[i] / sqrt2; }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * @public
 * @function
 * @summary - Obtains the map level corresponding to the given map resolution
 * @param {tf.types.mapResolution} resolution - the given map resolution
 * @returns {tf.types.mapLevel} - | {@link tf.types.mapLevel} the corresponding map level
*/
tf.units.GetLevelByResolution = function (resolution) { return tf.units.GetLevelResolutionConverter().GetLevelByResolution(resolution); }

/**
 * @public
 * @function
 * @summary - Obtains the map resolution corresponding to the given map level
 * @param {tf.types.mapLevel} level - the given map level
 * @returns {tf.types.mapResolution} - | {@link tf.types.mapResolution} the corresponding map resolution
*/
tf.units.GetResolutionByLevel = function (level) { return tf.units.GetLevelResolutionConverter().GetResolutionByLevel(level); }

/**
 * @public
 * @function
 * @summary - Obtains the minimum map level required to display the given map extent
 * @param {tf.types.mapCoordinates} pointNW - the left top corner of the extent
 * @param {tf.types.mapCoordinates} pointSE - the right bottom corner of the extent
 * @returns {tf.types.mapLevel} - | {@link tf.types.mapLevel} the minimum map level required to display the given map extent
*/
tf.units.GetBoundsZoomLevel = function (pointNW, pointSE, width, height) {
    var res1 = tf.units.GetDistanceInMetersBetweenMapCoords(pointNW, [pointNW[0], pointSE[1]]) / height;
    var res2 = tf.units.GetDistanceInMetersBetweenMapCoords(pointNW, [pointSE[0], pointNW[1]]) / width;
    var res = (res1 > res2) ? res1 : res2;
    return tf.units.GetLevelByResolution(res) - 1;
}

/**
 * @public
 * @function
 * @summary - Converts length in meters to feet
 * @param {number} length - in meters
 * @returns {number} - | {@link number} length in feet
*/
tf.units.GetMetersToFeet = function (length) { return length * 3.28084; }

/**
 * @public
 * @function
 * @summary - Converts speed in km/h to mph
 * @param {number} speed - in km/h
 * @returns {number} - | {@link number} speed in mph
*/
tf.units.GetKMHToMPH = function (speed) { return speed * 0.621371; }

/**
 * @public
 * @function
 * @summary - Converts area in square meters to square feet
 * @param {number} area - in square meters
 * @returns {number} - | {@link number} area in square feet
*/
tf.units.GetSquareMetersToSquareFeet = function (area) { return tf.units.GetMetersToFeet(tf.units.GetMetersToFeet(area)); }

/**
 * @public
 * @function
 * @summary - Converts area in square meters to acres
 * @param {number} area - in square meters
 * @returns {number} - | {@link number} area in acres
*/
tf.units.GetAcresFromSquareMeters = function (area) { return tf.js.GetFloatNumber(area, 0) / 4046.873; }

/**
 * @private
 * @function
 * @summary - Converts map units from the TerraFly API format into the underlying map engine's format
 * @param {tf.types.mapCoordinates} pointCoords - map coordinates
 * @returns {tf.types.mapCoordinates} - | {@link tf.types.mapCoordinates} converted map coordinates
*/
tf.units.TM2OL = function (pointCoords) { return ol.proj.transform(pointCoords, tf.consts.tmSystem, tf.consts.olSystem); }

/**
 * @private
 * @function
 * @summary - Converts map units from the underlying map engine's format into the TerraFly API format
 * @param {tf.types.mapCoordinates} pointCoords - map coordinates
 * @returns {tf.types.mapCoordinates} - | {@link tf.types.mapCoordinates} converted map coordinates
*/
tf.units.OL2TM = function (pointCoords) { return ol.proj.transform(pointCoords, tf.consts.olSystem, tf.consts.tmSystem); }

// tf.browser

/**
 * @public
 * @function
 * @summary - Returns the number of actual pixels corresponding to one logical pixel
 * @returns {number} - | {@link number} the ratio
*/
tf.browser.GetDevicePixelRatio = function () {
    var ratio = 1;
    // To account for zoom, change to use deviceXDPI instead of systemXDPI, only allow for values > 1
    if (window.screen.systemXDPI !== undefined && window.screen.logicalXDPI !== undefined && window.screen.systemXDPI > window.screen.logicalXDPI) {
        ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
    }
    else if (window.devicePixelRatio !== undefined) { ratio = window.devicePixelRatio; }
    return ratio;
}

tf.browser.GetLooksLikeFullScreen = function () {
    return screen.width === window.innerWidth;
}

/**
 * @public
 * @function
 * @summary - Checks if the Browser is in fullscreen mode
 * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.browser.GetIsFullScreen = function (docUse) {
    var doc = docUse != undefined ? docUse : document; return !!(doc.webkitIsFullScreen || doc.mozFullScreen || doc.msFullscreenElement || doc.fullscreenElement);
};

/**
 * @public
 * @function
 * @summary - Requests the Browser to display the given container in fullscreen mode
 * @param {HTMLElementLike} container - the container
 * @returns {void} - | {@link void} no return value
*/
tf.browser.RequestFullScreen = function (container) {
    var requestCall = (container.webkitRequestFullscreen || container.mozRequestFullScreen || container.msRequestFullscreen || container.requestFullscreen);
    if (!!requestCall) { requestCall.call(container); }
}

/**
 * @public
 * @function
 * @summary - Requests the Browser to exit fullscreen mode
 * @returns {void} - | {@link void} no return value
*/
tf.browser.ExitFullScreen = function (docUse) {
    var doc = docUse != undefined ? docUse : document;
    var requestCall = (doc.webkitCancelFullScreen || doc.mozCancelFullScreen || doc.msExitFullscreen || doc.exitFullscreen || doc.cancelFullScreen);
    if (!!requestCall) { requestCall.call(doc); }
};

/**
 * @private
 * @function
 * @summary Calculates {@link tf.browser.Type} use the pre-calculated object instead
 * @returns {boolean} - | {@link boolean } <b>true</b> if the Browser is compatible, <b>false</b> otherwise
*/
tf.browser.GetBrowserType = function () {
    var userAgent = navigator.userAgent.toLowerCase();
    var type = "unknown";
    var version = -1;

    var isAndroidMobile = !!userAgent.match(/Android/i);
    var isBlackBerryMobile = !!userAgent.match(/BlackBerry/i);
    var isiOSMobile = !!userAgent.match(/iPhone|iPad|iPod/i);
    var isOperaMobile = !!userAgent.match(/Opera Mini/i);
    var isWindowsMobile = !!userAgent.match(/IEMobile/i) || !!userAgent.match(/WPDesktop/i);
    var isAnyMobile = isAndroidMobile || isBlackBerryMobile || isiOSMobile || isOperaMobile || isWindowsMobile;

    var isIE = false, isFireFox = false, isChrome = false;

    if (/webkit/.test(userAgent)) {
        if (/chrome/.test(userAgent)) {
            type = "chrome";
            version = (userAgent.match(/.+(?:chrome)[\/]([\d.]+)/) || [])[1];
            isChrome = true;
        }
        else {
            type = "safari";
            version = (userAgent.match(/.+(?:version)[\/]([\d.]+)/) || [])[1];
        }
    }
    else if (/opera/.test(userAgent)) {
        type = "opera";
        version = (userAgent.match(/.+(?:ra)[\/]([\d.]+)/) || [])[1];
    }
    else if ((/msie/.test(userAgent) || /trident.*rv\:11\./.test(userAgent)) && !/opera/.test(userAgent)) {
        isIE = true;
        type = "msie";
        version = (userAgent.match(/(?:ie)[ ]([\d.]+)/) || [])[1];
    }
    else if (/firefox/.test(userAgent) && !/(compatible|webkit)/.test(userAgent)) {
        isFireFox = true;
        type = "firefox";
        version = (userAgent.match(/.+(?:firefox)[\/]([\d.]+)/) || [])[1];
    }
    else if (/mozilla/.test(userAgent) && !/(compatible|webkit)/.test(userAgent) && !/(compatible|firefox)/.test(userAgent)) {
        type = "mozilla";
        version = (userAgent.match(/.+(?:la)[\/]([\d.]+)/) || [])[1];
    }
    return {
        type: type,
        version: version,
        userAgent: userAgent,
        isIE: isIE,
        isFireFox: isFireFox,
        isChrome: isChrome,
        isAndroidMobile: isAndroidMobile,
        isBlackBerryMobile: isBlackBerryMobile,
        isiOSMobile: isiOSMobile,
        isOperaMobile: isOperaMobile,
        isWindowsMobile: isWindowsMobile,
        isAnyMobile: isAnyMobile
    };
};

/**
 * @public
 * @object
 * @summary Provides information about the Browser being used
 * @property {string} type - one of 'chrome', 'safari', 'opera', 'msie', 'firefox', 'mozilla', or 'unknown'
 * @property {string} version - obtained from navigator.userAgent
 * @property {boolean} isIE - true if IE, false otherwise
 * @property {boolean} isFireFox - true if Firefox, false otherwise
 * @property {boolean} isChrome - true if Chrome, false otherwise
 * @property {boolean} isAndroidMobile - true if Android in mobile platform, false otherwise
 * @property {boolean} isBlackBerryMobile - true if Blackberry in mobile platform, false otherwise
 * @property {boolean} isiOSMobile - true if iOS in mobile platform, false otherwise
 * @property {boolean} isOperaMobile - true if Opera in mobile platform, false otherwise
 * @property {boolean} isWindowsMobile - true if Windows in mobile platform, false otherwise
 * @property {boolean} isAnyMobile - true if in mobile platform, false otherwise
*/
tf.browser.Type = tf.browser.GetBrowserType();

/**
 * @public
 * @function
 * @summary Determines if the Browser is compatible with the TerraFly API
 * @returns {boolean} - | {@link boolean } <b>true</b> if the Browser is compatible, <b>false</b> otherwise
*/
tf.browser.IsCompatible = function () { return tf.browser.HasCanvas(); }

/**
 * @public
 * @function
 * @summary Determines if the Browser supports touch events
 * @returns {boolean} - | {@link boolean } <b>true</b> if the Browser supports touch events, <b>false</b> otherwise
*/
tf.browser.HasTouch = function () { return ol !== undefined ? (ol.has !== undefined ? ol.has.TOUCH : false) : false; }

/**
 * @public
 * @function
 * @summary Determines if the Browser supports the 'canvas' HTML5 element
 * @returns {boolean} - | {@link boolean } <b>true</b> if the Browser supports canvas , <b>false</b> otherwise
*/
tf.browser.HasCanvas = function () {
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
}

// tf.map

/**
 * @public
 * @function
 * @summary Retrieves a valid map engine from the given name, defaults to {@link tf.consts.mapnik2Engine}
 * @param {string} mapEngineStr - map engine candidate
 * @returns {tf.types.mapEngine} - | {@link tf.types.mapEngine} a valid map engine
*/
tf.map.GetMapEngineFrom = function (mapEngineStr) {
    var mapEngine = (tf.js.GetNonEmptyString(mapEngineStr, tf.consts.mapnik2Engine)).toLowerCase();
    if (mapEngine !== tf.consts.mapnikEngine) { mapEngine = tf.consts.mapnik2Engine; }
    return mapEngine;
}

/**
 * @public
 * @function
 * @summary Creates an array of convex hull coordinates of the given coordinates, which should be formatted like [GeoJSON linestring coordinates]{@link tf.types.GeoJSONGeometryType},
 * i.e. coords is an array with 2 or more elements and its elemets each an array with 2 or more elements
 * @param {array<tf.types.mapCoordinates>} coords - the given coordinates
 * @returns {array<tf.types.mapCoordinates>} - | {@link array<tf.types.mapCoordinates>} the coordinates of the convex hull
*/
tf.map.GetConvexHull = function (coords) {

    var allBaseLines;

    function getDistant(cpt, bl) { var Vy = bl[1][0] - bl[0][0], Vx = bl[0][1] - bl[1][1]; return (Vx * (cpt[0] - bl[0][0]) + Vy * (cpt[1] - bl[0][1])) }

    function findMostDistantPointFromBaseLine(baseLine, points) {
        var maxD = 0, maxPt = [], newPoints = [];
        for (var idx in points) {
            var pt = points[idx], d = getDistant(pt, baseLine);
            if (d > 0) { newPoints.push(pt); } else { continue; }
            if (d > maxD) { maxD = d; maxPt = pt; }

        }
        return { 'maxPoint': maxPt, 'newPoints': newPoints };
    }

    function buildConvexHull(baseLine, points) {

        var convexHullBaseLines = [];
        var t = findMostDistantPointFromBaseLine(baseLine, points);

        allBaseLines.push(baseLine);

        if (t.maxPoint.length) {
            convexHullBaseLines = convexHullBaseLines.concat(buildConvexHull([baseLine[0], t.maxPoint], t.newPoints));
            convexHullBaseLines = convexHullBaseLines.concat(buildConvexHull([t.maxPoint, baseLine[1]], t.newPoints));
            return convexHullBaseLines;
        } else { return [baseLine]; }
    }

    function getConvexHull(points) {
        var ch = [];
        if (tf.js.GetLooksLikeLineStringCoords(points)) {
            var maxX, minX, maxPt, minPt;

            allBaseLines = [];

            for (var idx in points) {
                var pt = points[idx];
                if (pt[0] > maxX || !maxX) { maxPt = pt; maxX = pt[0]; }
                if (pt[0] < minX || !minX) { minPt = pt; minX = pt[0]; }
            }

            var chSegments = [].concat(buildConvexHull([minPt, maxPt], points), buildConvexHull([maxPt, minPt], points));

            ch.push(chSegments[0][0]); for (var i in chSegments) { ch.push(chSegments[i][1]); }
        }
        return ch;
    }

    return getConvexHull(coords);
};

tf.helpers.Timer = function (settings) {

    var theThis, elapsedTime, lastTimeChecked, isPaused, speed, limit, wrap, onPausePlayCB;

    this.SetLimit = function (limitSet) { limit = tf.js.GetFloatNumber(limitSet, 0); if (limit <= 0) { limit = undefined; } }
    this.GetLimit = function () { return limit; }

    this.SetWrap = function (wrapSet) { wrap = !!wrapSet; }
    this.GetWrap = function () { return wrap; }

    this.GetElapsedTime = function () { return getElapsedTime(); }
    this.SetElapsedTime = function (elapsedTimeSet) { elapsedTime = tf.js.GetFloatNumber(elapsedTimeSet, 0); lastTimeChecked = Date.now(); }

    this.GetIsPaused = function () { return isPaused; }
    this.Pause = function (bool) {
        getElapsedTime();
        if (isPaused != (bool = !!bool)) {
            isPaused = bool;
            if (onPausePlayCB) { onPausePlayCB({ sender: theThis, isPaused: isPaused }) };
        }
    };

    this.SetSpeed = function (speedSet) { speed = tf.js.GetFloatNumber(speedSet, 1); }
    this.GetSpeed = function () { return speed; }

    function getElapsedTime() {
        var now = Date.now();
        if (!isPaused) {
            elapsedTime += (now - lastTimeChecked) * speed;
            if (limit != undefined) { if (elapsedTime >= limit) { elapsedTime = wrap ? elapsedTime % limit : limit; } }
        }
        lastTimeChecked = now;
        return elapsedTime;
    }

    function initialize() {
        lastTimeChecked = Date.now(); elapsedTime = 0; isPaused = false; speed = 1; limit = undefined; wrap = true;
        if (tf.js.GetIsValidObject(settings)) {
            onPausePlayCB = tf.js.GetFunctionOrNull(settings.onPausePlay);
        }
    };

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.js.Collection = function (settings) {
    var theThis, collection, availableIDs, nextID, count, type;

    this.GetType = function () { return type; }

    this.Add = function (object) {
        var id;
        if (object !== undefined && (type == undefined || tf.js.GetIsInstanceOf(object, type))) {
            id = availableIDs.length > 0 ? availableIDs.shift() : nextID++;
            collection[id] = object;
            ++count;
        }
        return id;
    }

    this.Get = function (id) { return collection[id]; }

    this.Del = function (id) {
        var deleted;
        if (deleted = (collection[id] !== undefined)) {
            availableIDs.push(id); delete collection[id];
            --count;
        }
        return deleted;
    }

    this.GetCount = function () { return count; }

    this.ForEach = function (callback) {
        if (!!(callback = tf.js.GetFunctionOrNull(callback))) { for (var i in collection) { callback(collection[i]); } }
    }

    this.Empty = function () { collection = {}; count = 0; }

    function initialize() {
        collection = {};
        count = 0;
        nextID = 1;
        availableIDs = [];
        if (tf.js.GetIsValidObject(settings)) {
            if (settings.type !== undefined) {
                type = settings.type;
            }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.js.GetMonthDayYearStr = function(fromDate) {
    var mdyStr = '';
    if (!!fromDate) {
        var day = fromDate.getDate(); if (day < 10) { day = '0' + day; }
        var mon = fromDate.getMonth() + 1; if (mon < 10) { mon = '0' + mon; }
        var year = fromDate.getFullYear();
        mdyStr = '' + year + '-' + mon + '-' + day;
    }
    return mdyStr;
}

tf.js.GetYYYYMMDDStr = function (fromDate) {
    var mdyStr = '';
    if (!!fromDate) {
        var day = fromDate.getDate(); if (day < 10) { day = '0' + day; }
        var mon = fromDate.getMonth() + 1; if (mon < 10) { mon = '0' + mon; }
        var year = fromDate.getFullYear();
        mdyStr = '' + year + mon + day;
    }
    return mdyStr;
};

tf.js.DateFromYYYYMMDDStr = function (YYYYMMDDStr) {
    if (tf.js.GetIsNonEmptyString(YYYYMMDDStr) && YYYYMMDDStr.length == 8) {
        return new Date(YYYYMMDDStr.substr(0, 4), YYYYMMDDStr.substr(4, 2) - 1, YYYYMMDDStr.substr(6, 2));
    }
    return new Date();
};

tf.js.GetDateFromTimeStamp = function (timeStampStr) {
    //"012345678901234567890"
    //"2016-06-14 22:50:10.0"
    var dateTime;
    if (tf.js.GetIsStringWithMinLength(timeStampStr, 21)) {
        var year = parseInt(timeStampStr.substring(0, 4), 10);
        var month = parseInt(timeStampStr.substring(5, 7), 10) - 1;
        var day = parseInt(timeStampStr.substring(8, 10), 10);
        var hours = parseInt(timeStampStr.substring(11, 13), 10);
        var minutes = parseInt(timeStampStr.substring(14, 16), 10);
        var seconds = parseInt(timeStampStr.substring(17, 19), 10);
        dateTime = new Date(year, month, day, hours, minutes, seconds);
    }
    return dateTime;
}

tf.js.GetTimeStampFromDate = function (date) {
    var timeStampStr;
    if (!!date) {
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        if (month < 10) { month = '0' + month; }
        if (day < 10) { day = '0' + day; }
        if (hours < 10) { hours = '0' + hours; }
        if (minutes < 10) { minutes = '0' + minutes; }
        if (seconds < 10) { seconds = '0' + seconds; }
        timeStampStr = '' + year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds + '.0';
    }
    return timeStampStr;
}

tf.js.GetAMPMHourWithSeconds = function (fromDate) {
    var str = "";
    if (!!fromDate) {
        var hours = fromDate.getHours();
        var minutes = fromDate.getMinutes(); if (minutes < 10) { if (minutes == 0) { minutes = '00'; } else { minutes = '0' + minutes; } }
        var seconds = fromDate.getSeconds(); if (seconds < 10) { if (seconds == 0) { seconds = '00'; } else { seconds = '0' + seconds; } }
        var ispm = hours >= 12;
        var ampm = ispm ? ' pm' : ' am';
        var hoursUse = ispm && hours != 12 ? hours - 12 : hours;
        return hoursUse + ':' + minutes + ':' + seconds + ampm;

    }
    return str;
}

tf.js.GetAMPMHourWithMinutes = function (fromDate) {
    var str = "";
    if (!!fromDate) {
        var hours = fromDate.getHours();
        var minutes = fromDate.getMinutes(); if (minutes < 10) { if (minutes == 0) { minutes = '00'; } else { minutes = '0' + minutes; } }
        var ispm = hours >= 12;
        var ampm = ispm ? ' pm' : ' am';
        var hoursUse = ispm && hours != 12 ? hours - 12 : hours;
        return hoursUse + ':' + minutes + ampm;

    }
    return str;
}

tf.js.TranslateHourMinSec = function (hourMinSec) {
    var amPm = 'am';
    var secsInAMin = 60, secsInAnHour = secsInAMin * 60;
    var militaryHour = Math.floor(hourMinSec / secsInAnHour), hour = militaryHour;
    var minSec = hourMinSec - hour * secsInAnHour;
    var min = Math.floor(minSec / secsInAMin);
    var sec = minSec - min * secsInAMin;
    if (hour < 10) { hour = '0' + hour; }
    else if (hour >= 12) { if (hour == 12) { amPm = 'pm'; } else if (hour == 24) { hour -= 12; } else if (hour > 24) { hour -= 24; } else { hour -= 12; amPm = 'pm'; } }
    if (min < 10) { min = '0' + min; }
    if (sec < 10) { sec = '0' + sec; }
    var HM = hour + ':' + min, HMS = HM + ':' + sec;
    var MHM = militaryHour + ':' + min, MHMS = MHM + ':' + sec;
    return { HM: HM + amPm, HMS: HMS + amPm, MHM: MHM, MHMS: MHMS };
};

tf.js.GetShortHMSStr = function (hourMinSec, getAbsoluteValueBool) {
    var hmsStr;
    if (hourMinSec != undefined) {
        var signStr = '';
        hmsStr = '';
        if (hourMinSec < 0) { hourMinSec = -hourMinSec; signStr = '-' } else { signStr = '+'; }
        if (hourMinSec == 0) {
            hmsStr = "0s";
        }
        else {
            var secsInAMin = 60, secsInAnHour = secsInAMin * 60;
            var hour = Math.floor(hourMinSec / secsInAnHour);
            var minSec = hourMinSec - hour * secsInAnHour;
            var min = Math.floor(minSec / secsInAMin);
            var sec = (minSec - min * secsInAMin).toFixed(0);
            if (hour > 0) { hmsStr += hour + 'h'; }
            if (min > 0) { hmsStr += min + 'm'; }
            if (sec > 0) { hmsStr += sec + 's'; }
        }
        if (!getAbsoluteValueBool) { hmsStr = signStr + hmsStr; }
    }
    return hmsStr;
};

tf.js.GetHMSFromDate = function (fromDate) { return !!fromDate ? ((fromDate.getHours() * 60) + fromDate.getMinutes()) * 60 + fromDate.getSeconds() : undefined; }

tf.js.BinarySearch = function (theArray, theKey, compareFunction) {
    if (tf.js.GetIsNonEmptyArray(theArray) && tf.js.GetFunctionOrNull(compareFunction)) {
        var m = 0, n = theArray.length - 1;
        while (m <= n) {
            var k = m + ((n - m) >>> 1), cmp = compareFunction(theKey, theArray[k]);
            if (cmp > 0) { m = k + 1; } else if (cmp < 0) { n = k - 1; } else { return k; }
        }
        return -m - 1;
    }
    return undefined;
};

tf.js.BinarySearchGetExactOrNextIndex = function(theArray, theKey, compareFunction) {
    var result = tf.js.BinarySearch(theArray, theKey, compareFunction);
    if (result != undefined) {
        if (result < 0) {
            result = -(result + 1);
            if (result < 0) { result = 0; }
            else if (result >= theArray.length) { result = theArray.length - 1; }
        }
    }
    return result;
};

tf.js.BinarySearchGetExactOrPrevIndex = function (theArray, theKey, compareFunction) {
    var result = tf.js.BinarySearch(theArray, theKey, compareFunction);
    if (result != undefined) {
        if (result < 0) {
            result = -(result + 1) - 1;
            if (result < 0) { result = 0; }
            else if (result >= theArray.length) { result = theArray.length - 1; }
        }
    }
    return result;
};

tf.js.SortObject = function (map, sortFnc) {
    var sortMap;
    if (tf.js.GetIsValidObject(map) && tf.js.GetFunctionOrNull(sortFnc)) {
        var sortArray = [];
        sortMap = {};
        for (var i in map) { sortArray.push({ key: i, value: map[i] }); }
        sortArray.sort(function (a, b) { return sortFnc(a.value, b.value); });
        for (var i in sortArray) { var sortElem = sortArray[i]; sortMap[sortElem.key] = sortElem.value; }
    }
    return sortMap;
};

tf.units.Degrees2Meters = function (coords) {
    var lon = coords[0], lat = coords[1]
    var x = lon * 20037508.34 / 180;
    var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
    y = y * 20037508.34 / 180;
    return [x, y]
}

tf.js.SquaredDistance = function (x1, y1, x2, y2) { var dx = x2 - x1, dy = y2 - y1; return dx * dx + dy * dy; };

tf.js.SquaredSegmentDistance = function (x, y, x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    if (dx !== 0 || dy !== 0) {
        var t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
        if (t > 1) { x1 = x2; y1 = y2; } else if (t > 0) { x1 += dx * t; y1 += dy * t; }
    }
    return tf.js.SquaredDistance(x, y, x1, y1);
};

tf.map.SimplifyLS = function (lsCoords, simplifyTolerance) {
    var simplifiedlsCoords = [];
    var start = 0, end = lsCoords.length, n = end - start;
    var squaredTolerance = simplifyTolerance * simplifyTolerance;
    if (n < 3) { for (; start < end; ++start) { simplifiedlsCoords.push(lsCoords[start]); } }
    else {
        var markers = new Array(n);
        var stack = [start, end - 1], index = 0, i;
        var meterLSCoords = [];
        for (var i = 0 ; i < n ; ++i) { meterLSCoords.push(tf.units.Degrees2Meters(lsCoords[i])); }
        markers[0] = markers[n - 1] = 1;
        while (stack.length > 0) {
            var last = stack.pop(), first = stack.pop();
            var inMeters = meterLSCoords[first];
            var x1 = inMeters[0], y1 = inMeters[1];
            inMeters = meterLSCoords[last];
            var x2 = inMeters[0], y2 = inMeters[1];
            var maxSquaredDistance = 0;
            for (i = first + 1; i < last; i += 1) {
                var inMeters = meterLSCoords[i];
                var x = inMeters[0], y = inMeters[1];
                var squaredDistance = tf.js.SquaredSegmentDistance(x, y, x1, y1, x2, y2);
                if (squaredDistance > maxSquaredDistance) { index = i; maxSquaredDistance = squaredDistance; }
            }
            if (maxSquaredDistance > squaredTolerance) {
                markers[index - start] = 1;
                if (first + 1 < index) { stack.push(first, index); }
                if (index + 1 < last) { stack.push(index, last); }
            }
        }
        for (i = 0; i < n; ++i) { if (markers[i]) { simplifiedlsCoords.push(lsCoords[start + i]); } }
    }
    return simplifiedlsCoords;
};

tf.map.GetIsLSClockwise = function (lsCoords) {
    var isClockwise = false;
    if (tf.js.GetLooksLikeLineStringCoords(lsCoords)) {
        var last = lsCoords.length - 1;
        if (last > 1) {
            //var meterLSCoords = [];
            //for (var i = 0 ; i <= last ; ++i) { meterLSCoords.push(tf.units.Degrees2Meters(lsCoords[i])); }
            var meterLSCoords = lsCoords;
            var sum = 0, lastCoord = meterLSCoords[0];
            for (var i = 1; i < last; ++i) {
                var thisCoord = meterLSCoords[i];
                sum += (thisCoord[0] - lastCoord[0]) * (thisCoord[1] + lastCoord[1])
                lastCoord = thisCoord;
            }
            thisCoord = meterLSCoords[0];
            lastCoord = meterLSCoords[last];
            sum += (thisCoord[0] - lastCoord[0]) * (thisCoord[1] + lastCoord[1])
            isClockwise = sum >= 0;
            //isClockwise = sum <= 0; // 
        }
    }

    return isClockwise;
}

tf.js.DecodeHeaderObjectArray = function (theArray) {
    var newArray;

    if (tf.js.GetIsArrayWithMinLength(theArray, 1)) {
        var header = theArray[0];
        if (tf.js.GetIsArrayWithMinLength(header, 1)) {
            var nPs = header.length;
            if (nPs > 0) {
                var arrayLen = theArray.length, contentLen = arrayLen - 1;
                newArray = [];
                for (var i = 1 ; i < arrayLen ; ++i) {
                    var record = theArray[i];
                    if (record.length == nPs) {
                        var element = {};
                        for (var j = 0 ; j < nPs ; ++j) {
                            var val = record[j];

                            if (val == null) { val = undefined; }
                            element[header[j]] = val;
                        }
                        newArray.push(element);
                    }
                }
            }
        }
    }

    return newArray;
}

tf.js.GetCoordsAreDifferent = function (coord1, coord2) {
    if (!tf.js.GetIsArrayWithMinLength(coord1, 2)) { coord1 = undefined; }
    if (!tf.js.GetIsArrayWithMinLength(coord2, 2)) { coord2 = undefined; }
    return (coord1 == undefined && coord2 != undefined) || (coord1 != undefined && coord2 == undefined) || (coord1 != undefined && coord2 != undefined && (coord1[0] != coord2[0] || coord1[1] != coord2[1]));
}

tf.js.BinaryHeap = function (settings) {
    var theThis, heap, currentCount, itemIndexByItemKeyMap, compareFunction, getItemKeyFunction, nInserts, nPops, nGets, nUpdates, nDeletes, nResets, maxCount;

    this.GetStats = function () { return { nInserts: nInserts, nPops: nPops, nGets: nGets, nUpdates: nUpdates, nDeletes: nDeletes, nResets: nResets, maxCount: maxCount }; }
    this.GetCount = function () { return currentCount; }
    this.IsEmpty = function () { return currentCount == 0; }
    this.Insert = function (item) { return insert(item); }
    this.PeekRoot = function () { return getRoot(); }
    this.PopRoot = function () { return popRoot(); }
    this.GetItem = function (key) { return getItem(key); }
    this.Update = function (item, optionalNewItem) { return update(item, optionalNewItem); }
    this.Delete = function (item) { return deleteItem(item); }
    this.FromItems = function (items) { return fromItems(items); }
    this.Reset = function () { return reset(); }
    this.GetHeap = function () { return heap; }

    function getItem(key) {
        var itemIndex = itemIndexByItemKeyMap != undefined ? itemIndexByItemKeyMap[key] : undefined;
        return itemIndex != undefined ? heap[itemIndex] : undefined;
    }

    function setItemAtHeapIndex(index, item) { heap[index] = item; if (itemIndexByItemKeyMap != undefined) { itemIndexByItemKeyMap[getItemKeyFunction(item)] = index; } }
    function getIndexOfItem(item) { return itemIndexByItemKeyMap != undefined ? itemIndexByItemKeyMap[getItemKeyFunction(item)] : undefined; }
    function delIndexOfItem(item) { if (itemIndexByItemKeyMap != undefined) { delete itemIndexByItemKeyMap[getItemKeyFunction(item)]; } }

    function percolateUp(bubbleIndex) {
        var item = heap[bubbleIndex], parentIndex = (bubbleIndex - 1) >> 1, startBubbleIndex = bubbleIndex;
        while (parentIndex >= 0 && compareFunction(item, heap[parentIndex]) < 0) { setItemAtHeapIndex(bubbleIndex, heap[parentIndex]); parentIndex = ((bubbleIndex = parentIndex) - 1) >> 1; }
        if (bubbleIndex != startBubbleIndex) { setItemAtHeapIndex(bubbleIndex, item); }
        return bubbleIndex;
    }

    function percolateDown(bubbleIndex) {
        var item = heap[bubbleIndex], startBubbleIndex = bubbleIndex;
        for (var child = bubbleIndex * 2 + 1; child < currentCount ; child = child * 2 + 1) {
            if (child < currentCount - 1 && compareFunction(heap[child + 1], heap[child]) < 0) { ++child; }
            if (compareFunction(heap[child], item) < 0) { setItemAtHeapIndex(bubbleIndex, heap[child]); }
            else { break; }
            bubbleIndex = child;
        }
        if (bubbleIndex != startBubbleIndex) { setItemAtHeapIndex(bubbleIndex, item); }
        return bubbleIndex;
    }

    function percolateUpAndDown(bubbleIndex) { if (bubbleIndex != undefined) { if (bubbleIndex == percolateUp(bubbleIndex)) { percolateDown(bubbleIndex); } } }

    function insert(item) { if (!!compareFunction) { ++nInserts; setItemAtHeapIndex(currentCount, item); percolateUp(currentCount++); if (currentCount > maxCount) { maxCount = currentCount; } } }

    function getRoot() { return currentCount > 0 ? heap[0] : undefined; }

    function popRoot() { var rootItem = getRoot(); if (rootItem != undefined) { ++nPops; delIndexOfItem(rootItem); setItemAtHeapIndex(0, heap[--currentCount]); percolateDown(0); } return rootItem; }

    function update(item, optionalNewItem) {
        var itemIndex = getIndexOfItem(item);
        if (itemIndex != undefined && (optionalNewItem == undefined || itemIndex == getIndexOfItem(optionalNewItem))) {
            ++nUpdates;
            if (optionalNewItem != undefined) { setItemAtHeapIndex(itemIndex, optionalNewItem); }
            percolateUpAndDown(itemIndex);
        }
    }

    function deleteItem(item) {
        var itemIndex = getIndexOfItem(item);
        if (itemIndex != undefined) {
            ++nDeletes;
            if (currentCount < 2) { reset(); --nResets; }
            else {
                var lastItem = heap[--currentCount];
                delIndexOfItem(item);
                if (lastItem != item) { delIndexOfItem(lastItem); setItemAtHeapIndex(itemIndex, lastItem); percolateUpAndDown(itemIndex); }
            }
        }
    }

    function buildHeap() { for (var i = currentCount >> 1 ; i >= 0 ; --i) { percolateDown(i); } }

    function fromItems(items) {
        var len = tf.js.GetIsNonEmptyArray(items) ? items.length : 0;
        reset();
        if (len > 0) { heap = new Array(len); for (var i = 0 ; i < len ; ++i) { setItemAtHeapIndex(i, items[i]); } currentCount = len; buildHeap(); }
    }

    function reset() { ++nResets; currentCount = 0; heap = [undefined]; itemIndexByItemKeyMap = !!getItemKeyFunction ? {} : undefined; }

    function initialize() {
        nInserts = nPops = nGets = nUpdates = nDeletes = nResets = maxCount = 0;
        compareFunction = tf.js.GetFunctionOrNull(settings.compareFunction);
        getItemKeyFunction = tf.js.GetFunctionOrNull(settings.getItemKeyFunction);
        reset();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.js.GraphSearch = function (settings) {
    var theThis, stats;

    this.GetStats = function () { return stats; }

    function initialize() {
        if (tf.js.GetIsNonEmptyArray(settings.startNodes)) {
            var getNodeKeyCB = tf.js.GetFunctionOrNull(settings.getNodeKey);
            var getNodeNeighborsCB = tf.js.GetFunctionOrNull(settings.getNodeNeighbors);
            var getIsEndNodeCB = tf.js.GetFunctionOrNull(settings.getIsEndNode);
            var compareNodesCB = tf.js.GetFunctionOrNull(settings.compareNodes);
            var foundEndNodeCB = tf.js.GetFunctionOrNull(settings.foundEndNode);
            if (!!getNodeKeyCB && !!getNodeNeighborsCB && !!getIsEndNodeCB && !!compareNodesCB && !!foundEndNodeCB) {
                var interrupted = false;
                var nUpdated = 0, nInserted = 0, nSettled = 0, nStart = 0, nFound = 0;
                var bh = new tf.js.BinaryHeap({ compareFunction: compareNodesCB, getItemKeyFunction: getNodeKeyCB });
                var settledNodes = {};
                for (var i in settings.startNodes) { bh.Insert(settings.startNodes[i]); ++nStart; }
                while (!(interrupted || bh.IsEmpty())) {
                    var settledNode = bh.PopRoot();
                    ++nSettled;
                    if (getIsEndNodeCB(settledNode)) { ++nFound; if (!foundEndNodeCB({ sender: theThis, endNode: settledNode })) { interrupted = true; } }
                    else {
                        var settledNodeNeighbors = getNodeNeighborsCB(settledNode);
                        settledNodes[getNodeKeyCB(settledNode)] = settledNode;
                        for (var i in settledNodeNeighbors) {
                            var snn = settledNodeNeighbors[i], snnKey = getNodeKeyCB(snn);
                            if (settledNodes[snnKey] == undefined) {
                                var existingItem = bh.GetItem(snnKey);
                                if (existingItem == undefined) { ++nInserted; bh.Insert(snn); }
                                else if (compareNodesCB(snn, existingItem) < 0) { ++nUpdated; bh.Update(existingItem, snn); }
                            }
                        }
                    }
                }
                stats = { binaryHeapStats: bh.GetStats(), nStart: nStart, nFound: nFound, nInserted: nInserted, nSettled: nSettled, nUpdated: nUpdated, interrupted: interrupted };
            }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.js.GetKeyCodeFromEvent = function (event) { return (typeof event === "object") ? (window.event && event.keyCode) ? event.keyCode : (event.which ? event.which : 0) : 0; }

tf.js.Context = function (settings) {
    var theThis, eventDispatcher, ctxChangeEventName, lastCtx;

    this.AddListener = function (callBack) { return eventDispatcher.AddListener(ctxChangeEventName, callBack); }

    this.GetCtx = function () { return getCtx(); }
    this.SetCtx = function (ctx) { return setCtx(ctx); }

    this.SetCtxAttribute = function (attributeName, newValueSet) { return setCtxAttribute(attributeName, newValueSet); }
    this.GetCtxAttribute = function (attributeName) { return getCtxAttribute(attributeName); }

    function notifyCtxChange() { eventDispatcher.Notify(ctxChangeEventName, { sender: theThis, ctx: getCtx() }); }
    function getCtx() { return tf.js.ShallowMerge(lastCtx); }
    function setCtx(ctx) { var changed = false; for (var i in ctx) { if (doSetCtxAttribute(i, ctx[i])) { changed = true; } } if (changed) { notifyCtxChange(); } return changed; } function getCtxAttribute(attributeName) { return lastCtx[attributeName]; }
    function doSetCtxAttribute(attributeName, newValueSet) { var changed = lastCtx[attributeName] != newValueSet; if (changed) { lastCtx[attributeName] = newValueSet; } return changed; }
    function setCtxAttribute(attributeName, newValueSet) { var changed = doSetCtxAttribute(attributeName, newValueSet); if (changed) { notifyCtxChange(); } return changed; }
    function initialize() { ctxChangeEventName = "ctxChange"; eventDispatcher = new tf.events.MultiEventNotifier({ eventNames: [ctxChangeEventName] }); lastCtx = tf.js.ShallowMerge(settings.ctx); }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.js.UnCamelize = function (name) {
    var newName = '', nChars = typeof name === "string" ? name.length : 0;
    for (var i = 0; i < nChars; ++i) {
        var thisChar = name[i], thisCharLower = thisChar.toLowerCase();
        newName += thisChar == thisCharLower ? thisChar : "-" + thisCharLower;
    }
    return newName;
};

tf.js.CompassDirectionToAngle = function (compassDirectionStr) {
    var compassDirectionsToAngles = { 'N': 0, 'NE': 45, 'E': 90, 'SE': 135, 'S': 180, 'SW': 225, 'W': 270, 'NW': 315 };
    var compassDirectionAngle = compassDirectionsToAngles[compassDirectionStr];
    return compassDirectionAngle != undefined ? Math.PI * compassDirectionAngle / 180 : 0;
};

tf.js.ClipLineSegment = function (extent, startCoord, endCoord) {
    function bitCode(x, y) {
        var code = 0;
        if (x < extent[0]) { code |= leftF; } else if (x > extent[2]) { code |= rightF; }
        if (y < extent[1]) { code |= bottomF; } else if (y > extent[3]) { code |= topF; }
        return code;
    };

    var insideF = 0, leftF = 1, rightF = 2, bottomF = 4, topF = 8;
    var xmin = extent[0], ymin = extent[1], xmax = extent[2], ymax = extent[3];
    var x0 = startCoord[0], y0 = startCoord[1], x1 = endCoord[0], y1 = endCoord[1];
    var intersects = false;
    var bc0 = bitCode(x0, y0), bc1 = bitCode(x1, y1);
    var clippedStart = !!bc0, clippedEnd = !!bc1;

    while (true) {
        if (!(bc0 | bc1)) { intersects = true; break; } else if (bc0 & bc1) { break; }
        else {
            var x, y, bcu = bc0 ? bc0 : bc1;
            if (bcu & topF) { x = x0 + (x1 - x0) * (ymax - y0) / (y1 - y0); y = ymax; }
            else if (bcu & bottomF) { x = x0 + (x1 - x0) * (ymin - y0) / (y1 - y0); y = ymin; }
            else if (bcu & rightF) { y = y0 + (y1 - y0) * (xmax - x0) / (x1 - x0); x = xmax; }
            else if (bcu & leftF) { y = y0 + (y1 - y0) * (xmin - x0) / (x1 - x0); x = xmin; }
            if (bcu == bc0) { x0 = x; y0 = y; bc0 = bitCode(x0, y0); }
            else { x1 = x; y1 = y; bc1 = bitCode(x1, y1); }
        }
    }

    return { intersects: intersects, startCoord: [x0, y0], endCoord: [x1, y1], clippedStart: clippedStart, clippedEnd: clippedEnd };
};

tf.js.ClipMapLineSegment = function (extent, startCoord, endCoord) {
    var extentMinOL = tf.units.TM2OL([extent[0], extent[1]]), extentMaxOL = tf.units.TM2OL([extent[2], extent[3]]);
    var clipResult = tf.js.ClipLineSegment([extentMinOL[0], extentMinOL[1], extentMaxOL[0], extentMaxOL[1]], tf.units.TM2OL(startCoord), tf.units.TM2OL(endCoord));
    if (clipResult.intersects) {
        clipResult.startCoord = clipResult.clippedStart ? tf.units.OL2TM(clipResult.startCoord) : startCoord;
        clipResult.endCoord = clipResult.clippedEnd ? tf.units.OL2TM(clipResult.endCoord) : endCoord;
    }
    return clipResult;
};

tf.js.propagateValues = function (valuesArray, nValues, valueStep, valueMult) { for (var i = 1; i < nValues; ++i) { for (var j = 0; j < valueStep; ++j) { valuesArray[i * valueStep + j] = valuesArray[(i - 1) * valueStep + j] * valueMult; } } return valuesArray; }
tf.js.CalcDistancesInMeters = function () { var distancesInMeters = [0.1, 0.2, 0.5]; return tf.js.propagateValues(distancesInMeters, 20, 3, 10); }
tf.js.CalcDistancesInMiles = function () { var mult = 1609.34, distancesInUSMiles = [0.01 * mult, 0.02 * mult, 0.05 * mult]; return tf.js.propagateValues(distancesInUSMiles, 24, 3, 10); }
tf.js.CalcDistancesInFeet = function () { var mult = 0.3048, distancesInUSFeet = [0.1 * mult, 0.2 * mult, 0.5 * mult]; return tf.js.propagateValues(distancesInUSFeet, 20, 3, 10); }

tf.js.CalcDistances3Units = function () { return { distancesInMeters: tf.js.CalcDistancesInMeters(), distancesInMiles: tf.js.CalcDistancesInMiles(), distancesInFeet: tf.js.CalcDistancesInFeet() }; };

tf.js.ObjectToURLParams = function (settings, skipEncodeComponent) {
    var urlParams;
    if (tf.js.GetIsValidObject(settings)) {
        var addedParam = false;
        urlParams = "";
        for (var i in settings) {
            var value = settings[i];
            if (value != undefined) {
                if (addedParam) { urlParams += "&"; }
                if (skipEncodeComponent) {
                    urlParams += i + "=" + value;
                }
                else {
                    urlParams += i + "=" + encodeURIComponent(value);
                }
                addedParam = true;
            }
        }
    }
    return urlParams;
};

tf.js.CalcStopDistances = function (pointCoords, shapeDistances, stopsData, distanceMult) {
    var distances = [], shapeIndices = [], shapePoints = [], shapeProjs = [], stopsIndicesOutOfSequence = [], skippedSameCoords = [], failedHitTest = [];
    var funnyAngles = [];
    var adjustedForEndStopInLoop = false, fixedFirstStopFarFromStart = false, fixedSecondStop = false, fixedThirdStop = false;
    var acceptDistance = 0;
    var minDistanceDelta = 2;
    if (distanceMult === undefined) { distanceMult = 1; }
    //var distStop2 = 20;
    if (tf.js.GetLooksLikeLineStringCoords(pointCoords) && tf.js.GetIsArrayWithMinLength(shapeDistances, pointCoords.length) && stopsData.length) {
        var nStops = stopsData.length;
        var lastIndex = undefined, lastProj = 0, lastDistance = 0;
        var nPoints = pointCoords.length;
        var isLoop = pointCoords[0][0] == pointCoords[nPoints - 1][0] && pointCoords[0][1] == pointCoords[nPoints - 1][1];
        var acceptDistances = [0, 10, 20], nAcceptDistances = acceptDistances.length;
        var tryNextAcceptDistance = true;
        for (var iad = 0; (iad < nAcceptDistances) && tryNextAcceptDistance; ++iad) {
            var isLastTry = iad + 1 == nAcceptDistances;
            var prevCoords = [0, 0];
            acceptDistance = acceptDistances[iad];
            distances = [];
            shapeIndices = [];
            shapeProjs = [];
            shapePoints = [];
            stopsIndicesOutOfSequence = [];
            skippedSameCoords = [];
            failedHitTest = [];
            funnyAngles = [];
            fixedThirdStop = fixedSecondStop = adjustedForEndStopInLoop = fixedFirstStopFarFromStart = false;
            tryNextAcceptDistance = false;
            lastIndex = undefined;
            lastPoint = undefined;
            lastProj = 0;
            lastDistance = 0;

            for (var i = 0; (i < nStops) && (!tryNextAcceptDistance); ++i) {
                var stopItem = stopsData[i];
                var coords = [stopItem.lon, stopItem.lat];
                var shapeDistance = lastDistance, shapeIndex = lastIndex, shapeProj = lastProj, shapePoint = lastPoint;
                if (coords[0] != prevCoords[0] || coords[1] != prevCoords[1]) {
                    prevCoords = coords;
                    var retry = true, didRetry = false;
                    while (retry) {
                        var hitTest = tf.helpers.HitTestMapCoordinatesArray(pointCoords, coords, lastIndex != undefined ? lastIndex : undefined, lastProj, undefined, acceptDistance, undefined, minDistanceDelta);
                        retry = false;
                        if (hitTest.closestPoint) {
                            if (i == 0 && hitTest.minDistanceIndex > 1 && i + 1 < nStops) {
                                var nextStop = stopsData[i + 1];
                                var nextStopCoords = [nextStop.lon, nextStop.lat]
                                var hitTest2 = tf.helpers.HitTestMapCoordinatesArray(pointCoords, nextStopCoords, 0, 0, undefined, /*distStop2*/0, undefined, minDistanceDelta);
                                if (hitTest2.minDistanceIndex < 10 && hitTest2.minDistanceIndex < hitTest.minDistanceIndex) {
                                    hitTest.minDistanceIndex = hitTest.proj = 0;
                                    hitTest.closestPoint = pointCoords[0].slice(0);
                                    hitTest.angle = 1;
                                    fixedFirstStopFarFromStart = true;
                                }
                            }
                            if (hitTest.minDistanceIndex < lastIndex || (hitTest.minDistanceIndex == lastIndex && hitTest.proj < lastProj)) {
                                if (isLoop && i + 1 == nStops) {
                                    adjustedForEndStopInLoop = true;
                                    hitTest.minDistanceIndex = nPoints - 1;
                                    hitTest.proj = 0;
                                    hitTest.angle = 1;
                                }
                                else {
                                    if (isLastTry) { stopsIndicesOutOfSequence.push(i); }
                                    else { tryNextAcceptDistance = true; retry = false; }
                                }
                            }
                            if (hitTest.angle < 0) {
                                funnyAngles.push(i);
                            }
                            shapePoint = hitTest.closestPoint;
                            shapeIndex = lastIndex = hitTest.minDistanceIndex;
                            shapeProj = lastProj = hitTest.proj;
                            shapeDistance = lastDistance = tf.js.GetDistanceMetersAtIndexProj(pointCoords, shapeDistances, shapeIndex, shapeProj);
                        }
                        else {
                            if (i == 2 && !didRetry) {
                                for (var k = 0; k < i; ++k) { distances[k] = shapeIndices[k] = shapeProjs[k] = 0; }
                                didRetry = retry = true;
                                fixedThirdStop = true;
                                lastDistance = lastIndex = lastProj = 0;
                                shapePoint = pointCoords[0];
                            }
                            else {
                                if (isLastTry) { failedHitTest.push(i); }
                                else { tryNextAcceptDistance = true; retry = false; }
                            }
                        }
                    }
                }
                else { skippedSameCoords.push(i); }
                distances.push(shapeDistance * distanceMult);
                shapePoints.push(shapePoint);
                shapeIndices.push(shapeIndex);
                shapeProjs.push(shapeProj);
            }
        }
    }
    return {
        distances: distances,
        acceptDistance: acceptDistance,
        shapeIndices: shapeIndices,
        shapePoints: shapePoints,
        shapeProjs: shapeProjs,
        adjustedForEndStopInLoop: adjustedForEndStopInLoop,
        fixedFirstStopFarFromStart: fixedFirstStopFarFromStart,
        fixedSecondStop: fixedSecondStop,
        fixedThirdStop: fixedThirdStop,
        stopsIndicesOutOfSequence: stopsIndicesOutOfSequence,
        failedHitTest: failedHitTest,
        funnyAngles: funnyAngles,
        skippedSameCoords: skippedSameCoords
    };
};

tf.js.LogCalcStops = function (calcResult) {
    if (calcResult) {
        if (calcResult.acceptDistance > 0) {
            console.log('non zero acceptDistance: ' + calcResult.acceptDistance);
        }
        if (calcResult.failedHitTest.length) {
            var stopStops = calcResult.failedHitTest.length == 1 ? ' stop ' : ' stops ';
            console.log(calcResult.failedHitTest.length + stopStops + 'failed hit test');
            for (var i in calcResult.failedHitTest) {
                var failedHitT = calcResult.failedHitTest[i];
                console.log(failedHitT);
            }
        }
        if (calcResult.adjustedForEndStopInLoop) { console.log('adjusted for end stop in loop'); }
        if (calcResult.fixedFirstStopFarFromStart) { console.log('fixed first stop far from start'); }
        if (calcResult.fixedSecondStop) { console.log('fixed 1st stop based on 2nd stop'); }
        if (calcResult.fixedThirdStop) { console.log('fixed 1st & 2nd stops based on 3rd stop'); }
        if (calcResult.stopsIndicesOutOfSequence.length) {
            var stopStops = calcResult.stopsIndicesOutOfSequence.length == 1 ? ' stop ' : ' stops ';
            console.log(calcResult.stopsIndicesOutOfSequence.length + stopStops + 'out of sequence');
            for (var i in calcResult.stopsIndicesOutOfSequence) {
                var stopOutOfSequence = calcResult.stopsIndicesOutOfSequence[i];
                console.log(stopOutOfSequence);
            }
        }
        if (calcResult.funnyAngles.length > 0) {
            var stopStops = calcResult.funnyAngles.length == 1 ? ' stop ' : ' stops ';
            console.log(calcResult.funnyAngles.length + stopStops + 'with funny angles');
            for (var i in calcResult.funnyAngles) {
                var theId = calcResult.funnyAngles[i];
                console.log(theId);
            }
        }
    }
};

tf.js.GetDistanceBetweenLineStrings = function (lineString1, lineString2) {
    var distance = -1;
    function getDistance(l1, l2) {
        var maxMinDist = -1, len1 = l1.length, len2 = l2.length;
        for (var i = 0; i < len1; ++i) {
            var l1c = l1[i], thisMinDist = -1;
            for (var j = 0; j < len2; ++j) {
                var thisDistance = tf.units.GetHaversineDistance(l1c, l2[j]);
                if (thisMinDist == -1 || thisDistance < thisMinDist) { thisMinDist = thisDistance; }
            }
            if (maxMinDist == -1 || thisMinDist > maxMinDist) { maxMinDist = thisMinDist; }
        }
        return maxMinDist;
    };
    if (tf.js.GetLooksLikeLineStringCoords(lineString1) && tf.js.GetLooksLikeLineStringCoords(lineString2)) {
        var d12 = getDistance(lineString1, lineString2), d21 = getDistance(lineString2, lineString1);
        distance = d12 > d21 ? d12 : d21;
        //distance = Math.sqrt(distance);
    }
    return distance;
};

tf.js.GetDistanceBetweenLineStrings2 = function (lineString1, lineString2) {
    var distance = -1;
    function getDistance(l1, l2) {
        var maxMinDist = -1, len1 = l1.length;
        for (var i = 0; i < len1; ++i) {
            var l1c = l1[i];
            var hitTest = tf.helpers.HitTestMapCoordinatesArray(lineString2, l1[i], undefined, undefined, undefined, undefined, undefined, undefined);
            var minDist = hitTest.minDistance;
            if (maxMinDist == -1 || minDist > maxMinDist) { maxMinDist = minDist; }
        }
        return maxMinDist;
    };
    if (tf.js.GetLooksLikeLineStringCoords(lineString1) && tf.js.GetLooksLikeLineStringCoords(lineString2)) {
        var d12 = getDistance(lineString1, lineString2), d21 = getDistance(lineString2, lineString1);
        distance = d12 > d21 ? d12 : d21;
        //distance = Math.sqrt(distance);
    }
    return distance;
};
