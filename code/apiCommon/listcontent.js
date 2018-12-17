"use strict";

/**
 * Settings used in the creation of [Table Row]{@link tf.ui.TableRow} instances
 * @public
 * @typedef {object} tf.types.TableRowSettings
 * @property {tf.js.KeyedItem} keyedItem - an optional [Keyed Item]{@link tf.js.KeyedItem} instance to be associated with the Table Row
 * @property {tf.types.CSSStyleSpecs} style - Style assumed by the Table Row when unselected
 * @property {tf.types.CSSStyleSpecs} selectedStyle - Style assumed by the Table Row when selected
*/

/**
 * @public
 * @class
 * @summary A Table Row instance belongs to a single [Table]{@link tf.ui.Table} instance and displays application defined {@link HTMLContent}.
 * Applications create Table Rows and then add them to a [Table]{@link tf.ui.Table} using one of its functions [AppendRow]{@link tf.ui.Table#AppendRow}, 
 * [InsertRowAfter]{@link tf.ui.Table#InsertRowAfter}, and [InsertRowBefore]{@link tf.ui.Table#InsertRowBefore}
 * @param {tf.types.TableRowSettings} settings - creation settings
 */
tf.ui.TableRow = function (settings) {

    var theThis, savedDisplay, isShowing, styles, keyedItem;
    var domObj, domElement, container, hoverListener, isSelected, clickListener, style, selectedStyle;
    var colorSelected, colorUnSelected;

    /**
     * @public
     * @function
     * @summary - Retrieves the [Keyed Item]{@link tf.js.KeyedItem} instance associated with this Table Row instance, if one was associated during creation
     * @returns {tf.js.KeyedItem} - | {@link tf.js.KeyedItem} the associated item instance, or {@link void} if no instance was associated
    */
    this.GetKeyedItem = function () { return keyedItem; }

    /**
     * @public
     * @function
     * @summary - Shows or hides this instance
     * @param {boolean} bool - <b>true</b> to show, <b>false</b> to hide
     * @returns {void} - | {@link void} no return value
    */
    this.ShowOrHide = function (bool) { return showOrHide(bool); }

    /**
     * @public
     * @function
     * @summary - Checks if this instance is visible
     * @returns {boolean} - | {@link boolean} <b>true</b> if visible, <b>false</b> otherwise
    */
    this.IsShowing = function () { return isShowing; }

    /**
     * @public
     * @function
     * @summary - Retrieves the {@link tf.ui.Table} instance associated with this Table Row instance
     * @returns {tf.ui.Table} - | {@link tf.ui.Table} the table
    */
    this.GetTable = function () { return container; }

    /**
     * @public
     * @function
     * @summary - Removes any content that was previously added to this Table Row instance
     * @returns {void} - | {@link void} no return value
    */
    this.ClearContent = function () { domObj.ClearContent(); };

    /**
     * @public
     * @function
     * @summary - Replaces any content that was previously added to this Table Row instance with the given new content
     * @param {HTMLElementLike} elem - the new content
     * @returns {void} - | {@link void} no return value
    */
    this.ReplaceContent = function (elem) { this.ClearContent(); this.AppendRow(elem); }

    /**
     * @public
     * @function
     * @summary - Adds the given new content to contents that were previously added to this Table Row instance
     * @param {HTMLElementLike} elem - the new content
     * @returns {void} - | {@link void} no return value
    */
    this.AddContent = function (elem) {
        if (tf.js.GetIsNonEmptyString(elem)) { domElement.innerHTML = elem; }
        else { tf.dom.AddContent(elem, domElement); }
    }

    /**
     * @public
     * @function
     * @summary - If necessary, scrolls the associated [Table]{@link tf.ui.Table} to ensure that this Table Row instance is visible
     * @returns {void} - | {@link void} no return value
    */
    this.EnsureVisible = function () { if (!!container) { return container.EnsureVisible(theThis); } }

    /**
     * @public
     * @function
     * @summary - Selects this Table Row among all other rows in its associated [Table]{@link tf.ui.Table} instance
     * @param {boolean} ensureVisibleBool - set to <b>true</b> to scroll the table, if necessary, to make this instance visible
     * @param {boolean} bypassNotification - set to <b>true</b> to prevent the table from notifying a change in selection
     * @returns {void} - | {@link void} no return value
    */
    this.Select = function (ensureVisibleBool, bypassNotification) { return select(ensureVisibleBool, bypassNotification); }

    /**
     * @public
     * @function
     * @summary - Checks if this Table Row instance is the currently selected row in its associated [Table]{@link tf.ui.Table} instance.
     * @returns {boolean} - | {@link boolean} <b>true</b> if this row is selected, <b>false</b> otherwise
    */
    this.GetIsSelected = function () { return isSelected; }

    /**
     * @private
     * @function
     * @summary - Retrieves the {@link HTMLElementLike} used by this instance. Used internally by the API
     * @returns {HTMLElementLike} - | {@link HTMLElementLike} the element
    */
    this.privateGetHTMLElement = function () { return domElement; }

    /**
     * @private
     * @function
     * @summary - Changes this Table Row instance's style to reflect the given selected status. Used internally by the API
     * @param {boolean} bool - <b>true</b> if selected, <b>false</b> otherwise
     * @returns {void} - | {@link void} no return value
    */
    this.SetSelectedStyle = function (bool) { return setSelectedStyle(bool); }

    /**
     * @private
     * @function
     * @summary - Changes this Table Row instance's style to reflect the given selected status. Used internally by the API
     * @param {tf.ui.Table} containerSet
     * @returns {void} - | {@link void} no return value
    */
    this.OnAddToContainer = function (containerSet) { if (containerSet instanceof tf.ui.Table) { container = containerSet; } }

    /**
     * @private
     * @function
     * @summary - Removes this Table Row instance from its associated [Table]{@link tf.ui.Table} instance. Used internally by the API
     * @returns {void} - | {@link void} no return value
    */
    this.OnRemoveFromContainer = function () { container = null; }

    function setSelectedStyle(isSelectedSet) {
        var styleUse;

        if (isSelected = !!isSelectedSet) { styleUse = selectedStyle; } else { styleUse = style; }

        if (!!styleUse) { styles.ApplyStyleProperties(domElement, styleUse); }
        else { domElement.style.backgroundColor = isSelected ? colorSelected : colorUnSelected; }
    }

    function showOrHide(showBool) { if (isShowing != !!showBool) { isShowing = !!showBool; domElement.style.display = isShowing ? savedDisplay : 'none'; } }

    function select(ensureVisibleBool, bypassNotification) { if (!!container) { container.SelectRow(theThis, ensureVisibleBool, bypassNotification); } }

    function onHover(notification) {
        var content = notification.target, retVal = false;
        if (content) {
            if (notification.isInHover) {
                if (!!container) { retVal = container.OnHoverIntoContent(theThis); }
            }
        }
        return retVal;
    }

    function onClick(notification) {
        var retVal = false;
        if (!!container) { retVal = container.OnClickContent(theThis); }
        return retVal;
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);

        styles = tf.GetStyles();
        keyedItem = settings.keyedItem;

        var subStyles = styles.GetSubStyles();

        colorSelected = subStyles.containerDarkSelBackgroundColor;
        colorUnSelected = subStyles.containerDarkBackgroundColor;

        style = settings.style;
        selectedStyle = settings.selectedStyle;

        domObj = new tf.dom.Div({ cssClass: styles.listContentClass });
        domElement = domObj.GetHTMLElement();
        savedDisplay = 'block';
        hoverListener = new tf.events.DOMHoverListener({ target: domObj, callBack: onHover, optionalScope: theThis, callBackSettings: null });
        clickListener = new tf.events.DOMClickListener({ target: domObj, callBack: onClick, optionalScope: theThis, callBackSettings: null });
        isShowing = true;
        isSelected = false;
        setSelectedStyle(false);
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

/**
 * Row selection notifications sent by {@link tf.ui.Table} instances
 * @public
 * @typedef {object} TableRowSelectNotification
 * @property {tf.ui.Table} sender - the instance sending the notification
 * @property {tf.ui.TableRow} selected - the [Table Row]{@link tf.ui.TableRow} instance that has been selected
 * @property {tf.ui.TableRow} prevSelected - the pleviously selected [Table Row]{@link tf.ui.TableRow} instance, or {@link void}
 * @property {boolean} isClick - <b>true</b> only if a mouse click event initiated the selection
 * @property {tf.ui.KeyedTable} keyedTable - the [Keyed Table]{@link tf.ui.KeyedTable} instance associated with the Table, if one was provided when the Table's was created
*/

/**
 * A callback function that can be used in the creation of instances of [Table]{@link tf.ui.Table}
 * @public
 * @callback tf.types.TableRowSelectCallBack
 * @param {tf.types.TableRowSelectNotification} notification - the notification
 * @returns {void} - | {@link void} no return value
 */

/**
 * Settings used in the creation of [Table]{@link tf.ui.Table} instances
 * @public
 * @typedef {object} tf.types.TableSettings
 * @property {tf.ui.KeyedTable} keyedTable - an optional [Keyed Table]{@link tf.ui.KeyedTable} instance to be associated with the Table
 * @property {tf.types.TableRowSelectCallBack} onSelect - an optional callback to be notified of [Table Row]{@link tf.ui.TableRow} selection changes
 * @property {object} optionalScope - optional scope used with <b>onSelect</b>
 * @property {boolean} selectOnHover - Allows or prevents the Table from selecting a [Table Row]{@link tf.ui.TableRow} instance when the mouse pointer hovers over it
 * @property {tf.types.CSSStyleSpecs} style - Style assumed by the Table
*/

/**
 * @public
 * @class
 * @summary A Table instance is an [Insertable]{@link tf.dom.Insertable} implementing a standard vertical table with scrolling and contains zero or more 
 * [Table Row]{@link tf.ui.TableRow} instances, one of which can be marker as "Selected", either by calling the
 * function [SelectRow]{@link tf.ui.Table#SelectRow} of this Table, or when a mouse pointer click (and optionally hover)
 * event occurs on a row.
 * @param {tf.types.TableSettings} settings - creation settings
 * @extends {tf.dom.Insertable}
 */
tf.ui.Table = function (settings) {

    var theThis, containerObj, containerElem, optionalScope, onSelectCallBack, contents, nContents, selectedContent, selectOnHoverBool, keyedTable;

    /**
     * @public
     * @function
     * @summary - Retrieves the [Keyed Table]{@link tf.ui.KeyedTable} instance associated with this table instance, if one was associated during creation
     * @returns {tf.ui.KeyedTable} - | {@link tf.ui.KeyedTable} the associated instance, or {@link void} if no instance was associated
    */
    this.GetKeyedTable = function () { return keyedTable; }

    /**
     * @public
     * @function
     * @summary - Checks if this Table Instance automatically selects a [Table Row]{@link tf.ui.TableRow} instance when the mouse pointer hovers over it.
     * Selection of a row always occurs on mouse click events
     * @returns {boolean} - | {@link boolean} <b>true</b> if selection on hover is allowed, <b>false</b> otherwise
    */
    this.GetSelectOnHover = function () { return selectOnHoverBool; }

    /**
     * @public
     * @function
     * @summary - Allows or prevents this Table Instance to/from automatically selecting a [Table Row]{@link tf.ui.TableRow} instance when the mouse pointer hovers over it.
     * Selection of a row always occurs on mouse click events
     * @param {boolean} bool - <b>true</b> to allow select on hover, <b>false</b> to prevent it
     * @returns {void} - | {@link void} no return value
    */
    this.SetSelectOnHover = function (bool) { selectOnHoverBool = !!bool; }

    /**
     * @public
     * @function
     * @summary - Adds the given [Table Row]{@link tf.ui.TableRow] instance to the end of this Table instance
     * @param {tf.ui.TableRow} tableRow - the table row
     * @returns {void} - | {@link void} no return value
    */
    this.AppendRow = function (tableRow) {
        if (!!tableRow && tableRow instanceof tf.ui.TableRow) {
            tableRow.OnAddToContainer(theThis);
            containerObj.AddContent(tableRow.privateGetHTMLElement());
            contents.push(tableRow);
            ++nContents;
        }
    }
    
    /**
     * @public
     * @function
     * @summary - Inserts the the given [Table Row]{@link tf.ui.TableRow] instance before an existing row instance
     * @param {tf.ui.TableRow} tableRow - the table row to insert
     * @param {tf.ui.TableRow} existingTableRow - the existing table row, before which <b>tableRow</b> will be inserted
     * @returns {void} - | {@link void} no return value
    */
    this.InsertRowBefore = function (tableRow, existingTableRow) {
        if (
            (!!tableRow && tableRow instanceof tf.ui.TableRow) &&
            (!!existingTableRow && existingTableRow instanceof tf.ui.TableRow) &&
            existingTableRow.GetTable() == theThis) {
            tableRow.OnAddToContainer(theThis);
            containerObj.InsertContentBefore(tableRow.privateGetHTMLElement(), existingTableRow);
            contents.push(tableRow);
            ++nContents;
        }
    }

    /**
     * @public
     * @function
     * @summary - Inserts the the given [Table Row]{@link tf.ui.TableRow] instance after an existing row instance
     * @param {tf.ui.TableRow} tableRow - the table row to insert
     * @param {tf.ui.TableRow} existingTableRow - the existing table row, after which <b>tableRow</b> will be inserted
     * @returns {void} - | {@link void} no return value
    */
    this.InsertRowAfter = function (tableRow, existingTableRow) {
        if (
            (!!tableRow && tableRow instanceof tf.ui.TableRow) &&
            (!!existingTableRow && existingTableRow instanceof tf.ui.TableRow) &&
            existingTableRow.GetTable() == theThis) {
            tableRow.OnAddToContainer(theThis);
            containerObj.InsertContentAfter(tableRow.privateGetHTMLElement(), existingTableRow);
            contents.push(tableRow);
            ++nContents;
        }
    }

    /**
     * @public
     * @function
     * @summary - Removes the given [Table Row]{@link tf.ui.TableRow] instance from this Table instance
     * @param {tf.ui.TableRow} tableRow - the table row to remove
     * @returns {void} - | {@link void} no return value
    */
    this.DelRow = function (tableRow) {
        if (!!tableRow && tableRow instanceof tf.ui.TableRow && tableRow.GetTable() == theThis) {
            var index = contents.indexOf(tableRow);
            containerElem.removeChild(tableRow.privateGetHTMLElement());
            tableRow.OnRemoveFromContainer();
            if (index != -1) { contents.splice(index, 1); }
            --nContents;
            if (tableRow == selectContent) {
                var nextSelIndex = (index != -1 && nContents > 0) ? (index < nContents ? index : index - 1) : -1;
                if (nextSelIndex == -1) {
                    unselectContent();
                    notifySelect(tableRow, false);
                }
                else { selectContent(contents[nextSelIndex], true, false, false); }
            }
        }
    }

    /**
     * @public
     * @function
     * @summary - Removes all [Table Row]{@link tf.ui.TableRow] instances from this Table instance
     * @returns {void} - | {@link void} no return value
    */
    this.Clear = function () {
        nContents = contents.length;
        for (var i = 0 ; i < nContents ; ++i) { contents[i].OnRemoveFromContainer(); }
        contents = [];
        containerObj.ClearContent();
        selectedContent = null;
        nContents = 0;
    }

    this.GetRow = function (rowIndex) { return !!contents && nContents > 0 ? contents[rowIndex] : undefined; }

    /**
     * @public
     * @function
     * @summary - Retrieves the number of [Table Row]{@link tf.ui.TableRow] instances currently in this Table instance
     * @returns {number} - | {@link number} the number of table row instances
    */
    this.GetRowCount = function () { return nContents; }

    /**
     * @public
     * @function
     * @summary - Selects a [Table Row]{@link tf.ui.TableRow} instance among all other rows
     * @param {tf.ui.TableRow} tableRow - the table row to select
     * @param {boolean} ensureVisibleBool - set to <b>true</b> to scroll the table, if necessary, to make this instance visible
     * @param {boolean} bypassNotification - set to <b>true</b> to prevent the table from notifying a change in selection
     * @returns {void} - | {@link void} no return value
    */
    this.SelectRow = function (tableRow, ensureVisibleBool, bypassNotification) { return selectContent(tableRow, ensureVisibleBool, bypassNotification); }

    /**
     * @public
     * @function
     * @summary - Retrieves the currently selected [Table Row]{@link tf.ui.TableRow} instance
     * @returns {tf.ui.TableRow} - | {@link tf.ui.TableRow} the selected row, or {@link void} if no row is selected
    */
    this.GetSelectedRow = function () { return selectedContent; }

    this.UnselectRow = function () { return unselectContent(); }

    /**
     * @public
     * @function
     * @summary - If necessary, scrolls this Table instance to ensure that the given [Table Row]{@link tf.ui.TableRow} instance is visible
     * @param {tf.ui.TableRow} tableRow - the table row to select
     * @returns {void} - | {@link void} no return value
    */
    this.EnsureVisible = function (tableRow) { return ensureVisible(tableRow); }

    /**
     * @public
     * @function
     * @summary - If necessary, scrolls this Table instance to ensure that the currently selected [Table Row]{@link tf.ui.TableRow} instance is visible
     * @returns {void} - | {@link void} no return value
    */
    this.EnsureSelectedContentVisible = function () { return this.EnsureVisible(this.GetSelectedRow()); }

    /**
     * @private
     * @function
     * @summary - Used internally by the API
     * @param {tf.ui.TableRow} theContent - the table row
     * @returns {void} - | {@link void} no return value
    */
    this.OnHoverIntoContent = function (theContent) { return onHoverIntoContent(theContent); }

    /**
     * @private
     * @function
     * @summary - Used internally by the API
     * @param {tf.ui.TableRow} theContent - the table row
     * @returns {void} - | {@link void} no return value
    */
    this.OnClickContent = function (theContent) { return onClickContent(theContent); }

    /**
     * @private
     * @function
     * @summary - Retrieves the number of [Table Row]{@link tf.ui.TableRow] instances currently in this Table instance
     * @returns {number} - | {@link number} the number of table row instances
     * @deprecated
    */
    //this.GetContents = function () { return contents; }

    this.Sort = function (sortFnc) {
        if (!sortAndCheckIfChanged(sortFnc)) {
            reFill();
            //console.log('sort and refill');
        } //else { console.log('sort refill skip'); }
    }

    function reFill() {
        if (!!containerElem) {
            var outerContainer = containerElem.parentNode;
            var sp = !!outerContainer ? outerContainer.scrollTop : 0;
            containerObj.ClearContent();
            for (var i in contents) {
                var content = contents[i];
                containerObj.AddContent(content.privateGetHTMLElement());
            }
            if (!!outerContainer) { outerContainer.scrollTop = sp; }
        }
    }

    function sortAndCheckIfChanged(sortFnc) {
        var isSorted = true;
        if (tf.js.GetFunctionOrNull(sortFnc)) {
            var nContents = contents.length;

            if (nContents > 0) {
                var contentsCopy = contents.slice(0);
                contents.sort(sortFnc);
                for (var i = 0 ; (i < nContents) && isSorted ; ++i) {
                    isSorted = contentsCopy[i] == contents[i];
                }
            }
        }
        return isSorted;
    }

    function onClickContent(theContent) { selectContent(theContent, false, false, true); return true;}

    function onHoverIntoContent(theContent) { if (selectOnHoverBool) { selectContent(theContent, false, false, false); } }

    function ensureVisible(content) {
        if (!!content && content instanceof tf.ui.TableRow && content.GetTable() == theThis) {
            if (content = content.privateGetHTMLElement()) {
                var outerContainer = containerElem.parentNode;

                if (!!outerContainer) {
                    outerContainer.scrollTop = content.offsetTop - outerContainer.offsetTop;
                }
            }
        }
    }

    function unselectContent() {
        if (!!selectedContent) {
            selectedContent.SetSelectedStyle(false);
            selectedContent = null;
        }
    }

    function notifySelect(prevSel, isClick) {
        if (!!onSelectCallBack) { onSelectCallBack.call(optionalScope, { sender: theThis, selected: selectedContent, prevSelected: prevSel, isClick: !!isClick, keyedTable: keyedTable }); }
    }

    function selectContent(content, ensureVisibleBool, bypassNotification, isClick) {
        if (!!content && content instanceof tf.ui.TableRow) {
            if (content.GetTable() == theThis) {
                var prevSel = selectedContent;
                var alreadySelected = content == prevSel;
                if (!alreadySelected) {
                    unselectContent();
                    selectedContent = content;
                    selectedContent.SetSelectedStyle(true);
                }
                if (!!ensureVisibleBool) { ensureVisible(content); }
                if (!bypassNotification) { notifySelect(prevSel, isClick); }
            }
        }
    }

    function initialize() {
        var styles = tf.GetStyles();
        contents = [];
        nContents = 0;
        selectedContent = null;
        onSelectCallBack = tf.js.GetFunctionOrNull(settings.onSelect);
        optionalScope = settings.optionalScope;
        selectOnHoverBool = !!settings.selectOnHover;
        containerObj = new tf.dom.Div({ cssClass: tf.GetStyles().unPaddedBlockDivClass });
        containerElem = containerObj.GetHTMLElement();
        keyedTable = settings.keyedTable;
        if (tf.js.GetIsValidObject(settings.style)) { styles.ApplyStyleProperties(containerElem, settings.style); }
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: containerElem });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.ui.Table, tf.dom.Insertable);

