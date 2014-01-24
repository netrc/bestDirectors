console.log('starting');
var express = require('express');
require('jade');
var dr = require('./r1000');

var app = express();

app.configure(function(){
  app.use(express.static(__dirname + '/static'));
});

var doMain = function(req, res) {
    res.render('index.jade', { title: ''});
};

var getRestDirectors = function(req, res) {
    console.log("getRestDirectors: "+req.param('minNumVotes')+"  "+req.param('minNumMovies'));
    var r = dr.getBest(req.param('minNumVotes'),req.param('minNumMovies'));
    res.send( JSON.stringify(r) );
};

app.get('/', doMain);
app.get('/Directors/', getRestDirectors);

app.listen(process.env.PORT);
console.log('listening on '+ process.env.PORT);
