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

// Function: vInit
// Usage: vInit(model);
// --------------------
// Initializes the view / presentation layer with data from the model.
// Model data may include default settings in model.js as well as
// data from persistent storage.

function vInit(model) {
	console.log("vInit");

}

// Function: cInit
// Usage: cInit();
// ---------------
// Initializes the controller by registering various callback functions
// that come to life in response to user input of some kind.

function cInit() {
	console.log("cInit");
}
