"use strict";

/**
 * class tf.map.aux.LegendDecoder - class description?
 * @private
 * @class
 * @summary - class summary?
 * @description - class description?
 * @param {?} legendStr - parameter description?
*/
tf.map.aux.LegendDecoder = function (legendStr) {

    legendStr = typeof legendStr == "string" ? legendStr : tf.consts.defaultLegend;

    var groupSetRootName = "tf-mapi-lgrt";

    var decodedLegend = decodeLegend(legendStr);

/**
 * method tf.map.aux.LegendDecoder.GetGroupSetRootName - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetGroupSetRootName = function () { return groupSetRootName ;}

/**
 * method tf.map.aux.LegendDecoder.GetLegendSet - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetLegendSet = function () { return decodedLegend.legendSet; }

/**
 * method tf.map.aux.LegendDecoder.GetGroupSetNames - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetGroupSetNames = function () { return decodedLegend.groupSetNames; }

/**
 * method tf.map.aux.LegendDecoder.GetGroupSet - ?
 * @private
 * @function
 * @summary - method summary?
 * @description - method description?
 * @returns {?} - method returns?
*/
    this.GetGroupSet = function () { return decodedLegend.groupSet; }

    function decodeLegend(legendStr) {

        //tf.GetDebug().LogIfTest("decoding legend string :\n" + legendStr);

        //clean legendSet

        var legendSet = [];
        var grSet = {};

        // get GROUP information 

        var legendString = unescape(legendStr);
        var arrLegendGroupString = legendString.split(";");

        //tf.GetDebug().LogIfTest(arrLegendGroupString);

        var rawLegendGroup;// a raw string with {, ::, and group set info
        var pureLegendGroup;// a pure legend string with group set info removed
        var i;
        var swap;

        var groupSetName = "";
        var groupSetDesc = "";

        var isInGroupSet = false;

        for (i = 0; i < arrLegendGroupString.length; i++) {
            rawLegendGroup = arrLegendGroupString[i];
            //tf.GetDebug().LogIfTest("Raw legend group is :", rawLegendGroup);

            // is group set begin
            if (rawLegendGroup.substr(0, 1) == "{") {
                // A GroupSet Begins, the beginning section
                //tf.GetDebug().LogIfTest("{ found");
                isInGroupSet = true;
                rawLegendGroup = rawLegendGroup.substr(1);

                var tempArray = rawLegendGroup.split("::");

                if (tempArray.length > 1) {
                    groupSetName = tempArray[0];
                    pureLegendGroup = tempArray[1];
                    //
                    tempArray = groupSetName.split(":");
                    groupSetName = tempArray[0];
                    if (tempArray.length == 2) {
                        groupSetDesc = tempArray[1];
                    }
                    else {
                        groupSetDesc = tempArray[0];
                    }
                    //tf.GetDebug().LogIfTest("groupSetName", groupSetName, "groupSetDesc", groupSetDesc);
                }
                else {
                    // Not in a GroupSet
                    groupSetName = "";
                    groupSetDesc = "";
                    pureLegendGroup = rawLegendGroup;
                }
            }
            else if (isInGroupSet) {
                // In a GroupSet, not the beginning section
                pureLegendGroup = rawLegendGroup;
            }
            else {
                // Not in a GroupSet
                groupSetName = "";
                groupSetDesc = "";
                pureLegendGroup = rawLegendGroup;
            }


            // // is group set end
            if (pureLegendGroup.substr(pureLegendGroup.length - 1, 1) == "}") {
                //tf.GetDebug().LogIfTest("} found");
                pureLegendGroup = pureLegendGroup.substr(0, pureLegendGroup.length - 1);
                isInGroupSet = false;
            }
            //tf.GetDebug().LogIfTest("\nPure legend group is:", pureLegendGroup);

            //tempArray = arrLegendGroupString[i].split("@");
            tempArray = pureLegendGroup.split("@");
            var groupLabelAndDesc = tempArray[0];

            // group LABEL, DESC and IS_CHECK
            var group = {};

            group.ISCHECK = false;
            group.LABEL = "";
            group.DESC = "";
            group.VALUE = "";
            group.GRSET = groupSetName;
            group.GRDESC = groupSetDesc;

            /*
            group.MAX_LVL = -1; // Max level
            group.MIN_LVL = 99; // Min level
            */
            group.MAX_RES = -1.0; // Max resolution
            group.MIN_RES = 10e10; // Min resolution

            group.COMPOSITES = []; // Container of composite parts

            //tf.GetDebug().LogIfTest(groupLabelAndDesc);

            // is check
            if (groupLabelAndDesc.substr(0, 1) == "~") {
                group.ISCHECK = true;
                groupLabelAndDesc = groupLabelAndDesc.substr(1, groupLabelAndDesc.length);
            }

            // get label and description
            var index = groupLabelAndDesc.indexOf(":");
            if (index > 0)
                // has both label and description
            {
                group.LABEL = groupLabelAndDesc.substring(0, index);
                group.DESC = groupLabelAndDesc.substring(index + 1, groupLabelAndDesc.length);
            }
                // label only, description = label
            else {
                group.LABEL = groupLabelAndDesc;
                group.DESC = group.LABEL;
            }

            // replace "_" in label
            index = group.LABEL.indexOf("_");
            var spaceReplace;
            var j;
            if (index >= 0) {
                spaceReplace = group.LABEL.split("_");
                group.LABEL = "";
                for (j = 0; j < spaceReplace.length ; j++) {
                    //tf.GetDebug().LogIfTest(spaceReplace[j]);
                    group.LABEL = group.LABEL + spaceReplace[j] + " ";
                }
            }

            index = group.DESC.indexOf("_");
            if (index >= 0) {
                spaceReplace = group.DESC.split("_");
                group.DESC = "";
                for (j = 0; j < spaceReplace.length ; j++) {
                    //tf.GetDebug().LogIfTest(spaceReplace[j]);
                    group.DESC = group.DESC + spaceReplace[j] + " ";
                }
            }

            //tf.GetDebug().LogIfTest("LABEL:\t", group.LABEL);
            //tf.GetDebug().LogIfTest("DESC:\t", group.DESC);
            //tf.GetDebug().LogIfTest("GRSET:\t", group.GRSET);

            // group VALUE
            //var groupValueRaw:Array = groupParameters[1].split("%2B");
            //tf.GetDebug().LogIfTest("VALUE:\t", tempArray[1]);

            if (tempArray.length > 1) {
                var arrGroupLayerString = (tempArray[1]).split("+");
                for (j = 0; j < arrGroupLayerString.length; j++) {
                    var currentPartString = arrGroupLayerString[j];
                    var currentParts = currentPartString.split("-");
                    var partsCount = currentParts.length;

                    var composite = new Object;
                    composite.MODE = "";
                    composite.PREFIX = "";
                    composite.VALUE = "";
                    composite.SUFFIX_M = "";
                    composite.SUFFIX_H = "";
                    composite.MIN = 10e10;
                    composite.MAX = -1;

                    if (partsCount == 1)
                        // e.g. street.l_
                    {
                        composite.PREFIX = currentPartString;
                        composite.VALUE = currentPartString;
                        composite.MIN = -1;
                        composite.MAX = 150;
                        composite.MODE = "RES";
                    }
                    else if (partsCount == 2)
                        // downward compatible
                    {
                        //tf.GetDebug().LogIfTest("downward compatible", currentPartString);
                        composite.PREFIX = currentPartString;
                        composite.VALUE = currentPartString;
                        var digitMin = currentParts[1].substr(0, 1);
                        var digitMax = currentParts[1].substr(1, 1);

                        //tf.GetDebug().LogIfTest("downward compatible", digitMin, digitMax);

                        if (digitMin == "_") {
                            composite.MIN = 0;
                        }
                        else {
                            composite.MIN = Math.pow(2, (parseInt(digitMin, 10)));
                            if (composite.MIN > 150) composite.MIN = 150;
                        }

                        if (digitMax == "_") {
                            composite.MAX = 0.999;
                        }
                        else {
                            composite.MAX = Math.pow(2, (parseInt(digitMax, 10) + 1)) - 0.001;
                            if (composite.MAX > 150) composite.MAX = 150;

                        }

                        composite.MODE = "RES";
                    }
                    else if ((partsCount == 3) || (partsCount == 4))
                        // e.g. flpropertiesyear-0-0.15
                    {
                        // prefix
                        composite.PREFIX = currentParts[0] + "-" + currentParts[1] + "-" + currentParts[2] + "-";
                        composite.VALUE = currentParts[0];

                        // min
                        composite.MODE = "RES";
                        composite.MIN = parseFloat(currentParts[1]);
                        composite.MAX = parseFloat(currentParts[2]);

                        if (composite.MIN > composite.MAX) {
                            swap = composite.MIN;
                            composite.MIN = composite.MAX;
                            composite.MAX = swap;
                        }

                        // suffix
                        if (partsCount == 4) {
                            var suffixs = currentParts[3].split("||");
                            composite.SUFFIX_H = suffixs[0];
                            composite.SUFFIX_M = (suffixs.length == 2) ? suffixs[1] : suffixs[0];
                        }
                        else {
                            composite.SUFFIX_H = composite.SUFFIX_M = "";
                        }
                    }
                    else {
                        //tf.GetDebug().LogIfTest("error", currentPartString);
                    }

                    //tf.GetDebug().LogIfTest(composite.MODE, composite.MIN, composite.MAX, composite.PREFIX, composite.SUFFIX_H, composite.SUFFIX_M);

                    group.MAX_RES = (composite.MAX > group.MAX_RES) ? composite.MAX : group.MAX_RES; // Max resolution
                    group.MIN_RES = (composite.MIN < group.MIN_RES) ? composite.MIN : group.MIN_RES; // Min resolution

                    if (group.VALUE == "") {
                        group.VALUE = composite.VALUE;
                    }
                    else {
                        group.VALUE += ("%2B" + composite.VALUE);
                    }

                    group.COMPOSITES.push(composite);
                } //end of loop j
                legendSet.push(group);
            }
        } // end of loop (i)

        legendSet.reverse();

        var legendSetLen = legendSet.length;

        var groupSetNames = [];

        for (var i = 0 ; i < legendSetLen ; i++) {
            var thisItem = legendSet[i];
            var groupSetName = thisItem.GRSET;

            if (groupSetName === "") {
                groupSetName = groupSetRootName;
            }

            var thisGRSet = grSet[groupSetName];

            if (!thisGRSet) { grSet[groupSetName] = {}; thisGRSet = grSet[groupSetName]; groupSetNames.push(groupSetName); }

            if (!thisGRSet.items) { thisGRSet.items = []; }

            thisGRSet.items.push(thisItem);

        }

        return {
            "legendSet": legendSet,
            "groupSet": grSet,
            "groupSetNames": groupSetNames
        }
    }
}