const router = require('express').Router();
const { checkAdmin, authenticate } = require('../middleware/authenticator');
const { initializePaymentValidator } = require('../middleware/joiValidation');
const {
    initializePayment,
    verifyPayment,
    getPaymentHistory,
    getPaymentByReference
} = require('../controller/paymentController');

router.post('/initialize/:studentId', checkAdmin, initializePaymentValidator, initializePayment);
router.get('/verify/:reference', authenticate, verifyPayment);
router.get('/history', checkAdmin, getPaymentHistory);
router.get('/reference/:reference', checkAdmin, getPaymentByReference);

module.exports = router;
