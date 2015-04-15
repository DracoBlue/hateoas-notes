"use strict";

module.exports = function(ensureAuthentication, notes) {
	var express = require('express');
	var api = express.Router();

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

	var noteToHal = function(req, note) {
		var halNote = note.toJSON();
		halNote["_links"] = {
			"self": {"href": req.generateUrl("/notes/" + note.getId())},
			"up": {"href": req.generateUrl("/notes")}
		};
		if (halNote["owner"])
		{
			halNote["_links"][req.generateVendorRel("owner")] = {"href": req.generateUrl("/users/" + halNote["owner"]), "title": null}
			delete halNote["owner"];
		}

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

	api.post('/notes', ensureAuthentication, function(req, res) {
		var noteData = req.body;
		noteData.owner = req.getUser().getId();
		notes.createNote(req.body, function(err, note) {
			res.statusCode = 201;
			res.setHeader('Location', req.generateUrl("/notes/" + note.getId()));
			res.end();
		});
	});

	api.get('/notes/:existingNoteId', function(req, res) {
		var note = req.params.existingNote;
		res.send(JSON.stringify(noteToHal(req, note)));
	});

	api.put('/notes/:existingNoteId', ensureAuthentication, function(req, res) {
		var note = req.params.existingNote;
		if (note.getOwnerId() != req.getUser().getId())
		{
			res.statusCode = 403;
			res.send(JSON.stringify({
				"message": "You are not owner of the note with id: " + note.getId() + "!"
			}));
		}
		else
		{
			var noteData = req.body;
			noteData.owner = req.getUser().getId();
			notes.updateNoteById(req.params.id, req.body, function(err, note) {
				if (err)
				{
					res.statusCode = 500;
					res.send(JSON.stringify({
						"message": "Cannot update the note with id: " + req.params.id + "!"
					}));
				}
				else
				{
					res.statusCode = 204;
					res.end();
				}
			});
		}
	});

	api.delete('/notes/:existingNoteId', ensureAuthentication, function(req, res) {
		var note = req.params.existingNote;
		if (note.getOwnerId() != req.getUser().getId())
		{
			res.statusCode = 404;
			res.send(JSON.stringify({
				"message": "You are not owner of the note with id: " + note.getId() + "!"
			}));
		}
		else
		{
			notes.deleteNoteById(req.params.id, function(err) {
				if (err)
				{
					res.statusCode = 500;
					res.send(JSON.stringify({
						"message": "Cannot delete the not with id: " + req.params.id + "!"
					}));
				}
				else
				{
					res.statusCode = 204;
					res.end();
				}
			});
		}
	});

	return api;
};