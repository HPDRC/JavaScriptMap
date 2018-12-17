"use strict";

tf.webgl.MapMarker = function (settings) {
    var theThis, map, mapObject, sceneObject, attributes, mapCoords, context, texture, canvas, perspectiveMap, scale;

    this.GetSettings = function () { return settings; }
    this.IsDeleted = function () { return isDeleted(); }
    //this.OnDelete = function () { return onDelete(); }
    this.Update = function () { return update(); }
    this.GetSceneObject = function () { return sceneObject; }
    this.GetMapObject = function () { return mapObject; }

    function isDeleted() { return map == undefined; }

    function createCanvas(markerSettings) {

        if (!!markerSettings.marker) {

            var options = {
                dontTranslate: true,
                font_height: 14, font_color: "#000", border_line_color: "#00b", border_line_width: 2, line_opacity: 0.6,
                line_width: 3, line_color: "#fff", arrow_length: 14, label: "v", fill_color: "#ffe57f", horpos: "center", verpos: "top", fill_opacity: 0.8, border_line_opacity: 0.6
            };

            options = tf.js.GetIsValidObject(markerSettings) ? markerSettings : options;

            canvas = tf.canvas.CreateMemoryImage({ drawFunction: tf.canvas.DrawTextMarkerImage, drawSettings: options }).image;
            updateScale();
        }
        else {
            canvas = document.createElement('canvas');
            canvas.width = canvas.height = 1;
            var img = new tf.dom.Img({
                crossOrigin: true,
                src: markerSettings.icon_url,
                onLoad: function (img) {
                    if (img.GetIsValid()) {
                        var imgElem = img.GetImg();
                        var w = imgElem.width, h = imgElem.height, l = 0, t = 0;
                        var ctx = canvas.getContext('2d');
                        if (markerSettings.useFrame) {
                            var margin = 3, margin2 = margin + margin;
                            w += margin2;
                            h += margin2;
                            canvas.width = w;
                            canvas.height = h;
                            l += margin;
                            t += margin;
                            tf.canvas.DrawRoundRect(ctx, {
                                dontTranslate: true,
                                width: w, height: h, radius: margin, fill: true, fill_color: "rgba(255, 255, 255, 1)", line: true, line_color: 'rgba(192, 192, 192, 0.8)', line_width: 2
                            });
                        }
                        else {
                            canvas.width = w;
                            canvas.height = h;
                        }
                        ctx.drawImage(imgElem, l, t);
                        texture.UpdateFromImage(canvas, true);
                        updateScale();
                    }
                }
            });
        }
        return canvas;
    }

    function createTexture(markerSettings) {
        texture = new tf.webgl.Texture2({ context: context, img: createCanvas(markerSettings), flipVerticalBool: true });
    }

    function updateScale() {
        if (!isDeleted()) {
            var pos = attributes.GetPos();

            if (!!pos) {
                var cw = canvas.width, ch = canvas.height;
                var canvasAspect = cw > 0 ? ch / cw : 1;
                var scaleScale = 1;
                var x = 1 / (canvasAspect * 2), z = 0, y = 0.5;
                var vertices = new Float32Array([x, y, z, -x, y, z, -x, -y, z, x, -y, z]);

                scale = ch * scaleScale;;
                pos.Update(vertices);
            }
        }
    }

    function update() {
        if (!isDeleted()) {
            var scaleUse = scale / perspectiveMap.GetMapSize()[1];
            sceneObject.GetObjectToSceneMatrix().UpdateWorld({
                //rotate: { angle: 45 * Math.PI / 180, axisx: 0, axisy: 1, axisz: 0 },
                translate: { tx: 0, ty: 0.5 * scaleUse, tz: 0 },
                scale: { sx: scaleUse, sy: scaleUse, sz: scaleUse }
            });
        }
    }

    function initialize() {
        if ((tf.js.GetIsValidObject(settings)) &&
            tf.js.GetIsInstanceOf(settings.perspectiveMap, tf.webgl.PerspectiveMap)) {
            perspectiveMap = settings.perspectiveMap;
            map = perspectiveMap.GetMap();
            context = perspectiveMap.GetContext();
            mapCoords = tf.js.GetMapCoordsFrom(settings.mapCoords);
            scale = 1;
            if (tf.js.GetIsValidObject(settings.sceneObject)) { sceneObject = settings.sceneObject; }
            else {
                var program = context.GetTextureColorProgram();
                attributes = new tf.webgl.QuadXY({ context: context });
                createTexture(settings.style);
                sceneObject = new tf.webgl.SceneObject({
                    onPreRender: update, context: context, attributes: attributes, texture: texture, program: program
                });
            }
            var skipRotate = settings.skipRotate !== undefined ? !!settings.skipRotate : true;
            var skipScale = settings.skipScale !== undefined ? !!settings.skipScale : true;
            mapObject = perspectiveMap.CreateMapObject({
                mapMarker: theThis,
                mapCoords: mapCoords, sceneObject: sceneObject, skipRotate: skipRotate, skipScale: skipScale, usePick: settings.usePick
            });
        }
        else { map = undefined; }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.webgl.MapObject = function (settings) {
    var theThis, map, sceneObjectHolder, sceneObject, mapCoords, context, skipRotate, skipScale, perspectiveMap, pickColor, pickID, scale, scaleMatrix;

    this.SetScale = function (scale) { return setScale(scale); }
    this.GetScale = function () { return scale; }
    this.GetSettings = function () { return settings; }
    this.GetPickColor = function () { return pickColor; }
    this.GetPickID = function () { return pickID; }
    this.OnDelete = function () { return onDelete(); }
    this.IsDeleted = function () { return isDeleted(); }
    this.Update = function () { return update(); }

    this.GetSceneObject = function () { return sceneObject; }
    this.GetSceneObjectHolder = function () { return sceneObjectHolder; }

    function isDeleted() { return map == undefined; }

    function onDelete() {
        if (!isDeleted()) {
            if (!!pickID) { context.UnRegisterForPick(pickID); }
            //map.SetActualToVirtualPixelTranslateCallBacks(undefined);
            pickID = map = sceneObject = sceneObjectHolder = context = perspectiveMap = undefined;
        }
    }

    function setScale(scaleSet) {
        scale = tf.js.GetFloatNumber(scaleSet, 1);
        if (scale != 1) {
            scaleMatrix.SetScale({ sx: scale, sy: scale, sz: scale });
        }
    }

    function update() {
        if (!isDeleted()) {
            sceneObjectHolder.GetObjectToSceneMatrix().UpdateWorld(perspectiveMap.GetMapToWorldSpecs(mapCoords, skipRotate, skipScale));
            if (scale != 1) {
                sceneObjectHolder.GetObjectToSceneMatrix().MultByMatrix(scaleMatrix);
            }
            sceneObject.SetPickColor(pickColor);
        }
    }

    function initialize() {
        if ((tf.js.GetIsValidObject(settings)) &&
            (!!(map = tf.js.GetMapFrom(settings.map))) &&
            tf.js.GetIsInstanceOf(settings.context, tf.webgl.Context) && !!settings.context.GetContext() &&
            tf.js.GetIsInstanceOf(settings.sceneObject, tf.webgl.SceneObject)) {
            perspectiveMap = settings.perspectiveMap;
            context = settings.context;
            mapCoords = tf.js.GetMapCoordsFrom(settings.mapCoords);
            sceneObject = settings.sceneObject;
            pickID = tf.js.GetBoolFromValue(settings.usePick) ? context.RegisterForPick(theThis) : 0;
            if (!!pickID) { pickColor = tf.webgl.EncodeIntIntoColor(pickID); }
            sceneObjectHolder = new tf.webgl.SceneObject({ context: context, attributes: undefined, texture: undefined, program: undefined });
            sceneObjectHolder.AddSubObject(sceneObject);
            sceneObjectHolder.SetOnPreRender(update);
            scaleMatrix = new tf.math.ScaleMatrix4();
            setScale(settings.scale);
            skipRotate = !!settings.skipRotate;
            skipScale = !!settings.skipScale;
        }
        else { map = undefined; }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.webgl.MapObjectGroup = function (settings) {
    var theThis, perspectiveMap, groupObject, scene;

    this.GetGroupObject = function () { return groupObject; }

    this.AddObject = function (object) { return addObject(object); }
    this.DelObject = function (object) { return delObject(object); }

    this.DelAllSubObjects = function () { return delAllSubObjects(); }

    this.OnDelete = function () { return onDelete(); }
    this.IsDeleted = function () { return isDeleted(); }

    function delObject(object) {
        if (!isDeleted && tf.js.GetIsInstanceOf(object, tf.webgl.MapObject)) {
            groupObject.DelSubObject(object.GetSceneObjectHolder());
        }
    }

    function addObject(object) {
        if (!isDeleted() && tf.js.GetIsInstanceOf(object, tf.webgl.MapObject)) {
            if (!object.IsDeleted()) { groupObject.AddSubObject(object.GetSceneObjectHolder()); }
        }
        return object;
    }

    function isDeleted() { return perspectiveMap == undefined; }

    function delAllSubObjects() { if (!isDeleted()) { groupObject.DelAllSubObjects(); } }

    function onDelete() {
        if (!isDeleted()) {
            scene.DelObject(groupObject);
            groupObject.DelAllSubObjects();
            scene = groupObject = perspectiveMap = undefined;
        }
    }

    function initialize() {
        if ((tf.js.GetIsValidObject(settings)) && tf.js.GetIsInstanceOf(settings.perspectiveMap, tf.webgl.PerspectiveMap)) {
            (scene = (perspectiveMap = settings.perspectiveMap).GetScene()).AddObject(groupObject = new tf.webgl.SceneObject({ context: perspectiveMap.GetContext() }));
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * @public
 * @description {@link tf.webgl.PerspectiveMap} lost device event
*/
tf.consts.perspectiveMapLostDeviceEvent = "lostdevice";

/**
 * @public
 * @description {@link tf.webgl.PerspectiveMap} restored device event
*/
tf.consts.perspectiveMapRestoredDeviceEvent = "restoreddevice";

/**
 * @public
 * @description {@link tf.webgl.PerspectiveMap} visibility change event
*/
tf.consts.perspectiveMapVisibilityChangeEvent = "visibilityChange";

/**
 * @public
 * @description {@link tf.webgl.PerspectiveMap} mapObject hover in and out event
*/
tf.consts.perspectiveMapObjectHoverInOutEvent = "objecthoverinout";

/**
 * @public
 * @description {@link tf.webgl.PerspectiveMap} mapObject click event
*/
tf.consts.perspectiveMapObjectClickEvent = "objectclick";

/**
 * @public
 * @description {@link tf.webgl.PerspectiveMap} map mouse move event
*/
tf.consts.perspectiveMapMouseMoveEvent = "mapmousemove";

/**
 * @public
 * @description {@link tf.webgl.PerspectiveMap} map click event
*/
tf.consts.perspectiveMapClickEvent = "mapclick";

/**
 * @public
 * @description {@link tf.webgl.PerspectiveMap} post compose event
*/
tf.consts.perspectiveMapPostComposeEvent = "postcompose";

tf.consts.allPerspectiveMapEventNames = [
    tf.consts.perspectiveMapVisibilityChangeEvent,
    tf.consts.perspectiveMapObjectHoverInOutEvent,
    tf.consts.perspectiveMapObjectClickEvent,
    tf.consts.perspectiveMapPostComposeEvent,
    tf.consts.perspectiveMapLostDeviceEvent,
    tf.consts.perspectiveMapRestoredDeviceEvent,
    tf.consts.perspectiveMapMouseMoveEvent = "mapmousemove",
    tf.consts.perspectiveMapClickEvent = "mapclick"
];

tf.webgl.PerspectiveMap = function (settings) {
    var theThis, map, webGL, context, ctx, canvas, mapTexture, htmlControl;
    var scene, mapSceneObject, objectCreationSettings;
    var viewRadius, viewAngle, viewZOff, mapSize, mapAspect, mapCenter, mapRotationRad, mapCosRotationRad, mapSinRotationRad, mapResolution, mapScale;
    var allEventDispatchers;
    var hasMapCenter, hasMeasure, hasDownload, mapMouseMoveListener, mapMouseClickListener;
    var renderCount, pickFrameBufferRenderCount, pickFrameBufferDim, pickFrameBuffer, pickedColor, lastHoveredMapObject;
    var inversePerspective, ptOrigin, vYAxisUnit, cameraPos, cameraDir;
    var renderMap, renderMapXScale, renderMapYScale, forceUpdatePerspective;
    var pickFrameBufferSceneObject;

    this.GetMapSize = function () { return mapSize; }

    this.GetLastHoveredMapObject = function () { return lastHoveredMapObject; }

    this.AddListener = function (eventName, callBack) { return allEventDispatchers.AddListener(eventName, callBack); }

    this.GetIsVisible = function () { return getIsVisible(); }
    this.SetIsVisible = function (bool) { return setIsVisible(bool); }

    this.IsDeleted = function () { return isDeleted(); }
    this.OnDelete = function () { return onDelete(); }

    this.GetContext = function () { return context; }
    this.GetMap = function () { return map; }
    this.GetScene = function () { return scene; }

    this.GetMapToWorldSpecs = function (mapCoords, skipRotate, skipScale) { return getMapToWorldSpecs(mapCoords, skipRotate, skipScale); }
    this.GetMapToWorldTransform = function (mapCoords, skipRotate, skipScale) { return new tf.math.WorldMatrix4(getMapToWorldSpecs(mapCoords, skipRotate, skipScale)); }

    this.CreateMapMarker = function (settings) { return new tf.webgl.MapMarker(mergeCreationSettings(settings)); }
    this.CreateMapObject = function (settings) { return new tf.webgl.MapObject(mergeCreationSettings(settings)); }

    function mergeCreationSettings(settings) { return tf.js.ShallowMerge(settings, objectCreationSettings); }

    function onDelete() {
        if (!isDeleted()) {
            if (!!mapMouseMoveListener) { mapMouseMoveListener.OnDelete(); }
            if (!!mapMouseClickListener) { mapMouseClickListener.OnDelete(); }
            mapMouseClickListener = mapMouseMoveListener = webGL = undefined;
        }
    }

    function isDeleted() { return webGL == undefined; }

    function getIsVisible() { return !isDeleted() && (!!htmlControl ? htmlControl.GetIsVisible() : false); }

    function setIsVisible(bool) {
        if (!isDeleted()) {
            if (getIsVisible() != (bool = !!bool)) {
                if (!!htmlControl) { htmlControl.SetVisible(bool); }
                notifyListeners(tf.consts.perspectiveMapVisibilityChangeEvent);
                updateMapVisibleControls();
                if (bool) { if (context.IsContextLost()) { context.RestoreContext(); } else { onFrame(); } }
            }
        }
    }

    function updateMapVisibleControls() {
        var isVisible = getIsVisible();
        map.ShowPanel(tf.consts.panelNameMeasure, !isVisible && hasMeasure);
        map.ShowPanel(tf.consts.panelNameDownload, !isVisible && hasDownload);
    }

    function intersectRayPlane(rayOrigin, rayDirection, planeOrigin, planeNormal) {
        var ptIntersect, planeNormalDotRayDirection = planeNormal.Dot(rayDirection);

        if (Math.abs(planeNormalDotRayDirection) > 0.0000001) {
            var diffV = new tf.math.Vector3({ vector: planeOrigin }); diffV.Sub(rayOrigin);
            var planeNormalDotDiffV = planeNormal.Dot(diffV);
            var distance = planeNormalDotDiffV / planeNormalDotRayDirection;
            var rayDir = new tf.math.Vector3({ vector: rayDirection });
            rayDir.MultByScalar(distance);
            ptIntersect = new tf.math.Vector3({ vector: rayOrigin });
            ptIntersect.Add(rayDir);
        }
        return ptIntersect;
    }

    function updateInversePerspective() {
        if (!isDeleted()) {
            inversePerspective.CopyFrom(scene.GetPerspective()); inversePerspective.ToInverse();
            if (!!mapSceneObject) {
                var x = 1 / (mapAspect * 2), y = 0, z = 0.5;
                x *= renderMapXScale;
                z *= renderMapYScale;
                var vertices = new Float32Array([x, y, -z, -x, y, -z, -x, y, z, x, y, z]);
                mapSceneObject.GetAttributes().GetPos().Update(vertices);
            }
        }
    }

    function updateMapSettings() {
        mapSize = map.GetActualPixelSize();
        if (mapSize[0] <= 0) { mapSize[0] = 1; }
        if (mapSize[1] <= 0) { mapSize[1] = 1; }
        mapAspect = mapSize[1] / mapSize[0];
        var isAnimating = map.GetIsAnimating();
        mapCenter = isAnimating ? map.GetCenter() : map.GetInstantCenter();
        mapRotationRad = map.GetRotationRad();
        mapCosRotationRad = Math.cos(mapRotationRad);
        mapSinRotationRad = Math.sin(mapRotationRad);
        mapResolution = isAnimating ? map.GetResolution() : map.GetInstantResolution();
        mapScale = 1 / (mapResolution * mapSize[1]);
        if (canvas.clientWidth != canvas.width || canvas.clientHeight != canvas.height || forceUpdatePerspective) {
            forceUpdatePerspective = false;
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            scene.GetPerspective().UpdateAspect(1 / mapAspect);
            updateInversePerspective();
        }
    }

    function getMapToWorldSpecs(mapCoords, skipRotate, skipScale) {
        mapCoords = tf.js.GetMapCoordsFrom(mapCoords);
        var distXCoord = [mapCoords[0], mapCenter[1]];
        var distZCoord = [mapCenter[0], mapCoords[1]];
        var distX = tf.units.GetDistanceInMetersBetweenMapCoords(mapCenter, distXCoord) / mapResolution;
        var distZ = -tf.units.GetDistanceInMetersBetweenMapCoords(mapCenter, distZCoord) / mapResolution;

        if (mapCenter[0] < mapCoords[0]) { distX = -distX; }
        if (mapCenter[1] < mapCoords[1]) { distZ = -distZ; }

        var newDistX = distX * mapCosRotationRad - distZ * mapSinRotationRad;
        var newDistZ = distX * mapSinRotationRad + distZ * mapCosRotationRad;

        distX = newDistX / (mapSize[0]) / mapAspect;
        distZ = newDistZ / (mapSize[1]);

        var rotate = !!skipRotate ? undefined : { angle: -mapRotationRad, axisx: 0, axisy: 1, axisz: 0 };
        var scale = !!skipScale ? undefined : { sx: mapScale, sy: mapScale, sz: mapScale };

        return { scale: scale, rotate: rotate, translate: { tx: -distX, ty: 0, tz: -distZ } };
    }

    function pixelVirtualToActual(pixelCoords) {
        if (getIsVisible()) {
            var mapCoords = map.ActualPixelToMapCoords(pixelCoords);
            var mapToWorldTransform = theThis.GetMapToWorldTransform(mapCoords, false, false);
            var tempPos = new tf.math.Vector3();

            mapToWorldTransform.ToInverse();

            tempPos.Update({ x: 0, y: 0, z: 0 });
            tempPos.MultByMatrix(mapToWorldTransform);

            var x = tempPos[0], y = tempPos[2];
            var coords = [(x * mapAspect + 0.5) * mapSize[0], (y + 0.5) * mapSize[1]];
            return coords;
        }
    }

    function pixelActualToVirtual(pixelCoords) { if (getIsVisible()) { return mapPixelCoordsToPerspectivePixelCoords(pixelCoords); } }

    function mapPixelCoordsToPerspectivePixelCoords(pixelCoords) {
        var coords;
        var mapQuadCoords = mapPixelCoordsToPerspectiveMapQuadCoords(pixelCoords);
        if (!!mapQuadCoords) {
            coords = [
                (mapQuadCoords[0] * mapAspect + 0.5) * mapSize[0],
                (mapQuadCoords[2] + 0.5) * mapSize[1]
            ];
        }
        return coords;
    }

    function mapPixelCoordsToPerspectiveMapQuadCoords(pixelCoords) {
        var x = (2 * pixelCoords[0]) / mapSize[0] - 1;
        var y = 1 - (2 * pixelCoords[1]) / mapSize[1];
        var view = scene.GetView();

        cameraPos.Update(view.GetView().vFrom);
        cameraDir.Update({ x: x, y: y, z: 1 });
        cameraDir.MultByMatrix(inversePerspective);
        cameraDir.MultByMatrix(view.GetInverse());
        cameraDir.Sub(cameraPos);
        cameraDir.Normalize();
        return intersectRayPlane(cameraPos, cameraDir, ptOrigin, vYAxisUnit);
    }

    function initContext(onContext) {
        //var sceneNear = 0.1, sceneFar = 10, viewY, viewZ, vFrom, vTo;
        var sceneNear = 0.01, sceneFar = 100, viewY, viewZ, vFrom, vTo;

        viewY = Math.sin(viewAngle) * viewRadius;
        viewZ = Math.cos(viewAngle) * viewRadius;
        vFrom = [0, viewY, viewZ + viewZOff], vTo = [0, 0, viewZOff];

        var view = { vFrom: vFrom, vTo: vTo, vUp: [0, 1, 0] };

        var ambientComponent = 1;
        var lightComponent = 0.75;

        scene = new tf.webgl.Scene({
            context: onContext, clearColor: [1, 1, 1, 1], clearDepth: 1,
            ambientColor: [ambientComponent, ambientComponent, ambientComponent],
            lightDir: [0, 0, 1],
            lightColor: [lightComponent, lightComponent, lightComponent],
            view: view,
            perspective: { fovy: 30 * Math.PI / 180, near: sceneNear, far: sceneFar }
        });

        updateInversePerspective();

        var program = onContext.GetTextureColorProgram();
        var quad = new tf.webgl.QuadXY({ context: onContext });
        mapSceneObject = new tf.webgl.SceneObject({
            //usePick: true,
            context: onContext, attributes: quad, texture: mapTexture, program: program
        });
        var normals = new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]);
        mapSceneObject.GetAttributes().GetNor().Update(normals);

        scene.AddObject(mapSceneObject);

        /*pickFrameBufferSceneObject = new tf.webgl.SceneObject({
            context: onContext, attributes: new tf.webgl.QuadXY({ context: onContext }),
            texture: pickFrameBuffer.GetTexture(),
            //texture: context.GetFourColorTexture(),
            program: program,
            scale: {sx: 0.1, sy: 0.1, sz: 0.1}
        });

        scene.AddObject(pickFrameBufferSceneObject);*/

        //var lightDir = new tf.math.Vector3({ x: 0, y: 1, z: 0 });
        //lightDir.Normalize();
        //scene.SetLightDir([lightDir[0], lightDir[1], lightDir[2]]);
    }

    function getMapCanvas() {
        //return map.GetCanvas();
        return renderMap.GetCanvas();
    }

    function onScenePostCompose(notification) { notifyListeners(tf.consts.perspectiveMapPostComposeEvent, { sender: theThis, sceneNotification: notification }); }

    function drawFrame(onContext) {
        var mapCanvas = getMapCanvas();

        if (!!mapCanvas) {

            updateMapSettings();

            mapTexture.UpdateFromImage(mapCanvas, true);

            scene.OnPreRender();

            var renderOptions = {
                onPostCompose: onScenePostCompose,
                viewportWidth: canvas.width, viewportHeight: canvas.height,
                isForPick: false,
                frameBuffer: undefined, clearColor: undefined, useProgram: undefined
            };

            scene.RenderOn(renderOptions);

            if (((++renderCount) % pickFrameBufferRenderCount) == 0) {
                renderOptions.viewportWidth = renderOptions.viewportHeight = pickFrameBufferDim;
                renderOptions.isForPick = true;
                renderOptions.frameBuffer = pickFrameBuffer.GetFrameBuffer();
                renderOptions.clearColor = [0, 0, 0, 0];
                renderOptions.useProgram = context.GetTextureColorPickProgram();
                scene.RenderOn(renderOptions);
            }
        }
    }

    function restoreContext() {
        if (!!context) { context.RestoreContext(); }
    }

    function onFrame(notification) { if (getIsVisible()) { drawFrame(context); context.RequestAnimFrame(); } }
    function onLost(notification) {
        notifyListeners(tf.consts.perspectiveMapLostDeviceEvent);
        //setTimeout(restoreContext, 1000);
        //setTimeout(restoreContext, 1);
        if (getIsVisible()) { setIsVisible(false); }
    }

    function onRestored(notification) {
        if (!!webGL) {
            forceUpdatePerspective = true;
            notifyListeners(tf.consts.perspectiveMapRestoredDeviceEvent);
            setTimeout(function () { return onFrame(notification); }, 100);
        }
    }

    function notifyListeners(eventName, moreArgs) { allEventDispatchers.Notify(eventName, tf.js.ShallowMerge(moreArgs, { sender: theThis, eventName: eventName })); }

    function getMapObjectFromPixel(px, py) {
        var mapObj;

        if (!isDeleted()) {

            ctx.bindFramebuffer(ctx.FRAMEBUFFER, pickFrameBuffer.GetFrameBuffer());
            ctx.readPixels(px, py, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, pickedColor);
            ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);

            mapObj = context.GetPickObject(tf.webgl.DecodeColorIntoInt(pickedColor));
        }
        return mapObj;
    }

    function getMapObjectFromMapNotification(notification) {
        var mapObj;

        if (!isDeleted()) {
            var tx = Math.floor(notification.actualPixelCoords[0] / mapSize[0] * pickFrameBufferDim);
            var tz = pickFrameBufferDim - Math.floor(notification.actualPixelCoords[1] / mapSize[1] * pickFrameBufferDim);
            mapObj = getMapObjectFromPixel(tx, tz);
        }
        return mapObj;
    }

    function onMapMouseClick(notification) {
        if (!isDeleted()) {
            var mapObj = getMapObjectFromMapNotification(notification);
            if (!!mapObj) { notifyListeners(tf.consts.perspectiveMapObjectClickEvent, { mapObject: mapObj }); }
            else {
                notifyListeners(tf.consts.perspectiveMapClickEvent);
            }
            //context.LoseContext();
        }
    }

    function onMapMouseMove(notification) {
        if (!isDeleted()) {
            var mapObj = getMapObjectFromMapNotification(notification), prevLastHoveredMapObject = lastHoveredMapObject, notifyOut, notifyIn;

            if (!!(lastHoveredMapObject = mapObj)) { if (! (notifyIn = !prevLastHoveredMapObject)) { notifyIn = notifyOut = mapObj != prevLastHoveredMapObject; } }
            else { notifyOut = !!prevLastHoveredMapObject; }

            if (notifyIn || notifyOut) {
                if (notifyOut) { notifyListeners(tf.consts.perspectiveMapObjectHoverInOutEvent, { nextMapObject: lastHoveredMapObject, mapObject: prevLastHoveredMapObject, isHoverIn: false }); }
                if (notifyIn) { notifyListeners(tf.consts.perspectiveMapObjectHoverInOutEvent, { prevMapObject: prevLastHoveredMapObject, mapObject: lastHoveredMapObject, isHoverIn: true }) }
            }
            else { notifyListeners(tf.consts.perspectiveMapMouseMoveEvent, notification); }
        }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);

        /*viewRadius = 0.72;
        viewAngle = 30 * Math.PI / 180;
        viewZOff = 0.23;*/

        viewRadius = 1.5;
        viewAngle = 30 * Math.PI / 180;
        viewZOff = 0;

        mapSize = [100, 100];
        mapAspect = 1;

        inversePerspective = new tf.math.Matrix4({ noInit: true });

        ptOrigin = new tf.math.Vector3({ x: 0, y: 0, z: 0 });
        vYAxisUnit = new tf.math.Vector3({ x: 0, y: 1, z: 0 });

        cameraPos = new tf.math.Vector3();
        cameraDir = new tf.math.Vector3();

        allEventDispatchers = new tf.events.MultiEventNotifier({ eventNames: tf.consts.allPerspectiveMapEventNames });

        if (map = tf.js.GetMapFrom(settings.map)) {
            webGL = tf.webgl.GetWebGL();
            if (webGL.GetHasWebGL()) {

                context = new tf.webgl.Context({ optionalAttributes: { antialias: true }, onFrame: onFrame, onLost: onLost, onRestored: onRestored });
                objectCreationSettings = { map: map, context: context, perspectiveMap: theThis };
                mapTexture = new tf.webgl.Texture2({ context: context, img: map.GetCanvas() });
                ctx = context.GetContext();
                canvas = context.GetCanvas();

                pickedColor = new Uint8Array(4);

                renderCount = 0;
                pickFrameBufferRenderCount = 10;
                pickFrameBufferDim = 512;
                pickFrameBuffer = new tf.webgl.FrameBuffer({ context: context, width: pickFrameBufferDim, height: pickFrameBufferDim });

                var styles = tf.GetStyles(), subStyles = styles.GetSubStyles();
                var canvasStyles = { backgroundColor: "rgba(0,0,0,1)", width: "100%", height: "100%", position: 'relative', display: 'block' };
                var containerStyles = {
                    inherits: [subStyles.cursorDefaultStyle, subStyles.noSelectStyle],
                    backgroundColor: "rgba(0,0,0,0)",
                    color: "#fc0", padding: "0px", border: 'none', width: "100%", height: "100%",
                    position: "absolute", left: "0px", top: "0px",
                    overflow: 'hidden', pointerEvents: 'none', display: "block", zIndex: 0
                };
                var isVisible = !tf.js.GetIsFalseNotUndefined(settings.isVisible);

                hasMapCenter = map.IsShowingMapCenter();
                hasMeasure = map.IsPanelShowing(tf.consts.panelNameMeasure);
                hasDownload = map.IsPanelShowing(tf.consts.panelNameDownload);

                styles.ApplyStyleProperties(canvas, canvasStyles);
                htmlControl = new tf.map.HTMLControl({ map: map, content: canvas, cssStyle: containerStyles, isVisible: isVisible });

                updateMapVisibleControls();

                mapMouseMoveListener = map.AddListener(tf.consts.mapMouseMoveEvent, onMapMouseMove);
                mapMouseClickListener = map.AddListener(tf.consts.mapClickEvent, onMapMouseClick);

                map.SetActualToVirtualPixelTranslateCallBacks(pixelActualToVirtual, pixelVirtualToActual);

                renderMapXScale = 1.5;
                renderMapYScale = 3;

                renderMap = new tf.map.RenderMap({ map: map, scale: [renderMapXScale, renderMapYScale] });

                initContext(context);
                forceUpdatePerspective = true;
                updateMapSettings();
                onFrame();
            }
            else { webGL = map = undefined; }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
