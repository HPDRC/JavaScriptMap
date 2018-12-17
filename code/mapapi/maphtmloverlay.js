"use strict";

/**
 * Settings used in the creation of [Map HTML Overlay]{@link tf.map.HTMLOverlay} instances
 * @public
 * @typedef {object} tf.types.MapOverlaySettings
 * @property {tf.map.Map} map - the map that will display the overlay
 * @property {HTMLElementLike} content - optional content (content can be set after creation)
 * @property {boolean} isVisible - set to <b>false</b> to create an invisible overlay, defaults to <b>true</b>
 * @property {tf.types.mapCoordinates} position - the map coordinates where the overlay is displayed, defaults to [ {@link tf.consts.defaultLongitude}, {@link tf.consts.defaultLatitude}]
 * @property {tf.types.pixelCoordinates} offset - optional pixel offset
 * @property {boolean} autoPan - set to <b>false</b> to prevent the map from panning to the overlay position, defaults to <b>true</b>
 * @property {tf.types.horizontalPositioning} horPos - optional horizontal positioning, defaults to {@link tf.consts.positioningCenter}
 * @property {tf.types.verticalPositioning} verPos - optional vertical positioning, defaults to {@link tf.consts.positioningTop}
*/

/**
 * @public
 * @class
 * @summary Create instances of this class to display HTML Overlays on the [TerraFly HTerraMap]{@link tf.map.Map}
 * @param {tf.types.MapOverlaySettings} settings - map overlay creation settings
 */
