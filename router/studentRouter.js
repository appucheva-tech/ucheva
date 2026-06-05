const router = require('express').Router();
const {createStudent} = require('../controller/studentController');
const { checkAdmin } = require('../middleware/authenticator');
const { createStudentSchema } = require('../middleware/joiValidation');

/**
 * @swagger
 * tags:
 *   name: Student
 *   description: Student management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         id:
 *           type: uuid
 *           description: Student ID
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         firstName:
 *           type: string
 *           example: Tolu
 *         lastName:
 *           type: string
 *           example: Adeyemi
 *         otherName:
 *           type: string
 *           example: Grace
 *         gender:
 *           type: string
 *           example: female
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "2015-08-20"
 *         nationality:
 *           type: string
 *           example: Nigerian
 *         address:
 *           type: string
 *           example: 10 Ikoyi Crescent, Lagos
 *         relationship:
 *           type: string
 *           description: Guardian's relationship to student
 *           example: mother
 *         phoneNumber:
 *           type: string
 *           description: Guardian's phone number
 *           example: "+2348029837465"
 *         email:
 *           type: string
 *           description: Guardian's email address
 *           example: guardian@example.com
 *         guardianParentName:
 *           type: string
 *           example: Mrs Adeyemi
 *         session:
 *           type: string
 *           description: Academic session
 *           example: "2025/2026"
 */

/**
 * @swagger
 * /api/v1/student/student/{id}:
 *   post:
 *     tags:
 *       - Student
 *     summary: Create a student
 *     description: Creates a new student record under the specified admin. The admin ID is passed as a URL parameter and verified before creating the student.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The Admin ID
 *         schema:
 *           type: string
 *           example: 1
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
 *               - relationship
 *               - phoneNumber
 *               - email
 *               - guardianParentName
 *               - session
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Tolu
 *               lastName:
 *                 type: string
 *                 example: Adeyemi
 *               otherName:
 *                 type: string
 *                 example: Grace
 *               gender:
 *                 type: string
 *                 example: female
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "2015-08-20"
 *               nationality:
 *                 type: string
 *                 example: Nigerian
 *               address:
 *                 type: string
 *                 example: 10 Ikoyi Crescent, Lagos
 *               relationship:
 *                 type: string
 *                 description: Guardian's relationship to the student
 *                 example: mother
 *               phoneNumber:
 *                 type: string
 *                 description: Guardian's phone number
 *                 example: "+2348029837465"
 *               email:
 *                 type: string
 *                 description: Guardian's email address
 *                 example: guardian@example.com
 *               guardianParentName:
 *                 type: string
 *                 example: Mrs Adeyemi
 *               session:
 *                 type: string
 *                 description: Academic session
 *                 example: "2025/2026"
 *     responses:
 *       201:
 *         description: Student created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Student created successfully
 *                 student:
 *                   $ref: '#/components/schemas/Student'
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
router.post('/student/:id', checkAdmin, createStudentSchema, createStudent)

module.exports = router;
