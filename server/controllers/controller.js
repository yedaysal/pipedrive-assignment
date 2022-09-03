const { getMaxListeners } = require("../models/userModel")
var Users = require("../models/userModel")
var Gists = require("../models/gistModel")

// Create and save a new gist user
exports.createUser = (req, res) => {

    // Validate request
    if(!req.body){
        res.status(400).send({message : "Content cannot be empty!"})
        return 
    }

    // New gist
    const user = new Users({
        user : req.body.user,
    })

    // Save the gist in the DB
    user
        .save(user)
        .then(data => {
            res.send(data)
        })
        .catch(error => {
            res.status(500).send({
                message : "Some error occured while creating the gist! " + error.message
            })
        })
}

// Retrieve gist(s)
exports.find = (req, res) => {

    Gists.find()
        .then(gist => {
            res.send(gist)
        })
        .catch(error => {
            res.status(500).send({
                message : "Some error occured while retrieving gists! " + error.message
            })
        })
}