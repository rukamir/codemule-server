var express = require('express');
var db = require('../../services/db');
var decoder = require('../../services/jwt').jwtdecoder;

var router = express.Router();

router
  .get('/user/:userId', (req, res) => {
    res.status(200).send(`retrieved to user ${req.params.userId}`)
    db.getAllCodes(1);
  })
  .post((req, res) => {
    res.status(200).send(`posted to user ${req.params.userId}`)
  });


module.exports = router;