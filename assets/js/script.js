console.log("is it working..")

var key = "e802f453e0d44b4a8cf3f06882eee4f9";
var keyname = "Ocp-Apim-Subscription-Key";

var stationsStore = JSON.parse(localStorage.getItem("favStationList")) || [];


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
        
        addTofavorites(UICCode,stationdata);
    };

}; 

// add the station to the favorites list
var addTofavorites = function(stationId, Obj){
    
    favStationObj = {"stationId":stationId,
                    "stationObj":Obj};    

    // check if the station is allready there if it is then replace and prepend
    for(i = 0; i<stationsStore.length; i++){
        if(stationsStore[i].id === stationId){
            stationsStore.splice(i,1);
        };
    };

    stationsStore.push(favStationObj);

    // trim the array at length 20 by getting the last 20 items for the array
    if (stationsStore.length > 20){
        stationsStore = stationsStore.slice(stationsStore.length-20,stationsStore.length);
    } 

    console.log(stationsStore.length);     
    localStorage.setItem("favStationList",JSON.stringify(stationsStore));
    

}



// Callback for click on a train
clickOnTrain = function(event){
    // show the modal
    runModal();
    // get the modal page
    modalPageEl =document.querySelector(".modal-page");
    console.log(modalPageEl);


    // Dig out the train number 
    var trainNo = event.target.getAttribute("data-train");
    console.log("Train No "+ trainNo);
    
    // and call function to fetch data and poulate the train data in the modal
    getTrainInfo(trainNo);
    
};


var getTrainInfo = function(trainNo){
    url = `https://cors-anywhere.herokuapp.com/https://gateway.apiportal.ns.nl/virtual-train-api/api/v1/trein/${trainNo}`;

    //Clear contetnt
    modalContentEl = document.querySelector(".modal-content p")
    modalContentEl.innerHTML = "Fetching Data ...";
    document.querySelector(".features-btn").style.opacity = 1;
    // Fetch train details
    fetch(url,init).then(function(res){      
        if(!res.ok){
            return
        }
        console.log("res OK")

        return res.json()
    }).then(function(data){
        
        console.log(data);
        
        // Build a html element 
        var trainEL = document.createElement("div");

        var trainSets = data.materieeldelen;
        
        var trainSetTitleEL = document.createElement("span");
        var trainSetImgEL = document.createElement("div");
        trainSetImgEL.setAttribute("class", "trainsetimage")

        var trainSetTitleStr = "";
        
        // loop over trans in set
        for(trainSet of trainSets){ 
            // Build HTML Element
            trainSetTitleStr += trainSet.type + " ";
            var trainImgDiv = document.createElement("div");
            var trainImgEL = document.createElement("img");
            trainImgEL.setAttribute("src", trainSet.afbeelding) 
            trainImgEL.setAttribute("class", "trainimage") 
            trainImgDiv.appendChild(trainImgEL);
            trainImgDiv.setAttribute("class", "trainimagediv")
            trainSetImgEL.appendChild(trainImgDiv);
        }
        
        trainSetTitleEL.textContent = trainSetTitleStr;

        trainEL.appendChild(trainSetTitleEL) ; 
        trainEL.appendChild(trainSetImgEL);
        console.log(trainEL);
        
        // flush and append
        modalContentEl.innerHTML = "";
        modalContentEl.append(trainEL); 

    }).catch(function(error){
        // tell user the train details cannot be found
        modalContentEl = document.querySelector(".modal-content p")
        modalContentEl.innerHTML = "Details Not Availble For This Train";
        // set details button to disables

        document.querySelector(".features-btn").style.opacity = 0.3;
        
    });
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



// When the user clicks on the button, open the modal
runModal = function(){

    // Get the modal
    var modal = document.getElementById("myModal");

    

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];
        
    modal.style.display = "block";
    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
    modal.style.display = "none";

    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
};    
    


