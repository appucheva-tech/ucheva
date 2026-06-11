const router = require('express').Router()
const { createAnnouncement, getAllAnnouncements } = require('../controller/announcementController')
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