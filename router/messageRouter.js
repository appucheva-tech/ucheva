const router = require('express').Router();
const { createMessage, getAllMessages, getOneMessage, deleteMessage } = require('../controller/messageController');
const { createMessageValidator } = require('../middleware/joiValidation');
const { checkAdmin } = require('../middleware/authenticator');

/**
 * @swagger
 * tags:
 *   name: Message
 *   description: Contact messages management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Message UUID
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         adminId:
 *           type: string
 *           format: uuid
 *           description: UUID of the admin this message belongs to
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         name:
 *           type: string
 *           description: Sender's name
 *           example: John Doe
 *         email:
 *           type: string
 *           description: Sender's email
 *           example: john.doe@example.com
 *         subject:
 *           type: string
 *           description: Message subject
 *           example: Inquiry about school fees
 *         message:
 *           type: string
 *           description: Message body
 *           example: I would like to know more about the fee structure.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-05-24T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-05-24T10:00:00.000Z"
 */

/**
 * @swagger
 * /api/v1/message/message:
 *   post:
 *     tags:
 *       - Message
 *     summary: Send a message
 *     description: Allows anyone to send a contact message. No authentication required.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               subject:
 *                 type: string
 *                 example: Inquiry about school fees
 *               message:
 *                 type: string
 *                 example: I would like to know more about the fee structure.
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Message sent successfully
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 */
router.post('/message', createMessageValidator, createMessage);

/**
 * @swagger
 * /api/v1/message/messages:
 *   get:
 *     tags:
 *       - Message
 *     summary: Get all messages
 *     description: Retrieves all contact messages. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Messages retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 */
router.get('/messages', checkAdmin, getAllMessages);

/**
 * @swagger
 * /api/v1/message/messages/{id}:
 *   get:
 *     tags:
 *       - Message
 *     summary: Get a single message
 *     description: Retrieves a single contact message by UUID. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The Message UUID
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Message retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Message retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       404:
 *         description: Message not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Message not found
 *   delete:
 *     tags:
 *       - Message
 *     summary: Delete a message
 *     description: Deletes a contact message by UUID. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The Message UUID
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Message deleted successfully
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       404:
 *         description: Message not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Message not found
 */
router.get('/messages/:id', checkAdmin, getOneMessage);
router.delete('/messages/:id', checkAdmin, deleteMessage);

module.exports = router;
