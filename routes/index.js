const express = require('express')
const router = express.Router()
const multer = require("multer");
const { ensureAuth, ensureGuest } = require('../MiddleWare/auth');
const session = require("express-session");
const link_preview = require("kahaki");

//Routes
const signup = require("../DBConnect/SignUp.js");
const login = require("../DBConnect/Login.js");
const dashboard = require("../DBConnect/Dashboard.js");
const home = require("../DBConnect/Home.js");
const logout = require("../DBConnect/LogOut.js");
const message = require("../DBConnect/Message.js");
const profile = require("../DBConnect/Profile.js");

const editprofile = require("../DBConnect/EditProfile.js");

const createpost = require("../DBConnect/CreatePost.js");

const posts = require("../DBConnect/Posts.js");

router.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false,

}))

const path = "D:/web-nqhltl";
// setup upload
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path + '/public/image');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
})
var storage_avatar = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path + '/public/image/avatar');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
})
var upload = multer({ storage: storage })
var upload_avatar = multer({ storage: storage_avatar })

router.get("/signup", function(req, res) {
    res.render("signup")
})

router.get("/", home.get);

router.get('/dashboard', dashboard.get);
router.get("/logout", logout.get);

router.post('/signup', signup.post)
router.post('/login', login.post);

router.get("/editprofile", editprofile.get);
router.post("/editprofile", editprofile.post);

router.get("/profile/:username", profile.get);



router.post("/createPost", upload.single("file_image"), createpost.post);


router.get("/post/:id", posts.get);

router.get("/message", message.get);
router.post("/send_message/:userSession/:user/up_file", upload.single("up_image"), async(req, res) => {
    await res.redirect('back');
});
// post to handle link text
router.post('/send_message/link_text', (req, res) => {
    (async() => {
        const preview = await link_preview.getPreview(req.body.link);
        res.send({
            preview: preview,
            mess: req.body.mess
        })
    })();
})

module.exports = router