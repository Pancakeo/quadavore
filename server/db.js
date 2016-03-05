var dbclient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/quadavore';

module.exports = function(cb)
{
    dbclient.connect(url, function(err, db)
    {
        console.log('Connected to MongoDB');
        cb(db);
    });
};
