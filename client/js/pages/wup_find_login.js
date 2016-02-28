module.exports = (function()
{
	"use strict";
	var module = {};

	function getParameterByName(name, url)
	{
		if (!url)
		{
			url = window.location.href;
		}
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results)
		{
			return null;
		}
		if (!results[2])
		{
			return '';
		}
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	module.init = function()
	{
		var user_id = getParameterByName('user_id');
		var user_name = getParameterByName('user_name');

		if (user_id != null)
		{
			window.quadavore.facebook_profile = {id: user_id, name: user_name || ''};
			module.$container.hide();
			require('./chart_land').load($('body'));
			return;
		}

		if (localStorage.custom_user_id != null)
		{
			module.$("#custom_user_id").val(localStorage.custom_user_id);
		}

		if (localStorage.custom_name != null)
		{
			module.$("#custom_name").val(localStorage.custom_name);
		}

		module.$("#custom_login").on('click', function()
		{
			var profile = {
				id: module.$("#custom_user_id").val().trim(),
				name: module.$("#custom_name").val().trim()
			};

			if (profile.id.length < 4 || profile.name.length < 3)
			{
				alert('ID mus be 4+ characters, name mus be 3+.');
				return;
			}

			localStorage.custom_user_id = profile.id;
			localStorage.custom_name = profile.name;

			window.quadavore.facebook_profile = profile;
			module.$container.hide();
			require('./chart_land').load($('body'));
		});

		var facebook_login = function(response)
		{
			var handlers = {
				connected: function()
				{
					// Show next module.
					FB.api('/me', function(profile)
					{
						window.quadavore.facebook_profile = profile;
						module.$container.hide();
						require('./chart_land').load($('body'));
					});
				},
				not_authorized: function()
				{
					// Could show something!
				}
			};

			if (typeof(handlers[response.status]) == "function")
			{
				handlers[response.status]();
			}
			else
			{
				// Could show something!
			}

		};

		module.$("#fb_login").on('click', function()
		{
			$(this).prop('disabled', true);
			FB.login(function(response)
			{
				facebook_login(response);
				$(this).prop('disabled', false);
			}, {scope: 'public_profile,email'});
		});

		window.quadavore.facebook_app_id = '482933888561146';

		if (window.location.hostname == 'localhost')
		{
			window.quadavore.facebook_app_id = '482982265222975';
		}

		// Facebook SDK loading.
		window.fbAsyncInit = function()
		{
			FB.init({
				appId: window.quadavore.facebook_app_id,
				cookie: true,  // enable cookies to allow the server to access the session
				xfbml: true,  // parse social plugins on this page
				version: 'v2.5' // use graph api version 2.5
			});

			FB.getLoginStatus(function(response)
			{
				facebook_login(response);
			});

		};

		// Load the SDK asynchronously
		(function(d, s, id)
		{
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id))
			{
				return;
			}
			js = d.createElement(s);
			js.id = id;
			js.src = "//connect.facebook.net/en_US/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
	};

	module.load = function($parent_div)
	{
		$.get('html/pages/wup_find_login.html?ts=' + Date.now(), function(html)
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
