const router = require('express').Router()
const { authenticate, checkAdmin } = require('../middleware/authenticator')
const { createClass, getAllClasses, deleteClass, updateClass } = require('../controller/classController')

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
 *           description: Class UUID
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         adminId:
 *           type: string
 *           format: uuid
 *           description: UUID of the admin who created the class
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         staffId:
 *           type: string
 *           format: uuid
 *           description: UUID of the assigned class teacher
 *           example: "550e8400-e29b-41d4-a716-446655440002"
 *         className:
 *           type: string
 *           description: Name of the class
 *           example: Primary 3
 *         selectSection:
 *           type: string
 *           description: School section the class belongs to
 *           enum: [secondary, primary, nursery]
 *           example: primary
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
 *       Creates a new class and assigns a class teacher to it. The teacher is looked up by
 *       first name and must be a registered staff with teachingType of 'class teacher'.
 *       The teacher's classAssigned field is automatically updated on creation.
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
 *               - selectSection
 *               - assignTeacher
 *             properties:
 *               className:
 *                 type: string
 *                 example: Primary 3
 *               selectSection:
 *                 type: string
 *                 enum: [secondary, primary, nursery]
 *                 example: primary
 *               assignTeacher:
 *                 type: string
 *                 description: First name of the class teacher to assign
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
router.post('/create-class', checkAdmin, createClass)

/**
 * @swagger
 * /api/v1/class/classes:
 *   get:
 *     tags:
 *       - Class
 *     summary: Get all classes
 *     description: Retrieves all classes with their assigned teacher's name included. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Classes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Classes retrieved successfully
 *                 classes:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Class'
 *                       - type: object
 *                         properties:
 *                           staff:
 *                             type: object
 *                             properties:
 *                               firstName:
 *                                 type: string
 *                                 example: James
 *                               lastName:
 *                                 type: string
 *                                 example: Brown
 */
router.get('/classes', checkAdmin, getAllClasses)

/**
 * @swagger
 * /api/v1/class/classes/{id}:
 *   put:
 *     tags:
 *       - Class
 *     summary: Update a class
 *     description: >
 *       Updates an existing class by UUID. The teacher is re-looked up by first name
 *       and must have teachingType of 'class teacher'. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The Class UUID
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               className:
 *                 type: string
 *                 example: Primary 4
 *               selectSection:
 *                 type: string
 *                 enum: [secondary, primary, nursery]
 *                 example: primary
 *               assignTeacher:
 *                 type: string
 *                 example: James
 *     responses:
 *       200:
 *         description: Class updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Class updated successfully
 *       404:
 *         description: Teacher or class not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: teacher not found
 *   delete:
 *     tags:
 *       - Class
 *     summary: Delete a class
 *     description: Deletes a class by UUID. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The Class UUID
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Class deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Class deleted successfully
 *       404:
 *         description: Class not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Class not found
 */
router.put('/classes/:id', authenticate, updateClass)
router.delete('/classes/:id', authenticate, deleteClass)

module.exports = router
