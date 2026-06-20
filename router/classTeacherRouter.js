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

router.post('/attendance', checkTeacher, markAttendanceValidator, markAttendance);
router.get('/attendance/today', checkAdmin, getAllStudentsAttendance);
router.post('/mark-score', checkTeacher, createScoreValidator, createScores);
router.get('/class-teacher-dashboard', checkTeacher, classTeacherDashboard);
router.put('/updateProfile', checkStaff, profileSettingsValidator, classTeacherSettings);

module.exports = router;
