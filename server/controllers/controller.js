const { getMaxListeners } = require("../models/userModel")
var Users = require("../models/userModel")
var Gists = require("../models/gistModel")

// Create and save a new gist user
exports.createUser = (req, res) => {

    console.log(req.body)
    // Validate request
    if(!req.body){
        res.status(400).send({message : "Content cannot be empty!"})
        return 
    }

    // New user
    let user = new Users({
        user : req.body.username,
    })

    // Save the user in the DB
    user
        .save(user)
        .then(data => {
            res.send("Success! " + data)
        })
        .catch(error => {
            res.status(500).send({
                message : "Some error occured while creating the user! " + error.message
            })
        })
}

// Retrieve gists
exports.getGists = (req, res) => {

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

// Retrieve users
exports.getUsers = (req, res) => {

    Users.find()
        .then(user => {
            res.send(user)
        })
        .catch(error => {
            res.status(500).send({
                message : "Some error occured while retrieving users! " + error.message
            })
        })
}