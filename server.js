console.log('starting');
var express = require('express');
require('jade');
var dr = require('./dr');

var app = express();

app.configure(function(){
  app.use(express.static(__dirname + '/static'));
});

var doMain = function(req, res) {
    res.render('index.jade', { title: ''});
};

var getRestDirectors = function(req, res) {
    console.log("getRestDirectors: "+req.param('minNumVotes')+"  "+req.param('minNumMovies'));
    res.send( JSON.stringify( dr.getBest(req.param('minNumVotes'),req.param('minNumMovies')) ) );
};

app.get('/', doMain);
app.get('/Directors/', getRestDirectors);
app.get('/HowToUse', function(req,res) { res.render('howToUse.jade');});

dr.initData( function() {
    app.listen(process.env.PORT);
    console.log('listening on '+ process.env.PORT);
});