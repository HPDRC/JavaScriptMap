"use strict";

/**
 * An object used in the creation of [Radio Button With Label]{@link tf.ui.RadioButtonWithLabel} instances
 * @public
 * @typedef {object} tf.types.RadioButtonWithLabelSettings
 * @property {string} labelID - optional label ID
 * @property {string} radioID - optional radio ID
 * @property {string} labelStr - label text
 * @property {string} valueStr - radio value
 * @property {boolean} checked - initially checked, if set to <b>true</b>, unchecked otherwise
 * @property {string} radioGroupStr - radio group
 * @property {string} toolTipStr - tooltip text
 */

/**
 * @public
 * @class
 * @summary Radio Button With Label is an [Insertable]{@link tf.dom.Insertable} implementing an HTML radio button with a text label.
 * Instances of this class are created by the function [AddRadioButton]{@link tf.ui.RadioButtonList} of a [Radio Button List]{@link tf.ui.RadioButtonList} instance,
 * instead of using the <b>new</b> operator
 * @param {tf.types.RadioButtonWithLabelSettings} settings - creation settings
 * @extends {tf.dom.Insertable}
 */
tf.ui.RadioButtonWithLabel = function (settings) {

    var theThis, label, labelStr, radio, div, onLabelClick, onElemClick;

    /**
     * @public
     * @function
     * @summary - Retrieves the radio button {@link HTMLElement} associated with this instance
     * @returns {HTMLElement} - | {@link HTMLElement} the element
    */
    this.GetRadioButton = function () { return radio; }

    /**
     * @public
     * @function
     * @summary - Retrieves the label {@link HTMLElement} associated with this instance
     * @returns {HTMLElement} - | {@link HTMLElement} the element
    */
    this.GetLabel = function () { return label; }

    /**
     * @public
     * @function
     * @summary - Retrieves string value associated with this instance
     * @returns {string} - | {@link string} the value
    */
    this.GetValue = function () { return radio.value; }

    /**
     * @public
     * @function
     * @summary - Toggles the <b>checked</b> state of this instance
     * @returns {void} - | {@link void} no return value
    */
    this.Toggle = function () { radio.checked = !radio.checked; }

    /**
     * @public
     * @function
     * @summary - Retrieves the <b>checked</b> state of this instance
     * @returns {boolean} - | {@link boolean} <b>true</b> if checked, <b>false</b> otherwise
    */
    this.GetIsChecked = function () { return radio.checked; }

    /**
     * @public
     * @function
     * @summary - Sets the <b>checked</b> state of this instance
     * @param {boolean} bool - <b>true</b> to check the element, <b>false</b> to uncheck it
     * @returns {void} - | {@link void} no return value
    */
    this.SetIsChecked = function (bool) { radio.checked = !!bool; }

    /**
     * @public
     * @function
     * @summary - Sets a listener for [Click Events]{@link tf.consts.DOMEventNamesClick} on this instance
     * @param {tf.types.MultiDOMEventListenerCallBack} callBack - to receive event notifications
     * @param {object} optionalScope - optional scope used with <b>callBack</b>
     * @param {object} callBackSettings - application defined properties, to be passed to <b>callBack</b> during notifications
     * @returns {void} - | {@link void} no return value
    */
    this.SetOnClick = function (callBack, optionalScope, callBackSettings) {
        theThis.OnDelete();
        //onElemClick = new tf.events.DOMClickListener({ target: radio, callBack: callBack, optionalScope: optionalScope, callBackSettings: callBackSettings });
        onLabelClick = new tf.events.DOMClickListener({ target: label, callBack: callBack, optionalScope: optionalScope, callBackSettings: callBackSettings });
    }

    /**
     * @public
     * @function
     * @summary - Use this function to delete event listeners associated with this instance
     * @returns {void} - | {@link void} no return value
    */
    this.OnDelete = function () {
        if (!!onLabelClick) { onLabelClick.OnDelete(); onLabelClick = null; }
        if (!!onElemClick) { onElemClick.OnDelete(); onElemClick = null; }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);

        var labelID, radioID, valueStr, checked, radioGroupStr, toolTipStr;

        labelStr = tf.js.GetNonEmptyString(settings.labelStr, "");
        valueStr = tf.js.GetNonEmptyString(settings.valueStr, labelStr);
        toolTipStr = tf.js.GetIsNonEmptyString(settings.toolTipStr) ? settings.toolTipStr : labelStr;
        radioGroupStr = tf.js.GetNonEmptyString(settings.radioGroupStr, "");

        labelID = tf.js.GetNonEmptyString(settings.labelID) ? settings.labelID : tf.dom.CreateDomElementID("tf-label-");
        radioID = tf.js.GetNonEmptyString(settings.radioID) ? settings.radioID : tf.dom.CreateDomElementID("tf-radio-");

        checked = tf.js.GetBoolFromValue(settings.checked);

        div = new tf.dom.Div({ cssClass: tf.GetStyles().GetUnPaddedDivClassNames(true, false) });

        label = document.createElement('label');
        radio = document.createElement('input');

        label.id = labelID;
        label.title = toolTipStr;
        label.htmlFor = radioID;

        radio.type = "radio";
        radio.checked = !!checked ? "checked" : null;
        radio.id = radioID;
        radio.title = toolTipStr;
        radio.name = radioGroupStr;
        radio.value = valueStr;

        label.appendChild(document.createTextNode(labelStr));

        div.AddContent(radio, label);
        div.title = toolTipStr;
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: div.GetHTMLElement() });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.ui.RadioButtonWithLabel, tf.dom.Insertable);

