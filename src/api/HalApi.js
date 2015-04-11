"use strict";

module.exports = function(notes) {
	var express = require('express');
	var url = require('url');
	var api = express.Router();

	api.use(function(req, res, next) {
		res.set('Content-Type', 'application/hal+json');
		res.set('Access-Control-Allow-Origin', '*');
		res.set('Access-Control-Allow-Credentials', 'true');
		res.set('Access-Control-Allow-Methods', '*');
		res.set('Access-Control-Allow-Headers', '*');
		req.generateUrl = function(path) {
			var urlParts = url.parse(req.protocol + '://' + req.headers['host']);
			var port = parseInt(req.headers['x-forwarded-port'] ||  urlParts.port, 10);
			var protocol = req.headers['x-forwarded-proto'] || req.protocol;
			return protocol + '://' + req.hostname + ( port == 80 || port == 443 ? '' : ':' + port ) + req.baseUrl + path;
		};
		next();
	});

	api.get('/', function(req, res) {
		res.send(JSON.stringify({
			"_links": {
				"http://hateoas-notes/rels/notes": {"href": req.generateUrl('/notes')},
				"http://hateoas-notes/rels/create-note": {"href": req.generateUrl('/notes')}
			}
		}));
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
		notes.getNotesByOffsetAndLimit(offset, limit + 1, function(err, notes) {
			var halNotes = [];
			var hasNextPage = notes.length > limit ? true : false;
			notes.splice(limit, 1);

			notes.forEach(function(note) {
				halNotes.push(noteToHal(req, note));
			});

			var halResponse = {
				"_links": {
					"first": {"href": req.generateUrl('/notes?offset=0&limit=' + limit)}
				},
				"_embedded": {
					"http://hateoas-notes/rels/note": halNotes
				}
			};

			if (hasNextPage)
			{
				halResponse["_links"].next = {"href": req.generateUrl('/notes?offset=' + (limit + offset) + '&limit=' + limit)};
			}

			res.send(JSON.stringify(halResponse));
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
			res.send(JSON.stringify(noteToHal(req, note)));
		});
	});

	return api;
};