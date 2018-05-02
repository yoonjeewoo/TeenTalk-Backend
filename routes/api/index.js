const router = require('express').Router();

const auth = require('./auth');
const coupon = require('./coupon');
const school = require('./school');
const user = require('./user');
const notoken = require('./notoken');
const admin = require('./admin');
const tint = require('./tint');
const authMiddleware = require('../../middlewares/auth');

router.use('/auth', auth);
router.use('', notoken);

router.use('/school', authMiddleware);
router.use('/school', school);

router.use('/coupon', authMiddleware);
router.use('/coupon', coupon);

router.use('/user', authMiddleware);
router.use('/user', user);

router.use('/admin', authMiddleware);
router.use('/admin', admin);

router.use('/tint', authMiddleware);
router.use('/tint', tint);



module.exports = router;
