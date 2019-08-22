
const jsonBody = require('./config')
var request = require('request');

// create a config file (config.js) in the same folder and copy the below commented lines.
//
// let bufferJson ={
//     "access_token" : "..",    // your access_token for buffer api's app.
//     "text": "This is an auto generated image!!! #automation",     // text that you want to post to your accounts
//     "profile_ids": ["..", ".."],   // profile ids of you social media accounts
// }
// 
// let myJson = {
//   "jobtitle":"Full Stack developer",
//   "companyName":"LoopCV",
//   "location":"Greece"    
// }
// exports.myJson = myJson;
// exports.bufferJson = bufferJson;
//
// and replace all the "..", with your own credentials/requirements. 


// styling for the image
let width = 400;
let height = 400;
let color = "FFF";

let imageNameStart = "https://res.cloudinary.com/dclncnhmm/image/upload/"
let imageNameEnd = "/v1566382879/samples/download_fzt3y4.png"

let url = "w_" + width + ",h_" + height + "/";

url += "l_text:Arial_20:";

for(let key in jsonBody.myJson){
  url += key;
  url += " : ";
  url += jsonBody.myJson[key]; 
  url += "%0A%0A";
}

url = url + ",co_rgb:" + color;

finalurl = imageNameStart + url + imageNameEnd;  // cloudinary url for our image

console.log("Finalurl : "+finalurl);
////////////////////////////////////////////////////////////////////////////////////////

let text = "text="+jsonBody.bufferJson.text+"&now=true&media[link]="+finalurl;

jsonBody.bufferJson.profile_ids.forEach(element => {
  text =  text + "&" + "profile_ids[]=" + element; 
});

var options = {
  method: 'post',
  body: text, 
  url: 'https://api.bufferapp.com/1/updates/create.json?access_token='+jsonBody.bufferJson.access_token,
  headers: {
    "Content-Type":"application/x-www-form-urlencoded",
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

