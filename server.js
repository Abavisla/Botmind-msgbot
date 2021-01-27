'use strict';
let express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    request = require('request'),
    images = require('./pics');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let users = {};

app.listen(8080, () => console.log('Example app listening on port 8989!'));

app.get('/', (req, res) => res.send('Hello World!'));


app.post('/webhook', function(req, res) {
  //checking for page subscription.
  if (req.body.object === 'page'){
     
     /* Iterate over each entry, there can be multiple entries 
     if callbacks are batched. */       req.body.entry.forEach(function(entry) {
     // Iterate over each messaging event
        entry.messaging.forEach(function(event) {
          let sender_psid = event.sender.id;
          console.log('Sender PSID: ' + sender_psid);
          if (event.message) {
              handleMessage(sender_psid, event.message);
          } else if (event.postback) {
              handlePostback(sender_psid, event.postback);
          }
        console.log(event);
    });
  });
  res.sendStatus(200);
 }
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN){
    console.log('webhook verified');
    res.status(200).send(req.query['hub.challenge']);
 } else {
     console.error('verification failed. Token mismatch.');
     res.sendStatus(403);
  }
});


function getImage(type, sender_id){
    // create user if doesn't exist
    if(users[sender_id] === undefined){
        users = Object.assign({
            [sender_id] : {
                'cats_count' : 0,
                'dogs_count' : 0
            }
        }, users);
    }

    let count = images[type].length, // total available images by type
        user = users[sender_id], // // user requesting image
        user_type_count = user[type+'_count'];


    // update user before returning image
    let updated_user = {
        [sender_id] : Object.assign(user, {
            [type+'_count'] : count === user_type_count + 1 ? 0 : user_type_count + 1
        })
    };
    // update users
    users = Object.assign(users, updated_user);

    console.log(users);
    return images[type][user_type_count];
}

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
                        "title":"Cats",
                        "payload":"CAT_PICS"
                    },
                    {
                        "type":"postback",
                        "title":"Dogs",
                        "payload":"DOG_PICS"
                    }
                ]
            }
        }
    }
}

function imageTemplate(type, sender_id){
    return {
        "attachment":{
            "type":"image",
            "payload":{
                "url": getImage(type, sender_id),
                "is_reusable":true
            }
        }
    }
}

// Handles messages events
function handleMessage(sender_psid, received_message) {
    let response;

    // Check if the message contains text
    if (received_message.text) {

        // Create the payload for a basic text message
        response = askTemplate();
    }

    // Sends the response message
    callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === 'CAT_PICS') {
        response = imageTemplate('cats', sender_psid);
        callSendAPI(sender_psid, response, function(){
            callSendAPI(sender_psid, askTemplate('Show me more'));
        });
    } else if (payload === 'DOG_PICS') {
        response = imageTemplate('dogs', sender_psid);
        callSendAPI(sender_psid, response, function(){
            callSendAPI(sender_psid, askTemplate('Show me more'));
        });
    } else if(payload === 'WELCOME'){
        response = askTemplate('Are you a Cat or Dog Person?');
        callSendAPI(sender_psid, response);
    }
    // Send the message to acknowledge the postback
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
      } else {
         resolve(body);
      }
 });
}