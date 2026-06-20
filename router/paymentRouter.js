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
 * /api/v1/payment/initialize/{studentId}:
 *   post:
 *     tags:
 *       - Payment
 *     summary: Initialize a payment
 *     description: Initializes payment from the student's class. The class fee is read from schoolClasses.amount, which is the amount saved when creating the class. A fixed service charge of 600 is added to the amount sent to Kora.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the student whose class amount should be charged
 *         example: "550e8400-e29b-41d4-a716-446655440010"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               classId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional class UUID. If omitted, the student's saved classId is used.
 *                 example: "550e8400-e29b-41d4-a716-446655440030"
 *               className:
 *                 type: string
 *                 description: Optional class name from create-class. Used only when classId is not provided.
 *                 example: Primary 3
 *               paymentType:
 *                 type: string
 *                 enum: [card, bank transfer, mobile payment]
 *                 default: card
 *                 description: Payment channel to store on the local payment record
 *                 example: card
 *               parentName:
 *                 type: string
 *                 description: Optional parent/guardian full name override. Defaults to the student's parentGuardiansName.
 *                 example: "John Doe"
 *               parentEmail:
 *                 type: string
 *                 format: email
 *                 description: Optional parent/guardian email override. Defaults to the student's parentGuardiansEmail.
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
 *                       type: number
 *                       description: Class fee amount saved locally, excluding service charge
 *                     currency:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: pending
 *                     classId:
 *                       type: string
 *                       format: uuid
 *                     className:
 *                       type: string
 *                       example: Primary 3
 *                     classAmount:
 *                       type: number
 *                       example: 50000
 *                     serviceCharge:
 *                       type: integer
 *                       example: 600
 *                     totalCharged:
 *                       type: number
 *                       example: 50600
 *                 checkoutUrl:
 *                   type: string
 *                   description: URL to redirect the user to for payment
 *                 koraReference:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Student or class not found
 */
router.post('/initialize/:studentId', checkAdmin, initializePayment);

/**
 * @swagger
 * /api/v1/payment/verify/{reference}:
 *   get:
 *     tags:
 *       - Payment
 *     summary: Verify a payment by reference
 *     description: Calls Kora API to verify the payment status and updates the local payment record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: The payment reference returned during initialization
 *         example: "PAY-1718000000-ABC123"
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
