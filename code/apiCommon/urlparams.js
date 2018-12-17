"use strict";

/**
 * A callback function to receive the notification that the function [CreateURLAPIMaps]{@link tf.urlapi.CreateURLAPIMaps} has finished the process of creating all maps
 * @public
 * @callback tf.types.CreateURLAPIMapsCallBack
 * @param {object} notification - the notification
 * @param {tf.types.URLParametersObject} notification.parameters - url parameters in {@link object} format
 * @param {enumerable<tf.map.Map>} notification.maps - an enumerable containing the maps created
 * @param {enumerable<tf.urlapi.DLayerList>} notification.dLayers - an enumerable containing the [DLayer Lists]{@link tf.urlapi.DLayerList} created
 * @returns {void} - | {@link void} no return value
 */

/**
 * @public
 * @function
 * @summary - creates and configures one or more [Map]{@link tf.map.Map} instances based on the given settings, including url parameters, and adds them to the given containers.
 * Notifies a callback when all maps are created
 * @param {object} settings - creation settings
 * @param {tf.types.CreateURLAPIMapsCallBack} settings.onCreated - a mandatory callback to receive a notification when all maps are created
 * @param {object} settings.optionalScope - optional scope used with <b>onCreated</b>
 * @param {enumerable<HTMLElementLike>} settings.mapContainers - a mandatory enumerable of the containers to which map instances are added
 * @param {boolean} settings.allowDLayers - set to <b>false</b> to prevent the creation of a [DLayer List]{@link tf.urlapi.DLayerList} specified by [URL Parameters]{@link tf.types.URLParameters}, defaults to <b>true</b>
 * @param {function} settings.dLayersPreProcessDataItem - passed to [DLayer List]{@link tf.urlapi.DLayerList}, defaults to {@link void} 
 * @param {tf.types.URLParameters} settings.parameters - optional parameters to initialize the maps, dlayers
 * @returns {void} - | {@link void} no return value
*/
tf.urlapi.CreateURLAPIMaps = function (settings) {

    if (tf.js.GetIsValidObject(settings) && tf.js.GetIsValidObject(settings.mapContainers)) {
        var onCreatedCallBack = tf.js.GetFunctionOrNull(settings.onCreated);

        if (!!onCreatedCallBack) {

            var parameters = settings.parameters;

            if (!tf.js.GetIsValidObject(parameters)) {
                if (tf.js.GetIsString(parameters)) {
                    parameters = tf.urlapi.ParseURLAPIParameters(parameters);
                }
                else { parameters = {}; }
            }

            var dLayersAllowed = tf.js.GetBoolFromValue(settings.allowDLayers, true);

            var nDLayerExtent = tf.js.GetIntNumberInRange(parameters[tf.consts.paramNameDLExtent], 0, 999, 0);

            //nDLayerExtent = true;

            var viewCenterLat = tf.js.GetLatitudeFrom(parameters[tf.consts.paramNameLat]);
            var viewCenterLon = tf.js.GetLongitudeFrom(parameters[tf.consts.paramNameLon]);

            if (!parameters[tf.consts.paramNamePanels]) { parameters[tf.consts.paramNamePanels] = tf.consts.defaultPanels; }
            if (parameters[tf.consts.paramNameTFLogo] === tf.consts.tfLogoOffStr) { parameters[tf.consts.paramNameTFLogo] = false; } else { parameters[tf.consts.paramNameTFLogo] = true; }

            var panelParams = tf.js.GetNonEmptyString(parameters[tf.consts.paramNamePanels], '');
            var mapEngine = tf.map.GetMapEngineFrom(parameters[tf.consts.paramNameFMap]);

            if (parameters[tf.consts.paramNameTFLogo]) { panelParams += tf.consts.charSplitStrings + tf.consts.paramNameTFLogo; }

            var useMapNik2 = mapEngine == tf.consts.mapnik2Engine;

            if (useMapNik2) { delete parameters[tf.consts.paramNameLegend]; } else { delete parameters[tf.consts.paramNameLegendH]; }

            var linkTargetStr = parameters[tf.consts.paramLinkTargetStr];

            tf.urlapi.LoadRemoteParameters(parameters, createMaps);
        }
    }
    function createMaps() {

        function updateToggleButtonTexts(toggleButton, bool) {
            var text = bool ? "2D view" : "3D view";
            var toolTip = bool ? "Switch to 2D view" : "Switch to 3D view";
            toggleButton.SetText(text); toggleButton.ChangeToolTip(toolTip);
        }

        var mapLegendStr = useMapNik2 ? tf.urlapi.RemovePlugInPhotoFromLegend(parameters[tf.consts.paramNameLegendM]).legendStr : null;
        var hybridLegendStr = useMapNik2 ? parameters[tf.consts.paramNameLegendH] : parameters[tf.consts.paramNameLegend];
        var legendAndPlugInPhoto = tf.urlapi.RemovePlugInPhotoFromLegend(hybridLegendStr);

        hybridLegendStr = legendAndPlugInPhoto.legendStr;

        var messageTimeout = tf.js.GetFloatNumberInRange(parameters[tf.consts.paramNameMessageTimeout], tf.consts.minMessageTimeout, tf.consts.maxMessageTimeout, tf.consts.defaultMessageTimeout);
        //var dLayercenter = { Latitude: viewCenterLat, Longitude: viewCenterLon };

        var mapSettings = {
            fullScreenContainer: settings.fullScreenContainer,
            center: [viewCenterLon, viewCenterLat],
            mapType: parameters[tf.consts.paramNameType],
            mapAerialSource: parameters[tf.consts.paramNameSource],
            mapLayerSourceURL: parameters[tf.consts.mapLayerSourceName],
            mapEngine: mapEngine,
            panels: panelParams,
            addressBarText: parameters[tf.consts.paramNameAddress],
            addressBarHelp: parameters[tf.consts.paramNameHelp],
            panOnClick: true,
            goDBOnDoubleClick: true,
            legendH: hybridLegendStr,
            legendM: mapLegendStr,
            messageTimeout: messageTimeout,
            vidParam: parameters[tf.consts.paramNameVid],
            passThroughString: parameters[tf.consts.paramNamePassThrough],
            level: parameters[tf.consts.paramNameLevel],
            resolution: parameters[tf.consts.paramNameRes],
            linkTargetStr: linkTargetStr
        };

        var allMaps = [], allDLayers = [], allPerspectiveMaps = [], allPerspectiveDLayers = [], perspectiveMapToggleButtons = [];
        var dLayersInfo = dLayersAllowed ? tf.urlapi.GetDLayersInfoFromURLParameters(parameters) : [];
        var hasDLayers = dLayersAllowed ? tf.js.GetIsNonEmptyArray(dLayersInfo) : false;
        var usePerspectiveMap = parameters[tf.consts.paramNamePerspectiveMap], perspectiveMapIsInitiallyVisible;
        var actualDLayersPreProcessServiceData = tf.js.GetFunctionOrNull(settings.dLayersPreProcessServiceData);
        var styles;

        if (usePerspectiveMap != undefined && tf.js.GetIsValidObject(tf.webgl) && tf.webgl.PerspectiveMap !== undefined) {
            if (tf.webgl.GetWebGL().GetHasWebGL()) {
                perspectiveMapIsInitiallyVisible = tf.js.GetBoolFromValue(usePerspectiveMap);
                usePerspectiveMap = true;
                styles = tf.GetStyles();
            }
            else {
                usePerspectiveMap = perspectiveMapIsInitiallyVisible = false;
            }
        }

        var toggleButtonSpecs = { position: 'absolute', bottom: '0.5em', marginLeft: '50%', transform: "translate(-50%, 0)", zIndex: 2 };

        for (var i in settings.mapContainers) {
            var thisContainer = settings.mapContainers[i];
            if (tf.dom.GetHTMLElementFrom(thisContainer)) {
                mapSettings.container = thisContainer;
                var map = new tf.map.Map(mapSettings);
                var perspectiveMap, perspectiveDLayer;
                var dLayersPreProcessServiceData = !!usePerspectiveMap ?
                    function (index) {
                        return function (data, dLayer) {
                            var mapDLayers = allPerspectiveDLayers[index];
                            if (!!mapDLayers) { mapDLayers.PreProcessServiceData(data, dLayer); }
                            if (!!actualDLayersPreProcessServiceData) { actualDLayersPreProcessServiceData(data, dLayer); }
                        }
                    }(allPerspectiveDLayers.length) :
                    actualDLayersPreProcessServiceData;

                var dLayers = hasDLayers ? new tf.urlapi.DLayerList({
                    dLayersInfo: dLayersInfo, map: map, preProcessDataItem: settings.dLayersPreProcessDataItem, preProcessServiceData: dLayersPreProcessServiceData,
                    nDLayerExtent: nDLayerExtent,
                    linkTargetStr: linkTargetStr
                }) : undefined;

                allMaps.push(map);

                if (!!usePerspectiveMap) {
                    perspectiveMap = new tf.webgl.PerspectiveMap({ map: map, isVisible: perspectiveMapIsInitiallyVisible });
                    allPerspectiveMaps.push(perspectiveMap);

                    var toggleButton = new tf.ui.TextBtn({ style: styles.mapTextBtnClass, label: "", /*onClick: onToggleClick,*/ tooltip: "", dim: 20 });

                    var onToggleClick = function (perspectiveMap, toggleButton) {
                        return function () {
                            var bool = !perspectiveMap.GetIsVisible();
                            perspectiveMap.SetIsVisible(bool);
                            updateToggleButtonTexts(toggleButton, bool);
                        }
                    }(perspectiveMap, toggleButton);

                    var onPerspectiveMapVisibilityChange = function (perspectiveMap, toggleButton) {
                        return function (notification) {
                            var bool = perspectiveMap.GetIsVisible();
                            updateToggleButtonTexts(toggleButton, bool);
                        }
                    }(perspectiveMap, toggleButton);

                    perspectiveMap.AddListener(tf.consts.perspectiveMapVisibilityChangeEvent, onPerspectiveMapVisibilityChange);

                    toggleButton.SetOnClick(onToggleClick);

                    updateToggleButtonTexts(toggleButton, perspectiveMapIsInitiallyVisible);

                    styles.ApplyStyleProperties(toggleButton, toggleButtonSpecs);
                    toggleButton.AppendTo(map.GetMapMapContainer());

                    perspectiveMapToggleButtons.push(toggleButton);
                }

                if (!!dLayers) {
                    allDLayers.push(dLayers);
                    if (!!usePerspectiveMap) {
                        var perspectiveDLayer = new tf.webgl.PerspectiveDLayers({ perspectiveMap: perspectiveMap });
                        allPerspectiveDLayers.push(perspectiveDLayer);
                    }
                }
            }
        }

        var notification = {
            parameters: parameters, maps: allMaps, dLayers: allDLayers,
            perspectiveMaps: allPerspectiveMaps, perspectiveDLayers: allPerspectiveDLayers,
            perspectiveToggleButtons: perspectiveMapToggleButtons
        };
        setTimeout(function () { onCreatedCallBack.call(settings.optionalScope, notification); }, 10);
    }
};

