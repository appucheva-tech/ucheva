const router = require('express').Router();
const { logoutUser } = require('../controller/adminController');
const {
    markAttendance,
    classTeacherSettings,
    getAllStudentsAttendance,
    classTeacherDashboard,
    getAllStudents,
    getClassTeacherProfile
} = require('../controller/classTeacherController');
const { createScores, updateScores, getScores, getScoresBySubject } = require('../controller/scoresController');
const { getTeacherProfile } = require('../controller/subjectTeacherController');
const { checkStaff, checkAdmin, checkClassTeacher, authenticate } = require('../middleware/authenticator');
const {
    markAttendanceValidator,
    createScoreValidator,
    profileSettingsValidator
} = require('../middleware/joiValidation');

const upload = require('../middleware/multer')

router.post('/attendance', checkClassTeacher, markAttendanceValidator, markAttendance);
router.get('/attendance/today', checkAdmin, getAllStudentsAttendance);
router.get('/all-students', checkClassTeacher, getAllStudents)
router.post('/mark-score/:id', authenticate, createScoreValidator, createScores);
router.put('/updatescore', checkClassTeacher, updateScores)
router.get('/getprofiledetails', checkClassTeacher, getClassTeacherProfile)
router.get('/getscores', checkClassTeacher, getScores)
router.get('/class-teacher-dashboard', checkClassTeacher, classTeacherDashboard);
router.get('/getprofiledetail', checkClassTeacher, getTeacherProfile)

router.get('/getscores/:id', authenticate, getScoresBySubject)
router.put('/updateProfile', checkClassTeacher, upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
]), classTeacherSettings);
router.post('/logout', authenticate, logoutUser)   


module.exports = router;
