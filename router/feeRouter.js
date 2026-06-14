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
 *     ClassInfo:
 *       type: object
 *       description: Brief class details included in fee structure responses
 *       properties:
 *         className:
 *           type: string
 *           example: Primary 3
 *           description: Name of the class
 *         selectSection:
 *           type: string
 *           enum: [secondary, primary, nursery]
 *           example: primary
 *           description: School section this class belongs to
 *     CreateFeeInput:
 *       type: object
 *       required:
 *         - classId
 *         - feeType
 *         - amount
 *         - paymentOption
 *       properties:
 *         classId:
 *           type: string
 *           format: uuid
 *           description: UUID of the class this fee applies to
 *           example: "550e8400-e29b-41d4-a716-446655440002"
 *         feeType:
 *           type: string
 *           description: Type of fee (e.g. Tuition Fee, Registration, Uniform)
 *           example: Tuition Fee
 *         amount:
 *           type: integer
 *           description: Total fee amount in Naira
 *           example: 50000
 *         paymentOption:
 *           type: string
 *           enum: [full payment, installment]
 *           description: |
 *             Payment mode. If "installment", numberOfInstallments is required
 *             and payableAmount is auto-calculated as Math.floor(amount / numberOfInstallments).
 *           example: installment
 *         numberOfInstallments:
 *           type: integer
 *           description: Required when paymentOption is "installment". Must be at least 2.
 *           example: 3
 *     UpdateFeeInput:
 *       type: object
 *       description: All fields are optional — only provided fields are updated
 *       properties:
 *         feeType:
 *           type: string
 *           description: Type of fee
 *           example: Tuition Fee
 *         amount:
 *           type: integer
 *           description: Total fee amount in Naira
 *           example: 60000
 *         paymentOption:
 *           type: string
 *           enum: [full payment, installment]
 *           description: Changing this recalculates payableAmount
 *           example: full payment
 *         numberOfInstallments:
 *           type: integer
 *           description: Required when paymentOption is "installment"
 *           example: 2
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
 *           description: Normalised fee type (lowercase, underscores for spaces)
 *           example: tuition_fee
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
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the fee structure was created
 *           example: "2026-06-14T12:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the fee structure was last updated
 *           example: "2026-06-14T12:30:00.000Z"
 *     FeeStructureWithClass:
 *       allOf:
 *         - $ref: '#/components/schemas/FeeStructure'
 *         - type: object
 *           properties:
 *             classes:
 *               $ref: '#/components/schemas/ClassInfo'
 *     FeeResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Fee structure created successfully
 *         feeStructure:
 *           $ref: '#/components/schemas/FeeStructure'
 *     FeeListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Fee structures retrieved successfully
 *         feeStructures:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FeeStructureWithClass'
 *     DeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Fee structure deleted successfully
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *       required:
 *         - message
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
 *             $ref: '#/components/schemas/CreateFeeInput'
 *             type: object
 *             required: [classId, feeType, amount, paymentOption]
 *             properties:
 *               classId: { type: string, format: uuid }
 *               feeType: { type: string, example: School Bus Fee }
 *               amount: { type: integer, example: 25000 }
 *               paymentOption: { type: string, enum: [full payment, installment] }
 *               numberOfInstallments: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Fee structure created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeeResponse'
 *       400:
 *         description: Validation error — invalid amount, missing installments, etc.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Unauthorized access to this class — admin does not own the class
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Class not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *               $ref: '#/components/schemas/FeeListResponse'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/all', checkAdmin, getAllFeeStructures);

/**
 * @swagger
 * /api/v1/fee/{feeId}:
 *   get:
 *     tags:
 *       - Fee Structure
 *     summary: Get a fee structure by ID
 *     description: Retrieves a single fee structure by its UUID, including associated class info.
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
 *               $ref: '#/components/schemas/FeeResponse'
 *       404:
 *         description: Fee structure not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags:
 *       - Fee Structure
 *     summary: Update a fee structure
 *     description: Updates an existing fee structure. Only provided fields are changed. When changing payment option, the payable amount is recalculated.
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
 *             $ref: '#/components/schemas/UpdateFeeInput'
 *     responses:
 *       200:
 *         description: Fee structure updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeeResponse'
 *       400:
 *         description: Validation error — invalid installments, etc.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Fee structure not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags:
 *       - Fee Structure
 *     summary: Delete a fee structure
 *     description: Permanently removes a fee structure by its UUID. Requires admin authentication.
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
 *               $ref: '#/components/schemas/DeleteResponse'
 *       404:
 *         description: Fee structure not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:feeId', checkAdmin, getFeeStructureById);
router.put('/:feeId', checkAdmin, updateFeeStructure);
router.delete('/:feeId', checkAdmin, deleteFeeStructure);

module.exports = router;
