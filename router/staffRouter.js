const router = require('express').Router();
const {createStaff} = require('../controller/staffController');
const { authenticate } = require('../middleware/authenticator');
const { createStaffSchema } = require('../middleware/joiValidation')

router.post('/staff', authenticate, createStaffSchema, createStaff)

module.exports = router
