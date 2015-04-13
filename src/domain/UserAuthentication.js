"use strict";


var UserAuthentication = function(user, password) {
	this.user = user;
	this.password = password;
};

UserAuthentication.prototype.getPasswordHash = function()
{
	var crypto = require('crypto');
	var shasum = crypto.createHash('sha1');
	shasum.update(this.password);
	var hash = shasum.digest('hex');
	return hash;
};

module.exports = UserAuthentication;