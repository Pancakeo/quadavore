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
    var series_module = function(series_name, ms_resolution, display_name, label_format)
    {
        return {
            series: [],
            last_ms: 0,
            type: 'series',
            display_name: display_name,
            label_format: label_format || null,
            init: function() {
                this.last_ms = 0;
                this.series = [];
            },
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
        avg_num_of_satellites: {
            type: 'value',
            display_name: 'Avg. Number of Satellites (thing)',
            sat_records: 0,
            sat_sum: 0,
            per_row: function(row, index) {
                this.sat_sum += row['satellites'];
                this.sat_records++;
            },
            result: function() {
                return this.sat_sum / this.sat_records;
            }
        },
        remaining_power_percent: {
            type: 'value',
            display_name: 'Remaining Power (%)',
            last_row_val: 0,
            last_row: function(row) {
                this.last_row_val = row['remainPowerPercent'];
            },
            result: function() {
                return this.last_row_val;
            }
        },
        avg_rc_throttle: {
            type: 'value',
            display_name: 'Average RC Throttle',
            records: 0,
            sum: 0,
            per_row: function(row, index) {
                this.sum += row['Rc_throttle'];
                this.records++;
            },
            result: function() {
                return this.sum / this.records;
            }
        },
        home_latitude: {
            type: 'value',
            val: 37,
            display_name: 'Home Latitude',
            last_row: function(row) {
                this.val = row['home_latitude'];
            },
            result: function() {
                return parseFloat(this.val);
            }
        },
        home_longitude: {
            type: 'value',
            val: -130,
            display_name: 'Home Longitude',
            last_row: function(row) {
                this.val = row['home_longitude'];
            },
            result: function() {
                return parseFloat(this.val);
            }
        },
        flight_path: {
            type: 'special',
            coords: [],
            display_name: 'Flight Path',
            ms_resolution: 1000 * 3,
            init: function() {
                this.last_ms = 0;
                this.coords = [];
            },
            per_row: function(row)
            {
                var ms = parseInt(row['time(millisecond)']);
                if (this.last_ms == 0 || ms - this.last_ms >= this.ms_resolution)
                {
                    if (row['latitude'] != 0 && row['longitude'] != 0) {
                        this.coords.push({
                            lat: row['latitude'],
                            lng: row['longitude']
                        });
                    }

                    this.last_ms = ms;
                }
            },
            result: function() {
                return this.coords;
            }
        },
        speed_series: series_module('speed(mph)', 500, 'Speed', '{value}mph'),
        altitude_series: series_module('altitude(feet)', 500, 'Altitude', '{value}\''),
        distance_series: series_module('distance(feet)', 500, 'Distance', '{value}\''),
        battery_percent_series: series_module('remainPowerPercent', 500, 'Remaining Battery Power', '{value}%'),
        satellites_series: series_module('satellites', 500, 'Satellites', '{value}')   
    };
    
});
    



