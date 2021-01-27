const request = require('request');
const senderAction = require('../templates/senderAction');
const sendMessage = require('../templates/sendMessage');
const sendGenericTemplate = require('../templates/sendGenericTemplate');

module.exports = function processMessage(event) {
        const message = event.message;
        const senderID = event.sender.id;
        console.log("Received message from senderId: " + senderID);
        console.log("Message is: " + JSON.stringify(message));
        if (message.text) {
            // now we will take the text recieved and send it to an food tracking API.
            let text = message.text;

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
                    message: text,
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