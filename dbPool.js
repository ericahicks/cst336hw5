const mysql = require('mysql');

const pool  = mysql.createPool({
    connectionLimit: 10,
    host: "l9dwvv6j64hlhpul.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "yl3zngmcq5h0uvwv",
    password: "k37mec9pu8vmcmdo",
    database: "ofa1u7gsxhc8tjia"
});

module.exports = pool;