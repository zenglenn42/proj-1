//---------------------------------------------------------------------------
// File: controller.js
//
// This file contains the controller logic.  The controller is responsible
// for responding to user input and mediating communication between the
// model and view.
//
// It drives the orderly transition from one application state to another.
//---------------------------------------------------------------------------

$(document).ready(initMVC);

// Function: initMVC
// Usage: $(document).ready(initMVC);
// ----------------------------------
// Initializes the model, view and controller.  Most of the
// initial data comes from the model itself.

function initMVC() {
	console.log("initMVC");

	// Initialize the model, view, and controller.
	model.init();

	// Run model unit tests for sanity.  We'll comment this out in production.
	(model.unitTests()) ? console.log("model.unitTests() passed") : 
	                      console.log("model.unitTests() failed");

	vInit(model);
	cInit(model);
}

//---------------------------------------------------------------------------
// Controller Functions
//---------------------------------------------------------------------------

// Function: cInit
// Usage: cInit();
// ---------------
// Initializes the controller by registering various callback functions
// that come to life in response to user input of some kind.

function cInit(model) {
	console.log("cInit");
	var map = loadMap(model, "austin");
	loadData(model, "austin", "trafficData");
}

// Function: loadData
// Usage: loadData(model, "austin", "trafficData");
// ------------------------------------------------
// Loads data from the data source into the model.

function loadData(model, place, dataSource) {
	console.log("loadData");
	var dataSourceUrl = model.getEndpointUrl(place, dataSource);
	if (!dataSourceUrl) {
		console.log("loadData: endpoint url is null for place: " + place + " and dataSource: " + dataSource);
		return false;
	}

	// Retrieve raw JSON data from the endpoint and
	// display it on the screen for debug purposes.
	
	$.getJSON(dataSourceUrl, showJsonObj);
}

// Function: dumpJsonData
// Usage: $.getJSON(endpointUrl, showJsonObj);
// -------------------------------------------
// Takes the incoming JSON data from a web api call, turns it into a string
// and displays it in a div created on the fly and appened to the end of
// the container div.

function showJsonObj(jsonObj, textstatus) {
	var div = $("<div>");
	$(div).attr("id", "raw-data");
	$(div).css({
		"color": "white", 
		"background-color": "gray",
		"overflow": "scroll",
		"width": "100%",
		"height": "200px"
	});
	$(".container").append(div);

	$(div).text(JSON.stringify(jsonObj));
}

// Function: loadPlace
// Usage: var map = loadPlace(model, "austin");
// ---------------------------------------------
// Fetch and render a google background map for a given place.
//
// The map object is returned for subsequent map api calls
// for rendering markers, etc.

function loadMap(model, place) {
	console.log("loadMap");

	// Sanity check the place before we go any farther.

	if (!model.isKnownPlace(place)) {
		console.log("cLoadPlace: Error: Unknown place: ", place);
		return;
	}

	// Fetch the lat/lng of the center of the map.

	var geoCoord = model.getPlaceCoord(place);
	console.log("loadMap: geoCoord:", geoCoord);
	var center = new google.maps.LatLng(geoCoord.lat, geoCoord.lng);
	if (center === undefined) {
		console.log("loadMap: Error: Google maps api probably not getting loaded properly :-/");
		return;
	}

	// Dynamically generate a container for our map and anchor
	// it off a static html element already in the DOM.

	var mapDiv = vMakeMapDiv(place);
	var parentDiv = $(".map-container");
	$(parentDiv).empty();
	$(parentDiv).append(mapDiv);
	// For some reason, I'm having to resort to direct DOM methods
	// to get an element id that google maps is happy about.
	//
	// TODO: Fix this after higer priorities are resolved.
	var mapDomNode = document.getElementById(model.getMapHtmlId(place));

	// Load up some visualization settings for the map.
	// Zoom level comes from the model.

	var mapOptions = {
		zoom: model.getMapZoom(place),
		center: center
	};
	console.log(mapOptions);

	// Fetch and render the map with our div.

	var map = new google.maps.Map(mapDomNode, mapOptions);

	// Pass the map back to the caller.  It'll get used
	// by other parts of the app as a backdrop 
	// (e.g., for location-specific marker data).

	return map;
}

// Function: cDemoSocrataExample
// Usage: cDemoSocrataExample();
// -----------------------------
// Courtesy: http://jsfiddle.net/chrismetcalf/8m2Cs/
//
// Populate a google map with markers based upon lat/lng data from
// a json record fetched from endpoint.

function cDemoSocrataExample() {
	// Intialize our map for the "demo" place.

	var place = "connecticut";
	var geoCoord = model.getPlaceCoord(place);
	console.log("cDemoSocrataExample: geoCoord:", geoCoord);

	var center = new google.maps.LatLng(geoCoord.lat, geoCoord.lng);

	if (center === undefined) {
		console.log("cDemoSocrataExample: Google maps api probably not getting loaded properly.");
		return;
	} else {

		// Programmatically append a div for our demo map to our map container.

		var mapDiv = vMakeMapDiv(place);
		$(".map-container").empty();
		$(".map-container").append(mapDiv);

		var mapOptions = {
			zoom: model.getMapZoom(place),
			center: center
		};
		console.log(mapOptions);
		var map = new google.maps.Map(document.getElementById(model.getMapHtmlId(place)), mapOptions);

		// Construct the catalog query string
		url = model.getEndpointUrl(place, "schoolDistricts");

		// Retrieve our data and plot it
		$.getJSON(url, function initMap(data, textstatus) {
			console.log(data);
			$.each(data, function(i, entry) {
				var marker = new google.maps.Marker({
						position: new google.maps.LatLng(entry.location_1.latitude, entry.location_1.longitude),
						map: map,
						title: location.name});
			});
		});
	}
}

//---------------------------------------------------------------------------
// View Functions
//---------------------------------------------------------------------------

// Function: vInit
// Usage: vInit(model);
// --------------------
// Initializes the view / presentation layer with data from the model.
// Model data may include default settings in model.js as well as
// data from persistent storage.

function vInit(model) {
	console.log("vInit");
	vUpdateTitle(model.appName);
}

// Function: vMakeMapDiv
// Usage: var mapDiv = vMakeMapDiv(place);
// ---------------------------------------
// Constructs a div suitable for holding a map.  The div is given a unique
// id based upon the place string.
//
// e.g.  <div id="austin" class="map"></div>

function vMakeMapDiv(place) {
	var div = $("<div>");
	$(div).attr("id", model.getMapHtmlId(place));
	$(div).attr("class", model.getMapHtmlClass());
	return div;
}

// Function: vUpdateTile
// Usage: vUpdateTitle(model.appName);
// -----------------------------------
// Updates the view title from the model.

function vUpdateTitle(nameStr) {
	$("title").html(nameStr);
}