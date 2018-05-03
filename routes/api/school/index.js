const router = require('express').Router();
const controller = require('./school.controller');

router.post('', controller.school);

router.get('/check', controller.getSchoolCheck);

router.get('/board', controller.getBoard);
router.post('/board', controller.writePost);

router.post('/tintcast', controller.writeTint);
router.post('/event', controller.writeEvent);

router.get('/board/post/:post_id', controller.getPost);
router.post('/board/like/:post_id', controller.likePost);
router.delete('/board/like/:post_id', controller.deleteLike);
router.get('/board/like/:post_id', controller.likePostCheck);


router.post('/board/comment', controller.createComment);
router.get('/board/comment/:post_id', controller.getCommentList);
router.put('/board/comment/:comment_id', controller.updateComment);
router.delete('/board/comment/:comment_id', controller.deleteComment);

router.get('/board/pic/:post_id', controller.getPostPicture);
router.get('/board/search/:q', controller.postSearch);

module.exports = router;
