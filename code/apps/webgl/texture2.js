"use strict";

tf.webgl.Texture2 = function (settings) {
    var theThis, context, ctx, texture, img, flipVerticalBool, contextId, unit;

    this.GetTexture = function () { return texture; }
    this.Bind = function () { return bind(); }

    this.UpdateFromImage = function (img, flipVerticalBool) { return updateFromImage(img, flipVerticalBool); }

    this.OnLostDevice = function () { return onLostDevice(); }
    this.OnRestoredDevice = function () { return onRestoredDevice(); }

    this.OnDelete = function () { return onDelete(); }
    this.IsDeleted = function () { return isDeleted(); }

    function isDeleted() { return context == undefined; }
    function onDelete() {
        if (!isDeleted()) {
            context.UnRegisterTexture2(contextId);
            contextId = context = texture = img = undefined;
        }
    }

    function isOperational() { return !isDeleted() && texture !== undefined; }

    function onLostDevice() {
        if (!isDeleted()) {
            ctx = texture = undefined;
        }
    }

    function onRestoredDevice() {
        if (!isDeleted()) {
            ctx = context.GetContext();
            if (!!ctx) { texture = ctx.createTexture(); }
            doUpdateFromImage();
        }
    }

    function bind() {
        if (isOperational()) {
            //var ctx = context.GetContext();
            ctx.activeTexture(ctx.TEXTURE0 + unit);
            ctx.bindTexture(ctx.TEXTURE_2D, texture);
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
            //ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.REPEAT);
            //ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.REPEAT);
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
        }
    }

    function doUpdateFromImage() {
        if (isOperational() && img !== undefined) {
            //var ctx = context.GetContext();
            ctx.activeTexture(ctx.TEXTURE0 + unit);
            ctx.bindTexture(ctx.TEXTURE_2D, texture);
            ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, !!flipVerticalBool);
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
            ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, img);
            if (!!settings.mipMaps) { ctx.generateMipmap(ctx.TEXTURE_2D); }
            //ctx.generateMipmap(ctx.TEXTURE_2D);
            ctx.bindTexture(ctx.TEXTURE_2D, null);
        }
    }

    function setImg(imgSet, flipVerticalBoolSet) {
        img = tf.js.GetIsValidObject(imgSet) ? imgSet : undefined;
        flipVerticalBool = tf.js.GetBoolFromValue(flipVerticalBoolSet, true);
    }

    function updateFromImage(img, flipVerticalBool) { setImg(img, flipVerticalBool); doUpdateFromImage(); }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (tf.js.GetIsInstanceOf(settings.context, tf.webgl.Context) && !!settings.context.GetContext()) {
            context = settings.context;
            ctx = context.GetContext();
            contextId = context.RegisterTexture2(theThis);
            unit = tf.js.GetIntNumberInRange(settings.unit, 0, 1000, 0);
            if (tf.js.GetIsNonEmptyString(settings.url)) {
                setImg(context.GetOnePixelTransparentCanvas(), settings.flipVerticalBool);
                onRestoredDevice();
                new tf.dom.Img({
                    crossOrigin: true, src: settings.url,
                    onLoad: function (imgLoaded) {
                        if (imgLoaded.GetIsValid()) {
                            setImg(imgLoaded.GetImg(), flipVerticalBool);
                            onRestoredDevice();
                        }
                    }
                });
            }
            else {
                setImg(settings.img, settings.flipVerticalBool);
                onRestoredDevice();
            }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};


