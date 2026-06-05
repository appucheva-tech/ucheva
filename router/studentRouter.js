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
 *       required:
 *         - id
 *         - firstName
 *         - lastName
 *         - otherName
 *         - gender
 *         - dateOfBirth
 *         - nationality
 *         - address
 *         - studentClass
 *         - department
 *         - session
 *         - parentGuardiansName
 *         - relationship
 *         - phoneNumber
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Student ID
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Tolu
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Adeyemi
 *         otherName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Grace
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           example: female
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "2015-08-20"
 *         nationality:
 *           type: string
 *           enum: [nigerian, non-nigerian]
 *           example: nigerian
 *         address:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           example: 10 Ikoyi Crescent, Lagos
 *         studentClass:
 *           type: string
 *           maxLength: 50
 *           example: Primary 5
 *         department:
 *           type: string
 *           maxLength: 100
 *           example: Science
 *         relationship:
 *           type: string
 *           enum: [father, mother, guardian]
 *           description: Guardian's relationship to student
 *           example: mother
 *         phoneNumber:
 *           type: string
 *           pattern: "^[0-9]{7,15}$"
 *           description: Guardian's phone number
 *           example: "08029837465"
 *         email:
 *           type: string
 *           format: email
 *           description: Guardian's email address
 *           example: guardian@example.com
 *         parentGuardiansName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: Mrs Adeyemi
 *         session:
 *           type: integer
 *           description: Academic session
 *           example: 2026
 *     CreateStudentRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - otherName
 *         - gender
 *         - dateOfBirth
 *         - nationality
 *         - address
 *         - studentClass
 *         - department
 *         - session
 *         - parentGuardiansName
 *         - relationship
 *         - phoneNumber
 *         - email
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Tolu
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Adeyemi
 *         otherName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Grace
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           example: female
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "2015-08-20"
 *         nationality:
 *           type: string
 *           enum: [nigerian, non-nigerian]
 *           example: nigerian
 *         address:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           example: 10 Ikoyi Crescent, Lagos
 *         studentClass:
 *           type: string
 *           maxLength: 50
 *           example: Primary 5
 *         department:
 *           type: string
 *           maxLength: 100
 *           example: Science
 *         session:
 *           type: integer
 *           minimum: 1900
 *           maximum: 3000
 *           example: 2026
 *         parentGuardiansName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: Mrs Folake Adeyemi
 *         relationship:
 *           type: string
 *           enum: [father, mother, guardian]
 *           example: mother
 *         phoneNumber:
 *           type: string
 *           pattern: "^[0-9]{7,15}$"
 *           example: "08029837465"
 *         email:
 *           type: string
 *           format: email
 *           example: folake.adeyemi@example.com
 */

/**
 * @swagger
 * /api/v1/student/student/{id}:
 *   post:
 *     tags:
 *       - Student
 *     summary: Create a student
 *     description: Creates a new student record. Requires an admin bearer token.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Admin ID route parameter.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "6f1d0b5f-8f2c-4db6-9f4b-8f0b3f3a9b12"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudentRequest'
 *           example:
 *             firstName: Tolu
 *             lastName: Adeyemi
 *             otherName: Grace
 *             gender: female
 *             dateOfBirth: "2015-08-20"
 *             nationality: nigerian
 *             address: 10 Ikoyi Crescent, Lagos
 *             studentClass: Primary 5
 *             department: Science
 *             session: 2026
 *             parentGuardiansName: Mrs Folake Adeyemi
 *             relationship: mother
 *             phoneNumber: "08029837465"
 *             email: folake.adeyemi@example.com
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
 *         description: Validation failed or email already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "\"studentClass\" is required"
 *       401:
 *         description: Missing or invalid authentication token
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
