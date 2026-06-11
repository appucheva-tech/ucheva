const router = require('express').Router()
const { createAnnouncement,getAllAnnouncements } = require('../controller/announcementController')
const {  checkAdmin } = require('../middleware/authenticator');

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
 *       required:
 *         - announcementTitle
 *         - announcementContent
 *         - audience
 *         - sendOption
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         adminId:
 *           type: string
 *           format: uuid
 *         announcementTitle:
 *           type: string
 *           example: Holiday Notice
 *         announcementContent:
 *           type: string
 *           example: School will be closed tomorrow due to weather.
 *         audience:
 *           type: string
 *           description: Target audience
 *           enum: [staff, students, both]
 *           example: both
 *         sendOption:
 *           type: string
 *           enum: [immediately, scheduled]
 *           example: immediately
 *         scheduledTime:
 *           type: string
 *           format: date-time
 *           example: "2026-06-12T09:00:00.000Z"
 *         saveAsTemplate:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-06-12T09:00:00.000Z"
 */
/**
 * @swagger
 * /api/v1/announcement:
 *   post:
 *     tags:
 *       - Announcement
 *     summary: Create an announcement
 *     description: Create an announcement. Admin only. `sendOption` can be `immediate` or `scheduled`.
 *           description: Auto-generated UUID
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
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the announcement was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the announcement was last updated
 *       example:
 *         id: "550e8400-e29b-41d4-a716-446655440000"
 *         adminId: "660e8400-e29b-41d4-a716-446655440001"
 *         announcementTitle: "School Holiday Notice"
 *         announcementContent: "School will be closed for the holidays."
 *         audience: "both"
 *         sendOption: "immediately"
 *         scheduledTime: null
 *         createdAt: "2026-06-10T12:00:00.000Z"
 *         updatedAt: "2026-06-10T12:00:00.000Z"
 * 
 * /api/v1/announcement/announcement:
 *   post:
 *     summary: Create a new announcement (Admin only)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [announcementTitle, announcementContent, audience, sendOption]
 *             properties:
 *               announcementTitle: { type: string }
 *               announcementContent: { type: string }
 *               audience: { type: string, enum: [staff, students, both] }
 *               sendOption: { type: string, enum: [immediately, scheduled] }
 *               scheduledTime: { type: string, format: date-time }
 *             required:
 *               - announcementTitle
 *               - announcementContent
 *               - audience
 *               - sendOption
 *             properties:
 *               announcementTitle:
 *                 type: string
 *                 description: Title of the announcement
 *                 example: "School Holiday Notice"
 *               announcementContent:
 *                 type: string
 *                 description: Content of the announcement
 *                 example: "School will be closed for the holidays from December 20th to January 5th."
 *               audience:
 *                 type: string
 *                 enum: [staff, students, both]
 *                 description: Target audience
 *                 example: "both"
 *               sendOption:
 *                 type: string
 *                 enum: [immediately, scheduled]
 *                 description: Send immediately or schedule for later
 *                 example: "immediately"
 *               scheduleTime:
 *                 type: string
 *                 format: date-time
 *                 description: Required if sendOption is 'scheduled'. Must be a future date/time.
 *                 example: "2026-06-15T10:00:00.000Z"
 *     responses:
 *       201:
 *         description: Announcement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 announcement:
 *                   $ref: '#/components/schemas/Announcement'
 */
 *                 message:
 *                   type: string
 *                   example: "Announcement created successfully"
 *                 announcement:
 *                   $ref: '#/components/schemas/Announcement'
 *       400:
 *         description: Bad request - Invalid input or scheduleTime must be a future date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "scheduleTime must be a future date and time"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Only admins can create announcements
 *       500:
 *         description: Internal server error
 * 
 * /api/v1/announcement/getAllAnnouncements:
 *   get:
 *     summary: Get all announcements
 *     tags: [Announcements]
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
 *                   example: "Announcements retrieved successfully"
 *                 announcements:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Announcement'
 *       404:
 *         description: No announcements found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No announcements found"
 *       500:
 *         description: Internal server error
 */

router.post('/announcement',checkAdmin, createAnnouncement)

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
 *                 message: { type: string }
 *                 announcements:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Announcement'
 */
router.get('/getAllAnnouncements', getAllAnnouncements)

module.exports = router