"use strict";

module.exports = function(ensureAuthentication, users) {
	var express = require('express');
	var api = express.Router();

	api.param('existingUserId', function (req, res, next, existingUserId) {
		users.getUserById(existingUserId, function(err, user) {
			if (err)
			{
				res.statusCode = 404;
				res.send(JSON.stringify({
					"message": "User with id: " + req.params.id + " not found!"
				}));
			}
			else
			{
				req.params.existingUser = user;
				next();
			}
		});
	});

	var userToHal = function(req, user) {
		var halUser = user.toJSON();
		halUser["_links"] = {
			"self": {"href": req.generateUrl("/users/" + user.getId())},
			"up": {"href": req.generateUrl("/users"), "title": "User Index"}
		};

		return halUser;
	};

	api.get('/users', function(req, res) {
		var offset = parseInt(req.query.offset || 0, 10);
		var limit = parseInt(req.query.limit || 20, 10);

		users.countUsers(function(err, totalCount) {
			users.getUsersByOffsetAndLimit(offset, limit + 1, function(err, users) {
				var hasNextPage = users.length > limit ? true : false;
				users.splice(limit, 1);

				var halResponse = {
					"_links": {
						"first": {"href": req.generateUrl('/users?offset=0&limit=' + limit)},
						"self": {"href": req.generateUrl('/users?offset=' + offset + '&limit=' + limit)},
						"up": {"href": req.generateUrl("/"), "title": "Api Index"},
						"last": {"href": req.generateUrl('/users?offset=' + Math.floor(totalCount/limit) + '&limit=' + limit)}
					},
					"_embedded": {
					}
				};

				halResponse["_links"][req.generateVendorRel("user")] = [];
				halResponse["_embedded"][req.generateVendorRel("user")] = [];

				users.forEach(function(user) {
					halResponse["_embedded"][req.generateVendorRel("user")].push(userToHal(req, user));
					halResponse["_links"][req.generateVendorRel("user")].push({"href": req.generateUrl("/users/" + user.getId()), "title": user.getUsername()});
				});

				if (hasNextPage)
				{
					halResponse["_links"].next = {"href": req.generateUrl('/users?offset=' + (limit + offset) + '&limit=' + limit)};
				}

				res.json(halResponse);
			});
		});
	});

	api.post('/users', function(req, res) {
		users.createUser({"username": req.body.username, "password": req.body.password}, function(err, user) {
			res.statusCode = 201;
			res.setHeader('Location', req.generateUrl("/users/" + user.getId()));
			res.end();
		});
	});

	api.get('/users/:existingUserId', function(req, res) {
		var user = req.params.existingUser;
		res.json(userToHal(req, user));
	});

	api.delete('/users/:existingUserId', ensureAuthentication, function(req, res) {
		var user = req.params.existingUser;

		if (req.getUser().getId() != user.getId())
		{
			res.statusCode = 403;
			res.json({
				"message": "Not allowed to delete the user with id: " + user.getId() + "!"
			});
		}
		else
		{
			users.deleteUserById(user.getId(), function(err) {
				res.statusCode = 204;
				res.end();
			});
		}
	});

	return api;
};