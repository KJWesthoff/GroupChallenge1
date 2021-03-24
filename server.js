const express = require('express');
var path = require('path');


// server configuration
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static(__dirname));

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}`)
  });