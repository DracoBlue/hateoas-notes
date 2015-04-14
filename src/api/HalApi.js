"use strict";

module.exports = function(notes) {
	var express = require('express');
	var url = require('url');
	var bodyParser = require('body-parser');
	var api = express.Router();

	api.use(bodyParser.json())

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
		halResponse["_links"][req.generateVendorRel("notes")] = {"href": req.generateUrl('/notes')};
		halResponse["_links"][req.generateVendorRel("create-note")] = {"href": req.generateUrl('/notes')};

		res.send(JSON.stringify(halResponse));
	});

	var noteToHal = function(req, note) {
		var halNote = note.toJSON();
		halNote["_links"] = {
			"self": {"href": req.generateUrl("/notes/" + note.getId())},
			"up": {"href": req.generateUrl("/notes")}
		};

		return halNote;
	};

	api.get('/notes', function(req, res) {
		var offset = parseInt(req.query.offset || 0, 10);
		var limit = parseInt(req.query.limit || 20, 10);

		notes.countNotes(function(err, totalCount) {
			notes.getNotesByOffsetAndLimit(offset, limit + 1, function(err, notes) {
				var halNotes = [];
				var hasNextPage = notes.length > limit ? true : false;
				notes.splice(limit, 1);

				var halResponse = {
					"_links": {
						"first": {"href": req.generateUrl('/notes?offset=0&limit=' + limit)},
						"self": {"href": req.generateUrl('/notes?offset=' + offset + '&limit=' + limit)},
						"up": {"href": req.generateUrl("/")},
						"last": {"href": req.generateUrl('/notes?offset=' + Math.floor(totalCount/limit) + '&limit=' + limit)},
					},
					"_embedded": {
					}
				};

				halResponse["_links"][req.generateVendorRel("note")] = [];
				halResponse["_embedded"][req.generateVendorRel("note")] = [];

				notes.forEach(function(note) {
					halResponse["_embedded"][req.generateVendorRel("note")].push(noteToHal(req, note));
					halResponse["_links"][req.generateVendorRel("note")].push({"href": req.generateUrl("/notes/" + note.getId())});
				});

				if (hasNextPage)
				{
					halResponse["_links"].next = {"href": req.generateUrl('/notes?offset=' + (limit + offset) + '&limit=' + limit)};
				}

				res.send(JSON.stringify(halResponse));
			});
		});
	});

	api.post('/notes', function(req, res) {
		notes.createNote(req.body, function(err, note) {
			res.statusCode = 201;
			res.setHeader('Location', req.generateUrl("/notes/" + note.getId()));
			res.end();
		});
	});

	api.get('/notes/:id', function(req, res) {
		notes.getNoteById(req.params.id, function(err, note) {
			if (err)
			{
				res.statusCode = 404;
				res.send(JSON.stringify({
					"message": "Note with id: " + req.params.id + " not found!"
				}));
			}
			else
			{
				res.send(JSON.stringify(noteToHal(req, note)));
			}
		});
	});

	api.put('/notes/:id', function(req, res) {
		notes.updateNoteById(req.params.id, req.body, function(err, note) {
			if (err)
			{
				res.statusCode = 404;
				res.send(JSON.stringify({
					"message": "Note with id: " + req.params.id + " not found!"
				}));
			}
			else
			{
				res.statusCode = 204;
				res.end();
			}
		});
	});

	api.delete('/notes/:id', function(req, res) {
		notes.deleteNoteById(req.params.id, function(err) {
			if (err)
			{
				res.statusCode = 404;
				res.send(JSON.stringify({
					"message": "Note with id: " + req.params.id + " not found!"
				}));
			}
			else
			{
				res.statusCode = 204;
				res.end();
			}
		});
	});

	return api;
};