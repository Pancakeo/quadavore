var fs = require('fs');

module.exports = function(app) {
    app.delete('/flight_log', function(req, res) {
        var user_id = req.query.user_id;
        var flight_name = req.query.flight_name;

        console.log('User ' + user_id + ' is attempting to delete flight log ' + flight_name);
        global.db.collection('flight_logs').deleteOne({user: user_id, name: flight_name}, function(err, msg) {
            if (err == null) {
                console.log('User ' + user_id + ' deleted flight log: ' + flight_name);
                res.json({success: true});
            }
            else {
                console.log('Delete failed for user ' + user_id + ', flight log: ' + flight_name);
                res.json({success: false, reason: 'db error'});
            }

        });
    });
};