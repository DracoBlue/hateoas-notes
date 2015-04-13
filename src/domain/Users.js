"use strict";

var uuid = require('node-uuid');
var User = require('./User');
var UserAuthentication = require('./UserAuthentication');

var Users = function()
{
	this.users = {};
};

Users.prototype.getUserById = function(id, callback)
{
	if (this.users[id])
	{
		callback(false, new User(this.users[id]));
	}
	else
	{
		callback(true);
	}
};

Users.prototype.getUserByUsername = function(username, callback)
{
	for (var id in this.users)
	{
		if (this.users.hasOwnProperty(id))
		{
			if (this.users[id].username == username)
			{
				callback(false, new User(this.users[id]));
				return ;
			}
		}
	}

	callback(true);
};

Users.prototype.deleteUserById = function(id, callback)
{
	if (this.users[id])
	{
		delete this.users[id];
		callback(false);
	}
	else
	{
		callback(true);
	}
};

Users.prototype.countUsers = function(callback)
{
	var totalCount = 0;

	for (var id in this.users)
	{
		if (this.users.hasOwnProperty(id))
		{
			totalCount++;
		}
	}

	callback(false, totalCount);
};

Users.prototype.getUsersByOffsetAndLimit = function(offset, limit, callback)
{
	var users = [];

	for (var id in this.users)
	{
		if (this.users.hasOwnProperty(id))
		{
			if (offset > 0)
			{
				offset--;
			}
			else if (limit > 0)
			{
				limit--;
				users.push(new User(this.users[id]));
			}
			else
			{
				break;
			}
		}
	}

	callback(false, users);
};

Users.prototype.createUser = function(userData, callback)
{
	var that = this;

	this.getUserByUsername(userData.username, function(err, existingUser) {
		if (err)
		{
			userData.id = uuid.v4();
			if (userData.password) {
				var plainPassword = userData.password;
				delete userData.password;
				var authentication = new UserAuthentication(userData, plainPassword);
				userData.passwordHash = authentication.getPasswordHash();
			}
			that.users[userData.id] = userData;
			callback(false, new User(that.users[userData.id]));
		}
		else
		{
			callback(true);
		}
	});
};

module.exports = Users;