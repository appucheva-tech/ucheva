const router = require('express').Router();
const { checkAdmin, authenticate } = require('../middleware/authenticator');
const {
  initializePayment,
  verifyPayment,
  getPaymentHistory,
  getPaymentByReference,
} = require('../controller/paymentController');

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment operations via Kora API
 */

/**
 * @swagger
 * /api/v1/payment/initialize:
 *   post:
 *     tags:
 *       - Payment
 *     summary: Initialize a payment
 *     description: Creates a payment record and returns a Kora checkout URL for the user to complete payment.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *             properties:
 *               studentId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the student
 *                 example: "550e8400-e29b-41d4-a716-446655440010"
 *               feeId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the fee structure (optional, amount will be pulled from here)
 *                 example: "550e8400-e29b-41d4-a716-446655440020"
 *               amount:
 *                 type: integer
 *                 description: Amount in Naira (required if feeId not provided)
 *                 example: 50000
 *               parentName:
 *                 type: string
 *                 description: Parent/guardian full name
 *                 example: "John Doe"
 *               parentEmail:
 *                 type: string
 *                 format: email
 *                 description: Parent email address
 *                 example: "parent@example.com"
 *               currency:
 *                 type: string
 *                 enum: [NGN, USD, EUR]
 *                 default: NGN
 *                 description: Currency for the payment
 *                 example: "NGN"
 *     responses:
 *       201:
 *         description: Payment initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment initialized successfully
 *                 payment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     reference:
 *                       type: string
 *                     amount:
 *                       type: integer
 *                     currency:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: pending
 *                 checkoutUrl:
 *                   type: string
 *                   description: URL to redirect the user to for payment
 *                 koraReference:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Student or fee structure not found
 */
router.post('/initialize', checkAdmin, initializePayment);

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
 *               staffId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Payment verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 payment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     reference:
 *                       type: string
 *                     amount:
 *                       type: integer
 *                     currency:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [success, failed, pending]
 *                     paidAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *       404:
 *         description: Payment record not found
 */
router.get('/verify/:reference', authenticate, verifyPayment);

/**
 * @swagger
 * /api/v1/payment/history:
 *   get:
 *     tags:
 *       - Payment
 *     summary: Get payment history
 *     description: Retrieves all payments made for the admin's school. Optionally filter by student.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter payments by student UUID (optional)
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 */
router.get('/history', checkAdmin, getPaymentHistory);

/**
 * @swagger
 * /api/v1/payment/reference/{reference}:
 *   get:
 *     tags:
 *       - Payment
 *     summary: Get payment details by reference
 *     description: Retrieves a single payment record including student details.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: The payment reference
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *       404:
 *         description: Payment not found
 */
router.get('/reference/:reference', checkAdmin, getPaymentByReference);

module.exports = router;
