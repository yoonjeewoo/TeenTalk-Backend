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

exports.getSchoolList = (req, res) => {
	conn.query(
		'SELECT * FROM Schools',
		(err, result) => {
			if(err) throw err;
			return res.status(200).json({
					schools: result
				})
		}
	)
}
