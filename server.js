const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const request = require('request');
EAAPTsUnoxzQBANSgosW7FhNPkEKlFsZA2VcSQd2ZCtlSdbyRxIa2Q4ytuKL0h7AHtZCoFs80TpladRIE2aOmwDrfaWGA3HGguj7MjWmzHXEPPtn2ZA96PidmWYZBNmcBzsn1ANnWZA82p317GFVRhGqQMNRMWM8BzSwAMRrqPG3QZDZD
const app = express();// app configuration


app.set('port', (process.env.PORT || 8000));// 
app.use(morgan('dev')); // log every request to the console.


app.use(bodyParser.urlencoded({ extended:false }));
app.use(bodyParser.json());

// app routes
require('./routes/webhook_verify')(app);

app.get('/msgbot/', function (req, res) {
	if (req.query['hub.verify_token'] === 'THIS_IS_MY_VERIFICATION_TOKEN') {
		res.status(200).send(req.query['hub.challenge']);
	}
	console.error('verification failed. Token mismatch.');
	res.sendStatus(403);
});
 
app.post('/msgbot/', function(req, res) {
    //checking for page subscription.
    if (req.body.object === 'page'){
       
       /* Iterate over each entry, there can be multiple entries 
       if callbacks are batched. */       req.body.entry.forEach(function(entry) {
       // Iterate over each messaging event
          entry.messaging.forEach(function(event) {
          console.log(event);
          if (event.postback){
             processPostback(event);
          } else if (event.message){
             processMessage(event);
          }
      });
    });
    res.sendStatus(200);
   }
  });

app.listen(app.get('port'), function() {
  const url = 'http://localhost:' + app.set('port');
  console.log('Application running on port: ', app.get('port'));

});