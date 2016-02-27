(function(factory)
{
    if (typeof(module) == 'object' && module.exports)
    {
        var CSV = require('./bower_components/comma-separated-values/csv.js');
        module.exports = factory(CSV);
    }
    else
    {
        define(['CSV'], factory);
    }
})(function(CSV)
{
    return function(file, module_definitions)
    {
        var rows = new CSV(file, { header: true}).parse();
        
        var modules = {}
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

        var output = {};
        for (var module_name in modules)
        {
            if (modules[module_name].type != 'not_supported')
            {
                output[module_name] = modules[module_name].result();
            }
            else
            {
                output[module_name] = 'not_supported';
            }
                
        }

        return output;
    }
});


