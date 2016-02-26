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
    console.log('parse!');
    return function(file, modules)
    {
        var rows = new CSV(file, { header: true}).parse();
        rows.forEach(function(row, index)
        {
            for (var module_name in modules)
            {
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
        });

        var output = {};
        for (var module_name in modules)
        {
            output[module_name] = modules[module_name].result();
        }

        return output;
    }
});


