"use strict";

/**
 * class tf.ui.VideoPopup - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} container - parameter description?
 * @param {?} backgroundColorSet - parameter description?
 * @param {?} backgroundImgSet - parameter description?
*/
tf.ui.VideoPopup = function (container, backgroundColorSet, backgroundImgSet) {

    var theThis, styles, subStyles, onTouchDevice, wPadding, widthWindowRatio, heightWindowRatio, videoRatio;
    var defaultBackgroundColor, backgroundColor, backgroundImg;
    var divContainerElem, popup, divPopupTitle, videoElem, posSlideObj, posSlideElem, volControlObj, currentTimeElem;
    var hoverTimeElem, totalTimeElem, toolBarObj, toolBarElem, videoAllContentObj, videoAllContentElem;
    var playPauseButtonObj, stopButtonObj, autoRepeatButtonObj, videoLength, videoPos, slideHover;
    var isStopped, autoRepeat, miniVideo, miniVideoPos01, miniVideoPos, miniVideoBorderDim;
    var miniVideoColorNormal, miniVideoColorLate, miniVideoBorderCaughtUp, miniVideoBorderLate;
    var minivideoShowing, videoW, videoH, addedContents, lightBool, buttonDim, hasVideo;
    var onCloseCallBack, onCloseThis, miniVideoDisplaying, lastMouse01;
    var onMiniVideoChangeCallBack, onThisMiniVideoChangeCallBack;
    var onTimeUpdateThis, onTimeUpdateCallBack;

    /**
     * method tf.ui.VideoPopup.Stop - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
    */
    this.Stop = function () { return onStop(); }

    /**
     * method tf.ui.VideoPopup.GetLeftTopOnContainer - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
    */
    this.GetLeftTopOnContainer = function () { return getLeftTopOnContainer(); }

    function getLeftTopOnContainer() { return popup.GetLeftTopOnContainer(); }

    /**
     * method tf.ui.VideoPopup.ChangeTitle - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
     * @param {?} titleStr - parameter description?
    */
    this.ChangeTitle = function (titleStr) { popup.ChangeTitle(titleStr); }

    /**
     * method tf.ui.VideoPopup.ChangeSpeed - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
     * @param {?} speed - parameter description?
    */
    this.ChangeSpeed = function (speed) { return changeSpeed(speed); }

    /**
     * method tf.ui.VideoPopup.SetPos01 - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
     * @param {?} pos01Set - parameter description?
    */
    this.SetPos01 = function (pos01Set) { setSlidePos01(pos01Set); changeVideoPosFromSlide(); }

    /**
     * method tf.ui.VideoPopup.GetPos01 - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
    */
    this.GetPos01 = function () { return posSlideObj.GetPos01(); }

    /**
     * method tf.ui.VideoPopup.GetPos - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
    */
    this.GetPos = function () { return videoPos; }

    /**
     * method tf.ui.VideoPopup.GetToolBarButtonDim - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
    */
    this.GetToolBarButtonDim = function () { return buttonDim; }

    /**
     * method tf.ui.VideoPopup.GetIsButtonLight - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
    */
    this.GetIsButtonLight = function () { return lightBool; }

    /**
     * method tf.ui.VideoPopup.AddToolBarButton - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
     * @param {?} toolBarButton - parameter description?
    */
    this.AddToolBarButton = function (toolBarButton) { return addToolBarButton(toolBarButton); }

    /**
     * method tf.ui.VideoPopup.AddContent - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
     * @param {?} elem - parameter description?
    */
    this.AddContent = function (elem) { return addContent(elem); }

    /**
     * method tf.ui.VideoPopup.SetOnClickTitle - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
     * @param {?} callBack - parameter description?
     * @param {?} optionalScope - parameter description?
    */
    this.SetOnClickTitle = function (callBack, optionalScope) { if (popup) { popup.SetOnClickTitle(callBack, optionalScope); } }

    /**
     * method tf.ui.VideoPopup.SetZIndex - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
     * @param {?} zIndex - parameter description?
    */
    this.SetZIndex = function (zIndex) { popup && popup.SetZIndex(zIndex); }

    /**
     * method tf.ui.VideoPopup.GetZIndex - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
    */
    this.GetZIndex = function () { return popup ? popup.GetZIndex() : 0; }

    /**
     * method tf.ui.VideoPopup.SetOnClose - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
     * @param {?} callBack - parameter description?
     * @param {?} optionalScope - parameter description?
    */
    this.SetOnClose = function (callBack, optionalScope) { onCloseCallBack = tf.js.GetFunctionOrNull(callBack); onCloseThis = optionalScope; }

    /**
     * method tf.ui.VideoPopup.ShowMiniVideo - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
     * @param {?} showBool - parameter description?
     * @param {?} time01 - parameter description?
    */
    this.ShowMiniVideo = function (showBool, time01) { return showMiniVideo(showBool, time01); }

    /**
     * method tf.ui.VideoPopup.GetIsMiniVideoShowing - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
    */
    this.GetIsMiniVideoShowing = function () { return minivideoShowing; }

    /**
     * method tf.ui.VideoPopup.SetOnMiniVideoChangeCallBack - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
     * @param {?} callBack - parameter description?
     * @param {?} optionalScope - parameter description?
    */
    this.SetOnMiniVideoChangeCallBack = function (callBack, optionalScope) { onMiniVideoChangeCallBack = tf.js.GetFunctionOrNull(callBack); onThisMiniVideoChangeCallBack = optionalScope; }

    /**
     * method tf.ui.VideoPopup.SetOnTimeUpdate - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
     * @param {?} callBack - parameter description?
     * @param {?} optionalScope - parameter description?
    */
    this.SetOnTimeUpdate = function (callBack, optionalScope) { onTimeUpdateCallBack = tf.js.GetFunctionOrNull(callBack); onTimeUpdateThis = optionalScope; }

    /**
     * method tf.ui.VideoPopup.SetTitle - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
     * @param {?} titleStr - parameter description?
    */
    this.SetTitle = function (titleStr) { popup && popup.ChangeTitle(titleStr); }

    /**
     * method tf.ui.VideoPopup.Show - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
     * @param {?} bool - parameter description?
    */
    this.Show = function (bool) { if (popup) { popup.Show(bool); } }

    /**
     * method tf.ui.VideoPopup.IsShowing - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
    */
    this.IsShowing = function () { return popup ? popup.IsShowing() : false; }

    /**
     * method tf.ui.VideoPopup.Toggle - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
    */
    this.Toggle = function () { this.Show(!this.IsShowing()); }

    /**
     * method tf.ui.VideoPopup.SetVideoURL - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
     * @param {?} theVideoURL - parameter description?
    */
    this.SetVideoURL = function (theVideoURL) { hasVideo = false; isStopped = true; if (miniVideo) { miniVideo.src = theVideoURL; } videoElem.src = theVideoURL; }

    /**
     * method tf.ui.VideoPopup.OnContainerResize - ?
     * @private
     * @function
     * @summary - method summary?
     * @description - method description?
     * @returns {?} - method returns?
    */
    this.OnContainerResize = function () { onContainerResize(); }

    function myOnCloseCallBack() { onStop(); if (!!onCloseCallBack) { onCloseCallBack.call(onCloseThis); } }

    function setContent(content) { if (popup) { return popup.SetContent(content); } }

    function positionMiniVideo() {
        if (miniVideo) {
            var miniVideoW = videoW / 3;
            var miniVideoH = videoH / 3;

            miniVideo.style.width = miniVideoW + "px";
            miniVideo.style.height = miniVideoH + "px";

            var topPos = videoH - miniVideoH - 4 * miniVideoBorderDim;

            miniVideo.style.top = topPos + "px";

            var leftPos = miniVideoPos01 * videoW - miniVideoW / 2 + miniVideoBorderDim;

            if (leftPos < miniVideoBorderDim) { leftPos = miniVideoBorderDim; } else if (leftPos + 2 * miniVideoBorderDim + miniVideoW > videoW) { leftPos = videoW - miniVideoW - 2 * miniVideoBorderDim; }

            miniVideo.style.left = leftPos + "px";
        }
    }

    function resizeElems() {
        if (videoElem) {
            var containerWidth = divContainerElem.offsetWidth;
            var containerHeight = divContainerElem.offsetHeight;
            var maxW = widthWindowRatio * containerWidth;
            var maxH = heightWindowRatio * containerHeight;
            var hForMaxW = maxW / videoRatio;

            if (hForMaxW > maxH) { maxW = maxH * videoRatio; } else { maxH = maxW / videoRatio; }

            videoW = Math.round(maxW);
            videoH = Math.round(maxH);

            videoElem.style.width = videoW + "px";
            videoElem.style.height = videoH + "px";

            posSlideElem.style.width = videoW + "px";
            posSlideObj.Repaint();

            volControlObj.Repaint();

            positionMiniVideo();

            var nAddedContents = addedContents.length;

            for (var i = 0 ; i < nAddedContents ; ++i) {
                var contentObj = addedContents[i], contentElem = tf.dom.GetHTMLElementFrom(contentObj);
                if (contentElem) { contentElem.style.width = (videoW + "px"); }
            }
            //tf.GetDebug().LogIfTest ("videoW: " + videoW + " videoH: " + videoH);
        }
    }

    function onContainerResize() { resizeElems(); popup.OnContainerResize(); }

    function onPlay() { isStopped = false; if (videoElem.paused) { videoElem.play(); } else { videoElem.pause(); } }
    function onStop() { if (videoElem) { isStopped = true; videoElem.pause(); setSlidePos01(0); changeVideoPosFromSlide(); playPauseButtonObj.SetIsToggled(true); checkMiniVideoOnHover(); } }

    function updateVideoPosInterface() {
        var timeStamp = tf.js.ConvertToHHMMSSBrief(videoPos);
        currentTimeElem.textContent = timeStamp;
        //popup.ChangeTitle(timeStamp);
        if (onTimeUpdateCallBack) { onTimeUpdateCallBack.call(onTimeUpdateThis, theThis, posSlideObj.GetPos01(), videoPos); }
    }

    function changeVideoPosFromSlide() {
        var pos01 = posSlideObj.GetPos01();
        if (hasVideo) {
            videoPos = videoElem.currentTime = pos01 * videoLength;
            updateVideoPosInterface();
            //tf.GetDebug().LogIfTest("changed to: " + pos01);
        }
    }

    function setSlidePos01(pos01Set) { posSlideObj.SetPos01(pos01Set, true); }

    function setSlidePos01IfNotStopped(pos01Set) { if (!isStopped) { setSlidePos01(pos01Set); changeVideoPosFromSlide(); } }

    function onTimeUpdate() {
        videoPos = videoElem.currentTime;
        if (videoLength) {
            setSlidePos01(videoPos / videoLength);
            updateVideoPosInterface();
        }
    }

    function onLoadedMetadata() {
        videoLength = videoElem.duration; totalTimeElem.textContent = tf.js.ConvertToHHMMSSBrief(videoLength);
        hasVideo = true;
        isStopped = false;
        changeVideoPosFromSlide();
        popup.OnContainerResize();
        videoElem.play();
    }

    function setMiniVideoTime01(time01) { miniVideoPos01 = time01; miniVideo.currentTime = miniVideoPos = time01 * videoLength; }

    function notifyMiniVideoChange(mouse01) {
        if (mouse01 != undefined || !miniVideoDisplaying) {
            if (onMiniVideoChangeCallBack) {
                onMiniVideoChangeCallBack.call(onThisMiniVideoChangeCallBack, theThis, miniVideoDisplaying, mouse01);
            }
        }
    }

    function setMiniVideoStyleShow(showBool) {
        if (!!miniVideo) {
            if (showBool) { minivideoShowing = true; miniVideo.style.display = 'block'; hoverTimeElem.style.display = 'inline'; }
            else { minivideoShowing = false; miniVideo.style.display = 'none'; hoverTimeElem.style.display = 'none'; }
        }
    }

    function showMiniVideo(showBool, time01) {
        if (miniVideo) {
            if ((showBool = !!showBool) != miniVideoDisplaying) { setMiniVideoStyleShow(miniVideoDisplaying = showBool); }
            if (miniVideoDisplaying) { setMiniVideoTime01(time01); }
        }
    }

    function checkMiniVideoOnHover(mouse01) {
        var miniVideoWasDisplaying = miniVideoDisplaying;

        miniVideoDisplaying = false;

        if (!onTouchDevice) {
            if (posSlideObj.GetIsInHover() && !posSlideObj.GetIsInDrag()) {
                miniVideoDisplaying = true;
                if (miniVideoWasDisplaying) { if (mouse01 != lastMouse01) { notifyMiniVideoChange(mouse01); } }
                else { setMiniVideoStyleShow(true); notifyMiniVideoChange(mouse01); }
            }
            else { if (miniVideoWasDisplaying) { setMiniVideoStyleShow(false); notifyMiniVideoChange(mouse01); } }
        }

        miniVideoWasDisplaying = miniVideoDisplaying;
        lastMouse01 = mouse01;

        return miniVideoDisplaying;
    }

    function onHoverOverSlide(theSlide, hover01) { if (theSlide == posSlideObj) { if (!theSlide.GetIsInHover()) { checkMiniVideoOnHover(); } } }

    function onMouseMoveOverSlide(theSlide, mouse01) {
        if (miniVideo) {
            if (theSlide == posSlideObj && theSlide.GetIsInHover() && !theSlide.GetIsInDrag()) {
                if (checkMiniVideoOnHover(mouse01)) {
                    miniVideo.style.border = miniVideoBorderLate;
                    hoverTimeElem.style.color = miniVideoColorLate;
                    posSlideObj.SetMouseFillColor(miniVideoColorLate);
                    setMiniVideoTime01(mouse01);
                }
            }
        }
    }

    function onClickVideoSlide(theSlide, pos01) {
        checkMiniVideoOnHover();
        //var posVideo = pos01 * videoLength; videoElem.currentTime = posVideo;
        changeVideoPosFromSlide();
    }

    function onMiniVideoTimeUpdate() {
        if (miniVideo) {
            miniVideo.style.border = miniVideoBorderCaughtUp;
            hoverTimeElem.style.color = miniVideoColorNormal;
            hoverTimeElem.textContent = ' [ ' + tf.js.ConvertToHHMMSSBrief(miniVideoPos) + ' ]';
            posSlideObj.SetMouseFillColor(miniVideoColorNormal);
            positionMiniVideo();
        }
    }

    function createMiniVideo() {
        if (!onTouchDevice) {
            miniVideo = document.createElement('video');
            miniVideo.style.display = 'none';
            miniVideo.style.position = 'absolute';
            miniVideo.style.border = miniVideoBorderCaughtUp;
            miniVideo.style.zIndex = 2;
            miniVideo.style.backgroundColor = backgroundColor;
            miniVideo.poster = backgroundImg;
            tf.events.AddDOMEventListener(miniVideo, "timeupdate", onMiniVideoTimeUpdate);
        }
    }

    function onEndedVideo() { if (autoRepeat) { isStopped = false; setSlidePos01(0); changeVideoPosFromSlide(); videoElem.play(); } else { onStop(); } }

    function createVideoElem() {
        videoElem = document.createElement('video');
        videoElem.style.backgroundColor = backgroundColor;
        videoElem.poster = backgroundImg;
        videoElem.style.position = 'relative';
        videoElem.autoplay = false;

        var listeners = { "loadedmetadata": onLoadedMetadata, "timeupdate": onTimeUpdate, "ended": onEndedVideo };
        for (var i in listeners) { tf.events.AddDOMEventListener(videoElem, i, listeners[i]); }
    }

    function onVolChange(theVolControl, vol01) { if (theVolControl === volControlObj) { videoElem.volume = vol01; } }

    function createVolControl(vol01, lightBool, buttonDim) { volControlObj = new tf.ui.VolumeControl(lightBool, buttonDim, vol01, false, onVolChange); }

    function onToggleAutoRepeat() { autoRepeat = !autoRepeat; }

    function createToolBar() {
        var vol01 = 0.5;

        toolBarObj = new tf.dom.Div({ cssClass: styles.paddedBlockDivClass });
        toolBarElem = toolBarObj.GetHTMLElement();

        toolBarElem.style.textAlign = 'left';

        autoRepeatButtonObj = new tf.ui.SvgGlyphToggleBtn({
            style: lightBool, onClick: onToggleAutoRepeat, dim: buttonDim, isToggled: !autoRepeat,
            glyph: tf.styles.SvgGlyphAutoRepeatName, tooltip: "Auto-repeat", toggledGlyph: tf.styles.SvgGlyphNoAutoRepeatName, toggledTooltip: "Auto-repeat"
        });

        createVolControl(vol01, lightBool, buttonDim);

        toolBarObj.AddContent(playPauseButtonObj = new tf.ui.SvgGlyphToggleBtn({
            style: lightBool, onClick: onPlay, dim: buttonDim, isToggled: false,
            glyph: tf.styles.SvgGlyphPauseName, tooltip: "Pause", toggledGlyph: tf.styles.SvgGlyphPlayName, toggledTooltip: "Play"
        }));

        toolBarObj.AddContent(stopButtonObj =
            new tf.ui.SvgGlyphBtn({ style: lightBool, glyph: tf.styles.SvgGlyphStopName, onClick: onStop, tooltip: "Stop", dim: buttonDim }));

        toolBarObj.AddContent(autoRepeatButtonObj);
        toolBarObj.AddContent(volControlObj);

        currentTimeElem = document.createElement('span');

        toolBarObj.AddContent(currentTimeElem);

        var slashElem = document.createElement('span');
        slashElem.textContent = " / ";

        toolBarObj.AddContent(slashElem);

        totalTimeElem = document.createElement('span');

        toolBarObj.AddContent(totalTimeElem);

        hoverTimeElem = document.createElement('span');
        hoverTimeElem.style.display = 'none';

        toolBarObj.AddContent(hoverTimeElem);
    }

    function addToolBarButton(toolBarButtonObj) {
        var toolBarButtonElem = tf.dom.GetHTMLElementFrom(toolBarButtonObj);

        if (toolBarButtonElem) {
            var divObj = new tf.dom.Div({ cssClass: styles.unPaddedBlockDivClass });
            var divElem = divObj.GetHTMLElement();

            divElem.style["float"] = "right";
            divElem.style.display = 'inline-block';

            divObj.AddContent(toolBarButtonObj);
            toolBarObj.AddContent(divObj);
        }
    }

    function createPosSlide() {
        posSlideObj = new tf.ui.CanvasSlider(0, undefined, true);
        posSlideElem = posSlideObj.GetHTMLElement();

        posSlideObj.SetOnClickListener(onClickVideoSlide, theThis);
        posSlideObj.SetOnHoverListener(onHoverOverSlide, theThis);
        posSlideObj.SetOnMouseMoveListener(onMouseMoveOverSlide, theThis);
    }

    function createPopup() {

        popup = new tf.ui.Popup({
            container: container, titleStr: "Video", marginHor: 8, marginVer: 8, maxHeight: "50%", maxWidth: "100%", horPos: "right", verPos: "bottom",
            fontSize: tf.GetStyles().GetSubStyles().locationPopupContentFontSizeEmNumber + "em", textAlign: "right"
        });

        divPopupTitle = popup.GetTitleContainer();

        popup.SetTitleToolTip("Video");
        popup.SetOnClose(myOnCloseCallBack, theThis);
    }

    function createAllContent() {
        videoAllContentObj = new tf.dom.Div({ cssClass: styles.unPaddedBlockDivClass });
        styles.ApplyPositionRelativeStyle(videoAllContentObj);
        videoAllContentElem = videoAllContentObj.GetHTMLElement();
    }

    function addContent(elem) { if (tf.dom.GetHTMLElementFrom(elem)) { addedContents.push(elem); videoAllContentObj.AddContent(elem); } }

    function initialize() {

        styles = tf.GetStyles();
        subStyles = styles.GetSubStyles();
        onTouchDevice = tf.browser.HasTouch();

        hasVideo = false;
        wPadding = 24;

        widthWindowRatio = 0.8;
        heightWindowRatio = 0.3;
        //heightWindowRatio = 0.6;
        videoRatio = 16 / 9;

        defaultBackgroundColor = "#000";
        backgroundColor = !!backgroundColorSet ? backgroundColorSet : defaultBackgroundColor;
        backgroundImg = !!backgroundImgSet ? backgroundImgSet : tf.platform.GetPoweredByTerraFlyLogoImgStr();

        videoPos = 0;
        isStopped = false;
        autoRepeat = true;

        miniVideoBorderDim = 2;
        miniVideoColorNormal = subStyles.darkTextColor;
        miniVideoColorLate = subStyles.disabledTextColor;
        //miniVideoColorLate = "#f68";
        miniVideoBorderCaughtUp = miniVideoBorderDim + "px solid " + miniVideoColorNormal;
        miniVideoBorderLate = miniVideoBorderDim + "px solid " + miniVideoColorLate;
        minivideoShowing = false;

        videoW = 0;
        videoH = 0;

        addedContents = [];

        lightBool = false;
        buttonDim = "2em";

        divContainerElem = tf.dom.GetHTMLElementFrom(container);

        createPopup();
        createAllContent();
        createVideoElem();
        createMiniVideo();
        createPosSlide();
        createToolBar();

        if (miniVideo) { videoAllContentObj.AddContent(miniVideo); }

        videoAllContentObj.AddContent(videoElem);
        videoAllContentObj.AddContent(posSlideObj);
        videoAllContentObj.AddContent(toolBarObj);

        setContent(videoAllContentObj);

        resizeElems();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
