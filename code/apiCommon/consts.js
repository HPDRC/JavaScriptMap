"use strict";

/*if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (obj, fromIndex) {
        fromIndex = tf.js.GetNonNegativeIntFrom(fromIndex);
        for (var i = fromIndex, j = this.length; i < j; ++i) {
            if (this[i] === obj) return i;
        }
        return -1;
    };
}*/

tf.consts.URLAPIDocumentTitle = "TerraMap";

tf.consts.MVideoDocumentTitle = "Data Mapper";

tf.consts.TimeSeriesDocumentTitle = "TerraFly - TimeSeries";

tf.consts.MLSDocumentTitle = "TerraFly MLS Search";
tf.consts.MLSDocumentTitle2 = "Search Tool for S Florida Real Estate Powered by TerraFly";

tf.consts.urlPartsSeparatorStr = "$$";

/**
 * @public
 * @description default map center latitude
*/
tf.consts.defaultLatitude = 25.75869;
tf.consts.minLatitude = -90.0;
tf.consts.maxLatitude = 90.0;
tf.consts.latitudeRange = tf.consts.maxLatitude - tf.consts.minLatitude;

/**
 * Latitude values, between -90 and 90 degrees, in the World Geodetic System, "EPSG:4326"
 * @public
 * @typedef {number} tf.types.latitude
 */

/**
 * @public
 * @description default map center longitude
*/
tf.consts.defaultLongitude = -80.37388;
tf.consts.minLongitude = -180.0;
tf.consts.maxLongitude = 180.0;
tf.consts.longitudeRange = tf.consts.maxlongitude - tf.consts.minlongitude;

/**
 * Longitude values, between -180 and 180 degrees, in the World Geodetic System, "EPSG:4326"
 * @public
 * @typedef {number} tf.types.longitude
 */

/**
 * @public
 * @description default map center coordinates
*/
tf.consts.defaultMapCenter = [tf.consts.defaultLongitude, tf.consts.defaultLatitude];

/**
 * @public
 * @description default map resolution (2.4)
*/
tf.consts.defaultRes = 2.4;

/**
 * Map resolution is closely related with {@link tf.types.mapLevel}. 
 * The [default map resolution]{@link tf.consts.defaultRes} corresponds to the [default level]{@link tf.consts.defaultLevel}
 * The unit of Map resolution values is <b>meters per pixel</b>
 * @public
 * @typedef {number} tf.types.mapResolution
 */

/**
 * @public
 * @description default map level (16)
*/
tf.consts.defaultLevel = 16;
/**
 * @public
 * @description maximum map level (24)
*/
tf.consts.maxLevel = 24;
/**
 * @public
 * @description minimum map level (1)
*/
tf.consts.minLevel = 1;

/**
 * Map levels are sometimes called zoom levels; incrementing / decrementing the map level doubles / halves the map's resolution.
 * Valid values are in the range of [minLevel]{@link tf.consts.minLevel} to [maxLevel]{@link tf.consts.maxLevel}. Map level
 * defaults to [defaultLevel]{@link tf.consts.defaultLevel}
 * See {@link tf.types.mapResolution}
 * @public
 * @typedef {number} tf.types.mapLevel
 */

/*
~osm-lines:Roads_from_Open_Street_Maps@osm_roads-0-7000;
~osm-names:Road_names_from_Open_Street_Maps@osm_road_names-0-240;
~osm-buildings:Building_data_from_Open_Street_Maps@osm_buildings-0-7;
~osm-place-names:Place_names_from_Open_Street_Maps@osm_place_names-0-30000;
~osm-water:Water_data_from_Open_Street_Maps@osm_water-0-4000;
~osm-land:Land_from_Open_Street_Maps@osm_land-0-30000;
~osm-land-use:Land_use_from_Open_Street_Maps@osm_landuse-0-30000;

~osm-land-use:Land_use_from_Open_Street_Maps@osm_landuse-0-30000;~osm-land:Land_from_Open_Street_Maps@osm_land-0-30000;~osm-water:Water_data_from_Open_Street_Maps@osm_water-0-4000;~osm-place-names:Place_names_from_Open_Street_Maps@osm_place_names-0-30000;~osm-buildings:Building_data_from_Open_Street_Maps@osm_buildings-0-7;~osm-names:Road_names_from_Open_Street_Maps@osm_road_names-0-240;~osm-lines:Roads_from_Open_Street_Maps@osm_roads-0-7000;
*/

tf.consts.defaultTFLogoOn = true;

/**
 * @public
 * @description default Mapnik 1.0 Map [Legend String]{@link tf.types.legendString}
*/
tf.consts.defaultLegend = "$$http://vn4.cs.fiu.edu/defaultmap$$";

