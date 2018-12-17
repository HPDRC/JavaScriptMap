"use strict";

/**
 * A <b>singleton</b> is an instance of a class designed to create only a single instance of itself. Singletons are usually obtained by calling an API function,
 * e.g. {@link tf.GetDocMouseListener} to obtain the applications' [Doc Mouse Listener]{@link tf.events.DocMouseListener} singleton, or 
 * {@link tf.GetStyles} to obtain the application's [Styles]{@link tf.styles.Styles} singleton
 * @public
 * @typedef {singleton} singleton
 */

/**
 * <b>*</b> can be any JavaScript value or object
 * @public
 * @typedef {*} *
 */

/**
 * <b>undefined</b> is an invalid value for JavaScript objects
 * @public
 * @typedef {undefined} undefined
 */

/**
 * <b>null</b> is an invalid value for JavaScript objects
 * @public
 * @typedef {null} null
 */

/**
 * <b>void</b> means no value, it can be either {@link null} of {@link undefined}, and evaluates to <b>false</b> in logical expressions
 * @public
 * @typedef {void} void
 */

/**
 * boolean variables contain either a <b>true</b> or a <b>false</b> value
 * @public
 * @typedef {boolean} boolean
 */

/**
 * number variables contain <b>numeric</b> values like 0, -4.3, or 100
 * @public
 * @typedef {number} number
 */

/**
 * character variables are strings with a single character
 * @public
 * @typedef {string} character
 */

/**
 * string variables contain <b>sequences of characters</b>, like 'this is a test', or "I am a string"
 * @public
 * @typedef {string} string
 */

/**
 * <b>RegExp</b> is a standard JavaScript regular expression
 * @public
 * @typedef {RegExp} RegExp
 */

/**
 * A color component assuming values between 0 and 255, in a <b>"darkest"</b> to <b>"brightest"</b> scale
 * @public
 * @typedef {number} tf.types.rgbColorComponent
 */

/**
 * An object containing the red, green, and blue [components]{@link tf.types.rgbColorComponent} of a color
 * @public
 * @typedef {object} tf.types.rgbColorComponents
 * @property {tf.types.rgbColorComponent} r - the red color component
 * @property {tf.types.rgbColorComponent} g - the green color component
 * @property {tf.types.rgbColorComponent} b - the blue color component
 */

/**
 * A deprecated {@link string} representation of a {@link hexColor} with a '0x' prefix followed by 6 hexadecimal digits. Example: '0x876543'
 * @public
 * @typedef {string} deprecatedColor
 * @deprecated use {@link hexColor} or {@link color} instead
 */

/**
 * JavaScript [colors]{@link color} represented in {@link string} format with a '#' prefix followed by 3 or 6 hexadecimal digits. Examples: "#f0f" and '#876543'
 * @public
 * @typedef {color} hexColor
 */

/**
 * JavaScript [colors]{@link color} represented in {@link string} format with red, green, and blue components, each assuming values between 0 and 255. Examples: "rgb(0, 0, 0)" and 'rgb(128, 240, 255)'
 * @public
 * @typedef {color} rgbColor
 */

/**
 * JavaScript [colors]{@link color} represented as a string with red, green, and blue components, each assuming values between 0 and 255, followed by an [opacity01]{@link tf.types.opacity01} component.
 * Examples: "rgba(0, 0, 0, 0)", "rgba(0, 255, 0, 0.4)", and 'rgba(128, 240, 255, 1)'
 * @public
 * @typedef {color} rgbaColor
 */

/**
 * JavaScript colors represented in {@link string} format without alpha (transparency) information. Examples: "#fff", '#876543', and 'rgb(255, 0, 129)'
 * @public
 * @typedef {string} color
 */

/**
 * JavaScript colors represented in {@link string} format with or without alpha (transparency) information. Examples: "#fff", '#876543', 'rgb(255, 0, 129)', and 'rgba(255, 0, 129, 0.5)'
 * @public
 * @typedef {string} colorWithOptionalAlpha
 */

