var fs = require('fs');
var moment = require('moment');
//var bignum = require('bignum');
var Int64 = require('node-int64');

var test_file = "C:\\evil_logs\\small.txt";
var contents = fs.readFileSync(test_file);
var target_date = "02/18/2016";
var aircraft_name = 'PhantomJS';

var i = 109;
var rows = [];
while (i < contents.length - 8)
{
	var res = contents.readUIntLE(i, 8);
	var parsed_date = moment(res).format("MM/DD/YYYY hh:mm:ss Z");
	if (parsed_date.indexOf(target_date) >= 0)
	{
		//console.log(i, parsed_date);
		var row = {
			start_ms: moment(res).unix(),
			human_readable_date: parsed_date,
			byte: i
		};

		rows.push(row);
		i += 8;
	}

	i++;
}

rows.forEach(function(row, idx)
{
	if (idx >= rows.length - 1)
	{
		row.last_row = true;
		row.length = contents.length - row.byte;
	}
	else
	{
		var next_row = rows[idx + 1];
		row.length = next_row.byte - row.byte;
	}

	row.end = row.byte + row.length;
});

rows.forEach(function(row, idx)
{
	var i = row.byte;
	while (i < row.end)
	{
		var woah = contents.toString('utf8', i, i + 9);
		if (woah.indexOf(String('PhantomJS')) >= 0)
		{
			row.contains_aircraft_name = true;
			break;
		}

		i++;
	}
});

var longer_rows = rows.filter(function(row)
{
	return row.length != 106;
});

var special_rows = rows.filter(function(row)
{
	return row.contains_aircraft_name === true;
});

special_rows.forEach(function(row, idx)
{
	row.columns = [];
	var i = row.byte + 11;	// 1 behind uint64

	row.columns.push(contents.readUIntLE(i++, 1));
	row.columns.push(contents.readUIntLE(i++, 1));
	row.columns.push(contents.readUIntLE(i++, 1));
	row.columns.push(contents.readUIntLE(i++, 1));
	row.columns.push(contents.readUIntLE(i++, 1));

	row.columns.push(contents.toString('utf8', i, i + 10));
	i += 10;
	row.columns.push(contents.toString('utf8', i, i + 9));
	i += 9;

	i+= 8;

	console.log(row.columns);
});

console.log('Entries', rows.length);
console.log('Longer rows', longer_rows.length);
console.log('Special rows', special_rows.length);
