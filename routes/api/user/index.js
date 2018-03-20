const router = require('express').Router();
const controller = require('./user.controller');

// router.post('/user', controller.user);
router.get('/me', controller.getMyAccountInfo);

module.exports = router;
