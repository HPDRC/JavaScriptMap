"use strict";

tf.map.PolyCode = function () {

    var theThis, defaultPrecision = 5;

    this.ClipPrecision = function (precision) { return tf.js.GetIntNumberInRange(precision, 0, 7, 5); }

    this.Flipped = function (coordinates) { return !!coordinates && coordinates.length != undefined ? flipped(coordinates) : undefined; }

    this.EncodeValues = function (values, precision) {
        var len = !!values ? values.length : 0;
        if (!len) { return ''; }
        var prev = values[0];
        var factor = Math.pow(10, theThis.ClipPrecision(precision)), output = encode(prev, 0, factor);
        for (var i = 1; i < len; i++) { var next = values[i]; output += encode(next, prev, factor); prev = next; }
        return output;
    };

    this.DecodeValues = function(encodedValuesStr, precision) {
        var values = [], len = encodedValuesStr.length;
        if (len > 0) {
            var factor = Math.pow(10, theThis.ClipPrecision(precision)), index = 0, value = 0;
            while (index < len) {
                var newValIndex = trans(encodedValuesStr, index);
                value += newValIndex.value_change;
                index = newValIndex.index;
                var actualValue = (factor != 1) ? value / factor : value;
                values.push(actualValue);
            }
        }
        return values;
    }

    function trans(encodedStr, index) {
        var byteVal = undefined, result = 0, shift = 0, comp = false;

        while (byteVal == undefined || byteVal >= 0x20) {
            byteVal = encodedStr.charCodeAt(index) - 63;
            ++index;
            result |= (byteVal & 0x1f) << shift
            shift += 5
            comp = result & 1
        }

        var value_change = !!comp ? ~(result >>> 1) : (result >>> 1);

        return { index: index, value_change: value_change };
    }

    this.DecodeLevels = function(encodedLevelsString) {
        var decodedLevels = [];
        if (tf.js.GetIsNonEmptyString(encodedLevelsString)) {
            for (var i = 0; i < encodedLevelsString.length; ++i) {
                decodedLevels.push(encodedLevelsString.charCodeAt(i) - 63);
            }
        }
        return decodedLevels;
    }

    this.FromGeoJSONLineString = function (geometry, precision) {
        return (geometry && !!geometry.type && !!geometry.type.length && geometry.type.toLowerCase() == 'linestring') ?
            theThis.EncodeLineString(flipped(geometry.coordinates), precision) : undefined;
    }

    this.EncodeLineString = function (coordinates, precision) {
        if (!coordinates.length) { return ''; }
        var factor = Math.pow(10, theThis.ClipPrecision(precision)),
            output = encode(coordinates[0][0], 0, factor) + encode(coordinates[0][1], 0, factor);
        for (var i = 1; i < coordinates.length; i++) {
            var a = coordinates[i], b = coordinates[i - 1];
            output += encode(a[0], b[0], factor);
            output += encode(a[1], b[1], factor);
        }
        return output;
    }

    this.ToGeoJSONLineString = function (str, precision) {
        var coords = theThis.DecodeLineString(str, precision);
        return { type: 'LineString', coordinates: flipped(coords) };
    }

    this.DecodeLineString = function (str, precision) {
        var index = 0, lat = 0, lng = 0, coordinates = [], shift = 0, result = 0;
        var oneByte = null, latitude_change, longitude_change, factor = Math.pow(10, theThis.ClipPrecision(precision));
        // one coordinate decode per loop iteration
        while (index < str.length) {
            oneByte = null; shift = result = 0;
            do { oneByte = str.charCodeAt(index++) - 63; result |= (oneByte & 0x1f) << shift; shift += 5; } while (oneByte >= 0x20);
            latitude_change = ((result & 1) ? ~(result >>> 1) : (result >>> 1));
            shift = result = 0;
            do { oneByte = str.charCodeAt(index++) - 63; result |= (oneByte & 0x1f) << shift; shift += 5; } while (oneByte >= 0x20);
            longitude_change = ((result & 1) ? ~(result >>> 1) : (result >>> 1));
            lat += latitude_change;
            lng += longitude_change;
            coordinates.push([lat / factor, lng / factor]);
        }
        return coordinates;
    }

    this.FromGeoJSONMultiLineString = function (geometry, precision) {
        return (geometry && !!geometry.type && !!geometry.type.length && geometry.type.toLowerCase() == 'multilinestring') ?
            theThis.EncodeMultiLineString(flipped(geometry.coordinates), precision) : undefined;
    }

    this.EncodeMultiLineString = function (coordinates, precision) {
        //var nstrings = !!coordinates ? coordinates.length : 0;
        var strings = [];
        for (var i in coordinates) {
            var coords = coordinates[i].slice();
            strings.push(theThis.EncodeLineString(flipped(coords), precision));
        }
        return strings;
    }

    this.ToGeoJSONMultiLineString = function (strArray, precision) {
        var coords = theThis.DecodeMultiLineString(strArray, precision);
        return { type: 'MultiLineString', coordinates: coords };
    }

    this.DecodeMultiLineString = function (strArray, precision) {
        var coords = [];
        for (var i in strArray) { coords.push(flipped(theThis.DecodeLineString(strArray[i], precision))); }
        return coords;
    }

    this.ToGeoJSONMultiLineStringNoFlip = function (strArray, precision) {
        var coords = theThis.DecodeMultiLineStringNoFlip(strArray, precision);
        return { type: 'MultiLineString', coordinates: coords };
    }

    this.DecodeMultiLineStringNoFlip = function (strArray, precision) {
        var coords = [];
        for (var i in strArray) { coords.push(theThis.DecodeLineString(strArray[i], precision)); }
        return coords;
    }

    function py2_round(value) {
        // Google's polyline algorithm uses the same rounding strategy as Python 2, which is different from JS for negative values
        return Math.floor(Math.abs(value) + 0.5) * Math.sign(value);
    }

    function encode(current, previous, factor) {
        current = py2_round(current * factor);
        previous = py2_round(previous * factor);
        var coordinate = current - previous;
        coordinate <<= 1;
        if (current - previous < 0) { coordinate = ~coordinate; }
        var output = '';
        while (coordinate >= 0x20) {
            output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 63);
            coordinate >>>= 5;
        }
        output += String.fromCharCode(coordinate + 63);
        return output;
    }

    function flipped(coords) {
        var flipped = [];
        for (var i = 0; i < coords.length; i++) { flipped.push(coords[i].slice().reverse()); }
        return flipped;
    }

    function initialize() { }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/*
function createEncodings(coords) {
    var i = 0;

    var plat = 0;
    var plng = 0;

    var encoded_points = "";

    for (i = 0; i < coords.length; ++i) {
        var lat = coords[i][0];
        var lng = coords[i][1];

        encoded_points += encodePoint(plat, plng, lat, lng);

        plat = lat;
        plng = lng;
    }

    // close polyline
    //encoded_points += encodePoint(plat, plng, coords[0][0], coords[0][1]);

    return encoded_points;
}

function encodePoint(plat, plng, lat, lng) {
    var late5 = Math.round(lat * 1e5);
    var plate5 = Math.round(plat * 1e5)

    var lnge5 = Math.round(lng * 1e5);
    var plnge5 = Math.round(plng * 1e5)

    var dlng = lnge5 - plnge5;
    var dlat = late5 - plate5;

    return encodeSignedNumber(dlat) + encodeSignedNumber(dlng);
}

function encodeSignedNumber(num) {
    var sgn_num = num << 1;

    if (num < 0) {
        sgn_num = ~(sgn_num);
    }

    return (encodeNumber(sgn_num));
}

function encodeNumber(num) {
    var encodeString = "";

    while (num >= 0x20) {
        encodeString += (String.fromCharCode((0x20 | (num & 0x1f)) + 63));
        num >>>= 5;
    }

    encodeString += (String.fromCharCode(num + 63));
    return encodeString;
}
*/
