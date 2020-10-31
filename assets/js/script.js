console.log("is it working..")

var key = "e802f453e0d44b4a8cf3f06882eee4f9";

var keyname = "Ocp-Apim-Subscription-Key";

init = {
    "method":"GET",
    "headers":{keyname:key},
};


// lst of stations

url_stations = "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/stations"



// dots fiw checking in console
var stationDots



var buildGeodataObj = function(data){

    stationList = []
        for(station of data){
            // make a geojson featureCollection for each station        
            featureObj = {
                "type":"Feature",
                "geometry": {
                    "type":"point",
                    "coordinates": [station.lng,station.lat],
                },
                "properties":{
                    "title":`${station.stationType}`,
                    "description":`${station.namen.middel}`,
                } 
            };
            stationList.push(featureObj);
        };
        
        // build a geoJSON obj
        stationsGeodata = {
            "type":"FeatureCollection",
            "features": stationList,
        }

    return stationsGeodata 
};
    
    
var putMarkersOnMap = function(geodataObj, markerClassName){

        for(st of geodataObj.features){

            // create a html element for each feature
            var el = document.createElement('div');
            el.innerHTML = '<i class="fas fa-train"></i>';
            el.className = markerClassName;

            // make a mapbox marker
            new mapboxgl.Marker(el).setLngLat(st.geometry.coordinates).addTo(map);

            // make a mapbox marker popup
            new mapboxgl.Marker(el)
                .setLngLat(st.geometry.coordinates)
                .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
                    .setHTML(`<h4>'${st.properties.title}</h4><p>${st.properties.description}</p>`))
                .addTo(map);            
        };
        
}

// Main part fetch

fetch(url_stations, init).then(function(res){
    if(!res.ok){
        console.log("its not working");        
    };    
    console.log("response code" + res.status);
    return res.json();
}).then(function(data){
    

    // get the data and plot the stations
    var stationGeoDataObj = buildGeodataObj(data.payload);
    putMarkersOnMap(stationGeoDataObj, "stationmarker");
    
});

