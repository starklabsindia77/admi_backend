const router = require('express').Router();;
const verifyToken = require("../middlewares/verify-token");
// const moment = require("moment");
var Guid = require('guid');
const { ObjectId, MongoClient } = require('mongodb');
// const _ = require('lodash');
// const cors = require('cors')
var Promise = require("bluebird");

const config = require('../key');
// const fs = require('fs');
const AWS = require('aws-sdk');
const multer = require('multer');
Promise.longStackTraces();

const db_url = config.dbstring;
const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, '')
    }
})

// below variable is define to check the type of file which is uploaded

const filefilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

// defining the upload variable for the configuration of photo being uploaded
const upload = multer({ storage: storage, fileFilter: filefilter });

// Now creating the S3 instance which will be used in uploading photo to s3 bucket.
const s3 = new AWS.S3({
    accessKeyId: config.AWS_ACCESS_KEY_ID,              // accessKeyId that is stored in .env file
    secretAccessKey: config.AWS_ACCESS_KEY_SECRET       // secretAccessKey is also store in .env file
})




router.post('/course_manager', upload.single('images'),  async (req, res) => {
    let reqData = req.body;
    var guidValue = Guid.create();
    console.log(reqData);
    let guid = guidValue.value;
    reqData.images = '';
    try {

        // console.log("file detials", req.file)  // to check the data in the console that is being uploaded
        // Definning the params variable to uplaod the photo

        // const params = {
        //     Bucket: config.AWS_BUCKET_NAME,      // bucket that we made earlier
        //     Key: req.file.originalname,               // Name of the image
        //     Body: req.file.buffer,                    // Body which will contain the image in buffer format
        //     ACL: "public-read-write",                 // defining the permissions to get the public link
        //     ContentType: "image/jpeg"                 // Necessary to define the image content-type to view the photo in the browser with the link
        // };

        // // console.log("file params", params);

        // // uplaoding the photo using s3 instance and saving the link in the database.

        // s3.upload(params, (error, data) => {
        //     if (error) {
        //         console.log("upload error", error);
        //         res.status(500).send({ "err": error })  // if we get any error while uploading error message will be returned.
        //     }

        //     // If not then below code will be executed

        //     // console.log(data)
        //     reqData.images = data.Location
        // });
        // this will give the information about the object in which photo is stored 

        const body = {
            "guid": guid,
            "course_name": reqData.course_name,
            "isbn": reqData.isbn,
            "skuid": reqData.skuid,
            "hsn": reqData.hsn,
            "ean": reqData.ean,
            "upc": reqData.upc,
            "manufacturer": reqData.manufacturer,
            "dimensions": reqData.dimensions,
            "attributes": reqData.attributes,
            "cost_price": reqData.cost_price,
            "listing_price": reqData.listing_price,
            "map": reqData.map,
            "msrp": reqData.msrp,
            "Shipping_cost": reqData.Shipping_cost,
            "images": reqData.images,
            "course_quantity": reqData.course_quantity,
            "course_description": reqData.course_description,
            "created_at": new Date(),
            "updated_at": new Date()
        }
        MongoClient.connect(db_url, function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('course_manager');

            collection.insertOne(body, (err, result) => {
                if (err) console.log('err', err);
                console.log('result', result);
            })
        });


        res.send({ error: null, result: "Done" });
        return { error: null, result: "Done" }
    } catch (error) {
        console.log(error.message);
        return { error: error.message, result: null }
    }
})

