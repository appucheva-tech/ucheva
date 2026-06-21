/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin authentication, profile, wallet, and dashboard endpoints
 *   - name: Staff
 *     description: Staff onboarding, profile, and reporting endpoints
 *   - name: Student
 *     description: Student enrolment and parent endpoints
 *   - name: Parent
 *     description: Parent account activation and profile settings endpoints
 *   - name: Class
 *     description: School class management
 *   - name: Subject
 *     description: Subject management
 *   - name: Class Teacher
 *     description: Class teacher attendance, score, dashboard, and profile endpoints
 *   - name: Subject Teacher
 *     description: Subject teacher score, dashboard, and profile endpoints
 *   - name: Payment
 *     description: Fee payment initialization, verification, and history
 *   - name: Staff Attendance
 *     description: Staff attendance QR code and attendance record endpoints
 *
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: validation error
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field: { type: string, example: email }
 *               message: { type: string, example: Email must be a valid email address }
 *     Admin:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         schoolName: { type: string, example: Greenfield Academy }
 *         schoolUrl: { type: string, example: greenfield }
 *         email: { type: string, format: email }
 *         address: { type: string }
 *         phoneNumber: { type: string }
 *         role: { type: string, example: admin }
 *         finishedOnboarding: { type: boolean }
 *         isVerified: { type: boolean }
 *         passwordReset: { type: boolean }
 *         loginAttempts: { type: integer }
 *         lockUntil: { type: string, format: date-time, nullable: true }
 *     AdminProfile:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         adminId: { type: string, format: uuid }
 *         schoolUrl: { type: string }
 *         adminFirstName: { type: string, nullable: true }
 *         adminLastName: { type: string, nullable: true }
 *         schoolLogoUrl: { type: string, nullable: true }
 *         schoolStampUrl: { type: string, nullable: true }
 *         cacUrl: { type: string, nullable: true }
 *         nepaUrl: { type: string, nullable: true }
 *         schoolType:
 *           type: array
 *           items: { type: string, enum: [nursery, primary, secondary] }
 *         continuousAssessmentConfig: { type: integer, nullable: true }
 *         examConfig: { type: integer, nullable: true }
 *         total: { type: integer, nullable: true }
 *     Staff:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         adminId: { type: string, format: uuid }
 *         schoolUrl: { type: string }
 *         firstName: { type: string, example: James }
 *         lastName: { type: string, example: Brown }
 *         otherName: { type: string, nullable: true }
 *         gender: { type: string, enum: [male, female] }
 *         dateOfBirth: { type: string, format: date }
 *         nationality: { type: string, enum: [nigerian, non-nigerian] }
 *         address: { type: string }
 *         maritalStatus: { type: string, enum: [single, married, divorced, widowed] }
 *         attendanceStatus: { type: string, enum: [present, absent, late] }
 *         subjectAssigned:
 *           type: array
 *           nullable: true
 *           items: { type: string }
 *         classAssigned:
 *           oneOf:
 *             - type: string
 *             - type: array
 *               items: { type: string }
 *           nullable: true
 *         staffType: { type: string, enum: [class teacher, subject teacher] }
 *         role: { type: string, example: staff }
 *         phoneNumber: { type: string }
 *         email: { type: string, format: email }
 *         qualification: { type: string }
 *         staffProfileUrl: { type: string, nullable: true }
 *         staffUrl: { type: string, nullable: true }
 *         signatureUrl: { type: string, nullable: true }
 *         isActive: { type: boolean }
 *         isVerified: { type: boolean }
 *     Student:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         adminId: { type: string, format: uuid }
 *         parentId: { type: string, format: uuid, nullable: true }
 *         classId: { type: string, format: uuid }
 *         schoolUrl: { type: string }
 *         admissionNumber: { type: string, example: STD/2026/000001 }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         otherName: { type: string }
 *         gender: { type: string, enum: [male, female] }
 *         dateOfBirth: { type: string, format: date }
 *         nationality: { type: string, enum: [nigerian, non-nigerian] }
 *         address: { type: string }
 *         studentClass: { type: string, example: Primary 3 }
 *         department: { type: string }
 *         attendanceStatus: { type: string, enum: [present, absent], nullable: true }
 *         session: { type: string, example: "2025/2026" }
 *         religion: { type: string, nullable: true }
 *         parentGuardiansName: { type: string }
 *         parentGuardiansAddress: { type: string }
 *         relationship: { type: string, enum: [father, mother, guardian] }
 *         phoneNumber: { type: string }
 *         parentGuardiansEmail: { type: string, format: email }
 *         paymentStatus: { type: string, enum: [full payment, part payment, unpaid] }
 *     Parent:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         adminId: { type: string, format: uuid }
 *         schoolUrl: { type: string }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         address: { type: string }
 *         phoneNumber: { type: string }
 *         email: { type: string, format: email }
 *         role: { type: string, example: parent }
 *         profileUrl: { type: string, nullable: true }
 *         profilePublicId: { type: string, nullable: true }
 *         isActive: { type: boolean }
 *         isVerified: { type: boolean }
 *     SchoolClass:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         adminId: { type: string, format: uuid }
 *         staffId: { type: string, format: uuid, nullable: true }
 *         schoolUrl: { type: string }
 *         className: { type: string, example: Primary 3 }
 *         paymentOption: { type: string, enum: [full payment, installment] }
 *         amount: { type: number, format: double, example: 50000 }
 *         teacherName: { type: string, nullable: true }
 *         assigned: { type: boolean }
 *     Subject:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         adminId: { type: string, format: uuid }
 *         classId: { type: string, format: uuid, nullable: true }
 *         staffId: { type: string, format: uuid, nullable: true }
 *         schoolUrl: { type: string }
 *         subjectName: { type: string, example: Mathematics }
 *         applicableSection: { type: string, example: primary }
 *         applicableDepartment: { type: string, example: science }
 *         subjectTeacher: { type: string, example: James Brown }
 *     Payment:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         adminId: { type: string, format: uuid }
 *         studentId: { type: string, format: uuid }
 *         staffId: { type: string, format: uuid, nullable: true }
 *         schoolUrl: { type: string }
 *         amount: { type: number, format: double }
 *         paymentType: { type: string, enum: [card, bank transfer, mobile payment] }
 *         paymentStatus: { type: string, enum: [pending, success, failed] }
 *         reference: { type: string }
 *         currency: { type: string, enum: [USD, EUR, NGN] }
 *         paymentDate: { type: string, format: date-time }
 *         parentName: { type: string }
 *         parentEmail: { type: string, format: email }
 *     StaffAttendance:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         adminId: { type: string, format: uuid }
 *         staffId: { type: string, format: uuid }
 *         schoolUrl: { type: string }
 *         qrToken: { type: string }
 *         date: { type: string, format: date }
 *         timeCheckedIn: { type: string, format: date-time, nullable: true }
 *         timeCheckedOut: { type: string, format: date-time, nullable: true }
 *         status: { type: string, enum: [present, absent, late] }
 *         latitude: { type: number, nullable: true }
 *         longitude: { type: number, nullable: true }
 *     StudentAttendance:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         studentId: { type: string, format: uuid }
 *         staffId: { type: string, format: uuid }
 *         schoolUrl: { type: string }
 *         date: { type: string, format: date }
 *         status: { type: string, enum: [present, absent] }
 *         studentClass: { type: string }
 *         studentName: { type: string }
 *         classTeacher: { type: string }
 *     Score:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         studentId: { type: string, format: uuid }
 *         staffId: { type: string, format: uuid }
 *         schoolUrl: { type: string }
 *         subject: { type: string }
 *         studentClass: { type: string }
 *         studentName: { type: string }
 *         admissionNumber: { type: string }
 *         continuousAssessment: { type: number }
 *         exam: { type: number }
 *     RegisterRequest:
 *       type: object
 *       required: [schoolName, schoolUrl, email, phoneNumber, address, password, confirmPassword]
 *       properties:
 *         schoolName: { type: string, example: Greenfield Academy }
 *         schoolUrl: { type: string, example: greenfield }
 *         email: { type: string, format: email }
 *         phoneNumber: { type: string, example: "08012345678" }
 *         address: { type: string }
 *         password: { type: string, format: password, example: Password@123 }
 *         confirmPassword: { type: string, format: password, example: Password@123 }
 *     LoginRequest:
 *       type: object
 *       required: [role, email, password]
 *       properties:
 *         role: { type: string, enum: [admin, staff, parent] }
 *         email: { type: string, format: email }
 *         password: { type: string, format: password }
 *     EmailRequest:
 *       type: object
 *       required: [email]
 *       properties:
 *         email: { type: string, format: email }
 *     OtpRequest:
 *       type: object
 *       required: [email, otp]
 *       properties:
 *         email: { type: string, format: email }
 *         otp: { type: string, example: "123456" }
 *     ResetPasswordRequest:
 *       type: object
 *       required: [email, newPassword, confirmPassword]
 *       properties:
 *         email: { type: string, format: email }
 *         newPassword: { type: string, format: password }
 *         confirmPassword: { type: string, format: password }
 *     CreateStaffRequest:
 *       type: object
 *       required: [firstName, lastName, gender, dateOfBirth, nationality, address, qualification, maritalStatus, phoneNumber, email, staffType]
 *       properties:
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         otherName: { type: string }
 *         gender: { type: string, enum: [male, female] }
 *         dateOfBirth: { type: string, format: date }
 *         nationality: { type: string, enum: [nigerian, non-nigerian] }
 *         address: { type: string }
 *         qualification: { type: string }
 *         maritalStatus: { type: string, enum: [single, married, divorced, widowed] }
 *         phoneNumber: { type: string }
 *         email: { type: string, format: email }
 *         staffType: { type: string, enum: [class teacher, subject teacher] }
 *         classId:
 *           type: string
 *           format: uuid
 *           description: Required when staffType is class teacher
 *     CreateStudentRequest:
 *       type: object
 *       required: [firstName, lastName, otherName, gender, dateOfBirth, nationality, address, classId, department, session, parentGuardiansName, parentGuardiansAddress, relationship, phoneNumber, parentGuardiansEmail]
 *       properties:
 *         admissionNumber: { type: string }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         otherName: { type: string }
 *         gender: { type: string, enum: [male, female] }
 *         dateOfBirth: { type: string, format: date }
 *         nationality: { type: string, enum: [nigerian, non-nigerian] }
 *         address: { type: string }
 *         classId: { type: string, format: uuid }
 *         department: { type: string }
 *         session: { oneOf: [{ type: string }, { type: integer }] }
 *         religion: { type: string }
 *         parentGuardiansName: { type: string }
 *         parentGuardiansAddress: { type: string }
 *         relationship: { type: string, enum: [father, mother, guardian] }
 *         phoneNumber: { type: string }
 *         parentGuardiansEmail: { type: string, format: email }
 *     CreateClassRequest:
 *       type: object
 *       required: [className, amount, paymentOption]
 *       properties:
 *         className: { type: string, example: Primary 3 }
 *         amount: { type: number, example: 50000 }
 *         paymentOption: { type: string, enum: [full payment, installment] }
 *         teacherId: { type: string, format: uuid, nullable: true }
 *         numberOfInstallments: { type: integer, minimum: 2 }
 *     UpdateClassRequest:
 *       type: object
 *       properties:
 *         className: { type: string, example: Primary 3 }
 *         amount: { type: number, example: 50000 }
 *         paymentOption: { type: string, enum: [full, full payment, installment] }
 *         teacherId: { type: string, format: uuid, nullable: true }
 *         numberOfInstallments: { type: integer, minimum: 2 }
 *     CreateSubjectRequest:
 *       type: object
 *       required: [subjectName, applicableSection, applicableDepartment, subjectTeacher]
 *       properties:
 *         subjectName: { type: string, example: Mathematics }
 *         applicableSection: { type: string, example: primary }
 *         applicableDepartment: { type: string, example: science }
 *         subjectTeacher: { type: string, example: James Brown }
 *         classId: { type: string, format: uuid }
 *         staffId: { type: string, format: uuid }
 *     PasswordRequest:
 *       type: object
 *       required: [password, confirmPassword]
 *       properties:
 *         password: { type: string, format: password }
 *         confirmPassword: { type: string, format: password }
 *     ChangePasswordRequest:
 *       type: object
 *       required: [newPassword, confirmPassword]
 *       properties:
 *         newPassword: { type: string, format: password }
 *         confirmPassword: { type: string, format: password }
 *     ParentSettingsRequest:
 *       type: object
 *       properties:
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         address: { type: string }
 *         oldPassword: { type: string, format: password }
 *         newPassword: { type: string, format: password }
 *         confirmPassword: { type: string, format: password }
 *         profilePicture: { type: string, format: binary }
 *     MarkAttendanceRequest:
 *       type: object
 *       required: [attendance]
 *       properties:
 *         attendance:
 *           type: array
 *           items:
 *             type: object
 *             required: [studentId, status]
 *             properties:
 *               studentId: { type: string, format: uuid }
 *               status: { type: string, enum: [present, absent] }
 *     CreateScoreRequest:
 *       type: object
 *       required: [subject, score]
 *       properties:
 *         subject: { type: string, example: Mathematics }
 *         score:
 *           type: array
 *           items:
 *             type: object
 *             required: [studentId, continuousAssessment, exam]
 *             properties:
 *               studentId: { type: string, format: uuid }
 *               continuousAssessment: { type: number, minimum: 0, maximum: 100 }
 *               exam: { type: number, minimum: 0, maximum: 100 }
 *     InitializePaymentRequest:
 *       type: object
 *       properties:
 *         classId: { type: string, format: uuid }
 *         className: { type: string }
 *         parentName: { type: string }
 *         parentEmail: { type: string, format: email }
 *         currency: { type: string, enum: [NGN, USD, EUR], default: NGN }
 *         paymentType: { type: string, enum: [card, bank transfer, mobile payment], default: card }
 *     ScanAttendanceRequest:
 *       type: object
 *       required: [token]
 *       properties:
 *         token: { type: string }
 *         latitude: { type: number }
 *         longitude: { type: number }
 *     QrTokenRequest:
 *       type: object
 *       required: [qrToken]
 *       properties:
 *         qrToken: { type: string }
 *   parameters:
 *     TenantHeader:
 *       in: header
 *       name: x-tenant
 *       required: true
 *       schema: { type: string }
 *       description: School tenant or subdomain, for example greenfield
 *     UuidPathId:
 *       in: path
 *       name: id
 *       required: true
 *       schema: { type: string, format: uuid }
 *   responses:
 *     BadRequest:
 *       description: Bad request
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ErrorResponse' }
 *     Unauthorized:
 *       description: Missing, invalid, or expired authentication
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ErrorResponse' }
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ErrorResponse' }
 */

