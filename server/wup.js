"use strict";
// require('./http_server');
var express = require('express');
var app = express();
var fs = require('fs');
var zlib = require('zlib');

var web_root = require('path').join(__dirname, '..', 'build');
var bodyParser = require('body-parser');
var compress = require('compression');

var path = require('path');

var db_connect = require('./db');
db_connect(function(db) {
    global.db = db;
});

global.server_root = __dirname;
global.ROOT_LOG_FOLDER = 'quad_logs';
global.web_root = web_root;

app.use(express.static(web_root));
app.use(bodyParser.json({limit: '50mb'}));
app.use(compress());

try {
    fs.statSync(global.ROOT_LOG_FOLDER);
}
catch (e) {
    var dir_name = global.ROOT_LOG_FOLDER;
    fs.mkdirSync(dir_name);
    console.log('Created folder ' + dir_name);
}

// Tasks
fs.readdir('./tasks', function(err, files) {
    files.forEach(function(file) {
        if (file.match(/\w+\.js/)) {
            var task = require('./' + path.join('tasks', file.replace('.js', '')));
            task(app);
        }
    });
});

global.settings = {
    port: 1991
};

try {
    var contents = fs.readFileSync('settings.json');
    global.settings = JSON.parse(contents);
}
catch (e) {
    console.log("Warning reading settings.json", e.toString());
}

app.listen(global.settings.port, function() {
    console.log('Quadavore is running on port ' + global.settings.port + '.');
});
