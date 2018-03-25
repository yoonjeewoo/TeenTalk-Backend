const router = require('express').Router();
const controller = require('./school.controller');

router.post('', controller.school);

// router.get('', controller.getSchoolList);

router.get('/board', controller.getBoard);
router.post('/board', controller.writePost);
router.get('/board/:post_id', controller.getPost);
router.post('/board/like/:post_id', controller.likePost);

router.post('/board/comment', controller.createComment);
router.get('/board/comment/:post_id', controller.getCommentList);
router.put('/board/comment/:comment_id', controller.updateComment);
router.delete('/board/comment/:comment_id', controller.deleteComment);

module.exports = router;
