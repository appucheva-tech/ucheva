const router = require('express').Router()
const { register, verifyEmail, forgotPassword, resetPassword, resendOTP, login, logout } = require('../controller/adminController')
const { registerValidator, loginValidator } = require('../middleware/joiValidation')
const { authenticate } = require('../middleware/authenticator')


router.post('/register', registerValidator, register)
router.post('/login', loginValidator, login)
router.post('/verify', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/resend-otp', resendOTP)
router.post('/login', loginValidator, login)
router.post('/logout', authenticate, logout)




module.exports = router
