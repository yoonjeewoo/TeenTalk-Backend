const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

exports.getCouponList = (req, res) => {
  conn.query(
    'SELECT * FROM Coupons',
    (err, result) => {
      if(err) throw err;
      return res.status(200).json({
        result
      })
    }
  )
}

exports.getCouponImageList = (req, res) => {
  const { coupon_id } = req.params;
  conn.query(
    'SELECT * FROM Images WHERE coupon_id = ?',
    [coupon_id],
    (err, result) => {
      if (err) throw err;
      return res.status(200).json({
        result
      })
    }
  )
}

exports.getCouponReviewList = (req, res) => {
  const { coupon_id } = req.params;
  conn.query(
    'SELECT * FROM Reviews JOIN Users WHERE coupon_id = ? AND Users.id = Reviews.user_id',
    [coupon_id],
    (err, result) => {
      if (err) throw err;
      return res.status(200).json({
        result
      })
    }
  )
}
