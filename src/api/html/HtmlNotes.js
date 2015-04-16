"use strict";

module.exports = function(ensureAuthentication, notes) {
	var express = require('express');
	var api = express.Router();

	api.param('existingNoteId', function (req, res, next, existingNoteId) {
		notes.getNoteById(existingNoteId, function(err, note) {
			if (err)
			{
				res.statusCode = 404;
				res.render('notFound', {
					"req": req,
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

	api.get('/create-note', ensureAuthentication, function(req, res) {
		res.render('createNote', {
			"req": req,
			"createNoteUrl": req.generateUrl('/notes')
		});
	});

	api.get('/notes', function(req, res) {
		var offset = parseInt(req.query.offset || 0, 10);
		var limit = parseInt(req.query.limit || 20, 10);

		notes.countNotes(function(err, totalCount) {
			notes.getNotesByOffsetAndLimit(offset, limit + 1, function(err, notes) {
				var halNotes = [];
				var hasNextPage = notes.length > limit ? true : false;
				notes.splice(limit, 1);

				res.render("notes", {
					"req": req,
					"notes": notes,
					"currentPage": Math.floor(offset/limit) + 1,
					"totalPagesCount": Math.ceil(totalCount / limit),
					"offset": offset,
					"limit": limit,
					"first_url": offset >= limit ? req.generateUrl('/notes?offset=0&limit=' + limit) : null,
					"self_url": req.generateUrl('/notes?offset=' + offset + '&limit=' + limit),
					"last_url": hasNextPage ? req.generateUrl('/notes?offset=' + Math.floor(totalCount/limit) + '&limit=' + limit) : null,
					"next_url": hasNextPage ? req.generateUrl('/notes?offset=' + (limit + offset) + '&limit=' + limit) : null,
					"prev_url": offset >= limit ? req.generateUrl('/notes?offset=' + (offset - limit) + '&limit=' + limit) : null
				});
			});
		});
	});

	api.put('/notes/:existingNoteId', ensureAuthentication, function(req, res) {
		var note = req.params.existingNote;
		var body = req.body;
		body.tags = (body.tags || '').trim();
		if (body.tags == '')
		{
			body.tags = [];
		}
		else
		{
			body.tags = body.tags.replace(/([\s]*,[\s]*)/g, ',').split(',');
		}

		if (note.getOwnerId() != req.getUser().getId())
		{
			res.statusCode = 403;
			res.render('forbidden', {
				"req": req,
				"message": "You are not owner of the note with id: " + note.getId() + "!"
			});
		}
		else {
			body.owner = req.getUser().getId();

			notes.updateNoteById(note.getId(), body, function (err, note) {
				if (err) {
					res.statusCode = 500;
					res.render('internalError', {
						"req": req,
						"message": "Cannot update the note with id: " + note.getId() + '!'
					});
				}
				else {
					res.render('note', {
						"req": req,
						"note": note,
						"successAlert": "Note #" + note.getId() + " updated.",
						"updateNoteUrl": req.generateUrl('/notes/' + note.getId() + '?_method=put')
					});
				}
			});
		}
	});

	api.post('/notes', ensureAuthentication, function(req, res) {
		var body = req.body;
		body.owner = req.getUser().getId();
		body.tags = body.tags.trim();
		if (body.tags == '')
		{
			body.tags = [];
		}
		else
		{
			body.tags = body.tags.replace(/([\s]*,[\s]*)/g, ',').split(',');
		}

		notes.createNote(body, function(err, note) {
			res.statusCode = 302;
			res.setHeader('Location', req.generateUrl("/notes/" + note.getId()));
			res.end();
		});
	});

	api.get('/notes/:existingNoteId', function(req, res) {
		var note = req.params.existingNote;
		res.render('note', {
			"req": req,
			"note": note,
			"updateNoteUrl": req.generateUrl('/notes/' + note.getId() + '?_method=put')
		});
	});

	api.delete('/notes/:existingNoteId', function(req, res) {
		var note = req.params.existingNote;
		if (note.getOwnerId() != req.getUser().getId())
		{
			res.statusCode = 403;
			res.render('forbidden', {
				"req": req,
				"message": "You are not owner of the note with id: " + note.getId() + "!"
			});
		}
		else
		{
			notes.deleteNoteById(req.params.id, function(err) {
				if (err)
				{
					res.statusCode = 500;
					res.render('internalError', {
						"req": req,
						"message": "Cannot delete the note with id: " + note.getId() + '!'
					});
				}
				else
				{
					res.statusCode = 302;
					res.setHeader('Location', req.generateUrl("/notes"));
					res.end();
				}
			});
		}
	});

	return api;
};