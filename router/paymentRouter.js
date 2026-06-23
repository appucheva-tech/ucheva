const router = require('express').Router();
const { checkAdmin, authenticate, checkParent } = require('../middleware/authenticator');
const { initializePaymentValidator } = require('../middleware/joiValidation');
const {
    initializePayment,
    verifyPayment,
    getPaymentHistory,
    getPaymentByReference,
    getFeesDashboard,
    getClassPay
} = require('../controller/paymentController');

router.get('/dashboard', checkAdmin, getFeesDashboard);
router.post('/initialize/:studentId', checkParent, initializePaymentValidator, initializePayment);
router.get('/getclass', checkParent, getClassPay)
router.get('/verify/:reference', checkParent, verifyPayment);
router.get('/history', checkAdmin, getPaymentHistory);
router.get('/reference/:reference', checkAdmin, getPaymentByReference);

module.exports = router;
