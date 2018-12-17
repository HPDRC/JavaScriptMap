"use strict";

tf.webgl.CreateMaterialFrom3DSMeshMaterial = function (meshMaterial) {
    var name, opacity, shininess, ambient, diffuse, emissive, specular, texFile, normalsFile;

    if (tf.js.GetIsValidObject(meshMaterial) && tf.js.GetIsNonEmptyArray(meshMaterial.properties)) {
        var props = meshMaterial.properties;
        for (var i in props) {
            var prop = props[i];
            var key = prop.key;

            if (tf.js.GetIsStringWithMinLength(key, 2)) {
                switch (key.substr(1).toLowerCase()) {
                    case "mat.name": name = prop.value; break;
                    case "mat.opacity": opacity = prop.value; break;
                    case "mat.shininess": shininess = prop.value / 100; break;
                    case "mat.shadingm": break;
                    case "mat.shinpercent": break;
                    case "mat.bumpscaling": break;
                    case "clr.ambient": ambient = prop.value; break;
                    case "clr.diffuse": diffuse = prop.value; break;
                    case "clr.emissive": emissive = prop.value; break;
                    case "clr.specular": specular = prop.value; break;
                    case "tex.mapmodeu": break;
                    case "tex.mapmodev": break;
                    case "tex.uvtrafo": break;
                    case "tex.file": case "tex.file.diffuse": texFile = prop.value; break;
                    case "tex.file.normals": normalsFile = prop.value; break;
                    case "tex.blend": break;
                }
            }
        }
    }

    return new tf.webgl.Material({
        name: name, opacity: opacity, shininess: shininess, ambient: ambient, diffuse: diffuse, emissive: emissive, specular: specular,
        texFile: texFile, normalsFile: normalsFile
    });
}

tf.webgl.CreateVertexBufferFrom3DSMesh = function (context, mesh, scale) {
    var vertexBuffer, maxs, mins;

    if (tf.js.GetIsInstanceOf(context, tf.webgl.Context) && !!context.GetContext() &&
        tf.js.GetIsValidObject(mesh)) {

        var pos;

        scale = scale !== undefined ? tf.js.GetFloatNumber(scale) : 1;
        if (scale == 0) { scale = 1 }

        var nVertices, maxVertexIndex;

        if (mesh.vertices != undefined) {
            var verts = mesh.vertices;

            nVertices = verts.length;
            maxVertexIndex = Math.floor(nVertices / 3);

            if (maxVertexIndex > 0) {
                maxs = [verts[0] * scale, verts[1] * scale, verts[2] * scale];
                mins = [maxs[0], maxs[1], maxs[2]];
                for (var index = 0, i = 0 ; i < maxVertexIndex ; ++i) {
                    for (var j = 0 ; j < 3 ; ++j, ++index) {
                        var val = verts[index] * scale;
                        if (val < mins[j]) { mins[j] = val; } else if (val > maxs[j]) { maxs[j] = val; }
                        verts[index] = val;
                    }
                }
            }

            pos = new tf.webgl.PosBuffer({ context: context, data: new Float32Array(mesh.vertices) })
        }
        else {
            maxVertexIndex = nVertices = 0;
        }

        var nor = mesh.normals != undefined ? new tf.webgl.NorBuffer({ context: context, data: new Float32Array(mesh.normals) }) : undefined;

        var tex2d, tex2dData;

        if (mesh.texturecoords == undefined) {
            //tex2dData = new Float32Array(maxVertexIndex * 2);
        }
        else {
            tex2dData = new Float32Array(mesh.texturecoords[0]);
        }

        var tex2d = tex2dData !== undefined ? new tf.webgl.Tex2DBuffer({ context: context, data: tex2dData }) : undefined;

        //tex2d = undefined;

        var indices;

        if (mesh.faces != undefined) {
            var faces = mesh.faces;
            var nFaces = faces.length;
            var nIndices = nFaces * 3;
            var is8 = maxVertexIndex < 256, is16 = maxVertexIndex < 256 * 256, is32 = !is16;
            var indexData = is8 ? new Uint8Array(nIndices) : (is16 ? new Uint16Array(nIndices) : new Uint32Array(nIndices));

            for (var j = 0, k = 0 ; j < nFaces ; ++j) { for (var l = 0 ; l < 3 ; ++l) { indexData[k++] = faces[j][l]; } }
            indices = new tf.webgl.IndexBuffer({ context: context, data: indexData, is8: is8, is16: is16, is32: is32 });
        }

        vertexBuffer = new tf.webgl.VertexBuffer({
            cullFrontFace: false,
            context: context, pos: pos, nor: nor, tex2d: tex2d, indices: indices
        });
    }
    return { vertexBuffer: vertexBuffer, maxs: maxs, mins: mins };
}

