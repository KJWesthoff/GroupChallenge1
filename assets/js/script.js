console.log("is it working..")

var key = "e802f453e0d44b4a8cf3f06882eee4f9";

var keyname = "Ocp-Apim-Subscription-Key";

init = {
    "method":"GET",
    "headers" : {"Ocp-Apim-Subscription-Key":"e802f453e0d44b4a8cf3f06882eee4f9"},
};



// Disruptions to train service
url_disruptions = `https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/disruptions`;


// lst of stations

url_stations = "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/stations"
data = consoleLogData(url_stations);


function consoleLogData(url){

    fetch(url, init).then(function(res){
        if(!res.ok){
            console.log("its not working");        
        };    
        console.log("response code" + res.status);
        return res.json();
    }).then(function(data){
        
       

        for(station of data.payload){
            
            var name = station.namen.middel
            var country = station.land
            var lon = station.lng
            var lat = station.lat

            var string = `${name} country ${country} at: lat,lon : ${lat},${lon}`;

            console.log(string)


        };
    });
};
