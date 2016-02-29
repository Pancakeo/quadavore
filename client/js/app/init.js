(function()
{
	"use strict";
	window.quadavore = {
		medio_analytics: true
	};

	// Temporary convenience hack.
	window.$ = require('jquery');
	window.jQuery = window.$;

	require('../pages/wup_find_login').load($('body'));
})();
