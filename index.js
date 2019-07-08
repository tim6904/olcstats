var request = require('request');
var util = require('util');
var cheerio = require('cheerio');
var sstats = require('simple-statistics')

const OLC_URI="https://www.onlinecontest.org/olc-3.0/gliding/flightbook.html?sp=%d&st=olcp&rt=olc&pi=22291";

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
  //var t = data("#table_OLC-Plus");
  var t = data('#table_OLC-Classic > tbody > tr');

  if (t.length == 0)
    t = data('#table_OLC-Plus > tbody > tr');

  t.each(function (d) {
    var tr = t[d];

    let date = tr.children[1].firstChild.data;
    let points = tr.children[3].firstChild.data
    let distance = tr.children[5].firstChild.data
    let kmh = tr.children[7].children[0].data;
    // let takeoff = tr.children[9].children[0].data;

    flights.push({
      date: new Date(date),
      points: points,
      distance: parseFloat(distance),
      speed: parseFloat(kmh)
    })
  })
}

function download(year, cb) {
  console.log("start to download for", year);

  const a = util.format(OLC_URI, year)
  request(a, function (asdf, b, html) {
    parse_infos(html);

    if(cb){
      cb();
    }
  })
}

download(2016, process_flights);