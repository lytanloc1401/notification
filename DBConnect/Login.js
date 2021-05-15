const URI = process.env.MONGO_URI

const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const mongodb = require("mongodb");
const session = require("express-session");
const User = require("./User");
const Online = require("./Online.js")
router.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false,

}))

const MongoClient = mongodb.MongoClient;

var login = {
    post: (req, res) => {
        MongoClient.connect(URI, (err, db) => {
            if (err) { console.log(err) }
            console.log(req.body)
                // check user in database
            let dbo = db.db("myFirstDatabase")
            dbo.collection("users").find({ email: req.body.username }).toArray((err, user) => {
                if (err) { console.log(err) }
                // not have user
                if (!user[0]) {
                    console.log("======user not found======")
                    res.render('login')
                }
                // check pass
                else {
                    // compare password
                    var bool = bcrypt.compareSync(req.body.password, user[0].password);
                    console.log("Password user post to server: " + req.body.password);
                    if (bool == false) {
                        res.render('login.ejs')
                    } else {
                        req.session.fullname = user[0].fullname;
                        req.session.user = req.body.username;
                        req.session.isLoggedIn = true;
                        if (Online.includes(req.session.user) == false) {
                            Online.push(req.session.user);
                        }
                        console.log(Online)
                        res.redirect('/dashboard');
                        console.log("======Login successfully======")
                    }
                }
            })
        })
    },
}
module.exports = login