tf.webgl.Load3DSModel2 = function (context, object, scale, mergeBuffers) {

    var comboList, combos, namedMeshes, mins, maxs;

    function createVertexBuffers(node) {
        if (tf.js.GetIsValidObject(node)) {
            if (tf.js.GetIsNonEmptyArray(node.meshes)) {
                var nMeshes = node.meshes.length;

                for (var i = 0 ; i < nMeshes ; ++i) {
                    var meshIndex = node.meshes[i];
                    if (meshIndex == "$$$DUMMY") {
                        console.log('here');
                    }
                    var mesh = namedMeshes[meshIndex];
                    if (tf.js.GetIsValidObject(mesh)) {
                        var meshMaterialIndex = mesh.materialindex;

                        if (meshMaterialIndex >= 0 && meshMaterialIndex < combos.length) {
                            var results = tf.webgl.CreateVertexBufferFrom3DSMesh(context, mesh, scale);

                            if (!!results && !!results.vertexBuffer) {
                                if (mins == undefined) { mins = results.mins.slice(0); maxs = results.maxs.slice(0); }
                                else {
                                    for (var minMaxIndex = 0; minMaxIndex < 3 ; ++minMaxIndex) {
                                        if (mins[minMaxIndex] > results.mins[minMaxIndex]) { mins[minMaxIndex] = results.mins[minMaxIndex]; }
                                        if (maxs[minMaxIndex] < results.maxs[minMaxIndex]) { maxs[minMaxIndex] = results.maxs[minMaxIndex]; }
                                    }
                                }
                                combos[meshMaterialIndex].AddVertexBuffer(results.vertexBuffer);
                            }
                        }
                    }
                }
            }
            for (var i in node.children) { createVertexBuffers(node.children[i]); }
        }
    }

    if (tf.js.GetIsInstanceOf(context, tf.webgl.Context) && !!context.GetContext() &&
        tf.js.GetIsValidObject(object) && tf.js.GetIsValidObject(object.rootnode) &&
        tf.js.GetIsNonEmptyArray(object.materials) &&
        tf.js.GetIsNonEmptyArray(object.meshes)) {

        combos = [];
        namedMeshes = {};
        scale = tf.js.GetFloatNumber(scale, 1.0);

        for (var i in object.materials) {
            var mat3ds = object.materials[i];
            var mat = tf.webgl.CreateMaterialFrom3DSMeshMaterial(mat3ds);
            var matSettings = mat.GetSettings();
            var texFile = matSettings.texFile;
            var texture2 = tf.js.GetIsNonEmptyString(texFile) ? new tf.webgl.Texture2({ context: context, url: texFile }) : undefined;
            var normalsFile = matSettings.normalsFile;
            var normalsTexture2 = tf.js.GetIsNonEmptyString(normalsFile) ? new tf.webgl.Texture2({ context: context, url: normalsFile, unit: 1 }) : undefined;
            var combo = new tf.webgl.MatTex2VertCombo({ material: mat, texture2: texture2, normalsTexture2: normalsTexture2, vertices: undefined });
            combos.push(combo);
        }

        for (var i in object.meshes) { var mesh = object.meshes[i]; namedMeshes[mesh.name] = mesh; }

        createVertexBuffers(object.rootnode);

        comboList = new tf.webgl.MatTex2VertComboList({ combos: combos, mergeBuffers: mergeBuffers });

        //sceneObject = new tf.webgl.SceneObject({ context: context, program: context.GetMaterialProgram(), comboList: comboList, attributes: undefined, texture: undefined, matrix: undefined });
    }

    return { comboList: comboList, mins: mins, maxs: maxs };
};

