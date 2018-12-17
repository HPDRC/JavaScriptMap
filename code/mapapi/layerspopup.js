"use strict";

/**
 * class tf.map.ui.LayersPopup - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} container - parameter description?
 * @param {?} tMap - parameter description?
 * @param {?} theHasLegendCallBack - parameter description?
 * @param {?} rectProvider - parameter description?
 * @param {?} showMapBaseLayers - parameter description?
 * @param {?} getLayers - parameter description?
*/
tf.map.ui.LayersPopup = function (container, tMap, theHasLegendCallBack, rectProvider, showMapBaseLayers, getLayers) {

    var theThis = null;

    var popup = null;
    var layerCheckBoxes = [];

/**
 * method tf.map.ui.LayersPopup.Show - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} bool - parameter description?
*/
    this.Show = function (bool) { if (popup) { popup.Show(bool); } }
/**
 * method tf.map.ui.LayersPopup.IsShowing - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.IsShowing = function () { return popup ? popup.IsShowing() : false; }
/**
 * method tf.map.ui.LayersPopup.Toggle - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Toggle = function () { this.Show(!this.IsShowing()); }

/**
 * method tf.map.ui.LayersPopup.OnContainerResize - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.OnContainerResize = function () { onContainerResize(); }

/**
 * method tf.map.ui.LayersPopup.RefreshContent - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.RefreshContent = function () { return refreshContent(); }

/**
 * method tf.map.ui.LayersPopup.UpdateLayerVisibilityFromMap - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.UpdateLayerVisibilityFromMap = function () {
        var nCheckboxes = layerCheckBoxes.length;

        for (var i = 0 ; i < nCheckboxes ; i++) {
            var thisLayerCheckBox = layerCheckBoxes [i] ;
            var thisLayer = thisLayerCheckBox.layer;
            var thisCheckObj = thisLayerCheckBox.checkBox;
            var thisCheck = thisCheckObj.GetCheckBox();
            var thisLayerVisible = thisLayer.GetIsVisible () ;

            if (thisLayerVisible != thisCheck.checked) {
                thisCheck.checked = thisLayerVisible;
            }
        }
    }

    this.GetHTMLElement = function () { return !!popup ? popup.GetHTMLElement() : undefined; }

    function refreshContent() {
        popup.ClearContent();
        layerCheckBoxes = [];
        divFillElem(this);
    }

    function divFillElem(theThis) {
        var layers = getLayers();
        var nLayers = layers.length;
        var hasLayers = nLayers > 0;
        var hasLegend = theHasLegendCallBack ? theHasLegendCallBack.call(tMap) : false;

        if (hasLayers) {
            var checkBoxList = new tf.ui.CheckBoxList(false);
            var lastIndex = nLayers - 1;

            for (var i = 0 ; i < nLayers ; i++) {
                var isLast = i == lastIndex && ! hasLegend;
                var thisLayer = layers[i];
                var thisLayerName = thisLayer.GetName();
                var thisLayerDesc = thisLayer.GetDesc();
                var thisLayerCheck = thisLayer.GetIsVisible();
                //var thisLayerColor = tf.js.GetHexColorStr(thisLayer.GetLayerColor());

                if (thisLayerDesc == null || typeof thisLayerDesc != "string" || thisLayerDesc == "") { thisLayerDesc = thisLayerName; }

                var checkBoxObj = checkBoxList.AddCheckBox(thisLayerName, thisLayerCheck, /*"toggle " + */thisLayerDesc, !isLast);
                var checkToggleLayerVisible = function (theCheckBox, theLayer) {
                    return function () {
                        setTimeout( function() { theLayer.SetVisible(theCheckBox.GetIsChecked()); }, 100 );
                    }
                }(checkBoxObj, thisLayer);

                layerCheckBoxes.push({ layer: thisLayer, checkBox: checkBoxObj });

                checkBoxObj.SetOnClick(checkToggleLayerVisible, theThis, [thisLayer]);
            }
            popup.AddContent(checkBoxList);
        }
        else {
            var divText = new tf.dom.Div({ cssClass: tf.GetStyles().paddedBlockDivClass });
            var textElement = document.createTextNode("Map has no Data Layers");

            var divTextdiv = divText.GetHTMLElement();
            divTextdiv.appendChild(textElement);

            divTextdiv.style.align = 'center';
            divTextdiv.style.color = 'rgb(0, 0, 0)';
            divTextdiv.style.backgroundColor = 'rgb(255, 255, 0)';
            popup.AddContent(divText);
        }

        if (hasLegend) {
            var styles = tf.GetStyles();
            var subStyles = styles.GetSubStyles();
            var row = new tf.dom.Div({ cssClass: styles.paddedBlockDivClass });
            //var buttonDim = subStyles.mapButtonDimEmNumber + "em";
            //var buttonDim = subStyles.mapControlFontSizeEmNumber + "em";
            var toolTipStr = tf.consts.baseMapLayersToolTip;
            var buttonFunction = function () { showMapBaseLayers(); };
            var button = styles.AddButtonDivMargins(new tf.ui.TextBtn({ style: styles.mapTextBtnClass, label: tf.consts.baseMapLayersName, onClick: buttonFunction, tooltip: toolTipStr, dim: "1.2em" }));

            row.GetHTMLElement().style.textAlign = "center";
            button.AppendTo(row);
            popup.AddContent(row);
        }
        onContainerResize();
    }

    function onContainerResize() { if (popup) { popup.OnContainerResize(); } }

    function initialize() {
        popup = new tf.ui.Popup({
            container: container,
            titleStr: tf.consts.mapLayersName,
            rectProvider: rectProvider
        });

        refreshContent();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
}