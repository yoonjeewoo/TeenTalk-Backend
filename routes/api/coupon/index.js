const router = require('express').Router();
const controller = require('./coupon.controller');

router.post('', controller.createCoupon);
router.get('', controller.getCouponList);
router.get('/image/:coupon_id', controller.getCouponImageList);
router.get('/review/:coupon_id', controller.getCouponReviewList);

router.post('/review/:coupon_id', controller.createCouponReview);
router.delte('/review/:coupon_id', controller.deleteCouponReview);

module.exports = router;
