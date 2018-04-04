var express = require('express');
var db = require('./services/db');

const app = express();

app.get('/:userId', (req, res) => {
  res.status(200).send(`retrieved to user ${req.params.userId}`)
  db.getAllCodes(1);
}).post((req, res) => 
  res.status(200).send(`posted to user ${req.params.userId}`)
);

app.get('/codes', (req, res) => {
  res.status(200).send(`get all codes of this users`);
}).post((req, res) => {
  res.status(200).send(`create a list of codes`);
});

app.get('/codes/unique', (req, res) => {
  res.status(200).send(`get list of all unique code unvouched titles and counts`);
});

app.get('/codes/unvouched', (req, res) => {
  res.status(200).send(`get list of all unvouched`);
});

app.get('/code/:uid', (req, res) => {
  res.status(200).send(`get single code`);
});

app.post('/send', (req, res) => {
  res.status(200).send(`send a list of codes to mq to be processed and marked as sent; this will mark as pending and to whom`);
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))