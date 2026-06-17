const router = require('express').Router()
const { generateQRCode, checkInStaff, checkOutStaff, getAllStaffAttendance } = require('../controller/staffAttendanceController')
const { authenticate, checkAdmin, checkStaff } = require('../middleware/authenticator')

/**
 * @swagger
 * tags:
 *   name: Staff Attendance
 *   description: Staff attendance via QR code
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     StaffAttendanceQRCodeRequest:
 *       type: object
 *       properties:
 *         qrToken:
 *           type: string
 *           example: e5f7a97b3b9d6f1d...
 *     StaffCheckInRequest:
 *       type: object
 *       required:
 *         - qrToken
 *       properties:
 *         qrToken:
 *           type: string
 *           example: e5f7a97b3b9d6f1d...
 *     StaffCheckOutRequest:
 *       type: object
 *       required:
 *         - qrToken
 *       properties:
 *         qrToken:
 *           type: string
 *           example: e5f7a97b3b9d6f1d...
 */

/**
 * @swagger
 * /api/v1/staffattendance/qr-code:
 *   post:
 *     tags:
 *       - Staff Attendance
 *     summary: Generate today's staff attendance QR code
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: QR code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: QR Generated
 *                 qr:
 *                   type: object
 *                 qrImage:
 *                   type: string
 */
router.post('/qr-code', authenticate, checkAdmin, generateQRCode)

/**
 * @swagger
 * /api/v1/staffattendance/check-in:
 *   post:
 *     tags:
 *       - Staff Attendance
 *     summary: Staff checks in using today's QR code
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StaffCheckInRequest'
 *     responses:
 *       201:
 *         description: Staff checked in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Check In Successful
 *                 record:
 *                   type: object
 */
router.post('/check-in', authenticate, checkStaff, checkInStaff)

/**
 * @swagger
 * /api/v1/staffattendance/check-out:
 *   post:
 *     tags:
 *       - Staff Attendance
 *     summary: Staff checks out using today's QR code
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StaffCheckOutRequest'
 *     responses:
 *       200:
 *         description: Staff checked out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Check Out Successful
 *                 attendance:
 *                   type: object
 */
router.post('/check-out', authenticate, checkStaff, checkOutStaff)

/**
 * @swagger
 * /api/v1/staffattendance/today:
 *   get:
 *     tags:
 *       - Staff Attendance
 *     summary: Get today's staff attendance records
 *     description: Retrieves all staff attendance check-in records for today, ordered by check-in time. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's staff attendance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Today's staff attendance retrieved successfully
 *                 Attendance:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: 550e8400-e29b-41d4-a716-446655440000
 *                       staffId:
 *                         type: string
 *                         format: uuid
 *                         example: 550e8400-e29b-41d4-a716-446655440001
 *                       staffName:
 *                         type: string
 *                         example: Adaeze Clinton
 *                       staffRole:
 *                         type: string
 *                         example: Teacher
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: 2026-06-17
 *                       timeCheckedIn:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-06-17T07:48:00.000Z
 *                       timeCheckedOut:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: 2026-06-17T16:30:00.000Z
 *                       status:
 *                         type: string
 *                         enum: [Present, Absent, Checked Out]
 *                         example: Checked Out
 *       404:
 *         description: No attendance records found for today
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No attendance records found for today
 */
router.get('/today', authenticate, checkAdmin, getAllStaffAttendance)

module.exports = router