/**
 * An object used in the creation of [Check Box With Label]{@link tf.ui.CheckBoxWithLabel} instances
 * @public
 * @typedef {object} tf.types.CheckBoxWithLabelSettings
 * @property {string} labelID - optional label ID
 * @property {string} checkID - optional checkbox ID
 * @property {string} labelStr - label text
 * @property {boolean} checked - initially checked, if set to <b>true</b>, unchecked otherwise
 * @property {string} toolTipStr - tooltip text
 */

/**
 * @public
 * @class
 * @summary Check Box With Label is an [Insertable]{@link tf.dom.Insertable} implementing an HTML check box with a text label.
 * Instances of this class are created by the function [AddCheckBox]{@link tf.ui.CheckBoxList} of a [Check Box List]{@link tf.ui.CheckBoxList} instance,
 * instead of using the <b>new</b> operator
 * @param {tf.types.CheckBoxWithLabelSettings} settings - creation settings
 * @extends {tf.dom.Insertable}
 */
tf.ui.CheckBoxWithLabel = function (settings) {

    var theThis, label, labelStr, check, div, onLabelClick, onElemClick;

    /**
     * @public
     * @function
     * @summary - Retrieves the check box {@link HTMLElement} associated with this instance
     * @returns {HTMLElement} - | {@link HTMLElement} the element
    */
    this.GetCheckBox = function () { return check; }

    /**
     * @public
     * @function
     * @summary - Retrieves the label {@link HTMLElement} associated with this instance
     * @returns {HTMLElement} - | {@link HTMLElement} the element
    */
    this.GetLabel = function () { return label; }

    /**
     * @public
     * @function
     * @summary - Retrieves the label {@link HTMLElement} associated with this instance, provided for interface compatibility with [Radio Buttons]{@link tf.js.RadioButtonWithLabel}
     * @returns {HTMLElement} - | {@link HTMLElement} the element
    */
    this.GetValue = function () { return labelStr; }

    /**
     * @public
     * @function
     * @summary - Toggles the <b>checked</b> state of this instance
     * @returns {void} - | {@link void} no return value
    */
    this.Toggle = function () { check.checked = !check.checked; }

    /**
     * @public
     * @function
     * @summary - Retrieves the <b>checked</b> state of this instance
     * @returns {boolean} - | {@link boolean} <b>true</b> if checked, <b>false</b> otherwise
    */
    this.GetIsChecked = function () { return check.checked; }

    /**
     * @public
     * @function
     * @summary - Sets the <b>checked</b> state of this instance
     * @param {boolean} bool - <b>true</b> to check the element, <b>false</b> to uncheck it
     * @returns {void} - | {@link void} no return value
    */
    this.SetIsChecked = function (bool) { check.checked = !!bool; }

    /**
     * @public
     * @function
     * @summary - Sets a listener for [Click Events]{@link tf.consts.DOMEventNamesClick} on this instance
     * @param {tf.types.MultiDOMEventListenerCallBack} callBack - to receive event notifications
     * @param {object} optionalScope - optional scope used with <b>callBack</b>
     * @param {object} callBackSettings - application defined properties, to be passed to <b>callBack</b> during notifications
     * @returns {void} - | {@link void} no return value
    */
    this.SetOnClick = function (callBack, optionalScope, callBackSettings) {
        theThis.OnDelete();
        //onElemClick = new tf.events.DOMClickListener({ target: check, callBack: callBack, optionalScope: optionalScope, callBackSettings: callBackSettings });
        onLabelClick = new tf.events.DOMClickListener({ target: label, callBack: callBack, optionalScope: optionalScope, callBackSettings: callBackSettings });
    }

    /**
     * @public
     * @function
     * @summary - Use this function to delete event listeners associated with this instance
     * @returns {void} - | {@link void} no return value
    */
    this.OnDelete = function () {
        if (!!onLabelClick) { onLabelClick.OnDelete(); onLabelClick = null; }
        if (!!onElemClick) { onElemClick.OnDelete(); onElemClick = null; }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);

        var labelID, checkID, checked, radioGroupStr, toolTipStr;

        labelStr = tf.js.GetNonEmptyString(settings.labelStr, "");
        toolTipStr = tf.js.GetIsNonEmptyString(settings.toolTipStr) ? settings.toolTipStr : labelStr;

        labelID = tf.js.GetNonEmptyString(settings.labelID) ? settings.labelID : tf.dom.CreateDomElementID("tf-label-");
        checkID = tf.js.GetNonEmptyString(settings.checkID) ? settings.checkID : tf.dom.CreateDomElementID("tf-check-");

        checked = tf.js.GetBoolFromValue(settings.checked);

        div = new tf.dom.Div({ cssClass: tf.GetStyles().GetUnPaddedDivClassNames(true, false) });

        label = document.createElement('label');
        check = document.createElement('input');

        label.id = labelID;
        label.title = toolTipStr;
        label.htmlFor = checkID;

        check.type = "checkbox";
        check.checked = !!checked ? "checked" : null;
        check.id = checkID;
        check.title = toolTipStr;

        label.appendChild(document.createTextNode(labelStr));

        div.AddContent(check, label);
        div.title = toolTipStr;
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: div.GetHTMLElement() });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.ui.CheckBoxWithLabel, tf.dom.Insertable);

