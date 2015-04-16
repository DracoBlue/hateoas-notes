"use strict";

module.exports = function(notes, users) {
	var express = require('express');
	var url = require('url');
	var bodyParser = require('body-parser');
	var auth = require('basic-auth');
	var methodOverride = require('method-override')
	var api = express.Router();
	var UserAuthentication = require('./../domain/UserAuthentication');
	var HtmlNotesApi = require('./html/HtmlNotes');
	var HtmlUsersApi = require('./html/HtmlUsers');

	api.use(bodyParser.urlencoded({ extended: false }));
	api.use(methodOverride('_method'));


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
		res.set('Content-Type', 'text/html');
		req.generateUrl = function(path) {
			var urlParts = url.parse(req.protocol + '://' + req.headers['host']);
			var port = parseInt(req.headers['x-forwarded-port'] ||  urlParts.port, 10);
			var protocol = req.headers['x-forwarded-proto'] || req.protocol;
			return protocol + '://' + req.hostname + ( port == 80 || port == 443 ? '' : ':' + port ) + req.baseUrl + path;
		};
		next();
	});

	api.get('/', function(req, res) {
		res.render('index', {
			"req": req
		});
	});

	api.use(HtmlNotesApi(ensureAuthentication, notes));
	api.use(HtmlUsersApi(ensureAuthentication, users));

	return api;
};