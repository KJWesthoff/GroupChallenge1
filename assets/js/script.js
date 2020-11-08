console.log("is it working..");

var key = "e802f453e0d44b4a8cf3f06882eee4f9";
var keyname = "Ocp-Apim-Subscription-Key";

var stationsStore = JSON.parse(localStorage.getItem("favStationList")) || [];

if(stationsStore.length > 1){
    renderFavorites();
};

//var cors = require('cors');
//app.use(cors());

init = {
  method: "GET",
  headers: { "Ocp-Apim-Subscription-Key": key },
};

// get stations on the map
url_stations =
  "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/stations";

fetchData(url_stations).then(function (data) {
  putMarkersOnMap(data);
});

// dots fiw checking in console
var stationDots;

var putMarkersOnMap = function (dataObj) {
  // function putting markers in the map
  // Inputs:  dataObg: NS-rail API list of station objcts

  for (st of dataObj) {
    var coordinates = [st.lng, st.lat];

    // create a html element for each feature
    var el = document.createElement("div");
    el.innerHTML = '<i class="stationmarker fas fa-train"></i>';
    //el.className = ;
    el.setAttribute("data-obj", JSON.stringify(st));
    el.setAttribute("id", `icn_${st.UICCode}`);
    // make a mapbox marker
    new mapboxgl.Marker(el).setLngLat(coordinates).addTo(map);

    // add popups
    // make a mapbox marker popup
    new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }) // add popups
          .setHTML(`<h4>'${st.namen.middel}</h4><p>${st.stationType}</p><div class="popup_trainlist"></div>`)
      )
      .addTo(map);
  }
};

//Callbacks
clickOnStation = function (event) {
  var el = event.target;

  if (el.classList.contains("stationmarker")) {
    var stationdata = JSON.parse(el.parentElement.getAttribute("data-obj"));

    // Get the station data
    var UICCode = stationdata.UICCode;

    //Get list of arriving trains

    //build url
    url_arrivals = `https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/arrivals?uicCode=${UICCode}`;
    // fetch the arrving train data

    fetchData(url_arrivals).then(function (data) {
      // put the list of trains in the popup for the station
      popUpEl = document.querySelector(".mapboxgl-popup-content");
      listEl = document.querySelector(".popup_trainlist");
      //clear the list element
      listEl.innerHTML = "";
      //listEl.setAttribute("class", "popup_trainlist")
      
      
     
      console.log(data.arrivals)
      for (train of data.arrivals) {
        //console.log(train);
        
        arrivalTime = moment(train.actualDateTime, "YYYY-MM-DDTHH:mm:ssZ").utc(false).format("h:m:a");
    
        var trainlist = `${train.name} From ${train.origin}`;

        itemEl = document.createElement("div");
        itemEl.setAttribute("class", "popup_trainlist")
        itemEl.innerHTML = `<div id="trainlink" class="pure-menu-link" data-train = '${JSON.stringify(train)}' >${trainlist}</div>`;
        listEl.append(itemEl);
      }

     
      popUpEl.append(listEl);
    });

    // put the staion in local storage and re render the favorites list
    addTofavorites(UICCode, stationdata);
    renderFavorites();
  }
};

// add the station to the favorites list
var addTofavorites = function (stationId, Obj) {
  favStationObj = { "stationId": stationId, "stationObj": Obj };

  // check if the station is allready there if it is then replace and prepend
  for (i = 0; i < stationsStore.length; i++) {
  
    if (stationsStore[i].stationId === stationId) {
      stationsStore.splice(i, 1);
    }
  }

  stationsStore.push(favStationObj);

  // trim the array at length 5 by getting the last 5 items for the array
  if (stationsStore.length > 5) {
    stationsStore = stationsStore.slice(
      stationsStore.length - 5,
      stationsStore.length
    );
  }

  localStorage.setItem("favStationList", JSON.stringify(stationsStore));
};


function renderFavorites() {
  // get the favorite list dom element and clear it

  favListDomEl = document.querySelector(".pure-menu-children");
  favListDomEl.innerHTML = "";

  // get the favorites list from Local storage
  stationsList = JSON.parse(localStorage.getItem("favStationList"));

  // loop over station (note last vitited is the last item in list -hence the reverse)
  for (station of stationsList.reverse()) {
    //get the needed data
    var stationName = station.stationObj.namen.lang;

    // make a list element with train data include all the station data in a data-object
    var listEl = document.createElement("li");
    listEl.innerHTML = ` <a data-object = '${JSON.stringify(
      station.stationObj
    )}' href="#" class="pure-menu-link favorite_station">${stationName}</a>`;

    //attach list element to dom
    favListDomEl.appendChild(listEl);
  }
};

