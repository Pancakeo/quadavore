var fs = require('fs');
var path = require('path');

module.exports = function(app) {
    app.get('/apk', function(req, res) {
        var android_releases = path.join(global.web_root, 'release');

        fs.readdir(android_releases, function(err, files) {
            if (err != null) {
                res.send('Whoops, server error');
                return;
            }

            var out_string = "<h3>Android Releases</h3><ul>";

            files.forEach(function(file) {
                out_string += "<li><a href='release/" + file + "'>" + file + "</a></li>";
            });

            out_string += "</ul>";

            res.send(out_string);
        });

    });
};