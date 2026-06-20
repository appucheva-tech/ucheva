const router = require('express').Router();
const { createSubject, getAllSubjects } = require('../controller/subjectController');
const { checkAdmin } = require('../middleware/authenticator');
const { createSubjectValidator } = require('../middleware/joiValidation');

router.post('/subject', checkAdmin, createSubjectValidator, createSubject);
router.get('/allSubjects', checkAdmin, getAllSubjects);

module.exports = router;
