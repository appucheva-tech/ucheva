const router = require('express').Router()

const { createScores } = require('../controller/scoresController')
const { subjectTeacherDashboard } = require("../controller/subjectTeacherController")
const { checkSubjectTeacher } = require("../middleware/authenticator")

/**
 * @swagger
 * tags:
 *   name: SubjectTeacher
 *   description: Subject teacher dashboard and score management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     StudentScore:
 *       type: object
 *       required:
 *         - studentId
 *         - continuousAssessment
 *         - exam
 *       properties:
 *         studentId:
 *           type: string
 *           format: uuid
 *           description: UUID of the student
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         continuousAssessment:
 *           type: number
 *           description: Continuous assessment score (typically out of 40)
 *           example: 30
 *         exam:
 *           type: number
 *           description: Exam score (typically out of 60)
 *           example: 50
 *         subject:
 *           type: string
 *           description: Subject name (optional in request, included in response)
 *           example: Mathematics
 *     ScoreResponse:
 *       type: object
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
 *           example: 50
 *         total:
 *           type: number
 *           description: Sum of continuous assessment and exam scores
 *           example: 80
 *     SubjectTeacherDashboard:
 *       type: object
 *       properties:
 *         mySubjects:
 *           type: array
 *           description: Subjects assigned to this teacher
 *           items:
 *             type: string
 *           example: ["Mathematics", "Physics"]
 *         myClasses:
 *           type: array
 *           description: Classes this teacher teaches
 *           items:
 *             type: string
 *           example: ["Primary 3A", "Primary 4B"]
 *         totalStudents:
 *           type: integer
 *           description: Total students across all assigned classes
 *           example: 60
 *         totalFemale:
 *           type: integer
 *           description: Total female students
 *           example: 30
 *         totalMale:
 *           type: integer
 *           description: Total male students
 *           example: 30
 *     DashboardResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/SubjectTeacherDashboard'
 *         getAllStudents:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               gender:
 *                 type: string
 *               studentClass:
 *                 type: string
 *         getAnnouncement:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               announcementTitle:
 *                 type: string
 *               announcementContent:
 *                 type: string
 *               audience:
 *                 type: string
 */

/**
 * @swagger
 * /api/v1/classteacher/mark-score:
 *   post:
 *     tags:
 *       - SubjectTeacher
 *     summary: Create or update student scores
 *     description: >
 *       Allows a subject teacher to create or update scores for students in their assigned subjects.
 *       Scores can be created in bulk. Both continuous assessment and exam scores are captured.
 *       Requires subject teacher authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - score
 *             properties:
 *               subject:
 *                 type: string
 *                 description: Name of the subject
 *                 example: Mathematics
 *               score:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/StudentScore'
 *                 description: Array of student scores to create/update
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
 *                     $ref: '#/components/schemas/ScoreResponse'
 *       400:
 *         description: Validation error - invalid scores or subject not assigned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: unauthorized access
 *       403:
 *         description: Forbidden - only subject teachers can mark scores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Student, teacher, or subject not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/score', checkSubjectTeacher, createScores)

/**
 * @swagger
 * /api/v1/classteacher/subject-teacher-dashboard:
 *   get:
 *     tags:
 *       - SubjectTeacher
 *     summary: Get subject teacher dashboard data
 *     description: >
 *       Retrieves the subject teacher's dashboard with statistics about assigned subjects,
 *       classes, students, and recent announcements. Requires subject teacher authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardResponse'
 *       401:
 *         description: Unauthorized - missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: unauthorized access
 *       403:
 *         description: Forbidden - only subject teachers can access this dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Subject teacher record not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/subject-teacher-dashboard', checkSubjectTeacher, subjectTeacherDashboard)

module.exports = router