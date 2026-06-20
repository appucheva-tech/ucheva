const router = require('express').Router()
const { register, verifyEmail, forgotPassword, resetPassword, resendOTP, logoutUser, getWallet, verifyForgotPassword, getProfile, createProfile, userLogin, getAdmin, getSchoolDashboard, getAllStaffAttendance ,getTodayAnnouncements, getAllSchoolsUrl } = require('../controller/adminController')
const { registerValidator, loginValidator } = require('../middleware/joiValidation')
const { authenticate, checkAdmin } = require('../middleware/authenticator')
const uploads = require('../middleware/multer')
// const { rateLimiter } = require('../middleware/rateLimiter')

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin authentication and school management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Admin UUID
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         schoolName:
 *           type: string
 *           example: Greenfield Academy
 *         schoolUrl:
 *           type: string
 *           description: School subdomain URL on the Ucheva platform
 *           example: https://greenfield-academy.ucheva.com
 *         email:
 *           type: string
 *           example: admin@greenfield.com
 *         address:
 *           type: string
 *           example: 12 Lagos Island, Lagos
 *         phoneNumber:
 *           type: string
 *           example: "+2348029837465"
 *         role:
 *           type: string
 *           description: Admin role (default is admin)
 *           example: admin
 *         isVerified:
 *           type: boolean
 *           example: false
 *         loginAttempts:
 *           type: integer
 *           description: Number of consecutive failed login attempts
 *           example: 0
 *         lockUntil:
 *           type: string
 *           format: date-time
 *           description: Timestamp until which the account is locked after 5 failed attempts
 *           example: "2026-05-24T10:02:00.000Z"
 *         passwordReset:
 *           type: boolean
 *           description: Whether a password reset flow is currently in progress
 *           example: false
 *     AdminProfile:
 *       type: object
 *       properties:
 *         adminId:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         schoolType:
 *           type: array
 *           items:
 *             type: string
 *           example: ["nursery","primary"]
 *         schoolLogoUrl:
 *           type: string
 *           example: https://res.cloudinary.com/sample/image/upload/v1/logo.png
 *         schoolLogoPublicId:
 *           type: string
 *           example: sample/logo
 *     SchoolProfile:
 *       type: object
 *       properties:
 *         schoolName:
 *           type: string
 *           example: Greenfield Academy
 *         schoolEmail:
 *           type: string
 *           example: admin@greenfield.com
 *         schoolAddress:
 *           type: string
 *           example: 12 Lagos Island, Lagos
 *         schoolPhoneNumber:
 *           type: string
 *           example: "+2348029837465"
 *         schoolUrl:
 *           type: string
 *           example: https://greenfield-academy.ucheva.com
 *     Wallet:
 *       type: object
 *       properties:
 *         paymentReceived:
 *           type: integer
 *           example: 50000
 *         withdrawal:
 *           type: integer
 *           example: 10000
 *         balance:
 *           type: integer
 *           example: 40000
 *         totalTransaction:
 *           type: integer
 *           example: 15
 *     ProfileCreateRequest:
 *       type: object
 *       properties:
 *         image:
 *           type: string
 *           format: binary
 *           description: School logo image file
 *         schoolType:
 *           type: array
 *           items:
 *             type: string
 *             enum: [nursery, primary, secondary]
 *           example: ["nursery","primary"]
 *         classFromNur:
 *           type: string
 *         classToNur:
 *           type: string
 *         armFromNur:
 *           type: string
 *         armToNur:
 *           type: string
 *         classFromPry:
 *           type: string
 *         classToPry:
 *           type: string
 *         armFromPry:
 *           type: string
 *         armToPry:
 *           type: string
 *         classFromSec:
 *           type: string
 *         classToSec:
 *           type: string
 *         armFromSec:
 *           type: string
 *         armToSec:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/admin/register:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Register a new school admin
 *     description: >
 *       Creates a new admin account and sends a 6-digit OTP to the provided email for verification.
 *       The schoolUrl must be provided directly as the school's subdomain on the Ucheva platform.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schoolName
 *               - schoolUrl
 *               - email
 *               - address
 *               - phoneNumber
 *               - password
 *               - confirmPassword
 *             properties:
 *               schoolName:
 *                 type: string
 *                 example: Greenfield Academy
 *               schoolUrl:
 *                 type: string
 *                 description: The school's subdomain URL on the Ucheva platform
 *                 example: https://greenfield-academy.ucheva.com
 *               email:
 *                 type: string
 *                 example: admin@greenfield.com
 *               address:
 *                 type: string
 *                 example: 12 Lagos Island, Lagos
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348029837465"
 *               password:
 *                 type: string
 *                 example: Password@123
 *               confirmPassword:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       201:
 *         description: Account created and OTP sent to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: account created
 *                 data:
 *                   type: object
 *                   properties:
 *                     schoolName:
 *                       type: string
 *                       example: Greenfield Academy
 *                     schoolUrl:
 *                       type: string
 *                       example: https://greenfield-academy.ucheva.com
 *                     email:
 *                       type: string
 *                       example: admin@greenfield.com
 *       400:
 *         description: Email already exists or passwords do not match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: email already exists
 */
