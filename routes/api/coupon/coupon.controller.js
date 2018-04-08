const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);
const AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
const s3 = new AWS.S3();
const crypto = require("crypto");


function toRad(value) {
  return value * Math.PI / 180;
}
function calculateDist(lat1, lng1, lat2, lng2) {
  let R = 6371;
  let dLat = toRad(lat2 - lat1);
  let dLng = toRad(lng2 - lng1);
  let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2))
    * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c;
  return d;
}


exports.getCouponList = (req, res) => {
  const { lng, lat } = req.query;
  conn.query(
    'SELECT * FROM Coupons',
    (err, result) => {
      if(err) throw err;
      result.sort(function (a, b) { // 오름차순
        a_dis = calculateDist(lng, lat, a["longitude"], a["latitude"]);
        b_dis = calculateDist(lng, lat, b["longitude"], b["latitude"]);
        return a_dis < b_dis ? -1 : a_dis > b_dis ? 1 : 0;
      });
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
    'SELECT * FROM Reviews WHERE coupon_id = ? and user_id = ?',
    [coupon_id, req.decoded._id],
    (err, result) => {
      if (err) throw err;
      if (result.length == 0) {
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
      } else {
        return res.status(406).json({
          message: "You already wrote a review"
        })
      }
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