/**
 * @swagger
 * /api/v1/admin/register:
 *   post:
 *     tags: [Admin]
 *     summary: Register a school admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegisterRequest' }
 *     responses:
 *       201: { description: Account created and verification OTP sent }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       409: { description: School name or email already exists }
 * /api/v1/admin/verify:
 *   post:
 *     tags: [Admin]
 *     summary: Verify admin email with OTP
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OtpRequest' }
 *     responses:
 *       200: { description: Email verified and wallet created }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/admin/resend-otp:
 *   post:
 *     tags: [Admin]
 *     summary: Resend admin OTP
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EmailRequest' }
 *     responses:
 *       200: { description: OTP sent successfully }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/admin/login:
 *   post:
 *     tags: [Admin]
 *     summary: Login admin, staff, or parent
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginRequest' }
 *     responses:
 *       200: { description: Login successful; token returned }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       403: { description: Wrong role or locked account }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/admin/forgot-password:
 *   post:
 *     tags: [Admin]
 *     summary: Send password reset OTP
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EmailRequest' }
 *     responses:
 *       200: { description: OTP sent successfully }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/admin/verify-password:
 *   post:
 *     tags: [Admin]
 *     summary: Verify password reset OTP
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OtpRequest' }
 *     responses:
 *       200: { description: OTP verified }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/admin/reset-password:
 *   post:
 *     tags: [Admin]
 *     summary: Reset admin password
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ResetPasswordRequest' }
 *     responses:
 *       200: { description: Password reset successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       403: { description: Password reset OTP has not been verified }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/admin/profile:
 *   get:
 *     tags: [Admin]
 *     summary: Get school profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profile retrieved successfully }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/admin/get-admin:
 *   get:
 *     tags: [Admin]
 *     summary: Get authenticated admin details
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Admin retrieved successfully }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 * /api/v1/admin/wallet:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin wallet
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Wallet retrieved successfully }
 * /api/v1/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get school dashboard summary
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dashboard summary retrieved successfully }
 * /api/v1/admin/school-url:
 *   get:
 *     tags: [Admin]
 *     summary: Get registered school URLs
 *     responses:
 *       200: { description: School URLs retrieved successfully }
 * /api/v1/admin/logout:
 *   post:
 *     tags: [Admin]
 *     summary: Logout current user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Logout successful }
 * /api/v1/admin/today:
 *   get:
 *     tags: [Admin]
 *     summary: Get today's staff attendance from admin controller
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     responses:
 *       200: { description: Today's staff attendance retrieved successfully }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/admin/profile-settings:
 *   put:
 *     tags: [Admin]
 *     summary: Update admin and school profile settings
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               address: { type: string }
 *               oldPassword: { type: string, format: password }
 *               newPassword: { type: string, format: password }
 *               confirmPassword: { type: string, format: password }
 *               adminFirstName: { type: string }
 *               adminLastName: { type: string }
 *               schoolType:
 *                 type: array
 *                 items: { type: string, enum: [nursery, primary, secondary] }
 *               continuousAssessmentConfig: { type: integer }
 *               examConfig: { type: integer }
 *               total: { type: integer }
 *               profilePic: { type: string, format: binary }
 *               schoolLogo: { type: string, format: binary }
 *               schoolStamp: { type: string, format: binary }
 *               cac: { type: string, format: binary }
 *               nepa: { type: string, format: binary }
 *     responses:
 *       200: { description: Admin profile updated successfully }
 */

