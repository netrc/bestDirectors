
var dr = require('./dr');

var ans;

var testcb = function(r) {
    console.log("a l: " + r.ans.length);
    console.log("a ms:" + r.queryMS);
};
    
dr.getBest(100,100, testcb);
dr.getBest(100,100, testcb);
dr.getBest(1000,10, testcb);
dr.getBest(1000,10, testcb);

