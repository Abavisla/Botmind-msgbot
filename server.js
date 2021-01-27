'use strict';
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const request = require('request')
var images = require('./pics');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('port', (process.env.PORT || 8080));

app.get('/', (req, res) => res.send('Hello World!'));


app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN){
    console.log('webhook verified');
    res.status(200).send(req.query['hub.challenge']);
 } else {
     console.error('verification failed. Token mismatch.');
     res.sendStatus(403);
  }
});

app.post('/webhook', function(req, res) {
  //checking for page subscription.
  if (req.body.object === 'page'){
    req.body.entry.forEach(function(entry) {
        entry.messaging.forEach(function(event) {
          let sender_psid = event.sender.id;
          console.log('Sender PSID: ' + sender_psid);
          if (event.message) {
              handleMessage(sender_psid, event.message);
          }
        console.log(event);
    });
  });
  res.sendStatus(200);
 }
});

// Adds support for GET requests to our webhook

app.listen(app.get('port'), () => console.log('Example app listening on port 8080!'));


function askTemplate(text){
    return {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text": text,
                "buttons":[
                    {
                        "type":"postback",
                        "title":"Je vais bien, merci",
                    },
                    {
                        "type":"postback",
                        "title":"Non, ça ne va pas",
                    }
                ]
            }
        }
    }
}

// Handles messages events
function handleMessage(sender_psid, received_message) {
    let response;
    console.log('8080!')
    if(received_message.attachment){
        console.log('8080!')
        if(atts[0].type === "image"){
            response = { text: "Je ne sais pas traiter ce type de demande" };
            callSendAPI(sender_psid, response);
        } 
    }
    else if (received_message.text === "Comment vas-tu ?") {
        console.log('8080!')

        response = askTemplate("Très bien et vous ?");
    } else{
        console.log('8080!')
        response = { text: received_message.text };
    }
    callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    // Construct the message body

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN},
        "method": "POST",
        "json": {
              "recipient": {"id": sender_psid},
              "message": response
            }
    },function(error, response, body) {
      if (error) {
          console.log("Error sending message: " + response.error);
      reject(response.error);
      }
 });
}