/**
 * Object returned by the function [RemovePlugInPhotoFromLegend]{@link tf.urlapi.RemovePlugInPhotoFromLegend}
 * @public
 * @typedef {object} tf.types.RemovePlugInPhotoFromLegendResult
 * @property {boolean} bla.requestedPlugInPhoto - set to <b>true</b> if the flag was found and removed, <b>false</b> otherwise
 * @property {tf.types.legendString} bla.legendStr - the legend string, either unchanged or without the flag
*/

/**
 * @public
 * @function
 * @summary - Checks for the presence and removes a flag requesting the creation of obsolete Geoimages layer from the given legend string
 * @param {tf.types.legendString} legendStr - the given legend string
 * @returns {tf.types.RemovePlugInPhotoFromLegendResult} - | {@link tf.types.RemovePlugInPhotoFromLegendResult} the flag and legend
*/
tf.urlapi.RemovePlugInPhotoFromLegend = function (legendStr) {
    var requestedPlugInPhoto = false;
    var legendStrUse = tf.js.GetNonEmptyString(legendStr, "");

    if (!!legendStr) {
        var unescapedLegend = unescape(legendStr);
        var legendArray = unescapedLegend.split(';');

        legendStrUse = "";

        for (var i = 0; i < legendArray.length; i++) {
            //tf.GetDebug().LogIfTest(legendArray[i]);
            if (legendArray[i].indexOf("plugin_photo") != -1) { requestedPlugInPhoto = true; }
            else { legendStrUse += legendArray[i] + ";"; }
        }

        legendStrUse = tf.js.ClipEndingChar(legendStrUse, ';');
    }
    return { requestedPlugInPhoto: requestedPlugInPhoto, legendStr: legendStrUse };
}