//tf.consts.defaultLegendH = "{Cities::~Capitals:Capitals_WorldMap@wm_Capitals-120-6000;Capitals:Capitals_WorldMap@wm_Capitals-6000-15000;~Metro:Big_Cities_over_million_WorldMap@wm_Cities_Greater_900K-120-5000;Metro:Big_Cities_over_million_WorldMap@wm_Cities_Greater_900K-5000-15000;~Cities:Cities_WorldMap@wm_Cities_75K_to_900K-120-2400+wm_Cities_Greater_900K-120-2400+wm_Cities_Unknownpop-120-2400;Cities:Cities_WorldMap@wm_Cities_75K_to_900K-2400-15000+wm_Cities_Greater_900K-2400-15000+wm_Cities_Unknownpop-2400-15000;};{Hubs::~Ports:Marine_Ports_WorldMap@wm_Marine_Ports-120-360;Ports:Marine_Ports_WorldMap@wm_Marine_Ports-360-2000;~Railway:Railway_Stations_WorldMap@wm_Railway_Stations-120-240;~Airports:Airports_WorldMap@wm_Airports-120-240;};{Water::Bays:Seas_and_Bays_WorldMap@wm_Seas_Bays-120-2000;Glaciers:Glaciers_WorldMap@wm_Glacier-120-4000;~Rivers_B:Lake_and_River_contours_WorldMap@wm_Water_Poly-120-500;~Great_Lakes_L:Great_Lakes_labels_WorldMap@WM_GREAT_LAKES_NAME-120-4000;~Great_Lakes_B:Great_Lakes_contours_WorldMap@wm_Great_Lakes-120-4000;osm-water:Water_data_from_Open_Street_Maps@osm_water-0-4000;};{Regions::~Admin_L:States_and_Provinces_names_labeled_WorldMap@wm_World_Admin_name-120-2000;~Admin_B:States_and_Provinces_boundaries_WorldMap@wm_World_Admin-120-2000;~Countries_L:Nation_names_labeled_WorldMap@nation_name-2000-5000;Countries_L:Nation_names_labeled_WorldMap@nation_name-5000-30000;~Countries_B:Nations_boundaries_WorldMap@wm_World_Nations-120-15000;osm-admin:Administrative_boundary_data_from_Open_Street_Maps@osm_admin-0-60000;};{Parcels::~owner:Property_owner@flpropertiesowner-0-0.5;year_built:Year_property_built_or_renovated@flpropertiesyear-0-0.5;size:Sizes_of_property_interior_and_lot@flpropertiessize-0-0.5;appraisal:Property_value@flpropertiesvalue-0-0.5;~lines:Property_lines,_from_First_American@fa_parcel-0-1;lines:Property_lines,_from_First_American@fa_parcel-1-2;MLS_Real_estate:MLS_listings_for_sale_and_rent_in_Miami_area@re1n-0-5+re2n-0-5+rntn-0-5+rinn-0-5+rldn-0-5;osm-buildings:Building_data_from_Open_Street_Maps@osm_buildings-0-7;};{People::population:People_per_block_per_Census_2000@blk_pop-0-5;income:Aggregate_Neighborhood_Income_and_number_of_homes,_per_Census-2000@bg_mhinc-0.7-10;};{Services::~business:Yellow_Pages@nypages-0-1.2;business:Yellow_Pages@nypages-1.2-5;food:Restaurants_from_NavTeq@nv_restrnts-0-10;doctors:Physicians_specialties@physicianspecialty-0-5;};Landmarks:Cultural_Landmarks_WorldMap@wm_Cultural_Landmarks-120-1800;Utilities:Utilities_WorldMap@wm_Utilities-120-720;Environment:Hydrology@prism-0-120;~Places:Places@gnis2-0-6+hotels-0-6;Places:Places@gnis2-6-24+hotels-6-24;OSM-place-names:Place_names_from_Open_Street_Maps@osm_place_names-0-30000;{Road::~navteq-lines:Roads,_and_streets@street-5-2000;navteq-lines:Roads,_and_streets@street-0-5;~navteq-names:Roads,_and_streets@street_names-0-240;osm-lines:Open_Street_Maps@osm_roads-0-7000;osm-names:Open_Street_Maps@osm_road_names-0-240;~routes:Routes_WorldMap@wm_Major_Routes-120-1000+wm_Minor_Routes-120-1000;routes:Routes_WorldMap@wm_Major_Routes-1000-5000+wm_Minor_Routes-1000-5000;~railways:Railroad_WorldMap@wm_Railroad_Track-120-2000;};{Town::~borders:Borders@incorp-0-120;~towns:Cities,_towns@wtown-0-60;};";
//tf.consts.defaultLegendH = "$$http://n00.cs.fiu.edu/defaultmapFL$$";
//tf.consts.defaultLegendM = "~osm-land-use:Land_use_from_Open_Street_Maps@osm_landuse-0-30000;~osm-land:Land_from_Open_Street_Maps@osm_land-0-30000;~osm-water:Water_data_from_Open_Street_Maps@osm_water-0-4000;~osm-place-names:Place_names_from_Open_Street_Maps@osm_place_names-0-30000;~osm-buildings:Building_data_from_Open_Street_Maps@osm_buildings-0-7;~osm-names:Road_names_from_Open_Street_Maps@osm_road_names-0-240;~osm-lines:Roads_from_Open_Street_Maps@osm_roads-0-7000;";

/**
 * @public
 * @description default Mapnik 2.0 Map [Legend String]{@link tf.types.legendString}
*/
tf.consts.defaultLegendM = "$$http://n00.cs.fiu.edu/Defaults/layers.maponly.mapnik2$$";
/**
 * @public
 * @description default Mapnik 2.0 Hybrid [Legend String]{@link tf.types.legendString}
*/
tf.consts.defaultLegendH = "$$http://n00.cs.fiu.edu/Defaults/layers.hybrid.mapnik2$$";


/**
 * @public
 * @description Mapnik 1.0 engine
*/
tf.consts.mapnikEngine = "m";

/**
 * @public
 * @description Mapnik 2.0 engine
*/
tf.consts.mapnik2Engine = "m2";

tf.consts.defaultFMap = tf.consts.mapnik2Engine;

/**
 * The Vector Tile engine used by the map, either {@link tf.consts.mapnik2Engine} or {@link tf.consts.mapnikEngine}
 * @public
 * @typedef {tf.types.mapEngine} tf.types.mapEngine
 */

tf.consts.defaultTFPassThrough = "";
tf.consts.defaultVid = "";

tf.consts.defaultHelp =
    "<span>" +
    "<b>Double Click</b>: Local Data Reports and Queries<br />" +
    "<b>Drag</b>: Browse the map<br />" +
    "Buttons: <b>Full Screen</b>, <b>Reset Rotation</b>, <b>Search Location</b>, <b>Zoom</b>, <b>Map Layers</b><br /><br />" +
    "Address bar examples:<br />" +
    "1 Flagler St, Miami, FL<br />Miami<br />Miami, FL<br />33139<br />25.77 -80.19 (coordinates)" +
    "</span>";

tf.consts.defaultAddress = "";

tf.consts.tfLogoOnStr = "1";
tf.consts.tfLogoOffStr = "0";

/**
 * @public
 * @description Hybrid map display (Aerial + Map combined)
*/
tf.consts.typeNameHybrid = "hybrid";
/**
 * @public
 * @description Map display (Vector tiles only)
*/
tf.consts.typeNameMap = "map";
/**
 * @public
 * @description Aerial display (Aerial tiles only)
*/
tf.consts.typeNameAerial = "satellite";

tf.consts.typeNameUndefined = "undefined";

tf.consts.defaultTypeName = tf.consts.typeNameHybrid;

/**
 * The type of map images displayed by the map, either {@link tf.consts.typeNameHybrid}, {@link tf.consts.typeNameMap} or {@link tf.consts.typeNameAerial}
 * @public
 * @typedef {tf.types.mapType} tf.types.mapType
 */

/** 
 * @public 
 * @description Best Available source for map Aerial tiles 
*/
tf.consts.sourceName_best_available = "best_available";
/**
 * @public
 * @description source for map Aerial tiles 
*/
tf.consts.sourceName_naip_1m = "naip_1m";
/**
 * @public
 * @description source for map Aerial tiles 
*/
tf.consts.sourceName_usgs_toop_r = "usgs_toop_r";
/**
 * @public
 * @description source for map Aerial tiles 
*/
tf.consts.sourceName_county_1ft = "county_1ft";
/**
 * @public
 * @description source for map Aerial tiles 
*/
tf.consts.sourceName_landsat7_321 = "landsat7_321";
/**
 * @public
 * @description source for map Aerial tiles 
*/
tf.consts.sourceName_usgs_1m = "usgs_1m";
/**
 * @public
 * @description source for map Aerial tiles 
*/
tf.consts.sourceName_country_3inch = "country_3inch";
/**
 * @public
 * @description source for map Aerial tiles 
*/
tf.consts.sourceName_usgs_ap_cir = "usgs_ap_cir";
/**
 * @public
 * @description source for map Aerial tiles 
*/
tf.consts.sourceName_usgs_ap_r = "usgs_ap_r";
/**
 * @public
 * @description source for map Aerial tiles 
*/
tf.consts.sourceName_dor_1ft = "dor_1ft";
/**
 * @public
 * @description source for map Aerial tiles 
*/
tf.consts.sourceName_usgs_ap_cir = "usgs_ap_cir";

