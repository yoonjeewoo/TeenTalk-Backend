const router = require('express').Router();
const controller = require('./school.controller');

router.post('', controller.school);
// router.get('', controller.default);

module.exports = router;
