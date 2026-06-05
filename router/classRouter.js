const router = require('express').Router()
const { authenticate } = require('../middleware/authenticator')
const { createClass } = require('../controller/classController')

/**
 * @swagger
 * tags:
 *   name: Class
 *   description: Class management (Admin only)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Class:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Class ID
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         adminId:
 *           type: string
 *           format: uuid
 *           description: ID of the admin who created the class
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         staffId:
 *           type: string
 *           format: uuid
 *           description: ID of the assigned class teacher
 *           example: "550e8400-e29b-41d4-a716-446655440002"
 *         className:
 *           type: string
 *           description: Name of the class
 *           example: Primary 3
 *         selectSelection:
 *           type: string
 *           description: The arm/section of the class
 *           example: A
 *         assignTeacher:
 *           type: string
 *           description: First name of the assigned class teacher
 *           example: James
 */

/**
 * @swagger
 * /api/v1/class/create-class:
 *   post:
 *     tags:
 *       - Class
 *     summary: Create a class
 *     description: >
 *       Creates a new class and assigns a class teacher to it.
 *       The teacher is looked up by first name and must have a teachingType of 'class teacher'.
 *       Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - className
 *               - selectSelection
 *               - assignTeacher
 *             properties:
 *               className:
 *                 type: string
 *                 description: Name of the class
 *                 example: Primary 3
 *               selectSelection:
 *                 type: string
 *                 description: The arm/section of the class
 *                 example: A
 *               assignTeacher:
 *                 type: string
 *                 description: First name of the class teacher to assign (must be a registered staff with teachingType of 'class teacher')
 *                 example: James
 *     responses:
 *       201:
 *         description: Class created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Class created successfully
 *                 class:
 *                   $ref: '#/components/schemas/Class'
 *       404:
 *         description: Teacher not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: teacher not found
 */
router.post('/create-class', authenticate, createClass)



module.exports = router
