var express = require('express');
var app = express();

app.get('/', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify({
        "echo": "hello"
    }));
});

app.listen((process.env.PORT || 3000), (process.env.HOST || '0.0.0.0'));