tf.webgl.Load3DSModel = function (context, object, scale, mergeBuffers) {

    var comboList, combos, mins, maxs;

    if (tf.js.GetIsInstanceOf(context, tf.webgl.Context) && !!context.GetContext() &&
        tf.js.GetIsValidObject(object) && tf.js.GetIsValidObject(object.rootnode) &&
        tf.js.GetIsNonEmptyArray(object.materials) &&
        tf.js.GetIsNonEmptyArray(object.meshes)) {

        combos = [];
        scale = tf.js.GetFloatNumber(scale, 1.0);

        for (var i in object.materials) {
            var mat3ds = object.materials[i];
            var mat = tf.webgl.CreateMaterialFrom3DSMeshMaterial(mat3ds);
            var matSettings = mat.GetSettings();
            var texFile = matSettings.texFile;
            var texture2 = tf.js.GetIsNonEmptyString(texFile) ? new tf.webgl.Texture2({ context: context, url: texFile }) : undefined;
            var normalsFile = matSettings.normalsFile;
            var normalsTexture2 = tf.js.GetIsNonEmptyString(normalsFile) ? new tf.webgl.Texture2({ context: context, url: normalsFile, unit: 1 }) : undefined;
            var combo = new tf.webgl.MatTex2VertCombo({ material: mat, texture2: texture2, normalsTexture2: normalsTexture2, vertices: undefined });
            combos.push(combo);
        }

        for (var i in object.meshes) {
            var mesh = object.meshes[i];

            if (tf.js.GetIsValidObject(mesh)) {
                var meshMaterialIndex = mesh.materialindex;

                if (meshMaterialIndex >= 0 && meshMaterialIndex < combos.length) {
                    var results = tf.webgl.CreateVertexBufferFrom3DSMesh(context, mesh, scale);

                    if (!!results && !!results.vertexBuffer) {
                        if (mins == undefined) { mins = results.mins.slice(0); maxs = results.maxs.slice(0); }
                        else {
                            for (var minMaxIndex = 0; minMaxIndex < 3 ; ++minMaxIndex) {
                                if (mins[minMaxIndex] > results.mins[minMaxIndex]) { mins[minMaxIndex] = results.mins[minMaxIndex]; }
                                if (maxs[minMaxIndex] < results.maxs[minMaxIndex]) { maxs[minMaxIndex] = results.maxs[minMaxIndex]; }
                            }
                        }
                        combos[meshMaterialIndex].AddVertexBuffer(results.vertexBuffer);
                    }
                }
            }
        }

        comboList = new tf.webgl.MatTex2VertComboList({ combos: combos, mergeBuffers: mergeBuffers });

        //sceneObject = new tf.webgl.SceneObject({ context: context, program: context.GetMaterialProgram(), comboList: comboList, attributes: undefined, texture: undefined, matrix: undefined });
    }

    return { comboList: comboList, mins: mins, maxs: maxs };
};


