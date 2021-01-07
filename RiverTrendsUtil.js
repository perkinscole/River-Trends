/**
* RiverTrends/RiverTrendsUtil.js
* @author Cole Perkins 2020
* RiverTrendsUtil.js is a group of functions that get the users location and
* calls the USGS IV Service to get the most up to date river information near
* the user.
*/

//--------------------------------------------------------START VARIABLES
//set the script variables
var userLatitude,userLongitude;//variables to store user coordinates
var loc;//user locations
var map;//google map
var sites;//usgs return sites
var sites;
let searchArea = 4;//search size for bbox

//base USGS search params
let USGS = "http://waterservices.usgs.gov/nwis/iv/?";
let format = "&format=json";
let indent = "&indent=on";
let siteType = "&siteType=ST"
let siteStatus = "&siteStatus=active";
let dischargeAndTemp = "&parameterCd=00060,00010";//searchable parameters

//--------------------------------------------------------END VARIABLESS

//INITIALIZATION
window.onload = GetLongAndLat();

//--------------------------------------------------------START METHODS
/**
*  CallUSGSIVWaterWaterService()
*  Calls the USGS Instantaneous values service with given params in GET format
*  returns a JSON array of values
*/
function CallUSGSIVWaterService(){

    var bBoxCoords = BBoxFromCoords();
    var queryString = USGS + format + indent + siteType + siteStatus + dischargeAndTemp + bBoxCoords;
    clearMarkers();
    sites = new Map();
    map.setCenter(loc);
    map.setZoom(10);
    $(".results").innerHTML = "Loading..."

    //send request to the USGS server
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        //  $(".results").innerHTML = this.responseText;

        $(".results").innerHTML = "";
          DisplayData(this.responseText);
        }
    };
    xhttp.open("GET", queryString, true);
    xhttp.send();

}

/**
* GetLongAndLat()
* Gets coordinates from the user.
*/
function GetLongAndLat(){

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

  map = document.createElement('script');
  map.src = "https://maps.googleapis.com/maps/api/js?key=" + apiKey + "&callback=initMap";
  map.defer = true;
  loc = {
         lat:userLatitude,
         lng:userLongitude,
  };

  callGeoDecode();
  document.head.appendChild(map);
}

/**
* locationError()
* Callback function that is called if no position availible by the navigator
*/
function locationError(){
  $('#location').innerHTML = " Sorry couldn't find your locaton";
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
    var  westLong = userLongitude - boxSize;
    var  southLat = userLatitude - boxSize;
    var  northLat = userLatitude + boxSize;
    var  eastLong = userLongitude + boxSize;

  //WEST, SOUTH, EAST, NORTH

  return "&bBox="+westLong.toFixed(4) + "," + southLat.toFixed(4) + "," + eastLong.toFixed(4) + "," + northLat.toFixed(4);
}

/**
* $ function makes it easier to use querySelector
*/
function $(selector){
  return document.querySelector(selector);
}

/**
* DisplayData(response)
* response os the xhhtp object response from the query to USGS.
* Display data formats the data into a RT class which is then used to
* display neatly on screen
*/
function DisplayData(response){
  var obj = JSON.parse(response);

  //usgs calls data a timeSeries for some non-apparent reason;
  var timeSeries = obj.value.timeSeries;

//go through the data retrieved from USGS
  for(var i = 0; i < timeSeries.length; i++){
      //data is difficult to parse, it is definited by WaterML but makes no sense
      if(sites.get(timeSeries[i].sourceInfo.siteName) == null){
        //if we've not seen this data yet
      let site  = new RTData(timeSeries[i].sourceInfo.siteName);

      site.siteLatitutde = timeSeries[i].sourceInfo.geoLocation.geogLocation.latitude;
      site.siteLongitude = timeSeries[i].sourceInfo.geoLocation.geogLocation.longitude;
      site.siteLoc = {lat:site.siteLatitutde,lng:site.siteLongitude};

      site.variableCodes.push(timeSeries[i].variable.variableCode[0].value);
      console.log(timeSeries[i].variable.variableCode.value);
      site.values.push(timeSeries[i].values[0].value[0].value);
      site.siteProperty = timeSeries[i].sourceInfo.siteProperty;
      site.siteCode = timeSeries[i].sourceInfo.siteCode[0].value;

      sites.set(site.siteName, site);
      //push markers onto map ay locations
      addMarker(site.siteLoc);
      $(".results").appendChild(site.getDataFormattedHTML());
    }else{
      //If we have seen the data before so update the appropriate structure, remove it from the dom and replae it.
      let site = sites.get(timeSeries[i].sourceInfo.siteName);

      site.variableCodes.push(timeSeries[i].variable.variableCode[0].value);



      site.values.push(timeSeries[i].values[0].value[0].value);



      document.getElementById(site.siteName).remove();
      $(".results").appendChild(site.getDataFormattedHTML());
    }


    }
}


//--------------------------------------------------------END METHODS
