var mysql = require('mysql');

const SQL_ADDRESS = process.env.SQL_ADDRESS;
const SQL_USER = process.env.SQL_USER;
const SQL_PASS = process.env.SQL_PASS;
const SQL_DB_NAME = process.env.SQL_DB_NAME;

var connection = mysql.createPool({
  connectionLimit : 5,
  host     : SQL_ADDRESS,
  user     : SQL_USER,
  password : SQL_PASS,
  database : SQL_DB_NAME
});


var query = function( sql, args ) {
  return new Promise( ( resolve, reject ) => {
      connection.query( sql, args, ( err, rows ) => {
          if ( err ) {
            console.log(err);
            return reject( err );
          } 
          resolve( rows );
      } );
  } );
};

module.exports = {
  getAllCodes(userId) {
    return query('SELECT * FROM `voucher` WHERE `owner_id` = ?', [userId]);
  },
  getUnvouchedCodes(userId) {
    return query('SELECT * FROM voucher '
    + 'WHERE sent IS NULL AND owner_id = ?', [userId]);
  },
  getAllUniqueUnvouchedCodesWithCounts(userId) {
    return query('SELECT count(title) as `count`, title FROM voucher '
    + 'WHERE sent IS NULL AND `status` IS NULL AND owner_id = ? GROUP BY title', [userId]);
  },
  getAllUniqueUnvouchedCodes(userId) {
    return query('SELECT title FROM voucher '
    + 'WHERE sent IS NULL AND `status` IS NULL AND owner_id = ? GROUP BY title', [userId]);
  },
  getAllUnvouchedCodes(userId) {
    return query('SELECT * FROM voucher WHERE owner_id = ? AND `sent` IS NULL AND `status` IS NULL', [userId]);
  },
  getSingleUnvouchedByTitle(userId, title) {
    return query('SELECT * FROM `voucher` WHERE `owner_id` = ? AND `title` = ? AND `sent` IS NULL AND `status` IS NULL LIMIT 1', 
    [userId,
     title]);
  },
  getSingleCode(userId, codeId) {
    return query('SELECT * FROM `voucher` WHERE `id` = ? AND `owner_id` = ?', 
    [codeId, userId]);
  },
  insertNewListOfCodes(codeList) {
    return query('INSERT INTO `voucher` ' + 
    '(`owner_id`, `code`, `title`, `description`, `unique`, `added`) ' +
    'VALUES ?', 
    [codeList]);
  },
  insertNewSingleCode(userId, code, title, desc, unique) {
    return query('INSERT INTO `voucher` (`owner_id`, `code`, `title`, `description`, `unique`, `added`) '
    + 'VALUES (?, ?, ?, ?, ?, CURDATE())',
    [userId, code, title, desc, unique]);
  },
  updateCodeToPending(userId, codeId, recipient) {
    return query('UPDATE `voucher` SET `status` = "pend", `recipient` = ?, `sent` = CURDATE() WHERE `owner_id` = ? AND `id` = ? AND `status` IS NULL', 
    [recipient, userId, codeId]);
  },
  updateCode(code, title, description, sent, recipient, unique, 
    status, expiration, filename, voucherId, ownerId) {
    return query('UPDATE `voucher` SET ' +
      '`code` = ?, ' +
      '`title` = ?, ' +
      '`description` = ?, ' +
      '`sent` = ?, ' +
      '`recipient` = ?, ' +
      '`unique` = ?, ' +
      '`status` = ?, ' +
      '`expiration` = ?, ' +
      '`filename` = ? ' +
      'WHERE `id` = ? AND `owner_id` = ?'
  ,[code, title, description, sent, recipient, unique, 
    status, expiration, filename, voucherId, ownerId]);
  },
};