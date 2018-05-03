const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);
const AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
const s3 = new AWS.S3();

exports.uploadTint = (req, res) => {
    const d = new Date();
    d.setUTCHours(d.getUTCHours());
	const { title, content, video_id, category, pic_list } = req.body;
	if (category == 2) {
        conn.query(
            'INSERT INTO Tints(title, content, video_id, user_id, like_cnt, category, created_at) VALUES(?, ?, ?, ? ,? ,?, ?)',
            [title, content, video_id, req.decoded._id, 0, category, d],
            (err, result) => {
                if (err) throw err;
                return res.status(200).json({
                    message: 'done'
                })
            }
        )
    } else {
        const d = new Date();
        d.setUTCHours(d.getUTCHours());

        let pic_input = (result, pic) => {
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
                        conn.query('INSERT INTO Tint_Images(tint_id, pic_url) VALUES(?, ?)', [result.insertId, picUrl], (err) => {
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
            'INSERT INTO Tints(title, content, video_id, user_id, like_cnt, category, created_at) VALUES(?, ?, ?, ? ,? ,?, ?)',
            [title, content, video_id, req.decoded._id, 0, category, d],
            (err, result) => {
                if (err) throw err;
                picandtag_input(result, pic_list);
            }
        )
    }


}

exports.getTintList = (req, res) => {
	if (req.query.category == 0) {
		conn.query(
			'SELECT Tints.title, Tints.content, Tints.video_id, Users.id, Users.username, Tints.like_cnt, Tints.created_at FROM Tints JOIN Users on Tints.user_id = Users.id',
			(err, result) => {
				if (err) throw err;
				return res.status(200).json({
					result
				})
			}
		)
	} else {
		conn.query(
			'SELECT Tints.title, Tints.content, Tints.video_id, Users.id, Users.username, Tints.like_cnt FROM Tints JOIN Users on Tints.user_id = Users.id WHERE Tints.category = ?',
			[req.query.category],
			(err, result) => {
				if (err) throw err;
				return res.status(200).json({
					result
				})
			}
		)
	}
}