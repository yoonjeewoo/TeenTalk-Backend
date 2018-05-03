const router = require('express').Router();
const controller = require('./tint.controller');

router.post('', controller.uploadTint);
router.get('/list', controller.getTintList);
router.get('/image', controller.getTintImage);
// router.get('')
router.post('/like', controller.likeTint);
router.get('/like', controller.likeCheck);
router.post('/unlike', controller.unlikeTint);

module.exports = router;