/**
 * A JavaScript <b>array</b>, like <b>[0, 0]</b>
 * @public
 * @typedef {array} array
 */

/**
 * A JavaScript <b>object</b>, like <b>{ property1: "value1", property2: value2 }</b>
 * @public
 * @typedef {object} object
 */

/**
 * A JavaScript <b>function</b>
 * @public
 * @typedef {function} function
 */

/**
 * A JavaScript <b>enumerable</b>, is either an {@link array} or an {@link object} whose properties can be enumerated in a JavaScript <b>for(var i in {@link enumerable})</b> loop. 
 * Use of {@link enumberable} provides API functions the flexibility of not distinguishing between {@link array} and {@link object} parameters when processing lists of data
 * It is important that applications follow acceptable JavaScript programming practices, and preserve the integrity of JavaScript {@link array} and {@link object} prototypes,
 * to avoid introducing extraneous enumerable items into these classes.
 * @public
 * @typedef {enumerable} enumerable
 */

/**
 * A JavaScript <b>Date</b> object
 * @public
 * @typedef {Date} Date
 */

/**
 * A JavaScript <b>DOMEvent</b> is an {@link object} associated with Browser and {@link HTMLElement} events. Some of its properties vary from browser to browser.
 * During notifications instances of this type are reported back to event listeners created with the API function {@link tf.events.AddDOMEventListener}
 * @public
 * @typedef {DOMEvent} DOMEvent
 */

/**
 * A JavaScript <b>HTMLNode</b> {@link object}, is a component part of the HTML Document Object Model, like <b>document</b>, <b>head</b>, and <b>body</b>
 * @public
 * @typedef {HTMLNode} HTMLNode
 */

/**
 * A JavaScript <b>HTMLElement</b> {@link object}, like the ones obtained by calling <b>document.getElementById(elementIdStr)</b>
 * @public
 * @typedef {HTMLElement} HTMLElement
 */

/**
 * One of: <br>- an {@link HTMLElement},<br>- a {@link string} containing an {@link HTMLElement} id,<br>- or any JavaScript {@link object} equipped with a function named <b>GetHTMLElement()</b> returning an {@link HTMLElement}
 * @public
 * @typedef {HTMLElementLike} HTMLElementLike
 */

/**
 * One of: <br>- an {@link HTMLElement},<br>- a {@link string} with HTML content,<br>- or any JavaScript {@link object} equipped with a function named <b>GetHTMLElement()</b> returning an {@link HTMLElement}
 * @public
 * @typedef {HTMLContent} HTMLContent
 */

/**
 * A string denoting the size of an HTML element using one of the standard formats: "10px", "5em", "15%", etc.
 * @public
 * @typedef {string} HTMLElementSize
 */

/**
 * Either a [string]{@link HTMLElementSize] denoting the size of an HTML element or a {@link number} interpreted as pixel dimensions
 * @public
 * @typedef {HTMLElementSize|number} HTMLElementSizeOrPxNumber
 */

/**
 * <b>canvasContext</b> is the pre-defined HTML5 canvas context component, used on drawing operations, and obtainable by calling getContext() on a {@link canvas}
 * @public
 * @typedef {object} canvasContext
 */

/**
 * <b>canvas</b> is the pre-defined HTML5 canvas component, used on drawing operations, and obtainable by calling document.createElement('canvas'), or by using the HTML <b>canvas</b> tag
 * @public
 * @typedef {object} canvas
 */

/**
 * An Easing Function takes an argument between 0 and 1 and returns a value also between 0 and 1. 
 * Easing functions are used to modify the rate at which a value changes. For example: 
 * returning the square of an argument that varies linearly from 0 to 1 causes the rate of change
 * to start slowly and accelerate as the argument approaches 1
 * @public
 * @typedef {function} tf.types.EasingFunction
 * @param {tf.types.value01} t - the input value
 * @return {tf.types.value01} - | {@link tf.types.value01} the output value
 */

