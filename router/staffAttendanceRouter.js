const router = require('express').Router();
const {
    generateQRCode,
    checkOutStaff,
    getAllTodayStaffAttendance,
    getAllStaffAttendance,
    scanAttendance
} = require('../controller/staffAttendanceController');
const { authenticate, checkAdmin, checkStaff } = require('../middleware/authenticator');
const { scanAttendanceValidator, qrTokenValidator } = require('../middleware/joiValidation');

router.post('/qr-code', authenticate, checkAdmin, generateQRCode);
router.post('/check-in', checkStaff, scanAttendanceValidator, scanAttendance);
router.post('/check-out', authenticate, checkStaff, qrTokenValidator, checkOutStaff);
router.get('/today', authenticate, checkAdmin, getAllTodayStaffAttendance);
router.get('/all', authenticate, checkAdmin, getAllStaffAttendance);

module.exports = router;
