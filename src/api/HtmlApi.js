"use strict";

module.exports = function(notes) {
	var express = require('express');
	var url = require('url');
	var bodyParser = require('body-parser');
	var methodOverride = require('method-override')
	var api = express.Router();

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


	api.get('/create-note', function(req, res) {
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

	api.put('/notes/:id', function(req, res) {
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

		notes.updateNoteById(req.params.id, body, function(err, note) {
			if (err)
			{
				res.statusCode = 404;
				res.render('notFound', {
					"req": req
				});
			}
			else
			{
				res.render('note', {
					"req": req,
					"note": note,
					"successAlert": "Note #" + note.getId() + " updated.",
					"updateNoteUrl": req.generateUrl('/notes/' + note.getId() + '?_method=put')
				});
			}
		});
	});

	api.post('/notes', function(req, res) {
		var body = req.body;
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

	api.get('/notes/:id', function(req, res) {
		notes.getNoteById(req.params.id, function(err, note) {
			if (err)
			{
				res.statusCode = 404;
				res.render('notFound', {
					"req": req
				});
			}
			else
			{
				res.render('note', {
					"req": req,
					"note": note,
					"updateNoteUrl": req.generateUrl('/notes/' + note.getId() + '?_method=put')
				});
			}
		});
	});

	api.delete('/notes/:id', function(req, res) {
		notes.deleteNoteById(req.params.id, function(err) {
			if (err)
			{
				res.statusCode = 404;
				res.render('notFound', {
					"req": req
				});
			}
			else
			{
				res.statusCode = 302;
				res.setHeader('Location', req.generateUrl("/notes"));
				res.end();
			}
		});
	});


	return api;
};