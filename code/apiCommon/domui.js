"use strict";

/**
 * Settings used in the creation of [Insertable]{@link tf.dom.Insertable} instances
 * @public
 * @typedef {object} tf.types.InsertableSettings
 * @property {object} domObj - a mandatory property
 * @property {HTMLElementLike} domElement - a mandatory property
*/

/**
 * @public
 * @class
 * @summary Insertable is a base class for other API classes whose instances can be inserted into the HTML Document Object Model.
 * @param {tf.types.InsertableSettings} settings - creation settings
 */
tf.dom.Insertable = function (settings) {
    var theThis, domObj, domElement;

    /**
     * @public
     * @function
     * @summary - Retrieves the {@link object} associated with this Insertable instance
     * @returns {object} - | {@link object} the element
    */
    this.GetDomObj = function () { return domObj; }

    /**
     * @public
     * @function
     * @summary - Retrieves the {@link HTMLElementLike} associated with this Insertable instance
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the element
    */
    this.GetHTMLElement = function () { return domElement; }

    /**
     * @public
     * @function
     * @summary - Retrieves the {@link HTMLElement} parent node of the {@link HTMLElementLike} instance associated with this Insertable instance
     * @returns {HTMLElement} - | {@link HTMLElement} the parent node object
    */
    this.GetParentNode = function () { return !!domElement ? domElement.parentNode : null; }

    this.RemoveFromParent = function () {
        var parent = theThis.GetParentNode();
        if (!!parent) {
            parent.removeChild(theThis.GetHTMLElement());
        }
    }

    this.GetHasParent = function () { return !!theThis.GetParentNode(); }

    /**
     * @public
     * @function
     * @summary - Adds this Insertable instance to the given {@link HTMLElementLike} instance
     * @param {HTMLElementLike} elem - the given instance
     * @returns {void} - | {@link void} no return value
    */
    this.AppendTo = function (elem) { if (!!domElement) { tf.dom.AppendTo(theThis, elem); } }

    function initialize() {
        if (!!(domObj = tf.js.GetIsValidObject(settings.domObj) ? settings.domObj : null)) {
            if (!(domElement = tf.dom.GetHTMLElementFrom(settings.domElement))) {
                domObj = null;
                tf.GetDebug().LogIfTest("Insertable: failed to get HTML element");
            }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * Settings used in the creation of [Element]{@link tf.dom.Element} instances
 * @public
 * @typedef {object} tf.types.ElementSettings
 * @property {object} domObj - a mandatory property
 * @property {HTMLElementLike} domElement - a mandatory property
 * @property {string} id - optional id. If defined, sets the HTML <b>id</b> property, defaults to {@link void}
 * @property {tf.types.CSSStyleName} cssClass - optional css class. If defined, sets the HTML <b>class</b> property, defaults to {@link void}
 * @property {string} tooltip - optional tooltip string. If defined, sets the HTML <b>title</b> property, defaults to {@link void}
 * @property {string} value - optional value string. If defined, sets the HTML <b>value</b> property, defaults to {@link void}
 * @property {boolean} addTextContentAsSpan - If <b>true</b> this instance creates HTML spans when adding text content, if <b>false</b> text content is used as an HTML id. Defaults to <b>true</b>
 * @property {tf.types.CSSStyleName} spanCSSClass - optional css class used when adding HTML spans to this instance, defaults to {@link void}
*/

/**
 * @public
 * @class
 * @summary Element is an [Insertable]{@link tf.dom.Insertable} used as base class for other API classes whose instances are directly 
 * related with standard elements in the HTML Document Object Model, such as <b>'div'</b>.
 * @param {tf.types.ElementSettings} settings - creation settings
 * @extends {tf.dom.Insertable}
 */
tf.dom.Element = function (settings) {
    var theThis, domObj, domElement, spanCSSClass, addTextContentAsSpan, onClick, onClickCB, onChangeCB, onChange, onHover, onHoverCB;

    /**
     * @public
     * @function
     * @summary - Call this function before disposing of this Element instance to perform clean-up
     * @param {string} newValue - the value
     * @returns {void} - | {@link void} no return value
    */
    this.OnDelete = function () { return onDelete(); }

    /**
     * @public
     * @function
     * @summary - Sets this instance's HTML <b>value</b> property
     * @param {string} newValue - the value
     * @returns {void} - | {@link void} no return value
    */
    this.SetValue = function (newValue) { if (!!domElement) { domElement.value = tf.js.GetNonEmptyString(newValue, ''); } }

    /**
     * @public
     * @function
     * @summary - Retrieves this instance's HTML <b>value</b> property
     * @returns {string} - | {@link string} the value
    */
    this.GetValue = function () { return !!domElement ? domElement.value.trim() : ''; }

    /**
     * @public
     * @function
     * @summary - Sets a [Click Listener]{@link tf.events.DOMClickListener} for this Element instance
     * @param {tf.types.MultiDOMEventListenerCallBack} callBack - to receive event notifications
     * @param {object} optionalScope - optional scope used with <b>callBack</b>
     * @param {object} callBackSettings - application defined properties, to be passed to <b>callBack</b> during notifications
     * @returns {void} - | {@link void} no return value
    */
    this.SetOnClick = function (callBack, optionalScope, callBackSettings) { return setOnClick(callBack, optionalScope, callBackSettings); }
    this.SetOnHover = function (callBack, optionalScope, callBackSettings) { return setOnHover(callBack, optionalScope, callBackSettings); }
    this.SetOnChange = function (callBack, optionalScope, callBackSettings) { return setOnChange(callBack, optionalScope, callBackSettings); }

    /**
     * @public
     * @function
     * @summary - Removes any content that was previously added to this Element instance
     * @returns {void} - | {@link void} no return value
    */
    this.ClearContent = function () { tf.dom.RemoveAllChildren(theThis); domElement.innerHTML = ''; }

    /**
     * @public
     * @function
     * @summary - Replaces any content that was previously added to this Element instance with the given new contents
     * @param {...HTMLElementLike} newContents - zero or more comma separated contents to added
     * @returns {void} - | {@link void} no return value
    */
    this.ReplaceContent = function () { theThis.ClearContent(); theThis.AddContent.apply(theThis, arguments); }

    /**
     * @public
     * @function
     * @summary - Adds the given new content to contents that were previously added to this Element instance
     * @param {...HTMLElementLike} newContents - zero or more comma separated contents to added
     * @returns {void} - | {@link void} no return value
    */
    this.AddContent = function () {
        for (var i in arguments) {
            var elem = arguments[i];
            if (!!elem) {
                if (tf.js.GetIsString(elem)) {
                    if (addTextContentAsSpan) {
                        var htmlSpanDiv = (new tf.dom.Span({ cssClass: spanCSSClass })).GetHTMLElement();
    
                        htmlSpanDiv.innerHTML = elem;
                        domElement.appendChild(htmlSpanDiv);
                    }
                    else { domElement.appendChild(document.createTextNode(elem)); }
                }
                else if (tf.js.GetFunctionOrNull(elem.AppendTo)) { elem.AppendTo(theThis); }
                else if (elem = tf.dom.GetHTMLElementFrom(elem)) { domElement.appendChild(elem); }
            }
        }
    }

    /**
     * @public
     * @function
     * @summary - Removes the the given existing content from this container
     * @param {HTMLElementLike} existingContent - the content  to remove
     * @returns {void} - | {@link void} no return value
    */
    this.RemoveContent = function (existingContent) {
        if (!!(existingContent = tf.dom.GetHTMLElementFrom(existingContent))) {
            if (existingContent.parentNode == domElement) { domElement.removeChild(existingContent); }
        }
    }

    /**
     * @public
     * @function
     * @summary - Inserts the the given new content as the new first child of this container
     * @param {HTMLElementLike} newContent - the content  to insert
     * @returns {void} - | {@link void} no return value
    */
    this.InsertHead = function (newContent) {
        if (!!(newContent = tf.dom.GetHTMLElementFrom(newContent))) {
            //if (newContent.parentNode == domElement) { theThis.RemoveContent(newContent); }
            if (domElement.childNodes.length == 0) { return theThis.AddContent(newContent); }
            else { return theThis.InsertContentBefore(newContent, domElement.firstElementChild); }
        }
    }

    /**
     * @public
     * @function
     * @summary - Inserts the the given new content before an existing content
     * @param {HTMLElementLike} newContent - the content  to insert
     * @param {HTMLElementLike} existingContent - the existing content, before which <b>newContent</b> will be inserted
     * @returns {void} - | {@link void} no return value
    */
    this.InsertContentBefore = function (newContent, existingContent) {
        if (!!(newContent = tf.dom.GetHTMLElementFrom(newContent)) && !!(existingContent = tf.dom.GetHTMLElementFrom(existingContent))) {
            if (existingContent.parentNode == domElement) { domElement.insertBefore(newContent, existingContent); }
        }
    }

    /**
     * @public
     * @function
     * @summary - Inserts the the given new content after an existing content
     * @param {HTMLElementLike} newContent - the content  to insert
     * @param {HTMLElementLike} existingContent - the existing content, after which <b>newContent</b> will be inserted
     * @returns {void} - | {@link void} no return value
    */
    this.InsertContentAfter = function (newContent, existingContent) {
        if (!!(newContent = tf.dom.GetHTMLElementFrom(newContent)) && !!(existingContent = tf.dom.GetHTMLElementFrom(existingContent))) {
            if (existingContent.parentNode == domElement) { if (existingContent = existingContent.nextSibling) { theThis.InsertContentBefore(newContent, existingContent); } }
        }
    }

    /**
     * @public
     * @function
     * @summary - Vertically scrolls the contents of this Element instance to the top of the given existing content
     * @param {HTMLElementLike} existingContent - content belonging to this Element instance, to the top of which this Element's contents will be vertically scrolled
     * @returns {void} - | {@link void} no return value
    */
    this.ScrollContent = function (existingContent) {
        if (existingContent = tf.dom.GetHTMLElementFrom(existingContent) && existingContent.parentNode == domElement) {
            domElement.scrollTop = existingContent.offsetTop - domElement.offsetTop;
        }
    }

    function onDelete() {
        if (!!onClick) { onClick.OnDelete(); onClick = null; }
        if (!!onHover) { onHover.OnDelete(); onHover = null; }
    }

    function onClickCallBack(notification) { if (!!onClickCB) { onClickCB(notification); } }
    function onHoverCallBack(notification) { if (!!onHoverCB) { onHoverCB(notification); } }
    function onChangeCallBack(notification) { if (!!onChangeCB) { onChangeCB(notification); } }

    function setOnClick(callBack, optionalScope, callBackSettings) {
        if (onClick == undefined) {
            onClick = new tf.events.DOMClickListener({ domObj: domObj, target: domElement, callBack: onClickCallBack, optionalScope: optionalScope, callBackSettings: callBackSettings });
        }
        else { onClick.ChangeCallBackSettings(callBackSettings); }
        onClickCB = tf.js.GetFunctionOrNull(callBack);
    }

    function setOnHover(callBack, optionalScope, callBackSettings) {
        if (onHover == undefined) {
            onHover = new tf.events.DOMHoverListener({ domObj: domObj, target: domElement, callBack: onHoverCallBack, optionalScope: optionalScope, callBackSettings: callBackSettings });
        }
        else { onHover.ChangeCallBackSettings(callBackSettings); }
        onHoverCB = tf.js.GetFunctionOrNull(callBack);
    }

    function setOnChange(callBack, optionalScope, callBackSettings) {
        if (onChange == undefined) {
            onChange = new tf.events.DOMChangeListener({ domObj: domObj, target: domElement, callBack: onChangeCallBack, optionalScope: optionalScope, callBackSettings: callBackSettings });
        }
        else { onChange.ChangeCallBackSettings(callBackSettings); }
        onChangeCB = tf.js.GetFunctionOrNull(callBack);
    }

    function initialize() {
        addTextContentAsSpan = false;
        if (!!(domObj = tf.js.GetIsValidObject(settings.domObj) ? settings.domObj : null)) {
            if (!(domElement = tf.dom.GetHTMLElementFrom(settings.domElement))) {
                domObj = null;
            }
            else {
                !!settings.id && (domElement.id = settings.id);
                tf.js.GetIsNonEmptyString(settings.cssClass) && (domElement.className = settings.cssClass);
                tf.js.GetIsNonEmptyString(settings.tooltip) && (domElement.title = settings.tooltip);
                tf.js.GetIsNonEmptyString(settings.value) && (domElement.value = settings.value);
                spanCSSClass = tf.js.GetNonEmptyString(settings.spanCSSClass, null);
                addTextContentAsSpan = tf.js.GetBoolFromValue(settings.addTextContentAsSpan, true);
            }
        }
        tf.dom.Insertable.call(theThis, settings);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.dom.Element, tf.dom.Insertable);

/**
 * @public
 * @class
 * @summary Div is an [Element]{@link tf.dom.Element} implementing the standard <b>'div'</b> HTML element
 * @param {tf.types.ElementSettings} settings - creation settings, including an additional {@link boolean} property <b>initiallyVisible</b> that, if set to <b>false</b>, creates an invisible <b>div</b> (display='none')
 * @extends {tf.dom.Element}
 */
tf.dom.Div = function (settings) {
    var theThis;

    /**
     * @public
     * @function
     * @summary - Retrieves the <b>div</b> {@link HTMLElement} associated with this instance
     * @returns {HTMLElement} - | {@link HTMLElement} the element
    */
    this.GetDiv = function () { return theThis.GetHTMLElement(); }

    function initialize() {
        var domElement = document.createElement('div');
        settings = tf.js.GetValidObjectFrom(settings);
        var cssClass = tf.js.GetIsNonEmptyString(settings.cssClass) ? settings.cssClass : tf.GetStyles().paddedBlockDivStyle;
        if (tf.js.GetIsFalseNotUndefined(settings.initiallyVisible)) { domElement.style.display = 'none'; }
        tf.dom.Element.call(theThis, { id: settings.id, domObj: theThis, domElement: domElement, cssClass: cssClass, tooltip: settings.tooltip });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.dom.Div, tf.dom.Element);

tf.dom.Select = function (settings) {
    var theThis;

    /**
     * @public
     * @function
     * @summary - Retrieves the <b>div</b> {@link HTMLElement} associated with this instance
     * @returns {HTMLElement} - | {@link HTMLElement} the element
    */
    this.GetSelect = function () { return theThis.GetHTMLElement(); }

    function initialize() {
        var domElement = document.createElement('select');
        settings = tf.js.GetValidObjectFrom(settings);
        if (tf.js.GetIsFalseNotUndefined(settings.initiallyVisible)) { domElement.style.display = 'none'; }
        tf.dom.Element.call(theThis, { id: settings.id, domObj: theThis, domElement: domElement, cssClass: settings.cssClass, tooltip: settings.tooltip });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.dom.Select, tf.dom.Element);

tf.dom.Option = function (settings) {
    var theThis;

    /**
     * @public
     * @function
     * @summary - Retrieves the <b>div</b> {@link HTMLElement} associated with this instance
     * @returns {HTMLElement} - | {@link HTMLElement} the element
    */
    this.GetSelect = function () { return theThis.GetHTMLElement(); }

    function initialize() {
        var domElement = document.createElement('option');
        settings = tf.js.GetValidObjectFrom(settings);
        if (tf.js.GetIsFalseNotUndefined(settings.initiallyVisible)) { domElement.style.display = 'none'; }
        tf.dom.Element.call(theThis, { id: settings.id, domObj: theThis, domElement: domElement, cssClass: settings.cssClass, tooltip: settings.tooltip });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.dom.Option, tf.dom.Element);

tf.dom.UL = function (settings) {
    var theThis;

    this.GetUL = function () { return theThis.GetHTMLElement(); }

    function initialize() {
        var domElement = document.createElement('ul');
        settings = tf.js.GetValidObjectFrom(settings);
        if (tf.js.GetIsFalseNotUndefined(settings.initiallyVisible)) { domElement.style.display = 'none'; }
        tf.dom.Element.call(theThis, { id: settings.id, domObj: theThis, domElement: domElement, cssClass: settings.cssClass, tooltip: settings.tooltip });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.dom.Option, tf.dom.Element);

tf.dom.LI = function (settings) {
    var theThis;

    this.GetUL = function () { return theThis.GetHTMLElement(); }

    function initialize() {
        var domElement = document.createElement('li');
        settings = tf.js.GetValidObjectFrom(settings);
        if (tf.js.GetIsFalseNotUndefined(settings.initiallyVisible)) { domElement.style.display = 'none'; }
        tf.dom.Element.call(theThis, { id: settings.id, domObj: theThis, domElement: domElement, cssClass: settings.cssClass, tooltip: settings.tooltip });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.dom.Option, tf.dom.Element);

tf.dom.Button = function (settings) {
    var theThis, onHoverCB, hoverListener;

    this.GetButton = function () { return theThis.GetHTMLElement(); }

    this.OnDelete = function () {
        if (!!hoverListener) { hoverListener.OnDelete(); hoverListener = undefined; }
    }

    function notifyCB(theCB, notification) { if (!!theCB) { theCB({ sender: theThis, notification: notification }); } }

    function onHoverButton(notification) { notifyCB(onHoverCB, notification); }

    function initialize() {
        var domElement = document.createElement('button');
        settings = tf.js.GetValidObjectFrom(settings);
        var cssClass = tf.js.GetIsNonEmptyString(settings.cssClass) ? settings.cssClass : tf.GetStyles().unPaddedBlockDivStyle;
        if (tf.js.GetIsFalseNotUndefined(settings.initiallyVisible)) { domElement.style.display = 'none'; }
        tf.dom.Element.call(theThis, { id: settings.id, domObj: theThis, domElement: domElement, cssClass: cssClass, tooltip: settings.tooltip });
        theThis.SetOnClick(settings.onClick, settings.optionalScope, settings.onClickSettings);
        theThis.SetOnHover(settings.onHover, settings.optionalScope, settings.onHoverSettings);
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.dom.Div, tf.dom.Element);

/**
 * @public
 * @class
 * @summary Text Input is an [Element]{@link tf.dom.Element} implementing the standard <b>'input'</b> HTML element of type <b>'text'</b>. 
 * Use this instance's inherited functions [SetValue]{@link tf.dom.Element#SetValue} and [GetValue]{@link tf.dom.Element#GetValue} to set/get the associated input text {@link string}
 * @param {tf.types.ElementSettings} settings - creation settings
 * @extends {tf.dom.Element}
 */
tf.dom.TextInput = function (settings) {
    var theThis = null;

    /**
     * @public
     * @function
     * @summary - Retrieves the <b>text input</b> {@link HTMLElement} associated with this instance
     * @returns {HTMLElement} - | {@link HTMLElement} the element
    */
    this.GetInput = function () { return GetHTMLElement(); }

    function initialize() {
        var domElement = document.createElement('input');

        settings = tf.js.GetValidObjectFrom(settings);

        var labelStr = tf.js.GetNonEmptyString(settings.label, "");
        var toolTipStr = tf.js.GetNonEmptyString(settings.tooltip, labelStr);
        var valueStr = tf.js.GetNonEmptyString(settings.value, "");
        var cssClass = tf.js.GetIsNonEmptyString(settings.cssClass) ? settings.cssClass : tf.GetStyles().inputTextClass;

        domElement.type = "text";
        domElement.placeholder = labelStr;

        tf.dom.Element.call(theThis, { id: settings.id, domObj: theThis, domElement: domElement, cssClass: cssClass, tooltip: toolTipStr, value: valueStr });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.dom.TextInput, tf.dom.Element);

/**
 * @public
 * @class
 * @summary Link is an [Element]{@link tf.dom.Element} implementing the standard <b>'a'</b> (hyperlink) HTML element
 * @param {tf.types.ElementSettings} settings - creation settings, including two additional {@link string} properties <b>href</b> and <b>target</b> used to create the hyperlink
 * @extends {tf.dom.Element}
 */
tf.dom.Link = function (settings) {

    var theThis, onClick, href, target;

    /**
     * @public
     * @function
     * @summary - Retrieves the <b>a</b> {@link HTMLElement} associated with this instance
     * @returns {HTMLElement} - | {@link HTMLElement} the element
    */
    this.GetLink = function () { return GetHTMLElement(); }

    function onClickLink() { window.open(href, target); }

    function initialize() {
        var domElement = document.createElement('a');

        settings = tf.js.GetValidObjectFrom(settings);
        href = domElement.href = settings.href;
        target = domElement.target = settings.target;
        tf.dom.Element.call(theThis, { id: settings.id, domObj: theThis, domElement: domElement, addTextContentAsSpan: false, tooltip: settings.tooltip, cssClass: settings.cssClass });
        if (tf.js.GetIsNonEmptyString(settings.label)) { theThis.AddContent(settings.label) }
        onClick = new tf.events.DOMClickListener({ target: domElement, callBack: onClickLink, optionalScope: theThis, callBackSettings: undefined });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.dom.Link, tf.dom.Element);

/**
 * @public
 * @class
 * @summary Span is an [Element]{@link tf.dom.Element} implementing the standard <b>'span'</b> HTML element
 * @param {tf.types.ElementSettings} settings - creation settings
 * @extends {tf.dom.Element}
 */
tf.dom.Span = function (settings) {

    var theThis;

    /**
     * @public
     * @function
     * @summary - Retrieves the <b>span</b> {@link HTMLElement} associated with this instance
     * @returns {HTMLElement} - | {@link HTMLElement} the element
    */
    this.GetSpan = function () { return GetHTMLElement(); }

    function initialize() {
        var domElement = document.createElement('span');
        settings = tf.js.GetValidObjectFrom(settings);
        var cssClass = tf.js.GetIsNonEmptyString(settings.cssClass) ? settings.cssClass : tf.GetStyles().spanClass;
        var spanClass = tf.js.GetIsNonEmptyString(settings.spanCSSClass) ? settings.spanCSSClass : tf.GetStyles().spanClass;
        tf.dom.Element.call(theThis, { id: settings.id, domObj: theThis, domElement: domElement, addTextContentAsSpan: true, spanCSSClass: spanClass, cssClass: cssClass });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.dom.Span, tf.dom.Element);

/**
 * @public
 * @class
 * @summary Link is an [Element]{@link tf.dom.Element} implementing the standard <b>'a'</b> (hyperlink) HTML element
 * @param {tf.types.ElementSettings} settings - creation settings, including an additional {@link string} property <b>src</b> used to create the <b>img</b>, and
 * an optional callback {@function} property <b>onLoad</b> that, when specified, is called when the image is loaded and is passed this instance as a parameter
 * @extends {tf.dom.Element}
 */
tf.dom.Img = function (settings) {
    var theThis, imgSrcUse, onLoadCallBack, isLoaded, isValid;

    this.GetSettings = function () { return settings; }

    /**
     * @public
     * @function
     * @summary - Determines if the {@link HTMLElement} associated with this instance is valid
     * @returns {boolean} - | {@link boolean} <b>true</b> if the image is valid, </b>false</b> otherwise, e.g. if the image failed to load from the given source
    */
    this.GetIsValid = function () { return isValid; }

    /**
     * @public
     * @function
     * @summary - Retrieves the <b>img</b> {@link HTMLElement} associated with this instance
     * @returns {HTMLElement} - | {@link HTMLElement} the element
    */
    this.GetImg = function () { return theThis.GetHTMLElement(); }

    /**
     * @public
     * @function
     * @summary - Checks if the image is loaded
     * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
    */
    this.GetIsLoaded = function () { return isLoaded; }

    /**
     * @public
     * @function
     * @summary - Retrieves the <b>src</b> {@link string} associated with this instance
     * @returns {string} - | {@link string} the src string
    */
    this.GetSrc = function () { return imgSrcUse; }

    /**
     * @public
     * @function
     * @summary - Retrieves the dimensions of the image associated with this instance
     * @returns dimensions - | array with width and height
    */
    this.GetDimensions = function () {
        var elem = theThis.GetHTMLElement();
        return !!elem ? [elem.width, elem.height] : [0, 0];
    }

    function privateLoadCallBack() {
        var elem = theThis.GetHTMLElement();
        elem.onload = elem.onabort = elem.onerror = undefined;
        isLoaded = true;
        if (!!onLoadCallBack) {
            var olcb = onLoadCallBack;
            onLoadCallBack = undefined;
            olcb(theThis);
        }
    }

    function privateLoadFailure() { isValid = false; privateLoadCallBack(); }

    function initialize() {
        var domElement = document.createElement('img');

        settings = tf.js.GetValidObjectFrom(settings);

        isLoaded = false;
        isValid = true;
        onLoadCallBack = tf.js.GetFunctionOrNull(settings.onLoad);
        domElement.onload = privateLoadCallBack;
        domElement.onabort = privateLoadFailure;
        domElement.onerror = privateLoadFailure;
        if (!!settings.crossOrigin) { domElement.crossOrigin = 'anonymous'; }
        if (imgSrcUse = tf.js.GetNonEmptyString(settings.src)) { domElement.src = imgSrcUse; }
        tf.dom.Element.call(theThis, { id: settings.id, domObj: theThis, domElement: domElement, cssClass: settings.cssClass, tooltip: settings.tooltip });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.dom.Img, tf.dom.Element);

/**
 * Settings used in the creation of [Imgs Pre Loader]{@link tf.dom.ImgsPreLoader} instances
 * @public
 * @typedef {object} tf.types.ImgsPreLoaderSettings
 * @property {enumerable<string>} imgSrcs - an enumerable containing the <b>src</b> properties of the images to preload
 * @property {function} onAllLoaded - an optional callback {@link function} that, when specified, is called when all images have been preloaded and is passed this instance as a parameter
*/

/**
 * @public
 * @class
 * @summary Imgs Pre Loader instances are created to pre-load one or more instances of [Img]{@link tf.dom.Img}
 * @param {tf.types.ImgsPreLoaderSettings} settings - creation settings
 */
tf.dom.ImgsPreLoader = function (settings) {
    var theThis, nLoading, nLoaded, isLoadComplete, onAllLoadedCallBack, imgs;

    /**
     * @public
     * @function
     * @summary - Checks if all images have been loaded
     * @returns {boolean} - | {@link boolean} <b>true</b> if all images have been loaded, <b>false</b> otherwise
    */
    this.GetIsLoadComplete = function () { return isLoadComplete; }

    /**
     * @public
     * @function
     * @summary - returns an enumerable of the preloaded images
     * @returns {enumerable<tf.dom.Img>} - | {@link enumerable}<{@link tf.dom.Img}> the preloaded images
    */
    this.GetImgs = function () { return imgs; }

    function notifyAllLoaded() { onAllLoadedCallBack(theThis); }

    function checkIfAllLoaded() {
        if (nLoading !== undefined) {
            if (nLoaded == nLoading) { isLoadComplete = true; if (!!onAllLoadedCallBack) { setTimeout(notifyAllLoaded, 10); } }
        }
    }

    function onImageLoaded(theImage, theIndex) { imgs[theIndex] = theImage; ++nLoaded; checkIfAllLoaded(); }

    function createImg(thisImgSrc, thisIndex) {
        new tf.dom.Img({ src: thisImgSrc, cssClass: settings.cssClassStr, onLoad: function (theImage) { return onImageLoaded(theImage, thisIndex) } });
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        nLoaded = 0;
        isLoadComplete = false;
        imgs = [];
        onAllLoadedCallBack = tf.js.GetFunctionOrNull(settings.onAllLoaded);
        var imgSrcs = settings.imgSrcs;
        if (tf.js.GetIsValidObject(imgSrcs)) {
            var nLoadingTemp = 0;
            for (var i in imgSrcs) { if (!!tf.js.GetNonEmptyString(imgSrcs[i])) { ++nLoadingTemp; } }
            var nLoadingIndex = 0;
            for (var i in imgSrcs) { var imgSrc = tf.js.GetNonEmptyString(imgSrcs[i]); if (!!imgSrc) { createImg(imgSrc, nLoadingIndex++); } }
            nLoading = nLoadingTemp;
            checkIfAllLoaded();
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * CSS Style specification of a [Text Button]{@link tf.ui.TextBtn} instance. May be set to a [CSS Style Name]{@link tf.types.CSSStyleName} created
 * with the function [CreateTextDivBtnClasses]{@link tf.styles.Styles#CreateTextDivBtnClasses}, or to a {@link boolean} value, in which case
 * a <b>true</b> value selects the API's default <b>light</b> style settings, otherwise the default <b>dark</b> style settings are used
 * @public
 * @typedef {boolean|tf.types.CSSStyleName} tf.types.TextBtnStyle
 */

/**
 * An object used in the creation of [Text Button]{@link tf.ui.TextBtn} instances
 * @public
 * @typedef {object} tf.types.TextBtnSettings
 * @property {tf.types.TextBtnStyle} style - the given style
 * @property {string} label - the given text
 * @property {HTMLElementSizeOrPxNumber} dim - the button's height dimension
 * @property {tf.types.MultiDOMEventListenerCallBack} onClick - sets a [Click Listener]{@link tf.events.DOMClickListener} for the button
 * @property {string} tooltip - tool tip text
 */

/**
 * @public
 * @class
 * @summary - Text Button is an [Insertable]{@link tf.dom.Insertable} containing text and implementing a user interface button
 * @param {tf.types.TextBtnSettings} settings - creation settings
 * @extends {tf.dom.Insertable}
*/
tf.ui.TextBtn = function (settings) {

    var theThis, defaultDim, styles, lightClass, darkClass, heightDeltaPx, div, style, dim, onCallBack;

    this.SetOnClick = function (callBack) { return setCallBack(callBack); }

    /**
     * @public
     * @function
     * @summary - Retrieves this instance's style
     * @returns {tf.types.TextBtnStyle} - | {@link tf.types.TextBtnStyle} the style
    */
    this.GetStyle = function () { return style }

    /**
     * @public
     * @function
     * @summary - Sets this instance's style to the given style
     * @param {tf.types.TextBtnStyle} style - the given style
     * @returns {void} - | {@link void} no return value
    */
    this.SetStyle = function (style) { return setStyle(style); }

    /**
     * @public
     * @function
     * @summary - Sets the text of this Text Button instance to the given text
     * @param {string} text - the given text
     * @returns {void} - | {@link void} no return value
    */
    this.SetText = function (text) { return setText(text); }

    this.GetText = function () { return div.textContent; }

    /**
     * @public
     * @function
     * @summary - Changes the tooltip text of this Text Button instance to the given text
     * @param {string} tooltip - the given text
     * @returns {void} - | {@link void} no return value
    */
    this.ChangeToolTip = function (tooltip) { return changeToolTip(tooltip); }

    function setText(textContentStr) { div.textContent = tf.js.GetNonEmptyString(textContentStr, ''); }

    function changeToolTip(toolTipStr) {
        if (tf.js.GetIsNonEmptyString(toolTipStr)) { div.title = toolTipStr; }
        else { if (div.title !== undefined) { delete div.title; } }
    }

    function setStyle(styleSet) {
        if (tf.js.GetIsNonEmptyString(styleSet)) {
            style = div.className = styleSet;
        }
        else if ((styleSet = !!styleSet) != style) {
            style = styleSet; div.className = style ? lightClass : darkClass;
        }
    }

    function setHeight(dimSet) {
        dim = tf.js.GetDimFromStrOrPxNumber(dimSet, defaultDim);
        //div.style.height = "calc(" + dim + " - " + heightDeltaPx + ")";
        div.style.fontSize = "calc(" + dim + " - " + heightDeltaPx + ")";
        //div.style.fontSize = dim;//"calc(" + dim + " - " + heightDeltaPx + " - 2px)";


        //height = !newHeight ? defaultHeight : newHeight;
        //div.style.height = (height - heightDelta + 2) + "px";
        //div.style.fontSize = (height - heightDelta - 2) + "px";
    }

    function setCallBack(onclickCallBack) {
        if (!!onCallBack) { onCallBack.OnDelete(); }
        if (tf.js.GetFunctionOrNull(onclickCallBack)) {
            onCallBack = new tf.events.DOMClickListener({ domObj: theThis, target: div, callBack: onclickCallBack, optionalScope: theThis, callBackSettings: undefined });
        }
    }

    function initialize() {

        settings = tf.js.GetValidObjectFrom(settings);

        defaultDim = "1em";
        styles = tf.GetStyles();
        lightClass = styles.textDivBtnLightStyleClass;
        darkClass = styles.textDivBtnDarkStyleClass;
        heightDeltaPx = styles.GetSubStyles().textButtonHeightDelta + 'px';

        style = undefined;
        onCallBack = null;

        var divObj = new tf.dom.Div({ cssClass: styles.GetUnPaddedDivClassNames(false, false) });
        div = divObj.GetHTMLElement();

        setCallBack(settings.onClick);
        setText(settings.label);
        changeToolTip(settings.tooltip);
        setStyle(settings.style);
        setHeight(settings.dim);
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: div });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.ui.TextBtn, tf.dom.Insertable);

tf.js.ObjectCache = function (settings) {
    var theThis, objectsCache, nextIndexInCache;

    this.GetNext = function () {
        var nextObject, curLen = objectsCache.length;
        var createNewCB = !!tf.js.GetFunctionOrNull(settings.createNew) ? settings.createNew : createBlank;
        while (nextIndexInCache >= curLen) { objectsCache.push(createNewCB({ sender: theThis })); ++curLen; }
        nextObject = objectsCache[nextIndexInCache++];
        return nextObject;
    }

    this.Reset = function () { nextIndexInCache = 0; }

    this.GetObjects = function () { return objectsCache; }

    this.GetActiveCount = function () { return nextIndexInCache; }
    this.GetTotalCount = function () { return objectsCache.length; }

    this.OnDelete = function () { return onDelete(); }

    function createBlank() { return {}; }

    function onDelete() {
        var onDeleteCB = tf.js.GetFunctionOrNull(settings.onDelete);
        if (!!onDeleteCB) {
            var curLen = buttonsCache.length;
            for (var i = 0; i < curLen; ++i) { onDeleteCB({ sender: theThis, obj: objectsCache[i] }); }
        }
        initialize();
    }

    function initialize() {
        objectsCache = [];
        theThis.Reset();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.ui.TextButtonCache = function (settings) {
    var theThis, buttonsCache, nextIndexInCache, buttonDim, buttonStyle;

    this.GetNextButton = function () { return getNextButton(); }
    this.Reset = function () { return reset(); }

    this.GetButtons = function () { return buttonsCache; }

    this.GetActiveCount = function () { return nextIndexInCache; }
    this.GetTotalCount = function () { return buttonsCache.length; }

    this.OnDelete = function () { return onDelete(); }

    function onDelete() {
        var curLen = buttonsCache.length;
        for (var i = 0; i < curLen; ++i) { buttonsCache[i].OnDelete(); }
        buttonsCache = [];
        nextIndexInCache = 0;
    }

    function getNextButton() {
        var nextButton, curLen = buttonsCache.length;
        while (nextIndexInCache >= curLen) {
            buttonsCache.push(new tf.ui.TextBtn({ style: buttonStyle, label: '', dim: buttonDim, tooltip: '', onClick: undefined }));
            ++curLen;
        }
        nextButton = buttonsCache[nextIndexInCache++];
        return nextButton;
    }

    function reset() { nextIndexInCache = 0; }

    function initialize() {
        buttonDim = settings.buttonDim != undefined ? settings.buttonDim : "1rem";
        buttonStyle = settings.buttonStyle != undefined ? settings.buttonStyle : true;
        buttonsCache = [];
        reset();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.ui.LiveStreamPlayer = function (settings) {

    var theThis, isPlaying, jw_width, jw_height, container, playerContainer, divPlayer, divContainerStyle;
    var liveFeedContainerDivID = "liveFeedPlayerContainer", liveFeedPlayerDivID = "liveFeedPlayer";

    this.PlayStream = function (streamURL) { return playStream(streamURL); }
    this.PlayVideo = function (videoURL) { return playVideo(videoURL); }
    this.OnDelete = function () { stopPlay(); container.removeChild(playerContainer.GetHTMLElement()); }
    this.StopPlay = function () { return stopPlay(); }
    this.GetIsPlaying = function () { return isPlaying; }

    function playVideo(videoURL) {
        divContainerStyle.display = 'block';
        try {
            jwplayer(liveFeedPlayerDivID).setup({
                height: jw_height, width: jw_width, stretching: 'exactfit', file: videoURL
            });
            jwplayer(liveFeedPlayerDivID).play();
            isPlaying = true;
        }
        catch(e) {
            isPlaying = false;
        }
    }

    function playStream(streamURL) {
        divContainerStyle.display = 'block';
        try {
            jwplayer(liveFeedPlayerDivID).setup({
                height: jw_height, width: jw_width, stretching: 'exactfit', sources: [{ file: streamURL }], rtmp: { bufferlength: 3 }
            });
            jwplayer(liveFeedPlayerDivID).onMeta(function (event) { });
            jwplayer(liveFeedPlayerDivID).play();
            isPlaying = true;
        }
        catch (e) {
            isPlaying = false;
        }
    }

    function stopPlay() {
        if (isPlaying) {
            jwplayer(liveFeedPlayerDivID).stop();
            divContainerStyle.display = 'none';
            isPlaying = false;
        }
    }

    function createPlayerPopup() {
        if (!playerContainer) {
            /*var style = {
                position: "absolute", display: "none", backgroundColor: "#fff", width: jw_width + "px", height: jw_height + "px",
                right: "24em", bottom: "10em", margin: "0px", padding: "0px", border: "0px", zIndex: "2000"
            };*/
            var style = {
                position: "relative", display: "block", backgroundColor: "#fff", width: jw_width + "px", height: jw_height + "px",
                left: "0", top: "0", margin: "0px", padding: "0px", border: "0px", zIndex: "2000"
            };
            playerContainer = new tf.dom.Div({ id: liveFeedContainerDivID });
            divPlayer = new tf.dom.Div({ id: liveFeedPlayerDivID });
            divContainerStyle = playerContainer.GetHTMLElement().style;
            tf.GetStyles().ApplyStyleProperties(playerContainer, style);
            divPlayer.AppendTo(playerContainer);
            playerContainer.AppendTo(container);
        }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        if (!(container = tf.dom.GetHTMLElementFrom(settings.container))) { container = document.body; }
        liveFeedContainerDivID = tf.dom.CreateDomElementID("tf-live-player");
        liveFeedPlayerDivID = tf.dom.CreateDomElementID("tf-live-player");
        jw_width = settings.width !== undefined ? settings.width : 320;
        jw_height = settings.height !== undefined ? settings.height : 240;
        createPlayerPopup();
        isPlaying = false;
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.ui.ConfirmMsg = function (settings) {
    var theThis, container, styles, className, style, msgClassName, buttonsDivClassName, timeout, topDiv, topDivE, isShowing, closeTM;
    var msgDiv, msgDivE, thenCB;
    var yesLabel, noLabel, yesTooltip, noTooltip, yesButtonClasses, noButtonClasses;

    this.ConfirmMsg = function (then, text, overrideTimeout) { return confirmMsg(then, text, overrideTimeout); }

    function getTimeout(overrideTimeout) { var tm = overrideTimeout != undefined ? overrideTimeout : timeout; return tm == undefined ? 0 : tm; }

    function clearToasterTimeout() { if (!!closeTM) { clearTimeout(closeTM); closeTM = undefined; } }

    function doShow(showBool) { styles.ChangeOpacityVisibilityClass(topDiv, isShowing = !!showBool); }

    function closeToast(confirmed) {
        clearToasterTimeout(); if (isShowing) { doShow(false); } msgDiv.ClearContent();
        thenCB({ sender: theThis, confirmed: confirmed });
    }

    function startToast(overrideTimeout) {
        var timeoutUse = getTimeout(overrideTimeout);
        clearToasterTimeout();
        doShow(true);
        if (timeoutUse > 0) { closeTM = setTimeout(function () { return closeToast(false); }, timeoutUse); }
    }

    function confirmMsg(then, text, overrideTimeout) {
        if (tf.js.GetFunctionOrNull(then) && tf.js.GetIsNonEmptyString(text)) {
            if (isShowing) { closeToast(false); }
            thenCB = then;
            msgDivE.innerHTML = text;
            startToast(overrideTimeout);
        }
    }

    function getOnConfirmCancel(confirmed) { return function (notification) { closeToast(confirmed); return false; } }

    function createToast() {
        topDiv = new tf.dom.Div({});
        topDivE = topDiv.GetHTMLElement();
        if (className != undefined) { topDivE.className = className; }
        if (style != undefined) { styles.ApplyStyleProperties(topDiv, style); }
        //topDivE.addEventListener('click', onClick);
        msgDiv = new tf.dom.Div({ cssClass: msgClassName });
        msgDivE = msgDiv.GetHTMLElement();

        var buttonsDiv = new tf.dom.Div({ cssClass: buttonsDivClassName });

        var buttonDim = "18px", textDim = buttonDim;

        var confirmButton = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: yesButtonClasses, label: yesLabel, tooltip: yesTooltip, onClick: getOnConfirmCancel(true)
        }));

        var cancelButton = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: noButtonClasses, label: noLabel, tooltip: noTooltip, onClick: getOnConfirmCancel(false)
        }));

        var textShadowBlack = { textShadow: "1px 1px 1px #000" };

        styles.ApplyStyleProperties(confirmButton, textShadowBlack);
        styles.ApplyStyleProperties(cancelButton, textShadowBlack);

        buttonsDiv.AddContent(confirmButton, cancelButton);

        topDiv.AddContent(msgDiv, buttonsDiv);
        container.appendChild(topDivE);
        styles.ChangeOpacityVisibilityClass(topDiv, false);
    }

    function initialize() {
        styles = tf.GetStyles();
        yesButtonClasses = styles.CreateTextDivBtnClasses("white", "green", "white", "darkgreen");
        noButtonClasses = styles.CreateTextDivBtnClasses("white", "red", "white", "darkred");
        container = tf.dom.GetHTMLElementFrom(settings.container);
        style = settings.style;
        className = settings.className;
        msgClassName = settings.msgClassName;
        buttonsDivClassName = settings.buttonsDivClassName;
        timeout = settings.timeout;
        yesLabel = tf.js.GetNonEmptyString(settings.yesLabel, "Yes");
        noLabel = tf.js.GetNonEmptyString(settings.noLabel, "No");
        yesTooltip = tf.js.GetNonEmptyString(settings.yesTooltip, "Confirm");
        noTooltip = tf.js.GetNonEmptyString(settings.noTooltip, "Cancel");
        createToast();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};


tf.ui.OneToast = function (settings) {
    var theThis, styles, container, isShowing, isDeleted, topDiv, topDivE, topDivES, onCloseCB, style, className, closeTM, addBefore, closeOnClick, closeOnClickUse, count;

    this.Toast = function (toastSettings) { return toast(toastSettings); }
    this.GetIsShowing = function () { return isShowing; }
    this.GetIsDeleted = function () { return isDeleted; }
    this.Close = function () { return closeToast(); }

    function clearToasterTimeout() { if (!!closeTM) { clearTimeout(closeTM); closeTM = undefined; } }

    function doShow(showBool, addBefore) {
        if (isShowing != (showBool = !!showBool)) {
            if (isShowing = showBool) {
                if (!!addBefore) { container.InsertHead(topDiv); }
                else { container.AddContent(topDiv); }
            }
            else {
                container.RemoveContent(topDiv);
                if (!!onCloseCB) { onCloseCB({ sender: theThis }) };
            }
        }
    }

    function closeToast() { clearToasterTimeout(); if (isShowing) { doShow(false); } topDiv.ClearContent(); }

    var toastCallBacks = function (theToast, id, getCount) {
        this.IsShowing = function () { return id == getCount() && theToast.GetIsShowing(); }
        this.Close = function () { if (id == getCount()) { theToast.Close(); } }
    };

    function startToast(toastSettings) {
        var timeoutUse = toastSettings.timeout != undefined ? toastSettings.timeout : 2000;
        var addBeforeUse = settings.addBefore != undefined ? !!settings.addBefore : addBefore;

        ++count;

        var tcb = new toastCallBacks(theThis, count, function () { return count; });

        clearToasterTimeout();
        closeOnClickUse = settings.closeOnClick != undefined ? !!settings.closeOnClick : closeOnClick;
        topDivE.className = tf.js.GetIsNonEmptyString(toastSettings.className) ? toastSettings.className : className;
        if (tf.js.GetIsValidObject(toastSettings.style)) { topDivE.style = ""; styles.Apply(topDiv, toastSettings.style); } doShow(true, addBeforeUse);
        if (timeoutUse > 0) { closeTM = setTimeout(closeToast, timeoutUse); }

        return tcb;
    }

    function toast(toastSettings) {
        var toastCallBacks;
        if (!isDeleted && tf.js.GetIsValidObject(toastSettings)) {
            var doToast = false;
            topDiv.ClearContent();
            if (doToast = tf.js.GetIsNonEmptyString(toastSettings.text)) {
                topDivE.innerHTML = toastSettings.text;
            }
            else if (doToast = tf.dom.GetHTMLElementFrom(settings.content)) {
                topDiv.ReplaceContent(settings.content);
            }
            if (doToast) { toastCallBacks = startToast(toastSettings); }
        }
        return toastCallBacks;
    }

    function onClick(ev) { if (!!closeOnClickUse) { closeToast(); } return false; }

    function create() {
        topDiv = new tf.dom.Div({});
        topDivE = topDiv.GetHTMLElement();
        if (className != undefined) {
            topDivE.className = className;
        }
        if (style != undefined) { styles.ApplyStyleProperties(topDiv, style); }
        topDivE.addEventListener('click', onClick);
    }

    function initialize() {
        styles = tf.GetStyles();
        count = 0;
        if (!!tf.dom.GetHTMLElementFrom(settings.container) && !!tf.js.GetFunctionOrNull(settings.container.AddContent) && !!tf.js.GetFunctionOrNull(settings.container.RemoveContent)) {
            container = settings.container;
            isDeleted = false;
            onCloseCB = tf.js.GetFunctionOrNull(settings.onClose);
            closeOnClick = settings.closeOnClick != undefined ? !!settings.closeOnClick : true;
            addBefore = settings.addBefore != undefined ? !!settings.addBefore : true;
            style = tf.js.GetValidObjectFrom(settings.style);
            className = tf.js.GetNonEmptyString(settings.className, "");
            create();
        }
        else { isDeleted = true; }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.ui.Toaster = function (settings) {
    var theThis, container, styles, className, style, timeout, addBefore, closeOnClick, topDiv, topDivE, isShowing, closeTM;
    var availableToasts, nActiveToasts;

    this.GetNActiveToasts = function () { return nActiveToasts; }
    this.Toast = function (toastSettings) { return toast(toastSettings); }

    function getTimeout(overrideTimeout) { var tm = overrideTimeout != undefined ? overrideTimeout : timeout; return tm == undefined ? 0 : tm; }
    function doShow(showBool) { styles.ChangeOpacityVisibilityClass(topDiv, isShowing = !!showBool); }

    function getOrCreateNewToast() {
        if (++nActiveToasts == 1) { doShow(true); }
        if (availableToasts.length > 0) { return availableToasts.pop(); }
        return new tf.ui.OneToast({
            onClose: function (notification) { if (--nActiveToasts == 0) { doShow(false); }; availableToasts.push(notification.sender); },
            container: topDiv, className: settings.toastClassName, style: settings.toastStyle, closeOnClick: closeOnClick
        });
    }

    function toast(toastSettings) {
        var toastCallBacks;
        if (tf.js.GetIsValidObject(toastSettings)) {
            var isText = tf.js.GetIsNonEmptyString(toastSettings.text);
            var isContent = !isText && tf.dom.GetHTMLElementFrom(toastSettings.content);
            if (isText || isContent) {
                var oneToast;
                oneToast = getOrCreateNewToast();
                toastCallBacks = oneToast.Toast({
                    text: toastSettings.text,
                    content: toastSettings.content,
                    timeout: getTimeout(toastSettings.timeout),
                    addBefore: toastSettings.addBefore != undefined ? toastSettings.addBefore : addBefore,
                    className: toastSettings.className,
                    style: toastSettings.style,
                    closeOnClick: toastSettings.closeOnClick != undefined ? toastSettings.closeOnClick : closeOnClick
                });
                if (nActiveToasts == 1) { doShow(true); }
            }
        }
        return toastCallBacks;
    }

    function create() {
        topDiv = new tf.dom.Div({});
        topDivE = topDiv.GetHTMLElement();
        if (className != undefined) { topDivE.className = className; }
        if (style != undefined) { styles.ApplyStyleProperties(topDiv, style); }
        container.appendChild(topDivE);
        styles.ChangeOpacityVisibilityClass(topDiv, false);
    }

    function initialize() {
        styles = tf.GetStyles();
        container = tf.dom.GetHTMLElementFrom(settings.container);
        style = settings.style;
        className = settings.className;
        timeout = settings.timeout;
        closeOnClick = settings.closeOnClick != undefined ? !!settings.closeOnClick : true;
        addBefore = settings.addBefore != undefined ? !!settings.addBefore : true;
        nActiveToasts = 0;
        availableToasts = [];
        create();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.ui.FullScreenDiv = function (settings) {
    var theThis, styles;
    var eventDispatcher, resizeEventName, closeEventName;
    var topDiv, topDivE, topDivES;
    var onUpdateSizeDelayCallBack;
    var isDeleted, isShowing, zIndexShowing, zIndexNotShowing;
    var domEventListener;
    var customStyle;

    this.Show = function (showBool) { return show(showBool); }
    this.GetIsShowing = function () { return isShowing; }

    this.GetTopDiv = function () { return topDiv; }

    this.AddResizeListener = function (callBack) { return eventDispatcher.AddListener(resizeEventName, callBack); }
    this.AddCloseListener = function (callBack) { return eventDispatcher.AddListener(closeEventName, callBack); }

    this.OnDelete = function () { return onDelete(); }
    this.GetIsDeleted = function () { return isDeleted; }

    function onDelete() {
        if (!isDeleted) {
            show(false);
            if (!!domEventListener) { domEventListener.OnDelete(); }
            if (!!topDivE) { document.body.removeChild(topDivE); }
            if (!!topDiv) { topDiv.ClearContent(); topDiv.OnDelete(); }
            topDiv = topDivE = toDivES = eventDispatcher = domEventListener = onUpdateSizeDelayCallBack = undefined;
            isDeleted = true;
        }
    }

    function show(showBool) { if (!isDeleted) { if (isShowing != (showBool = !!showBool)) { setShowingAttributes(isShowing = showBool); } } }

    function doSetZIndex(zIndex) { topDivES.zIndex = zIndex; }
    function setZIndex(zIndex, delayBool) { if (delayBool) { setTimeout(function () { return doSetZIndex(zIndex); }, 1000); } else { doSetZIndex(zIndex); } }

    function setShowingAttributes(showBool) {
        var zIndex, opacity, pointerEvents;

        if (showBool) { zIndex = zIndexShowing; opacity = '1'; pointerEvents = 'all'; }
        else { zIndex = zIndexNotShowing; opacity = '0'; pointerEvents = 'none'; }

        topDivES.opacity = opacity;
        topDivES.pointerEvents = pointerEvents;
        setZIndex(zIndex, !showBool);

        if (showBool) { requestResize(); } else { notify(closeEventName); }
    }

    function notify(eventName) { eventDispatcher.Notify(eventName, { sender: theThis }); }

    function onWindowResize() { if (!isDeleted) { notify(resizeEventName); return false; } }
    function requestResize() { if (!isDeleted) { onUpdateSizeDelayCallBack.DelayCallBack(); } }

    function create() {
        topDiv = new tf.dom.Div();

        var topDivStyle = {
            "display": "block",
            "pointer-events": "none",
            "position": "absolute",
            "z-index": "0",
            "left": "0px",
            "top": "0px",
            "width": "100%",
            "height": "100%",
            "border": "none",
            "margin": "0px",
            "padding": "0px",
            "opacity": "0",
            "overflow": "hidden",
            "background-color": "rgba(255,255,255,0)",
            "-webkit-transition": "opacity 1s ease-in-out",
            "-moz-transition": "opacity 1s ease-in-out",
            "-ms-transition": "opacity 1s ease-in-out",
            "-o-transition": "opacity 1s ease-in-out",
            "transition": "opacity 1s ease-in-out"
        };

        topDivE = topDiv.GetHTMLElement();
        topDivES = topDivE.style;
        //topDivES = topDivStyle;
        styles.ApplyStyleProperties(topDiv, topDivStyle);

        if (tf.js.GetIsValidObject(customStyle)) { styles.ApplyStyleProperties(topDiv, customStyle); }

        setShowingAttributes(isShowing = false);

        document.body.appendChild(topDivE);
    }

    function initialize() {
        styles = tf.GetStyles();

        isDeleted = false;

        resizeEventName = "res";
        closeEventName = "clo";
        eventDispatcher = new tf.events.MultiEventNotifier({ eventNames: [resizeEventName] });

        settings = tf.js.GetValidObjectFrom(settings);
        zIndexShowing = settings.zIndexShowing != undefined ? settings.zIndexShowing : 100;
        zIndexNotShowing = settings.zIndexNotShowing != undefined ? settings.zIndexNotShowing : 0;

        customStyle = settings.customStyle;

        create();

        if (settings.onClose != undefined) { theThis.AddCloseListener(settings.onClose); }
        if (settings.onResize != undefined) { theThis.AddResizeListener(settings.onResize); }

        onUpdateSizeDelayCallBack = new tf.events.DelayedCallBack(250, onWindowResize);
        domEventListener = tf.events.AddDOMEventListener(window, tf.consts.DOMEventNamesResize, requestResize);
        requestResize();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.ui.MultiLineInput = function (settings) {
    var theThis, styles, styleCreator, onCloseCB, isEditing, statusButtonEnabledClasses, statusButtonDisabledClasses, topDiv, titleDivE;
    var buttonDim, textDim, topWrapper, topWrapperE, topWrapperES, controlWrapper, editProps, title;
    var textAreaDivE;
    var saveButton, cancelButton;
    var validatorCB;

    this.GetTopDiv = function () { return topWrapper; }
    this.GetIsEditing = function () { return isEditing; }
    this.Edit = function (editSettings) { return edit(editSettings); }
    this.OnClose = function (isConfirmed) { return onClose(isConfirmed); }

    function edit(editSettings) {
        if (!isEditing) {
            if (tf.js.GetIsValidObject(editSettings)) {
                isEditing = true;
                topWrapperES.display = 'block';
                title = tf.js.GetNonEmptyString(editSettings.title, "Text Input");
                saveButton.SetText(tf.js.GetNonEmptyString(editSettings.saveText, "Save"));
                saveButton.ChangeToolTip(tf.js.GetNonEmptyString(editSettings.saveToolTip, "Save"));
                var cancelButtonDisplayStr;
                if (editSettings.cancelText !== undefined) {
                    cancelButton.SetText(tf.js.GetNonEmptyString(editSettings.cancelText, "Cancel"));
                    cancelButton.ChangeToolTip(tf.js.GetNonEmptyString(editSettings.cancelToolTip, "Cancel"));
                    cancelButtonDisplayStr = "inline-block";
                }
                else {
                    cancelButtonDisplayStr = "none";
                }
                cancelButton.GetHTMLElement().style.display = cancelButtonDisplayStr;
                textAreaDivE.value = tf.js.GetNonEmptyString(editSettings.text, "").trim();
                if (editSettings.nRows != undefined) { textAreaDivE.rows = '' + editSettings.nRows; }
                titleDivE.innerHTML = title;
                isEditing = true;
                editProps = editSettings.props;
                textAreaDivE.focus();
            }
        }
    }

    function onClose(isConfirmed) {
        if (isEditing) {
            var willClose = true;
            if (!!onCloseCB) {
                var text = isConfirmed ? textAreaDivE.value.trim() : '';
                var notification = { sender: theThis, isConfirmed: isConfirmed, props: editProps, text: text };
                var failedValidation = isConfirmed && !!validatorCB && !validatorCB(notification);

                if (willClose = !failedValidation) { onCloseCB(notification); }
            }
            if (willClose) { isEditing = false; topWrapperES.display = 'none'; }
        }
    }

    function confirm() { onClose(true); }
    function cancel() { onClose(false); }

    function getOnStopEdit(confirmed) { return function (notification) { return confirmed ? confirm() : cancel(); } }

    function create() {
        var controlWrapperStyles = { margin: "0px", padding: "0px", border: "none", display: "block" };
        var controlWrapperClassName = tf.GetNextDynCSSClassName();

        var titleStyles = { padding: "4px", fontSize: "90%", backgroundColor: "rgba(255, 255, 255, 0.7)", marginBottom: "4px", display: "block", borderBottom: "1px solid brown" };
        var titleClassName = tf.GetNextDynCSSClassName();

        var buttonsStyles = { display: "block", border: "none", padding: "2px", marginTop: "2px", borderTop: "1px solid rgba(255, 255, 255, 0.7)" };
        var buttonsClassName = tf.GetNextDynCSSClassName();

        var topStyles = {
            position: "absolute", margin: "4px", border: "2px solid red", borderRadius: "6px", fontSize: "18px", lineHeight: "20px", color: "darkblue",
            backgroundColor: "orange", textShadow: "2px 2px 3px white", cursor: "default", display: "block", zIndex: "10", textAlign: "center", boxShadow: "2px 2px 4px 1px rgba(0,0,0,0.75)"
        };
        var topClassName = tf.GetNextDynCSSClassName();

        var multiLineStyles = { left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: "40%", overflow: "hidden" };
        var multiLineClassName = tf.GetNextDynCSSClassName();

        var cssStyles = [
            { styleName: '.' + controlWrapperClassName, inherits: controlWrapperStyles },
            { styleName: '.' + titleClassName, inherits: titleStyles },
            { styleName: '.' + buttonsClassName, inherits: buttonsStyles },
            { styleName: '.' + topClassName, inherits: topStyles },
            { styleName: '.' + multiLineClassName, inherits: multiLineStyles }
        ];

        styleCreator.CreateStyles(cssStyles);

        controlWrapper = new tf.dom.Div({ cssClass: controlWrapperClassName });

        var titleDiv = new tf.dom.Div({ cssClass: titleClassName });

        titleDivE = titleDiv.GetHTMLElement();
        titleDivE.innerHTML = '';
        titleDivE.title = '';

        var buttonsDiv = new tf.dom.Div({ cssClass: buttonsClassName });

        saveButton = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: statusButtonEnabledClasses, label: 'Save', tooltip: "Save", onClick: getOnStopEdit(true)
        }));

        cancelButton = styles.AddButtonDivMargins(new tf.ui.TextBtn({
            dim: textDim, style: statusButtonDisabledClasses, label: 'Cancel', tooltip: "Cancel", onClick: getOnStopEdit(false)
        }));

        var textShadowBlack = { textShadow: "1px 1px 1px #000" };

        styles.ApplyStyleProperties(saveButton, textShadowBlack);
        styles.ApplyStyleProperties(cancelButton, textShadowBlack);

        buttonsDiv.AddContent(saveButton, cancelButton);
        buttonsDiv.GetHTMLElement().style.textAlign = 'right';

        textAreaDivE = document.createElement('textarea');
        textAreaDivE.className = "multiLineInput";
        textAreaDivE.title = tf.js.GetNonEmptyString(settings.textAreaToolTip, 'Copy, Paste or Type text here');
        textAreaDivE.rows = 10;

        controlWrapper.AddContent(titleDiv, textAreaDivE, buttonsDiv)

        topWrapper = new tf.dom.Div({ cssClass: topClassName + " " + multiLineClassName });

        topWrapper.AddContent(controlWrapper);

        topWrapperE = topWrapper.GetHTMLElement();
        topWrapperES = topWrapperE.style;

        topWrapperES.display = 'none';
        if (settings.zIndex != undefined) { topWrapperES.zIndex = settings.zIndex; }

        topDiv.AddContent(topWrapper);
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        onCloseCB = tf.js.GetFunctionOrNull(settings.onClose);
        validatorCB = tf.js.GetFunctionOrNull(settings.validator);
        topDiv = settings.container;
        styles = tf.GetStyles();
        styleCreator = styles.GetStyleCreator();
        buttonDim = "16px";
        textDim = buttonDim;
        statusButtonEnabledClasses = styles.CreateTextDivBtnClasses("white", "green", "white", "darkgreen");
        statusButtonDisabledClasses = styles.CreateTextDivBtnClasses("white", "red", "white", "darkred");
        isEditing = false;
        create();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.ui.FullScreenMultiLineInput = function (settings) {
    var theThis, fullScreenDiv, multiLineInput, onCloseCB;

    this.GetIsEditing = function () { return multiLineInput.GetIsEditing(); }
    this.Edit = function (editSettings) { return edit(editSettings); }
    this.OnClose = function (isConfirmed) { return multiLineInput.OnClose(isConfirmed); }
    this.GetTopDiv = function () { return multiLineInput.GetTopDiv(); }

    function edit(editSettings) { if (!multiLineInput.GetIsEditing()) { fullScreenDiv.Show(true); multiLineInput.Edit(editSettings); } }
    function onClose(notification) { fullScreenDiv.Show(false); if (!!onCloseCB) { onCloseCB(notification); } }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        var mliSettings = tf.js.GetValidObjectFrom(settings.multiLineInputSettings);
        var fsdSettings = tf.js.GetValidObjectFrom(settings.fullScreenSettings);
        onCloseCB = tf.js.GetFunctionOrNull(mliSettings.onClose);
        fullScreenDiv = new tf.ui.FullScreenDiv(fsdSettings);
        multiLineInput = new tf.ui.MultiLineInput(tf.js.ShallowMerge(mliSettings, { onClose: onClose, container: fullScreenDiv.GetTopDiv() }));
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.ui.DatePicker = function (settings) {
    var theThis, styles, topDiv, topDivE, topDivS, curParent, calendar, maxRows, wdNames, monthNames,
        year, month, dayOfMonth, curYear, curMonth, curFirstWD, onClickCB, buttonDim;
    var calendarWrapperDivClassName, calendarDivClassName, calendarRowDivClassName, calendarWDRowDivClassName, calendarWDCellDivClassName, calendarCellDivClassName, calendarCellCurDayDivClassName,
        calendarTitleDivClassName, calendarPrevArrowDivClassName, calendarNextArrowDivClassName, calendarMonthYearDivClassName;
    var lastDateSet, minDate, maxDate;

    this.SetMinDate = function (minDateSet) { setMinDate(minDateSet, true); }
    this.SetMaxDate = function (minDateSet) { setMaxDate(maxDateSet, true); }
    this.SetDate = function (date) { return setDate(date); }
    this.AppendTo = function (parent, style) { return appendTo(parent, style); }
    this.Detach = function () { return detach(); }
    this.IsAttached = function () { return !!curParent; }
    this.GetHTMLElement = function () { return topDiv.GetHTMLElement(); }

    function detach() { if (!!curParent) { curParent.removeChild(topDivE); curParent = undefined; } }

    function appendTo(parent, style) {
        detach();
        styles.ApplyStyleProperties(topDiv, style);
        if (!!(curParent = tf.dom.GetHTMLElementFrom(parent))) { curParent.appendChild(topDivE); topDivE.focus(); } else { curParent = undefined; }
    }

    function onPrevNextMonth(isNext) {
        curMonth += (!!isNext ? 1 : -1);
        if (curMonth < 0) { curMonth = 11; --curYear; } else if (curMonth > 11) { curMonth = 0; ++curYear; }
        fillCalendar();
    }

    function notifyDateClicked(day) {
        if (!!onClickCB) {
            var date = new Date(curYear, curMonth, day), dow = date.getDay();
            onClickCB({ sender: theThis, month: curMonth, year: curYear, day: day, date: date, dow: dow });
        }
    }

    function getOnClickCalendarCell(cell) { return function (event) { if (!!onClickCB) { var day = cell.index - curFirstWD + 1; notifyDateClicked(day); } } }

    function setDate(newDate) {
        if (!!newDate) {
            newDate = newDate || new Date();
            if (minDate != undefined && newDate < minDate) { newDate = minDate; }
            if (maxDate != undefined && newDate > maxDate) { newDate = maxDate; }
            lastDateSet = newDate;
            month = newDate.getMonth();
            year = newDate.getFullYear();
            dayOfMonth = newDate.getDate();
            curYear = year;
            curMonth = month;
            fillCalendar();
        }
    }

    function showHide(divE, showHideBool) {
        var opacity, pointerEvents;
        if (!!showHideBool) { opacity = 1; pointerEvents = 'all'; } else { opacity = 0; pointerEvents = 'none'; }
        divE.style.opacity = opacity;
        divE.style.pointerEvents = pointerEvents;
    }

    function fillCalendar() {
        var monthName = monthNames[curMonth];
        var calendarFirstDay = new Date(curYear, curMonth, 1);
        var calendarLastDay = new Date(curYear, curMonth + 1, 0);
        var nDays = tf.units.GetDaysBetweenDates(calendarFirstDay, calendarLastDay) + 1;
        var hasCurDay = curMonth == month && curYear == year;
        var curDayClass = calendarCellCurDayDivClassName;

        calendar.titleDiv.myDivE.innerHTML = monthName + ' ' + curYear;
        curFirstWD = calendarFirstDay.getDay();

        var curRow = 0, curCol = curFirstWD;
        var rows = calendar.rows, row = rows[curRow], rowCols = row.cols;

        for (var i = 0; i < curFirstWD ; ++i) { showHide(rowCols[i].divE, false); }

        for (var i = 0; i < nDays ; ++i) {
            if (curCol > 6) { curCol = 0; row = rows[++curRow]; rowCols = row.cols; }
            var cell = rowCols[curCol], thisDayOfMonth = i + 1;
            showHide(cell.divE, true);
            if (hasCurDay && (dayOfMonth == thisDayOfMonth)) { tf.dom.AddCSSClass(cell.divE, curDayClass); }
            else { tf.dom.RemoveCSSClass(cell.divE, curDayClass); }
            cell.divE.innerHTML = '' + thisDayOfMonth;
            row.divE.style.display = 'block';
            ++curCol;
        }
        for (var i = curCol ; i < 7 ; ++i) { showHide(rowCols[i].divE, false); }
        for (var i = curRow + 1 ; i < maxRows ; ++i) { calendar.rows[i].divE.style.display = 'none'; }
    }

    function createCalendarWDCell(colNumber) {
        var calendarCellDiv = new tf.dom.Div({ cssClass: calendarWDCellDivClassName });
        calendarCellDiv.GetHTMLElement().innerHTML = wdNames[colNumber];
        return { div: calendarCellDiv, col: colNumber };
    }

    function createCalendarCell(rowNumber, colNumber) {
        var calendarCellDiv = new tf.dom.Div({ cssClass: calendarCellDivClassName });
        var calendarCellDivE = calendarCellDiv.GetHTMLElement();
        var index = rowNumber * 7 + colNumber;
        var calendarCell = { div: calendarCellDiv, divE: calendarCellDivE, row: rowNumber, col: colNumber, index: index };
        calendarCellDivE.innerHTML = '' + index;
        calendarCellDivE.addEventListener('click', getOnClickCalendarCell(calendarCell));
        return calendarCell;
    }

    function createCalendarRow(rowNumber) {
        var calendarCells = [], calendarRowDiv = new tf.dom.Div({ cssClass: calendarRowDivClassName });
        for (var i = 0 ; i < 7 ; ++i) { var calendarCell = createCalendarCell(rowNumber, i); calendarCells.push(calendarCell); calendarRowDiv.AddContent(calendarCell.div); }
        return { div: calendarRowDiv, divE: calendarRowDiv.GetHTMLElement(), cols: calendarCells };
    }

    function createCalendarWDDiv() {
        var calendarCells = [], calendarRowDiv = new tf.dom.Div({ cssClass: calendarWDRowDivClassName });
        for (var i = 0 ; i < 7 ; ++i) { var calendarCell = createCalendarWDCell(i); calendarCells.push(calendarCell); calendarRowDiv.AddContent(calendarCell.div); }
        return { div: calendarRowDiv, cols: calendarCells };
    }

    function createCalendarTitleDiv() {
        var calendarTitleDiv = new tf.dom.Div({ cssClass: calendarTitleDivClassName });
        var calendarMonthYearDiv = new tf.dom.Div({ cssClass: calendarMonthYearDivClassName });
        var calendarPrevArrowDiv = new tf.dom.Div({ cssClass: calendarPrevArrowDivClassName });
        var calendarNextArrowDiv = new tf.dom.Div({ cssClass: calendarNextArrowDivClassName });
        var calendarMonthYearDivE = calendarMonthYearDiv.GetHTMLElement();
        var prevButton = new tf.ui.SvgGlyphBtn({ style: true, glyph: tf.styles.SvgGlyphLeftArrowName, onClick: function () { onPrevNextMonth(false); }, tooltip: "Previous Month", dim: buttonDim });
        var nextButton = new tf.ui.SvgGlyphBtn({ style: true, glyph: tf.styles.SvgGlyphRightArrowName, onClick: function () { onPrevNextMonth(true); }, tooltip: "Next Month", dim: buttonDim });

        calendarPrevArrowDiv.AddContent(prevButton);
        calendarNextArrowDiv.AddContent(nextButton);
        calendarTitleDiv.AddContent(calendarNextArrowDiv);
        calendarTitleDiv.AddContent(calendarPrevArrowDiv);
        calendarTitleDiv.AddContent(calendarMonthYearDiv);

        return { div: calendarTitleDiv, prev: calendarPrevArrowDiv, next: calendarNextArrowDiv, myDiv: calendarMonthYearDiv, myDivE: calendarMonthYearDivE };
    }

    function createCalendar() {
        var calendarRows = [], calendarDiv = new tf.dom.Div({ cssClass: calendarDivClassName });
        var calendarTitleDiv = createCalendarTitleDiv(), calendarWDDiv = createCalendarWDDiv();
        calendarDiv.AddContent(calendarTitleDiv.div);
        calendarDiv.AddContent(calendarWDDiv.div);
        for (var i = 0 ; i < maxRows ; ++i) { var calendarRow = createCalendarRow(i); calendarRows.push(calendarRow); calendarDiv.AddContent(calendarRow.div); }
        return { div: calendarDiv, rows: calendarRows, wdDiv: calendarWDDiv, titleDiv: calendarTitleDiv };
    }

    function createControl() {
        topDiv = new tf.dom.Div({ cssClass: calendarWrapperDivClassName });
        topDivE = topDiv.GetHTMLElement();
        calendar = createCalendar();
        topDiv.AddContent(calendar.div);
        //topDivE.addEventListener('blur', function (event) { notifyDateClicked(thisDayOfMonth); return false; });
    }

    function createCSSClasses() {
        var calendarWrapperDivStyle = { backgroundColor: "rgb(0,68,152)", borderRadius: "6px", border: "2px solid navajowhite", display: "inline-block" };
        var calendarDivStyle = { padding: "2px", margin: "2px", display: "block", border: "1px solid green" };
        var calendarRowDivStyle = { whiteSpace: "nowrap", display: "block" };
        var calendarWDRowDivStyle = { whiteSpace: "nowrap", backgroundColor: "white", color: "navy", textShadow: "none", fontWeight: "600", marginBottom: "2px" };
        var calendarWDCellDivStyle = { padding: "2px", margin: "2px", display: "inline-block", border: "1px solid navy", lineHeight: "16px", fontSize: "14px", textAlign: "right", paddingRight: "6px", width: "24px" };
        var calendarCellDivStyle = { padding: "2px", margin: "2px", display: "inline-block", border: "1px solid navy", lineHeight: "16px", fontSize: "14px", textAlign: "right", paddingRight: "6px", width: "24px", color: "white", cursor: "pointer" };
        var calendarCellHoverDivStyle = { backgroundColor: "white", color: "navy", fontWeight: "600", fontSize: "16px" };
        var calendarCellCurDayDivStyle = { backgroundColor: "lightgreen", fontWeight: "600", fontSize: "15px", color: "navy" };
        var calendarTitleDivStyle = { verticalAlign: "middle", whiteSpace: "nowrap", backgroundColor: "white", color: "navy", textShadow: "none", fontWeight: "600", borderRadius: "4px", marginBottom: "4px", position: "relative", textAlign: "center", overflow: "hidden", lineHeight: "16px", fontSize: "14px" };
        var calendarPrevArrowDivStyle = { position: "absolute", left: "4px", top: "2px", height: "calc(100% - 4px)", overflow: "hidden" };
        var calendarNextArrowDivStyle = { position: "absolute", right: "4px", top: "2px", height: "calc(100% - 4px)", overflow: "hidden" };
        var calendarMonthYearDivStyle = { padding: "2px", margin: "2px", display: "inline-block" };

        calendarWrapperDivClassName = tf.GetNextDynCSSClassName();
        calendarRowDivClassName = tf.GetNextDynCSSClassName();
        calendarWDRowDivClassName = tf.GetNextDynCSSClassName();
        calendarWDCellDivClassName = tf.GetNextDynCSSClassName();
        calendarCellDivClassName = tf.GetNextDynCSSClassName();
        calendarCellCurDayDivClassName = tf.GetNextDynCSSClassName();
        calendarTitleDivClassName = tf.GetNextDynCSSClassName();
        calendarPrevArrowDivClassName = tf.GetNextDynCSSClassName();
        calendarNextArrowDivClassName = tf.GetNextDynCSSClassName();
        calendarMonthYearDivClassName = tf.GetNextDynCSSClassName();

        var cssStyles = [
            { styleName: '.' + calendarWrapperDivClassName, inherits: calendarWrapperDivStyle },
            { styleName: '.' + calendarDivClassName, inherits: calendarDivStyle },
            { styleName: '.' + calendarRowDivClassName, inherits: calendarRowDivStyle },
            { styleName: '.' + calendarWDRowDivClassName, inherits: calendarWDRowDivStyle },
            { styleName: '.' + calendarWDCellDivClassName, inherits: calendarWDCellDivStyle },
            { styleName: '.' + calendarCellDivClassName, inherits: calendarCellDivStyle },
            { styleName: '.' + calendarCellDivClassName + ':hover', inherits: calendarCellHoverDivStyle },
            { styleName: '.' + calendarCellCurDayDivClassName, inherits: calendarCellCurDayDivStyle },
            { styleName: '.' + calendarTitleDivClassName, inherits: calendarTitleDivStyle },
            { styleName: '.' + calendarPrevArrowDivClassName, inherits: calendarPrevArrowDivStyle },
            { styleName: '.' + calendarNextArrowDivClassName, inherits: calendarNextArrowDivStyle },
            { styleName: '.' + calendarMonthYearDivClassName, inherits: calendarMonthYearDivStyle }
        ];

        styles.GetStyleCreator().CreateStyles(cssStyles);
    };

    function setMinDate(minDateSet, clipDateAndRefill) { minDate = minDateSet; if (clipDateAndRefill) { setDate(lastDateSet); } }

    function setMaxDate(maxDateSet, clipDateAndRefill) { if (clipDateAndRefill) { setDate(lastDateSet); } }

    function initialize() {
        styles = tf.GetStyles();
        settings = tf.js.GetValidObjectFrom(settings);
        onClickCB = tf.js.GetFunctionOrNull(settings.onClick);
        maxRows = 6;
        wdNames = tf.js.GetIsArrayWithLength(settings.weekDayLetters, 7) && tf.js.GetIsStringWithMinLength(settings.weekDayLetters[0], 2) ? settings.weekDayLetters :
            ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        monthNames = tf.js.GetIsArrayWithLength(settings.monthNames, 12) && tf.js.GetIsNonEmptyString(settings.monthNames[0]) ? settings.monthNames :
            ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        buttonDim = tf.js.GetIsNonEmptyString(settings.buttonDim) ? settings.buttonDim : "20px";
        createCSSClasses();
        createControl();
        setMinDate(settings.minDate, false);
        setMaxDate(settings.maxDate, false);
        setDate();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.ui.QuickMenu = function (settings) {
    var theThis, styles, topDiv, topDivE, topDivES, curParent, onClickCB, buttonDim, hoverListener, buttons;

    var topWrapperDivClassName, topDivClassName;

    this.GetTopDivStyle = function () { return topDivES; }
    this.AppendTo = function (parent, style) { return appendTo(parent, style); }
    this.Detach = function () { return detach(); }
    this.IsAttached = function () { return !!curParent; }
    this.GetHTMLElement = function () { return topDiv.GetHTMLElement(); }

    this.GetButtons = function () { return buttons; }

    function detach() { if (!!curParent) { curParent.removeChild(topDivE); curParent = undefined; } }

    function appendTo(parent, style) {
        detach();
        styles.ApplyStyleProperties(topDiv, style);
        if (!!(curParent = tf.dom.GetHTMLElementFrom(parent))) { curParent.appendChild(topDivE); topDivE.focus(); } else { curParent = undefined; }
    }

    function getNotifyPick(item, index) { return function () { if (!!onClickCB) { onClickCB({ sender: theThis, text: item.text, item: item, index: index }); } } }

    function createControl() {
        topDiv = new tf.dom.Div({ cssClass: topWrapperDivClassName });
        topDivE = topDiv.GetHTMLElement();
        topDivES = topDivE.style;
        buttons = [];
        var nItems = !!settings.items ? settings.items.length : 0;
        for (var i = 0; i < nItems ; ++i) {
            var item = settings.items[i];
            var button = new tf.ui.TextBtn({ style: true, label: item.text, buttonDim: buttonDim, tooltip: tf.js.GetIsNonEmptyString(item.toolTip) ? item.toolTip : item.text, onClick: getNotifyPick(item, i) });
            button.GetHTMLElement().style.display = 'block';
            topDiv.AddContent(button);
            buttons.push(button);
        }
    }

    function createCSSClasses() {
        var topWrapperDivStyle = { backgroundColor: "rgb(0,68,152)", borderRadius: "6px", border: "2px solid navajowhite", display: "inline-block", fontSize: "1.4em" };
        var topDivStyle = { padding: "2px", margin: "2px", display: "block", border: "1px solid green" };

        topWrapperDivClassName = tf.GetNextDynCSSClassName();
        topDivClassName = tf.GetNextDynCSSClassName();

        var cssStyles = [
            { styleName: '.' + topWrapperDivClassName, inherits: topWrapperDivStyle },
            { styleName: '.' + topDivClassName, inherits: topDivStyle }
        ];

        styles.GetStyleCreator().CreateStyles(cssStyles);
    };

    function initialize() {
        styles = tf.GetStyles();
        settings = tf.js.GetValidObjectFrom(settings);
        onClickCB = tf.js.GetFunctionOrNull(settings.onClick);
        buttonDim = tf.js.GetIsNonEmptyString(settings.buttonDim) ? settings.buttonDim : "1.6em";
        createCSSClasses();
        createControl();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.ui.MultiMenus = function (settings) {
    var theThis;
    var allMenus;

    this.AddMenu = function (menuToAdd) { return addMenu(menuToAdd); }
    this.CloseMenus = function (optionalExceptMenu) { return closeMenus(optionalExceptMenu); }
    this.UpdateMenuPositions = function () { return updateMenuPositions(); }

    function onMenuOpened(notification) { closeMenus(notification.sender); }
    function closeMenus(optionalExceptMenu) { for (var i in allMenus) { var thisMenu = allMenus[i]; if (thisMenu != optionalExceptMenu) { thisMenu.CloseIfOpen(); } } }
    function updateMenuPositions() { for (var i in allMenus) { var thisMenu = allMenus[i]; thisMenu.OnResize(); } }

    function onButtonClicked() { closeMenus(undefined); }

    function addMenu(menuToAdd) {
        if (!!menuToAdd) {
            if (!!tf.js.GetFunctionOrNull(menuToAdd.AddOpenListener) && !!tf.js.GetFunctionOrNull(menuToAdd.CloseIfOpen)) {
                allMenus.push(menuToAdd);
                menuToAdd.AddOpenListener(onMenuOpened);
            }
        }
    }

    function initialize() {
        allMenus = [];
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.ui.GuidedTour = function (settings) {
    var theThis, styles, buttonDim;
    var onPlayCB, onPauseCB;
    var fullScreenDiv;
    var playButton, playButtonClass, playButtonStyles, isPlaying, topWrapperDiv, titleDiv, contentDiv, buttonsDiv;
    var tourSteps, curTourStep;
    var firstStetButton, lastStepButton, prevStepButton, nextStepButton;
    var nextStepTimer, autoTourButton, isAutoTour;
    var highLightDiv, lastHiLightElem;

    var opacityTransitionCSSClass, hilightDivCSSClass, guidedWrapperCSSClass, guidedTitleCSSClass, guidedContentCSSClass, guidedButtonsCSSClass;

    this.ShowPlayButton = function (showStr) { playButton.GetHTMLElement().style.display = showStr; }
    this.GetIsPlaying = function () { return isPlaying; }

    this.HiLight = function (elem) { return highLightElem(elem); }
    this.DelayHiLight = function (elem) { return delayHiLightElem(elem); }
    this.HideHighLight = function (nodelay) { return hideHighLight(nodelay); }

    function updateAutoTourButton() { if (!!autoTourButton) { autoTourButton.SetIsToggled(!isAutoTour); } }

    function stopnextStepTimer() { if (!!nextStepTimer) { clearTimeout(nextStepTimer); nextStepTimer = undefined; } if (isAutoTour) { isAutoTour = false; updateAutoTourButton(); } }

    function tryStartnextStepTimer() { if (isAutoTour) { nextStepTimer = setTimeout(onNextStepTimer, tourSteps[curTourStep].duration_secs * 1000); } }

    function onNextStepTimer() { gotoGuidedTourStep(curTourStep + 1); }

    function onToggleAutoTour() { if (isAutoTour) { stopnextStepTimer(); } else { isAutoTour = true; tryStartnextStepTimer(); } }

    function onFullScreenResize() { reHighLight(); }

    function showPlayButton() { if (!!playButton) { playButton.GetHTMLElement().style.opacity = 1; } }
    function hidePlayButton() { if (!!playButton) { playButton.GetHTMLElement().style.opacity = 0; } }

    function notifyPlayPause() { var cb = isPlaying ? onPlayCB : onPauseCB; if (!!cb) { cb({ sender: theThis, isPlaying: isPlaying }); } }

    function pauseTour() { if (isPlaying) { fullScreenDiv.Show(isPlaying = false); showPlayButton(); notifyPlayPause(); } }

    function playTour() { if (!isPlaying) { addToFullScreenDiv(); hidePlayButton(); fullScreenDiv.Show(isPlaying = true); notifyPlayPause(); gotoGuidedTourStep(curTourStep); } }

    function onPrevNextTourStep(isPrev) { var inc = isPrev ? -1 : 1; gotoGuidedTourStep(curTourStep + inc); }

    function addRemoveOpacityTransition(elem, addBool) {
        if (!!elem && !!opacityTransitionCSSClass) {
            var method = !!addBool ? tf.dom.AddCSSClass : tf.dom.RemoveCSSClass;
            method(elem, opacityTransitionCSSClass);
        }
    }

    function addRemoveHilightOpacity(addBool) { return addRemoveOpacityTransition(highLightDiv, addBool); }

    function hideHighLight(nodelay) {
        if (!!highLightDiv) {
            lastHiLightElem = undefined;
            var hdes = highLightDiv.GetHTMLElement().style;
            if (!!nodelay) { addRemoveHilightOpacity(false); }
            hdes.opacity = 0;
            if (!!nodelay) { addRemoveHilightOpacity(true); }
        }
    }

    function reHighLight() { if (!!lastHiLightElem) { delayHiLightElem(lastHiLightElem); } }

    function delayHiLightElem(elem) { setTimeout(function () { highLightElem(elem); }, 300); }

    function highLightElem(elem) {
        if ((elem = tf.dom.GetHTMLElementFrom(elem))) {
            if (!!highLightDiv) {
                var rectObj = elem.getBoundingClientRect();
                if (!!rectObj) {
                    hideHighLight(true);
                    lastHiLightElem = elem;
                    var paddingPx = 4;
                    var borderPx = 4;
                    var addPx = paddingPx + borderPx;
                    var left = Math.trunc(rectObj.left) - addPx;
                    var top = Math.trunc(rectObj.top) - addPx;
                    var width = Math.trunc(rectObj.width);
                    var height = Math.trunc(rectObj.height);
                    var highLightDivE = highLightDiv.GetHTMLElement(), highLightDivES = highLightDivE.style;
                    highLightDivES.left = (left) + 'px';
                    highLightDivES.top = (top) + 'px';
                    highLightDivES.width = (width + borderPx) + 'px';
                    highLightDivES.height = (height + borderPx) + 'px';
                    highLightDivES.opacity = 1;
                }
            }
        }
    }

    function gotoGuidedTourStep(stepIndex) {
        var nSteps = tourSteps.length;

        if (stepIndex < 0) { stepIndex = nSteps - 1; } else if (stepIndex >= nSteps) { stepIndex = 0; }

        hideHighLight(true);

        var prevDisplay = stepIndex == 0 ? "none" : "inline-block";
        var nextDisplay = stepIndex < nSteps - 1 ? "inline-block" : "none";

        prevStepButton.GetHTMLElement().style.display = prevDisplay;
        nextStepButton.GetHTMLElement().style.display = nextDisplay;
        firstStetButton.GetHTMLElement().style.display = prevDisplay;
        lastStepButton.GetHTMLElement().style.display = nextDisplay;

        curTourStep = stepIndex;

        var step = tourSteps[stepIndex];

        titleDiv.GetHTMLElement().innerHTML = '[ ' + (stepIndex + 1) + '/' + nSteps + ' ] ' + step.title;
        contentDiv.GetHTMLElement().innerHTML = step.content;
        step.action();

        tryStartnextStepTimer();
    }

    function createGuidedTour() {

        isAutoTour = isPlaying = false;

        if (tf.dom.GetHTMLElementFrom(settings.playButtonContainer)) {
            var playButtonToolTip = tf.js.GetNonEmptyString(settings.playButtonToolTip, "Take a guided tour");
            playButton = new tf.ui.TextBtn({ style: playButtonClass, label: "Guided Tour", dim: "1.4rem", tooltip: playButtonToolTip, onClick: playTour });
            styles.ApplyStyleProperties(playButton, playButtonStyles);
            addRemoveOpacityTransition(playButton, true);
            settings.playButtonContainer.AddContent(playButton);
        }

        if (fullScreenDiv == undefined) { fullScreenDiv = new tf.ui.FullScreenDiv({ onResize: onFullScreenResize }); }
        else { fullScreenDiv.AddResizeListener(onFullScreenResize); }

        topWrapperDiv = new tf.dom.Div({ cssClass: guidedWrapperCSSClass });
        titleDiv = new tf.dom.Div({ cssClass: guidedTitleCSSClass });
        contentDiv = new tf.dom.Div({ cssClass: guidedContentCSSClass });
        buttonsDiv = new tf.dom.Div({ cssClass: guidedButtonsCSSClass });

        topWrapperDiv.AddContent(titleDiv, contentDiv, buttonsDiv);

        firstStetButton = styles.AddButtonDivRightMargin(
            new tf.ui.SvgGlyphBtn({
                style: true, glyph: tf.styles.SvgGlyphArrowToStartName, onClick: function () {
                    stopnextStepTimer();
                    gotoGuidedTourStep(0);
                }, tooltip: "First step in Tour", dim: buttonDim
            })
        );

        lastStepButton = styles.AddButtonDivRightMargin(
            new tf.ui.SvgGlyphBtn({
                style: true, glyph: tf.styles.SvgGlyphArrowToEndName, onClick: function () {
                    stopnextStepTimer();
                    gotoGuidedTourStep(tourSteps.length - 1);
                }, tooltip: "Last step in Tour", dim: buttonDim
            })
        );

        prevStepButton = styles.AddButtonDivRightMargin(
            new tf.ui.SvgGlyphBtn({
                style: true, glyph: tf.styles.SvgGlyphLeftArrowName, onClick: function () {
                    stopnextStepTimer();
                    onPrevNextTourStep(true);
                }, tooltip: "Previous step in Tour", dim: buttonDim
            })
        );

        nextStepButton = styles.AddButtonDivRightMargin(
            new tf.ui.SvgGlyphBtn({
                style: true, glyph: tf.styles.SvgGlyphRightArrowName, onClick: function () {
                    stopnextStepTimer();
                    onPrevNextTourStep(false);
                }, tooltip: "Next step in Tour", dim: buttonDim
            })
        );

        var leftSideDiv = new tf.dom.Div(), leftSideDivE = leftSideDiv.GetHTMLElement(), leftSideDivES = leftSideDivE.style;

        leftSideDivES.position = "absolute";
        leftSideDivES.left = "2px";
        leftSideDivES.top = "2px";

        var pauseButton = styles.AddButtonDivLeftRightMargins(
            new tf.ui.SvgGlyphBtn({
                style: true, glyph: tf.styles.SvgGlyphPauseName, onClick: function () {
                    stopnextStepTimer();
                    pauseTour();
                }, tooltip: "Pause Tour", dim: buttonDim
            })
        );

        var trailToolTip = ' advance to the next step of the tour';

        autoTourButton = styles.AddButtonDivRightMargin(new tf.ui.SvgGlyphToggleBtn({
            style: true, onClick: onToggleAutoTour, dim: buttonDim, isToggled: !isAutoTour,
            glyph: tf.styles.SvgGlyphAutoRepeatName, tooltip: "Manually" + trailToolTip, toggledGlyph: tf.styles.SvgGlyphNoAutoRepeatName, toggledTooltip: "Automatically" + trailToolTip
        }));

        leftSideDiv.AddContent(pauseButton, autoTourButton);

        buttonsDiv.AddContent(leftSideDiv, firstStetButton, lastStepButton, prevStepButton, nextStepButton);

        highLightDiv = new tf.dom.Div({ cssClass: hilightDivCSSClass });
        addRemoveHilightOpacity(true);

        curTourStep = settings.curTourStep != undefined ? settings.curTourStep : 0;
    }

    function addToFullScreenDiv() {
        var fullTopDiv = fullScreenDiv.GetTopDiv();
        fullTopDiv.ClearContent();
        fullTopDiv.AddContent(topWrapperDiv, highLightDiv);
    }

    function initialize() {
        styles = tf.GetStyles();
        fullScreenDiv = settings.fullScreenDiv;
        tourSteps = settings.tourSteps;
        onPlayCB = tf.js.GetFunctionOrNull(settings.onPlay);
        onPauseCB = tf.js.GetFunctionOrNull(settings.onPause);
        playButtonClass = settings.playButtonClass != undefined ? settings.playButtonClass : true;
        playButtonStyles = settings.playButtonStyles != undefined ? settings.playButtonStyles : { position: "absolute", left: "1rem", top: "1rem" };
        buttonDim = settings.buttonDim != undefined ? settings.buttonDim : "1rem";
        opacityTransitionCSSClass = settings.opacityTransitionCSSClass;
        hilightDivCSSClass = settings.hilightDivCSSClass;
        guidedWrapperCSSClass = settings.guidedWrapperCSSClass;
        guidedTitleCSSClass = settings.guidedTitleCSSClass;
        guidedContentCSSClass = settings.guidedContentCSSClass;
        guidedButtonsCSSClass = settings.guidedButtonsCSSClass;

        createGuidedTour();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.ui.TimeAnimationControl = function (settings) {
    var theThis, styles, container;
    var animationDisplayControl, minDate, maxDate, playPauseButton, wrapTime, playbackSpeed, speedButton;
    var currentTimeElem, scrubSlider;
    var timer, nMinutesInterval;
    var lastElapsedTime, lastElapsedTimeChecked;
    var totalTime;
    var playPauseEventName, eventDispatcher;
    var newCurrentTime;
    var isShowing;

    this.AddListener = function (callBack) { return eventDispatcher.AddListener(playPauseEventName, callBack); }

    this.GetIsShowing = function () { return isShowing; }
    this.Show = function (showBool) { return showAnimationControl(showBool); }

    this.SetMinMaxDate = function (minDateSet, maxDateSet) {
        newCurrentTime = new Date(minDateSet);
        minDate = minDateSet;
        maxDate = maxDateSet;
        totalTime = maxDate.getTime() - minDate.getTime();
        setLimit(totalTime)
        onStop();
    }

    this.Pause = function () { if (!theThis.GetIsPaused()) { theThis.OnPlayPause(); } }
    this.OnUpdate = function () { return updateCurrentTimeElem(); }
    this.GetIsPaused = function () { return timer.GetIsPaused(); }
    this.OnPlayPause = function () { return onPlayPause(); }
    this.OnStop = function () { return onStop(); }
    this.GetElapsedTime = function () { return lastElapsedTimeChecked; }
    this.GetCurrentDateTime = function () { return newCurrentTime; }

    function onNotify(verb, attrs) {
        eventDispatcher.Notify(verb, tf.js.ShallowMerge(attrs, { sender: theThis, isPaused: timer.GetIsPaused() }));
    }

    function onPlayPause() {
        var nextPaused = !timer.GetIsPaused();
        playPauseButton.SetIsToggled(nextPaused)
        timer.Pause(nextPaused);
        onNotify(playPauseEventName);
    }
    function onStop() { timer.Pause(true); timer.SetElapsedTime(0); playPauseButton.SetIsToggled(true); drawFrame(); }
    function onToggleAutoRepeat() { timer.SetWrap(wrapTime = !wrapTime); }

    function updateSpeedButtonLabel() { if (!!speedButton) { speedButton.SetText(playbackSpeed + 'x'); } }

    function onSpeedButtonClicked() { if ((playbackSpeed *= 10) > 100) { playbackSpeed = 1; } timer.SetSpeed(playbackSpeed); updateSpeedButtonLabel(); }

    function createAnimationControl() {
        var rightMarginPX = 8;
        var topStr = "3.5rem";
        var marginStr = rightMarginPX + "px";
        var style = {
            display: "block", overflow: "hidden",
            position: "absolute", right: marginStr, top: topStr, fontSize: "1.8em", backgroundColor: "rgba(255,255,255,0.75)", borderRadius: "8px", border: "2px solid navy",
            "tf-shadow": [0, 0, 4, "rgba(0,0,0,0.6)"], zIndex: 2, textAlign: "left", width: "24rem"
        };
        var lightBool = true;
        var buttonDim = "1.0em", textDim = buttonDim;
        var topDiv = new tf.dom.Div({ cssClass: styles.unPaddedBlockDivClass });

        speedButton = new tf.ui.TextBtn({ style: true, label: "", dim: buttonDim, tooltip: "Select playback speed", onClick: onSpeedButtonClicked });
        updateSpeedButtonLabel();

        speedButton.GetHTMLElement().style.minWidth = "3rem";

        var autoRepeatButton = new tf.ui.SvgGlyphToggleBtn({
            style: lightBool, onClick: onToggleAutoRepeat, dim: buttonDim, isToggled: wrapTime,
            glyph: tf.styles.SvgGlyphAutoRepeatName, tooltip: "Auto-repeat", toggledGlyph: tf.styles.SvgGlyphNoAutoRepeatName, toggledTooltip: "Auto-repeat"
        });

        playPauseButton = new tf.ui.SvgGlyphToggleBtn({
            style: lightBool, onClick: onPlayPause, dim: buttonDim, isToggled: false,
            glyph: tf.styles.SvgGlyphPauseName, tooltip: "Pause", toggledGlyph: tf.styles.SvgGlyphPlayName, toggledTooltip: "Play"
        });

        var stopButton = new tf.ui.SvgGlyphBtn({ style: lightBool, glyph: tf.styles.SvgGlyphStopName, onClick: onStop, tooltip: "Stop", dim: buttonDim });

        var currentTimeDivStyle = {
            verticalAlign: "middle",
            borderLeft: "1px solid #003377",
            padding: "6px",
            paddingBottom: "2px",
            display: "inline-block",
            cursor: "default",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "calc(100% - 14px)",
            backgroundColor: "transparent",
            background: "none",
            textAlign: "center"
        };

        var currentTimeDiv = new tf.dom.Div();
        currentTimeElem = currentTimeDiv.GetHTMLElement();

        styles.ApplyStyleProperties(currentTimeDiv, currentTimeDivStyle);

        topDiv.AddContent(
            styles.AddButtonDivMargins(speedButton),
            styles.AddButtonDivRightMargin(stopButton),
            styles.AddButtonDivRightMargin(playPauseButton),
            styles.AddButtonDivRightMargin(autoRepeatButton),
            styles.AddButtonDivRightMargin(currentTimeElem));

        var barDiv = new tf.dom.Div({ cssClass: styles.unPaddedBlockDivClass });
        var barStyle = { overflow: "hidden", borderTop: "1px solid #003377" };

        styles.ApplyStyleProperties(barDiv, barStyle);

        scrubSlider = new tf.ui.CanvasSlider(0, "1.5rem", false);
        var scrubSliderElem = scrubSlider.GetHTMLElement();

        scrubSlider.SetOnClickListener(function (sender, pos01) {
            var elapsedTime = totalTime * pos01;
            timer.SetElapsedTime(elapsedTime);
            drawFrame();
            scrubSlider.SetPos01(pos01);
            if (timer.GetIsPaused()) {
                onNotify(playPauseEventName, { isSeek: true });
            }
        }, theThis);

        scrubSliderElem.title = 'Click to change time';
        scrubSliderElem.style.width = "calc(100% - 2px)";
        scrubSliderElem.style.display = "block";

        barDiv.AddContent(scrubSlider);

        topDiv.AddContent(barDiv);

        styles.ApplyStyleProperties(animationDisplayControl = topDiv, style);
        animationDisplayControl.AppendTo(container);
        showAnimationControl(false);
    }

    function updateCurrentTimeElem() {
        lastElapsedTimeChecked = timer.GetElapsedTime();
        if (!!currentTimeElem && !!minDate) {
            var doUpdate = lastElapsedTime == undefined;

            if (!doUpdate) { doUpdate = Math.abs(lastElapsedTimeChecked - lastElapsedTime) > 999; }

            if (doUpdate) {
                newCurrentTime = new Date();
                lastElapsedTime = lastElapsedTimeChecked;
                newCurrentTime.setTime(minDate.getTime() + lastElapsedTimeChecked);
                var timeStamp = tf.js.GetTimeStampFromDate(newCurrentTime);
                timeStamp = timeStamp.substring(0, 19);
                currentTimeElem.innerHTML = timeStamp;
                scrubSlider.SetPos01(totalTime != 0 ? lastElapsedTimeChecked / totalTime : 0);
                //logConsole(timeStamp);
            }
        }
    }

    function drawFrame() {
        updateCurrentTimeElem();
    }

    function showAnimationControl(showBool) { styles.ChangeOpacityVisibilityClass(animationDisplayControl, showBool); isShowing = !!showBool; }

    function setLimit(nMilliseconds) {
        timer.SetLimit(totalTime = nMilliseconds);
    }

    function createTimer() { timer = new tf.helpers.Timer(); timer.SetSpeed(playbackSpeed); timer.SetLimit(totalTime = 30 * 1000 * 60); timer.SetWrap(wrapTime = true); timer.Pause(true); }

    function initialize() {
        isShowing = false;
        newCurrentTime = new Date();
        playPauseEventName = "playpause";
        eventDispatcher = new tf.events.MultiEventNotifier({ eventNames: [playPauseEventName] });
        styles = tf.GetStyles();
        container = settings.container;
        playbackSpeed = 1;
        createTimer();
        createAnimationControl();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.ui.DateTimePicker = function (settings) {
    var theThis, styles, curParent, buttonDim, pickerStyle, buttonClasses, buttonSelectedClasses, onOpenMenuCB;
    var topDiv, datePicker, dateButton, hourMenu, hourButton, hourAMPMButton;
    var currentMenu, menuContainer;
    var dateForPicker, hourForMenu, name0HourStr, isAM, hourButtonLabel;
    var openEventName, eventDispatcher;

    this.AddOpenListener = function (callBack) { return eventDispatcher.AddListener(openEventName, callBack); }

    this.GetIsOpen = function () { return currentMenu != undefined; }
    this.CloseIfOpen = function () { return closeCurrentMenu(); }

    this.OnResize = function () { return updateMenuPositions(); }

    this.SetDateTime = function (dateSet) { return setDateForDatePicker(dateSet); }
    this.GetDateTime = function () { return getDateFromDatePicker(); }

    this.GetHTMLElement = function () { return topDiv.GetHTMLElement(); }
    this.GetTopDiv = function () { return topDiv; }

    function closeCurrentMenu() {
        if (!!currentMenu) {
            currentMenu.Detach();
            currentMenu = undefined;
            repaintButtons();
        }
    }

    function closeCurrentMenuAndCheck(thisMenu) { var isCurrent = currentMenu == thisMenu; closeCurrentMenu(); return isCurrent; }

    function openMenu(theMenu, styleSet) {
        closeCurrentMenu();
        if (!!theMenu) {
            (currentMenu = theMenu).AppendTo(menuContainer, styleSet);
            repaintButtons();
            if (!!onOpenMenuCB) { onOpenMenuCB({ sender: theThis }); }
            eventDispatcher.Notify(openEventName, { sender: theThis });
        }
    }

    function repaintButtons() {
        hourButton.SetStyle(currentMenu == hourMenu ? buttonSelectedClasses : buttonClasses);
        dateButton.SetStyle(currentMenu == datePicker ? buttonSelectedClasses : buttonClasses);
    }

    function updateMenuPositions() {
        var menuStyles;

        if (currentMenu == datePicker) { menuStyles = calcDatePickerStyle(); }
        else if (currentMenu == hourMenu) { menuStyles = calcHourMenuStyle(); }

        if (menuStyles != undefined) { styles.ApplyStyleProperties(currentMenu, menuStyles); }
    }

    function calcDatePickerStyle() {
        var targetRect = topDiv.GetHTMLElement().getBoundingClientRect();
        var topStr = targetRect.bottom + 'px';
        return { position: "absolute", left: targetRect.left + "px", top: topStr, zIndex: 10 };
    }

    function onDateButtonClicked() {
        if (!closeCurrentMenuAndCheck(datePicker)) {
            datePicker.SetDate(dateForPicker);
            openMenu(datePicker, calcDatePickerStyle());
        }
    }

    function calcHourMenuStyle() {
        var targetRect = hourButton.GetHTMLElement().getBoundingClientRect();
        var topStr = targetRect.bottom + 'px';
        return { position: "absolute", left: targetRect.left + 'px', top: topStr, zIndex: 10, fontSize: "1rem" };
    }

    function onHourButtonClicked() {
        if (!closeCurrentMenuAndCheck(hourMenu)) {
            openMenu(hourMenu, calcHourMenuStyle());
        }
    }

    function setDateButtonLabel() { if (!!dateButton) { dateButton.SetText(tf.js.GetMonthDayYearStr(dateForPicker)); } }
    function setHourButtonLabel() { if (!!hourButton) { hourButton.SetText(hourButtonLabel); } }
    function setHourAMPMButtonLabel() { if (!!hourAMPMButton) { hourAMPMButton.SetText(isAM ? 'am' : 'pm'); } }

    function onDatePickerDateClicked(notification) { dateForPicker = notification.date; closeCurrentMenu(); setDateButtonLabel(); }
    function onHourMenuClicked(notification) { hourForMenu = parseInt(notification.text, 10); hourButtonLabel = notification.text; closeCurrentMenu(); setHourButtonLabel(); }
    function onHourAMPMButtonClicked() { closeCurrentMenu(); isAM = !isAM; setHourAMPMButtonLabel(); }

    function getHour0to12(date) {
        var hours, isAM = true;
        if (!!date) { var hours = date.getHours(); if (hours > 12) { hours -= 12; isAM = false; } var minutes = date.getMinutes(); } else { hours = 0; }
        return { hours: hours, isAM: isAM };
    }

    function setDateForDatePicker(newDate) {

        closeCurrentMenu();

        var g = getHour0to12(newDate);

        dateForPicker = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
        hourForMenu = g.hours;
        hourButtonLabel = g.hours > 0 ? '' + g.hours : name0HourStr;
        isAM = g.isAM;

        //calcStartDate();

        setDateButtonLabel();
        setHourButtonLabel();
        setHourAMPMButtonLabel();
    }

    function getDateFromDatePicker() {
        var calcHours = hourForMenu; if (!isAM) { calcHours += 12; }
        var calcMins = 0;
        var startDate = new Date(dateForPicker.getFullYear(), dateForPicker.getMonth(), dateForPicker.getDate(), calcHours, calcMins, 0, 0);
        var startDateStr = tf.js.GetTimeStampFromDate(startDate);
        return { startDate: startDate, startDateStr: startDateStr };
    }

    function createControl() {

        datePicker = new tf.ui.DatePicker({ onClick: onDatePickerDateClicked });
        dateButton = new tf.ui.TextBtn({ style: buttonClasses, label: "", dim: buttonDim, tooltip: "Select date", onClick: onDateButtonClicked });
        setDateButtonLabel();

        var hourItems = [];

        for (var i = 0 ; i < 12 ; ++i) { var text = i == 0 ? name0HourStr : '' + i; hourItems.push({ text: text, toolTip: 'Select hour ' + text }); }

        hourMenu = new tf.ui.QuickMenu({ onClick: onHourMenuClicked, items: hourItems });
        hourButton = new tf.ui.TextBtn({ style: buttonClasses, label: "", dim: buttonDim, tooltip: "Select hour", onClick: onHourButtonClicked });
        setHourButtonLabel();

        var hourButtonES = hourButton.GetHTMLElement().style;
        hourButtonES.minWidth = "1.4rem";
        hourButtonES.textAlign = "right";

        hourAMPMButton = new tf.ui.TextBtn({ style: buttonClasses, label: "", dim: buttonDim, tooltip: "Select AM/PM", onClick: onHourAMPMButtonClicked });
        setHourAMPMButtonLabel();

        topDiv = new tf.dom.Div({ cssClass: styles.unPaddedBlockDivClass });
        styles.ApplyStyleProperties(topDiv, pickerStyle)

        topDiv.AddContent(dateButton, hourButton, hourAMPMButton);
    }

    function initialize() {
        styles = tf.GetStyles();
        openEventName = "open";
        eventDispatcher = new tf.events.MultiEventNotifier({ eventNames: [openEventName] });
        name0HourStr = '0/12';
        pickerStyle = settings.style != undefined ? settings.style : { borderRadius: "4px", padding: "2px", border: "1px solid #bfbfbf", color: "white", backgroundColor: "#61788c", textAlign: "left", position: 'relative' };
        buttonDim = settings.buttonDim != undefined ? settings.buttonDim : "1rem";
        buttonClasses = settings.buttonClasses != undefined ? settings.buttonClasses : true;
        buttonSelectedClasses = settings.buttonSelectedClasses != undefined ? settings.buttonSelectedClasses : false;
        menuContainer = settings.menuContainer;
        onOpenMenuCB = tf.js.GetFunctionOrNull(settings.onOpenMenu);
        createControl();
        setDateForDatePicker(new Date());
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.ui.QuickTextMenus = function (settings) {
    var theThis, styles, onOpenMenuCB, onSelectCB, items, menuContainer, currentMenu, itemsByName;
    var buttonDim, buttonClasses, buttonSelectedClasses;
    var openEventName, eventDispatcher;

    this.AddOpenListener = function (callBack) { return eventDispatcher.AddListener(openEventName, callBack); }

    this.GetIsOpen = function () { return currentMenu != undefined; }
    this.CloseIfOpen = function () { return closeCurrentMenu(); }

    this.OnResize = function () { return updateMenuPositions(); }

    this.GetItem = function (name) { return itemsByName[name]; }

    function closeCurrentMenu() { if (!!currentMenu) { currentMenu.menu.Detach(); currentMenu = undefined; repaintButtons(); } }

    function closeCurrentMenuAndCheck(thisMenu) { var isCurrent = currentMenu == thisMenu; closeCurrentMenu(); return isCurrent; }

    function openMenu(theMenu, styleSet) {
        closeCurrentMenu();
        if (!!theMenu) {
            (currentMenu = theMenu).menu.AppendTo(menuContainer, styleSet);
            repaintButtons();
            if (!!onOpenMenuCB) { onOpenMenuCB({ sender: theThis, isOpenMenu: true }); }
            eventDispatcher.Notify(openEventName, { sender: theThis });
        }
    }

    function repaintButtons() {
        for (var i in itemsByName) {
            var thisItem = itemsByName[i], isCurrent = currentMenu == thisItem;
            if (thisItem.isCurrent != isCurrent) {
                thisItem.button.SetStyle(isCurrent ? buttonSelectedClasses : buttonClasses);
                thisItem.isCurrent = isCurrent;
            }
        }
    }

    function updateMenuPositions() { if (!!currentMenu) { styles.ApplyStyleProperties(currentMenu.menu, calcMenuStyle(currentMenu.name)); } }

    function calcMenuStyle(name) {
        var item = itemsByName[name];
        var style = {};
        if (!!item) {
            var button = item.button;
            var targetRect = button.GetHTMLElement().getBoundingClientRect();
            var topStr = targetRect.bottom + 'px';
            style = { position: "absolute", left: targetRect.left + 'px', top: topStr, zIndex: 10, fontSize: "1rem" };
        }
        return style;
    }

    function getOnButtonClicked(name) {
        return function () {
            var item = itemsByName[name];
            if (!!item) {
                if (!closeCurrentMenuAndCheck(item)) {
                    openMenu(item, calcMenuStyle(name));
                }
            }
        };
    }

    function getOnMenuItemClicked(name) {
        return function (notification) {
            var item = itemsByName[name];
            if (!!item) {
                var button = item.button;
                var newText = notification.item.label != undefined ? notification.item.label : notification.text, curText = button.GetText();
                closeCurrentMenu();
                if (newText != curText) {
                    button.SetText(newText);
                    if (!!onSelectCB) { onSelectCB({ sender: theThis, isSelect: true, menuName: name, text: notification.text, menuitem: item, item: notification.item, index: notification.index }); }
                }
            }
            else { console.log('click without menu: ' + name); }
        }
    }

    function createButtonsAndMenus() {
        itemsByName = {};
        for (var i in items) {
            var item = settings.items[i];
            if (tf.js.GetIsValidObject(item)) {
                var name = item.name;
                if (tf.js.GetIsNonEmptyString(name)) {
                    if (itemsByName[name] == undefined) {
                        var itemItems = item.items;
                        if (tf.js.GetIsNonEmptyArray(itemItems)) {
                            var selIndex = item.selIndex != undefined ? item.selIndex : 0;
                            if (selIndex >= itemItems.length) { selIndex = 0; }
                            var buttonText = itemItems[selIndex].label != undefined ? itemItems[selIndex].label : itemItems[selIndex].text;
                            var thisMenu = new tf.ui.QuickMenu({ onClick: getOnMenuItemClicked(name), items: itemItems });
                            var thisButton = new tf.ui.TextBtn({
                                style: buttonClasses, label: buttonText, dim: buttonDim,
                                tooltip: tf.js.GetIsNonEmptyString(item.toolTip) ? item.toolTip : buttonText, onClick: getOnButtonClicked(name)
                            });
                            var thisItem = { name: name, menu: thisMenu, button: thisButton, isCurrent: false };
                            itemsByName[name] = thisItem;
                        }
                    }
                    else {
                        console.log('duplicate menu name: ' + name);
                    }
                }
            }
        }
    }

    function initialize() {
        styles = tf.GetStyles();
        openEventName = "open";
        eventDispatcher = new tf.events.MultiEventNotifier({ eventNames: [openEventName] });
        buttonDim = settings.buttonDim != undefined ? settings.buttonDim : "1rem";
        buttonClasses = settings.buttonClasses != undefined ? settings.buttonClasses : true;
        buttonSelectedClasses = settings.buttonSelectedClasses != undefined ? settings.buttonSelectedClasses : false;
        items = tf.js.GetIsNonEmptyArray(settings.items) ? settings.items : [];
        onOpenMenuCB = tf.js.GetFunctionOrNull(settings.onOpenMenu);
        onSelectCB = tf.js.GetFunctionOrNull(settings.onSelect);
        menuContainer = settings.menuContainer;
        createButtonsAndMenus();
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

tf.ui.Select = function (settings) {
    var theThis, selectControl, optionsByValue;

    this.AddOrSetOption = function (theOption) {
        if (tf.js.GetIsValidObject(theOption) && tf.js.GetIsNonEmptyString(theOption.value)) {
            var needAdd, existingOption = optionsByValue[theOption.value];
            if (existingOption == undefined) {
                existingOption = optionsByValue[theOption.value] = createOption();
                needAdd = true;
            }
            existingOption.settings = theOption;
            if (needAdd) { selectControl.AddContent(existingOption.option); }
            existingOption.option.GetHTMLElement().innerHTML = tf.js.GetNonEmptyString(theOption.innerHTML, "");
            existingOption.option.GetHTMLElement().value = theOption.value;
        }
    }

    this.GetCurrentOption = function () {
        return theThis.GetOption(theThis.GetHTMLElement().value);
    };

    this.SetCurrentOption = function (optionValue) { if (theThis.GetOption(optionValue)) { theThis.GetHTMLElement().value = optionValue; } }

    this.GetOption = function (optionValue) {
        return optionsByValue[optionValue];
    };

    this.DelOption = function (optionValue) {
        var existingOption = theThis.GetOption(optionValue);
        if (existingOption) {
            delete optionsByValue[optionValue];
            selectControl.RemoveContent(existingOption.option);
        }
    }

    this.Clear = function () {
        optionsByValue = {};
        selectControl.ClearContent();
    }

    this.Sort = function (compare) {
        var compare = tf.js.GetFunctionOrNull(compare);
        if (!compare) { compare = compareStr; }
        var oArray = tf.js.ObjectToArray(optionsByValue);
        oArray.sort(compare);
        var needReplace = false, ia = 0;
        for (var i in optionsByValue) {
            var oo = optionsByValue[i], oa = oArray[ia++];
            if (needReplace = (oo.settings.value != oa.settings.value)) { break; }
        }
        if (needReplace) {
            var curOption = theThis.GetCurrentOption();
            theThis.Clear();
            for (var i in oArray) { theThis.AddOrSetOption(oArray[i].settings); }
            theThis.SetCurrentOption(curOption);
        }
    }

    function compareStr(a, b) {
        var va = a.settings.value, vb = b.settings.value;
        return (va > vb) - (va < vb);
    }

    function createOption() { return { option: new tf.dom.Option({ cssClass: settings.optionsCSSClass }) }; }

    function createControl() {
        selectControl = new tf.dom.Select({ cssClass: settings.cssClass });
    }

    function initialize() {
        optionsByValue = {};
        createControl();
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: selectControl.GetHTMLElement() });
        if (tf.js.GetFunctionOrNull(settings.onChange)) {
            selectControl.SetOnChange(settings.onChange);
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.ui.Select, tf.dom.Insertable);

tf.dom.RangeInput = function (settings) {
    var theThis = null;

    /**
     * @public
     * @function
     * @summary - Retrieves the <b>text input</b> {@link HTMLElement} associated with this instance
     * @returns {HTMLElement} - | {@link HTMLElement} the element
    */
    this.GetInput = function () { return GetHTMLElement(); }

    function initialize() {
        var domElement = document.createElement('input');

        settings = tf.js.GetValidObjectFrom(settings);

        var toolTipStr = tf.js.GetNonEmptyString(settings.tooltip, "");
        var valueStr = tf.js.GetNonEmptyString(settings.value, "");
        var cssClass = settings.cssClass;

        domElement.type = "range";

        tf.dom.Element.call(theThis, { id: settings.id, domObj: theThis, domElement: domElement, cssClass: cssClass, tooltip: toolTipStr, value: valueStr });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.dom.RangeInput, tf.dom.Element);