/*
tf.webgl.Load3DSModel2 = function (context, object, scale) {
    function buildSceneObjectNode(root, node) {
        var sceneObject;
        if (tf.js.GetIsValidObject(node)) {

            //var transformMatrix = new tf.math.Matrix4({ matrix: node.transformation })
            sceneObject = new tf.webgl.SceneObject({ context: context, attributes: undefined, texture: undefined, program: undefined });

            if (tf.js.GetIsNonEmptyArray(node.meshes)) {
                var nMeshes = node.meshes.length;
                //var program = context.GetTextureColorProgram();
                var program = context.GetMaterialProgram();
                var texture = context.GetFourColorTexture();

                for (var i = 0 ; i < nMeshes ; ++i) {
                    var meshIndex = node.meshes[i];
                    var mesh = root.namedMeshes[meshIndex];
                    if (!!mesh) {
                        var attributes = tf.webgl.CreateVertexBufferFrom3DSMesh(context, mesh, scale).vertexBuffer;
                        var material;
                        var meshMaterial = root.materials[mesh.materialindex];

                        if (!!meshMaterial) { material = tf.webgl.CreateMaterialFrom3DSMeshMaterial(meshMaterial); }

                        var meshObject = new tf.webgl.SceneObject({
                            material: material,
                            context: context, attributes: attributes, texture: texture, program: program
                        });
                        sceneObject.AddSubObject(meshObject);
                    }
                }
            }

            if (tf.js.GetIsNonEmptyArray(node.children)) {
                for (var i in node.children) {
                    var subObj = buildSceneObjectNode(root, node.children[i]);
                    if (!!subObj) { sceneObject.AddSubObject(subObj); }
                }
            }
        }
        return sceneObject;
    }

    var sceneObject;

    if (tf.js.GetIsInstanceOf(context, tf.webgl.Context) && !!context.GetContext() &&
        tf.js.GetIsValidObject(object) && tf.js.GetIsValidObject(object.rootnode)) {
        scale = tf.js.GetFloatNumber(scale, 1.0);
        object.namedMeshes = {};
        for (var i in object.meshes) {
            var mesh = object.meshes[i];
            var meshName = mesh.name;
            object.namedMeshes[meshName] = mesh;
        }
        sceneObject = buildSceneObjectNode(object, object.rootnode)
    }

    return sceneObject;
};

tf.webgl.Check3DSModel = function (object) {

    function dumpNode(level, node) {
        if (tf.js.GetIsValidObject(node)) {
            var logStr = 'level: ' + level + ' node: ' + node.name + ' ';
            if (tf.js.GetIsValidObject(node.meshes)) {
                if (!tf.js.GetIsArrayWithLength(node.meshes, 1)) {
                    console.log(logStr + node.meshes.length + ' meshes');
                }
            }
            else {
                console.log(logStr + 'no meshes');
            }
            if (tf.js.GetIsNonEmptyArray(node.children)) {
                for (var i in node.children) {
                    dumpNode(level + 1, node.children[i]);
                }
            }
        }
    }

    function checkMeshes(object) {
        var nWithTexture = 0, nWithNormals = 0;
        console.log('nMeshes: ' + object.meshes.length);
        var allMaxs, allMins;
        for (var i in object.meshes) {
            var mesh = object.meshes[i];
            var meshName = mesh.name;
            var primitiveTypes = mesh.primitivetypes;
            if (i != meshName) {
                if (object.namedMeshes[meshName] == undefined) {
                    console.log('mesh: ' + meshName + ' name differs from index and is not found');
                }
            }
            if (primitiveTypes != 4) {
                console.log('mesh: ' + meshName + ' primitiveTypes is not 4: ' + primitiveTypes);
            }
            if (!!mesh.texturecoords) { ++nWithTexture; }
            if (!!mesh.normals) { ++nWithNormals; }

            var vertices = mesh.vertices;

            if (tf.js.GetIsArrayWithMinLength(vertices, 1)) {
                var nVertices = vertices.length;
                var maxs = [vertices[0], vertices[1], vertices[2]];
                var mins = [vertices[0], vertices[1], vertices[2]];

                for (var j = 3 ; j < nVertices ; j += 3) {
                    for (var k = 0 ; k < 3 ; ++k) {
                        var thisCoord = vertices[j + k];
                        if (thisCoord > maxs[k]) { maxs[k] = thisCoord; }
                        if (thisCoord < mins[k]) { mins[k] = thisCoord; }
                    }
                }
                //console.log('mesh: ' + meshName + ' maxs: ' + maxs + ' mins: ' + mins);

                if (allMaxs == undefined) {
                    allMaxs = maxs.slice(0);
                    allMins = mins.slice(0);
                }
                else {
                    for (var j = 0 ; j < 3 ; ++j) {
                        var thisMax = maxs[j], thisMin = mins[j];
                        if (thisMax > allMaxs[j]) { allMaxs[j] = thisMax; }
                        if (thisMin < allMins[j]) { allMins[j] = thisMin; }
                    }
                }

                var faces = mesh.faces;

                if (tf.js.GetIsArrayWithMinLength(faces, 1)) {
                    for (var j in faces) {
                        var face = faces[j];
                        for (var k in face) {
                            var vertexIndex = face[k];
                            if (vertexIndex < 0 || vertexIndex >= nVertices) {
                                console.log('mesh: ' + meshName + ' face: ' + j + ' index: ' + k + ' is invalid: ' + vertexIndex + ' out of ' + nVertices);
                            }
                        }
                    }
                }
                else {
                    console.log('mesh: ' + meshName + ' has no faces');
                }
            }
            else {
                console.log('mesh: ' + meshName + ' has no vertices');
            }
        }
        console.log('meshes with texture: ' + nWithTexture + ' meshes with normals: ' + nWithNormals);
        if (!!allMaxs) { console.log('meshes allMaxs: ' + allMaxs + ' allMins: ' + allMins); }
    }

    function checkMaterials(object) {
        var materialFields = {};
        for (var i in object.materials) {
            var material = object.materials[i];
            for (var j in material.properties) {
                var prop = material.properties[j];
                var index = prop.index;
                var semantic = prop.semantic;
                var key = prop.key;
                if (index != 0) {
                    console.log('index mat/obj: ' + i + ' / ' + j + ' index: ' + index);
                }
                if (semantic != 0 && semantic != 1 && semantic != 5 && semantic != 7) {
                    console.log('semantic mat/obj: ' + i + ' / ' + j + ' semantic: ' + semantic);
                }
                if (materialFields[key] == undefined) {
                    materialFields[key] = {};
                }
                if (materialFields[key][typeof prop.value] == undefined) {
                    materialFields[key][typeof prop.value] = [];
                }
                materialFields[key][typeof prop.value].push(prop.value);
                switch (key) {
                    case "?mat.name":
                    case "$mat.opacity":
                    case "$mat.shininess":
                    case "$mat.shadingm":
                    case "$mat.shinpercent":
                    case "$mat.bumpscaling":
                    case "$clr.ambient":
                    case "$clr.diffuse":
                    case "$clr.emissive":
                    case "$clr.specular": break;
                    case "$tex.mapmodeu":
                    case "$tex.mapmodev":
                    case "$tex.uvtrafo":
                    case "$tex.file":
                    case "$tex.blend":
                        console.log(key + ' ' + prop.value);
                        break;
                    default:
                        console.log('new material key: ' + key);
                        break;
                }
            }
        }
        //console.log(materialFields);
    }

    if (tf.js.GetIsValidObject(object) && tf.js.GetIsValidObject(object.rootnode)) {
        object.namedMeshes = {};
        for (var i in object.meshes) {
            var mesh = object.meshes[i];
            var meshName = mesh.name;
            object.namedMeshes[meshName] = mesh;
        }
        dumpNode(0, object.rootnode);
        checkMeshes(object);
        checkMaterials(object);
    }
};
*/