tf.consts.defaultSourceName = tf.consts.sourceName_best_available;

tf.consts.appParamName = "app";
tf.consts.appStartParamName = "appstart";
tf.consts.appStartExpandedValue = "expanded";
tf.consts.appStartCollapsedValue = "collapsed";

/**
 * @public
 * @description target of HTML 'a' elements: '_blank', '_top', etc. defaults to '_top'
*/
tf.consts.paramLinkTargetStr = 'linktarget';

/**
 * The source of aerial tiles displayed by the map, one of:<br>
 * {@link tf.consts.sourceName_best_available},<br>
 * {@link tf.consts.sourceName_naip_1m},<br>
 * {@link tf.consts.sourceName_usgs_toop_r},<br>
 * {@link tf.consts.sourceName_county_1ft},<br>
 * {@link tf.consts.sourceName_landsat7_321},<br>
 * {@link tf.consts.sourceName_usgs_1m},<br>
 * {@link tf.consts.sourceName_country_3inch},<br>
 * {@link tf.consts.sourceName_usgs_ap_cir},<br>
 * {@link tf.consts.sourceName_usgs_ap_r},<br>
 * {@link tf.consts.sourceName_dor_1ft},<br>
 * or {@link tf.consts.sourceName_usgs_ap_cir}
 * @public
 * @typedef {tf.types.mapAerialSource} tf.types.mapAerialSource
 */

/**
 * @public
 * @description map zoom control name: "zoom"
*/
tf.consts.panelNameZoom = "zoom";
/**
 * @public
 * @description map overview control name: "overview"
*/
tf.consts.panelNameOverview = "overview";
/**
 * @public
 * @description map layers control name: "legend"
*/
tf.consts.panelNameLayers = "legend";

/**
 * @public
 * @description map markers control name: "markerspanecollapsed"
*/
tf.consts.markersPanelCollapsed = "markerspanecollapsed";

/**
 * @public
 * @description map download control name: "download"
*/
tf.consts.panelNameDownload = "download";
/**
 * @public
 * @description map measure control name: "measure"
*/
tf.consts.panelNameMeasure = "measure";
/**
 * @public
 * @description map type control name: "type"
*/
tf.consts.panelNameType = "type";
/**
 * @public
 * @description map fullscreen control name: "fullscreen"
*/
tf.consts.panelNameFullscreen = "fullscreen";
/**
 * @public
 * @description map source control name: "source"
*/
tf.consts.panelNameSource = "source";
/**
 * @public
 * @description map address control name: "address"
*/
tf.consts.panelNameAddress = "address";
/**
 * @public
 * @description map location control name: "maplocation"
*/
tf.consts.panelNameMapLocation = "maplocation";
/**
 * @public
 * @description map scale control name: "mapscale"
*/
tf.consts.panelNameMapScale = "mapscale";
/**
 * @public
 * @description map rotate control name: "maprotate"
*/
tf.consts.panelNameMapRotate = "maprotate";
/**
 * @public
 * @description map user location control name: "userlocation"
*/
tf.consts.panelNameUserLocation = "userlocation";
/**
 * @public
 * @description map logo control name: "tflogo"
*/
tf.consts.panelNameTFLogo = "tflogo";
/**
 * @public
 * @description prevents the map's address bar control from being displayed: "noaddress"
*/
tf.consts.panelNameNoAddress = "noaddress";
/**
 * @public
 * @description prevents the map's location control from being displayed: "nomaplocation"
*/
tf.consts.panelNameNoMapLocation = "nomaplocation";
/**
 * @public
 * @description prevents the map's rotate control from being displayed: "nomaprotate"
*/
tf.consts.panelNameNoMapRotate = "nomaprotate";
/**
 * @public
 * @description prevents the map's scale control from being displayed: "nomapscale"
*/
tf.consts.panelNameNoMapScale = "nomapscale";
/**
 * @public
 * @description prevents the map's user location control from being displayed: "nouserlocation"
*/
tf.consts.panelNameNoUserLocation = "nouserlocation";

tf.consts.panelNameNoMapCenter = "nomapcenter";

/**
 * @public
 * @description character used to separate string component names, like names of map panels ({@link tf.types.mapPanelName}) in a panel name string ({@link tf.types.mapPanelNamesString})
*/
tf.consts.charSplitStrings = '+';

tf.consts.allPanelNames = [
    tf.consts.panelNameAddress,
    tf.consts.panelNameZoom,
    tf.consts.panelNameLayers,
    tf.consts.markersPanelCollapsed,
    tf.consts.panelNameType,
    tf.consts.panelNameMeasure,
    tf.consts.panelNameDownload,
    tf.consts.panelNameSource,
    tf.consts.panelNameFullscreen,
    tf.consts.panelNameMapLocation,
    tf.consts.panelNameOverview,
    tf.consts.panelNameMapScale,
    tf.consts.panelNameMapRotate,
    tf.consts.panelNameUserLocation,
    tf.consts.panelNameTFLogo
];

tf.consts.defaultPanels =
    tf.consts.panelNameTFLogo + tf.consts.charSplitStrings +
    tf.consts.panelNameAddress + tf.consts.charSplitStrings +
    tf.consts.panelNameZoom + tf.consts.charSplitStrings +
    tf.consts.panelNameLayers + tf.consts.charSplitStrings +
    tf.consts.panelNameType + tf.consts.charSplitStrings +
    tf.consts.panelNameMeasure + tf.consts.charSplitStrings +
    tf.consts.panelNameMapLocation + tf.consts.charSplitStrings +
    tf.consts.panelNameUserLocation + tf.consts.charSplitStrings +
    tf.consts.panelNameMapRotate + tf.consts.charSplitStrings +
    tf.consts.panelNameMapScale + tf.consts.charSplitStrings +
    tf.consts.panelNameOverview;

tf.consts.charSplitApps = '+';

/**
 * The name of a map panel displayed by default by the URL-API, one of:<br>
 * {@link tf.consts.panelNameAddress},<br>
 * {@link tf.consts.panelNameLayers},<br>
 * {@link tf.consts.markersPanelCollapsed},<br>
 * {@link tf.consts.panelNameMapLocation},<br>
 * {@link tf.consts.panelNameMapRotate},<br>
 * {@link tf.consts.panelNameMapScale},<br>
 * {@link tf.consts.panelNameMeasure},<br>
 * {@link tf.consts.panelNameOverview},<br>
 * {@link tf.consts.panelNameTFLogo},<br>
 * {@link tf.consts.panelNameType},<br>
 * {@link tf.consts.panelNameUserLocation},<br>
 * or {@link tf.consts.panelNameZoom}
 * @public
 * @typedef {tf.types.mapDefaultPanelName} tf.types.mapDefaultPanelName
 */