/**
 * Object returned by the function [BreakUrlParamString]{@link tf.urlapi.BreakUrlParamString}
 * @public
 * @typedef {object} tf.types.BreakUrlParamStringResult
 * @property {string} tag - either <b>'#'</b> or <b>'?'</b>
 * @property {string} urlPart - the portion of the string before <b>tag</b>
 * @property {string} paramsPart - the portion of the string after <b>tag</b>
*/

/**
 * @public
 * @function
 * @summary - Breaks a full url string into two parts separated by either a <b>'#'</b> or <b>'?'</b>
 * @param {string} strFullUrl - the given full url
 * @returns {tf.types.BreakUrlParamStringResult} - | {@link tf.types.BreakUrlParamStringResult} the broken parts
*/
tf.urlapi.BreakUrlParamString = function (strFullUrl) {
    var strFullUrlUse = tf.js.GetNonEmptyString(strFullUrl);
    var tag, urlPart, paramsPart;

    function splitStrInTwo (fullStr, splitChar) {
        var splitStr = fullStr.split(splitChar), leftSideStr = '', rightSideStr = '', didSplit;
        if (didSplit = (splitStr.length == 2)) { leftSideStr = splitStr[0]; rightSideStr = splitStr[1]; } else { leftSideStr = fullStr; rightSideStr = ''; }
        return { leftSideStr: leftSideStr, rightSideStr: rightSideStr, didSplit: didSplit };
    }

    if (!!strFullUrlUse) {
        var charsSplit = ['#', '?'];
        var split;

        for (var c in charsSplit) {
            var splitChar = charsSplit[c];
            if ((split = splitStrInTwo(strFullUrlUse, splitChar)).didSplit) {
                tag = splitChar;
                urlPart = split.leftSideStr;
                paramsPart = split.rightSideStr;
                break;
            }
        }

        if (!split.didSplit) {
            tag = '?';
            urlPart = strFullUrlUse;
            paramsPart = '';
        }
    }
    else { tag = '?'; urlPart = ''; paramsPart = ''; }
    return { tag: tag, urlPart: urlPart, paramsPart: paramsPart };
}

