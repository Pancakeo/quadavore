requirejs.config({
    paths: {
        parse: 'parse',
        modules: 'modules',
        CSV: 'bower_components/comma-separated-values/csv',
        moment: 'bower_components/moment/moment'
    }
});

requirejs(['parse','modules'], function(parse, modules)
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
            console.log(event.target.result);
            var parsed_output = parse(event.target.result, modules);
            var output_table = document.getElementById('output');
            console.log(parsed_output);
            for (var item in parsed_output)
            {
                var tr = document.createElement('tr');
                var item_td = document.createElement('td');
                tr.appendChild(item_td);
                item_td.textContent = item;
                
                var value_td = document.createElement('td');
                tr.appendChild(value_td);
                value_td.textContent = parsed_output[item];
                output_table.appendChild(tr);
            }
        };
    };
});