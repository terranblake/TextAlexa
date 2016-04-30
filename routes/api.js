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
  if(isValidRegisterJson(req.body)) {
    try {
      var db = new sqlite3.Database('database.sqlite');
      db.run("INSERT INTO person (email, password, name) VALUES ($email,$password,$name);", {
            $email: req.body.email,
            $password: bcrypt.hashSync(req.body.password),
            $name: req.body.name
      }, function(err) {
        console.log(err);
        if(err) {
          res.status(500).send(err);
          return;
        }

        db.all("SELECT * FROM person WHERE email='" + req.body.email + "';", function(err, rows) {
            if(!rows) {
              res.status(500).send({
                error: "Internal user error"
              });
            } else {
              delete rows[0].password;
              res.send(rows[0]);
            }
        });
      });
      db.close();
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    res.status(500).send({
      error: "Missing body parameters."
    });
  }
});

/* POST upload contacts */
router.post('/contacts', function(req, res, next) {
  if(isValidContactsJson(req.body)) {
    var db = new sqlite3.Database('database.sqlite');
    db.all("SELECT * FROM person WHERE email='" + req.body.email + "'", function(err,rows){
      if(!rows) {
        res.status(500).send({
          error: "No user found with the provided credentials"
        });
      } else {
        if(bcrypt.compareSync(req.body.password, rows[0].password)) {
          // todo insert contacts
          var userId = rows[0].id;
          db.serialize(function() {
            var stmt = db.prepare("INSERT INTO contacts (user_id, name, phone) VALUES (?,?,?);");
            req.body.contacts.forEach(function(contact) {
              if(contact.name && contact.phone) {
                stmt.run(userId, contact.name, contact.phone);
              }
            });
            stmt.finalize();
            res.send({
              message: req.body.contacts.length + " contacts added successfully"
            })
          });
        } else {
          res.status(500).send({
            error: "No user found with the provided credentials"
          });
        }
      }
    });
  }
});

function isValidContactsJson(params) {
  if(!params.email || !params.password || !params.contacts || params.contacts.length == 0) {
    return false;
  }

  return true;
}

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
        delete rows[0].password;np
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
