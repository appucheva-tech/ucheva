const router = require('express').Router();
const { checkBursary } = require('../middleware/authenticator');
const {
  getBursaryAnnouncements,
  getBursaryDashboard,
  getBursaryFees,
  getBursarySettings,
  updateBursarySettingsProfile,
  changeBursarySettingsPassword,
  markBursaryAnnouncementAsRead,
  upsertBursaryProfile
} = require('../controller/bursaryController');

/**
 * @swagger
 * tags:
 *   name: Bursary
 *   description: Bursary dashboard and profile management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BursaryProfile:
 *       type: object
 *       properties:
 *         staffId:
 *           type: string
 *           example: 665f9f0fb7e7d2b5f4ad0110
 *         displayName:
 *           type: string
 *           example: Tolu Adesunya
 *         roleTitle:
 *           type: string
 *           example: Bursary
 *         currentSession:
 *           type: string
 *           example: 2025/2026 Session
 *         currentTerm:
 *           type: string
 *           example: Third Term
 *         attendanceLabel:
 *           type: string
 *           example: My Attendance
 *         checkoutInstruction:
 *           type: string
 *           example: Please scan the QR code to mark your attendance
 *         isActive:
 *           type: boolean
 *           example: true
 *     BursaryDashboard:
 *       type: object
 *       properties:
 *         header:
 *           type: object
 *           properties:
 *             greeting:
 *               type: string
 *               example: Good morning, Tolu Adesunya
 *             overviewText:
 *               type: string
 *               example: Here's today's financial overview.
 *             currentSession:
 *               type: string
 *               example: 2025/2026 Session
 *             currentTerm:
 *               type: string
 *               example: Third Term
 *         summaryCards:
 *           type: object
 *           properties:
 *             attendance:
 *               type: object
 *             collectedFee:
 *               type: object
 *             outstandingFee:
 *               type: object
 *             studentsOwing:
 *               type: object
 *         attendancePanel:
 *           type: object
 *         recentAnnouncements:
 *           type: array
 *           items:
 *             type: object
 *         paymentHistory:
 *           type: array
 *           items:
 *             type: object
 *     BursaryFees:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: Fee Management
 *         subtitle:
 *           type: string
 *           example: Manage school fees, payments, and view payment records.
 *         filters:
 *           type: object
 *           properties:
 *             classSection:
 *               type: string
 *               example: All Classes
 *             paymentStatus:
 *               type: string
 *               example: All Status
 *             term:
 *               type: string
 *               example: Third Term
 *         summaryCards:
 *           type: object
 *           properties:
 *             expectedFee:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: Expected Fee
 *                 value:
 *                   type: number
 *                   example: 38
 *                 amount:
 *                   type: number
 *                   example: 2850000
 *             collectedFee:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: Collected Fee
 *                 value:
 *                   type: number
 *                   example: 28
 *                 amount:
 *                   type: number
 *                   example: 2100000
 *             outstandingFee:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: Outstanding Fee
 *                 value:
 *                   type: number
 *                   example: 10
 *                 amount:
 *                   type: number
 *                   example: 750000
 *             studentsOwing:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: Students Owing
 *                 value:
 *                   type: number
 *                   example: 32
 *         paymentRecords:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *               studentName:
 *                 type: string
 *                 example: Adaeze Clinton
 *               class:
 *                 type: string
 *                 example: JSS 1A
 *               totalAmount:
 *                 type: number
 *                 example: 75000
 *               amountPaid:
 *                 type: number
 *                 example: 39000
 *               outstandingAmount:
 *                 type: number
 *                 example: 36000
 *               paymentType:
 *                 type: string
 *                 nullable: true
 *                 example: Bank Transfer
 *               status:
 *                 type: string
 *                 example: Full Payment
 *               date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               reference:
 *                 type: string
 *                 nullable: true
 *               currency:
 *                 type: string
 *                 example: NGN
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *               example: 1
 *             limit:
 *               type: number
 *               example: 10
 *             total:
 *               type: number
 *               example: 38
 *             totalPages:
 *               type: number
 *               example: 4
 *             rowsPerPage:
 *               type: number
 *               example: 10
 *             showingText:
 *               type: string
 *               example: Showing page 1 of 4
 *     BursaryAnnouncements:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: Announcements
 *         subtitle:
 *           type: string
 *           example: Stay updated with school notices and updates.
 *         activeCategory:
 *           type: string
 *           enum: [all, unread, read]
 *           example: all
 *         categories:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 example: unread
 *               label:
 *                 type: string
 *                 example: Unread
 *               count:
 *                 type: number
 *                 example: 2
 *         announcements:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               title:
 *                 type: string
 *                 example: Staff Meeting Reminder
 *               content:
 *                 type: string
 *                 example: All staff members are required to attend the meeting scheduled for Monday.
 *               audience:
 *                 type: string
 *                 example: staff
 *               category:
 *                 type: string
 *                 enum: [read, unread]
 *                 example: unread
 *               isRead:
 *                 type: boolean
 *                 example: false
 *               readAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               date:
 *                 type: string
 *                 format: date-time
 *               displayTime:
 *                 type: string
 *                 example: 2:00 PM
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *               example: 1
 *             limit:
 *               type: number
 *               example: 10
 *             total:
 *               type: number
 *               example: 12
 *             totalPages:
 *               type: number
 *               example: 2
 *     BursarySettings:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: Settings
 *         subtitle:
 *           type: string
 *           example: Manage your profile and account preferences.
 *         profileInformation:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *               example: Tolu
 *             lastName:
 *               type: string
 *               example: Adesunya
 *             role:
 *               type: string
 *               example: Bursary
 *             phoneNumber:
 *               type: string
 *               example: "+234 801 234 5678"
 *             email:
 *               type: string
 *               example: toluadesunya@gmail.com
 *             address:
 *               type: string
 *               example: 12 Unity Avenue, Jefferson Avenue Road, Ikoyi Lagos
 *             imageUrl:
 *               type: string
 *               nullable: true
 *             uploadHint:
 *               type: string
 *               example: PNG, JPG, Max 2MB
 *         security:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *               example: Security
 *             changePassword:
 *               type: object
 *     BursarySettingsProfileUpdate:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           example: Tolu
 *         lastName:
 *           type: string
 *           example: Adesunya
 *         role:
 *           type: string
 *           example: Bursary
 *         phoneNumber:
 *           type: string
 *           example: "+234 801 234 5678"
 *         email:
 *           type: string
 *           example: toluadesunya@gmail.com
 *         address:
 *           type: string
 *           example: 12 Unity Avenue, Jefferson Avenue Road, Ikoyi Lagos
 *         imageUrl:
 *           type: string
 *           example: https://res.cloudinary.com/demo/profile.jpg
 *     BursaryPasswordChange:
 *       type: object
 *       required: [oldPassword, newPassword, confirmPassword]
 *       properties:
 *         oldPassword:
 *           type: string
 *           format: password
 *           example: OldPassword@123
 *         newPassword:
 *           type: string
 *           format: password
 *           example: NewPassword@123
 *         confirmPassword:
 *           type: string
 *           format: password
 *           example: NewPassword@123
 */

