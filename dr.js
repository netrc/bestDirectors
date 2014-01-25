var request = require('request');

var drdata = [];        // the whole db is read and cached in main memory; about 14MB
var ms1,ms2,ms3,ms4;

exports.getBest = function(minNumVotes, minNumMovies) {
    ms1 = Date.now();
    var r = {};
    // collect all the movies and sum all the ratings for each director
    drdata.forEach(function(x){
        if (x.nV < minNumVotes) return;  // but skip if not enough votes
        var n = x.dN;
        if (! r[n]) { r[n]={}; r[n].totalR = 0; r[n].numR = 0; }
        r[n].totalR += x.r;
        r[n].numR++;
    });
    ms2 = Date.now();
    // finally, do the averages and sort
    var ans = [];
    var totalN =0; var totalR=0;
    for ( var k in r ){
        if (r[k].numR < minNumMovies) continue; // skip if not enough movies
        r[k].avgR = (r[k].totalR / r[k].numR).toFixed(2);
        totalN += r[k].numR; totalR += r[k].totalR;
        r[k].dn = k;
        r[k].durl = "http://imdb.com/find?s=nm&q="+k;
        ans.push(r[k]);
    }
    ms3 = Date.now();
    ans.sort(function(a,b){ return (b.avgR - a.avgR)});
    ms4 = Date.now();
    console.log("dogetbest total: " + (ms4-ms1) + "  votes: " + (ms2-ms1) + " avgr: "+(ms3-ms2) +" sort: "+(ms4-ms3));
    return { ans:ans, totalN:totalN, totalAvg: (totalR/totalN).toFixed(2), totalD: ans.length, queryMS:(ms4-ms1) };
};


exports.initData = function( cb ) {
    console.log("doing init");
    request('http://netrc.com/drFoundSorted.json', function (error, response, body) {
        //console.log("got drdata status: "+response.statusCode);
        //console.log(" body.length: "+response.body.length);
        //console.log(" body(0-100): "+response.body.substring(0,100));
        //console.log(" body(-100-end): "+response.body.substring(response.body.length-100));
        if (!error && response.statusCode == 200) {
            drdata = JSON.parse(response.body);
            console.log("drdata parsed length: " + drdata.length + " .. " + ((drdata.length==206194)?"ok":"WRONG!"));
            return cb();
        } else {
            console.log("bad status:" + response.statusCode + "error: "+error);
            return; // no callback // this will exit
        }
    });
};
