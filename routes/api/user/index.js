const router = require('express').Router();
const controller = require('./user.controller');

// router.post('/user', controller.user);
router.get('/me', controller.getMyAccountInfo);
router.get('/myposts', controller.getMyPosts);
router.get('/mylikes', controller.getMyLikes);
router.get('/myreviews', controller.getMyReviews);
router.get('/comment/count', controller.getMyCommentCount);

module.exports = router;
