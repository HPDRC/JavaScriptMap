"use strict";

/**
* class MVideo
* @public
* @class
* @namespace
* @description without description
*/
tf.apps.MVideo = {};

tf.apps.MVideo.KeyedListName = "MVideos";

tf.apps.MVideo.UseRedirect = false;

tf.apps.MVideo.RouteStartFeaturePropertyName = "routeStart";
tf.apps.MVideo.RouteFeaturePropertyName = "route";
tf.apps.MVideo.LifeFeedFeaturePropertyName = "lifeFeed";

tf.apps.MVideo.DefaultLiveFeedsListRefreshIntervalMillis = 10000;
tf.apps.MVideo.DefaultLiveFeedsFeedTrackRefreshIntervalMillis = 5000;

tf.apps.MVideo.GetMVideoHostURL = function () {
    var hostURL;
    if (tf.platform.GetIsTest()) { hostURL = "http://alaska.cs.fiu.edu/mvideo/test/mov/"; }
    else if (tf.platform.GetIsStage()) { hostURL = "http://alaska.cs.fiu.edu/mvideo/stage/"; }
    else { hostURL = "http://alaska.cs.fiu.edu/mvideo/"; }
    return hostURL;
}

tf.apps.MVideo.GetLiveFeedsLiveStreamServiceURL = function () { return "rtmp://alaska.cs.fiu.edu:1935/live/"; }

tf.apps.MVideo.GetLiveFeedsHostURL = function () { return "http://alaska.cs.fiu.edu/stream/"; }

tf.apps.MVideo.LiveFeedTrackerPropertyName = "liveFeedTracker";

tf.apps.MVideo.LiveFeedTestNameBase = "testFeed#";
tf.apps.MVideo.AddTestLiveFeeds = false;


