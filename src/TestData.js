"use strict";

module.exports = function(notes) {
	notes.createNotes([
		{
			"title": "Apples",
			"tags": ["fruits"]
		},
		{
			"title": "Watermelon",
			"tags": ["fruits"]
		},
		{
			"title": "Brave New World",
			"tags": ["books"]
		},
		{
			"title": "Lord of flies",
			"tags": ["books"]
		}
	], function() {

	});
};