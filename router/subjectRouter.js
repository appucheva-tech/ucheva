const router = require('express').Router();
const { updateStudent } = require('../controller/studentController');
const { createSubject, getAllSubjects, deleteSubject } = require('../controller/subjectController');
const { checkAdmin } = require('../middleware/authenticator');
const { createSubjectValidator } = require('../middleware/joiValidation');

router.post('/subject', checkAdmin, createSubjectValidator, createSubject);
router.get('/allSubjects', checkAdmin, getAllSubjects);
router.put('/updatesubject/:id', checkAdmin, updateStudent)
router.delete('/deletesubject/:id', checkAdmin, deleteSubject)

module.exports = router;
