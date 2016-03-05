var moment = require('moment');
var columns = {
	current: 'litchi',
	'litchi': {
		'time_ms': 'time(millisecond)',
		'downlink_signal': 'downlinkSignalQuality',
		'speed_mph': 'speed(mph)',
		'altitude_feet': 'altitude(feet)',
		'distance_feet': 'distance(feet)',
		'max_distance_feet': 'max_distance(feet)',
		'max_altitude_feet': 'max_altitude(feet)',
		'remaining_power': 'remainPowerPercent',
		'satellites': 'satellites',
		'throttle': 'Rc_throttle',
		'home_latitude': 'home_latitude',
		'home_longitude': 'home_longitude',
		'latitude': 'latitude',
		'longitude': 'longitude'
	},
	'dji_ultimate': {
		'time_ms': 'time(millisecond)',
		'downlink_signal': null,
		'speed_mph': 'speed(mph)',
		'altitude_feet': 'altitude(feet)',
		'distance_feet': 'distance(feet)',
		'max_distance_feet': 'max_distance(feet)',
		'max_altitude_feet': 'max_altitude(feet)',
		'remaining_power': 'remainPower',
		'satellites': 'satellites',
		'throttle': null,
		'home_latitude': 'latitude_home',
		'home_longitude': 'longitude_home',
		'latitude': 'latitude',
		'longitude': 'longitude'
	},
	'healthy_drones': {
		'time_ms': 'time(millisecond)',
		'downlink_signal': null,
		'speed_mph': 'speed(mph)',
		'altitude_feet': 'ascent(feet)',
		'distance_feet': 'distance(feet)',
		'max_distance_feet': 'max_distance(feet)',
		'max_altitude_feet': 'max_ascent(feet)',
		'remaining_power': null,
		'satellites': 'satellites',
		'throttle': null,
		'home_latitude': null,
		'home_longitude': null,
		'latitude': 'latitude',
		'longitude': 'longitude'
	}
};
var col = function(id)
{
	return columns[columns.current][id];
}

var distance = function(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
    var theta = lon1-lon2;
    var radtheta = Math.PI * theta/180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist) * 180/Math.PI * 60 * 1.1515;
    
    if (unit == "km") 
    { 
        dist = dist * 1.609344;
    }
    
    return dist;
}


// Module types:
// series - result returns an array of values for use in a chart or other visualization
// value - result returns a single literal value for the entire flight record
// special - result returns a value that is not used in any automatic way

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
			var ms = parseInt(row[col('time_ms')]);
			
			if (col('downlink_signal') === null)
			{
				var signal = 100;
			}
			else
			{
				var signal = parseInt(row[col('downlink_signal')]);
			}
			
			if (col(series_name) === null)
			{
				this.type = 'not_supported';
			}
			
			if (this.last_ms == 0 || ms - this.last_ms >= ms_resolution)
			{
				if (signal < 15 && row[col(series_name)] == 0)
				{
					this.series.push(null);
				}
				else
				{
					this.series.push(row[col(series_name)]);
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

module.exports = {
	csv_type: { // This MUST be the first module
		value: 'litchi',
		type: 'value',
		display_name: 'CSV Type',
		init: function(row)
		{
			// this is lazy, but sufficient for now
			if (row['latitude_home'] !== undefined) 
			{
				this.value = 'dji_ultimate';
			}
			else if (row['remainPowerPercent'] === undefined)
			{
				this.value = 'healthy_drones';
			}
			
			columns.current = this.value;
		},
		result: function()
		{
			return this.value;
		}
	},
	downlink_quality: {
		series: [],
		last_ms: 0,
		type: 'series',
		display_name: 'Signal Quality',
		label_format: null,
		init: function() {
			this.series = [];
			this.last_ms = 0;
		},
		per_row: function(row)
		{
			if (col('downlink_signal') === null)
			{
				this.type = 'not_supported';
				return;
			}
			
			var ms = parseInt(row[col('time_ms')]);
			if (this.last_ms == 0 || ms - this.last_ms >= 500)
			{
				this.series.push(row[col('downlink_signal')]);
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
			var speed = parseFloat(row[col('speed_mph')]);

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
			var altitude = parseFloat(row[col('altitude_feet')]);

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
			var altitude = parseFloat(row[col('altitude_feet')]);
			var distance = parseFloat(row[col('distance_feet')]);

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
			this.max_distance = parseInt(row[col('max_distance_feet')]) / 5280
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
			this.max_altitude = parseInt(row[col('max_altitude_feet')]);
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
			this.flight_time_ms = parseInt(row[col('time_ms')]);
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
			this.sat_sum += row[col('satellites')];
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
			if (col('remaining_power') === null)
			{
				this.type = 'not_supported';
				return;
			}
			this.last_row_val = row[col('remaining_power')];
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
            if (col('throttle') === null)
			{
				this.type = 'not_supported';
				return;
			}
			this.sum += row[col('throttle')];
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
			if (col('home_latitude') === null)
			{
				this.type = 'not_supported';
				return;
			}
			this.val = row[col('home_latitude')];
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
			if (col('home_longitude') === null)
			{
				this.type = 'not_supported';
				return;
			}
			this.val = row[col('home_longitude')];
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
			var ms = parseInt(row[col('time_ms')]);
			if (this.last_ms == 0 || ms - this.last_ms >= this.ms_resolution)
			{
				if (row[col('latitude')] != 0 && row[col('longitude')] != 0) {
					this.coords.push({
						lat: row[col('latitude')],
						lng: row[col('longitude')]
					});
				}

				this.last_ms = ms;
			}
		},
		result: function() {
			return this.coords;
		}
	},
	speed_series: series_module('speed_mph', 500, 'Speed', '{value}mph'),
	altitude_series: series_module('altitude_feet', 500, 'Altitude', '{value}\''),
	distance_series: series_module('distance_feet', 500, 'Distance', '{value}\''),
	battery_percent_series: series_module('remaining_power', 500, 'Remaining Battery Power', '{value}%'),
	satellites_series: series_module('satellites', 500, 'Satellites', '{value}'),
    // After this point come post-processing values that require all previous results to already exist
    total_distance:
    {
        type: 'value',
        display_name: 'Total Distance Traveled (miles)',
        result: function(results)
        {
            var path = results['flight_path'];
            var dist = 0;
            var prev_point = null;

            for (var i = 0; i < path.length; i++)
            {
                var cur_point = path[i];
                if (prev_point !== null)
                {
                    dist += distance(prev_point.lat, prev_point.lng, cur_point.lat, cur_point.lng, 'm');  
                }
                prev_point = cur_point;
            }
            return dist;
        }
    },
    home_point_derived:
    {
        type: 'special',
        display_name: 'Home Point Derived',
        result: function(results)
        {
            var point = {};
            if (results.home_latitude != 'not_supported')
            {
                point.lat = results.home_latitude;
            }
            else
            {
                point.lat = results.flight_path[0].lat;
            }
            
            if (results.home_longitude != 'not_supported')
            {
                point.lng = results.home_longitude;
            }
            else
            {
                point.lng = results.flight_path[0].lng;
            }
            return point;
        }
    }
};
	



