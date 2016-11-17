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
	vInit(model);
	cInit();
}

//---------------------------------------------------------------------------
// Controller Functions
//---------------------------------------------------------------------------

// Function: cInit
// Usage: cInit();
// ---------------
// Initializes the controller by registering various callback functions
// that come to life in response to user input of some kind.

function cInit() {
	console.log("cInit");
	cDemoSocrataExample();
}

// Function: cDemoSocrataExample
// Usage: cDemoSocrataExample();
// -----------------------------
// Courtesy: http://jsfiddle.net/chrismetcalf/8m2Cs/
//
// Populate a google map with markers based upon lat/lng data from
// a json record fetched from endpoint.

function cDemoSocrataExample() {
	// Construct the catalog query string
	url = 'https://data.ct.gov/resource/9k2y-kqxn.json?organization_type=Public%20School%20Districts&$$app_token=CGxaHQoQlgQSev4zyUh5aR5J3';

	// Intialize our map
	var center = new google.maps.LatLng(41.7656874, -72.680087);
	var mapOptions = {
		zoom: 8,
		center: center
	}
	var map = new google.maps.Map(document.getElementById("map"), mapOptions);

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

// Function: vUpdateTile
// Usage: vUpdateTitle(model.appName);
// -----------------------------------
// Updates the view title from the model.

function vUpdateTitle(nameStr) {
	$("title").html(nameStr);
}