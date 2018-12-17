"use strict";

tf.math.GetDeterminant2x2 = function(a, b, c, d) { return a * d - b * c; }

tf.math.GetDeterminant3x3 = function (a1, a2, a3, b1, b2, b3, c1, c2, c3) {
    return a1 * tf.math.GetDeterminant2x2(b2, b3, c2, c3) - b1 * tf.math.GetDeterminant2x2(a2, a3, c2, c3) + c1 * tf.math.GetDeterminant2x2(a2, a3, b2, b3);
}

tf.math.GetDeterminant4x4 = function (a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3, a4, b4, c4, d4) {
    return a1 * tf.math.GetDeterminant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4) - b1 * tf.math.GetDeterminant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4) +
        c1 * tf.math.GetDeterminant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4) - d1 * tf.math.GetDeterminant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
}

tf.math.GetCSSMatrixInfo = function () {
    if (tf.math.hasCSSMatrix == undefined) {
        if (tf.math.hasCSSMatrix = ("WebKitCSSMatrix" in window && ("media" in window && window.media.matchMedium("(-webkit-transform-3d)")) ||
            ("styleMedia" in window && window.styleMedia.matchMedium("(-webkit-transform-3d)")))) {
            tf.math.hasCSSMatrixCopy = "copy" in WebKitCSSMatrix.prototype;
        }
        else { tf.math.hasCSSMatrixCopy = false; }
        //tf.math.hasCSSMatrix = tf.math.hasCSSMatrixCopy = false;
        //tf.math.hasCSSMatrixCopy = false;
    }
    return { hasCSSMatrix: tf.math.hasCSSMatrix, hasCSSMatrixCopy: tf.math.hasCSSMatrixCopy };
}

