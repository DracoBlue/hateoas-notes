"use strict";

module.exports = function(notes, users) {
	var express = require('express');
	var url = require('url');
	var bodyParser = require('body-parser');
	var auth = require('basic-auth');
	var api = express.Router();
	var UserAuthentication = require('./../domain/UserAuthentication');
	var HalUsersApi = require('./hal/HalUsers');
	var HalNotesApi = require('./hal/HalNotes');

	api.use(bodyParser.json());

	api.param('existingNoteId', function (req, res, next, existingNoteId) {
		notes.getNoteById(existingNoteId, function(err, note) {
			if (err)
			{
				res.statusCode = 404;
				res.json({
					"message": "Note with id: " + existingNoteId + " not found!"
				});
			}
			else
			{
				req.params.existingNote = note;
				next();
			}
		});
	});

	var ensureAuthentication = function(req, res, next) {
		var credentials = auth(req);
		var handleAuthenticationError = function() {
			res.writeHead(401, {
				'Www-Authenticate': 'Basic realm="example"',
				'Content-Type': 'text/html'
			});
			res.end()
		};

		if (credentials) {
			users.getUserByUsername(credentials.name, function(err, user) {
				if (!err)
				{
					var authentication = new UserAuthentication(user, credentials.pass);

					if (authentication.getPasswordHash() == user.getPasswordHash())
					{
						req.getUser = function()
						{
							return user;
						};

						next();
						return ;
					}
				}

				handleAuthenticationError();
			});
		} else {
			handleAuthenticationError();
		}
	};

	api.use(function(req, res, next) {
		res.set('Content-Type', 'application/hal+json');
		req.generateUrl = function(path) {
			var urlParts = url.parse(req.protocol + '://' + req.headers['host']);
			var port = parseInt(req.headers['x-forwarded-port'] ||  urlParts.port, 10);
			var protocol = req.headers['x-forwarded-proto'] || req.protocol;
			return protocol + '://' + req.hostname + ( port == 80 || port == 443 ? '' : ':' + port ) + req.baseUrl + path;
		};
		req.generateVendorRel = function(path) {
			var urlParts = url.parse(req.protocol + '://' + req.headers['host']);
			var port = parseInt(req.headers['x-forwarded-port'] ||  urlParts.port, 10);
			var protocol = req.headers['x-forwarded-proto'] || req.protocol;
			return protocol + '://' + req.hostname + ( port == 80 || port == 443 ? '' : ':' + port ) + '/rels/' + path
		};
		next();
	});

	api.get('/', function(req, res) {
		var halResponse = {"_links": {}};
		halResponse["_links"][req.generateVendorRel("notes")] = {"href": req.generateUrl('/notes'), "title": "All Notes"};
		halResponse["_links"][req.generateVendorRel("create-note")] = {"href": req.generateUrl('/notes'), "title": "Create a new Note"};
		halResponse["_links"][req.generateVendorRel("users")] = {"href": req.generateUrl('/users'), "title": "All Users"};
		halResponse["_links"][req.generateVendorRel("register-user")] = {"href": req.generateUrl('/users'), "title": "Register a User"};

		res.send(JSON.stringify(halResponse));
	});

	api.use(HalUsersApi(ensureAuthentication, users));
	api.use(HalNotesApi(ensureAuthentication, notes));

	return api;
};