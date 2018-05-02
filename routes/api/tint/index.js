const router = require('express').Router();
const controller = require('./tint.controller');

router.post('', controller.uploadTint);
router.get('/list', controller.getTintList);


module.exports = router;
