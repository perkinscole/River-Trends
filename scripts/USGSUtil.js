/**
* RiverTrends/RiverTrendsUtil.js
* @author Cole Perkins 2020
* RiverTrendsUtil.js is a group of functions that get the users location and
* calls the USGS IV Service to get the most up to date river information near
* the user.
*/

//--------------------------------------------------------START VARIABLES
//set the script variables
var sites;//usgs return sites
//base USGS search params
let USGS = "http://waterservices.usgs.gov/nwis/iv/?";
let format = "&format=json";
let indent = "&indent=on";
let siteType = "&siteType=ST"
let siteStatus = "&siteStatus=active";
let dischargeAndTemp = "&parameterCd=00010,00060";//00060 cfs, 00011 degrees F

//--------------------------------------------------------END VARIABLESS



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
    sites = new Map();//data map not google map
    map.setCenter(loc);
    map.setZoom(10);

    addMarker(loc);

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
