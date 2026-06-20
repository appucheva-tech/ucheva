const router = require('express').Router()
const { authenticate, checkAdmin, checkClassTeacher } = require('../middleware/authenticator')
const { assignOrCreateClass, getAllClasses, deleteClass, updateClass, getClassByPk } = require('../controller/classController')

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
 *         amount:
 *           type: number
 *           format: decimal
 *           description: School fee amount for students in this class
 *           example: 50000
 *         teacherId:
 *           type: string
 *           description: Full name of the assigned class teacher
 *           example: James Brown
 */

/**
 * @swagger
 * /api/v1/class/create-class/{teacherId}:
 *   post:
 *     tags:
 *       - Class
 *     summary: Create a class
 *     description: >
 *       Creates a new class and assigns a class teacher to it. The teacher is identified by teacherId.
 *       The teacher is looked up by ID and must be a registered staff member.
 *       The teacher's classAssigned field is automatically updated on creation.
 *       Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the teacher to assign to the class
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - className
 *               - amount
 *             properties:
 *               className:
 *                 type: string
 *                 example: Primary 3
 *               amount:
 *                 type: number
 *                 format: decimal
 *                 description: School fee amount for students in this class
 *                 example: 50000
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
router.post('/create-class', checkAdmin, assignOrCreateClass)

/**
 * @swagger
 * /api/v1/class/get-class:
 *   get:
 *     tags:
 *       - Class
 *     summary: Get a single class
 *     description: Retrieves the authenticated admin's class record.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Class retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: class found
 *                 schoolClass:
 *                   $ref: '#/components/schemas/Class'
 *       404:
 *         description: Class not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: class not found
 */
router.get('/get-class', checkAdmin, getClassByPk)

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
router.put('/classes/:id', checkAdmin, updateClass)
router.delete('/classes/:id', checkAdmin, deleteClass)

module.exports = router
