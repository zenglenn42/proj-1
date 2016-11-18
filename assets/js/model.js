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
			location: { // This is centered on the Capitol of Texas
          		lat: 30.27504,
          		lng: -97.73855469999999
        	},
        	mapOptions: {
				zoom: 3 // Typically a number between 0 and 18
						// https://developers.google.com/maps/documentation/javascript/maxzoom
			},
			dataSources: {
				crimeData: {
					description: "APD Incident Data",
					queryUrl: "https://data.austintexas.gov/resource/rkrg-9tez.json",
					apiKeyName: "",
					apiKey: ""
				},
				trafficData: {
					description: "Austin Traffic Incidents",
					queryUrl: "https://data.austintexas.gov/resource/i3kd-c47g.json",
					apiKeyName: "",
					apiKey: ""
				}
			},
			city: "austin",
			state: "texas",
			stateAbbrev: "tx"
		},
        demo: { // Connecticut school districts: http://jsfiddle.net/chrismetcalf/8m2Cs/
			location: {
				lat: 41.7656874, 
				lng: -72.680087
       		},
        	mapOptions: {
				zoom: 8
			},
			dataSources: {
				schoolDistricts: {
					description: "School Districs of Connecticut",
					queryUrl: "https://data.ct.gov/resource/9k2y-kqxn.json?organization_type=Public%20School%20Districts&$$app_token=CGxaHQoQlgQSev4zyUh5aR5J3",
					apiKeyName: "",
					apiKey: ""
				}
			},
			city: "",
			state: "connecticut",
			stateAbbrev: "ct"
        }
	},

	// model methods
	getAppName: getAppName,
	getDataSources: getDataSources,
	getEndpointUrl: getEndpointUrl,
	getFullAddress: getFullAddress,
	getGeocodeLocation: getGeocodeLocation,
	getMapHtmlClass: getMapHtmlClass,
	getMapHtmlId: getMapHtmlId,
	getMapZoom: getMapZoom,
	getPlaceCoord: getPlaceCoord,
	getCity: getCity,
	getState: getState,
	getStateAbbrev: getStateAbbrev,
	init: init,
	unitTests: unitTests
};

// Function: init
// Usage: model.init();
// --------------------
// Initializes the model to a known state.

function init() {
	console.log("model.init");
}

// Function: getAppName
// Usage: var name = getAppName();
// ---------------------------------------------------------------------
// Returns the appName attribute associated with the model.

function getAppName() {
	return this.appName;
}

// Function: getCity
// Usage: var place = "demo"; // This may or may not be a city
//                            // It's basically a key under model.places
//        var cityStr = model.getCity(place);
// ---------------------------------------------------------------------
// Returns the city as a string associated with a given place.
//
// This might be a useful token to then combine with a street address that
// is missing city information.

function getCity(place) {
	console.log("model.getCity");
	var result = undefined;

	if (!this.places[place]) {
		console.log("model.getCity: Invalid place: ", place);
	}
	else {
		result = this.places[place].city;
		if (!result) {
			console.log("model.getCity: WARNING: No city value currently defined for place: ", place);
		}
	}
	return result;
}

// Function: getEndpointUrl
// Usage: var url = getEndpointUrl("austin", "crimeData");
// -------------------------------------------------------
// This method retuns an endpoint url suitable for an AJAX call to a server
// to fetch data.

function getEndpointUrl(place, dataSource) {
	console.log("model.getEndpointUrl");
	var result = undefined;

	if (!this.places[place]) {
		console.log("model.getEndpointUrl: Invalid place: ", place);
	}
	else {
		var selector = this.places[place].dataSources[dataSource];
		var queryUrl = selector.queryUrl;
		var apiKeyName = selector.apiKeyName;
		var apiKey = selector.apiKey;
		var apiToken = "";

		// Build a non-null apiToken to append to the query url if one is required for this
		// data source.

		if (apiKeyName && apiKey) {
			apiToken = "&" + apiKeyName + "=" + apiKey;
		}
		result = queryUrl + apiToken;
	}
	return result;
}

// Function: getGetFullAddress
// Usage: var address = getFullAddress("austin", "2400 BLOCK E RIVERSIDE DR");
// Returns: "2400 BLOCK E RIVERSIDE DR, austin, tx"
//
// TODO: Would be nice to have zipcode, but google gecoding is probably smart
//       enough to resolve without.
// --------------------------------------------------------------------------------
// Returns the full(-ish) street address associated with a known place in
// our object model.
//
// This could become input to a geocoding method that returns lat/lng for that address.

function getFullAddress(place, streetAddress) {
	console.log("model.getFullAddress");
	var result = streetAddress;
	if (!this.places[place]) {
		console.log("model.getFullAddress: Invalid place: ", place);
	} else {
		var city = this.getCity(place);
		if (city) {
			result += "," + city;
		}
		var state = this.getState(place);
		if (state) {
			result += "," + state;
		}
	}
	return result;
}

