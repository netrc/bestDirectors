var request = require('request');

var drdata = [];

var dogetBest = function(minNumVotes, minNumMovies) {
    var d1 = new Date();
    var r = {};
    // collect all the movies and sum all the ratings for each director
    drdata.forEach(function(x){
        if (x.nV < minNumVotes) return;  // but skip if not enough votes
        var n = x.dN;
        if (! r[n]) { r[n]={}; r[n].totalR = 0; r[n].numR = 0; }
        r[n].totalR += x.r;
        r[n].numR++;
    });
    var d2 = new Date();
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
    ans.sort(function(a,b){ return (b.avgR - a.avgR)});
    var d3 = new Date();
    console.log("getBest getVotes: " + (d2.getTime()-d1.getTime()) + " getFilms&sort: "+(d3.getTime()-d2.getTime()));
    return { ans:ans, totalN:totalN, totalAvg: (totalR/totalN).toFixed(2), totalD: ans.length, queryMS:(d3.getTime()-d2.getTime()) };
};

exports.getBest = function(minNumVotes, minNumMovies) {
    if (drdata.length === 0) {
        console.log("getting drdata");
        request('http://netrc.com/drFoundSorted.json', function (error, response, body) {
            console.log("got drdata status: "+response.statusCode);
            console.log(" body.length: "+response.body.length);
            console.log(" body(0-100): "+response.body.substring(0,100));
            console.log(" body(-100-end): "+response.body.substring(response.body.length-100));
            if (!error && response.statusCode == 200) {
                drdata = JSON.parse(response.body);
                console.log("drdata parsed length: " + drdata.length);
                return dogetBest(minNumVotes, minNumMovies);
            } else {
                console.log("bad status:" + response.statusCode + "error: "+error);
                return ([{dn:"none", durl:"", avgR:"", numR:""}]);
            }
        });
    } else
        return dogetBest(minNumVotes, minNumMovies);
};
