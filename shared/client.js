requirejs.config({
    paths: {
        parse: 'parse',
        modules: 'modules',
        CSV: 'bower_components/comma-separated-values/csv',
        moment: 'bower_components/moment/moment',
        jquery: 'bower_components/jquery/dist/jquery',
        highcharts: 'bower_components/highcharts/highcharts'
    },
    shim: {
        highcharts: {
            exports: "Highcharts",
            deps: ["jquery"]
        }
    }
});

requirejs(['parse','modules','jquery','highcharts'], function(parse, modules, $)
{
    var dropper = document.getElementById('dropper');
    dropper.addEventListener('dragenter', function(e)
    {
        e.stopPropagation();
        e.preventDefault();
    });
    
    dropper.addEventListener('dragover', function(e)
    {
        e.stopPropagation();
        e.preventDefault();
    });
    
    dropper.addEventListener('drop', function(e)
    {
        e.stopPropagation();
        e.preventDefault();
        
        var dt = e.dataTransfer;
        do_parse(dt.files);
    });
    
    do_parse = function(files)
    {
        var fr = new FileReader();
        fr.readAsText(files[0]);
        fr.onload = function(event)
        {
            var parsed_output = parse(event.target.result, modules);
            var output_table = $('#output');
            var yAxis = [];
            var series_all = [];
            var series_count = 0;
        
            for (var item in modules)
            {
                if (modules[item].type == 'value')
                {
                    var tr = $('<tr>');
                    tr.append($('<td>').text(modules[item].display_name));
                    tr.append($('<td>').text(parsed_output[item]));
                    output_table.append(tr);
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
                $('#chart').highcharts({
                    yAxis: yAxis,
                    xAxis: {
                        type: 'linear'
                    },
                    series: series_all
                });
            }
        };
    };
});