/**
 * The name of a map panel, one of:<br>
 * {@link tf.consts.panelNameAddress},<br>
 * {@link tf.consts.panelNameDownload},<br>
 * {@link tf.consts.panelNameFullscreen},<br>
 * {@link tf.consts.panelNameLayers},<br>
 * {@link tf.consts.markersPanelCollapsed},<br>
 * {@link tf.consts.panelNameMapLocation},<br>
 * {@link tf.consts.panelNameMapRotate},<br>
 * {@link tf.consts.panelNameMapScale},<br>
 * {@link tf.consts.panelNameMeasure},<br>
 * {@link tf.consts.panelNameOverview},<br>
 * {@link tf.consts.panelNameSource},<br>
 * {@link tf.consts.panelNameTFLogo},<br>
 * {@link tf.consts.panelNameType},<br>
 * {@link tf.consts.panelNameUserLocation},<br>
 * {@link tf.consts.panelNameZoom},<br>
 * {@link tf.consts.panelNameNoAddress},<br>
 * {@link tf.consts.panelNameNoMapLocation},<br>
 * {@link tf.consts.panelNameNoMapRotate},<br>
 * {@link tf.consts.panelNameNoMapScale},<br>
 * {@link tf.consts.panelNameNoMapCenter},<br>
 * or {@link tf.consts.panelNameNoUserLocation}
 * @public
 * @typedef {tf.types.mapPanelName} tf.types.mapPanelName
 */

/**
 * A string listing names of map panels (see {@link tf.types.mapPanelName}) separated by the character {@link tf.consts.charSplitStrings}<br>
 * This type of string is used by the namespace {@link tf.urlapi}, and in the creation of [Map]{@link tf.map.Map} instances 
 * @public
 * @typedef {string} tf.types.mapPanelNamesString
 */

/**
*/
 //* Name of the [URL Parameter]{@link tf.types.URLParameters} that activates the "Realtor" native application
 //* @public
 //*/
//tf.consts.appNameRAMB = "ramb";
//tf.consts.appNameALTA = "alta";

/*tf.consts.allAppsNames = [
    //tf.consts.appNameALTA,
    tf.consts.appNameRAMB
];

tf.consts.defaultApps = "";*/

/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the Map Engine to use: "fmap"
 * @public
 */
tf.consts.paramNameFMap = "fmap";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the initial map center latitude coordinate: "lat"
 * @public
 */
tf.consts.paramNameLat = "lat";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the initial map center latitude coordinate: "lon"
 * @public
 */
tf.consts.paramNameLon = "lon";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the initial map resolution: "res"
 * @public
 */
tf.consts.paramNameRes = "res";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the initial map level, ignored if <b>resolution</b> is defined: "level"
 * @public
 */
tf.consts.paramNameLevel = "level";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the initial visibility of [map panels]{@link tf.types.mapPanelNamesString}: "panels"
 * @public
 */
tf.consts.paramNamePanels = "panels";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the initial contents of the map's address bar: "address"
 * @public
 */
tf.consts.paramNameAddress = "address";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the contents of the help message displayed by the map: "help"
 * @public
 */
tf.consts.paramNameHelp = "help";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling a string used by the map when interacting with some TerraFly services: "vid"
 * @public
 */
tf.consts.paramNameVid = "vid";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling a string used by the map when interacting with some TerraFly services: "tf_passtrough"
 * @public
 */
tf.consts.paramNamePassThrough = "tf_passtrough";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling whether the TerraFly logo is displayed by the map: "tflogo"
 * @public
 */
tf.consts.paramNameTFLogo = "tflogo";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the initial map type: "type"
 * @public
 */
tf.consts.paramNameType = "type";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the initial map source: "source"
 * @public
 */
tf.consts.paramNameSource = "source";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the number of seconds before the map's Message Popup closes itself: "rgpopup"
 * @public
 */
tf.consts.paramNameMessageTimeout = "rgpopup";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the [Legend String]{@link tf.types.legendString} for Mapnik 1.0 used by the map's Base Layers: "legend"
 * @public
 */
tf.consts.paramNameLegend = "legend";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the hybrid [Legend String]{@link tf.types.legendString} for Mapnik 2.0 used by the map's Base Layers: "legendh"
 * @public
 */
tf.consts.paramNameLegendH = "legendh";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the Map [Legend String]{@link tf.types.legendString} for Mapnik 2.0 used by the map's Base Layers: "legendm"
 * @public
 */
tf.consts.paramNameLegendM = "legendm";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the optional name of a the native TerraFly API application to be executed. Currently {@link tf.consts.appNameRAMB} is supported: "apps"
 * @public
 */
tf.consts.paramNameApps = "apps";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling an optional file name containing additional specifications: "appspecs"
 * @public
 */
tf.consts.paramNameAppSpecs = "appspecs";

/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the name of a [DLayer]{@link tf.urlapi.DLayer}, ending with the number identifying a dlayer: "dlayerlegend1", "dlayerlegend2", etc.
 * @public
 */
tf.consts.paramNameDLLegend = "dlayerlegend";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the remote service associated with a [DLayer]{@link tf.urlapi.DLayer}, ending with the number identifying a dlayer: "dlayerdata1", "dlayerdata2", etc.
 * @public
 */
tf.consts.paramNameDLData = "dlayerdata";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the [DLayer]{@link tf.urlapi.DLayer} field to display as a [Map Feature]{@link tf.map.Feature}, ending with the number identifying a dlayer: "dlayerfield1", "dlayerfield2", etc.
 * @public
 */
tf.consts.paramNameDLField = "dlayerfield";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the initial map visibility of a [DLayer]{@link tf.urlapi.DLayer}, ending with the number identifying a dlayer: "dlayerselect1", "dlayerselect2", etc.
 * @public
 */
tf.consts.paramNameDLSelect = "dlayerselect";
/**
 * Name of the [URL Parameter]{@link tf.types.URLParameters} controlling the color with which to display text markers belonging to a [DLayer]{@link tf.urlapi.DLayer}, ending with the number identifying a dlayer: "dlayercolor1", "dlayercolor2", etc.
 * @public
 */
tf.consts.paramNameDLColor = "dlayercolor";
/**
 * Name of the optional [URL Parameter]{@link tf.types.URLParameters} containing a number that, when present, determines the minimum number of records of the first DLayer that must initially be displayed either by zooming out or by re-centering the map, or a combination of both
 * @public
 */
tf.consts.paramNameDLExtent = "dlayerextent";

tf.consts.paramNameDLPreClick = "dlayerpreclick";

