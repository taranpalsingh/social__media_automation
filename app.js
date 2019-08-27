// 
// create a config file (config.js) in the same folder and copy the below commented lines.
// 
// let bufferJson ={
//     "access_token" : "..",    // your access_token for buffer api's app.
//     "text": "This is a bot!!! #automation #bufferApi",     // text that you want to post to your accounts
//     "profile_ids": ["..", ".."],   // profile ids of you social media accounts
// }
// 
//   const myJson = {
//     "backgroundImage":"download.jpg",
//     "jobtitle":"Backend Developer",
//     "companyName":"LoopCV",
//     "location":"Greece",
//     "scheduled_at": ""  // For posting it right now, just leave it like this
//                         // For scheduling, give the timestamp in utc. 
//                          
//   }  
//   const cloudinaryJson = { 
//     cloud_name: '..', 
//     api_key: '..', 
//     api_secret: '..' 
//   }
//   exports.myJson = myJson;
//   exports.bufferJson = bufferJson;
//   exports.cloudinaryJson = cloudinaryJson;
// 

const jsonBody = require('./config'); 
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const express = require('express');
const fs = require('fs');
const cloudinary = require('cloudinary');
const request = require('request');

const app = express();

console.log(jsonBody.myJson.companyName);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

cloudinary.config(jsonBody.cloudinaryJson);

let imageUrl = "";
ejs.renderFile(__dirname + "/index.ejs", jsonBody.myJson, (err, data)=> {
    if(err)   console.log(err); 
    console.log("rendered html file");

    fs.writeFile('index.html', data, ()=>{
        console.log("created html File");
        (async () => {
            const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
            const page = await browser.newPage();
            await page.goto(__dirname + "/index.html");
            await page.setViewport({
                width: 600,
                height: 400,
                deviceScaleFactor: 1,
            })
            await page.screenshot({path: 'screenshot.png'});
            console.log("screenshot saved");  
            cloudinary.v2.uploader.upload("screenshot.png", (error, result)=> { 
                if(error)   console.log(error)
                imageUrl = result.url;
                // console.log("Image URL: " + imageUrl);
                console.log("Image URL created");
                
                let text = "text="+jsonBody.bufferJson.text+"&now=true&media[photo]=" + imageUrl;
                if(jsonBody.myJson.scheduled_at !== "")
                    text += "&scheduled_at=" + jsonBody.myJson.scheduled_at;
                
                jsonBody.bufferJson.profile_ids.forEach(element => {
                text =  text + "&" + "profile_ids[]=" + element; 
                });
                
                let options = {
                    method: 'post',
                    body: text, 
                    url: 'https://api.bufferapp.com/1/updates/create.json?access_token='+jsonBody.bufferJson.access_token,
                    headers: {"Content-Type":"application/x-www-form-urlencoded"},
                }
                // POST call to buffer api
                request(options, (err, res, body)=> {
                if (err) {
                    console.log('Error :', err);
                    return
                }
                console.log(' Body :', body);
                });
            });            
            await browser.close();
        })();
    })
})
