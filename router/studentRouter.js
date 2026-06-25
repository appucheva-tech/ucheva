const router = require('express').Router();
const { createStudent, getAllStudents, getStudentsByClass, updateStudent, deleteStudent } = require('../controller/studentController');
const { authenticate, checkAdmin } = require('../middleware/authenticator');
const { createStudentSchema, parentSettingsValidator } = require('../middleware/joiValidation');
const upload = require('../middleware/multer');

router.post('/student', checkAdmin, createStudentSchema, createStudent);
router.get('/getAllStudents', checkAdmin, getAllStudents);
router.get('/class/:classId', checkAdmin, getStudentsByClass);
router.put('/updatestudent/:id', checkAdmin, updateStudent)
router.delete('/deletestudent/:id   ', checkAdmin, deleteStudent)

module.exports = router;
