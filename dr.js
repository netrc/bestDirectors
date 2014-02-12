var request = require('request');
var iconv = require('iconv-lite');

var drdata = [];        // the whole db is read and cached in main memory; about 14MB
var dfn = {};           // pre-calc total films for each director
var ms1,ms2,ms3,ms4;
var nPerPage = 100;

exports.getDirector = function(name) {
    return(dfn[name]);
};


exports.getBest = function(minNumVotes, minNumMovies, thisStart, thisEnd) {
    //console.log("enter: thisStart:"+thisStart+"  thisEnd:"+thisEnd);
    ms1 = Date.now();
    var r = {};
    // collect all the movies and sum all the ratings for each director
    drdata.forEach(function(x){
        if (x.nV < minNumVotes) return;  // but skip if not enough votes
        var n = x.dN;
        if (! r[n]) { r[n]={}; r[n].totalR = 0; r[n].totalV=0; r[n].numR = 0; }
        r[n].totalR += x.r;
        r[n].totalV += x.nV;
        r[n].numR++;
    });
    ms2 = Date.now();
    // finally, do the averages and sort
    var ans = [];
    var totalN =0; var totalR=0;
    for ( var k in r ){
        if (r[k].numR < minNumMovies) continue; // skip if not enough movies
        r[k].avgR = (r[k].totalR / r[k].numR).toFixed(2);
        r[k].avgRPct = Math.round(r[k].avgR*10)+"%";
        r[k].avgV = Math.round(r[k].totalV / r[k].numR);
        totalN += r[k].numR; totalR += r[k].totalR;
        r[k].dn = k + " (" + dfn[k].length + ")";
        r[k].durl = "http://imdb.com/find?s=nm&q="+k;
        ans.push(r[k]);
    }
    ms3 = Date.now();
    ans.sort(function(a,b){ return (b.avgR - a.avgR)});
    ms4 = Date.now();
    console.log("dogetbest ms total: " + (ms4-ms1) + "  votes: " + (ms2-ms1) + " avgr: "+(ms3-ms2) +" sort: "+(ms4-ms3));

    if (! thisStart) thisStart = 0;
    if (! thisEnd) thisEnd = (ans.length>nPerPage) ? (nPerPage-1) : ans.length;
    //console.log("mid: thisStart:"+thisStart+"  thisEnd:"+thisEnd);
    var pages = {};
    pages.prevUrl="", pages.prevUrlText="";
    pages.nextUrl="", pages.nextUrlText="";
    pages.showNext = false, pages.showPrev = false; pages.showThis = false;
    pages.thisPageText=""; pages.thisStartIndex= thisStart;
    if (ans.length > nPerPage) {
        pages.showThis = true;
        pages.thisPageText= (Number(thisStart)+1) + " - " + (Number(thisEnd)+1);
        var nextStart = thisEnd*1 + 1;
        if (nextStart<ans.length) { // no need to go further
          var nextEnd = thisEnd*1 + nPerPage*1;
          if (nextEnd > ans.length) nextEnd = ans.length;
          pages.showNext = true;
          pages.nextUrlText = (nextStart+1) + " - " + (nextEnd+1);
          pages.nextUrl="&start=" + nextStart + "&end=" + nextEnd;
        }
    }
    if (thisStart > 1) {
        var prevStart = thisStart - nPerPage;
        var prevEnd = thisStart - 1;
        pages.showPrev = true;
        pages.prevUrlText = (prevStart+1) + " - " + (prevEnd+1);
        pages.prevUrl="&start=" + prevStart + "&end=" + prevEnd;
    }
    return { pages:pages, ans:ans.slice(thisStart, (thisEnd*1+1)), totalN:totalN, totalAvg: (totalR/totalN).toFixed(2), totalD: ans.length, queryMS:(ms4-ms1) };
};


exports.initData = function( cb ) {
    console.log("doing init");
    var options = {
      url: 'http://netrc.com/drFoundSorted.json',
      encoding: null    // set to get raw buffer (node can't do ISO-8859-1 yet)
    };
    request(options, function (error, response, body) {
        //console.log("got drdata status: "+response.statusCode);
        //console.log(" body.length: "+response.body.length);
        //console.log(" body(0-100): "+response.body.substring(0,100));
        //console.log(" body(-100-end): "+response.body.substring(response.body.length-100));
        if (!error && response.statusCode == 200) {
            drdata = JSON.parse( iconv.decode(response.body, 'ISO-8859-1') );
            console.log("drdata parsed length: " + drdata.length + " .. " + ((drdata.length==206194)?"ok":"WRONG!"));
            drdata.forEach(function(x){
                var n = x.dN;
                if (! dfn[n]) { dfn[n]=[]; }
                dfn[n].push(x);
            });
            console.log("finished pre-calc");
            return cb();
        } else {
            console.log("bad status:" + response.statusCode + "error: "+error);
            return; // no callback // this will exit
        }
    });
};
