"use strict";

tf.webgl.Material = function (settings) {
    var theThis;

    this.GetSettings = function () { return settings; }
    this.SetUniforms = function (ctx, uniformLocations) { return setUniforms(ctx, uniformLocations); }

    function setColor(ctx, colorLoc, color) {
        if (!!colorLoc) { ctx.uniform3f(colorLoc, color[0], color[1], color[2]); }
    }

    function setUniforms(ctx, uniformLocations) {
        if (tf.js.GetIsValidObject(uniformLocations) && !!ctx) {
            if (!!uniformLocations.opacityShininessLoc) {
                ctx.uniform4f(uniformLocations.opacityShininessLoc, settings.opacityF, settings.shininessF, 0, 0);
            }
            setColor(ctx, uniformLocations.ambientColor3Loc, settings.ambientColor3);
            setColor(ctx, uniformLocations.diffuseColor3Loc, settings.diffuseColor3);
            setColor(ctx, uniformLocations.emissiveColor3Loc, settings.emissiveColor3);
            setColor(ctx, uniformLocations.specularColor3Loc, settings.specularColor3);
        }
    }

    function getColor(fromColor, defaultColor) {
        var theColor;

        if (fromColor !== undefined) {
            if (tf.js.GetIsArrayWithMinLength(fromColor, 3)) {
                if (tf.js.GetFunctionOrNull(fromColor.slice)) { theColor = fromColor.slice(0); }
                else { theColor = [fromColor[0], fromColor[1], fromColor[2]]; }
            }
            else if (tf.js.GetIsValidObject(fromColor)) {
                fromColor[0] = tf.js.GetFloatNumberInRange(fromColor.r, 0, 1, defaultColor[0]);
                fromColor[1] = tf.js.GetFloatNumberInRange(fromColor.r, 0, 1, defaultColor[1]);
                fromColor[2] = tf.js.GetFloatNumberInRange(fromColor.r, 0, 1, defaultColor[2]);
            }
        }
        else { theColor = defaultColor; }
        return theColor;
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        settings.name = tf.js.GetNonEmptyString(settings.name, "unnamed");
        settings.opacityF = tf.js.GetFloatNumberInRange(settings.opacity, 0, 1, 1);
        settings.shininessF = tf.js.GetFloatNumberInRange(settings.shininess, 0, 1, 1);
        settings.ambientColor3 = getColor(settings.ambient, [1, 1, 1]);
        settings.diffuseColor3 = getColor(settings.diffuse, [0, 0, 0]);
        settings.emissiveColor3 = getColor(settings.emissive, [0, 0, 0]);
        settings.specularColor3 = getColor(settings.specular, [1, 1, 1]);
        settings.texFile = tf.js.GetNonEmptyString(settings.texFile);
        delete settings.opacity;
        delete settings.shininess;
        delete settings.ambient;
        delete settings.diffuse;
        delete settings.emissive;
        delete settings.specular;
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
