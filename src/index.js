var express = require('express');
var app = express();
var cors = require('cors')

var Notes = require('./domain/Notes');
var notes = new Notes();
var Users = require('./domain/Users');
var users = new Users();

/* enable cors */

app.use(cors({
	"credentials": true,
	"origin": true
}));

/* inject test data */

var TestData = require('./TestData');
TestData(notes, users);

/* HAL Api */

var halApi = require('./api/HalApi');
app.use('/api/hal', halApi(notes, users));

/* HTML Api */

var htmlApi = require('./api/HtmlApi');
app.use('/api/html', htmlApi(notes));

app.set('views', __dirname + '/api/html');
app.set('view engine', 'twig');
app.set('twig options', {
	strict_variables: false
});

/* Redirect all other Users to github */

app.get('/', function(req, res) {
	res.statusCode = 302;
	res.setHeader('Location', '/api/html');
	res.end();
});

app.get('/robots.txt', function(req, res) {
	res.setHeader('Content-Type', 'text/plain');
	res.send([
		'User-Agent: *',
		'Allow: /'
	].join("\n"));
});

module.exports = app;