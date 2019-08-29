// 
// create a config file (config.js) in the same folder and copy the below commented lines.
// 
// const bufferJson ={
//   "access_token" : "..",    // your access_token for buffer api's app.
//   "accounts" : {
//       "instagram" : "..",
//       "facebook" : "..",
//       "twitter" : ".."      //profile ids for these social media accounts.
//   }}
  
//   const myJson = {  
//     "text": "This is a bot!!! #automation #bufferApi",     // text that you want to post to your accounts
//     "backgroundImage":"download.jpg",
//     "jobtitle":"Backend Developer",
//     "companyName":"LoopCV",
//     "location":"Greece",
//     "scheduled_at": ""  // For posting it right now, just leave it like this
//                         // For scheduling, give the timestamp in utc. 
//        }
  
//   const cloudinaryJson = { 
//     cloud_name: '..', 
//     api_key: '..', 
//     api_secret: '..' 
//   }
//   exports.myJson = myJson;
//   exports.bufferJson = bufferJson;
//   exports.cloudinaryJson = cloudinaryJson;
//
// and the ".." fields with your respective account credentials.
// 


const jsonBody = require('./config'); 
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const express = require('express');
const fs = require('fs');
const cloudinary = require('cloudinary');
const request = require('request');

let app = express();
const PORT = 3000;



// let postsTo = ["facebook", "instagram", "twitter"];


app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

cloudinary.config(jsonBody.cloudinaryJson);

app.use(bodyParser.json());
app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/', (req, res, next)=> {
    res.send("Welcome to loopcv");
})



app.post('/schedule-post', (req, res, next) => {

    let imageUrl = "", profile_ids = [];
    let myJson = req.body.socialPost; 
    
    req.body.myJson.postsTo.forEach((element)=>{
        profile_ids.push(jsonBody.bufferJson.accounts[element]);
    })

    ejs.renderFile(__dirname + "/index.ejs", myJson, (err, data)=> {
        if(err){
            res.send('Error :' + err);
         } 
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
                cloudinary.v2.uploader.upload("screenshot.png", (err, result)=> { 
                    if(err){
                       res.send('Error :' + err);
                    }
                    imageUrl = result.url;
                    console.log("Image URL created");
                    
                    let text = "text="+myJson.text+"&now=true&media[photo]=" + imageUrl;
                    if(myJson.scheduled_at !== "")
                        text += "&scheduled_at=" + myJson.scheduled_at;
                    
                    profile_ids.forEach(element => {
                        text =  text + "&" + "profile_ids[]=" + element; 
                    });
                    
                    let options = {
                        method: 'post',
                        body: text, 
                        url: 'https://api.bufferapp.com/1/updates/create.json?access_token='+jsonBody.bufferJson.access_token,
                        headers: {"Content-Type":"application/x-www-form-urlencoded"},
                    }
                    // POST call to buffer api
                    request(options, (err, response, body)=> {
                    if (err) {
                        res.send('Error :'+ err);
                    }
                    console.log(' Body :'+ body);
                    res.send(body);
                    });
                });            
                await browser.close();
            })();
        });
    });
});

app.get('/get-future-posts/:account', (req,res,next)=>{

    console.log(req.params.account);
    let profile = jsonBody.bufferJson.accounts[req.params.account];
    console.log(profile);
    // res.send(req.params.account);
    let options = {
        method: 'get',
        // body: text, 
        url: "https://api.bufferapp.com/1/profiles/"+profile+"/updates/pending.json?access_token="+jsonBody.bufferJson.access_token,
        headers: {"Content-Type":"application/x-www-form-urlencoded"},
    }
    // POST call to buffer api
    request(options, (err, response, body)=> {
        if (err) {
            res.send('Error :'+ err);
        }
        res.send(body);
    });
});

let server = app.listen(PORT, ()=>{
    let host = server.address().address;
    let port = server.address().port;
    console.log("app listening at http://%s:%s", host,port);
})

