const router = require('express').Router();

const auth = require('./auth');
// const user = require('./user');
const school = require('./school');
const authMiddleware = require('../../middlewares/auth');

router.use('/auth', auth);

router.use('/school', authMiddleware);
router.use('/school', school);

module.exports = router;
