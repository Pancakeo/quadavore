var upload = (require('multer'))();
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

module.exports = function(app)
{
    app.put('/flight_log', upload.single('uploaded_file'), function(req, res)
    {
        var user_id = req.body.user_id;
        var user_name = req.body.user_name;
        // TODO: user_id/user_name (what's the difference?) should be figured well before individual server tasks
        var file_name = req.body.file_name;
        var is_gzip = req.body.is_gzip;
        var file = req.file;

        if (file == null || file.size <= 0)
        {
            res.json({
                transfer_id: req.body.transfer_id,
                success: false,
                reason: 'no csv file'
            });

            return;
        }
        else if (file_name == null || file_name.trim() == '')
        {
            res.json({
                transfer_id: req.body.transfer_id,
                success: false,
                reason: 'bad file name'
            });

            return;
        }
        // TODO - maybe check indexOf ('.csv') here?
        var user_folder = path.join(global.server_root, global.ROOT_LOG_FOLDER, user_id);
        

        try
        {
            fs.statSync(user_folder);
        }
        catch (e)
        {
            var dir_name = user_id;
            fs.mkdirSync(user_folder);
            console.log('Created user folder ' + dir_name);
        }

        // Create a meta entry linking the user_id to name.
        try
        {
            fs.statSync(user_folder + '/.meta.txt');
        }
        catch (e)
        {
            fs.writeFileSync(user_folder + '/meta.txt', 'Name: ' + user_name);
        }

        var write_file = function(buffer)
        {
            fs.writeFile('./' + user_folder + '/' + file_name, buffer, function(err, result)
            {
                if (err != null)
                {
                    console.log(err);
                    res.json({
                        transfer_id: req.body.transfer_id,
                        success: false,
                        reason: 'File write error'
                    });

                    return;
                }

                res.json({
                    transfer_id: req.body.transfer_id,
                    success: true
                });
            });
        };

        if (is_gzip === undefined)
        {
            write_file(file.buffer);
        } else
        {
            zlib.gunzip(file.buffer, function(err, buffer)
            {
                if (err != null)
                {
                    res.json({
                        transfer_id: req.body.transfer_id,
                        success: false,
                        reason: 'File encoding error'
                    });

                    return;
                }

                write_file(buffer);
            });
        }
    });
};


