module.exports = (function()
{
	"use strict";
	var module = {};
	var toolio = require('../app/toolio');

	// TODO - better way to go up to correct level.
	var parse_thing = require('../../../../parse');
	var parse_modules = require('../../../../modules');

	module.init = function()
	{
		$.get('/flight_logs', {user_id: window.quadavore.facebook_profile.id}, function(result)
		{
			var $flights = $("#previous_flights").empty();

			result.flight_logs.forEach(function(name)
			{
				var $flight = $('<div class="flight_link">' + name + '</div>');
				$flight.on('click', function()
				{
					$.get('/flight_log', {flight_name: name, user_id: window.quadavore.facebook_profile.id}, function(result)
					{
						var $parsed_flight = $("#parsed_flight");

						if (!result.success)
						{
							$parsed_flight.text('Error: ' + result.reason);
							return;
						}

						$parsed_flight.find('#parsed_flight_name').text(name);

						var parsed_output = parse_thing(result.csv_raw, parse_modules);
						// console.log(parsed_output);
						var $table = $parsed_flight.find('table tbody').empty();

						for (var item in parsed_output)
						{
							var $row = $('<tr/>');
							$row.append('<td>' + item + '</td>');
							$row.append('<td>' + parsed_output[item].toFixed(2) + '</td>');
							$table.append($row);
						}
					});
				});

				$flights.append($flight);
			});
		});

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
			$dragon_drop.find('table tbody tr').each(function()
			{
				var $row = $(this);
				if ($row.prop('file_handle') != null)
				{
					var file = $row.prop('file_handle');
					var header = new FileReader();
					header.readAsText(file);

					header.onload = function(event)
					{

						var params = {
							user_id: window.quadavore.facebook_profile.id,
							user_name: window.quadavore.facebook_profile.name,
							file_name: file.name,
							transfer_id: toolio.generate_id(),
							csv_raw: event.target.result
						};

						$.ajax({
							type: "PUT",
							url: '/flight_log',
							contentType: "application/json",
							data: JSON.stringify(params),
							success: function(result)
							{
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
					};
				}
			});

		});

		module.$('#profile').text('Name: ' + window.quadavore.facebook_profile.name + ", User ID: " + window.quadavore.facebook_profile.id);
	};


	module.load = function($parent_div)
	{
		$.get('html/pages/chart_land.html?ts=' + Date.now(), function(html)
		{
			module.$container = $(html);
			$parent_div.append(module.$container);

			module.$ = function(sel)
			{
				return jQuery(sel, module.$container);
			};

			module.init();
		});

	};

	return module;
})();