router.post('/register', registerValidator, register)

/**
 * @swagger
 * /api/v1/admin/verify:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Verify admin email
 *     description: >
 *       Verifies the admin's email using the 6-digit OTP sent during registration. OTP expires after 2 minutes.
 *       A wallet is automatically created for the admin upon successful verification.
 *     parameters:
 *       - in: header
 *         name: x-tenant
 *         required: true
 *         schema:
 *           type: string
 *         description: The school's subdomain URL used for multi-tenant verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@greenfield.com
 *               otp:
 *                 type: string
 *                 example: "482910"
 *     responses:
 *       200:
 *         description: Email verified successfully and wallet created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification successfully
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid OTP
 *       404:
 *         description: Admin not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: admin not found
 */
router.post('/verify', verifyEmail)

/**
 * @swagger
 * /api/v1/admin/resend-otp:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Resend OTP
 *     description: Generates a new 6-digit OTP and sends it to the admin's email. Expires after 2 minutes.
 *     parameters:
 *       - in: header
 *         name: x-tenant
 *         required: true
 *         schema:
 *           type: string
 *         description: The school's subdomain URL used for multi-tenant routing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@greenfield.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent successfully
 *       404:
 *         description: Admin not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: invalid credentials
 */
router.post('/resend-otp', resendOTP)

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Admin login
 *     description: >
 *       Logs in the admin with email and password. Requires the school's subdomain URL to be
 *       passed in the `x-tenant` request header for multi-tenant routing. Email must be verified
 *       before login. JWT token is issued on success and stored in Redis (expires in 1 day).
 *       After 5 consecutive failed attempts the account is locked for 2 minutes.
 *     parameters:
 *       - in: header
 *         name: x-tenant
 *         required: true
 *         description: The school's subdomain URL (e.g. https://greenfield-academy.ucheva.com)
 *         schema:
 *           type: string
 *           example: https://greenfield-academy.ucheva.com
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@greenfield.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: login successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     schoolName:
 *                       type: string
 *                       example: Greenfield Academy
 *                     email:
 *                       type: string
 *                       example: admin@greenfield.com
 *                 token:
 *                   type: string
 *                   example: jwt.token.here
 *       400:
 *         description: Invalid credentials or email not yet verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: invalid credentials
 *       403:
 *         description: Account locked due to too many failed login attempts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account locked until 2026-05-24T10:02:00.000Z"
 *       404:
 *         description: Admin not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: invalid credentials
 */
router.post('/login',  loginValidator, userLogin)

/**
 * @swagger
 * /api/v1/admin/forgot-password:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Forgot password
 *     description: Sends a 6-digit OTP to the admin's email to initiate a password reset. OTP expires after 2 minutes.
 *     parameters:
 *       - in: header
 *         name: x-tenant
 *         required: true
 *         schema:
 *           type: string
 *         description: The school's subdomain URL used for multi-tenant routing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@greenfield.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent successfully
 *       404:
 *         description: Admin not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: invalid credentials
 */
