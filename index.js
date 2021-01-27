const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const request = require('request');
const processPostback = require('../processes/postback');
const processMessage = require('../processes/messages');

const app = express();


app.set('port', (process.env.PORT || 3000));// 
app.use(morgan('dev')); // log every request to the console.

app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json());

app.get('/msgbot/', function (req, res) {
	if (req.query['hub.verify_token'] === 'EAAPTsUnoxzQBANSgosW7FhNPkEKlFsZA2VcSQd2ZCtlSdbyRxIa2Q4ytuKL0h7AHtZCoFs80TpladRIE2aOmwDrfaWGA3HGguj7MjWmzHXEPPtn2ZA96PidmWYZBNmcBzsn1ANnWZA82p317GFVRhGqQMNRMWM8BzSwAMRrqPG3QZDZD') {
		res.status(200).send(req.query['hub.challenge']);
	}
	console.error('verification failed. Token mismatch.');
	res.sendStatus(403);
});
 
app.post('/msgbot/', function(req, res) {
    var messaging_events = req.body.entry[0].messaging;
    for (var i = 0; i < messaging_events.length; i++) {
        var event = req.body.entry[0].messaging[i];
        var sender = event.sender.id;
        if (event.message && event.message.text) {
            var text = event.message.text;
            sendTextMessage(sender, text + "!");
        }
    }
    res.sendStatus(200);
});

  const token = "EAAPTsUnoxzQBANSgosW7FhNPkEKlFsZA2VcSQd2ZCtlSdbyRxIa2Q4ytuKL0h7AHtZCoFs80TpladRIE2aOmwDrfaWGA3HGguj7MjWmzHXEPPtn2ZA96PidmWYZBNmcBzsn1ANnWZA82p317GFVRhGqQMNRMWM8BzSwAMRrqPG3QZDZD";
  
function sendTextMessage(sender, text) {
   var messageData = {
       text: text
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
           message: messageData,
       }
   }, function(error, response, body) {
       if (error) {
           console.log('Error:', error);
       } else if (response.body.error) {
           console.log('Error: ', response.body.error);
       }
   });
}
  
app.listen(app.get('port'), function() {
  const url = 'http://localhost:' + app.set('port');
  console.log('Application running on port: ', app.get('port'));

});