const router = require('express').Router();
const { createStudent, getAllStudents } = require('../controller/studentController');
const { checkAdmin } = require('../middleware/authenticator');
const { createStudentSchema } = require('../middleware/joiValidation');

/**
 * @swagger
 * tags:
 *   name: Student
 *   description: Student management (Admin only)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Student UUID
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         adminId:
 *           type: string
 *           format: uuid
 *           description: UUID of the admin who enrolled the student
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         staffId:
 *           type: string
 *           format: uuid
 *           description: UUID of the class teacher assigned to this student
 *           example: "550e8400-e29b-41d4-a716-446655440002"
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
 *           example: 10 Ikoyi Crescent, Lagos
 *         studentClass:
 *           type: string
 *           description: Class the student is enrolled in
 *           example: Primary 3A
 *         department:
 *           type: string
 *           description: Department (applicable for secondary students)
 *           example: Science
 *         session:
 *           type: integer
 *           description: Academic session year
 *           example: 2026
 *         parentGuardiansName:
 *           type: string
 *           description: Full name of the parent or guardian
 *           example: Mrs Folake Adeyemi
 *         relationship:
 *           type: string
 *           enum: [father, mother, guardian]
 *           description: Guardian's relationship to the student
 *           example: mother
 *         phoneNumber:
 *           type: integer
 *           description: Guardian's phone number (stored as integer)
 *           example: 8029837465
 *         email:
 *           type: string
 *           description: Guardian's email address (must be unique)
 *           example: guardian@example.com
 *         subjectsOffered:
 *           type: array
 *           description: Subjects the student offers (stored as JSON)
 *           items:
 *             type: string
 *           example: ["Mathematics", "English", "Basic Science"]
 *         attendanceStatus:
 *           type: string
 *           enum: [present, absent]
 *           example: present
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
 *           example: Tolu
 *         lastName:
 *           type: string
 *           example: Adeyemi
 *         otherName:
 *           type: string
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
 *           example: 10 Ikoyi Crescent, Lagos
 *         studentClass:
 *           type: string
 *           description: Class the student is enrolling into
 *           example: Primary 3A
 *         department:
 *           type: string
 *           description: Department (applicable for secondary students)
 *           example: Science
 *         session:
 *           type: integer
 *           description: Academic session year
 *           example: 2026
 *         parentGuardiansName:
 *           type: string
 *           example: Mrs Folake Adeyemi
 *         relationship:
 *           type: string
 *           enum: [father, mother, guardian]
 *           example: mother
 *         phoneNumber:
 *           type: integer
 *           description: Guardian's phone number
 *           example: 8029837465
 *         email:
 *           type: string
 *           description: Guardian's email address (must be unique)
 *           example: folake.adeyemi@example.com
 */

/**
 * @swagger
 * /api/v1/student/student:
 *   post:
 *     tags:
 *       - Student
 *     summary: Create a student
 *     description: >
 *       Admin enrolls a new student. The admin is identified from the authentication token.
 *       Guardian's email must be unique across all students. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
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
 *             studentClass: Primary 3A
 *             department: Science
 *             session: 2026
 *             parentGuardiansName: Mrs Folake Adeyemi
 *             relationship: mother
 *             phoneNumber: 8029837465
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
router.post('/student', checkAdmin, createStudentSchema, createStudent)

/**
 * @swagger
 * /api/v1/student/getAllStudents:
 *   get:
 *     tags:
 *       - Student
 *     summary: Get all students
 *     description: Retrieves all student records. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Students retrieved successfully
 *                 students:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *       401:
 *         description: Missing or invalid authentication token
 *       404:
 *         description: Admin not found
 */
router.get('/getAllStudents', checkAdmin, getAllStudents)

module.exports = router;
