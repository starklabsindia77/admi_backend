const router = require('express').Router();;
const verifyToken = require("../middlewares/verify-token");

var Guid = require('guid');
const { ObjectId, MongoClient } = require('mongodb');

var Promise = require("bluebird");

const config = require('../key');

Promise.longStackTraces();

const db_url = config.dbstring;


// get single profile data
router.get('/profile/:email', verifyToken, async (req, res) => {
    let emailId = req.params.email;
    try {
        MongoClient.connect(db_url, async function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('profile');

            await collection.find({ email: emailId }).toArray((err, result) => {
                if (err) console.log('err', err);
                res.send({ error: null, result });
            })
        });
        return { error: null, result: "Done" }
    } catch (error) {
        console.log(error.message);
        return { error: error.message, result: null }
    }
})

// add new profile 

router.post('/profile/add', verifyToken, async (req, res) => {
    let reqData = req.body;
    var guidValue = Guid.create();
    console.log(reqData);
    let guid = guidValue.value;
    try {

        const body = {
            ...reqData,
            "guid": guid,
            "created_at": new Date(),
            "updated_at": new Date()
        }
        MongoClient.connect(db_url, function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('profile');

            collection.insertOne(body, (err, result) => {
                if (err) console.log('err', err);
                console.log('result', result);
                res.send({ error: null, status: "Done", result});
            })
        });
        return { error: null, result: "Done" }
    } catch (error) {
        console.log(error.message);
        return { error: error.message, result: null }
    }
})
// update Profile Data
router.put('/profile/update/:email', verifyToken, async (req, res) => {
    let emailId = req.params.email;
    let reqData = req.body;
    console.log("info", reqData);
    try {

        const body = {
            $set: {
                "updated_at": new Date(),
            }
        }
        MongoClient.connect(db_url, function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('profile');

            collection.updateOne({ email: emailId }, body, (err, result) => {
                if (err) console.log('err', err);
                console.log('result', result);
            })
        });


        res.send({ error: null, result: "Done" });
        return { error: null, result: "Done" }
    } catch (error) {
        console.log("eroor update", error);
        // return { error: error.message, result: null }
    }
})

// get All application filter by student




//update 



module.exports = router;