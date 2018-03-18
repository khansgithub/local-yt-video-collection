// Having this as a global variable so View can 
// access this to remove entries when the 'remove' button
// is clicked.
//
// Ideally this would be a class level variable in `Contorller`
// but I don't know how to do that.
//var model;
window.model = {};

document.addEventListener("DOMContentLoaded", function(){
	util.init();
	Controller.add();
});