/**
 * Name of the optional [URL Parameter]{@link tf.types.URLParameters} governing the optional creation of a perspective map, if set to {@link void} no perspective map is created,
 * if set to {@link boolean} a perspective map is created, and displayed or hidden according to the given boolean value (true = displayed, false = hidden)
 * @public
 */
tf.consts.paramNamePerspectiveMap = "perspectivemap";

tf.consts.paramNameDirectionsMode = "directionsmode";
tf.consts.paramNameDirectionsDest = "directionsdest";

tf.consts.paramNameDirectionsUseBus = "directionsbus";

tf.consts.paramNameDirectionsUseBusStage = "directionsbusstage";

tf.consts.MVideoParamNameVideo = "m";
tf.consts.minMessageTimeout = 0;

tf.consts.maxMessageTimeout = 60;
/**
 * @public
 * @description default timeout in secods for the map Message Popup
*/
tf.consts.defaultMessageTimeout = 5;

tf.consts.addressBarName = "Search Location";

tf.consts.mapTypesName = "Display Type";
tf.consts.mapTypesHybridLabel = "Hybrid";
tf.consts.mapTypesAerialLabel = "Aerial";
tf.consts.mapTypesMapLabel = "Map";
tf.consts.mapTypesHybridTip = "Hybrid: Aerial + Map";
tf.consts.mapTypesAerialTip = "Aerial images only";
tf.consts.mapTypesMapTip = "Map images only";

tf.consts.centerToUserLocationTip = "Center Map to User Location";

tf.consts.mapLayersName = "Map Layers";

tf.consts.baseMapLayersName = "Base Layers";
tf.consts.baseMapLayersToolTip = "View Base Layers";

tf.consts.mapSourcesName = "Aerial Source";
tf.consts.mapSourcesItemTip = "Use images from: ";

tf.consts.mapLayerSourceName = "maplayersource";

tf.consts.mapDownloadName = "Download";

tf.consts.mapMeasureName = "Measure";

tf.consts.mapLocationShowTip = "Enable Location Information on Map Move";
tf.consts.mapLocationHideTip = "Disable Location Information on Map Move";
tf.consts.mapLocationPopupHideTip = "Hide Location Information";

tf.consts.fullScreenToolTipNormal = "View Full Screen";
tf.consts.fullScreenToolTipFull = "Exit Full Screen";

tf.consts.minAppWidthNumber = 400;
tf.consts.minAppHeightNumber = 360;

tf.consts.defaultGeocoderError = "ERROR IN ADDRESS, PLEASE REENTER";

/**
 * @public
 * @description {@link TMap} instance panel visible state
 * @deprecated TerraFly applications use should replace the use of {@link TMap} instances with {@link tf.map.Map} instances
*/
tf.consts.strShowPanel = "SHOW";
/**
 * @public
 * @description {@link TMap} instance panel hidden state
 * @deprecated TerraFly applications use should replace the use of {@link TMap} instances with {@link tf.map.Map} instances
*/
tf.consts.strHidePanel = "HIDE";

/**
 * The visibility state of a [TMap]{@link TMap} panel, either {@link tf.consts.strShowPanel} or {@link tf.consts.strHidePanel}
 * @public
 * @typedef {tf.types.mapPanelVisibilityState} tf.types.mapPanelVisibilityState
 */

/**
 * URL to the TerraFly routing service
 * @public
 */
tf.consts.RoutingServiceURL = "http://131.94.133.147:5000/";

/**
 * Mode used by the TerraFly routing service
 * @public
 */
tf.consts.routingServiceModeFoot = "foot";

/**
 * Mode used by the TerraFly routing service
 * @public
 */
tf.consts.routingServiceModeCar = "car";

/**
 * Mode used by the TerraFly routing service
 * @public
 */
tf.consts.routingServiceModeBicycle = "bicycle";

tf.consts.routingServiceModeBus = "bus";

/**
 * A mode string with the TerraFly routing service, one of:<br>
 * {@link tf.consts.routingServiceModeFoot},<br>
 * {@link tf.consts.routingServiceModeBicycle},<br>
 * or {@link tf.consts.routingServiceModeCar}
 * @public
 * @typedef {string} tf.types.routingServiceMode
 */

tf.consts.worldGeodeticSystemStr = "EPSG:4326";
tf.consts.sphericalMercatorSystemStr = "EPSG:3857";
tf.consts.UTMSystemStr = "EPSG:3006";

tf.consts.olSystem = tf.consts.sphericalMercatorSystemStr;
tf.consts.tmSystem = tf.consts.worldGeodeticSystemStr;
tf.consts.downloadSystem = tf.consts.UTMSystemStr;

/**
 * Reserved prefix used by the API for [SVG Glyph Specifications]{@link tf.types.SVGGlyphSpecs} provided by the API's {@link singleton} [SVG Glyph Library]{@link tf.styles.SvgGlyphLib} 
 * @public
 */
tf.consts.SVGGlyphPrefix = "-tf-svgglyph-";

/**
 * Reserved prefix used by the API for known object properties of value <b>"-tf-prop-"</b>. Applications using the API should not name public object properties using with this prefix
 * @public
 */
tf.consts.KnownPropertyPrefix = "-tf-prop-";

/**
 * The reserved and default property name for [DLayer]{@link tf.urlapi.DLayer} instances
 * @public
 */
tf.consts.DLayerProperty = tf.consts.KnownPropertyPrefix + "dlayer";

/**
 * The reserved and default property name for [Table Row]{@link tf.ui.TableRow} instances
 * @public
 */
tf.consts.TableRowProperty = tf.consts.KnownPropertyPrefix + "tablerow";

/**
 * The reserved and default property name for [Keyed Feature]{@link tf.map.KeyedFeature} instances
 * @public
 */
tf.consts.KeyedFeatureProperty = tf.consts.KnownPropertyPrefix + "keyedfeature";

/**
 * The name of a known TerraFly API property, one of:<br>
 * {@link tf.consts.DLayerProperty},<br>
 * {@link tf.consts.TableRowProperty},<br>
 * or {@link tf.consts.KeyedFeatureProperty}
 * @public
 * @typedef {tf.types.KnownAPIPropertyName} tf.types.KnownAPIPropertyName
 * @see [Known Property Prefix]{@link tf.consts.KnownPropertyPrefix}
 */

tf.consts.DOMEventNames = {};

