"use strict";
// require('./http_server');

var express = require('express');
var app = express();
var fs = require('fs');

var web_root = require('path').join(__dirname, '..', 'build');
var bodyParser = require('body-parser');
var compress = require('compression');

var ROOT_LOG_FOLDER = 'quad_logs';

app.use(express.static(web_root));
app.use(bodyParser.json({limit: '50mb'}));
app.use(compress());

try
{
	fs.statSync(ROOT_LOG_FOLDER);
}
catch (e)
{
	var dir_name = ROOT_LOG_FOLDER;
	fs.mkdirSync(dir_name);
	console.log('Created folder ' + dir_name);
}

app.get('/flight_logs', function(req, res)
{
	var user_id = req.query.user_id;
	var user_folder = './' + ROOT_LOG_FOLDER + '/' + user_id;

	try
	{
		fs.statSync(user_folder);

		fs.readdir(user_folder, function(err, result)
		{
			res.json({
				flight_logs: result.filter(function(file)
				{
					return file.toLowerCase().indexOf('.csv') >= 0 ||
						file.toLowerCase().indexOf('.txt') >= 0;
				})
			});
		})
	}
	catch (e)
	{
		console.log('no folder for user ' + user_id);
		res.json({flight_logs: []});
	}

});

app.get('/flight_log', function(req, res)
{
	var user_id = req.query.user_id;
	var flight_name = req.query.flight_name;
	var path_to_flight = './' + ROOT_LOG_FOLDER + '/' + user_id + '/' + flight_name;

	try
	{
		fs.statSync(path_to_flight);
		fs.readFile(path_to_flight, 'utf8', function(err, result)
		{
			if (err != null)
			{
				res.json({success: false, reason: "IO error"});
				return;
			}

			res.json({success: true, csv_raw: result, file_name: flight_name});
		});
	}
	catch (e)
	{
		res.json({success: false, reason: "Flight not found"});
	}
});

app.put('/flight_log', function(req, res)
{
	var user_id = req.body.user_id;
	var user_name = req.body.user_name;
	var csv_raw = req.body.csv_raw;
	var file_name = req.body.file_name;

	if (csv_raw == null || csv_raw.trim() == '')
	{
		res.json({
			transfer_id: req.body.transfer_id,
			success: false,
			reason: 'no csv file'
		});

		return;
	}
	else if (file_name == null || file_name.trim() == '')
	{
		res.json({
			transfer_id: req.body.transfer_id,
			success: false,
			reason: 'bad file name'
		});

		return;
	}
	// TODO - maybe check indexOf ('.csv') here?

	var user_folder = './' + ROOT_LOG_FOLDER + '/' + user_id;

	try
	{
		fs.statSync(user_folder);
	}
	catch (e)
	{
		var dir_name = user_id;
		fs.mkdirSync(user_folder);
		console.log('Created user folder ' + dir_name);
	}

	// Create a meta entry linking the user_id to name.
	try
	{
		fs.statSync(user_folder + '/.meta.txt');
	}
	catch (e)
	{
		fs.writeFileSync(user_folder + '/meta.txt', 'Name: ' + user_name);
	}

	fs.writeFile('./' + user_folder + '/' + file_name, csv_raw, function(err, result)
	{
		if (err != null)
		{
			console.log(err);
			res.json({
				transfer_id: req.body.transfer_id,
				success: false,
				reason: 'File write error'
			});

			return;
		}

		res.json({
			transfer_id: req.body.transfer_id,
			success: true
		});
	});


});

var port = 1991;
app.listen(port, function()
{
	console.log('Quadavore is running on port ' + port + '.');
});
