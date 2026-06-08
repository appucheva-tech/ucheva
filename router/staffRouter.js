const router = require('express').Router();
const {createStaff, updateStaff, getStaff, getAllStaff, createPassword} = require('../controller/staffController');
const { authenticate, checkStaff, checkAdmin } = require('../middleware/authenticator');
const { createStaffSchema } = require('../middleware/joiValidation')
const upload = require('../middleware/multer')



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
 *           type: uuid
 *           description: Staff ID
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         adminId:
 *           type: uuid
 *           description: Admin who created the staff record
 *           example: "550e8400-e29b-41d4-a716-446655440000"
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
 *           example: male
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1990-04-15"
 *         nationality:
 *           type: string
 *           example: Nigerian
 *         address:
 *           type: string
 *           example: 5 Victoria Island, Lagos
 *         maritalStatus:
 *           type: string
 *           example: single
 *         phoneNumber:
 *           type: string
 *           example: "+2348029837465"
 *         email:
 *           type: string
 *           example: james.brown@example.com
 *         staffType:
 *           type: string
 *           example: teaching
 *         role:
 *           type: string
 *           example: teacher
 *         teachingType:
 *           type: string
 *           description: Type of teaching role (e.g. class teacher, subject teacher)
 *           example: class teacher
 *         classAssigned:
 *           type: string
 *           description: Class the staff member is assigned to
 *           example: Primary 3
 *         subjectAssigned:
 *           type: string
 *           description: Subject the staff member teaches
 *           example: Mathematics
 *         classesToTeach:
 *           type: array
 *           items:
 *             type: string
 *           description: List of classes the staff member teaches
 *           example: ["Primary 3", "Primary 4"]
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
 *                 example: male
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1990-04-15"
 *               nationality:
 *                 type: string
 *                 example: Nigerian
 *               address:
 *                 type: string
 *                 example: 5 Victoria Island, Lagos
 *               maritalStatus:
 *                 type: string
 *                 example: single
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348029837465"
 *               email:
 *                 type: string
 *                 example: james.brown@example.com
 *               staffType:
 *                 type: string
 *                 example: teaching
 *               role:
 *                 type: string
 *                 example: teacher
 *               teachingType:
 *                 type: string
 *                 example: class teacher
 *               classAssigned:
 *                 type: string
 *                 example: Primary 3
 *               subjectAssigned:
 *                 type: string
 *                 example: Mathematics
 *               classesToTeach:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Primary 3", "Primary 4"]
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
router.post('/staff', checkAdmin, createStaffSchema, createStaff)
router.get('/staff', checkAdmin, checkStaff, getStaff)
router.get('/staffs', checkAdmin, getAllStaff)
router.post('/create-password/:token', checkStaff, createPassword)

router.put('/staff', checkStaff,  upload.fields([
        { name: 'profilePicture', maxCount: 1 },
        { name: 'signature', maxCount: 1 }
    ]), updateStaff)

module.exports = router
