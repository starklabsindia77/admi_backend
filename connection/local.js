// const mysql = require('mysql');

// const con = mysql.createConnection({
//     host: "http://database-2.cluster-cudzllnbvyrm.us-east-1.rds.amazonaws.com/",
//     user: "admin",
//     password: "<DB_PASSWORD>"
// });

// con.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
//     con.end();
// });
const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    dbstring: process.env.DB,
    AWS_BUCKET_NAME: "productallimages",
    AWS_ACCESS_KEY_ID: "AKIA5C5IQ2J3TC5JTSOU",
    AWS_ACCESS_KEY_SECRET: "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",
    SECRET: process.env.SECRET
}