/**
 * An object used in the creation of [Check Box With Label And Open Close]{@link tf.ui.CheckBoxWithLabelAndOpenClose} instances
 * @public
 * @typedef {object} tf.types.CheckBoxWithLabelAndOpenCloseSettings
 * @property {string} labelStr - label text
 * @property {boolean} checked - initially checked, if set to <b>true</b>, unchecked otherwise
 * @property {string} toolTipStr - tooltip text
 */

/**
 * @public
 * @class
 * @summary Check Box With Label And Open Close is an [Insertable]{@link tf.dom.Insertable} combining a [Click Open Close Button]{@link tf.ui.ClickOpenClose} instance
 * and a [CheckBox With Label]{@link tf.ui.CheckBoxWithLabel} instance.
 * Instances of this class are created by the function [AddCheckBoxWithLabelAndOpenClose]{@link tf.ui.CheckBoxList} of a [Check Box List]{@link tf.ui.CheckBoxList} instance,
 * instead of using the <b>new</b> operator
 * @param {tf.types.CheckBoxWithLabelAndOpenCloseSettings} settings - creation settings
 * @extends {tf.dom.Insertable}
 */
tf.ui.CheckBoxWithLabelAndOpenClose = function (settings) {

    var theThis, divCheck, divAll, clickOnClose, checkBox;

    /**
     * @public
     * @function
     * @summary - Retrieves the [Check Box With Label]{@link tf.ui.CheckBoxWithLabel} instance associated with this instance
     * @returns {tf.ui.CheckBoxWithLabel} - | {@link tf.ui.CheckBoxWithLabel} the instance
    */
    this.GetCheckBox = function () { return checkBox; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Click Open Close Button]{@link tf.ui.ClickOpenClose} instance associated with this instance
     * @returns {tf.ui.ClickOpenClose} - | {@link tf.ui.ClickOpenClose} the instance
    */
    this.GetClickOpenClose = function () { return clickOnClose; }

    /**
     * @public
     * @function
     * @summary - Use this function to delete event listeners associated with this instance
     * @returns {void} - | {@link void} no return value
    */
    this.OnDelete = function () {
        if (!!clickOnClose) { clickOnClose.OnDelete(); /*clickOnClose= null;*/ }
        if (!!checkBox) { checkBox.OnDelete(); /*checkBox = null;*/ }
    }

    function initialize() {

        settings = tf.js.GetValidObjectFrom(settings);

        var styles = tf.GetStyles(), subStyles = styles.GetSubStyles();
        var labelStr, checked, toolTipStr;

        labelStr = tf.js.GetNonEmptyString(settings.labelStr, "");
        toolTipStr = tf.js.GetIsNonEmptyString(settings.toolTipStr) ? settings.toolTipStr : labelStr;

        checked = tf.js.GetBoolFromValue(settings.checked);

        divCheck = new tf.dom.Div({ cssClass: styles.GetUnPaddedDivClassNames(true, false) });
        var closeBtnDim = subStyles.mapControlFontSizeEmNumber + "em";
        clickOnClose = styles.AddButtonDivRightMargin(new tf.ui.ClickOpenClose({ isOpen: false, onClick: undefined, dim: closeBtnDim, style: false }));
        checkBox = new tf.ui.CheckBoxWithLabel({ labelStr: labelStr, checked: checked, toolTipStr: toolTipStr });
        var divDivCheck = divCheck.GetHTMLElement();

        divDivCheck.style.width = "calc(90% - " + closeBtnDim + ")";
        checkBox.AppendTo(divCheck);

        divAll = new tf.dom.Div({ cssClass: tf.GetStyles().GetUnPaddedDivClassNames(true, false) });
        divAll.GetHTMLElement().title = toolTipStr;
        clickOnClose.AppendTo(divAll);
        divCheck.AppendTo(divAll);

        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: divAll });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.ui.CheckBoxWithLabelAndOpenClose, tf.dom.Insertable);

