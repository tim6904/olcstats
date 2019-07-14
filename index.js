var request = require('request');
var util = require('util');
var cheerio = require('cheerio');
var sstats = require('simple-statistics')
var program = require('commander');

const OLC_URI="https://www.onlinecontest.org/olc-3.0/gliding/flightbook.html?sp=%d&st=olcp&rt=olc&pi=%d";

flights = [];

function process_flights() {
  var d = flights.map(function (d) { return d.distance })
  var s = flights.map(function (d) { return d.speed })

  var stats_calced = {
    mean_distance: sstats.mean(d),
    mean_speed: sstats.mean(s)
  }

  console.log(stats_calced);
}

function parse_infos(html) {
  var data = cheerio.load(html);
  var t = data('#table_OLC-Classic > tbody > tr');

  if (t.length == 0)
    t = data('#table_OLC-Plus > tbody > tr');

  t.each(function (d) {
    var tr = t[d];

    let date = tr.children[1].firstChild.data;
    let points = tr.children[3].firstChild.data
    let distance = tr.children[5].firstChild.data
    let kmh = tr.children[7].children[0].data;

    flights.push({
      date: new Date(date),
      points: points,
      distance: parseFloat(distance),
      speed: parseFloat(kmh)
    })
  })
}

function download(year, pilotid, cb) {
  console.log("start to download for", year);

  const a = util.format(OLC_URI, year, pilotid)
  request(a, function (_, _, html) {
    parse_infos(html);

    if(cb){
      cb();
    }
  })
}
 
program
  .version('0.0.1')
  .option('-p, --pilotid [id]', 'the pilots id')
  .option('-y, --year [year]', 'year to download')
  .parse(process.argv);

if(!program.pilotid || !program.year) {
  console.error('olcstats: need pilotid and year, use --help')
  process.exit(1);
}

download(program.year, program.pilotid, process_flights);