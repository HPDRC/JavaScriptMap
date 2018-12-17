"use strict";

tf.helpers.GarageEd = function (settings) {
    var theThis, routesLoader, routes, styles, urlapiApp, appSpecs;
    var singleAppHCFOnTheSide, singleAppMapContentOnTheSide, twoHorPaneLayout, HCFLayout, appSpecs, dLayers, appSizer, map;
    var mapMonitor;
    var appIsCreated;
    var garagesKeyedList, occupanciesKeyedList;
    var itpaHost = "http://192.168.0.81/api/v1/";
    //var itpaHost = "http://192.168.0.105:8080/v1/";
    var garagesLayer, occupanciesLayer;
    var garageTable;
    var garageAndOccupancyAreLoaded;

    var lastSelGarage;

    function onCreated() {
        singleAppHCFOnTheSide = urlapiApp.GetSingleAppHCFOnTheSide();
        twoHorPaneLayout = (singleAppMapContentOnTheSide = singleAppHCFOnTheSide.GetSingleAppMapContentOnTheSide()).GetLeftSeparatorRightLayout();
        HCFLayout = singleAppHCFOnTheSide.GetHCFLayout();
        map = singleAppMapContentOnTheSide.GetMap();
        map.ShowMapCenter(false);

        dLayers = singleAppMapContentOnTheSide.GetDLayers();
        appSizer = singleAppMapContentOnTheSide.GetAppContainerSizer();
        twoHorPaneLayout.SetRightSideCollapsed(false);

        appIsCreated = true;
        checkReadyToRun();
    }

    function createTable(tables, keyedList, tableSettings, rowSettings, getRowContent, index, title) {
        var settings = {
            keyedList: keyedList, optionalScope: theThis, tableSettings: tableSettings, rowSettings: rowSettings,
            properties: {}, getRowContent: getRowContent
        };
        var table = new tf.ui.KeyedTable(settings)
        tables.push({ table: table, dLayer: null, index: index, title: title });
        return table;
    }

    function createGaragesTable(tables) {
        var tableSettings = tf.js.ShallowMerge(appSpecs.garageTableStyle, { selectOnHover: appSpecs.garageTableSelectOnHover, onSelect: onGarageRowSelect });
        garageTable = createTable(tables, garagesKeyedList, tableSettings, { style: appSpecs.garageTableRowStyle, selectedStyle: appSpecs.garageTableRowHoverStyle }, getGarageRowContent, 0, "garages");
    }

    function showAll() {
        var items = garagesKeyedList.GetKeyedItemList();
        for (var i in items) { showGarage(items[i]); }
    }

    function showGarage(garage) {
        if (garage) {
            garagesLayer.AddMapFeature(garage.garageFeature);
            if (garage.centroidFeature) { garagesLayer.AddMapFeature(garage.centroidFeature); }
            if (garage.occupancyFeature) { occupanciesLayer.AddMapFeature(garage.occupancyFeature); }
        }
    }

    function setSelGarage(garage) {
        garagesLayer.RemoveAllFeatures();
        occupanciesLayer.RemoveAllFeatures();
        if (lastSelGarage) {
            //lastSelGarage.garageFeature.SetIsAlwaysInHover(false);
        }
        if (lastSelGarage = garage) {
            showGarage(lastSelGarage);
            //lastSelGarage.garageFeature.SetIsAlwaysInHover(true);
        }
    }

    function onGarageRowSelect(notification) {
        if (notification.isClick) {
            if (!!notification.selected) {
                var selItem = notification.selected.GetKeyedItem();
                var mapFeature = selItem.occupancyFeature;
                if (!mapFeature) { mapFeature = selItem.centroidFeature; }
                if (mapFeature) { map.SetCenter(mapFeature.GetPointCoords()); }
                setSelGarage(selItem);
            }
        }
    }

    function initTables() {
        var tables = [];
        createGaragesTable(tables);
        return tables;
    }

    function onAppSpecsLoaded(appSpecsSet) {
        appSpecs = appSpecsSet;
    }


    function onFeatureClick(notification) {
        var mapFeature = notification.mapFeature;
        if (!!mapFeature.garageItem) {
            var garageItem = mapFeature.garageItem;
            var props = garageItem.GetData().properties;
            setSelGarage(garageItem);
            garageTable.GetRowFromKeyedItem(garageItem).Select(true, true)
            var str = "";
            if (mapFeature.isGarage) {
                str = "garage: ";
            }
            else if (mapFeature.isCentroid) {
                str = "centroid: "
            }
            console.log(str + props.parking_site_id + ' : ' + props.identifier);
        }
        else if (!!mapFeature.occupancyItem) {
            var occupancyItem = mapFeature.occupancyItem;
            var props = occupancyItem.GetData().properties;
            console.log('occupancy: ' + props.parking_site_id);
        }
    }

    function checkReadyToRun() {
        loadOccupancies();
        var mapEventSettings = {};
        mapEventSettings[tf.consts.mapFeatureClickEvent] = onFeatureClick;
        mapMonitor = map.AddListeners(mapEventSettings);
    }

    function getRemoteJSON(url, then) { new tf.ajax.JSONGet().Request(url, function (notification) { then(notification); }); }

    function loadGarages() {
        var garagesUrl = itpaHost + "garages";
        var addLayerSettings = { isVisible: true, isHidden: false, useClusters: false };
        addLayerSettings.name = "garages";
        addLayerSettings.zIndex = 24;
        garagesLayer = map.AddFeatureLayer(addLayerSettings);
        getRemoteJSON(garagesUrl, function (notification) {
            var features = notification.data.features;
            garagesKeyedList.UpdateFromNewData(features);
            createMapFeatures();
        });
    }

    function loadOccupancies() {
        var Url = itpaHost + "garages/occupancy";
        var addLayerSettings = { isVisible: true, isHidden: false, useClusters: false };
        addLayerSettings.name = "occupancies";
        addLayerSettings.zIndex = 25;
        occupanciesLayer = map.AddFeatureLayer(addLayerSettings);
        getRemoteJSON(Url, function (notification) {
            var features = notification.data.features;
            occupanciesKeyedList.UpdateFromNewData(features);
            loadGarages();
        });
    }

    function getGarageStyle(props, isHover) {
        var color = "#f00";
        var lineWidth = isHover ? 5 : 3, zindex = isHover ? 5 : 1;
        var style = { line: true, line_color: color, line_width: lineWidth, zindex: zindex };
        return isHover ? [{ line: true, line_color: "#000", line_width: 15, zindex: 3 }, { line: true, line_color: "#fff", line_width: 12, zindex: 4 }, style] : style;
    }

    function getCentroidStyle(props, isHover) {
        var zindex = isHover ? 7 : 2;
        var color = isHover ? "#f00" : "#0b0";
        var style = { marker: true, label: ' ' + props.parking_site_id + ' ', zindex: zindex, marker_color: color, marker_verpos: "bottom" };
        return style;
    }

    function createGarageFeatures() {
        var items = garagesKeyedList.GetKeyedItemList();

        for (var i in items) {
            var item = items[i], itemData = item.GetData(), props = itemData.properties, geometry = itemData.geometry;
            geometry.style = getGarageStyle(props, false);
            geometry.hoverStyle = getGarageStyle(props, true);
            item.garageFeature = new tf.map.Feature(geometry);
            item.garageFeature.garageItem = item;
            item.garageFeature.isGarage = true;
            garagesLayer.AddMapFeature(item.garageFeature, true);
            if (props.centroid) {
                var cg = { type: 'point', coordinates: props.centroid, style: getCentroidStyle(props, false), hoverStyle: getCentroidStyle(props, true) };
                item.centroidFeature = new tf.map.Feature(cg);
                item.centroidFeature.garageItem = item;
                item.centroidFeature.isCentroid = true;
                garagesLayer.AddMapFeature(item.centroidFeature);
            }
        }
        garagesLayer.AddWithheldFeatures();
    }

    function getOccupancyStyle(props, isHover) {
        var zindex = isHover ? 6 : 1;
        var color = isHover ? "#f00" : "#00f";
        var style = { marker: true, label: ' ' + props.parking_site_id + ' ', zindex: zindex, marker_color: color };
        return style;
    }

    function createOccupancyFeatures() {
        var items = occupanciesKeyedList.GetKeyedItemList();

        for (var i in items) {
            var item = items[i], itemData = item.GetData(), props = itemData.properties, geometry = itemData.geometry;
            geometry.style = getOccupancyStyle(props, false);
            geometry.hoverStyle = getOccupancyStyle(props, true);
            item.mapFeature = new tf.map.Feature(geometry);
            item.mapFeature.occupancyItem = item;
            item.mapFeature.isOccupancy = true;
            occupanciesLayer.AddMapFeature(item.mapFeature, true);
            var garageItem = garagesKeyedList.GetItem(props.parking_site_id);
            if (garageItem) {
                garageItem.occupancyItem = item;
                garageItem.occupancyFeature = item.mapFeature;
            }
            else {
                //console.log('occupancy missing garage: ' + props.parking_site_id);
            }
        }
        occupanciesLayer.AddWithheldFeatures();
    }

    function createMapFeatures() {
        createGarageFeatures();
        createOccupancyFeatures();
        onGarageAndOccupancyLoaded();
    }

    function onGarageAndOccupancyLoaded() {
        garageAndOccupancyAreLoaded = true;
        garagesKeyedList.NotifyItemsUpdated();
        urlapiApp.UpdateCurTableFooter();
        console.log(nBadGarages);
        console.log(JSON.stringify(badGarages));
    }

    function getGarageRowContent(notification) {
        var content = undefined;

        if (garageAndOccupancyAreLoaded) {
            var keyedItem = notification.keyedItem;

            if (!!keyedItem) {
                var tolerance = 0.00001;
                var data = keyedItem.GetData();
                var props = data.properties;
                var geometry = data.geometry;

                content = new tf.dom.Div({ cssClass: styles.dLayerInfoClass });

                var contentStyle = content.GetHTMLElement().style;

                contentStyle.textAlign = 'left';
                contentStyle.width = "100%";
                contentStyle.border = "2px solid navy";
                contentStyle.borderRadius = "6px";

                var dim = "1.4em";
                var buttonDim = "1.6em";

                var psid = props.parking_site_id;

                var labelButton = new tf.ui.TextBtn({
                    style: true, label: psid + ': ' + props.identifier, dim: dim, tooltip: props.RouteDescription,
                    //onClick: getRouteLabelOnClick(keyedItem)
                });

                labelButton.GetHTMLElement().style.display = 'block';

                var isIn00 = false;

                var coordinates = geometry.coordinates;
                if (coordinates.length > 0) {
                    if (coordinates[0].length > 0) {
                        if (coordinates[0][0].length == 2) {
                            if (coordinates[0][0][0] == 0) {
                                isIn00 = true;
                            }
                        }
                    }
                }

                var isIn00Text = isIn00 ? "at [0,0]<br/>" : "";

                var occupancy = occupanciesKeyedList.GetItem(psid), ocData, og;

                var occupancyText;

                if (occupancy) {
                    ocData = occupancy.GetData();
                    if (ocData == null) {
                        occupancyText = "MISSING occupancy geometry<br/>";
                    }
                    else {
                        occupancyText = "";
                        og = ocData.geometry.coordinates;
                    }
                }
                else {
                    occupancyText = "MISSING occupancy<br/>";
                }

                var centroidText = "";
                var centroid = props.centroid;

                if (centroid) {
                    if (centroid[0] == 0 || centroid[1] == 0) {
                        centroidText = "ZERO centroid ";
                    }
                    //centroidText = "CENTROID: [" + centroid[0].toFixed(4) + ' ' + centroid[1].toFixed(4) + ']<br/>';
                    if (og) {
                        if (Math.abs(og[0] - centroid[0]) > tolerance || Math.abs(og[1] - centroid[1]) > tolerance) {
                            centroidText = "DIFFERENT centroids";
                        }
                    }
                    else {
                        centroidText += "HAS centroid missing og<br/>"
                    }
                }
                else {
                    if (og) {
                        centroidText = "MISSING centroid and og<br/>";
                    }
                    else {
                        centroidText = "HAS og missing centroid<br/>";
                    }
                }

                var spanText =
                    isIn00Text +
                    centroidText+
                    occupancyText;
                
                var span = tf.urlapi.CreateInfoWindowSpan(spanText);

                content.AddContent(labelButton);
                content.AddContent(span);
            }
        }
        appSizer.UpdateMapSizes();
        return { sender: theThis, content: content };
    }

    function onRefresh() {
        showAll();
    }

    var badGarages = {}, nBadGarages = 0;

    function initialize() {

        styles = tf.GetStyles(tf.styles.GetGraphiteAPIStyleSpecifications());

        garagesKeyedList = new tf.js.KeyedList({
            name: "garages",
            getKeyFromItemData: function (itemData) { return itemData.properties.parking_site_id; },
            needsUpdateItemData: function (itemData) { return true; },
            filterAddItem: function (itemData) {
                var ok = false;
                if (itemData) {
                    var geometry = itemData.geometry;
                    var coordinates = geometry.coordinates;
                    ok = true;
                    if (coordinates.length > 0) {
                        if (coordinates[0].length > 0) {
                            if (coordinates[0][0].length == 2) {
                                if (coordinates[0][0][0] == 0) {
                                    ok = false;
                                }
                            }
                        }
                    }
                    if (!ok) {
                        var id = itemData.properties.parking_site_id;
                        ++nBadGarages;
                        badGarages[id] = id;
                        //console.log(id);
                    }
                }

                return ok;
            }
        });

        occupanciesKeyedList = new tf.js.KeyedList({
            name: "occupancies",
            getKeyFromItemData: function (itemData) { return itemData.properties.parking_site_id; },
            needsUpdateItemData: function (itemData) { return true; },
            filterAddItem: function (itemData) {
                var ok = false;
                if (itemData) {
                    var geometry = itemData.geometry;
                    var coordinates = geometry.coordinates;
                    ok = coordinates[0] != 0 || coordinates[1] != 0;
                }

                return ok;
            }
        });

        var settings = {};

        var appSpecs = {
            "replaceURLParams": {
                //"lat": 25.813894,
                //"lon": -80.122650,
                "level": 16,
                //"level": 15,
                //"level": 12,
                "fmap": "m2",
                "panels": "address+zoom+legend+type+measure+download+maplocation+userlocation+overview+fullscreen+source",
                "legendh": "{Cities::~Capitals:Capitals_WorldMap@wm_Capitals-120-6000;Capitals:Capitals_WorldMap@wm_Capitals-6000-15000;~Metro:Big_Cities_over_million_WorldMap@wm_Cities_Greater_900K-120-5000;Metro:Big_Cities_over_million_WorldMap@wm_Cities_Greater_900K-5000-15000;~Cities:Cities_WorldMap@wm_Cities_75K_to_900K-120-2400+wm_Cities_Greater_900K-120-2400+wm_Cities_Unknownpop-120-2400;Cities:Cities_WorldMap@wm_Cities_75K_to_900K-2400-15000+wm_Cities_Greater_900K-2400-15000+wm_Cities_Unknownpop-2400-15000;};{Hubs::~Ports:Marine_Ports_WorldMap@wm_Marine_Ports-120-360;Ports:Marine_Ports_WorldMap@wm_Marine_Ports-360-2000;~Railway:Railway_Stations_WorldMap@wm_Railway_Stations-120-240;~Airports:Airports_WorldMap@wm_Airports-120-240;};{Water::Bays:Seas_and_Bays_WorldMap@wm_Seas_Bays-120-2000;Glaciers:Glaciers_WorldMap@wm_Glacier-120-4000;~Rivers_B:Lake_and_River_contours_WorldMap@wm_Water_Poly-120-500;~Great_Lakes_L:Great_Lakes_labels_WorldMap@WM_GREAT_LAKES_NAME-120-4000;~Great_Lakes_B:Great_Lakes_contours_WorldMap@wm_Great_Lakes-120-4000;OSM-water:Lake_and_River_contours_from_Open_Street_Maps@osm_water-0-4000;};{Regions::~Admin_L:States_and_Provinces_names_labeled_WorldMap@wm_World_Admin_name-120-2000;~Admin_B:States_and_Provinces_boundaries_WorldMap@wm_World_Admin-120-2000;~Countries_L:Nation_names_labeled_WorldMap@nation_name-2000-5000;Countries_L:Nation_names_labeled_WorldMap@nation_name-5000-30000;~Countries_B:Nations_boundaries_WorldMap@wm_World_Nations-120-15000;OSM-Admin:Administrative_boundaries_from_Open_Street_Maps@osm_admin-0-60000;};{Parcels::FA-address:Addresses_from_First_American_Parcel_Data@fa_address-0-0.5;FA-owner:Property_owner_from_First_American_Parcel_Data@fa_owner-0-0.5;~lines:Property_lines,_from_First_American@fa_parcel-0-1;lines:Property_lines,_from_First_American@fa_parcel-1-2;OSM-buildings:Building_contours_from_Open_Street_Maps@osm_buildings-0-7;};{People::population:People_per_block_per_Census_2000@blk_pop-0-5;income:Aggregate_Neighborhood_Income_and_number_of_homes,_per_Census-2000@bg_mhinc-0.7-10+blkgrpy-0.7-10;};{Services::~business:Yellow_Pages@nypages-0-1.2;business:Yellow_Pages@nypages-1.2-5;food:Restaurants_from_NavTeq@nv_restrnts-0-10;doctors:Physicians_specialties@physicianspecialty-0-5;};Landmarks:Cultural_Landmarks_WorldMap@wm_Cultural_Landmarks-120-240;Utilities:Utilities_WorldMap@wm_Utilities-120-720;Environment:Hydrology@prism-0-120;~Places:Places@gnis2-0-6+hotels-0-6;Places:Places@gnis2-6-24+hotels-6-24;OSM-place-names:Place_names_labeled_from_Open_Street_Maps@osm_place_names-0-30000;{Roads::lines:Road_lines_from_NavTeq@street-0-2000;names:Road_names_labeled_from_NavTeq@street_names-0-240;~OSM-lines:Road_lines_from_Open_Street_Maps@osm_roads-0.5-7000;OSM-lines:Road_lines_from_Open_Street_Maps@osm_roads-0-0.5;~OSM-names:Road_names_labeled_from_Open_Street_Maps@osm_road_names-0-7000;~routes:Garages_WorldMap@wm_Major_Garages-120-1000+wm_Minor_Garages-120-1000;routes:Garages_WorldMap@wm_Major_Garages-1000-5000+wm_Minor_Garages-1000-5000;~railways:Railroad_WorldMap@wm_Railroad_Track-120-2000;};{Towns::~borders:Borders@incorp-0-120;~towns:Cities,_towns@wtown-0-60;};plugin_photo;",
                "legendm": "{OSM::~buildings:Building_outlines@osm_buildings-0-60;~land:Land@osm_land-0-240000;~landuse:Land_usage_information@osm_landuse-0-7000;~place_names:Names_for_country,state,city_and_other small_places@osm_place_names-0-15000;~road_names:Road_names@osm_road_names-0-240;~roads:Roads@osm_roads-0-7000;~water:Water_outlines@osm_water-0-15000;};",
                "address": "",
                "vid": "",
                "passthrough": "",
                "tflogo": "0",
                "type": "map",
                "source": "best_available",
                "rgpopup": 5,
                "help": "<span><b>Double Click</b>: Local Data Reports and Queries<br /><b>Drag</b>: Browse the map<br />Buttons: <b>Full Screen</b>, <b>Reset Rotation</b>, <b>Search Location</b>, <b>Zoom</b>, <b>Map Layers</b><br /><br />Address bar examples:<br />1 Flagler St, Miami, FL<br />Miami<br />Miami, FL<br />33139<br />25.77 -80.19 (coordinates)</span>",
            },

            "separatorStyle": { "backgroundColor": "rgba(0,107,133, 0.8)", "borderLeft": "1px solid#abebfb", "borderRight": "1px solid #00b" },

            "pageStyle": { "color": "#004" },

            "headerStyle": { "backgroundColor": "#333" },
            "contentStyle": { "backgroundColor": "#888" },
            "footerStyle": { "backgroundColor": "#333", "fontSize": "1.2em", "textShadow": "1px 1px 1px #9c9c9c", "color": "#fff" },

            "titleStyle": { "backgroundColor": "#333", "fontSize": "1.5em", "verticalAlign": "middle", "textShadow": "1px 1px 1px #9c9c9c", "color": "#fff" },

            "documentTitle": "MDT View",

            "logoBkColor": "#fff",
            "logoStyle": { "border": "1px solid #ddf" },
            "appLogoImgStr": "./image/hotel.svg",

            "garageTableStyle": { "backgroundColor": "#000" },

            "garageTableRowStyle": {
                "tf-shadow": [-2, -2, 4, "rgba(0,0,0,0.6)"],
                "textShadow": "1px 1px 1px #333",
                "border": "2px solid #fff",
                "backgroundColor": "rgba(255, 255, 255, 0.3)", "color": "#fff", "borderRadius": "8px", "margin": "4px", "padding": "4px", "width": "14em"
            },
            "garageTableRowHoverStyle": {
                "tf-shadow": [3, 3, 6, "rgba(0,0,0,0.8)"],
                "textShadow": "2px 2px 2px #000",
                "border": "2px dotted #000",
                "backgroundColor": "rgba(255, 255, 255, 0.9)", "color": "#fff", "borderRadius": "10px", "margin": "2px", "marginTop": "4px", "marginLeft": "4px", "padding": "8px", "width": "14em"
            },

            "garageTableSelectOnHover": false,
        };

        settings.onCreated = onCreated;

        settings.fullURL = {};
        settings.fullURL[tf.consts.paramNameAppSpecs] = appSpecs;
        
        settings.onAppSpecsLoaded = onAppSpecsLoaded;
        settings.onRefresh = onRefresh;
        settings.initTables = initTables;
        settings.documentTitle = "Garages";

        urlapiApp = new tf.urlapi.AppFromSpecs(settings);
    }
    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};


/*

    incidents:

        http://www.flhsmv.gov/fhp/traffic/crs_hb04.htm


*/