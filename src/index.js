var express = require('express');
var app = express();

var Notes = require('./domain/Notes');
var notes = new Notes();

var TestData = require('./TestData');
TestData(notes);

var halApi = require('./api/HalApi');
app.use('/api/hal', halApi(notes));

app.listen((process.env.PORT || 3000), (process.env.HOST || '0.0.0.0'));
