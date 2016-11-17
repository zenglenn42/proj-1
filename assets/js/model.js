//---------------------------------------------------------------------------
// File: model.js
//
// This file contains the model for the application.  It defines
// attributes that reflect the current state of the app plus
// exports methods for changing that state in an orderly way.
//---------------------------------------------------------------------------

var model = {
	// model attributes
	appName: "Austin Aware",
	places: {
		austin: {
			location: {
          		lat: 30.27504,
          		lng: -97.73855469999999
        	},
        	mapOptions: {
				zoom: 3,
				center: "center"
			}
		},
        demo: { // Connecticut, from http://jsfiddle.net/chrismetcalf/8m2Cs/
			location: {
				lat: 41.7656874, 
				lng: -72.680087
       		},
        	mapOptions: {
				zoom: 8,
				center: "center"
			}
        }
	},

	// model methods
	getAppName: getAppName,
	getMapOptions: getMapOptions,
	getPlaceCoord: getPlaceCoord,
	init: init,
	unitTests: unitTests
};

// Function init
// Usage: model.init();
// --------------------
// Initializes the model to a known state.

function init() {
	console.log("model.init");
}

// Function getAppName
// Usage: var name = getAppName();
// ---------------------------------------------------------------------
// Returns the appName attribute associated with the model.

function getAppName() {
	return this.appName;
}

// Function getMapOptions
// Usage: var mapOptions = getMapOptions(place);
// ---------------------------------------------------------------------
// Returns the google map options associated with a place known to
// the model.

function getMapOptions(place) {
	console.log("model.getMapOptions");

	var result = this.places[place].mapOptions;
	if (!result) {
		console.log("model.getMapOptions: Unknown place:", place);
	}
	return result;
}

// Function getPlaceCoord
// Usage: var coord = getPlaceCoord(place);
// ---------------------------------------------------------------------
// Returns an object containing the latitude and longitude of
// the named place.  Othewise returns undefined if the place is unknown
// to the model.

function getPlaceCoord(place) {
	console.log("model.getPlaceCoord");

	var result = this.places[place].location;
	if (!result) {
		console.log("model.getPlaceCoord: Unknown place:", place);
	}
	return result;
}

// Function unitTests
// Usage: if (model.unitTests()) console.log("model unit tests passed");
// ---------------------------------------------------------------------
// Run unit tests for model methods.

function unitTests() {
	console.log("model.unitTests");
	result = true;
	
	// First unit test.
	coord = this.getPlaceCoord("austin");
	if (coord.lat !== 30.27504 || coord.lng !== -97.73855469999999) {
		result = false;
		console.log("model.unitTests: failed model.getPlaceCoord :-/");
	}

	// Second unit test goes here.

	return result;
}
