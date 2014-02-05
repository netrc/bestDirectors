console.log('starting');
var express = require('express');
require('jade');
var dr = require('./dr');


if(process.env.NODETIME_ACCOUNT_KEY) {
  require('nodetime').profile({
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: 'Main'
  });
}

var app = express();

app.configure(function(){
  app.use(express.static(__dirname + '/static'));
});

var doMain = function(req, res) {
    res.render('index.jade', { title: ''});
};

var getRestDirectors = function(req, res) {
    console.log("getRestDirectors: "+req.param('minNumVotes')+"  "+req.param('minNumMovies') + " from:" + req.param('start')+"  end:" + req.param('end'));
    res.send( JSON.stringify( dr.getBest(req.param('minNumVotes'),req.param('minNumMovies'), req.param('start'), req.param('end')) ) );
};

app.get('/', doMain);
app.get('/Directors/', getRestDirectors);
app.get('/HowToUse', function(req,res) { res.render('howToUse.jade');});

dr.initData( function() {
    app.listen(process.env.PORT);
    console.log('listening on '+ process.env.PORT);
});