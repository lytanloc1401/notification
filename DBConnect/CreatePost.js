const URI = process.env.MONGO_URI
const express = require("express");
const router = express.Router();
const mongodb = require("mongodb");
const session = require("express-session");
const Post = require("./post.js");
router.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false,

}))
const MongoClient = mongodb.MongoClient;
var createpost = {
    post: (req, res) => {
        MongoClient.connect(URI, (err, db) => {
            if (err) { console.log(err) };
            let dbo = db.db("myFirstDatabase");
            dbo.collection("users").findOne({ email: req.session.user }, (err, result) => {
                //check file is exist ??? If not set image = ""
                if (req.file) {
                    let temp = {
                        avatar: result.image,
                        username: result.email,
                        fullname: result.displayName,
                        description: req.body.description,
                        image: req.file.filename
                    }
                    var post = new Post(temp);
                } else {
                    let temp = {
                        avatar: result.image,
                        username: result.email,
                        fullname: result.displayName,
                        description: req.body.description,
                        image: ""
                    }
                    var post = new Post(temp);
                }
                dbo.collection("posts").insertOne(post, (err, result) => {
                    if (err) throw err;
                    console.log("=======Create post successfully======");

                });

            })
            res.redirect('/dashboard');
        });
    },
}
module.exports = createpost;