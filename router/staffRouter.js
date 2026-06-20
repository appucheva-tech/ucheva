const router = require('express').Router();
const { createStaff, updateStaff, getStaff, getAllStaff, getStaffSummary, createPassword, changePassword, getStaffByAdmin } = require('../controller/staffController');
const { authenticate, checkStaff, checkAdmin, checkInvite } = require('../middleware/authenticator');
const { createStaffSchema } = require('../middleware/joiValidation')
const upload = require('../middleware/multer');
const { rateLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Staff management (Admin only)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Staff:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Staff UUID
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         adminId:
 *           type: string
 *           format: uuid
 *           description: UUID of the admin who created the staff record
 *           example: "6f1d0b5f-8f2c-4db6-9f4b-8f0b3f3a9b12"
 *         firstName:
 *           type: string
 *           example: James
 *         lastName:
 *           type: string
 *           example: Brown
 *         otherName:
 *           type: string
 *           example: Chinedu
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           example: male
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1991-04-15"
 *         nationality:
 *           type: string
 *           enum: [nigerian, non-nigerian]
 *           example: nigerian
 *         address:
 *           type: string
 *           example: 15 Adeola Odeku Street, Victoria Island, Lagos
 *         maritalStatus:
 *           type: string
 *           enum: [single, married, divorced, widowed]
 *           example: single
 *         phoneNumber:
 *           type: integer
 *           description: Staff phone number (stored as integer)
 *           example: 8029837465
 *         email:
 *           type: string
 *           format: email
 *           example: james.brown@example.com
 *         staffType:
 *           type: string
 *           enum: [teaching staff, non-teaching staff]
 *           example: teaching staff
 *         staffRole:
 *           type: string
 *           enum: [teacher, bursary, security]
 *           description: Role assigned within the staff group
 *           example: teacher
 *         role:
 *           type: string
 *           enum: [staff, admin]
 *           example: staff
 *         teacherType:
 *           type: string
 *           enum: [class teacher, subject teacher]
 *           description: Required only if staffRole is teacher
 *           example: class teacher
 *         classAssigned:
 *           type: string
 *           description: Class assigned when staff member is a class teacher
 *           example: Primary 3
 *         subjectAssigned:
 *           type: array
 *           description: Subjects assigned to the staff member (stored as JSON)
 *           items:
 *             type: string
 *           example: ["Mathematics", "Physics"]
 *         classesToTeach:
 *           type: string
 *           description: Comma-separated list of classes the staff member teaches
 *           example: "Primary 3, Primary 4"
 *         qualification:
 *           type: string
 *           example: B.Sc. Education
 *         totalStudents:
 *           type: integer
 *           example: 30
 *         staffUrl:
 *           type: string
 *           description: Cloudinary URL of the staff profile picture
 *           example: https://res.cloudinary.com/sample/image/upload/v1/staff.jpg
 *         staffPublicId:
 *           type: string
 *           example: sample/staff
 *         signatureUrl:
 *           type: string
 *           description: Cloudinary URL of the staff signature
 *           example: https://res.cloudinary.com/sample/image/upload/v1/signature.jpg
 *         signaturePublicId:
 *           type: string
 *           example: sample/signature
 *         isActive:
 *           type: boolean
 *           description: Whether the staff member has activated their account via the invite link
 *           example: false
 *     CreateStaffRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - gender
 *         - dateOfBirth
 *         - nationality
 *         - address
 *         - maritalStatus
 *         - phoneNumber
 *         - email
 *         - staffType
 *         - staffRole
 *         - qualification
 *       properties:
 *         firstName:
 *           type: string
 *           example: James
 *         lastName:
 *           type: string
 *           example: Brown
 *         otherName:
 *           type: string
 *           example: Chinedu
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           example: male
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1991-04-15"
 *         nationality:
 *           type: string
 *           enum: [nigerian, non-nigerian]
 *           example: nigerian
 *         address:
 *           type: string
 *           example: 15 Adeola Odeku Street, Victoria Island, Lagos
 *         maritalStatus:
 *           type: string
 *           enum: [single, married, divorced, widowed]
 *           example: single
 *         phoneNumber:
 *           type: string
 *           example: 8029837465
 *         email:
 *           type: string
 *           format: email
 *           example: james.brown@example.com
 *         staffType:
 *           type: string
 *           enum: [teaching staff, non-teaching staff]
 *           example: teaching staff
 *         staffRole:
 *           type: string
 *           enum: [teacher, bursary, security]
 *           example: teacher
 *         qualification:
 *           type: string
 *           example: B.Sc. Education
 *         teacherType:
 *           type: string
 *           enum: [class teacher, subject teacher]
 *           description: Required when staffRole is teacher
 *           example: subject teacher
 *         classAssigned:
 *           type: string
 *           description: Required when teacherType is class teacher
 *           example: Primary 3
 *         subjectAssigned:
 *           type: array
 *           description: Required when teacherType is subject teacher
 *           items:
 *             type: string
 *           example: ["Mathematics", "Physics"]
 *         classesToTeach:
 *           type: string
 *           description: Required when teacherType is subject teacher
 *           example: "Primary 3, Primary 4"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Staff:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Staff UUID
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         adminId:
 *           type: string
 *           format: uuid
 *           description: UUID of the admin who created the staff record
 *           example: "6f1d0b5f-8f2c-4db6-9f4b-8f0b3f3a9b12"
 *         firstName:
 *           type: string
 *           example: James
 *         lastName:
 *           type: string
 *           example: Brown
 *         otherName:
 *           type: string
 *           example: Chinedu
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           example: male
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1991-04-15"
 *         nationality:
 *           type: string
 *           enum: [nigerian, non-nigerian]
 *           example: nigerian
 *         address:
 *           type: string
 *           example: 15 Adeola Odeku Street, Victoria Island, Lagos
 *         maritalStatus:
 *           type: string
 *           enum: [single, married, divorced, widowed]
 *           example: single
 *         phoneNumber:
 *           type: string
 *           description: Staff phone number
 *           example: "08029837465"
 *         email:
 *           type: string
 *           format: email
 *           example: james.brown@example.com
 *         staffType:
 *           type: string
 *           enum: [teaching staff, non-teaching staff]
 *           example: teaching staff
 *         staffRole:
 *           type: string
 *           enum: [teacher, bursary, security]
 *           example: teacher
 *         role:
 *           type: string
 *           example: staff
 *         teacherType:
 *           type: string
 *           enum: [class teacher, subject teacher]
 *           description: Required only if staffRole is teacher
 *           example: class teacher
 *         classAssigned:
 *           type: string
 *           description: Class assigned to the staff member
 *           example: Primary 3
 *         subjectAssigned:
 *           type: array
 *           description: Subjects assigned to the staff member
 *           items:
 *             type: string
 *           example: ["Mathematics", "Physics"]
 *         classesToTeach:
 *           type: array
 *           items:
 *             type: string
 *           description: Classes the staff member teaches
 *           example: ["Primary 3", "Primary 4"]
 *         totalStudents:
 *           type: integer
 *           example: 30
 *         department:
 *           type: string
 *           example: Science
 *         qualification:
 *           type: string
 *           example: B.Ed Mathematics
 *         staffProfileUrl:
 *           type: string
 *           example: https://res.cloudinary.com/sample/image/upload/v1/staff.jpg
 *         staffProfilePublicId:
 *           type: string
 *           example: sample/staff
 *         staffUrl:
 *           type: string
 *           description: Cloudinary URL of the staff profile picture
 *           example: https://res.cloudinary.com/sample/image/upload/v1/staff.jpg
 *         staffPublicId:
 *           type: string
 *           example: sample/staff
 *         signatureUrl:
 *           type: string
 *           description: Cloudinary URL of the staff signature
 *           example: https://res.cloudinary.com/sample/image/upload/v1/signature.jpg
 *         signaturePublicId:
 *           type: string
 *           example: sample/signature
 *         isActive:
 *           type: boolean
 *           example: false
 *         isVerified:
 *           type: boolean
 *           example: false
 *     CreateStaffRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - gender
 *         - dateOfBirth
 *         - nationality
 *         - address
 *         - maritalStatus
 *         - phoneNumber
 *         - email
 *         - staffType
 *         - staffRole
 *         - qualification
 *       properties:
 *         firstName:
 *           type: string
 *           example: James
 *         lastName:
 *           type: string
 *           example: Brown
 *         otherName:
 *           type: string
 *           example: Chinedu
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           example: male
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1991-04-15"
 *         nationality:
 *           type: string
 *           enum: [nigerian, non-nigerian]
 *           example: nigerian
 *         address:
 *           type: string
 *           example: 15 Adeola Odeku Street, Victoria Island, Lagos
 *         maritalStatus:
 *           type: string
 *           enum: [single, married, divorced, widowed]
 *           example: single
 *         phoneNumber:
 *           type: string
 *           example: "08029837465"
 *         email:
 *           type: string
 *           format: email
 *           example: james.brown@example.com
 *         staffType:
 *           type: string
 *           enum: [teaching staff, non-teaching staff]
 *           example: teaching staff
 *         staffRole:
 *           type: string
 *           enum: [teacher, bursary, security]
 *           example: teacher
 *         teacherType:
 *           type: string
 *           enum: [class teacher, subject teacher]
 *           description: Required when staffRole is teacher
 *           example: subject teacher
 *         classAssigned:
 *           type: string
 *           description: Required when teacherType is class teacher
 *           example: Primary 3
 *         subjectAssigned:
 *           type: array
 *           items:
 *             type: string
 *           description: Required when teacherType is subject teacher
 *           example: ["Mathematics", "Physics"]
 *         classesToTeach:
 *           type: array
 *           items:
 *             type: string
 *           description: Required when teacherType is subject teacher
 *           example: ["Primary 3", "Primary 4"]
 *         department:
 *           type: string
 *           example: Science
 *         qualification:
 *           type: string
 *           example: B.Ed Mathematics
 */

/**
 * @swagger
 * /api/v1/staff/staff:
 *   post:
 *     tags:
 *       - Staff
 *     summary: Create a staff member
 *     description: >
 *       Admin creates a new staff record. An invite email with a password-creation link
 *       is automatically sent to the staff's email address on successful creation.
 *       Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStaffRequest'
 *           examples:
 *             subjectTeacher:
 *               summary: Teaching staff - subject teacher
 *               value:
 *                 firstName: James
 *                 lastName: Brown
 *                 otherName: Chinedu
 *                 gender: male
 *                 dateOfBirth: "1991-04-15"
 *                 nationality: nigerian
 *                 address: 15 Adeola Odeku Street, Victoria Island, Lagos
 *                 maritalStatus: single
 *                 phoneNumber: "08029837465"
 *                 email: james.brown@example.com
 *                 staffType: teaching staff
 *                 staffRole: teacher
 *                 teacherType: subject teacher
 *                 subjectAssigned: ["Mathematics", "Physics"]
 *                 classesToTeach: ["Primary 3", "Primary 4"]
 *                 qualification: B.Ed Mathematics
 *                 department: Science
 *             nonTeachingStaff:
 *               summary: Non-teaching staff
 *               value:
 *                 firstName: Aisha
 *                 lastName: Musa
 *                 otherName: Halima
 *                 gender: female
 *                 dateOfBirth: "1988-11-02"
 *                 nationality: nigerian
 *                 address: 22 Allen Avenue, Ikeja, Lagos
 *                 maritalStatus: married
 *                 phoneNumber: "08123456789"
 *                 email: aisha.musa@example.com
 *                 staffType: non-teaching staff
 *                 staffRole: bursary
 *                 qualification: B.Sc Accounting
 *                 department: Bursary
 *     responses:
 *       201:
 *         description: Staff created successfully and invite email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff created successfully
 *                 staff:
 *                   $ref: '#/components/schemas/Staff'
 *       400:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email is already in use
 *       401:
 *         description: Missing or invalid authentication token
 *   get:
 *     tags:
 *       - Staff
 *     summary: Get a single staff member
 *     description: Retrieves the authenticated staff member's own record. Requires staff authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff retrieved successfully
 *                 staff:
 *                   $ref: '#/components/schemas/Staff'
 *       404:
 *         description: Staff not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff not found
 *   put:
 *     tags:
 *       - Staff
 *     summary: Update staff profile
 *     description: >
 *       Allows a staff member to update their name and upload a profile picture and signature.
 *       Both image files are uploaded to Cloudinary. Requires staff authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: James
 *               lastName:
 *                 type: string
 *                 example: Brown
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Staff profile picture image file
 *               signature:
 *                 type: string
 *                 format: binary
 *                 description: Staff signature image file
 *     responses:
 *       200:
 *         description: Staff updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff updated successfully
 *                 staff:
 *                   $ref: '#/components/schemas/Staff'
 *       404:
 *         description: Staff not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff not found
 *       500:
 *         description: Image upload failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: profile picture upload failed
 */
router.post('/staff', checkAdmin, createStaffSchema, createStaff)
router.get('/staff', checkStaff, getStaff)

/**
 * @swagger
 * /api/v1/staff/staff/{id}:
 *   get:
 *     tags:
 *       - Staff
 *     summary: Get a staff member by ID
 *     description: Retrieves a specific staff member by UUID. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Staff UUID
 *     responses:
 *       200:
 *         description: Staff retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff retrieved successfully
 *                 staff:
 *                   $ref: '#/components/schemas/Staff'
 *       401:
 *         description: Missing or invalid authentication token
 *       404:
 *         description: Staff not found
 */
router.get('/staff/:id', checkAdmin, getStaffByAdmin)
router.put('/staff', checkStaff, upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'signature', maxCount: 1 }
]), updateStaff)

