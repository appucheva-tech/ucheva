const router = require('express').Router();
const { checkStaff } = require('../middleware/authenticator');
const {
  getSecurityDashboard,
  checkInSecurity,
  checkOutSecurity,
  getSecurityAnnouncements,
  markSecurityAnnouncementAsRead,
  getSecuritySettings,
  updateSecuritySettingsProfile,
  changeSecuritySettingsPassword
} = require('../controller/securityDashboardController');

/**
 * @swagger
 * tags:
 *   - name: Security Dashboard
 *     description: Security staff dashboard, QR attendance state, and recent announcements
 *
 * components:
 *   schemas:
 *     SecurityDashboard:
 *       type: object
 *       properties:
 *         greeting: { type: string, example: Good morning, Mr Davis }
 *         welcomeText: { type: string, example: Welcome back. }
 *         user:
 *           type: object
 *           properties:
 *             id: { type: string, description: MongoDB ObjectId }
 *             name: { type: string, example: Davis Okan }
 *             role: { type: string, example: Security }
 *             profileImage: { type: string, nullable: true }
 *         attendanceCard:
 *           type: object
 *           properties:
 *             date: { type: string, format: date, example: "2026-05-18" }
 *             status:
 *               type: string
 *               enum: [not_checked_in, checked_in, checked_out]
 *             timeCheckedIn: { type: string, format: date-time, nullable: true }
 *             timeCheckedOut: { type: string, format: date-time, nullable: true }
 *             displayTimeCheckedIn: { type: string, nullable: true, example: "7:42 AM" }
 *             displayTimeCheckedOut: { type: string, nullable: true, example: "3:15 PM" }
 *             title: { type: string, example: Checked In Successful }
 *             subtitle: { type: string, example: Check-in Time 7:42 AM }
 *             scanAction:
 *               type: object
 *               properties:
 *                 label: { type: string, example: Scan QR to Check Out }
 *                 method: { type: string, nullable: true, example: POST }
 *                 url: { type: string, nullable: true, example: /api/v1/security-dashboard/check-out }
 *         recentAnnouncements:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: string, description: MongoDB ObjectId }
 *               title: { type: string, example: Staff Meeting }
 *               content: { type: string, example: All staff members are required to attend the meeting. }
 *               date: { type: string, example: May 18, 2026 }
 *     SecurityAttendanceRequest:
 *       type: object
 *       properties:
 *         latitude: { type: number, nullable: true, example: 6.5244 }
 *         longitude: { type: number, nullable: true, example: 3.3792 }
 *     SecurityAnnouncement:
 *       type: object
 *       properties:
 *         id: { type: string, description: MongoDB ObjectId }
 *         title: { type: string, example: PTA Meeting }
 *         content: { type: string, example: All staff should take note of the upcoming PTA meeting. }
 *         audience: { type: string, enum: [staff, all], example: staff }
 *         status: { type: string, example: sent }
 *         category: { type: string, enum: [read, unread], example: unread }
 *         isRead: { type: boolean, example: false }
 *         readAt: { type: string, format: date-time, nullable: true }
 *         date: { type: string, format: date-time }
 *         displayTime: { type: string, example: "9:30 AM" }
 *         actions:
 *           type: object
 *     SecurityAnnouncements:
 *       type: object
 *       properties:
 *         title: { type: string, example: Announcements }
 *         subtitle: { type: string, example: Stay updated with school notices and updates. }
 *         activeCategory: { type: string, enum: [all, unread, read], example: all }
 *         search: { type: string, example: "" }
 *         categories:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               key: { type: string, example: unread }
 *               label: { type: string, example: Unread }
 *               count: { type: number, example: 2 }
 *         announcements:
 *           type: array
 *           items: { $ref: '#/components/schemas/SecurityAnnouncement' }
 *         pagination:
 *           type: object
 *           properties:
 *             page: { type: number, example: 1 }
 *             limit: { type: number, example: 10 }
 *             total: { type: number, example: 12 }
 *             totalPages: { type: number, example: 2 }
 *     SecuritySettings:
 *       type: object
 *       properties:
 *         title: { type: string, example: Settings }
 *         subtitle: { type: string, example: Manage your profile and account preferences. }
 *         profileInformation:
 *           type: object
 *           properties:
 *             firstName: { type: string, example: Tolu }
 *             lastName: { type: string, example: Adesunya }
 *             role: { type: string, example: Security }
 *             phoneNumber: { type: string, example: "+234 801 234 5678" }
 *             email: { type: string, example: toluadesunya@gmail.com }
 *             address: { type: string, example: 12 Unity Avenue, Jefferson Avenue Road, Ikoyi Lagos }
 *             imageUrl: { type: string, nullable: true }
 *             uploadHint: { type: string, example: PNG, JPG, Max 2MB }
 *             saveAction:
 *               type: object
 *         security:
 *           type: object
 *           properties:
 *             title: { type: string, example: Security }
 *             changePassword:
 *               type: object
 *               properties:
 *                 title: { type: string, example: Change Password }
 *                 subtitle: { type: string, example: Update your account password. }
 *                 requiredFields:
 *                   type: array
 *                   items: { type: string }
 *                 action:
 *                   type: object
 *     SecuritySettingsProfileUpdate:
 *       type: object
 *       properties:
 *         firstName: { type: string, example: Tolu }
 *         lastName: { type: string, example: Adesunya }
 *         phoneNumber: { type: string, example: "+234 801 234 5678" }
 *         email: { type: string, example: toluadesunya@gmail.com }
 *         address: { type: string, example: 12 Unity Avenue, Jefferson Avenue Road, Ikoyi Lagos }
 *         imageUrl: { type: string, example: https://res.cloudinary.com/demo/profile.jpg }
 *     SecurityPasswordChange:
 *       type: object
 *       required: [oldPassword, newPassword, confirmPassword]
 *       properties:
 *         oldPassword: { type: string, format: password, example: OldPassword@123 }
 *         newPassword: { type: string, format: password, example: NewPassword@123 }
 *         confirmPassword: { type: string, format: password, example: NewPassword@123 }
 */

