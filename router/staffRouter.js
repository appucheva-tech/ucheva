const router = require('express').Router();
const {createStaff} = require('../controller/staffController')
const { createStaffSchema } = require('../middleware/joiValidation')

router.post('/staff', createStaffSchema, createStaff)

module.exports = router
