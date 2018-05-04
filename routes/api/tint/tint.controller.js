const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);
const AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
const s3 = new AWS.S3();

const crypto = require("crypto");
exports.uploadTint = (req, res) => {
    const d = new Date();
    d.setUTCHours(d.getUTCHours() + 9);
    const {
        title,
        content,
        video_id,
        category,
        pic_list
    } = req.body;
    if (category == 2 || category == 1) {
        conn.query(
            'INSERT INTO Tints(title, content, video_id, user_id, like_cnt, category, created_at) VALUES(?, ?, ?, ? ,? ,?, ?)', [title, content, video_id, req.decoded._id, 0, category, d],
            (err, result) => {
                if (err) throw err;
                return res.status(200).json({
                    message: 'done'
                })
            }
        )
    } else {
        const d = new Date();
        d.setUTCHours(d.getUTCHours() + 9);

        let pic_input = (result, pic) => {
            return new Promise((resolve, reject) => {
                const d = new Date();
                d.setUTCHours(d.getUTCHours() + 9);
                const picKey = d.getFullYear() + '_' +
                    d.getMonth() + '_' +
                    d.getDate() + '_' +
                    crypto.randomBytes(20).toString('hex') +
                    +req.decoded._id + '.jpg';
                const picUrl = `https://s3.ap-northeast-2.amazonaws.com/teentalkimage/${picKey}`;
                let buf = new Buffer(pic.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                s3.putObject({
                    Bucket: 'teentalkimage',
                    Key: picKey,
                    Body: buf,
                    ACL: 'public-read'
                }, function(err, response) {
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
            pic_list.forEach(async(pic, index) => {
                await pic_input(result, pic, index);
            });
            return res.status(200).json({
                item_id: result.insertId
            })
        }
        conn.query(
            'INSERT INTO Tints(title, content, video_id, user_id, like_cnt, category, created_at) VALUES(?, ?, ?, ? ,? ,?, ?)', [title, content, video_id, req.decoded._id, 0, category, d],
            (err, result) => {
                if (err) throw err;
                picandtag_input(result, pic_list);
            }
        )
    }
}

exports.getTintList = (req, res) => {
    if (req.query.category == 2 || req.query.category == 1) {
        conn.query(
            'SELECT Tints.id, Tints.title, Tints.content, Tints.video_id, Tints.like_cnt, Tints.create_at FROM Tints WHERE Tints.category = ?', [req.query.category],
            (err, result) => {
                if (err) throw err;
                return res.status(200).json({
                    result
                })
            }
        )
    } else {
        conn.query(
            'SELECT * FROM Tints WHERE category = 3',
            (err, result) => {
                if (err) throw err;
                return res.status(200).json({
                    result
                })
            }
        )
    }
}

exports.getTintImage = (req, res) => {
    conn.query(
        'SELECT * FROM Tint_Images WHERE tint_id=?', [req.query.tint_id],
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                result
            })
        }
    )
}

exports.likeTint = (req, res) => {
    const {
        tint_id
    } = req.params;
    conn.query(
        'SELECT * FROM Tint_Likes WHERE tint_id = ? and user_id = ?', [tint_id, req.decoded._id],
        (err, result) => {
            if (err) throw err;
            if (result.length == 0) {
                conn.query(
                    'UPDATE Tints SET like_cnt = like_cnt+1 WHERE id = ?', [tint_id],
                    (err, result) => {
                        if (err) throw err;
                        conn.query(
                            'INSERT INTO Tint_Likes(user_id, tint_id) VALUES(?, ?)', [req.decoded._id, tint_id],
                            (err, result) => {
                                if (err) throw err;
                                return res.status(200).json({
                                    message: 'successfully liked post'
                                })
                            }
                        )
                    }
                )
            } else {
                return res.status(406).json({
                    message: 'this user already liked this post'
                })
            }
        }
    )
}

exports.unlikeTint = (req, res) => {
    const {
        tint_id
    } = req.params;
    conn.query(
        'SELECT * FROM Tint_Likes WHERE tint_id = ? and user_id = ?', [tint_id, req.decoded._id],
        (err, result) => {
            if (err) throw err;
            if (result.length == 0) {
                return res.status(406).json({
                    message: 'this user did not like this post'
                })
            } else {
                conn.query(
                    'DELETE FROM Tint_Likes WHERE tint_id = ? and user_id = ?', [tint_id, req.decoded._id],
                    (err, result) => {
                        if (err) throw err;
                        conn.query(
                            'UPDATE Posts SET like_cnt = like_cnt-1 WHERE id = ?', [tint_id],
                            (err, result) => {
                                if (err) throw err;
                                return res.status(200).json({
                                    message: 'successfully unliked post'
                                })
                            }
                        )
                    }
                )
            }
        }
    )
}

exports.likeCheck = (req, res) => {
    const {
        tint_id
    } = req.params;
    conn.query(
        'SELECT * FROM Tint_Likes WHERE tint_id = ? and user_id = ?', [tint_id, req.decoded._id],
        (err, result) => {
            if (err) throw err;
            if (result.length == 0) {
                return res.status(200).json({
                    message: 'okay'
                });
            } else {
                return res.status(406).json({
                    message: 'this user already liked this post'
                });
            }
        }
    )
}