// Function: getGeocodeLocation
// Usage: var location = getGeocodeLocation("austin", "2400 BLOCK E RIVERSIDE DR");
// --------------------------------------------------------------------------------
// Returns the latitiude and longitude for a given physical street address in
// an object structured like this:
//
// 		location: {
//			lat: 41.7656874, 
//			lng: -72.680087
//		}

function getGeocodeLocation(place, streetAddress) {
	console.log("model.getGeocodeLocation");
	var result;
	var fullAddress = this.getFullAddress(place, streetAddress);
	// TODO: more code here that calls the endpoint for geocoding.
	return result;
}

// Function: getDataSources
// Usage var arrayDataSources = model.getDataSources("austin");
// ------------------------------------------------------------
// Returns an array of data source names for a given given location
// known to the model.  Different cities may have differnt queryable endpoints.
// This method tells you what those endpoints are.
//
// You can iterate over the list of data sources, passing each to 
// model.getEndpointUrl() to fetch the corresponding endpoint url for
// that data source.  Then you're just an ajax call away from getting data.

function getDataSources(place) {
	var result = [];
	console.log("model.getDataSources");

	if (!this.places[place]) {
		console.log("model.getDataSources: Invalid place: ", place);
	}
	else {

		// Iterate over the list of known data sources for this place
		// and push them to the results array.

		for (var dataSource in this.places[place].dataSources) {
			result.push(dataSource);
		}
	}
	return result;
}

// Function: getMapHtmlClass
// Usage: var htmlClass = getMapHtmlClass();
// ---------------------------------------------------------------------
// Returns the html class for all of our map divs.

function getMapHtmlClass() {
	console.log("model.getMapHtmlClass");

	var result = "map";
	return result;
}

// Function: getMapHtmlId
// Usage: var htmlID = getMapHtmlId(place [, dataSource]);
// ---------------------------------------------------------------------
// Returns the html map id corresponding to the place of interest
// and an optional data source.  Specifying the data source
// would allow you to have separate div ids for a map of crime data
// versus a map of traffic data.
//
// Excluding the dataSource would mean two or more data sources could
// be sharing the same map div (i.e., data from both sources on the
// same map).

function getMapHtmlId(place, dataSource) {
	console.log("model.getMapHtmlId");
	var result = place;

	// Append optional dataSource if it is truthy. :-)
	if (dataSource) {
		// e.g., <div id="austin-crimeData">
		//                ----------------
		result += "-" + dataSource;
	}
	return result;
}

// Function: getMapZoom
// Usage: var mapZoom = getMapZoom(place);
// ---------------------------------------------------------------------
// Returns the google map options associated with a place known to
// the model.

function getMapZoom(place) {
	console.log("model.getMapZoom");

	var result = this.places[place].mapOptions.zoom;
	if (!result) {
		console.log("model.getMapZoom: Unknown place:", place);
	}
	return result;
}

// Function: getPlaceCoord
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

// Function: getState
// Usage: var stateStr = model.getState("austin"); // returns "texas"
//        var stateAbbrevStr = model.getState("austin", true); // returns "tx"
// ---------------------------------------------------------------------------
// Returns the state as a string associated with a given place.
// Place must be a valid key within model.places, otherwise undefined is
// returned and an error is console logged.
//
// User may specify the string to be optionally abbreviated down to a
// two-character string through a second boolean parameter.
//
// This might be a useful token to then combine with a street address that
// is missing state information.

function getState(place, abbreviate) {
	console.log("model.getState");
	var result = undefined;

	if (!this.places[place]) {
		console.log("model.getState: Invalid place: ", place);
	}
	else {
		if (abbreviate) {
			result = this.places[place].stateAbbrev;
			if (!result) {
				console.log("model.getState: WARNING: no stateAbbrev value currently defined for place: ", place);
			}
		} else {
			result = this.places[place].state;
			if (!result) {
				console.log("model.getState: WARNING: no state value currently defined for place: ", place);
			}
		}
	}
	return result;
}

// Function: getStateAbbrev
// Usage: var stateAbbrevStr = getStateAbbrev("austin"); // returns tx
// -------------------------------------------------------------------
// Returns a two-letter string abbreviation of the state associated with
// the place parameter.

function getStateAbbrev(place) {
	console.log("model.getStateAbbrev");
	var abbreviate = true;
	return this.getState(place, abbreviate);
}

// Function: unitTests
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

	// Second unit test.
	var dataSources = this.getDataSources("austin");
	if (dataSources.length !== 2) {
		result = false;
		console.log("model.unitTests: failed model.getDataSources");
	} else {
		console.log("model.unitTests: dataSources for austin:", dataSources);
	}

	// Third unit test.
	var url = this.getEndpointUrl("austin", "crimeData");
	if (url !== "https://data.austintexas.gov/resource/rkrg-9tez.json") {
		result = false;
		console.log("model.unitTests: failed getEndpointUrl: ", url);
	}

	return result;
}