/**
 * @public
 * @function
 * @summary - Modifies a full url string by breaking it with {@link tf.urlapi.BreakUrlParamString} and then
 * concatenating the url part, the tag, the given defaults string, the original params part, and the given overrides string, in that order
 * @param {string} strOriginalURL - the given full url
 * @param {string} strDefaults - the given default parameters
 * @param {string} strOverrides - the given override parameters
 * @returns {string} - | {@link string} the modified url
*/
tf.urlapi.ModifyURLParamString = function (strOriginalURL, strDefaults, strOverrides) {
    var strOriginalURLUse = tf.js.GetNonEmptyString(strOriginalURL);
    var strDefaultsUse = tf.js.GetNonEmptyString(strDefaults);
    var strOverridesUse = tf.js.GetNonEmptyString(strOverrides);
    var urlBroken = tf.urlapi.BreakUrlParamString(strOriginalURLUse);
    var paramsPart = urlBroken.paramsPart;

    if (!!strDefaultsUse) {
        if (paramsPart.length > 0 && paramsPart.charAt(0) != '&') { paramsPart = '&' + paramsPart; }
        paramsPart = strDefaultsUse + paramsPart;
    }
    if (!!strOverridesUse) { paramsPart += strOverridesUse; }

    return urlBroken.urlPart + urlBroken.tag + paramsPart;
}

