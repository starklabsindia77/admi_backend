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


// get wishlist from db 

router.get('/wishlist', verifyToken, async (req, res) => {
    try {
        MongoClient.connect(db_url, async function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('wishlist');
            await collection.find({ userId: req.decoded._id }).toArray((err, result) => {
                if (err) console.log('err', err);
                console.log('result wishlist', result);
                res.send({ error: null, result });
            })
        });
        return { error: null, result: "Done" }
    } catch (error) {
        console.log(error.message);
        return { error: error.message, result: null }
    }
})

// add new wishlist to db
router.post('/wishlist', verifyToken, async (req, res) => {
    let reqData = req.body;
    console.log('add wishlist');
    try {
        MongoClient.connect(db_url, async function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('wishlist');

            let body = {
                "userId": req.decoded._id,
                "wishlist": reqData,
                "created_at": new Date(),
                "updated_at": new Date(),
                "status": true
            }
            await collection.find({ userId: req.decoded._id }).toArray((err, result) => {
                if (err) console.log('err', err);
                console.log('result', result);
                if (result.length > 0) {
                    console.log("wishlist", reqData);
                    collection.updateOne({ userId: req.decoded._id }, { $set: { "wishlist": reqData } }, (err, result) => {
                        if (err) console.log('err', err);
                        console.log('result', result);
                        // res.send({ error: null, result });
                    })
                } else {
                    collection.insertOne(body, (err, result) => {
                        if (err) console.log('err', err);
                        console.log('result', result);
                    })
                }

            })

            res.send({ error: null, result: "Done" });
        });
        return { error: null, result: "Done" }
    } catch (error) {
        console.log(error.message);
        return { error: error.message, result: null }
    }
})

// update wishlist in db 


module.exports = router;