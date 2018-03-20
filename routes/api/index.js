const router = require('express').Router();

const auth = require('./auth');
const coupon = require('./coupon');
const school = require('./school');
const user = require('./user');
const authMiddleware = require('../../middlewares/auth');

router.use('/auth', auth);

router.use('/school', authMiddleware);
router.use('/school', school);

router.use('/coupon', authMiddleware);
router.use('/coupon', coupon);

router.use('/user', authMiddleware);
router.use('/user', user);

module.exports = router;
