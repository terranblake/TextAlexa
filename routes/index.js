var express = require('express');
var guid = require('guid');
var sqlite3 = require('sqlite3');
var bcrypt = require('bcrypt-nodejs');
var twilio = require('twilio');
var client = new twilio.RestClient(process.env.TWILIO_SID, process.env.TWILIO_SECRET);

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({
    message: "Text Alexa API"
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Text Alexa - Login' });
});

router.get('/alexa', function(req, res, next) {
  console.log(req.query);

  client.messages.create({
      to:'+17857600631',
      from:'+19138004576',
      body:'This is my first twilio message.'
  }, function(error, message) {
      if (error) {
        res.status(500).send(error);
      } else {
        res.send(message);
      }
  });
});

router.post('/login', function(req, res, next) {
  var amazonUrl = "http://localhost:3000/";
  var access_token = guid.raw();

  var email = req.body.email;
  var password = req.body.password;

  if(!email || !password) {
    res.render('login', { title: 'Text Alexa - Login', error: 'Missing email or password.' });
    return next();
  }

  var db = new sqlite3.Database('database.sqlite');
  db.all("SELECT * FROM person WHERE email='" + email + "'", function(err,rows){
    if(!rows) {
      res.render('login', { title: 'Text Alexa - Login', error: "No user found with the provided credentials" });
    } else {
      if(bcrypt.compareSync(password, rows[0].password)) {

        db.run("UPDATE person SET alexa_token = $token WHERE id=$id;", {
          $token: access_token,
          $id: rows[0].id
        });

	      var redirectUrl = 'https://pitangui.amazon.com/spa/skill/account-linking-status.html?vendorId=MRTK7KNRCP2HQ#state='+req.query.state
        + "&access_token=" + access_token + "&token_type=Bearer";
	      res.redirect(redirectUrl);
      } else {
        res.render('login', { title: 'Text Alexa - Login', error: "No user found with the provided credentials" });
      }
    }
  });
});

module.exports = router;
