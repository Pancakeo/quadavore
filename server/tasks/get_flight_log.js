var fs = require('fs');

module.exports = function(app) {
    app.get('/flight_log', function(req, res) {
        var user_id = req.query.user_id;
        var flight_name = req.query.flight_name;

        var flight = null;
        var cursor = global.db.collection('flight_logs').find({user: user_id, name: flight_name}, {meta: 1, data: 1, _id: 0});

        cursor.forEach(function(doc) {
            flight = doc;
        }, function() {
            if (flight != null) {
                res.json({success: true, flight: flight});
            }
            else {
                res.json({success: false, reason: "Flight not found"});
            }
        });
    });
};