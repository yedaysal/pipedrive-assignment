const express = require("express")
const router = express.Router()
const services = require("../services/render")
const controller = require("../controllers/controller")


router.get('/', services.homeRoutes)

router.get('/useradd', services.useradd)

router.get('/viewusers', services.viewusers)

// API routes
router.post('/api/create', controller.createUser)
router.get('/api/gists', controller.find)

module.exports = router