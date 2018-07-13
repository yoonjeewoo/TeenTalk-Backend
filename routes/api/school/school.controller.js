const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);
const lineReader = require('line-reader');
const AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
const s3 = new AWS.S3();
const crypto = require("crypto");

exports.school = (req, res) => {
    // lineReader.eachLine('school_list.txt', function(line, last) {
    // 	console.log(line);
    // 	let row = line.split(' ');
    //   	conn.query(
    // 	  'INSERT INTO Schools(school_name, school_type) VALUES(?, ?)',
    // 	  [row[0], row[1]],
    // 	  (err, result) => {
    // 		  if (err) throw err;
    // 	  }
    //  	)
    //   if(last){
    //     // or check if it's the last one
    // 	return res.status(200).json({
    // 		message: 'input school_list done'
    // 	})
    //   }
    // });
    return res.status(200).json({
        message: req.decoded._id
    })
}

exports.writePost = (req, res) => {
    const {
        pic_list,
        content
    } = req.body;
    console.log(pic_list);
    const d = new Date();
    d.setUTCHours(d.getUTCHours());

    let pic_input = (result, pic, index) => {
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
                    conn.query('INSERT INTO Post_Images(post_id, img_url) VALUES(?, ?)', [result.insertId, picUrl], (err) => {
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
        'INSERT INTO Posts(content, school_id, user_id, created_at) VALUES (?, ?, ?, ?)', [content, req.decoded.school_id, req.decoded._id, d],
        (err, result) => {
            if (err) throw err;
            picandtag_input(result, pic_list);
        }
    )
}

exports.getBoard = (req, res) => {
    const {
        class_,
        index
    } = req.query;
    sql = 'SELECT Posts.id, content, username, like_cnt, created_at FROM Posts, Users WHERE Posts.school_id = ? and Posts.user_id = Users.id and class=? ';
    if (class_ == 0) {
        sql = 'SELECT Posts.id, content, username, like_cnt, created_at FROM Posts, Users WHERE Posts.school_id = ? and Posts.user_id = Users.id '
    }
    conn.query(
        sql + `ORDER BY created_at DESC LIMIT 20 OFFSET ${index}`, [req.decoded.school_id, class_],
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                nextIndex: parseInt(index) + result.length,
                result
            })
        }
    );
};

exports.getBoardAll = (req, res) => {
    const {
        index
    } = req.query;
    sql = 'SELECT Posts.id, content, username, like_cnt, created_at FROM Posts ';
    if (class_ == 0) {
        sql = 'SELECT Posts.id, content, username, like_cnt, created_at FROM Posts, Users WHERE Posts.school_id = ? and Posts.user_id = Users.id '
    }
    conn.query(
        sql + `ORDER BY created_at DESC LIMIT 20 OFFSET ${index}`,
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                nextIndex: parseInt(index) + result.length,
                result
            })
        }
    );
};

exports.getPostPicture = (req, res) => {
    const {
        post_id
    } = req.params;
    conn.query(
        'SELECT * FROM Post_Images WHERE post_id = ?', [post_id],
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                result
            })
        }
    )
}

exports.getPost = (req, res) => {
    conn.query(
        'SELECT * FROM Posts WHERE school_id = ? and id = ?', [req.decoded.school_id, req.params.post_id],
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                result
            })
        }
    )
}

exports.createComment = (req, res) => {
    const {
        post_id,
        content
    } = req.body;
    const d = new Date();
    d.setUTCHours(d.getUTCHours());
    conn.query(
        'INSERT INTO Comments(content, school_id, user_id, post_id, created_at) VALUES(?, ?, ?, ?, ?)', [content, req.decoded.school_id, req.decoded._id, post_id, d],
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                result
            })
        }
    )
}

exports.getCommentList = (req, res) => {
    const {
        post_id
    } = req.params;
    conn.query(
        'SELECT Comments.id, content, Comments.user_id, Comments.school_id, username, created_at FROM Comments join Users on Comments.user_id = Users.id WHERE Comments.post_id = ?', [post_id],
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                result
            })
        }
    )
}

exports.likePost = (req, res) => {
    const {
        post_id
    } = req.params;
    conn.query(
        'SELECT * FROM Likes WHERE post_id = ? and user_id = ?', [post_id, req.decoded._id],
        (err, result) => {
            if (err) throw err;
            if (result.length == 0) {
                conn.query(
                    'UPDATE Posts SET like_cnt = like_cnt+1 WHERE id = ?', [post_id],
                    (err, result) => {
                        if (err) throw err;
                        conn.query(
                            'INSERT INTO Likes(user_id, post_id) VALUES(?, ?)', [req.decoded._id, post_id],
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

exports.deleteLike = (req, res) => {
    const {
        post_id
    } = req.params;
    conn.query(
        'SELECT * FROM Likes WHERE post_id = ? and user_id = ?', [post_id, req.decoded._id],
        (err, result) => {
            if (err) throw err;
            if (result.length == 0) {
                return res.status(406).json({
                    message: 'this user did not like this post'
                })
            } else {
                conn.query(
                    'DELETE FROM Likes WHERE post_id = ? and user_id = ?', [post_id, req.decoded._id],
                    (err, result) => {
                        if (err) throw err;
                        conn.query(
                            'UPDATE Posts SET like_cnt = like_cnt-1 WHERE id = ?', [post_id],
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

exports.likePostCheck = (req, res) => {
    const {
        post_id
    } = req.params;
    conn.query(
        'SELECT * FROM Likes WHERE post_id = ? and user_id = ?', [post_id, req.decoded._id],
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

exports.updateComment = (req, res) => {
    const {
        comment_id
    } = req.params;
    const {
        content
    } = req.body;
    conn.query(
        'UPDATE Comments SET content = ? WHERE id = ?', [content, comment_id],
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                message: 'successfully updated comment'
            })
        }
    )
}

exports.deleteComment = (req, res) => {
    const {
        comment_id
    } = req.params;
    conn.query(
        'DELETE from Comments WHERE id = ?', [comment_id],
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                message: 'successfully deleted comment'
            })
        }
    )
}

exports.postSearch = (req, res) => {
    const {
        q
    } = req.params;
    conn.query(
        `SELECT * FROM Posts WHERE content like '%${q}%' and school_id = ?`, [req.decoded.school_id],
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                result
            })
        }
    )
};

exports.getSchoolCheck = (req, res) => {
    const {
        class_,
        class_num
    } = req.query;
    conn.query(
        'SELECT * FROM Users WHERE school_id = ? and class = ? and class_num = ?', [req.decoded.school_id, class_, class_num],
        (err, result) => {
            if (err) throw err;
            return res.status(200).json({
                member_cnt: result.length
            })
        }
    );
};