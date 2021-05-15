const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        require: false,
    },
    email: {
        type: String,
        require: true
    },
    class: {
        type: String,
            require: false,
    },
    majoy: {
        type: String,
        require: false,
    },
    password: {
        type: String,
        require: false,
    },
    role: {
        type: String,
        require: false,
    },
    friends: {
        type: Array,
        require: false,
    }
})

module.exports = mongoose.model('User', UserSchema)