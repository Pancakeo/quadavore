module.exports = (function()
{
	"use strict";
	var module = {};
	var toolio = require('../app/toolio');
	var Highcharts = require('highcharts');
	var $ = require('jquery');

	// TODO - better way to go up to correct level.
	var parse_thing = require('../../../shared/parse');
	var modules = require('../../../shared/modules');

	module.init = function()
	{
		history.pushState({}, "Quadavore - Chart Land", "?user_id=" + window.quadavore.profile.id);

		var get_flight_logs = function()
		{
			$.get('/flight_logs', {user_id: window.quadavore.profile.id}, function(result)
			{
				var $flights = $("#previous_flights").empty();

				result.flight_logs.forEach(function(name)
				{
					var $flight = $('<div class="flight_link">' + name + '</div>');
					$flight.on('click', function()
					{
						$.get('/flight_log', {flight_name: name, user_id: window.quadavore.profile.id}, function(result)
						{
							var $parsed_flight = $("#parsed_flight");

							$parsed_flight.find('#parsed_flight_name').text(name);

							var parsed_output = parse_thing(result, modules);
							var $table = $parsed_flight.find('table tbody').empty();

							// -----------
							var lat = parsed_output.home_latitude;
							var lng = parsed_output.home_longitude;

							var map = new google.maps.Map(document.getElementById('map'), {
								center: {lat: lat, lng: lng},
								zoom: 13,
								mapTypeId: google.maps.MapTypeId.TERRAIN
							});

							var flight_plan = parsed_output.flight_path;

							var flightPath = new google.maps.Polyline({
								path: flight_plan,
								geodesic: true,
								strokeColor: '#FF0000',
								strokeOpacity: 1.0,
								strokeWeight: 2
							});

							flightPath.setMap(map);


							// ------------
							var yAxis = [];
							var series_all = [];
							var series_count = 0;

							for (var item in modules)
							{
								if (modules[item].type == 'value')
								{
									var $row = $('<tr/>');
									$row.append('<td>' + modules[item].display_name + '</td>');

									var nice_value = parsed_output[item];
									if (typeof(nice_value) == "number")
									{
										nice_value = nice_value.toFixed(2);
									}

									$row.append('<td>' + nice_value + '</td>');
									$table.append($row);
								}
								else if (modules[item].type == 'series')
								{
									var axis_def = {
										title: {
											text: modules[item].display_name
										}
									};

									if (modules[item].label_format != null)
									{
										axis_def.labels = {
											format: modules[item].label_format
										};
									}
									yAxis.push(axis_def);

									var series = {
										name: modules[item].display_name,
										type: 'spline',
										yAxis: series_count,
										data: parsed_output[item]
									};

									series_all.push(series);
									series_count++;
								}
							}


							if (series_all.length > 0)
							{
								// The selector.highcharts() method doesn't seem to work when
								// highcharts is included as a package.json module.
								Highcharts.chart(module.$("#chart")[0], {
									yAxis: yAxis,
									xAxis: {
										type: 'linear'
									},
									series: series_all
								});
							}
						});
					});

					$flights.append($flight);
				});
			});
		};

		get_flight_logs();

		module.$("#fb_logout").on('click', function()
		{
			FB.logout(function()
			{
				$('#wup_find_login').show();
				module.$container.hide();
				// heh
			});
		});

		module.$('#upload_logs').prop('disabled', true);

		var $dragon_drop = module.$('#dragon_drop');
		$dragon_drop.on('dragenter', function(e)
		{
			e.stopPropagation();
			e.preventDefault();
		});

		$dragon_drop.on('dragover', function(e)
		{
			e.stopPropagation();
			e.preventDefault();
		});

		$dragon_drop.on('drop', function(e)
		{
			e.stopPropagation();
			e.preventDefault();

			module.$('#help_text').hide();
			module.$('#upload_logs').prop('disabled', true);

			var dt = e.originalEvent.dataTransfer;
			var $table = $dragon_drop.find('table tbody').empty();

			var some_valid_entries = false;

			for (var i = 0; i < dt.files.length; i++)
			{
				var file = dt.files[i];

				if (file.name.toLowerCase().indexOf('.csv') == -1)
				{
					$row = $('<tr/>');
					$row.append('<td class="error" colspan="100%">Not CSV: ' + file.name + '</td>');
					$table.append($row);
					continue;
				}

				var $row = $('<tr/>');
				$row.append('<td>' + file.name + '</td>');
				$row.append('<td>' + toolio.human_readable_filesize(file.size) + '</td>');
				$row.append('<td>&nbsp;</td>');
				some_valid_entries = true;

				$row.prop('file_handle', file);
				$table.append($row);
			}

			if (some_valid_entries)
			{
				module.$('#upload_logs').prop('disabled', false);
			}

			$dragon_drop.find('#file_results').show();
		});

		module.$('#upload_logs').on('click', function()
		{
			var total_uploads = 0;
			$dragon_drop.find('table tbody tr').each(function()
			{
				var $row = $(this);
				if ($row.prop('file_handle') != null)
				{
					total_uploads++;

					var file = $row.prop('file_handle');

					var data = new FormData();
					data.append('user_id', window.quadavore.profile.id);
					data.append('user_name', window.quadavore.profile.name || '');
					data.append('transfer_id', toolio.generate_id());
					data.append('file_name', file.name);
					data.append('uploaded_file', file);

					$row.find('td:nth-child(3)').text('Uploading...');

					$.ajax({
						type: "PUT",
						url: '/flight_log',
						contentType: false,
						processData: false,
						data: data,
						success: function(result)
						{
							total_uploads--;

							if (total_uploads === 0)
							{
								get_flight_logs();
							}

							if (result.success === true)
							{
								$row.find('td:nth-child(3)').text('Success!');
							}
							else
							{
								$row.find('td:nth-child(3)').addClass('error').text(result.reason);
							}

						},
						error: function(result)
						{

						}

					});

				}
			});

		});

		navigator.geolocation.getCurrentPosition(function(result)
		{
			window.quadavore.latitude = result.coords.latitude;
			window.quadavore.longitude = result.coords.longitude;
		});

		window.initGoogleMaps = function()
		{
			var lat = window.quadavore.latitude || 37;
			var lng = window.quadavore.longitude || -130;

			module.google_maps_ready = true;
			var map = new google.maps.Map(document.getElementById('map'), {
				zoom: 8,
				center: {lat: lat, lng: lng}
			});


		};

		module.$('#profile').text("User ID: " + window.quadavore.profile.id);
	};


	module.load = function($parent_div)
	{
		$.get('html/pages/chart_land.html?ts=' + Date.now(), function(html)
		{
			module.$container = $(html);
			$parent_div.append(module.$container);

			module.$ = function(sel)
			{
				return $(sel, module.$container);
			};

			module.$container.append('<script src="//maps.googleapis.com/maps/api/js?key=' + GOOGLE_MAPS_API_KEY + '&callback=initGoogleMaps" async defer></script>');
			module.init();
		});

	};

	return module;
})();
