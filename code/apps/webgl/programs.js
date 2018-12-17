"use strict";

tf.webgl.EncodeIntIntoColor = function (value) {
    var r = value % 256; value = value >> 8;
    var g = value % 256; value = value >> 8;
    var b = value % 256;
    var obj = [1 - r / 255, 1 - g / 255, 1 - b / 255];
    obj.rgb = { r: obj[0], g: obj[1], b: obj[2], value: value };
    return obj;
}

tf.webgl.DecodeColorIntoInt = function (color) {
    return !!color[3] ? (255 - color[0]) + 256 * (255 - color[1]) + 32768 * (255 - color[2]) : 0;
}

tf.webgl.GetTextureColorVSText = function () {
    return "uniform mat4 uModelMatrix;" + "\n" +
            "uniform mat4 uViewProjMatrix;" + "\n" +

            "attribute vec3 aPosition;" + "\n" +
            "attribute vec3 aTexCoord;" + "\n" +

            "varying vec2 vTexCoord;" + "\n" +

            "void main()" + "\n" +
            "{" + "\n" +
                "gl_Position = uViewProjMatrix * uModelMatrix * vec4(aPosition, 1.0);" + "\n" +
                "vTexCoord = aTexCoord.st;" + "\n" +
            "}";
}

tf.webgl.GetTextureColorFSText = function () {
    return "precision mediump float;" + "\n" +

        "uniform sampler2D diffuseTex;" + "\n" +

        "varying vec2 vTexCoord;" + "\n" +

        "void main()" + "\n" +
        "{" + "\n" +
            "vec4 color = texture2D(diffuseTex, vTexCoord);" + "\n" +
            "if (color.a == 0.0) discard;" + "\n" +
            "else gl_FragColor = color;" + "\n" +
            //"else gl_FragColor = vec4(color.xyz, 0.5);" + "\n" +
            //"gl_FragColor = vec4(1, 0, 0, 1);" + "\n" +
        "}";
}

tf.webgl.GetTextureColorPickVSText = function () {
    return "uniform mat4 uModelMatrix;" + "\n" +
            "uniform mat4 uViewProjMatrix;" + "\n" +

            "attribute vec3 aPosition;" + "\n" +
            "attribute vec3 aTexCoord;" + "\n" +

            "varying vec2 vTexCoord;" + "\n" +

            "void main()" + "\n" +
            "{" + "\n" +
                "gl_Position = uViewProjMatrix * uModelMatrix * vec4(aPosition, 1.0);" + "\n" +
                "vTexCoord = aTexCoord.st;" + "\n" +
            "}";
}

tf.webgl.GetTextureColorPickFSText = function () {
    return "precision mediump float;" + "\n" +

        "uniform sampler2D diffuseTex;" + "\n" +

        "varying vec2 vTexCoord;" + "\n" +
        "uniform vec3 uPickColor;" + "\n" +

        "void main()" + "\n" +
        "{" + "\n" +
            "vec4 color = texture2D(diffuseTex, vTexCoord);" + "\n" +
            "if (color.a == 0.0) discard;" + "\n" +
            "else gl_FragColor = vec4(uPickColor, 1);" + "\n" +
        "}";
}

tf.webgl.TextureColorVS = function (settings) {
    var theThis;

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        tf.webgl.Shader.call(theThis, {
            debug: settings.debug,
            context: settings.context,
            type: 'v',
            text: tf.webgl.GetTextureColorVSText()
    });
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.webgl.TextureColorVS, tf.webgl.Shader);

tf.webgl.TextureColorFS = function (settings) {
    var theThis;

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        tf.webgl.Shader.call(theThis, {
            debug: settings.debug,
            context: settings.context,
            type: 'f',
            text: tf.webgl.GetTextureColorFSText()
        });
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.webgl.TextureColorFS, tf.webgl.Shader);

