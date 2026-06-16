const router = require('express').Router()
const { generateQRCode, checkInStaff, checkOutStaff } = require('../controller/staffAttendanceController')
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

module.exports = router
