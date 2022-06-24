const router = require('express').Router();;
const verifyToken = require("../middlewares/verify-token");

var Guid = require('guid');
const { ObjectId, MongoClient } = require('mongodb');

var Promise = require("bluebird");

const config = require('../key');

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

// ADD Courses 
router.post('/university/add', verifyToken, async (req, res) => {
    let reqData = req.body;
    var guidValue = Guid.create();
    console.log(reqData);
    let guid = guidValue.value;
    // reqData.images = '';
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
            "name": reqData.name,
            "country": reqData.country,
            "state": reqData.state,
            "city": reqData.city,
            "website_url": reqData.website_url,
            "description": reqData.description,
            "short_description": reqData.short_description,
            "created_at": new Date(),
            "updated_at": new Date(),
            "status": true
        }
        MongoClient.connect(db_url, function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('university');

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
// update Courses

// get All Courses
router.get('/courses', verifyToken, async (req, res) => {
    try {
        MongoClient.connect(db_url, async function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('courses');

            await collection.find({ status: true }).toArray((err, result) => {
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

// get single courses
router.get('/courses/:guid', verifyToken, async (req, res) => {
    let reqData = req.params.guid;
    try {
        MongoClient.connect(db_url, async function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('courses');

            await collection.find({ guid: reqData }).toArray((err, result) => {
                if (err) console.log('err', err);
                console.log('result', result);
                res.send({ error: null, result });
            })
        });
        return { error: null, result: "Done" }
    } catch (error) {
        console.log(error.message);
        return { error: error.message, result: null }
    }
})
// delete Courses
router.put('/courses/delete/:guid', verifyToken, async (req, res) => {
    let reqGuid = req.params.guid;
    try {
        MongoClient.connect(db_url, function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('courses');
            const body = {
                $set: {
                    "status": false,
                    "updated_at": new Date()
                }
            }

            collection.updateOne({ guid: reqGuid }, body, (err, result) => {
                if (err) console.log('err', err);
                console.log('result', result);
                res.send({ error: null, result });
            })
        });
        return { error: null, result: "Done" }
    } catch (error) {
        console.log(error.message);
        return { error: error.message, result: null }
    }
})



module.exports = router;