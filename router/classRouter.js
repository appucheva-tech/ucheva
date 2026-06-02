const router = require('express').Router()
const { authenticate } = require('../middleware/authenticator')
const { createClass } = require('../controller/classController')

router.post('/create-class', authenticate, createClass)



module.exports = router
