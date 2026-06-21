const router = require('express').Router();

const { createScores } = require('../controller/scoresController');
const {
    subjectTeacherDashboard,
    subjectTeacherSettings
} = require('../controller/subjectTeacherController');
const { checkStaff } = require('../middleware/authenticator');
const {
    createScoreValidator,
    profileSettingsValidator
} = require('../middleware/joiValidation');


router.post('/mark-score', checkStaff, createScoreValidator, createScores);
router.get('/subject-teacher-dashboard', checkStaff, subjectTeacherDashboard);
router.put('/updateProfile', checkStaff, profileSettingsValidator, subjectTeacherSettings);

module.exports = router;