/**
 * @public
 * @class
 * @summary List Item is an [Insertable]{@link tf.dom.Insertable} containing a [Div]{@link tf.dom.Div} created with the 
 * standard API <b>padded div</b> [CSS style/class]{@link tf.types.CSSStyleName}, obtainable with the 
 * [GetPaddedDivClassNames]{@link tf.styles.Styles#GetPaddedDivClassNames} function, 
 * to which {@link HTMLElementLike} content can be added. Used for building disposable sub-containers
 * @param {boolean} inlineBool - set to <b>true</b> to create an <b>inline-block</b> div with optional right border separator, otherwise a <b>block</b> div style with optional bottom separator is created
 * @param {boolean} borderSeparatorBool - if <b>true</b> adds a separator border to either the div's right or bottom, depending on <b>inlineBool</b>, if <b>false</b> no separator is added
 * @extends {tf.dom.Insertable}
 */
tf.ui.ListItem = function (inlineBool, borderSeparatorBool) {

    var theThis;

    /**
     * @public
     * @function
     * @summary - Adds the given new content to contents that were previously added to this instance
     * @param {HTMLElementLike} elem - the new content
     * @returns {void} - | {@link void} no return value
    */
    this.AddContent = function (elem) { tf.dom.AddContent(elem, theThis.GetHTMLElement()); }

    /**
     * @public
     * @function
     * @summary - Checks if this instance was created with a border separator CSS style/class
     * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
    */
    this.GetHasBorderSeparator = function () { return borderSeparatorBool; }

    /**
     * @public
     * @function
     * @summary - Checks if this instance was created with as an <b>inline-block</b>
     * @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
    */
    this.GetIsInline = function () { return inlineBool; }

    function initialize() {
        borderSeparatorBool = !!borderSeparatorBool;
        inlineBool = !!inlineBool;
        var className = tf.GetStyles().GetPaddedDivClassNames(inlineBool, borderSeparatorBool);
        var domElement = new tf.dom.Div({ cssClass: className }).GetHTMLElement();
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: domElement });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.ui.ListItem, tf.dom.Insertable);

/**
 * @public
 * @class
 * @summary Radio Button List is an [Insertable]{@link tf.dom.Insertable} containing an arbitrary number of [Radio Button With Label]{@link tf.ui.RadioButtonWithLabel} instances
 * @param {object} settings - creation settings
 * @param {boolean} settings.isInline - set to <b>true</b> to create a <b>horizontal</b> list, otherwise a <b>vertical</b> list is created
 * @param {string} settings.radioGroup - if defined, <b>radioGroup</b> is used as the group name of the radio buttons, otherwise a group is automatically created, defaults to {@link void}
 * @extends {tf.dom.Insertable}
 */
