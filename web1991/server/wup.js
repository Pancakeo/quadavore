"use strict";
require('./http_server');
var parse_thing = require('../../parse');

var express = require('express');
var app = express();

app.get('/parsley/', function(req, res)
{
	// Super brilliant.
	var filename = 'test_log.csv';
	parse_thing.wup('../../quad_logs/' + filename, function(output)
	{
		res.json(output);
	});

});

app.get('/parsley/:filename', function(req, res)
{
	// Super brilliant.
	var filename = req.params.filename;
	parse_thing.wup('../../quad_logs/' + filename, function(output)
	{
		res.json(output);
	});
});

app.listen(3000, function()
{
	console.log('Quadavore 3000.');
});
