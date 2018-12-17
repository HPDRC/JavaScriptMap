"use strict";

/**
 * @public
 * @function
 * @summary - Creates links associated with [DLayer]{@link tf.urlapi.DLayer} record properties for display in a [Map's]{@link tf.map.Map} Info Window 
 * @param {string} href - the url associated with the link
 * @param {string} label - the text associated with the link
 * @param {string} toolTip - the link's tooltip
 * @param {string} target - the link's target
 * @param {tf.types.CSSStyleName} cssClass - optional css class. If defined, sets the HTML <b>class</b> property, defaults to {@link void}
 * @returns {tf.dom.Link} - | {@link tf.dom.Link} the link
*/
tf.urlapi.CreateInfoWindowLink = function (href, label, toolTip, target, cssClass) {
    var link = null; if (!!href) { link = new tf.dom.Link({ href: href, label: label, tooltip: toolTip, target: target, cssClass: cssClass }); } return link;
}

/**
 * @public
 * @function
 * @summary - Creates images associated with [DLayer]{@link tf.urlapi.DLayer} record properties for display in a [Map's]{@link tf.map.Map} Info Window 
 * @param {string} href - the url associated with the image
 * @returns {tf.dom.Img} - | {@link tf.dom.Img} the image
*/
tf.urlapi.CreateInfoWindowImg = function (href) { var img = null; if (!!href) { img = new tf.dom.Img({ src: href/*, cssClass: tf.GetStyles().imgForInfoWindowClass*/ }); } return img; }

/**
 * @public
 * @function
 * @summary - Creates HTML spans associated with [DLayer]{@link tf.urlapi.DLayer} record properties for display in a [Map's]{@link tf.map.Map} Info Window 
 * @param {string} text - the text to be placed inside the span
 * @returns {tf.dom.Span} - | {@link tf.dom.Span} the span
*/
tf.urlapi.CreateInfoWindowSpan = function (text) { var span = null; if (!!text) { span = new tf.dom.Span(); span.AddContent(text); } return span; }

/**
 * @public
 * @function
 * @summary - Creates information to be displayed in a [Map's]{@link tf.map.Map} Info Window about the given properties of a [DLayer]{@link tf.urlapi.DLayer} record
 * @param {object} props - the given properties associated with the map feature
 * @returns {void} - | {@link void} no return value
*/
tf.urlapi.BuildDLayerFeatureInfoWindow = function (props, optTarget) {
    var div = new tf.dom.Div({ cssClass: tf.GetStyles().dLayerInfoClass });
    var thisProp;
    var linkTarget = tf.js.GetIsNonEmptyString(optTarget) ? optTarget : '_top';

    if (thisProp = tf.urlapi.CreateInfoWindowLink(props.Display_Link_Detail, "Detail", "View Detail Report", linkTarget)) { div.AddContent(thisProp); }
    if (thisProp = tf.urlapi.CreateInfoWindowLink(props.Display_Link_Report_Recentered, "Nearby", "View Nearby Report", linkTarget)) { div.AddContent(thisProp); }
    if (thisProp = tf.urlapi.CreateInfoWindowLink(props.Display_Link_Location, "Location", "View Location Report", linkTarget)) { div.AddContent(thisProp); }
    if (thisProp = tf.urlapi.CreateInfoWindowLink(props.Display_Link_Pro, "Pro", "Professional detail report for realtors only", linkTarget)) { div.AddContent(thisProp); }

    if (thisProp = tf.urlapi.CreateInfoWindowSpan(props.Display_Summary_Short_Text)) { div.AddContent(thisProp); }

    if (props.Display_Thumbnail) {
        if (thisProp = tf.urlapi.CreateInfoWindowLink(props.Display_Link_Detail, "", "View Detail Report", linkTarget)) {
            var imgProp = tf.urlapi.CreateInfoWindowImg(props.Display_Thumbnail);
            if (imgProp) { imgProp.AppendTo(thisProp); div.AddContent(thisProp); }
        }
        else if (thisProp = tf.urlapi.CreateInfoWindowImg(props.Display_Thumbnail)) { div.AddContent(thisProp); }
    }

    if (thisProp = tf.urlapi.CreateInfoWindowSpan(props.Display_Summary_Longer_Text)) { div.AddContent(thisProp); }
    else if (thisProp = tf.urlapi.CreateInfoWindowSpan(props.Display_Summary_Midsize_Text)) { div.AddContent(thisProp); }

    if (thisProp = props.Display_Label) { if (thisProp.length > 1) { props.popupTitle = thisProp; } }

    props.infoWindowContent = div;
};

