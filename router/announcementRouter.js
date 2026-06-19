const router = require('express').Router()
const { createAnnouncement, getAllAnnouncements } = require('../controller/announcementController')
const { checkAdmin } = require('../middleware/authenticator');

/**
 * @swagger
 * tags:
 *   name: Announcement
 *   description: Announcement creation and retrieval (Admin)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Announcement:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         adminId:
 *           type: string
 *           format: uuid
 *           description: ID of the admin who created the announcement
 *         announcementTitle:
 *           type: string
 *           description: Title of the announcement
 *           example: "School Holiday Notice"
 *         announcementContent:
 *           type: string
 *           description: Content of the announcement
 *           example: "School will be closed for the holidays from December 20th to January 5th."
 *         audience:
 *           type: string
 *           enum: [staff, students, both]
 *           description: Target audience for the announcement
 *           example: "both"
 *         sendOption:
 *           type: string
 *           enum: [immediately, scheduled]
 *           description: Whether to send immediately or schedule for later
 *           example: "immediately"
 *         scheduledTime:
 *           type: string
 *           format: date-time
 *           description: Date and time for scheduled sending (required if sendOption is 'scheduled')
 *           example: "2026-06-15T10:00:00.000Z"
 *         saveAsTemplate:
 *           type: boolean
 *           description: Whether to save this announcement as a template for reuse
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the announcement was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the announcement was last updated
 */

/**
 * @swagger
 * /api/v1/announcement:
 *   post:
 *     tags:
 *       - Announcement
 *     summary: Create an announcement
 *     description: Creates a new announcement. Admin only. Can be sent immediately or scheduled for a future time.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - announcementTitle
 *               - announcementContent
 *               - audience
 *               - sendOption
 *             properties:
 *               announcementTitle:
 *                 type: string
 *                 example: "School Holiday Notice"
 *               announcementContent:
 *                 type: string
 *                 example: "School will be closed for the holidays."
 *               audience:
 *                 type: string
 *                 enum: [staff, students, both]
 *                 example: "both"
 *               sendOption:
 *                 type: string
 *                 enum: [immediately, scheduled]
 *                 example: "immediately"
 *               scheduledTime:
 *                 type: string
 *                 format: date-time
 *                 description: Required if sendOption is 'scheduled'
 *                 example: "2026-06-15T10:00:00.000Z"
 *     responses:
 *       201:
 *         description: Announcement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 announcement:
 *                   $ref: '#/components/schemas/Announcement'
 *       400:
 *         description: Bad request - Invalid input or scheduledTime must be a future date
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Only admins can create announcements
 */
router.post('/announcement', checkAdmin, createAnnouncement)

/**
 * @swagger
 * /api/v1/announcement/getAllAnnouncements:
 *   get:
 *     tags:
 *       - Announcement
 *     summary: Get all announcements
 *     description: Retrieves all announcements. Public endpoint.
 *     responses:
 *       200:
 *         description: Announcements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 announcements:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Announcement'
 *       404:
 *         description: No announcements found
 */
router.get('/getAllAnnouncements', getAllAnnouncements)

module.exports = router