/**
 * @public
 * @description DOM "focus" event
*/
tf.consts.DOMEventNamesFocus = "focus";
/**
 * @public
 * @description DOM "blur" event
*/
tf.consts.DOMEventNamesBlur = "blur";
/**
 * @public
 * @description DOM "ended" event
*/
tf.consts.DOMEventNamesEnded = "ended";
/**
 * @public
 * @description DOM "timeupdate" event
*/
tf.consts.DOMEventNamesTimeUpdate = "timeupdate";
/**
 * @public
 * @description DOM "loadmetadata" event
*/
tf.consts.DOMEventNamesLoadMetaData = "loadmetadata";
/**
 * @public
 * @description DOM "click" event
*/
tf.consts.DOMEventNamesClick = "click";
/**
 * @public
 * @description DOM "change" event
*/
tf.consts.DOMEventNamesChange = "change";
/**
 * @public
 * @description DOM "DOMMouseScroll" event
*/
tf.consts.DOMEventNamesDOMMouseScroll = "DOMMouseScroll";
/**
 * @public
 * @description DOM "mousewheel" event
*/
tf.consts.DOMEventNamesMouseWheel = "mousewheel";
/**
 * @public
 * @description DOM "losefocus" event
*/
tf.consts.DOMEventNamesLoseFocus = "losefocus";
/**
 * @public
 * @description DOM "resize" event
*/
tf.consts.DOMEventNamesResize = "resize";
/**
 * @public
 * @description DOM "keypress" event
*/
tf.consts.DOMEventNamesKeyPress = "keypress";
/**
 * @public
 * @description DOM "keyup" event
*/
tf.consts.DOMEventNamesKeyUp = "keyup";
/**
 * @public
 * @description DOM "mousemove" event
*/
tf.consts.DOMEventNamesMouseMove = "mousemove";
/**
 * @public
 * @description DOM "mouseup" event
*/
tf.consts.DOMEventNamesMouseUp = "mouseup";
/**
 * @public
 * @description DOM "mousedown" event
*/
tf.consts.DOMEventNamesMouseDown = "mousedown";
/**
 * @public
 * @description DOM "mouseover" event
*/
tf.consts.DOMEventNamesMouseOver = "mouseover";
/**
 * @public
 * @description DOM "mouseout" event
*/
tf.consts.DOMEventNamesMouseOut = "mouseout";
/**
 * @public
 * @description DOM "mouseenter" event
*/
tf.consts.DOMEventNamesMouseEnter = "mouseenter";
/**
 * @public
 * @description DOM "mouseleave" event
*/
tf.consts.DOMEventNamesMouseLeave = "mouseleave";
/**
 * @public
 * @description DOM "touchstart" event
*/
tf.consts.DOMEventNamesTouchStart = "touchstart";
/**
 * @public
 * @description DOM "touchmove" event
*/
tf.consts.DOMEventNamesTouchMove = "touchmove";
/**
 * @public
 * @description DOM "touchend" event
*/
tf.consts.DOMEventNamesTouchEnd = "touchend";
/**
 * @public
 * @description DOM "touchenter" event
*/
tf.consts.DOMEventNamesTouchEnter = "touchenter";
/**
 * @public
 * @description DOM "touchleave" event
*/
tf.consts.DOMEventNamesTouchLeave = "touchleave";
/**
 * @public
 * @description DOM "touchcancel" event
*/
tf.consts.DOMEventNamesTouchCancel = "touchcancel";

/**
 * The name of a DOM event, one of:<br>
 * {@link tf.consts.DOMEventNamesBlur},<br>
 * {@link tf.consts.DOMEventNamesFocus},<br>
 * {@link tf.consts.DOMEventNamesEnded},<br>
 * {@link tf.consts.DOMEventNamesTimeUpdate},<br>
 * {@link tf.consts.DOMEventNamesLoadMetaData},<br>
 * {@link tf.consts.DOMEventNamesClick},<br>
 * {@link tf.consts.DOMEventNamesChange},<br>
 * {@link tf.consts.DOMEventNamesLoseFocus},<br>
 * {@link tf.consts.DOMEventNamesResize},<br>
 * {@link tf.consts.DOMEventNamesKeyPress},<br>
 * {@link tf.consts.DOMEventNamesKeyUp},<br>
 * {@link tf.consts.DOMEventNamesMouseMove},<br>
 * {@link tf.consts.DOMEventNamesMouseUp},<br>
 * {@link tf.consts.DOMEventNamesMouseDown},<br>
 * {@link tf.consts.DOMEventNamesMouseOver},<br>
 * {@link tf.consts.DOMEventNamesMouseOut},<br>
 * {@link tf.consts.DOMEventNamesMouseEnter},<br>
 * {@link tf.consts.DOMEventNamesMouseLeave},<br>
 * {@link tf.consts.DOMEventNamesTouchStart},<br>
 * {@link tf.consts.DOMEventNamesTouchMove},<br>
 * {@link tf.consts.DOMEventNamesTouchEnd},<br>
 * {@link tf.consts.DOMEventNamesTouchEnter},<br>
 * {@link tf.consts.DOMEventNamesTouchLeave},<br>
 * {@link tf.consts.DOMEventNamesTouchCancel},<br>
 * or another {@link string} known to be a DOM event name.
 * @public
 * @typedef {tf.types.DOMEventName} tf.types.DOMEventName
 */

/**
 * The name of a mouse related DOM event, one of:<br>
 * {@link tf.consts.DOMEventNamesMouseMove},<br>
 * {@link tf.consts.DOMEventNamesMouseUp},<br>
 * {@link tf.consts.DOMEventNamesMouseDown},<br>
 * {@link tf.consts.DOMEventNamesMouseOver},<br>
 * {@link tf.consts.DOMEventNamesMouseOut},<br>
 * {@link tf.consts.DOMEventNamesMouseEnter},<br>
 * {@link tf.consts.DOMEventNamesMouseLeave},<br>
 * {@link tf.consts.DOMEventNamesTouchStart},<br>
 * {@link tf.consts.DOMEventNamesTouchMove},<br>
 * {@link tf.consts.DOMEventNamesTouchEnd},<br>
 * {@link tf.consts.DOMEventNamesTouchEnter},<br>
 * {@link tf.consts.DOMEventNamesTouchLeave},<br>
 * or {@link tf.consts.DOMEventNamesTouchCancel}
 * @public
 * @typedef {tf.types.DOMMouseEventName} tf.types.DOMMouseEventName
 */

tf.consts.allMouseEventNames = [
 tf.consts.DOMEventNamesMouseMove,
 tf.consts.DOMEventNamesMouseUp,
 tf.consts.DOMEventNamesMouseDown,
 tf.consts.DOMEventNamesMouseOver,
 tf.consts.DOMEventNamesMouseOut,
 tf.consts.DOMEventNamesMouseEnter,
 tf.consts.DOMEventNamesMouseLeave,
 tf.consts.DOMEventNamesTouchStart,
 tf.consts.DOMEventNamesTouchMove,
 tf.consts.DOMEventNamesTouchEnd,
 tf.consts.DOMEventNamesTouchEnter,
 tf.consts.DOMEventNamesTouchLeave,
 tf.consts.DOMEventNamesTouchCancel
];


tf.consts.DOMEventNameswebkitfullscreenchange = "webkitfullscreenchange";
tf.consts.DOMEventNamesmozfullscreenchange = "mozfullscreenchange";
tf.consts.DOMEventNamesfullscreenchange = "fullscreenchange";
tf.consts.DOMEventNamesMSFullscreenChange = "MSFullscreenChange";

