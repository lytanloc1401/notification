var mongoose = require('mongoose')
var passportLocalMongoose = require("passport-local-mongoose")

var schema = mongoose.Schema;

var userSchema = new schema({
    username: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
})


userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('users', userSchema, 'users');