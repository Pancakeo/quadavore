var CSV = require('comma-separated-values');
module.exports = function(file, module_definitions)
{
	var rows = new CSV(file, { header: true}).parse();
	
	var modules = {};
	Object.keys(module_definitions).forEach(function(mod)
	{
		modules[mod] = Object.create(module_definitions[mod]);
	});
	
	rows.forEach(function(row, index)
	{
		for (var module_name in modules)
		{
			if (modules[module_name].type != 'not_supported')
			{
				if (index === 0) {
					if (modules[module_name].init != undefined) {
						modules[module_name].init(row);
					}
				}
				if (modules[module_name].per_row != undefined)
				{
					modules[module_name].per_row(row, index);
				}

				if (index == rows.length - 1)
				{
					if (modules[module_name].last_row != undefined)
					{
						modules[module_name].last_row(row);
					}
				}
			}
		}
	});

	var data = {};
    var meta = {};
	for (var module_name in modules)
	{
        meta[module_name] = {};
		if (modules[module_name].type != 'not_supported')
		{
            meta[module_name].type = modules[module_name].type;
            meta[module_name].display_name = modules[module_name].display_name;
            meta[module_name].label_format = modules[module_name].label_format || null;
            
			data[module_name] = modules[module_name].result(data);
		}
		else
		{
			data[module_name] = 'not_supported';
		}
	}

	return {data: data, meta: meta};
}



