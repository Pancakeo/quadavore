var fs = require('fs');
var path = require('path');

module.exports = function(app)
{
    app.get('/flight_log', function(req, res)
    {
        var user_id = req.query.user_id;
        var flight_name = req.query.flight_name;
        var path_to_flight = path.join(global.server_root, global.ROOT_LOG_FOLDER, user_id, flight_name);

        try
        {
            fs.statSync(path_to_flight);
            res.download(path_to_flight);
        }
        catch (e)
        {
            res.json({success: false, reason: "Flight not found"});
        }
    });
}