/**
 * A floating point number from 0 to 1 inclusive
 * @public
 * @typedef {number} tf.types.value01
 */

/**
 * A floating point number from 0 to 1 inclusive representing an opacity value, where 0 means completely transparent and 1 means completely opaque
 * @public
 * @typedef {number} tf.types.opacity01
 */

/**
 * A floating point number from 0 to 100 inclusive representing an opacity value, where 0 means completely transparent and 100 means completely opaque
 * @public
 * @typedef {number} tf.types.opacity0100
 */

/**
 * Pixel coordinates in array format <b>[ {@link number}, {@link number} ]</b>, horizontal coordinate in index 0, vertical coordinate in index 1
 * @public
 * @typedef {array} tf.types.pixelCoordinates
 */

/**
 * One of the geometry types supported by the GeoJSON format: <b>"Point"</b>, <b>"LineString"</b>, <b>"Polygon"</b>, <b>"MultiPoint"</b>, <b>"MultiLineString"</b>, and <b>"MultiPolygon"</b>.
 * Used in the creation of [Map Feature Geometries]{@link tf.map.FeatureGeom}
 * @public
 * @typedef {string} tf.types.GeoJSONGeometryType
 */

/**
 * An array, or arrays nested into arrays, of [Map Coordinates]{@link tf.types.mapCoordinates}, depending on the value of its associated [Geometry Type]{@link tf.types.GeoJSONGeometryType}.
 * Used in the creation of [Map Feature Geometries]{@link tf.map.FeatureGeom}
 * @public
 * @typedef {array<tf.types.mapCoordinates>|array<array<tf.types.mapCoordinates>>} tf.types.GeoJSONGeometryCoordinates
 */

/**
 * An object containing GeoJSON geometry properties.
 * Used in the creation of [Map Feature Geometries]{@link tf.map.FeatureGeom}
 * @public
 * @typedef {object} tf.types.GeoJSONGeometry
 * @property {tf.types.GeoJSONGeometryType} type - the type
 * @property {tf.types.GeoJSONGeometryCoordinates} coordinates - the coordinates
 */

/**
 * A callback capable of extracting [GeoJSON Geometry]{@link tf.types.GeoJSONGeometry} from a JavaScript {@link object} in a format other than standard GeoJSON Feature Lists
 * @public
 * @callback tf.types.GetGeoJSONGeometryCallBack
 * @param {tf.map.Feature} mapFeature - the map feature to show
 * @returns {void} - | {@link void} no return value
 * @see {@link tf.types.MapContinueAnimation}
 */

/**
 * A {@link string} that uniquely identifies a property assigned to a JavaScript {@link object} 
 * @public
 * @typedef {string} tf.types.PropertyName
 * @see [Known API Properties]{@link tf.types.KnownAPIPropertyName}
 */

/**
 * A {@link string} that uniquely identifies a property assigned to a JavaScript {@link object} 
 * @public
 * @typedef {string} tf.types.PropertyName
 * @see [Known API Properties]{@link tf.types.KnownAPIPropertyName}
 */

/**
 * A {@link string} in url encoded format containing the most of the properties found in [URLParameters]{@link tf.types.URLParameters}, 
 * usually obtained directly from the <b>window.location.href</b> string without further processing. Examples: "http://domain.ext/#property1=value1&property2=value2",
 * "http://domain.ext/file.html?property1=value1&property2=value2", "#property1=value1&property2=value2"
 * @public
 * @typedef {string} tf.types.URLParametersString
 * @see [URL Parameter Summary]{@link http://experiment2.cs.fiu.edu/hterramap/test/URLParameters.htm}
 */

/**
 * An {@link object} with [URLParameters]{@link tf.types.URLParameters} properties
 * @public
 * @typedef {object} tf.types.URLParametersObject
 * @see [URL Parameter Summary]{@link http://experiment2.cs.fiu.edu/hterramap/test/URLParameters.htm}
 */

