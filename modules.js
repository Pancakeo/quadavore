(function(factory)
{
    if (typeof(module) == 'object' && module.exports)
    {
        var moment = require('./bower_components/moment/moment.js');
        module.exports = factory(moment);
    }
    else
    {
        define(['moment'], factory);
    }
})(function(moment)
{
    series_module = function(series_name, ms_resolution, display_name, label_format)
    {
        return {
            series: [],
            last_ms: 0,
            type: 'series',
            display_name: display_name,
            label_format: label_format || null,
            per_row: function(row)
            {
                var ms = parseInt(row['time(millisecond)']);
                var signal = parseInt(row['downlinkSignalQuality']);
                if (this.last_ms == 0 || ms - this.last_ms >= ms_resolution)
                {
                    if (signal < 15 && row[series_name] == 0)
                    {
                        this.series.push(null);
                    }
                    else
                    {
                        this.series.push(row[series_name]);
                    }
                    this.last_ms = ms;
                }
            },
            result: function()
            {
                return this.series;
            }
        }
    };
    
    return {
        downlink_quality: {
            series: [],
            last_ms: 0,
            type: 'series',
            display_name: 'Signal Quality',
            label_format: null,
            per_row: function(row)
            {
                var ms = parseInt(row['time(millisecond)']);
                if (this.last_ms == 0 || ms - this.last_ms >= 500)
                {
                    this.series.push(row['downlinkSignalQuality']);
                    this.last_ms = ms;
                }
            },
            result: function()
            {
                return this.series;
            }
        },
        avg_speed_after_takeoff: {
            speed_over_zero: false,
            speed_cumulative: 0,
            speed_records: 0,
            type: 'value',
            display_name: 'Average Speed After Takeoff',
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
            type: 'value',
            display_name: 'Average Altitude After Takeoff',
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
            type: 'value',
            display_name: 'Average Distance (miles) After Takeoff',
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
            type: 'value',
            display_name: 'Max Distance (miles)',
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
            type: 'value',
            display_name: 'Max Altitude (feet)',
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
            type: 'value',
            display_name: 'Flight Time (minutes)',
            last_row: function(row)
            {
                this.flight_time_ms = parseInt(row['time(millisecond)']);
            },
            result: function()
            {
                return moment.duration(this.flight_time_ms).asMinutes();
            }
        },
        speed_series: series_module('speed(mph)', 500, 'Speed', '{value}mph'),
        altitude_series: series_module('altitude(feet)', 500, 'Altitude', '{value}\''),
        distance_series: series_module('distance(feet)', 500, 'Distance', '{value}\''),
        battery_percent_series: series_module('remainPowerPercent', 500, 'Remaining Battery Power', '{value}%'),
        satellites_series: series_module('satellites', 500, 'Satellites', '{value}')   
    };
    
});
    



