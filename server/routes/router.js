const express = require("express")
const router = express.Router()
const services = require("../services/render")
const controller = require("../controllers/controller")


router.get('/', services.homeRoutes)

router.get('/userAdd', services.userAdd)

router.get('/users', services.users)

router.get('/gists', services.gists)

// API routes
router.post('/api/createUser', controller.createUser)
router.get('/api/gists', controller.getGists)
router.get('/api/users', controller.getUsers)

module.exports = router