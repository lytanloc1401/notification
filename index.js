const path = require('path')
const dotenv = require('dotenv')
const express = require('express');
const exphbs = require('express-handlebars');

const app = express();
const bodyParser = require('body-parser');
const credentials = require('./credentials.js');
const cookieParser = require('cookie-parser');
const router = express.Router();
const session = require('express-session');
dotenv.config({ path: './DBConnect/config.env' })
const connectDB = require('./DBConnect/DBConn');
const flash = require('express-flash')

const mongodb = require("mongodb")

const passport = require('passport');

const link_preview = require('kahaki');


const URI = process.env.MONGO_URI

const server = require("http").createServer(app);

const io = require("socket.io")(server);


//Passport config
require('./DBConnect/passport')(passport)

connectDB();

//Handlebars
app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash())

//Session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}))

//Passport middleware
app.use(passport.initialize())
app.use(passport.session())


var MongoClient = require('mongodb').MongoClient;
app.use(function(req, res, next) {
    res.removeHeader("X-Powered-By");
    next();
});

// --------- Configure Routes -----------
const routes = require('./routes');
app.use('/', routes);
app.use('/auth', require('./routes/auth'))

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser(credentials.cookieSecret))

io.on("connection", (socket) => {
    socket.on("new_user", data => {
        socket.join(`${data}`)
            // listen event comment
        socket.on("clientSend", (data) => {
            MongoClient.connect(URI, (err, db) => {
                let dbo = db.db("myFirstDatabase");
                // find on database
                dbo.collection("users").findOne({ email: data.commentuser }, (err, user) => {
                    if (err) console.log(err);
                    dbo.collection("posts").findOne({ _id: mongodb.ObjectId(data.post_id) }, (err, p) => {
                        dbo.collection("posts").updateOne({ _id: mongodb.ObjectId(data.post_id) }, {
                            $push: {
                                comment: {
                                    commentuser: data.commentuser,
                                    avatarcomment: user.image,
                                    comment: data.mes
                                }
                            }
                        });
                        console.log(data)
                        console.log(p)
                        io.sockets.in(`${data.post_id}`).emit("serverSend", {
                            commentuser: data.commentuser,
                            avatarcomment: user.image,
                            comment: data.mes,
                            commentcount: p.comment.length + 1
                        });
                    });
                });
            });
        });
    });
})
io.on("connection", (socket) => {
    // listen event like 
    socket.on("like_post", (data) => {
        socket.join(`${data.id}-like`);
        console.log(data.id);
        MongoClient.connect(URI, (err, db) => {
            let dbo = db.db("myFirstDatabase");
            dbo.collection("posts").findOne({ _id: mongodb.ObjectId(data.id) }, (err, p) => {
                if (p.like.includes(data.userSession) == false) {
                    dbo.collection("posts").updateOne({ _id: mongodb.ObjectId(data.id) }, {
                        $push: {
                            like: `${data.userSession}`
                        }
                    });
                    dbo.collection("posts").findOne({ _id: mongodb.ObjectId(data.id) }, (err, result) => {
                        io.sockets.emit(`server_send_likecount_${data.id}`, {
                            likecount: result.like.length + 1,
                        });
                        socket.leave(`${data.id}-like`);
                    });
                }
            });
        });
    });
})

