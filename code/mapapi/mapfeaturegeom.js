"use strict";

/*tf.js.SetLegacyCoordsTo = function (coords) {
    if (tf.js.GetIsArrayWithLength(coords, 2)) {
        coords.lon = coords.Lon = coords.Longitude = coords.longitude = coords[0];
        coords.lat = coords.Lat = coords.Latitude = coords.latitude = coords[1];
    }
}*/

/**
 * @public
 * @class
 * @summary Map Feature Geometries support [GeoJSON Geometries]{@link tf.types.GeoJSONGeometry} and can be shared among different [Map Features]{@link tf.map.Feature}
 * @param {tf.types.GeoJSONGeometry} settings - creation settings
 */
tf.map.FeatureGeom = function (settings) {

    var theThis, coordinates, geomCreateFunction, type, isPoint, APIGeom, simplifyTolerance;

    /**
     * @public
     * @function
     * @summary - Retrieves the type of this geometry instance
     * @returns {tf.types.GeoJSONGeometryType} - | {@link tf.types.GeoJSONGeometryType} the type
    */
    this.GetType = function () { return type; }

    /**
     * @public
     * @function
     * @summary - Checks if the type this geometry instance is "point"
     * @returns {boolean} - | {@link boolean} <b>true</b> if the geometry type is "point", <b>false</b> otherwise
    */
    this.GetIsPoint = function () { return isPoint; }

    /**
     * @public
     * @function
     * @summary - Changes the map coordinates of a "point" geometry
     * @param {tf.types.mapCoordinates} pointCoords - the coordinates
     * @returns {void} - | {@link void} no return value
    */
    this.SetPointCoords = function (pointCoords) {
        if (isPoint) {
            var coordsUse = tf.js.GetMapCoordsFrom(pointCoords);
            coordinates[0] = coordsUse[0]; coordinates[1] = coordsUse[1]; /*tf.js.SetLegacyCoordsTo(coordinates);*/ updateGeom(); return true;
        } return false;
    }

    /**
     * @public
     * @function
     * @summary - Retrieves the current coordinates of a "point" geometry
     * @returns {tf.types.mapCoordinates} - | {@link tf.types.mapCoordinates} the coordinates
    */
    this.GetPointCoords = function () { return isPoint ? coordinates : [0,0]; }

    this.GetCoordinates = function () { return coordinates; }

    /**
     * @public
     * @function
     * @summary - Retrieves the map extent of this geometry instance
     * @returns {tf.types.mapExtent} - | {@link tf.types.mapExtent} the extent
    */
    this.GetExtent = function () { return getExtent(); }

    this.GetClosestPoint = function (pointCoords) { return getClosestPoint(pointCoords); }

    this.GetLength = function () { return getLength(); }
    this.GetArea = function () { return getArea(); }

    this.GetContainsCoords = function (coords) {
        return type == 'polygon' ? APIGeom.intersectsCoordinate(tf.units.TM2OL(coords)) : false;
    }

    /**
     * @private
     * @function
     * @summary - Returns underlying map engine object associated with this geometry
     * @returns {ol.geom} - | the map engine object
    */
    this.getAPIGeom = function () { return APIGeom; }

    function getLength() {
        var length = 0;
        if (!theThis.GetIsPoint()) {
            var coords = type == 'polygon' ? coordinates[0] : coordinates;
            length = tf.units.GetTotalHaversineDistanceInMeters(coords);
        }
        return length;
    }

    function getArea() {
        var area = 0;
        if (!theThis.GetIsPoint()) {
            var isClosed = type == 'polygon';
            var coords = isClosed ? coordinates[0] : coordinates;
            area = tf.js.CalcPolyAreaInSquareMeters(coords, isClosed);
            //console.log('area ' + area);
            //console.log('area2 ' + APIGeom.getArea());
        }
        return area;
    }

    function getClosestPoint(pointCoords) {
        var closestPoint;
        if (!!APIGeom && tf.js.GetIsArrayWithMinLength(pointCoords, 2)) {
            closestPoint = pointCoords.slice(0);
            closestPoint = tf.units.TM2OL(closestPoint);
            if (!!(closestPoint = APIGeom.getClosestPoint(closestPoint))) {
                closestPoint = tf.units.OL2TM(closestPoint);
            }

        }
        return closestPoint;
    }

    function getExtent() {
        var extent = [0,0,0,0];
        if (!!APIGeom) { extent = ol.extent.applyTransform(APIGeom.getExtent(), ol.proj.getTransform(tf.consts.olSystem, tf.consts.tmSystem)); }
        return extent;
    }

    function createPointGeom() { isPoint = true; return new ol.geom.Point(coordinates); }

    function createPolygonGeom() { return new ol.geom.Polygon(coordinates); }

    function createMultiLineStringGeom() { return new ol.geom.MultiLineString(coordinates); }

    function createLineStringGeom() { return new ol.geom.LineString(coordinates); }

    function createMultiPointGeom() { return new ol.geom.MultiPoint(coordinates); }

    function createMultiPolygonGeom() { return new ol.geom.MultiPolygon(coordinates); }

    function updateGeom() {
        APIGeom = null;
        if (!!(APIGeom = geomCreateFunction())) {
            APIGeom.transform(tf.consts.tmSystem, tf.consts.olSystem);
            if (simplifyTolerance !== undefined) { APIGeom = APIGeom.simplify(simplifyTolerance); }
        }
    }

    function initialize() {

        var geomCreateFunctions = {
            point: createPointGeom,
            polygon: createPolygonGeom,
            linestring: createLineStringGeom,
            multilinestring: createMultiLineStringGeom,
            multipoint: createMultiPointGeom,
            multipolygon: createMultiPolygonGeom
        };

        if (!tf.js.GetIsValidObject(settings)) { settings = { type: "point", coordinates: [0, 0] }; }

        type = settings.type;

        if (!tf.js.GetIsNonEmptyString(type) || geomCreateFunctions[type = type.toLowerCase()] === undefined || !tf.js.GetIsNonEmptyArray(settings.coordinates)) {
            type = "point"; settings.coordinates = [0, 0];
        }

        //if (type == 'multilinestring') { console.log('creating multilinestring'); }

        geomCreateFunction = geomCreateFunctions[type];

        if (isPoint = (type === "point")) { coordinates = tf.js.GetIsArrayWithMinLength(settings.coordinates, 2) ? settings.coordinates.slice(0) : [0,0]; }
        else { coordinates = settings.coordinates.slice(0); }

        simplifyTolerance = settings.simplifyTolerance;

        if (tf.js.GetIsNonEmptyArray(coordinates)) { updateGeom(); }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
