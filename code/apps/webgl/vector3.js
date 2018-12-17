"use strict";

tf.math.Vector3 = function (settings) {
    var theThis;

    this.length = function() { return 3; }

    this.Update = function (x, y, z) { return update(x, y, z); }
    this.GetSettings = function () { return { x: theThis[0], y: theThis[1], z: theThis[2] }; }

    this.GetAsJSArray = function () { return [x, y, z]; }
    this.GetAsFloat32Array = function () { return new Float32Array(theThis.GetAsJSArray()); }

    this.CopyFrom = function (otherVector3) {
        /*if (otherVector3 instanceof tf.math.Vector3) {*/ theThis[0] = otherVector3[0]; theThis[1] = otherVector3[1]; theThis[2] = otherVector3[2]; /*}*/
        if (!!otherVector3) { theThis[0] = otherVector3[0]; theThis[1] = otherVector3[1]; theThis[2] = otherVector3[2]; }
        return theThis;
    }

    this.CopyTo = function (otherVector3) {
        if (!!otherVector3){ otherVector3[0] = theThis[0]; otherVector3[1] = theThis[1]; otherVector3[2] = theThis[2]; }
        ///*if (otherVector3 instanceof tf.math.Vector3) {*/ otherVector3[0] = theThis[0]; otherVector3[1] = theThis[1]; otherVector3[2] = theThis[2]; /*}*/
        //return theThis;
        return otherVector3;
    }

    this.GetMagnitude = function () { return theThis[0] * theThis[0] + theThis[1] * theThis[1] + theThis[2] * theThis[2]; }
    this.GetLength = function () { return Math.sqrt(theThis.GetMagnitude()); }

    this.Normalize = function () { var mag = theThis.GetMagnitude(); if (mag != 0 && mag != 1) { theThis.MultByScalar(1 / Math.sqrt(mag)); } return theThis; }

    this.MultByScalar = function (scalar) { if (typeof scalar == 'number' && scalar != 1) { theThis[0] *= scalar; theThis[1] *= scalar; theThis[2] *= scalar; } return theThis; }
    this.MultByMatrix = function (matrix) {
        if (!!matrix){
            var x = theThis[0], y = theThis[1], z = theThis[2], m = matrix.getMatrix();
            var w = m.m44 + x * m.m14 + y * m.m24 + z * m.m34;

            theThis[0] = m.m41 + x * m.m11 + y * m.m21 + z * m.m31;
            theThis[1] = m.m42 + x * m.m12 + y * m.m22 + z * m.m32;
            theThis[2] = m.m43 + x * m.m13 + y * m.m23 + z * m.m33;

            if (w != 1 && w != 0) { w = 1 / w; theThis[0] *= w; theThis[1] *= w; theThis[2] *= w; }
        }
        return theThis;
    }

    this.MultDirectionByMatrix = function (matrix) {
        if (!!matrix) {
            var x = theThis[0], y = theThis[1], z = theThis[2], m = matrix.getMatrix();

            theThis[0] = x * m.m11 + y * m.m21 + z * m.m31;
            theThis[1] = x * m.m12 + y * m.m22 + z * m.m32;
            theThis[2] = x * m.m13 + y * m.m23 + z * m.m33;
        }
        return theThis;
    }

    this.Dot = function (otherVector3) {
        //return otherVector3 instanceof tf.math.Vector3 ? theThis[0] * otherVector3[0] + theThis[1] * otherVector3[1] + theThis[2] * otherVector3[2] : 0;
        return !!otherVector3 ? theThis[0] * otherVector3[0] + theThis[1] * otherVector3[1] + theThis[2] * otherVector3[2] : 0;
        //return theThis[0] * otherVector3[0] + theThis[1] * otherVector3[1] + theThis[2] * otherVector3[2];
    }

    this.Cross = function (otherVector3) {
        //if (otherVector3 instanceof tf.math.Vector3) {
            var x = theThis[1] * otherVector3[2] - theThis[2] * otherVector3[1];
            var y = -theThis[0] * otherVector3[2] + theThis[2] * otherVector3[0];
            theThis[2] = theThis[0] * otherVector3[1] - theThis[1] * otherVector3[0];
            theThis[0] = x; theThis[1] = y;
        //}
        return theThis;
    }

    this.CrossRight = function (otherVector3) {
        //if (otherVector3 instanceof tf.math.Vector3) {
        var x = otherVector3[1] * theThis[2] - otherVector3[2] * theThis[1];
        var y = -otherVector3[0] * theThis[2] + otherVector3[2] * theThis[0];
        theThis[2] = otherVector3[0] * theThis[1] - otherVector3[1] * theThis[0];
        theThis[0] = x; theThis[1] = y;
        //}
        return theThis;
    }

    this.Add = function (otherVector3) { if (!!otherVector3/*otherVector3 instanceof tf.math.Vector3*/) { theThis[0] += otherVector3[0]; theThis[1] += otherVector3[1]; theThis[2] += otherVector3[2]; } return theThis; }
    this.Sub = function (otherVector3) { if (!!otherVector3/*otherVector3 instanceof tf.math.Vector3*/) { theThis[0] -= otherVector3[0]; theThis[1] -= otherVector3[1]; theThis[2] -= otherVector3[2]; } return theThis; }

    function update(xSet, ySet, zSet) {
        if (tf.js.GetIsValidObject(xSet)) {
            if (tf.js.GetIsArrayWithMinLength(xSet, 3)) { zSet = xSet[2]; ySet = xSet[1], xSet = xSet[0]; }
            else { zSet = xSet.z; ySet = xSet.y; xSet = xSet.x; }
        }
        theThis[0] = tf.js.GetFloatNumber(xSet, 0);
        theThis[1] = tf.js.GetFloatNumber(ySet, 0);
        theThis[2] = tf.js.GetFloatNumber(zSet, 0);
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (!!settings.vector/*settings.vector instanceof tf.math.Vector3*/) { theThis.CopyFrom(settings.vector); }
        else { update(settings); }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

