console.log("is it working..")

var key = "e802f453e0d44b4a8cf3f06882eee4f9";

var keyname = "Ocp-Apim-Subscription-Key";

init = {
    "method":"GET",
    "headers" : {"Ocp-Apim-Subscription-Key":"e802f453e0d44b4a8cf3f06882eee4f9"},
};

url = `https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/disruptions`;


fetch(url, init).then(function(res){
    if(!res.ok){
        console.log("its not working");        
    };    
    console.log("response code" + res.status);
    return res.json();
}).then(function(data){
    console.log(data);
});