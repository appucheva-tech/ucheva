const router = require('express').Router();
const { checkAdmin, authenticate } = require('../middleware/authenticator');
const { initializePaymentValidator } = require('../middleware/joiValidation');
const {
    initializePayment,
    verifyPayment,
    getPaymentHistory,
    getPaymentByReference,
    getFeesDashboard
} = require('../controller/paymentController');

router.get('/dashboard', checkAdmin, getFeesDashboard);
router.post('/initialize/:studentId', checkAdmin, initializePaymentValidator, initializePayment);
router.get('/verify/:reference', authenticate, verifyPayment);
router.get('/history', checkAdmin, getPaymentHistory);
router.get('/reference/:reference', checkAdmin, getPaymentByReference);

module.exports = router;
