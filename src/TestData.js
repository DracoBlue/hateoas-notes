"use strict";

module.exports = function(notes, users) {
	users.createUser({
		"username": "test",
		"password": "password"
	}, function(err, user) {
		notes.createNotes([
			{
				"title": "Apples",
				"tags": ["fruits"],
				"owner": user.getId()
			},
			{
				"title": "Watermelon",
				"tags": ["fruits"],
				"owner": user.getId()
			},
			{
				"title": "Brave New World",
				"tags": ["books"],
				"owner": user.getId()
			},
			{
				"title": "Lord of flies",
				"tags": ["books"],
				"owner": user.getId()
			},
			{
				"title": "REST in Practice",
				"tags": ["books"],
				"owner": user.getId()
			},
			{
				"title": "Domain Driven Design",
				"tags": ["books"],
				"owner": user.getId()
			}
		], function() {

		});
	});
};