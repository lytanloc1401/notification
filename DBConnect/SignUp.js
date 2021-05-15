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
var signup = {
    post: (req, res) => {
        MongoClient.connect(URI, (err, db) => {
            if (err) { console.log(err) };
            // encryption password
            let hashedPassword = bcrypt.hash(req.body.password, 10).then(function(hashedPassword) {
                let temp = {
                    displayName: req.body.fname + " " + req.body.lname,
                    firstName: req.body.fname,
                    lastName: req.body.lname,
                    image: "https://img.icons8.com/bubbles/2x/pixel-cat.png",
                    email: req.body.username,
                    class: "",
                    majoy: req.body.majoy,
                    password: hashedPassword,
                    role: "2",
                }
                let user = new User(temp);
                console.log("Password user signup: " + req.body.password);
                // connect database
                let dbo = db.db("myFirstDatabase");
                console.log(req.body)
                dbo.collection("users").find({ email: req.body.username }).toArray((err, result) => {
                    if (err) { console.log(err) };

                    if (result[0]) {
                        console.log(result)
                        console.log("======Username registered======");
                        res.render('signup.ejs');
                    } else {
                        // insert user
                        dbo.collection("users").insertOne(user, (err, res) => {
                            if (err) throw err;
                            console.log("======Insert ok======");
                        });
                        //set session
                        req.session.isLoggedIn = true;
                        req.session.fullname = user.fullname;
                        req.session.user = req.body.username;
                        if (Online.includes(req.session.user) == false) {
                            Online.push(req.session.user);
                        }
                        res.redirect("/dashboard");
                    }
                });
            })
        })
    },
}
module.exports = signup;