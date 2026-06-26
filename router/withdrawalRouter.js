const router = require('express').Router();
const { checkAdmin } = require('../middleware/authenticator');
const { withdrawalValidator } = require('../middleware/joiValidation');
const {
  requestWithdrawal,
  getWithdrawalHistory,
  getWithdrawalByReference
} = require('../controller/withdrawalController');

router.post('/request', checkAdmin, withdrawalValidator, requestWithdrawal);
router.get('/history', checkAdmin, getWithdrawalHistory);
router.get('/reference/:reference', checkAdmin, getWithdrawalByReference);

module.exports = router;
