"use strict";

tf.webgl.MergeBuffers = function (vertexBuffers) {
    var mergedBuffer;

    //return;

    function addBuffers(newPos, newNor, newTex2, newIndices, v, posIndex, indexIndex) {
        var pos = v.GetPos(), ind = v.GetIndices();
        var nor = v.GetNor(), tex2 = v.GetTex2D();
        var nVertices = pos.GetLength(), nIndices = ind.GetLength();
        var posData = pos.GetData(), indexData = ind.GetData();
        var norData = !!nor ? nor.GetData() : undefined;

        for (var j = 0 ; j < nVertices ; ++j) {
            var destIndex = posIndex + j;
            newPos[destIndex] = posData[j];
            if (!!norData) { newNor[destIndex] = norData[j]; } else { newNor[destIndex] = 1; }
        }

        if (newTex2) {
            var nTex2 = Math.floor(nVertices * 2 / 3);
            var tex2Data = !!tex2 ? tex2.GetData() : undefined;
            for (var j = 0 ; j < nTex2 ; ++j) {
                var destIndex = posIndex + j;
                if (!!tex2Data) { newTex2[destIndex] = tex2Data[j]; } else { newTex2[destIndex] = 0; }
            }
        }

        var offIndex = posIndex / 3;

        for (var j = 0 ; j < nIndices ; ++j) {
            newIndices[indexIndex + j] = indexData[j] + offIndex;
        }
    }

    function addBuffer(v, actualBuffers, desiredContext) {
        var nVertices = 0, nIndices = 0, context = undefined;
        if (tf.js.GetIsInstanceOf(v, tf.webgl.VertexBuffer) && !v.IsDeleted()) {
            var pos = v.GetPos(), ind = v.GetIndices();
            if (!!pos && !!ind) {
                var thisContext = v.GetContext();
                var sameContext = desiredContext == undefined || desiredContext == thisContext;
                if (sameContext) {
                    context = thisContext;
                    nVertices = pos.GetLength(); nIndices = ind.GetLength(); actualBuffers.push(v);
                    if (!hasNor) { hasNor = !!v.GetNor(); }
                    if (!hasTex2) { hasTex2 = !!v.GetTex2D(); }
                }
            }
        }
        return { nVertices: nVertices, nIndices: nIndices, context: context };
    }

    if (tf.js.GetIsValidObject(vertexBuffers)) {
        var totalVertices = 0, totalIndices = 0, hasNor, hasTex2;
        var context;
        var actualBuffers = [];

        for (var i in vertexBuffers) {
            var addResult = addBuffer(vertexBuffers[i], actualBuffers, context);
            if (addResult.nVertices > 0) {
                totalVertices += addResult.nVertices;
                totalIndices += addResult.nIndices;
                context = addResult.context;
            }
        }

        if (!!actualBuffers.length) {
            var newPos = new Float32Array(totalVertices);
            var vertexCount = totalVertices / 3;
            var is8 = vertexCount < 256, is16 = vertexCount < 256 * 256, is32 = !is16;
            var newIndices = is8 ? new Uint8Array(totalIndices) : (is16 ? new Uint16Array(totalIndices) : new Uint32Array(totalIndices));
            var newNor = hasNor ? new Float32Array(totalVertices) : undefined;
            var newTex2 = hasTex2 ? new Float32Array(Math.floor(totalVertices * 2 / 3)) : undefined;
            var posIndex = 0, indexIndex = 0;

            for (var i in actualBuffers) {
                var v = actualBuffers[i];
                addBuffers(newPos, newNor, newTex2, newIndices, v, posIndex, indexIndex);
                posIndex += v.GetPos().GetLength();
                indexIndex += v.GetIndices().GetLength();
            }

            var newPosBuffer = new tf.webgl.PosBuffer({ context: context, data: newPos });
            var newIndexBuffer = new tf.webgl.IndexBuffer({ context: context, data: newIndices, is8: is8, is16: is16, is32: is32 });
            var newNorBuffer = !!newNor ? new tf.webgl.NorBuffer({ context: context, data: newNor }) : undefined;
            var newTex2Buffer = !!newTex2 ? new tf.webgl.Tex2DBuffer({ context: context, data: newTex2 }) : undefined;

            var foundLast;

            for (var i in newIndices) {
                var index = newIndices[i];
                if (index < 0 || index >= vertexCount) {
                    console.log('invalid index');
                }
                if (index == vertexCount - 1) {
                    foundLast = true;
                }
            }

            if (!foundLast) {
                console.log('no last index');
            }

            mergedBuffer = new tf.webgl.VertexBuffer({
                cullFrontFace: false,
                context: context, pos: newPosBuffer, nor: newNorBuffer, tex2d: newTex2Buffer, indices: newIndexBuffer
            });
        }
    }
    return mergedBuffer;
} 

