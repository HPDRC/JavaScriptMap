"use strict";

// quadXY
//  v1------v0
//  |       |
//  |       |
//  v2------v3
tf.webgl.QuadXY = function (settings) {
    var theThis;

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);

        var z = 0;
        var vertices = new Float32Array([0.5, 0.5, z, -0.5, 0.5, z, -0.5, -0.5, z, 0.5, -0.5, z]);
        var normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
        var texCoords = new Float32Array([1, 1, 0, 1, 0, 0, 1, 0]);
        var indices = new Uint8Array([0, 1, 2, 0, 2, 3]);

        tf.webgl.VertexBuffer.call(theThis, {
            context: settings.context,
            pos: new tf.webgl.PosBuffer({ context: settings.context, data: vertices }),
            nor: new tf.webgl.NorBuffer({ context: settings.context, data: normals }),
            tex2d: new tf.webgl.Tex2DBuffer({ context: settings.context, data: texCoords }),
            indices: new tf.webgl.IndexBuffer({ context: settings.context, data: indices, is8: true })
        });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.webgl.QuadXY, tf.webgl.VertexBuffer);

// box
//    v6----- v5
//   /|      /|
//  v1------v0|
//  | |     | |
//  | |v7---|-|v4
//  |/      |/
//  v2------v3
tf.webgl.Box = function (settings) {
    var theThis;

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        var dim = 0.5;

        var vertices = new Float32Array(
            [dim, dim, dim, -dim, dim, dim, -dim, -dim, dim, dim, -dim, dim,    // v0-vdim-v2-v3 front
                dim, dim, dim, dim, -dim, dim, dim, -dim, -dim, dim, dim, -dim,    // v0-v3-v4-v5 right
                dim, dim, dim, dim, dim, -dim, -dim, dim, -dim, -dim, dim, dim,    // v0-v5-v6-vdim top
                -dim, dim, dim, -dim, dim, -dim, -dim, -dim, -dim, -dim, -dim, dim,    // vdim-v6-v7-v2 left
                -dim, -dim, -dim, dim, -dim, -dim, dim, -dim, dim, -dim, -dim, dim,    // v7-v4-v3-v2 bottom
                dim, -dim, -dim, -dim, -dim, -dim, -dim, dim, -dim, dim, dim, -dim]   // v4-v7-v6-v5 back
        );
        var normals = new Float32Array(
            [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,     // v0-v1-v2-v3 front
                1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v3-v4-v5 right
                0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,     // v0-v5-v6-v1 top
                -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,     // v1-v6-v7-v2 left
                0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,     // v7-v4-v3-v2 bottom
                0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1]    // v4-v7-v6-v5 back
            );
        var texCoords = new Float32Array(
            [1, 1, 0, 1, 0, 0, 1, 0,    // v0-v1-v2-v3 front
                0, 1, 0, 0, 1, 0, 1, 1,    // v0-v3-v4-v5 right
                1, 0, 1, 1, 0, 1, 0, 0,    // v0-v5-v6-v1 top
                1, 1, 0, 1, 0, 0, 1, 0,    // v1-v6-v7-v2 left
                0, 0, 1, 0, 1, 1, 0, 1,    // v7-v4-v3-v2 bottom
                0, 0, 1, 0, 1, 1, 0, 1]   // v4-v7-v6-v5 back
            );
        var indices = new Uint8Array(
            [0, 1, 2, 0, 2, 3,    // front
                4, 5, 6, 4, 6, 7,    // right
                8, 9, 10, 8, 10, 11,    // top
                12, 13, 14, 12, 14, 15,    // left
                16, 17, 18, 16, 18, 19,    // bottom
                20, 21, 22, 20, 22, 23]   // back
            );

        tf.webgl.VertexBuffer.call(theThis, {
            context: settings.context,
            pos: new tf.webgl.PosBuffer({ context: settings.context, data: vertices }),
            nor: new tf.webgl.NorBuffer({ context: settings.context, data: normals }),
            tex2d: new tf.webgl.Tex2DBuffer({ context: settings.context, data: texCoords }),
            indices: new tf.webgl.IndexBuffer({ context: settings.context, data: indices, is8: true })
        });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.webgl.Box, tf.webgl.VertexBuffer);

