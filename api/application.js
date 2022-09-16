const router = require('express').Router();;
const verifyToken = require("../middlewares/verify-token");

var Guid = require('guid');
const { ObjectId, MongoClient } = require('mongodb');

var Promise = require("bluebird");

const config = require('../key');

Promise.longStackTraces();

const db_url = config.dbstring;
const AWS = require('aws-sdk');
const multer = require('multer');

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


/// Add Application Service

router.post('/application/add', verifyToken, async (req, res) => {
    let reqData = req.body;
    var guidValue = Guid.create();
    console.log(reqData);
    let guid = guidValue.value;
    try {
        MongoClient.connect(db_url, function (err, client) {
            
            const db = client.db("admission");
            const centerCollection = db.collection('Centers');
            const profileCollection = db.collection('profile');
            const UserCollection = db.collection('User');
            let centerList=[]
          profileCollection.findOne({email:reqData.ApplicationInfo.email}, async (err, result) => {
                
                console.log("profileList::",result)
           if(result)
           {
            
               let searchCity= ".*" + result.city + ".*";
               console.log("searchCity::",searchCity)

          centerCollection.find({city:result.city}).toArray((err, result) => {
            if(result)
            {
             
            centerList=result
        }
        let centerID=result&&result[0]._id.toString()
        //    console.log("centerList::",result)
        console.log("centerList::",centerList)     
        UserCollection.findOne({"centerName._id":centerID,role:"manager"}, async (err, resultmng)  => {
            console.log("resultmng::",resultmng)
            
if(resultmng)
{
    reqData["managerId"]= resultmng._id.toString()
}
else{
    reqData["managerId"]= ""
}
if(centerList&&centerList.length===1)
{
    reqData["centerId"]=centerList[0]._id.toString()
  
     
 reqData["unAssigned"]=false
 
 
}
else
{
 reqData["centerId"]=""
 reqData["unAssigned"]=true
 reqData["managerId"]=""
}
const body = {
 ...reqData,
 "guid": guid,
 "created_at": new Date(),
 "updated_at": new Date(),
 "status": 'new'
}
console.log("reqData:::",body)
            if (err) console.log('err', err);
            const collection = db.collection('application');

            // collection.insertOne(body, (err, result) => {
            //     if (err) console.log('err', err);
            //     console.log('result', result);
            // })
})
       })
           }
})

        });


        res.send({ error: null, result: "Done" });
        return { error: null, result: "Done" }
    } catch (error) {
        console.log(error.message);
        return { error: error.message, result: null }
    }
})

// get all applications from
router.get('/application', verifyToken, async (req, res) => {
   
    try {
        MongoClient.connect(db_url, async function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('application');

            await collection.find().toArray((err, result) => {
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

// get All application filter by student
router.get('/application/:studentid', verifyToken, async (req, res) => {
    let reqData = req.params.studentid;
    try {
        MongoClient.connect(db_url, async function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('application');

            await collection.find({ StudentID: reqData }).toArray((err, result) => {
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

router.get('/stages/:country', verifyToken, async (req, res) =>{
    let reqData = req.params.country;
    try {
        MongoClient.connect(db_url, async function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('stages');

            await collection.find({country: reqData}).toArray((err, result) => {
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

//update 
router.post('/application/update', verifyToken, async (req, res) => {
    let reqData = req.body;
    console.log("info", reqData);
    try {

        const body = {
            $set: {
                "updated_at": new Date(),
                "status": reqData.value,
                "Application_Status": reqData.appStatus, 
            }
        }
        MongoClient.connect(db_url, function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('application');

            collection.updateOne({ guid: reqData.guid }, body, (err, result) => {
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


module.exports = router;