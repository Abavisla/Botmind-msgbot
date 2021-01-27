'use strict';
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const request = require('request')

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
  if (req.body.object === 'page'){
    req.body.entry.forEach(function(entry) {
        entry.messaging.forEach(function(event) {
          let sender_psid = event.sender.id;
          if (event.message) {
              handleMessage(sender_psid, event.message);
          }
        console.log(event);
    });
  });
  res.sendStatus(200);
 }
});

app.listen(app.get('port'), () => console.log('listening on port 8080'));

function handleMessage(sender_psid, received_message) {
    let response;
    if(received_message.attachments){
        if(received_message.attachments[0].type === "image"){
            response = { text: "Je ne sais pas traiter ce type de demande" };
        } 
    }else if (received_message.text === "Comment vas-tu ?") {
        response = {
            "attachment":{
                "type":"template",
                "payload":{
                    "template_type":"button",
                    "text": "Très bien et vous ?",
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
    }else{
        response = { text: received_message.text };
    }
    sendToBot(sender_psid, response);
}

function sendToBot(sender_psid, response) {
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