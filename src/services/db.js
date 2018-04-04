var mysql = require('mysql');

const SQL_ADDRESS = process.env.SQL_ADDRESS;
const SQL_USER = process.env.SQL_USER;
const SQL_PASS = process.env.SQL_PASS;
const SQL_DB_NAME = process.env.SQL_DB_NAME;

var connection = mysql.createConnection({
    host     : SQL_ADDRESS,
    user     : SQL_USER,
    password : SQL_PASS,
    database : SQL_DB_NAME
  });
connection.connect();

module.exports = {
  getAllCodes(userId) {
    // connection.query('SELECT * FROM user WHERE id = ?', [userId], function (error, results, fields) {
    connection.query('SELECT * FROM user', function (error, results, fields) {
            console.log(results);
            if (error) throw error;
      });
  },
  getUniqueUnvouchedCodes(userId) {
  },
  getAllUniqueUnvouchedCodesWithCounts(userId) {
  },
  getAllUnvouchedCodes(userId) {
  },
  getSingleCode(userId, codeId) {
  },
  createNewUser() {
  },
  createNewListOfCodes(userId, codeList) {
  },
  updateCodeToPending(userId, codeList) {
  },
};