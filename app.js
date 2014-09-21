var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var FeedParser = require('feedparser');
var request = require('request');
var cors = require('cors');

var app = express();
app.set('port', 8585);

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(urlencodedParser);
app.use(cors());

app.post('/rss', function(req, res){
  var arr = [];
  var feed = req.body.feedUrl;
  console.log("Got Feed: ", feed);
  var r = request(feed),
  feedparser = new FeedParser();

  r.on('error', function (error) {
    // handle any request errors
  });
  r.on('response', function (res) {
    var stream = this;

    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

    stream.pipe(feedparser);
  });


  feedparser.on('error', function(error) {
    res.send(400);
  });
  feedparser.on('readable', function() {
    var stream = this, item;
    while (item = stream.read()) {
      arr.push(item);
    }
  });
  feedparser.on('end', function(){
    arr = arr.reverse();
    var finalArr = [];
    arr.forEach(function(item){
      var obj = {};
      obj.title = item.title;
      obj.description = item.description;
      obj.link = item.link;
      obj.pic = item['content:encoded']['#'];
      finalArr.push(obj);
    });
    res.send(finalArr.splice(0, 3));
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});