const express = require('express')
const passport = require('passport')
const User = require('../DBConnect/User')
const router = express.Router()
const bcrypt = require('bcryptjs')
const bodyParser = require('body-parser')
const session = require("express-session");
const Online = require("../DBConnect/Online.js")
const { ensureAuth, ensureGuest } = require('../MiddleWare/auth');
router.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false,

}))
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/google', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
}))

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/auth/dashboard')
    }
)
router.get('/dashboard', ensureAuth, async(req, res) => {
    try {
        if (req.user != null) {
            const array = req.user
            console.log(array)
            req.session.fullname = array.displayName
            req.session.user = array.email
            req.session.isLoggedIn = true;
            if (Online.includes(req.session.user) == false) {
                Online.push(req.session.user);
            }
            console.log(Online)
            res.redirect('/dashboard');
            console.log("======Login successfully======")
        } else {
            res.redirect('/')
        }
    } catch (err) {
        console.error(err)

    }
})

// check isLoggedIn
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
}

module.exports = router