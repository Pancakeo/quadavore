var fs = require('fs');
var path = require('path');
module.exports = function(app) {
    app.get('/flight_logs', function(req, res) {
        var user_id = req.query.user_id;

        try {
            //var logs_list = [];
            var cursor = global.db.collection('flight_logs').find({user: user_id}, {name: 1, "data.home_point_derived": 1, _id: 0});
            var logs_list = [];
            cursor.forEach(function(doc) {
                logs_list.push({
                    name: doc.name,
                    home_point: doc.data.home_point_derived
                });
            }, function() {
                res.json({flight_logs: logs_list});
            });
        }
        catch (e) {
            console.log(e);
            var logs_list = [];
            res.json({
                flight_logs: logs_list
            });
        }
    });
};