// Callback for click on a train
clickOnTrain = function (event) {
  // show the modal
  runModal();
  // get the modal page
  modalPageEl = document.querySelector(".modal-page");
  console.log(modalPageEl);

  // Dig out the train number
  
  var Arrival_data = JSON.parse(event.target.getAttribute("data-train"));
  console.log(Arrival_data);
  
  var trainNo = Arrival_data.product.number

  console.log("Train No " + trainNo);

  // and call function to fetch data and poulate the train data in the modal
  getTrainInfo(trainNo, Arrival_data);
};

var getTrainInfo = function (trainNo, Arrival_data) {
  url = `https://cors-anywhere.herokuapp.com/https://gateway.apiportal.ns.nl/virtual-train-api/api/v1/trein/${trainNo}`;

  //Clear contetnt
  modalContentEl = document.querySelector(".modal-content p");
  modalContentEl.innerHTML = "Fetching Data ...";
  document.querySelector(".features-btn").style.opacity = 1;
  // Fetch train details
  fetch(url, init)
    .then(function (res) {
      if (!res.ok) {
        return;
      }
      console.log("res OK");

      return res.json();
    })
    .then(function (data) {
      console.log(data);

      // Build a html element
      var trainEL = document.createElement("div");

      var trainSets = data.materieeldelen;

      var trainSetTitleEL = document.createElement("span");
      var trainSetImgEL = document.createElement("div");
      trainSetImgEL.setAttribute("class", "trainsetimage");

      var trainSetTitleStr = "";

      // loop over trans in set
      for (trainSet of trainSets) {
        // Build HTML Element
        trainSetTitleStr += trainSet.type + " ";
        var trainImgDiv = document.createElement("div");
        var trainImgEL = document.createElement("img");
        trainImgEL.setAttribute("src", trainSet.afbeelding);
        trainImgEL.setAttribute("class", "trainimage");
        trainImgDiv.appendChild(trainImgEL);
        trainImgDiv.setAttribute("class", "trainimagediv");
        trainSetImgEL.appendChild(trainImgDiv);
      }

      trainSetTitleEL.textContent = "Train Type: " + trainSetTitleStr;

      trainEL.appendChild(trainSetTitleEL);
      trainEL.appendChild(trainSetImgEL);
      //console.log(trainEL);

      // flush and append
      modalContentEl.innerHTML = "";
      modalContentEl.append(trainEL);

      // add arrival time etc
      var detailEl = document.querySelector(".train-details");
      detailEl.innerHTML = `<h4> ${Arrival_data.product.longCategoryName} Train: ${Arrival_data.name}, Arriving From: ${Arrival_data.origin}</h4>`;  

      var arrScheduleEl = document.querySelector(".arrival-time");
      arrivalPlanned = moment(Arrival_data.plannedDateTime).utc(false);
      arrivalActual = moment(Arrival_data.actualDateTime).utc(false);

      if(arrivalPlanned.isSame(arrivalActual)){
        arrivalStatus = "On Time"
      } 
      else if(arrivalPlanned.isAfter(arrivalActual)){
          arrivalStatus = "Early: (" + arrivalActual.format("h:mm:a") + ")";
         
      }
       else if(arrivalPlanned.isBefore(arrivalActual)){
        arrivalStatus = "Delayed: (" + arrivalActual.format("h:mm:a") + ")";
      }
    
        arrScheduleEl.innerHTML = `<h4> Arriving: ${arrivalPlanned.format("h:mm:a")} (${arrivalStatus})</h4>`;  


    })
    .catch(function (error) {
      // tell user the train details cannot be found
      console.log(error); 
      modalContentEl = document.querySelector(".modal-content p");
      modalContentEl.innerHTML = "Details Not Availble For This Train";
      // set details button to disables

      document.querySelector(".features-btn").style.opacity = 0.3;
    });
};

// Main fetch funcition - made async
async function fetchData(url) {
  let res = await fetch(url, init);
  if (!res.ok) {
    console.log("its not working");
  } else {
    console.log("response code" + res.status);
    var data = await res.json();

    return data.payload;
  }
}

clickOnFavStation = function (event) {
  data = JSON.parse(event.target.getAttribute("data-object"));

  map.flyTo({
    center: [data.lng, data.lat],
  });

  document.querySelector(`#icn_${data.UICCode}`).click();
};


// When the user clicks on the button, open the modal
runModal = function () {
  // Get the modal
  var modal = document.getElementById("myModal");

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  modal.style.display = "block";
  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
};


// event listerners

$("body").on("click", "#trainlink", clickOnTrain);

$("body").on("click", ".favorite_station", clickOnFavStation);

document.getElementById("map").addEventListener("click", clickOnStation);
