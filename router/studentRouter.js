const router = require('express').Router();
const {createStudent} = require('../controller/studentController');
const { createStudentSchema } = require('../middleware/authenticator');

router.post('/student', createStudentSchema, createStudent);

module.exports = router;
