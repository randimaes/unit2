//declare map variable 
var map;
var minValue;

//step 1 create map
function createMap() {

    //create the map (L. is leaflet)
    map = L.map('mapid', {
        center: [0, 0],
        zoom: 1
    });


    //add OSM base tilelayer
    L.tileLayer('https://api.mapbox.com/styles/v1/randimaes/cleq9kh7c000q01lmxdwexoou/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicmFuZGltYWVzIiwiYSI6ImNsYTJveDBuMzBqOTkzcG1oZ3dyNXE5ZjEifQ.KopBuoAxGQO2d1NO_sNSOA', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData();
};

function calculateMinValue(data) {
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for (var city of data.features) {
        //loop through each year
        for (var year = 2003; year <= 2017; year += 1) {
            //get population for current year
            var value = city.properties["Retail_" + String(year)];
            //add value to array
            if (value > 0)
                allValues.push(value);
        }
    }
    //get minimum value of our array
    var minValue = Math.min(...allValues)
    return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    if (attValue > 0) {
        //Flannery Apperance Compensation formula with scale of 0.25 added
        var radius = 0.25 * 1.0083 * Math.pow(attValue / minValue, 0.5715) * minRadius
    }
    else {
        var minRadius = 3;
    }
    return radius;
};

//wait what is this? 
//function to attach popups to each mapped feature
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties) {
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent)

    };
};
//create a pointtolayer function
//should attributes be there
function pointToLayer(feature, latlng, attributes) {
    //console.log(feature.properties, attValue);

    //create marker options
    var geojsonMarkerOptions = {
        radius: 2,
        fillColor: "#ff7800",
        color: "#000",
        weight: 8,
        opacity: 1,
        fillOpacity: 0.8
    };
    //Step 4: Determine which attribute to visualize with proportional symbols. In this case it will be retail value
    var attribute = "Retail_2003";
    //Step 5: For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);
    //Give each feature's circle marker a radius based on its attribute value
    geojsonMarkerOptions.radius = calcPropRadius(attValue);
    geojsonMarkerOptions.weight = (calcPropRadius(attValue)) / 2;
    //create circle marker layer
    var layer = L.circleMarker(latlng, geojsonMarkerOptions);
    //build popup content string

    var popupValue;
            if (feature.properties[attribute]> 0)
            popupValue = feature.properties[attribute] + "million";
            else
            popupValue = "No Data";
    //which line do I need to delete to clean up my popup
    var popupContent = "<p><b>Country:</b> " + feature.properties.City + "</p>";
    //add formatted attribute to popup content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Music industry value in " + year + ":</b> " + popupValue + " million</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0, -geojsonMarkerOptions.radius)
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
    //examine the attribute value to check that it is correct


}

function processData(data) {
    //empty array to hold attributes
    var attributes = [];
//should i change 0 to 16? and then iterate backwards? or do i need to change conditionals 
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;
    //check result
    //console.log(data.features[0].properties);
    //push each attribute name into attributes array
    for (var attribute in properties) {
        //only take attributes with retail values
        if (attribute.indexOf("Retail") > -1) {
            attributes.push(attribute);
        };
    };
    //check result
    //console.log(attributes);
    return attributes;//empty array to hold attributes

};

//Step 3: Add circle markers for point features to the map
function createPropSymbols(data, attributes) {
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return pointToLayer(feature, latlng, attributes);
        }

    }).addTo(map);
};


//create a Leaflet GeoJSON layer and add it to the map


//Sequence step 1: create new sequence controls
function createSequenceControls(attributes){
    //create range input
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector('#panel').insertAdjacentHTML('beforeend', slider);
    //7 time stamps, starting at 0 so max is 6 
    document.querySelector(".range-slider").max = 14
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    //seven steps of 1 on the slider
    document.querySelector(".range-slider").step = 1;

    //add buttons
    document.querySelector('#panel').insertAdjacentHTML('beforeend', '<button class="step" id="reverse">Reverse</button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend', '<button class="step" id="forward">Forward</button>');

    //inserting images for buttons
    //this needs to be changed?the images
    document.querySelector('#reverse').insertAdjacentHTML('beforeend', '<img src="img/reversearrow.png">');
    document.querySelector('#forward').insertAdjacentHTML('beforeend', '<img src="img/forwardarrow.png">');

    //how to change these conditionals? to match my data organization
    //click listener for buttons
    document.querySelectorAll('.step').forEach(function (step) {
        step.addEventListener("click", function () {
            var index = document.querySelector('.range-slider').value;
            //increment or decrement depending on button clicked
            if (step.id == 'forward') {
                //forward button moves forward 1 when click
                index++;
                //if past the last attribute, wrap around to first attribute
                index = index > 14 ? 0 : index;
            } else if (step.id == 'reverse') {
                index--;
                //if past the first attribute, wrap around to last attribute
                index = index < 0 ? 14 : index;
            };

            //Step 8: update slider
            document.querySelector('.range-slider').value = index;

            updatePropSymbols(attributes[index]);
        })
    })


//should the bracket above be moved below this code below?
    //input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function () {
        var index = this.value;
        updatePropSymbols(attributes[index]);

    });
}
    //Resize proportional symbols according to new attribute values
    function updatePropSymbols(attribute) {
        map.eachLayer(function (layer) {
            if (layer.feature && layer.feature.properties[attribute] >= 0) {

                var props = layer.feature.properties

                //console.log(props[attribute]);

                var radius = calcPropRadius(props[attribute]);
                layer.setRadius(radius);

                 //add city to popup content string
            var popupContent = "<p><b>Country:</b> " + props.City + "</p>";


            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            var popupValue;
            if (props[attribute]> 0)
            popupValue = props[attribute] + "million";
            else
            popupValue = "No Data";

            popupContent += "<p><b>Industry value in " + year + ":</b> " + popupValue + " million</p>";

            //update popup content            
            popup = layer.getPopup();            
            popup.setContent(popupContent).update();

            };
        });
    };



    //Step 2: Import GeoJSON data
    function getData() {
        //load the data
        fetch("data/musicdata.geojson")
            .then(function (response) {
                return response.json();
            })
            .then(function (json) {
                var attributes = processData(json);
                console.log(attributes)
                minValue = calculateMinValue(json);
                //call function to create proportional symbols
                createPropSymbols(json, attributes);
                createSequenceControls(attributes);
            })
    };

    document.addEventListener('DOMContentLoaded', createMap)