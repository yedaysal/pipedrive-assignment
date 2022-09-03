const mongoose = require("mongoose")

var schema = new mongoose.Schema({
    gist_id : {
        type : String,
        required : true,
        unique : true
    },
    gist_owner : {
        type : String,
        required : true
    },
    gist_url : {
        type : String,
        required : true,
        unique : true
    },
    gist_created_at : {
        type : String,
        required : true
    }
})

module.exports = mongoose.model('Gists', schema)