/**
 * @swagger
 * /api/v1/staff/staff:
 *   post:
 *     tags: [Staff]
 *     summary: Create a staff record and send invite
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateStaffRequest' }
 *     responses:
 *       201: { description: Staff created successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *   get:
 *     tags: [Staff]
 *     summary: Get authenticated staff profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Staff retrieved successfully }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   put:
 *     tags: [Staff]
 *     summary: Update authenticated staff profile and files
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               profilePicture: { type: string, format: binary }
 *               signature: { type: string, format: binary }
 *     responses:
 *       200: { description: Staff updated successfully }
 * /api/v1/staff/staff/{id}:
 *   get:
 *     tags: [Staff]
 *     summary: Get staff by ID as admin
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/UuidPathId' }]
 *     responses:
 *       200: { description: Staff retrieved successfully }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/staff/staff-dashboard:
 *   get:
 *     tags: [Staff]
 *     summary: Get staff dashboard summary and list
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Staff dashboard retrieved successfully }
 * /api/v1/staff/all-staffs:
 *   get:
 *     tags: [Staff]
 *     summary: Get all staff for the admin school
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Staff list retrieved successfully }
 * /api/v1/staff/summary:
 *   get:
 *     tags: [Staff]
 *     summary: Get staff summary counts
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Staff summary retrieved successfully }
 * /api/v1/staff/create-password/{token}:
 *   post:
 *     tags: [Staff]
 *     summary: Activate staff account using invite token
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PasswordRequest' }
 *     responses:
 *       200: { description: Password created successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 * /api/v1/staff/change-password:
 *   put:
 *     tags: [Staff]
 *     summary: Change authenticated staff password
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ChangePasswordRequest' }
 *     responses:
 *       200: { description: Password changed successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 */

