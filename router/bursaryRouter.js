const router = require('express').Router();
const { getFeesSummary } = require('../controller/bursaryController');
const { checkStaff } = require('../middleware/authenticator');

/**
 * @swagger
 * tags:
 *   name: Bursary
 *   description: Bursary department fee summary (Bursary staff)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FeesSummary:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: fees summary retrieved successfully
 *         totalAmount:
 *           type: integer
 *           description: Total expected fee amount across all classes
 *           example: 2500000
 *         paidFees:
 *           type: integer
 *           description: Total fee amount collected
 *           example: 1800000
 *         unPaidFees:
 *           type: integer
 *           description: Total outstanding fee amount
 *           example: 700000
 *         studentsOwing:
 *           type: integer
 *           description: Number of students with unpaid or part payment status
 *           example: 32
 */

/**
 * @swagger
 * /api/v1/bursary/getTotal:
 *   get:
 *     tags:
 *       - Bursary
 *     summary: Get fees summary for bursary dashboard
 *     description: Retrieves total expected fees, collected fees, outstanding fees, and count of students owing. Requires staff authentication with bursary role.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fees summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeesSummary'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - staff access required
 */
router.get('/getTotal', checkStaff, getFeesSummary)

module.exports = router
