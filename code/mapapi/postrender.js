"use strict";

/**
 * A callback function that renders animations during [Map]{@link tf.map.Map} [Post Compose]{@link tf.consts.mapPostComposeEvent} events
 * @public
 * @callback tf.types.PostComposeAnimatorCallBack
 * @param {tf.map.Map} map - Map instance where animation will take place
 * @param {tf.types.MapShowFeatureImmediately} mapShowFeatureImmediately - A callback used to display map features
 * @param {number} elapsed01 - A number between <b>0</b> and <b>1</b> equal to the ratio (animation elapsed time) / (animation duration)
 * @returns {void} - | {@link void} no return value
 */

/**
 * @public
 * @class
 * @summary - Post Compose Animator instances automatically manage listening to [Post Compose]{@link tf.consts.mapPostComposeEvent} events
 * on the given [Map]{@link tf.map.Map} instance, and for the given duration of time call the given callback to perform an animation
 * @param {object} settings - creation settings
 * @param {tf.map.Map} settings.map - Map instance where animation will take place
 * @param {tf.types.PostComposeAnimatorCallBack} settings.animationFunction - callback that renders the animation
 * @param {number} settings.duration - the duration of the animation in  milliseconds
*/
tf.map.PostComposeAnimator = function (settings) {
    var theThis, listener, startTime, theMap, duration, animationFunction;

    /**
     * @public
     * @function
     * @summary - Starts the animation
     * @returns {void} - | {@link void} no return value
    */
    this.Start = function () { if (startTime === undefined) { if (!!theMap) { startTime = new Date().getTime(); renderMap(); } } }

    /**
     * @public
     * @function
     * @summary - Stops the animation, if it is ongoing
     * @returns {void} - | {@link void} no return value
    */
    this.Stop = function () { return stop(); }

    /**
     * @public
     * @function
     * @summary - Determines if the animation is ongoing
     * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
    */
    this.IsAnimating = function () { return startTime !== undefined && !listener; }

    function renderMap() { theMap.Render(); }

    function stop() { if (!!listener) { listener.OnDelete(); listener = null; setTimeout(renderMap, 10); } }

    function animate(notification) {
        if (startTime !== undefined) {
            var elapsed = new Date().getTime() - startTime;
            if (elapsed > duration) { stop(); }
            else {
                animationFunction(notification.sender, notification.showFeatureImmediately, tf.js.GetFloatNumberInRange(elapsed / duration, 0, 1, 1));
                notification.continueAnimation();
            }
        }
    }

    function initialize() {
        theMap = tf.js.GetMapFrom(settings.map);
        if (tf.js.GetIsMap(theMap) &&
            (!!(animationFunction = tf.js.GetFunctionOrNull(settings.animationFunction)))) {
            duration = tf.js.GetFloatNumberInRange(settings.duration, 1000, 10000, 100);
            listener = theMap.AddListener(tf.consts.mapPostComposeEvent, animate);
        } else { theMap = null; animationFunction = null; }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * A callback function that produces a [Feature Style Settings]{@link tf.types.MapFeatureStyleSettings} object
 * for the given animation elapsed time ratio. Used by [Geometries Style Animator]{@link tf.map.GeometriesStyleAnimator}
 * @public
 * @callback tf.types.GeometriesStyleAnimatorCallBack
 * @param {number} elapsed01 - A number between <b>0</b> and <b>1</b> equal to the ratio (animation elapsed time) / (animation duration)
 * @returns {tf.types.MapFeatureStyleSettings} - | {@link tf.types.MapFeatureStyleSettings} the style settings to be used at <b>elapsed01</b>
 */

/**
 * @public
 * @class
 * @summary - Geometries Style Animator instances repeatedly refresh the style of one or more given geometries, 
 * using the given style generator callback and for the given time duration, to display style animations on 
 * the on the given [Map]{@link tf.map.Map} instance
 * @param {object} settings - creation settings
 * @param {tf.map.Map} settings.map - Map instance where animation will take place
 * @param {tf.types.GeometriesStyleAnimatorCallBack} settings.getStyle - callback that produces style settings
 * @param {number} settings.duration - the duration of the animation in  milliseconds
*/
tf.map.GeometriesStyleAnimator = function (settings) {
    var theThis, geometries, getStyleMethod, animator;

    /**
     * @public
     * @function
     * @summary - Starts the animation
     * @returns {void} - | {@link void} no return value
    */
    this.Start = function () { if (!!animator) { animator.Start(); } }

    /**
     * @public
     * @function
     * @summary - Stops the animation, if it is ongoing
     * @returns {void} - | {@link void} no return value
    */
    this.Stop = function () { if (!!animator) { animator.Stop(); } }

    /**
     * @public
     * @function
     * @summary - Determines if the animation is ongoing
     * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
    */
    this.IsAnimating = function () { return !!animator ? animator.IsAnimating() : false; }

    function getDefaultStyle(elapsed01) {
        var radius = 4 + Math.pow(elapsed01, 1 / 2) * 16;
        var opacity = 1 - Math.pow(elapsed01, 3);
        var line_width = (2 - elapsed01);
        var defaultStyle = {
            circle: true,
            circle_radius: radius,
            snapToPixel: false,
            line: true,
            line_width: line_width,
            line_color: tf.js.GetRandomHexColorStr(),//"#f00",
            line_alpha: opacity * 100
        };
        return defaultStyle;
    }

    function animate(theMap, showFeatureImmediately, elapsed01) {
        var animatedStyle = getStyleMethod(elapsed01);

        for (var i in geometries) {
            var geom = geometries[i];
            var animatedFeature = new tf.map.Feature({ geom: geom, style: animatedStyle });
            showFeatureImmediately(animatedFeature);
        }
    }

    function initialize() {
        if (!(getStyleMethod = tf.js.GetFunctionOrNull(settings.getStyle))) { getStyleMethod = getDefaultStyle; }
        if (!!(geometries = settings.geometries) && (typeof geometries === "object")) {
            animator = new tf.map.PostComposeAnimator({ map: settings.map, duration: settings.duration, animationFunction: animate });
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * @public
 * @class
 * @summary - Points Style Animator instances repeatedly display an arbitrary number of [Point Geometries]{@link tf.types.GeoJSONGeometryType} 
 * obtained from the given providers on the given [Maps]{@link tf.map.Map}, using styles obtained from the given style generator callback,
 * producing an animation with the given duration
 * @param {object} settings - creation settings
 * @param {enumerable<tf.map.Map>} settings.maps - an arbitrary number of Map instances where animation will take place
 * @param {enumerable<object>} settings.pointProviders - an arbitrary number of objects, each containing a function named <b>GetPointCoords</b> returning
 * [Map Coordinates]{@link tf.types.mapCoordinates}
 * @param {tf.types.GeometriesStyleAnimatorCallBack} settings.getStyle - callback that produces style settings
 * @param {number} settings.duration - the duration of the animation in  milliseconds
*/
tf.map.PointsStyleAnimator = function (settings) {
    var theThis;

    /**
     * @private
     * @function
     * @summary - Retrieves the single [Map Feature Geometry]{@link tf.map.FeatureGeom} instance containing all map coordinates whose style is being animated
     * @returns {tf.map.FeatureGeom} - | {@link tf.map.FeatureGeom} the instance
    */
    //this.GetPointListGeometry = function () { return pointListGeometry; }

    function createGeometry(pointProviders) {
        var coordinates = [];
        var pointListGeometry;

        for (var i in pointProviders) {
            var pp = pointProviders[i];

            if (tf.js.GetIsValidObject(pp)) {
                var coords;
                if (tf.js.GetFunctionOrNull(pp.GetPointCoords)) {
                    coords = pp.GetPointCoords();
                }
                else if (tf.js.GetIsArrayWithMinLength(pp, 2)) {
                    coords = pp;
                }
                if (!!coords) { coordinates.push(coords); }
            }
        }

        if (!!coordinates.length) { pointListGeometry = new tf.map.FeatureGeom({ type: "multipoint", coordinates: coordinates }); }

        return pointListGeometry;
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);

        var settingsMaps = settings.maps;
        var pointProviders = settings.pointProviders;

        if (tf.js.GetIsValidObject(settingsMaps) && tf.js.GetIsValidObject(pointProviders)) {
            var pointListGeometry = createGeometry(pointProviders);

            if (!!pointListGeometry) {
                var animators = [];

                for (var i in settingsMaps) {
                    var map = tf.js.GetMapFrom(settingsMaps[i]);
                    if (!!map) {
                        animators.push(new tf.map.GeometriesStyleAnimator({ map: map, geometries: [pointListGeometry], getStyle: settings.getStyle, duration: settings.duration }));
                    }
                }
                if (animators.length > 0) { for (var i in animators) { animators[i].Start(); } }
            }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
