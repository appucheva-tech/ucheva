const router = require('express').Router();
const { createSubject, getAllSubjects } = require('../controller/subjectController')
const { checkAdmin } = require('../middleware/authenticator');

/**
 * @swagger
 * tags:
 *   name: Subject
 *   description: Subject management (Admin only)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Subject UUID
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         adminId:
 *           type: string
 *           format: uuid
 *           description: UUID of the admin who created the subject
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         subjectName:
 *           type: string
 *           example: Mathematics
 *         applicableSection:
 *           type: string
 *           description: School section the subject applies to
 *           example: primary
 *         applicableDepartment:
 *           type: string
 *           description: Department the subject applies to
 *           example: science
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-05-24T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-05-24T10:00:00.000Z"
 *     CreateSubjectRequest:
 *       type: object
 *       required:
 *         - subjectName
 *         - applicableSection
 *         - aplicableDepartment
 *       properties:
 *         subjectName:
 *           type: string
 *           example: Mathematics
 *         applicableSection:
 *           type: string
 *           description: School section this subject applies to
 *           example: primary
 *         applicableDepartment:
 *           type: string
 *           description: Department this subject applies to
 *           example: science
 */

/**
 * @swagger
 * /api/v1/subject/subject:
 *   post:
 *     tags:
 *       - Subject
 *     summary: Create a subject
 *     description: Creates a new subject for the authenticated admin. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubjectRequest'
 *     responses:
 *       201:
 *         description: Subject created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: subject created successfully
 *                 subject:
 *                   $ref: '#/components/schemas/Subject'
 *       403:
 *         description: Not authorized to create subject
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: you are not authorized to create subject
 */
router.post('/subject', checkAdmin, createSubject)

/**
 * @swagger
 * /api/v1/subject/allSubjects:
 *   get:
 *     tags:
 *       - Subject
 *     summary: Get all subjects
 *     description: Retrieves all subjects. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Subjects retrieved successfully
 *                 subjects:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Subject'
 *       403:
 *         description: Not authorized to view subjects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: you are not authorized to view subjects
 */
router.get('/allSubjects', checkAdmin, getAllSubjects)

module.exports = router
