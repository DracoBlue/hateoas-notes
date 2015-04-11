"use strict";

module.exports = function(notes) {
	var express = require('express');
	var url = require('url');
	var api = express.Router();

	api.use(function(req, res, next) {
		res.set('Content-Type', 'application/hal+json');
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
				"http://hateoas-notes/rels/notes": req.generateUrl('/notes'),
				"http://hateoas-notes/rels/create-note": req.generateUrl('/notes')
			}
		}));
	});

	api.get('/notes', function(req, res) {
		var offset = parseInt(req.query.offset || 0, 10);
		var limit = parseInt(req.query.limit || 20, 10);
		notes.getNotesByOffsetAndLimit(offset, limit + 1, function(err, notes) {
			var halNotes = [];
			var hasNextPage = notes.length > limit ? true : false;
			notes.splice(limit, 1);

			notes.forEach(function(note) {
				var halNote = note.toJSON();
				halNote["_links"] = {
					"self": req.generateUrl("/notes/" + note.getId())
				};
				halNotes.push(halNote);
			});

			var halResponse = {
				"_links": {
					"first": req.generateUrl('/notes?offset=0&limit=' + limit)
				},
				"_embedded": {
					"http://hateoas-notes/rels/note": halNotes
				}
			};

			if (hasNextPage)
			{
				halResponse["_links"].next = req.generateUrl('/notes?offset=' + (limit + offset) + '&limit=' + limit);
			}

			res.send(JSON.stringify(halResponse));
		});
	});

	api.post('/notes', function(req, res) {
		notes.createNote(req.body, function(err, note) {
			res.send(JSON.stringify(note.toJSON()));
		});
	});

	api.get('/notes/:id', function(req, res) {
		//res.set('Content-Type', 'application/json');

		notes.getNoteById(req.params.id, function(err, note) {
			res.send(JSON.stringify(note.toJSON()));
		});
	});

	return api;
};