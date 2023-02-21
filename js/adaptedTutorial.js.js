//initilize map and set center of map with coordinates
var map= L.map('mapid', {
    center: [20, 0],
    zoom: 2
});


//adding tileset layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);




/* Map of GeoJSON city data from map.geojson */
//declare map var in global scope
//function to instantiate Leaflet map
function createMap(){
    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData();
};


//function to attach popups to each mapped feature
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent)
        //.addTo(map);
    };
};
//function to retrieve the data and place it on the map
function getData(){
    //load the data
    fetch("data/map.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                onEachFeature:onEachFeature
            }).addTo(map);
            
        })
};

document.addEventListener('DOMContentLoaded',createMap)