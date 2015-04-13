"use strict";

var User = function(data)
{
	this.data = data;
};

User.prototype.toJSON = function()
{
	return JSON.parse(JSON.stringify(this.data));
};

User.prototype.getId = function()
{
	return this.data.id;
};

User.prototype.getUsername = function()
{
	return this.data.username || '';
};

User.prototype.getPasswordHash = function()
{
	return this.data.passwordHash || '';
};

module.exports = User;