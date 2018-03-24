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

exports.createCoupon = (req, res) => {
  const { pic_list, title, sub_title, location, address_detail, tel, work_time, coupon_title, closed, longitude, latitude } = req.body;

  let pic_input = (result, pic, index) => {
    return new Promise((resolve, reject) => {
      // const d = new Date();
      // d.setUTCHours(d.getUTCHours() + 9);
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
      return res.status(200).json({
        picandtag_input(result, pic_list);
      })
    }
  )
}

// exports.createCoupon = (req, res) => {
//   const { title, sub_title, location, address_detail, tel, work_time, coupon_title, closed, longitude, latitude } = req.body;
//   conn.query(
//     'INSERT INTO Coupons(title, sub_title, location, address_detail, tel, work_time, coupon_title, closed, longitude, latitude) VALUES (?,?,?,?,?,?,?,?,?,?)',
//     [title, sub_title, location, address_detail, tel, work_time, coupon_title, closed, longitude, latitude],
//     (err, result) => {
//       if (err) throw err;
//       return res.status(200).json({
//         result
//       })
//     }
//   )
// }
