"use strict";

/**
 * class tf.map.ui.SourcesPopup - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} container - parameter description?
 * @param {?} tMap - parameter description?
 * @param {?} theMapSetSourceCallBack - parameter description?
 * @param {?} rectProvider - parameter description?
*/
tf.map.ui.SourcesPopup = function (container, tMap, theMapSetSourceCallBack, rectProvider) {

    var theThis, popup, radioButtons;

    /*var mapSources = [
        tf.consts.sourceName_best_available, tf.consts.sourceName_naip_1m, tf.consts.sourceName_usgs_toop_r, tf.consts.sourceName_county_1ft,
        tf.consts.sourceName_landsat7_321, tf.consts.sourceName_usgs_1m, tf.consts.sourceName_country_3inch, tf.consts.sourceName_usgs_ap_cir,
        tf.consts.sourceName_usgs_ap_r, tf.consts.sourceName_dor_1ft
    ];*/

    var mapSources = [
        "Best_Available",
        "AIRPHOTO_C",
        "AIRPHOTO2FT",
        "COUNTY_1FT",
        "COUNTY_1M",
        "COUNTY_2FT",
        "COUNTY_3INCH",
        "COUNTY_6INCH",
        "COUNTY_CIR_1FT",
        "COUNTY_CIR_30CM",
        "COUNTY_CLR_10CM",
        "COUNTY_CLR_30CM",
        "DOR_1FT",
        "GEOEYE-1_CLR_1M",
        "GEOEYE-1_CLR_50CM",
        "IKONOS_1M",
        "IKONOS_2001",
        "IKONOS_4M",
        "IKONOS_BW_1M",
        "IKONOS_C",
        "IKONOS_GEOEYE-1_1M",
        "IKONOS-1_0.5M",
        "KOMPSAT-2_CIR_1M",
        "LANDSAT7_321",
        "LANDSAT7_321_28.5M",
        "LANDSAT7_432",
        "LANDSAT7_432_28.5M",
        "LANDSAT7_742",
        "LANDSAT7_PS_C",
        "NAIP_1M",
        "SPOT_CIR_2.5M",
        "SRTM",
        "TRILLIUM",
        "USGS_15CM",
        "USGS_1FT_CITIES",
        "USGS_1M",
        "USGS_20CM",
        "USGS_30CM",
        "USGS_65CM",
        "USGS_75CM",
        "USGS_AP_BW",
        "USGS_AP_CIR",
        "USGS_BW_15CM",
        "USGS_BW_30CM",
        "WV01_BW_50CM",
        "WV02_50CM",
        "BMNG",
        "USGS_BW_3INCH",
        "USGS_60CM",
        "I3"
];

/**
 * method tf.map.ui.SourcesPopup.Show - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} bool - parameter description?
*/
    this.Show = function (bool) { if (popup) { popup.Show(bool); } }
/**
 * method tf.map.ui.SourcesPopup.IsShowing - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.IsShowing = function () { return popup ? popup.IsShowing() : false; }
/**
 * method tf.map.ui.SourcesPopup.Toggle - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Toggle = function () { this.Show(!this.IsShowing()); }

/**
 * method tf.map.ui.SourcesPopup.UpdateSourceFromMap - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.UpdateSourceFromMap = function () {
        var currentValue = tMap.GetSource ();

        for (var i in radioButtons) {
            var theButton = radioButtons[i];
            var theRadioButton = theButton.GetRadioButton();
            var theValue = theRadioButton.value;
            if (theValue == currentValue) {
                var isChecked = theRadioButton.checked;
                if (!isChecked) { theRadioButton.checked = true; }
                break;
            }
        }
    }

/**
 * method tf.map.ui.SourcesPopup.OnContainerResize - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.OnContainerResize = function () { onContainerResize(); }

    function onContainerResize() { if (popup) { popup.OnContainerResize(); } }

    function changeType(theRadioButton) { theMapSetSourceCallBack.call(tMap, theRadioButton.GetRadioButton().value); }

    function divFillElem(theThis) {
        var nMapSources = mapSources.length;
        var currentSource = tMap.GetSource();

        radioButtons = [];

        var radioButtonList = new tf.ui.RadioButtonList();
        var lastIndex = nMapSources - 1;

        for (var i in mapSources) {
            var thisMapSource = mapSources[i];
            var isLast = i == lastIndex;
            var thisRadioButton = radioButtonList.AddRadioButton(thisMapSource, thisMapSource, thisMapSource == currentSource, tf.consts.mapSourcesItemTip + "\"" + thisMapSource + "\"", !isLast);

            var changeTypeCB = function (theButton) { return function () { theButton.SetIsChecked(true); changeType(theButton); } }(thisRadioButton);

            thisRadioButton.SetOnClick(changeTypeCB, theThis);
            radioButtons.push(thisRadioButton);
        }

        popup.SetContent(radioButtonList);
        onContainerResize();
    }

    function initialize() {
        popup = new tf.ui.Popup({
            container: container,
            titleStr: tf.consts.mapSourcesName,
            rectProvider: rectProvider
        });
        divFillElem(this);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
}