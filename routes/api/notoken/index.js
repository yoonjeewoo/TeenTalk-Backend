const router = require('express').Router();
const controller = require('./notoken.controller');

// router.post('/default', controller.default);
router.get('/school', controller.getSchoolList);

module.exports = router;
