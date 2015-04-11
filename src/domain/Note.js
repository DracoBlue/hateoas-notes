"use strict";

var Note = function(data)
{
	this.data = data;
};

Note.prototype.toJSON = function()
{
	return JSON.parse(JSON.stringify(this.data));
};

Note.prototype.getId = function()
{
	return this.data.id;
};

module.exports = Note;