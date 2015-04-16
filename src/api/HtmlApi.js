"use strict";

module.exports = function(notes, users) {
	var express = require('express');
	var url = require('url');
	var bodyParser = require('body-parser');
	var methodOverride = require('method-override')
	var api = express.Router();
	var HtmlNotesApi = require('./html/HtmlNotes');
	var HtmlUsersApi = require('./html/HtmlUsers');

	api.use(bodyParser.urlencoded({ extended: false }));
	api.use(methodOverride('_method'));

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

	api.use(HtmlNotesApi(notes));
	api.use(HtmlUsersApi(users));

	return api;
};