const router = require('express').Router();
const { getTotalExpectedFees } = require('../controller/bursaryController');
const { checkStaff } = require('../middleware/authenticator');


router.get('/getTotal', checkStaff, getTotalExpectedFees)

module.exports = router