var fs = require('fs');
var moment = require('moment');

var test_file = "C:\\evil_logs\\very_big.txt";
//var test_file = "C:\\evil_logs\\small.txt";
var contents = fs.readFileSync(test_file);

// Found by parsing each buffer index until the target date was reached.
var start = 109;
var herg = 0;
var j = 0;
while (j < contents.length - 10)
{
	var woah = contents.toString('utf8', j, j + 10);
	if (woah.indexOf(String('03Z0262077')) >= 0)
	{
		console.log(j, woah);

		// These are actual columns!!
		console.log(contents.readUIntLE(j - 1, 0));
		console.log(contents.readUIntLE(j - 2, 0));
		console.log(contents.readUIntLE(j - 3, 0));
		console.log(contents.readUIntLE(j - 4, 0));
		console.log(contents.readUIntLE(j - 5, 0));
		console.log('hm', j - 6);
		j += 9;
		herg++;
	}

	j++;
}

console.log("herg", herg);

var i = start;
var entries = 0;
while (i < contents.length - 8)
{
// This should be uint64, but node.js only supports up to 6-byte.
	var res = contents.readUIntLE(i, 8);
	//var res = contents.readUInt32LE(i);
	var heh = moment(res);
	var wup = heh.format("HH:mm:ss MM/DD/YYYY Z");

	if (wup.indexOf("02/20/2016") >= 0)
	{
		//console.log(i, wup);
		entries++;
		i += 8;
	}

	i++;
}

console.log(entries);
// 106 or next.

// Rows are dynamic, but usually the same length unless there's app.tip.
