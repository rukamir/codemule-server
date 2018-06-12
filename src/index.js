var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var db = require('./services/db');
var jwt = require('./services/jwt');
var storage = require('./services/storage');
var authCheck = require('./services/jwt').authCheck;
var decoder = require('./services/jwt').jwtdecoder;

const app = express();
var corsOptions = {
  origin: 'http://example.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors());

app.use(bodyParser.json()); // for parsing application/json


app.get('/user/:userId', authCheck, (req, res) => {
  res.status(200).send(`retrieved to user ${req.params.userId}`)
  db.getAllCodes(1);
}).post((req, res) => 
  res.status(200).send(`posted to user ${req.params.userId}`)
);


app.route('/codes')
  .get((req, res) => {
    console.log(req.get('Authorization'));
    var userid = decoder(req.get('Authorization')).userid

    db.getAllCodes(userid)
    .then((row) => {
      var allEntries = row.map((item) => {
        delete item.obj_key;
        return item;
      });
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
        res.status(201).send();
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  });


app.post('/code', (req, res) => {
  // Takes a single code with a base64 encoded image
  console.log(JSON.stringify(req.body));
  res.send(JSON.stringify(req.body));
});


app.get('/code/:title/single', (req, res) => {
  var userid = decoder(req.get('Authorization')).userid

  db.getSingleUnvouchedByTitle(userid, req.params.title)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});


app.get('/codes/unique', (req, res) => {
  var userid = decoder(req.get('Authorization')).userid
  db.getAllUniqueUnvouchedCodesWithCounts(userid)
  .then((row) => {
    res.status(200).send(row);
  }).catch((err) => {
    console.log(err);
    res.status(500).send();
  });
});


app.get('/codes/unvouched', (req, res) => {
  var userid = decoder(req.get('Authorization')).userid

  db.getUnvouchedCodes(userid)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    })
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
        recipient:    row[0].recipient,
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


app.get('/code/:uid/image', (req, res) => {
  var userid = decoder(req.get('Authorization')).userid;
  db.getSingleCode(userid, req.params.uid)
    .then((row) => {
      var key = row[0].obj_key;
      if (key == '' || key == null) {
        res.status(404).send();
      } else {
        storage.getObject(row[0].obj_key)
          .then((obj) => {
            res.send(obj.Body);
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send();
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});


app.put('/send/:codeId', (req, res) => {
  var userid = decoder(req.get('Authorization')).userid;
  db.updateCodeToPending(userid, req.params.codeId, req.body.recipient)
  .then((row) => {
    if (row.changedRows == 1) {
      // send SNS
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

app.listen(3000, () => console.log('CodeMule listening on port 3000!'));