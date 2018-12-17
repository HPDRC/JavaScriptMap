"use strict";

/**
 * class tf.map.ui.Mapnik2Popup - class description?
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
tf.map.ui.Mapnik2Popup = function (container, tMap, callBackStringChange, callBackOptionChange, rectProvider, debug) {

    var theThis = null;
    var styles = tf.GetStyles();
    var popup = null;
    var divOptions = null;
    var showingCurrent = true, showingHybrid = true;
    var currentHString = "", currentMString = "";
    var legendOptionsH = null, legendOptionsM = null;
    var showingHybridVal = "hybrid";
    var showingMapVal = "map";
    var currentRadioVal = "current";
    var allRadioVal = "all";
    var dashStarFind = new RegExp('-.*');

/**
 * method tf.map.ui.Mapnik2Popup.Show - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} bool - parameter description?
*/
    this.Show = function (bool) { if (popup) { popup.Show(bool); } }
/**
 * method tf.map.ui.Mapnik2Popup.IsShowing - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.IsShowing = function () { return popup ? popup.IsShowing() : false; }
/**
 * method tf.map.ui.Mapnik2Popup.Toggle - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Toggle = function () { this.Show(!this.IsShowing()); }
/**
 * method tf.map.ui.Mapnik2Popup.OnResolutionChange - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.OnResolutionChange = function (newRes) { return onResolutionChange(newRes); }
/**
 * method tf.map.ui.Mapnik2Popup.GetHasLegend - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetHasLegend = function () { return legendOptionsH.GetHasLegend() || legendOptionsM.GetHasLegend(); }
/**
 * method tf.map.ui.Mapnik2Popup.GetHasLegendH - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetHasLegendH = function () { return legendOptionsH.GetHasLegend(); }
/**
 * method tf.map.ui.Mapnik2Popup.GetHasLegendM - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetHasLegendM = function () { return legendOptionsM.GetHasLegend(); }
/**
 * method tf.map.ui.Mapnik2Popup.OnContainerResize - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.OnContainerResize = function () { onContainerResize(); }
/**
 * method tf.map.ui.Mapnik2Popup.SetLegend - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} tLegendSetH - parameter description?
 * @param {?} tLegendSetM - parameter description?
*/
    this.SetLegend = function (tLegendSetH, tLegendSetM) { legendOptionsH.SetLegend(tLegendSetH); legendOptionsM.SetLegend(tLegendSetM); }
/**
 * method tf.map.ui.Mapnik2Popup.GetHybridString - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetHybridString = function () { return currentHString; }
/**
 * method tf.map.ui.Mapnik2Popup.GetMapString - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetMapString = function () { return currentMString; }

    function onResolutionChange(newRes) { if (tMap) { legendOptionsH.SetResolution(newRes); legendOptionsM.SetResolution(newRes); } }

    function showCurrent(bool) { showingCurrent = !!bool; legendOptionsH.SetShowCurrent(showingCurrent); legendOptionsM.SetShowCurrent(showingCurrent); }

    function showHybrid(bool) {
        var showOptions = (showingHybrid = !!bool) ? legendOptionsH : legendOptionsM;
        divOptions.ClearContent();
        showOptions.AppendTo(divOptions);
        onContainerResize();
    }

    function setLegendStrings(newHString, newMString) {
        if (currentHString != newHString || currentMString != newMString) {
            currentHString = newHString; currentMString = newMString;
            if (callBackStringChange) { callBackStringChange.call(tMap, currentHString, currentMString); }
        }
    }

    function onContainerResize() { if (popup) { popup.OnContainerResize(); } }

    function onOptionChange() { if (callBackOptionChange) { callBackOptionChange.call(tMap); } }

    function onCompositesChange(legendOptions, composites) {
        var newString = "", strSeparator = '';

        for (var i in composites) {
            var thisComposite = composites[i];
            var thisPrefix = thisComposite.PREFIX.replace(dashStarFind, "");
            newString += strSeparator + thisPrefix; strSeparator = ',';
        }

        var newHString, newMString;

        if (legendOptions == legendOptionsH) { newHString = newString; newMString = currentMString; }
        else { newHString = currentHString; newMString = newString; }

        setLegendStrings(newHString, newMString)
    }

    function createAllOrCurrentSection() {
        var radioButtonList = new tf.ui.RadioButtonList();
        var radioCurrent = radioButtonList.AddRadioButton("Current Resolution", currentRadioVal, showingCurrent, "Base Layers Visible at Current Resolution", true);
        var radioAll = radioButtonList.AddRadioButton("All Resolutions", allRadioVal, !showingCurrent, "Base Layers Visible at All Resolutions", true);
        var selectCurrent = function (theRadio, bool) { return function () { theRadio.SetIsChecked(true); showCurrent(bool); } }(radioCurrent, true);
        var selectAll = function (theRadio, bool) { return function () { theRadio.SetIsChecked(true); showCurrent(bool); } }(radioAll, false);

        radioCurrent.SetOnClick(selectCurrent, theThis);
        radioAll.SetOnClick(selectAll, theThis);

        popup.AddContent(radioButtonList);
    }

    function createHybridOrMapSection() {
        var radioButtonList = new tf.ui.RadioButtonList();
        var radioHybrid = radioButtonList.AddRadioButton("Hybrid Display", showingHybridVal, showingHybrid, "Base Layers Visible on Hybrid Display Type", true);
        var radioMap = radioButtonList.AddRadioButton("Map Display", showingMapVal, !showingHybrid, "Base Layers Visible on Map Display Type", true);
        var selectHybrid= function (theRadio, bool) { return function () { theRadio.SetIsChecked(true); showHybrid(bool); } }(radioHybrid, true);
        var selectMap = function (theRadio, bool) { return function () { theRadio.SetIsChecked(true); showHybrid(bool); } }(radioMap, false);

        radioHybrid.SetOnClick(selectHybrid, theThis);
        radioMap.SetOnClick(selectMap, theThis);

        popup.AddContent(radioButtonList);
    }

    function createPopupContent() {
        createHybridOrMapSection();
        createAllOrCurrentSection();
        divOptions = new tf.dom.Div({ cssClass: styles.GetUnPaddedDivClassNames(false, false) });
        legendOptionsH.AppendTo(divOptions);

        popup.AddContent(divOptions);
    }

    function initialize() {

        popup = new tf.ui.Popup({
            container: container,
            titleStr: tf.consts.baseMapLayersName,
            rectProvider: rectProvider
        });

        legendOptionsH = new tf.map.ui.LegendOptions({
            debug: debug,
            callBackOptionChange: onOptionChange,
            callBackCompositesChange: onCompositesChange,
            checkPositionAndSizeCallBack: onContainerResize
        });

        legendOptionsM = new tf.map.ui.LegendOptions({
            debug: debug,
            callBackOptionChange: onOptionChange,
            callBackCompositesChange: onCompositesChange,
            checkPositionAndSizeCallBack: onContainerResize
        });

        createPopupContent();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
}