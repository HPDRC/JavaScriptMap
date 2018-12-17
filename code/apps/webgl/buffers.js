"use strict";

tf.webgl.ArrayBuffer = function (settings) {
    var theThis, context, buffer, data, length, bufferType, isIndices, count, glSize, glType, normalized, stride, offset, contextId;

    this.OnLostDevice = function () { return onLostDevice(); }
    this.OnRestoredDevice = function () { return onRestoredDevice(); }

    this.GetContext = function () { return context; }
    this.GetCtx = function () { return context ? context.GetContext() : undefined ; }
    this.GetLength = function () { return length; }
    this.GetCount = function () { return count; }
    this.GetType = function () { return bufferType; }
    this.IsIndices = function () { return isIndices; }
    this.GetBuffer = function () { return buffer; }
    this.Bind = function (toLocation) { return bind(toLocation); }
    this.Update = function (data) { return update(data); }
    this.GetData = function () { return data; }

    this.OnDelete = function () { return onDelete(); }
    this.IsDeleted = function () { return isDeleted(); }

    function isOperational() { return !isDeleted() && buffer !== undefined; }

    function isDeleted() { return context == undefined; }
    function onDelete() {
        if (!isDeleted()) {
            context.UnRegisterBuffer(contextId);
            contextId = bufferType = context = buffer = undefined;
            count = length = 0;
            isIndices = false;
        }
    }

    function deleteBuffer() {
        if (!isDeleted()) {
            if (buffer != undefined) { var ctx = context.GetContext(); if (!!ctx) { ctx.deleteBuffer(buffer); buffer = undefined; } }
        }
    }

    function onLostDevice() { deleteBuffer(); }

    function onRestoredDevice() {
        if (!isDeleted()) {
            var ctx = context.GetContext();
            buffer = ctx.createBuffer();
            update(settings.data);
        }
    }

    function bind(toLocation) {
        if (isOperational()) {
            var ctx = context.GetContext();
            if (isIndices) {
                ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, buffer);
            }
            else if (toLocation >= 0) {
                ctx.enableVertexAttribArray(toLocation);
                ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
                ctx.vertexAttribPointer(toLocation, glSize, glType, normalized, stride, offset);
            }
        }
    }

    function update(data) {
        if (isOperational()) {
            var ctx = context.GetContext();
            var dataType = isIndices ? ctx.STREAM_DRAW : ctx.STATIC_DRAW;
            ctx.bindBuffer(bufferType, buffer);
            ctx.bufferData(bufferType, data, dataType);
            ctx.bindBuffer(bufferType, null);
        }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        length = 0;
        if (tf.js.GetIsNonEmptyArray(settings.data)) {
            if (tf.js.GetIsInstanceOf(settings.context, tf.webgl.Context) && !!settings.context.GetContext()) {

                context = settings.context;
                data = settings.data;
                length = data.length;
                isIndices = !!settings.isIndices;
                glSize = settings.glSize !== undefined ? tf.js.GetIntNumberInRange(settings.glSize, 1, 999999999, 1) : 1;
                normalized = settings.normalized !== undefined ? !!settings.normalized : false;
                stride = settings.stride !== undefined ? tf.js.GetIntNumberInRange(settings.stride, 0, 999999999, 0) : 0;
                offset = settings.offset !== undefined ? tf.js.GetIntNumberInRange(settings.offset, 0, 999999999, 0) : 0;

                var ctx = context.GetContext();

                bufferType = isIndices ? ctx.ELEMENT_ARRAY_BUFFER : ctx.ARRAY_BUFFER;
                if (!isIndices) {
                    glType = settings.glType !== undefined ? settings.glType : ctx.FLOAT;
                    count = Math.floor(length / glSize);
                }
                else { count = length; }
                contextId = context.RegisterBuffer(theThis);
                onRestoredDevice();
            }
        }
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.webgl.PosBuffer = function (settings) {
    var theThis;

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (tf.js.GetIsNonEmptyArray(settings.data)) {
            settings.glSize = 3;
            if (settings.data.length % settings.glSize != 0) { tf.GetDebug().LogIfTest("tf.webgl.PosBuffer: Data length not multiple of " + settings.glSize); }
            settings.isIndices = false;
            tf.webgl.ArrayBuffer.call(theThis, settings);
        }
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.webgl.PosBuffer, tf.webgl.ArrayBuffer);

tf.webgl.NorBuffer = function (settings) {
    var theThis;

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (tf.js.GetIsNonEmptyArray(settings.data)) {
            settings.glSize = 3;
            if (settings.data.length % settings.glSize != 0) { tf.GetDebug().LogIfTest("tf.webgl.NorBuffer: Data length not multiple of " + settings.glSize); }
            settings.isIndices = false;
            tf.webgl.ArrayBuffer.call(theThis, settings);
        }
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.webgl.NorBuffer, tf.webgl.ArrayBuffer);

tf.webgl.Tex2DBuffer = function (settings) {
    var theThis;

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (tf.js.GetIsNonEmptyArray(settings.data)) {
            settings.glSize = 2;
            if (settings.data.length % settings.glSize != 0) {
                tf.GetDebug().LogIfTest("tf.webgl.Tex2DBuffer: Data length not multiple of " + settings.glSize);
            }
            settings.isIndices = false;
            tf.webgl.ArrayBuffer.call(theThis, settings);
        }
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.webgl.Tex2DBuffer, tf.webgl.ArrayBuffer);

tf.webgl.IndexBuffer = function (settings) {
    var theThis, indexType;

    this.Draw = function (useLines) {
        if (!theThis.IsDeleted()) {
            var ctx = theThis.GetCtx();
            if (!!ctx) {
                ctx.drawElements((!!useLines ? ctx.LINES : ctx.TRIANGLES), theThis.GetLength(), indexType, 0);
                //ctx.drawElements(ctx.LINES, theThis.GetLength(), indexType, 0);
            }
        }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (tf.js.GetIsNonEmptyArray(settings.data)) {
            settings.isIndices = true;
            tf.webgl.ArrayBuffer.call(theThis, settings);
            if (!theThis.IsDeleted()) {
                var ctx = theThis.GetCtx();

                if (!!settings.is8) { indexType = ctx.UNSIGNED_BYTE; }
                else if (!!settings.is16) { indexType = ctx.UNSIGNED_SHORT; }
                else if (!!settings.is32) { indexType = ctx.UNSIGNED_INT; }
                else { indexType = ctx.UNSIGNED_BYTE; }
            }
        }
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.webgl.IndexBuffer, tf.webgl.ArrayBuffer);

