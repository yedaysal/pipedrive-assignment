const mongoose = require("mongoose")
const logger = require("../../logger")

const connectDB = async () => {
    try {
        // mongodb connection string
        const con = await mongoose.connect(process.env.MONGODB_URI)

        console.log(`MongoDB connected : ${con.connection.host}`)
        logger.log("info", `MongoDB connected : ${con.connection.host}`)
    } catch (error) {
        console.log(error)
        logger.log("error", error)
        process.exit(1)
    }
} 

module.exports = connectDB