/**
 * Content requests sent by {@link tf.ui.KeyedTable} instances
 * @public
 * @typedef {object} tf.types.KeyedRowTableRowContentRequest
 * @property {tf.ui.Table} sender - the instance sending the notification
 * @property {tf.js.KeyedItem} keyedItem - the [Keyed Item]{@link tf.js.KeyedItem} instance for which content is being requested
 * @property {object} properties - application defined properties provided in the creation of the [Keyed Table]{@link tf.ui.KeyedTable} instance
*/

/**
 * A callback function that provides content for [Table Row]{@link tf.ui.TableRow} instances in [Keyed Tables]{@link tf.ui.KeyedTable}
 * @public
 * @callback tf.types.KeyedRowTableGetContent
 * @param {tf.types.KeyedRowTableRowContentRequest} request - the request
 * @returns {HTMLElementLike} - | {@link HTMLElementLike} the requested content
 */

/**
 * Notifications sent by {@link tf.ui.KeyedTable} instances
 * @public
 * @typedef {object} tf.types.KeyedTableNotification
 * @property {tf.ui.Table} sender - the instance sending the notification
 * @property {tf.types.keyedFeatureListEventName} eventName - the name of the event
 * @property {object} properties - application defined properties provided in the creation of the [Keyed Table]{@link tf.ui.KeyedTable} instance
 * @property {tf.types.KeyedListEventNotification} keyedListNotification - the associated [Keyed List]{@link tf.js.KeyedList} notification
*/

