const router = require('express').Router();
const controller = require('./admin.controller');

router.post('/home/slide', controller.homeSlideImage);
// router.get('/home/slide', controller.default);

module.exports = router;
