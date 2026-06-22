const router = require('express').Router();
const {
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendOTP,
    logoutUser,
    getWallet,
    verifyForgotPassword,
    userLogin,
    getAdmin,
    getSchoolDashboard,
    getAllStaffAttendance,
    getAllSchoolsUrl,
    updateAdminProfileSettings,
    getAdminProfileSettings
} = require('../controller/adminController');
const {
    registerValidator,
    loginValidator,
    emailValidator,
    otpValidator,
    resetPasswordValidator,
    profileSettingsValidator
} = require('../middleware/joiValidation');
const { authenticate, checkAdmin } = require('../middleware/authenticator');
const upload = require('../middleware/multer');
const { getNewIntake } = require('../controller/studentController');

router.post('/register', registerValidator, register);
router.post('/verify', otpValidator, verifyEmail);
router.post('/resend-otp', emailValidator, resendOTP);
router.post('/login', loginValidator, userLogin);
router.post('/forgot-password', emailValidator, forgotPassword);
router.post('/verify-password', otpValidator, verifyForgotPassword);
router.post('/reset-password', resetPasswordValidator, resetPassword);
router.get('/profile', checkAdmin, getAdminProfileSettings);
router.get('/get-admin', checkAdmin, getAdmin);
router.get('/wallet', checkAdmin, getWallet);
router.get('/dashboard', checkAdmin, getSchoolDashboard);
router.get('/newIntake', checkAdmin, getNewIntake)
router.get('/school-url', getAllSchoolsUrl);
router.post('/logout', authenticate, logoutUser);
router.get('/today', authenticate, checkAdmin, getAllStaffAttendance);
router.put('/profile-settings', checkAdmin, upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'schoolLogo', maxCount: 1 },
    { name: 'schoolStamp', maxCount: 1 },
    { name: 'cac', maxCount: 1 },
    { name: 'nepa', maxCount: 1 }
]), profileSettingsValidator, updateAdminProfileSettings);

module.exports = router;
