
var dr = require('./dr');

var testGetBest = function(m,n) {
    var r = dr.getBest(100,100);
    console.log("a l: " + r.ans.length + "   ms:" + r.queryMS);
};
    
dr.initData( function() {
    testGetBest(100,100);
    testGetBest(100,100);
    testGetBest(1000,10);
    testGetBest(1000,10);
});

