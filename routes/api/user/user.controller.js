const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

exports.getMyAccountInfo = (req, res) => {
  conn.query(
    'SELECT * FROM Users WHERE id = ?',
    [req.decoded._id],
    (err, result) => {
      if(err) throw err;
      return res.status(200).json({
        result
      })
    }
  )
}
