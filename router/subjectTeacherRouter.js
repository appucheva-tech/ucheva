const router = require('express').Router();
const upload = require('../middleware/multer')

const { logoutUser } = require('../controller/adminController');
const { createScores, getScores, updateScores } = require('../controller/scoresController');
const {
    subjectTeacherDashboard,
    subjectTeacherSettings,
    getSubjectTeacherProfile,
    getAllSubjects,
    getOneSubject,
    getAllStudentsByClass
} = require('../controller/subjectTeacherController');
const { checkStaff, checkSubjectTeacher, authenticate } = require('../middleware/authenticator');
const {
    createScoreValidator,
    profileSettingsValidator
} = require('../middleware/joiValidation');


router.post('/mark-score', authenticate, createScoreValidator, createScores);
router.get('/getscores', checkSubjectTeacher, getScores)
router.get('/subject-teacher-dashboard', checkSubjectTeacher, subjectTeacherDashboard);
router.get('/getprofiledetails', checkSubjectTeacher, getSubjectTeacherProfile)
router.get('/subject/:id', checkSubjectTeacher, getOneSubject)
router.get('/get-all-subjects', checkSubjectTeacher, getAllSubjects)
router.get('/get-students/:id', checkSubjectTeacher, getAllStudentsByClass)
router.put('/updatescores', checkSubjectTeacher, updateScores)
router.put('/updateProfile', checkSubjectTeacher, upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
]), subjectTeacherSettings);
router.post('logout', authenticate, logoutUser)

module.exports = router;
