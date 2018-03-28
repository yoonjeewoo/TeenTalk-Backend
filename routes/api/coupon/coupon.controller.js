const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);
const AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
const s3 = new AWS.S3();
const crypto = require("crypto");

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

exports.createCouponReview = (req, res) => {
  const { coupon_id } = req.params;
  const { contents, score } = req.body;
  const d = new Date();
  d.setUTCHours(d.getUTCHours() + 9);
  conn.query(
    'INSERT INTO Reviews(user_id, coupon_id, contents, written_at, score) VALUES(?, ?, ?, ?, ?)',
    [req.decoded._id, coupon_id, contents, d, score],
    (err, result) => {
      if (err) throw err;
      return res.status(200).json({
        result
      })
    }
  )
}

exports.deleteCouponReview = (req, res) => {
  const { coupon_id } = req.params;
  conn.query(
    'DELETE from Reviews WHERE coupon_id = ?',
    [coupon_id],
    (err, result) => {
      if (err) throw err;
      return res.status(200).json({
        message: 'successfully deleted review'
      })
    }
  )
}

exports.getCouponByType = (req, res) => {
  const { type } = req.params;
  conn.query(
    'SELECT * FROM Coupons WHERE type = ?',
    [type],
    (err, result) => {
      if (err) throw err;
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

exports.createCoupon = (req, res) => {
  const { pic_list, title, sub_title, location, address_detail, tel, work_time, coupon_title, closed, longitude, latitude } = req.body;

  let pic_input = (result, pic, index) => {
    return new Promise((resolve, reject) => {
      const d = new Date();
      d.setUTCHours(d.getUTCHours() + 9);
      const picKey = d.getFullYear() + '_'
        + d.getMonth() + '_'
        + d.getDate() + '_'
        + crypto.randomBytes(20).toString('hex') +
        + req.decoded._id + '.jpg';
      const picUrl = `https://s3.ap-northeast-2.amazonaws.com/teentalkimage/${picKey}`;
      let buf = new Buffer(pic.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      s3.putObject({
        Bucket: 'teentalkimage',
        Key: picKey,
        Body: buf,
        ACL: 'public-read'
      }, function (err, response) {
        if (err) {
          if (err) reject(err);
        } else {
          // console.log(response)
          conn.query('INSERT INTO Images(coupon_id, img_url) VALUES(?, ?)', [result.insertId, picUrl], (err) => {
            if (err) reject(err);
            resolve();
          })
        }
      });
    })
  }

  async function picandtag_input(result, pic_list) {
    pic_list.forEach(async (pic, index) => {
      await pic_input(result, pic, index);
    });
    return res.status(200).json({
      item_id: result.insertId
    })
  }

  conn.query(
    'INSERT INTO Coupons(title, sub_title, location, address_detail, tel, work_time, coupon_title, closed, longitude, latitude) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [title, sub_title, location, address_detail, tel, work_time, coupon_title, closed, longitude, latitude],
    (err, result) => {
      if (err) throw err;
      picandtag_input(result, pic_list);
    }
  )
}

exports.couponSearch = (req, res) => {
  const { q } = req.params;
  conn.query(
    `SELECT * FROM Coupons WHERE title like '%${q}%' or sub_title like '%${q}%' or location like '%${q}%'`,
    (err, result) => {
      if (err) throw err;
      return res.status(200).json({
        result
      })
    }
  )
}

