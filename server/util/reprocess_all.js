var fs = require('fs');
var modules = require('../parse/modules');
var parse = require('../parse/parse');
var db_connect = require('../db');

var log_dir = '../quad_logs';
db_connect(function(db)
{
    var queue = [];
    fs.readdirSync(log_dir).forEach(function(subdir)
    {
        fs.readdirSync(log_dir+'/'+subdir).filter(function(file)
        {
            return file != 'meta.txt'; // Remove after ridding ourselves of meta.txt
        }).forEach(function(file)
        {
            queue.push({
                path: log_dir+'/'+subdir+'/'+file,
                user: subdir,
                name: file
            });
        });
    });
    
    var next_file = function()
    {
        if (queue.length > 0)
        {
            var file = queue.shift();
            fs.readFile(file.path, 'utf8', function(err, data)
            {
                console.log('Processing '+file.path);
                var parsed = parse(data, modules);
                parsed.name = file.name;
                parsed.user = file.user;

                db.collection('flight_logs').updateOne({
                    name: file.name,
                    user: file.user
                }, parsed, {upsert: true});
                console.log('Updated '+file.path);
                next_file();
            })
        }
        else
        {
            db.close();
        }
    };
    next_file();
})