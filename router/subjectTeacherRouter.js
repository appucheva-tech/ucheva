const router = require('express').Router();
const upload = require('../middleware/multer')

const { logoutUser } = require('../controller/adminController');
const { createScores, getScores, updateScores, getScoresBySubject } = require('../controller/scoresController');
const {
    subjectTeacherDashboard,
    subjectTeacherSettings,
    getTeacherProfile,
    getAllSubjects,
    getOneSubject,
    getAllStudentsByClass
} = require('../controller/subjectTeacherController');
const { checkStaff, checkSubjectTeacher, authenticate } = require('../middleware/authenticator');
const {
    createScoreValidator,
    profileSettingsValidator
} = require('../middleware/joiValidation');


router.post('/mark-score/:id', authenticate, createScoreValidator, createScores);
router.get('/getscores', checkSubjectTeacher, getScores)
router.get('/subject-teacher-dashboard', checkSubjectTeacher, subjectTeacherDashboard);
router.get('/getprofiledetails', checkSubjectTeacher, getTeacherProfile)
router.get('/subject/:id', checkSubjectTeacher, getOneSubject)
router.get('/get-all-subjects', authenticate, getAllSubjects)
router.get('/get-students/:id', checkSubjectTeacher, getAllStudentsByClass)
router.get('/getscores/:id', authenticate, getScoresBySubject)

router.put('/updatescores', checkSubjectTeacher, updateScores)
router.put('/updateProfile', checkSubjectTeacher, upload.single([
    { name: 'profilePicture', maxCount: 1 },
]), subjectTeacherSettings);
router.post('logout', authenticate, logoutUser)

module.exports = router;
