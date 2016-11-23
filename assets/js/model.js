//---------------------------------------------------------------------------
// File: model.js
//
// This file contains the model for the application.  It defines
// attributes that reflect the current state of the app plus
// exports methods for changing that state in an orderly way.
//---------------------------------------------------------------------------

var model = {
	// model attributes
	mapAPI: {
		geocode: {
			description: "Google Geocoding API", // Turns street address -> lat/lng.
			queryUrl: "https://maps.googleapis.com/maps/api/geocode/json?",
			apiKeyName: "&key",
			apiKey: "AIzaSyD4-iShS_FXpTaYoz6LjgU7Yosbu_cxjsU"
		}
	},
	places: {
		austin: {
			appName: "Austin Aware",
			backgroundUrl: "http://www.alteredperspectives.us/wp-content/uploads/2011/12/DW_Austin_Skyline_Panorama-11.jpg",
			backgroundImagePosition: "top center",
			location: {
          		lat: 30.27504,
          		lng: -97.73855469999999,
				city: "austin",
				state: "texas",
				stateAbbrev: "tx"
			},
			mapOptions: {
				zoom: 11 // Good for city-level visualization.
				         // Typically a number between 0 and 18
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
				},
				trafficFatalities2015: {
					description: "2015 Austin Traffic Fatalities",
					queryUrl: "https://data.austintexas.gov/resource/i3kd-c47g.json?",
					apiKeyName: "$$app_token",
					apiKey: "g9GkfcLndwliKunxNyYve0Nnv",
					// Use closure to normalize the fetching of lat/lng from schemas
					// that vary across dataSources.
					getLat: function(entry) {return (entry.location_1) ? entry.location_1.coordinates[0] : undefined;},
					getLng: function(entry) {return (entry.location_1) ? entry.location_1.coordinates[1] : undefined;}
				},
				trafficFatalities2016: {
					description: "2016 Austin Traffic Fatalities",
					queryUrl: "https://data.austintexas.gov/resource/vn6k-4eq5.json",
					apiKeyName: "",
					apiKey: "",
					// Huh, seems to work with out app_token.  Getting 404 otherwise.
					//
					//apiKeyName: "$$app_token",
					//apiKey: "g9GkfcLndwliKunxNyYve0Nnv"

					// Use closure to normalize the fetching of lat/lng from schemas
					// that vary across dataSources.
					getLat: function(entry) {return (entry.x_coord) ? entry.x_coord : undefined;},
					getLng: function(entry) {return (entry.y_coord) ? entry.y_coord : undefined;}
				},
				trafficSignalsOnFlash: {
					description: "Traffic Signals on Flash",
					queryUrl: "https://data.austintexas.gov/resource/utgi-umz5.json",
					apiKeyName: "$$app_token",
					apiKey: "g9GkfcLndwliKunxNyYve0Nnv"
				}
			}
		},
        connecticut: { // Connecticut school districts: http://jsfiddle.net/chrismetcalf/8m2Cs/
			appName: "Connected Connecticut",
			backgroundUrl: "http://img.ev.mu/images/attractions/6917/960x384/780276.jpg",
			//backgroundUrl: "http://media.istockphoto.com/photos/hartford-connecticut-skyline-picture-id478718780?k=6&m=478718780&s=170667a&w=0&h=Xbc1o9FiTBHr_IzEc0pfez94qgX3mC54RH5-x0g7SbI=",
			backgroundImagePosition: "center",
			location: {
				lat: 41.7656874, 
				lng: -72.680087,
				city: "",
				state: "connecticut",
				stateAbbrev: "ct"
			},
			mapOptions: {
				zoom: 8		// Good state-level visualization.
			},
			dataSources: {
				schoolDistricts: {
					description: "School Districs of Connecticut",
					queryUrl: "https://data.ct.gov/resource/9k2y-kqxn.json?organization_type=Public%20School%20Districts&$$app_token=CGxaHQoQlgQSev4zyUh5aR5J3",
					apiKeyName: "",
					apiKey: ""
				}
			}
		}
	},
	dynamic: {
		place: "",
		knownPlaces: []
	},

	// model methods
	filterAddress: filterAddress,
	getAppName: getAppName,
	getBackgroundUrl: getBackgroundUrl,
	getBackgroundImagePosition: getBackgroundImagePosition,
	getDataSources: getDataSources,
	getEndpointUrl: getEndpointUrl,
	getEndpointUrlFromSelector: getEndpointUrlFromSelector,
	getFullAddress: getFullAddress,
	getGeocodeEndpoint: getGeocodeEndpoint,
	getKnownPlaces: getKnownPlaces,
	getMapHtmlClass: getMapHtmlClass,
	getMapHtmlId: getMapHtmlId,
	getMapZoom: getMapZoom,
	getPlace: getPlace,
	getPlaceCoord: getPlaceCoord,
	getCity: getCity,
	getState: getState,
	getStateAbbrev: getStateAbbrev,
	init: init,
	isKnownPlace: isKnownPlace,
	setKnownPlaces: setKnownPlaces,
	setPlace: setPlace,
	unitTests: unitTests
};