tf.webgl.Sphere = function (settings) {
    var theThis;

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        var radius, lats, longs;
        radius = tf.js.GetFloatNumberInRange(settings.radius, 0.00001, 9999999, 0.5);
        lats = tf.js.GetIntNumberInRange(settings.nVer, 3, 100, 10);
        longs = tf.js.GetIntNumberInRange(settings.nHor, 3, 100, 10);
        var geometryData = [];
        var normalData = [];
        var texCoordData = [];
        var indexData = [];

        for (var latNumber = 0; latNumber <= lats; ++latNumber) {
            for (var longNumber = 0; longNumber <= longs; ++longNumber) {
                var theta = latNumber * Math.PI / lats;
                var phi = longNumber * 2 * Math.PI / longs;
                var sinTheta = Math.sin(theta);
                var sinPhi = Math.sin(phi);
                var cosTheta = Math.cos(theta);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = 1 - (longNumber / longs);
                var v = latNumber / lats;

                normalData.push(x);
                normalData.push(y);
                normalData.push(z);
                texCoordData.push(u);
                texCoordData.push(v);
                geometryData.push(radius * x);
                geometryData.push(radius * y);
                geometryData.push(radius * z);
            }
        }

        for (var latNumber = 0; latNumber < lats; ++latNumber) {
            for (var longNumber = 0; longNumber < longs; ++longNumber) {
                var first = (latNumber * (longs + 1)) + longNumber;
                var second = first + longs + 1;
                indexData.push(first);
                indexData.push(first + 1);
                indexData.push(second);

                indexData.push(second);
                indexData.push(first + 1);
                indexData.push(second + 1);
            }
        }

        tf.webgl.VertexBuffer.call(theThis, {
            context: settings.context,
            pos: new tf.webgl.PosBuffer({ context: settings.context, data: new Float32Array(geometryData) }),
            nor: new tf.webgl.NorBuffer({ context: settings.context, data: new Float32Array(normalData) }),
            tex2d: new tf.webgl.Tex2DBuffer({ context: settings.context, data: new Float32Array(texCoordData) }),
            indices: new tf.webgl.IndexBuffer({ context: settings.context, data: new Uint16Array(indexData), is16: true })
        });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.webgl.Sphere, tf.webgl.VertexBuffer);

