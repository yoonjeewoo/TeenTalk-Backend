const router = require('express').Router();
const controller = require('./school.controller');

router.post('', controller.school);
router.get('', controller.getSchoolList);

// router.get('/board', controller.board);
router.post('/board', controller.writePost);
// router.delete('/board', controller.deletePost);
// router.get('/board/:post_id', controller.getPost);


module.exports = router;
