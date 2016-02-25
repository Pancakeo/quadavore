var fs = require('fs');
var parse_log = require('./parse.js');
var parse_modules = require('./modules.js');
var filename = process.argv[2];

fs.readFile(filename, {encoding: 'utf8'}, function(err, content)
{
    var result = parse_log(content, parse_modules);
    for (var item in result)
    {
        console.log(item+': '+result[item]);
    }
});