/**
 * Definitions of map and application behavior in [string]{@link tf.types.URLParametersString} or [object]{@link tf.types.URLParametersObject} format
 * @public
 * @typedef {object} tf.types.URLParameters
 * @property {tf.types.mapEngine} - {@link tf.consts.paramNameFMap} - the Map Engine to use
 * @property {tf.types.latitude} - {@link tf.consts.paramNameLat} - the initial map center latitude coordinate
 * @property {tf.types.longitude} - {@link tf.consts.paramNameLon} - the initial map center latitude coordinate
 * @property {tf.types.mapResolution} - {@link tf.consts.paramNameRes} - the initial map resolution
 * @property {tf.types.mapLevel} - {@link tf.consts.paramNameLevel} - the initial map level, ignored if <b>resolution</b> is defined
 * @property {tf.types.mapPanelNamesString} - {@link tf.consts.paramNamePanels} - the initial visibility of [map panels]{@link tf.types.mapPanelNamesString}
 * @property {string} - {@link tf.consts.paramNameAddress} - the initial contents of the map's address bar
 * @property {string} - {@link tf.consts.paramNameHelp} - the contents of the help message displayed by the map
 * @property {string} - {@link tf.consts.paramNameVid} - a string used by the map when interacting with some TerraFly services
 * @property {string} - {@link tf.consts.paramNamePassThrough} - a string used by the map when interacting with some TerraFly services
 * @property {string} - {@link tf.consts.paramNameTFLogo} - whether the TerraFly logo is displayed by the map <b>1</b> for yes, <b>0</b> for no
 * @property {tf.types.mapType} - {@link tf.consts.paramNameType} - the initial map type
 * @property {tf.types.mapType} - {@link tf.consts.paramNameSource} - the initial map source
 * @property {number} - {@link tf.consts.paramNameMessageTimeout} - the number of seconds before the map's Message Popup closes itself
 * @property {tf.types.legendString} - {@link tf.consts.paramNameLegend}- the legend string for Mapnik 1.0 used by the map's Base Layers
 * @property {tf.types.legendString} - {@link tf.consts.paramNameLegendH} - the hybrid legend string for Mapnik 2.0 used by the map's Base Layers
 * @property {tf.types.legendString} - {@link tf.consts.paramNameLegendM} - the Map legend string for Mapnik 2.0 used by the map's Base Layers
 * @property {string} - {@link tf.consts.paramNameApps} - the optional name of a the native TerraFly API application to be executed. Currently {@link tf.consts.appNameRAMB} is supported
 * @property {string} - {@link tf.consts.paramNameAppSpecs} - an optional file name containing additional specifications
 * @property {number} - {@link tf.consts.paramNameDLExtent} - an optional numeric parameter that, when present, determines the minimum number of records of the first DLayer that must initially be displayed either by zooming out or by re-centering the map, or a combination of both
 * @property {string} - {@link tf.consts.paramNameDLLegend} - the name of a [DLayer]{@link tf.urlapi.DLayer}, <b>DLayer</b> parameter names always end with a number
 * identifying the dlayer instance referred by the parameter
 * @property {string} - {@link tf.consts.paramNameDLData} - the remote service associated with a [DLayer]{@link tf.urlapi.DLayer}
 * @property {string} - {@link tf.consts.paramNameDLField} - the [DLayer]{@link tf.urlapi.DLayer} field to display as a [Map Feature]{@link tf.map.Feature}
 * @property {string} - {@link tf.consts.paramNameDLSelect} - the initial map visibility of a [DLayer]{@link tf.urlapi.DLayer}
 * @property {string} - {@link tf.consts.paramNameDLColor} - the color with which to display text markers belonging to a [DLayer]{@link tf.urlapi.DLayer}
 * @see [URL Parameter Summary]{@link http://experiment2.cs.fiu.edu/hterramap/doc/URLParameters.htm}
*/

