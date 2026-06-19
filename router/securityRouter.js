const router = require('express').Router();
const { securitySettings } = require('../controller/securityController');
const { checkStaff } = require('../middleware/authenticator');

/**
 * @swagger
 * tags:
 *   name: Security
 *   description: Security staff profile management
 */

/**
 * @swagger
 * /api/v1/staff/security/update-security:
 *   put:
 *     tags:
 *       - Security
 *     summary: Update security staff profile
 *     description: Allows a security staff member to update their profile (firstName, lastName, address) and optionally upload a profile picture. Also supports password change.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               address:
 *                 type: string
 *                 example: 15 Main Street, Lagos
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture image file
 *               oldPassword:
 *                 type: string
 *                 description: Current password for verification
 *                 example: OldPass@123
 *               newPassword:
 *                 type: string
 *                 example: NewPass@456
 *               confirmPassword:
 *                 type: string
 *                 example: NewPass@456
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
 *                   example: security updated successfully
 *                 securityData:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     address:
 *                       type: string
 *                     staffProfileUrl:
 *                       type: string
 *                     staffProfilePublicId:
 *                       type: string
 *       400:
 *         description: Incorrect password or passwords do not match
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Staff not found
 *       500:
 *         description: Image upload failed
 */
router.put('/update-security', checkStaff, securitySettings);

module.exports = router;
