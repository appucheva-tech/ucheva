const router = require('express').Router()
// const { upload } = require('../middleware/multer')
// const { register, login, logout } = require('../controller/userController')
const { register } = require('../controller/adminController')
const { registerValidator } = require('../middleware/joiValidation')
// const { loginValidator, registerValidator } = require('../middleware/joiValidation')
// const { authenticator } = require('../middleware/validation')
// const { loginRateLimiter } = require('../middleware/rateLimiter')


router.post('/register', registerValidator, register)
// router.post('/register', registerValidator ,upload.single('photo'), register)

module.exports = router
