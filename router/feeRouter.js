const router = require('express').Router();
const { checkAdmin } = require('../middleware/authenticator');
const { createFee, getAllFees, getStudentFeeDetails, updateFee, deleteFee } = require('../controller/feeController');

/**
 * @swagger
 * tags:
 *   name: Fees
 *   description: Fee setup and student fee details
 */

/**
 * @swagger
 * /api/v1/fees:
 *   post:
 *     tags: [Fees]
 *     summary: Create a fee for a student
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, feeType, amount, paymentOption]
 *             properties:
 *               studentId: { type: string, format: uuid }
 *               feeType: { type: string, example: School Bus Fee }
 *               amount: { type: integer, example: 25000 }
 *               paymentOption: { type: string, enum: [full payment, installment] }
 *               numberOfInstallments: { type: integer, example: 1 }
 *     responses:
 *       201: { description: Fee created successfully }
 *   get:
 *     tags: [Fees]
 *     summary: Get all fees
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Fees retrieved successfully }
 */
router.post('/:classId', checkAdmin, createFee);
router.get('/', checkAdmin, getAllFees);

/**
 * @swagger
 * /api/v1/fees/student/{studentId}:
 *   get:
 *     tags: [Fees]
 *     summary: Get student fee details, breakdown and payment history
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Fee details retrieved successfully }
 */
router.get('/student/:studentId', checkAdmin, getStudentFeeDetails);

/**
 * @swagger
 * /api/v1/fees/{id}:
 *   put:
 *     tags: [Fees]
 *     summary: Update a fee
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feeType: { type: string }
 *               amount: { type: integer }
 *               paymentOption: { type: string }
 *               numberOfInstallments: { type: integer }
 *     responses:
 *       200: { description: Fee updated successfully }
 *   delete:
 *     tags: [Fees]
 *     summary: Delete a fee
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Fee deleted successfully }
 */
router.put('/:id', checkAdmin, updateFee);
router.delete('/:id', checkAdmin, deleteFee);

module.exports = router;
