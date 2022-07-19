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


// add role
router.post('/role', verifyToken, async (req, res) => {
    let reqData = req.body;
    var guidValue = Guid.create();
    console.log(reqData);
    let guid = guidValue.value;
    try {
        const body = {
            "guid": guid,
            "name": reqData.name,
            "created_at": new Date(),
            "updated_at": new Date(),
            "status": true
        }
        MongoClient.connect(db_url, function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('role');

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

// update role

router.put('/role/:guid', verifyToken, async (req, res) => {
    let reqGuid = req.params.guid;
    try {
        let foundUser = {}
        MongoClient.connect(db_url, function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('role');

            collection.findOne({ guid: reqGuid }, (err, result) => {
                if (err) console.log('err', err);
                console.log('result', result);
                foundUser = result;
                if (foundUser) {
                    if (req.body.name) foundUser.name = req.body.name;
                    // if (req.body.city) foundUser.city = req.body.city;
                    // if (req.body.state) foundUser.state = req.body.state;
                    // if (req.body.country) foundUser.country = req.body.country;
                    // if (req.body.description) foundUser.description = req.body.description;
                    // if (req.body.short_description) foundUser.short_description = req.body.short_description;
                    const body = {
                        $set: {
                            "name": foundUser.name,
                            "updated_at": new Date()
                        }
                    }

                    collection.updateOne({ guid: reqGuid }, body, (err, result) => {
                        if (err) console.log('err', err);
                        console.log('result', result);
                        res.send({ error: null, result });
                    })

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
// get role
router.get('/role', verifyToken, async (req, res) => {
    try {
        console.log('course call')
        MongoClient.connect(db_url, async function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('role');

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

// get single Role
router.get('/role/:guid', verifyToken, async (req, res) => {
    let reqData = req.params.guid;
    try {

        MongoClient.connect(db_url, async function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('role');

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

// delete role
router.put('/role/delete/:guid', verifyToken, async (req, res) => {
    let reqGuid = req.params.guid;
    try {
        MongoClient.connect(db_url, function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('role');
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