tf.consts.allFullScreenEventNames = [
    tf.consts.DOMEventNameswebkitfullscreenchange,
    tf.consts.DOMEventNamesmozfullscreenchange,
    tf.consts.DOMEventNamesfullscreenchange,
    tf.consts.DOMEventNamesMSFullscreenChange
];

/**
 * @public
 * @description {@link tf.js.KeyedList} list deleted event
*/
tf.consts.keyedListDeleteEvent = "listDelete";
/**
 * @public
 * @description {@link tf.js.KeyedList} items added event
*/
tf.consts.keyedListAddedItemsEvent = "listAddedItems";
/**
 * @public
 * @description {@link tf.js.KeyedList} items updated event
*/
tf.consts.keyedListUpdatedItemsEvent = "listUpdatedItems";
/**
 * @public
 * @description {@link tf.js.KeyedList} items deleted event
*/
tf.consts.keyedListDeletedItemsEvent = "listDeletedItems";

tf.consts.allKeyedListEventNames = [
    tf.consts.keyedListDeleteEvent,
    tf.consts.keyedListAddedItemsEvent,
    tf.consts.keyedListUpdatedItemsEvent,
    tf.consts.keyedListDeletedItemsEvent
];

/**
 * The name of a [Keyed List]{@link tf.js.KeyedList} event, one of:<br>
 * {@link tf.consts.keyedListDeleteEvent},<br>
 * {@link tf.consts.keyedListAddedItemsEvent},<br>
 * {@link tf.consts.keyedListUpdatedItemsEvent},<br>
 * or {@link tf.consts.keyedListDeletedItemsEvent}
 * @public
 * @typedef {tf.types.keyedListEventName} tf.types.keyedListEventName
 */

/**
 * @public
 * @description {@link tf.map.FeatureList} features added event
*/
tf.consts.keyedFeaturesAddedEvent = "featuresAdded";
/**
 * @public
 * @description {@link tf.map.FeatureList} features updated event
*/
tf.consts.keyedFeaturesUpdatedEvent = "featuresUpdated";
/**
 * @public
 * @description {@link tf.map.FeatureList} features deleted event
*/
tf.consts.keyedFeaturesDeletedEvent = "featuresDeleted";

tf.consts.allKeyedFeaturesEventNames = [
    tf.consts.keyedFeaturesAddedEvent,
    tf.consts.keyedFeaturesUpdatedEvent,
    tf.consts.keyedFeaturesDeletedEvent
];

/**
 * The name of a [Keyed Feature List]{@link tf.map.KeyedFeatureList} event, one of:<br>
 * {@link tf.consts.keyedFeaturesAddedEvent},<br>
 * {@link tf.consts.keyedFeaturesUpdatedEvent},<br>
 * or {@link tf.consts.keyedFeaturesDeletedEvent}
 * @public
 * @typedef {tf.types.keyedFeatureListEventName} tf.types.keyedFeatureListEventName
 */

/**
 * @public
 * @description {@link tf.ui.KeyedTable} rows added event
*/
tf.consts.keyedTableRowsAddedEvent = "keyedTableRowsAdded";
/**
 * @public
 * @description {@link tf.ui.KeyedTable} rows updated event
*/
tf.consts.keyedTableRowsUpdatedEvent = "keyedTableRowsUpdated";
/**
 * @public
 * @description {@link tf.ui.KeyedTable} rows deleted event
*/
tf.consts.keyedTableRowsDeletedEvent = "keyedTableRowsDeleted";

tf.consts.keyedTableRowsEventNames = [
    tf.consts.keyedTableRowsAddedEvent,
    tf.consts.keyedTableRowsUpdatedEvent,
    tf.consts.keyedTableRowsDeletedEvent
];

/**
 * The name of a [Keyed Table]{@link tf.ui.KeyedTable} event, one of:<br>
 * {@link tf.consts.keyedRowTableRowsAddedEvent},<br>
 * {@link tf.consts.keyedRowTableRowsUpdatedEvent},<br>
 * or {@link tf.consts.keyedRowTableRowsDeletedEvent}
 * @public
 * @typedef {tf.types.keyedFeatureListEventName} tf.types.keyedFeatureListEventName
 */

/**
 * @public
 * @description {@link tf.map.FeatureLayer} visibility change event
*/
tf.consts.mapFeatureLayerVisibilityChangeEvent = "visibilityChange";

tf.consts.allMapFeatureLayerEventNames = [
    tf.consts.mapFeatureLayerVisibilityChangeEvent
];

/**
 * The name of a {@link tf.map.FeatureLayer} event, one of:<br>
 * {@link tf.consts.mapFeatureLayerVisibilityChangeEvent}
 * @public
 * @typedef {tf.types.mapFeatureLayerEventName} tf.types.mapFeatureLayerEventName
 */

/**
 * @public
 * @description {@link tf.map.Map} toggle scale unit event
*/
tf.consts.mapToggleScaleUnitEvent = "toggleScaleUnit";
/**
 * @public
 * @description {@link tf.map.Map} move end event
*/
tf.consts.mapMoveEndEvent = "moveEnd";

tf.consts.mapMoveStartEvent = "moveStart";

/**
 * @public
 * @description {@link tf.map.Map} map container resized event
*/
tf.consts.mapResizedEvent = "resized";
/**
 * @public
 * @description {@link tf.map.Map} mouse move event
*/
tf.consts.mapMouseMoveEvent = "mouseMove";
/**
 * @public
 * @description {@link tf.map.Map} mouse click event
*/
tf.consts.mapClickEvent = "click";
/**
 * @public
 * @description {@link tf.map.Map} mouse drag event
*/
tf.consts.mapMouseDragEvent = "mouseDrag";
/**
 * @public
 * @description {@link tf.map.Map} mouse drag event
*/
tf.consts.mapEndDragEvent = "endDrag";
/**
 * @public
 * @description {@link tf.map.Map} mouse instant click event
*/
tf.consts.mapInstantClickEvent = "iclick";
/**
 * @public
 * @description {@link tf.map.Map} mouse double click event
*/
tf.consts.mapDblClickEvent = "dblClick";
/**
 * @public
 * @description {@link tf.map.Map} mouse click on map feature event
*/
tf.consts.mapFeatureClickEvent = "featureClick";
/**
 * @public
 * @description {@link tf.map.Map} mouse click on map feature event
*/
tf.consts.mapFeatureInstantClickEvent = "ifeatureClick";
/**
 * @public
 * @description {@link tf.map.Map} mouse double click on map feature event
*/
tf.consts.mapFeatureDblClickEvent = "featureDblClick";
/**
 * @public
 * @description {@link tf.map.Map} mouse move on map feature event
*/
tf.consts.mapFeatureMouseMoveEvent = "featureMouseMove";
/**
 * @public
 * @description {@link tf.map.Map} mouse drag on map feature event
*/
tf.consts.mapFeatureMouseDragEvent = "featureMouseDrag";
/**
 * @public
 * @description {@link tf.map.Map} mouse hover in our out of map feature event
*/
tf.consts.mapFeatureHoverInOutEvent = "featureHoverInOut";
/**
 * @public
 * @description {@link tf.map.Map} map mode change event
*/
tf.consts.mapTypeChangeEvent = "modeChange";
/**
 * @public
 * @description {@link tf.map.Map} map level change event
*/
tf.consts.mapLevelChangeEvent = "levelChange";
/**
 * @public
 * @description {@link tf.map.Map} map resolution change event
*/
tf.consts.mapResolutionChangeEvent = "resolutionChange";
/**
 * @public
 * @description {@link tf.map.Map} map rotation change event
*/
tf.consts.mapRotationChangeEvent = "rotationChange";
/**
 * @public
 * @description {@link tf.map.Map} map switch to/from fullscreen event
*/
tf.consts.mapFullScreenEvent = "fullScreen";
/**
 * @public
 * @description {@link tf.map.Map} map postcompose event
*/
tf.consts.mapPostComposeEvent = "postCompose";

