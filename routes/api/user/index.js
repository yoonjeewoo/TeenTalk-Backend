const router = require('express').Router();
const controller = require('./user.controller');

// router.post('/user', controller.user);
router.get('/me', controller.getMyAccountInfo);
router.get('/myposts', controller.getMyPosts);
router.get('/myreviews', conroller.getMyReviews);
router.get('/mylikes', controller.getMyLikes);


module.exports = router;
