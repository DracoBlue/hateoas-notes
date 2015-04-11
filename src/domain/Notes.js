"use strict";

var uuid = require('node-uuid');
var Note = require('./Note');

var Notes = function()
{
	this.notes = {};
};

Notes.prototype.getNoteById = function(id, callback)
{
	callback(false, new Note({
		"id": id
	}));
};

Notes.prototype.countNotes = function(callback)
{
	var totalCount = 0;

	for (var id in this.notes)
	{
		if (this.notes.hasOwnProperty(id))
		{
			totalCount++;
		}
	}

	callback(false, totalCount);
};

Notes.prototype.getNotesByOffsetAndLimit = function(offset, limit, callback)
{
	var index = 0;
	var notes = [];

	for (var id in this.notes)
	{
		if (this.notes.hasOwnProperty(id))
		{
			if (offset > 0)
			{
				offset--;
			}
			else if (limit > 0)
			{
				limit--;
				notes.push(new Note(this.notes[id]));
			}
			else
			{
				break;
			}
		}
	}

	callback(false, notes);
};

Notes.prototype.rawCreateNote = function(noteData)
{
	noteData.id = uuid.v4();
	this.notes[noteData.id] = noteData;
	return new Note(this.notes[noteData.id]);
};

Notes.prototype.createNote = function(noteData, callback)
{
	callback(false, this.rawCreateNote(noteData));
};

Notes.prototype.createNotes = function(notesData, callback)
{
	var that = this;
	var notes = [];
	notesData.forEach(function(noteData) {
		notes.push(that.rawCreateNote(noteData));
	})
	callback(false, notes);
};

module.exports = Notes;