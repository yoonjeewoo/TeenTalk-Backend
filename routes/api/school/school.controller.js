const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);
const lineReader = require('line-reader');

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
	const { content } = req.body;
	const d = new Date();
	d.setUTCHours(d.getUTCHours());
	conn.query(
		'INSERT INTO Posts(content, school_id, user_id, created_at) VALUES (?, ?, ?, ?)',
		[content, req.decoded.school_id, req.decoded._id, d],
		(err, result) => {
			if (err) throw err;
			return res.status(200).json({
				'message' : '포스트 작성 완료'
			})
		}
	)
}

exports.getBoard = (req, res) => {
	const { class_ } = req.params;
	conn.query(
		'SELECT Posts.id, content, username, like_cnt, created_at FROM Posts, Users WHERE Posts.school_id = ? and Posts.user_id = Users.id and class=?',
		[req.decoded.school_id, class_],
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
		'SELECT * FROM Posts WHERE school_id = ? and id = ?',
		[req.decoded.school_id, req.params.post_id],
		(err, result) => {
			if (err) throw err;
			return res.status(200).json({
				result
			})
		}
	)
}

exports.createComment = (req, res) => {
	const { post_id, content } = req.body;
	const d = new Date();
	d.setUTCHours(d.getUTCHours());
	conn.query(
		'INSERT INTO Comments(content, school_id, user_id, post_id, created_at) VALUES(?, ?, ?, ?, ?)',
		[content, req.decoded.school_id, req.decoded._id, post_id, d],
		(err, result) => {
			if (err) throw err;
			return res.status(200).json({
				result
			})
		}
	)
}

exports.getCommentList = (req, res) => {
	const { post_id } = req.params;
	conn.query(
		'SELECT Comments.id, content, Comments.school_id, username, created_at FROM Comments join Users on Comments.user_id = Users.id WHERE Comments.post_id = ?',
		[post_id],
		(err, result) => {
			if (err) throw err;
			return res.status(200).json({
				result
			})
		}
	)
}

exports.likePost = (req, res) => {
	const { post_id } = req.params;
	conn.query(
		'UPDATE Posts SET like_cnt = like_cnt+1 WHERE id = ?',
		[post_id],
		(err, result) => {
			if (err) throw err;
			return res.status(200).json({
				message: 'successfully liked post'
			})
		}
	)
}

exports.updateComment = (req, res) => {
	const { comment_id } = req.params;
	const { content } = req.body;
	conn.query(
		'UPDATE Comments SET content = ? WHERE id = ?',
		[content, comment_id],
		(err, result) => {
			if (err) throw err;
			return res.status(200).json({
				message: 'successfully updated comment'
			})
		}
	)
}

exports.deleteComment = (req, res) => {
	const { comment_id } = req.params;
	conn.query(
		'DELETE from Comments WHERE id = ?',
		[comment_id],
		(err, result) => {
			if (err) throw err;
			return res.status(200).json({
				message: 'successfully deleted comment'
			})
		}
	)
}