tf.ui.RadioButtonList = function (settings) {

    var theThis, isInline, radioGroup, domElement;

    /**
     * @public
     * @function
     * @summary - Checks if this instance is horizontal or vertical
     * @returns {boolean} - | {@link boolean} <b>true</b> if horizontal, <b>false</b> otherwise
    */
    this.GetIsInline = function () { return isInline; }

    /**
     * @public
     * @function
     * @summary - Adds the given new content to contents that were previously added to this instance
     * @param {HTMLElementLike} elem - the new content
     * @param {boolean} borderSeparatorBool - if <b>true</b> adds a separator border to either the content's right or bottom, depending on whether this list is horizontal or vertical
     * @returns {void} - | {@link void} no return value
    */
    this.AddContent = function (elem, borderSeparatorBool) {
        if (elem) { var li = new tf.ui.ListItem(isInline, borderSeparatorBool); li.AddContent(elem); li.AppendTo(domElement); }
        return elem;
    }

    /**
     * @public
     * @function
     * @summary - Creates a new [Radio Button With Label]{@link tf.ui.RadioButtonWithLabel} instance and adds it to this list
     * @param {string} labelStr - label text
     * @param {string} valueStr - radio value
     * @param {boolean} checked - initially checked, if set to <b>true</b>, unchecked otherwise
     * @param {string} toolTipStr - tooltip text
     * @param {boolean} borderSeparatorBool - if <b>true</b> adds a separator border to either the button's right or bottom, depending on whether this list is horizontal or vertical
     * @returns {tf.ui.RadioButtonWithLabel} - | {@link tf.ui.RadioButtonWithLabel} the added instance
    */
    this.AddRadioButton = function (labelStr, valueStr, checked, toolTipStr, borderSeparatorBool) {
        return this.AddContent(new tf.ui.RadioButtonWithLabel({labelStr: labelStr, valueStr: valueStr, checked: checked, radioGroupStr: radioGroup, toolTipStr: toolTipStr}), borderSeparatorBool);
    }

    function initialize() {
        var styles = tf.GetStyles();
        var settingsUse = tf.js.GetValidObjectFrom(settings);
        isInline = tf.js.GetBoolFromValue(settingsUse.isInline);
        if (!(radioGroup = tf.js.GetNonEmptyString(settingsUse.radioGroup, null))) {
            radioGroup = tf.dom.CreateDomElementID("tf-rg-");
        }
        var className = styles.GetUnPaddedDivClassNames(isInline, false) + " " + styles.GetRadioItemClasses();
        domElement = (new tf.dom.Div({ cssClass: className })).GetHTMLElement();
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: domElement });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.ui.RadioButtonList, tf.dom.Insertable);

/**
 * @public
 * @class
 * @summary Check Box List is an [Insertable]{@link tf.dom.Insertable} containing an arbitrary number of [Check Box With Label]{@link tf.ui.CheckBoxWithLabel} instances
 * @param {object} settings - creation settings
 * @param {boolean} settings.isInline - set to <b>true</b> to create a <b>horizontal</b> list, otherwise a <b>vertical</b> list is created
 * @extends {tf.dom.Insertable}
 */
tf.ui.CheckBoxList = function (settings) {

    var theThis, isInline, domElement;

    /**
     * @public
     * @function
     * @summary - Checks if this instance is horizontal or vertical
     * @returns {boolean} - | {@link boolean} <b>true</b> if horizontal, <b>false</b> otherwise
    */
    this.GetIsInline = function () { return isInline; }

    /**
     * @public
     * @function
     * @summary - Adds the given new content to contents that were previously added to this instance
     * @param {HTMLElementLike} elem - the new content
     * @param {boolean} borderSeparatorBool - if <b>true</b> adds a separator border to either the content's right or bottom, depending on whether this list is horizontal or vertical
     * @returns {void} - | {@link void} no return value
    */
    this.AddContent = function (elem, borderSeparatorBool) {
        if (elem) { var li = new tf.ui.ListItem(isInline, borderSeparatorBool); li.AddContent(elem); li.AppendTo(domElement); }
        return elem;
    }

    /**
     * @public
     * @function
     * @summary - Creates a new [Check Box With Label]{@link tf.ui.CheckBoxWithLabel} instance and adds it to this list
     * @param {string} labelStr - label text
     * @param {boolean} checked - initially checked, if set to <b>true</b>, unchecked otherwise
     * @param {string} toolTipStr - tooltip text
     * @param {boolean} borderSeparatorBool - if <b>true</b> adds a separator border to either the button's right or bottom, depending on whether this list is horizontal or vertical
     * @returns {tf.ui.CheckBoxWithLabel} - | {@link tf.ui.CheckBoxWithLabel} the added instance
    */
    this.AddCheckBox = function (labelStr, checked, toolTipStr, borderSeparatorBool) {
        return this.AddContent(new tf.ui.CheckBoxWithLabel({ labelStr: labelStr, checked: checked, toolTipStr: toolTipStr }), borderSeparatorBool);
    }

    /**
     * @public
     * @function
     * @summary - Creates a new [Check Box With Label And Open Close]{@link tf.ui.CheckBoxWithLabelAndOpenClose} instance and adds it to this list
     * @param {string} labelStr - label text
     * @param {boolean} checked - initially checked, if set to <b>true</b>, unchecked otherwise
     * @param {string} toolTipStr - tooltip text
     * @param {boolean} borderSeparatorBool - if <b>true</b> adds a separator border to either the button's right or bottom, depending on whether this list is horizontal or vertical
     * @returns {tf.ui.CheckBoxWithLabelAndOpenClose} - | {@link tf.ui.CheckBoxWithLabelAndOpenClose} the added instance
    */
    this.AddCheckBoxWithLabelAndOpenClose = function (labelStr, checked, toolTipStr, borderSeparatorBool) {
        return this.AddContent(new tf.ui.CheckBoxWithLabelAndOpenClose({ labelStr: labelStr, checked: checked, toolTipStr: toolTipStr }), borderSeparatorBool);
    }

    function initialize() {
        var styles = tf.GetStyles();
        var settingsUse = tf.js.GetValidObjectFrom(settings);
        isInline = tf.js.GetBoolFromValue(settingsUse.isInline);
        var className = styles.GetUnPaddedDivClassNames(isInline, false) + " " + styles.GetCheckItemClasses();
        domElement = (new tf.dom.Div({ cssClass: className })).GetHTMLElement();
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: domElement });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.ui.CheckBoxList, tf.dom.Insertable);