tf.math.Matrix4 = function (settings) {
    var theThis, matrix;

    this.GetInStaticFloat32Array = function () {
        if (tf.math.Matrix4.staticFloat32Array  == undefined) { tf.math.Matrix4.staticFloat32Array = new Float32Array(16); }

        if (tf.math.hasCSSMatrixCopy)
            matrix.copy(tf.math.Matrix4.staticFloat32Array);
        else {
            if (tf.math.Matrix4.staticJSArray == undefined) { tf.math.Matrix4.staticJSArray = new Array(16); }
            tf.math.Matrix4.staticJSArray[0] = matrix.m11; tf.math.Matrix4.staticJSArray[1] = matrix.m12;
            tf.math.Matrix4.staticJSArray[2] = matrix.m13; tf.math.Matrix4.staticJSArray[3] = matrix.m14;
            tf.math.Matrix4.staticJSArray[4] = matrix.m21; tf.math.Matrix4.staticJSArray[5] = matrix.m22;
            tf.math.Matrix4.staticJSArray[6] = matrix.m23; tf.math.Matrix4.staticJSArray[7] = matrix.m24;
            tf.math.Matrix4.staticJSArray[8] = matrix.m31; tf.math.Matrix4.staticJSArray[9] = matrix.m32;
            tf.math.Matrix4.staticJSArray[10] = matrix.m33; tf.math.Matrix4.staticJSArray[11] = matrix.m34;
            tf.math.Matrix4.staticJSArray[12] = matrix.m41; tf.math.Matrix4.staticJSArray[13] = matrix.m42;
            tf.math.Matrix4.staticJSArray[14] = matrix.m43; tf.math.Matrix4.staticJSArray[15] = matrix.m44;

            tf.math.Matrix4.staticFloat32Array.set(tf.math.Matrix4.staticJSArray);
        }
        return tf.math.Matrix4.staticFloat32Array;
    }

    this.GetAsJSArray = function () { return getAsJSArray(); }
    this.GetAsFloat32Array = function () { return getAsFloat32Array(); }

    this.CopyTo = function (otherMatrix) { return copyTo(otherMatrix); }
    this.CopyFrom = function (otherMatrix) { return copyFrom(otherMatrix); }

    function copyFrom(otherMatrix) {
        if (otherMatrix instanceof tf.math.Matrix4) {
            var otherMat = otherMatrix.getMatrix();
            matrix.m11 = otherMat.m11; matrix.m12 = otherMat.m12; matrix.m13 = otherMat.m13; matrix.m14 = otherMat.m14;
            matrix.m21 = otherMat.m21; matrix.m22 = otherMat.m22; matrix.m23 = otherMat.m23; matrix.m24 = otherMat.m24;
            matrix.m31 = otherMat.m31; matrix.m32 = otherMat.m32; matrix.m33 = otherMat.m33; matrix.m34 = otherMat.m34;
            matrix.m41 = otherMat.m41; matrix.m42 = otherMat.m42; matrix.m43 = otherMat.m43; matrix.m44 = otherMat.m44;
        }
        else if (tf.js.GetIsArrayWithMinLength(otherMatrix, 16)) {
            var i = 0;

            /*matrix.m11 = otherMatrix[i++]; matrix.m12 = otherMatrix[i++]; matrix.m13 = otherMatrix[i++]; matrix.m14 = otherMatrix[i++];
            matrix.m21 = otherMatrix[i++]; matrix.m22 = otherMatrix[i++]; matrix.m23 = otherMatrix[i++]; matrix.m24 = otherMatrix[i++];
            matrix.m31 = otherMatrix[i++]; matrix.m32 = otherMatrix[i++]; matrix.m33 = otherMatrix[i++]; matrix.m34 = otherMatrix[i++];
            matrix.m41 = otherMatrix[i++]; matrix.m42 = otherMatrix[i++]; matrix.m43 = otherMatrix[i++]; matrix.m44 = otherMatrix[i++];*/

            matrix.m11 = otherMatrix[0]; matrix.m21 = otherMatrix[1]; matrix.m31 = otherMatrix[2]; matrix.m41 = otherMatrix[3];
            matrix.m12 = otherMatrix[4]; matrix.m22 = otherMatrix[5]; matrix.m32 = otherMatrix[6]; matrix.m42 = otherMatrix[7];
            matrix.m13 = otherMatrix[8]; matrix.m23 = otherMatrix[9]; matrix.m33 = otherMatrix[10]; matrix.m43 = otherMatrix[11];
            matrix.m14 = otherMatrix[12]; matrix.m24 = otherMatrix[13]; matrix.m34 = otherMatrix[14]; matrix.m44 = otherMatrix[15];
        }
        return theThis;
    }

    function copyTo(otherMatrix) { if (otherMatrix instanceof tf.math.Matrix4) { otherMatrix.CopyFrom(theThis); } return theThis; }

    this.ToIdentity = function () { return toIdentity(); }
    this.ToTransposed = function () { return toTransposed(); }
    this.ToInverse = function () { return toInverse(); }
    this.ToAdjoint = function () { return toAdjoint; }

    this.MultByMatrix = function (otherMatrix) { return multByMatrix(otherMatrix); }
    this.MultByScalar = function (scalar) { return multByScalar(scalar); }

    this.GetDeterminant = function () { return getDeterminant(); }

    this.getMatrix = function () { return matrix; }
    this.setMatrix = function (otherMatrix) { if (!!otherMatrix) { matrix = otherMatrix; } }

    function getAsJSArray() {
        return [matrix.m11, matrix.m12, matrix.m13, matrix.m14, matrix.m21, matrix.m22, matrix.m23, matrix.m24,
            matrix.m31, matrix.m32, matrix.m33, matrix.m34, matrix.m41, matrix.m42, matrix.m43, matrix.m44];
    }

    function getAsFloat32Array() {
        var array;
        if (tf.math.hasCSSMatrix) { array = new Float32Array(16); matrix.copy(array); }
        else { array = new Float32Array(getAsJSArray()); }
        return array;
    }

    function toIdentity() {
        matrix.m11 = 1; matrix.m12 = 0; matrix.m13 = 0; matrix.m14 = 0;
        matrix.m21 = 0; matrix.m22 = 1; matrix.m23 = 0; matrix.m24 = 0;
        matrix.m31 = 0; matrix.m32 = 0; matrix.m33 = 1; matrix.m34 = 0;
        matrix.m41 = 0; matrix.m42 = 0; matrix.m43 = 0; matrix.m44 = 1;
        return theThis;
    }

    function toTransposed () {
        var tmp = matrix.m12; matrix.m12 = matrix.m21; matrix.m21 = tmp;
        tmp = matrix.m13; matrix.m13 = matrix.m31; matrix.m31 = tmp;
        tmp = matrix.m14; matrix.m14 = matrix.m41; matrix.m41 = tmp;
        tmp = matrix.m23; matrix.m23 = matrix.m32; matrix.m32 = tmp;
        tmp = matrix.m24; matrix.m24 = matrix.m42; matrix.m42 = tmp;
        tmp = matrix.m34; matrix.m34 = matrix.m43; matrix.m43 = tmp;
        return theThis;
    }

    function toInverse() {
        if (tf.math.hasCSSMatrix) { try { matrix = matrix.inverse(); } catch (e) { } }
        else { var det = getDeterminant(); if (Math.abs(det) >= 1e-8) { toAdjoint(); multByScalar(1 / det); } }
        return theThis;
    }

    function toAdjoint() {
        var a1 = matrix.m11, b1 = matrix.m12, c1 = matrix.m13, d1 = matrix.m14;
        var a2 = matrix.m21, b2 = matrix.m22, c2 = matrix.m23, d2 = matrix.m24;
        var a3 = matrix.m31, b3 = matrix.m32, c3 = matrix.m33, d3 = matrix.m34;
        var a4 = matrix.m41, b4 = matrix.m42, c4 = matrix.m43, d4 = matrix.m44;

        matrix.m11 = tf.math.GetDeterminant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4);
        matrix.m21 = -tf.math.GetDeterminant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4);
        matrix.m31 = tf.math.GetDeterminant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4);
        matrix.m41 = -tf.math.GetDeterminant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);

        matrix.m12 = -tf.math.GetDeterminant3x3(b1, b3, b4, c1, c3, c4, d1, d3, d4);
        matrix.m22 = tf.math.GetDeterminant3x3(a1, a3, a4, c1, c3, c4, d1, d3, d4);
        matrix.m32 = -tf.math.GetDeterminant3x3(a1, a3, a4, b1, b3, b4, d1, d3, d4);
        matrix.m42 = tf.math.GetDeterminant3x3(a1, a3, a4, b1, b3, b4, c1, c3, c4);

        matrix.m13 = tf.math.GetDeterminant3x3(b1, b2, b4, c1, c2, c4, d1, d2, d4);
        matrix.m23 = -tf.math.GetDeterminant3x3(a1, a2, a4, c1, c2, c4, d1, d2, d4);
        matrix.m33 = tf.math.GetDeterminant3x3(a1, a2, a4, b1, b2, b4, d1, d2, d4);
        matrix.m43 = -tf.math.GetDeterminant3x3(a1, a2, a4, b1, b2, b4, c1, c2, c4);

        matrix.m14 = -tf.math.GetDeterminant3x3(b1, b2, b3, c1, c2, c3, d1, d2, d3);
        matrix.m24 = tf.math.GetDeterminant3x3(a1, a2, a3, c1, c2, c3, d1, d2, d3);
        matrix.m34 = -tf.math.GetDeterminant3x3(a1, a2, a3, b1, b2, b3, d1, d2, d3);
        matrix.m44 = tf.math.GetDeterminant3x3(a1, a2, a3, b1, b2, b3, c1, c2, c3);

        return theThis;
    }

    function multByScalar(scalar) {
        if (typeof scalar == 'number' && scalar != 1) {
            matrix.m11 *= scalar; matrix.m12 *= scalar; matrix.m13 *= scalar; matrix.m14 *= scalar;
            matrix.m21 *= scalar; matrix.m22 *= scalar; matrix.m23 *= scalar; matrix.m24 *= scalar;
            matrix.m31 *= scalar; matrix.m32 *= scalar; matrix.m33 *= scalar; matrix.m34 *= scalar;
            matrix.m41 *= scalar; matrix.m42 *= scalar; matrix.m43 *= scalar; matrix.m44 *= scalar;
        }
        return theThis;
    }

    function multByMatrix(otherMatrix) {
        if (otherMatrix instanceof tf.math.Matrix4) {
            var otherMat = otherMatrix.getMatrix();
            if (tf.math.hasCSSMatrix) { matrix = matrix.multiply(otherMat); }
            else {
                var m11 = otherMat.m11 * matrix.m11 + otherMat.m12 * matrix.m21 + otherMat.m13 * matrix.m31 + otherMat.m14 * matrix.m41;
                var m12 = otherMat.m11 * matrix.m12 + otherMat.m12 * matrix.m22 + otherMat.m13 * matrix.m32 + otherMat.m14 * matrix.m42;
                var m13 = otherMat.m11 * matrix.m13 + otherMat.m12 * matrix.m23 + otherMat.m13 * matrix.m33 + otherMat.m14 * matrix.m43;
                var m14 = otherMat.m11 * matrix.m14 + otherMat.m12 * matrix.m24 + otherMat.m13 * matrix.m34 + otherMat.m14 * matrix.m44;

                var m21 = otherMat.m21 * matrix.m11 + otherMat.m22 * matrix.m21 + otherMat.m23 * matrix.m31 + otherMat.m24 * matrix.m41;
                var m22 = otherMat.m21 * matrix.m12 + otherMat.m22 * matrix.m22 + otherMat.m23 * matrix.m32 + otherMat.m24 * matrix.m42;
                var m23 = otherMat.m21 * matrix.m13 + otherMat.m22 * matrix.m23 + otherMat.m23 * matrix.m33 + otherMat.m24 * matrix.m43;
                var m24 = otherMat.m21 * matrix.m14 + otherMat.m22 * matrix.m24 + otherMat.m23 * matrix.m34 + otherMat.m24 * matrix.m44;

                var m31 = otherMat.m31 * matrix.m11 + otherMat.m32 * matrix.m21 + otherMat.m33 * matrix.m31 + otherMat.m34 * matrix.m41;
                var m32 = otherMat.m31 * matrix.m12 + otherMat.m32 * matrix.m22 + otherMat.m33 * matrix.m32 + otherMat.m34 * matrix.m42;
                var m33 = otherMat.m31 * matrix.m13 + otherMat.m32 * matrix.m23 + otherMat.m33 * matrix.m33 + otherMat.m34 * matrix.m43;
                var m34 = otherMat.m31 * matrix.m14 + otherMat.m32 * matrix.m24 + otherMat.m33 * matrix.m34 + otherMat.m34 * matrix.m44;

                var m41 = otherMat.m41 * matrix.m11 + otherMat.m42 * matrix.m21 + otherMat.m43 * matrix.m31 + otherMat.m44 * matrix.m41;
                var m42 = otherMat.m41 * matrix.m12 + otherMat.m42 * matrix.m22 + otherMat.m43 * matrix.m32 + otherMat.m44 * matrix.m42;
                var m43 = otherMat.m41 * matrix.m13 + otherMat.m42 * matrix.m23 + otherMat.m43 * matrix.m33 + otherMat.m44 * matrix.m43;
                var m44 = otherMat.m41 * matrix.m14 + otherMat.m42 * matrix.m24 + otherMat.m43 * matrix.m34 + otherMat.m44 * matrix.m44;

                matrix.m11 = m11; matrix.m12 = m12; matrix.m13 = m13; matrix.m14 = m14;
                matrix.m21 = m21; matrix.m22 = m22; matrix.m23 = m23; matrix.m24 = m24;
                matrix.m31 = m31; matrix.m32 = m32; matrix.m33 = m33; matrix.m34 = m34;
                matrix.m41 = m41; matrix.m42 = m42; matrix.m43 = m43; matrix.m44 = m44;
            }
        }
        return theThis;
    }

    function getDeterminant() {
        return tf.math.GetDeterminant4x4(
            matrix.m11, matrix.m12, matrix.m13, matrix.m14, matrix.m21, matrix.m22, matrix.m23, matrix.m24,
            matrix.m31, matrix.m32, matrix.m33, matrix.m34, matrix.m41, matrix.m42, matrix.m43, matrix.m44);
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        tf.math.GetCSSMatrixInfo();
        matrix = tf.math.hasCSSMatrix ? new WebKitCSSMatrix : {};
        if (settings.matrix instanceof tf.math.Matrix4 || tf.js.GetIsArrayWithMinLength(settings.matrix, 16)) { copyFrom(settings.matrix); }
        else if (!settings.noInit) { toIdentity(); }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.math.ScaleMatrix4 = function (settings) {
    var theThis, sx, sy, sz;

    this.SetScale = function (sx, sy, sz) { return setScale(sx, sy, sz); }
    this.GetScale = function () { return { sx: sx, sy: sy, sz: sz }; }

    function setScale(sxSet, sySet, szSet) {
        var copied;
        if (tf.js.GetIsValidObject(sxSet)) {
            if (copied = sxSet instanceof tf.math.Matrix4) { theThis.CopyFrom(sxSet); }
            else { szSet = sxSet.sz; sySet = sxSet.sy; sxSet = sxSet.sx; }
        }
        if (!copied) {
            var matrix = theThis.getMatrix();
            matrix.m11 = sx = tf.js.GetFloatNumber(sxSet, 1);
            matrix.m22 = sy = tf.js.GetFloatNumber(sySet, 1);
            matrix.m33 = sz = tf.js.GetFloatNumber(szSet, 1);
        }
        return theThis;
    }

    function initialize() {
        tf.math.Matrix4.call(theThis);
        setScale(settings = tf.js.GetValidObjectFrom(settings));
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.math.ScaleMatrix4, tf.math.Matrix4);

tf.math.RotateMatrix4 = function (settings) {
    var theThis, angle, axisx, axisy, axisz;

    this.SetRotateAngleAxis = function (angle, axisx, axisy, axisz) { return setRotateAngleAxis(angle, axisx, axisy, axisz); }
    this.GetRotate = function () { return { angle: angle, axisx: axisx, axisy: axisy, axisz: axisz }; }

    function setRotateAngleAxis(angleSet, axisxSet, axisySet, axiszSet) {
        var copied;
        if (tf.js.GetIsValidObject(angleSet)) {
            if (copied = angleSet instanceof tf.math.Matrix4) { theThis.CopyFrom(angleSet); }
            else { axiszSet = angleSet.axisz; axisySet = angleSet.axisy; axisxSet = angleSet.axisx; angleSet = angleSet.angle; }
        }
        if (!copied) {
            var matrix = theThis.getMatrix();
            theThis.ToIdentity();
            angle = tf.js.GetFloatNumber(angleSet, 0);
            axisx = tf.js.GetFloatNumber(axisxSet, 0);
            axisy = tf.js.GetFloatNumber(axisySet, 0);
            axisz = tf.js.GetFloatNumber(axiszSet, 0);
            if (angle != 0 && (axisx != 0 || axisy != 0 || axisz != 0)) {
                if (tf.math.hasCSSMatrix) {
                    theThis.setMatrix(matrix.rotateAxisAngle(axisx, axisy, axisz, angle * 180 / Math.PI));
                }
                else {
                    angle /= 2;
                    var sinA = Math.sin(angle);
                    var cosA = Math.cos(angle);
                    var sinA2 = sinA * sinA;
                    var x = axisx, y = axisy, z = axisz;

                    var len = Math.sqrt(x * x + y * y + z * z);
                    if (len == 0) { x = 0; y = 0; z = 1; } else if (len != 1) { x /= len; y /= len; z /= len; }

                    if (x == 1 && y == 0 && z == 0) {
                        matrix.m11 = 1;
                        matrix.m12 = matrix.m13 = matrix.m21 = matrix.m31 = 0;
                        matrix.m22 = 1 - 2 * sinA2;
                        matrix.m23 = 2 * sinA * cosA;
                        matrix.m32 = -2 * sinA * cosA;
                        matrix.m33 = 1 - 2 * sinA2;
                    } else if (x == 0 && y == 1 && z == 0) {
                        matrix.m11 = 1 - 2 * sinA2;
                        matrix.m12 = matrix.m21 = matrix.m23 = matrix.m32 = 0;
                        matrix.m13 = -2 * sinA * cosA;
                        matrix.m22 = 1;
                        matrix.m31 = 2 * sinA * cosA;
                        matrix.m33 = 1 - 2 * sinA2;
                    } else if (x == 0 && y == 0 && z == 1) {
                        matrix.m11 = 1 - 2 * sinA2;
                        matrix.m12 = 2 * sinA * cosA;
                        matrix.m13 = matrix.m23 = matrix.m31 = matrix.m32 = 0;
                        matrix.m21 = -2 * sinA * cosA;
                        matrix.m22 = 1 - 2 * sinA2;
                        matrix.m33 = 1;
                    } else {
                        var x2 = x * x, y2 = y * y, z2 = z * z;
                        matrix.m11 = 1 - 2 * (y2 + z2) * sinA2;
                        matrix.m12 = 2 * (x * y * sinA2 + z * sinA * cosA);
                        matrix.m13 = 2 * (x * z * sinA2 - y * sinA * cosA);
                        matrix.m21 = 2 * (y * x * sinA2 - z * sinA * cosA);
                        matrix.m22 = 1 - 2 * (z2 + x2) * sinA2;
                        matrix.m23 = 2 * (y * z * sinA2 + x * sinA * cosA);
                        matrix.m31 = 2 * (z * x * sinA2 + y * sinA * cosA);
                        matrix.m32 = 2 * (z * y * sinA2 - x * sinA * cosA);
                        matrix.m33 = 1 - 2 * (x2 + y2) * sinA2;
                    }
                    matrix.m14 = matrix.m24 = matrix.m34 = matrix.m41 = matrix.m42 = matrix.m43 = 0;
                    matrix.m44 = 1;
                }
            }
        }
        return theThis;
    }

    function initialize() {
        tf.math.Matrix4.call(theThis, { noInit: true });
        setRotateAngleAxis(settings = tf.js.GetValidObjectFrom(settings));
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.math.RotateMatrix4, tf.math.Matrix4);

tf.math.TranslateMatrix4 = function (settings) {
    var theThis, tx, ty, tz;

    this.SetTranslate = function (tx, ty, tz) { return setTranslate(tx, ty, tz); }
    this.GetTranslate = function () { return { tx: tx, ty: ty, tz: tz }; }

    function setTranslate(txSet, tySet, tzSet) {
        var copied;
        if (tf.js.GetIsValidObject(txSet)) {
            if (copied = txSet instanceof tf.math.Matrix4) { theThis.CopyFrom(txSet); }
            else { tzSet = txSet.tz; tySet = txSet.ty; txSet = txSet.tx; }
        }
        if (!copied) {
            var matrix = theThis.getMatrix();
            matrix.m41 = tx = tf.js.GetFloatNumber(txSet, 0);
            matrix.m42 = ty = tf.js.GetFloatNumber(tySet, 0);
            matrix.m43 = tz = tf.js.GetFloatNumber(tzSet, 0);
        }
        return theThis;
    }

    function initialize() {
        tf.math.Matrix4.call(theThis);
        setTranslate(settings = tf.js.GetValidObjectFrom(settings));
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.math.TranslateMatrix4, tf.math.Matrix4);

tf.math.WorldMatrix4 = function (settings) {
    var theThis, matScale, matRotate, matTranslate;

    this.UpdateWorld = function (settings) { return updateWorld(settings); }
    this.GetScale = function () { return matScale; }
    this.GetTranslate = function () { return matTranslate; }
    this.GetRotate = function () { return matRotate; }

    function updateWorld(settings) {
        var isCopy;

        if (tf.js.GetIsValidObject(settings)) {
            if (! (isCopy = tf.js.GetIsValidObject(settings.matrix))) {
                if (tf.js.GetIsValidObject(settings.scale)) {
                    if (matScale === undefined) { matScale = new tf.math.ScaleMatrix4(settings.scale); }
                    else { matScale.SetScale(settings.scale); }
                }
                if (tf.js.GetIsValidObject(settings.rotate)) {
                    if (matRotate === undefined) { matRotate = new tf.math.RotateMatrix4(settings.rotate); }
                    else { matRotate.SetRotateAngleAxis(settings.rotate); }
                }
                if (tf.js.GetIsValidObject(settings.translate)) {
                    if (matTranslate === undefined) { matTranslate = new tf.math.TranslateMatrix4(settings.translate); }
                    else { matTranslate.SetTranslate(settings.translate); }
                }
            }
        }

        if (!!isCopy) { theThis.CopyFrom(settings.matrix); }
        else {
            theThis.ToIdentity();

            if (matTranslate !== undefined) { theThis.MultByMatrix(matTranslate); }
            if (matRotate !== undefined) { theThis.MultByMatrix(matRotate); }
            if (matScale !== undefined) { theThis.MultByMatrix(matScale); }
        }

        return theThis;
    }

    function initialize() {
        tf.math.Matrix4.call(theThis, { noInit: true });
        updateWorld(tf.js.GetValidObjectFrom(settings));
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
}
tf.js.InheritFrom(tf.math.WorldMatrix4, tf.math.Matrix4);

tf.math.ViewMatrix4 = function (settings) {
    var theThis, inverse, vFrom, vTo, vUp, vUnitTo, vUnitUp, vUnitRight;

    this.GetInverse = function () { return inverse; }
    this.UpdateView = function (settings) { return updateView(settings); }
    this.GetView = function () { return { vFrom: vFrom, vTo: vTo, vUp: vUp, vUnitTo: vUnitTo, vUnitUp: vUnitUp, vUnitRight: vUnitRight}; }

    function updateView(settings) {

        settings = tf.js.GetValidObjectFrom(settings);

        vFrom = tf.js.GetIsArrayWithMinLength(settings.vFrom, 3) ? settings.vFrom : [0, 0, 1];
        vTo = settings.vTo !== undefined ? settings.vTo : [0, 0, 0];
        vUp = settings.vUp !== undefined ? settings.vUp : [0, 1, 0];

        var eyex = vFrom[0], eyey = vFrom[1], eyez = vFrom[2], atx = vTo[0], aty = vTo[1], atz = vTo[2], upx = vUp[0], upy = vUp[1], upz = vUp[2]

        var zAxisX = eyex - atx, zAxisY = eyey - aty, zAxisZ = eyez - atz;
        var mag = Math.sqrt(zAxisX * zAxisX + zAxisY * zAxisY + zAxisZ * zAxisZ);
        if (mag != 0 && mag != 1) { mag = 1 / mag; zAxisX *= mag; zAxisY *= mag; zAxisZ *= mag; }

        vUnitTo = [zAxisX, zAxisY, zAxisZ];

        var yAxisX = upx, yAxisY = upy, yAxisZ = upz;
        mag = Math.sqrt(yAxisX * yAxisX + yAxisY * yAxisY + yAxisZ * yAxisZ);
        if (mag != 0 && mag != 1) { mag = 1 / mag; yAxisX *= mag; yAxisY *= mag; yAxisZ *= mag; }

        var xAxisX = yAxisY * zAxisZ - yAxisZ * zAxisY, xAxisY = yAxisZ * zAxisX - yAxisX * zAxisZ, xAxisZ = yAxisX * zAxisY - yAxisY * zAxisX;
        mag = Math.sqrt(xAxisX * xAxisX + xAxisY * xAxisY + xAxisZ * xAxisZ);
        if (mag != 0 && mag != 1) { mag = 1 / mag; xAxisX *= mag; xAxisY *= mag; xAxisZ *= mag; }

        vUnitRight = [xAxisX, xAxisY, xAxisZ];

        yAxisX = zAxisY * xAxisZ - zAxisZ * xAxisY; yAxisY = zAxisZ * xAxisX - zAxisX * xAxisZ; yAxisZ = zAxisX * xAxisY - zAxisY * xAxisX;
        mag = Math.sqrt(yAxisX * yAxisX + yAxisY * yAxisY + yAxisZ * yAxisZ);
        if (mag != 0 && mag != 1) { mag = 1 / mag; yAxisX *= mag; yAxisY *= mag; yAxisZ *= mag; }

        vUnitUp = [yAxisX, yAxisY, yAxisZ];

        var xAxisDot = xAxisX * eyex + xAxisY * eyey + xAxisZ * eyez;
        var yAxisDot = yAxisX * eyex + yAxisY * eyey + yAxisZ * eyez;
        var zAxisDot = zAxisX * eyex + zAxisY * eyey + zAxisZ * eyez;

        var matrix = inverse.getMatrix();

        matrix.m14 = matrix.m24 = matrix.m34 = 0;
        matrix.m44 = 1;
        matrix.m11 = xAxisX; matrix.m12 = xAxisY; matrix.m13 = xAxisZ; 
        matrix.m21 = yAxisX; matrix.m22 = yAxisY; matrix.m23 = yAxisZ; 
        matrix.m31 = zAxisX; matrix.m32 = zAxisY; matrix.m33 = zAxisZ; 
        matrix.m41 = eyex; matrix.m42 = eyey; matrix.m43 = eyez; 

        theThis.CopyFrom(inverse);
        theThis.ToInverse();
        return theThis;
    }

    function initialize() {
        var noInit = { noInit: true };
        inverse = new tf.math.Matrix4(noInit);
        tf.math.Matrix4.call(theThis, noInit);
        updateView(settings);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
}
tf.js.InheritFrom(tf.math.ViewMatrix4, tf.math.Matrix4);

tf.math.FrustumMatrix4 = function (settings) {
    var theThis, left, right, bottom, top, near, far, halfWidth, halfHeight;

    this.UpdateFrustum = function (settings) { return updateFrustum(settings); }
    this.GetFrustum = function () { return { left: left, right: right, top: top, bottom: bottom, near: near, far: far, halfWidth: halfWidth, halfHeight: halfHeight }; }

    function updateFrustum(settings) {

        settings = tf.js.GetValidObjectFrom(settings);

        left = tf.js.GetFloatNumber(settings.left, -1);
        right = tf.js.GetFloatNumber(settings.right, 1);
        bottom = tf.js.GetFloatNumber(settings.bottom, -1);
        top = tf.js.GetFloatNumber(settings.top, 1);
        near = tf.js.GetFloatNumber(settings.near, 1);
        far = tf.js.GetFloatNumber(settings.far, 1000);
        var near2 = near + near;
        var W = right - left;
        var invW = W == 0 ? 1 : 1 / W;
        var H = top - bottom;
        var invH = H == 0 ? 1 : 1 / H;
        var D = near - far;
        var invD = D == 0 ? 1 : 1 / D;
        var matrix = theThis.getMatrix();

        halfWidth = W / 2;
        halfHeight = H / 2;

        matrix.m12 = matrix.m13 = matrix.m14 = matrix.m21 = matrix.m23 = matrix.m24 = matrix.m41 = matrix.m42 = matrix.m44 = 0;
        matrix.m34 = -1;
        matrix.m11 = near2 * invW;
        matrix.m22 = near2 * invH;
        matrix.m31 = (right + left) * invW;
        matrix.m32 = (top + bottom) * invH;
        matrix.m33 = (far + near) * invD;
        matrix.m43 = (far * near2) * invD;
        return theThis;
    }

    function initialize() {
        tf.math.Matrix4.call(theThis, { noInit: true });
        if (!tf.js.GetIsValidObject(settings) || !settings.noInit) { updateFrustum(settings); }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
}
tf.js.InheritFrom(tf.math.FrustumMatrix4, tf.math.Matrix4);

tf.math.PerspectiveFOVMatrix4 = function (settings) {
    var theThis, near, far, fovy, aspect, tangent;

    this.UpdatePerspective = function (settings) { return updatePerspective(settings); }
    this.UpdateAspect = function (aspect) { return updateAspect(aspect); }
    this.GetPerspective = function () { return { fovy: fovy, aspect: aspect, tangent: tangent, frustum: theThis.GetFrustum() }; }

    function updateAspect(aspectSet) {
        aspect = tf.js.GetFloatNumberInRange(aspectSet, 0.0000001, 99999999, 1);
        tangent = Math.tan(fovy / 2);
        var top = tangent * near, bottom = -top;
        var left = aspect * bottom, right = aspect * top;

        theThis.UpdateFrustum({ left: left, right: right, top: top, bottom: bottom, near: near, far: far });
        return theThis;
    }

    function updatePerspective(settings) {

        settings = tf.js.GetValidObjectFrom(settings);

        near = tf.js.GetFloatNumberInRange(settings.near, 0.0001, 9999999, 1);
        far = tf.js.GetFloatNumberInRange(settings.far, 0.0001, 9999999, 1);
        fovy = tf.js.GetFloatNumberInRange(settings.fovy, Math.PI / 64, Math.PI * 2, Math.PI / 6);
        return updateAspect(settings.aspect);
    }

    function initialize() {
        tf.math.FrustumMatrix4.call(theThis, { noInit: true });
        updatePerspective(settings);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
}
tf.js.InheritFrom(tf.math.PerspectiveFOVMatrix4, tf.math.FrustumMatrix4);

tf.math.OrthoMatrix4 = function (settings) {
    var theThis;

    this.UpdateOrtho = function (settings) { return updateOrtho(settings); }

    function updateOrtho(settings) {

        settings = tf.js.GetValidObjectFrom(settings);

        var left = tf.js.GetFloatNumber(settings.left, -1);
        var right = tf.js.GetFloatNumber(settings.right, 1);
        var bottom = tf.js.GetFloatNumber(settings.bottom, -1);
        var top = tf.js.GetFloatNumber(settings.top, 1);
        var near = tf.js.GetFloatNumber(settings.near, 1);
        var far = tf.js.GetFloatNumber(settings.far, 1000);
        var tx = (left + right) / (left - right);
        var ty = (top + bottom) / (top - bottom);
        var tz = (far + near) / (far - near);
        var matrix = theThis.getMatrix();

        matrix.m12 = matrix.m13 = matrix.m14 = matrix.m21 = matrix.m23 = matrix.m24 = matrix.m31 = matrix.m32 = matrix.m34 = 0;
        matrix.m44 = 1;
        matrix.m11 = 2 / (left - right);
        matrix.m22 = 2 / (top - bottom);
        matrix.m33 = -2 / (far - near);
        matrix.m41 = tx;
        matrix.m42 = ty;
        matrix.m43 = tz;
    }

    function initialize() {
        tf.math.Matrix4.call(theThis, { noInit: true });
        if (!tf.js.GetIsValidObject(settings) || !settings.noInit) { updateOrtho(settings); }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
}
tf.js.InheritFrom(tf.math.OrthoMatrix4, tf.math.Matrix4);

tf.math.Plane = function (settings) {
    var theThis, normal, d;

    this.Update = function (newSettings) {
        settings = tf.js.GetValidObjectFrom(newSettings);
        normal = new tf.math.Vector3({ vector: settings.normal });
        normal.Normalize();
        d = -normal.Dot(settings.point);
    }

    this.GetDistanceTo = function (point) { return d + normal.Dot(point); }

    function initialize() {
        theThis.Update(settings);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.math.ViewFrustum = function (settings) {
    var theThis, perspective, view, pNear, pFar, pLeft, pRight, pTop, pBot, planes, eyePos, X, Y, Z,
        nearCenter, farCenter, ptTemp, ptTemp2, halfWidth, halfHeight, far, near, tangent, aspect;

    this.GetSphereIsVisible = function (center, radius) {
        var result = { isVisible: true, intersects: 0 };
        if (!isDeleted()) {
            for (var i = 0 ; i < 6 ; ++i) {
                var dist = planes[i].GetDistanceTo(center);
                if (dist < -radius) { result.isVisible = false; break; } // sphere is outside of this plane
                else if (dist < radius) { ++result.intersects; } // sphere intersect's with this plane
            }
        }
        return result;
    }

    this.GetIsPointVisible = function (point) {
        if (!isDeleted()) {
            var pcz, pcx, pcy, aux;

            ptTemp.CopyFrom(point); ptTemp.Sub(eyePos);
            pcz = -ptTemp.Dot(Z); if (pcz > far || pcz < near) { return false; }
            pcy = ptTemp.Dot(Y);
            aux = pcz * tangent;
            if (pcy > aux || pcy < -aux) { return false; }
            pcx = ptTemp.Dot(X);
            aux *= aspect;
            if (pcx > aux || pcx < -aux) { return false; }
        }
        return true;
    }

    this.GetIsPointVisibleByPlanes = function (point) {
        if (!isDeleted()) {
            for (var i = 0 ; i < 6 ; ++i) { if (planes[i].GetDistanceTo(point) < 0) { return false; } }
            //if (pTop.GetDistanceTo(point) < 0) { return false; }
            //if (pBot.GetDistanceTo(point) < 0) { return false; }
            //if (pLeft.GetDistanceTo(point) < 0) { return false; }
            //if (pRight.GetDistanceTo(point) < 0) { return false; }
            //if (pNear.GetDistanceTo(point) < 0) { return false; }
            //if (pFar.GetDistanceTo(point) < 0) { return false; }
        }
        return true;
    }

    this.OnUpdate = function () { return onUpdate(); }

    this.OnDelete = function () { return onDelete(); }
    this.IsDeleted = function () { return isDeleted(); }

    function isDeleted() { return perspective == undefined; }
    function onDelete() {
        if (!isDeleted()) {
            perspective = view = pNear = pFar = pLeft = pRight = pTop = pBot = planes = undefined;
        }
    }

    function onUpdate() {
        if (!isDeleted()) {

            var perspectiveSettings = perspective.GetPerspective();
            var frustumSettings = perspectiveSettings.frustum;
            var viewSettings = view.GetView();

            tangent = perspectiveSettings.tangent;
            aspect = perspectiveSettings.aspect;

            near = frustumSettings.near;
            far = frustumSettings.far;

            eyePos.CopyFrom(viewSettings.vFrom);

            X.CopyFrom(viewSettings.vUnitRight);
            Y.CopyFrom(viewSettings.vUnitUp);
            Z.CopyFrom(viewSettings.vUnitTo);

            halfWidth = frustumSettings.halfWidth;
            halfHeight = frustumSettings.halfHeight;

            nearCenter.CopyFrom(eyePos);
            ptTemp.CopyFrom(Z);
            ptTemp.MultByScalar(-near);
            nearCenter.Add(ptTemp);

            farCenter.CopyFrom(eyePos);
            ptTemp.CopyFrom(Z);
            ptTemp.MultByScalar(-far);
            farCenter.Add(ptTemp);

            ptTemp.CopyFrom(Z);
            pFar.Update({ normal: ptTemp, point: farCenter });

            ptTemp.MultByScalar(-1);
            pNear.Update({ normal: ptTemp, point: nearCenter });

            ptTemp.CopyFrom(Y);

            ptTemp.MultByScalar(halfHeight);
            ptTemp.Add(nearCenter);

            ptTemp2.CopyFrom(ptTemp);
            ptTemp2.Sub(eyePos);
            ptTemp2.Normalize();
            ptTemp2.Cross(X);

            pTop.Update({ normal: ptTemp2, point: ptTemp });

            ptTemp.CopyFrom(Y);

            ptTemp.MultByScalar(-halfHeight);
            ptTemp.Add(nearCenter);

            ptTemp2.CopyFrom(ptTemp);
            ptTemp2.Sub(eyePos);
            ptTemp2.Normalize();
            ptTemp2.CrossRight(X);

            pBot.Update({ normal: ptTemp2, point: ptTemp });

            ptTemp.CopyFrom(X);

            ptTemp.MultByScalar(-halfWidth);
            ptTemp.Add(nearCenter);

            ptTemp2.CopyFrom(ptTemp);
            ptTemp2.Sub(eyePos);
            ptTemp2.Normalize();
            ptTemp2.Cross(Y);

            pLeft.Update({ normal: ptTemp2, point: ptTemp });

            ptTemp.CopyFrom(X);

            ptTemp.MultByScalar(halfWidth);
            ptTemp.Add(nearCenter);

            ptTemp2.CopyFrom(ptTemp);
            ptTemp2.Sub(eyePos);
            ptTemp2.Normalize();
            ptTemp2.CrossRight(Y);

            pRight.Update({ normal: ptTemp2, point: ptTemp });
        }
    };

    function initialize() {
        if (tf.js.GetIsValidObject(settings) &&
            tf.js.GetIsInstanceOf(settings.view, tf.math.ViewMatrix4) &&
            tf.js.GetIsInstanceOf(settings.perspective, tf.math.PerspectiveFOVMatrix4)) {
            view = settings.view;
            perspective = settings.perspective;
            pNear = new tf.math.Plane();
            pFar = new tf.math.Plane();
            pLeft = new tf.math.Plane();
            pRight = new tf.math.Plane();
            pTop = new tf.math.Plane();
            pBot = new tf.math.Plane();
            planes = [pTop, pBot, pLeft, pRight, pNear, pFar];
            X = new tf.math.Vector3();
            Y = new tf.math.Vector3();
            Z = new tf.math.Vector3();
            eyePos = new tf.math.Vector3();
            ptTemp = new tf.math.Vector3();
            ptTemp2 = new tf.math.Vector3();
            nearCenter = new tf.math.Vector3();
            farCenter = new tf.math.Vector3();
            onUpdate();
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

