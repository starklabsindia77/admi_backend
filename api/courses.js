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
router.post('/courses/add', verifyToken, async (req, res) => {
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
            "applicationFees": reqData.applicationFees,
            "studyLevel": reqData.studyLevel,
            "studyArea ": reqData.studyArea,
            "initialDeposit": reqData.initialDeposit,
            "averageFees": reqData.averageFess,
            "intake": reqData.intake,
            "interviewRequired": reqData.interviewRequired,
            "interviewStage": reqData.interviewStage,
            "minimumAcedemicScore": reqData.minimumAcedemicScore,
            "best_4_subject_percentage": reqData.best_4_subject_percentage,
            "minimum_graduation_age": reqData.minimum_graduation_age,
            "numberofBacklogAccepted": reqData.numberOfBacklogAccepted,
            "gap_acceptable": reqData.gap_acceptable,
            "priority": reqData.priority,
            "withoutIelts": reqData.withoutIelts,
            "withoutIeltsEnglish": reqData.withoutIeltsEnglish,
            "IeltsOverall": reqData.IeltsOverall,
            "IeltsNotLessThan": reqData.IeltsNotLessThan,
            "UKVIIeltsOverall": reqData.UKVIIeltsOverall,
            "UKVIIeltsNotlessthan": reqData.UKVIIeltsNotlessthan,
            "UKVI_PTE": reqData.UKVI_PTE,
            "PTEScore": reqData.PTEScore,
            "PTENotlessthan": reqData.PTENotLessThan,
            "Duolingo": reqData.Duolingo,
            "TOFEL": reqData.TOFEL,
            "GRE": reqData.GRE,
            "Scholarship": reqData.Scholarship,
            "Remarks_Ristrictions": reqData.Remarks,
            "TATforOfferletter": reqData.TAT,
            "website_url": reqData.website_url,
            "description": reqData.description,
            "university": reqData.university,
            "created_at": new Date(),
            "updated_at": new Date(),
            "status": true
        }
        MongoClient.connect(db_url, function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('courses');

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

router.post('/courses/csv', verifyToken, async (req, res) => {
    let reqData = req.body;

    // console.log("csv data", reqData);


    try {
        for (var i = 0; i < reqData.length; i++) {
            var guidUni = Guid.create();
            let uni = guidUni.value;
            const universityData = {
                "guid": uni,
                "name": reqData[i]['Name of University/college'],
                "country": reqData[i].Country,
                "state": reqData[i].Location,
                "city": reqData[i]['Sub Location'],
                "description": '',
                "short_description": '',
                "created_at": new Date(),
                "updated_at": new Date(),
                "status": true
            }
            var guidValue = Guid.create();
            let guid = guidValue.value;
            const body = {
                "guid": guid,
                "name": reqData[i].Course,
                "applicationFees": reqData[i]['Application Fees'],
                "studyLevel": reqData[i]['Study Level'],
                "studyArea": reqData[i]['Study Area'],
                "initialDeposit": reqData[i]['Initial Deposit'],
                "averageFees": reqData[i]['Average Fees'],
                "intake": reqData[i].Intake,
                "interviewRequired": reqData[i]['Interview Required'],
                "interviewStage": reqData[i]['Interview stage'],
                "minimumAcedemicScore": reqData[i]['Minimum 12th Acedemic score'],
                "best_4_subject_percentage": reqData[i]['Best 4 subject percentage'],
                "minimum_graduation_age": reqData[i]['Minimum Graduation %age'],
                "numberofBacklogAccepted": reqData[i]['Number of Backlog accepted'],
                "gap_acceptable": reqData[i]['Gap acceptable'],
                "priority": reqData[i].Priority,
                "withoutIelts": reqData[i]['Without Ielts'],
                "withoutIeltsEnglish": reqData[i]['without ielts English %'],
                "IeltsOverall": reqData[i]['Ielts Overall'],
                "IeltsNotLessThan": reqData[i]['Ielts Not Less Than'],
                "UKVIIeltsOverall": reqData[i]['UKVI Ielts Overall'],
                "UKVIIeltsNotlessthan": reqData[i]['UKVI Ielts Not less than'],
                "UKVI_PTE": reqData[i]['UKVI PTE'],
                "PTEScore": reqData[i]['PTE Score'],
                "PTENotlessthan": reqData[i]['PTE Not less than'],
                "Duolingo": reqData[i].Duolingo,
                "TOFEL": reqData[i].TOFEL,
                "GRE": reqData[i].GRE,
                "Scholarship": reqData[i].Scholarship,
                "Remarks": reqData[i]['Remarks / Ristrictions'],
                "TATforOfferletter": reqData[i]['TAT for Offer letter'],
                "Work_Permit": reqData[i]['Work Permit'],
                "durationOfWorkPermit": reqData[i]['Duration of Work Permit'],
                "website_url": reqData[i]['Website URL'],
                "Processing_Steps": reqData[i]['Processing Steps'],
                "university": universityData,
                "Pathway": reqData[i].Pathway,
                "previous_education_stream": reqData[i]['previous education stream'],
                "Pathway_university": reqData[i]['Pathway university'],
                "Pathway_course": reqData[i]['Pathway course'],
                "created_at": new Date(),
                "updated_at": new Date(),
                "status": true
            }

            
            MongoClient.connect(db_url, function (err, client) {
                if (err) console.log('err', err);
                const db = client.db("admission");
                const collection = db.collection('courses');
                collection.find({ name: body.name, university: body.university }).toArray((err, result) => {
                    if (err) console.log('err', err);
                    console.log('result courses length', result.length);
                    if (result.length == 0 && body.name !== undefined) {
                        collection.insertOne(body, (err, result) => {
                            if (err) console.log('err', err);
                            console.log('result................courses', result, i);
                        })
                    }
                })
                // collection.insertOne(body, (err, result) => {
                //     if (err) console.log('err', err);
                //     console.log('result', result);
                // })

                db.collection('university').find({ name: universityData.name, state: universityData.state, country: universityData.country }).toArray((err, result) => {
                    if (err) console.log('err', err);
                    console.log('result university length', result.length);
                    if (result.length == 0 && universityData.name !== undefined) {
                        db.collection('university').insertOne(universityData, (err, result) => {
                            if (err) console.log('err', err);
                            console.log('result................university', result, i);
                        })
                    }
                })

                // db.collection('university').insertOne(universityData, (err, result) => {
                //     if (err) console.log('err', err);
                //     console.log('result', result);
                // })
            });



        }



        res.send({ error: null, result: "Done" });
        return { error: null, result: "Done" }
    } catch (error) {
        console.log(error.message);
        return { error: error.message, result: null }
    }

    // return { result: null }
})
// update Courses
router.put('/courses/:guid', verifyToken, async (req, res) => {
    let reqGuid = req.params.guid;
    let data = req.body
    try {
        let foundCourses = {}
        MongoClient.connect(db_url, function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('courses');

            collection.findOne({ guid: reqGuid }, (err, result) => {
                if (err) console.log('err', err);
                console.log('result', result);
                foundCourses = result;
                if (foundCourses) {
                    if (data.name) foundCourses.name = data.name;
                    if (data.applicationFees) foundCourses.applicationFees = data.applicationFees;
                    if (data.studyLevel) foundCourses.studyLevel = data.studyLevel;
                    if (data.studyArea) foundCourses.studyArea = data.studyArea;
                    if (data.initialDeposit) foundCourses.initialDeposit = data.initialDeposit;
                    if (data.averageFees) foundCourses.averageFess = data.averageFess;
                    if (data.intake) foundCourses.intake = data.intake;
                    if (data.interviewRequired) foundCourses.interviewRequired = data.interviewRequired;
                    if (data.interviewStage) foundCourses.interviewStage = data.interviewStage;
                    if (data.minimumAcedemicScore) foundCourses.minimumAcedemicScore = data.minimumAcedemicScore;
                    if (data.best_4_subject_percentage) foundCourses.best_4_subject_percentage = data.best_4_subject_percentage;
                    if (data.minimum_graduation_age) foundCourses.minimum_graduation_age = data.minimum_graduation_age;
                    if (data.numberofBacklogAccepted) foundCourses.numberOfBacklogAccepted = data.numberOfBacklogAccepted;
                    if (data.gap_acceptable) foundCourses.gap_acceptable = data.gap_acceptable;
                    if (data.priority) foundCourses.priority = data.priority;
                    if (data.withoutIelts) foundCourses.withoutIelts = data.withoutIelts;
                    if (data.withoutIeltsEnglish) foundCourses.withoutIeltsEnglish = data.withoutIeltsEnglish;
                    if (data.IeltsOverall) foundCourses.IeltsOverall = data.IeltsOverall;
                    if (data.IeltsNotLessThan) foundCourses.IeltsNotLessThan = data.IeltsNotLessThan;
                    if (data.UKVIIeltsOverall) foundCourses.UKVIIeltsOverall = data.UKVIIeltsOverall;
                    if (data.UKVIIeltsNotlessthan) foundCourses.UKVIIeltsNotlessthan = data.UKVIIeltsNotlessthan;
                    if (data.UKVI_PTE) foundCourses.UKVI_PTE = data.UKVI_PTE;
                    if (data.PTEScore) foundCourses.PTEScore = data.PTEScore;
                    if (data.PTENotlessthan) foundCourses.PTENotLessThan = data.PTENotLessThan;
                    if (data.Duolingo) foundCourses.Duolingo = data.Duolingo;
                    if (data.TOFEL) foundCourses.TOFEL = data.TOFEL;
                    if (data.GRE) foundCourses.GRE = data.GRE;
                    if (data.Scholarship) foundCourses.Scholarship = data.Scholarship;
                    if (data.Remarks_Ristrictions) foundCourses.Remarks = data.Remarks;
                    if (data.TATforOfferletter) foundCourses.TAT = data.TAT;
                    if (data.website_url) foundCourses.website_url = data.website_url;
                    if (data.description) foundCourses.description = data.description;
                    const body = {
                        $set: {
                            "name": foundCourses.name,
                            "applicationFees": foundCourses.applicationFees,
                            "studyLevel": foundCourses.studyLevel,
                            "studyArea ": foundCourses.studyArea,
                            "initialDeposit": foundCourses.initialDeposit,
                            "averageFees": foundCourses.averageFess,
                            "intake": foundCourses.intake,
                            "interviewRequired": foundCourses.interviewRequired,
                            "interviewStage": foundCourses.interviewStage,
                            "minimumAcedemicScore": foundCourses.minimumAcedemicScore,
                            "best_4_subject_percentage": foundCourses.best_4_subject_percentage,
                            "minimum_graduation_age": foundCourses.minimum_graduation_age,
                            "numberofBacklogAccepted": foundCourses.numberOfBacklogAccepted,
                            "gap_acceptable": foundCourses.gap_acceptable,
                            "priority": foundCourses.priority,
                            "withoutIelts": foundCourses.withoutIelts,
                            "withoutIeltsEnglish": foundCourses.withoutIeltsEnglish,
                            "IeltsOverall": foundCourses.IeltsOverall,
                            "IeltsNotLessThan": foundCourses.IeltsNotLessThan,
                            "UKVIIeltsOverall": foundCourses.UKVIIeltsOverall,
                            "UKVIIeltsNotlessthan": foundCourses.UKVIIeltsNotlessthan,
                            "UKVI_PTE": foundCourses.UKVI_PTE,
                            "PTEScore": foundCourses.PTEScore,
                            "PTENotlessthan": foundCourses.PTENotLessThan,
                            "Duolingo": foundCourses.Duolingo,
                            "TOFEL": foundCourses.TOFEL,
                            "GRE": foundCourses.GRE,
                            "Scholarship": foundCourses.Scholarship,
                            "Remarks_Ristrictions": foundCourses.Remarks,
                            "TATforOfferletter": foundCourses.TAT,
                            "website_url": foundCourses.website_url,
                            "description": foundCourses.description,
                            "university": foundCourses.university,
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
// get All Courses
router.get('/courses/public', async (req, res) => {
    try {
        MongoClient.connect(db_url, async function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('courses');

            await collection.find({ status: true }).toArray((err, result) => {
                if (err) console.log('err', err);
                console.log('result', result.length);
                if (result.length > 0) {
                    client.close();
                    res.send({ error: null, result });
                } else {
                    client.close();
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
                    client.close();
                    res.send({ error: null, result });
                } else {
                    client.close();
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
router.get('/courses/uni/:uni', verifyToken, async (req, res) => {
    let reqCountry = req.params.uni;
    try {
        MongoClient.connect(db_url, async function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('courses');

            await collection.find({"university.name": reqCountry}).toArray((err, result) => {
                if (err) console.log('err', err);
                console.log('result', result.length);
                if (result.length > 0) {
                    client.close();
                    res.send({ error: null, result });
                } else {
                    client.close();
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


// get All Courses With University Data

router.post('/courses/all', verifyToken, async (req, res) => {
    let reqData = req.body;
    console.log('country', reqData);
    try {
        MongoClient.connect(db_url, async function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('courses');
            db.collection('university').createIndex({country:"text"})
            collection.find({$and: [ {"university.country" : reqData.country}, {$text: { $search: reqData.studyArea}}  ] }).toArray((err, result) => {
                if (err) console.log('err', err);
                console.log('courses result', result.length);
                if (result.length > 0) {
                    res.send({ error: null, result });
                } else {
                    res.send({ error: null, result: [] });
                }
                // res.send({ error: null, result });
            })

            // await collection.find({ status: true }).toArray((err, result) => {
            //     if (err) console.log('err', err);
            //     console.log('result', result.length);
            //     if (result.length > 0) {
            //         res.send({ error: null, result });
            //     } else {
            //         res.send({ error: null, result: [] });
            //     }
            //     // res.send({ error: null, result });
            // })
        });
        return { error: null, result: "Done" }
    } catch (error) {
        console.log(error.message);
        return { error: error.message, result: null }
    }
})

//get shortlist courses from
router.get('/courses/wishlist', verifyToken, async (req, res) => {
    try {
        MongoClient.connect(db_url, async function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('courses');

            await db.collection('wishlist').find({ userId: req.decoded._id }).toArray((err, result) => {
                if (err) console.log('err', err);
                let resultData = [];
                if (result.length > 0) {
                    const wishlist = result[0].wishlist
                    for (let i = 0; i < wishlist.length; i++) {
                        collection.aggregate([
                            {
                                $lookup:
                                {
                                    from: "university",
                                    localField: "university",
                                    foreignField: "name",
                                    as: "university"
                                },

                            }, {
                                $match: { guid: wishlist[i].courseId }
                            }
                        ]).toArray((err, result) => {
                            if (err) console.log('err', err);
                            if (result.length > 0) {
                                resultData.push(result[0]);
                            }
                        })
                        // collection.find({ guid: wishlist[i].courseId }).toArray((err, result) => {
                        //     if (err) console.log('err', err);
                        //     console.log('result', result.length);
                        //     if (result.length > 0) {
                        //         resultData.push(result[0]);
                        //     }
                        // })
                    }
                    // setTimeout(() => {
                    //     console.log("resultData.....................", resultData);
                    // }, 3000);

                }
                setTimeout(() => {
                    res.send({ error: null, result: resultData });
                }, 3000);

            })


            // client.close();

        });

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