/**
 * @public
 * @function
 * @summary - Displays the information associated with the [DLayer]{@link tf.urlapi.DLayer} [Known Property Name]{@link tf.types.KnownAPIPropertyName} ({@link tf.consts.DLayerProperty})
 * in a [Map's]{@link tf.map.Map} Info Window 
 * @param {object} object - the object with an associated [DLayer Property]{@link tf.consts.DLayerProperty}
 * @returns {void} - | {@link void} no return value
*/
tf.urlapi.ShowdLayerInfoWindow = function (object) {
    var props = tf.js.GetObjProperty(object, tf.consts.DLayerProperty);
    if (!!props) {
        var infoWindowContent = props.properties.infoWindowContent;
        if (!infoWindowContent) {
            tf.urlapi.BuildDLayerFeatureInfoWindow(props.properties, props.linkTargetStr);
            infoWindowContent = props.properties.infoWindowContent
        }
        if (!!infoWindowContent) {
            var map = tf.js.GetMapFrom(props.map);
            if (!!map) {
                var label = tf.js.GetNonEmptyString(props.label);
                var position = tf.js.GetFunctionOrNull(object.GetPointCoords) ? object.GetPointCoords() : [0, 0];
                if (tf.js.GetIsNonEmptyString(props.properties.popupTitle)) { label = props.properties.popupTitle; }
                map.ShowInfoPopup(label, infoWindowContent, position);
            }
        }
    }
};

//tf.types.DLayerSettings

