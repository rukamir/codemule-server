var express = require('express');
var db = require('./services/db');
var jwt = require('./services/jwt');
var authCheck = require('./services/jwt').authCheck;
var decoder = require('./services/jwt').jwtdecoder;

const app = express();

app.get('/user/:userId', authCheck, (req, res) => {
  res.status(200).send(`retrieved to user ${req.params.userId}`)
  db.getAllCodes(1);
}).post((req, res) => 
  res.status(200).send(`posted to user ${req.params.userId}`)
);

app.get('/codes', (req, res) => {
  var userid = decoder(req.get('Authorization')).userid
  // var codes = db.getAllCodes(userid);
  // res.status(200).send(codes);

  db.getAllCodes(userid)
  .then((row) => {
    res.status(200).send(row);
  }).catch((err) => {
    res.status(500).send(err);
  });
}).post((req, res) => {
  res.status(200).send(`create a list of codes`);
});

app.get('/codes/unique', (req, res) => {
  // res.status(200).send(`get list of all unique code unvouched titles and counts`);
  var userid = decoder(req.get('Authorization')).userid
  db.getUniqueUnvouchedCodes(userid)
  .then((row) => {
    res.status(200).send(row);
  }).catch((err) => {
    res.status(200).send(err);
  });
});

app.get('/codes/unvouched', (req, res) => {
  res.status(200).send(`get list of all unvouched`);
});

app.get('/code/:uid', (req, res) => {
  res.status(200).send(`get single code`);
});

app.post('/send/:codeId', (req, res) => {
  // mark as pending and send SNS
  var userid = decoder(req.get('Authorization')).userid
  db.updateCodeToPending(userid, req.params.codeId)
  .then((row) => {
    console.log(row);
    res.status(200).send(row);
  })
  .catch((err) => {
    console.log(err);
    res.status(200).send(err);
  });
});

app.get('/', (req, res) => {
  console.log(JSON.stringify(decoder(req.get('Authorization'))));
  db.getAllCodes(1)
  .then((row) => {
    res.status(200).send(row);
  }).catch((err) => {
    res.status(500).send(err);
  });
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))