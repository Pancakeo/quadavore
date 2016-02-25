var CSV = require('./bower_components/comma-separated-values/csv.js');
var moment = require('./bower_components/moment/moment.js');
var fs = require('fs');
var filename = process.argv[2];

var modules = {
    avg_speed_after_takeoff: {
        speed_over_zero: false,
        speed_cumulative: 0,
        speed_records: 0,
        per_row: function(row, index)
        {
            var speed = parseFloat(row['speed(mph)']);
            
            if (this.speed_over_zero === false && speed > 0)
            {
                this.speed_over_zero = true;
            }
            
            if (this.speed_over_zero === true)
            {
                this.speed_cumulative += speed;
                this.speed_records++;
            }
        },
        result: function()
        {
            return this.speed_cumulative / this.speed_records;
        }
    },
    avg_alt_after_takeoff: {
        alt_over_zero: false,
        alt_cumulative: 0,
        alt_records: 0,
        per_row: function(row, index)
        {
            var altitude = parseFloat(row['altitude(feet)']);
            
            if (this.alt_over_zero === false && altitude > 0)
            {
                this.alt_over_zero = true;
            }
            
            if (this.alt_over_zero === true)
            {
                this.alt_cumulative += altitude;
                this.alt_records++;
            }
        },
        result: function()
        {
            return this.alt_cumulative / this.alt_records;
        }
    },
    avg_distance_miles_after_takeoff: {
        alt_over_zero: false,
        dist_cumulative: 0,
        dist_records: 0,
        per_row: function(row, index)
        {
            var altitude = parseFloat(row['altitude(feet)']);
            var distance = parseFloat(row['distance(feet)']);
            
            if (this.alt_over_zero === false && altitude > 0)
            {
                this.alt_over_zero = true;
            }
            
            if (this.alt_over_zero === true)
            {
                this.dist_cumulative += distance;
                this.dist_records++;
            }
        },
        result: function()
        {
            return this.dist_cumulative / this.dist_records / 5280;  
        }
    },
    max_distance_miles: {
        max_distance: 0,
        last_row: function(row)
        {
            this.max_distance = parseInt(row['max_distance(feet)']) / 5280
        },
        result: function()
        {
            return this.max_distance;
        }
    },
    max_altitude_feet: {
        max_altitude: 0,
        last_row: function(row)
        {
            this.max_altitude = parseInt(row['max_altitude(feet)']);
        },
        result: function()
        {
            return this.max_altitude;
        }
    },
    flight_time_minutes: {
        flight_time_ms: 0,
        last_row: function(row)
        {
            this.flight_time_ms = parseInt(row['time(millisecond)']);
        },
        result: function()
        {
            return moment.duration(this.flight_time_ms).asMinutes();
        }
    }
}

function parse_log(filename, modules)
{
    fs.readFile(filename, {encoding: 'utf8'}, function(err, content)
    {
        var rows = new CSV(content, { header: true}).parse();
        rows.forEach(function(row, index)
        {
            for (var module in modules)
            {
                if (modules[module].per_row != undefined)
                {
                    modules[module].per_row(row, index);
                }
                
                if (index == rows.length - 1)
                {
                    if (modules[module].last_row != undefined)
                    {
                        modules[module].last_row(row);
                    }
                }
            }
        });
        
        for (var module in modules)
        {
            console.log(module+': '+modules[module].result());
        }
    });
}

parse_log(filename, modules);