tf.map.HTMLOverlay = function (settings) {
    var theThis, styles, isVisible, tMap, div, APIOverlay, pointCoords;

    this.GetContainerDiv = function () { return div; }

    this.GetOverlayHTMLElement = function () { return !!APIOverlay ? APIOverlay.getElement() : undefined; }

    this.SetStyle = function (cssstyle) {
        if (!!div) {
            styles.ApplyStyleProperties(div, cssstyle);
        }
    }

    /**
     * @public
     * @function
     * @summary - Shows or hides the overlay
     * @param {boolean} bool - Set to <b>true</b> to show, <b>false</b> to hide
     * @returns {void} - | {@link void} no return value
    */
    this.SetVisible = function (bool) { return setVisible(bool); }

    /**
     * @public
     * @function
     * @summary - Determines if the overlay is visible
     * @returns {boolean} - | {@link boolean} <b>true</b> if visible, <b>false</b> otherwise
    */
    this.GetIsVisible = function () { return isVisible; }

    /**
     * @public
     * @function
     * @summary - Sets the overlay position on the map
     * @param {tf.types.mapCoordinates} pointCoords - the position
     * @returns {void} - | {@link void} no return value
    */
    this.SetPointCoords = function (pointCoords) { return setPointCoords(pointCoords); }

    /**
     * @public
     * @function
     * @summary - Gets the overlay position on the map
     * @returns {tf.types.mapCoordinates} - | {@link tf.types.mapCoordinates} the position
    */
    this.GetPointCoords = function () { return pointCoords.slice(0); }

    /**
     * @public
     * @function
     * @summary - Sets how the overlay is positioned around its coordinates
     * @param {tf.types.horizontalPositioning} horPos - horizontal positioning
     * @param {tf.types.verticalPositioning} verPos - vertical positioning
     * @returns {void} - | {@link void} no return value
    */
    this.SetPositioning = function (horPos, verPos) {
        if (!!APIOverlay) {
            var horPosUse = tf.js.GetNonEmptyString(horPos, tf.consts.positioningCenter);
            var verPosUse = tf.js.GetNonEmptyString(verPos, tf.consts.positioningTop);
            APIOverlay.setPositioning(verPosUse + '-' + horPosUse);
        } 
    }

    /**
     * @public
     * @function
     * @summary - Sets the overlay pixel offset
     * @param {tf.types.pixelCoordinates} offset - pixel offset
     * @returns {void} - | {@link void} no return value
    */
    this.SetOffset = function (offset) { if (!!APIOverlay && tf.js.GetIsArrayWithLength(offset, 2)) { APIOverlay.setOffset(offset); } }

    /**
     * @public
     * @function
     * @summary - Gets the overlay pixel offset
     * @returns {tf.types.pixelCoordinates} - | {@link tf.types.pixelCoordinates} the pixel offset
    */
    this.GetOffset = function () { return !!APIOverlay ? APIOverlay.getOffset() : undefined; }

    /**
     * @public
     * @function
     * @summary - Sets the overlay content
     * @param {HTMLElementLike} content - the content
     * @returns {void} - | {@link void} no return value
    */
    this.SetContent = function (content) { return setContent(content); }

    /**
     * @private
     * @function
     * @summary - Gets the underlying map engine object
     * @returns {ol.Overlay} - | the underlying map engine object
    */
    this.getAPIOverlay = function () { return APIOverlay; }

    function setContent(content) { if (!!content && !!div) { div.ReplaceContent(content); } }

    function setPointCoords(newPointCoords) {
        if (!!APIOverlay && !!newPointCoords && typeof newPointCoords === "object") { return APIOverlay.setPosition(tf.units.TM2OL(pointCoords = newPointCoords.slice(0))); }
    }

    function setVisible(bool) {
        if (isVisible != (bool = !!bool)) {
            isVisible = bool;
            if (!!tMap) {
                if (isVisible) { tMap.addHTMLOverlay(theThis); } else { tMap.removeHTMLOverlay(theThis); APIOverlay.setMap(undefined); }
            }
        }
    }

    function initialize() {

        styles = tf.GetStyles();
        isVisible = false;

        var defaultPosition = [tf.consts.defaultLongitude, tf.consts.defaultLatitude];
        var defaultSettings = {
            map: undefined,
            content: undefined,
            isVisible: true,
            position: defaultPosition,
            offset: [0, 0],
            horPos: tf.consts.positioningCenter,
            verPos: tf.consts.positioningTop,
            stopEvent: true,
            insertFirst: true,
            autoPanMargin: 20,
            autoPan: false
        };
        var settingsUse = tf.js.ShallowMerge(defaultSettings, settings);

        if (!!(tMap = tf.js.GetMapFrom(settingsUse.map))) {
            var content = settingsUse.content;
            var isVisible = settingsUse.isVisible;

            settingsUse.positioning = settingsUse.verPos + '-' + settingsUse.horPos;

            delete settingsUse.horPos;
            delete settingsUse.verPos;
            delete settingsUse.isVisible;
            delete settingsUse.content;
            delete settingsUse.map;

            if (tf.js.GetIsArray(settingsUse.position)) { settingsUse.position = defaultPosition; }
            settingsUse.position = tf.units.TM2OL(pointCoords = settingsUse.position);
            settingsUse.element = (div = new tf.dom.Div({ cssClass: styles.GetUnPaddedDivClassNames(false, false) })).GetHTMLElement();
            if (!!content) { div.AddContent(settings.content); }
            APIOverlay = new ol.Overlay(settingsUse);
            setVisible(isVisible);
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};


/**
 * Settings used in the creation of [Map HTML Control]{@link tf.map.HTMLControl} instances
 * @public
 * @typedef {object} tf.types.MapControlSettings
 * @property {tf.map.Map} map - the map that will display the control
 * @property {HTMLElementLike} content - optional content (content can be set after creation)
 * @property {boolean} isVisible - set to <b>false</b> to create an invisible control, defaults to <b>true</b>
 * @property {tf.types.CSSStyleSpecs} cssStyle - optional style to be applied to the control
*/

/**
 * @public
 * @class
 * @summary Create instances of this class to display HTML Controls on the [TerraFly HTerraMap]{@link tf.map.Map}
 * @param {tf.types.MapControlSettings} settings - map control creation settings
 */
tf.map.HTMLControl = function (settings) {
    var theThis, styles, isVisible, tMap, div, APIControl;

    /**
     * @public
     * @function
     * @summary - Shows or hides the control
     * @param {boolean} bool - Set to <b>true</b> to show, <b>false</b> to hide
     * @returns {void} - | {@link void} no return value
    */
    this.SetVisible = function (bool) { return setVisible(bool); }

    /**
     * @public
     * @function
     * @summary - Determines if the control is visible
     * @returns {boolean} - | {@link boolean} <b>true</b> if visible, <b>false</b> otherwise
    */
    this.GetIsVisible = function () { return isVisible; }

    /**
     * @public
     * @function
     * @summary - Sets the control content
     * @param {HTMLElementLike} content - the content
     * @returns {void} - | {@link void} no return value
    */
    this.SetContent = function (content) { return setContent(content); }

    /**
     * @private
     * @function
     * @summary - Gets the underlying map engine object
     * @returns {ol.control.Control} - | the underlying map engine object
    */
    this.getAPIControl = function () { return APIControl; }

    function setContent(content) { if (!!content && !!div) { div.ReplaceContent(content); } }

    function setVisible(bool) {
        if (isVisible != (bool = !!bool)) {
            isVisible = bool;
            if (!!tMap) {
                if (isVisible) { tMap.addHTMLControl(theThis); } else { tMap.removeHTMLControl(theThis); APIControl.setMap(undefined); }
            }
        }
    }

    function initialize() {

        styles = tf.GetStyles();
        isVisible = false;

        var defaultPosition = [tf.consts.defaultLongitude, tf.consts.defaultLatitude];
        var defaultSettings = {
            map: undefined,
            content: undefined,
            isVisible: true
        };
        var settingsUse = tf.js.ShallowMerge(defaultSettings, settings);

        if (!!(tMap = tf.js.GetMapFrom(settingsUse.map))) {
            var content = settingsUse.content;
            var isVisible = settingsUse.isVisible;

            delete settingsUse.isVisible;
            delete settingsUse.content;
            delete settingsUse.map;

            settingsUse.target = tMap.GetControlContainer();

            settingsUse.element = (div = new tf.dom.Div({ cssClass: styles.GetUnPaddedDivClassNames(false, false) })).GetHTMLElement();
            if (!!settings.cssStyle) { styles.ApplyStyleProperties(div, settings.cssStyle); }
            if (!!content) { div.AddContent(settings.content); }
            APIControl = new ol.control.Control(settingsUse);
            if (isVisible) {
                setVisible(isVisible);
            }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.map.MapOverlay = function (settings) {
    var theThis, styles, subStyles, map, mapBubble, myMap, bubbleDim, content, borderRadius;

    this.GetHTMLOverlay = function () { return mapBubble; }
    this.GetOverlayMap = function () { return myMap; }
    this.GetMapContainer = function () { return content; }

    function prepareBubbleContent(coords) {
        content = new tf.dom.Div({ cssClass: styles.GetUnPaddedDivClassNames(false, false) });
        var baseContainerStyles = { inherits: [subStyles.defaultShadowStyle, subStyles.buttonStyleBase, subStyles.paddedBlockDivStyle, subStyles.cursorDefaultStyle, subStyles.noSelectStyle] };
        var containerStyles = {
            inherits: [baseContainerStyles],
            backgroundColor: "#000", fontFamily: "Arial", fontSize: "1.2em", color: "#fc0",
            border: "2px dashed #fc0", borderRadius: borderRadius, padding: "0px",
            maxWidth: "20em", width: bubbleDim + "px", height: bubbleDim + "px",
            position: "relative", overflow: "hidden"
        };

        mapBubble.SetStyle(containerStyles);

        var contentStyle = {
            borderRadius: borderRadius,
            width: (bubbleDim) + "px", height: (bubbleDim) + "px",
            position: "relative", overflow: "hidden"
        };

        styles.ApplyStyleProperties(content, contentStyle);

        myMap = map.CreateMapWithSameLayers(content);

        return content;
    }

    function initialize() {
        var defaultSettings = {};
        settings = tf.js.ShallowMerge(defaultSettings, settings);
        if (!!(map = tf.js.GetMapFrom(settings.map))) {
            var coords = settings.coords !== undefined ? settings.coords : map.GetCenter();
            styles = tf.GetStyles();
            subStyles = styles.GetSubStyles();
            bubbleDim = tf.js.GetIntNumberInRange(settings.bubbleDim, 100, 1000, 200);
            borderRadius = tf.js.GetNonEmptyString(settings.borderRadius, "50%");
            mapBubble = new tf.map.HTMLOverlay({ map: map, autoPan: settings.autoPan, autoPanMargin: settings.autoPanMargin, stopEvent: false, isVisible: settings.isVisible });
            mapBubble.SetPositioning(tf.consts.positioningCenter, tf.consts.positioningCenter);
            mapBubble.SetOffset([0, 0]);
            mapBubble.SetContent(prepareBubbleContent(coords));
            mapBubble.SetPointCoords(coords);
            myMap.OnResize();
            setTimeout(myMap.OnResize, 250);
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.map.RenderMap = function (settings) {
    var theThis, map, olMap, mapDiv, mapDivE, mapCanvas, resizeListener, viewChangeListener, xScale, yScale;

    this.GetCanvas = function () { return mapCanvas; }

    //this.Render = function () { if (!isDeleted()) { olMap.render(); }}

    this.OnDelete = function () { return onDelete(); }
    this.IsDelete = function () { return isDeleted(); }

    function isDeleted() { return map == undefined; }
    function onDelete() {
        if (!isDeleted()) {
            if (!!resizeListener) { resizeListener.OnDelete(); }
            if (!!viewChangeListener) { viewChangeListener.OnDelete(); }
            if (!!olMap) { olMap.setLayerGroup(null); }
            if (!!mapDiv) { mapDiv.OnDelete(); }
            viewChangeListener = resizeListener = map = olMap = mapDiv = mapCanvas = mapDivE = undefined;
        }
    }

    function updateSize() {
        var size = map.GetActualPixelSize();
        var width = size[0] * xScale;
        var height = size[1] * yScale;
        mapDivE.style.width = width + 'px';
        mapDivE.style.height = height + 'px';
        olMap.setSize([width, height]);
    }

    function initialize() {
        if ((tf.js.GetIsValidObject(settings)) && !!tf.js.GetMapFrom(settings.map)) {
            var styles = tf.GetStyles();

            map = tf.js.GetMapFrom(settings.map);

            if (tf.js.GetIsArrayWithMinLength(settings.scale, 2)) {
                xScale = tf.js.GetFloatNumberInRange(settings.scale[0], 0.1, 10, 1);
                yScale = tf.js.GetFloatNumberInRange(settings.scale[1], 0.1, 10, 1);
            }
            else {
                xScale = yScale = 1;
            }

            mapDiv = new tf.dom.Div({ cssClass: styles.mapSubContainerClass });
            mapDivE = mapDiv.GetHTMLElement();

            mapDivE.style.position = "absolute";
            mapDivE.style.left = mapDivE.style.top = "0px";
            mapDivE.style.pointerEvents = "none";

            document.body.appendChild(mapDivE);

            olMap = new ol.Map({
                loadTilesWhileAnimating: true,
                loadTilesWhileInteracting: true,
                renderer: 'canvas',
                target: mapDivE,
                view: map.getAPIView(),
                controls: [],
                interactions: []
            });
            olMap.on('postcompose', function (event) {
                mapCanvas = event.context.canvas;
                map.onComposeEvent(tf.consts.mapPostComposeEvent, event, olMap);
            });
            olMap.on('moveend', function (event) { map.onMoveEnd(event); });
            olMap.setLayerGroup(map.getAPIMap().getLayerGroup());

            viewChangeListener = map.AddListener(tf.consts.mapViewSettingsChangedEvent, function (notification) {
                olMap.setView(map.getAPIView());
            });
            resizeListener = map.AddListener(tf.consts.mapResizedEvent, function (notification) { updateSize(); });
            updateSize();
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/*tf.map.MapContainer = function (settings) {
    var theThis, map, mapDiv, mapDivHTML, resizeListener, xScale, yScale, isActive;

    this.SetActive = function (bool) { return setActive(bool); }
    this.IsActive = function () { return isActive }

    function setActive(bool) {
        if (isActive != (bool = !!bool)) {
            if (isActive = bool) {
                map.SetTarget(mapDivHTML);
            }
            else {
                map.RestoreTarget();
            }
            map.OnResize();
        }
    }

    this.OnDelete = function () { return onDelete(); }
    this.IsDelete = function () { return isDeleted(); }

    function isDeleted() { return map == undefined; }
    function onDelete() {
        if (!isDeleted()) {
            setActive(false);
            if (!!resizeListener) { resizeListener.OnDelete(); }
            if (!!mapDiv) {
                document.body.removeChild(mapDivHTML)
                mapDiv.OnDelete();
            }
            resizeListener = map = mapDiv = mapDivHTML = undefined;
        }
    }

    function updateSize() {
        if (!isActive) {
            var size = map.GetActualPixelSize();
            var width = size[0] * xScale;
            var height = size[1] * yScale;
            mapDivHTML.style.width = width + 'px';
            mapDivHTML.style.height = height + 'px';
        }
        //if (isActive) { map.OnResize(); }
    }

    function initialize() {
        if ((tf.js.GetIsValidObject(settings)) && !!tf.js.GetMapFrom(settings.map)) {
            var styles = tf.GetStyles();

            map = tf.js.GetMapFrom(settings.map);

            if (tf.js.GetIsArrayWithMinLength(settings.scale, 2)) {
                xScale = tf.js.GetFloatNumberInRange(settings.scale[0], 0.1, 10, 1);
                yScale = tf.js.GetFloatNumberInRange(settings.scale[1], 0.1, 10, 1);
            }
            else { xScale = yScale = 1; }

            mapDiv = new tf.dom.Div({ cssClass: styles.mapSubContainerClass });
            mapDivHTML = mapDiv.GetHTMLElement();

            mapDivHTML.style.position = "absolute";
            mapDivHTML.style.left = mapDivHTML.style.top = "-9999px";

            document.body.appendChild(mapDivHTML);

            resizeListener = map.AddListener(tf.consts.mapResizedEvent, function (notification) { updateSize(); });
            updateSize();

            isActive = false;
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
*/
