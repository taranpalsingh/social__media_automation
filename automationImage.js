// create a config file (config.js) in the same folder and copy the below coommented lines.

// module.exports ={
//     "access_token" : "..",    // your access_token for buffer api's app.
//     "text": "..",     // text that you want to post to your accounts
//     "profile_ids": ["..", ".."],   // profile ids of you social media accounts
// }

// let myJson = {
//   "jobtitle":"Full Stack developer",
//   "companyName":"LoopCV",
//   "location":"Greece"    
// }
// exports.myJson = myJson;

// and replace all the "..", with your own credentials/requirements. 

const jsonBody = require('./config')
var request = require('request');

// styling for the image
let width = 500;
let height = 500;
let color = "FFF";

let imageNameStart = "https://res.cloudinary.com/dclncnhmm/image/upload/"
let imageNameEnd = "/v1566382879/samples/download_fzt3y4.png"

let url = "w_" + width + ",h_" + height + "/";

url += "l_text:Arial_20:";

for(let key in jsonBody.myJson){
  url += key;
  url += " : ";
  url += myJson[key]; 
  url += "%0A%0A";
}

url = url + ",co_rgb:" + color;

finalurl = imageNameStart + url + imageNameEnd;  // cloudinary url for our image

////////////////////////////////////////////////////////////////////////////////////////

let text = "text="+jsonBody.text+"&now=true&media="+finalurl;

jsonBody.profile_ids.forEach(element => {
  text =  text + "&" + "profile_ids[]=" + element; 
});

var options = {
  method: 'post',
  body: text, 
  url: 'https://api.bufferapp.com/1/updates/create.json?access_token='+jsonBody.access_token,
  headers: {
    "Content-Type":"application/x-www-form-urlencoded"
  }
}

// POST call to buffer api
request(options, function (err, res, body) {
  if (err) {
    console.log('Error :', err);
    return
  }
  console.log(' Body :', body);
});

