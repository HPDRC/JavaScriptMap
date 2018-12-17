"use strict";

function tf_global_includeTFAPI () {
    var apiURL = "http://tfcore.cs.fiu.edu/hterramap/mapapi.js";
    var params = window.location.href.toLowerCase();
    
    if (!!params) {
        var splitChars = ['#', '?'];

        for (var i = 0 ; i < 2 ; ++i) {
            var splitChar = splitChars[i];
            if (params.indexOf(splitChar) >= 0) { params = params.split(splitChar)[1]; break; }
        }

        if (!!params) {
            params = params.split('&');

            for (var i = 0, nParams = params.length ; i < nParams ; ++i) {
                var thisParam = params[i].split('=');
                if (thisParam[0].trim() == 'api.terramap') {
                    switch (thisParam[1].trim()) {
                        case 'test': apiURL = "http://experiment2.cs.fiu.edu/hterramap/test/mapapi.js"; break;
                        case 'stage': apiURL = "http://experiment2.cs.fiu.edu/hterramap/stage/mapapi.js"; break;
                        case 'prod': break;
                        default: apiURL = decodeURI(thisParam[1]); break;
                    }
                    break;
                }
            }
        }
    }
    document.write('<script type="text/javascript" src="' + apiURL + '"></script>');
}
tf_global_includeTFAPI();
