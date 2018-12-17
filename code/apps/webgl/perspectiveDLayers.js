"use strict";

tf.webgl.MapQuad = function (settings) {
    var theThis, map, mapObject, sceneObject, attributes, mapCoords, context, texture, perspectiveMap, coordinates;

    this.OnDelete = function () { return onDelete(); }
    this.IsDeleted = function () { return isDeleted(); }
    this.Update = function () { return update(); }
    this.GetSceneObject = function () { return sceneObject; }
    this.GetMapObject = function () { return mapObject; }

    function isDeleted() { return map == undefined; }

    function onDelete() {
        if (!isDeleted()) {
            mapObject = map = perspectiveMap = texture = coordinates = attributes = sceneObject = mapObject = undefined;
        }
    }

    function update() {
        if (!isDeleted()) {
        }
    }

    function createQuad() {
        if (!isDeleted()) {
            var program = context.GetTextureColorProgram();
            attributes = new tf.webgl.QuadXY({ context: context });

            var yCoord = 0.01;
            var vertices = [0, yCoord, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            var normals = new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]);

            for (var i = 1, iPrev = i - 1, iv = 3, ivPrev = iv - 3 ; i < 4 ; ++i, ++iPrev, iv += 3, ivPrev += 3) {
                var xPrev = vertices[ivPrev], zPrev = vertices[ivPrev + 2]
                var coordPrev = coordinates[iPrev], coord = coordinates[i];
                var distance = tf.units.GetDistanceInMetersBetweenMapCoords(coordPrev, coord);
                var angle = -tf.units.GetMapHeading(coordPrev, coord);
                var cangle = Math.cos(angle), sangle = Math.sin(angle);
                var x = xPrev + distance * cangle;
                var z = zPrev + distance * sangle;
                vertices[iv] = x; vertices[iv + 1] = yCoord; vertices[iv + 2] = z;
            }

            attributes.GetPos().Update(new Float32Array(vertices));
            attributes.GetNor().Update(normals);

            sceneObject = new tf.webgl.SceneObject({
                cullFrontFace: true,
                onPreRender: update, context: context, attributes: attributes, texture: texture, program: program//, useLines: true
            });
            mapObject = perspectiveMap.CreateMapObject({ mapCoords: coordinates[0], sceneObject: sceneObject, skipRotate: false, skipScale: false });
        }
    }

    function initialize() {
        if ((tf.js.GetIsValidObject(settings)) &&
            tf.js.GetIsInstanceOf(settings.perspectiveMap, tf.webgl.PerspectiveMap) &&
            tf.js.GetIsArrayWithMinLength(settings.coordinates, 4) &&
            tf.js.GetIsInstanceOf(settings.texture, tf.webgl.Texture2)) {
            perspectiveMap = settings.perspectiveMap;
            map = perspectiveMap.GetMap();
            context = perspectiveMap.GetContext();
            texture = settings.texture;
            coordinates = settings.coordinates;
            createQuad();
        }
        else { map = undefined; }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.webgl.PerspectiveDLayer = function (settings) {
    var theThis, dLayer, featureLayer, map, mapDLayers, context, perspectiveMap, mapMarkerGroup, mapMarkers, featureLayerVisibilityListener, perspectiveMapVisibilityListener;
    var imgObjCache;

    this.PreProcessServiceData = function (data, dLayer) { return preProcessServiceData(data, dLayer); }

    this.OnDelete = function () { return onDelete(); }
    this.IsDeleted = function () { return isDeleted(); }

    function isDeleted() { return mapDLayers == undefined; }

    function onDelete() {
        if (!isDeleted()) {
            if (!!perspectiveMapVisibilityListener) { perspectiveMapVisibilityListener.OnDelete(); }
            if (!!featureLayerVisibilityListener) { featureLayerVisibilityListener.OnDelete(); }
            deleteCurrentMarkers();
            mapMarkers = context = imgObjCache = perspectiveMapVisibilityListener = featureLayer = featureLayerVisibilityListener = mapMarkerGroup = mapDLayers = perspectiveMap = undefined;
        }
    }

    function convertTextStyle(style) {
        style.dontTranslate = true;
        style.arrow_length = style.marker_arrowlength;
        style.border_line_color = style.border_color;
        style.border_line_opacity = style.border_opacity / 100;
        style.border_line_width = style.border_width;
        style.fill_color = style.marker_color;
        style.fill_opacity = style.marker_opacity / 100;
        style.line_opacity = style.line_opacity / 100;
        style.horpos = style.marker_horpos;
        style.verpos = style.marker_verpos;
    }

    function convertImgStyle(style) {

    }

    function updateVisibility(notification) {
        if (!isDeleted()) {
            if (!!mapMarkerGroup && !mapMarkerGroup.IsDeleted()) {
                var isVisible = featureLayer.GetIsVisible();
                var groupObject = mapMarkerGroup.GetGroupObject();
                if (isVisible != groupObject.GetIsVisible()) {
                    groupObject.SetIsVisible(isVisible);
                }
            }
        }
    }

    function updatePerspectiveMapVisibility(notification) {
        if (!isDeleted()) {
            var perspectiveIsVisible = perspectiveMap.GetIsVisible();
            featureLayer.SetIsForcedInvisible(perspectiveIsVisible);
            dLayer.SetShowsInfoWindow(!perspectiveIsVisible);
        }
    }

    function createQuad(v1, v2, v3, v4, src) {
        var img = new tf.dom.Img({
            crossOrigin: true,
            src: src,
            onLoad: function (img) {
                if (img.GetIsValid()) {
                    var imgElem = img.GetImg();
                    var w = imgElem.width, h = imgElem.height, l = 0, t = 0;
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    canvas.width = w;
                    canvas.height = h;
                    ctx.drawImage(imgElem, l, t);
                    var texture = new tf.webgl.Texture2({ context: context, img: canvas, flipVerticalBool: true });
                    var quad = new tf.webgl.MapQuad({ perspectiveMap: perspectiveMap, coordinates: [v1, v2, v3, v4], texture: texture });

                    if (!quad.IsDeleted()) { mapMarkerGroup.AddObject(quad.GetMapObject()); }
                }
            }
        });
    }

    function deleteCurrentMarkers() {
        var markers = mapMarkerGroup.GetGroupObject().GetSubObjects();

        for (var i in markers) { markers[i].OnDelete(true, true, true); }

        mapMarkerGroup.DelAllSubObjects();

        for (var i in mapMarkers) { mapMarkers[i].GetMapObject().OnDelete(); }

        mapMarkers = [];
    }

    function preProcessServiceData(data, dLayerSet) {

        //return;

        if (!isDeleted()) {

            if (dLayerSet != dLayer) { tf.GetDebug().LogIfTest('tf.webgl.PerspectiveDLayer: dLayer in preProcess is different'); }

            deleteCurrentMarkers();

            if (featureLayerVisibilityListener == undefined) {
                featureLayer = dLayer.GetFeatureLayer();
                featureLayerVisibilityListener = featureLayer.AddListener(tf.consts.mapFeatureLayerVisibilityChangeEvent, updateVisibility);
                perspectiveMapVisibilityListener = perspectiveMap.AddListener(tf.consts.perspectiveMapVisibilityChangeEvent, updatePerspectiveMapVisibility);
                updatePerspectiveMapVisibility();
                updateVisibility();
            }

            if (tf.js.GetIsValidObject(data) && tf.js.GetIsArrayWithMinLength(data.features, 1)) {
                var features = data.features;
                var context = perspectiveMap.GetContext();
                //var program = context.GetOneLightPerVertexProgram();
                var program = context.GetTextureColorProgram();
                var markerStyles = dLayer.GetMarkerStyleSpecs();
                var textMarkerStyle = markerStyles.textMarkerBaseStyle;
                var imgMarkerStyle = markerStyles.imgMarkerBaseStyle;
                var display_fields = dLayer.GetDisplayFieldName();

                convertTextStyle(textMarkerStyle);
                convertImgStyle(imgMarkerStyle);

                var altaCreated = true;

                for (var i in features) {
                    var thisFeature = features[i];
                    var props = thisFeature.properties;
                    var pointCoords = tf.js.GetMapCoordsFrom(thisFeature.geometry.coordinates);
                    if (pointCoords[0]) {
                        var label = props[display_fields];
                        var prefix = "http://", len_of_prefix = prefix.length;
                        var isImageMarker = label.trim().toLowerCase().substring(0, len_of_prefix) == prefix;
                        var cachedObject;
                        var markerObject, style = isImageMarker ?
                            tf.js.ShallowMerge(imgMarkerStyle, { icon_url: label }) :
                            tf.js.ShallowMerge(textMarkerStyle, { label: label });
                        var skipThis = false;
                        var skipRotate;
                        if (isImageMarker) {
                            //cachedObject = imgObjCache[label];
                            var catID = data["category id"];

                            if (tf.js.GetIsNonEmptyString(catID)) {
                                catID = catID.toLowerCase();
                                if (catID == "geoimages") {
                                    style.useFrame = true;
                                }
                                else if (catID == "alta") {
                                    //style.rotate_with_map = false;
                                    //skipRotate = false;
                                    if (!altaCreated) {
                                        altaCreated = true;
                                        var UC_X1 = tf.js.GetLongitudeFrom(props.UC_X1);
                                        var UC_X2 = tf.js.GetLongitudeFrom(props.UC_X2);
                                        var UC_X3 = tf.js.GetLongitudeFrom(props.UC_X3);
                                        var UC_X4 = tf.js.GetLongitudeFrom(props.UC_X4);
                                        var UC_Y1 = tf.js.GetLatitudeFrom(props.UC_Y1);
                                        var UC_Y2 = tf.js.GetLatitudeFrom(props.UC_Y2);
                                        var UC_Y3 = tf.js.GetLatitudeFrom(props.UC_Y3);
                                        var UC_Y4 = tf.js.GetLatitudeFrom(props.UC_Y4);
                                        var v1 = [UC_X1, UC_Y1], v2 = [UC_X2, UC_Y2], v3 = [UC_X3, UC_Y3], v4 = [UC_X4, UC_Y4];
                                        var src = props["Display_Thumbnail"];
                                        createQuad(v1, v2, v3, v4, src);

                                        props.additionalFeatureSpecs = [
                                            {
                                                type: "linestring", coordinates: [v1, v2, v3, v4, v1],
                                                style: [{ line: true, line_color: "#fff", line_width: 4 }, { line: true, line_color: "#000", line_width: 2 }]
                                            }
                                        ];
                                        props.hoverFeatureSpecs = [
                                            {
                                                type: "polygon", coordinates: [[v1, v2, v3, v4]],
                                                style: { line: true, line_color: "#00a", line_width: 4, fill: true, fill_color: "#fff", fill_opacity: 40, zindex: 2 }
                                            },
                                            { type: "point", coordinates: v1, style: { marker: true, label: "v1" } },
                                            { type: "point", coordinates: v2, style: { marker: true, label: "v2" } },
                                            { type: "point", coordinates: v3, style: { marker: true, label: "v3" } },
                                            { type: "point", coordinates: v4, style: { marker: true, label: "v4" } }
                                        ];

                                    }
                                    else {
                                        //skipThis = true;
                                    }
                                }
                            }
                        }
                        if (!skipThis) {
                            markerObject = perspectiveMap.CreateMapMarker({
                                dLayer: { dLayer: dLayer, props: props},
                                usePick: true, mapCoords: pointCoords, style: style, sceneObject: cachedObject, skipRotate: skipRotate
                            });

                            markerObject.GetPointCoords = function (pointCoords) { return function () { return pointCoords; } }(pointCoords);

                            tf.js.SetObjProperty(markerObject, tf.consts.DLayerProperty, { properties: props, label: dLayer.GetName(), map: map, dLayer: dLayer });

                            mapMarkers.push(markerObject);

                            if (!!markerObject && !markerObject.IsDeleted()) {
                                //if (cachedObject == undefined) { imgObjCache[label] = markerObject.GetSceneObject(); }
                                mapMarkerGroup.AddObject(markerObject.GetMapObject());
                            }
                        }
                    }
                }
            }
        }
    }

    function initialize() {
        if ((tf.js.GetIsValidObject(settings)) && tf.js.GetIsInstanceOf(settings.mapDLayers, tf.webgl.PerspectiveDLayers)) {
            mapDLayers = settings.mapDLayers;
            dLayer = settings.dLayer;
            context = mapDLayers.GetMapOnQuad().GetContext();
            map = mapDLayers.GetMapOnQuad().GetMap();
            //mapMarkers = [];
            imgObjCache = {};
            mapMarkerGroup = new tf.webgl.MapObjectGroup({ perspectiveMap: perspectiveMap = mapDLayers.GetMapOnQuad() });
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.webgl.PerspectiveDLayers = function (settings) {
    var theThis, perspectiveMap, mapDLayers, mapObjectHoverInOutListener, mapObjectClickListener, mapPostComposeListener, hoveringMapObject;

    this.PreProcessServiceData = function (data, dLayer) { return preProcessServiceData(data, dLayer); }

    this.GetMapOnQuad = function () { return perspectiveMap; }

    this.OnDelete = function () { return onDelete(); }
    this.IsDeleted = function () { return isDeleted(); }

    function isDeleted() { return perspectiveMap == undefined; }

    function onDelete() {
        if (!isDeleted()) {
            for (var i in mapDLayers) { mapDLayers[i].OnDelete(); }
            if (!!mapObjectHoverInOutListener) { mapObjectHoverInOutListener.OnDelete(); }
            if (!!mapObjectClickListener) { mapObjectClickListener.OnDelete(); }
            if (!!mapPostComposeListener) { mapPostComposeListener.OnDelete(); }
            mapPostComposeListener = mapObjectClickListener = mapObjectHoverInOutListener = mapDLayers = perspectiveMap = undefined;
        }
    }

    function getOrCreateMapDLayer(dLayer) {
        var index = dLayer.GetIndex();
        var mapDLayer = mapDLayers[index];
        if (!mapDLayer) {
            mapDLayer = mapDLayers[index] = new tf.webgl.PerspectiveDLayer({ mapDLayers: theThis, dLayer: dLayer });
        }
        return mapDLayer;
    }

    function preProcessServiceData(data, dLayer) {
        //return;
        if (!isDeleted()) { getOrCreateMapDLayer(dLayer).PreProcessServiceData(data, dLayer); }
    }

    function getDLayerPropsFromMapObject(mapObject) {
        var dLayer;
        if (!!mapObject) { var marker = mapObject.GetSettings().mapMarker; if (!!marker) { dLayer = marker.GetSettings().dLayer; } }
        return dLayer;
    }

    function onMapObjectHoverInOut(notification) {
        var dLayer = getDLayerPropsFromMapObject(notification.mapObject);

        if (!!dLayer) {
            if (notification.isHoverIn) { tf.urlapi.ShowdLayerInfoWindow(notification.mapObject.GetSettings().mapMarker); }
            hoveringMapObject = notification.isHoverIn ? notification.mapObject : undefined;
            //notification.mapObject.GetSceneObjectHolder().SetIsVisible(!notification.isHoverIn);
        }
    }

    function onMapObjectClick(notification) {
        var dLayer = getDLayerPropsFromMapObject(notification.mapObject);
        if (!!dLayer) { tf.urlapi.ShowdLayerInfoWindow(notification.mapObject.GetSettings().mapMarker); }
    }

    function onMapPostCompose(notification) {
        if (!!hoveringMapObject) {
            var sceneObject = hoveringMapObject.GetSceneObject();
            if (!!sceneObject) {

                var renderMatrix = sceneObject.GetRenderMatrix();
                if (renderMatrix != undefined) {
                    var newRenderMatrix = new tf.math.Matrix4({ matrix: renderMatrix });
                    var scaleMatrix = new tf.math.ScaleMatrix4({ sx: 1.2, sy: 1.2, sz: 1.2 });
                    newRenderMatrix.MultByMatrix(scaleMatrix);
                    sceneObject.SetUseDepth(false);
                    sceneObject.SetRenderMatrix(newRenderMatrix);
                    notification.sceneNotification.renderImmediate(sceneObject);
                    sceneObject.SetRenderMatrix(renderMatrix);
                    sceneObject.SetUseDepth(true);
                }
            }
        }
    }

    function initialize() {
        if ((tf.js.GetIsValidObject(settings)) && tf.js.GetIsInstanceOf(settings.perspectiveMap, tf.webgl.PerspectiveMap)) {
            perspectiveMap = settings.perspectiveMap;
            mapObjectHoverInOutListener = perspectiveMap.AddListener(tf.consts.perspectiveMapObjectHoverInOutEvent, onMapObjectHoverInOut);
            mapObjectClickListener = perspectiveMap.AddListener(tf.consts.perspectiveMapObjectClickEvent, onMapObjectClick);
            mapPostComposeListener = perspectiveMap.AddListener(tf.consts.perspectiveMapPostComposeEvent, onMapPostCompose);
            mapDLayers = {};
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
