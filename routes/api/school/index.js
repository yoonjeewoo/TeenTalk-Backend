const router = require('express').Router();
const controller = require('./school.controller');

router.post('', controller.school);
router.get('', controller.getSchoolList);

router.get('/board', controller.getBoard);
router.post('/board', controller.writePost);
// router.delete('/board', controller.deletePost);
router.get('/board/:post_id', controller.getPost);

router.post('/board/comment', controller.createComment);
router.get('/board/comment/:post_id', controller.getCommentList);

module.exports = router;
