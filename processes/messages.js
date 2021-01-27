const request = require('request');
const senderAction = require('../templates/senderAction');
const sendMessage = require('../templates/sendMessage');
const sendGenericTemplate = require('../templates/sendGenericTemplate');

module.exports = function processMessage(event) {
        const message = event.message;
        const senderID = event.sender.id;
        console.log("Received message from senderId: " + senderID);
        console.log("Message is: " + JSON.stringify(message));
        if (message.text === "Comment vas-tu ?") {

            response = askTemplate('Très bien et vous ?');
            callSendAPI(sender_psid, response);
        }
        else{

            var messageData = {
                text: message.text
            };
            request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {
                    access_token: token
                },
                method: 'POST',
                json: {
                    recipient: {
                        id: sender
                    },
                    message: messageData+"!!!!",
                }
            }, function(error, response, body) {
                if (error) {
                    console.log('Error:', error);
                } else if (response.body.error) {
                    console.log('Error: ', response.body.error);
                }
            });
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
    
    // Sends response messages via the Send API
    const callSendAPI = (sender_psid, response, cb = null) => {
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
            "qs": { "access_token": config.get('facebook.page.access_token') },
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