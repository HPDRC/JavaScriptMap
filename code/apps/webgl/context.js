"use strict";

tf.webgl.Context = function (settings) {
    var theThis, webgl, context, canvas, lostListener, restoredListener, lastRequestID, frameCallBack, lostCallBack, restoredCallBack;
    var shaderSettings, textureColorFS, textureColorVS, textureColorProgram,
        textureColorPickFS, textureColorPickVS, textureColorPickProgram, materialFS, materialVS, materialProgram, WEBGL_lose_context;
    var fourColorTexture, isContextLost;
    var shaders, programs;
    var texture2sCollection, buffersCollection, frameBuffersCollection, pickCollection;
    var onePixelTransparentCanvas, onePixelTransparentTexture;

    this.RegisterTexture2 = function (texture2) { return texture2sCollection.Add(texture2); }
    this.UnRegisterTexture2 = function (textureId) { return texture2sCollection.Del(textureId); }

    this.RegisterBuffer = function (buffer) { return buffersCollection.Add(buffer); }
    this.UnRegisterBuffer = function (bufferId) { return buffersCollection.Del(bufferId); }

    this.RegisterFrameBuffer = function (frameBuffer) { return frameBuffersCollection.Add(frameBuffer); }
    this.UnRegisterFrameBuffer = function (frameBufferId) { return frameBuffersCollection.Del(frameBufferId); }

    this.RegisterForPick = function (object) { return pickCollection.Add(object); }
    this.UnRegisterForPick = function (objectId) {
        return pickCollection.Del(objectId);
    }
    this.GetPickObject = function (objectId) { return pickCollection.Get(objectId); }

    this.IsContextLost = function () { return isContextLost; }
    this.LoseContext = function () { return loseContext(); }
    this.RestoreContext = function () { return restoreContext(); }

    this.IsDeleted = function () { return isDeleted(); }

    this.OnDelete = function () { return onDelete(); }

    this.GetOnePixelTransparentCanvas = function () { return getOnePixelTransparentCanvas(); }
    this.GetOnePixelTransparentTexture = function () { return getOnePixelTransparentTexture(); }

    this.GetFourColorTexture = function () {
        if (!fourColorTexture) { fourColorTexture = createFourColorTexture(); }
        return fourColorTexture;
    }

    this.GetMaterialFS = function () {
        if (!materialFS) { materialFS = createShaderObject(tf.webgl.MaterialFS); }
        return materialFS;
    }

    this.GetMaterialVS = function () {
        if (!materialVS) { materialVS = createShaderObject(tf.webgl.MaterialVS); }
        return materialVS;
    }

    this.GetMaterialProgram = function () {
        if (!materialProgram) { materialProgram = createShaderProgram(tf.webgl.MaterialProgram); }
        return materialProgram;
    }

    this.GetTextureColorFS = function () {
        if (!textureColorFS) { textureColorFS = createShaderObject(tf.webgl.TextureColorFS); }
        return textureColorFS;
    }

    this.GetTextureColorVS = function () {
        if (!textureColorVS) { textureColorVS = createShaderObject(tf.webgl.TextureColorVS); }
        return textureColorVS;
    }

    this.GetTextureColorProgram = function () {
        if (!textureColorProgram) { textureColorProgram = createShaderProgram(tf.webgl.TextureColorProgram); }
        return textureColorProgram;
    }

    this.GetTextureColorPickFS = function () {
        if (!textureColorPickFS) { textureColorPickFS = createShaderObject(tf.webgl.TextureColorPickFS); }
        return textureColorPickFS;
    }

    this.GetTextureColorPickVS = function () {
        if (!textureColorPickVS) { textureColorPickVS = createShaderObject(tf.webgl.TextureColorPickVS); }
        return textureColorPickVS;
    }

    this.GetTextureColorPickProgram = function () {
        if (!textureColorPickProgram) { textureColorPickProgram = createShaderProgram(tf.webgl.TextureColorPickProgram); }
        return textureColorPickProgram;
    }

    this.GetContext = function () { return context; }
    this.GetCanvas = function () { return canvas; }

    this.RequestAnimFrame = function () { return requestAnimFrame(); }
    this.CancelAnimFrame = function () { return cancelAnimFrame(); }

    function isDeleted() { return context == undefined; }

    function onDelete() {
        if (!isDeleted()) {
            if (!!lostListener) { lostListener.OnDelete(); }
            if (!!restoredListener) { restoredListener.OnDelete(); }
            if (!!programs) { for (var i in programs) { programs[i].OnDelete(); } }
            if (!!onePixelTransparentTexture) { onePixelTransparentTexture.OnDelete(); }
            if (!!fourColorTexture) { fourColorTexture.OnDelete(); }
            if (!!pickCollection) { pickCollection.Empty(); }
            if (!!texture2sCollection) { texture2sCollection.Empty(); }
            if (!!buffersCollection) { buffersCollection.Empty(); }
            if (!!frameBuffersCollection) { frameBuffersCollection.Empty(); }

            pickCollection = texture2sCollection = buffersCollection = frameBuffersCollection =
                fourColorTexture = onePixelTransparentTexture = programs = lostListener = restoredListener = context = undefined;
        }
    }

    function createShaderObject(type, isProgram) {
        var shaderObject = isDeleted() ? undefined : new type(shaderSettings);
        if (shaderObject !== undefined && !isProgram) { shaders.push(shaderObject); }
        return shaderObject;
    }

    function createShaderProgram(type) {
        var shaderProgram = createShaderObject(type, true);
        if (!!shaderProgram) { programs.push(shaderProgram); }
        return shaderProgram;
    }

    function loseContext() { if (!isDeleted()) { if (!!WEBGL_lose_context) { WEBGL_lose_context.loseContext(); } } }
    function restoreContext() { if (!isDeleted()) { if (!!WEBGL_lose_context) { WEBGL_lose_context.restoreContext(); } } }

    function getOnePixelTransparentCanvas() {
        if (!isDeleted()) {
            if (!onePixelTransparentCanvas) {
                onePixelTransparentCanvas = document.createElement('canvas');
                onePixelTransparentCanvas.width = onePixelTransparentCanvas.height = 1;
                var ctx = onePixelTransparentCanvas.getContext('2d');
                ctx.beginPath(); ctx.clearRect(-1, -1, 2, 2); ctx.closePath();
            }
        }
        return onePixelTransparentCanvas;
    }

    function getOnePixelTransparentTexture() {
        if (!isDeleted()) {
            if (!onePixelTransparentTexture) {
                onePixelTransparentTexture = new tf.webgl.Texture2({ context: theThis, img: getOnePixelTransparentCanvas(), flipVerticalBool: false });
            }
        }
        return onePixelTransparentTexture;
    }

    function createFourColorTexture() {
        var texture;

        if (!isDeleted()) {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            canvas.width = canvas.height = 2;
            ctx.beginPath();
            ctx.fillStyle = "#f00"; ctx.fillRect(0, 0, 1, 1);
            ctx.fillStyle = "#0f0"; ctx.fillRect(1, 0, 1, 1);
            ctx.fillStyle = "#00f"; ctx.fillRect(0, 1, 1, 1);
            ctx.fillStyle = "#ff0"; ctx.fillRect(1, 1, 1, 1);
            //ctx.strokeStyle = "#000"; ctx.strokeRect(0, 0, 1, 1);
            ctx.closePath();
            texture = new tf.webgl.Texture2({ context: theThis, img: canvas, flipVerticalBool: true });
        }
        return texture;
    }

    function requestAnimFrame() {
        if (!isDeleted()) {
            cancelAnimFrame(); lastRequestID = !!webgl ? webgl.RequestAnimFrame(frameCallBack, canvas) : undefined;
        }
    }
    function cancelAnimFrame() {
        if (!isDeleted) {
            if (!!webgl && lastRequestID !== undefined) { webgl.CancelAnimFrame(lastRequestID); lastRequestID = undefined; }
        }
    }

    function onContextLost(e) {
        e.preventDefault();
        isContextLost = true;
        cancelAnimFrame();

        var onLostDevice = function (obj) { obj.OnLostDevice(); }

        frameBuffersCollection.ForEach(onLostDevice);
        buffersCollection.ForEach(onLostDevice);
        texture2sCollection.ForEach(onLostDevice);

        for (var i in shaders) { shaders[i].OnLostDevice(); }
        for (var i in programs) { programs[i].OnLostDevice(); }

        if (!!lostCallBack) { lostCallBack({ sender: theThis }); }
    }

    function onContextRestored() {

        isContextLost = false;
        initContext();

        var onRestoredDevice = function (obj) { obj.OnRestoredDevice(); }

        frameBuffersCollection.ForEach(onRestoredDevice);
        buffersCollection.ForEach(onRestoredDevice);
        texture2sCollection.ForEach(onRestoredDevice);

        for (var i in shaders) { shaders[i].OnRestoredDevice(); }
        for (var i in programs) { programs[i].OnRestoredDevice(); }
        if (!!restoredCallBack) { restoredCallBack({ sender: theThis }); }
    }

    function initContext() {
        context = canvas.getContext(webgl.GetContextName(), settings.optionalAttributes);
        isContextLost = context.isContextLost();
        WEBGL_lose_context = context.getExtension('WEBGL_lose_context');
        context.getExtension("OES_element_index_uint");
        context.getExtension('OES_standard_derivatives');
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (webgl = tf.webgl.GetWebGL()) {
            if (webgl.GetHasWebGL()) {

                shaders = [];
                programs = [];

                pickCollection = new tf.js.Collection();
                texture2sCollection = new tf.js.Collection({ type: tf.webgl.Texture2 });
                buffersCollection = new tf.js.Collection({ type: tf.webgl.ArrayBuffer });
                frameBuffersCollection = new tf.js.Collection({ type: tf.webgl.FrameBuffer });

                shaderSettings = { context: theThis, debug: true };
                frameCallBack = tf.js.GetFunctionOrNull(settings.onFrame);
                lostCallBack = tf.js.GetFunctionOrNull(settings.onLost);
                restoredCallBack = tf.js.GetFunctionOrNull(settings.onRestored);
                canvas = document.createElement('canvas');
                lostListener = new tf.events.AddDOMEventListener(canvas, 'webglcontextlost', onContextLost);
                restoredListener = new tf.events.AddDOMEventListener(canvas, 'webglcontextrestored', onContextRestored);
                initContext();
            }
            else { webgl = undefined; }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

