const URI = process.env.MONGO_URI
const express = require("express");
const router = express.Router();
const mongodb = require("mongodb");
const session = require("express-session");
const Online = require("./Online.js")

router.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false,

}))

const MongoClient = mongodb.MongoClient;
var dashboard = {
    get: (req, res) => {
        MongoClient.connect(URI, (err, db) => {
            if (req.session.fullname == null) {
                let dbo = db.db("myFirstDatabase");
                dbo.collection("posts").find().sort({ index: -1 }).toArray((err, post) => {
                    if (req.session.user == null) {
                        res.redirect('/')
                        console.log(req.session.user)
                    } else {
                        console.log(req.session.user)
                        dbo.collection("users").findOne({ email: req.session.user }, (err, user) => {
                            res.render("dashboard.ejs", {
                                posts: post,
                                userSession: user,
                                Online: Online,
                            })
                            console.log(req.session.user)
                        })

                    }
                })
            } else {
                let dbo = db.db("myFirstDatabase");
                dbo.collection("posts").find().sort({ index: -1 }).toArray((err, post) => {
                    if (req.session.user == null) {
                        res.redirect('/')
                        console.log(req.session.user)
                    } else {
                        console.log(req.session.user)
                        dbo.collection("users").findOne({ displayName: req.session.fullname }, (err, user) => {
                            res.render("dashboard.ejs", {
                                posts: post,
                                userSession: user,
                                Online: Online,
                            })
                            console.log(req.session.user)
                        })

                    }
                })
            }
        })
    },
}
module.exports = dashboard;