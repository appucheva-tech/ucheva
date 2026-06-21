const router = require('express').Router();
const {
    markAttendance,
    classTeacherSettings,
    getAllStudentsAttendance,
    classTeacherDashboard
} = require('../controller/classTeacherController');
const { createScores } = require('../controller/scoresController');
const { checkStaff, checkAdmin, checkTeacher } = require('../middleware/authenticator');
const {
    markAttendanceValidator,
    createScoreValidator,
    profileSettingsValidator
} = require('../middleware/joiValidation');

const upload = require('../middleware/multer')

router.post('/attendance', checkTeacher, markAttendanceValidator, markAttendance);
router.get('/attendance/today', checkAdmin, getAllStudentsAttendance);
router.post('/mark-score', checkTeacher, createScoreValidator, createScores);
router.get('/class-teacher-dashboard', checkTeacher, classTeacherDashboard);
router.put('/updateProfile', checkStaff, profileSettingsValidator, upload.single('profilePicture'), classTeacherSettings);

module.exports = router;