/**
 * A callback function that receives change notifications from instances of [Keyed Table]{@link tf.ui.KeyedTable}
 * @public
 * @callback tf.types.KeyedTableCallBack
 * @param {tf.types.KeyedTableNotification} notification - the notification
 * @returns {void} - | {@link void} no return value
 */

/**
 * Settings used in the creation of [Keyed Table]{@link tf.ui.KeyedTable} instances
 * @public
 * @typedef {object} tf.types.KeyedTableSettings
 * @property {tf.js.KeyedList} keyedList - the associated [Keyed List]{@link tf.js.KeyedList} instance
 * @property {tf.types.PropertyName} propertyName - the name of the [Keyed Item]{@link tf.js.KeyedItem} property to be associated with [Table Rows]{@link tf.ui.TableRow} in this table.
 * @property {object} optionalScope - optional JavaScript scope used in callBacks and notifications
 * @property {tf.types.KeyedTableCallBack} onContentChange - a callback to receive notifications from this table
 * @property {tf.types.KeyedRowTableGetContent} getRowContent - a callback to provide content for [Table Row]{@link tf.ui.TableRow} instances in this table
 * @property {object} properties - application defined properties, passed to notifications and callbacks
 * @property {tf.types.TableSettings} tableSettings - used in the creation of the associated [Table]{@link tf.ui.Table} instance, whose <b>keyedTable</b> property will be automatically defined by the Keyed Table
 * @property {tf.types.TableRowSettings} rowSettings - used in the creation of [Table Row]{@link tf.ui.TableRow} instances, whose <b>keyedItem</b> property will be automatically defined by the Keyed Table
*/