/**
 * @public
 * @function
 * @summary - Parses the given full url string for parameters to be merged with the given defaults, unescapes parameter values, converts property names to lowercase
 * @param {string} fullURL - the given full url
 * @param {object} defaultParameters - the given default parameters
 * @returns {object} - | {@link object} the <b>fullURL</b> parameters combined with the <b>defaultParameters</b> in object format
*/
tf.urlapi.ParseURLParameters = function (fullURL, defaultParameters) {
    var parameters = tf.js.GetIsValidObject(defaultParameters) ? defaultParameters : {};

    if (tf.js.GetIsNonEmptyString(fullURL)) {
        var urlBroken = tf.urlapi.BreakUrlParamString(fullURL);
        var paramsPart = urlBroken.paramsPart;
        var paramStringArray = paramsPart.split("&");
        var paramStringArrayLen = paramStringArray.length;

        if (paramStringArrayLen) {
            for (var i = 0; i < paramStringArrayLen; ++i) {
                var equalIndex = paramStringArray[i].indexOf("=");
                if (equalIndex != -1) {
                    var key = paramStringArray[i].substring(0, equalIndex).toLowerCase();
                    var value = paramStringArray[i].substring(equalIndex + 1, paramStringArray[i].length);
                    parameters[key] = unescape(value);
                }
            }
        }
    }
    else if (tf.js.GetIsValidObject(fullURL)) { parameters = tf.js.ShallowMerge(parameters, fullURL); }
    return parameters;
}

/**
 * @public
 * @function
 * @summary - Parses the given full url string for parameters to be merged with the default values of TerraFly {@link tf.types.URLParameters}
 * @param {string} fullURL - the given full url
 * @param {object} overrideDefaults - optional object containing default values, defaults to {@link void}
 * @returns {object} - | {@link object} the <b>fullURL</b> parameters combined with the defaults
*/
tf.urlapi.ParseURLAPIParameters = function (fullURL, overrideDefaults) {
    var defaultParameters = {};

    defaultParameters[tf.consts.paramNameLat] = tf.consts.defaultLatitude;
    defaultParameters[tf.consts.paramNameLon] = tf.consts.defaultLongitude;
    defaultParameters[tf.consts.paramNameRes] = undefined; //tf.consts.defaultRes;
    defaultParameters[tf.consts.paramNameLevel] = tf.consts.defaultLevel;
    defaultParameters[tf.consts.paramNamePanels] = tf.consts.defaultPanels;
    defaultParameters[tf.consts.paramNameLegend] = tf.consts.defaultLegend;
    defaultParameters[tf.consts.paramNameLegendH] = tf.consts.defaultLegendH;
    defaultParameters[tf.consts.paramNameLegendM] = tf.consts.defaultLegendM;
    defaultParameters[tf.consts.paramNameAddress] = tf.consts.defaultAddress;
    defaultParameters[tf.consts.paramNameVid] = tf.consts.defaultVid;
    defaultParameters[tf.consts.paramNamePassThrough] = tf.consts.defaultTFPassThrough;
    defaultParameters[tf.consts.paramNameTFLogo] = tf.consts.defaultTFLogoOn ? tf.consts.tfLogoOnStr : tf.consts.tfLogoOffStr;
    defaultParameters[tf.consts.paramNameType] = tf.consts.typeNameHybrid;
    defaultParameters[tf.consts.paramNameFMap] = tf.consts.defaultFMap;
    defaultParameters[tf.consts.paramNameSource] = tf.consts.defaultSourceName;
    defaultParameters[tf.consts.paramNameMessageTimeout] = tf.consts.defaultMessageTimeout;
    defaultParameters[tf.consts.paramNameHelp] = tf.consts.defaultHelp;
    defaultParameters[tf.consts.paramNameApps] = tf.consts.defaultApps;
    defaultParameters[tf.consts.paramLinkTargetStr] = '_top';

    if (tf.js.GetIsValidObject(overrideDefaults)) { defaultParameters = tf.js.ShallowMerge(defaultParameters, overrideDefaults); }

    var parameters = tf.urlapi.ParseURLParameters(fullURL, defaultParameters);

    var addressStr = parameters[tf.consts.paramNameAddress];
    addressStr = typeof addressStr === "string" ? addressStr.replace(/\+/g, " ") : "";
    parameters[tf.consts.paramNameAddress] = addressStr;

    return parameters;
}