router.post('/forgot-password', forgotPassword)

/**
 * @swagger
 * /api/v1/admin/verify-password:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Verify forgot password OTP
 *     description: >
 *       Verifies the OTP sent during the forgot password flow.
 *       Sets passwordReset to true on success, allowing the admin to proceed to reset their password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@greenfield.com
 *               otp:
 *                 type: string
 *                 example: "482910"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification successfully
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid OTP
 *       404:
 *         description: Admin not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: admin not found
 */
router.post('/verify-password', verifyForgotPassword)

/**
 * @swagger
 * /api/v1/admin/reset-password:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Reset password
 *     description: Resets the admin's password. Can only be called after successfully verifying the forgot-password OTP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@greenfield.com
 *               newPassword:
 *                 type: string
 *                 example: NewPassword@456
 *               confirmPassword:
 *                 type: string
 *                 example: NewPassword@456
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password Reset successfully
 *       400:
 *         description: Passwords do not match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: password does not match
 *       403:
 *         description: Password reset not authorized — OTP not verified first
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized to perform this action
 *       404:
 *         description: Admin not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: admin not found
 */
router.post('/reset-password', resetPassword)

/**
 * @swagger
 * /api/v1/admin/profile:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create school profile
 *     description: >
 *       Creates the school profile with a logo upload (via Cloudinary) and configures
 *       class and arm ranges per school section (nursery, primary, secondary).
 *       Classes and arms are expanded and combined into fullClasses (e.g. "Primary 3A").
 *       Only sections included in schoolType will be configured. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *               - schoolType
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: School logo image file
 *               schoolType:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [nursery, primary, secondary]
 *                 description: School sections to configure
 *                 example: ["nursery", "primary"]
 *               classFromNur:
 *                 type: string
 *                 description: "Starting nursery class. Options: Creche, Nursery 1, Nursery 2, KG 1, KG 2"
 *                 example: Creche
 *               classToNur:
 *                 type: string
 *                 description: Ending nursery class
 *                 example: KG 2
 *               armFromNur:
 *                 type: string
 *                 description: Starting arm letter for nursery
 *                 example: A
 *               armToNur:
 *                 type: string
 *                 description: Ending arm letter for nursery
 *                 example: C
 *               classFromPry:
 *                 type: string
 *                 description: "Starting primary class. Options: Primary 1 to Primary 6"
 *                 example: Primary 1
 *               classToPry:
 *                 type: string
 *                 description: Ending primary class
 *                 example: Primary 6
 *               armFromPry:
 *                 type: string
 *                 example: A
 *               armToPry:
 *                 type: string
 *                 example: D
 *               classFromSec:
 *                 type: string
 *                 description: "Starting secondary class. Options: JSS 1, JSS 2, JSS 3, SS1, SS2, SS3"
 *                 example: JSS 1
 *               classToSec:
 *                 type: string
 *                 description: Ending secondary class
 *                 example: SS3
 *               armFromSec:
 *                 type: string
 *                 example: A
 *               armToSec:
 *                 type: string
 *                 example: B
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: profile created successfully
 *                 profile:
 *                   type: object
 *                   properties:
 *                     adminId:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     schoolType:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["nursery", "primary"]
 *                     schoolLogoUrl:
 *                       type: string
 *                       example: https://res.cloudinary.com/sample/image/upload/v1/logo.png
 *                     schoolLogoPublicId:
 *                       type: string
 *                       example: sample/logo
 *                 completedConfigs:
 *                   type: array
 *                   description: Class configurations created per section
 *                   items:
 *                     type: object
 *                     properties:
 *                       section:
 *                         type: string
 *                         example: nursery
 *                       classFrom:
 *                         type: string
 *                         example: Creche
 *                       classTo:
 *                         type: string
 *                         example: KG 2
 *                       armFrom:
 *                         type: string
 *                         example: A
 *                       armTo:
 *                         type: string
 *                         example: C
 *                       classes:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Creche", "Nursery 1", "Nursery 2", "KG 1", "KG 2"]
 *                       arms:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["A", "B", "C"]
 *                       fullClasses:
 *                         type: array
 *                         description: Combined class-arm combinations
 *                         items:
 *                           type: string
 *                         example: ["CrecheA", "CrecheB", "Nursery 1A", "Nursery 1B"]
 *       500:
 *         description: Image upload failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Image upload failed
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get school profile
 *     description: Retrieves the school profile and admin details. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: profile retrieved successfully
 *                 viewSchoolProfile:
 *                   type: object
 *                   properties:
 *                     schoolName:
 *                       type: string
 *                       example: Greenfield Academy
 *                     schoolEmail:
 *                       type: string
 *                       example: admin@greenfield.com
 *                     schoolAddress:
 *                       type: string
 *                       example: 12 Lagos Island, Lagos
 *                     schoolPhoneNumber:
 *                       type: string
 *                       example: "+2348029837465"
 *                     schoolUrl:
 *                       type: string
 *                       example: https://greenfield-academy.ucheva.com
 *                 schoolData:
 *                   type: object
 *                   properties:
 *                     schoolType:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["nursery", "primary"]
 *                     schoolLogoUrl:
 *                       type: string
 *                       example: https://res.cloudinary.com/sample/image/upload/v1/logo.png
 *                     schoolLogoPublicId:
 *                       type: string
 *                       example: sample/logo
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: profile not found
 */
