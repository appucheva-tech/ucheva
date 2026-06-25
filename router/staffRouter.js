const router = require('express').Router();
const {
    createStaff,
    getStaff,
    getStaffSummary,
    createPassword,
    changePassword,
    getStaffByAdmin,
    StaffDashboard,
    getAllStaffs,
    updateStaff,
    deleteStaff
} = require('../controller/staffController');
const { checkStaff, checkAdmin, checkInvite } = require('../middleware/authenticator');
const {
    createStaffSchema,
    createPasswordValidator,
    changePasswordValidator
} = require('../middleware/joiValidation');
const upload = require('../middleware/multer');
const { rateLimiter } = require('../middleware/rateLimiter');

router.post('/staff', checkAdmin, rateLimiter, createStaffSchema, createStaff);
router.get('/staff', checkStaff, getStaff);
router.get('/staff/:id', checkAdmin, getStaffByAdmin);

router.get('/staff-dashboard', checkAdmin, StaffDashboard);
router.get('/all-staffs', checkAdmin, getAllStaffs);
router.get('/summary', checkAdmin, getStaffSummary);
router.post('/create-password/:token', checkInvite, createPasswordValidator, createPassword);
router.put('/updatestaff/:staffId', checkAdmin, updateStaff)
router.put('/change-password', rateLimiter, checkStaff, changePasswordValidator, changePassword);
router.delete('/deletestaff/:staffId', checkAdmin, deleteStaff)

module.exports = router;