/**
 * @swagger
 * /api/v1/student/student:
 *   post:
 *     tags: [Student]
 *     summary: Create a student
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateStudentRequest' }
 *     responses:
 *       201: { description: Student created successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/student/getAllStudents:
 *   get:
 *     tags: [Student]
 *     summary: Get all students for the admin school
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Students retrieved successfully }
 */

/**
 * @swagger
 * /api/v1/parent/create-password:
 *   post:
 *     tags: [Parent]
 *     summary: Activate parent account using invite token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PasswordRequest' }
 *     responses:
 *       200: { description: Password created successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/parent/update-password:
 *   post:
 *     tags: [Parent]
 *     summary: Change parent password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ChangePasswordRequest' }
 *     responses:
 *       200: { description: Password changed successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 * /api/v1/parent/settings:
 *   put:
 *     tags: [Parent]
 *     summary: Update parent profile settings
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema: { $ref: '#/components/schemas/ParentSettingsRequest' }
 *     responses:
 *       200: { description: Parent settings updated successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

/**
 * @swagger
 * /api/v1/class/create-class:
 *   post:
 *     tags: [Class]
 *     summary: Create a class and assign a teacher
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateClassRequest' }
 *     responses:
 *       201: { description: Class created successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/class/get-class:
 *   get:
 *     tags: [Class]
 *     summary: Get one class for the authenticated admin
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Class found }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/class/classes:
 *   get:
 *     tags: [Class]
 *     summary: Get all classes for the authenticated admin school
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Classes retrieved successfully }
 * /api/v1/class/unassigned-classes:
 *   get:
 *     tags: [Class]
 *     summary: Get unassigned classes for the authenticated admin school
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Unassigned classes retrieved successfully }
 * /api/v1/class/classes/{id}:
 *   put:
 *     tags: [Class]
 *     summary: Update a class
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/UuidPathId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateClassRequest' }
 *     responses:
 *       200: { description: Class updated successfully }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     tags: [Class]
 *     summary: Delete a class
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/UuidPathId' }]
 *     responses:
 *       200: { description: Class deleted successfully }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

/**
 * @swagger
 * /api/v1/subject/subject:
 *   post:
 *     tags: [Subject]
 *     summary: Create a subject
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateSubjectRequest' }
 *     responses:
 *       201: { description: Subject created successfully }
 *       403: { description: Admin access required }
 * /api/v1/subject/allSubjects:
 *   get:
 *     tags: [Subject]
 *     summary: Get all subjects
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Subjects retrieved successfully }
 */

