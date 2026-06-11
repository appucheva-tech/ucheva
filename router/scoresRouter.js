const router = require('express').Router();
const { checkSubjectTeacher } = require('../middleware/authenticator');
const { createScores } = require('../controller/scoresController');

/**
 * @swagger
 * tags:
 *   name: Scores
 *   description: Score entry and management (Class teachers)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Score:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         studentId:
 *           type: string
 *           format: uuid
 *         staffId:
 *           type: string
 *           format: uuid
 *         subject:
 *           type: object
 *         class:
 *           type: object
 *         studentName:
 *           type: string
 *         admissionNumber:
 *           type: string
 *         continuousAssessment:
 *           type: string
 *         exam:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/scores/mark:
 *   post:
 *     tags:
 *       - Scores
 *     summary: Mark scores for students in a subject
 *     description: Allows a class teacher to create scores for students in a subject. Teacher authentication required.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject, continuousAssessment, exam]
 *             properties:
 *               subject:
 *                 type: string
 *                 example: Mathematics
 *               continuousAssessment:
 *                 type: string
 *                 example: "15"
 *               exam:
 *                 type: string
 *                 example: "60"
 *     responses:
 *       201:
 *         description: Scores created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 scores:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Score'
 *       403:
 *         description: Unauthorized - teacher cannot mark this subject
 *       404:
 *         description: Students or teacher not found
 */
router.post('/mark', checkSubjectTeacher, createScores);

module.exports = router;
