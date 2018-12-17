"use strict";

tf.webgl.Shader = function (settings) {
    var theThis, context, shader, shaderType;

    this.OnLostDevice = function () { return onLostDevice(); }
    this.OnRestoredDevice = function () { return onRestoredDevice(); }

    this.GetShader = function () { return shader; }
    this.GetShaderType = function () { return shaderType; }
    this.IsDeleted = function () { return isDeleted(); }
    this.OnDelete = function () { return onDelete(); }

    function isOperational() { return !isDeleted() && shader !== undefined; }
    function isDeleted() { return context == undefined; }
    function onDelete() {
        if (!isDeleted()) {
            if (!!context && !!shader) {
                var ctx = context.GetContext();
                if (!!ctx) { ctx.deleteShader(shader); }
            }
            shaderType = context = shader = undefined;
        }
    }

    function onLostDevice() { if (!isDeleted()) { shader = undefined; } }

    function onRestoredDevice() {
        if (!isDeleted()) {
            var ctx = context.GetContext();
            if (!!ctx) {
                var shaderText = tf.js.GetNonEmptyString(settings.text);

                if (!!shaderText) {
                    shaderType = tf.js.GetNonEmptyString(settings.type);
                    var glShaderType;

                    if (shaderType !== undefined) {
                        switch (shaderType = shaderType.toLowerCase()[0]) {
                            case 'f': glShaderType = ctx.FRAGMENT_SHADER; break;
                            case 'v': glShaderType = ctx.VERTEX_SHADER; break;
                            default: shaderType = undefined; break;
                        }
                    }

                    if (glShaderType !== undefined) {
                        shader = ctx.createShader(glShaderType);
                        ctx.shaderSource(shader, shaderText);
                        ctx.compileShader(shader);

                        var compiled = ctx.getShaderParameter(shader, ctx.COMPILE_STATUS);

                        if (!compiled && !ctx.isContextLost()) {
                            if (!!settings.debug) {
                                var error = ctx.getShaderInfoLog(shader);
                                tf.GetDebug().LogIfTest("*** Error compiling shader: " + error);
                            }
                            onDelete();
                        }
                    }
                }
            }
        }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);

        if (tf.js.GetIsInstanceOf(settings.context, tf.webgl.Context) && !!settings.context.GetContext()) {
            context = settings.context;
            onRestoredDevice();
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.webgl.Program = function (settings) {

    var theThis, program, context, ctx, keyes, vshader, fshader, renderCallBack;

    this.GetProgram = function () { return program; }

    this.OnLostDevice = function () { return onLostDevice(); }
    this.OnRestoredDevice = function () { return onRestoredDevice(); }

    this.Render = function (renderSettings) { return render(renderSettings); }

    this.GetUniformLocation = function (name) { return getUniformLocation (name); }
    this.GetAttribLocation = function (name) { return getAttribLocation (name); }

    function render(renderSettings) {
        if (isOperational() && tf.js.GetIsValidObject(renderSettings)) {
            /*if (tf.js.GetIsInstanceOf(renderSettings.attributes, tf.webgl.VertexBuffer) &&
                tf.js.GetIsInstanceOf(renderSettings.texture, tf.webgl.Texture2) &&
                tf.js.GetIsInstanceOf(renderSettings.objectToSceneMatrix, tf.math.Matrix4) &&
                tf.js.GetIsInstanceOf(renderSettings.scene, tf.webgl.Scene)) {*/
            if (renderSettings.isNewProgram = (renderSettings.scene.GetLastProgram() != theThis)) {
                ctx.useProgram(program);
                renderSettings.scene.SetLastProgram(theThis);
            }
            //else { console.log('.'); }
            renderCallBack(renderSettings);
            //}
        }
    }

    this.OnDelete = function () { return onDelete(); }
    this.IsDeleted = function () { return isDeleted(); }
    this.IsOperational = function () { return isOperational(); }

    function getUniformLocation(name) { return !isOperational() || !tf.js.GetIsNonEmptyString(name) ? undefined : ctx.getUniformLocation(program, name); }
    function getAttribLocation(name) { return !isOperational() || !tf.js.GetIsNonEmptyString(name) ? undefined : ctx.getAttribLocation(program, name); }

    function isOperational() { return !isDeleted() && program !== undefined; }

    function isDeleted() { return context == undefined; }
    function onDelete() {
        if (!isDeleted()) {
            if (!!program && !!ctx) { ctx.deleteProgram(program); }
            context = ctx = program = vshader = fshader = undefined;
        }
    }

    function onLostDevice() { if (!isDeleted()) { ctx = undefined; program = undefined; } }

    function onRestoredDevice() {
        if (!isDeleted()) {
            ctx = context.GetContext();
            program = ctx.createProgram();
            ctx.attachShader(program, vshader.GetShader());
            ctx.attachShader(program, fshader.GetShader());
            ctx.linkProgram(program);
            var linked = ctx.getProgramParameter(program, ctx.LINK_STATUS);
            if (!linked && !ctx.isContextLost()) {
                if (!!settings.debug) {
                    var error = ctx.getProgramInfoLog(program);
                    tf.GetDebug().LogIfTest("Error in program linking: " + error);
                }
                onDelete();
            }
            else {
                if (tf.js.GetFunctionOrNull(settings.init)) { settings.init(ctx); }
            }
        }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);

        if (tf.js.GetIsInstanceOf(settings.context, tf.webgl.Context) && !!settings.context.GetContext() &&
            tf.js.GetIsInstanceOf(settings.vshader, tf.webgl.Shader) && settings.vshader.GetShaderType() == 'v' &&
            tf.js.GetIsInstanceOf(settings.fshader, tf.webgl.Shader) && settings.fshader.GetShaderType() == 'f' &&
            !!(renderCallBack = tf.js.GetFunctionOrNull(settings.render))){
            context = settings.context;
            vshader = settings.vshader;
            fshader = settings.fshader;
            onRestoredDevice();
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

