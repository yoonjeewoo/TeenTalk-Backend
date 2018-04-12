const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mysql = require('mysql');
const config = require('../../../config');
const conn = mysql.createConnection(config);
const nodemailer = require('nodemailer');
const smtpPool = require('nodemailer-smtp-pool');


exports.register = (req, res) => {
	const secret = req.app.get('jwt-secret');
	const { username, email, password, gender, birth, class_, class_num, school_name } = req.body;
	let encrypted = null;
	if (password != null) {
		encrypted = crypto.createHmac('sha1', config.secret)
            .update(password)
            .digest('base64');
    }
	conn.query(
		'SELECT * FROM Schools WHERE school_name=? LIMIT 1',
		[school_name],
		(err, result) => {
			if (err) throw err;
			if (result.length == 0) {
				return res.status(404).json({
					message: 'no school found'
				})
			} else {
				const school_id = result[0].id;
				conn.query('SELECT * from Users WHERE email=? or username=?',[email, username], (err, rows) => {
					if (err) throw err;
					if (rows.length == 0) {
						conn.query(
							'INSERT INTO Users(username, password, email, gender, birth, class, class_num, school_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
							[username, encrypted, email, gender, birth, class_, class_num, school_id],
							(err, result) => {
								if (err) throw err;
								console.log(result);
								jwt.sign(
								{
									_id: result.insertId,
									email: email,
									school_id: school_id
								},
								secret,
								{
									expiresIn: '7d',
									issuer: 'rebay_admin',
									subject: 'userInfo'
								}, (err, token) => {
									if (err) return res.status(406).json({ message:'register failed' });
									return res.status(200).json({
										message: 'registered successfully',
										token
									});
								});
					  	});
					} else {
						return res.status(406).json({
							message: 'user email or nickname exists'
						})
					}
				});
			}
		}
	)
};

exports.login = (req, res) => {
	const { email, password } = req.body;
	const secret = req.app.get('jwt-secret');
	const encrypted = crypto.createHmac('sha1', config.secret)
		.update(password)
		.digest('base64');
	conn.query(
		'SELECT * from Users WHERE email=? and password=?',
		[email, encrypted],
		(err, result) => {
			if (err) throw err;
			if (result.length == 0) {
				return res.status(404).json({ message: 'login failed'});
			} else {
				jwt.sign(
					{
						_id: result[0].id,
						email: result[0].email,
						school_id: result[0].school_id
					},
					secret,
					{
						expiresIn: '7d',
						issuer: 'rebay_admin',
						subject: 'userInfo'
					}, (err, token) => {
						if (err) return res.status(406).json({ message:'login failed' });
						return res.status(200).json({
							message: 'logged in successfully',
							token
						});
					});
			}
		}
	)
};

exports.emailVerification = (req, res) => {
	const { email } = req.body;
	const random_verify = Math.floor(Math.random() * 1000000) + 1;
	let smtpTransport = nodemailer.createTransport(smtpPool({
		service: 'Gmail',
		host: 'localhost',
		port: '465',
		tls: {
			rejectUnauthorize: false
		},

		//이메일 전송을 위해 필요한 인증정보

		//gmail 계정과 암호 
		auth: {
			user: 'yoonjeewoo@likelion.org',
			pass: 'y1081615'
		},
		maxConnections: 5,
		maxMessages: 10
	}));

	let mailOpt = {
		from: 'yoonjeewoo@likelion.org',
		to: email,
		subject: '틴트 인증번호',
		html: `<h1>${random_verify}</h1>`
	};
	smtpTransport.sendMail(mailOpt, function (err, res) {
		if (err) {
			throw err;
		} else {
			smtpTransport.close();	
		}
	});
	return res.status(200).json({
		message: random_verify
	})
};