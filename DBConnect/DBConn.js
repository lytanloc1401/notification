const mongoose = require('mongoose');
const URI = process.env.MONGO_URI


const connectDB = async() => {
    try {
        const conn = await mongoose.connect(URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useFindAndModify: false,
        })
        var mongoClient = mongoose.MongoClient;
        var ObjectId = conn.ObjectId;
        console.log(`Connected! ${conn.connection.host}`);
        console.log(mongoClient)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}
module.exports = connectDB;