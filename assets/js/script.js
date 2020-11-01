console.log("is it working..")

var key = "e802f453e0d44b4a8cf3f06882eee4f9";

var keyname = "Ocp-Apim-Subscription-Key";

init = {
    "method":"GET",
    "headers":{"Ocp-Apim-Subscription-Key":key},
};


// lst of stations

url_stations = "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/stations"



// dots fiw checking in console
var stationDots

        
var putMarkersOnMap = function(dataObj){
    // function putting markers in the map
    // Inputs:  dataObg: NS-rail API list of station objcts
    

        for(st of dataObj){

            var coordinates = [st.lng,st.lat]

            // create a html element for each feature
            var el = document.createElement('div');
            el.innerHTML = '<i class="stationmarker fas fa-train"></i>';
            //el.className = ;
            el.setAttribute("data-obj", JSON.stringify(st));

            // make a mapbox marker
            new mapboxgl.Marker(el).setLngLat(coordinates).addTo(map);

            // make a mapbox marker popup
            new mapboxgl.Marker(el)
                .setLngLat(coordinates)
                .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
                    .setHTML(`<h4>'${st.namen.middel}</h4><p>${st.stationType}</p>`))
                .addTo(map);            
        };
        
}


//Callbacks
clickOnStation = function(event){
    var el = event.target;
    
    

    if(el.classList.contains("stationmarker")){
        var stationdata = JSON.parse(el.parentElement.getAttribute("data-obj"));
        
        // Add whatever happens here..
        
        
        // Get the station data
        var UICCode = stationdata.UICCode

        //Get list of arriving trains

        //build url
        url_arrivals = `https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/arrivals?uicCode=${UICCode}`
        // fetch the arrving train data
        var arrivingTrains = fetchData(url_arrivals).then(function(data){
        console.log(data.arrivals);
        });
        
    };
    


}; 


// Main fetch funcition - made async
async function fetchData(url){
    let res = await fetch(url, init);
    if(!res.ok){
        console.log("its not working");        
    } else {    
        console.log("response code" + res.status);  
        var data = await res.json();
        
        return data.payload
    };    
};






fetch(url_stations, init).then(function(res){
    if(!res.ok){
        console.log("its not working");        
    };    
    console.log("response code" + res.status);
    return res.json();
}).then(function(data){
    

    // get the data and plot the stations
    putMarkersOnMap(data.payload);  
});


document.getElementById("map").addEventListener("click", clickOnStation);


