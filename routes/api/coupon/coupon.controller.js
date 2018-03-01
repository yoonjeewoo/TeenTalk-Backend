const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

exports.getCouponList = (req, res) => {
  conn.query(
    'select * from Coupons',
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
    'select * from Images where coupon_id = ?',
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
    'select * from Reviews join Users where coupon_id = ? and Users.id = Reviews.user_id',
    [coupon_id],
    (err, result) => {
      if (err) throw err;
      return res.status(200).json({
        result
      })
    }
  )
}
