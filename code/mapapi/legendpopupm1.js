"use strict";

/**
 * class tf.map.ui.Mapnik1Popup - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} container - parameter description?
 * @param {?} tMap - parameter description?
 * @param {?} callBackStringChange - parameter description?
 * @param {?} callBackOptionChange - parameter description?
 * @param {?} rectProvider - parameter description?
 * @param {?} debug - parameter description?
*/
tf.map.ui.Mapnik1Popup = function (container, tMap, callBackStringChange, callBackOptionChange, rectProvider, debug) {

    var theThis = null;
    var popup = null;
    var showingCurrent = true;
    var currentHString = "", currentMString = "";
    var legendOptions = null;
    var currentRadioVal = "current";
    var allRadioVal = "all";

/**
 * method tf.map.ui.Mapnik1Popup.Show - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} bool - parameter description?
*/
    this.Show = function (bool) { if (popup) { popup.Show(bool); } }
/**
 * method tf.map.ui.Mapnik1Popup.IsShowing - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.IsShowing = function () { return popup ? popup.IsShowing() : false; }
/**
 * method tf.map.ui.Mapnik1Popup.Toggle - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Toggle = function () { this.Show(!this.IsShowing()); }
/**
 * method tf.map.ui.Mapnik1Popup.OnResolutionChange - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.OnResolutionChange = function (newRes) { return onResolutionChange(newRes); }
/**
 * method tf.map.ui.Mapnik1Popup.GetHasLegend - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetHasLegend = function () { return legendOptions.GetHasLegend(); }
/**
 * method tf.map.ui.Mapnik1Popup.OnContainerResize - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.OnContainerResize = function () { onContainerResize(); }
/**
 * method tf.map.ui.Mapnik1Popup.SetLegend - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} tLegendSet - parameter description?
*/
    this.SetLegend = function (tLegendSet) { return legendOptions.SetLegend(tLegendSet); }
/**
 * method tf.map.ui.Mapnik1Popup.GetHybridString - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetHybridString = function () { return currentHString; }
/**
 * method tf.map.ui.Mapnik1Popup.GetMapString - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetMapString = function () { return currentMString; }

    function onResolutionChange(newRes) { if (tMap) { legendOptions.SetResolution(newRes); } }

    function showCurrent(bool) { legendOptions.SetShowCurrent(showingCurrent = !!bool); }

    function setLegendStrings(newHString, newMString) {
        if (currentHString != newHString || currentMString != newMString) {
            currentHString = newHString; currentMString = newMString;
            if (callBackStringChange) { callBackStringChange.call(tMap, currentHString, currentMString); }
        }
    }

    function onContainerResize() { if (popup) { popup.OnContainerResize(); } }

    function onOptionChange() { if (callBackOptionChange) { callBackOptionChange.call(tMap); } }

    function onCompositesChange(legendOptions, composites) {
        var newHString = "", newMString = "", addedStr = false;

        for (var i in composites) {
            var thisComposite = composites[i];
            var compositeHString = thisComposite.PREFIX + thisComposite.SUFFIX_H;
            var compositeMString = thisComposite.PREFIX + thisComposite.SUFFIX_M;

            if (addedStr) { newHString += "+" + compositeHString; newMString += "+" + compositeMString; }
            else { addedStr = true; newHString = compositeHString; newMString = compositeMString; }
        }
        setLegendStrings(newHString, newMString)
    }

    function createPopupContent() {
        var radioButtonList = new tf.ui.RadioButtonList();
        var radioCurrent = radioButtonList.AddRadioButton("Current Resolution", currentRadioVal, showingCurrent, "Base Layers Visible at Current Resolution", true);
        var radioAll = radioButtonList.AddRadioButton("All Resolutions", allRadioVal, !showingCurrent, "Base Layers Visible at All Resolutions", true);
        var selectCurrent = function (theRadio, bool) { return function () { theRadio.SetIsChecked(true); showCurrent(bool); } }(radioCurrent, true);
        var selectAll = function (theRadio, bool) { return function () { theRadio.SetIsChecked(true); showCurrent(bool); } }(radioAll, false);

        radioCurrent.SetOnClick(selectCurrent, theThis);
        radioAll.SetOnClick(selectAll, theThis);

        popup.AddContent(radioButtonList);
        popup.AddContent(legendOptions);
    }

    function initialize() {

        popup = new tf.ui.Popup({
            container: container, titleStr: tf.consts.baseMapLayersName, rectProvider: rectProvider
        });

        legendOptions = new tf.map.ui.LegendOptions({
            debug: debug,
            callBackOptionChange: onOptionChange,
            callBackCompositesChange: onCompositesChange,
            checkPositionAndSizeCallBack: onContainerResize
        });

        createPopupContent();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};