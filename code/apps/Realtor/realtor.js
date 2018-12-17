"use strict";

tf.apps.Realtor = {};

tf.apps.Realtor.Realtor = function (settings) {

    var imageNullURL = "http://ts.cs.fiu.edu/qBthum3iz";
    var theThis, styles;

    var field_Lat = "lat";
    var field_Lon = "lon";
    var field_Photo = "photo";
    var field_PhotoURL = "photo_url";
    var field_ListPrice = "list_price";
    var field_ApproximateLotSize = "approximate_lot_size";
    var field_NumberOfBeds = "number_of_beds";
    var field_SqFtLivingArea = "sqft_liv_area";
    var field_NumberOfHBaths = "number_of_hbaths";
    var field_NumberOfFBaths = "number_of_fbaths";
    var field_StreetAddress = "street_address";
    var field_MLS = "mls";
    var field_DevelopmentName = "development_name";
    var field_YearBuilt = "year_built";
    var field_TypeOfProperty = "type_of_property";

    var mapFeatures = [];

    var fieldsFilter = [
    field_Lat, field_Lon, field_ListPrice, field_Photo, field_PhotoURL, field_NumberOfBeds, field_NumberOfHBaths, field_MLS, field_DevelopmentName, field_YearBuilt, field_TypeOfProperty,
    field_NumberOfFBaths, field_StreetAddress, field_SqFtLivingArea, field_ApproximateLotSize];

    var rambParameterCriteriaName = "criteria";
    var defaultRambParamCriteria = true;
    var rambParamCriteria = defaultRambParamCriteria;

    var rambParameterListingExpandName = "listingexpand";
    var defaultRambParamListingExpand = true;
    var rambParamListingExpand = defaultRambParamListingExpand;

    var rambParameterBrokerName = "broker";
    var defaultRambParameterBroker = "";
    var rambParamBroker = defaultRambParameterBroker;

    var listingsInfoTitle = "Listing";
    var documentTitle = null;

    var pictureToolTop = "See full size picture";
    var detailsToolTipStr = "See detailed information about this listing";
    var detailsLabelStr = "Details";
    var locationLabelStr = "Location";
    var locationToolTipStr = "See information in the general location of this listing";
    var nearbyLabelStr = "Nearby";
    var nearbyToolTipStr = "See information nearby this listing";
    var proLabelStr = "Pro";
    var proToolTipStr = "Professional detail report for realtors only";
    var defaultsButtonToolTip = "Restore default options";
    var cancelButtonToolTip = "Hide search options";

    var rambParameterRefererName = "referer";
    var defaultRambParameterReferer = "rambflash";
    var rambParamReferer = defaultRambParameterReferer;

    var fieldsSortBy = [field_ListPrice, field_NumberOfBeds, field_SqFtLivingArea];
    var nSortTypes = fieldsSortBy.length;

    var rambParameterSortByName = "sort_by";
    var defaultSortTypeIndex = 0;
    var defaultRambParameterSortBy = fieldsSortBy[defaultSortTypeIndex];
    var curSortTypeIndex = defaultSortTypeIndex;

    var rambSortOrderAsc = "asc";
    var rambSortOrderDsc = "desc";
    var rambParameterSortOrderName = "order";
    var invertSort = false;

    var rambParameterTypeOfProperty_All = "all";
    var rambParameterTypeOfProperty_Condo = "condo";
    var rambParameterTypeOfProperty_Single = "single";
    var rambParameterTypeOfProperty_TownHouse = "townhouse";
    var rambParameterTypeOfProperty_Mobile = "mobile";
    var rambParameterTypeOfProperty_Rental = "rental";
    var rambParameterTypeOfProperty_ForeClosed = "foreclosed";
    var rambParameterTypeOfProperty_ShortSale = "shortsale";

    var rambAllTypesOfProperty = [
    rambParameterTypeOfProperty_All,
    rambParameterTypeOfProperty_Condo,
    rambParameterTypeOfProperty_Single,
    rambParameterTypeOfProperty_TownHouse,
    rambParameterTypeOfProperty_Mobile,
    rambParameterTypeOfProperty_Rental,
    rambParameterTypeOfProperty_ForeClosed,
    rambParameterTypeOfProperty_ShortSale
    ];

    var rambParameterTypesOfProperty = [];

    rambParameterTypesOfProperty[rambParameterTypeOfProperty_All] = { label: "All", query: "" };
    rambParameterTypesOfProperty[rambParameterTypeOfProperty_Condo] = { label: "Condo", query: "CONDO" };
    rambParameterTypesOfProperty[rambParameterTypeOfProperty_Single] = { label: "House", query: "SINGLE" };
    rambParameterTypesOfProperty[rambParameterTypeOfProperty_TownHouse] = { label: "Townhouse", query: "TOWNHSE" };
    rambParameterTypesOfProperty[rambParameterTypeOfProperty_Mobile] = { label: "Mobile", query: "MOBILE" };
    rambParameterTypesOfProperty[rambParameterTypeOfProperty_Rental] = { label: "Rental", query: "RENTAL" };
    rambParameterTypesOfProperty[rambParameterTypeOfProperty_ForeClosed] = { label: "Foreclosed", query: "REO" };
    rambParameterTypesOfProperty[rambParameterTypeOfProperty_ShortSale] = { label: "Short Sale", query: "short_sale" };

    var rambParameterTypeOfPropertyName = "type_of_property";
    var defaultRambParameterTypeOfProperty = rambParameterTypeOfProperty_All;
    var typeOfProperty = defaultRambParameterTypeOfProperty;

    var rambParameterKeywordsName = "keywords";
    var defaultRambParameterKeywords = "";
    var keywords = defaultRambParameterKeywords;

    var rambParameterMaxEvalName = "maxeval";
    var defaultRambParameterMaxEval = "10000";
    var rambMaxParameterMaxEval = 10000;
    var paramMaxEval = parseInt(defaultRambParameterMaxEval, 10);

    var rambParameterLimitName = "limit";
    var defaultRambParameterLimit = "300";
    var rambMaxParameterLimit = 3000;
    var paramLimit = parseInt(defaultRambParameterLimit, 10);

    var paramMaxSuffix = "_max", paramMinSuffix = "_min";

    var rambParamPriceName = "price";
    var rambParamPriceMaxName = rambParamPriceName + paramMaxSuffix;
    var rambParamPriceMinName = rambParamPriceName + paramMinSuffix;
    var defaultRambMaxPriceParam = 6000000, defaultRambMinPriceParam = 0;

    var rambParamBedName = "bed";
    var rambParamBedMaxName = rambParamBedName + paramMaxSuffix;
    var rambParamBedMinName = rambParamBedName + paramMinSuffix;
    var defaultRambMaxBedParam = 8, defaultRambMinBedParam = 0;

    var rambParamAreaName = "area";
    var rambParamAreaMaxName = rambParamAreaName + paramMaxSuffix;
    var rambParamAreaMinName = rambParamAreaName + paramMinSuffix;
    var defaultRambMaxAreaParam = 8000, defaultRambMinAreaParam = 0;

    var priceRentLabel = "Price or Rent";
    var bedroomsLabel = "Bedrooms";
    var squareFeetLabel = "Square Feet";

    var rambNumParams = [];

    rambNumParams[rambParamPriceMaxName] = { defaultVal: defaultRambMaxPriceParam, currentVal: defaultRambMaxPriceParam, isFloat: true, geThan: rambParamPriceMinName };
    rambNumParams[rambParamPriceMinName] = { defaultVal: defaultRambMinPriceParam, currentVal: defaultRambMinPriceParam, isFloat: true, leThan: rambParamPriceMaxName };

    rambNumParams[rambParamBedMaxName] = { defaultVal: defaultRambMaxBedParam, currentVal: defaultRambMaxBedParam, isFloat: false, geThan: rambParamBedMinName };
    rambNumParams[rambParamBedMinName] = { defaultVal: defaultRambMinBedParam, currentVal: defaultRambMinBedParam, isFloat: false, leThan: rambParamBedMaxName };

    rambNumParams[rambParamAreaMaxName] = { defaultVal: defaultRambMaxAreaParam, currentVal: defaultRambMaxAreaParam, isFloat: true, geThan: rambParamAreaMinName };
    rambNumParams[rambParamAreaMinName] = { defaultVal: defaultRambMinAreaParam, currentVal: defaultRambMinAreaParam, isFloat: true, leThan: rambParamAreaMaxName };

    var rambNumParamBaseNames = [rambParamPriceName, rambParamBedName, rambParamAreaName];
    var rambNumParamLabels = [priceRentLabel, bedroomsLabel, squareFeetLabel];
    var rambNumParamNames = [rambParamPriceMaxName, rambParamPriceMinName, rambParamBedMaxName, rambParamBedMinName, rambParamAreaMaxName, rambParamAreaMinName];

    function setMinMaxParam(paramName, paramVal) {
        if (typeof paramName === "string" && paramName.length) {
            var theParam = rambNumParams[paramName];
            var theOtherParam = null;

            if (!!theParam) {
                theParam.currentVal = theParam.isFloat ?
                    tf.js.GetFloatNumberInRange(paramVal, 0, 999999999, theParam.defaultVal) :
                    tf.js.GetIntNumberInRange(paramVal, 0, 999999999, theParam.defaultVal);
                if (theOtherParam = rambNumParams[theParam.geThan]) {
                    if (theOtherParam.currentVal > theParam.currentVal) {
                        theOtherParam.currentVal = theParam.currentVal;
                    }
                }
                else if (theOtherParam = rambNumParams[theParam.leThan]) {
                    if (theOtherParam.currentVal < theParam.currentVal) {
                        theOtherParam.currentVal = theParam.currentVal;
                    }
                }
            }
        }
    }

    function getURLMinMaxParams(params) {
        var nNumParms = rambNumParamNames.length;
        var thisParamVal = null;

        for (var i = 0 ; i < nNumParms ; ++i) {
            var thisParamName = rambNumParamNames[i];
            if (thisParamVal = params[thisParamName]) {
                setMinMaxParam(thisParamName, thisParamVal);
            }
        }
    }

    function getURLParams() {
        var params = settings.fullURL;

        if (tf.js.GetIsNonEmptyString(params)) { params = tf.urlapi.ParseURLAPIParameters(params); }

        if (tf.js.GetIsValidObject(params)) {
            getURLMinMaxParams(params);

            var thisParamVal = null;

            if (thisParamVal = params[rambParameterCriteriaName]) {
                rambParamCriteria = tf.js.GetBoolFromValue(thisParamVal);
            }

            if (thisParamVal = params[rambParameterListingExpandName]) {
                rambParamListingExpand = tf.js.GetBoolFromValue(thisParamVal);
            }

            if (thisParamVal = params[rambParameterBrokerName]) {
                rambParamBroker = thisParamVal.replace(/%20/g, " ").replace(/\+/g, " ");
                documentTitle = rambParamBroker + " " + tf.consts.MLSDocumentTitle2;
            }

            if (thisParamVal = params[rambParameterRefererName]) { rambParamReferer = thisParamVal; }

            if (thisParamVal = params[rambParameterSortByName]) {
                var index = fieldsSortBy.indexOf(thisParamVal.toLowerCase());
                if (index >= 0) { curSortTypeIndex = index; }
            }

            if (thisParamVal = params[rambParameterSortOrderName]) {
                invertSort = ((thisParamVal = thisParamVal.toLowerCase()) == rambSortOrderDsc);
            }

            if (thisParamVal = params[rambParameterTypeOfPropertyName]) {
                if (rambParameterTypesOfProperty[thisParamVal = thisParamVal.toLowerCase()]) { typeOfProperty = thisParamVal; }
            }

            if (thisParamVal = params[rambParameterKeywordsName]) {
                keywords = thisParamVal.replace(/%20/g, " ").replace(/\+/g, " ");
            }

            if (thisParamVal = params[rambParameterMaxEvalName]) {
                paramMaxEval = tf.js.GetIntNumberInRange(thisParamVal, 0, rambMaxParameterMaxEval, paramMaxEval);
            }

            if (thisParamVal = params[rambParameterLimitName]) {
                paramLimit = tf.js.GetIntNumberInRange(thisParamVal, 0, rambMaxParameterLimit, paramLimit);
            }
        }
        return params;
    }

    var hcfLayout = null, contentList = null, loadingDataContentObj = null, singleAppTableOnTheSide = null;
    var selectedRow = null, selectedMarker = null;
    var toolBarObj = null, sortFieldButtonObj = null, sortOrderButtonObj = null, settingsButtonObj = null;
    var createdCallBack = null, appContainerSizer = null, twoHorPaneLayout = null, settingsOnResize = null;
    var dLayers = null, tMap = null, tLayer = null;
    var moveEndListener = null, doubleClickListener = null, downloadObj = null;
    var m_CriteriaSQL = "", m_ProCriteriaSQL = "";
    var lastQueryCenter = null;
    var autoRefresh = false, showingSettings = false;
    var searchInputFormToolBar = null, searchInputFormObj = null, newPropertyTypeSearch = null;
    var searchKeywordsTipPlaceHolder = "type search keywords", clearKeywordsToolTip = "Clear keywords";
    var inputKeywords = null;
    var defaultsSearchButton = null;
    var zIndexNormal = 1, zIndexSelected = 2;

    this.RemoveFromMap = function () {
        if (tMap) {
            if (moveEndListener) { moveEndListener.OnDelete(); moveEndListener = null; }
            if (doubleClickListener) { doubleClickListener.OnDelete(); doubleClickListener = null; }
            if (tLayer) { tMap.RemoveLayer(tLayer); tLayer = null; }
        }
    }

    function scrollTo(tableRow) { contentList.EnsureVisible(tableRow); }

    var rambPropsName = "_tfprops_ramb";

    function unselectRow(tableRow) {
        if (tableRow) {
            var tMarker = tf.js.GetObjProperty(tableRow, rambPropsName).tMarker;
            tMarker.ChangeStyle({ marker_color: "#07375f", font_height: 14, zindex: zIndexNormal });
        }
    }

    function selectRow(tableRow, scrollToItBool) {
        if (tableRow) {
            var needsSelect = false;
            var tMarker = tf.js.GetObjProperty(tableRow, rambPropsName).tMarker;
            var contentValue = tf.js.GetObjProperty(tMarker, rambPropsName).contentValue;

            needsSelect = true;

            if (needsSelect) {
                if (selectedRow) { unselectRow(selectedRow); selectedRow = null; selectedMarker = null; }
                if (!!scrollToItBool) { scrollTo(tableRow); }
                else {
                    var markerPos = tMarker.GetPointCoords();
                    tMap.AnimatedSetCenterIfDestVisible(markerPos);
                }

                tableRow.Select(scrollToItBool, true);
                selectedMarker = tMarker;
                tMarker.ChangeStyle({ marker_color: "0x19B600", font_height: 16, zindex: zIndexSelected });
                //if (contentValue) { tMap.ShowInfoPopup(listingsInfoTitle, contentValue, tMarker.GetPointCoords()); }
                tf.urlapi.ShowdLayerInfoWindow(tMarker);
                selectedRow = tableRow;
            }
        }
    }

    function onClickFeature(notification) { return onFeatureHoverInOut(notification); }

    function onFeatureHoverInOut(notification) {
        if (!tMap.IsInfoPopupPinned()) {
            var mapFeature = notification.mapFeature;

            if (!!mapFeature) {
                var props = tf.js.GetObjProperty(mapFeature, rambPropsName);
                var tableRow = props ? props.tableRow : null;

                if (tableRow) { selectRow(tableRow, true); }
            }
        }
    }

    function onContentSelect(notification) {
        if (tMap.IsInfoPopupPinned()) { tMap.ToggleInfoPopupPin(); }
        if (notification.selected !== notification.prevSelected) {
            selectRow(notification.selected, false);
        }
    }

    function onMoveEnd() { checkRefreshLayer(); }

    function setAutoRefresh(autoRefreshSet) {
        if (autoRefresh != (autoRefreshSet = !!autoRefreshSet)) {
            if (autoRefresh = autoRefreshSet) { checkRefreshLayer(); }
        }
    }

    function doRefreshLayer() {
        if (!tMap.GetIsAnimating()) {

            selectedMarker = null;
            selectedRow = null;
            tMap.HideOpenPopups();
            if (tLayer) { tLayer.RemoveAllFeatures(); mapFeatures = []; }
            if (contentList) {
                setLoadingDataContent();
                contentList.Clear();
            }

            hcfLayout.SetIsShowingFooter(false);

            var bounds = tMap.GetVisibleExtent();
            var X1 = bounds[0], Y1 = bounds[1], X2 = bounds[2], Y2 = bounds[3];
            var centerX = (X1 + X2) / 2, centerY = (Y1 + Y2) / 2;
            var distance = tf.units.GetDistanceInMetersBetweenMapCoords([X1, Y1], [X2, Y2]) / 2.0;
            var dmiles = distance * 0.000621371192;
            var criteriaSQL = m_CriteriaSQL;

            var queryURL = "http://acorn.cs.fiu.edu/cgi-bin/arquery.cgi?category=callreal" +
                "&Long=" + centerX +
                "&Lat=" + centerY +
                "&d=" + dmiles +
                "&maxeval=" + paramMaxEval +
                "&limit=" + paramLimit +
                "&numfind=" + paramLimit +
                "&filetype=.json" +
                "&arcriteria=1&timeout=5" +
                criteriaSQL +
                getKeywordsParam();

            //tf.GetDebug().LogIfTest(queryURL);

            if (downloadObj == null) { downloadObj = new tf.ajax.JSONGet(); } else { downloadObj.Cancel(); }

            downloadObj.Request(queryURL, OnRambLoaded, theThis);
            lastQueryCenter = tMap.GetCenter();
        }
    }

    function createInfoWindowLink (href, label, toolTip, target, cssClass) {
        var link = null; if (!!href) {
            link = document.createElement('a');
            link.href = href;
            link.title = toolTip;
            link.innerHTML = label;
            link.target = !!target ? target: '_blank';
            if (!!cssClass) {
                link.className = cssClass;
            }
        }
        return link;
    }


    function buildDLayerFeatureInfoWindow (props, desiredTarget) {
        var div = new tf.dom.Div({ cssClass: tf.GetStyles().dLayerInfoClass });
        var thisProp;
        var linkTarget = !!desiredTarget ? desiredTarget : '_blank';

        if (thisProp = createInfoWindowLink(props.Display_Link_Detail, "Detail", "View Detail Report", linkTarget)) { div.AddContent(thisProp); }
        if (thisProp = createInfoWindowLink(props.Display_Link_Report_Recentered, "Nearby", "View Nearby Report", linkTarget)) { div.AddContent(thisProp); }
        if (thisProp = createInfoWindowLink(props.Display_Link_Location, "Location", "View Location Report", linkTarget)) { div.AddContent(thisProp); }
        if (thisProp = createInfoWindowLink(props.Display_Link_Pro, "Pro", "Professional detail report for realtors only", linkTarget)) { div.AddContent(thisProp); }

        if (thisProp = tf.urlapi.CreateInfoWindowSpan(props.Display_Summary_Short_Text)) { div.AddContent(thisProp); }

        if (props.Display_Thumbnail) {
            if (thisProp = createInfoWindowLink(props.Display_Link_Detail, "", "View Detail Report", linkTarget)) {
                var imgProp = tf.urlapi.CreateInfoWindowImg(props.Display_Thumbnail);
                if (imgProp) { imgProp.AppendTo(thisProp); div.AddContent(thisProp); }
            }
            else if (thisProp = tf.urlapi.CreateInfoWindowImg(props.Display_Thumbnail)) { div.AddContent(thisProp); }
        }

        if (thisProp = tf.urlapi.CreateInfoWindowSpan(props.Display_Summary_Longer_Text)) { div.AddContent(thisProp); }
        else if (thisProp = tf.urlapi.CreateInfoWindowSpan(props.Display_Summary_Midsize_Text)) { div.AddContent(thisProp); }

        if (thisProp = props.Display_Label) { if (thisProp.length > 1) { props.popupTitle = thisProp; } }

        props.infoWindowContent = div;
    };


    function OnRambLoaded(data) {
        if (tMap && tLayer && tf.js.GetIsValidObject(data) && tf.js.GetIsValidObject(data = data.data) && tf.js.GetIsArray(data.features)) {
            var nRecords = data.features.length;

            if (nRecords > 0) {

                var getFloatRangeFnc = tf.js.GetFloatNumberInRange;

                var bounds = tMap.GetVisibleExtent();
                var minLat = bounds[1], minLon = bounds[0], maxLat = bounds[3], maxLon = bounds[2];

                for (var iRecord = 0 ; iRecord < nRecords ; ++iRecord) {
                    var thisRecord = data.features[iRecord].properties;

                    var thisLat = tf.js.GetLatitudeFrom(thisRecord[field_Lat]);
                    var thisLon = tf.js.GetLatitudeFrom(thisRecord[field_Lon]);

                    if (true || thisLat >= minLat && thisLat <= maxLat && thisLon >= minLon && thisLon <= maxLon) {
                        var listPrice = thisRecord[field_ListPrice];
                        var listPriceNumber = listPrice ? parseFloat(listPrice) : 0;
                        var priceK = '$' + (numericG(listPrice) ? K(listPrice) : listPrice);

                        //var tMarker = tLayer.AddMarker(thisLat, thisLon, priceK);
                        var tMarker = new tf.map.Feature({ type: "point", coordinates: [thisLon, thisLat], style: { marker: true, label: priceK } });
                        var props = { record: thisRecord };

                        tLayer.AddMapFeature(tMarker);
                        mapFeatures.push(tMarker);
                        tMarker.ChangeStyle({ marker_color: "0x07375f", font_color: "#fff", border_color: "#a4a4a4" });

                        tf.js.SetObjProperty(tMarker, tf.consts.DLayerProperty, { properties: thisRecord, label: "MLS", map: tMap, dLayer: theThis });

                        tf.urlapi.BuildDLayerFeatureInfoWindow(thisRecord, '_blank');

                        /*var infoWindowContent = thisRecord.infoWindowContent;
                        var propE = infoWindowContent.GetHTMLElement();

                        var children = propE.children;
                        for (var i = 0; i < children.length; i++) {
                            var child = children[i];

                            if (child.target != undefined) {
                                child.setAttribute('target', '_blank');
                            }
                        }*/

                        var photoURL = thisRecord[field_Photo];

                        if (!photoURL) {
                            photoURL = imageNullURL + thisLon + "qALz" + thisLat; //used in the side data table
                        }
                        else { photoURL = photoURL.split(' ')[0]; }

                        var photoURLBig = photoURL;

                        var numberBeds = thisRecord[field_NumberOfBeds];
                        var numberBedsNumber = getFloatRangeFnc(numberBeds, 0, 100, 0);
                        var nHalfBaths = getFloatRangeFnc(thisRecord[field_NumberOfHBaths], 0, 100, 0);
                        var nBaths = getFloatRangeFnc(thisRecord[field_NumberOfHBaths], 0, 100, 0);

                        var mls = thisRecord[field_MLS];
                        var community = thisRecord[field_DevelopmentName];
                        var yearBuilt = thisRecord[field_YearBuilt];
                        var propertyType = thisRecord[field_TypeOfProperty];

                        var streetAddress = thisRecord[field_StreetAddress];
                        var sqftLivingArea = thisRecord[field_SqFtLivingArea];
                        var sqftLivingAreaNumber = sqftLivingArea ? parseFloat(sqftLivingArea) : 0;
                        var sqft = sqftLivingAreaNumber <= 0.001 ? '' : sqftLivingArea + ' s/f';

                        if (numberBedsNumber <= 0.001) { numberBeds = '' };

                        if (listPriceNumber <= 0.001) { sqft = ''; }

                        var approxLotSize = thisRecord[field_ApproximateLotSize];
                        var approxLotSizeNumber = getFloatRangeFnc(approxLotSize, 0, 9999999, 0);

                        if (approxLotSizeNumber < 5000 || !approxLotSize) { approxLotSize = ''; }

                        props.ramb = {
                            lat: thisLat,
                            lon: thisLon,
                            priceK: priceK,
                            photoURL: photoURL,
                            photoURLBig: photoURLBig,
                            numberBeds: numberBeds,
                            numberBedsNumber: numberBedsNumber,
                            nBaths: nBaths,
                            nHalfBaths: nHalfBaths,
                            mls: mls,
                            community: community,
                            yearBuilt: yearBuilt,
                            propertyType: propertyType,
                            streetAddress: streetAddress,
                            sqftLivingArea: sqftLivingArea,
                            sqftLivingAreaNumber: sqftLivingAreaNumber,
                            sqft: sqft,
                            listPrice: listPrice,
                            listPriceNumber: listPriceNumber,
                            approxLotSize: approxLotSize,
                            approxLotSizeNumber: approxLotSizeNumber
                        };

                        props.contentValue = createMarkerContent(props.ramb);

                        tf.js.SetObjProperty(tMarker, rambPropsName, props);
                    }
                }
            }

            sortMarkers();
            setToolBar();
        }
    }

    function buildPriceKLink(lat, lon, mls) {
        var mlsStr = !!mls ? "&mls=" + mls : "";
        var priceKLinkURL = 'http://vn4.cs.fiu.edu/cgi-bin/arquery.cgi?category=callreal';
        return encodeURI(priceKLinkURL + "&x1=" + lon + "&y1=" + lat + "&referer=" + rambParamReferer + "&fulldisplay=1&arcriteria=1" + mlsStr + m_CriteriaSQL);
    }

    function buildNearbyLink(lat, lon) {
        var nearbyLinkURL = 'http://vn4.cs.fiu.edu/cgi-bin/gnis.cgi?tfaction=arquerycallreal';
        return encodeURI(nearbyLinkURL + "&Long=" + lon + "&Lat=" + lat + "&referer=" + rambParamReferer + "&arcriteria=1" + m_CriteriaSQL);
    }

    function buildLocationLink(lat, lon) {
        var locationLinkURL = 'http://vn4.cs.fiu.edu/cgi-bin/gnis.cgi?';
        return encodeURI(locationLinkURL + "Long=" + lon + "&Lat=" + lat + "&referer=" + rambParamReferer + "&arcriteria=1" + m_CriteriaSQL);
    }

    function buildProLink(lat, lon, mls) {
        var proLinkURL = 'http://vn4.cs.fiu.edu/cgi-bin/arquery.cgi?category=allreal';
        var mlsStr = !!mls ? "&mls=" + mls : "";
        return encodeURI(proLinkURL + "&x1=" + lon + "&y1=" + lat + "&referer=" + rambParamReferer + '&fulldisplay=1&arcriteria=1' + mlsStr + m_ProCriteriaSQL + '&status=A');
    }

    function openLinkHRef(theLink) { theLink += getKeywordsParam(); window.open(theLink, "_blank"); }

    function onDoubleClick(notification) { var theLink = buildNearbyLink(notification.eventCoords[1], notification.eventCoords[0]); theLink += getKeywordsParam(); window.open(theLink, "_blank"); }

    function getKeywordsParam() {
        return displayif("&anyfield=", keywords.replace(/^  */, '').replace(/ *$/, '').replace(/[^a-zA-Z0-9@_-]+/g, '&anyfield='), ""); // append keywords to the url if provided
    }

    var linkTarget = "_blank";

    function createMarkerContent(propsRamb) {

        var contentDivObj = new tf.dom.Div({cssClass: styles.dLayerInfoClass});
        var lon = propsRamb.lon, lat = propsRamb.lat, mls = propsRamb.mls;
        var priceKLink = buildPriceKLink(lat, lon, mls);
        var nearbyLink = buildNearbyLink(lat, lon);
        var locationLink = buildLocationLink(lat, lon);
        var proLink = buildProLink(lat, lon, mls);

        contentDivObj.AddContent(tf.urlapi.CreateInfoWindowLink(priceKLink, detailsLabelStr, detailsToolTipStr, linkTarget));
        contentDivObj.AddContent(tf.urlapi.CreateInfoWindowLink(nearbyLink, nearbyLabelStr, nearbyToolTipStr, linkTarget));
        contentDivObj.AddContent(tf.urlapi.CreateInfoWindowLink(locationLink, locationLabelStr, locationToolTipStr, linkTarget));
        contentDivObj.AddContent(tf.urlapi.CreateInfoWindowLink(proLink, proLabelStr, proToolTipStr, linkTarget));

        var textDivObj = new tf.dom.Span();
        var priceKLinkA = tf.urlapi.CreateInfoWindowLink(priceKLink, propsRamb.priceK, detailsToolTipStr, linkTarget);

        var spanText = new tf.dom.Span();
        var contentText = "";
        var nBaths = propsRamb.nBaths + propsRamb.nHalfBaths / 2;

        if (propsRamb.numberBedsNumber > 0) { contentText += " " + propsRamb.numberBedsNumber + " bedroom"; }
        if (nBaths > 0) { contentText += " " + nBaths + " bathroom"; }
        if (propsRamb.sqft != '') { contentText += " " + propsRamb.sqft; }
        if (propsRamb.propertyType) { contentText += " " + propsRamb.propertyType; }
        if (propsRamb.approxLotSize) { contentText += " on " + propsRamb.approxLotSize + "sq.ft lot"; }
        if (propsRamb.streetAddress) { contentText += " at " + propsRamb.streetAddress; }
        if (propsRamb.yearBuilt) { contentText += " built in " + propsRamb.yearBuilt; }
        if (propsRamb.community) { contentText += " in <b>" + propsRamb.community + "</b>"; }

        contentText += '.';

        spanText.AddContent(contentText);

        textDivObj.AddContent(priceKLinkA);
        textDivObj.AddContent(spanText);

        var photoLink = tf.urlapi.CreateInfoWindowLink(propsRamb.photoURLBig, "", pictureToolTop, "_blank");
        var imgObj = tf.urlapi.CreateInfoWindowImg(propsRamb.photoURL);
        imgObj.AppendTo(photoLink);

        contentDivObj.AddContent(textDivObj);
        contentDivObj.AddContent(photoLink);

        return contentDivObj;
    }

    function buildSortDisplayText() { return getSortByStr() + ' (' + (invertSort ? "de" : "a") + 'scending)'; }

    function incSortType() {
        if (++curSortTypeIndex >= nSortTypes) { curSortTypeIndex = 0; }
        if (sortFieldButtonObj) {
            sortFieldButtonObj.SetText(getSortByStr());
        }
    }

    function invertSortOrder() { invertSort = !invertSort; }

    var fieldFriendlyNames = [];

    fieldFriendlyNames.lat = "Lat";
    fieldFriendlyNames.lon = "Lon";
    fieldFriendlyNames.list_price = "Price";
    fieldFriendlyNames.photo = "Photo";
    fieldFriendlyNames.photoURL = "Photo URL";
    fieldFriendlyNames.number_of_beds = "Bedrooms";
    fieldFriendlyNames.number_of_hbaths = "Half Baths";
    fieldFriendlyNames.mls = "mls";
    fieldFriendlyNames.development_name = "Community";
    fieldFriendlyNames.year_built = "Year";
    fieldFriendlyNames.type_of_property = "Type";
    fieldFriendlyNames.number_of_fbath = "Full Baths";
    fieldFriendlyNames.street_address = "Address";
    fieldFriendlyNames.sqft_liv_area = "Square Feet";
    fieldFriendlyNames.approximate_lot_size = "Lot Size";

    function getFieldFriendlyName(fieldIDStr) {
        return typeof fieldIDStr === "string" && fieldIDStr.length ?
            fieldFriendlyNames[fieldIDStr] : null;
    }

    function getSortByStr() { return getFieldFriendlyName(fieldsSortBy[curSortTypeIndex]); }

    function doCompare(val1, val2) {
        var comparison = val1 < val2 ? -1 : (val1 > val2 ? 1 : 0);
        if (invertSort) { comparison = -comparison; }
        return comparison;
    }

    function doSortByPrice(tMarker1, tMarker2) {
        return doCompare(tf.js.GetObjProperty(tMarker1, rambPropsName).ramb.listPriceNumber, tf.js.GetObjProperty(tMarker2, rambPropsName).ramb.listPriceNumber);
    }

    function doSortByBeds(tMarker1, tMarker2) {
        return doCompare(tf.js.GetObjProperty(tMarker1, rambPropsName).ramb.numberBedsNumber, tf.js.GetObjProperty(tMarker2, rambPropsName).ramb.numberBedsNumber);
    }

    function doSortBySqFtArea(tMarker1, tMarker2) {
        return doCompare(tf.js.GetObjProperty(tMarker1, rambPropsName).ramb.sqftLivingAreaNumber, tf.js.GetObjProperty(tMarker2, rambPropsName).ramb.sqftLivingAreaNumber);
    }

    function doSortByApproximateLotSize(tMarker1, tMarker2) {
        return doCompare(tf.js.GetObjProperty(tMarker1, rambPropsName).ramb.approxLotSizeNumber, tf.js.GetObjProperty(tMarker2, rambPropsName).ramb.approxLotSizeNumber);
    }

    function doSortMarkers(sortFunction) {
        if (tf.js.GetFunctionOrNull(sortFunction)) {
            mapFeatures.sort(sortFunction);
        }
    }

    function sortMarkers() {
        var curFieldSortBy = fieldsSortBy[curSortTypeIndex];
        if (curFieldSortBy == field_ListPrice) { doSortMarkers(doSortByPrice); }
        else if (curFieldSortBy == field_NumberOfBeds) { doSortMarkers(doSortByBeds); }
        else if (curFieldSortBy == field_SqFtLivingArea) { doSortMarkers(doSortBySqFtArea); }
        else if (curFieldSortBy == field_ApproximateLotSize) { doSortMarkers(doSortByApproximateLotSize); }
        selectedRow = null;
        buildDataRows();
    }

    function addMarkerRow(tMarker, isLastRowBool) {
        var markerProps = tf.js.GetObjProperty(tMarker, rambPropsName);
        var thisRamb = markerProps ? markerProps.ramb : null;
        var row = null;

        if (thisRamb) {
            var row = new tf.ui.TableRow();

            var imageColObj = styles.CreateListContentItemWithImgBk(thisRamb.photoURL);
            var textColObj = styles.CreateListContentItem();
            var textCol = textColObj.GetHTMLElement();

            textCol.style.maxWidth = "10em";

            var label = thisRamb.priceK + ' ' + thisRamb.numberBeds + '/' + thisRamb.nBaths;
            var lat = thisRamb.lat, lon = thisRamb.lon, mls = thisRamb.mls;
            var priceKLink = buildPriceKLink(lat, lon, mls);
            var proLink = buildProLink(lat, lon, mls);

            var priceKLinkA = tf.urlapi.CreateInfoWindowLink(priceKLink, label, detailsToolTipStr, linkTarget, styles.buttonShapedLinkClass);
            var proLinkA = tf.urlapi.CreateInfoWindowLink(proLink, proLabelStr, proToolTipStr, linkTarget, styles.buttonShapedLinkClass);
            var spanText = new tf.dom.Span();

            spanText.AddContent('<br />' + thisRamb.sqft + '<br />' + thisRamb.streetAddress);

            textColObj.AddContent(priceKLinkA);
            textColObj.AddContent(proLinkA);
            textColObj.AddContent(spanText);

            row.AddContent(imageColObj);
            row.AddContent(textColObj);

            var rowProps = { tMarker: tMarker };

            markerProps.tableRow = row;
            tf.js.SetObjProperty(row, rambPropsName, rowProps);

            contentList.AppendRow(row);
        }
        return row;
    }

    function buildDataRows() {
        if (contentList) { contentList.Clear(); }
        else { if (!contentList) { contentList = new tf.ui.Table({ onSelect: onContentSelect, optionalScope: theThis, selectOnHover: true }); } }

        var markers = mapFeatures;
        var nMarkers = markers ? markers.length : 0;
        var lastMarker = nMarkers - 1;
        var firstRow = null;

        for (var iMarker = 0 ; iMarker < nMarkers ; ++iMarker) {
            var thisMarker = markers[iMarker];
            var thisProps = tf.js.GetObjProperty(thisMarker, rambPropsName) ;
            var thisRamb = thisProps ? thisProps.ramb : null;

            if (thisRamb) {
                var thisRow = addMarkerRow(thisMarker, iMarker == lastMarker);
                if (!firstRow) { firstRow = thisRow; }
                if (!selectedRow) {
                    if (selectedMarker == thisMarker) {
                        selectedRow = thisRow;
                    }
                }
            }
        }

        hcfLayout.SetContent(contentList);
        if (!selectedRow) { selectedRow = firstRow; }
        selectRow(selectedRow, true);
        hcfLayout.SetIsShowingFooter(true);
        updateFooter();
    }

    var footerStrHtml = "";

    function updateFooter(clearBool) {

        footerStrHtml = "";

        if (!clearBool) {
            var markers = mapFeatures;
            var nRecords = markers ? markers.length : 0;

            if (nRecords == 0) { footerStrHtml = "No matching listings.<br>Zoom out or change options."; }
            else {
                var recordStr = nRecords > 1 ? " listings " : " listing ";
                var sortedByStr = nRecords > 1 ? "<br/>Sorted by: " + buildSortDisplayText() : "";
                footerStrHtml = nRecords + recordStr + "found." + sortedByStr;
            }
        }

        hcfLayout.SetFooter(footerStrHtml);
    }

    function checkRefreshLayer(forceRefresh) {
        if (tLayer.GetIsVisible()) {
            var mapCenter = tMap.GetCenter();

            if (((!!forceRefresh)) ||
                ((autoRefresh) && (lastQueryCenter == null || lastQueryCenter.Latitude != mapCenter.Latitude || lastQueryCenter.Longitude != mapCenter.Longitude))) {
                doRefreshLayer();
            }
        }
    }

    function forceRefreshDLayers() { if (!!dLayers) { dLayers.RefreshAll(); } }
    function onForceRefresh() { onConfirmForm(); checkRefreshLayer(true); forceRefreshDLayers(); }
    function onSettings() { setSearchInputFormContent(); }
    function onContent() { setSearchResultsContent(); }
    function onIncSortType() { incSortType(); sortMarkers(); }
    function onInvertSortOrder() { invertSortOrder(); sortMarkers(); }

    function changeheaderAddOnDiv(newContent) { hcfLayout.SetHeader(newContent); }

    function setLoadingDataContent() { changeheaderAddOnDiv(loadingDataContentObj); }
    function setToolBar() { changeheaderAddOnDiv(toolBarObj); }

    function onToggleSettings() { if (showingSettings) { onContent(); } else { onSettings(); } }

    function createToolBar() {
        var refreshButtonObj = null;
        var buttonDim = 24;
        var usingLight = true;

        toolBarObj = hcfLayout.CreateUnPaddedDivForHeader();
        toolBarObj.AddContent(refreshButtonObj = styles.AddButtonDivMargins(
            new tf.ui.SvgGlyphBtn({ style: usingLight, glyph: tf.styles.SvgGlyphRefreshName, onClick: onForceRefresh, tooltip: "Refresh", dim: buttonDim })
            ));
        toolBarObj.AddContent(settingsButtonObj = styles.AddButtonDivMargins(
            new tf.ui.SvgGlyphBtn({ style: usingLight, glyph: tf.styles.SvgGlyphGearName, onClick: onToggleSettings, tooltip: "Settings", dim: buttonDim })
            ));
        toolBarObj.AddContent(defaultsSearchButton = styles.AddButtonDivMargins(
            new tf.ui.SvgGlyphBtn({ style: usingLight, glyph: tf.styles.SvgGlyphUndoName, onClick: fillFormWithDefaults, tooptip: defaultsButtonToolTip, dim: buttonDim })
            ));
        toolBarObj.AddContent(sortOrderButtonObj = styles.AddButtonDivMargins(
            new tf.ui.SvgGlyphToggleBtn({
                style: usingLight, onClick: onInvertSortOrder, dim: buttonDim, isToggled: false,
                glyph: tf.styles.SvgGlyphSortDescendingName, tooltip: "Sort descending", toggledGlyph: tf.styles.SvgGlyphSortAscendingName, toggledTooltip: "Sort ascending"
            })
        ));
        toolBarObj.AddContent(sortFieldButtonObj = styles.AddButtonDivMargins(new tf.ui.TextBtn({ style: usingLight, label: getSortByStr(), onClick: onIncSortType, tooltip: "Sorted by", dim: buttonDim })));

        refreshButtonObj.ChangeToolTip("Search for listings in the map area");
        defaultsSearchButton.GetHTMLElement().style.display = 'none';
    }

    function setSearchResultsContent() {
        showingSettings = false;

        defaultsSearchButton.GetHTMLElement().style.display = 'none';

        setToolBar();
        //settingsButtonObj.SetStyle(true);
        settingsButtonObj.ChangeToolTip("Show search options");
        toolBarObj.GetHTMLElement().removeChild(searchInputFormToolBar.GetHTMLElement());
        hcfLayout.SetContent(contentList);
    }

    function setSearchInputFormContent() {
        showingSettings = true;

        defaultsSearchButton.GetHTMLElement().style.display = 'inline-block';

        //settingsButtonObj.SetStyle(false);
        settingsButtonObj.ChangeToolTip(cancelButtonToolTip);
        fillFormWithCurrent();
        setToolBar();
        toolBarObj.AddContent(searchInputFormToolBar);
        hcfLayout.SetContent(contentList);
    }

    function setNewPropertySearch(theButton) {
        newPropertyTypeSearch = theButton.GetValue();
        return false;
    }

    function createTypePopupSearchSection(underContainerObj, isFirstBool, isLastBool) {
        var typeCol = styles.CreateListContentItem(true);
        var typeColElem = typeCol.GetHTMLElement();
        var radioButtonList = new tf.ui.RadioButtonList();
        var nRambAllTypesOfProperty = rambAllTypesOfProperty.length;
        var lastIndex = nRambAllTypesOfProperty - 1;
        var labelRow = new tf.dom.Div({cssClass: styles.GetUnPaddedDivClassNames(false, true)});

        typeColElem.style.textAlign = "left";

        labelRow.GetHTMLElement().innerHTML = "Type of property";
        typeCol.AddContent(labelRow);

        for (var i = 0 ; i < nRambAllTypesOfProperty ; i++) {
            var thisType = rambAllTypesOfProperty[i];
            var isLast = i == lastIndex;
            var thisFriendlyName = rambParameterTypesOfProperty[thisType].label;

            var thisRadioButton = radioButtonList.AddRadioButton(thisFriendlyName, thisType, thisType == typeOfProperty, thisFriendlyName, !isLast);
            var changeType = function (theButton) {
                return function () {
                    theButton.SetIsChecked(true); return setNewPropertySearch(theButton);
                }
            }(thisRadioButton);

            thisRadioButton.SetOnClick(changeType, theThis, undefined);
            rambParameterTypesOfProperty[thisType].radioButton = thisRadioButton;
        }

        typeCol.AddContent(radioButtonList);
        typeCol.AppendTo(underContainerObj);
    }

    function setTypePopupSearchSectionFrom(theTypeOfProperty) {
        var source = rambParameterTypesOfProperty[theTypeOfProperty];
        if (source) { source.radioButton.SetIsChecked(true); newPropertyTypeSearch = theTypeOfProperty; }
    }

    function setTypePopupSearchSectionFromDefault() { setTypePopupSearchSectionFrom(defaultRambParameterTypeOfProperty); }

    function setTypePopupSearchSectionFromCurrent() { setTypePopupSearchSectionFrom(typeOfProperty); }

    function createMinMaxFieldsSearchSection(underContainerObj, isFirstBool, isLastBool) {
        var minMaxCol = styles.CreateListContentItem(true);
        var minMaxColElem = minMaxCol.GetHTMLElement();
        var nMinMax = rambNumParamBaseNames.length;
        var lastIndex = nMinMax - 1;

        minMaxColElem.style.verticalAlign = "top";
        minMaxColElem.style.textAlign = "left";

        for (var i = 0 ; i < nMinMax ; i++) {
            var isLast = i == lastIndex;
            var thisBaseParamName = rambNumParamBaseNames[i];
            var thisMaxParam = rambNumParams[thisBaseParamName + paramMaxSuffix];
            var thisMinParam = rambNumParams[thisBaseParamName + paramMinSuffix];
            var thisLabelParam = rambNumParamLabels[i];
            var thisMaxCurrentVal = thisMaxParam.currentVal;
            var thisMinCurrentVal = thisMinParam.currentVal;
            var thisRow = new tf.dom.Div({cssClass: styles.GetPaddedDivClassNames(false, true)});
            var promptCol = styles.CreateListContentItem(true);
            var inputCol = styles.CreateListContentItem(true);
            var labelRow = new tf.dom.Div({cssClass: styles.GetUnPaddedDivClassNames(false, true)});
            var promptColElem = promptCol.GetHTMLElement();

            labelRow.GetHTMLElement().innerHTML = thisLabelParam;

            promptColElem.innerHTML = "Min:<br/>Max:<br/>";
            promptColElem.textAlign = "right";

            var inputTextMin = new tf.dom.TextInput({ label: "min " + thisLabelParam, value: thisMinCurrentVal, tooltip: "min " + thisLabelParam });
            var inputTextMax = new tf.dom.TextInput({ label: "max " + thisLabelParam, value: thisMaxCurrentVal, tooltip: "max " + thisLabelParam });

            var inputTextMinElem = inputTextMin.GetHTMLElement();
            var inputTextMaxElem = inputTextMax.GetHTMLElement();

            thisMinParam.input = inputTextMin;
            thisMaxParam.input = inputTextMax;

            styles.AddBorderBottom(inputTextMin, false);
            inputTextMinElem.style.display = 'block';
            inputTextMinElem.size = 10;

            styles.AddBorderBottom(inputTextMax, false);
            inputTextMaxElem.style.display = 'block';
            inputTextMaxElem.size = 10;

            inputTextMin.AppendTo(inputCol);
            inputTextMax.AppendTo(inputCol);

            labelRow.AppendTo(minMaxCol);
            promptCol.AppendTo(thisRow);
            inputCol.AppendTo(thisRow);
            thisRow.AppendTo(minMaxCol);
        }

        minMaxCol.AppendTo(underContainerObj);
    }

    function setMinMaxSectionFromDefault() {
        var nMinMax = rambNumParamBaseNames.length;
        for (var i = 0 ; i < nMinMax ; i++) {
            var thisBaseParamName = rambNumParamBaseNames[i];
            var thisMaxParam = rambNumParams[thisBaseParamName + paramMaxSuffix];
            var thisMinParam = rambNumParams[thisBaseParamName + paramMinSuffix];

            thisMinParam.input.SetValue(thisMinParam.defaultVal.toString());
            thisMaxParam.input.SetValue(thisMaxParam.defaultVal.toString());
        }
    }

    function setMinMaxSectionFromCurrent() {
        var nMinMax = rambNumParamBaseNames.length;
        for (var i = 0 ; i < nMinMax ; i++) {
            var thisBaseParamName = rambNumParamBaseNames[i];
            var thisMaxParam = rambNumParams[thisBaseParamName + paramMaxSuffix];
            var thisMinParam = rambNumParams[thisBaseParamName + paramMinSuffix];

            thisMinParam.input.SetValue(thisMinParam.currentVal.toString());
            thisMaxParam.input.SetValue(thisMaxParam.currentVal.toString());
        }
    }

    function onClearKeywords() { inputKeywords.SetValue(""); }

    function createKeywordsSearchSection(underContainerObj) {
        var keywordsRow = new tf.dom.Div({cssClass: styles.GetPaddedDivClassNames(false, false)});
        var keywordsRowElem = keywordsRow.GetHTMLElement();
        var keywordsLabel = document.createTextNode("Keywords: ");
        var buttonDim = 16;
        var clearKeywordsButton = styles.AddButtonDivLeftMargin(new tf.ui.TextBtn({ style: false, label: styles.GetUnicodeXClose(), onClick: onClearKeywords, tooltip: clearKeywordsToolTip, dim: buttonDim }));

        inputKeywords = new tf.dom.TextInput({ label: searchKeywordsTipPlaceHolder, value: keywords, tooltip: searchKeywordsTipPlaceHolder });

        var inputKeywordsElem = inputKeywords.GetHTMLElement();

        styles.AddBorderTop(keywordsRow, true);
        styles.AddBorderBottom(inputKeywords, false);
        inputKeywordsElem.size = 24;

        keywordsRow.AddContent(keywordsLabel);
        inputKeywords.AppendTo(keywordsRow);
        keywordsRow.AddContent(clearKeywordsButton);

        keywordsRow.AppendTo(underContainerObj);
    }

    function setKeywordsSectionFromDefault() { inputKeywords.SetValue(defaultRambParameterKeywords); }

    function setKeywordsSectionFromCurrent() { inputKeywords.SetValue(keywords); }

    function fillFormWithCurrent() {
        setTypePopupSearchSectionFromCurrent();
        setMinMaxSectionFromCurrent();
        setKeywordsSectionFromCurrent();
    }

    function fillFormWithDefaults() {
        setTypePopupSearchSectionFromDefault();
        setMinMaxSectionFromDefault();
        setKeywordsSectionFromDefault();
    }

    function extractFormValues() {
        var nMinMax = rambNumParamBaseNames.length;
        for (var i = 0 ; i < nMinMax ; i++) {
            var thisBaseParamName = rambNumParamBaseNames[i];
            var thisMaxParamName = thisBaseParamName + paramMaxSuffix;
            var thisMinParamName = thisBaseParamName + paramMinSuffix;
            var thisMaxParam = rambNumParams[thisMaxParamName];
            var thisMinParam = rambNumParams[thisMinParamName];

            setMinMaxParam(thisMinParamName, thisMinParam.input.GetValue());
            setMinMaxParam(thisMaxParamName, thisMaxParam.input.GetValue());
        }
        typeOfProperty = newPropertyTypeSearch;
        keywords = inputKeywords.GetValue();
    }

    function onConfirmForm() {
        extractFormValues();
        fillFormWithCurrent();
        updateSearchCriteria();
    }

    function createSearchInputForm() {

        searchInputFormObj = new tf.dom.Div({cssClass: styles.inputFormClass});

        createMinMaxFieldsSearchSection(searchInputFormObj, true, true);
        createTypePopupSearchSection(searchInputFormObj, false, true);
        createKeywordsSearchSection(searchInputFormObj);

        searchInputFormToolBar = hcfLayout.CreateUnPaddedDivForHeader();
        searchInputFormToolBar.AddContent(searchInputFormObj);
    }

    function updateSearchCriteria() {
        var listPriceField = "&list_price";
        var numberOfBedsField = "&number_of_beds";
        var livingAreaField = "&sqft_liv_area";
        var totalAreaField = "&approx_sqft_total_area";
        var geOp = ">=", leOp = "<=";

        m_CriteriaSQL =
            listPriceField + leOp + rambNumParams[rambParamPriceMaxName].currentVal + listPriceField + geOp + rambNumParams[rambParamPriceMinName].currentVal +
            numberOfBedsField + leOp + rambNumParams[rambParamBedMaxName].currentVal + numberOfBedsField + geOp + rambNumParams[rambParamBedMinName].currentVal;

        m_ProCriteriaSQL = m_CriteriaSQL;

        var rambMaxAreaParam = rambNumParams[rambParamAreaMaxName].currentVal;
        var rambMinAreaParam = rambNumParams[rambParamAreaMinName].currentVal;

        m_CriteriaSQL += livingAreaField + leOp + rambMaxAreaParam + livingAreaField + geOp + rambMinAreaParam;
        m_ProCriteriaSQL += totalAreaField + leOp + rambMaxAreaParam + totalAreaField + geOp + rambMinAreaParam;

        if (typeOfProperty != rambParameterTypeOfProperty_All) {
            var typeOfPropertyField = "&type_of_property";
            var queryVal = typeOfPropertyField + "=" + rambParameterTypesOfProperty[typeOfProperty].query;

            m_CriteriaSQL += queryVal; m_ProCriteriaSQL += queryVal;
        }
    }

    function numericG(value) {
        return (mlike(value, '[0-9]') && mlike(value, '^[0-9./:-]*$') && !mlike(value, '^[0-9][0-9][0-9]-'));
    }
    function K(nbr) {
        return nbr != undefined ? (nbr < 10000 ? (nbr > 30 ? Math.round(nbr) : Math.round(nbr * 100) / 100) : (nbr > 1000000 ? Math.round(nbr / 10000) / 100 + 'M' : Math.round(nbr / 1000) + 'K')) : 0;
    }
    function mlike(str, expression) {
        if (str === undefined) { return ""; }
        var e = new RegExp(expression, 'i');
        return (('' + str).search(e) >= 0)
    }
    function displayif(preffix, value, suffix) {
        return value !== undefined ? (mlike(value + '', '[^ 0]') ? preffix + value + (typeof (suffix) == 'undefined' ? '' : suffix) : '') : '';
    }

    function onMapCreated(notification) {
        var singleMapApp = singleAppTableOnTheSide.GetSingleAppMapContentOnTheSide();
        twoHorPaneLayout = singleMapApp.GetLeftSeparatorRightLayout();
        appContainerSizer = singleMapApp.GetAppContainerSizer();
        appContainerSizer.OnResize();

        updateSearchCriteria();

        tMap = singleMapApp.GetMap();
        tMap.ShowPanel(tf.consts.panelNameFullscreen, true);
        dLayers = singleMapApp.GetDLayers();

        tMap.SetGoDBOnDoubleClick(false);

        moveEndListener = tMap.AddListener(tf.consts.mapMoveEndEvent, onMoveEnd);
        doubleClickListener = tMap.AddListener(tf.consts.mapDblClickEvent, onDoubleClick);

        tLayer = tMap.AddFeatureLayer({ isVisible: true, isHidden: true, zIndex: 50 });
        tMap.AddListener(tf.consts.mapFeatureClickEvent, onClickFeature);
        tMap.AddListener(tf.consts.mapFeatureHoverInOutEvent, onFeatureHoverInOut);
        //tLayer.SetOnClickListener(onClick);
        //tLayer.SetOnMouseMoveListener(onMouseMove);

        hcfLayout = singleAppTableOnTheSide.GetHCFLayout();

        var brokerObj = hcfLayout.CreateUnPaddedDivForHeader(), brokerDiv = brokerObj.GetHTMLElement();

        styles.AddBorderTop(brokerObj, true);
        styles.AddBorderBottom(brokerObj, true);
        styles.ApplyTextAlignCenterStyle(brokerObj);
        brokerDiv.title = documentTitle;
        brokerDiv.innerHTML = rambParamBroker ? rambParamBroker : documentTitle;
        hcfLayout.AddToHeader(brokerObj);

        loadingDataContentObj = hcfLayout.CreateUnPaddedDivForHeader();
        var loadingDataContent = loadingDataContentObj.GetHTMLElement();

        loadingDataContent.style.textAlign = "center";
        loadingDataContent.innerHTML = "Searching for listings...";

        createToolBar();
        createSearchInputForm();

        setLoadingDataContent();
        checkRefreshLayer(true);

        if (rambParamCriteria) { onSettings(); }
        if (rambParamListingExpand) { twoHorPaneLayout.SetRightSideCollapsed(false); }
        if (!!createdCallBack) { setTimeout(function () { createdCallBack({ ramb: theThis }); }, 1); }
    }

    function initialize() {

        styles = tf.GetStyles(tf.styles.GetGraphiteAPIStyleSpecifications());

        settings = tf.js.GetValidObjectFrom(settings);
        documentTitle = tf.consts.MLSDocumentTitle;

        var params = getURLParams();

        createdCallBack = tf.js.GetFunctionOrNull(settings.onCreated);

        singleAppTableOnTheSide = new tf.urlapi.SingleMapHCFOnTheSideApp({
            app: theThis, documentTitle: documentTitle, onCreated: onMapCreated, fullURL: params,
            appLogoImgStr: tf.platform.MakePlatformPath("image/svg/ramLogo.svg"), 
            logoBkColor: styles.GetSubStyles().containerDarkSelBackgroundColor
        });
    }

    (function actualConstructor(theThisSet) { theThis = theThisSet; initialize(); })(this);
};

var g_Realtor = new tf.apps.Realtor.Realtor({ fullURL: window.location.href });