router.get('/courses', verifyToken, async (req, res) => {
    try {
        console.log('course call')
        MongoClient.connect(db_url, async function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('course_manager');

            await collection.find({}).toArray((err, result) => {
                if (err) console.log('err', err);
                console.log('result', result.length);
                if (result.length > 0) {
                    res.send({ error: null, result });
                } else {
                    res.send({ error: null, result: [] });
                }
                // res.send({ error: null, result });
            })
        });
        return { error: null, result: "Done" }
    } catch (error) {
        console.log(error.message);
        return { error: error.message, result: null }
    }
})
router.get('/courses/:guid', verifyToken, async (req, res) => {
    let reqData = req.params.guid;
    try {
        // await con.connect();
        // var query = 'select * from course_manager where guid = ' + reqData +  ';'
        // const result = await con.query(query);
        // console.log("insert query", result.recordset);
        MongoClient.connect(db_url, async function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('course_manager');

            await collection.find({ guid: reqData }).toArray((err, result) => {
                if (err) console.log('err', err);
                console.log('result', result);
                res.send({ error: null, result });
            })
        });
        // res.send({ error: null, result: result.recordset});
        return { error: null, result: "Done" }
    } catch (error) {
        console.log(error.message);
        return { error: error.message, result: null }
    }
})

router.put('/courses/:guid', verifyToken, async (req, res) => {
    let reqGuid = req.params.guid;
    try {
        let foundUser = {}
        MongoClient.connect(db_url, function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('course_manager');

            collection.findOne({ guid: reqGuid }, (err, result) => {
                if (err) console.log('err', err);
                console.log('result', result);
                foundUser = result;
                if (foundUser) {
                    if (req.body.course_name) foundUser.course_name = req.body.course_name;
                    if (req.body.isbn) foundUser.isbn = req.body.isbn;
                    if (req.body.skuid) foundUser.skuid = req.body.skuid;
                    if (req.body.hsn) foundUser.hsn = req.body.hsn;
                    if (req.body.ean) foundUser.ean = req.body.ean;
                    if (req.body.upc) foundUser.upc = req.body.upc;
                    if (req.body.manufacturer) foundUser.manufacturer = req.body.manufacturer;
                    if (req.body.dimensions) foundUser.dimensions = req.body.dimensions;
                    if (req.body.attributes) foundUser.attributes = req.body.attributes;
                    if (req.body.cost_price) foundUser.cost_price = req.body.cost_price;
                    if (req.body.listing_price) foundUser.listing_price = req.body.listing_price;
                    if (req.body.map) foundUser.map = req.body.map;
                    if (req.body.msrp) foundUser.msrp = req.body.msrp;
                    if (req.body.Shipping_cost) foundUser.Shipping_cost = req.body.Shipping_cost;
                    if (req.body.course_quantity) foundUser.course_quantity = req.body.course_quantity;
                    if (req.body.course_description) foundUser.course_description = req.body.course_description;
                    const body = {
                        $set: {
                            "course_name": foundUser.course_name,
                            "isbn": foundUser.isbn,
                            "skuid": foundUser.skuid,
                            "hsn": foundUser.hsn,
                            "ean": foundUser.ean,
                            "upc": foundUser.upc,
                            "manufacturer": foundUser.manufacturer,
                            "dimensions": foundUser.dimensions,
                            "attributes": foundUser.attributes,
                            "cost_price": foundUser.cost_price,
                            "listing_price": foundUser.listing_price,
                            "map": foundUser.map,
                            "msrp": foundUser.msrp,
                            "Shipping_cost": foundUser.Shipping_cost,
                            "course_quantity": foundUser.course_quantity,
                            "course_description": foundUser.course_description,
                            "updated_at": new Date()
                        }
                    }
                    MongoClient.connect(db_url, async function (err, client) {
                        if (err) console.log('err', err);
                        const db = client.db("admission");
                        const collection = db.collection('course_manager');

                        await collection.updateOne({ guid: reqGuid }, body, (err, result) => {
                            if (err) console.log('err', err);
                            console.log('result', result);
                            res.send({ error: null, result });
                        })
                    });
                }
            })
        });



        // res.send({ error: null, result: result.recordset});
        return { error: null, result: "Done" }
    } catch (error) {
        console.log(error.message);
        return { error: error.message, result: null }
    }
})

module.exports = router;