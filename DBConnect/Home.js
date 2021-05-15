const express = require("express");
const router = express.Router();
const session = require("express-session");
const Online = require("./Online.js")
router.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false,

}))
var home = {
    get: function(req, res) {

        if (req.session.user != null) {
            res.redirect('/dashboard')
        } else {

            res.render('Login.ejs')
        }

    },
}
module.exports = home;