/**
 * @swagger
 * /api/v1/security-dashboard:
 *   get:
 *     tags: [Security Dashboard]
 *     summary: Get the security staff dashboard
 *     description: Returns the authenticated security staff dashboard state shown in the UI, including the attendance card and recent announcements.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: header
 *         name: x-tenant
 *         required: true
 *         schema: { type: string, example: greenfield }
 *     responses:
 *       200:
 *         description: Security dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Security dashboard retrieved successfully }
 *                 securityDashboard: { $ref: '#/components/schemas/SecurityDashboard' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/security-dashboard/check-in:
 *   post:
 *     tags: [Security Dashboard]
 *     summary: Check in security staff
 *     description: Marks the authenticated security staff as checked in for the current day.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: header
 *         name: x-tenant
 *         required: true
 *         schema: { type: string, example: greenfield }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SecurityAttendanceRequest' }
 *     responses:
 *       200:
 *         description: Security staff checked in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Checked In Successful }
 *                 securityDashboard: { $ref: '#/components/schemas/SecurityDashboard' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *
 * /api/v1/security-dashboard/check-out:
 *   post:
 *     tags: [Security Dashboard]
 *     summary: Check out security staff
 *     description: Marks the authenticated security staff as checked out for the current day.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: header
 *         name: x-tenant
 *         required: true
 *         schema: { type: string, example: greenfield }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SecurityAttendanceRequest' }
 *     responses:
 *       200:
 *         description: Security staff checked out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Checked Out Successful }
 *                 securityDashboard: { $ref: '#/components/schemas/SecurityDashboard' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *
 * /api/v1/security-dashboard/announcements:
 *   get:
 *     tags: [Security Dashboard]
 *     summary: Get security announcements
 *     description: Returns sent staff/all announcements for the authenticated security staff with All, Unread, and Read categories.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: header
 *         name: x-tenant
 *         required: true
 *         schema: { type: string, example: greenfield }
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [all, unread, read]
 *           default: all
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Security announcements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Security announcements retrieved successfully }
 *                 securityAnnouncements: { $ref: '#/components/schemas/SecurityAnnouncements' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/security-dashboard/announcements/{id}/read:
 *   patch:
 *     tags: [Security Dashboard]
 *     summary: Mark a security announcement as read
 *     description: Marks one sent staff/all announcement as read for the authenticated security staff.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: header
 *         name: x-tenant
 *         required: true
 *         schema: { type: string, example: greenfield }
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Announcement ID.
 *     responses:
 *       200:
 *         description: Announcement marked as read successfully
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/security-dashboard/settings:
 *   get:
 *     tags: [Security Dashboard]
 *     summary: Get security settings page data
 *     description: Returns profile information and security password action data for the security settings screen.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: header
 *         name: x-tenant
 *         required: true
 *         schema: { type: string, example: greenfield }
 *     responses:
 *       200:
 *         description: Security settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Security settings retrieved successfully }
 *                 securitySettings: { $ref: '#/components/schemas/SecuritySettings' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/security-dashboard/settings/profile:
 *   put:
 *     tags: [Security Dashboard]
 *     summary: Update security settings profile
 *     description: Updates profile fields shown on the security settings screen.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: header
 *         name: x-tenant
 *         required: true
 *         schema: { type: string, example: greenfield }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SecuritySettingsProfileUpdate' }
 *     responses:
 *       200:
 *         description: Security settings profile updated successfully
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/security-dashboard/settings/password:
 *   put:
 *     tags: [Security Dashboard]
 *     summary: Change security password
 *     description: Changes the authenticated security staff account password.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: header
 *         name: x-tenant
 *         required: true
 *         schema: { type: string, example: greenfield }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SecurityPasswordChange' }
 *     responses:
 *       200:
 *         description: Security password changed successfully
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

router.get('/', checkStaff, getSecurityDashboard);
router.get('/announcements', checkStaff, getSecurityAnnouncements);
router.patch('/announcements/:id/read', checkStaff, markSecurityAnnouncementAsRead);
router.get('/settings', checkStaff, getSecuritySettings);
router.put('/settings/profile', checkStaff, updateSecuritySettingsProfile);
router.put('/settings/password', checkStaff, changeSecuritySettingsPassword);
router.post('/check-in', checkStaff, checkInSecurity);
router.post('/check-out', checkStaff, checkOutSecurity);

module.exports = router;
