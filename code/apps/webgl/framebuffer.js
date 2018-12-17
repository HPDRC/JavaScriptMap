"use strict";

tf.webgl.FrameBuffer = function (settings) {
    var theThis, context, frameBuffer, texture, renderBuffer, contextId;

    this.OnLostDevice = function () { return onLostDevice(); }
    this.OnRestoredDevice = function () { return onRestoredDevice(); }

    this.GetFrameBuffer = function () { return frameBuffer; }
    this.GetTexture = function () { return texture; }

    //this.Bind = function () { return bind(); }

    this.OnDelete = function () { return onDelete(); }
    this.IsDeleted = function () { return isDeleted(); }

    function isOperational() { return !isDeleted() && frameBuffer !== undefined; }
    function isDeleted() { return context == undefined; }
    function onDelete() {
        if (!isDeleted()) {
            context.UnRegisterFrameBuffer(contextId);
            if (!!texture) { texture.OnDelete(); }
            contextId = context = undefined;
        }
    }

    function onLostDevice() { if (!isDeleted()) { frameBuffer = undefined; texture.OnDelete(); texture = undefined; } }

    function onRestoredDevice() {
        if (!isDeleted()) {
            var ctx = context.GetContext();
            frameBuffer = ctx.createFramebuffer();
            ctx.bindFramebuffer(ctx.FRAMEBUFFER, frameBuffer);

            frameBuffer.width = typeof settings.width == 'number' ? settings.width : 512;
            frameBuffer.height = typeof settings.height == 'number' ? settings.height : 512;

            //texture = ctx.createTexture();
            texture = new tf.webgl.Texture2({ context: context });

            var tex = texture.GetTexture();

            //ctx.activeTexture(ctx.TEXTURE0);
            ctx.bindTexture(ctx.TEXTURE_2D, tex);
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR_MIPMAP_NEAREST);
            //ctx.generateMipmap(ctx.TEXTURE_2D);

            ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, frameBuffer.width, frameBuffer.height, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, null);

            renderBuffer = ctx.createRenderbuffer();
            ctx.bindRenderbuffer(ctx.RENDERBUFFER, renderBuffer);
            ctx.renderbufferStorage(ctx.RENDERBUFFER, ctx.DEPTH_COMPONENT16, frameBuffer.width, frameBuffer.height);

            ctx.framebufferTexture2D(ctx.FRAMEBUFFER, ctx.COLOR_ATTACHMENT0, ctx.TEXTURE_2D, tex, 0);
            ctx.framebufferRenderbuffer(ctx.FRAMEBUFFER, ctx.DEPTH_ATTACHMENT, ctx.RENDERBUFFER, renderBuffer);

            ctx.bindTexture(ctx.TEXTURE_2D, null);
            ctx.bindRenderbuffer(ctx.RENDERBUFFER, null);
            ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
        }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (tf.js.GetIsInstanceOf(settings.context, tf.webgl.Context) && !!settings.context.GetContext()) {
            context = settings.context;
            contextId = context.RegisterFrameBuffer(theThis);
            onRestoredDevice();
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

