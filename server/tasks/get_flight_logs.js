var fs = require('fs');
var path = require('path');
module.exports = function(app)
{
    app.get('/flight_logs', function(req, res)
    {
        var user_id = req.query.user_id;
        
        try
        {
            var logs_list = [];
            var cursor = global.db.collection('flight_logs').find({user: user_id}, {name: 1, _id: 0});
            cursor.each(function(err, doc)
            {
                if (doc !== null)
                {
                    logs_list.push(doc.name);
                }
                else
                {
                    res.json({flight_logs: logs_list});
                }
            });
        }
        catch (e)
        {
            console.log(e);
            var logs_list = [];
            res.json({
                flight_logs: logs_list
            });
        }
    });
};
