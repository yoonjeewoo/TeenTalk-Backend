const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

const crypto = require('crypto');

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

exports.updateMyPassword = (req, res) => {
    const { email, password } = req.body;
    const encrypted = crypto.createHmac('sha1', config.secret)
        .update(password)
        .digest('base64');
    conn.query(
        'UPDATE Users SET password = ? WHERE email = ?',
        [encrypted, email],
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                result
            })
        }
    )
};