const router = require('express').Router();

const { logoutUser } = require('../controller/adminController');
const { createScores, getScores, updateScores } = require('../controller/scoresController');
const {
    subjectTeacherDashboard,
    subjectTeacherSettings,
    getSubjectTeacherProfile
} = require('../controller/subjectTeacherController');
const { checkStaff, checkSubjectTeacher, authenticate } = require('../middleware/authenticator');
const {
    createScoreValidator,
    profileSettingsValidator
} = require('../middleware/joiValidation');


router.post('/mark-score', checkSubjectTeacher, createScoreValidator, createScores);
router.get('/getscores', checkSubjectTeacher, getScores)
router.get('/subject-teacher-dashboard', checkSubjectTeacher, subjectTeacherDashboard);
router.get('/getprofiledetails', checkSubjectTeacher, getSubjectTeacherProfile)
router.put('/updatescores', checkSubjectTeacher, updateScores)
router.put('/updateProfile', checkSubjectTeacher, profileSettingsValidator, subjectTeacherSettings);
router.post('logout', authenticate, logoutUser)

module.exports = router;
