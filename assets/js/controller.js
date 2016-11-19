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
	var map = cLoadMap(model, "austin");
	//cDemoSocrataExample();
}

// Function: cLoadPlace
// Usage: var map = cLoadPlace(model, "austin");
// ---------------------------------------------
// Fetch and render a google background map for a given place.
//
// The map object is returned for subsequent map api calls
// for rendering markers, etc.

function cLoadMap(model, place) {
	console.log("cLoadMap");

	// Sanity check the place before we go any farther.

	if (!model.isKnownPlace(place)) {
		console.log("cLoadPlace: Error: Unknown place: ", place);
		return;
	}

	// Fetch the lat/lng of the center of the map.

	var geoCoord = model.getPlaceCoord(place);
	console.log("cLoadMap: geoCoord:", geoCoord);
	var center = new google.maps.LatLng(geoCoord.lat, geoCoord.lng);
	if (center === undefined) {
		console.log("cLoadMap: Error: Google maps api probably not getting loaded properly :-/");
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