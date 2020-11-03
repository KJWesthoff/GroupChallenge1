console.log("is it working..")

var key = "e802f453e0d44b4a8cf3f06882eee4f9";
var keyname = "Ocp-Apim-Subscription-Key";




//var cors = require('cors');
//app.use(cors());

init = {
    "method":"GET",
    "headers":{"Ocp-Apim-Subscription-Key":key},
    

};

// get stations on the map
url_stations = "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/stations"

fetchData(url_stations).then(function(data){
    putMarkersOnMap(data)
});




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
            
            // add popups
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
        
        fetchData(url_arrivals).then(function(data){
        
        // put the list of trains in the popup for the station    
          
        listEl = document.createElement("ol");
        //console.log(data.arrivals) 
        for(train of data.arrivals){
            var trainlist = `${train.product.longCategoryName} ${train.name} From ${train.origin}`;
            
            itemEl = document.createElement("li");
            itemEl.innerHTML = `<p id="trainlink" data-train = "${train.product.number}" >${trainlist}</p>`;
            listEl.append(itemEl)
            

        };
       
        popUpEl = document.querySelector(".mapboxgl-popup-content")
        popUpEl.append(listEl)
        
        });
        
    };

}; 

var getTrainInfo = function(trainNo){
    url = `https://cors-anywhere.herokuapp.com/https://gateway.apiportal.ns.nl/virtual-train-api/api/v1/trein/${trainNo}`;

    fetch(url,init).then(function(res){
        
        return res.json()
    }).then(function(data){
        console.log(data);
    });
};


// get tracks on the map
//fetch("https://cors-anywhere.herokuapp.com/https://gateway.apiportal.ns.nl/virtual-train-api/api/v1/trein/1406",init).then(function(res){
//    console.log(res);
//    return res.json()
//}).then(function(data){
//    console.log(data)
//})




clickOnTrain = function(event){
    var trainNo = event.target.getAttribute("data-train");
    console.log("Train No "+ trainNo);
    getTrainInfo(trainNo);
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



$("body").on("click", "#trainlink",clickOnTrain);



document.getElementById("map").addEventListener("click", clickOnStation);


