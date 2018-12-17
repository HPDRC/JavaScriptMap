"use strict";

tf.webgl.SceneObject = function (settings) {
    var theThis, context, program, attributes, texture, objectToSceneMatrix, useLines, subObjects, material, onPreRenderCallBack;
    var isVisible, subObjectsAreVisible, cullFaceBool, cullFrontFaceBool, useDepth, usesNonUniformScaling, pickColor, combinedWorldMatrix, comboList, renderMatrix;

    this.SetRenderMatrix = function (renderMatrixSet) { renderMatrix = renderMatrixSet; }
    this.GetRenderMatrix = function (renderMatrixSet) { return renderMatrix; }

    this.OnPreRender = function (onPreRenderSettings) { return onPreRender(onPreRenderSettings); }

    this.SeUsesNonUniformScaling = function (bool) { usesNonUniformScaling = !!bool; }
    this.GetUsesNonUniformScaling = function () { return usesNonUniformScaling; }

    this.SetUseDepth = function (bool) { useDepth = !!bool; }
    this.GetUseDepth = function () { return useDepth; }

    this.GetPickColor = function () { return pickColor; }
    this.SetPickColor = function (newPickColor) { pickColor = newPickColor; }

    this.GetIsVisible = function () { return isVisible; }
    this.SetIsVisible = function (bool) { return isVisible = !!bool; }

    this.GetAreSubObjectsVisible = function () { return subObjectsAreVisible; }
    this.SetAreSubObjectsVisible = function (bool) { return subObjectsAreVisible = !!bool; }

    this.GetAttributes = function () { return attributes; }

    this.GetComboList = function () { return comboList; }

    this.GetObjectToSceneMatrix = function () { return objectToSceneMatrix; }

    this.RenderSelf = function (renderSettings) { return renderSelf(renderSettings); }

    this.AddSubObject = function (subObject) {
        if (!theThis.IsDeleted() && tf.js.GetIsInstanceOf(subObject, tf.webgl.SceneObject)) {
            subObjects.push(subObject);
        }
    }

    this.DelSubObject = function (subObject) {
        if (!theThis.IsDeleted() && tf.js.GetIsInstanceOf(subObject, tf.webgl.SceneObject)) {
            var index = subObjects.find(subObject);
            if (index != -1) { subObject.splice(index, 1); }
        }
    }

    this.GetSubObjects = function () { return subObjects; }

    this.DelAllSubObjects = function () { if (!theThis.IsDeleted()) { subObjects = []; } }

    this.SetOnPreRender = function(onPreRenderSet) {
        onPreRenderCallBack = tf.js.GetFunctionOrNull(onPreRenderSet);
    }

    this.OnDelete = function (delSubObjects, delVertexAndTextures, delVertexSubBuffers) { return onDelete(delSubObjects, delVertexAndTextures, delVertexSubBuffers); }
    this.IsDeleted = function () { return isDeleted(); }

    function isDeleted() { return context == undefined; }
    function onDelete(delSubObjects, delVertexAndTextures, delVertexSubBuffers) {
        if (!isDeleted()) {
            if (!!delSubObjects) {
                for (var i in subObjects) { subObjects[i].OnDelete(delSubObjects, delVertexAndTextures, delVertexSubBuffers); }
            }
            if (!!delVertexAndTextures) {
                if (!!attributes) { attributes.OnDelete(delVertexSubBuffers); }
                if (!!texture) { texture.OnDelete(); }
            }
            renderMatrix = combinedWorldMatrix = subObjects = program = attributes = material = texture = objectToSceneMatrix = context = undefined;
        }
    }

    function onPreRender(onPreRenderSettings) {
        if (!isDeleted()) {
            renderMatrix = undefined;
            if (isVisible) {
                var parentObjectToSceneMatrix = onPreRenderSettings.parentObjectToSceneMatrix;

                if (!!onPreRenderCallBack) { onPreRenderCallBack(theThis); }

                combinedWorldMatrix.CopyFrom(parentObjectToSceneMatrix);
                combinedWorldMatrix.MultByMatrix(objectToSceneMatrix);

                if (!!program) {
                    var point = new tf.math.Vector3([0, 0, 0]);
                    point.MultByMatrix(combinedWorldMatrix);
                    /*var length = new tf.math.Vector3([1, 1, 1]);
                    length.MultByMatrix(combinedWorldMatrix);*/
                    var frustumVisible = onPreRenderSettings.frustum.GetIsPointVisible(point);
                    onPreRenderSettings.toRender.push({ sceneObject: theThis, objectToSceneMatrix: combinedWorldMatrix, frustumVisible: frustumVisible });
                }

                if (subObjectsAreVisible) {
                    for (var i in subObjects) {
                        onPreRenderSettings.parentObjectToSceneMatrix = combinedWorldMatrix;
                        subObjects[i].OnPreRender(onPreRenderSettings);
                    }
                    onPreRenderSettings.parentObjectToSceneMatrix = parentObjectToSceneMatrix;
                }
            }
        }
    }

    function renderSelf(renderSettings) {
        if (!isDeleted()) {
            if (isVisible) {
                var ctx = context.GetContext();
                var scene = renderSettings.scene;
                var useProgram = renderSettings.useProgram;
                var isForPick = renderSettings.isForPick;

                if (!!program) {
                    if (!isForPick || !!pickColor) {
                        if (!!cullFaceBool) { ctx.enable(ctx.CULL_FACE); if (!!cullFrontFaceBool) { ctx.cullFace(ctx.FRONT); } else { ctx.cullFace(ctx.BACK); } }
                        else { ctx.disable(ctx.CULL_FACE); }

                        if (!!useDepth) { ctx.enable(ctx.DEPTH_TEST); } else { ctx.disable(ctx.DEPTH_TEST); }

                        //ctx.disable(ctx.DEPTH_TEST);
                        //ctx.disable(ctx.CULL_FACE);

                        if (useProgram == undefined) { useProgram = program; }

                        useProgram.Render({
                            usesNonUniformScaling: usesNonUniformScaling || renderSettings.usesNonUniformScaling,
                            comboList: comboList,
                            attributes: attributes,
                            texture: texture,
                            material: material,
                            scene: scene,
                            objectToSceneMatrix: renderMatrix,
                            useLines: renderSettings.useLines || useLines,
                            //useLines: true,
                            pickColor: pickColor
                        });
                    }
                }
                if (subObjectsAreVisible && !!renderSettings.renderSubObjects) {
                    var savedUsesNonUniformScaling = renderSettings.usesNonUniformScaling;
                    renderSettings.usesNonUniformScaling |= usesNonUniformScaling;
                    for (var i in subObjects) { subObjects[i].RenderSelf(renderSettings); }
                    renderSettings.usesNonUniformScaling = savedUsesNonUniformScaling;
                }
            }
        }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (tf.js.GetIsInstanceOf(settings.context, tf.webgl.Context) && !!settings.context.GetContext()) {
            objectToSceneMatrix = new tf.math.WorldMatrix4(settings);
            combinedWorldMatrix = new tf.math.WorldMatrix4();
            context = settings.context;
            subObjects = [];
            isVisible = !tf.js.GetIsFalseNotUndefined(settings.isVisible);
            subObjectsAreVisible = !tf.js.GetIsFalseNotUndefined(settings.subObjectsAreVisible);
            if (tf.js.GetIsInstanceOf(settings.program, tf.webgl.Program)) {
                cullFaceBool = settings.cullFace !== undefined ? !!settings.cullFace : true;
                cullFrontFaceBool = settings.cullFrontFace !== undefined ? !!settings.cullFrontFace : false;
                useLines = !!settings.useLines;
                useDepth = !tf.js.GetIsFalseNotUndefined(settings.useDepth);
                usesNonUniformScaling = !!settings.usesNonUniformScaling;
                program = settings.program;
                comboList = tf.js.GetIsInstanceOf(settings.comboList, tf.webgl.MatTex2VertComboList) ? settings.comboList : undefined;
                attributes = tf.js.GetIsInstanceOf(settings.attributes, tf.webgl.VertexBuffer) ? settings.attributes : undefined;
                texture = tf.js.GetIsInstanceOf(settings.texture, tf.webgl.Texture2) ? settings.texture : undefined;
                material = settings.material;
                onPreRenderCallBack = tf.js.GetFunctionOrNull(settings.onPreRender);
            }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.webgl.Scene = function (settings) {
    var theThis, context, canvas, objects, clearColor, ambientColor, clearDepth, world, view, perspective, lightDir, lightColor, viewProj, lastProgram;
    var preRenderArray, frustum;

    this.OnPreRender = function () { return onPreRender(); }

    this.GetLastProgram = function () { return lastProgram; }
    this.SetLastProgram = function (lastProgramSet) { return lastProgram = lastProgramSet; }

    this.RenderOn = function (sceneRenderSettings) { return renderOn(sceneRenderSettings); }

    this.GetViewProj = function () { return viewProj; }
    this.GetWorld = function () { return world; }
    this.GetView = function () { return view; }
    this.GetPerspective = function () { return perspective; }

    this.SetClearColor = function (color) { return setClearColor(color); }
    this.GetClearColor = function () { return clearColor.slice(0); }

    this.SetAmbientColor = function (color) { return setAmbientColor(color); }
    this.GetAmbientColor = function () { return ambientColor.slice(0); }

    this.GetLightDir = function () { return lightDir; }
    this.SetLightDir = function (lightDir) { return setLightDir(lightDir); }

    this.SetLightColor = function (color) { return setLightColor(color); }
    this.GetLightColor = function () { return lightColor.slice(0); }

    this.AddObject = function (object) {
        if (!isDeleted()) {
            if (tf.js.GetIsValidObject(object) && !!tf.js.GetFunctionOrNull(object.RenderSelf)) {
                objects.push(object);
            }
        }
    }

    this.DelObject = function (object) {
        if (!isDeleted()) {
            if (tf.js.GetIsValidObject(object)) {
                var index = objects.indexOf(object);
                if (index != -1) { objects.splice(index, 1); }
            }
        }
    }

    this.ClearObjects = function () { return clearObjects(); }

    this.OnDelete = function () { return onDelete(); }
    this.IsDeleted = function () { return isDeleted(); }

    function clearObjects() { if (!isDeleted()) { objects = []; } }
    function isDeleted() { return context == undefined; }
    function onDelete() {
        context = canvas = undefined; objects = null;
    }

    function onPreRender() {
        if (!isDeleted()) {
            preRenderArray = [];
            frustum.OnUpdate();

            var onPreRenderSettings = {
                frustum: frustum,
                parentObjectToSceneMatrix: world,
                toRender: preRenderArray
            };

            for (var i in objects) { objects[i].OnPreRender(onPreRenderSettings); }
        }
    }

    function renderOn(sceneRenderSettings) {

        function renderImmediate(object, renderSubObjects) {
            if (tf.js.GetIsInstanceOf(object, tf.webgl.SceneObject)) {
                renderSettings.renderSubObjects = !!renderSubObjects;
                object.RenderSelf(renderSettings);
            }
        }

        if (!isDeleted()) {
            lastProgram = undefined;

            viewProj.CopyFrom(perspective);
            viewProj.MultByMatrix(view);

            var ctx = context.GetContext();
            var viewportWidth = sceneRenderSettings.viewportWidth;
            var viewportHeight = sceneRenderSettings.viewportHeight;

            ctx.viewport(0, 0, viewportWidth, viewportHeight);

            //ctx.bindFramebuffer(ctx.FRAMEBUFFER, sceneRenderSettings.frameBuffer);
            if (!!sceneRenderSettings.frameBuffer) {
                ctx.bindFramebuffer(ctx.FRAMEBUFFER, sceneRenderSettings.frameBuffer);
            }
            else {
                ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
            }

            ctx.depthRange(0.0, 1.0);
            ctx.depthFunc(ctx.LEQUAL);
            ctx.clearDepth(clearDepth);

            ctx.enable(ctx.BLEND);

            //ctx.enable(ctx.SAMPLE_COVERAGE);
            //ctx.sampleCoverage(2, false);

            ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA);

            /*ctx.activeTexture(ctx.TEXTURE0 + 0);
            ctx.bindTexture(ctx.TEXTURE_2D, null);
            ctx.activeTexture(ctx.TEXTURE0 + 1);
            ctx.bindTexture(ctx.TEXTURE_2D, null);*/

            var clearColorUse = sceneRenderSettings.clearColor !== undefined ? sceneRenderSettings.clearColor : clearColor;

            ctx.clearColor(clearColorUse[0], clearColorUse[1], clearColorUse[2], clearColorUse[3]);
            ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);

            ctx.frontFace(ctx.CCW);

            var renderSettings = {
                scene: theThis,
                renderSubObjects: false,
                parentObjectToSceneMatrix: world,
                useProgram: sceneRenderSettings.useProgram,
                isForPick: sceneRenderSettings.isForPick
            };

            var total = preRenderArray.length, visible = 0;

            for (var i in preRenderArray) {
                var pr = preRenderArray[i], so = pr.sceneObject;
                if (pr.frustumVisible) {
                    ++visible;
                    so.SetRenderMatrix(pr.objectToSceneMatrix);
                    so.RenderSelf(renderSettings);
                }
                //so.SetRenderMatrix(pr.objectToSceneMatrix);
                //so.RenderSelf(renderSettings);
            }

            //console.log('total: ' + total + ' visible: ' + visible);

            if (tf.js.GetFunctionOrNull(sceneRenderSettings.onPostCompose)) {
                sceneRenderSettings.onPostCompose({ sender: theThis, renderImmediate: renderImmediate });
            }
        }
    }

    function setLightDir(lightDirSet) {
        lightDir = tf.js.GetIsArrayWithLength(lightDirSet, 3) ? lightDirSet.slice(0) : [0, 0, 1];
    }

    function getColorFrom(color, nComponents, defaultColor) { return tf.js.GetIsArrayWithLength(color, nComponents) ? color.slice(0) : defaultColor; }

    function setClearColor(color) { clearColor = getColorFrom(color, 4, [0, 0, 0.5, 1]); }
    function setAmbientColor(color) { ambientColor = getColorFrom(color, 3, [0, 0, 0]); }
    function setLightColor(color) { lightColor = getColorFrom(color, 3, [0, 0, 0]); }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (tf.js.GetIsInstanceOf(settings.context, tf.webgl.Context) && !!settings.context.GetContext()) {
            context = settings.context;
            canvas = context.GetCanvas();
            viewProj = new tf.math.Matrix4({ noInit: true });
            world = new tf.math.WorldMatrix4(settings.world);
            view = new tf.math.ViewMatrix4(settings.view);
            perspective = new tf.math.PerspectiveFOVMatrix4(settings.perspective);
            frustum = new tf.math.ViewFrustum({ perspective: perspective, view: view });
            clearDepth = typeof settings.clearDepth == 'number' ? settings.clearDepth : 1;
            setClearColor(settings.clearColor);
            setAmbientColor(settings.ambientColor);
            setLightDir(settings.lightDir);
            setLightColor(settings.lightColor);
            clearObjects();
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.webgl.SceneContainer = function (settings) {
    var theThis, styles, subStyles, context, ctx, canvas, scene, aspect, container, containerHTML;
    var renderCount, pickFrameBufferRenderCount, pickFrameBufferDim, pickFrameBuffer, pickedColor;
    var onFrameCallBack, onPostComposeCallBack;

    this.GetObjectFromPixel = function(pixelCoords) { return getObjectFromPixel(pixelCoords); }
    this.OnFrame = function () { return onFrame(); }
    this.GetContext = function () { return context; }
    this.GetScene = function () { return scene; }
    this.GetAspect = function () { return aspect; }

    this.OnDelete = function () { return onDelete(); }
    this.IsDeleted = function () { return isDeleted(); }

    function isDeleted() { return context == undefined; }
    function isOperational() { return ctx != undefined; }

    function onDelete() {
        if (!isDeleted()) {
            if (!!containerHTML && !!canvas) { containerHTML.removeChild(canvas); }
            if (!!scene) { scene.OnDelete(); }
            if (!!pickFrameBuffer) { pickFrameBuffer.OnDelete(); }
            if (!!context) { context.OnDelete(); }
            containerHTML = container = canvas = ctx = context = scene = pickFrameBuffer = undefined;
        }
    }

    function getObjectFromPixel(pixelCoords) {
        var obj;

        if (isOperational()) {
            if (!!pickFrameBuffer && tf.js.GetIsArrayWithMinLength(pixelCoords, 2)) {
                ctx.bindFramebuffer(ctx.FRAMEBUFFER, pickFrameBuffer.GetFrameBuffer());
                ctx.readPixels(pixelCoords[0], pixelCoords[1], 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, pickedColor);
                ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
                obj = context.GetPickObject(tf.webgl.DecodeColorIntoInt(pickedColor));
            }
        }
        return obj;
    };

    function updatePerspective() {
        if (canvas.clientWidth != canvas.width || canvas.clientHeight != canvas.height) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            aspect = canvas.clientWidth > 0 ? canvas.clientHeight / canvas.clientWidth : 1;
            scene.GetPerspective().UpdateAspect(1 / aspect);
        }
    }

    function drawFrame() {
        if (isOperational()) {
            updatePerspective();

            if (!!onFrameCallBack) { onFrameCallBack({ sender: theThis }); }

            scene.OnPreRender();

            var renderOptions = {
                onPostCompose: onPostComposeCallBack,
                viewportWidth: canvas.width, viewportHeight: canvas.height,
                isForPick: false,
                frameBuffer: undefined, clearColor: undefined, useProgram: undefined
            };

            scene.RenderOn(renderOptions);

            if (!!pickFrameBuffer) {
                if ((renderCount % pickFrameBufferRenderCount) == 0) {
                    renderOptions.viewportWidth = renderOptions.viewportHeight = pickFrameBufferDim;
                    renderOptions.isForPick = true;
                    renderOptions.frameBuffer = pickFrameBuffer.GetFrameBuffer();
                    renderOptions.clearColor = [0, 0, 0, 0];
                    renderOptions.useProgram = context.GetTextureColorPickProgram();
                    scene.RenderOn(renderOptions);
                }
            }

            renderCount++;
        }
    }

    function restoreContext() { if (!!context) { context.RestoreContext(); } }

    function onFrame() { drawFrame(); context.RequestAnimFrame(); }
    function onLost() { ctx = undefined; setTimeout(restoreContext, 1000); }
    function onRestored() { ctx = context.GetContext(); drawFrame(); }

    function createScene() {
        var viewAngle = 30 * Math.PI / 180;
        var viewRadius = 1;
        var sceneNear = 1, sceneFar = 1000, viewY, viewZ, vFrom, vTo, viewZOff = 0;

        viewY = Math.sin(viewAngle) * viewRadius;
        viewZ = Math.cos(viewAngle) * viewRadius;
        vFrom = [viewZ, viewZ, 0]; vTo = [0, 0, 0];

        var view = { vFrom: vFrom, vTo: vTo, vUp: [0, 1, 0] };
        var ambientComponent = 1;
        var lightComponent = 0.75;
        scene = new tf.webgl.Scene({
            context: context, clearColor: [0, 0, 0, 1], clearDepth: 1,
            ambientColor: [ambientComponent, ambientComponent, ambientComponent],
            lightDir: [0, 1, 0],
            lightColor: [lightComponent, lightComponent, lightComponent],
            view: view,
            perspective: { fovy: 30 * Math.PI / 180, near: sceneNear, far: sceneFar }
        });
    }

    function initialize() {
        if (tf.js.GetIsValidObject(settings) && tf.dom.GetHTMLElementFrom(settings.container)) {
            styles = tf.GetStyles(); subStyles = styles.GetSubStyles();
            aspect = 1;

            container = settings.container;
            containerHTML = container.GetHTMLElement();

            onFrameCallBack = tf.js.GetFunctionOrNull(settings.onFrame);
            onPostComposeCallBack = tf.js.GetFunctionOrNull(settings.onPostCompose);

            if (tf.webgl.GetWebGL().GetHasWebGL()) {
                var canvasStyles = { backgroundColor: "rgba(0,0,0,1)", width: "100%", height: "100%", position: 'relative', display: 'block' };
                context = new tf.webgl.Context({ optionalAttributes: { antialias: true }, onFrame: onFrame, onLost: onLost, onRestored: onRestored });
                canvas = context.GetCanvas();
                ctx = context.GetContext();

                pickedColor = new Uint8Array(4);
                renderCount = 0;

                if (!settings.noPickFrameBuffer) {
                    pickFrameBufferRenderCount = 10;
                    pickFrameBufferDim = 512;
                    pickFrameBuffer = new tf.webgl.FrameBuffer({ context: context, width: pickFrameBufferDim, height: pickFrameBufferDim });
                }

                createScene();
                styles.ApplyStyleProperties(canvas, canvasStyles);
                containerHTML.appendChild(canvas);
            }
            else { containerHTML.innerHTML = "<h3>WebGL not available</h3>"; }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

