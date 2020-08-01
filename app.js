const express = require("express");
const app = express();
const request = require("request");
const pool = require("./dbPool.js");

app.set("view engine", "ejs");
app.use(express.static("public"));

//routes
app.get("/", async function(req, res) {
    res.render("index");
});

app.get("/search", async function(req, res) {
    let city = req.query.city;
    let state = req.query.state;
    
    let latLng = await getLatLng(city, state);
    let timeInfo = await getTimeZone(latLng.lat, latLng.lng);
    res.render("results", {"city": city, "state": state, "lat": latLng.lat, "lng": latLng.lng,
       "abbrev": timeInfo.abbrev, "zone": timeInfo.zone, "gmt": timeInfo.gmt, "time": timeInfo.time});
});

app.get("/mylocations", function(req, res) {
    let sql = "SELECT * FROM locations ORDER BY state";
    pool.query(sql, function(err, rows, fields) {
       if (err) throw err;
       //console.log(rows); //for debugging purposes
       res.render("locations", { "rows": rows });
    });
});

app.get("/api/saveLocation", async function(req, res, next) {
    //check if in database already 
    let rowCount = await checkTableFor(req.query.city, req.query.state)
    if (rowCount > 0) {
        res.send('0')
    } else {
        //else save to database
        let sql = "INSERT INTO locations (city, state, zone, gmt, abbrev) VALUES (?,?,?,?,?)";
        let sqlParams = [req.query.city, req.query.state, req.query.zone, req.query.gmt, req.query.abb];
        pool.query(sql, sqlParams, function (err, rows, fields) {
            if (err) throw err;
            //console.log(rows); //for debugging purposes
            res.send(rows.affectedRows.toString());
        });//query callback
    }//endelse
    
});//api/saveLocation

app.get("/api/removeLocation", async function(req, res, next) {
    //remove from database
    let sql = "DELETE FROM locations WHERE city=? AND state=?";
    let sqlParams = [req.query.city, req.query.state];
    pool.query(sql, sqlParams, function (err, rows, fields) {
        if (err) throw err;
        //console.log(rows); //for debugging purposes
        res.send(rows.affectedRows.toString());
    });//query callback
    
});//api/removeLocation

app.get("/api/getCurrentTime", async function(req, res, next) {
    let zone = req.query.zone;
    let time = await getCurrentTime(zone);
    res.send(time);
});//api/getCurrentTime

function getLatLng(city, state) {
    return new Promise (function (resolve, reject) {
        let requestUrl = `http://www.mapquestapi.com/geocoding/v1/address?key=KsV1awsRFT7weStXUpOxZ5CnGq33QGyh&location=${city},${state}&outFormat=json`;
        request(requestUrl, function(error, response, body) {
            if (!error && response.statusCode == 200 ) {
                let parsedData = JSON.parse(body);
                let latlng = parsedData.results[0].locations[0].latLng
                resolve(latlng);
            } else {
                console.log('error: ', error);
                console.log('statusCode: ', response && response.statusCode);
                reject(error);
            }
        });
    });
}

function checkTableFor(city, state) {
    return new Promise (function (resolve, reject) {
        let sql = "SELECT * FROM locations WHERE city=? AND state=?";
        let sqlParams = [city, state];
        pool.query(sql, sqlParams, function (err, rows, fields) {
            if (err) throw err;
            //console.log("rows from check are :", rows); //for debugging purposes
            if (!err) {
                resolve(rows.length);
            } else {
                console.log("err", err);
                reject(err);
            }
        });
    });
}

function getTimeZone(lat, lng) {
    return new Promise (function(resolve, reject) {
        let requestUrl = `http://api.timezonedb.com/v2.1/get-time-zone?key=TBAQGGKBUWFP&format=json&by=position&lat=${lat}&lng=${lng}`;
        request(requestUrl, function(error, response, body) {
            if (!error && response.statusCode == 200 ) {
                let parsedData = JSON.parse(body);
                let zoneName = parsedData.zoneName;
                let zoneAbbrev = parsedData.abbreviation;
                let gmtOffset = parsedData.gmtOffset;
                let time = parsedData.formatted;
                resolve({"abbrev": zoneAbbrev, "zone": zoneName, "gmt": gmtOffset, "time": time});
            } else {
                console.log('error: ', error);
                console.log('statusCode: ', response && response.statusCode);
                reject(error);
            }
        });
    });
}

function getCurrentTime(zone) {
    return new Promise (function(resolve, reject) {
        let requestUrl = `http://api.timezonedb.com/v2.1/get-time-zone?key=TBAQGGKBUWFP&format=json&by=zone&zone=${zone}`;
        request(requestUrl, function(error, response, body) {
            if (!error && response.statusCode == 200 ) {
                let parsedData = JSON.parse(body);
                let time = parsedData.formatted;
                // console.log("parsedData: " + parsedData);
                // console.log("time: " + time);
                resolve({"time": time});
            } else {
                console.log('error: ', error);
                console.log('statusCode: ', response && response.statusCode);
                reject(error);
            }
        });
    });
}

//start server
app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Express server is running..."); 
});