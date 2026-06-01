const router = require('express').Router();
const {createStudent} = require('../controller/studentController');
const { createStudentSchema } = require('../middleware/validation');

router.post('/student', createStudentSchema, createStudent);

module.exports = router;
