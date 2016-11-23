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

	var place = "austin";
	var dataSource = "trafficFatalities2016";

	// Initialize model.
	model.init(place);

	// Run model unit tests for sanity.  We'll comment this out in production.
	(model.unitTests()) ? console.log("model.unitTests() passed") :
	                      console.log("model.unitTests() failed");

	// Initialize view.
	vInit(model);

	// Initialize controller.
	cInit(model, dataSource);
}

//---------------------------------------------------------------------------
// Controller Functions
//---------------------------------------------------------------------------

// Function: cInit
// Usage: cInit();
// ---------------
// Initializes the controller by registering various callback functions
// that come to life in response to user input of some kind.

function cInit(model, dataSource) {
	console.log("cInit");

	var map = loadMap(model);
	loadData(map, model, dataSource);
}

// Function: loadData
// Usage: loadData(map, model, "trafficData");
// ------------------------------------------------
// Loads data from the data source into the model.

function loadData(map, model, dataSource) {
	console.log("loadData");
	var place = model.getPlace();
	var dataSourceUrl = model.getEndpointUrl(place, dataSource);
	if (!dataSourceUrl) {
		console.log("loadData: endpoint url is null for place: " + place + " and dataSource: " + dataSource);
		return false;
	}

	// Update the map caption with description of the data therein.
	vMapCaption(model.getDataSourceDescription(dataSource));

	var position;
	switch (dataSource) {
		case "trafficFatalities2015":
		case "trafficFatalities2016": {
				$.getJSON(dataSourceUrl, function(response) {
					$.each(response, function(i, entry) {

						// Each entry pulled from the response json looks roughly like this:
						//	{
						//		"area": "HE",
						//		"case_number": "16-0140992",
						//		"case_status": "Closed",
						//		"charge": "N/A",
						//		"date": "2016-01-14T00:00:00.000",
						//		"day": "Thu",
						//		"dl_status_incident": "okay",
						//		"fatal_crash": "2",
						//		"ftsra": "n",
						//		"hour": "14",
						//		"impaired_type": "UNK",
						//		"killed_driver_pass": "n/a",
						//		"location": "4800 E. Riverside Dr.",
						//		"month": "Jan",
						//		"of_fatalities": "1",
						//		"ran_red_light_or_stop_sign": "N",
						//		"related": "MV/Ped",
						//		"restraint_helmet": "n/a",
						//		"speeding": "N",
						//		"time": "14:46",
						//		"type": "Pedestrian",
						//		"type_of_road": "high use roadway",
						//		.. /* lat/lng schema varies by data source */
						//	}

						var lat = model.places["austin"].dataSources[dataSource].getLat(entry);
						var lng = model.places["austin"].dataSources[dataSource].getLng(entry);
						console.log("(lat, lng)", "(" + lat + ", " + lng + ")");

						if (lat && lng) {
						    position = new google.maps.LatLng(lat, lng);

							// Add some interesting hover data as a 'title' for each marker that
							// says a little about the circumstances of the fataility.

							var date = entry.date.replace(/T00:00:00.000/, '');
							if (entry.charge.toLowerCase() == "n/a") {
								title = [ entry.location, entry.related, entry.type, date, entry.day, entry.time].join(", ");
							} else {
								title = [ entry.location, entry.related, entry.type, entry.charge, date, entry.day, entry.time].join(", ");
							}
							console.log(title);
							placeMarker(map, position, title);
						} else {

							// This usually amounts to meta data about the other records
							// i.e., an object that aggregates the total number of fatalities for the year.
							//
							//       a retraction object for cases where instead of an accident,
							//       the fatality was ruled a suicide; indicating why an earlier
							//       entry might have been removed from the db.

							console.log("loadData: Unable to extract lat and lng from:", entry);
						}
					});
				});
			}
			break;

		default:
			console.log("loadData: That following data source is not currently supported:", place, dataSource);
			console.log("loadData: Want to help add it? The code is open source.");

			console.log("loadData: geocoder path needs rework due to bursty throttle by Google geocode api.");
			console.log("loadData: Anything beyond first 10 goecode calls in rapid succession trigger an");
			console.log("loadData: api QUERY_OVER_LIMIT error with no lat/lng returned for given street address.");

			// TODO: Do we need to throttle our geocode calls to avoid an OVER_QUERY_LIMIT error?
			//
			// http://stackoverflow.com/questions/2419219/how-do-i-geocode-20-addresses-without-receiving-an-over-query-limit-response
			// http://gis.stackexchange.com/questions/15052/how-to-avoid-google-map-geocode-limit
			// https://developers.google.com/maps/documentation/geocoding/geocoding-strategies
			// https://developers.google.com/maps/documentation/javascript/firebase
			// http://stackoverflow.com/questions/19640055/multiple-markers-google-map-api-v3-from-array-of-addresses-and-avoid-over-query
			// http://econym.org.uk/gmap/geomulti.htm

			// Retrieve raw JSON data from the endpoint and
			// display it on the screen for debug purposes.

			//geocoder = new google.maps.Geocoder();
			//$.getJSON(dataSourceUrl, function(response) {
			// 	for (var i = 0; i < response.length; i++) {
			// 		var rawAddress = response[i].location;
			// 		var address = model.getFullAddress(place, rawAddress);
			// 		if (address) {
			// 			console.log("loadData: truthy i hope? ", address);
			//			geocodeAddress(geocoder, address, map);
			//		} else {
			//			console.log("loadData: skipping undefined address: ", rawAddress);
			//		}
			// 	}
			//});
	}
}

