"use strict";

/**
 * class tf.ui.VolumeControl - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} initialLightBool - parameter description?
 * @param {?} buttonHeight - parameter description?
 * @param {?} initPos01 - parameter description?
 * @param {?} initialIsMute - parameter description?
 * @param {?} volChangeCallBack - parameter description?
*/
tf.ui.VolumeControl = function (initialLightBool, buttonHeight, initPos01, initialIsMute, volChangeCallBack) {

    var onTouchDevice = tf.browser.HasTouch();

    var svgGlyphLib = tf.ui.GetSvgGlyphLib();

    var muteGlyph = svgGlyphLib.GetGlyphByName(tf.styles.SvgGlyphMuteVolumeName);
    var volMinGlyph = svgGlyphLib.GetGlyphByName(tf.styles.SvgGlyphMinimumVolumeName);
    var volMedGlyph = svgGlyphLib.GetGlyphByName(tf.styles.SvgGlyphMediumVolumeName);
    var volMaxGlyph = svgGlyphLib.GetGlyphByName(tf.styles.SvgGlyphMaximumVolumeName);

    var theThis, divObj, divElem, volButton, volSlider, volSliderElem = null;
    var widthVolSlider = 64;

    var pos01 = null;
    var pos01BeforeMute = null;
    var isMute = false;

    var hoverListener;

/**
 * method tf.ui.VolumeControl.Repaint - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.Repaint = function () { volSlider.Repaint(); }

    function getCurVolGlyph() {
        return isMute ? muteGlyph : (pos01 > 0.66 ? volMaxGlyph : (pos01 > 0.33 ? volMedGlyph : volMinGlyph));
    }

    function getCurVolToolTip() { return isMute ? "unmute" : "mute"; }

    function updateVolButton() {
        volButton.ChangeGlyph(getCurVolGlyph());
        volButton.ChangeToolTip(getCurVolToolTip());

        if (!!volChangeCallBack) { volChangeCallBack(theThis, pos01); }
    }

    function setMutePos01() { pos01BeforeMute = pos01; pos01 = 0; }
    function setUnMutePos01() { pos01 = pos01BeforeMute; }

    function setPosByMute() { if (isMute) { setMutePos01() } else { setUnMutePos01(); } }

    function onClickVolume() {
        isMute = !isMute;
        setPosByMute();
        volSlider.SetPos01(pos01);
        updateVolButton();
    }

    function onVolHover(notification) {
        if (!onTouchDevice) {
            var inHover = notification.isInHover;
            volSliderElem.style.display = inHover ? "inline-block" : "none";
            if (inHover) { volSlider.Repaint(); }
        }
    }

    function onClickVolSlide(theSlide, slidePos01) {
        if (isMute) { isMute = false; }
        pos01 = volSlider.GetPos01();
        updateVolButton();
    }

    function initialize() {

        var styles = tf.GetStyles();

        isMute = !!initialIsMute;

        typeof volChangeCallBack !== "function" && (volChangeCallBack = null);

        pos01 = tf.js.GetFloatNumber(initPos01, 0.5);

        divObj = new tf.dom.Div({ cssClass: styles.unPaddedInlineBlockDivClass });
        divElem = divObj.GetHTMLElement();

        var divVolsObj = new tf.dom.Div({ cssClass: styles.unPaddedInlineBlockDivClass });
        var divVolsElem = divObj.GetHTMLElement();

        volButton = new tf.ui.SvgGlyphBtn({ style: initialLightBool, glyph: getCurVolGlyph(), onClick: onClickVolume, tooltip: getCurVolToolTip(), dim: buttonHeight });

        divVolsObj.AddContent(volButton);

        volSlider = new tf.ui.CanvasSlider(pos01, undefined, false);
        volSliderElem = volSlider.GetHTMLElement();

        volSlider.SetOnClickListener(onClickVolSlide, theThis);

        volSliderElem.style.width = widthVolSlider + "px";
        volSliderElem.style.display = onTouchDevice ? "inline-block" : "none";

        hoverListener = new tf.events.DOMHoverListener({ target: divVolsElem, callBack: onVolHover, optionalScope: theThis, callBackSettings: null });

        divVolsObj.AddContent(volSlider);

        divObj.AddContent(divVolsObj);

        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: divElem });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
}
tf.js.InheritFrom(tf.ui.VolumeControl, tf.dom.Insertable);