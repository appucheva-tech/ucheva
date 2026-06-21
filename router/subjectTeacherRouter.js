const router = require('express').Router();

const { createScores } = require('../controller/scoresController');
const {
    subjectTeacherDashboard,
    subjectTeacherSettings
} = require('../controller/subjectTeacherController');
const { checkStaff, checkSubjectTeacher } = require('../middleware/authenticator');
const {
    createScoreValidator,
    profileSettingsValidator
} = require('../middleware/joiValidation');


router.post('/mark-score', checkSubjectTeacher, createScoreValidator, createScores);
router.get('/subject-teacher-dashboard', checkSubjectTeacher, subjectTeacherDashboard);
router.put('/updateProfile', checkSubjectTeacher, profileSettingsValidator, subjectTeacherSettings);

module.exports = router;