tf.consts.mapPostPostComposeEvent = "postPostCompose";

/**
 * @public
 * @description {@link tf.map.Map} map precompose event
*/
tf.consts.mapPreComposeEvent = "preCompose";
/**
 * @public
 * @description {@link tf.map.Map} map postrender event
*/
tf.consts.mapPostRenderEvent = "postRender";
/**
 * @public
 * @description {@link tf.map.Map} map view settings changed event
*/
tf.consts.mapViewSettingsChangedEvent = "viewsettingschanged";

tf.consts.allMapEventNames = [
    tf.consts.mapToggleScaleUnitEvent,
    tf.consts.mapMoveEndEvent,
    tf.consts.mapMoveStartEvent,
    tf.consts.mapResizedEvent,
    tf.consts.mapMouseMoveEvent,
    tf.consts.mapMouseDragEvent,
    tf.consts.mapEndDragEvent,
    tf.consts.mapClickEvent,
    tf.consts.mapInstantClickEvent,
    tf.consts.mapDblClickEvent,
    tf.consts.mapFeatureInstantClickEvent,
    tf.consts.mapFeatureClickEvent,
    tf.consts.mapFeatureDblClickEvent,
    tf.consts.mapFeatureMouseMoveEvent,
    tf.consts.mapFeatureMouseDragEvent,
    tf.consts.mapFeatureHoverInOutEvent,
    tf.consts.mapTypeChangeEvent,
    tf.consts.mapLevelChangeEvent,
    tf.consts.mapResolutionChangeEvent,
    tf.consts.mapRotationChangeEvent,
    tf.consts.mapFullScreenEvent,
    tf.consts.mapPostComposeEvent,
    tf.consts.mapPostPostComposeEvent,
    tf.consts.mapPreComposeEvent,
    tf.consts.mapPostRenderEvent,
    tf.consts.mapViewSettingsChangedEvent
];

/**
 * The name of a [Map]{@link tf.map.Map} event, one of:<br>
 * {@link tf.consts.mapToggleScaleUnitEvent},<br>
 * {@link tf.consts.mapMoveEndEvent},<br>
 * {@link tf.consts.mapMoveStartEvent},<br>
 * {@link tf.consts.mapResizedEvent},<br>
 * {@link tf.consts.mapMouseMoveEvent},<br>
 * {@link tf.consts.mapMouseDragEvent},<br>
 * {@link tf.consts.mapEndDragEvent},<br>
 * {@link tf.consts.mapClickEvent},<br>
 * {@link tf.consts.mapInstantClickEvent},<br>
 * {@link tf.consts.mapDblClickEvent},<br>
 * {@link tf.consts.mapFeatureClickEvent},<br>
 * {@link tf.consts.mapInstantFeatureClickEvent},<br>
 * {@link tf.consts.mapFeatureDblClickEvent},<br>
 * {@link tf.consts.mapFeatureMouseMoveEvent},<br>
 * {@link tf.consts.mapFeatureMouseDragEvent},<br>
 * {@link tf.consts.mapFeatureHoverInOutEvent},<br>
 * {@link tf.consts.mapTypeChangeEvent},<br>
 * {@link tf.consts.mapLevelChangeEvent},<br>
 * {@link tf.consts.mapResolutionChangeEvent},<br>
 * {@link tf.consts.mapRotationChangeEvent},<br>
 * {@link tf.consts.mapFullScreenEvent},<br>
 * {@link tf.consts.mapPreComposeEvent},<br>
 * {@link tf.consts.mapPostComposeEvent},<br>
 * {@link tf.consts.mapPostPostComposeEvent},<br>
 * {@link tf.consts.mapPostRenderEvent},<br>
 * or {@link tf.consts.mapViewSettingsChangedEvent}
 * @public
 * @typedef {tf.types.mapEventName} tf.types.mapEventName
 */

/**
 * @public
 * @description positioning specification
*/
tf.consts.positioningCenter = 'center';
/**
 * @public
 * @description positioning specification
*/
tf.consts.positioningLeft = 'left';
/**
 * @public
 * @description positioning specification
*/
tf.consts.positioningRight = 'right';
/**
 * @public
 * @description positioning specification
*/
tf.consts.positioningTop = 'top';
/**
 * @public
 * @description positioning specification
*/
tf.consts.positioningBottom = 'bottom';

/**
 * The name of a horizontal positioning, one of:<br>
 * {@link tf.consts.positioningCenter},<br>
 * {@link tf.consts.positioningLeft},<br>
 * or {@link tf.consts.positioningRight}
 * @public
 * @typedef {tf.types.horizontalPositioning} tf.types.horizontalPositioning
 */

/**
 * The name of a vertical positioning, one of:<br>
 * {@link tf.consts.positioningCenter},<br>
 * {@link tf.consts.positioningTop},<br>
 * or {@link tf.consts.positioningBottom}
 * @public
 * @typedef {tf.types.verticalPositioning} tf.types.verticalPositioning
 */

/**
 * @public
 * @description the default style name used by instances of [Map Feature With Named Styles]{@link tf.map.FeatureWithNamedStyles}
*/
tf.consts.defaultMapFeatureStyleName = "defaultMapFeatureStyleName";

/**
 * @public
 * @description the default duration, in milliseconds, used in [AnimatedSetLevel]{@link tf.map.Map#AnimatedSetLevel}
*/
tf.consts.defaultMapAnimatedDurationPerLevelMillis = 400;

/**
 * @public
 * @description the default duration, in milliseconds, used in [AnimatedSetCenter]{@link tf.map.Map#AnimatedSetLevel}
*/
tf.consts.defaultMapAnimatedCenterDurationMillis = 300;

