const router = require('express').Router();
const { getFeesSummary } = require('../controller/bursaryController');
const { checkStaff } = require('../middleware/authenticator');


router.get('/getTotal', checkStaff, )

module.exports = router