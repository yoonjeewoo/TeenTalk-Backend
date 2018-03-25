const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

exports.getSchoolList = (req, res) => {
  conn.query(
    'SELECT * FROM Schools',
    (err, result) => {
      if (err) throw err;
      return res.status(200).json({
        schools: result
      })
    }
  )
}