'use strict'

const express = require('express')
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();

// app configuration
app.set('port', (process.env.PORT || 3000));


// setup our express application
app.use(morgan('dev')); // log every request to the console.
app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json()); 


// app routes
app.get('/', function (req, res) {
	res.send('Hello world!');
});


app.get('/webhook', function (req, res) {
	if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
		res.send(req.query['hub.challenge']);
	}
	res.send('Wrong token!');
});


app.post('/webhook', (req, res) => {
  let body = req.body;

  if (body.object === 'page') {
      body.entry.forEach(function(entry) {
          let webhook_event = entry.messaging[0];
          console.log(webhook_event);

          let sender_psid = webhook_event.sender.id;
          console.log('Sender PSID: ' + sender_psid);

          if (webhook_event.message) {
            handleMessage(sender_psid, webhook_event.message);
        } else if (webhook_event.postback) {
            handlePostback(sender_psid, webhook_event.postback);
        }else if(webhook_event.attachedfile){
          }
      });
      res.status(200).send('EVENT_RECEIVED');
  } else {
      res.sendStatus(404);
  }

});

const handleMessage = (sender_psid, received_message) => {
  let response;
  if (received_message.text) {
    callSendAPI(sender_psid,received_message.text);
  }
}

const handlePostback = (sender_psid, received_postback) => {
  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;

  if(payload === 'WELCOME'){
    response = askTemplate('Très bien et vous ?');
    callSendAPI(sender_psid, response);
  }
}

const askTemplate = (text) => {
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
                      "payload":"YES"
                  },
                  {
                      "type":"postback",
                      "title":"Non, ça ne va pas",
                      "payload":"NO"
                  }
              ]
          }
      }
  }
}


function callSendAPI(sender_psid, response, cb = null) {
  // Construct the message body
  let request_body = {
      "recipient": {
          "id": sender_psid
      },
      "message": response
  };

  // Send the HTTP request to the Messenger Platform
  request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
  }, (err, res, body) => {
      if (!err) {
          if(cb){
              cb();
          }
      } else {
          console.error("Unable to send message:" + err);
      }
  });
}

// warming up the engines !! setta !! go !!!.
app.listen(app.get('port'), function() {
  const url = 'http://localhost:' + app.set('port');
  console.log('Application running on port: ', app.get('port'));
});