/**
 * @public
 * @function
 * @summary - Retrieves the actual value of some url parameters from remote files or services
 * @param {tf.types.URLParametersObject} parameters - the given parameters, in {@link object} format
 * @param {function} callBack - a function called (without parameters) after all remote url parameters are retrieved
 * @returns {void} - | {@link void} no return value
*/
tf.urlapi.LoadRemoteParameters = function (parameters, callBack) {
    var nParamsToProcess = 0;

    function setTimeoutCallBack() { if (!!callBackUse) { setTimeout(function () { callBackUse() }, 10); } }
    function onLoadedParam(paramName, param) { parameters[paramName] = param; if (nParamsToProcess > 1) { --nParamsToProcess } else { setTimeoutCallBack(); } }

    if (tf.js.GetIsValidObject(parameters)) {
        var callBackUse = tf.js.GetFunctionOrNull(callBack);
        var paramsWithDDURLDD = [ tf.consts.paramNameLegend, tf.consts.paramNameLegendH, tf.consts.paramNameLegendM ];
        var paramsWithDDURLDDCount = paramsWithDDURLDD.length;

        if (!!paramsWithDDURLDDCount) {

            for (var i in paramsWithDDURLDD) { if (parameters[paramsWithDDURLDD[i]]) { ++nParamsToProcess; } }

            if (!!nParamsToProcess) {
                for (var i = 0 ; i < paramsWithDDURLDDCount ; i++) {
                    var thisParamName = paramsWithDDURLDD[i];
                    var thisParam = parameters[thisParamName];

                    if (thisParam) { new tf.urlapi.URLPartsLoader(thisParamName, thisParam, onLoadedParam); }
                }
            }
            else { setTimeoutCallBack(); }
        }
        else { setTimeoutCallBack(); }
    }
}

/**
 * @private
 * @class
 * @summary - Retrieves one remote url parameter and notifies a callback. Used internally by the API
 * @param {string} paramName - the name of the parameter, in {@link object} format
 * @param {string} initialParam - the initial parameter value, containing a remote reference enclosed with '$$' strings (prefix and suffix)
 * @param {function} onLoadedParamParts - called when all parts of this parameter have been loaded, receiving the loaded parameter name and its value, in that order
 * @returns {void} - | {@link void} no return value
*/
tf.urlapi.URLPartsLoader = function (paramName, initialParam, onLoadedParamParts) {

    var theThis, paramParts, paramPartsCounter;

    /**
     * @public
     * @function
     * @summary - Retrieves initial parameter value, containing a remote reference enclosed with '$$' strings (prefix and suffix)
     * @returns {string} - | {@link string} the parameter value
    */
    this.GetInitialParam = function () { return initialParam; }

    function loadParamParts(param) {

        if (param.indexOf(tf.consts.urlPartsSeparatorStr) != -1) {
            paramParts = param.split(tf.consts.urlPartsSeparatorStr);
            paramPartsCounter = 0;

            for (var i = 1; i < paramParts.length; i += 2) {
                paramPartsCounter++;
                new tf.ajax.GetRequest({ url: paramParts[i], onDataLoaded: onURLPartLoaded, requestProps: i, autoSend: true, overrideMimeType: 'text/plain', useRedirect: false });
            }
        }
        else { onLoadedParamParts.call(undefined, paramName, param); }
    }

    function onURLPartLoaded(notification) {
        if (notification.httpRequest.status == 200) {
            var content = unescape(notification.httpRequest.responseText);
            paramParts[notification.requestProps] = content.replace(/[\r\n]/g, "");
            if (! --paramPartsCounter) { combineParameters(); }
        }
    }

    function combineParameters() {
        var result = ""; for (var i = 0; i < paramParts.length; i++) { result += paramParts[i]; } loadParamParts(result);
    }

    function initialize() { loadParamParts(initialParam); }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};


