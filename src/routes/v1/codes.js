var express = require('express');
var db = require('../../services/db');
var decoder = require('../../services/jwt').jwtdecoder;

var router = express.Router();

router.get('/jimmy', (req, res) => {
  res.status(420).send("you did it");
});

// Inventory screen
router.route('/codes')
  .get((req, res) => {
    var userid = decoder(req.get('identity')).userid
    var {
      count,
      page,
    } = req.query;
    count = parseInt(count) || 10;
    page = parseInt(page) || 1;
    const startIndex = (page - 1) * count;

    db.getAllCodes(userid, startIndex, count)
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
    var userid = decoder(req.get('identity')).userid

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

router.get('/codes/count', (req, res) => {
  var userid = decoder(req.get('identity')).userid

  db.getAllCodesCount(userid)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});


router.post('/code', (req, res) => {
  // Takes a single code with a base64 encoded image
  const userid = decoder(req.get('identity')).userid;
  const {
    title,
    code,
    description,
    unique,
    filename,
    expiration,
  } = req.body;

  db.insertNewSingleCode(userid, code, title, description, unique)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("error");
    });
});


router.get('/code/:title/single', (req, res) => {
  var userid = decoder(req.get('identity')).userid

  db.getSingleUnvouchedByTitle(userid, req.params.title)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});


// Send Page
router.get('/codes/unique', (req, res) => {
  var userid = decoder(req.get('identity')).userid;
  var {
    count,
    page,
  } = req.query;
  count = parseInt(count) || 10;
  page = parseInt(page) || 1;
  const startIndex = (page - 1) * count;

  db.getAllUniqueUnvouchedCodesWithCounts(userid, startIndex, count)
    .then((row) => {
      res.status(200).send(row);
    }).catch((err) => {
      //console.log(err);
      res.status(500).send();
    });
});

router.get('/codes/unique/count', (req, res) => {
  var userid = decoder(req.get('identity')).userid;

  db.getAllUniqueUnvouchedCount(userid)
    .then((row) => {
      console.log('b', row);
      res.status(200).send(row);
    })
    .catch((err) => {
      res.status(500).send();
    });
});

router.get('/codes/unvouched', (req, res) => {
  var userid = decoder(req.get('identity')).userid

  db.getUnvouchedCodes(userid)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    })
});


router.route('/code/:uid')
  .get((req, res) => {
    var userid = decoder(req.get('identity')).userid;

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
  })
  .put((req, res) => {
    var userid = decoder(req.get('identity')).userid;
    var voucherId = req.params.uid;

    var voucher = req.body;
    // if expiration is after today mark as expired
    // status not able to be set to pend
    // if image deleted clear filename
    db.updateCode(voucher.code, voucher.title, voucher.description, voucher.sent, 
      voucher.recipient, voucher.unique, voucher.status, voucher.expiration,
      voucher.filename, voucherId, userid)
      .then((row) => {
        if (row.affectedRows > 0) {
          res.status(201).send();
        } else {
          res.status(400).send();
        }
      })
      .catch((err) => {
        res.status(500).send();
      });
  });


router.get('/code/:uid/image', (req, res) => {
  var userid = decoder(req.get('identity')).userid;
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

module.exports = router;