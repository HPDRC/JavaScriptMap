"use strict";

tf.map.CanvasFeatureStyle = function (settings) {
    var theThis, canvas, ctx, baseStyle, paintCB;

    this.GetStyle = function () { return tf.js.ShallowMerge(baseStyle, { icon: true, icon_img: canvas, icon_size: paint() }); }
    this.SetBaseStyle = function (baseStyleSet) { return setBaseStyle(baseStyleSet); }

    function setBaseStyle(baseStyleSet) { baseStyle = tf.js.ShallowMerge(baseStyleSet); }
    function paint() { return paintCB({ sender: theThis, ctx: ctx }); }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        canvas = document.createElement('canvas');
        ctx = canvas.getContext("2d");
        baseStyle = {};
        setBaseStyle(settings.baseStyle);
        if (!(paintCB = tf.js.GetFunctionOrNull(settings.paint))) { paintCB = function () { return [0, 0] }; }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.map.SecondsCounterFeature = function (settings) {

    var theThis, map, layer, canvas, ctx, startTime, mapFeature, preComposeListener, totalTime, nSeconds, onEndCallBack, getPositionCallBack, baseZIndex;

    this.OnDelete = function () { return onDelete(); }
    this.GetMapFeature = function () { return mapFeature; }
    this.GetTime01 = function () { return getTime01(); }

    function getTime01() { var time01 = (Date.now() - startTime) / totalTime; return time01; }

    function getFeatureStyle() {
        var style = {};

        if (!!canvas) {
            var twoPI = Math.PI * 2, PIOver2 = Math.PI / 2;
            var dim = 44;//48;//40;//60;
            var dim2 = dim / 2;
            var strokeMin = 1.5;
            var strokeW = 2;//3;
            var time01 = getTime01();
            var angle = time01 * twoPI;
            var blueColor = "rgba(0, 0, 255, 1)";
            var seconds = (nSeconds - (nSeconds * time01));
            var nDecs = seconds < 10 ? 1 : 0;
            var secondsFixed = seconds.toFixed(nDecs) + '';
            var lineDashOffset = Math.floor(time01 * nSeconds * 10);
            var hColor = (1 - time01) * 120;
            var hslColor = "hsl(" + hColor + ", 100%, 50%)";
            var showProgress;

            if (! (showProgress = time01 <= 0.8)) {
                var decimal = Math.floor(time01 * 100) % 10;
                showProgress = (decimal % 2 == 1);
            }

            ctx.translate(0.5, 0.5);
            ctx.canvas.width = dim;
            ctx.canvas.height = dim;
            ctx.clearRect(0, 0, dim, dim);
            ctx.lineDashOffset = 0;

            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowColor = "#000";

            ctx.beginPath();
            ctx.lineWidth = strokeMin;
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.strokeStyle = blueColor;
            ctx.setLineDash([4, 2, 8, 2]);
            ctx.lineDashOffset = lineDashOffset;
            ctx.arc(dim2, dim2, dim2 - strokeW, 0, twoPI, true);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fill();
            ctx.closePath();

            if (showProgress) {
                ctx.beginPath();
                ctx.setLineDash([]);
                ctx.lineWidth = strokeW + 2 + 1;
                ctx.strokeStyle = hslColor;
                ctx.arc(dim2, dim2, dim2 - 2 * strokeW, -PIOver2 + angle, -PIOver2, true);
                ctx.stroke();
                ctx.closePath();
            }

            ctx.beginPath();
            ctx.lineWidth = strokeMin;
            ctx.setLineDash([8, 2, 1, 2]);
            ctx.lineDashOffset = -lineDashOffset * 2;
            ctx.strokeStyle = blueColor;
            ctx.arc(dim2, dim2, dim2 - 3 * strokeW, 0, twoPI, true);
            ctx.shadowBlur = 4;
            /*ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            ctx.fill();*/
            ctx.stroke();
            ctx.closePath();

            ctx.shadowColor = "#bebebe";

            var fontStr = "bold " + (Math.floor(dim2) - strokeW * 3) + "px Arial";

            ctx.shadowBlur = 0;
            ctx.font = fontStr;
            ctx.textAlign = "center";
            ctx.textBaseline = 'middle';
            ctx.fillStyle = hslColor;
            ctx.setLineDash([]);
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.strokeText(secondsFixed, dim2, dim2);
            ctx.fillText(secondsFixed, dim2, dim2);

            var zIndex = time01 < 0.33 ? 1 : time01 < 0.67 ? 2 : 3;

            style = { zindex: zIndex + baseZIndex, icon: true, icon_img: canvas, icon_size: [dim, dim] };

            if (!!mapFeature) {
                if (mapFeature.GetIsInHover() && showProgress) {
                    var strokeWFrame = 3;
                    ctx.beginPath();
                    ctx.lineWidth = strokeWFrame;
                    ctx.setLineDash([9, 3]);
                    ctx.strokeStyle = "#c00";
                    ctx.strokeRect(strokeWFrame / 2, strokeWFrame / 2, dim - strokeWFrame / 2 - 2, dim - strokeWFrame / 2 - 2);
                    ctx.closePath();
                }
                if (!!getPositionCallBack) {
                    var newPos = getPositionCallBack({ time01: time01, sender: theThis });
                    if (newPos !== undefined) { mapFeature.SetPointCoords(newPos); }
                }
            }
        }
        return style;
    }

    function onDelete() {
        if (!!canvas) {
            if (preComposeListener) { preComposeListener.OnDelete(); preComposeListener = null; }
            canvas = null;
            ctx = null;
            if (!!layer && !!mapFeature) { layer.DelMapFeature(mapFeature); layer = null; }
            if (!!onEndCallBack) { onEndCallBack(theThis); }
            mapFeature = null;
        }
    }

    function onPreCompose (notification) {
        if (getTime01() <= 1) { if (!!mapFeature) { mapFeature.RefreshStyle(); } notification.continueAnimation(); } else { onDelete(); }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (!!(map = tf.js.GetMapFrom(settings.map))) {
            layer = settings.layer;
            canvas = document.createElement('canvas');
            ctx = canvas.getContext("2d");
            baseZIndex = settings.baseZIndex !== undefined ? settings.baseZIndex : 1;
            nSeconds = Math.round(tf.js.GetFloatNumberInRange(settings.nSeconds, 1, 100000, 5));
            totalTime = 1000 * nSeconds;
            onEndCallBack = tf.js.GetFunctionOrNull(settings.onEnd);
            getPositionCallBack = tf.js.GetFunctionOrNull(settings.getPosition);
            startTime = Date.now();
            preComposeListener = map.AddListener(tf.consts.mapPreComposeEvent, onPreCompose);
            mapFeature = new tf.map.Feature({ type: "point", coordinates: settings.center, style: getFeatureStyle });
            mapFeature.secondsCounter = theThis;
            if (!!layer) { layer.AddMapFeature(mapFeature); }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.map.AtlasAnimationFeature = function (settings) {

    var theThis, map, layer, startTime, mapFeature, preComposeListener, timeFromStart, totalTime, frameSettings, scale, nLoop, lastNLoop, onLoopCallBack,
        opacityCallBack, opacity, scaleCallBack, rotationCallBack, iconStyle, getPositionCallBack, baseZIndex;

    this.OnDelete = function () { return onDelete(); }

    this.GetMapFeature = function () { return mapFeature; }

    this.SetScale = function (scale) { return setScale(scale); }

    this.GetTime01 = function () { return getTime01(); }
    this.GetTimeFromStart = function () { return timeFromStart; }
    this.GetNLoop = function () { return nLoop; }

    this.GetSettings = function () { return settings; }

    function onDelete() {
        if (!!mapFeature) {
            if (preComposeListener) { preComposeListener.OnDelete(); preComposeListener = null; }
            if (!!layer && !!mapFeature) { layer.DelMapFeature(mapFeature); layer = null; }
            mapFeature = null;
        }
    }

    function getTime01() {
        timeFromStart = Date.now() - startTime;
        nLoop = Math.floor(timeFromStart / totalTime);
        var timeThisLoop = timeFromStart - nLoop * totalTime;
        var time01 = timeThisLoop / totalTime;
        return time01;
    }

    function getFeatureStyle() {
        var style = {};

        if (!!mapFeature) {
            var time01 = getTime01();

            if (nLoop != lastNLoop) {
                lastNLoop = nLoop;
                if (!!onLoopCallBack) { onLoopCallBack(theThis); }
            }

            if (!!mapFeature) {
                var iFrame = Math.floor(frameSettings.nFrames * time01);

                var xIndexFrame = iFrame % frameSettings.nFramesPerRow;
                var yIndexFrame = Math.floor(iFrame / frameSettings.nFramesPerRow);

                var frameX = frameSettings.ptLTFirstFrame[0] + xIndexFrame * frameSettings.sizeAdvance[0];
                var frameY = frameSettings.ptLTFirstFrame[1] + yIndexFrame * frameSettings.sizeAdvance[1];

                var notification = { time01: time01, nLoop: nLoop, scale: scale, sender: theThis };

                var opacityUse = !!opacityCallBack ? opacityCallBack(notification) : opacity;
                var scaleUse = !!scaleCallBack ? scaleCallBack(notification) : scale;
                var rotationUse = !!rotationCallBack ? rotationCallBack(notification) : undefined;

                if (!!mapFeature) {
                    var useIcon;

                    if (!!iconStyle) {
                        var wScreen = frameSettings.sizeFrame[0] * scaleUse;
                        var minDim = 8;

                        if (!(useIcon = wScreen < minDim)) {
                            var hScreen = frameSettings.sizeFrame[1] * scaleUse;
                            useIcon = hScreen < minDim;
                        }
                    }

                    if (useIcon) { style = iconStyle; }
                    else {
                        //console.log(frameSettings.sizeFrame);
                        style = {
                            rotation_rad: rotationUse,
                            rotate_with_map: frameSettings.rotateWithMap,
                            zindex: baseZIndex,
                            icon: true,
                            icon_img: settings.atlas,
                            icon_size: frameSettings.sizeFrame,
                            icon_offset: [frameX, frameY],
                            opacity: opacityUse,
                            scale: scaleUse
                        };
                    }
                }
            }

            if (!!mapFeature && !!getPositionCallBack) {
                var newPos = getPositionCallBack({ time01: time01, nLoop: nLoop, sender: theThis });
                if (newPos !== undefined) { mapFeature.SetPointCoords(newPos); }
            }
        }
        return style;
    }

    function setScale(scaleSet) {
        scale = tf.js.GetFloatNumberInRange(scaleSet, 0.0001, 999999, 1);
    }

    function onPreCompose(notification) { if (!!mapFeature) { mapFeature.RefreshStyle(); notification.continueAnimation(); } }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (tf.js.GetIsValidObject(frameSettings = settings.frameSettings)) {
            if (!!(map = tf.js.GetMapFrom(settings.map))) {
                layer = settings.layer;
                setScale(settings.scale);
                totalTime = frameSettings.frameDuration * frameSettings.nFrames;
                lastNLoop = nLoop = 0;
                baseZIndex = settings.baseZIndex !== undefined ? settings.baseZIndex : 1;
                iconStyle = tf.js.GetIsValidObject(settings.iconStyle) ? settings.iconStyle : null;
                onLoopCallBack = tf.js.GetFunctionOrNull(settings.onLoop);
                startTime = Date.now();
                timeFromStart = 0;
                if (!(opacityCallBack = tf.js.GetFunctionOrNull(settings.opacity))) {
                    opacity = tf.js.GetIntNumberInRange(settings.opacity, 0, 1, 1);
                }
                scaleCallBack = tf.js.GetFunctionOrNull(settings.scaleCallBack);
                rotationCallBack = tf.js.GetFunctionOrNull(settings.rotationCallBack);
                getPositionCallBack = tf.js.GetFunctionOrNull(settings.getPosition);
                preComposeListener = map.AddListener(tf.consts.mapPreComposeEvent, onPreCompose);
                mapFeature = new tf.map.Feature({ type: "point", coordinates: settings.center, style: getFeatureStyle });
                if (!!layer) { layer.AddMapFeature(mapFeature); }
            }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
