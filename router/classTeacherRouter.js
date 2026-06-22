const router = require('express').Router();
const {
    markAttendance,
    classTeacherSettings,
    getAllStudentsAttendance,
    classTeacherDashboard,
    getAllStudents
} = require('../controller/classTeacherController');
const { createScores } = require('../controller/scoresController');
const { checkStaff, checkAdmin, checkClassTeacher } = require('../middleware/authenticator');
const {
    markAttendanceValidator,
    createScoreValidator,
    profileSettingsValidator
} = require('../middleware/joiValidation');

const upload = require('../middleware/multer')

router.post('/attendance', checkClassTeacher, markAttendanceValidator, markAttendance);
router.get('/attendance/today', checkAdmin, getAllStudentsAttendance);
router.get('/all-students', checkClassTeacher, getAllStudents)
router.post('/mark-score', checkClassTeacher, createScoreValidator, createScores);
router.get('/class-teacher-dashboard', checkClassTeacher, classTeacherDashboard);
router.put('/updateProfile', checkStaff, upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
]), classTeacherSettings);
module.exports = router;
