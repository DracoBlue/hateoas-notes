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

Note.prototype.getTitle = function()
{
	return this.data.title || '';
};

Note.prototype.getDescription = function()
{
	return this.data.description || '';
};

Note.prototype.getTags = function()
{
	return this.data.tags || [];
};

Note.prototype.getOwnerId = function()
{
	return this.data.owner;
}

module.exports = Note;