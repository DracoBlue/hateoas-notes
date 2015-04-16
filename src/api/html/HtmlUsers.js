"use strict";

module.exports = function(users) {
	var express = require('express');
	var api = express.Router();

	api.param('existingUserId', function (req, res, next, existingUserId) {
		users.getUserById(existingUserId, function(err, user) {
			if (err)
			{
				res.statusCode = 404;
				res.render('notFound', {
					"req": req
				});
			}
			else
			{
				req.params.existingUser = user;
				next();
			}
		});
	});

	api.get('/register-user', function(req, res) {
		res.render('registerUser', {
			"req": req,
			"createUserUrl": req.generateUrl('/users')
		});
	});

	api.get('/users', function(req, res) {
		var offset = parseInt(req.query.offset || 0, 10);
		var limit = parseInt(req.query.limit || 20, 10);

		users.countUsers(function(err, totalCount) {
			users.getUsersByOffsetAndLimit(offset, limit + 1, function(err, users) {
				var halusers = [];
				var hasNextPage = users.length > limit ? true : false;
				users.splice(limit, 1);

				res.render("users", {
					"req": req,
					"users": users,
					"currentPage": Math.floor(offset/limit) + 1,
					"totalPagesCount": Math.ceil(totalCount / limit),
					"offset": offset,
					"limit": limit,
					"first_url": offset >= limit ? req.generateUrl('/users?offset=0&limit=' + limit) : null,
					"self_url": req.generateUrl('/users?offset=' + offset + '&limit=' + limit),
					"last_url": hasNextPage ? req.generateUrl('/users?offset=' + Math.floor(totalCount/limit) + '&limit=' + limit) : null,
					"next_url": hasNextPage ? req.generateUrl('/users?offset=' + (limit + offset) + '&limit=' + limit) : null,
					"prev_url": offset >= limit ? req.generateUrl('/users?offset=' + (offset - limit) + '&limit=' + limit) : null
				});
			});
		});
	});

	api.post('/users', function(req, res) {
		users.createUser({"username": req.body.username, "password": req.body.password}, function(err, user) {
			res.statusCode = 302;
			res.setHeader('Location', req.generateUrl("/users/" + user.getId()));
			res.end();
		});
	});

	api.get('/users/:existingUserId', function(req, res) {
		var user = req.params.existingUser;
		res.render('user', {
			"req": req,
			"user": user,
			"updateUserUrl": req.generateUrl('/users/' + user.getId() + '?_method=put')
		});
	});

	api.delete('/users/:existingUserId', function(req, res) {
		var user = req.params.existingUser;
		users.deleteUserById(user.getId(), function(err) {
			res.statusCode = 302;
			res.setHeader('Location', req.generateUrl("/users"));
			res.end();
		});
	});

	return api;
};