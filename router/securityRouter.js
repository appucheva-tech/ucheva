const router = require('express').Router();
const { securitySettings } = require('../controller/securityController');
const { checkStaff } = require('../middleware/authenticator');

/**
 * @swagger
 * tags:
 *   name: Security
 *   description: Security staff management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Security:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         staffType:
 *           type: string
 *           enum: [security, busary, teaching]
 *           example: security
 *         adminId:
 *           type: string
 *           format: uuid
 *         address:
 *           type: string
 *           example: 123 Main Street, City
 *         phoneNumber:
 *           type: string
 *           example: "+2348029837465"
 *         email:
 *           type: string
 *           format: email
 *           example: john.doe@school.edu
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/security/update-security:
 *   put:
 *     tags:
 *       - Security
 *     summary: Update security staff profile
 *     description: Update the authenticated security staff's profile. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - staffType
 *               - address
 *               - phoneNumber
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               staffType:
 *                 type: string
 *                 enum: [security, busary, teaching]
 *               address:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Security profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 security:
 *                   $ref: '#/components/schemas/Security'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Security staff member not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: security not found
 *       500:
 *         description: Internal server error
 */

router.put('/update-security', checkStaff, securitySettings);

module.exports = router;