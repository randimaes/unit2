    //initilize map and set center of map with coordinates
    var map= L.map('mapid', {
        center: [20, 0],
        zoom: 2
    });



/* Map of GeoJSON city data from map.geojson */
//declare map var in global scope
//function to instantiate Leaflet map
function createMap(){

    //add OSM base tilelayer
    L.tileLayer('https://api.mapbox.com/styles/v1/randimaes/cla2pcahc000h15m3fortplk0/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicmFuZGltYWVzIiwiYSI6ImNsYTJveDBuMzBqOTkzcG1oZ3dyNXE5ZjEifQ.KopBuoAxGQO2d1NO_sNSOA', {
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
    fetch("data/musicdata.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            var geojsonMarkerOptions = {
                radius: 18,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                onEachFeature:onEachFeature,
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            
        })
};

document.addEventListener('DOMContentLoaded',createMap)