/**
 * @swagger
 * /api/v1/classteacher/attendance:
 *   post:
 *     tags: [Class Teacher]
 *     summary: Mark student attendance for the class teacher's class
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/MarkAttendanceRequest' }
 *     responses:
 *       201: { description: Attendance marked successfully }
 *       403: { description: Teacher has no assigned class }
 * /api/v1/classteacher/attendance/today:
 *   get:
 *     tags: [Class Teacher]
 *     summary: Get today's student attendance
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     responses:
 *       200: { description: Today's student attendance retrieved successfully }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/classteacher/mark-score:
 *   post:
 *     tags: [Class Teacher]
 *     summary: Create or update scores
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateScoreRequest' }
 *     responses:
 *       201: { description: Scores marked successfully }
 *       403: { description: Teacher cannot score the selected subject }
 * /api/v1/classteacher/class-teacher-dashboard:
 *   get:
 *     tags: [Class Teacher]
 *     summary: Get class teacher dashboard
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dashboard retrieved successfully }
 * /api/v1/classteacher/updateProfile:
 *   put:
 *     tags: [Class Teacher]
 *     summary: Update class teacher profile settings
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               address: { type: string }
 *               oldPassword: { type: string, format: password }
 *               newPassword: { type: string, format: password }
 *               confirmPassword: { type: string, format: password }
 *               profilePicture: { type: string, format: binary }
 *     responses:
 *       200: { description: Class teacher updated successfully }
 */