/**
 * @swagger
 * /api/v1/bursary/dashboard:
 *   get:
 *     summary: Get the bursary dashboard
 *     description: Returns the backend data needed to render the bursary dashboard shown in the design, including attendance, fee cards, announcements, and payment history.
 *     tags: [Bursary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *       - in: query
 *         name: classSection
 *         schema:
 *           type: string
 *           example: JSS 1A
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           example: Full Payment
 *     responses:
 *       200:
 *         description: Bursary dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 bursaryDashboard:
 *                   $ref: '#/components/schemas/BursaryDashboard'
 *       400:
 *         description: Auth token missing or invalid
 *       404:
 *         description: Admin not found
 */
router.get('/dashboard', checkBursary, getBursaryDashboard);

/**
 * @swagger
 * /api/v1/bursary/fees:
 *   get:
 *     summary: Get bursary fee management records
 *     description: Returns the data for the Fee Management screen, including expected fees, collected fees, outstanding fees, students owing, filters, actions, table records, export data, and pagination.
 *     tags: [Bursary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classSection
 *         description: Filter records by class section.
 *         schema:
 *           type: string
 *           default: All Classes
 *           example: JSS 1A
 *       - in: query
 *         name: paymentStatus
 *         description: Filter by payment status.
 *         schema:
 *           type: string
 *           enum: [All Status, Full Payment, Part Payment, Unpaid]
 *           default: All Status
 *       - in: query
 *         name: term
 *         description: Selected term label for the fee screen.
 *         schema:
 *           type: string
 *           default: Third Term
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Bursary fees retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bursary fees retrieved successfully
 *                 bursaryFees:
 *                   $ref: '#/components/schemas/BursaryFees'
 *       400:
 *         description: Auth token missing or invalid
 *       404:
 *         description: Admin not found
 */
