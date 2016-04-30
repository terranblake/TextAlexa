var express = require('express');
var guid = require('guid');
var sqlite3 = require('sqlite3');
var bcrypt = require('bcrypt-nodejs');
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
        /* TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO */
        //TODO: save access token into user DB
        /* TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO */
        res.redirect('/?state='+req.query.state + "&access_token=" + access_token);
      } else {
        res.render('login', { title: 'Text Alexa - Login', error: "No user found with the provided credentials" });
      }
    }
  });
});

module.exports = router;
