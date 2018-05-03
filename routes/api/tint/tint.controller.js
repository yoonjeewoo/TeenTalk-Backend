const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);

exports.uploadTint = (req, res) => {
    const d = new Date();
    d.setUTCHours(d.getUTCHours());
	const { title, content, video_id, category } = req.body;
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