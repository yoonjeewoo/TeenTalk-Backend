const router = require('express').Router();
const controller = require('./coupon.controller');

// router.post('', controller.makeCoupon);
router.get('', controller.getCouponList);
router.get('/image/:coupon_id', controller.getCouponImageList);
router.get('/review/:coupon_id', controller.getCouponReviewList);

module.exports = router;
