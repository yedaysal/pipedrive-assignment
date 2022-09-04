const axios = require("axios")

exports.homeRoutes = (req, res) => {
    res.render("index")
}

exports.userAdd = (req, res) => {
    res.render("userAdd")
}

exports.users = (req, res) => {
    
    axios
        .get("http://localhost:80/api/users")
        .then(response => {
            res.render("users", {users: response.data})
        })
        .catch(err => {
            res.send(err)
        })
}

exports.gists = (req, res) => {

    axios
        .get("http://localhost:80/api/gists")
        .then(response => {
            res.render("gists", {gists: response.data})
        })
        .catch(err => {
            res.send(err)
        })


    
}