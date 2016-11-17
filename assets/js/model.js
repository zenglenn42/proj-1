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

	// model methods
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

// Function unitTests
// Usage: if (model.unitTests()) console.log("model unit tests passed");
// ---------------------------------------------------------------------
// Run unit tests for model methods.

function unitTests() {
	console.log("model.unitTests");
	result = true;
	
	// put non-trivial unit tests here.

	return result;
}
