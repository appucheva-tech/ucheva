const router = require('express').Router()
const { classTeacherDashboard, markAttendance, classTeacherSettings } = require('../controller/classTeacherController')
const { createScores } = require('../controller/scoresController')
const { checkClassTeacher, checkStaff } = require('../middleware/authenticator')

/**
 * @swagger
 * tags:
 *   name: ClassTeacher
 *   description: Class teacher dashboard and score management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ScoreRecord:
 *       type: object
 *       required:
 *         - studentId
 *         - continuousAssessment
 *         - exam
 *       properties:
 *         studentId:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         continuousAssessment:
 *           type: number
 *           example: 30
 *         exam:
 *           type: number
 *           example: 70
 *         subject:
 *           type: string
 *           example: Mathematics
 *     ClassTeacherDashboard:
 *       type: object
 *       properties:
 *         myClass:
 *           type: string
 *           example: Primary 3A
 *         totalStudents:
 *           type: integer
 *           example: 30
 *         totalFemale:
 *           type: integer
 *           example: 15
 *         totalMale:
 *           type: integer
 *           example: 15
 *         presentStudent:
 *           type: integer
 *           example: 28
 */

/**
 * @swagger
 * /api/v1/classteacher/attendance:
 *   post:
 *     tags:
 *       - ClassTeacher
 *     summary: Mark student attendance
 *     description: Allows a class teacher to submit attendance for students in their assigned class. Requires teacher authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [attendance]
 *             properties:
 *               attendance:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [studentId, status]
 *                   properties:
 *                     studentId:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       enum: [present, absent]
 *                       example: present
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 attendance:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         description: Unauthorized access or student not in class
 *       404:
 *         description: Student, teacher, or class not found
 */
router.post('/attendance', checkClassTeacher, markAttendance)

/**
 * @swagger
 * /api/v1/classteacher/mark-score:
 *   post:
 *     tags:
 *       - ClassTeacher
 *     summary: Create or update student scores
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *                 example: Mathematics
 *               score:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ScoreRecord'
 *     responses:
 *       201:
 *         description: Scores marked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Scores marked successfully
 *                 scores:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.post('/mark-score', checkClassTeacher, createScores)

/**
 * @swagger
 * /api/v1/classteacher/class-teacher-dashboard:
 *   get:
 *     tags:
 *       - ClassTeacher
 *     summary: Get class teacher dashboard data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ClassTeacherDashboard'
 *                 getAllStudents:
 *                   type: array
 *                   items:
 *                     type: object
 *                 getAnnouncement:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/class-teacher-dashboard', checkClassTeacher, classTeacherDashboard)

router.put('/updateProfile', checkStaff, classTeacherSettings)

module.exports = router