tf.webgl.VertexBuffer = function (settings) {
    var theThis, context, ctx, pos, nor, tex2d, indices;

    this.OnLostDevice = function () {
        if (!isDeleted()) {
            if (!!pos) { pos.OnLostDevice(); }
            if (!!nor) { nor.OnLostDevice(); }
            if (!!tex2d) { tex2d.OnLostDevice(); }
            if (!!indices) { indices.OnLostDevice(); }
            ctx = undefined;
        }
    }

    this.OnRestoredDevice = function () {
        if (!isDeleted()) {
            if (!!pos) { pos.OnRestoredDevice(); }
            if (!!nor) { nor.OnRestoredDevice(); }
            if (!!tex2d) { tex2d.OnRestoredDevice(); }
            if (!!indices) { indices.OnRestoredDevice(); }
            ctx = context.GetContext();
        }
    }

    this.GetContext = function () { return context; }

    this.GetPos = function () { return pos; }
    this.GetNor = function () { return nor; }
    this.GetTex2D = function () { return tex2d; }
    this.GetIndices = function () { return indices; }

    this.BindBuffers = function (posLoc, norLoc, tex2dLoc) { return bindBuffers(posLoc, norLoc, tex2dLoc); }
    this.Draw = function (useLines) { return draw(useLines); }

    this.OnDelete = function (deleteSubBuffers) { return onDelete(deleteSubBuffers); }
    this.IsDeleted = function () { return isDeleted(); }

    function bindBuffers(posLoc, norLoc, tex2dLoc) {
        if (isOperational()) {
            if (posLoc >= 0) { if (!!pos) { pos.Bind(posLoc); } else { ctx.disableVertexAttribArray(posLoc); } }
            if (norLoc >= 0) { if (!!nor) { nor.Bind(norLoc); } else { ctx.disableVertexAttribArray(norLoc); } }
            if (tex2dLoc >= 0) {
                if (!!tex2d) { tex2d.Bind(tex2dLoc); } else {
                    ctx.disableVertexAttribArray(tex2dLoc);
                }
            }
            if (!!indices) { indices.Bind(); }
        }
    }
    function draw(useLines) { if (!isDeleted()) { indices.Draw(useLines); } }

    function isOperational() { return ctx != undefined; }
    function isDeleted() { return context == undefined; }
    function onDelete(deleteSubBuffers) {
        if (!isDeleted()) {
            if (!!deleteSubBuffers) {
                if (!!pos) { pos.OnDelete(); }
                if (!!nor) { nor.OnDelete(); }
                if (!!tex2d) { tex2d.OnDelete(); }
                if (!!indices) { indices.OnDelete(); }
            }
            pos = nor = tex2d = indices = ctx = context = undefined;
        }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (tf.js.GetIsInstanceOf(settings.context, tf.webgl.Context) && !!settings.context.GetContext() &&
            (settings.pos == undefined || tf.js.GetIsInstanceOf(settings.pos, tf.webgl.PosBuffer)) &&
            (settings.nor == undefined || tf.js.GetIsInstanceOf(settings.nor, tf.webgl.NorBuffer)) &&
            (settings.tex2d == undefined || tf.js.GetIsInstanceOf(settings.tex2d, tf.webgl.Tex2DBuffer)) &&
            (settings.indices == undefined || tf.js.GetIsInstanceOf(settings.indices, tf.webgl.IndexBuffer))) {
            context = settings.context;
            ctx = context.GetContext();
            pos = settings.pos;
            nor = settings.nor;
            tex2d = settings.tex2d;

            if (!!pos) {
                var nPos = pos.GetLength();
                if (!!nor) { if (nor.GetLength() != nPos) { tf.GetDebug().LogIfTest('inconsistent number of pos / nor'); } }
                if (!!tex2d) { if (tex2d.GetLength() * 3 / 2 != nPos) { tf.GetDebug().LogIfTest('inconsistent number of pos / tex2d'); } }
            }

            indices = settings.indices;
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.webgl.MatTex2VertCombo = function (settings) {
    var theThis, material, texture2, normalsTexture2, vertices;

    //this.GetHasTexture2 = function () { return texture2 != undefined; }

    //this.SetTexture2 = function (texture2Set) { texture2 = texture2Set; }
    //this.SetTexture2 = function (texture2Set) { texture2 = texture2Set; }

    this.Render = function (ctx, posLoc, norLoc, tex2dLoc, renderSettings, uniformLocations) {
        if (!isDeleted()) {
            if (!!material) { material.SetUniforms(ctx, uniformLocations); }
            var hasTexture = !!texture2 ? 1 : 0, hasNormalTexture = !!normalsTexture2 ? 1 : 0;
            if (hasTexture) { texture2.Bind(); }
            if (hasNormalTexture) { normalsTexture2.Bind(); }
            if (!!uniformLocations.hasTextureLoc) { ctx.uniform1i(uniformLocations.hasTextureLoc, hasTexture); }
            if (!!uniformLocations.hasNormalTextureLoc) { ctx.uniform1i(uniformLocations.hasNormalTextureLoc, hasNormalTexture); }
            for (var i in vertices) {
                var vertex = vertices[i];
                vertex.BindBuffers(posLoc, norLoc, tex2dLoc);
                vertex.Draw(renderSettings.useLines);
            }
        }
    }

    this.GetVertCount = function () { return isDeleted() ? 0 : vertices.length; }

    this.MergeBuffers = function () {
        if (!isDeleted()) {
            if (vertices.length > 1) {
                var newVertices = tf.webgl.MergeBuffers(vertices);
                if (!!newVertices) {
                    deleteAllVertices();
                    vertices = [newVertices];
                }
            }
        }
    }

    this.AddVertexBuffer = function (vertexBuffer) { return addVertexBuffer(vertexBuffer); }

    this.OnDelete = function (deleteTexture, deleteVertices) { return onDelete(deleteTexture, deleteVertices); }
    this.IsDeleted = function () { return isDeleted(); }

    function isDeleted() { return vertices == undefined; }

    function deleteAllVertices() { if (!isDeleted) { for (var i in vertices) { vertices[i].OnDelete(); } vertices = []; } }

    function onDelete(deleteTexture, deleteVertices) {
        if (!isDeleted()) {
            if (!!deleteTexture) {
                if (!!texture2) { texture2.OnDelete(); }
                if (!!normalsTexture2) { normalsTexture2.OnDelete(); }
            }
            if (!!deleteVertices) { deleteAllVertices(); }
            material = texture2 = normalsTexture2 = vertices = undefined;
        }
    }

    function addVertexBuffer(vertexBuffer) {
        if (!isDeleted()) {
            if (tf.js.GetIsInstanceOf(vertexBuffer, tf.webgl.VertexBuffer)) { vertices.push(vertexBuffer); }
            else if (tf.js.GetIsNonEmptyArray(vertexBuffer)) { for (var i in vertexBuffer) { addVertexBuffer(vertexBuffer[i]); } }
        }
    }

    function initialize() {
        if (tf.js.GetIsValidObject(settings)) {
            if (tf.js.GetIsInstanceOf(settings.material, tf.webgl.Material)) { material = settings.material; }
            if (tf.js.GetIsInstanceOf(settings.texture2, tf.webgl.Texture2)) { texture2 = settings.texture2; }
            if (tf.js.GetIsInstanceOf(settings.normalsTexture2, tf.webgl.Texture2)) { normalsTexture2 = settings.normalsTexture2; }
            vertices = [];
            addVertexBuffer(settings.vertices);
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.webgl.MatTex2VertComboList = function (settings) {
    var theThis, list;

    this.Render = function (ctx, posLoc, norLoc, tex2dLoc, renderSettings, uniformLocations) {
        if (!isDeleted()) {
            for (var i in list) {
                list[i].Render(ctx, posLoc, norLoc, tex2dLoc, renderSettings, uniformLocations);
            }
        }
    }

    this.Add = function (matTex2VertCombo) { return add(matTex2VertCombo); }
    this.GetCount = function () { return isDeleted() ? 0 : list.length; }

    this.MergeBuffers = function () { return mergeBuffers(); }

    this.OnDelete = function (deleteItems, deleteTextures, deleteVertices) { return onDelete(deleteItems, deleteTextures, deleteVertices); }
    this.IsDeleted = function () { return isDeleted(); }

    function isDeleted() { return list == undefined; }

    function onDelete(deleteItems, deleteTextures, deleteVertices) {
        if (!isDeleted()) {
            if (!!deleteItems) { for (var i in list) { list[i].OnDelete(deleteTextures, deleteVertices); } }
            list = undefined;
        }
    }

    function add(matTex2VertCombo) {
        if (!isDeleted()) {
            if (tf.js.GetIsInstanceOf(matTex2VertCombo, tf.webgl.MatTex2VertCombo)) { list.push(matTex2VertCombo); }
            else if (tf.js.GetIsNonEmptyArray(matTex2VertCombo)) { for (var i in matTex2VertCombo) { add(matTex2VertCombo[i]); } }
        }
    }

    function mergeBuffers() {
        if (!isDeleted()) {
            var nList = list.length;
            for (var i = 0 ; i < nList ; ++i) {
                list[i].MergeBuffers();
            }
        }
    }

    function initialize() {
        list = [];
        if (tf.js.GetIsValidObject(settings)) {
            add(settings.combos);
            if (!!settings.mergeBuffers) { mergeBuffers(); }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

