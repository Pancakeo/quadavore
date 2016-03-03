var fs = require('fs');
var path = require('path');

module.exports = function(app)
{
    app.get('/flight_log', function(req, res)
    {
        var user_id = req.query.user_id;
        var flight_name = req.query.flight_name;
        
        try
        {
            
            var flight = null;
            var cursor = global.db.collection('flight_logs').find({user: user_id, name: flight_name}, {meta: 1, data: 1, _id: 0});
            cursor.each(function(err, doc)
            {
                if (doc !== null)
                {
                    flight = doc;
                }
                else
                {
                    res.json({success: true, flight: flight});
                }
                
            });
        }
        catch (e)
        {
            console.log(e);
            res.json({success: false, reason: "Flight not found"});
        }
    });
}