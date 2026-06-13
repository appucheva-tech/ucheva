const router = require('express').Router();
const { checkAdmin } = require('../middleware/authenticator');
const {
    createFeeStructure,
    getAllFeeStructures,
    getFeeStructureById,
    updateFeeStructure,
    deleteFeeStructure
} = require('../controller/feeController');

/**
 * @swagger
 * tags:
 *   name: Fee Structure
 *   description: Fee structure management (Admin only)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FeeStructure:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Fee structure UUID
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         adminId:
 *           type: string
 *           format: uuid
 *           description: UUID of the admin who created the fee structure
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         classId:
 *           type: string
 *           format: uuid
 *           description: UUID of the class this fee applies to
 *           example: "550e8400-e29b-41d4-a716-446655440002"
 *         feeType:
 *           type: string
 *           description: Type of fee (e.g. tuition, registration, uniform)
 *           example: tuition
 *         amount:
 *           type: integer
 *           description: Total fee amount
 *           example: 50000
 *         paymentOption:
 *           type: string
 *           enum: [full payment, installment]
 *           description: Payment option for this fee
 *           example: installment
 *         numberOfInstallments:
 *           type: integer
 *           nullable: true
 *           description: Number of installments (only for installment payment)
 *           example: 3
 *         payableAmount:
 *           type: integer
 *           nullable: true
 *           description: Amount payable per installment (only for installment payment)
 *           example: 16667
 */

/**
 * @swagger
 * /api/v1/fee/create:
 *   post:
 *     tags:
 *       - Fee Structure
 *     summary: Create a fee structure
 *     description: Creates a new fee structure for a specific class. If payment option is installment, the payable amount per installment is auto-calculated.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *               - feeType
 *               - amount
 *               - paymentOption
 *             properties:
 *               classId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the class
 *                 example: "550e8400-e29b-41d4-a716-446655440002"
 *               feeType:
 *                 type: string
 *                 description: Type of fee
 *                 example: Tuition Fee
 *               amount:
 *                 type: integer
 *                 description: Total fee amount
 *                 example: 50000
 *               paymentOption:
 *                 type: string
 *                 enum: [full payment, installment]
 *                 example: installment
 *               numberOfInstallments:
 *                 type: integer
 *                 description: Number of installments (required if paymentOption is installment)
 *                 example: 3
 *     responses:
 *       201:
 *         description: Fee structure created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fee structure created successfully
 *                 feeStructure:
 *                   $ref: '#/components/schemas/FeeStructure'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized access to this class
 *       404:
 *         description: Class not found
 */
router.post('/create', checkAdmin, createFeeStructure);

/**
 * @swagger
 * /api/v1/fee/all:
 *   get:
 *     tags:
 *       - Fee Structure
 *     summary: Get all fee structures
 *     description: Retrieves all fee structures created by the authenticated admin, including associated class name and section.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fee structures retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fee structures retrieved successfully
 *                 feeStructures:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/FeeStructure'
 *                       - type: object
 *                         properties:
 *                           classes:
 *                             type: object
 *                             properties:
 *                               className:
 *                                 type: string
 *                                 example: Primary 3
 *                               selectSection:
 *                                 type: string
 *                                 example: primary
 */
router.get('/all', checkAdmin, getAllFeeStructures);

/**
 * @swagger
 * /api/v1/fee/{feeId}:
 *   get:
 *     tags:
 *       - Fee Structure
 *     summary: Get a fee structure by ID
 *     description: Retrieves a single fee structure by its UUID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The fee structure UUID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Fee structure retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fee structure retrieved successfully
 *                 feeStructure:
 *                   $ref: '#/components/schemas/FeeStructure'
 *       404:
 *         description: Fee structure not found
 *   put:
 *     tags:
 *       - Fee Structure
 *     summary: Update a fee structure
 *     description: Updates an existing fee structure. When changing payment option, the payable amount is recalculated.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The fee structure UUID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feeType:
 *                 type: string
 *                 example: Tuition Fee
 *               amount:
 *                 type: integer
 *                 example: 60000
 *               paymentOption:
 *                 type: string
 *                 enum: [full payment, installment]
 *                 example: full payment
 *               numberOfInstallments:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Fee structure updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fee structure updated successfully
 *                 feeStructure:
 *                   $ref: '#/components/schemas/FeeStructure'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Fee structure not found
 *   delete:
 *     tags:
 *       - Fee Structure
 *     summary: Delete a fee structure
 *     description: Deletes a fee structure by its UUID. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The fee structure UUID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Fee structure deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fee structure deleted successfully
 *       404:
 *         description: Fee structure not found
 */
router.get('/:feeId', checkAdmin, getFeeStructureById);
router.put('/:feeId', checkAdmin, updateFeeStructure);
router.delete('/:feeId', checkAdmin, deleteFeeStructure);

module.exports = router;
