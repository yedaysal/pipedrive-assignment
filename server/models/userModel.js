const mongoose = require("mongoose")

var schema = new mongoose.Schema({
    user : {
        type : String,
        required : true,
        unique : true
    }
})

module.exports = mongoose.model("Users", schema)