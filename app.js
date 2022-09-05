// Load necessary packages
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
    // Log app listen status to both console and log file
    console.log(`Pipedrive App listening on http://localhost:${port}`)
    logger.log("info", `Pipedrive App listening on http://localhost:${port}`)
})

// Load routers
app.use("/", require("./server/routes/router"))

// Define a scheduled cron job to periodically query a users' 
// publicly available github gists and create a deal in Pipedrive
// for each gist
var cronJob = cron.job("0 */2 * * *", function(){
    

    // Make an HTTP GET request to the app's api to retrieve users added to DB
    axios
    .get("http://localhost:8080/api/users")
    .then(res => {
        //console.log(res.data)
        // Iterate each user
        for(var i=0; i<res.data.length; i++){
            // Log get users status code to both console and log file
            console.log(`getUsersStatusCode: ${res.status}`)
            logger.log("info",`getUsersStatusCode: ${res.status}`)
            //console.log(res.data[i].user)
            
            // Make an HTTP GET request for each user to query their public gists
            axios
            .get("https://api.github.com/users/" + res.data[i].user + "/gists")
            .then(res => {
                // Log get gists status code to both console and log file
                console.log(`getGistsStatusCode: ${res.status}`)
                logger.log("info", `getGistsStatusCode: ${res.status}`)
                //console.log(res);

                // Iterate each gist
                for(var i = 0; i < res.data.length; i++){
                    /*
                    console.log("-------------------------------------------------------------")
                    console.log(res.data[i].id)
                    console.log(res.data[i].owner.login)
                    console.log(res.data[i].html_url)
                    console.log(res.data[i].created_at.replace("T", " ").replace("Z", ""))
                    console.log("-------------------------------------------------------------")
                    */
                    
                    // Assign retrieved gist values to variables not to lose them and use them later in other HTTP requests
                    let id = res.data[i].id
                    let owner = res.data[i].owner.login
                    let url = res.data[i].html_url
                    let created_at = res.data[i].created_at.replace("T", " ").replace("Z", "")

                    // Make an HTTP GET request to Pipedrive to search if a deal with the current gist id exists or not
                    axios
                        .get('https://taskcompany.pipedrive.com/api/v1/deals/search?api_token=e7eb4d7e1119d190e7079fb8a4ec16779f7c859f&term=' + id)
                        .then(res => {
                            // Log search deal status code to both console and log file
                            console.log(`searchDealStatusCode: ${res.status}`)
                            logger.log("info", `searchDealStatusCode: ${res.status}`);
                            //console.log(res);

                            // If the request is successful
                            if(res.data.success == true){
                                //console.log("searchDealRequest: Success!")
                                //console.log(res.data.data.items[0].item.title)
                                
                                // If no data returned from Pipedrive search
                                if(res.data.data.items.length == 0){
                                    // Log to console and log file
                                    console.log("A deal with gist id: " + id + " does not exist in Pipedrive and will be added!")
                                    logger.log("log", "A deal with gist id: " + id + " does not exist in Pipedrive and will be added!")

                                    // Make an HTTP POST request to create a deal with the current gist id
                                    axios
                                        .post('https://taskcompany.pipedrive.com/api/v1/deals?api_token=e7eb4d7e1119d190e7079fb8a4ec16779f7c859f', {
                                            title: id
                                        })
                                        .then(res => {
                                            // Log create deal status code to console and a file
                                            console.log(`createDealStatusCode: ${res.status}`)
                                            logger.log("info", `createDealStatusCode: ${res.status}`);
                                            
                                            // If the POST operation is successful
                                            if(res.data.success == true){
                                                // Log to console and log file
                                                console.log("A deal with gist id: " + id + " has been created successfully in Pipedrive! Gist data will be added to DB!")
                                                logger.log("info", "A deal with gist id: " + id + " has been created successfully in Pipedrive! Gist data will be added to DB!")
                                                
                                                // Check DB if a gist record with the current gist id exists or not
                                                Gists.find({gist_id : id}, function (err, docs) {
                                                    
                                                    // If no record found, then create one
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
                                                                // If any error is catched while saving the gist info to DB, create an error log
                                                                console.log(err.message)
                                                                logger.log("error", err.message)
                                                                if(!err){
                                                                    // Log to console and log file
                                                                    console.log("Gist data with id: " + id + " have been added to the DB!")
                                                                    logger.log("info", "Gist data with id: " + id + " have been added to the DB!")
                                                                }
                                                            })
                                                        
                                                    }
                                                    else{
                                                        // If a record exists, create a log and do nothing else
                                                        console.log("Gist data with id: " + id + " already exist in the DB!")
                                                        logger.log("info", "Gist data with id: " + id + " already exist in the DB!")
                                                    }
                                                })
                                            }
                                        
                                        })
                                        .catch(err => {
                                            // If any error is catched while making an HTTP POST request to create a deal with the current gist id, create an error log
                                            console.log(err)
                                            logger.log("error", err);
                                        })
                                }
                                else{
                                    // If a deal with the current gist id exists in Pipedrive, then log it and do nothing else
                                    console.log("A deal with gist id: " + id + " already exists in Pipedrive! No action will be taken!")
                                    logger.log("info", "A deal with gist id: " + id + " already exists in Pipedrive! No action will be taken!")
                                }
                            }
                        })
                        .catch(err => {
                            // If any error is catched while making an HTTP GET request to Pipedrive to search if a deal with the current gist id exists or not, create an error log
                            console.log(err)
                            logger.log("error", err)
                        })
                    
                    
                }


            })
            .catch(err => {
                // If any error is catched while making an HTTP GET request for each user to query their public gists, create an error log
                console.log(err)
                logger.log("error", err);
            })
    
        }
    })
    .catch(err => {
        // If any error is catched while making an HTTP GET request for each user to query their public gists, create an error log
        console.log(err)
        logger.log("error", err);
    })

    console.log("Cron job completed!")
    logger.log("info", "Cron job completed!")
}); 
cronJob.start()



