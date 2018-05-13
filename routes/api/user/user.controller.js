const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);
const crypto = require('crypto');

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
};

exports.getMyPosts = (req, res) => {
  conn.query(
    'SELECT count(*) as cnt from Posts where user_id = ?',
    [req.decoded._id],
    (err, result) => {
      if (err) throw err;
      return res.status(200).json({
        result
      })
    }
  )
};

exports.getMyLikes = (req, res) => {
  conn.query(
    'SELECT sum(like_cnt) as cnt from Posts where user_id = ?',
    [req.decoded._id],
    (err, result) => {
      if (err) throw err;
      return res.status(200).json({
        result
      })
    }
  )
};

exports.getMyReviews = (req, res) => {
  conn.query(
    'SELECT count(*) as cnt from Comments where user_id = ?',
    [req.decoded._id],
    (err, result) => {
      if (err) throw err;
      return res.status(200).json({
        result
      })
    }
  )
};

exports.getMyCommentCount = (req, res) => {
  conn.query(
    'SELECT count(*) as count FROM Comments WHERE user_id = ?',
    [req.decoded._id],
    (err, result) => {
      if (err) throw err;
      return res.status(200).json({
        result
      })
    }
  )
};

exports.updateMyInfo = (req, res) => {
  const { username, password, birth } = req.body;
  const encrypted = crypto.createHmac('sha1', config.secret)
    .update(password)
    .digest('base64');
  conn.query(
    "UPDATE Users SET username = ?, password = ?, birth = ? WHERE id = ?",
    [username, encrypted, birth, req.decoded._id],
    (err, result) => {
      if (err) throw err;
      return res.status(200).json({
        message: 'successfully updated private information'
      })
    }
  )
}

exports.updateMySchoolInfo = (req, res) => {
  const { school_id, class_, class_num } = req.body;
  conn.query(
    "UPDATE Users SET school_id = ?, class = ?, class_num = ? WHERE id = ?",
    [school_id, class_, class_num, req.decoded._id],
    (err, result) => {
      if (err) throw err;
      return res.status(200).json({
        message: 'successfully updated school information'
      })
    }
  )
}