function geocodeAddress(geocoder, address, resultsMap) {
	if (address) {
		console.log("geocodeAddress:", address);
		geocoder.geocode({'address': address}, function(results, status) {
			if (status === 'OK') {
				var marker = new google.maps.Marker({
				map: resultsMap,
				position: results[0].geometry.location
				});
			} else {
				console.log("Geocode was not successful for the following reason: " + status);
				console.log("Failed on this address: ", address);
				//alert('Geocode was not successful for the following reason: ' + status);
			}
		});
	} else {
		console.log("geocodeAddress: ignoring non-truthy address: ", address);
		console.log("otherwise we'll trigger google geocodes api limiter");
	}
}

function placeMarker(map, positionLatLng, title) {
	var marker = new google.maps.Marker({
		map: map,
		position: positionLatLng,
		title: title
	});
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
// Usage: var map = loadPlace(model);
// ---------------------------------------------
// Fetch and render a google background map for the current place
// of interest known to the model.
//
// The map object is returned for subsequent map api calls
// for rendering markers, etc.

function loadMap(model) {
	console.log("loadMap");
	var place = model.getPlace();

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

function getCoordinates(address) {
	console.log("getCoordinates: address", address);
	var coordinates;
	geocoder.geocode({address: address}, function(results, stats) {
		console.log(typeof results);
		console.log(results);
		if (results) {
			coordinates = results[0].geometry.location;
		} else {
			console.log("getCoordinates: null results for this address: ", address);
		}
	});
	console.log(coordinates);
	return coordinates;
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
	vUpdateTitle(model.getAppName());
	vUpdateBackgroundImage(model.getBackgroundUrl(), model.getBackgroundImagePosition());
	$("#jumbotron-place").html(model.getAppName());
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

// Function: vUpdateBackgroundImage
// Usage: vUpdateBackgroundImage(model.getBackgroundUrl(), model.getBackgroundImagePosition());
// --------------------------------------------------------------------------------------------
// Updats the background image from the specified url.

function vUpdateBackgroundImage(backgroundUrl, position) {
	$(".jumbotron").css("background-image", "url(" + backgroundUrl + ")");
	$(".jumbotron").css("background-position", position);
}

// Function: vUpdateTile
// Usage: vUpdateTitle(model.getAppName());
// ----------------------------------------
// Updates the view title from the model.

function vUpdateTitle(nameStr) {
	$("title").html(nameStr);
}

// Function: vMapSource
// Usage: vMapSources();
// ---------------------
// Provide provenance for data on display through the map's caption line.

function vMapSource(model, dataSource) {

	//Add content to text area.
	var place = model.getPlace();
	var url = model.getEndpointUrl(place, dataSource).replace(/$$app_toke*$/,'').replace(/&api_key*$/,'');
	vMapCaption(url);
}

// Function: vMapCaption
// Usage: vMapCaption("2015 Traffic Fatalities");
// ----------------------------------------------
// Populates the caption area below the map with a string.

function vMapCaption(str) {

	//Define text area.
	var textArea = $("<div>");
	$(textArea).attr("id", "map-status");

	//Make text area read-only. Add it to the div.
	$(textArea).attr('readonly','readonly');

	$(".map-container").append(textArea);

	//Add content to text area.
	$(textArea).html(str);
}

// Function: locationReload
// Usage: location.reload(true)
// ------------------------------
// Resets zoom level of map when 'reset zoom' button clicked.

$(document).on("click", "#reset-button", function(){
    location.reload(true);
});
