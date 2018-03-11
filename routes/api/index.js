const router = require('express').Router();

const auth = require('./auth');
const coupon = require('./coupon');
const school = require('./school');
const authMiddleware = require('../../middlewares/auth');

router.use('/auth', auth);

router.use('/school', authMiddleware);
router.use('/school', school);

router.use('/coupon', authMiddleware);
router.use('/coupon', coupon);

module.exports = router;