//real-time in chat
io.on("connection", (socket) => {
    socket.on("new_user_message", (data) => {
        socket.join(`${data.userSession}and${data.user}`);
        socket.join(`${data.user}and${data.userSession}`);
        var query1 = {
            userSend: data.userSession,
            userReceive: data.user,
        }
        var query2 = {
                userSend: data.user,
                userReceive: data.userSession,
            }
            //typing
        socket.on("typing", data => {
            socket.to(`${query1.userReceive}and${query1.userSend}`).emit("typing_server", data);
        })
        socket.on("done_typing", () => {
            socket.to(`${query1.userReceive}and${query1.userSend}`).emit("done");
        });
        socket.on("stop_typing", () => {
                socket.to(`${query1.userReceive}and${query1.userSend}`).emit("stop_typing_server");
            })
            // event listen client send text
        socket.on("client_send_mes", data => {
            //check link text
            var index = data.mes.indexOf("https://");
            if (index != -1) {
                var link = data.mes.slice(index, data.mes.length);
                // handle link text
                (async() => {
                    const preview = await link_preview.getPreview(link);
                    socket.to(`${data.UserSession}and${data.User}`).to(`${data.User}and${data.UserSession}`).emit("server_send_mes", {
                        message: data.mes,
                        from: data.UserSession,
                        Time_Mes: `${new Date().getHours()}:${new Date().getMinutes()}-${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
                        link: preview
                    });
                })();
            } else {
                socket.to(`${data.UserSession}and${data.User}`).to(`${data.User}and${data.UserSession}`).emit("server_send_mes", {
                    message: data.mes,
                    from: data.UserSession,
                    Time_Mes: `${new Date().getHours()}:${new Date().getMinutes()}-${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
                    link: 0
                });
            }
            MongoClient.connect(URI, (err, db) => {
                let dbo = db.db("myFirstDatabase");
                dbo.collection("chat").updateOne(query1, {
                    "$push": {
                        message: {
                            check: 1,
                            Mes: `${data.mes}`,
                            index_time: new Date().valueOf(),
                            date: `${new Date().getHours()}:${new Date().getMinutes()}-${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
                            file_name: ""
                        }
                    }
                });
                dbo.collection("chat").updateOne(query2, {
                    "$push": {
                        message: {
                            check: 0,
                            Mes: `${data.mes}`,
                            index_time: new Date().valueOf(),
                            date: `${new Date().getHours()}:${new Date().getMinutes()}-${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
                            file_name: ""
                        }
                    }
                });
            });
        });
        // event listen client send file
        socket.on("client_send_file_mes", (data) => {
            console.log("ok")
            console.log(data)
            var length = data.file_name.length;
            var dot = data.file_name.indexOf(".");
            // var type = data.file_name.substr(length - 3, 3);
            var type = data.file_name.slice(dot + 1, length);
            MongoClient.connect(URI, (err, db) => {
                let dbo = db.db("myFirstDatabase");
                dbo.collection("chat").updateOne(query1, {
                    "$push": {
                        message: {
                            check: 1,
                            Mes: `${data.mes}`,
                            index_time: new Date().valueOf(),
                            date: `${new Date().getHours()}:${new Date().getMinutes()}-${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
                            file_name: data.file_name,
                            type: type
                        }
                    }
                });
                dbo.collection("chat").updateOne(query2, {
                    "$push": {
                        message: {
                            check: 0,
                            Mes: `${data.mes}`,
                            index_time: new Date().valueOf(),
                            date: `${new Date().getHours()}:${new Date().getMinutes()}-${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
                            file_name: data.file_name,
                            type: type
                        }
                    }
                })
            });
            socket.to(`${data.UserSession}and${data.User}`).to(`${data.User}and${data.UserSession}`).emit("server_send_file_mes", {
                message: data.mes,
                from: data.UserSession,
                file_name: data.file_name,
                type: type
            });
        });
        socket.on('check-seen', (data) => {
            socket.to(`${data.UserSession}and${data.User}`).emit("check-seen-sv");
        })
    });
});


app.use("/public", express.static(__dirname + "/public"));
//Static folder

app.use("/stylesheets", express.static(__dirname + "/public/stylesheets"))
app.use("/javascripts", express.static(__dirname + "/public/javascripts"))
app.use("/image", express.static(__dirname + "/public/image"))
app.use("/css", express.static(__dirname + "/public/css"))
app.use("/partials", express.static(__dirname + "/views/partials"))


var port = process.env.PORT || 3000;
// run server
server.listen(port, function() {
    console.log("Server is listening on port 3000");
});