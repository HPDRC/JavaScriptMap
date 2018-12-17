"use strict";

/**
 * class tf.map.ui.TypesPopup - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} container - parameter description?
 * @param {?} tMap - parameter description?
 * @param {?} theMapSetModeCallBack - parameter description?
 * @param {?} rectProvider - parameter description?
*/
tf.map.ui.TypesPopup = function (container, tMap, theMapSetModeCallBack, rectProvider) {

    var theThis, popup, radioButtons;

/**
 * method tf.map.ui.TypesPopup.Show - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} bool - parameter description?
*/
    this.Show = function (bool) { if (popup) { popup.Show(bool); } }
/**
 * method tf.map.ui.TypesPopup.IsShowing - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.IsShowing = function () { return popup ? popup.IsShowing() : false; }
/**
 * method tf.map.ui.TypesPopup.Toggle - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Toggle = function () { this.Show(!this.IsShowing()); }

/**
 * method tf.map.ui.TypesPopup.UpdateModeFromMap - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.UpdateModeFromMap = function () {
        var currentMode = tMap.GetMapType();

        for (var i in radioButtons) {
            var theButton = radioButtons[i];
            var theRadioButton = theButton.GetRadioButton();
            var theValue = theRadioButton.value;
            if (theValue == currentMode) {
                var isChecked = theRadioButton.checked ;
                if (! isChecked) { theRadioButton.checked = true; }
                break;
            }
        }
    }

/**
 * method tf.map.ui.TypesPopup.OnContainerResize - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.OnContainerResize = function () { onContainerResize(); }

    function onContainerResize() { if (popup) { popup.OnContainerResize(); } }

    function divFillElem(theThis) {

        var currentMode = tMap.GetMapType();
        var radioButtonList = new tf.ui.RadioButtonList();

        var popupRadioHybrid = radioButtonList.AddRadioButton(tf.consts.mapTypesHybridLabel, tf.consts.typeNameHybrid, tf.consts.typeNameHybrid == currentMode, tf.consts.mapTypesHybridTip, true);
        var popupRadioAerial = radioButtonList.AddRadioButton(tf.consts.mapTypesAerialLabel, tf.consts.typeNameAerial, tf.consts.typeNameAerial == currentMode, tf.consts.mapTypesAerialTip, true);
        var popupRadioMap = radioButtonList.AddRadioButton(tf.consts.mapTypesMapLabel, tf.consts.typeNameMap, tf.consts.typeNameMap == currentMode, tf.consts.mapTypesMapTip, false);

        radioButtons = [popupRadioHybrid, popupRadioAerial, popupRadioMap];

        for (var i in radioButtons) {
            var thisRadio = radioButtons[i];
            var changeType = function (theRadio) {
                return function () {
                    theRadio.SetIsChecked(true);
                    var value = theRadio.GetRadioButton().value; theMapSetModeCallBack.call(tMap, value);
                }
            }(thisRadio);

            thisRadio.SetOnClick(changeType, theThis);
        }

        popup.SetContent(radioButtonList);
        onContainerResize();
    }

    function initialize() {
        popup = new tf.ui.Popup({
            container: container,
            titleStr: tf.consts.mapTypesName,
            rectProvider: rectProvider
        });

        divFillElem(this);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
}