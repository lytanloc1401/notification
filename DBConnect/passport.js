const GoogleStrategy = require('passport-google-oauth20').Strategy

const bcrypt = require('bcryptjs');

const bodyParser = require('body-parser');

const LocalStrategy = require('passport-local').Strategy

const mongoose = require('mongoose')

const User = require('../DBConnect/User')

const UserLogin = require('../DBConnect/UserLogin')

const express = require("express");

const router = express.Router();

const session = require("express-session");

const URI = process.env.MONGO_URI

const mongodb = require("mongodb");

const Online = require("./Online.js")
const MongoClient = mongodb.MongoClient;


router.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false,

}))

module.exports = function(passport) {
    passport.use(bodyParser.urlencoded({ extended: true }))
    passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
        },
        async(accessToken, refreshToken, profile, done) => {

            console.log(profile)
            var emailTemp = "@student.tdtu.edu.vn"
            var emailCurent = profile.emails[0].value

            const newUser = {
                displayName: profile.displayName,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                image: profile.photos[0].value,
                email: profile.emails[0].value,
                class: "",
                majoy: "",
                password: "",
                role: "1",
            }

            try {
                let user = await User.findOne({ email: profile.emails[0].value })
                if (!user && emailCurent.includes(emailTemp)) {
                    user = await User.create(newUser)
                    MongoClient.connect(URI, (err, db) => {
                        if (err) { console.log(err) };
                        // encryption password

                        let temp = {
                            displayName: profile.displayName,
                            firstName: profile.name.givenName,
                            lastName: profile.name.familyName,
                            image: profile.photos[0].value,
                            email: profile.emails[0].value,
                            class: "",
                            majoy: "",
                            password: "",
                            role: "1",
                        }
                        let dbo = db.db("project1");
                        let user = new User(temp);
                        dbo.collection("users").insertOne(user, (err, res) => {
                            if (err) throw err;
                            console.log("Register");
                        });
                    })
                }
                if (emailCurent.includes(emailTemp)) {
                    console.log(emailCurent)

                    done(null, user)
                } else {
                    done(null, null)
                }

            } catch (err) {
                console.error(err)
            }
        }))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user))
    })

    passport.serializeUser(function(user, done) {
        return done(null, UserLogin.id);
    })

    passport.deserializeUser(async function(id, done) {
        try {
            const userObj = await UserLogin.findById(id, '-password');
            return done(null, userObj);
        } catch (error) {
            done(error);
        }
    })

    passport.use(new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'username', // the desired username field you have defaults to 'username'
        passwordField: 'password', // the desired password field you have defaults to 'password'
    }, async function(req, username, password, done) {

        /**
         * Find User
         */
        const userObj = await UserLogin.findOne({ username: username });
        console.log(username)
        if (userObj && userObj._id) {

            /**
             * Match Password
             */
            const match = await bcrypt.compare(password, userObj.password);

            if (match) {

                /** All Set */
                return done(null, {
                    id: userObj._id
                })
            }
        }

        req.flash('error', 'Wrong Credentials');
        return done(null, false);
    }))
}



// use static authenticate method of model in LocalStrategy