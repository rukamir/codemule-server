var express = require('express');
var fs = require('fs');
var https = require('https');
var cors = require('cors');
var bodyParser = require('body-parser');
var db = require('./services/db');
var jwt = require('./services/jwt');
var storage = require('./services/storage');
var authCheck = require('./services/jwt').authCheck;
var decoder = require('./services/jwt').jwtdecoder;

var codesRouteV1 = require('./routes/v1/codes');
var userRouteV1 = require('./routes/v1/user');

var privateKey = fs.readFileSync('certs/selfsigned.key');
var certificate = fs.readFileSync('certs/selfsigned.crt');
var credentials = {key: privateKey, cert: certificate};

const app = express();
var corsOptions = {
  origin: 'http://example.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
// app.use(authCheck);

// routes
app.use('/v1', codesRouteV1);
app.use('/v1', userRouteV1);

app.put('/send/:codeId', (req, res) => {
  var userid = decoder(req.get('identity')).userid;
  db.updateCodeToPending(userid, req.params.codeId, req.body.recipient)
  .then((row) => {
    if (row.changedRows == 1) {
      // send SNS
      // UI will need to handle error from SNS
      res.status(204).send();
    } else {
      res.status(400).send(req.body);
    }
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send();
  });
});


app.get('/', (req, res) => {
  storage.getObject('macros0.jpg')
    .then((data) => {
      res.status(200).send(data.Body);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });

  // console.log(JSON.stringify(decoder(req.get('Authorization'))));
  // db.getAllCodes()
  // .then((row) => {
  //   res.status(200).send(row);
  // }).catch((err) => {
  //   res.status(500).send('Error occured');
  // });
});

// app.listen(3000, () => console.log('CodeMule listening on port 3000!'));
https.createServer(credentials, app).listen(3000);