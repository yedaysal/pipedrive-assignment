const express = require("express")
const route = express.Router()
const services = require("../services/render")


route.get('/', services.homeRoutes)

route.get('/useradd', services.useradd)

route.get('/viewusers', services.viewusers)

module.exports = route