const express = require("express");
const cors = require("cors");
const path = require("path");
const fetch = require('node-fetch');

// server configuration
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static(__dirname));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/api/train/:id", (req,res) =>{
  console.log("In the Backend")
  const trainNo = req.params['id'];

  const url = `https://gateway.apiportal.ns.nl/virtual-train-api/api/v1/trein/${trainNo}`;

  const key = "8a46a746ffeb4c2aa0a3111af249e9e3";

  init = {
    method: "GET",
    headers: {"Ocp-Apim-Subscription-Key": key},                
  };

   // Fetch train details via the backend
   fetch(url, init)
   .then(result => {
    if (!result.ok) {
      console.log("res NOT ok"); 
      return;
    }
    console.log("res OK");
    result.json()  .then(data => {
      console.log("Getting json data for: " + trainNo)
      res.json(data) // stuff the data on the res obj
    }) 
  })
   

  
} )

app.listen(PORT, () => {
  console.log(`API server now on port ${PORT}`);
});
