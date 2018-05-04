const router = require('express').Router();
const controller = require('./tint.controller');

router.post('', controller.uploadTint);
router.get('/list', controller.getTintList);
router.get('/image', controller.getTintImage);
// router.get('')
router.post('/like/:tint_id', controller.likeTint);
router.get('/like/:tint_id', controller.likeCheck);
router.post('/unlike/:tint_id', controller.unlikeTint);

module.exports = router;