// Function: filterAddress
// Usage: var betterAddress = filterAddress(rawStreeAddress);
// ----------------------------------------------------------
// Returns a street addressed which has been stripped of unhelpful
// (to Google Maps Geocode API) strings, like "NB" for north bound.
// This is terminology that law enforcement understands, but
// confuses the geocode API to the point that it aliases the
// street address to simply the city in which the street resides.
//
// TODO: We may want to configure this as a callback for a particular
//       data source rather than applying it to all addresses.

function filterAddress(rawAddress) {
	console.log("model.filterAddress");
	var result;
	if (rawAddress) {
		// filter out _NB_
		// filter out _NB<end-of-string>
		// filter out Svrd (service rd).
		result = rawAddress.replace(/\s[NSEW]B[\s$]/, ' ').replace(/\s[NSEW]B$/, '').replace(/\sSvrd/, '');
	} else {
		console.log("model.rawAddress: Warning: Encountered empty input parameter. :-/");
	}
	return result;
}

// Function: getAppName
// Usage: var name = getAppName();
// -------------------------------
// Returns the appName attribute associated with the model.
//
// If this isn't returning something meaningful, then it's likely
// model.init(place) or model.setPlace(place) were never called
// successfully.

function getAppName() {
	console.log("model.getAppName");

	var result;
	var place = this.getPlace();
	if (place) {
		result = this.places[place].appName;
	} else {
		console.log("model.getAppName: Error: Unknown app name because unknown place.");
	}
	return result;
}

// Function: getBackgroundUrl
// Usage: var url = model.getBackgroundUrl();
// ------------------------------------------
// Returns the background image url associated with the current
// place of interest known to the model.
//
// Requires that model.init(place) or model.setPlace(place) has been
// called previously.

function getBackgroundUrl() {
	console.log("model.getBackgroundUrl");

	var place = this.getPlace();
	var result;
	if (place) {
		result = this.places[place].backgroundUrl;
	} else {
		console.log("model.getBackgroundUrl: Error.  Unknown place.");
		console.log("Can't return the background image url for a place I don't know about.");
	}
	return result;
}

// Function: getBackgroundImagePosition
// Usage: var positionVal = model.getBackgroundImagePosition();
// ------------------------------------------------------------
// Returns the background image positioning hint for the current
// place of interest known to the model.
//
// Requires that model.init(place) or model.setPlace(place) has been
// called previously.

function getBackgroundImagePosition() {
	console.log("model.getBackgroundImagePosition");

	var place = this.getPlace();
	var result;
	if (place) {
		result = this.places[place].backgroundImagePosition;
	} else {
		console.log("model.getBackgroundImagePosition: Error.  Unknown place.");
		console.log("Can't return the background image position for a place I don't know about.");
	}
	return result;
}

// Function: getCity
// Usage: var place = "austin"; // This may or may not be a city
//                              // It's basically a key under model.places
//        var cityStr = model.getCity(place);
// ---------------------------------------------------------------------
// Returns the city as a string associated with a given place.
//
// This might be a useful token to then combine with a street address that
// is missing city information.

