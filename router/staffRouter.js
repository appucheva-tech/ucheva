const router = require('express').Router();
const {createStaff ,getAllStaff} = require('../controller/staffController');
const { authenticate } = require('../middleware/authenticator');
const { createStaffSchema } = require('../middleware/joiValidation')

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
 *       required:
 *         - id
 *         - adminId
 *         - firstName
 *         - lastName
 *         - otherName
 *         - gender
 *         - dateOfBirth
 *         - nationality
 *         - address
 *         - maritalStatus
 *         - phoneNumber
 *         - email
 *         - staffType
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Staff ID
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         adminId:
 *           type: string
 *           format: uuid
 *           description: Admin who created the staff record
 *           example: "6f1d0b5f-8f2c-4db6-9f4b-8f0b3f3a9b12"
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: James
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Brown
 *         otherName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
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
 *           minLength: 3
 *           maxLength: 255
 *           example: 15 Adeola Odeku Street, Victoria Island, Lagos
 *         maritalStatus:
 *           type: string
 *           enum: [single, married, divorced, widowed]
 *           example: single
 *         phoneNumber:
 *           type: string
 *           pattern: "^[0-9]{7,15}$"
 *           example: "08029837465"
 *         email:
 *           type: string
 *           format: email
 *           example: james.brown@example.com
 *         staffType:
 *           type: string
 *           enum: [teaching, non-teaching]
 *           example: teaching
 *         role:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: teacher
 *         teachingType:
 *           type: string
 *           enum: [class teacher, subject teacher]
 *           description: Type of teaching role (e.g. class teacher, subject teacher)
 *           example: class teacher
 *         classAssigned:
 *           type: string
 *           maxLength: 50
 *           description: Class the staff member is assigned to
 *           example: Primary 3
 *         subjectAssigned:
 *           type: string
 *           maxLength: 100
 *           description: Subject the staff member teaches
 *           example: Mathematics
 *         classesToTeach:
 *           type: string
 *           maxLength: 255
 *           description: List of classes the staff member teaches
 *           example: "Primary 3, Primary 4"
 *     CreateStaffRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - otherName
 *         - gender
 *         - dateOfBirth
 *         - nationality
 *         - address
 *         - maritalStatus
 *         - phoneNumber
 *         - email
 *         - staffType
 *         - role
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: James
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Brown
 *         otherName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
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
 *           minLength: 3
 *           maxLength: 255
 *           example: 15 Adeola Odeku Street, Victoria Island, Lagos
 *         maritalStatus:
 *           type: string
 *           enum: [single, married, divorced, widowed]
 *           example: single
 *         phoneNumber:
 *           type: string
 *           pattern: "^[0-9]{7,15}$"
 *           example: "08029837465"
 *         email:
 *           type: string
 *           format: email
 *           example: james.brown@example.com
 *         staffType:
 *           type: string
 *           enum: [teaching, non-teaching]
 *           example: teaching
 *         role:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: Mathematics Teacher
 *         teachingType:
 *           type: string
 *           enum: [class teacher, subject teacher]
 *           description: Required when staffType is teaching.
 *           example: subject teacher
 *         classAssigned:
 *           type: string
 *           maxLength: 50
 *           description: Required when teachingType is class teacher.
 *           example: Primary 3
 *         subjectAssigned:
 *           type: string
 *           maxLength: 100
 *           description: Required when teachingType is subject teacher.
 *           example: Mathematics
 *         classesToTeach:
 *           type: string
 *           maxLength: 255
 *           description: Required when teachingType is subject teacher.
 *           example: "Primary 3, Primary 4"
 */

/**
 * @swagger
 * /api/v1/staff/staff:
 *   post:
 *     tags:
 *       - Staff
 *     summary: Create a staff member
 *     description: Admin creates a new staff record. Requires authentication.
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
 *                 staffType: teaching
 *                 role: Mathematics Teacher
 *                 teachingType: subject teacher
 *                 subjectAssigned: Mathematics
 *                 classesToTeach: "Primary 3, Primary 4"
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
 *                 staffType: non-teaching
 *                 role: Accountant
 *     responses:
 *       201:
 *         description: Staff created successfully
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
 *         description: Validation failed or email already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "\"phoneNumber\" must contain 7 to 15 digits"
 *       401:
 *         description: Missing or invalid authentication token
 */
router.post('/staff', authenticate, createStaffSchema, createStaff)

/**
 * @swagger
 * /api/v1/staff/getAllStaff:
 *   get:
 *     tags:
 *       - Staff
 *     summary: Get all staff
 *     description: Retrieves all staff records. Requires authentication.
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Staff'
 *       401:
 *         description: Missing or invalid authentication token
 */
router.get('/getAllStaff', authenticate, getAllStaff)

module.exports = router