tf.webgl.UVPrimitiveGenerator = function (settings) {
    var primitive;
    if (tf.js.GetIsValidObject(settings) && tf.js.GetIsInstanceOf(settings.context, tf.webgl.Context) && !!settings.context.GetContext()) {
        var getUVVertexCallBack;

        if (!!(getUVVertexCallBack = tf.js.GetFunctionOrNull(settings.getUVVertex))) {
            var context = settings.context;
            var defaultNQuads = 10;

            var nHorQuads = settings.nHor !== undefined ? tf.js.GetIntNumberInRange(settings.nHor, 1, 99999, defaultNQuads) : defaultNQuads;
            var nVerQuads = settings.nVer !== undefined ? tf.js.GetIntNumberInRange(settings.nVer, 1, 99999, defaultNQuads) : defaultNQuads;
            var fillCW = !!settings.fillCW;

            var nVertexRows = nVerQuads + 1;
            var nVerticesPerRow = nHorQuads + 1;
            var nFacesPerRow = 2 * nHorQuads;
            var nVertices = nVertexRows * nVerticesPerRow;
            var nVertexCoords = nVertices * 3;
            var nFaces = nFacesPerRow * nVerQuads;
            var nIndices = nFaces * 3;
            var is16 = nIndices > 255;
            var pos = new Float32Array(nVertexCoords);
            var nor = new Float32Array(nVertexCoords);
            var tex2d = new Float32Array(2 * nVertices);
            var indices = is16 ? new Uint16Array(nIndices) : new Uint8Array(nIndices);
            var vertexIndex = 0, textureIndex = 0, indexIndex = 0;
            var normalVec = new tf.math.Vector3();

            for (var iVertexRow = 0 ; iVertexRow < nVertexRows ; ++iVertexRow) {
                var tex2dY = iVertexRow / nVerQuads;
                for (var iVertexCol = 0 ; iVertexCol < nVerticesPerRow ; ++iVertexCol) {
                    var tex2dX = iVertexCol / nHorQuads;
                    var vertex = getUVVertexCallBack({col: iVertexCol, row: iVertexRow, nCols: nVerticesPerRow, nRows: nVertexRows, u: tex2dX, v: tex2dY});

                    pos[vertexIndex + 0] = vertex.pos.x;
                    pos[vertexIndex + 1] = vertex.pos.y;
                    pos[vertexIndex + 2] = vertex.pos.z;

                    normalVec.Update(vertex.nor);
                    normalVec.Normalize();

                    nor[vertexIndex++] = normalVec[0];
                    nor[vertexIndex++] = normalVec[1];
                    nor[vertexIndex++] = normalVec[2];

                    //nor[vertexIndex++] = vertex.nor.x;
                    //nor[vertexIndex++] = vertex.nor.y;
                    //nor[vertexIndex++] = vertex.nor.z;

                    tex2d[textureIndex++] = tex2dX;
                    tex2d[textureIndex++] = tex2dY;
                }
            }

            for (var row = 0; row < nVerQuads; ++row) {
                for (var col = 0; col < nHorQuads; ++col) {
                    var first = (row * (nHorQuads + 1)) + col;
                    var second = first + nHorQuads + 1;

                    if (fillCW) {
                        indices[indexIndex++] = first;
                        indices[indexIndex++] = first + 1;
                        indices[indexIndex++] = second;
                        indices[indexIndex++] = second;
                        indices[indexIndex++] = first + 1;
                        indices[indexIndex++] = second + 1;
                    }
                    else {
                        indices[indexIndex++] = first;
                        indices[indexIndex++] = second;;
                        indices[indexIndex++] = first + 1
                        indices[indexIndex++] = second;
                        indices[indexIndex++] = second + 1;
                        indices[indexIndex++] = first + 1;
                    }
                }
            }

            primitive = new tf.webgl.VertexBuffer({
                context: context,
                pos: new tf.webgl.PosBuffer({ context: context, data: pos }),
                nor: new tf.webgl.NorBuffer({ context: context, data: nor }),
                tex2d: new tf.webgl.Tex2DBuffer({ context: context, data: tex2d }),
                indices: new tf.webgl.IndexBuffer({ context: context, data: indices, is16: is16 })
            });
        }
    }
    return primitive;
};

tf.webgl.UVSphere = function (settings) {
    var primitive, radius;

    function getUVVertex(settings) {
        var verticalAngle = Math.PI * settings.v;
        var horizontalAngle = Math.PI * 2 * (1 - settings.u);
        var sinHor = Math.sin(horizontalAngle), cosHor = Math.cos(horizontalAngle);
        var sinVer = Math.sin(verticalAngle), cosVer = Math.cos(verticalAngle);
        var x = cosHor * sinVer;
        var y = cosVer;
        var z = sinHor * sinVer;

        return {
            pos: { x: x * radius, y: y * radius, z: z * radius },
            nor: { x: x, y: y, z: z }
        }
    }

    if (tf.js.GetIsValidObject(settings)) {
        radius = tf.js.GetFloatNumberInRange(settings.radius, 0.000001, 9999999, 0.5);
        primitive = new tf.webgl.UVPrimitiveGenerator({
            context: settings.context,
            isClosed: false,
            nHor: settings.nHor,
            nVer: settings.nVer,
            fillCW: settings.fillCW,
            getUVVertex: getUVVertex
        });
    }
    return primitive;
};
