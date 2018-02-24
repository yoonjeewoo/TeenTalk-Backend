const router = require('express').Router();
const controller = require('./school.controller');

router.post('', controller.school);
router.get('', controller.getSchoolList);

module.exports = router;
