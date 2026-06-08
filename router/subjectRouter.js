const router = require('express').Router();
const { createSubject, getAllSubjects} = require('../controller/subjectController')
const { checkAdmin } = require('../middleware/authenticator');

/**
 * @swagger
 * tags:
 *   name: Subject
 *   description: Subject management
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
 *         subjectName:
 *           type: string
 *           example: Mathematics
 *         applicableSection:
 *           type: string
 *           example: primary
 *         aplicableDepartment:
 *           type: string
 *           example: science
 *         adminId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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
 *           example: primary
 *         aplicableDepartment:
 *           type: string
 *           example: science
 */

/**
 * @swagger
 * /api/v1/subject/subject:
 *   post:
 *     tags:
 *       - Subject
 *     summary: Create a new subject
 *     description: Creates a subject for the authenticated admin.
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
 *         description: Unauthorized to create subject
 */

router.post('/subject', checkAdmin,  createSubject)

/**
 * @swagger
 * /api/v1/subject/allSubjects:
 *   get:
 *     tags:
 *       - Subject
 *     summary: Get all subjects
 *     description: Retrieves all subjects. Requires an admin bearer token.
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
 */ 

router.get('/allSubjects', checkAdmin,  getAllSubjects)

module.exports = router