function getCity(place) {
	console.log("model.getCity");
	var result;

	if (!this.places[place]) {
		console.log("model.getCity: Invalid place: ", place);
	}
	else {
		result = this.places[place].location.city;
		if (!result) {
			console.log("model.getCity: WARNING: No city value currently defined for place: ", place);
		}
	}
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

// Function: getEndpointUrl
// Usage: var url = getEndpointUrl("austin", "crimeData");
// -------------------------------------------------------
// This method retuns an endpoint url suitable for an AJAX call to a server
// to fetch data.  An optional 3rd parameter may be passed in if
// additional query parameters need to be wedged in between the
// query url and the key.

function getEndpointUrl(place, dataSource, paramStr) {
	console.log("model.getEndpointUrl");
	var result;

	if (!this.places[place]) {
		console.log("model.getEndpointUrl: Invalid place: ", place);
	}
	else {
		var selector = this.places[place].dataSources[dataSource];
		result = this.getEndpointUrlFromSelector(selector, paramStr);
	}
	return result;
}

// Function: getEndpointUrlFromSelector
// Usage: var url = getEndpointUrlFromSelector(model.places["austin"].dataSources["crimeData"]);
// ------------------------------------------------------------------------------------------
// The data for building an endpoint url from our model can come from multiple
// places.  So this methods provides a generic way to address into a given
// part of the object model and construct and url from the data it finds at that
// node in the model.

function getEndpointUrlFromSelector(selector, paramStr) {
	console.log("model.getEndpointUrlFromSelector");
	var result;

	if (!selector) {
		console.log("model.getEndpointUrlFromSelector: Invalid selector: ", selector);
	} else {
		var queryUrl = selector.queryUrl;
		var apiKeyName = selector.apiKeyName;
		var apiKey = selector.apiKey;
		var apiToken = "";

		// Build a non-null apiToken to append to the query url if one is required for this
		// data source.

		if (apiKeyName && apiKey) {
			apiToken = apiKeyName + "=" + apiKey;
		}
		if (paramStr) {
			paramStr = paramStr.replace(/ /g, "+");
			result = queryUrl + paramStr + apiToken;
		} else {
			result = queryUrl + apiToken;
		}
	}
	console.log("model.getEndpointUrlFromSelector: result: ", result);
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
	var result;

	if (!this.places[place]) {
		console.log("model.getFullAddress: Invalid place: ", place);
	} else {
		// Strip off north bound (NB) tokens that confuse geocode api.
		result = filterAddress(streetAddress);

		// Only append city and state if filtered street address
		// is sane.  Generally it is better to return an undefined
		// address in this case as opposed to:
		//
		//    "undefined,austin,tx"
		//
		// The caller is confused into think he has something non-trivial
		// to pass to the geocoding API.

		if (result) {
			var city = this.getCity(place);
			if (city) {
				result += "," + city;
			}
			var state = this.getState(place);
			if (state) {
				result += "," + state;
			}
		}
	}
	return result;
}

// Function: getGeocodeEndpoint
// Usage: var geocodeEndpoint = model.getGeocodeEndpoint("austin", "7500 BLOCK DELAFIELD LN");
// --------------------------------------------------------------------------------------
// Returns a queryUrl loaded up with encoded street address and apikey,
// ready for an AJAX call to Google's geocoding service.
//
// This is useful when we want to call the Google webapi to transform
// a street address into a latitude and longitude pair.

function getGeocodeEndpoint(place, streetAddress) {
	var result;
	console.log("model.getGeocodeEndpoint");
	var fullStreetAddress = this.getFullAddress(place, streetAddress);
	result = this.getEndpointUrlFromSelector(this.mapAPI.geocode, "address=" + fullStreetAddress);
	console.log("model.getGeocodeEndpoint:", result);

	return result;
}

// Function: getKnownPlaces
// Usage: var arrayPlaces = model.getKnownPlaces();
// ------------------------------------------------
// Returns an sorted array of places known to the model.

function getKnownPlaces() {
	console.log("model.getKnownPlaces");
	if (!this.dynamic.knownPlaces) {
		console.log("model.getKnownPlaces: Don't know about any places :-/");
		console.log("Guessing model.init(place) didn't get called.");
	}
	return this.dynamic.knownPlaces;
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

	// e.g., <div id="map-austin">
	//                ----------
	var result = "map" + "-" + place;

	// Append optional dataSource if it is truthy. :-)
	if (dataSource) {
		// e.g., <div id="map-austin-crimeData">
		//                --------------------
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

// Function: getPlace
// Usage: var placeKey = getPlace();
// ---------------------------------
// Returns the key for the current place of interested known to the model.
//
// This is typically configured at the beginning of the app with a call to
// model.init(place) or during the application with model.setPlace(place).

function getPlace() {
	console.log("model.getPlace");

	var result = this.dynamic.place;
	if (!result) {
		console.log("model.getPlace: Warning: Returning null/undefined place.");
		console.log("Do you need to run model.init(place) or model.setPlace(place)?");
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
	var result;

	if (!this.places[place]) {
		console.log("model.getState: Invalid place: ", place);
	}
	else {
		if (abbreviate) {
			result = this.places[place].location.stateAbbrev;
			if (!result) {
				console.log("model.getState: WARNING: no stateAbbrev value currently defined for place: ", place);
			}
		} else {
			result = this.places[place].location.state;
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

// Function: init
// Usage: model.init(place);
// -------------------------
// Initializes the model to a known application state.  
// This includes specifying the default place of interest.
// Returns true if default place is set successfully, false otherwise.
//
// NB: Guessing that once I know more about javascript object 
//     patterns, this would just get morphed into the constructor.

function init(place) {
	console.log("model.init");
	this.setKnownPlaces();
	return this.setPlace(place);
}

// Function: isKnownPlace
// Usage: if (model.isKnownPlace("timbuktu")) { ... }
// --------------------------------------------------
// Returns true if the given string (normalized to lower case)
// matches one of the place keys known by the model.

function isKnownPlace(placeStr) {

	var nrmlPlaceStr = placeStr.toLowerCase();
	var knownPlaces = this.getKnownPlaces();
	var result = (knownPlaces.indexOf(nrmlPlaceStr) !== -1);
	if (!result) {
		console.log("model.isKnownPlace: Don't know about:", placeStr);
	}
	return result;
}

// Function: setKnownPlaces
// Usage: var arrayPlaces = model.setKnownPlaces();
// ---------------------------------------------------------------------
// Have the model introspect itself to build a convenience array of valid
// (sorted) places the model knows about.  This could be iterated over by a
// controller to dynamically affect what the view knows how to display.

function setKnownPlaces() {
	var result = [];
	for (var placeKey in model.places) {
		result.push(placeKey);
	}
	result.sort();
	this.dynamic.knownPlaces = result;
	return result;
}

// Function: setPlace
// Usage: model.setPlace("austin");
// ---------------------------------------------------------------------
// Attempts to update the model with the current place of interest.
// Returns true if successful, false otherwise.
//
// This will dictate which data sources and application options are valid.

function setPlace(requestedPlaceStr) {
	console.log("model.setPlace");
	var result = false;

	var nrmlPlaceStr = requestedPlaceStr.toLowerCase();
	if (this.isKnownPlace(nrmlPlaceStr)) {
		this.dynamic.place = nrmlPlaceStr;
		result = true;
	} else {
		console.log("model.setPlace: Invalid place: ", requestedPlaceStr);
	}
	return result;
}

// Function: unitTests
// Usage: if (model.unitTests()) console.log("model unit tests passed");
// ---------------------------------------------------------------------
// Run unit tests for model methods.

function unitTests() {
	console.log("model.unitTests");
	var result = true;
	
	// First unit test.
	var coord = this.getPlaceCoord("austin");
	if (coord.lat !== 30.27504 || coord.lng !== -97.73855469999999) {
		result = false;
		console.log("model.unitTests: failed model.getPlaceCoord :-/");
	}

	// Second unit test.
	var dataSources = this.getDataSources("austin");
	if (dataSources.length !== 5) {
		result = false;
		console.log("model.unitTests: failed model.getDataSources");
	} else {
		console.log("model.unitTests: dataSources for austin:", dataSources);
	}

	// Third unit test.
	var url = this.getEndpointUrlFromSelector(this.mapAPI.geocode);
	if (url !== "https://maps.googleapis.com/maps/api/geocode/json?&key=AIzaSyD4-iShS_FXpTaYoz6LjgU7Yosbu_cxjsU") {
		result = false;
		console.log("model.unitTests: failed model.getEndpointUrlFromSelector: ", url);
	}

	// Fourth unit test.
	var url = this.getEndpointUrl("austin", "crimeData");
	if (url !== "https://data.austintexas.gov/resource/rkrg-9tez.json") {
		result = false;
		console.log("model.unitTests: failed getEndpointUrl: ", url);
	}

	// Fifth unit test.
	var endpoint = model.getGeocodeEndpoint("austin", "7500 BLOCK DELAFIELD LN");
	if (endpoint !== "https://maps.googleapis.com/maps/api/geocode/json?address=7500+BLOCK+DELAFIELD+LN,austin,texas&key=AIzaSyD4-iShS_FXpTaYoz6LjgU7Yosbu_cxjsU") {
		result = false;
		console.log("model.unitTests: failed model.getGeocodeEndpoint: ", endpoint);
	}

	// Sixth unit test.
	this.setKnownPlaces();
	var expectedPlaces = ["austin", "connecticut"];
	var actualPlaces = this.getKnownPlaces();
	if (actualPlaces.sort().join(',') !== expectedPlaces.sort().join(',')) {
		result = false;
		console.log("model.unitTests: failed setKnownPlaces");
		console.log("   expected:", expectedPlaces);
		console.log("   actual:", actualPlaces);
	}

	// Seventh unit test.
	if (!this.isKnownPlace("austin") || !this.isKnownPlace("Austin")) {
		result = false;
		console.log("model.unitTests: failed isKnownPlace on Austin!");
		console.log("model.unitTests: I should totally know about Austin, yo.  Fix me.");
	}
	if (this.isKnownPlace("timbuktu")) {
		result = false;
		console.log("model.unitTests: failed isKnownPlace");
		console.log("model.unitTests: I really shouldn't know about timbuktu and yet I say I do.");
	}

	// Eighth unit test.
	if (this.filterAddress("5700 blk S Mopac NB") !== "5700 blk S Mopac"       ||
		this.filterAddress("W US 290 EB to S Mopac") !== "W US 290 to S Mopac" ||
		this.filterAddress("123 EBBandFlow Drive") !== "123 EBBandFlow Drive") {
		result = false;
		console.log("model.unitTests: failed filterAddress");
	}

	// Ninth unit test.
	if (this.setPlace("Austin")) {
		if (this.getPlace() !== "austin") {
			result = false;
			console.log("model.unitTests: failed setPlace/getPlace with known place.");
		}
	}
	if (this.setPlace("bogusPlace")) {
		if (this.getPlace() !== undefined || this.getPlace() !== "") {
			result = false;
			console.log("model.unitTests: failed setPlace/getPlace with bogus place.");
		}
	}

	// Tenth unit test.
	this.setPlace("austin");
	if (this.getBackgroundUrl() != "http://www.alteredperspectives.us/wp-content/uploads/2011/12/DW_Austin_Skyline_Panorama-11.jpg") {
		result = false;
		console.log("model.unitTests: failed getBackgroundUrl");
	}

	// Eleventh unit test.
	this.setPlace("austin");
	if (this.getBackgroundImagePosition() !== "top center") {
		result = false;
		console.log("model.unitTests: failed getBackgroundImagePosition");
	}

	return result;
}

// Uncomment this when bench-testing the model off to the side.
// console.log("Did unit tests pass?", model.unitTests());