/**
 * @public
 * @class
 * @summary Radio Or Check List From Data is an [Insertable]{@link tf.dom.Insertable} implementing quick construction of simple lists
 * containing either [Radio Button With Label]{@link tf.ui.RadioButtonWithLabel} or [Check Box With Label]{@link tf.ui.CheckBoxWithLabel} instances
 * @param {object} settings - creation settings
 * @param {boolean} settings.isInline - set to <b>true</b> to create a <b>horizontal</b> list, otherwise a <b>vertical</b> list is created
 * @param {boolean} settings.isRadioList - set to <b>true</b> to create a <b>radio button</b> list, otherwise a <b>check box</b> list is created
 * @param {boolean} settings.noSeparators - set to <b>true</b> to prevent separators from being added between buttons, defaults to {@link void}
 * @param {function} settings.onClick - simple callback that receives the <b>label</b> of a button [clicked]{@link tf.consts.DOMEventNamesClick} by the user
 * @param {function} settings.optionalScope - optional scope used with <b>callback</b>
 * @param {string} settings.selRadioName - on <b>radio button</b> lists specifies the label of the button that is initially selected
 * @param {array<boolean>} settings.checkBoxes - on <b>check box</b> lists specifies the initial <b>checked</b> state for buttons on the list, 
 * should contain as many elements as the number of buttons being added, non-initialized buttons are created unchecked by default
 * @param {string|array<string>|array<string, string>} settings.data - if a <b>string</b> is used it must contain the labels of the buttons to be added separated by {@link tf.consts.charSplitStrings}.
 * if an <b>array</b> is used its elements are either the <b>strings</b> containing button labels, or two element arrays containing a button name in the
 * first position and a button tooltip in the second position.
 * @example
 * function onClick(labelClicked) {
 *     console.log('button with label "' + labelClicked + '" was clicked');
 * }
 * var checkListWithoutTooltips = new tf.ui.RadioOrCheckListFromData({
 *     isRadioList: false, onClick: onClick, isInline: false, checkedBoxes: [true, false, true],
 *     data: "Option1+Option2+Option3"
 * });
 * var radioListWithoutTooltips = new tf.ui.RadioOrCheckListFromData({
 *     isRadioList: true, onClick: onClick, isInline: false, selRadioName: "Option2",
 *     data: ["Option1", "Option2", "Option3"]
 * });
 * var checkListWithTooltips = new tf.ui.RadioOrCheckListFromData({
 *     isRadioList: false, onClick: onClick, isInline: false, checkedBoxes: [true, false, true],
 *     data: [["Option1", "Click me for option 1"], ["Option2", "Click me for option 2"], ["Option3", "Click me for option 3"]]
 * });
 * @extends {tf.dom.Insertable}
 */
