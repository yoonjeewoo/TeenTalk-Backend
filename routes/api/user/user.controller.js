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

exports.getMyPosts = (req, res) => {
  conn.query(
    'SELECT count(*) from Posts where user_id = ?',
    [req.decoded._id],
    (err, result) => {
      if (err) throw err;
      return res.status(200).json({
        result
      })
    }
  )
}

exports.getMyLikes = (req, res) => {
  conn.query(
    'SELECT sum(like_cnt) from Posts where user_id = ?',
    [req.decoded._id],
    (err, result) => {
      if (err) throw err;
      return res.status(200).json({
        result
      })
    }
  )
}

exports.getMyReviews = (req, res) => {
  conn.query(
    'SELECT count(*) from Comments where user_id = ?',
    [req.decoded._id],
    (err, result) => {
      if (err) throw err;
      return res.status(200).json({
        result
      })
    }
  )
}
