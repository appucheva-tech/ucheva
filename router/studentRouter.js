const router = require('express').Router();
const { createStudent, getAllStudents, parentSettings, parentDashboard } = require('../controller/studentController');
const { authenticate, checkAdmin } = require('../middleware/authenticator');
const { createStudentSchema } = require('../middleware/joiValidation');
const upload = require('../middleware/multer');

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
 *         parentFirstName:
 *           type: string
 *           description: Parent or guardian first name used in parent settings
 *           example: Folake
 *         parentLastName:
 *           type: string
 *           description: Parent or guardian last name used in parent settings
 *           example: Adeyemi
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
 *         parentProfileUrl:
 *           type: string
 *           description: Cloudinary URL for the parent profile picture
 *           example: https://res.cloudinary.com/sample/image/upload/v1/parent.jpg
 *         parentProfilePublicId:
 *           type: string
 *           description: Cloudinary public ID for the parent profile picture
 *           example: sample/parent
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

/**
 * @swagger
 * /api/v1/student/parent-settings/{studentId}:
 *   put:
 *     tags:
 *       - Student
 *     summary: Update parent settings
 *     description: >
 *       Updates parent profile information stored on a student record. Supports parent name,
 *       phone number, email address, home address, optional password change, and profile picture upload.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Student UUID linked to the parent profile
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               parentFirstName:
 *                 type: string
 *                 example: Tolu
 *               parentLastName:
 *                 type: string
 *                 example: Adesunya
 *               parentGuardiansName:
 *                 type: string
 *                 description: Optional full parent/guardian name. If omitted, it is built from first and last name.
 *                 example: Tolu Adesunya
 *               phoneNumber:
 *                 type: string
 *                 example: "+234 801 234 5678"
 *               parentGuardiansEmail:
 *                 type: string
 *                 format: email
 *                 example: toluadesunya@gmail.com
 *               parentGuardiansAddress:
 *                 type: string
 *                 example: 12 Unity Avenue, Jefferson Avenue Road, Ikoyi Lagos
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 description: Required only when changing an existing parent password
 *               newPassword:
 *                 type: string
 *                 format: password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Parent profile image. PNG or JPG, max 7MB.
 *     responses:
 *       200:
 *         description: Parent settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Parent settings updated successfully
 *                 parent:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                       format: uuid
 *                     parentFirstName:
 *                       type: string
 *                       example: Tolu
 *                     parentLastName:
 *                       type: string
 *                       example: Adesunya
 *                     parentGuardiansName:
 *                       type: string
 *                       example: Tolu Adesunya
 *                     phoneNumber:
 *                       type: string
 *                       example: "+234 801 234 5678"
 *                     parentGuardiansEmail:
 *                       type: string
 *                       example: toluadesunya@gmail.com
 *                     parentGuardiansAddress:
 *                       type: string
 *                       example: 12 Unity Avenue, Jefferson Avenue Road, Ikoyi Lagos
 *                     parentProfileUrl:
 *                       type: string
 *                     parentProfilePublicId:
 *                       type: string
 *       400:
 *         description: Invalid password fields or upload validation error
 *       404:
 *         description: Student not found
 */
router.put('/parent-settings/:studentId', authenticate, upload.single('profilePicture'), parentSettings)

/**
 * @swagger
 * /api/v1/student/parent-dashboard/{studentId}:
 *   get:
 *     tags:
 *       - Student
 *     summary: Get parent dashboard
 *     description: >
 *       Returns the parent dashboard data for one student, including greeting details,
 *       student summary, fee/payment history, and monthly attendance percentage.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Student UUID linked to the parent dashboard
 *       - in: query
 *         name: month
 *         required: false
 *         schema:
 *           type: string
 *           example: "2026-04"
 *         description: Month to calculate attendance for. Format is YYYY-MM. Defaults to the current month.
 *       - in: query
 *         name: currentTerm
 *         required: false
 *         schema:
 *           type: string
 *           example: First Term
 *         description: Current academic term to show on the dashboard and payment rows.
 *     responses:
 *       200:
 *         description: Parent dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Parent dashboard retrieved successfully
 *                 dashboard:
 *                   type: object
 *                   properties:
 *                     greeting:
 *                       type: string
 *                       example: Good morning, Mrs Ola
 *                     parent:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: Mrs Ola
 *                         firstName:
 *                           type: string
 *                           example: Ola
 *                         lastName:
 *                           type: string
 *                           example: Adeyemi
 *                         email:
 *                           type: string
 *                           example: ola@example.com
 *                         phoneNumber:
 *                           type: string
 *                           example: "+234 801 234 5678"
 *                         address:
 *                           type: string
 *                           example: 12 Unity Avenue, Ikoyi Lagos
 *                         profileUrl:
 *                           type: string
 *                     student:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                           example: Efe Ogeremu
 *                         class:
 *                           type: string
 *                           example: JSS1A
 *                         admissionNumber:
 *                           type: string
 *                           example: STD/2026/000001
 *                         feeStatus:
 *                           type: string
 *                           example: full payment
 *                         attendanceStatus:
 *                           type: string
 *                           example: present
 *                         currentTerm:
 *                           type: string
 *                           example: First Term
 *                         session:
 *                           type: string
 *                           example: 2025/2026
 *                     paymentHistory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           date:
 *                             type: string
 *                             example: Apr 28, 2026
 *                           term:
 *                             type: string
 *                             example: Third Term
 *                           amount:
 *                             type: number
 *                             example: 50000
 *                           currency:
 *                             type: string
 *                             example: NGN
 *                           status:
 *                             type: string
 *                             example: success
 *                           reference:
 *                             type: string
 *                     monthlyAttendance:
 *                       type: object
 *                       properties:
 *                         month:
 *                           type: string
 *                           example: April 2026
 *                         percentage:
 *                           type: number
 *                           example: 96.4
 *                         presentDays:
 *                           type: integer
 *                           example: 18
 *                         absentDays:
 *                           type: integer
 *                           example: 1
 *                         totalDays:
 *                           type: integer
 *                           example: 19
 *       400:
 *         description: Invalid month format
 *       404:
 *         description: Student not found
 */
router.get('/parent-dashboard/:studentId', authenticate, parentDashboard)

module.exports = router;
