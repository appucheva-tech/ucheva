const router = require('express').Router()
// const { upload } = require('../middleware/multer')
// const { register, login, logout } = require('../controller/userController')
const { register } = require('../controller/userController')
// const { loginValidator, registerValidator } = require('../middleware/joiValidation')
// const { authenticator } = require('../middleware/validation')
// const { loginRateLimiter } = require('../middleware/rateLimiter')


router.post('/register', register)
// router.post('/register', registerValidator ,upload.single('photo'), register)

module.exports = router
