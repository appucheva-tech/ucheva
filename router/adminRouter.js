const router = require('express').Router()
const { register, verifyEmail, forgotPassword, resetPassword, resendOTP, login, logout, verifyForgotPassword } = require('../controller/adminController')
const { registerValidator, loginValidator } = require('../middleware/joiValidation')
const { authenticate } = require('../middleware/authenticator')


router.post('/register', registerValidator, register)
router.post('/verify', verifyEmail)
router.post('/resend-otp', resendOTP)

router.post('/login', loginValidator, login)

router.post('/forgot-password', forgotPassword)
router.post('/verify-password', verifyForgotPassword)
router.post('/reset-password', resetPassword)

router.post('/logout', authenticate, logout)




module.exports = router
