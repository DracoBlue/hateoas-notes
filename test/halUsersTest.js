var assert = require("assert");
var request = require('supertest');
var app = require('./../src/');
var agent = request.agent(app);
var url = require("url");

var getFirstUserLink = function(callback) {
	var req = agent.get('/api/hal/users');
	req.set('Accept', 'application/hal+json');
	req.expect('Content-Type', /hal\+json/);
	req.expect(200);
	req.end(function(err, rawResponse){
		assert.ifError(err);
		var userRel = 'http://' + rawResponse.req.getHeader('host') + '/rels/user';
		assert.ok(rawResponse);
		var response = JSON.parse(rawResponse.text);
		assert.ok(response["_embedded"]);
		assert.ok(response["_embedded"][userRel]);
		assert.equal(1, response["_embedded"][userRel].length);
		assert.equal("test", response["_embedded"][userRel][0].username);
		var selfLink = response["_embedded"][userRel][0]["_links"]["self"].href;
		assert.ok(selfLink);
		callback(url.parse(selfLink).path)
	});
};

describe('GET /api/hal/users', function(){
	it('respond with 200 json', function(done){
		var req = agent.get('/api/hal/users');
		req.set('Accept', 'application/hal+json');
		req.expect('Content-Type', /hal\+json/);
		req.expect(200);
		req.end(function(err, rawResponse){
			assert.ifError(err);
			var userRel = 'http://' + rawResponse.req.getHeader('host') + '/rels/user';
			assert.ok(rawResponse);
			var response = JSON.parse(rawResponse.text);
			assert.ok(response["_links"]);
			assert.ok(response["_links"]["first"].href);
			assert.ok(response["_links"]["self"].href);
			assert.ok(response["_links"]["up"].href);
			assert.ok(response["_links"]["last"].href);
			assert.ok(response["_embedded"]);
			assert.ok(response["_embedded"][userRel]);
			assert.equal(1, response["_embedded"][userRel].length);
			assert.equal("test", response["_embedded"][userRel][0].username);
			assert.ok(response["_embedded"][userRel][0]["_links"]["self"].href);
			assert.ok(response["_embedded"][userRel][0]["_links"]["up"].href);
			done();
		});
	})
});

describe('GET /api/hal/users/:id', function(){
	it('respond with 200 json with first user link', function(done){
		getFirstUserLink(function(firstUserLink) {
			var req = agent.get(firstUserLink);
			req.set('Accept', 'application/hal+json');
			req.expect('Content-Type', /hal\+json/);
			req.expect(200);
			req.end(function(err, rawResponse){
				assert.ifError(err);
				var userRel = 'http://' + rawResponse.req.getHeader('host') + '/rels/user';
				assert.ok(rawResponse);
				var response = JSON.parse(rawResponse.text);
				assert.equal("test", response.username);
				assert.ok(response["_links"]["self"].href);
				done();
			});
		});
	});

	it('respond with 404 json with invalid id', function(done){
		var req = agent.get('/api/hal/users/invalid-user-id');
		req.set('Accept', 'application/hal+json');
		req.expect('Content-Type', /hal\+json/);
		req.expect(404);
		req.end(function(err, rawResponse){
			assert.ifError(err);
			var response = JSON.parse(rawResponse.text);
			assert.ok(response.message);
			done();
		});
	})
});

describe('POST /api/hal/users', function(){
	var createdUserLink = null;

	it('respond with 201 on post', function(done){
		var req = agent.post('/api/hal/users');
		req.send({
			"username": "randomTestUser",
			"password": "randomPassword"
		});
		req.set('Accept', 'application/hal+json');
		req.expect(201);
		req.end(function(err, rawResponse){
			assert.ifError(err);
			assert.ok(rawResponse.headers['location']);
			createdUserLink = url.parse(rawResponse.headers['location']).path;
			done();
		});
	});

	it('respond with 200 to fetch new user', function(done){
		var req = agent.get(createdUserLink);
		req.set('Accept', 'application/hal+json');
		req.expect('Content-Type', /hal\+json/);
		req.expect(200);
		req.end(function(err, rawResponse){
			assert.ifError(err);
			assert.ok(rawResponse);
			var response = JSON.parse(rawResponse.text);
			assert.ok(response["_links"]);
			assert.ok(response["_links"]["up"].href);
			assert.ok(response["_links"]["self"].href);
			assert.equal("randomTestUser", response["username"]);
			done();
		});
	});

	it('respond with 401 to delete the new user (if not authorized)', function(done){
		var req = agent.delete(createdUserLink);
		req.set('Accept', 'application/hal+json');
		req.expect(401);
		req.end(function(err, rawResponse){
			assert.ifError(err);
			assert.ok(rawResponse);
			done();
		});
	});

	it('respond with 403 to delete the new user (if authorized as other user)', function(done){
		var req = agent.delete(createdUserLink);
		req.set('Accept', 'application/hal+json');
		req.auth('test', 'password');
		req.expect(403);
		req.end(function(err, rawResponse){
			assert.ifError(err);
			assert.ok(rawResponse);
			done();
		});
	});

	it('respond with 204 to delete the new user (if authorized)', function(done){
		var req = agent.delete(createdUserLink);
		req.set('Accept', 'application/hal+json');
		req.auth('randomTestUser', 'randomPassword');
		req.expect(204);
		req.end(function(err, rawResponse){
			assert.ifError(err);
			assert.ok(rawResponse);
			done();
		});
	});

	it('respond with 404 to fetch the deleted user', function(done){
		var req = agent.get(createdUserLink);
		req.set('Accept', 'application/hal+json');
		req.expect(404);
		req.end(function(err, rawResponse){
			assert.ifError(err);
			assert.ok(rawResponse);
			done();
		});
	});

	it('respond with 404 to delete the deleted user', function(done){
		var req = agent.delete(createdUserLink);
		req.set('Accept', 'application/hal+json');
		req.expect(404);
		req.end(function(err, rawResponse){
			assert.ifError(err);
			assert.ok(rawResponse);
			done();
		});
	});
});