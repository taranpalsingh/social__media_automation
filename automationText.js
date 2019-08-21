// create a config file (config.js) in the same folder and copy the below coommented lines.

// module.exports ={
//     "access_token" : "..",    // your access_token for buffer api's app.
//     "text": "..",     // text that you want to post to your accounts
//     "profile_ids": ["..", ".."],   // profile ids of you social media accounts
// }

// and replace all the "..", with your own credentials/requirements. 

const jsonBody = require('./config');
const request = require('request');

let text = "text="+jsonBody.text+"&now=true";

jsonBody.profile_ids.forEach(element => {
  text =  text + "&" + "profile_ids[]=" + element; 
});

var options = {
  method: 'post',
  body: text,
  url: 'https://api.bufferapp.com/1/updates/create.json?access_token=' + jsonBody.access_token,
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