/**
 * @swagger
 * /api/v1/subjectteacher/mark-score:
 *   post:
 *     tags: [Subject Teacher]
 *     summary: Create or update subject scores
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateScoreRequest' }
 *     responses:
 *       201: { description: Scores marked successfully }
 *       403: { description: Teacher cannot score the selected subject }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/subjectteacher/subject-teacher-dashboard:
 *   get:
 *     tags: [Subject Teacher]
 *     summary: Get subject teacher dashboard
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dashboard retrieved successfully }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/subjectteacher/updateProfile:
 *   put:
 *     tags: [Subject Teacher]
 *     summary: Update subject teacher profile settings
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               address: { type: string }
 *               oldPassword: { type: string, format: password }
 *               newPassword: { type: string, format: password }
 *               confirmPassword: { type: string, format: password }
 *     responses:
 *       200: { description: Subject teacher updated successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

/**
 * @swagger
 * /api/v1/payment/initialize/{studentId}:
 *   post:
 *     tags: [Payment]
 *     summary: Initialize payment for a student
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/InitializePaymentRequest' }
 *     responses:
 *       201: { description: Payment initialized successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/payment/verify/{reference}:
 *   get:
 *     tags: [Payment]
 *     summary: Verify payment by reference
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Payment verification result }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/payment/history:
 *   get:
 *     tags: [Payment]
 *     summary: Get payment history
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Payment history retrieved successfully }
 * /api/v1/payment/reference/{reference}:
 *   get:
 *     tags: [Payment]
 *     summary: Get payment by reference
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Payment retrieved successfully }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

/**
 * @swagger
 * /api/v1/staffattendance/qr-code:
 *   post:
 *     tags: [Staff Attendance]
 *     summary: Generate today's QR code for staff attendance
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     responses:
 *       201: { description: QR generated successfully }
 *       409: { description: QR already generated today }
 * /api/v1/staffattendance/check-in:
 *   post:
 *     tags: [Staff Attendance]
 *     summary: Scan QR token to check in or check out based on time
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ScanAttendanceRequest' }
 *     responses:
 *       201: { description: Checked in successfully }
 *       200: { description: Checked out successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       409: { description: Already checked in or checked out }
 * /api/v1/staffattendance/check-out:
 *   post:
 *     tags: [Staff Attendance]
 *     summary: Check staff out using QR token
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/QrTokenRequest' }
 *     responses:
 *       200: { description: Check out successful }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/staffattendance/today:
 *   get:
 *     tags: [Staff Attendance]
 *     summary: Get today's staff attendance
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     responses:
 *       200: { description: Today's staff attendance retrieved successfully }
 *       404: { $ref: '#/components/responses/NotFound' }
 * /api/v1/staffattendance/all:
 *   get:
 *     tags: [Staff Attendance]
 *     summary: Get all staff attendance for today
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     responses:
 *       200: { description: Staff attendance retrieved successfully }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
