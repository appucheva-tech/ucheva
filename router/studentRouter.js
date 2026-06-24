const router = require('express').Router();
const { createStudent, getAllStudents, updateStudent, deleteStudent } = require('../controller/studentController');
const { authenticate, checkAdmin } = require('../middleware/authenticator');
const { createStudentSchema, parentSettingsValidator } = require('../middleware/joiValidation');
const upload = require('../middleware/multer');

router.post('/student', checkAdmin, createStudentSchema, createStudent);
router.get('/getAllStudents', checkAdmin, getAllStudents);
router.put('/updatestudent', checkAdmin, updateStudent)
router.delete('/deletestudent', checkAdmin, deleteStudent)

module.exports = router;