tf.ui.RadioOrCheckListFromData = function (settings) {

    var theThis, list, isRadioList, callBackOnClick, buttons, lastCheckedName, optionalScope;

    /**
     * @public
     * @function
     * @summary - Checks if this is a [Radio Button With Label]{@link tf.ui.RadioButtonWithLabel} list or a [Check Box With Label]{@link tf.ui.CheckBoxWithLabel} list
     * @returns {boolean} - | {@link boolean} <b>true</b> if radio button list, <b>false</b> otherwise
    */
    this.GetIsRadioButtonList = function () { return isRadioList; }

    /**
     * @public
     * @function
     * @summary - Retrieves either the [Radio Button With Label]{@link tf.ui.RadioButtonWithLabel} or the [Check Box With Label]{@link tf.ui.CheckBoxWithLabel} instance with the
     * given label, if any
     * @param {string} label - the given label
     * @returns {tf.ui.RadioButtonWithLabel|tf.ui.CheckBoxWithLabel} - | {@link tf.ui.RadioButtonWithLabel}|{@link tf.ui.CheckBoxWithLabel} the instance with the give label, or {@link void} if none is found
    */
    this.GetButton = function (buttonName) { return buttons[buttonName]; }

    /**
     * @public
     * @function
     * @summary - Retrieves label of the last button checked
     * @returns {string} - | {@string} the label
    */
    this.GetLastCheckedLabel = function () { return lastCheckedName; }

    function notifyOnClick(theButton) { callBackOnClick.call(optionalScope, theButton.GetValue()); }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);

        buttons = [];

        callBackOnClick = tf.js.GetFunctionOrNull(settings.onClick);

        optionalScope = settings.optionalScope;

        var type = (isRadioList = !!settings.isRadioList) ? tf.ui.RadioButtonList : tf.ui.CheckBoxList;

        list = new type({ isInline: settings.isInline });

        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: list.GetHTMLElement() });

        var data = settings.data;

        if (!!data) {
            if (typeof data === "string") { data = data.split(tf.consts.charSplitStrings); }
            if (tf.js.GetIsArray(data)) {
                var nData = data.length;
                var selRadioName = tf.js.GetNonEmptyString (settings.selRadioName);
                var checkedBoxesObj = tf.js.GetValidObjectFrom(settings.checkedBoxes);
                var noSeparators = settings.noSeparators !== undefined ? tf.js.GetBoolFromValue(settings.noSeparators) : false;
                for (var i in data) {
                    var dataItem = data[i];
                    var itemStr = null, toolTipStr = null;

                    if (tf.js.GetIsArrayWithLength(dataItem, 2)) {
                        itemStr = tf.js.GetNonEmptyString(dataItem[0]);
                        toolTipStr = tf.js.GetNonEmptyString(dataItem[1]);
                    }
                    else {
                        var itemStr = tf.js.GetNonEmptyString(dataItem);
                        toolTipStr = 'click to select: "' + itemStr + '"';
                    }

                    if (!!itemStr) {
                        if (!buttons[itemStr]) {
                            var checked;
                            
                            if (isRadioList) { if (checked = (!selRadioName || selRadioName == itemStr)) { selRadioName = itemStr; } }
                            else { checked = !!checkedBoxesObj[itemStr]; }
                            if (checked) { lastCheckedName = itemStr; }
                            var borderSeparatorBool = noSeparators ? false : i != nData - 1;
                            var button = isRadioList ?
                                list.AddRadioButton(itemStr, itemStr, checked, toolTipStr, borderSeparatorBool) :
                                list.AddCheckBox(itemStr, checked, toolTipStr, borderSeparatorBool);
                            var onClickFunction = function (theButton, theButtonName) {
                                return function () {
                                    lastCheckedName = theButtonName;
                                    if (isRadioList) { theButton.SetIsChecked(true); } else { theButton.Toggle(); }
                                    if (!!callBackOnClick) { setTimeout(function () { return notifyOnClick(theButton); }, 10); }
                                }
                            }(button, itemStr);

                            buttons[itemStr] = button;
                            button.SetOnClick(onClickFunction, theThis, undefined);
                        }
                        else { tf.GetDebug().LogIfTest("tf.ui.RadioOrCheckListFromData: adding duplicate button: " + itemStr); }
                    }
                }
            }
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.ui.RadioOrCheckListFromData, tf.dom.Insertable);

