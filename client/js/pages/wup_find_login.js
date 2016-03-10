module.exports = (function() {
    "use strict";
    var module = {};
    var toolio = require('../app/toolio');
    var $ = require('jquery');

    module.init = function() {
        var user_id = toolio.get_query_param('user_id');

        if (user_id != null) {
            window.quadavore.profile = {id: user_id};
            module.$container.hide();
            require('./chart_land').load($('body'));
            return;
        }

        if (localStorage.custom_user_id != null) {
            module.$("#custom_user_id").val(localStorage.custom_user_id);
        }

        module.$("#custom_login").on('click', function() {
            var profile = {
                id: module.$("#custom_user_id").val().trim()
            };

            if (profile.id.length < 4) {
                alert('ID mus be 4+ characters, name mus be 3+.');
                return;
            }

            localStorage.custom_user_id = profile.id;
            window.quadavore.profile = profile;
            module.$container.hide();
            require('./chart_land').load($('body'));
        });

    };

    module.load = function($parent_div) {
        $.get('html/pages/wup_find_login.html?ts=' + Date.now(), function(html) {
            module.$container = $(html);
            $parent_div.append(module.$container);

            module.$ = function(sel) {
                return $(sel, module.$container);
            };

            module.init();
        });

    };

    return module;
})();