/**
 * @public
 * @class
 * @summary - DLayer instances retrieve records from TerraFly data sets and display their corresponding [Map Features]{@link tf.map.Feature} on the [Map]{@link tf.map.Map}.
 * Information pertaining to individual records is displayed using the map's Info Window.
 * @param {object} settings - creation settings, includes all properties in {@link tf.types.URLDLayerSettings} plus:
 * @param {tf.urlapi.DLayerList} settings.dLayerList - the associated DLayer List instance
 * @param {tf.map.Map} settings.map - the associated Map instance
 * @param {number} settings.zIndex - the zindex of the [Feature Layer]{@link tf.map.FeatureLayer} instance associated with this DLayer instance
 * @param {number} settings.topZIndex - the highest zindex used by [DLayer]{@link tf.urlapi.DLayer} instances in <b>dLayerList</b>
 * @param {tf.types.opacity01} settings.opacity - the opacity of the [Feature Layer]{@link tf.map.FeatureLayer} instance associated with this DLayer instance, defaults to <b>1</b>
 * @param {function} settings.preProcessDataItem - called to filter each dlayer data record
 * @param {function} settings.preProcessServiceData - called to filter the list of dlayer records
*/
tf.urlapi.DLayer = function (settings) {
    var theThis = null;
    var fileTypeXMLFilter = new RegExp('filetype=\.xml');
    var fileTypeGeoJSONReplace = 'filetype=.json';
    var map, featureLayer, legend, url_xml, display_fields, layer_select, colors, zIndex, index, topZIndex;
    var keyedList, downloadURL, keyedListsTimedRefresh, featureList, opacity;
    var isImageMarker, addedFeaturesListener, deletedFeaturesListener;
    var fontHeight, imgMarkerBaseStyle, imgMarkerBaseHoverStyle, textMarkerBaseStyle, textMarkerBaseHoverStyle, markerStyle, markerHoverStyle;
    var defaultColors, nDefaultColors, layerColor, fontColor, usingCustomMarkers, preProcessDataItem, preProcessServiceData, lastHoverFeatures;
    var mapListeners, nDLayerExtent, featuresExtent, showsInfoWindow;
    var linkTargetStr;

    this.GetDisplayFieldName = function () { return display_fields; }

    this.GetMarkerStyleSpecs = function () {
        return {
            textMarkerBaseStyle: textMarkerBaseStyle,
            textMarkerBaseHoverStyle: textMarkerBaseHoverStyle,
            imgMarkerBaseStyle: imgMarkerBaseStyle,
            imgMarkerBaseHoverStyle: imgMarkerBaseHoverStyle
        };
    }

    this.GetFeaturesExtent = function () { return !!featuresExtent ? featuresExtent.slice(0) : [];}
    this.CalcExtent = function (maxRecords) { return calcExtent(maxRecords); }
    this.SetExtent = function () { return setExtent(); }
    this.MergeExtent = function () { return mergeExtent(); }

    this.AddListenersToMap = function(map) { return addListenersToMap(map) ; }

    this.GetShowsInfoWindow = function () { return showsInfoWindow; }
    this.SetShowsInfoWindow = function (bool) { showsInfoWindow = !!bool; }

    /**
     * @public
     * @function
     * @summary - Retrieves the index of this DLayer index in its [DLayer List]{@link tf.urlapi.DLayerList}
     * @returns {number} - | {@link number} the index
    */
    this.GetIndex = function () { return index; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [DLayer List]{@link tf.urlapi.DLayerList} to which this DLayer instance belongs
     * @returns {tf.urlapi.DLayerList} - | {@link tf.urlapi.DLayerList} the list
    */
    this.GetDLayerList = function () { return settings.dLayerList; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Map]{tf.map.Map} instance where this DLayer instance displays its [Map Features]{@link tf.map.Feature}
     * @returns {tf.map.Map} - | {@link tf.map.Map} the list
    */
    this.GetMap = function () { return map; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Feature Layer]{tf.map.FeatureLayer} instance where this DLayer instance displays its [Map Features]{@link tf.map.Feature}
     * @returns {tf.map.FeatureLayer} - | {@link tf.map.FeatureLayer} the layer
    */
    this.GetFeatureLayer = function () { return featureLayer; }

    /**
     * @public
     * @function
     * @summary - Retrieves the name of this DLayer instance
     * @returns {string} - | {@link string} the name
    */
    this.GetName = function () { return legend; }

    /**
     * @public
     * @function
     * @summary - Removes all features from the [Feature Layer]{@link tf.map.FeatureLayer} instance associated with this DLayer instance
     * @returns {void} - | {@link void} no return value
    */
    this.RemoveAll = function () { if (!!keyedList) { keyedList.RemoveAllItems(); } }

    /**
     * @public
     * @function
     * @summary - Instructs this DLayer instance to replace its current records with records related to the current map center coordinates
     * @returns {void} - | {@link void} no return value
    */
    this.Refresh = function () { return refresh(); }

    /**
     * @public
     * @function
     * @summary - Determines if this DLayer instance is currently refreshing its records
     * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
    */
    this.GetIsRefreshing = function () { return keyedListsTimedRefresh.GetIsRefreshing(); }

//    this.RemoveFromMap = function () { return removeFromMap(); }

    /**
     * @public
     * @function
     * @summary - Changes the opacity of the [Feature Layer]{@link tf.map.FeatureLayer} instance associated with this DLayer instance
     * @param {tf.types.opacity01} opacity - the new opacity
     * @returns {void} - | {@link void} no return value
    */
    this.SetOpacity = function (opacity) { return setOpacity(opacity); }

    /**
     * @public
     * @function
     * @summary - Creates a [Keyed Table]{@link tf.ui.KeyedTable} associated with this DLayer instance's [Keyed List]{@link tf.js.KeyedList}
     * @param {tf.types.KeyedTableSettings} keyedTableSettings - used in the creation of the table
     * @returns {void} - | {@link void} no return value
    */
    this.CreateKeyedTable = function (keyedTableSettings) {
        var table = new tf.ui.KeyedTable(tf.js.ShallowMerge(keyedTableSettings, { keyedList: keyedList }));
        return table;
    }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Keyed Feature List]{@link tf.map.KeyedFeatureList} associated with this DLayer instance
     * @param {tf.map.Feature} mapFeature - the feature
     * @returns {tf.map.KeyedFeatureList} - | {@link tf.map.KeyedFeatureList} the feature list
    */
    this.GetFeatureList = function () { return featureList; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [DLayer Properties]{@link tf.consts.DLayerProperty} associated with the given map feature
     * @param {tf.map.Feature} mapFeature - the feature
     * @returns {object} - | {@link object} the properties, actual contents vary depending on the DLayer's data set, may be {@link void} if <b>mapFeature</b> does not have DLayer Properties
    */
    this.GetDLayerFeatureProps = function (mapFeature) { return getDLayerFeatureProps(mapFeature); }

    /**
     * @public
     * @function
     * @summary - Retrieves the zindex of the [Feature Layer]{@link tf.map.FeatureLayer} instance associated with this DLayer instance
     * @returns {number} - | {@link number} the zIndex
    */
    this.GetZIndex = function () { return zIndex; }

    /**
     * @public
     * @function
     * @summary - Changes the zindex of the [Feature Layer]{@link tf.map.FeatureLayer} instance associated with this DLayer instance
     * @param {number} zindex - the new zIndex
     * @returns {void} - | {@link void} no return value
    */
    this.SetZIndex = function (zIndexSet) { zIndex = zIndexSet; if (!!featureLayer) { featureLayer.SetZIndex(zIndex); } }

    function setOpacity(opacitySet) {
        opacitySet = tf.js.GetFloatNumberInRange(opacitySet, 0, 1, 1);
        if (opacity != opacitySet) { opacity = opacitySet; if (!!featureLayer) { featureLayer.SetOpacity(opacity); } }
    }

    function refresh() { keyedList.RemoveAllItems(); if (!!featureLayer) { featureLayer.RemoveAllFeatures(); } updateDownloadURL(); keyedListsTimedRefresh.RefreshNow(); }

    function removeFromMap() {
        if (!!mapListeners) {
            for (var i in mapListeners) {
                mapListeners[i].hover.OnDelete();
                mapListeners[i].click.OnDelete();
            }
            mapListeners = null;
        }
    }

    function createFeaturesFromSpecs(specs) {
        var features;

        if (tf.js.GetIsValidObject(specs)) {
            for (var i in specs) {
                var spec = specs[i];

                if (tf.js.GetHasGeoJSONGeometryProperties(spec)) {
                    if (!features) { features = []; }
                    features.push(new tf.map.Feature(spec));
                }
            }
        }
        return features;
    }

    function myPreProcessServiceData(data) {
        //tf.GetDebug().FileLog(data["category id"] + '-results', data);
        var parsedData = [];

        if (!featureLayer) {
            var layerDescription;
            
            if (tf.js.GetIsValidObject(data) && tf.js.GetIsNonEmptyString(data.title)) {
                layerDescription = data.title;
            }
            else {
                layerDescription = "Map layer: " + legend;
            }

            featureLayer = map.AddFeatureLayer({
                //useClusters: true, clusterStyle: {}, clusterLabelStyle: textMarkerBaseStyle,
                name: legend, description: layerDescription, isVisible: layer_select, isHidden: false, color: layerColor, zIndex: zIndex, opacity: opacity
            });
        }

        if (!!preProcessServiceData) { preProcessServiceData(data, theThis); }
        if (tf.js.GetIsValidObject(data) && tf.js.GetIsNonEmptyArray(data.features) &&
            tf.js.GetHasGeoJSONGeometryProperties(data.features[0].geometry)) {
            var props = data.properties;
            if (tf.js.GetIsValidObject(props)) {
                if (tf.js.GetIsValidObject(props.markerStyle)) {
                    markerStyle = props.markerStyle;
                    markerHoverStyle = tf.js.GetIsValidObject(props.markerHoverStyle) ? props.markerHoverStyle : markerStyle;
                    usingCustomMarkers = true;
                }
            }
            var catID = data["category id"];

            if (tf.js.GetIsNonEmptyString(catID)) {
                catID = catID.toLowerCase();
                if (catID == "geoimages") {
                    markerStyle = [{
                        "zindex": 1, "round_rect": true, "round_rect_width": 50, "round_rect_height": 40, "round_rect_radius": 5, "fill": true, "fill_color": "#ebebeb", "fill_alpha": 100, "line": true, "line_color": "#000", "line_width": 2
                    }, {
                        "zindex": 1, "scale": 1, "icon": true, "icon_url": "$[L]"
                    }];
                    markerHoverStyle = [{
                        "zindex": 2, "round_rect": true, "round_rect_width": 64, "round_rect_height": 52, "round_rect_radius": 10, "fill": true, "fill_color": "#ebebeb", "fill_alpha": 100, "line": true, "line_color": "#00a", "line_width": 3
                    }, {
                        "zindex": 2, "scale": 1.2, "icon": true, "icon_url": "$[L]"
                    }];
                    usingCustomMarkers = true;
                }
                else if (catID == "alta") {
                    var addStyle = { rotate_with_map: false };
                    imgMarkerBaseStyle = tf.js.ShallowMerge(imgMarkerBaseStyle, addStyle);
                    imgMarkerBaseHoverStyle = tf.js.ShallowMerge(imgMarkerBaseHoverStyle, addStyle);
                }
            }
            parsedData = data.features;
            for (var i in parsedData) {
                var thisFeature = parsedData[i]; thisFeature.properties = tf.urlapi.NormalizeJSONProperties(thisFeature.properties);
                if (!!preProcessDataItem) { preProcessDataItem(thisFeature.properties); }
                thisFeature.properties.hoverFeatures = createFeaturesFromSpecs(thisFeature.properties.hoverFeatureSpecs);
                thisFeature.properties.additionalFeatures = createFeaturesFromSpecs(thisFeature.properties.additionalFeatureSpecs);
            }
            if (!featureList) {
                var prefix = "http://", len_of_prefix = prefix.length;
                var properties = data.features[0].properties, label = properties[display_fields];
                if (tf.js.GetIsNonEmptyString(label)) {
                    isImageMarker = label.trim().toLowerCase().substring(0, len_of_prefix) == prefix;
                    createFeatureList();
                }
            }
        }
        //else { setTimeout(refresh, 5000); }
        return parsedData;
    }

    function getDLayerFeatureProps(mapFeature) { return tf.js.GetObjProperty(mapFeature, tf.consts.DLayerProperty); }

    function onFeatureClick(notification) {
        var props = getDLayerFeatureProps(notification.mapFeature);
        if (!!props) {
            if (props.dLayer == theThis) {
                if (showsInfoWindow && tf.browser.HasTouch()) { tf.urlapi.ShowdLayerInfoWindow(notification.mapFeature); }
                else if (!!props.windowOpen) { window.open(props.windowOpen, "_blank"); }
            }
        }
    }

    // for polylines and such associated with the dlayer marker
    function removeLastHoverFeatures() { for (var i in lastHoverFeatures) { featureLayer.DelMapFeature(lastHoverFeatures[i]); } lastHoverFeatures = []; }

    function addFeatures(features) { if (tf.js.GetIsValidObject(features)) { for (var i in features) { featureLayer.AddMapFeature(features[i]); } } }

    function onFeatureHoverInOut(notification) {
        var props = getDLayerFeatureProps(notification.mapFeature);
        if (!!props) {
            if (props.dLayer == theThis) {
                removeLastHoverFeatures();
                if (notification.isInHover) {
                    addFeatures(lastHoverFeatures = props.properties.hoverFeatures);
                    featureLayer.SetZIndex(topZIndex);
                    if (showsInfoWindow) {
                        tf.urlapi.ShowdLayerInfoWindow(notification.mapFeature);
                    }
                }
                else { featureLayer.SetZIndex(zIndex); }
            }
        }
    }

    function setExtent() {
        var refreshOnRes = settings.dLayerList.GetRefreshOnResChange();
        if (refreshOnRes) { settings.dLayerList.SetRefreshOnResChange(false); }
        if (!!featuresExtent) { map.SetVisibleExtent(featuresExtent); }
        //tf.GetDebug().AddExtent(featuresExtent, featureLayer);
        if (refreshOnRes) { setTimeout(function () { settings.dLayerList.SetRefreshOnResChange(true); }, 1000); }
    }

    function mergeExtent() {
        if (!!featuresExtent) {
            var visibleExtent = map.GetVisibleExtent();
            var mergedExtent = tf.js.MergeMapExtents(visibleExtent, featuresExtent);
            var refreshOnRes = settings.dLayerList.GetRefreshOnResChange();
            if (refreshOnRes) { settings.dLayerList.SetRefreshOnResChange(false); }
            map.SetVisibleExtent(mergedExtent);
            if (refreshOnRes) { setTimeout(function () { settings.dLayerList.SetRefreshOnResChange(true); }, 1000); }
        }
    }

    function calcExtent(maxRecords) {
        featuresExtent = null;
        if (!!featureList) {
            var mapFeatures = featureList.GetFeatures();
            var nAddToExtent = tf.js.GetIntNumberInRange(maxRecords, 0, mapFeatures.length, mapFeatures.length);
            if (nAddToExtent > 0) {
                for (var i = 0 ; i < nAddToExtent ; ++i) {
                    var feature = mapFeatures[i], featureCoords = feature.GetPointCoords();
                    if (!featuresExtent) { featuresExtent = [featureCoords[0], featureCoords[1], featureCoords[0], featureCoords[1]]; }
                    else { featuresExtent = tf.js.UpdateMapExtent(featuresExtent, featureCoords); }
                }
            }
        }
    }

    function onFeaturesAdded(notification) {
        featuresExtent = null;
        var count = 0;
        for (var i in notification.items) {
            var keyedItem = notification.items[i];
            var mapKeyedFeature = featureList.GetFeatureFromItem(keyedItem);
            var mapFeature = mapKeyedFeature.GetMapFeature();
            var itemData = keyedItem.GetData();
            var properties = itemData.properties;
            var featureCoords = mapFeature.GetPointCoords();

            if (count < nDLayerExtent) {
                if (!featuresExtent) { featuresExtent = [featureCoords[0], featureCoords[1], featureCoords[0], featureCoords[1]]; }
                else { featuresExtent = tf.js.UpdateMapExtent(featuresExtent, featureCoords); }
                count++;
            }

            mapFeature.GetLayer = function () { return featureLayer };
            //if (properties.Display_Label !== undefined) { tf.urlapi.BuildDLayerFeatureInfoWindow(properties); }
            tf.js.SetObjProperty(mapFeature, tf.consts.DLayerProperty, { properties: properties, label: legend, map: map, dLayer: theThis, linkTargetStr: linkTargetStr });
            addFeatures(properties.additionalFeatures);
        }
        map.ShowSomeKeyedFeatures(featureList, notification.keys, true);
        if (!!count) { nDLayerExtent = 0; mergeExtent(); }
    }

    function onFeaturesDeleted(notification) {
        map.ShowSomeKeyedFeatures(featureList, notification.keys, false);
    }

    function getStyle(mapFeature, isHover) {
        var style;
        var keyedItem = !!mapFeature ? mapFeature.GetKeyedItem() : null;

        if (keyedItem) {
            var itemProperties = keyedItem.GetData().properties;
            //tf.GetDebug().FileLog("props", itemProperties);
            if (usingCustomMarkers) {
                var baseTextStyle = isHover ? markerHoverStyle : markerStyle;

                if (tf.js.GetIsNonEmptyArray(baseTextStyle)) {
                    style = [];
                    for (var i in baseTextStyle) { style.push(tf.js.ReplaceObjectWithValues(tf.js.ShallowMerge(baseTextStyle[i]), itemProperties)); }
                }
                else { style = tf.js.ShallowMerge(baseTextStyle); style = tf.js.ReplaceObjectWithValues(style, itemProperties); }
            }
            else {
                var label = itemProperties[display_fields];
                var prefix = "http://", len_of_prefix = prefix.length;
                var isImageMarker = label.trim().toLowerCase().substring(0, len_of_prefix) == prefix;

                if (isImageMarker) {
                    var customPerMarkerStyle = { icon_url: label };
                    style = isHover ? tf.js.ShallowMerge(imgMarkerBaseHoverStyle, customPerMarkerStyle) : tf.js.ShallowMerge(imgMarkerBaseStyle, customPerMarkerStyle);
                }
                else {
                    var baseTextStyle = isHover ? textMarkerBaseHoverStyle : textMarkerBaseStyle;
                    var customPerMarkerStyle = { label: label/*, marker_color: layerColor*/ };

                    if (tf.js.GetIsNonEmptyArray(baseTextStyle)) { style = baseTextStyle.slice(0); style[0] = tf.js.ShallowMerge(style[0], customPerMarkerStyle); }
                    else { style = tf.js.ShallowMerge(baseTextStyle, customPerMarkerStyle); }
                }
            }
        }
        return style;
    }

    function getNormalStyle(mapFeature) { return getStyle(mapFeature, false); }
    function getHoverStyle(mapFeature) { return getStyle(mapFeature, true); }

    function createFeatureList() {

        featureList = new tf.map.KeyedFeatureList({
            featureStyleSettings: { style: getNormalStyle, hoverStyle: getHoverStyle },
            getGeometryFromData: getGeometryFromData, propertyName: tf.consts.KeyedFeatureFromDLayer,
            onCreated: undefined, keyedList: keyedList, layerName: legend
        });

        addedFeaturesListener = featureList.AddListener(tf.consts.keyedFeaturesAddedEvent, onFeaturesAdded);
        deletedFeaturesListener = featureList.AddListener(tf.consts.keyedFeaturesDeletedEvent, onFeaturesDeleted);

        addListenersToMap(map);
    }

    function addListenersToMap(map) {
        if (!!(map = tf.js.GetMapFrom(map))) {
            if (!mapListeners) { mapListeners = []; }
            mapListeners.push({
                hover: map.AddListener(tf.consts.mapFeatureHoverInOutEvent, onFeatureHoverInOut),
                click: map.AddListener(tf.consts.mapFeatureClickEvent, onFeatureClick)
            });
        }
    }

    function updateDownloadURL() {
        if (!!map) {
            var lowerURL = url_xml.toLowerCase();
            if (lowerURL.indexOf('.txt') == -1) {
                var currentLevel = map.GetLevel(), currentCenter = map.GetCenter();
                downloadURL = url_xml + "&x1=" + currentCenter.Longitude + "&y1=" + currentCenter.Latitude + "&cres=" + map.GetResolution() + "&timestamp=" + (new Date()).getTime();
            }
            else {
                downloadURL = url_xml;
            }
            //tf.GetDebug().LogIfTest(downloadURL);
        }
        //downloadURL = "http://localhost/terramap/apps/bq.txt";
    }

    function needsUpdateItemData(updateObj) { return false; }
    function getKeyFromItemData(itemData) { return itemData.properties.Display_Link_Detail; }
    function getGeometryFromData(itemData) { return itemData.geometry; }

    function initialize() {
        if (tf.js.GetIsValidObject(settings)) {
            showsInfoWindow = true;
            preProcessDataItem = tf.js.GetFunctionOrNull(settings.preProcessDataItem);
            preProcessServiceData = tf.js.GetFunctionOrNull(settings.preProcessServiceData);
            legend = settings.dLayerLegend;
            map = settings.map;
            url_xml = settings.dLayerData ? unescape(settings.dLayerData) : "";
            display_fields = !!settings.dLayerField ? settings.dLayerField : "L";
            layer_select = typeof settings.dLayerSelect === "string" ? settings.dLayerSelect.toLowerCase() != "false" : !!settings.dLayerSelect;
            colors = settings.dLayerColors.split(",");
            zIndex = settings.zIndex;
            topZIndex = settings.topZIndex;
            index = settings.dLayerIndex;
            nDLayerExtent = tf.js.GetIntNumberInRange(settings.nDLayerExtent, 0, 999, 0);
            setOpacity(settings.opacity);
            defaultColors = ["#ffb27f", "#7fe5ff", "#ffe57f", "#7fb2ff", "#e6ff7f", "#807fff", "#b3ff7f", "#b37fff", "#80ff7f", "#e67fff", "#7fffb2", "#ff7fe5", "#7fffe5", "#ff7fb2"];
            nDefaultColors = defaultColors.length;
            layerColor = colors[0].length > 0 ? colors[0] : defaultColors[index % nDefaultColors];
            fontColor = colors[1].length > 0 ? colors[1] : "#000";
            url_xml = url_xml.replace(fileTypeXMLFilter, fileTypeGeoJSONReplace);
            updateDownloadURL();

            linkTargetStr = settings.linkTargetStr;

            if (tf.js.GetIsValidObject(settings.markerStyle)) {
                markerStyle = settings.markerStyle;
                markerHoverStyle = tf.js.GetIsValidObject(settings.markerHoverStyle) ? settings.markerHoverStyle : markerStyle;
                usingCustomMarkers = true;
            }
            /*else {*/
                imgMarkerBaseStyle = { icon: true, icon_anchor: [0.5, 0.5], scale: 1.0, zindex: 1 };
                imgMarkerBaseHoverStyle = tf.js.ShallowMerge(imgMarkerBaseStyle, { scale: 1.5, zindex: 2 });
                fontHeight = tf.GetStyles().GetSubStyles().markerFontSizePXNumber;
                /*textMarkerBaseStyle = {
                    marker: true, font_height: fontHeight, border_color: "#000", border_width: 2, zindex: 1, line_color: "#fff", marker_arrowlength: 12, line_opacity: 0.6, line_width: 2,
                    marker_color: layerColor, font_color: fontColor, marker_opacity: 0.8, border_opacity: 0.6
                };*/
                textMarkerBaseStyle = {
                    marker: true, font_height: fontHeight, border_color: "#000", border_width: 2, zindex: 1, line_color: "#fff", marker_arrowlength: 12, line_opacity: 60, line_width: 2,
                    marker_color: layerColor, font_color: fontColor, marker_opacity: 85, border_opacity: 60
                };
                textMarkerBaseHoverStyle = tf.js.ShallowMerge(textMarkerBaseStyle, { font_height: fontHeight + 1, zindex: 2, border_color: "#000", border_width: 3/*, scale: 1.1*/, marker_arrowlength: 8 });
            //}

            keyedList = (keyedListsTimedRefresh = new tf.js.KeyedListsPeriodicRefresh({
                onCreated: settings.onCreated, retryOnFail: false,
                serviceURL: function () { return downloadURL; },
                preProcessServiceData: myPreProcessServiceData, useRedirect: false,
                refreshCallback: settings.refreshCallback, refreshMillis: 0, refreshOnCreate: true,
                keyedLists: [{
                    name: legend, keepNotUpdated: true, getKeyFromItemData: getKeyFromItemData, needsUpdateItemData: needsUpdateItemData
                }]
            })).GetKeyedList(legend);
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * @public
 * @class
 * @summary - DLayer List instances include one or more [DLayer]{@link tf.urlapi.DLayer} instances
 * @param {object} settings - creation settings
 * @param {tf.map.Map} settings.map - a map instance to display DLayer features
 * @param {function} settings.preProcessDataItem - called to filter each dlayer data record
 * @param {function} settings.preProcessServiceData - called to filter the list of dlayer records
 * @param {enumerable<tf.types.URLDLayerSettings>} settings.dLayersInfo - settings objects, one for each DLayer to be created
*/
tf.urlapi.DLayerList = function (settings) {

    var theThis, dLayers, dLayersOpacity, topZIndex, map, nDLayerExtent, resChangeListener, refreshOnResChange;

    this.AddListenersToMap = function (map) { for (var i in dLayers) { dLayers[i].AddListenersToMap(map); } }

    this.SetRefreshOnResChange = function (bool) { refreshOnResChange = !!bool; }
    this.GetRefreshOnResChange = function () { return refreshOnResChange; }

    /**
     * @public
     * @function
     * @summary - Retrieves the highest zindex used by [DLayer]{@link tf.urlapi.DLayer} instances in this DLayer List instance
     * @returns {number} - | {@link number} the zIndex
    */
    this.GetTopZIndex = function () { return topZIndex; }

    /**
     * @public
     * @function
     * @summary - Moves the given [DLayer]{@link tf.urlapi.DLayer} instance to the top of all other instances in this DLayer List instance
     * @param {tf.urlapi.DLayer} dLayer - the given DLayer instance
     * @returns {void} - | {@link void} no return value
    */
    this.MoveToTopZIndex = function (dLayer) { return moveToTopZIndex(dLayer); }

    /**
     * @public
     * @function
     * @summary - Sets the opacity of all [DLayer]{@link tf.urlapi.DLayer} instances in this DLayer List instance
     * @param {tf.types.opacity01} opacity - the new opacity
     * @returns {void} - | {@link void} no return value
    */
    this.SetAllOpacity = function (opacity) { for (var i in dLayers) { var dLayer = dLayers[i]; dLayer.SetOpacity(opacity); } }

    /**
     * @public
     * @function
     * @summary - Removes all features from all [DLayer]{@link tf.urlapi.DLayer} instances associated with this DLayer List instance
     * @returns {void} - | {@link void} no return value
    */
    this.RemoveAll = function () { for (var i in dLayers) { var dLayer = dLayers[i]; dLayer.RemoveAll(); } }

    /**
     * @public
     * @function
     * @summary - Refreshes all [DLayer]{@link tf.urlapi.DLayer} instances associated with this DLayer List instance
     * @returns {void} - | {@link void} no return value
    */
    this.RefreshAll = function () { for (var i in dLayers) { var dLayer = dLayers[i]; dLayer.Refresh(); } }

    this.SetShowsInfoWindow = function (bool) { for (var i in dLayers) { var dLayer = dLayers[i]; dLayer.SetShowsInfoWindow (bool); }; }

//    this.RemoveFromMap = function () { for (var i in dLayers) { var dLayer = dLayers[i]; dLayer.RemoveFromMap(opacity); } dLayers = []; }

    /**
     * @public
     * @function
     * @summary - Retrieves a [DLayer]{@link tf.urlapi.DLayer} instance associated with this DLayer List instance by the given index
     * @param {number} index - the given index
     * @returns {tf.urlapi.DLayer} - | {@link tf.urlapi.DLayer} the DLayer instance, or {@link void} if <b>index</b> is invalid
    */
    this.Get = function (index) { return get(index); }

    /**
     * @public
     * @function
     * @summary - Retrieves the number of [DLayer]{@link tf.urlapi.DLayer} instances associated with this DLayer List instance
     * @returns {number} - | {@link number} the number of instances
    */
    this.GetCount = function () { return dLayers.length; }

    function isValidDLayerIndex(index) { return !!dLayers ? index >= 0 && index < dLayers.length : false; }

    function get(index) { return isValidDLayerIndex(index) ? dLayers[index] : null; }

    function moveToTopZIndex(dLayer) {
        if (tf.js.GetIsInstanceOf(dLayer, tf.urlapi.DLayer) && dLayer.GetDLayerList() == theThis) {
            var thisZIndex = dLayer.GetZIndex();

            for (var i in dLayers) {
                var thisDLayer = dLayers[i];

                if (thisDLayer != dLayer) {
                    var thisDLayerZIndex = thisDLayer.GetZIndex();
                    if (thisDLayerZIndex > thisZIndex) {
                        thisDLayer.SetZIndex(thisDLayerZIndex - 1);
                    }
                }
            }

            dLayer.SetZIndex(topZIndex - 1);
        }
    }

    function add(dLayerInfo, zIndex) {
        var indexInDLayers = dLayers.length;
        var dLayerSettings = tf.js.ShallowMerge(dLayerInfo, {
            indexInDLayers: indexInDLayers,
            dLayerList: theThis, map: map, zIndex: zIndex, topZIndex: topZIndex, opacity: settings.opacity, preProcessDataItem: settings.preProcessDataItem,
            preProcessServiceData: settings.preProcessServiceData,
            linkTargetStr: settings.linkTargetStr
        });

        if (indexInDLayers == 0) { dLayerSettings.nDLayerExtent = nDLayerExtent; }

        var newDLayer = new tf.urlapi.DLayer(dLayerSettings);
        dLayers.push(newDLayer);
    }

    function initialize() {
        var minZIndex = 10;
        var thisZIndex = 0;
        settings = tf.js.GetValidObjectFrom(settings);
        nDLayerExtent = tf.js.GetIntNumberInRange(settings.nDLayerExtent, 0, 999, 0);
        if (!!(map = tf.js.GetMapFrom(settings.map))) {
            var dLayersInfo = tf.js.GetIsNonEmptyArray(settings.dLayersInfo) ? settings.dLayersInfo : [];
            var nDLayers = dLayersInfo.length;
            topZIndex = nDLayers + minZIndex;
            var thisDLayerZIndex = topZIndex;
            dLayers = [];
            refreshOnResChange = settings.refreshOnResChange != undefined ? !!settings.refreshOnResChange : true;
            for (var i in dLayersInfo) {
                add(dLayersInfo[i], --thisDLayerZIndex);
            }
            resChangeListener = map.AddListener(tf.consts.mapResolutionChangeEvent, function (notification) {
                if (!!refreshOnResChange) {
                    theThis.RefreshAll();
                }
            });
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