/**
 * @public
 * @class
 * @summary Radio Or Check Popup From Data is a [Popup]{@link tf.ui.Popup} containing an instance of [Radio Or Check List From Data]{@link tf.ui.RadioOrCheckListFromData}
 * @param {object} settings - creation settings
 * @param {HTMLElementLike} settings.container - Mandatory param, the container where the popup is located
 * @param {HTMLElementSize} settings.marginHor - optional horizontal margins (applies to both left and right), defaults to "0px"
 * @param {HTMLElementSize} settings.marginVer - optional vertical margins (applies to both top and bottom), defaults to "0px"
 * @param {HTMLElementSize} settings.maxWidth - optional maximum width, defaults to {@link void}
 * @param {HTMLElementSize} settings.maxHeight - optional maximum height, defaults to {@link void}
 * @param {number} zIndex - if defined, sets the zIndex of the popup. Defaults to 100
 * @param {boolean} settings.isInline - set to <b>true</b> to create a <b>horizontal</b> list, otherwise a <b>vertical</b> list is created
 * @param {boolean} settings.isRadioList - set to <b>true</b> to create a <b>radio button</b> list, otherwise a <b>check box</b> list is created
 * @param {function} settings.onClick - simple callback that receives the <b>label</b> of a button [clicked]{@link tf.consts.DOMEventNamesClick} by the user
 * @param {function} settings.optionalScope - optional scope used with <b>callback</b>
 * @param {string} settings.selRadioName - on <b>radio button</b> lists specifies the label of the button that is initially selected
 * @param {array<boolean>} settings.checkBoxes - on <b>check box</b> lists specifies the initial <b>checked</b> state for buttons on the list, 
 * should contain as many elements as the number of buttons being added, non-initialized buttons are created unchecked by default
 * @param {string|array<string>|array<string, string>} settings.data - if a <b>string</b> is used it must contain the labels of the buttons to be added separated by '+'.
 * if an <b>array</b> is used its elements are either the <b>strings</b> containing button labels, or two element arrays containing a button name in the
 * first position and a button tooltip in the second position.
 */
tf.ui.RadioOrCheckPopupFromData = function (settings) {

    var theThis, popup, radioList;;

    /**
     * @public
     * @function
     * @summary - Sets popup's zIndex
     * @param {number} zIndex - the zIndex
     * @returns {void} - | {@link void} no return value
    */
    this.SetZIndex = function (zIndex) { popup && popup.SetZIndex(zIndex); }

    /**
     * @public
     * @function
     * @summary - Gets popup's zIndex
     * @returns {number} - | {@link number} the zIndex
    */
    this.GetZIndex = function () { return popup ? popup.GetZIndex() : 0; }

    /**
     * @public
     * @function
     * @summary - Sets the callBack for the popup's close button click event, the popup closes and the callback is notified
     * @param {function} callBack - the callBack function, the popup instance object is passed to it on notifications
     * @returns {void} - | {@link void} no return value
    */
    this.SetOnClose = function (callBack) { popup.SetOnClose(callBack, optionalScope); }

    /**
     * @public
     * @function
     * @summary - Changes the popup's tile
     * @param {string} titleStr - the new title
     * @returns {void} - | {@link void} no return value
    */
    this.SetTitle = function (titleStr) { popup && popup.ChangeTitle(titleStr); }

    /**
     * @public
     * @function
     * @summary - Shows or hides the popup
     * @param {boolean} bool - <b>true</b> to show, <b>false</b> to hide
     * @returns {void} - | {@link void} no return value
    */
    this.Show = function (bool) { if (popup) { popup.Show(bool); if (!!bool) { onContainerResize(); } } }

    /**
     * @public
     * @function
     * @summary - Checks if the popup is visible
     * @returns {boolean} - | {@link boolean} <b>true</b> if visible, <b>false</b> otherwise
    */
    this.IsShowing = function () { return popup ? popup.IsShowing() : false; }

    /**
     * @public
     * @function
     * @summary - Toggles popup's visibility state
     * @returns {void} - | {@link void} no return value
    */
    this.Toggle = function () { this.Show(!this.IsShowing()); }

    /**
     * @public
     * @function
     * @summary - Notifies the popup that its container may have been resized
     * @returns {void} - | {@link void} no return value
    */
    this.OnContainerResize = function () { onContainerResize(); }

    function onContainerResize() { if (popup) { popup.OnContainerResize(); } }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);

        if (settings.container) {
            (popup = new tf.ui.Popup({
                container: settings.container,
                titleStr: settings.title,
                maxHeight: "100%",
                maxWidth: "100%",
                horPos: settings.horPos,
                verPos: settings.verPos,
                marginHor: settings.marginHor,
                marginVer: settings.marginVer,
                zIndex: settings.zIndex
            })).AddContent(radioList = new tf.ui.RadioOrCheckListFromData({
                isRadioList: settings.isRadioList, onClick: settings.onClick, data: settings.data, isInline: settings.isInline, checkBoxes: settings.checkBoxes, selRadioName: settings.selRadioName
            }));

            popup.SetOnClose(settings.onClose, settings.optionalScope);
        }
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
