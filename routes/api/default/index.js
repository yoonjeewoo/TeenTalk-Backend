const router = require('express').Router();
const controller = require('./default.controller');

router.post('/default', controller.default);
router.get('/default', controller.default);

module.exports = router;
