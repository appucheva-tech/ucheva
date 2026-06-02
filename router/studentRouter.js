const router = require('express').Router();
const {createStudent} = require('../controller/studentController');
const { createStudentSchema } = require('../middleware/joiValidation');

router.post('/student', createStudentSchema, createStudent);

module.exports = router;
