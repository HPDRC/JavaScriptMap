"use strict";

/**
 * class tf.map.ui.LegendOptions - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} settings - parameter description?
*/
tf.map.ui.LegendOptions = function (settings) {

    var theThis, styles, debug;
    var callBackOptionChange, callBackCompositesChange, checkPositionAndSizeCallBack, currentResolution ;
    var tLegend, hasLegend, domObj, domElement, lastOpenedClickOnClosed, isShowingCurrent;
    var groupCheckBoxes, checkBoxes, tolerance, bgColorSubDiv, colorTextInRes, colorTextNotInRes;
    var regularClass, lastClass;

/**
 * method tf.map.ui.LegendOptions.SetLegend - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} tLegendSet - parameter description?
*/
    this.SetLegend = function (tLegendSet) { tLegend = (tLegendSet instanceof tf.map.aux.LegendDecoder) ? tLegendSet : null; fillDomElement(); }
/**
 * method tf.map.ui.LegendOptions.GetHasLegend - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetHasLegend = function () { return hasLegend; }

/**
 * method tf.map.ui.LegendOptions.SetShowCurrent - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} bool - parameter description?
*/
    this.SetShowCurrent = function (bool) { return setShowCurrent(bool); }
/**
 * method tf.map.ui.LegendOptions.GetIsShowingCurrent - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetIsShowingCurrent = function () { return isShowingCurrent; }

/**
 * method tf.map.ui.LegendOptions.SetResolution - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} currentResolutionSet - parameter description?
*/
    this.SetResolution = function (currentResolutionSet) { setResolution (currentResolutionSet); }

    function onContainerResize() { if (!!checkPositionAndSizeCallBack) { checkPositionAndSizeCallBack(); } }

    function setResolution(currentResolutionSet) { currentResolution = tf.js.GetFloatNumber(currentResolutionSet, tf.consts.defaultRes); onResolutionChange(false); }

    function setShowCurrent(bool) { isShowingCurrent = !!bool; onResolutionChange(false); }

    function fillDomElement() {

        hasLegend = false;
        tf.dom.RemoveAllChildren(domElement);

        if (!!tLegend) {
            var groupSetNames = tLegend.GetGroupSetNames();
            var groupSet = tLegend.GetGroupSet();
            var groupSetRootName = tLegend.GetGroupSetRootName();
            var len = groupSetNames.length;
            var divClasses = styles.GetUnPaddedDivClassNames(false, false);

            groupCheckBoxes = [];
            checkBoxes = [];
            lastOpenedClickOnClosed = null;

            if (hasLegend = len > 0) {
                var checkBoxList = new tf.ui.CheckBoxList(false);
                var lastGroupSetIndex = len - 1;
                var nSubgroups = 0;

                for (var i = 0 ; i < len ; i++) {
                    var thisGroupSetName = groupSetNames[i];
                    var thisGroupSet = groupSet[thisGroupSetName];
                    var thisGroupSetItems = thisGroupSet.items;
                    var nItems = thisGroupSetItems.length;
                    var checkBoxListForItems = checkBoxList;
                    var thisEnclosingGroup = null;
                    var closeImgObj = null;
                    var divToChangeColor = null;

                    var isSubGroup = thisGroupSetName !== groupSetRootName;

                    if (isSubGroup) {
                        var isLast = lastGroupSetIndex == nSubgroups;
                        var checkBoxWithClickOnClose = checkBoxList.AddCheckBoxWithLabelAndOpenClose(thisGroupSetName, true, "", isLast);
                        var checkBoxObj = checkBoxWithClickOnClose.GetCheckBox();

                        nSubgroups++;
                        closeImgObj = checkBoxWithClickOnClose.GetClickOpenClose();
                        checkBoxListForItems = new tf.ui.CheckBoxList();
                        checkBoxList.AddContent(checkBoxListForItems, true);
                        thisEnclosingGroup = { div: checkBoxWithClickOnClose, checkbox: checkBoxObj, subChecks: [] };
                        groupCheckBoxes.push(thisEnclosingGroup);
                        var enclosingCallBack = function (theCheckBoxObj) {
                            return function () { setTimeout(function () { checkGroupOf(theCheckBoxObj); }, 100); }
                        }(checkBoxObj);
                        checkBoxObj.SetOnClick(enclosingCallBack, theThis);
                        divToChangeColor = checkBoxWithClickOnClose.GetParentNode();
                    }

                    if (nItems > 0) {

                        var lastItem = nItems - 1;

                        for (var j = 0 ; j < nItems ; j++) {
                            var isLast = isSubGroup ? j == lastItem : i == lastGroupSetIndex;
                            var thisItem = thisGroupSetItems[j];
                            var thisItemLabel = thisItem.LABEL;
                            var thisItemDesc = thisItem.DESC;
                            var isChecked = !!thisItem.ISCHECK;

                            thisItemDesc += '(maxRes: ' + thisItem.MAX_RES + ', minRes: ' + thisItem.MIN_RES + ')';

                            var checkBoxObj = checkBoxListForItems.AddCheckBox(thisItemLabel, isChecked, thisItemDesc, !isLast);
                            var debugText = !!debug ? JSON.stringify(thisItem) : null;

                            var onCheckBoxClick = function (theCheckBox, theText) {
                                return function () {
                                    if (!!theText) { debug.LogIfTest(theText); } setTimeout(function () { calcValidComposites(true); }, 100);
                                }
                            }(checkBoxObj, debugText);

                            checkBoxObj.SetOnClick(onCheckBoxClick, theThis);

                            var thisCheckBox = { div: checkBoxObj, checkbox: checkBoxObj, item: thisItem };

                            checkBoxes.push(thisCheckBox);

                            if (thisEnclosingGroup) {
                                thisEnclosingGroup.subChecks.push(thisCheckBox);
                                var thisGroupDiv = checkBoxObj.GetParentNode();
                                thisGroupDiv.style.backgroundColor = bgColorSubDiv;
                            }
                        }
                    }

                    if (closeImgObj) {
                        var theCallBack = function (theClickOnClosed) {
                            return function () {
                                if (theClickOnClosed.GetIsOpen()) {
                                    if (lastOpenedClickOnClosed) { lastOpenedClickOnClosed.SetIsOpen(false); }
                                    lastOpenedClickOnClosed = theClickOnClosed;
                                }
                                else { lastOpenedClickOnClosed = null; }
                                onContainerResize();
                            }
                        }(closeImgObj);
                        var subParent = checkBoxListForItems.GetParentNode();

                        subParent.style.display = 'none';
                        closeImgObj.SetDivOpenClose(subParent, theCallBack);
                    }
                }

                checkBoxList.AppendTo(domElement);
                onResolutionChange(true);
            }
            else {
                var divText = new tf.dom.Div({ cssClass: regularClass });
                var textElement = document.createTextNode("No Base Layers");
                var divTextdiv = divText.GetHTMLElement();
                divTextdiv.appendChild(textElement);
                divTextdiv.style.textAlign = 'center';
                divTextdiv.style.color = 'rgb(0, 0, 0)';
                divTextdiv.style.backgroundColor = 'rgb(255, 255, 0)';
                divText.AppendTo(domElement);
            }
        }
    }

    function checkGroupOf(theCheckBoxObj) {
        var nGroupCheckBoxes = groupCheckBoxes.length;

        for (var i = 0 ; i < nGroupCheckBoxes ; i++) {
            var thisGroupCheckBox = groupCheckBoxes[i];
            if (thisGroupCheckBox.checkbox == theCheckBoxObj) {
                var isChecked = theCheckBoxObj.GetIsChecked();
                var subs = thisGroupCheckBox.subChecks;
                var nSubs = subs.length;

                for (var j = 0 ; j < nSubs ; j++) {
                    var thisCheckBox = subs[j];
                    var thisCheckBoxObj = thisCheckBox.checkbox;

                    thisCheckBoxObj.SetIsChecked(isChecked);
                }
            }
        }
        calcValidComposites(true);
    }

    function hideShowGroups() {
        var nGroupCheckBoxes = groupCheckBoxes.length;
        var lastDivShown = null;

        for (var i = 0 ; i < nGroupCheckBoxes ; i++) {
            var thisGroupCheckBox = groupCheckBoxes[i];
            var thisCheckBoxObj = thisGroupCheckBox.checkbox;
            var thisGroupLabel = thisCheckBoxObj.GetLabel();
            var thisGroupDiv = thisGroupCheckBox.div.GetParentNode();
            var groupHasItemsThatWillShow = false;
            var groupWillShow = !isShowingCurrent;

            var subs = thisGroupCheckBox.subChecks;
            var nSubs = subs.length;

            for (var j = 0 ; (!groupHasItemsThatWillShow) && (j < nSubs) ; j++) {
                var thisCheckBox = subs[j];
                var thisItemDiv = thisCheckBox.div.GetParentNode();

                if (groupHasItemsThatWillShow = (thisItemDiv.style.display === 'block')) { groupWillShow = true; }
            }

            thisGroupLabel.style.color = groupHasItemsThatWillShow ? colorTextInRes : colorTextNotInRes;
            thisGroupDiv.style.display = groupWillShow ? 'block' : 'none';

            if (groupWillShow) {
                tf.dom.AddCSSClass(thisGroupDiv, regularClass);
                lastDivShown = thisGroupDiv;
            }
        }

        if (lastDivShown) {
            tf.dom.ReplaceCSSClass(lastDivShown, regularClass, lastClass);
        }
    }

    function onResolutionChange(optionChanged) {
        if (hasLegend) {
            var nCheckboxes = checkBoxes.length;

            for (var i = 0 ; i < nCheckboxes ; i++) {
                var thisCheckBox = checkBoxes[i];
                var thisCheckBoxObj = thisCheckBox.checkbox;
                var thisItem = thisCheckBox.item;
                var thisItemMinRes = thisItem.MIN_RES - tolerance;
                var thisItemMaxRes = thisItem.MAX_RES + tolerance;
                var thisCheckInResRange = thisItemMinRes <= currentResolution && thisItemMaxRes >= currentResolution;

                var thisItemLabel = thisCheckBoxObj.GetLabel();
                var thisItemDiv = thisCheckBox.div.GetParentNode();

                if (thisCheckInResRange) {
                    thisItemLabel.style.color = colorTextInRes;
                    thisItemDiv.style.display = 'block';
                }
                else {
                    thisItemLabel.style.color = colorTextNotInRes;
                    thisItemDiv.style.display = isShowingCurrent ? 'none' : 'block';
                }
            }

            hideShowGroups();
            calcValidComposites(optionChanged);
        }
        onContainerResize();
    }

    function calcValidComposites(optionChanged) {
        var nCheckboxes = checkBoxes.length;
        var composites = [];

        for (var i = 0 ; i < nCheckboxes ; i++) {
            var thisCheckBox = checkBoxes[i];
            var thisCheckBoxObj = thisCheckBox.checkbox;

            if (thisCheckBoxObj.GetIsChecked()) {
                var thisItem = thisCheckBox.item;
                var thisItemMinRes = thisItem.MIN_RES - tolerance;
                var thisItemMaxRes = thisItem.MAX_RES + tolerance;
                var thisCheckInResRange = thisItemMinRes <= currentResolution && thisItemMaxRes >= currentResolution;

                if (thisCheckInResRange) {
                    var thisItemComposites = thisItem.COMPOSITES;
                    var thisItemNComposites = thisItemComposites.length;

                    for (var ci = 0 ; ci < thisItemNComposites ; ci++) {
                        var thisComposite = thisItemComposites[ci];
                        var thisCompositeMinRes = thisComposite.MIN - tolerance;
                        var thisCompositeMaxRes = thisComposite.MAX + tolerance;
                        var thisCompositeInResRange = thisCompositeMinRes <= currentResolution && thisCompositeMaxRes >= currentResolution;

                        if (thisCompositeInResRange) { composites.push(thisComposite); }
                    }
                }
            }
        }

        if (optionChanged) { if (!!callBackOptionChange) { callBackOptionChange(theThis); } }
        if (!!callBackCompositesChange) { callBackCompositesChange(theThis, composites); }
    }


    function initialize() {
        isShowingCurrent = true;
        currentResolution = 0;
        debug = settings.debug;

        styles = tf.GetStyles();

        var subStyles = styles.GetSubStyles();

        groupCheckBoxes = [];
        checkBoxes = [];

        tolerance = 0.00001;
        bgColorSubDiv = subStyles.mapSubLegendBkColor;

        colorTextInRes = subStyles.darkTextColor;
        colorTextNotInRes = subStyles.disabledTextColor;

        regularClass = styles.GetPaddedDivClassNames(false, false);
        lastClass = styles.GetPaddedDivClassNames(false, true);

        callBackOptionChange = tf.js.GetFunctionOrNull(settings.callBackOptionChange);
        callBackCompositesChange = tf.js.GetFunctionOrNull(settings.callBackCompositesChange);
        checkPositionAndSizeCallBack = tf.js.GetFunctionOrNull(settings.checkPositionAndSizeCallBack);
        domElement = (domObj = new tf.dom.Div({ cssClass: styles.GetUnPaddedDivClassNames(false, false) })).GetHTMLElement();
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: domElement });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
}
tf.js.InheritFrom(tf.map.ui.LegendOptions, tf.dom.Insertable);