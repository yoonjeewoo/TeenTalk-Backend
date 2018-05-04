const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);
const crypto = require("crypto");
const AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
const s3 = new AWS.S3();

exports.homeSlideImage = (req, res) => {
  const { pic_list } = req.body;

  let pic_input = (pic) => {
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
          conn.query('INSERT INTO Home_Images(img_url) VALUES(?)', [picUrl], (err) => {
            if (err) reject(err);
            resolve();
          })
        }
      });
    })
  }

  async function picandtag_input(pic_list) {
    pic_list.forEach(async (pic) => {
      await pic_input(pic);
    });
    return res.status(200).json({
      // item_id: result.insertId
      message: 'done'
    })
  }
  picandtag_input(pic_list);
}