// router.post('/profile', uploads.single('image'), checkAdmin, createProfile)
router.get('/profile', checkAdmin, getProfile)

/**
 * @swagger
 * /api/v1/admin/get-admin:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get admin details
 *     description: Retrieves the authenticated admin's profile details. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: admin retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 550e8400-e29b-41d4-a716-446655440000
 *                     schoolName:
 *                       type: string
 *                       example: Greenfield Academy
 *                     email:
 *                       type: string
 *                       example: admin@greenfield.com
 *                     address:
 *                       type: string
 *                       example: 12 Lagos Island, Lagos
 *                     phoneNumber:
 *                       type: string
 *                       example: "+2348029837465"
 *                     schoolUrl:
 *                       type: string
 *                       example: https://greenfield-academy.ucheva.com
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: unauthorized access
 *       404:
 *         description: Admin not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: admin not found
 */
router.get('/get-admin', checkAdmin, getAdmin)  

/**
 * @swagger
 * /api/v1/admin/wallet:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get admin wallet
 *     description: Retrieves the admin's wallet balance and transaction summary. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ""
 *                 getWallet:
 *                   type: object
 *                   properties:
 *                     paymentReceived:
 *                       type: integer
 *                       description: Total payments received
 *                       example: 50000
 *                     withdrawal:
 *                       type: integer
 *                       description: Total amount withdrawn
 *                       example: 10000
 *                     balance:
 *                       type: integer
 *                       description: Current wallet balance
 *                       example: 40000
 *                     totalTransaction:
 *                       type: integer
 *                       description: Total number of transactions
 *                       example: 15
 */
router.get('/wallet', checkAdmin, getWallet)

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get school dashboard summary
 *     description: Retrieves school-wide counts and percentages for students, staff, attendance, and collected fees.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: School dashboard summary retrieved successfully
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalStudents:
 *                       type: integer
 *                       example: 320
 *                     totalStaff:
 *                       type: integer
 *                       example: 45
 *                     totalStudentAttendancePercent:
 *                       type: number
 *                       format: float
 *                       example: 87.5
 *                     totalStaffAttendancePercent:
 *                       type: number
 *                       format: float
 *                       example: 91.11
 *                     totalFeesCollected:
 *                       type: number
 *                       format: double
 *                       example: 2540000
 */
router.get('/dashboard', checkAdmin, getSchoolDashboard)

router.get('/school-url', getAllSchoolsUrl)

/**
 * @swagger
 * /api/v1/admin/logout:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Admin logout
 *     description: Invalidates the admin session by deleting the JWT token from Redis. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: logout successful
 */
router.post('/logout', authenticate, logoutUser)



router.get('/today', authenticate, checkAdmin, getAllStaffAttendance)

module.exports = router