/**
 * Settings extracted by the function [GetDLayersInfoFromURLParameters]{@link tf.urlapi.GetDLayersInfoFromURLParameters} to be used in the creation of [DLayer]{@link tf.urlapi.DLayer} instances
 * @public
 * @typedef {object} tf.types.URLDLayerSettings
 * @property {string} - dLayerLegend - the name of the DLayer
 * @property {string} - dLayerData - the remote service associated with the DLayer
 * @property {string} - dLayerField - the name of the field to display as a [Map Feature]{@link tf.map.Feature}
 * @property {boolean} - dLayerSelect - the initial map visibility of the DLayer, <b>true</b> if visible, <b>false</b> otherwise
 * @property {string} - dLayerColor - the color with which to display text markers belonging to the DLayer
*/

/**
 * @public
 * @function
 * @summary - Extracts settings used to create a [DLayer List]{@link tf.urlapi.DLayerList} from the given url parameters 
 * @param {tf.types.URLParametersObject} parameters - the given parameters, in {@link object} format
 * @returns {enumerable<tf.types.URLDLayerSettings>} - | {@link enumerable} <{@link tf.types.URLDLayerSettings}> the retrieved settings
*/
tf.urlapi.GetDLayersInfoFromURLParameters = function (parameters) {

    var dLayers = [];

    if (tf.js.GetIsValidObject(parameters)) {
        var index = 0;
        if (getDLayerFromURL("", index)) { ++index; } if (getDLayerFromURL("0", index)) { ++index; } for (var iDLayer = 1 ; getDLayerFromURL(iDLayer, index) ; ++iDLayer) { ++index; }
    }

    function getDLayerFromURL(withSuffix, dLayerIndex) {
        var dLayerLegend;
        if (dLayerLegend = parameters[tf.consts.paramNameDLLegend + withSuffix]) {
            var dLayerData = parameters[tf.consts.paramNameDLData + withSuffix];
            var dLayerField = parameters[tf.consts.paramNameDLField + withSuffix];
            var dLayerSelect = tf.js.GetBoolFromValue(parameters[tf.consts.paramNameDLSelect + withSuffix], true);
            var dLayerColors = parameters[tf.consts.paramNameDLColor + withSuffix];
            if (!dLayerColors) { dLayerColors = ","; }

            var dLayerMarkerStyle = parameters["dLayerMarkerStyle" + withSuffix]
            var dLayerMarkerHoverStyle = parameters["dLayerMarkerHoverStyle" + withSuffix]

            if (!tf.js.GetIsValidObject(dLayerMarkerHoverStyle)) {
                dLayerMarkerHoverStyle = dLayerMarkerStyle;
            }

            dLayers.push({
                markerStyle: dLayerMarkerStyle,
                markerHoverStyle: dLayerMarkerHoverStyle,
                dLayerLegend: dLayerLegend, dLayerData: dLayerData, dLayerField: dLayerField, dLayerSelect: dLayerSelect, dLayerColors: dLayerColors, dLayerIndex: dLayerIndex
            });
            return true;
        }
        return false;
    }
    return dLayers;
};

tf.urlapi.ParseSplitStringWithSeparators = function (str) {
    return tf.js.ParseSplitStringWithSeparators(str, tf.consts.charSplitStrings);
};

tf.urlapi.AddStringWithSeparators = function (strBeingAddedTo, strToBeAdded) {
    return tf.js.AddStringWithSeparators(strBeingAddedTo, strToBeAdded, tf.consts.charSplitStrings);
};

tf.urlapi.AddStringsWithSeparatorsIfAbsent = function (strBeingAddedTo, strsToBeAdded) {
    return tf.js.AddStringsWithSeparatorsIfAbsent(strBeingAddedTo, strsToBeAdded, tf.consts.charSplitStrings);
};

