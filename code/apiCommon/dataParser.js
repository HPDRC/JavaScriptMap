"use strict";

/**
 * method tf.urlapi.NormalizeJSONProperties - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} properties - parameter description?
*/
tf.urlapi.NormalizeJSONProperties = function (properties) {
    if (!!properties) {
        if (properties.Latitude != undefined) { properties.lat = properties.Latitude; delete properties.Latitude; }
        else if (properties.latitude != undefined) { properties.lat = properties.latitude; delete properties.latitude; }

        if (properties.Longitude != undefined) { properties.lon = properties.Longitude; delete properties.Longitude; }
        else if (properties.longitude != undefined) { properties.lon = properties.longitude; delete properties.longitude; }
    }
    return properties;
}

/**
 * method tf.urlapi.NormalizeFieldID - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} fieldIDStr - parameter description?
*/
tf.urlapi.NormalizeFieldID = function (fieldIDStr) {
    fieldIDStr = typeof fieldIDStr === "string" ? fieldIDStr.toLowerCase().trim() : "";
    return fieldIDStr === "latitude" ? "lat" : (fieldIDStr === "longitude" ? "lon" : fieldIDStr);
}

/**
 * class tf.urlapi.TabDelimitedDataParser - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
*/
tf.urlapi.TabDelimitedDataParser = function () {
    var fields = [];
    var dataSet = [];

    var delimitorFieldContent = "==";
    var delimitorContentSTATS = "===";

/**
 * method tf.urlapi.TabDelimitedDataParser.ParseData - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} dataStr - parameter description?
 * @param {?} fieldsFilter - parameter description?
*/
    this.ParseData = function (dataStr, fieldsFilter) {

        fields = [];
        dataSet = [];

        var data = dataStr.substring(dataStr.indexOf(delimitorFieldContent) + 4, dataStr.indexOf(delimitorContentSTATS) - 1);
        var lines = data.split('\n');
        var fieldsList = dataStr.slice(dataStr.indexOf("\r\n=\r\n") + 5, dataStr.indexOf("\r\n==\r\n"));

        fields = fieldsList.split('\t');

        var fieldsCount = fields.length;

        if (fieldsCount == 700 && fields[699] == "offset") fieldsCount -= 1;

        var normalizeFnc = tf.urlapi.NormalizeFieldID;
        var getStringFnc = tf.js.GetNonEmptyString;

        typeof fieldsFilter === "object" || (fieldsFilter = undefined) ;

        var fieldsFilterIndices = [];
        var fieldsFilterLen = fieldsFilter !== undefined ? fieldsFilter.length : 0;

        for (var iField = 0 ; iField < fieldsCount ; iField++) {
            var thisField = normalizeFnc(fields[iField]);

            fields[iField] = thisField ;

            for (var i = 0 ; i < fieldsFilterLen ; i++) {
                var thisFilter = fieldsFilter[i];

                if (thisField == thisFilter) {
                    fieldsFilterIndices.push(iField);
                }
            }
        }

        var iDataLine = 0, nLines = lines.length;

        for (var iLine = 0; iLine < nLines; ++iLine)//for each line
        {
            var thisLine = lines[iLine].trim();

            if (thisLine.length > 0) {
                var record = thisLine.split('\t');

                if (fieldsCount == record.length) {
                    var recordSet = [];

                    if (fieldsFilterLen == 0) {
                        for (var iField = 0; iField < fieldsCount; ++iField) {
                            var fieldID = fields[iField];
                            var fieldValue = getStringFnc(record[iField]);

                            if (fieldValue) { recordSet[fieldID] = fieldValue; }
                        }
                    }
                    else {
                        for (var i = 0; i < fieldsFilterLen ; ++i) {
                            var iField = fieldsFilterIndices[i];
                            var fieldID = fields[iField];
                            var fieldValue = getStringFnc(record[iField]);

                            if (fieldValue) { recordSet[fieldID] = fieldValue; }
                        }
                    }
                    dataSet[iDataLine++] = recordSet;
                }
            }
        }
    }

/**
 * method tf.urlapi.TabDelimitedDataParser.GetFields - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetFields = function () { return fields; }
/**
 * method tf.urlapi.TabDelimitedDataParser.GetFieldName - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} index - parameter description?
*/
    this.GetFieldName = function (index) { return fields[index]; }
/**
 * method tf.urlapi.TabDelimitedDataParser.GetNFields - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetNFields = function () { return fields.length ;}
/**
 * method tf.urlapi.TabDelimitedDataParser.GetFieldIndex - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} fieldName - parameter description?
*/
    this.GetFieldIndex = function (fieldName) {
        var index = -1 ;

        if (typeof fieldName === "string" && fieldName.length > 0) {
            index = fields.indexOf(fieldName.toLowerCase().trim());
        }
        return index;
    }

/**
 * method tf.urlapi.TabDelimitedDataParser.GetDataSet - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetDataSet = function () { return dataSet; }
/**
 * method tf.urlapi.TabDelimitedDataParser.GetNRecords - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetNRecords = function () { return dataSet.length;}
/**
 * method tf.urlapi.TabDelimitedDataParser.GetRecord - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
 * @param {?} index - parameter description?
*/
    this.GetRecord = function (index) { index = tf.js.GetNonNegativeIntFrom(index); return index < this.GetNRecords () ? dataSet[index] : null; }
};