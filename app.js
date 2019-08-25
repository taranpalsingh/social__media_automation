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
//     "backgroundImage":"https://images.pexels.com/photos/733475/pexels-photo-733475.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
//     "jobtitle":"Backend Developer",
//     "companyName":"LoopCV",
//     "location":"Greece"
//   }
  
//   const cloudinaryJson = { 
//     cloud_name: '..', 
//     api_key: '..', 
//     api_secret: '..' 
//   }
//   exports.myJson = myJson;
//   exports.bufferJson = bufferJson;
//   exports.cloudinaryJson = cloudinaryJson;
  



const jsonBody = require('./config'); 
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const express = require('express');
const fs = require('fs');
const cloudinary = require('cloudinary');
const request = require('request');

const app = express();

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
            await page.goto('file:///C:/Users/taran.singh.CYBERGINDIA/Desktop/projects/greeceAutomation/index.html');
            await page.screenshot({path: 'screenshot.png'});
            console.log("screenshot saved");  
            cloudinary.v2.uploader.upload("screenshot.png", (error, result)=> { 
                if(error)   console.log(error)
                console.log("Image URL: " + result.url)
                console.log("Image URL created");

                let text = "text="+jsonBody.bufferJson.text+"&now=true&media[photo]=" + imageUrl;
                
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
