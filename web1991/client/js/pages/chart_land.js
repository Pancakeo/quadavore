module.exports = (function()
{
	"use strict";
	var module = {};

	module.init = function() {
		module.$("#fb_logout").on('click', function()
		{
			FB.logout(function()
			{
				$('#wup_find_login').show();
				module.$container.hide();
				// heh
			});
		});
	};

	module.load = function($parent_div)
	{
		$.get('html/pages/chart_land.html', function(html)
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
