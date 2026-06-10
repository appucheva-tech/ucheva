const router = require('express').Router();
const {updateSecurity} = require('../controller/sucurityController');
const {authenticate} = require('../middleware/authenticator');

/**
 * @swagger
 * tags:
 *   - name: Security
 *     description: Security staff management endpoints
 */

/**
 * @swagger
 * /security/update-security:
 *   put:
 *     summary: Update security staff profile
 *     description: Updates the profile information of a security staff member. Requires authentication.
 *     tags:
 *       - Security
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
 *                 description: First name of the security staff member
 *                 example: John
 *               lastName:
 *                 type: string
 *                 description: Last name of the security staff member
 *                 example: Doe
 *               staffType:
 *                 type: string
 *                 description: Type or role of the security staff
 *                 example: Senior Guard
 *               address:
 *                 type: string
 *                 description: Residential address of the security staff
 *                 example: 123 Main Street, City, State
 *               phoneNumber:
 *                 type: string
 *                 description: Contact phone number
 *                 example: "+1-555-0123"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *                 example: john.doe@school.edu
 *     responses:
 *       200:
 *         description: Security staff profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "security updated successfully"
 *                 security:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     staffType:
 *                       type: string
 *                       example: Senior Guard
 *                     address:
 *                       type: string
 *                       example: 123 Main Street, City, State
 *                     phoneNumber:
 *                       type: string
 *                       example: "+1-555-0123"
 *                     email:
 *                       type: string
 *                       example: john.doe@school.edu
 *       404:
 *         description: Security staff member not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "security not found"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       500:
 *         description: Internal server error
 */
router.put('/update-security', authenticate, updateSecurity);

module.exports = router;