/**
 * @swagger
 * /api/v1/staff/staffs:
 *   get:
 *     tags:
 *       - Staff
 *     summary: Get all staff members
 *     description: Retrieves all staff records. Requires admin authentication. Supply the school's subdomain (schoolUrl) via the `x-tenant` header to scope results to a specific school.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-tenant
 *         required: true
 *         description: "School subdomain (schoolUrl). Example: greenfield-academy"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff retrieved successfully
 *                 staff:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Staff'
 *       400:
 *         description: Missing or invalid x-tenant header
 *       401:
 *         description: Missing or invalid authentication token
 */
router.get('/staffs', checkAdmin, getAllStaff)

/**
 * @swagger
 * /api/v1/staff/summary:
 *   get:
 *     tags:
 *       - Staff
 *     summary: Get staff summary counts
 *     description: Retrieves school-wide staff counts for total staff, teaching staff, non-teaching staff, and class teachers. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff summary retrieved successfully
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalStaff:
 *                       type: integer
 *                       example: 38
 *                     totalTeachingStaff:
 *                       type: integer
 *                       example: 28
 *                     totalNonTeachingStaff:
 *                       type: integer
 *                       example: 10
 *                     totalClassTeachers:
 *                       type: integer
 *                       example: 32
 */
router.get('/summary', checkAdmin, getStaffSummary)

