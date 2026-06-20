const router = require('express').Router();
const { createStudent, getAllStudents, parentSettings, parentDashboard } = require('../controller/studentController');
const { authenticate, checkAdmin } = require('../middleware/authenticator');
const { createStudentSchema, parentSettingsValidator } = require('../middleware/joiValidation');
const upload = require('../middleware/multer');

router.post('/student', checkAdmin, createStudentSchema, createStudent);
router.get('/getAllStudents', checkAdmin, getAllStudents);
router.put('/parent-settings/:studentId', authenticate, upload.single('profilePicture'), parentSettingsValidator, parentSettings);
router.get('/parent-dashboard/:studentId', authenticate, parentDashboard);

module.exports = router;
