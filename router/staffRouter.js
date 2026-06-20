const router = require('express').Router();
const {
    createStaff,
    updateStaff,
    getStaff,
    getStaffSummary,
    createPassword,
    changePassword,
    getStaffByAdmin,
    StaffDashboard,
    getAllStaffs
} = require('../controller/staffController');
const { checkStaff, checkAdmin, checkInvite } = require('../middleware/authenticator');
const {
    createStaffSchema,
    createPasswordValidator,
    changePasswordValidator
} = require('../middleware/joiValidation');
const upload = require('../middleware/multer');
const { rateLimiter } = require('../middleware/rateLimiter');

router.post('/staff', checkAdmin, createStaffSchema, createStaff);
router.get('/staff', checkStaff, getStaff);
router.get('/staff/:id', checkAdmin, getStaffByAdmin);
router.put('/staff', checkStaff, upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
]), updateStaff);
router.get('/staff-dashboard', checkAdmin, StaffDashboard);
router.get('/all-staffs', checkAdmin, getAllStaffs);
router.get('/summary', checkAdmin, getStaffSummary);
router.post('/create-password/:token', checkInvite, createPasswordValidator, createPassword);
router.put('/change-password', rateLimiter, checkStaff, changePasswordValidator, changePassword);

module.exports = router;