/**
 * @public
 * @class
 * @summary A Keyed Table creates and manages a [Table]{@link tf.ui.Table} instance to which [Table Rows]{@link tf.ui.TableRow} are automatically added, updated, and deleted 
 * based in the [Keyed Items]{@link tf.js.KeyedItem} and [events]{@link tf.types.keyedListEventName} of a given [Keyed List]{@link tf.js.KeyedList} instance. 
 * Keyed Tables obtain row content from a callback, and notify table change events to a single listener, both of which are specified on creation
 * @param {tf.types.KeyedTableSettings} settings - creation settings
 */
tf.ui.KeyedTable = function (settings) {

    var theThis, table, keyedList, onChangeCallBack, listMonitor, getRowContentCallBack, optionalScope, propertyName, properties, sortFnc, onPreSortCB, onSortedCB;

    this.SetSort = function (sortFnc) { return setSort(sortFnc); }

    this.GetTable = function () { return table; }

    /**
     * @public
     * @function
     * @summary - Retrievs the application defined properties provided in the creation of this Keyed Table instance
     * @returns {object} - | {@link object} the properties
    */
    this.GetProperties = function () { return properties; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Keyed List]{@link tf.js.KeyedList} instance associated with this Keyed Table instance
     * @returns {tf.js.KeyedList} - | {@link tf.js.KeyedList} the keyed list instance
    */
    this.GetKeyedList = function () { return keyedList; }

    /**
     * @public
     * @function
     * @summary - Retrieves the name of the [Keyed Item]{@link tf.js.KeyedItem} property that is associated with with [Table Rows]{@link tf.ui.TableRow} in this Keyed Table instance
     * @returns {tf.types.PropertyName} - | {@link tf.types.PropertyName} the name
    */
    this.GetPropertyName = function () { return propertyName; }

    /**
     * @public
     * @function
     * @summary - Retrieves the [Table Row]{@link tf.ui.TableRow} associated with the given [Keyed Item]{@link tf.js.KeyedItem}, if one exists
     * @param {tf.js.KeyedItem} keyedItem - the keyed item
     * @returns {tf.ui.TableRow} - | {@link tf.ui.TableRow} the Table Row instance or {@link void}
    */
    this.GetRowFromKeyedItem = function (keyedItem) { return getTableRowFromItem(keyedItem); }

    this.ScrollTo = function (keyedItem) { var row = theThis.GetRowFromKeyedItem(keyedItem) ; if (!!row) { row.Select(true, true); } }

    this.SetKeyedList = function (keyedListSet) { return setKeyedList(keyedListSet); }

    function setSort(sortFncSet) {
        if (sortFnc != sortFncSet) { if (sortFnc = tf.js.GetFunctionOrNull(sortFncSet)) { doSort(); } }
    }

    function doSort() {
        if (sortFnc != undefined) {
            if (!!onPreSortCB) { onPreSortCB({ sender: theThis }); }
            table.Sort(sortFnc);
            if (!!onSortedCB) { onSortedCB({ sender: theThis }); }
        }
    }

    function onListItemsAddedOrUpdated(notification) {
        var items = notification.items;

        for (var i in items) {
            var thisItem = items[i];
            var row = getTableRowFromItem(thisItem);
            var isNewItem = !row;
            var content;

            if (isNewItem) { setTableRowToItem(thisItem, row = new tf.ui.TableRow(tf.js.ShallowMerge(settings.rowSettings, { keyedItem: thisItem}))); } else { row.ClearContent(); }

            if (!!getRowContentCallBack) {
                var data = getRowContentCallBack.call(optionalScope, { sender: theThis, keyedItem: thisItem, properties: properties });
                if (tf.js.GetIsValidObject(data)) { content = data.content; }
            }

            if (!!content) { row.AddContent(content); } else { row.privateGetHTMLElement().innerHTML = thisItem.GetKey(); }
        }

        doSort();
    }

    function notifyChange(keyedListNotification, type) {
        if (!!onChangeCallBack) {
            onChangeCallBack.call(optionalScope, { sender: theThis, eventName: type, properties: properties, keyedListNotification: keyedListNotification });
        }
    }

    function onListItemsAdded(notification) {
        onListItemsAddedOrUpdated(notification);
        notifyChange(notification, tf.consts.keyedTableRowsAddedEvent);
    }

    function onListItemsUpdated(notification) {
        onListItemsAddedOrUpdated(notification);
        notifyChange(notification, tf.consts.keyedTableRowsUpdatedEvent);
    }

    function onListItemsDeleted(notification) {
        var items = notification.items;

        for (var i in items) {
            var thisItem = items[i], tableRow = getTableRowFromItem(thisItem);
            if (!!tableRow) { table.DelRow(tableRow); setTableRowToItem(thisItem, null); }
        }
        notifyChange(notification, tf.consts.keyedTableRowsDeletedEvent);
    }

    function getTableRowFromItem(keyedItem) { return tf.js.GetObjProperty(keyedItem, propertyName); }
    function setTableRowToItem(keyedItem, row) { tf.js.SetObjProperty(keyedItem, propertyName, row); if (!!row) { table.AppendRow(row); } }
    function deleteTableRowFromItem(keyedItem) { var row = getTableRowFromItem(keyedItem); if (!!row) { setTableRowToItem(keyedItem, null); row.OnDelete(); } }

    function setKeyedList(keyedListSet) {
        if (tf.js.GetIsInstanceOf(keyedListSet, tf.js.KeyedList)) {
            table.Clear();
            keyedList = keyedListSet;
            var listeners = {};
            listeners[tf.consts.keyedListDeleteEvent] = onListItemsDeleted;
            listeners[tf.consts.keyedListAddedItemsEvent] = onListItemsAdded;
            listeners[tf.consts.keyedListUpdatedItemsEvent] = onListItemsUpdated;
            listeners[tf.consts.keyedListDeletedItemsEvent] = onListItemsDeleted;
            listMonitor = keyedList.AddListeners(listeners);
            keyedList.NotifyItemsAdded(onListItemsAddedOrUpdated);
        }
    }

    function initialize() {
        settings = tf.js.GetValidObjectFrom(settings);
        table = new tf.ui.Table(tf.js.ShallowMerge(settings.tableSettings, { keyedTable: theThis }));
        getRowContentCallBack = tf.js.GetFunctionOrNull(settings.getRowContent);
        onPreSortCB = tf.js.GetFunctionOrNull(settings.onPreSort);
        onSortedCB = tf.js.GetFunctionOrNull(settings.onSorted);
        optionalScope = settings.optionalScope;
        onChangeCallBack = tf.js.GetFunctionOrNull(settings.onContentChange);
        propertyName = tf.js.GetNonEmptyString(settings.propertyName, tf.consts.TableRowProperty);
        properties = tf.js.GetIsValidObject(settings.properties) ? settings.properties : {};
        setKeyedList(settings.keyedList)
        tf.dom.Insertable.call(theThis, { domObj: theThis, domElement: table });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};
tf.js.InheritFrom(tf.ui.KeyedTable, tf.dom.Insertable);
