const express = require("express")
const dotenv = require("dotenv")
const morgan = require("morgan")
const bodyparser = require("body-parser")
const path = require("path")
const mongoose = require("mongoose")
const axios = require('axios');
var cron = require('cron');
const { syncBuiltinESMExports } = require("module")
const connectDB = require("./server/database/connection")
var Gists = require("./server/models/gistModel")
var Users = require("./server/models/userModel")
dotenv.config({path:"config.env"})
const logger = require("./logger")

const app = express()
const port = 8080

// Log requests
app.use(morgan("common"))

// MongoDB connection
connectDB()

// Parse request to body-parser
app.use(bodyparser.urlencoded({extended:true}))

// Set view engine
app.set("view engine", "ejs")

app.listen(port, () => {
    logger.log("info", `Pipedrive App listening on http://localhost:${port}`)
})

// Load routers
app.use("/", require("./server/routes/router"))



var cronJob = cron.job("*/10 * * * *", function(){
    // perform operation e.g. GET request http.get() etc.

    axios
    .get("http://localhost:8080/api/users")
    .then(res => {
        //console.log(res.data)
        for(var i=0; i<res.data.length; i++){
            logger.log("info",`getUsersStatusCode: ${res.status}`)
            //console.log(res.data[i].user)
            
            axios
            .get("https://api.github.com/users/" + res.data[i].user + "/gists")
            .then(res => {
                logger.log("info", `getGistsStatusCode: ${res.status}`)
                //console.log(res);

                for(var i = 0; i < res.data.length; i++){
                    /*
                    console.log("-------------------------------------------------------------")
                    console.log(res.data[i].id)
                    console.log(res.data[i].owner.login)
                    console.log(res.data[i].html_url)
                    console.log(res.data[i].created_at.replace("T", " ").replace("Z", ""))
                    console.log("-------------------------------------------------------------")
                    */
                    
                    let id = res.data[i].id
                    let owner = res.data[i].owner.login
                    let url = res.data[i].html_url
                    let created_at = res.data[i].created_at.replace("T", " ").replace("Z", "")

                    axios
                        .get('https://taskcompany.pipedrive.com/api/v1/deals/search?api_token=e7eb4d7e1119d190e7079fb8a4ec16779f7c859f&term=' + id)
                        .then(res => {
                            logger.log("info", `searchDealStatusCode: ${res.status}`);
                            //console.log(res);
                            if(res.data.success == true){
                                //console.log("searchDealRequest: Success!")
                                //console.log(res.data.data.items[0].item.title)
                                if(res.data.data.items.length == 0){
                                    logger.log("log", "A deal with gist id: " + id + " does not exist in Pipedrive and will be added!")

                                    axios
                                        .post('https://taskcompany.pipedrive.com/api/v1/deals?api_token=e7eb4d7e1119d190e7079fb8a4ec16779f7c859f', {
                                            title: id
                                        })
                                        .then(res => {
                                        console.log(`createDealStatusCode: ${res.status}`);
                                        if(res.data.success == true){
                                            console.log("A deal with gist id: " + id + " has been created successfully in Pipedrive! Gist data will be added to DB!")

                                            Gists.find({gist_id : id}, function (err, docs) {
                                                if(docs[0] == undefined){
                                                    let gist = new Gists({
                                                        gist_id : id,
                                                        gist_owner : owner,
                                                        gist_url : url,
                                                        gist_created_at : created_at
                                                    })
                                                    
                                                    gist
                                                        .save(gist)
                                                        .catch(err => {
                                                            console.log(err.message)
                                                            if(!err){
                                                                console.log("Gist data with id: " + id + " have been added to DB!")
                                                            }
                                                        })
                                                    
                                                }
                                                else{
                                                    console.log("Gist data with id: " + id + " already exist in DB!")
                                                }
                                            })
                                        }
                                        
                                        })
                                        .catch(err => {
                                            logger.log("error", err);
                                        })
                                }
                                else{
                                    logger.log("info", "A deal with gist id: " + id + " already exists in Pipedrive! No action will be taken!")
                                }
                            }
                        })
                        .catch(err => {
                            logger.log("error", err)
                        })
                    
                    
                }


            })
            .catch(err => {
                logger.log("error", err);
            })
    
        }
    })
    .catch(err => {
        logger.log("error", err);
    })

    logger.log("info", "Cron job completed!")
}); 
cronJob.start()

let a = "2022-09-04 10:47:50"
let b = "2022-09-04 10:45:39"

if(a > b){
    console.log("a > b")
}
else{
    console.log("b > a")
}


