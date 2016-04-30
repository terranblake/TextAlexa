var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var bcrypt = require('bcrypt-nodejs');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({
    message: "Text Alexa API"
  });
});

/* POST register user */
router.post('/register', function(req, res, next) {
  if(isValidRegisterJson(req.query)) {
    var db = new sqlite3.Database('database.sqlite');
    db.run("INSERT INTO person (email, password, name) VALUES ($email,$password,$name)", {
          $email: req.query.email,
          $password: bcrypt.hashSync(req.query.password),
          $name: req.query.name
    });
    db.close();
    res.send({
      message: "Success"
    })
  } else {
    res.status(500).send({
      error: "Missing url parameters."
    });
  }
});

/* POST login user */
router.post('/login', function(req, res, next) {
  var email = req.query.email;
  var password = req.query.password;

  var db = new sqlite3.Database('database.sqlite');
  console.log(email);
  db.all("SELECT * FROM person WHERE email='" + email + "'", function(err,rows){
    if(!rows) {
      res.status(500).send({
        error: "No user found with the provided credentials"
      });
    } else {
      if(bcrypt.compareSync(password, rows[0].password)) {
        delete rows[0].password;
        res.send(rows[0]);
      } else {
        res.status(500).send({
          error: "No user found with the provided credentials"
        });
      }
    }
  });
});

function isValidRegisterJson(params) {
  if(!params.email)
    return false;

  if(!params.password || params.password.length < 5)
    return false;

  if(!params.name ||  params.name.length < 5)
    return false;

  return true;
}

module.exports = router;