/**
 * @swagger
 * /api/v1/staff/create-password/{token}:
 *   post:
 *     tags:
 *       - Staff
 *     summary: Staff account activation
 *     description: >
 *       Allows a staff member to create their password using the invite link sent to their email.
 *       The token in the URL is a signed JWT that identifies the staff member.
 *       Once activated, the staff account's isActive flag is set to true.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: JWT invite token from the staff's email invite link
 *         schema:
 *           type: string
 *           example: jwt.invite.token.here
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmPassword
 *             properties:
 *               password:
 *                 type: string
 *                 example: StaffPass@123
 *               confirmPassword:
 *                 type: string
 *                 example: StaffPass@123
 *     responses:
 *       200:
 *         description: Password created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password created successfully
 *       400:
 *         description: Account already activated or invalid/expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account already activated
 *       404:
 *         description: Staff not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff not found
 */
router.post('/create-password/:token', checkInvite, createPassword);

/**
 * @swagger
 * /api/v1/staff/change-password:
 *   put:
 *     tags:
 *       - Staff
 *     summary: Change staff password
 *     description: Allows an authenticated staff member to change their password. Requires staff login and current password verification.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: CurrentPass@123
 *               newPassword:
 *                 type: string
 *                 example: NewPass@123
 *               confirmPassword:
 *                 type: string
 *                 example: NewPass@123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *       400:
 *         description: Invalid request or passwords do not match
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - current password incorrect or unauthorized
 *       404:
 *         description: Staff not found
 */
router.put('/change-password', rateLimiter , checkStaff, changePassword)

module.exports = router
