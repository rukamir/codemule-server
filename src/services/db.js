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
    return query('SELECT count(distinct title), title FROM voucher '
    + 'WHERE sent IS NULL AND owner_id = ? GROUP BY title', [userId]);
  },
  getAllUnvouchedCodes(userId) {
    return query('SELECT * FROM voucher WHERE owner_id = ? AND sent IS NULL', [userId]);
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
    return query(`INSERT INTO voucher (owner_id, code, title, description, unique, added) '
    + 'VALUES (?, ?, ?, ?, ?, CUR_DATE())`,
    [userId, code, title, desc, unique]);
  },
  updateCodeToPending(userId, codeId) {
    return query(`UPDATE voucher SET status='pend' WHERE owner_id = ? AND id = ?`, 
    [userId, codeId]);
  },
};