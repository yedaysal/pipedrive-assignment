const express = require("express")
const dotenv = require("dotenv")
const morgan = require("morgan")
const bodyparser = require("body-parser")
const path = require("path")
const mongoose = require("mongoose")
var Gists = require("./server/models/gistModel")

const connectDB = require("./server/database/connection")

dotenv.config({path:"config.env"})

const app = express()
const port = 80

// Log requests
app.use(morgan("common"))

// MongoDB connection
connectDB()

// Parse request to body-parser
app.use(bodyparser.urlencoded({extended:true}))

// Set view engine
app.set("view engine", "ejs")

app.listen(port, () => {
    console.log(`Pipedrive App listening on http://localhost:${port}`)
})

// Load routers
app.use("/", require("./server/routes/router"))

const axios = require('axios');
var cron = require('cron');
const { syncBuiltinESMExports } = require("module")

var cronJob = cron.job("0 * * * * *", function(){
    // perform operation e.g. GET request http.get() etc.

    axios
    .get('https://api.github.com/users/yedaysal/gists')
    .then(res => {
        console.log(`getGistsStatusCode: ${res.status}`)
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
            let created_at = res.data[i].created_at

            axios
                .get('https://taskcompany.pipedrive.com/api/v1/deals/search?api_token=e7eb4d7e1119d190e7079fb8a4ec16779f7c859f&term=' + id)
                .then(res => {
                    console.log(`searchDealStatusCode: ${res.status}`);
                    //console.log(res);
                    if(res.data.success == true){
                        //console.log("searchDealRequest: Success!")
                        //console.log(res.data.data.items[0].item.title)
                        if(res.data.data.items.length == 0){
                            console.log("A deal with gist id: " + id + " does not exist!")

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
                        }
                        else{
                            console.log("A deal with gist id: " + id + " already exists in Pipedrie!")
                        }
                    }
                })
            
            
        }


    })
    .catch(error => {
        console.error(error);
    });

    console.info('cron job completed');
}); 
cronJob.start();

//-------------------------------------------------------------

/*const Character = mongoose.model('Character', new mongoose.Schema({
    name: String,
    age: Number
}));
  
Character.create({ name: 'Jean-Luc Picard' });
  
const filter = { name: 'Jean-Luc Picard' };
const update = { age: 59 };
  
// `doc` is the document _before_ `update` was applied
let doc = Character.findOneAndUpdate(filter, update);
doc.name; // 'Jean-Luc Picard'
doc.age; // undefined
  
doc = Character.findOne(filter);
doc.age; // 59

console.log(doc.name)*/

//-------------------------------------------------------------//-------------------------------------------------------------

/*Gists.find({gist_id : "a7bf06f3c02fb1d48b5209535014db99"}, function (err, docs) {
    //console.log(docs[0].toObject());
    if(docs[0] == undefined){
        console.log("no record found in db, will be created ")
        let gist = new Gists({
            gist_id : "a7bf06f3c02fb1d48b5209535014db99",
            gist_owner : "yedaysal",
            gist_url : "https://api.github.com/gists/a7bf06f3c02fb1d48b5209535014db99",
            gist_created_at : "2022-08-24 11:03:35"
        })

        gist
            .save(gist)
            .catch(err => {
                console.log(err.message)
            })
    }
    else{
        console.log("record found!!!!!" + docs[0])
    }
});*/

