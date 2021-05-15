const express = require("express");
const router = express.Router();
const session = require("express-session");
const Online = require("./Online.js")
router.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false,

}))
var logout = {
    get: (req, res) => {
        let temp = Online.indexOf(req.session.user);
        req.session.user = null
        res.redirect('/');
    },
}
module.exports = logout;