/**
 * Legend strings control the type of information the [Map]{@link tf.map.Map} requests from the [Map Engine]{@link tf.types.mapEngine}. 
 * Legend strings are defined with the following syntax:<br>
 * <pre>
 * Legend =
 * $$http://vn4.cs.fiu.edu//wm$$
 * {//groupSet begin
 *    (~) &ltgroupSetName&gt : &ltgroupSetDesc&gt ::
 *    (~) &ltgroupName&gt : &ltgroupDesc&gt //Group begin
 *        @ &ltcompositeName1&gt - &ltmin&gt - &ltMax&gt - ( &ltmode&gt ) +
 *        &ltcompositeName2&gt - &ltmin&gt - &ltmax&gt - ( &ltmode&gt )
 *        ( + other composites ); //Group end
 *        (other groups;)
 * };//groupSet end
 * (other {groupSets}; or groups;)
 *
 * <table>
 *  <tr><th style="width: 1px;white-space:nowrap;">Elements</th><th>Description</th></tr>
 *  <tr><td style="width: 1px;white-space:nowrap;">&ltgroupSetName&gt</td><td>The name of the groupSet</td></tr>
 *  <tr><td style="width: 1px;white-space:nowrap;">&ltgroupSetDesc&gt</td><td>The description of the groupSet, shown as a tooltip</td></tr>
 *  <tr><td style="width: 1px;white-space:nowrap;">&ltgroupName&gt</td><td>The label of the group, different groups have different labels</td></tr>
 *  <tr><td style="width: 1px;white-space:nowrap;">&ltgroupDesc&gt</td><td>The detail of the group, shown as a tooltip</td></tr>
 *  <tr><td style="width: 1px;white-space:nowrap;">&ltcompositeName&gt</td><td>The name of the legend composite</td></tr>
 *  <tr><td style="width: 1px;white-space:nowrap;">&ltmin&gt</td><td>The minimum resolution to show this composite's content</td></tr>
 *  <tr><td style="width: 1px;white-space:nowrap;">&ltmax&gt</td><td>The maximum resolution to show this composite's content</td></tr>
 *  <tr><td style="width: 1px;white-space:nowrap;">&ltmode&gt</td><td>The mode of current composite</td></tr>
 *  <tr><td style="width: 1px;white-space:nowrap;">{};</td><td>groupSets are enclosed in braces</td></tr>
 *  <tr><td style="width: 1px;white-space:nowrap;">;</td><td>Separates groups</td></tr>
 *  <tr><td style="width: 1px;white-space:nowrap;">~</td><td>Prefix symbol denoting that the groupSet (or group) is pre-checked</td></tr>
 *  <tr><td style="width: 1px;white-space:nowrap;">::</td><td>Separates groupSet name and description from its sub-items</td></tr>
 *  <tr><td style="width: 1px;white-space:nowrap;">@</td><td>Separates groupSet name and description from its composites</td></tr>
 *  <tr><td style="width: 1px;white-space:nowrap;">:</td><td>Separates a groupSet or group name from its description</td></tr>
 *  <tr><td style="width: 1px;white-space:nowrap;">+</td><td>Separates composites</td></tr>
 *  <tr><td style="width: 1px;white-space:nowrap;">-</td><td>Separates composite values</td></tr>
 *</table>
 * <b>Notes:</b>
 *
 * 1. groupSet: A container of groups, groupSets cannot be nested.
 *
 * 2. Elements enclosed in parenthesis are optional.
 *
 * 3. Items are shown in the Base Layers popup and on a Map whose current resolution is between <b>min</b> and <b>max</b>.
 *
 * 4. The prefix <b>~</b> can be used divide groups into default visible and invisible ranges, e.g.
 *
 *    <b>~owner : Property_owner @ flpropertiesowner-0-0.5-;</b>
 *    <b>owner : Property_owner @ flpropertiesowner-0.5-8-;</b>
 *
 *    the "owner" group is made visible by default in the resolution range from 0 to 0.5, and invisible by default in the 0.5 to 8 range.
 * </pre>
 * @public
 * @typedef {string} tf.types.legendString
*/
