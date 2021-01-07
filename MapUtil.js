/**
* RiverTrends/MapUtil.js
* @author Cole Perkins 2020
* These methods go in conjunction with River Trends and is the part of the
* program which manages the google apis such as maps and geodecode
* and the cooresponding functions and data.
*/

//--------------------------------------------------------START VARIABLES
var gMarkers =[];
let googGeoCode = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
let apiKey = config.apiKey;
//--------------------------------------------------------END Variables

//--------------------------------------------------------INITIALIZATION
window.initMap = function() {
  map = new google.maps.Map(document.getElementById("map"), {
   center: loc,
   zoom: 10,
 });
//reveal the map once there is a search.
$("#map").style.display = "block";
$("#map").style.height = "100%";
$("#map").style.width = "100%";

addMarker(loc);
}
//--------------------------------------------------------END INITIALIZATION

//--------------------------------------------------------START METHODS
/**
* addMarker()
* adds a google marker at a specific location.
*/
function addMarker(locationData){
  const marker = new google.maps.Marker({
     position: locationData,
     map: map,
     animation: google.maps.Animation.DROP,
   });
   gMarkers.push(marker);

}

/**
* clearMarkers()
* clears markers off of map.
*/
function clearMarkers(){
  for(var i = 0; i < gMarkers.length; i++){
    gMarkers[i].setMap(null);
  }
}

/**
* showSite()
* moves the map to the selected site.
*/
function showSite(siteName){
     map.setCenter(sites.get(siteName).siteLoc);
     map.setZoom(12);
}

/**
* callGeoDecode()
* Calls the google geoDecode api so and updates the view on where the user is located.
*/
function callGeoDecode(){
  googGeoCode += loc.lat+","+loc.lng + "&key=" + apiKey;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
      //  $(".results").innerHTML = this.responseText;
        var r = JSON.parse(this.responseText);
        r = r.results[0].formatted_address;

        $('#location').innerHTML = r;
      }
  };
  xhttp.open("GET", googGeoCode, true);
  xhttp.send();
}

//--------------------------------------------------------END METHODS
