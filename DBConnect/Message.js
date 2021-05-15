const URI = process.env.MONGO_URI
const express = require("express");
const router = express.Router();
const mongodb = require("mongodb");
const session = require("express-session");
const online = require("./Online.js")
router.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false,

}))
const MongoClient = mongodb.MongoClient;
var message = {
    get: (req, res) => {
        MongoClient.connect(URI, (err, db) => {
            if (err) console.log(err);
            let dbo = db.db("myFirstDatabase");
            dbo.collection("users").findOne({ email: req.session.user }, (err, userSession) => {
                res.render("messagelist.ejs", {
                    userSession: req.session.user,
                    message_list: userSession,
                    online: online
                })
            })
        })
    },
}
module.exports = message;