tf.webgl.TextureColorProgram = function (settings) {

    var theThis;

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (tf.js.GetIsInstanceOf(settings.context, tf.webgl.Context) && !!settings.context.GetContext()) {
            var context = settings.context;
            var posLoc, tex2dLoc;
            var diffuseTexLoc, uModelMatrixLoc, uViewProjMatrixLoc;
            tf.webgl.Program.call(theThis, {
                debug: settings.debug,
                context: context,
                vshader: context.GetTextureColorVS(),
                fshader: context.GetTextureColorFS(),
                init: function (ctx) {
                    posLoc = theThis.GetAttribLocation("aPosition");
                    tex2dLoc = theThis.GetAttribLocation("aTexCoord");
                    diffuseTexLoc = theThis.GetUniformLocation("diffuseTex");

                    uModelMatrixLoc = theThis.GetUniformLocation("uModelMatrix");
                    uViewProjMatrixLoc = theThis.GetUniformLocation("uViewProjMatrix");
                },
                render: function (renderSettings) {
                    var ctx = context.GetContext();
                    var scene = renderSettings.scene;

                    if (renderSettings.isNewProgram) {
                        if (!!diffuseTexLoc) { ctx.uniform1i(diffuseTexLoc, 0); }
                        ctx.uniformMatrix4fv(uViewProjMatrixLoc, false, scene.GetViewProj().GetInStaticFloat32Array());
                        //ctx.activeTexture(ctx.TEXTURE0 + 1);
                        //ctx.bindTexture(ctx.TEXTURE_2D, null);
                    }

                    ctx.uniformMatrix4fv(uModelMatrixLoc, false, renderSettings.objectToSceneMatrix.GetInStaticFloat32Array());

                    renderSettings.attributes.BindBuffers(posLoc, undefined, tex2dLoc);
                    renderSettings.texture.Bind();
                    renderSettings.attributes.Draw(renderSettings.useLines);
                }
            });
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.webgl.TextureColorProgram, tf.webgl.Program);

tf.webgl.TextureColorPickVS = function (settings) {
    var theThis;

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        tf.webgl.Shader.call(theThis, {
            debug: settings.debug,
            context: settings.context,
            type: 'v',
            text: tf.webgl.GetTextureColorPickVSText()
        });
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.webgl.TextureColorPickVS, tf.webgl.Shader);

tf.webgl.TextureColorPickFS = function (settings) {
    var theThis;

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        tf.webgl.Shader.call(theThis, {
            debug: settings.debug,
            context: settings.context,
            type: 'f',
            text: tf.webgl.GetTextureColorPickFSText()
        });
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.webgl.TextureColorPickFS, tf.webgl.Shader);

tf.webgl.TextureColorPickProgram = function (settings) {

    var theThis;

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (tf.js.GetIsInstanceOf(settings.context, tf.webgl.Context) && !!settings.context.GetContext()) {
            var context = settings.context;
            var posLoc, tex2dLoc;
            var diffuseTexLoc, uModelMatrixLoc, uViewProjMatrixLoc, uPickColorLoc;
            tf.webgl.Program.call(theThis, {
                debug: settings.debug,
                context: context,
                vshader: context.GetTextureColorPickVS(),
                fshader: context.GetTextureColorPickFS(),
                init: function (ctx) {
                    posLoc = theThis.GetAttribLocation("aPosition");
                    tex2dLoc = theThis.GetAttribLocation("aTexCoord");
                    diffuseTexLoc = theThis.GetUniformLocation("diffuseTex");

                    uModelMatrixLoc = theThis.GetUniformLocation("uModelMatrix");
                    uViewProjMatrixLoc = theThis.GetUniformLocation("uViewProjMatrix");
                    uPickColorLoc = theThis.GetUniformLocation("uPickColor");
                },
                render: function (renderSettings) {
                    var ctx = context.GetContext();
                    var scene = renderSettings.scene;

                    if (renderSettings.isNewProgram) {
                        if (!!diffuseTexLoc) { ctx.uniform1i(diffuseTexLoc, 0); }
                        ctx.uniformMatrix4fv(uViewProjMatrixLoc, false, scene.GetViewProj().GetInStaticFloat32Array());
                        //ctx.activeTexture(ctx.TEXTURE0 + 1);
                        //ctx.bindTexture(ctx.TEXTURE_2D, null);
                    }

                    if (!!uPickColorLoc) { var pc = renderSettings.pickColor; ctx.uniform3f(uPickColorLoc, pc[0], pc[1], pc[2]); }

                    ctx.uniformMatrix4fv(uModelMatrixLoc, false, renderSettings.objectToSceneMatrix.GetInStaticFloat32Array());

                    renderSettings.attributes.BindBuffers(posLoc, undefined, tex2dLoc);
                    renderSettings.texture.Bind();
                    renderSettings.attributes.Draw(renderSettings.useLines);
                }
            });
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.webgl.TextureColorPickProgram, tf.webgl.Program);

tf.webgl.MaterialVS = function (settings) {
    var theThis;

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        tf.webgl.Shader.call(theThis, {
            debug: settings.debug,
            context: settings.context,
            type: 'v',
            text: tf.webgl.GetMaterialVSText()
        });
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.webgl.MaterialVS, tf.webgl.Shader);

tf.webgl.MaterialFS = function (settings) {
    var theThis;

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        tf.webgl.Shader.call(theThis, {
            debug: settings.debug,
            context: settings.context,
            type: 'f',
            text: tf.webgl.GetMaterialFSText()
        });
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.webgl.MaterialFS, tf.webgl.Shader);

tf.webgl.MaterialProgram = function (settings) {

    var theThis;

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (tf.js.GetIsInstanceOf(settings.context, tf.webgl.Context) && !!settings.context.GetContext()) {
            var context = settings.context;
            var posLoc, norLoc, tex2dLoc, normalMatrix, modelViewMatrix, lightDirVec, hasTextureLoc, hasNormalTextureLoc;
            var uModelMatrixLoc, uNormalMatrixLoc, uViewProjMatrixLoc, uProjMatrixLoc, uModelViewMatrixLoc, uNormalViewMatrixLoc;
            var ambientLightLoc, cameraPosLoc, lightDirLoc, lightColorLoc, uniformLocations, diffuseTexLoc, normalTexLoc;
            tf.webgl.Program.call(theThis, {
                debug: settings.debug,
                context: context,
                vshader: context.GetMaterialVS(),
                fshader: context.GetMaterialFS(),
                init: function (ctx) {

                    posLoc = theThis.GetAttribLocation("aPosition");
                    norLoc = theThis.GetAttribLocation("aNormal");
                    tex2dLoc = theThis.GetAttribLocation("aTexCoord");

                    cameraPosLoc = theThis.GetUniformLocation("uCameraPos");
                    lightDirLoc = theThis.GetUniformLocation("uLightDir");
                    lightColorLoc = theThis.GetUniformLocation("uLightColor");
                    ambientLightLoc = theThis.GetUniformLocation("uAmbientLight");

                    hasTextureLoc = theThis.GetUniformLocation("hasTexture");
                    hasNormalTextureLoc = theThis.GetUniformLocation("hasNormalTexture");

                    diffuseTexLoc = theThis.GetUniformLocation("diffuseTex");
                    normalTexLoc = theThis.GetUniformLocation("normalTex");

                    uniformLocations = {
                        hasTextureLoc: hasTextureLoc,
                        hasNormalTextureLoc: hasNormalTextureLoc,
                        ambientColor3Loc: theThis.GetUniformLocation("uAmbientColor"),
                        diffuseColor3Loc: theThis.GetUniformLocation("uDiffuseColor"),
                        emissiveColor3Loc: theThis.GetUniformLocation("uEmissiveColor"),
                        specularColor3Loc: theThis.GetUniformLocation("uSpecularColor"),
                        opacityShininessLoc: theThis.GetUniformLocation("uOpacityShininess")
                    };

                    uModelMatrixLoc = theThis.GetUniformLocation("uModelMatrix");
                    uNormalMatrixLoc = theThis.GetUniformLocation("uNormalMatrix");
                    uViewProjMatrixLoc = theThis.GetUniformLocation("uViewProjMatrix");
                    uProjMatrixLoc = theThis.GetUniformLocation("uProjMatrix");
                    uModelViewMatrixLoc = theThis.GetUniformLocation("uModelViewMatrix");
                    uNormalViewMatrixLoc = theThis.GetUniformLocation("uNormalViewMatrix");

                    normalMatrix = new tf.math.Matrix4({ noInit: true });
                    modelViewMatrix = new tf.math.Matrix4({ noInit: true });
                    lightDirVec = new tf.math.Vector3();
                },
                render: function (renderSettings) {
                    var ctx = context.GetContext();
                    var scene = renderSettings.scene;
                    var viewMatrix = scene.GetView();

                    if (renderSettings.isNewProgram) {
                        if (!!ambientLightLoc) {
                            var ambientLight = scene.GetAmbientColor();
                            ctx.uniform3f(ambientLightLoc, ambientLight[0], ambientLight[1], ambientLight[2]);
                        }
                        if (!!cameraPosLoc) {
                            var cameraPos = viewMatrix.GetView().vFrom;
                            ctx.uniform3f(cameraPosLoc, cameraPos[0], cameraPos[1], cameraPos[2]);
                        }
                        if (!!lightDirLoc) {
                            lightDirVec.CopyFrom(scene.GetLightDir());
                            lightDirVec.MultDirectionByMatrix(viewMatrix);
                            lightDirVec.Normalize();
                            ctx.uniform3f(lightDirLoc, lightDirVec[0], lightDirVec[1], lightDirVec[2]);
                        }
                        if (!!lightColorLoc) {
                            var lightColor = scene.GetLightColor();
                            ctx.uniform3f(lightColorLoc, lightColor[0], lightColor[1], lightColor[2]);
                        }
                        if (!!uViewProjMatrixLoc) {
                            ctx.uniformMatrix4fv(uViewProjMatrixLoc, false, scene.GetViewProj().GetInStaticFloat32Array());
                        }
                        if (!!uProjMatrixLoc) {
                            ctx.uniformMatrix4fv(uProjMatrixLoc, false, scene.GetPerspective().GetInStaticFloat32Array());
                        }
                        if (!!diffuseTexLoc) { ctx.uniform1i(diffuseTexLoc, 0); }
                        if (!!normalTexLoc) { ctx.uniform1i(normalTexLoc, 1); }
                        var tTex = context.GetOnePixelTransparentTexture().GetTexture();
                        ctx.activeTexture(ctx.TEXTURE0 + 0);
                        ctx.bindTexture(ctx.TEXTURE_2D, tTex);
                        ctx.activeTexture(ctx.TEXTURE0 + 1);
                        ctx.bindTexture(ctx.TEXTURE_2D, tTex);
                    }

                    if (!!uModelMatrixLoc) {
                        ctx.uniformMatrix4fv(uModelMatrixLoc, false, renderSettings.objectToSceneMatrix.GetInStaticFloat32Array());
                    }

                    if (!!uModelViewMatrixLoc) {
                        modelViewMatrix.CopyFrom(viewMatrix);
                        modelViewMatrix.MultByMatrix(renderSettings.objectToSceneMatrix);
                        ctx.uniformMatrix4fv(uModelViewMatrixLoc, false, modelViewMatrix.GetInStaticFloat32Array());

                        if (!!uNormalViewMatrixLoc) {
                            normalMatrix.CopyFrom(modelViewMatrix);
                            if (!!renderSettings.usesNonUniformScaling) { normalMatrix.ToInverse(); normalMatrix.ToTransposed(); }
                            ctx.uniformMatrix4fv(uNormalViewMatrixLoc, false, normalMatrix.GetInStaticFloat32Array());
                        }
                    }

                    if (!!uNormalMatrixLoc) {
                        normalMatrix.CopyFrom(renderSettings.objectToSceneMatrix);
                        if (!!renderSettings.usesNonUniformScaling) { normalMatrix.ToInverse(); normalMatrix.ToTransposed(); }
                        ctx.uniformMatrix4fv(uNormalMatrixLoc, false, normalMatrix.GetInStaticFloat32Array());
                    }

                    if (tf.js.GetIsInstanceOf(renderSettings.material, tf.webgl.Material)) { renderSettings.material.SetUniforms(ctx, uniformLocations); }

                    var isComboList = tf.js.GetIsInstanceOf(renderSettings.comboList, tf.webgl.MatTex2VertComboList);

                    if (isComboList) { renderSettings.comboList.Render(ctx, posLoc, norLoc, tex2dLoc, renderSettings, uniformLocations); }
                    else if (tf.js.GetIsInstanceOf(renderSettings.attributes, tf.webgl.VertexBuffer)) {
                        if (!!hasTextureLoc) { var hasTexture = !!texture; ctx.uniform1i(hasTextureLoc, hasTexture ? 1 : 0); }
                        renderSettings.attributes.BindBuffers(posLoc, norLoc, tex2dLoc);
                        renderSettings.attributes.Draw(renderSettings.useLines);
                    }
                }
            });
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.webgl.MaterialProgram, tf.webgl.Program);

tf.webgl.GetMaterialVSText = function () {
    return "uniform mat4 uProjMatrix;" + "\n" +
            "uniform mat4 uNormalViewMatrix;" + "\n" +
            "uniform mat4 uModelViewMatrix;" + "\n" +

            "uniform bool hasTexture;" + "\n" +

            "attribute vec3 aPosition;" + "\n" +
            "attribute vec3 aNormal;" + "\n" +
            "attribute vec2 aTexCoord;" + "\n" +

            "varying vec4 vPosition;" + "\n" +
            "varying vec4 vNormal;" + "\n" +
            "varying vec2 vTexCoord;" + "\n" +

            "void main()" + "\n" +
            "{" + "\n" +
                "vPosition = uModelViewMatrix * vec4(aPosition, 1.0);" + "\n" +
                "vNormal = uNormalViewMatrix * normalize(vec4(aNormal, 0.0));" + "\n" +
                "if(hasTexture != false) { vTexCoord = aTexCoord.st; }" + "\n" +
                "gl_Position = uProjMatrix * vPosition;" + "\n" +
            "}";
}

tf.webgl.GetMaterialFSText = function () {
    return "#extension GL_OES_standard_derivatives : enable" + "\n" +

        "precision mediump float;" + "\n" +

        "uniform bool hasTexture;" + "\n" +
        "uniform bool hasNormalTexture;" + "\n" +

        "uniform sampler2D diffuseTex;" + "\n" +
        "uniform sampler2D normalTex;" + "\n" +

        "uniform vec3 uLightDir;" + "\n" +
        "uniform vec3 uLightColor;" + "\n" +

        "uniform vec3 uAmbientLight;" + "\n" +

        "uniform vec3 uAmbientColor;" + "\n" +
        "uniform vec3 uDiffuseColor;" + "\n" +
        "uniform vec3 uEmissiveColor;" + "\n" +
        "uniform vec3 uSpecularColor;" + "\n" +

        "uniform vec4 uOpacityShininess;" + "\n" +

        "varying vec4 vPosition;" + "\n" +
        "varying vec4 vNormal;" + "\n" +
        "varying vec2 vTexCoord;" + "\n" +

        "void main() {" + "\n" +
            "vec3 N = normalize(vNormal.xyz);" + "\n" +
            "vec3 V = -normalize(vPosition.xyz);" + "\n" +
            "vec4 color;" + "\n" +
            "vec3 textureColor;" + "\n" +
            "color = texture2D(diffuseTex, vTexCoord);" + "\n" +
            "if(hasTexture) { textureColor = color.xyz; color.xyz *= uAmbientLight; /*color.a *= uOpacityShininess.x;*/ }" + "\n" +
            "else { color = vec4(uEmissiveColor + uAmbientColor * uAmbientLight, uOpacityShininess.x); }" + "\n" +
            //"if(hasTexture != false) { color = vec4(0.0,0.0,1.0,1.0); }" + "\n" + "else { color = vec4(1.0,0.0,0.0,1.0); }" + "\n" +
            "if (color.a == 0.0) discard;" + "\n" +
            "else {" + "\n" +
                "float dnl = dot(N, uLightDir);" + "\n" +
                "if (dnl > 0.0) {" + "\n" +
                    "if(hasTexture) { color.xyz += uLightColor * textureColor * dnl; } else { color.xyz += uLightColor * uDiffuseColor * dnl; }" + "\n" +
                    //"color.xyz += uLightColor * uDiffuseColor * dnl;" + "\n" +
                    "vec3 R = reflect(-uLightDir, N);" + "\n" +
                    "float specular = pow(max(dot(R, V), 0.0), uOpacityShininess.y);" + "\n" +
                    "color.xyz += uSpecularColor * uLightColor * specular;" + "\n" +
                "}" + "\n" +
                "gl_FragColor = color;" + "\n" +
                //"if(hasNormalTexture) { gl_FragColor = texture2D(normalTex, vTexCoord); }" + "\n" +
            "}" + "\n" +
        "}"
}

/*tf.webgl.GetMaterialFSText = function () {
    return "#extension GL_OES_standard_derivatives : enable" + "\n" +

        "precision mediump float;" + "\n" +

        "uniform bool hasTexture;" + "\n" +
        "uniform bool hasNormalTexture;" + "\n" +

        "uniform sampler2D diffuseTex;" + "\n" +
        "uniform sampler2D normalTex;" + "\n" +

        "uniform vec3 uLightDir;" + "\n" +
        "uniform vec3 uLightColor;" + "\n" +

        "uniform vec3 uAmbientLight;" + "\n" +

        "uniform vec3 uAmbientColor;" + "\n" +
        "uniform vec3 uDiffuseColor;" + "\n" +
        "uniform vec3 uEmissiveColor;" + "\n" +
        "uniform vec3 uSpecularColor;" + "\n" +

        "uniform vec4 uOpacityShininess;" + "\n" +

        "varying vec4 vPosition;" + "\n" +
        "varying vec4 vNormal;" + "\n" +
        "varying vec2 vTexCoord;" + "\n" +

        "mat3 getLocalMat(vec3 N, vec3 p, vec2 uv) {" + "\n" +
            "vec3 dp1 = dFdx(p);" + "\n" +
            "vec3 dp2 = dFdy(p);" + "\n" +
            "vec2 duv1 = dFdx(uv);" + "\n" +
            "vec2 duv2 = dFdy(uv);" + "\n" +
            "vec3 dp2perp = cross(dp2, N);" + "\n" +
            "vec3 dp1perp = cross(N, dp1);" + "\n" +
            "vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;" + "\n" +
            "vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;" + "\n" +
            "float invmax = inversesqrt(max(dot(T,T), dot(B,B)));" + "\n" +
            "return mat3(T * invmax, B * invmax, N);" + "\n" +
        "}" + "\n" +
        "vec3 mapNormal(vec3 vMap, vec3 N, vec3 V, vec2 texcoord) {" + "\n" +
            //"vec3 vMap = texture2D(normalTex, texcoord).xyz;" + "\n" +
            "vMap = vMap * 255./127. - 128./127.;" + "\n" +
            "mat3 localMat = getLocalMat(N, -V, texcoord);" + "\n" +
            "return normalize(localMat * vMap);" + "\n" +
        "}" + "\n" +

        "void main() {" + "\n" +
            "vec3 N = normalize(vNormal.xyz);" + "\n" +
            "vec3 V = -normalize(vPosition.xyz);" + "\n" +
            "vec4 color;" + "\n" +
            "vec3 textureColor;" + "\n" +
            "vec3 vMap = texture2D(normalTex, vTexCoord).xyz;" + "\n" +
            "if(hasNormalTexture) { N = mapNormal(vMap, N, V, vTexCoord); }" + "\n" +
            "color = texture2D(diffuseTex, vTexCoord);" + "\n" +
            "if(hasTexture) { textureColor = color.xyz; color.xyz *= uAmbientLight; }" + "\n" +
            "else { color = vec4(uEmissiveColor + uAmbientColor * uAmbientLight, uOpacityShininess.x); }" + "\n" +
            //"if(hasTexture != false) { color = vec4(0.0,0.0,1.0,1.0); }" + "\n" + "else { color = vec4(1.0,0.0,0.0,1.0); }" + "\n" +
            "if (color.a == 0.0) discard;" + "\n" +
            "else {" + "\n" +
                "float dnl = dot(N, uLightDir);" + "\n" +
                "if (dnl > 0.0) {" + "\n" +
                    "if(hasTexture) { color.xyz += uLightColor * textureColor * dnl; } else { color.xyz += uLightColor * uDiffuseColor * dnl; }" + "\n" +
                    //"color.xyz += uLightColor * uDiffuseColor * dnl;" + "\n" +
                    "vec3 R = reflect(-uLightDir, N);" + "\n" +
                    "float specular = pow(max(dot(R, V), 0.0), uOpacityShininess.y);" + "\n" +
                    "color.xyz += uSpecularColor * uLightColor * specular;" + "\n" +
                "}" + "\n" +
                "gl_FragColor = color;" + "\n" +
                //"if(hasNormalTexture) { gl_FragColor = texture2D(normalTex, vTexCoord); }" + "\n" +
            "}" + "\n" +
        "}"
};*/


/*
"mat3 getLocalMat(vec3 N, vec3 p, vec2 uv) {" + "\n" +
    "vec3 dp1 = dFdx(p);" + "\n" +
    "vec3 dp2 = dFdy(p);" + "\n" +
    "vec2 duv1 = dFdx(uv);" + "\n" +
    "vec2 duv2 = dFdy(uv);" + "\n" +
    "vec3 dp2perp = cross(dp2, N);" + "\n" +
    "vec3 dp1perp = cross(N, dp1);" + "\n" +
    "vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;" + "\n" +
    "vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;" + "\n" +
    "float invmax = inversesqrt(max(dot(T,T), dot(B,B)));" + "\n" +
    "return mat3(T * invmax, B * invmax, N);" + "\n" +
"}" + "\n" +
"vec3 mapNormal(vec3 N, vec3 V, vec2 texcoord) {" + "\n" +
    "vec3 vMap = texture2D(normalTex, texcoord).xyz;" + "\n" +
    "vMap = vMap * 255./127. - 128./127.;" + "\n" +
    "mat3 localMat = getLocalMat(N, -V, texcoord);" + "\n" +
    "return normalize(localMat * vMap);" + "\n" +
"}" + "\n" +
*/
