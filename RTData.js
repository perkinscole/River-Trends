/**
* RiverTrends/RTData.js
* @author Cole Perkins 2020
* This is a class that stores data extracted from usgs responseText
* and importantly also has methods for displaying that data.
* it is in charge of its own rendering.
*/
class RTData {

  constructor(siteName){
    this.siteName = siteName;
  }
//--------------------------------------------------------START VARIABLES
  siteLatitutde;
  siteLongitude;
  variableCodes =[];
  siteProperties;
  siteCode;
  values =[];
//--------------------------------------------------------END VARIABLES

//--------------------------------------------------------START METHODS

/**
* getDataFormattedHTML()
* returns a card element with the data from a specific site formatted together
*/
  getDataFormattedHTML(){
    //create the card
    var card = document.createElement("div");
    card.setAttribute("class","dataCard");

   card.setAttribute("id", this.siteName);

   card.addEventListener("click", function(){
     showSite(this.id);
   });
    //create title
    var cardTitle = document.createElement("p");
    cardTitle.setAttribute("class", "cardTitle");
    cardTitle.innerHTML = this.siteName;

    card.appendChild(cardTitle);

    //create data table
    card.appendChild(this.getTableElement());
    return card;
  }

/**
* getTableElement()
* creates the a table used to display values in JSON, should be private, used by
* getDataFormattedHTML
*/
  getTableElement(){
    var dataTable = document.createElement("table");
    dataTable.setAttribute("class", "dataTable");

    for(var vC = 0; vC < this.variableCodes.length; vC++){
      var row =  document.createElement("tr");
      var tdCode = document.createElement("td");
      var tdValue = document.createElement("td");

      tdCode.innerHTML = this.variableCodes[vC];
      switch (this.variableCodes[vC]) {
        case "00010":
          tdCode.innerHTML = "Current Temperature, water: ";
          tdValue.innerHTML = this.values[vC] + " °C";
          break;
        case "00060":
          tdCode.innerHTML = "Current Streamflow: ";
          tdValue.innerHTML = this.values[vC] + " ft³/s";
          break;
        default:
          tdCode.innerHTML = "Something went wrong";
          break;
      }

      if(tdValue.innerHTML <= "-999999"){
        tdValue.innerHTML = "No Result";
      }


      row.appendChild(tdCode);
      row.appendChild(tdValue);

      dataTable.appendChild(row);
      // console.log(site.variableCodes[vC].value + " : " + site.values[vC].value[vC].value);
    }
    return dataTable;
  }

//--------------------------------------------------------END METHODS
  }
