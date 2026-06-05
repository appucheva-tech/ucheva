const router = require('express').Router();
const { createStaff } = require('../controller/staffController');
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
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         firstName:
 *           type: string
 *           example: James
 *         lastName:
 *           type: string
 *           example: Brown
 *         otherName:
 *           type: string
 *           example: Emmanuel
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           example: male
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1990-04-15"
 *         nationality:
 *           type: string
 *           enum: [nigerian, non-nigerian]
 *           example: nigerian
 *         address:
 *           type: string
 *           example: 5 Victoria Island, Lagos
 *         maritalStatus:
 *           type: string
 *           enum: [single, married, divorced, widowed]
 *           example: single
 *         phoneNumber:
 *           type: integer
 *           description: Staff phone number (stored as integer)
 *           example: 2348029837465
 *         email:
 *           type: string
 *           example: james.brown@example.com
 *         staffType:
 *           type: string
 *           enum: [teaching, non-teaching]
 *           example: teaching
 *         role:
 *           type: string
 *           example: teacher
 *         teachingType:
 *           type: string
 *           enum: [class teacher, subject teacher]
 *           description: Required only if staffType is teaching
 *           example: class teacher
 *         classAssigned:
 *           type: string
 *           description: Class the staff member is assigned to (auto-updated when class is created)
 *           example: Primary 3
 *         subjectAssigned:
 *           type: string
 *           description: Subject the staff member teaches
 *           example: Mathematics
 *         classesToTeach:
 *           type: string
 *           description: Comma-separated list of classes the staff member teaches
 *           example: "Primary 3, Primary 4"
 *         totalStudents:
 *           type: integer
 *           description: Total number of students assigned to this staff member
 *           example: 30
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
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - otherName
 *               - gender
 *               - dateOfBirth
 *               - nationality
 *               - address
 *               - maritalStatus
 *               - phoneNumber
 *               - email
 *               - staffType
 *               - role
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: James
 *               lastName:
 *                 type: string
 *                 example: Brown
 *               otherName:
 *                 type: string
 *                 example: Emmanuel
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: male
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1990-04-15"
 *               nationality:
 *                 type: string
 *                 enum: [nigerian, non-nigerian]
 *                 example: nigerian
 *               address:
 *                 type: string
 *                 example: 5 Victoria Island, Lagos
 *               maritalStatus:
 *                 type: string
 *                 enum: [single, married, divorced, widowed]
 *                 example: single
 *               phoneNumber:
 *                 type: integer
 *                 example: 2348029837465
 *               email:
 *                 type: string
 *                 example: james.brown@example.com
 *               staffType:
 *                 type: string
 *                 enum: [teaching, non-teaching]
 *                 example: teaching
 *               role:
 *                 type: string
 *                 example: teacher
 *               teachingType:
 *                 type: string
 *                 enum: [class teacher, subject teacher]
 *                 description: Required if staffType is teaching
 *                 example: class teacher
 *               classAssigned:
 *                 type: string
 *                 example: Primary 3
 *               subjectAssigned:
 *                 type: string
 *                 example: Mathematics
 *               classesToTeach:
 *                 type: string
 *                 example: "Primary 3, Primary 4"
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
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email is already in use
 */
router.post('/staff', authenticate, createStaffSchema, createStaff)

module.exports = router
