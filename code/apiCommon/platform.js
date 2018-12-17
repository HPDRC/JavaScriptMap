"use strict";

// tf.platform

tf.platform.TestURL = "http://experiment2.cs.fiu.edu/hterramap/test/";
tf.platform.StageURL = "http://experiment2.cs.fiu.edu/hterramap/stage/";
tf.platform.ProdURL = "http://tfcore.cs.fiu.edu/hterramap/";
tf.platform.LocalURL = "http://localhost/terramap/";
tf.platform.isKnown = false;

/**
 * @public
 * @function
 * @summary - Retrieves the URL of this platform of the <b>TerraFly API</b>
* @returns {string} - | {@link string} the URL string
*/
tf.platform.GetURL = function () {

    function getURLOfScript (scriptFileName) {
        var scriptURL;

        if (typeof scriptFileName === "string") {
            var scriptElements = document.getElementsByTagName('script');
            var i, element;

            for (i = 0; element = scriptElements[i]; ++i) {
                var myfile = element.src, index = myfile.indexOf(scriptFileName);
                if (index >= 0) { scriptURL = myfile.substring(0, index); break; }
            }
        }
        return scriptURL;
    }

    function findURL() {
        var url = getURLOfScript("mapapi.js");
        if (url !== undefined) {
            if (tf.platform.isKnown = (url.indexOf('test') >= 0)) { url = tf.platform.TestURL; }
            else if (tf.platform.isKnown = (url.indexOf('stage') >= 0)) { url = tf.platform.StageURL; }
            else if (tf.platform.isKnown = (url.indexOf('tfcore') >= 0)) { url = tf.platform.ProdURL; }
        }
        if (!tf.platform.isKnown) { url = '';/*url = tf.platform.TestURL;*/ tf.platform.isKnown = false; }
        return url;
    }

    if (tf.platform.PlatformURL == undefined) {
        tf.platform.PlatformURL = findURL();
    }
    return tf.platform.PlatformURL;
}

/**
 * @public
 * @function
 * @summary - Checks if this is a known platform of the <b>TerraFly API</b>
* @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.platform.GetIsKnown = function () { tf.platform.GetURL(); return tf.platform.isKnown; }

/**
 * @public
 * @function
 * @summary - Checks if this is the Test platform of the <b>TerraFly API</b>
* @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.platform.GetIsTest = function () { return tf.platform.GetURL() == tf.platform.TestURL || !tf.platform.isKnown; }

/**
 * @public
 * @function
 * @summary - Checks if this is the Stage platform of the <b>TerraFly API</b>
* @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.platform.GetIsStage = function () { return tf.platform.GetURL() == tf.platform.StageURL; }

/**
 * @public
 * @function
 * @summary - Checks if this is the Production platform of the <b>TerraFly API</b>
* @returns {boolean} - | {@link boolean} <b>true</b> if yes, <b>false</b> otherwise
*/
tf.platform.GetIsProduction = function () { return tf.platform.GetURL() == tf.platform.ProdURL; }

