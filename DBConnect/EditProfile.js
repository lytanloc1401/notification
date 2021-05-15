const URI = process.env.MONGO_URI
const express = require("express");
const router = express.Router();
const mongodb = require("mongodb");
const session = require("express-session");

router.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false,

}))
const MongoClient = mongodb.MongoClient;
var editprofile = {
    get: (req, res) => {
        MongoClient.connect(URI, (err, db) => {
            if (err) console.log(err);
            let dbo = db.db("myFirstDatabase");
            dbo.collection("users").findOne({ email: req.session.user }, (err, result) => {
                res.render("editprofile.ejs", {
                    user: result
                })
            })
        });
    },
    post: (req, res) => {
        console.log(req.body)
        MongoClient.connect(URI, (err, db) => {

            if (err) { console.log(err) };

            let dbo = db.db("myFirstDatabase");
            if (req.body.image != null) {
                let query = {
                    $set: {
                        displayName: req.body.fname + " " + req.body.lname,
                        firstName: req.body.fname,
                        lastName: req.body.lname,
                        image: req.body.image,
                        class: req.body.class,
                        majoy: req.body.majoy,
                    }
                }
                dbo.collection("posts").updateMany({ username: req.session.user }, {
                    $set: {
                        fullname: `${req.body.fname} ${req.body.lname}`,
                        avatar: req.body.image,
                    }
                });
                dbo.collection("posts").updateMany({ "comment.commentuser": req.session.user }, {
                    $set: {
                        "comment.$.avatarcomment": req.body.image
                    }
                })
                dbo.collection("users").updateOne({ email: req.session.user }, query);
                dbo.collection("users").updateMany({ "friends.username": req.session.user }, {
                    $set: { "friends.$.avatar": req.body.image }
                })
            } else {
                let query = {
                    $set: {
                        displayName: req.body.fname + " " + req.body.lname,
                        firstName: req.body.fname,
                        lastName: req.body.lname,
                        class: req.body.class,
                        majoy: req.body.majoy,
                    }
                }
                dbo.collection("posts").updateMany({ username: req.session.user }, {
                    $set: {
                        fullname: req.body.fname + " " + req.body.lname,
                    }
                });
                dbo.collection("users").updateOne({ email: req.session.user }, query);
            }
            res.redirect('/editprofile');
        });

    },
}
module.exports = editprofile;