tf.apps.MVideo.MVideoList = function (settings) {

    var theThis = null, keyedListsTimedRefresh = null, keyedList = null, downloadURL = null, hostURL = null;

    this.Refresh = function (fromDownloadURL) { downloadURL = tf.js.GetNonEmptyString(fromDownloadURL, ""); keyedListsTimedRefresh.RefreshNow(); }
    this.GetKeyedList = function () { return keyedList; }

    function preProcessServiceData(data) {
        var parsedData = [];
        if (tf.js.GetIsValidObject(data)) {
            for (var i in data) {
                var dataItem = data[i];
                var existingItem = keyedList.GetItem(dataItem.id);
                var needsInclude = !existingItem || existingItem.GetData().properties.viewed != dataItem.viewed;
                if (needsInclude) {
                    var newDataItem = {};
                    var properties = {
                        id: dataItem.id, duration: dataItem.duration, route: dataItem.route, reduced: dataItem.reduced,
                        projName: dataItem.projectName, uploadTime: dataItem.uploadTime.split(' ')[0],
                        uid: dataItem.uid, vid: dataItem.vid, viewed: dataItem.viewed,
                        videoUrl: hostURL + "FileSave/" + dataItem.id + "/video.m4v",
                        imageFile: hostURL + "FileSave/" + dataItem.id + "/thumbnailbig.jpg",
                        minMaxSpeedAltInfo: tf.helpers.CalcMinMaxSpeedAlt(dataItem.route.path),
                        directions: tf.helpers.CalcDirectionsLatLonArray(dataItem.route.path),
                        times: tf.helpers.CreateTimesWithoutGap(dataItem.route.time)
                    };
                    properties.maxSpeedMPH = properties.minMaxSpeedAltInfo.maxSpeed;
                    properties.maxAltitudeMeter = properties.minMaxSpeedAltInfo.maxAlt;
                    properties.routeGeomSpecs = { geometry: { type: "linestring", coordinates: tf.helpers.GetCoordinatesFromLatLonArray(properties.route.path) } };
                    properties.reducedRouteGeomSpecs = { geometry: { type: "linestring", coordinates: tf.helpers.GetCoordinatesFromLatLonArray(properties.reduced) } };
                    properties.startPointGeomSpecs = { geometry: { type: "point", coordinates: properties.reducedRouteGeomSpecs.geometry.coordinates[0] } };
                    newDataItem.properties = properties;
                    parsedData.push(newDataItem);
                }
            }
        }
        return parsedData;
    }

    function needsUpdateItemData(updateObj) { return updateObj.itemData.properties.viewed != updateObj.itemDataSet.properties.viewed; }
    function getKeyFromItemData(itemData) { return itemData.properties.id; }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        var listName = tf.js.GetNonEmptyString(settings.listName, tf.apps.MVideo.KeyedListName);
        hostURL = tf.js.GetNonEmptyString(settings.hostURL, tf.apps.MVideo.GetMVideoHostURL());
        keyedList = (keyedListsTimedRefresh = new tf.js.KeyedListsPeriodicRefresh({
            onCreated: settings.onCreated, useRedirect: tf.apps.MVideo.UseRedirect, serviceURL: function () { return downloadURL; },
            preProcessServiceData: preProcessServiceData, refreshCallback: settings.refreshCallback, refreshMillis: 0, refreshOnCreate: false,
            keyedLists: [{
                name: listName, keepNotUpdated: true, getKeyFromItemData: getKeyFromItemData, needsUpdateItemData: needsUpdateItemData
            }]
        })).GetKeyedList(listName);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.apps.MVideo.VideoFeatureLists = function (settings) {
    var theThis = null;
    var routeFeatureList = null, routeStartFeatureList = null, map = null;
    var addedRouteListener = null, deletedRouteListener = null, addedRouteStartListener = null, deletedRouteStartListener = null;

    this.GetRouteFeatureList = function () { return routeFeatureList; }
    this.GetRouteStartFeatureList = function () { return routeStartFeatureList; }

    function onRouteFeaturesAdded(notification) { map.ShowSomeKeyedFeatures(routeFeatureList, notification.keys, true); }
    function onRouteFeaturesDeleted(notification) { map.ShowSomeKeyedFeatures(routeFeatureList, notification.keys, false); }

    function onRouteStartFeaturesAdded(notification) { map.ShowSomeKeyedFeatures(routeStartFeatureList, notification.keys, true); }
    function onRouteStartFeaturesDeleted(notification) { map.ShowSomeKeyedFeatures(routeStartFeatureList, notification.keys, false); }

    function getDefaultRouteFeatureSettings() {
        var colorRoute = "#FFEF22", colorHoverRoute = "#FF8040", colorLineDash = "#000";
        var lineDashSpecs = { zindex: 2, line: true, line_width: 2, line_color: colorLineDash, line_dash: [20, 10] };
        var subStyles = [{ zindex: 1, line: true, line_width: 6, line_color: colorRoute }, lineDashSpecs];
        var dashLineHoverSpecs = tf.js.ShallowMerge(lineDashSpecs, { zindex: 6 });
        var hoverSpecs = [{ zindex: 5, line: true, line_width: 8, line_color: colorHoverRoute }, dashLineHoverSpecs];
        return { style: subStyles, hoverStyle: hoverSpecs };
    }

    function getDefaultRouteStartFeatureSettings() {
        var icon = tf.platform.MakePlatformPath("image/videoPlay.png");
        var hoverIcon = tf.platform.MakePlatformPath("image/videoPlaySel.png");
        var iconScale = 0.08, hoverScale = 1.25;
        var subStyles = { zindex: 3, scale: iconScale, icon: true, icon_anchor: [0.5, 0.5], icon_url: icon };
        var hoverSpecs = tf.js.ShallowMerge(subStyles, { scale: iconScale * hoverScale, zindex: 7, icon_url: hoverIcon });
        return { style: subStyles, hoverStyle: hoverSpecs };
    }

    function getRouteGeometryFromData(itemData) { return itemData.properties.reducedRouteGeomSpecs.geometry; }
    function getRouteStartGeometryFromData(itemData) { return itemData.properties.startPointGeomSpecs.geometry; }

    function createFeatureList(layerName, propertyName, featureSettings, defaultFeatureSettings, getGeometryFromData) {
        var featureSettings = tf.js.GetIsValidObject(featureSettings) ? featureSettings : defaultFeatureSettings;
        return new tf.map.KeyedFeatureList({
            featureStyleSettings: featureSettings, getGeometryFromData: getGeometryFromData, propertyName: propertyName,
            onCreated: settings.onCreated, keyedList: settings.keyedList, layerName: layerName
        });
    }

    function initialize() {
        routeFeatureList = createFeatureList(settings.routeLayerName, tf.apps.MVideo.RouteFeaturePropertyName, 
            settings.routeFeatureSettings, getDefaultRouteFeatureSettings(), getRouteGeometryFromData);
        routeStartFeatureList = createFeatureList(settings.routeStartLayerName, tf.apps.MVideo.RouteStartFeaturePropertyName, 
            settings.routeStartFeatureSettings, getDefaultRouteStartFeatureSettings(), getRouteStartGeometryFromData);

        addedRouteListener = routeFeatureList.AddListener(tf.consts.keyedFeaturesAddedEvent, onRouteFeaturesAdded);
        deletedRouteListener = routeFeatureList.AddListener(tf.consts.keyedFeaturesDeletedEvent, onRouteFeaturesDeleted);

        addedRouteStartListener = routeStartFeatureList.AddListener(tf.consts.keyedFeaturesAddedEvent, onRouteStartFeaturesAdded);
        deletedRouteStartListener = routeStartFeatureList.AddListener(tf.consts.keyedFeaturesDeletedEvent, onRouteStartFeaturesDeleted);

        map = tf.js.GetMapFrom(settings.map);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.apps.MVideo.LiveFeedsList = function (settings) {

    var theThis = null, keyedListsTimedRefresh = null, keyedList = null, hostURL = null;

    this.GetKeyedList = function () { return keyedList; }
    this.Refresh = function() { return keyedListsTimedRefresh.RefreshNow(); }

    var timeStart = new Date().getTime();

    function preProcessServiceData(data) {
        var parsedData = [];
        if (tf.js.GetIsValidObject(data)) {
            var instanceList = data.instanceList;

            if (tf.js.GetIsValidObject(instanceList)) {
                for (var i in instanceList) {
                    var thisInstance = instanceList[i];

                    if (tf.js.GetIsValidObject(thisInstance) && tf.js.GetIsValidObject(thisInstance.incomingStreams)) {
                        var thisIncomingStreams = thisInstance.incomingStreams;

                        for (var j in thisIncomingStreams) {
                            var thisIncomingStream = thisIncomingStreams[j];

                            if (tf.js.GetIsValidObject(thisIncomingStream) && tf.js.GetIsNonEmptyString(thisIncomingStream.name)) {
                                var newDataItem = {};
                                var properties = { name: thisIncomingStream.name };
                                var keyedItem = keyedList.GetItem(properties.name);
                                var coords;
                                if (!!keyedItem) {
                                    var itemData = keyedItem.GetData();
                                    coords = itemData.geometry.coordinates.splice(0);
                                }
                                else {
                                    coords = [tf.consts.defaultLongitude, tf.consts.defaultLatitude];
                                }
                                newDataItem.properties = properties;
                                newDataItem.geometry = { type: "point", coordinates: coords };
                                parsedData.push(newDataItem);
                            }
                        }
                    }
                }
            }
        }

        if (tf.apps.MVideo.AddTestLiveFeeds) {
            var elapsed = new Date().getTime() - timeStart;
            var baseName = tf.apps.MVideo.LiveFeedTestNameBase;
            var nTests = 5;

            for (var i = 0 ; i < nTests ; ++i) {
                var thisName = baseName + i;

                var testItem = keyedList.GetItem(thisName);

                if (!testItem) {
                    if (elapsed < 15000) {
                        var newDataItem = {};
                        var properties = { name: thisName };
                        newDataItem.properties = properties;
                        newDataItem.geometry = { type: "point", coordinates: [tf.consts.defaultLongitude, tf.consts.defaultLatitude] };
                        parsedData.push(newDataItem);
                    }
                }
                else {
                    if (elapsed < 60000) {
                        var dataItem = testItem.GetData();
                        parsedData.push(dataItem);
                    }
                }
            }
        }

        return parsedData;
    }

    function needsUpdateItemData(updateObj) {
        var curGeom = updateObj.itemData.geometry.coordinates;
        var newGeom = updateObj.itemDataSet.geometry.coordinates;
        return curGeom[0] != newGeom[0] || curGeom[1] != newGeom[1];

    }
    function getKeyFromItemData(itemData) { return itemData.properties.name; }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        var listName = tf.js.GetNonEmptyString(settings.listName, tf.apps.MVideo.KeyedListName);
        var refreshMillis = tf.js.GetIsNonNegativeNumber(settings.refreshMillis) ? settings.refreshMillis : tf.apps.MVideo.DefaultLiveFeedsListRefreshIntervalMillis;
        //refreshMillis = 0;
        hostURL = tf.js.GetNonEmptyString(settings.hostURL, tf.apps.MVideo.GetLiveFeedsHostURL());
        keyedList = (keyedListsTimedRefresh = new tf.js.KeyedListsPeriodicRefresh({
            onCreated: settings.onCreated, useRedirect: tf.apps.MVideo.UseRedirect, serviceURL: hostURL + "handler.ashx",
            preProcessServiceData: preProcessServiceData, refreshCallback: settings.refreshCallback, refreshMillis: refreshMillis, refreshOnCreate: true,
            keyedLists: [{
                name: listName, keepNotUpdated: false, getKeyFromItemData: getKeyFromItemData, needsUpdateItemData: needsUpdateItemData
            }]
        })).GetKeyedList(listName);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.apps.MVideo.LiveFeedTracker = function (settings) {

    var theThis, liveFeedName, keyedItem, locationRefresh;
    var debugInterval;

    this.OnDelete = function () { return onDelete(); }

    function isDebugFeed() { return !!liveFeedName && liveFeedName.substring(0, tf.apps.MVideo.LiveFeedTestNameBase.length) == tf.apps.MVideo.LiveFeedTestNameBase; }

    function onDelete() {
        if (keyedItem) {
            tf.js.SetObjProperty(keyedItem, tf.apps.MVideo.LiveFeedTrackerPropertyName, null);
            keyedItem = null;
        }

        if (!!locationRefresh) { locationRefresh.OnDelete(); locationRefresh = null; }
        if (!!debugInterval) { clearInterval(debugInterval); debugInterval = null; }
        liveFeedName = null;
    } 

    function updateLocation(notification) {
        if (!!keyedItem) {
            var itemData = keyedItem.GetData();
            if (!!itemData) {
                var coords = itemData.geometry.coordinates;
                var radius = 0.0003;
                if (isDebugFeed()) {
                    coords[0] += (Math.random() * radius - radius / 2);
                    coords[1] += (Math.random() * radius - radius / 2);
                }
                else {
                    var data = notification.data;

                    if (tf.js.GetIsValidObject(data) && data.lat != undefined && data.lon != undefined) {
                        coords[0] = tf.js.GetLongitudeFrom(data.lon);
                        coords[1] = tf.js.GetLatitudeFrom(data.lat);
                    }
                }
                keyedItem.Update(itemData);
            }
        }
    }

    function initialize() {
        if (tf.js.GetIsValidObject(settings)) {
            if (tf.js.GetIsInstanceOf(settings.keyedItem, tf.js.KeyedItem)) {
                keyedItem = settings.keyedItem;

                var data = keyedItem.GetData();

                if (tf.js.GetIsValidObject(data.properties) && tf.js.GetIsNonEmptyString(data.properties.name)) {
                    liveFeedName = data.properties.name;
                }
                else { keyedItem = null; }

                if (!!keyedItem) {
                    if (isDebugFeed()) {
                        debugInterval = setInterval(updateLocation, /*100/**/tf.apps.MVideo.DefaultLiveFeedsFeedTrackRefreshIntervalMillis/**/);
                    }
                    else {
                        var url = tf.apps.MVideo.GetLiveFeedsHostURL() + "locator.ashx?name=" + liveFeedName;
                        locationRefresh = new tf.ajax.PeriodicJSONGet({
                            url: url,
                            refreshMillis: tf.apps.MVideo.DefaultLiveFeedsFeedTrackRefreshIntervalMillis,
                            onRefresh: updateLocation,
                            optionalScope: theThis,
                            useRedirect: tf.apps.MVideo.UseRedirect
                        });
                    }

                    tf.js.SetObjProperty(keyedItem, tf.apps.MVideo.LiveFeedTrackerPropertyName, theThis);
                }
            }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.apps.MVideo.LiveFeedsFeatureList = function (settings) {
    var theThis = null;
    var liveFeedsFeatureList = null, map = null;
    var addedLifeFeedsListener = null, deletedLifeFeedsListener = null;
    var fontHeight, imgMarkerBaseStyle, imgMarkerBaseHoverStyle, textMarkerBaseStyle, textMarkerBaseHoverStyle;

    this.GetLiveFeedsFeatureList = function () { return liveFeedsFeatureList; }

    function onLifeFeedsFeaturesAdded(notification) {
        map.ShowSomeKeyedFeatures(liveFeedsFeatureList, notification.keys, true);
        for (var i in notification.items) {
            new tf.apps.MVideo.LiveFeedTracker({ keyedItem: notification.items[i] });
        }
    }
    function onLifeFeedsFeaturesDeleted(notification) {
        map.ShowSomeKeyedFeatures(liveFeedsFeatureList, notification.keys, false);
        for (var i in notification.items) {
            var liveFeedTracker = tf.js.GetObjProperty(notification.items[i], tf.apps.MVideo.LiveFeedTrackerPropertyName);
            if (!!liveFeedTracker) { liveFeedTracker.OnDelete(); }
        }
    }

    function getStyle(mapFeature, isHover) {
        var style;
        var keyedItem = !!mapFeature ? mapFeature.GetKeyedItem() : null;

        if (keyedItem) {
            var itemProperties = keyedItem.GetData().properties;
            var label = itemProperties.name;
            var customPerMarkerStyle = { label: label };
            style = isHover ? tf.js.ShallowMerge(textMarkerBaseHoverStyle, customPerMarkerStyle) : tf.js.ShallowMerge(textMarkerBaseStyle, customPerMarkerStyle);
        }
        return [style, { snaptopixel: false, shape: true, circle: true, circle_radius: 8, fill: true, line: true, fill_color: "#22b", fill_alpha: 50, line_width: 2, line_color: "#DD1", zindex: 8 }];
    }

    function getNormalStyle(mapFeature) { return getStyle(mapFeature, false); }
    function getHoverStyle(mapFeature) { return getStyle(mapFeature, true); }

    function getLiveFeedGeometryFromData(itemData) { return itemData.geometry; }

    function createFeatureList(layerName, propertyName, featureSettings, getGeometryFromData) {
        var featureSettings = tf.js.GetIsValidObject(featureSettings) ? featureSettings : { style: getNormalStyle, hoverStyle: getHoverStyle };
        return new tf.map.KeyedFeatureList({
            featureStyleSettings: featureSettings, getGeometryFromData: getGeometryFromData, propertyName: propertyName,
            onCreated: settings.onCreated, keyedList: settings.keyedList, layerName: layerName
        });
    }

    function initialize() {
        map = tf.js.GetMapFrom(settings.map);
        fontHeight = tf.GetStyles().GetSubStyles().markerFontSizePXNumber * 1.2;
        textMarkerBaseStyle = { marker: true, font_height: fontHeight, font_color: "#FF1", border_color: "#DD1", border_width: 2, zindex: 4, marker_color: "#22b" }
        textMarkerBaseHoverStyle = tf.js.ShallowMerge(textMarkerBaseStyle, { font_height: fontHeight + 2, zindex: 7, border_color: "#FF1", border_width: 3 });
        liveFeedsFeatureList = createFeatureList(settings.liveFeedsLayerName, tf.apps.MVideo.LifeFeedFeaturePropertyName,
            settings.liveFeedsFeatureListSettings, getLiveFeedGeometryFromData);
        addedLifeFeedsListener = liveFeedsFeatureList.AddListener(tf.consts.keyedFeaturesAddedEvent, onLifeFeedsFeaturesAdded);
        deletedLifeFeedsListener = liveFeedsFeatureList.AddListener(tf.consts.keyedFeaturesDeletedEvent, onLifeFeedsFeaturesDeleted);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.apps.MVideo.LiveStreamPlayer = function (settings) {

    var theThis, isPlaying, jw_width, jw_height, container, divPlayer, divContainerStyle;
    var liveFeedContainerDivID = "liveFeedPlayerContainer", liveFeedPlayerDivID = "liveFeedPlayer";

    this.PlayStream = function (streamURL) { return playStream(streamURL); } 
    this.StopPlay = function () { return stopPlay(); }
    this.GetIsPlaying = function () { return isPlaying; }

    function playStream(streamURL) {
        divContainerStyle.display = 'block';
        jwplayer(liveFeedPlayerDivID).setup({
            height: jw_height, width: jw_width, stretching: 'exactfit', sources: [{ file: streamURL }], rtmp: { bufferlength: 3 }
        });
        jwplayer(liveFeedPlayerDivID).onMeta(function (event) { });
        jwplayer(liveFeedPlayerDivID).play();
        isPlaying = true;
    }

    function stopPlay() {
        if (isPlaying) {
            jwplayer(liveFeedPlayerDivID).stop();
            divContainerStyle.display = 'none';
            isPlaying = false;
        }
    }

    function createPlayerPopup() {
        if (!container) {
            var style = {
                position: "absolute", display: "none", backgroundColor: "#fff", width: jw_width + "px", height: jw_height + "px",
                right: "24em", bottom: "10em", margin: "0px", padding: "0px", border: "0px", zIndex: "2000"
            };
            container = new tf.dom.Div({ id: liveFeedContainerDivID });
            divPlayer = new tf.dom.Div({ id: liveFeedPlayerDivID });
            divContainerStyle = container.GetHTMLElement().style;
            tf.GetStyles().ApplyStyleProperties(container, style);
            divPlayer.AppendTo(container);
            container.AppendTo(document.body);
        }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        jw_width = settings.width !== undefined ? settings.width : 320;
        jw_height = settings.height !== undefined ? settings.height : 240;
        createPlayerPopup();
        isPlaying = false;
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.apps.MVideo.app = function (settings) {

    var theThis = null, styles = null, subStyles = null, mVideoHostURL = "";
    var documentTitle = null, singleMapHCFOnTheSide = null, createdCallBack = null, twoHorPaneLayout = null;
    var map = null, appContainerSizer = null, liveFeedItemKeyPlaying, mapEventListeners, featureLayer;
    var hcfLayout = null, loadingDataContentObj = null, downloadObj = null, rowStyle, rowHoverStyle, tableStyle;
    var toolBarObj = null, toolBarDiv = null, dLayers = null, videoPopup = null, liveVideosToolBarObj = null;
    var filterStr = null, uid = null, vid = null, userIsLoggedIn = false, liveVideosRefreshBtn = null;
    var singleVideoID = null, singleMapAppContentOnTheSide = null, isViewingVideos = null;
    var paramUnitName = "unit", unitKnotsName = "knots", unitMPHName = "mph";
    var unitKnotsDisplayName = "knots/meters", unitMPHDisplayName = "mph/feet";
    var defaultUnit = unitKnotsName;
    var usingKnots = defaultUnit == unitKnotsName;
    var unitDisplayName = usingKnots ? unitKnotsDisplayName : unitMPHDisplayName;
    var unitOtherDisplayName = usingKnots ? unitMPHDisplayName : unitKnotsDisplayName;
    var meterAltUnit = "m", feetAltUnit = "ft";
    var knotsSpeedUnit = "kn", mphSpeedUnit = "mph";
    var feetToMeters = 3.048037, mphToKnots = 0.868976;
    var speedUnit = usingKnots ? knotsSpeedUnit : mphSpeedUnit;
    var altUnit = usingKnots ? meterAltUnit : feetAltUnit;
    var speedConversion = null, altConversion = null;
    var uploaderFilter = null, dateFilter = null, dateFilterDisplay = null;
    var uploaderBtnToolTipStart = "List videos by ", uploaderBtnToolTipEnd = "this uploader";
    var allUploadersBtnToolTip = "List videos by all uploaders", videoUploadedBy = "Video uploaded by";
    var dateBtnToolTipStart = "List videos uploaded on ", dateBtnToolTipEnd = "this date";
    var allDatesBtnToolTip = "List videos uploaded on any date", videoUploadedIn = "Video uploaded on ";
    var filterFormContainerObj = null, filterFormContainerDiv = null, filterFormObj = null;
    var isShowingFilterForm = false, videoOrLiveToolBar = null, videoOrLiveButton = null;
    var filterButton = null, loginButton = null, logoutButton = null, manageButton = null, uploadButton = null, questionMarkButton = null, addVideosButton = null;
    var mVideoLogoSrc = tf.platform.MakePlatformPath("image/svg/mvideo.svg");
    var lastUploader = null, lastDate = null, inputUploader = null, inputDate = null, hasLiveFeedsComponents = null;

    this.GetIsisShowingLiveFeeds = function () { return hasLiveFeedsComponents; }

    this.RemoveFromMap = function () {
        if (map) {
            tf.events.DeleteDispatcherSet(mapEventListeners);
            map.RemoveLayer(featureLayer);
            if (videoPopup) { videoPopup.OnDelete(); videoPopup = null; }
        }
    }

    function startPlayVideo(keyedItem, clickedOnRoute, latClicked, lonClicked) {
        if (!isViewingVideos) { setViewingVideos(); }
        var props = keyedItem.GetData().properties;
        var timeStart = !!clickedOnRoute ? tf.helpers.HitTestRoute(props.route.path, props.times, latClicked, lonClicked).time01 : 0;
        stopPlayVideo(true);
        videoPopup.Play(props.videoUrl, props.routeGeomSpecs, props.route.path, props.directions, props.times, timeStart, speedConversion, speedUnit, altConversion, altUnit);

    }

    function onToggleFilterByUploader(keyedItem) {
        if (!singleVideoID) {
            var props = keyedItem.GetData().properties;
            var uploaderBtn = props.uploaderBtn;
            uploaderFilter = !!uploaderFilter ? null : props.uid;
            inputUploader.SetValue(!!uploaderFilter ? uploaderFilter : '');
            uploaderBtn.ChangeToolTip(makeUploaderBtnToolTip(props));
            showFilterForm();
        }
    }

    function onOpenProjOnNewWindow(keyedItem) {
        var unitParam = "&" + paramUnitName + '=' + (usingKnots ? unitKnotsName : unitMPHName);
        openBlank(mVideoHostURL + "?m=" + keyedItem.GetData().properties.id + unitParam);
    }

    function makeUploaderInputToolTip() { return uploaderBtnToolTipStart + uploaderBtnToolTipEnd; }

    function makeUploaderBtnToolTip(props) {
        var uploaderName = !!props ? props.uid : uploaderBtnToolTipEnd;
        var toolTip;

        if (!!singleVideoID) { toolTip = videoUploadedBy + uploaderName; }
        else if (uploaderFilter) { toolTip = allUploadersBtnToolTip; }
        else { toolTip = uploaderBtnToolTipStart + uploaderName; }

        return toolTip;
    }

    function getDateFilterFromUploadTime(uploadTimeStr) {
        var dateFilter = null;

        if (typeof uploadTimeStr === "string" && uploadTimeStr.length > 0) {
            var ddmmyy = uploadTimeStr.split('/');

            if (ddmmyy.length > 1) {
                var month = parseInt(ddmmyy[0], 10);
                var day = parseInt(ddmmyy[1], 10);
                var year = ddmmyy.length > 2 ? parseInt(ddmmyy[2], 10) : 2015;

                if (month < 10) { month = '0' + month; }
                if (day < 10) { day = '0' + day; }
                if (year < 20) { year += 2000; } else if (year < 100) { year += 1900; }

                dateFilter = year + '-' + month + '-' + day;
            }
        }
        return dateFilter;
    }

    function onToggleFilterByDate(keyedItem) {
        if (!singleVideoID) {
            var props = keyedItem.GetData().properties;
            var dateBtn = props.dateBtn;
            dateFilter = !!dateFilter ? null : getDateFilterFromUploadTime(dateFilterDisplay = props.uploadTime);
            inputDate.SetValue(!!dateFilter ? dateFilterDisplay : '');
            dateBtn.ChangeToolTip(makeDateBtnToolTip(props));
            showFilterForm();
        }
    }

    function makeDateInputToolTip() { return dateBtnToolTipStart + dateBtnToolTipEnd; }

    function makeDateBtnToolTip(props) {
        var uploadDate = !!props ? props.uploadTime : dateBtnToolTipEnd;
        var toolTip;

        if (!!singleVideoID) { toolTip = videoUploadedIn + uploadDate; }
        else if (dateFilter) { toolTip = allDatesBtnToolTip; }
        else { toolTip = dateBtnToolTipStart + uploadDate; }

        return toolTip;
    }

    function showHideFilterForm(showBool) {
        if ((showBool = !!showBool) != isShowingFilterForm) {
            if (isShowingFilterForm = showBool) { toolBarObj.AddContent(filterFormContainerObj); }
            else { toolBarDiv.removeChild(filterFormContainerObj.GetHTMLElement()); }
        }
        hcfLayout.NotifyLayoutChange();
    }

    function onToggleFilterForm() { showHideFilterForm(!isShowingFilterForm); }

    function showFilterForm() { if (!isShowingFilterForm) { showHideFilterForm(true); } }

    function createInputRow(underContainerObj, promptStr, toolTipStr, placeHolderStr, clearToolTip, addBottomSeparator) {
        var row = new tf.dom.Div({ cssClass: styles.GetPaddedDivClassNames(false, addBottomSeparator) });
        var rowElem = row.GetHTMLElement();
        var label = new tf.dom.Div({ cssClass: styles.GetUnPaddedDivClassNames(true, false) });
        var labelDiv = label.GetHTMLElement();
        var buttonDim = 16;

        var inputObj = new tf.dom.TextInput({ label: placeHolderStr, value: "", tooltip: toolTipStr });
        var inputElem = inputObj.GetHTMLElement();

        labelDiv.innerHTML = promptStr + ": ";
        labelDiv.style.width = "3em";
        labelDiv.style.textAlign = 'right';

        rowElem.style.textAlign = 'center';

        styles.AddButtonDivRightMargin(label);

        inputElem.size = 20;
        styles.AddBorderBottom(inputObj, false);

        var useLight = false;
        //var useLight = true;
        //var useLight = styles.CreateTextDivBtnClasses("#f00", "#40f", "#00f", "#f00");

        var clearButtonFunction = function (theInputElem) { return function () { theInputElem.value = ''; } }(inputElem);
        var clearButton = styles.AddButtonDivLeftMargin(new tf.ui.TextBtn({ style: useLight, label: styles.GetUnicodeXClose(), onClick: clearButtonFunction, tooltip: clearToolTip, dim: buttonDim }));

        row.AddContent(label);
        row.AddContent(inputObj);
        row.AddContent(clearButton);

        underContainerObj.AddContent(row);
        return inputObj;
    }

    function createFormRows(underContainerObj) {
        inputUploader = createInputRow(underContainerObj, "By", makeUploaderInputToolTip(), "uploader id", "clear uploader id", true);
        inputDate = createInputRow(underContainerObj, "On", makeDateInputToolTip(), "MM/DD/YYYY", "clear date", false);
    }

    function createFilterForm() {
        filterFormContainerObj = new tf.dom.Div({ cssClass: styles.inputFormClass });
        filterFormContainerDiv = filterFormContainerObj.GetHTMLElement();
        filterFormObj = new tf.dom.Div({ cssClass: styles.GetUnPaddedDivClassNames(false, false) });
        createFormRows(filterFormObj);
        filterFormContainerObj.AddContent(filterFormObj);
    }

    function onUpload() {
        var windowWidth = document.documentElement.clientWidth, windowHeight = document.documentElement.clientHeight;
        var iHeight = windowHeight * 0.70, iWidth = windowWidth * 0.4;
        var iTop = (window.screen.availHeight - 30 - iHeight) / 2;
        var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
        window.open(mVideoHostURL + 'Manage/BatchUploadStep1_Index.aspx', 'newwindow', "height=" + iHeight + ",width=" + iWidth +
            ",top=" + iTop + ",left=" + iLeft + ",toolbar=no,menubar=no,scrollbars=yes, resizable=no,location=no, status=no");
    }

    function openTop(url) { window.open(mVideoHostURL + url, "_self"); }
    function onLogin() { openTop("default.aspx"); }
    function onLogout() { openTop("logout.aspx"); }
    function onManage() { openTop("Manage/Default.aspx"); }
    function onHelp() { openTop("help.html"); }

    function createToolBar() {

        var buttonDim = subStyles.mapButtonDimEmNumber + "em";
        var refreshButtonObj = null, useLight = true;
        var refreshToolTip = !!singleVideoID ? "Reload video" : "Clear list and start a new search";
        var useLight = true;

        toolBarObj = hcfLayout.CreateUnPaddedDivForHeader();
        toolBarDiv = toolBarObj.GetHTMLElement();
        toolBarObj.AddContent(refreshButtonObj = styles.AddButtonDivMargins(
            new tf.ui.SvgGlyphBtn({ style: useLight, glyph: tf.styles.SvgGlyphRefreshName, onClick: onClearAndForceRefresh, tooltip: refreshToolTip, dim: buttonDim})
            ));

        loginButton = styles.AddButtonDivMargins(new tf.ui.SvgGlyphBtn({style: useLight, glyph: tf.styles.SvgGlyphLogInName, onClick: onLogin, tooltip: "Login to view other videos", dim: buttonDim}));

        if (!!singleVideoID) { toolBarObj.AddContent(loginButton); }
        else {
            toolBarObj.AddContent(
                addVideosButton = styles.AddButtonDivMargins(new tf.ui.SvgGlyphBtn({style: useLight, glyph: tf.styles.SvgGlyphPlusSignName, onClick: onForceRefresh, tooltip: "Add videos from this area of the map", dim: buttonDim})),
                filterButton = styles.AddButtonDivMargins(new tf.ui.SvgGlyphBtn({style: useLight, glyph: tf.styles.SvgGlyphMagnifyingLensName, onClick: onToggleFilterForm, tooltip: "Search Options", dim: buttonDim})));

            if (!userIsLoggedIn) { toolBarObj.AddContent(loginButton); }

            toolBarObj.AddContent(uploadButton = styles.AddButtonDivMargins(
                new tf.ui.SvgGlyphBtn({style: useLight, glyph: tf.styles.SvgGlyphUploadVideoName, onClick: onUpload, tooltip: "Upload a single video", dim: buttonDim})));

            if (userIsLoggedIn) {
                toolBarObj.AddContent(logoutButton = styles.AddButtonDivMargins(
                    new tf.ui.SvgGlyphBtn({style: useLight, glyph: tf.styles.SvgGlyphLogOutName, onClick: onLogout, tooltip: "Logout", dim: buttonDim})));
            }

            toolBarObj.AddContent(
                manageButton = styles.AddButtonDivMargins(
                new tf.ui.SvgGlyphBtn({style: useLight, glyph: tf.styles.SvgGlyphGearName, onClick: onManage, tooltip: "Open Video Management Page", dim: buttonDim})
                ),
                questionMarkButton = styles.AddButtonDivMargins(new tf.ui.SvgGlyphBtn({style: useLight, glyph: tf.styles.SvgGlyphQuestionMarkName, onClick: onHelp, tooltip: "Open Help Page", dim: buttonDim})));

            createFilterForm();
        }
    }

    function onVideoPopupClosed(theVideoPopup) { stopPlayVideo(false); }

    function onMVideoRowSelect(notification) {
        if (!videoPopup.GetIsPlaying()) {
            if (notification.selected !== notification.prevSelected || notification.isClick) {
                var keyedItem = notification.selected.GetKeyedItem();

                if (keyedItem) {
                    var feature = mVideoFeatureLists.GetRouteStartFeatureList().GetFeatureFromItem(keyedItem);
                    if (!!feature) {
                        var featurePos = feature.GetPointCoords();
                        if (!!featurePos) {
                            map.AnimatedSetCenterIfDestVisible(featurePos);
                        }
                    }
                }
            }
        }
    }

    function onLiveFeedsRowSelect(notification) {
        if (!videoPopup.GetIsPlaying()) {
            if (notification.selected !== notification.prevSelected || notification.isClick) {
                var keyedItem = notification.selected.GetKeyedItem();

                if (keyedItem) {
                    var feature = liveFeedsFeatureList.GetLiveFeedsFeatureList().GetFeatureFromItem(keyedItem);
                    if (!!feature) {
                        var featurePos = feature.GetPointCoords();
                        if (!!featurePos) {
                            map.AnimatedSetCenterIfDestVisible(featurePos);
                        }
                    }
                    if (notification.isClick) { startPlayLiveFeed(keyedItem); }
                }
            }
        }
    }

    var mVideoList = null, mVideoKeyedList = null, mVideoListMonitor = null, mVideoTable = null, mVideoFeatureLists = null;
    var liveFeedsList = null, liveFeedsKeyedList = null, liveFeedsTable = null, liveFeedsFeatureList = null, liveStreamPlayer = null;

    function stopPlayVideo(willPlayAgain) { if (!willPlayAgain) { if (videoPopup.GetIsPlaying()) { videoPopup.Stop(); } } }

    function setLoadingDataContent() { hcfLayout.SetHeader(loadingDataContentObj); }
    function setToolBar() { hcfLayout.SetHeader(toolBarObj); }
    function setLiveVideosToolBar() { hcfLayout.SetHeader(liveVideosToolBarObj); }

    function makeTemporaryStr(str) { return '[' + str + ']'; }

    function makeSpeedStr(speedMPH, isTemporary) {
        var speedStr = (tf.js.GetFloatNumber(speedMPH, 0) * speedConversion).toFixed(0) + ' ' + speedUnit;
        return isTemporary ? makeTemporaryStr(speedStr) : speedStr;
    }

    function makeAltStr(altFeet, isTemporary) {
        var altStr = (tf.js.GetFloatNumber(altFeet, 0) * altConversion).toFixed(0) + ' ' + altUnit;
        return isTemporary ? makeTemporaryStr(altStr) : altStr;
    }

    function onlyAlphaAndDigits(str) { return !!str ? str.replace(/[^A-Z0-9-]+/i, '').trim() : null; }

    function setUnit(useKnotsBool) {
        useKnotsBool = !!useKnotsBool;
        if (usingKnots = useKnotsBool) {
            speedConversion = mphToKnots; altConversion = 1; speedUnit = knotsSpeedUnit;
            altUnit = meterAltUnit; unitDisplayName = unitKnotsDisplayName; unitOtherDisplayName = unitMPHDisplayName;

        }
        else {
            speedConversion = 1; altConversion = feetToMeters; speedUnit = mphSpeedUnit;
            altUnit = feetAltUnit; unitDisplayName = unitMPHDisplayName; unitOtherDisplayName = unitKnotsDisplayName;
        }
    }

    function getURLParams() {
        var params = settings.fullURL;

        if (tf.js.GetIsNonEmptyString(params)) { params = tf.urlapi.ParseURLAPIParameters(params); }

        if (params) {
            var thisParamVal = null;

            if (thisParamVal = params[paramUnitName]) {
                if ((thisParamVal = thisParamVal.toLowerCase()) == unitKnotsName) { setUnit(true); }
                else if (thisParamVal == unitMPHName) { setUnit(false); }
            }
            if (thisParamVal = params[tf.consts.MVideoParamNameVideo]) { singleVideoID = thisParamVal.toLowerCase(); }
        }
        return params;
    }

    function updateFooter() {
        var footerStrHtml = "";

        if (isViewingVideos) {
            var nVideos = mVideoKeyedList.GetItemCount();

            if (nVideos == 0) { footerStrHtml = "No videos found"; }
            else {
                var recordStr = nVideos > 1 ? " videos " : " video ";
                footerStrHtml = nVideos + recordStr + "found";
            }
            if (!!(lastUploader || lastDate)) {
                footerStrHtml += " (";
                if (!!lastUploader) { footerStrHtml += "by " + lastUploader; if (!!lastDate) { footerStrHtml += ', '; } }
                if (!!lastDate) { footerStrHtml += "on " + lastDate; }
                footerStrHtml += ")";
            }
        }
        else {
            var nLiveFeeds = liveFeedsKeyedList.GetItemCount();
            if (nLiveFeeds == 0) { footerStrHtml = "No live feeds available"; }
            else {
                var recordStr = nLiveFeeds > 1 ? " live feeds " : " live feed ";
                footerStrHtml = nLiveFeeds + recordStr + "available";
            }
        }
        hcfLayout.SetFooter(footerStrHtml);
    }

    function forceRefreshDLayers() { if (!!dLayers) { dLayers.RefreshAll(); } }

    function forceRefresh() {
        var url = '';

        if (!!singleVideoID) { var url = mVideoHostURL + "RouteHandler.ashx?m=" + singleVideoID; }
        else {
            var showVideoNum = 30, bounds = map.GetVisibleExtent();
            url = mVideoHostURL + "RouteHandler.ashx?n=" + bounds[3] + "&s=" + bounds[1] + "&w=" + bounds[0] + "&e=" + bounds[2] + "&u=" + uid + "&v=" + vid + "&showVideoNum=" + showVideoNum;
            if (!!filterStr) { url += "&filter=" + filterStr; }
        }
        forceRefreshDLayers();
        mVideoList.Refresh(url);;
    }

    function onForceRefresh() { forceRefresh(); }

    function onClearAndForceRefresh() {
        stopPlayVideo(false);
        setLoadingDataContent();
        mVideoKeyedList.RemoveAllItems();
        if (!!dLayers) { dLayers.CleanAll(); }
        updateFilterString();
        forceRefresh();
    }

    function updateFilterString() {
        var inputDateValue = inputDate.GetValue();
        var actualDateFilter = onlyAlphaAndDigits(getDateFilterFromUploadTime(inputDateValue));
        var actualUploaderFilter = onlyAlphaAndDigits(inputUploader.GetValue());

        lastUploader = actualUploaderFilter;
        lastDate = !!actualDateFilter ? inputDateValue : null;

        if (!!(actualUploaderFilter || actualDateFilter)) {
            filterStr = "|" + (!!actualUploaderFilter ? actualUploaderFilter : '') + "|" + (!!actualDateFilter ? actualDateFilter : '');
        }
        else { filterStr = null; }
    }

    function onFeatureHoverInOut(notification) {
        var keyedFeature = notification.keyedFeature;
        if (!!keyedFeature) {
            var keyedFeaturePropertyName = keyedFeature.GetPropertyName();
            var otherFeatureList = null;

            if (keyedFeaturePropertyName == tf.apps.MVideo.RouteFeaturePropertyName) { otherFeatureList = mVideoFeatureLists.GetRouteStartFeatureList(); }
            else if (keyedFeaturePropertyName == tf.apps.MVideo.RouteStartFeaturePropertyName) { otherFeatureList = mVideoFeatureLists.GetRouteFeatureList(); }

            if (!!otherFeatureList) {
                var otherKeyedFeature = otherFeatureList.GetFeature(keyedFeature.GetKeyedItemKey());
                if (!!otherKeyedFeature) { otherKeyedFeature.GetMapFeature().onHoverInOut(notification); }
                if (notification.isInHover && !videoPopup.GetIsPlaying()) {
                    var row = mVideoTable.GetRowFromKeyedItem(keyedFeature.GetKeyedItem());
                    if (!!row && !row.GetIsSelected()) { row.Select(true, true); }
                }
            }
        }
    }

    function onFeatureClick(notification) {
        var keyedFeature = notification.keyedFeature;
        if (!!keyedFeature) {
            var keyedItem = keyedFeature.GetKeyedItem();

            if (!!keyedItem) {
                var keyedFeaturePropertyName = keyedFeature.GetPropertyName();
                var needsStartPlay = false, clickedOnRoute = false;

                if (keyedFeaturePropertyName == tf.apps.MVideo.RouteFeaturePropertyName) { clickedOnRoute = needsStartPlay = true; }
                else if (keyedFeaturePropertyName == tf.apps.MVideo.RouteStartFeaturePropertyName) { needsStartPlay = true; }
                else if (keyedFeaturePropertyName == tf.apps.MVideo.LifeFeedFeaturePropertyName) { startPlayLiveFeed(keyedItem); }
                if (needsStartPlay) { startPlayVideo(keyedItem, clickedOnRoute, notification.eventCoords[1], notification.eventCoords[0]) }
            }
        }
    }

    function onListRefreshed() { setToolBar(); updateFooter(); }

    function buildTextColContent(keyedItem) {
        var props = keyedItem.GetData().properties;
        var textColContent = new tf.dom.Span();
        var buttonDim = 18;
        var textButtonDim = buttonDim;
        var uploaderFunction = function (keyedItem) { return function () { onToggleFilterByUploader(keyedItem); } }(keyedItem);
        var uploaderBtn = null;
        var useLight = true;
        var dateFunction = function (keyedItem) { return function () { onToggleFilterByDate(keyedItem); } }(keyedItem);
        var dateBtn = new tf.ui.TextBtn({ style: useLight, label: props.uploadTime, onClick: dateFunction, tooltip: makeDateBtnToolTip(props), dim: textButtonDim });
        var viewViewsStr = props.viewed == 1 ? "view" : "views";
        var maxSpeedUse = tf.js.GetFloatNumber(props.maxSpeedMPH, 0);
        var maxAltUse = tf.js.GetFloatNumber(props.maxAltitudeMeter, 0);
        var projNameBtn = '', afterProjNameBtn = ''

        uploaderBtn = new tf.ui.TextBtn({ style: useLight, label: props.uid, onClick: uploaderFunction, tooltip: makeUploaderBtnToolTip(props), dim: textButtonDim });

        if (!singleVideoID) {
            var projNameFunction = function (keyedItem) { return function () { onOpenProjOnNewWindow(keyedItem); } }(keyedItem);
            projNameBtn =
                new tf.ui.SvgGlyphBtn({ style: true, glyph: tf.styles.SvgGlyphStarName, onClick: projNameFunction, tooltip: "Open " + props.projName + " by itself for bookmarking", dim: buttonDim });
            afterProjNameBtn = '&nbsp;';
        }

        textColContent.AddContent(
            projNameBtn, afterProjNameBtn + props.projName + ' | ' + props.viewed + ' ' + viewViewsStr + '<br/>',
            uploaderBtn, '&nbsp;&nbsp;', dateBtn, '<br/>', props.duration + ' | ' +
            makeSpeedStr(maxSpeedUse) + ' | ' + makeAltStr(maxAltUse));

        return { textColContent: textColContent, uploaderBtn: uploaderBtn, dateBtn: dateBtn };
    }

    function getMVideoRowContent(notification) {
        var keyedItem = notification.keyedItem;
        var content = null;

        if (!!keyedItem) {
            var props = keyedItem.GetData().properties;
            var imageColObj = styles.CreateListContentItemWithImgBk(props.imageFile, true);
            var imageColElem = imageColObj.GetHTMLElement();
            var textColObj = styles.CreateListContentItem();
            var textCol = textColObj.GetHTMLElement();
            var textColContent = buildTextColContent(keyedItem);
            var buttonDim = subStyles.mapButtonDimEmNumber + "em";
            var btnFunction = function (keyedItem) { return function () { startPlayVideo(keyedItem); } }(keyedItem);
            var playBtn = new tf.ui.SvgGlyphBtn({ style: true, glyph: tf.styles.SvgGlyphPlaySelectedName, onClick: btnFunction, tooltip: "play video " + props.projName, dim: buttonDim });
            var playBtnElem = playBtn.GetHTMLElement();
            var imgWidthEM = subStyles.imageThumbWidthEmNumber;
            var marginLeftBtn = imgWidthEM / 4;

            imageColElem.style.verticalAlign = 'middle';
            playBtnElem.style.verticalAlign = "middle";
            playBtnElem.style.display = 'inline-block';
            playBtnElem.style.marginLeft = playBtnElem.style.marginTop = marginLeftBtn + "em";

            imageColObj.AddContent(playBtn);

            props.uploaderBtn = textColContent.uploaderBtn;
            props.dateBtn = textColContent.dateBtn;

            textColObj.AddContent(textColContent.textColContent);
            textCol.style.maxWidth = "12em";
            textCol.style.color = "inherit";

            content = new tf.dom.Div({ cssClass: styles.unPaddedBlockDivClass });
            content.AddContent(imageColObj);
            content.AddContent(textColObj);
        }
        return { sender: theThis, content: content };
    }

    function getLiveFeedsRowContent(notification) {
        var keyedItem = notification.keyedItem;
        var content = null;

        if (!!keyedItem) {
            var props = keyedItem.GetData().properties;
            var span = new tf.dom.Span({ cssClass: styles.spanCursorPointerClass });

            content = styles.CreateListContentItem();
            span.AddContent("Live: " + props.name);
            //styles.ApplyStyleProperties(span, subStyles.cursorPointerStyle);
            styles.ApplyStyleProperties(content, { inherits: [subStyles.cursorPointerStyle], maxWidth: "16em", color: "inherit" });
            content.AddContent(span);

        }
        return { sender: theThis, content: content };
    }

    function onLiveFeedsAdded() { if (!isViewingVideos) { updateFooter(); } }
    function onLiveFeedsDeleted(notification) {
        if (!isViewingVideos) {
            if (!!liveFeedItemKeyPlaying) {
                for (var i in notification.items) {
                    if (notification.items[i] == liveFeedItemKeyPlaying) {
                        stopPlayLiveFeed();
                    }
                }
            }
            setTimeout(updateFooter, 100);
        }
    }

    function getFlashStyle1(elapsed01) {
        var radius = 4 + Math.pow(elapsed01, 1 / 2) * 16;
        var opacity = 1 - Math.pow(elapsed01, 3);
        var line_width = (2 - elapsed01);
        var flashStyle = {
            circle: true,
            circle_radius: radius,
            snapToPixel: false,
            line: true,
            line_width: line_width,
            line_color: "#0b0",
            line_alpha: opacity * 100
        };
        return flashStyle;
    }

    function getFlashStyle2(elapsed01) {
        var radius = 4 + (Math.cos(Math.pow(elapsed01, 1 / 2) * Math.PI * 2) + 1.0) * 4;
        var opacity = 1 - Math.pow(elapsed01, 3);
        var line_width = (2 - elapsed01);
        var flashStyle = {
            circle: true,
            circle_radius: radius,
            snapToPixel: false,
            line: true,
            line_width: line_width * 2,
            line_color: "#0f0",
            line_alpha: opacity * 100
        };
        return flashStyle;
    }

    function onLiveFeedsUpdated(notification) {
        var features = [];
        for (var i in notification.items) {
            features.push(liveFeedsFeatureList.GetLiveFeedsFeatureList().GetFeatureFromItem(notification.items[i]));
        }
        new tf.map.PointsStyleAnimator({ maps: [map], pointProviders: features, duration: 1000, getStyle: getFlashStyle1 });
        new tf.map.PointsStyleAnimator({ maps: [map], pointProviders: features, duration: 2000, getStyle: getFlashStyle2 });
    }

    function startMapAnimation() {
        if (map.GetIsAnimating()) {
            map.EndAnimation();
        }
        else {
            map.StartAnimation(animateMap);
        }
    }

    function animateMap(nextStepRequest) {
        var nextStep = { duration: 1000, notifyListeners: true };
        var step = nextStepRequest.step;
        if (step != -1) {
            step %= 6;
        }
        switch (step) {
            default:
            case -1:
                nextStep = null;
                break;
            case 0:
                nextStep.resolution = 4.8;
                nextStep.center = tf.consts.defaultMapCenter;
                nextStep.rotation = 0;
                break;
            case 1:
                nextStep.resolution = 4.8;
                nextStep.center = [-80.5, 25.9];
                nextStep.rotation = Math.PI / 2;
                nextStep.duration = 5000;
                break;
            case 2:
                nextStep.resolution = 2.4;
                nextStep.center = [-80.5, 25.9];
                nextStep.rotation = Math.PI;
                break;
            case 3:
                nextStep.resolution = 4.8;
                nextStep.center = [-80.5, 25.9];
                nextStep.rotation = 3*Math.PI/2;
                break;
            case 4:
                nextStep.resolution = 4.8;
                nextStep.center = tf.consts.defaultMapCenter;
                nextStep.rotation = 0;
                nextStep.duration = 5000;
                break;
            case 5:
                nextStep.resolution = 2.4;
                nextStep.center = tf.consts.defaultMapCenter;
                break;
        }
        return nextStep;
    }

    function onMoveEnd(notification) { }

    function onMapCreated() {
        var mapEventSettings = {};
        
        mapEventSettings[tf.consts.mapFeatureHoverInOutEvent] = onFeatureHoverInOut;
        mapEventSettings[tf.consts.mapFeatureClickEvent] = onFeatureClick;
        mapEventSettings[tf.consts.mapMoveEndEvent] = onMoveEnd;

        if (!(userIsLoggedIn = !!(uid = tf.helpers.DocCookies.getItem('uid')))) { uid = "guest"; vid = ''; } else { vid = tf.helpers.DocCookies.getItem('vid'); }

        singleMapAppContentOnTheSide = singleMapHCFOnTheSide.GetSingleAppMapContentOnTheSide();
        twoHorPaneLayout = singleMapAppContentOnTheSide.GetLeftSeparatorRightLayout();
        appContainerSizer = singleMapAppContentOnTheSide.GetAppContainerSizer();
        appContainerSizer.OnResize();

        setUnit(usingKnots);
        map = singleMapAppContentOnTheSide.GetMap(); dLayers = singleMapAppContentOnTheSide.GetDLayers();
        mapEventListeners = map.AddListeners(mapEventSettings);
        mVideoKeyedList = (mVideoList = new tf.apps.MVideo.MVideoList({ refreshCallback: onListRefreshed })).GetKeyedList();

        //map.SetRotationDeg(45);

        map.ShowPanel("fullscreen", true);

        mVideoTable = new tf.ui.KeyedTable({
            keyedList: mVideoKeyedList,
            tableSettings: { onSelect: onMVideoRowSelect, optionalScope: theThis, selectOnHover: true, style: tableStyle },
            rowSettings: { style: rowStyle, selectedStyle: rowHoverStyle },
            getRowContent: getMVideoRowContent
        });

        var mVideoLayerSettings = { name: tf.apps.MVideo.KeyedListName, color: "#fff", zIndex: 50, isVisible: true, isHidden: false };
        featureLayer = map.AddFeatureLayer(mVideoLayerSettings);

        mVideoFeatureLists = new tf.apps.MVideo.VideoFeatureLists({ onCreated: undefined, keyedList: mVideoKeyedList, map: map });
        videoPopup = new tf.ui.VideoTrackPlayer(map, "#000", mVideoLogoSrc, onVideoPopupClosed, theThis);
        hcfLayout = singleMapHCFOnTheSide.GetHCFLayout();

        if (!singleVideoID) {
            var titleObj = hcfLayout.CreateUnPaddedDivForHeader();
            var titleDiv = titleObj.GetHTMLElement();

            styles.AddBorderBottom(titleObj, true);
            styles.ApplyTextAlignCenterStyle(titleObj);
            titleDiv.title = documentTitle;
            titleDiv.style.verticalAlign = "middle";
            titleDiv.style.paddingTop = titleDiv.style.paddingBottom = "2px";
            titleDiv.innerHTML = "Welcome " + uid + "<br/>";
            hcfLayout.AddToHeader(titleObj);
        }

        loadingDataContentObj = hcfLayout.CreateUnPaddedDivForHeader();
        var loadingDataContent = loadingDataContentObj.GetHTMLElement();
        loadingDataContent.style.textAlign = "center";
        loadingDataContent.innerHTML = "Searching ...";

        if (hasLiveFeedsComponents) {
            createVideoOrLiveToolBar();
            hcfLayout.AddToHeader(videoOrLiveToolBar);
            createLiveVideosToolBar();
            liveFeedsKeyedList = (liveFeedsList = new tf.apps.MVideo.LiveFeedsList()).GetKeyedList();
            liveFeedsFeatureList = new tf.apps.MVideo.LiveFeedsFeatureList({ onCreated: undefined, keyedList: liveFeedsKeyedList, map: map });
            liveFeedsTable = new tf.ui.KeyedTable({
                keyedList: liveFeedsKeyedList,
                tableSettings: { onSelect: onLiveFeedsRowSelect, optionalScope: theThis, selectOnHover: true, style: tableStyle },
                rowSettings: {
                    style: !!rowStyle ? tf.js.ShallowMerge(rowStyle, { inherits: [subStyles.cursorPointerStyle] }) : undefined,
                    selectedStyle: !!rowHoverStyle ? tf.js.ShallowMerge(rowHoverStyle, { inherits: [subStyles.cursorPointerStyle] }) : undefined
                },
                getRowContent: getLiveFeedsRowContent,
                style: tableStyle
            });
            liveStreamPlayer = new tf.apps.MVideo.LiveStreamPlayer();

            var listeners = {};
            listeners[tf.consts.keyedListDeleteEvent] = onLiveFeedsDeleted;
            listeners[tf.consts.keyedListAddedItemsEvent] = onLiveFeedsAdded;
            listeners[tf.consts.keyedListUpdatedItemsEvent] = onLiveFeedsUpdated;
            listeners[tf.consts.keyedListDeletedItemsEvent] = onLiveFeedsDeleted;
            liveFeedsKeyedList.AddListeners(listeners);
        }

        hcfLayout.SetContent(mVideoTable);

        createToolBar();
        setLoadingDataContent();
        updateFilterString();
        showFilterForm();
        forceRefresh();
        twoHorPaneLayout.SetRightSideCollapsed(false);
        if (!!createdCallBack) { setTimeout(function () { createdCallBack({ ramb: theThis }); }, 1); }
    }

    function startPlayLiveFeed(keyedItem) {
        if (isViewingVideos) { setViewingLiveFeeds(); }
        liveFeedItemKeyPlaying = keyedItem;
        liveStreamPlayer.PlayStream(tf.apps.MVideo.GetLiveFeedsLiveStreamServiceURL() + keyedItem.GetData().properties.name);
    }

    function stopPlayLiveFeed() {
        liveStreamPlayer.StopPlay();
        liveFeedItemKeyPlaying = null;
    }

    function onListVideos() { stopPlayLiveFeed(); setToolBar(); hcfLayout.SetContent(mVideoTable); updateFooter(); }
    function onListLiveFeeds() { stopPlayVideo(false); setLiveVideosToolBar(); hcfLayout.SetContent(liveFeedsTable); updateFooter(); }

    function updateVideoOrLiveButton() {
        var buttonName, buttonTitle;

        if (isViewingVideos) { buttonName = "Switch to LIVE FEEDS"; buttonTitle = "Click to view the list of Live Feeds"; }
        else { buttonName = "Switch to VIDEOS"; buttonTitle = "Click to view the list of Videos"; }
        videoOrLiveButton.SetText(buttonName);
        videoOrLiveButton.ChangeToolTip(buttonTitle);
    }

    function setViewingVideos() { isViewingVideos = true; updateVideoOrLiveButton(); onListVideos(); } 
    function setViewingLiveFeeds() { isViewingVideos = false; updateVideoOrLiveButton(); onListLiveFeeds(); }
    function onToggleVideosOrLiveFeeds() {
        //startMapAnimation();
        if (isViewingVideos) { setViewingLiveFeeds(); } else { setViewingVideos(); }
    }

    function onRefreshLiveFeeds() { if (liveFeedsList) { liveFeedsList.Refresh(); } }

    function createLiveVideosToolBar() {
        var useLight = true;
        var buttonDim = subStyles.mapButtonDimEmNumber + "em";

        liveVideosToolBarObj = hcfLayout.CreateUnPaddedDivForHeader();
        liveVideosToolBarObj.AddContent(styles.AddButtonDivMargins(
            liveVideosRefreshBtn = new tf.ui.SvgGlyphBtn({ style: useLight, glyph: tf.styles.SvgGlyphRefreshName, onClick: onRefreshLiveFeeds, tooltip: "Refresh list", dim: buttonDim})
            ));
    }

    function createVideoOrLiveToolBar() {
        var buttonDim = 18;
        var textButtonDim = buttonDim;

        videoOrLiveToolBar = styles.AddBorderBottom(hcfLayout.CreateUnPaddedDivForHeader(), true);
        videoOrLiveToolBar.AddContent(styles.AddButtonDivMargins(videoOrLiveButton = new tf.ui.TextBtn({ style: true, label: "", onClick: onToggleVideosOrLiveFeeds, tooltip: "", dim: textButtonDim })));
        updateVideoOrLiveButton();
    }

    function initialize() {

        styles = tf.GetStyles(); subStyles = styles.GetSubStyles();

        var bkColor = "#abebfb";

        /*rowStyle = {
            inherits: subStyles.seShadowStyle, textShadow: '1px 1px 1px #bcbcbc', backgroundColor: "#ffa",
            color: "#00c", borderRadius: "8px", margin: "4px", padding: "2px"
        };
        rowHoverStyle = {
            inherits: subStyles.horShadowStyle, textShadow: '1px 1px 1px #9c9c9c', backgroundColor: "#f80",
            color: "#00c", borderRadius: "10px", margin: "2px", marginTop: "4px", padding: "2px"
        };*/

        //tableStyle = { backgroundColor: bkColor };

        mVideoHostURL = tf.apps.MVideo.GetMVideoHostURL();

        settings = tf.js.GetValidObjectFrom(settings);
        documentTitle = tf.consts.MVideoDocumentTitle;
        createdCallBack = tf.js.GetFunctionOrNull(settings.onCreated);

        isViewingVideos = true;
        liveFeedItemKeyPlaying = null;

        var params = getURLParams();

        if (hasLiveFeedsComponents = tf.js.GetBoolFromValue(params.livefeeds, false)) {
            tf.dom.AddScript("./js/jquery-1.9.1.min.js");
            tf.dom.AddScript("./js/jwplayer.js");
        }

        singleMapHCFOnTheSide = new tf.urlapi.SingleMapHCFOnTheSideApp({
            app: theThis, documentTitle: documentTitle, onCreated: onMapCreated, fullURL: params,
            appLogoImgStr: mVideoLogoSrc, logoBkColor: "rgb(0, 128, 255)"/*,
            separatorStyle: { backgroundColor: "rgba(0,107,133, 0.8)", borderLeft: "1px solid" + bkColor, borderRight: "1px solid #00b"},
            pageStyle: { color: "#004" },
            headerStyle: { backgroundColor: bkColor },
            contentStyle: { backgroundColor: bkColor },
            footerStyle: { backgroundColor: bkColor },
            logoStyle: { border: "1px solid #ddf" }*/
        });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

var g_MVideoApp = new tf.apps.MVideo.app({ fullURL: window.location.href, liveFeeds: true });
