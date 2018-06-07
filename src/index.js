var express = require('express');
var bodyParser = require('body-parser');
var db = require('./services/db');
var jwt = require('./services/jwt');
var authCheck = require('./services/jwt').authCheck;
var decoder = require('./services/jwt').jwtdecoder;

const app = express();
app.use(bodyParser.json()); // for parsing application/json

app.get('/user/:userId', authCheck, (req, res) => {
  res.status(200).send(`retrieved to user ${req.params.userId}`)
  db.getAllCodes(1);
}).post((req, res) => 
  res.status(200).send(`posted to user ${req.params.userId}`)
);


app.route('/codes')
  .get((req, res) => {
    var userid = decoder(req.get('Authorization')).userid

    db.getAllCodes(userid)
    .then((row) => {
      res.status(200).send(row);
    }).catch((err) => {
      res.status(500).send(err);
    });
  })
  .post((req, res) => {
    var userid = decoder(req.get('Authorization')).userid
    var badVouchers = req.body.filter( (voucher) => {
      if (!voucher.title) {
        return voucher;
      }
    });

    if (Array.isArray(badVouchers) && badVouchers.length) {
      res.status(400).send(badVouchers);
    }

    var newDbEntries = req.body.map((item) => {
      return [
        userid,
        item.code || '',
        item.title,
        item.description || '',
        item.unique,
        '2018-06-01'
      ];
    });

    db.insertNewListOfCodes(newDbEntries)
      .then((row) => {
        console.log(row);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
    res.status(201).send(newDbEntries);
  });


app.post('/code', (req, res) => {
  console.log(JSON.stringify(req.body));



  res.send(JSON.stringify(req.body));
});


app.get('/codes/unique', (req, res) => {
  // res.status(200).send(`get list of all unique code unvouched titles and counts`);
  var userid = decoder(req.get('Authorization')).userid
  db.getUniqueUnvouchedCodes(userid)
  .then((row) => {
    res.status(200).send(row);
  }).catch((err) => {
    res.status(500).send(err);
  });
});

app.get('/codes/unvouched', (req, res) => {
  res.status(200).send(`get list of all unvouched`);
});

app.get('/code/:uid', (req, res) => {
  var userid = decoder(req.get('Authorization')).userid

  db.getSingleCode(userid, req.params.uid)
    .then((row) => {
      let responseBody = {
        id:           row[0].id,
        code:         row[0].code,
        title:        row[0].title,
        description:  row[0].description,
        sent:         row[0].sent,
        recepient:    row[0].recepient,
        unique:       row[0].unique,
        status:       row[0].status,
        expiration:   row[0].expiration,
        added:        row[0].added,
        filename:     row[0].filename,
      };

      res.status(200).send(responseBody);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post('/send/:codeId', (req, res) => {
  // mark as pending and send SNS
  var userid = decoder(req.get('Authorization')).userid;
  db.updateCodeToPending(userid, req.params.codeId)
  .then((row) => {
    console.log(row);
    res.status(204).send(row);
  })
  .catch((err) => {
    res.status(500).send(err);
  });
});

app.get('/', (req, res) => {
  console.log(JSON.stringify(decoder(req.get('Authorization'))));
  db.getAllCodes()
  .then((row) => {
    res.status(200).send(row);
  }).catch((err) => {
    res.status(500).send('Error occured');
  });
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))