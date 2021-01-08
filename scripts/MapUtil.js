/**
* RiverTrends/MapUtil.js
* @author Cole Perkins 2020
* These methods go in conjunction with River Trends and is the part of the
* program which manages the google apis such as maps and geodecode
* and the cooresponding functions and data.
*/

//--------------------------------------------------------START VARIABLES
var userLatitude,userLongitude;//variables to store user coordinates
var loc;//user locations
var map;//google map
var autoComplete;
var gMarkers =[];
let googGeoCode = "https://maps.googleapis.com/maps/api/geocode/json?latlng=";
let apiKey = config.apiKey;
let searchArea = 5;//search size for bbox
//google places
let placesInput = document.getElementById('placesSearchField');
let options = {
  componentRestrictions:{country:'us'},
  types:['geocode']
};
let defaultLocation = {
  lat:46.87,
  lng:-96.78
};

//--------------------------------------------------------END Variables

//--------------------------------------------------------INITIALIZATION
window.onload = InitLocation();

//--------------------------------------------------------END INITIALIZATION

//--------------------------------------------------------START METHODS
/**
* GetLongAndLat()
* Gets coordinates from the user.
*/
function InitLocation(){
  navigator.geolocation.getCurrentPosition(locationSuccess,locationError);
}

/**
* locationSuccess(position)
* Callback function that is called if navigator can get current position, sets global user location.
*/
function locationSuccess(position){
  userLatitude = position.coords.latitude;
  userLongitude = position.coords.longitude;
  //set page lat long
  loc = {
         lat:userLatitude,
         lng:userLongitude,
  };
  buildMap();

}

/**
* locationError()
* Callback function that is called if no position availible by the navigator
*/
function locationError(){
  loc = defaultLocation;
  buildMap();
}


/**
* initializeMap()
* when async call is finished this builds and puts map on the page.
*/
function initMap(){
  map = new google.maps.Map(document.getElementById("map"), {
   center: loc,
   zoom: 10,
 });
//reveal the map once there is a search.
$("#map").style.display = "block";
$("#map").style.height = "100%";
$("#map").style.width = "100%";

addMarker(loc);
autoComplete = new google.maps.places.Autocomplete(placesInput, options);//places
autoComplete.setFields(['geometry']);
google.maps.event.addListener(autoComplete, 'place_changed', setNewPlace);
}

/**
* buildMap()
* this unction creates the maps scrupt and calls the google apis*/
function buildMap(){
  map = document.createElement('script');
  map.src = "https://maps.googleapis.com/maps/api/js?key=" + apiKey + "&libraries=places&callback=initMap";
  map.defer = true;
  callGeoDecode();
  document.head.appendChild(map);
}

/**
* setNewPlace()
* gets info from the autocomplte google form
* and moves the map to, starts a new search
*/
function setNewPlace(){
    var place = autoComplete.getPlace().geometry.location;
    loc = place.toJSON();
}

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

        document.getElementById('placesSearchField').placeholder = r;
      }
  };
  xhttp.open("GET", googGeoCode, true);
  xhttp.send();
}

/**
* BBoxFromCoords()
* Takes coodinates and returns Bounding Box of specific size in miles
* 10001.965729km = 90 degrees
* 1km = 90/10001.965729 degrees = 0.0089982311916 degrees
* 1km = 0.621 miles
* Source (https://gis.stackexchange.com/questions/19760/how-do-i-calculate-the-bounding-box-for-given-a-distance-and-latitude-longitude)
* Returns a string representing the bounding box for querying the site.
*/
function BBoxFromCoords(){
  let oneKMDegree = .08999;
  let mileKmConversion = 0.62137;
  let oneMileDegree = oneKMDegree * mileKmConversion;
  let boxSize = searchArea * oneMileDegree;

    //set the bbox coords
    var  westLong = loc.lng - boxSize;
    var  southLat = loc.lat - boxSize;
    var  northLat = loc.lat + boxSize;
    var  eastLong = loc.lng + boxSize;

  //WEST, SOUTH, EAST, NORTH

  return "&bBox="+westLong.toFixed(4) + "," + southLat.toFixed(4) + "," + eastLong.toFixed(4) + "," + northLat.toFixed(4);
}

//--------------------------------------------------------END METHODS