router.get('/fees', checkBursary, getBursaryFees);

/**
 * @swagger
 * /api/v1/bursary/announcements:
 *   get:
 *     summary: Get bursary announcements by category
 *     description: Returns the announcement page data shown in the bursary design, with All, Unread, and Read categories plus counts.
 *     tags: [Bursary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         description: Announcement category tab.
 *         schema:
 *           type: string
 *           enum: [all, unread, read]
 *           default: all
 *       - in: query
 *         name: search
 *         description: Search announcement title or content.
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Bursary announcements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bursary announcements retrieved successfully
 *                 bursaryAnnouncements:
 *                   $ref: '#/components/schemas/BursaryAnnouncements'
 *       400:
 *         description: Invalid category or auth token missing
 *       404:
 *         description: Admin not found
 */
router.get('/announcements', checkBursary, getBursaryAnnouncements);

/**
 * @swagger
 * /api/v1/bursary/announcements/{id}/read:
 *   patch:
 *     summary: Mark a bursary announcement as read
 *     tags: [Bursary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID.
 *     responses:
 *       200:
 *         description: Announcement marked as read successfully
 *       400:
 *         description: Auth token missing or invalid
 *       404:
 *         description: Announcement not found
 */
router.patch('/announcements/:id/read', checkBursary, markBursaryAnnouncementAsRead);

/**
 * @swagger
 * /api/v1/bursary/settings:
 *   get:
 *     summary: Get bursary settings page data
 *     description: Returns profile information and security actions for the bursary settings screen.
 *     tags: [Bursary]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bursary settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bursary settings retrieved successfully
 *                 bursarySettings:
 *                   $ref: '#/components/schemas/BursarySettings'
 *       400:
 *         description: Auth token missing or invalid
 *       404:
 *         description: Admin not found
 */
router.get('/settings', checkBursary, getBursarySettings);

/**
 * @swagger
 * /api/v1/bursary/settings/profile:
 *   put:
 *     summary: Update bursary settings profile
 *     description: Updates the profile information shown on the bursary settings screen. If the bursary is linked to a staff account, the staff profile is updated; otherwise the admin account and bursary display profile are updated.
 *     tags: [Bursary]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BursarySettingsProfileUpdate'
 *     responses:
 *       200:
 *         description: Bursary settings profile updated successfully
 *       400:
 *         description: Auth token missing or invalid
 *       404:
 *         description: Admin or linked bursary staff not found
 */
router.put('/settings/profile', checkBursary, updateBursarySettingsProfile);

/**
 * @swagger
 * /api/v1/bursary/settings/password:
 *   put:
 *     summary: Change bursary password
 *     description: Changes the password for the linked bursary staff account, or the admin account when no staff is linked.
 *     tags: [Bursary]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BursaryPasswordChange'
 *     responses:
 *       200:
 *         description: Bursary password changed successfully
 *       400:
 *         description: Missing fields, incorrect old password, or password mismatch
 *       404:
 *         description: Admin or bursary account not found
 */
router.put('/settings/password', checkBursary, changeBursarySettingsPassword);

/**
 * @swagger
 * /api/v1/bursary/profile:
 *   put:
 *     summary: Create or update bursary dashboard profile settings
 *     tags: [Bursary]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BursaryProfile'
 *     responses:
 *       200:
 *         description: Bursary profile saved successfully
 *       400:
 *         description: Auth token missing or invalid
 *       404:
 *         description: Admin not found
 */
router.put('/profile', checkBursary, upsertBursaryProfile);

module.exports = router;
