const express = require("express")
const dotenv = require("dotenv")
const morgan = require("morgan")
const bodyparser = require("body-parser")
const path = require("path")

dotenv.config({path:"config.env"})

const app = express()
const port = 80

// Log requests
app.use(morgan("common"))

// Parse request to body-parser
app.use(bodyparser.urlencoded({extended:true}))

// Set view engine
app.set("view engine", "ejs")

app.listen(port, () => {
    console.log(`Pipedrive App listening on http://localhost:${port}`)
})

// Load routers
app.use("/", require("./server/routes/router"))
