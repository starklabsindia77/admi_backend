const router = require("express").Router();
const verifyToken = require("../middlewares/verify-token");
const config = require('../key');
var Guid = require('guid');
const cors = require('cors')
const { ObjectId, MongoClient } = require('mongodb');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const db_url = config.dbstring;


/* Signup Route */
router.post("/auth/signup", async (req, res) => {
  var guidValue = Guid.create();
  let guid = guidValue.value;
  if (!req.body.email || !req.body.password) {
    res.json({ success: false, message: "Please enter email or password" });
  } else {
    try {
      //   let newUser = new User();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      let inserted = false;
      const user_body = {
        "guid": guid,
        "name": req.body.name,
        "email": req.body.email,
        "password": hashedPassword,
        "contact": req.body.contact,
        "role": req.body.role,
        "created_at": new Date(),
        "updated_at": new Date()
      }

      MongoClient.connect(db_url, function (err, client) {
        if (err) console.log('err', err);
        const db = client.db("admission");
        const collection = db.collection('User');

        collection.insertOne(user_body, (err, result) => {
          if (err) console.log('err', err);
          console.log('result', result);
          inserted = true;
          if (inserted) {
            let token = jwt.sign(user_body, config.SECRET, {
              expiresIn: 604800 // 1 week
            });

            res.json({
              success: true,
              token: token,
              message: "Successfully created a new user"
            });
          }
        })
      });


    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
});

/* Profile Route */
router.get("/auth/user", verifyToken, async (req, res) => {
  try {
    // let foundUser = await User.findOne({ _id: req.decoded._id }).populate(
    //   "address"
    // );
    let foundUser = {};
    MongoClient.connect(db_url, function (err, client) {
      if (err) console.log('err', err);
      const db = client.db("admission");
      const collection = db.collection('User');

      collection.findOne({ _id: req.decoded._id }, (err, result) => {
        if (err) console.log('err', err);
        console.log('result', result);
        foundUser = result;
        if (foundUser) {
          res.json({
            success: true,
            user: foundUser
          });
        }
      })
    });


  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.get("/auth/userall", verifyToken, async (req, res) => {
  try {
    // let foundUser = await User.findOne({ _id: req.decoded._id }).populate(
    //   "address"
    // );
    let foundUser = {};
    MongoClient.connect(db_url, function (err, client) {
      if (err) console.log('err', err);
      const db = client.db("admission");
      const collection = db.collection('User');

      collection.find({}).toArray((err, result) => {
        if (err) console.log('err', err);
        console.log('result', result);
        foundUser = result;
        if (foundUser) {
          res.json({
            success: true,
            user: foundUser
          });
        }
      })
    });


  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
router.get("/auth/user/:guid", verifyToken, async (req, res) => {
  let reqData = req.params.guid;
  try {
    // let foundUser = await User.findOne({ _id: req.decoded._id }).populate(
    //   "address"
    // );
    let foundUser = {};
    MongoClient.connect(db_url, function (err, client) {
      if (err) console.log('err', err);
      const db = client.db("admission");
      const collection = db.collection('User');

      collection.findOne({ "guid": reqData  }, (err, result) => {
        if (err) console.log('err', err);
        // console.log('result', result);
        delete result.password;
        foundUser = result;
        if (foundUser) {
          res.json({
            success: true,
            result: foundUser
          });
        }
      })
    });


  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* Update a profile */
router.put("/auth/user", verifyToken, async (req, res) => {
  try {
    // let foundUser = await User.findOne({ _id: req.decoded._id });
    let foundUser = {}
    MongoClient.connect(db_url, function (err, client) {
      if (err) console.log('err', err);
      const db = client.db("admission");
      const collection = db.collection('User');

      collection.findOne({ _id: req.decoded._id }, async (err, result) => {
        if (err) console.log('err', err);
        console.log('result', result);
        foundUser = result
        if (foundUser) {
          if (req.body.name) foundUser.name = req.body.name;
          if (req.body.email) foundUser.email = req.body.email;
          if (req.body.contact) foundUser.contact = req.body.contact;
          if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            foundUser.password = hashedPassword;
          }

          //   await foundUser.save();
          MongoClient.connect(db_url, function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('User');
            const body = { $set: { name: foundUser.name, email: foundUser.email, password: foundUser.password, contact: foundUser.contact } }
            collection.updateOne({ _id: req.decoded._id }, body, (err, result) => {
              if (err) console.log('err', err);
              console.log('result', result);
              //foundUser = result
            })
          });


          res.json({
            success: true,
            message: "Successfully updated"
          });
        }
      })
    });


  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.put("/auth/user/:guid", verifyToken, async (req, res) => {
  let reqData = req.params.guid;
  try {
    // let foundUser = await User.findOne({ _id: req.decoded._id });
    let foundUser = {}
    MongoClient.connect(db_url, function (err, client) {
      if (err) console.log('err', err);
      const db = client.db("admission");
      const collection = db.collection('User');

      collection.findOne({ guid: reqData }, async (err, result) => {
        if (err) console.log('err', err);
        console.log('result', result);
        foundUser = result
        if (foundUser) {
          if (req.body.name) foundUser.name = req.body.name;
          if (req.body.email) foundUser.email = req.body.email;
          if (req.body.contact) foundUser.contact = req.body.contact;
          if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            foundUser.password = hashedPassword;
          }

          //   await foundUser.save();
          MongoClient.connect(db_url, function (err, client) {
            if (err) console.log('err', err);
            const db = client.db("admission");
            const collection = db.collection('User');
            const body = { $set: { name: foundUser.name, email: foundUser.email, password: foundUser.password, contact: foundUser.contact } }
            collection.updateOne({ guid: reqData }, body, (err, result) => {
              if (err) console.log('err', err);
              console.log('result', result);
              //foundUser = result
            })
          });


          res.json({
            success: true,
            message: "Successfully updated"
          });
        }
      })
    });


  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* Login Route */
router.post("/auth/login", cors(), async (req, res) => {
  try {

    let foundUser = {};
    MongoClient.connect(db_url, function (err, client) {
      if (err) console.log('err', err.message);
      const db = client.db("admission");
      const collection = db.collection('User');
      console.log('user', req.body.email)
      collection.findOne({ email: req.body.email }, async (err, result) => {
        if (err) console.log('err', err);
        foundUser = result;
        console.log('found user123', foundUser);
        if (!foundUser) {
          res.status(403).json({
            success: false,
            message: "Authentication failed, User not found"
          });
        } else {
          const validPass = await bcrypt.compare(req.body.password, foundUser.password);
          if (validPass) {
            let token = jwt.sign(foundUser, config.SECRET, {
              expiresIn: 604800 // 1 week
            });

            res.json({ success: true, token: token, user: foundUser });
          } else {
            res.status(403).json({
              success: false,
              message: "Authentication failed, Wrong password!"
            });
          }
        }
      })
    });


  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;