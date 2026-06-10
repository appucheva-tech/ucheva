const router = require('express').Router();
const { authenticate } = require('../middleware/authenticator');
const { getPaymentSummary, createPayment, getPaymentHistory } = require('../controller/paymentController');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Student fee payments
 */

/**
 * @swagger
 * /api/v1/payments/summary:
 *   post:
 *     tags: [Payments]
 *     summary: Get payment order summary
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId]
 *             properties:
 *               studentId: { type: string, format: uuid }
 *               feeIds: { type: array, items: { type: string, format: uuid } }
 *               paymentOption: { type: string, enum: [full payment, installment] }
 *               numberOfInstallments: { type: integer, example: 2 }
 *     responses:
 *       200: { description: Payment summary retrieved successfully }
 */
router.post('/summary', authenticate, getPaymentSummary);

/**
 * @swagger
 * /api/v1/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Create a payment
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, paymentType]
 *             properties:
 *               studentId: { type: string, format: uuid }
 *               feeIds: { type: array, items: { type: string, format: uuid } }
 *               amount: { type: number, example: 87500 }
 *               paymentType: { type: string, enum: [card, bank transfer, mobile payment] }
 *               paymentOption: { type: string, enum: [full payment, installment] }
 *               paymentStatus: { type: string, enum: [pending, success, failed] }
 *               currency: { type: string, enum: [USD, EUR, NGN] }
 *               parentName: { type: string }
 *               parentEmail: { type: string }
 *     responses:
 *       201: { description: Payment created successfully }
 */
router.post('/', authenticate, createPayment);

/**
 * @swagger
 * /api/v1/payments/history/{studentId}:
 *   get:
 *     tags: [Payments]
 *     summary: Get student payment history
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Payment history retrieved successfully }
 */
router.get('/history/:studentId', authenticate, getPaymentHistory);

module.exports = router;
