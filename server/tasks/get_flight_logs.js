var fs = require('fs');
var path = require('path');
module.exports = function(app)
{
    app.get('/flight_logs', function(req, res)
    {
        var user_id = req.query.user_id;
        var user_folder = path.join(global.server_root, global.ROOT_LOG_FOLDER, user_id);
        
        try
        {
            fs.statSync(user_folder);

            fs.readdir(user_folder, function(err, result)
            {
                res.json({
                    flight_logs: result.filter(function(file)
                    {
                        return file.toLowerCase().indexOf('.csv') >= 0;
                        //file.toLowerCase().indexOf('.txt') >= 0;
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
};
