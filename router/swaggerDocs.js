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
 *   - name: Announcement
 *     description: Announcement dashboard and message management
 *   - name: Staff Attendance
 *     description: Staff attendance QR code and attendance record endpoints
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *
 *     # ─── Error ──────────────────────────────────────────────────────────────
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
 *
 *     # ─── Core models ────────────────────────────────────────────────────────
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
 *
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
 *         adminUrl: { type: string, nullable: true }
 *         adminPublicId: { type: string, nullable: true }
 *
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
 *         nationality: { type: string, example: nigerian }
 *         address: { type: string }
 *         maritalStatus: { type: string, enum: [single, married, divorced, widowed] }
 *         attendanceStatus: { type: string, enum: [present, absent, late], nullable: true }
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
 *         signatureUrl: { type: string, nullable: true }
 *         isActive: { type: boolean }
 *         isVerified: { type: boolean }
 *
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
 *         otherName: { type: string, nullable: true }
 *         gender: { type: string, enum: [male, female] }
 *         dateOfBirth: { type: string, format: date }
 *         nationality: { type: string, example: nigerian }
 *         address: { type: string }
 *         studentClass: { type: string, example: Primary 3 }
 *         department: { type: string, nullable: true }
 *         attendanceStatus: { type: string, enum: [present, absent], nullable: true }
 *         paymentStatus: { type: string, enum: [full payment, part payment, unpaid] }
 *         session: { type: string, example: "2025/2026" }
 *         currentTerm: { type: string, example: First Term, nullable: true }
 *         religion: { type: string, nullable: true }
 *         parentGuardiansFirstName: { type: string }
 *         parentGuardiansLastName: { type: string }
 *         parentGuardiansAddress: { type: string }
 *         parentGuardiansEmail: { type: string, format: email }
 *         parentGuardiansPhone: { type: string, nullable: true }
 *         relationship: { type: string, enum: [father, mother, guardian] }
 *         phoneNumber: { type: string }
 *
 *     Parent:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         adminId: { type: string, format: uuid }
 *         schoolUrl: { type: string }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         address: { type: string, nullable: true }
 *         phoneNumber: { type: string, nullable: true }
 *         email: { type: string, format: email }
 *         role: { type: string, example: parent }
 *         parentProfileUrl: { type: string, nullable: true }
 *         parentProfilePublicId: { type: string, nullable: true }
 *         isActive: { type: boolean }
 *         isVerified: { type: boolean }
 *
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
 *         payableAmount: { type: number, format: double, nullable: true, example: 25000 }
 *         numberOfInstallments: { type: integer, nullable: true, example: 2 }
 *         teacherName: { type: string, nullable: true }
 *         assigned: { type: boolean }
 *
 *     Subject:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         adminId: { type: string, format: uuid }
 *         classId: { type: string, format: uuid, nullable: true }
 *         staffId: { type: string, format: uuid, nullable: true }
 *         schoolUrl: { type: string }
 *         subjectName: { type: string, example: Mathematics }
 *         applicableClasses:
 *           type: array
 *           items: { type: string }
 *           example: [Primary 3, Primary 4]
 *         applicableDepartment: { type: string, nullable: true, example: science }
 *         subjectTeacher: { type: string, nullable: true, example: James Brown }
 *
 *     Payment:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         adminId: { type: string, format: uuid }
 *         studentId: { type: string, format: uuid }
 *         schoolUrl: { type: string }
 *         amount: { type: number, format: double }
 *         paymentType: { type: string, enum: [card, bank transfer, mobile payment] }
 *         paymentStatus: { type: string, enum: [pending, success, failed] }
 *         reference: { type: string }
 *         currency: { type: string, enum: [USD, EUR, NGN] }
 *         paymentDate: { type: string, format: date-time }
 *         parentName: { type: string, nullable: true }
 *         parentEmail: { type: string, format: email, nullable: true }
 *
 *     StaffAttendance:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         adminId: { type: string, format: uuid }
 *         staffId: { type: string, format: uuid }
 *         schoolUrl: { type: string }
 *         qrToken: { type: string }
 *         date: { type: string, format: date }
 *         staffName: { type: string }
 *         staffRole: { type: string }
 *         timeCheckedIn: { type: string, format: date-time, nullable: true }
 *         timeCheckedOut: { type: string, format: date-time, nullable: true }
 *         status: { type: string, enum: [Present, Absent, Late] }
 *         latitude: { type: number, nullable: true }
 *         longitude: { type: number, nullable: true }
 *         address: { type: string, nullable: true }
 *
 *     QRCode:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         adminId: { type: string, format: uuid }
 *         schoolUrl: { type: string }
 *         qrToken: { type: string }
 *         date: { type: string, format: date }
 *         expiresAt: { type: string, format: date-time }
 *         status: { type: string, enum: [active, expired] }
 *
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
 *
 *     StudentAttendanceWithWhatsAppAction:
 *       allOf:
 *         - $ref: '#/components/schemas/StudentAttendance'
 *         - type: object
 *           properties:
 *             parentPhoneNumber: { type: string, nullable: true, example: "08012345678" }
 *             student:
 *               type: object
 *               properties:
 *                 id: { type: string, format: uuid }
 *                 firstName: { type: string, example: Sarah }
 *                 lastName: { type: string, example: James }
 *                 phoneNumber: { type: string, example: "08012345678" }
 *                 parentGuardiansFirstName: { type: string, example: Mrs }
 *                 parentGuardiansLastName: { type: string, example: James }
 *                 parentGuardiansEmail: { type: string, format: email }
 *             whatsAppAction:
 *               type: object
 *               properties:
 *                 enabled: { type: boolean, example: true }
 *                 label: { type: string, example: Notify Parent }
 *                 type: { type: string, example: whatsapp }
 *                 url:
 *                   type: string
 *                   nullable: true
 *                   example: "https://wa.me/2348012345678?text=Good%20day%20Parent"
 *
 *     Score:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         studentId: { type: string, format: uuid }
 *         staffId: { type: string, format: uuid }
 *         subjectId: { type: string, format: uuid }
 *         schoolUrl: { type: string }
 *         subject: { type: string, example: Mathematics }
 *         className: { type: string, example: Primary 3 }
 *         studentName: { type: string, example: Ada Obi }
 *         admissionNumber: { type: string, example: STD/2026/000001 }
 *         continuousAssessment: { type: number, example: 30 }
 *         exam: { type: number, example: 60 }
 *         totalScore: { type: number, example: 90 }
 *
 *     Announcement:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         adminId: { type: string, format: uuid }
 *         schoolUrl: { type: string, example: greenfield }
 *         title: { type: string, example: Staff Meeting Reminder }
 *         content: { type: string, example: All staff members are required to attend the meeting. }
 *         audience: { type: string, enum: [staff, parents, all] }
 *         status: { type: string, enum: [draft, scheduled, template, sent] }
 *         scheduledAt: { type: string, format: date-time, nullable: true }
 *         sentAt: { type: string, format: date-time, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *
 *     # ─── Request bodies ─────────────────────────────────────────────────────
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
 *
 *     LoginRequest:
 *       type: object
 *       required: [role, email, password]
 *       properties:
 *         role: { type: string, enum: [admin, staff, parent] }
 *         email: { type: string, format: email }
 *         password: { type: string, format: password }
 *
 *     EmailRequest:
 *       type: object
 *       required: [email]
 *       properties:
 *         email: { type: string, format: email }
 *
 *     OtpRequest:
 *       type: object
 *       required: [email, otp]
 *       properties:
 *         email: { type: string, format: email }
 *         otp: { type: string, example: "123456" }
 *
 *     ResetPasswordRequest:
 *       type: object
 *       required: [email, newPassword, confirmPassword]
 *       properties:
 *         email: { type: string, format: email }
 *         newPassword: { type: string, format: password }
 *         confirmPassword: { type: string, format: password }
 *
 *     PasswordRequest:
 *       type: object
 *       required: [password, confirmPassword]
 *       properties:
 *         password: { type: string, format: password }
 *         confirmPassword: { type: string, format: password }
 *
 *     ChangePasswordRequest:
 *       type: object
 *       required: [newPassword, confirmPassword]
 *       properties:
 *         newPassword: { type: string, format: password }
 *         confirmPassword: { type: string, format: password }
 *
 *     CreateStaffRequest:
 *       type: object
 *       required: [firstName, lastName, gender, dateOfBirth, nationality, address, qualification, maritalStatus, phoneNumber, email, staffType]
 *       properties:
 *         firstName: { type: string, example: James }
 *         lastName: { type: string, example: Brown }
 *         otherName: { type: string, nullable: true }
 *         gender: { type: string, enum: [male, female] }
 *         dateOfBirth: { type: string, format: date, example: "1990-05-15" }
 *         nationality: { type: string, example: nigerian }
 *         address: { type: string }
 *         qualification: { type: string, example: B.Ed Mathematics }
 *         maritalStatus: { type: string, enum: [single, married, divorced, widowed] }
 *         phoneNumber: { type: string, example: "08012345678" }
 *         email: { type: string, format: email }
 *         staffType: { type: string, enum: [class teacher, subject teacher] }
 *         classId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: UUID of the class to assign. Required only when staffType is "class teacher".
 *
 *     UpdateStaffRequest:
 *       type: object
 *       properties:
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         phoneNumber: { type: string }
 *         staffType: { type: string, enum: [class teacher, subject teacher] }
 *
 *     CreateStudentRequest:
 *       type: object
 *       required: [firstName, lastName, gender, dateOfBirth, nationality, address, classId, parentGuardiansFirstName, parentGuardiansLastName, parentGuardiansAddress, relationship, phoneNumber, parentGuardiansEmail]
 *       properties:
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         otherName: { type: string, nullable: true }
 *         gender: { type: string, enum: [male, female] }
 *         dateOfBirth: { type: string, format: date }
 *         nationality: { type: string, example: nigerian }
 *         address: { type: string }
 *         classId: { type: string, format: uuid }
 *         department: { type: string, nullable: true }
 *         session: { type: string, example: "2025/2026" }
 *         religion: { type: string, nullable: true }
 *         parentGuardiansFirstName: { type: string }
 *         parentGuardiansLastName: { type: string }
 *         parentGuardiansAddress: { type: string }
 *         relationship: { type: string, enum: [father, mother, guardian] }
 *         phoneNumber: { type: string }
 *         parentGuardiansEmail: { type: string, format: email }
 *
 *     CreateClassRequest:
 *       type: object
 *       required: [className, amount, paymentOption]
 *       properties:
 *         className: { type: string, example: Primary 3 }
 *         amount: { type: number, example: 50000 }
 *         paymentOption: { type: string, enum: [full payment, installment] }
 *         teacherId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: Optional. UUID of the staff member to assign as class teacher.
 *         numberOfInstallments:
 *           type: integer
 *           minimum: 2
 *           nullable: true
 *           description: Required when paymentOption is "installment".
 *
 *     UpdateClassRequest:
 *       type: object
 *       properties:
 *         className: { type: string, example: Primary 3 }
 *         amount: { type: number, example: 50000 }
 *         paymentOption: { type: string, enum: [full payment, installment] }
 *         teacherId: { type: string, format: uuid, nullable: true }
 *         numberOfInstallments:
 *           type: integer
 *           minimum: 2
 *           nullable: true
 *           description: Required when paymentOption is "installment".
 *
 *     UpdateStudentRequest:
 *       type: object
 *       properties:
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         otherName: { type: string, nullable: true }
 *         gender: { type: string, enum: [male, female] }
 *         dateOfBirth: { type: string, format: date }
 *         nationality: { type: string, example: nigerian }
 *         address: { type: string }
 *         classId: { type: string, format: uuid, description: UUID of the new class. Triggers a class lookup and studentClass sync only if it differs from the student's current classId. }
 *         department: { type: string, nullable: true }
 *         session: { type: string, example: "2025/2026" }
 *         religion: { type: string, nullable: true }
 *         relationship: { type: string, enum: [father, mother, guardian] }
 *         phoneNumber: { type: string }
 *         parentGuardiansFirstName: { type: string, description: If changed, the linked parent record's firstName is kept in sync. }
 *         parentGuardiansLastName: { type: string, description: If changed, the linked parent record's lastName is kept in sync. }
 *         parentGuardiansAddress: { type: string }
 *         parentGuardiansEmail: { type: string, format: email }
 *
 *     UpdateSubjectRequest:
 *       type: object
 *       properties:
 *         subjectName: { type: string, example: Mathematics, description: Renaming checks for a duplicate subject name already on the same class. }
 *         applicableDepartment: { type: string, nullable: true, example: science }
 *         teacherId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: Pass a UUID to reassign, or null to unassign. Omit the field entirely to leave the current teacher unchanged. Updating this keeps both the old and new teacher's `subjects` list in sync.
 *
 *     CreateSubjectRequest:
 *       type: object
 *       required: [subjectName, applicableClasses]
 *       properties:
 *         subjectName: { type: string, example: Mathematics }
 *         applicableClasses:
 *           type: array
 *           minItems: 1
 *           items: { type: string }
 *           example: [Primary 3, Primary 4]
 *           description: List of class names this subject applies to. All classes must exist under the admin's school.
 *         applicableDepartment: { type: string, nullable: true, example: science }
 *         teacherId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: Optional. UUID of the staff member to assign as subject teacher.
 *
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
 *
 *     CreateScoreRequest:
 *       type: object
 *       required: [score]
 *       properties:
 *         score:
 *           type: array
 *           items:
 *             type: object
 *             required: [studentId, continuousAssessment, exam]
 *             properties:
 *               studentId: { type: string, format: uuid }
 *               continuousAssessment: { type: number, minimum: 0, example: 30 }
 *               exam: { type: number, minimum: 0, example: 60 }
 *
 *     UpdateScoreRequest:
 *       type: object
 *       required: [score]
 *       properties:
 *         score:
 *           type: array
 *           items:
 *             type: object
 *             required: [studentId]
 *             properties:
 *               studentId: { type: string, format: uuid }
 *               continuousAssessment: { type: number, minimum: 0, nullable: true }
 *               exam: { type: number, minimum: 0, nullable: true }
 *
 *     InitializePaymentRequest:
 *       type: object
 *       properties:
 *         currency: { type: string, enum: [NGN, USD, EUR], default: NGN }
 *         paymentType: { type: string, enum: [card, bank transfer, mobile payment], default: card }
 *
 *     ScanAttendanceRequest:
 *       type: object
 *       required: [token]
 *       properties:
 *         token: { type: string, description: QR token scanned from the generated QR code }
 *         latitude: { type: number, nullable: true }
 *         longitude: { type: number, nullable: true }
 *
 *     QrTokenRequest:
 *       type: object
 *       required: [qrToken]
 *       properties:
 *         qrToken: { type: string }
 *
 *     CreateAnnouncementRequest:
 *       type: object
 *       required: [title, content]
 *       properties:
 *         title: { type: string, example: Staff Meeting Reminder }
 *         content: { type: string, example: All staff members are required to attend the meeting scheduled for Monday. }
 *         audience: { type: string, enum: [staff, parents, all], default: all }
 *         status: { type: string, enum: [draft, scheduled, template, sent], default: draft }
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Required when status is "scheduled".
 *
 *     ParentSettingsRequest:
 *       type: object
 *       properties:
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         address: { type: string }
 *         oldPassword: { type: string, format: password }
 *         newPassword: { type: string, format: password }
 *         confirmPassword: { type: string, format: password }
 *         profilePicture: { type: string, format: binary, description: Profile photo upload }
 *
 *     # ─── Response bodies ────────────────────────────────────────────────────
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: account created }
 *         data:
 *           type: object
 *           properties:
 *             schoolName: { type: string, example: Greenfield Academy }
 *             schoolUrl: { type: string, example: greenfield }
 *             email: { type: string, format: email }
 *         adminProfile: { $ref: '#/components/schemas/AdminProfile' }
 *         verifyRedirectUrl: { type: string, example: "https://www.greenfield.ucheva.com/verify" }
 *         email: { type: string, format: email }
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: Login successful }
 *         token: { type: string, description: JWT bearer token }
 *         role: { type: string, enum: [admin, staff, parent] }
 *
 *     StaffDashboardResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: Staff retrieved successfully }
 *         summary:
 *           type: object
 *           properties:
 *             totalStaff: { type: integer, example: 28 }
 *             totalClassTeachers: { type: integer, example: 10 }
 *             totalSubjectTeachers: { type: integer, example: 15 }
 *             totalActiveStaff: { type: integer, example: 25 }
 *         staffData:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: string, format: uuid }
 *               fullName: { type: string, example: James Brown }
 *               staffType: { type: string, example: class teacher }
 *
 *     StaffListResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: staffs retrieved successfully }
 *         staffsData:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: string, format: uuid }
 *               fullName: { type: string, example: James Brown }
 *               staffType: { type: string, example: class teacher }
 *               phoneNumber: { type: string, example: "08012345678" }
 *               assignedClass: { type: string, example: Primary 3 }
 *               assignedSubject: { type: string, example: Mathematics }
 *
 *     StaffSummaryResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: Staff summary retrieved successfully }
 *         summary:
 *           type: object
 *           properties:
 *             totalStaff: { type: integer, example: 28 }
 *             totalTeachingStaff: { type: integer, example: 20 }
 *             totalNonTeachingStaff: { type: integer, example: 8 }
 *             totalClassTeachers: { type: integer, example: 10 }
 *
 *     StudentListResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: Students retrieved successfully }
 *         studentsData:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: string, format: uuid }
 *               fullName: { type: string, example: Ada Obi }
 *               gender: { type: string, example: female }
 *               classes: { type: string, example: Primary 3 }
 *               department: { type: string, nullable: true }
 *               parentGuardiansPhoneNumber: { type: string, example: "08012345678" }
 *
 *     ClassListResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: Classes retrieved successfully }
 *         classes:
 *           type: array
 *           items: { $ref: '#/components/schemas/SchoolClass' }
 *
 *     ClassListWithTeacherResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: Classes retrieved successfully }
 *         classes:
 *           type: array
 *           items:
 *             allOf:
 *               - $ref: '#/components/schemas/SchoolClass'
 *               - type: object
 *                 properties:
 *                   staff:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       firstName: { type: string }
 *                       lastName: { type: string }
 *
 *     UnassignedClassListResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: unassigned class retrieved successfully }
 *         classData:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: string, format: uuid }
 *               className: { type: string, example: Primary 3 }
 *
 *     SubjectListResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: Subjects retrieved successfully }
 *         subjects:
 *           type: array
 *           items: { $ref: '#/components/schemas/Subject' }
 *
 *     ClassTeacherDashboardResponse:
 *       type: object
 *       properties:
 *         dashboard:
 *           type: object
 *           properties:
 *             myAttendance: { type: string, enum: [present, absent, late], nullable: true }
 *             assignedClass: { type: string, example: Primary 3 }
 *             totalStudents: { type: integer, example: 35 }
 *             assignedSubjects:
 *               oneOf:
 *                 - type: array
 *                   items: { type: string }
 *                 - type: string
 *               nullable: true
 *         myClass:
 *           type: object
 *           properties:
 *             myClass: { type: string, example: Primary 3 }
 *             totalStudents: { type: integer, example: 35 }
 *             totalFemale: { type: integer, example: 18 }
 *             totalMale: { type: integer, example: 17 }
 *             presentStudents: { type: integer, example: 30 }
 *         getAllStudents:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: string, format: uuid }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               gender: { type: string, enum: [male, female] }
 *               admissionNumber: { type: string }
 *               attendanceStatus: { type: string, enum: [present, absent], nullable: true }
 *               classId: { type: string, format: uuid }
 *
 *     ClassTeacherStudentListResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: students retrieved }
 *         studentData:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: string, format: uuid }
 *               fullName: { type: string, example: Ada Obi }
 *               admissionNumber: { type: string, example: STD/2026/000001 }
 *               gender: { type: string, enum: [male, female] }
 *               attendanceStatus: { type: string, enum: [present, absent], nullable: true }
 *               feeStatus: { type: string, enum: [full payment, part payment, unpaid] }
 *
 *     ScoresResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: Scores retrieved successfully }
 *         total: { type: integer, example: 35 }
 *         scores:
 *           type: array
 *           items: { $ref: '#/components/schemas/Score' }
 *
 *     ParentDashboardResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: Parent dashboard retrieved successfully }
 *         dashboard:
 *           type: object
 *           properties:
 *             greeting: { type: string, example: "Good Day, Mrs Obi" }
 *             parent:
 *               type: object
 *               properties:
 *                 name: { type: string, example: Mrs Obi }
 *                 firstName: { type: string }
 *                 lastName: { type: string }
 *                 email: { type: string, format: email }
 *                 phoneNumber: { type: string, nullable: true }
 *                 address: { type: string, nullable: true }
 *                 profileUrl: { type: string, nullable: true }
 *             student:
 *               type: object
 *               properties:
 *                 id: { type: string, format: uuid }
 *                 name: { type: string, example: Emeka Obi }
 *                 class: { type: string, example: Primary 3 }
 *                 admissionNumber: { type: string, example: STD/2026/000001 }
 *                 feeStatus: { type: string, enum: [full payment, part payment, unpaid] }
 *                 attendanceStatus: { type: string, enum: [present, absent], nullable: true }
 *                 currentTerm: { type: string, example: First Term }
 *                 session: { type: string, example: "2025/2026" }
 *             paymentHistory:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string, format: uuid }
 *                   date: { type: string, example: "Jan 15, 2026" }
 *                   term: { type: string, example: First Term }
 *                   amount: { type: number, example: 50000 }
 *                   currency: { type: string, example: NGN }
 *                   status: { type: string, enum: [pending, success, failed] }
 *                   reference: { type: string }
 *             monthlyAttendance:
 *               type: object
 *               properties:
 *                 month: { type: string, example: June 2026 }
 *                 percentage: { type: number, example: 85.7 }
 *                 presentDays: { type: integer, example: 18 }
 *                 absentDays: { type: integer, example: 3 }
 *                 totalDays: { type: integer, example: 21 }
 *
 *     ParentStudentListResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: All students retrieved successfully }
 *         studentsData:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: string, format: uuid }
 *               fullName: { type: string, example: Emeka Obi }
 *         parentName: { type: string, example: Mrs Obi }
 *
 *     QRGenerateResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: QR Generated }
 *         qr: { $ref: '#/components/schemas/QRCode' }
 *         qrImage:
 *           type: string
 *           description: Base64-encoded PNG data URL of the QR code image
 *           example: "data:image/png;base64,iVBORw0KGgo..."
 *         link:
 *           type: string
 *           example: "https://greenfield.ucheva.com/attendance/abc123token"
 *
 *     StaffAttendanceListResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: Today's staff attendance retrieved successfully }
 *         Attendance:
 *           type: array
 *           items: { $ref: '#/components/schemas/StaffAttendance' }
 *
 *     AnnouncementDashboardResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: Announcement dashboard retrieved successfully }
 *         announcementDashboard:
 *           type: object
 *           properties:
 *             title: { type: string, example: Announcements }
 *             subtitle: { type: string, example: Create and manage messages for staff and parents. }
 *             createAction:
 *               type: object
 *               properties:
 *                 label: { type: string, example: Create Announcement }
 *                 method: { type: string, example: POST }
 *                 url: { type: string, example: /api/v1/announcement }
 *             activeTab: { type: string, example: all }
 *             search: { type: string, example: meeting }
 *             cards:
 *               type: object
 *               properties:
 *                 draft:
 *                   type: object
 *                   properties:
 *                     value: { type: integer, example: 3 }
 *                     subtitle: { type: string, example: Not yet sent }
 *                 scheduled:
 *                   type: object
 *                   properties:
 *                     value: { type: integer, example: 6 }
 *                     subtitle: { type: string, example: Upcoming messages }
 *                 templates:
 *                   type: object
 *                   properties:
 *                     value: { type: integer, example: 2 }
 *                     subtitle: { type: string, example: Reusable Messages }
 *                 sent:
 *                   type: object
 *                   properties:
 *                     value: { type: integer, example: 19 }
 *                     subtitle: { type: string, example: Sent successfully }
 *             tabs:
 *               type: array
 *               items: { type: string }
 *               example: [all, drafts, scheduled, template, sent]
 *             announcements:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Announcement'
 *                   - type: object
 *                     properties:
 *                       displayDate: { type: string, format: date-time, nullable: true }
 *                       displayTime: { type: string, nullable: true, example: "8:30 AM" }
 *                       actions:
 *                         type: object
 *                         properties:
 *                           canEdit: { type: boolean, example: true }
 *                           canSend: { type: boolean, example: true }
 *                           canReuse: { type: boolean, example: false }
 *             pagination:
 *               type: object
 *               properties:
 *                 page: { type: integer, example: 1 }
 *                 limit: { type: integer, example: 10 }
 *                 total: { type: integer, example: 30 }
 *                 totalPages: { type: integer, example: 3 }
 *
 *     AdminDashboardResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: School dashboard retrieved successfully }
 *         dashboard:
 *           type: object
 *           properties:
 *             greeting: { type: string, example: "Good morning, Greenfield Academy" }
 *             overviewText: { type: string, example: "Here's an overview of Greenfield Academy activities today." }
 *             currentTerm: { type: string, example: Third Term }
 *             filters:
 *               type: object
 *               properties:
 *                 classSection: { type: string, example: All Classes }
 *                 paymentStatus: { type: string, example: All Status }
 *                 term: { type: string, example: Third Term }
 *             cards:
 *               type: object
 *               properties:
 *                 totalStudents:
 *                   type: object
 *                   properties:
 *                     value: { type: integer, example: 342 }
 *                     fromLastWeek: { type: integer, example: 12 }
 *                 totalStaff:
 *                   type: object
 *                   properties:
 *                     value: { type: integer, example: 28 }
 *                     fromLastWeek: { type: integer, example: 2 }
 *                 attendanceRate:
 *                   type: object
 *                   properties:
 *                     value: { type: number, example: 93 }
 *                     fromYesterday: { type: number, example: 2 }
 *                 feesCollected:
 *                   type: object
 *                   properties:
 *                     value: { type: number, example: 1200000 }
 *                     fromLastWeek: { type: number, example: 150000 }
 *                     percentCollected: { type: number, example: 72 }
 *             feeRecords:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   studentId: { type: string, format: uuid }
 *                   studentName: { type: string, example: Adaeze Clinton }
 *                   class: { type: string, example: JSS 1A }
 *                   totalAmount: { type: number, example: 75000 }
 *                   amountPaid: { type: number, example: 39000 }
 *                   paymentType: { type: string, nullable: true, example: bank transfer }
 *                   status: { type: string, example: full payment }
 *                   date: { type: string, format: date-time, nullable: true }
 *                   reference: { type: string, nullable: true }
 *                   currency: { type: string, example: NGN }
 *             pagination:
 *               type: object
 *               properties:
 *                 page: { type: integer, example: 1 }
 *                 limit: { type: integer, example: 20 }
 *                 total: { type: integer, example: 342 }
 *                 totalPages: { type: integer, example: 18 }
 *         summary:
 *           type: object
 *           properties:
 *             totalStudents: { type: integer, example: 342 }
 *             totalStaff: { type: integer, example: 28 }
 *             attendanceRate: { type: number, example: 93 }
 *             totalStudentAttendancePercent: { type: number, example: 94 }
 *             totalStaffAttendancePercent: { type: number, example: 89 }
 *             totalFeesCollected: { type: number, example: 1200000 }
 *             feesCollectedPercent: { type: number, example: 72 }
 *
 *     FeesDashboardResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: Fees dashboard retrieved successfully }
 *         feesDashboard:
 *           type: object
 *           properties:
 *             greeting: { type: string, example: "Good morning, Greenfield Academy" }
 *             overviewText: { type: string, example: "Here's an overview of Greenfield Academy activities today." }
 *             currentTerm: { type: string, example: Third Term }
 *             filters:
 *               type: object
 *               properties:
 *                 classSection: { type: string, example: All Classes }
 *                 paymentStatus: { type: string, example: All Status }
 *                 term: { type: string, example: Third Term }
 *             cards:
 *               type: object
 *               properties:
 *                 totalStudents:
 *                   type: object
 *                   properties:
 *                     value: { type: integer, example: 0 }
 *                     fromLastWeek: { type: integer, example: 0 }
 *                 totalStaff:
 *                   type: object
 *                   properties:
 *                     value: { type: integer, example: 0 }
 *                     fromLastWeek: { type: integer, example: 0 }
 *                 attendanceRate:
 *                   type: object
 *                   properties:
 *                     value: { type: number, example: 0 }
 *                     fromLastWeek: { type: number, example: 0 }
 *                 feesCollected:
 *                   type: object
 *                   properties:
 *                     value: { type: number, example: 0 }
 *                     fromLastWeek: { type: number, example: 0 }
 *                     percentCollected: { type: number, example: 0 }
 *             feeRecords:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   studentId: { type: string, format: uuid }
 *                   studentName: { type: string, example: Adaeze Clinton }
 *                   class: { type: string, example: JSS 1A }
 *                   totalAmount: { type: number, example: 75000 }
 *                   amountPaid: { type: number, example: 39000 }
 *                   paymentType: { type: string, nullable: true, example: bank transfer }
 *                   status: { type: string, example: part payment }
 *                   date: { type: string, format: date-time, nullable: true }
 *                   reference: { type: string, nullable: true }
 *                   currency: { type: string, example: NGN }
 *             exportData:
 *               type: array
 *               items:
 *                 type: object
 *             pagination:
 *               type: object
 *               properties:
 *                 page: { type: integer, example: 1 }
 *                 limit: { type: integer, example: 20 }
 *                 total: { type: integer, example: 0 }
 *                 totalPages: { type: integer, example: 0 }
 *
 *   # ─── Shared parameters ────────────────────────────────────────────────────
 *   parameters:
 *     TenantHeader:
 *       in: header
 *       name: x-tenant
 *       required: true
 *       schema: { type: string, example: greenfield }
 *       description: School subdomain identifier (e.g. greenfield for greenfield.ucheva.com)
 *     UuidPathId:
 *       in: path
 *       name: id
 *       required: true
 *       schema: { type: string, format: uuid }
 *
 *   # ─── Shared responses ─────────────────────────────────────────────────────
 *   responses:
 *     BadRequest:
 *       description: Bad request — validation failed or invalid input
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ErrorResponse' }
 *     Unauthorized:
 *       description: Missing, invalid, or expired authentication token
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ErrorResponse' }
 *     Forbidden:
 *       description: Authenticated but not authorized to perform this action
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ErrorResponse' }
 *     NotFound:
 *       description: Requested resource not found
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ErrorResponse' }
 *     Conflict:
 *       description: Resource already exists or conflicts with current state
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ErrorResponse' }
 */

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/admin/register:
 *   post:
 *     tags: [Admin]
 *     summary: Register a new school admin
 *     description: Creates an admin account and sends an OTP to the provided email for verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegisterRequest' }
 *     responses:
 *       201:
 *         description: Account created and verification OTP sent
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/RegisterResponse' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *
 * /api/v1/admin/verify:
 *   post:
 *     tags: [Admin]
 *     summary: Verify admin email with OTP
 *     description: Verifies the OTP sent during registration and activates the admin account. A wallet is created on success.
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OtpRequest' }
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Verification successful }
 *                 loginRedirectUrl: { type: string, example: "https://www.greenfield.ucheva.com/login" }
 *                 email: { type: string, format: email }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/admin/resend-otp:
 *   post:
 *     tags: [Admin]
 *     summary: Resend email verification OTP
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EmailRequest' }
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: OTP sent successfully }
 *                 verifyRedirectUrl: { type: string, example: "https://www.greenfield.ucheva.com/verify" }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/admin/login:
 *   post:
 *     tags: [Admin]
 *     summary: Login — admin, staff, or parent
 *     description: Authenticates any user type. The `role` field determines which table is queried.
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginRequest' }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/LoginResponse' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/admin/forgot-password:
 *   post:
 *     tags: [Admin]
 *     summary: Request a password reset OTP
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/EmailRequest' }
 *     responses:
 *       200:
 *         description: Password reset OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: OTP sent successfully }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
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
 *       200:
 *         description: OTP verified — password reset is now permitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: OTP verified }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/admin/reset-password:
 *   post:
 *     tags: [Admin]
 *     summary: Reset admin password
 *     description: Sets a new password. The admin must have successfully verified the reset OTP first.
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ResetPasswordRequest' }
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Password reset successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/admin/profile:
 *   get:
 *     tags: [Admin]
 *     summary: Get school profile (admin profile record)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Profile retrieved successfully }
 *                 profile: { $ref: '#/components/schemas/AdminProfile' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/admin/get-admin:
 *   get:
 *     tags: [Admin]
 *     summary: Get authenticated admin details
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Admin retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Admin retrieved successfully }
 *                 admin: { $ref: '#/components/schemas/Admin' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 * /api/v1/admin/wallet:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin wallet balance
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Wallet retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Wallet retrieved successfully }
 *                 wallet:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     adminId: { type: string, format: uuid }
 *                     schoolUrl: { type: string }
 *                     balance: { type: number, example: 250000 }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 * /api/v1/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get school dashboard overview with fee records
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: classSection
 *         required: false
 *         schema: { type: string, example: JSS 1A }
 *         description: Filter fee records by class. Omit or use "All Classes" for all classes.
 *       - in: query
 *         name: paymentStatus
 *         required: false
 *         schema:
 *           type: string
 *           enum: [All Status, full payment, part payment, unpaid]
 *         description: Filter fee records by payment status.
 *       - in: query
 *         name: term
 *         required: false
 *         schema: { type: string, example: Third Term }
 *       - in: query
 *         name: page
 *         required: false
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         required: false
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       200:
 *         description: Dashboard overview retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AdminDashboardResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/admin/school-url:
 *   get:
 *     tags: [Admin]
 *     summary: Get all registered school URLs
 *     description: Public endpoint used for subdomain validation during login.
 *     responses:
 *       200:
 *         description: School URLs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: School URLs retrieved successfully }
 *                 schoolUrls:
 *                   type: array
 *                   items: { type: string, example: greenfield }
 *
 * /api/v1/admin/logout:
 *   post:
 *     tags: [Admin]
 *     summary: Logout current user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Logout successful }
 *
 * /api/v1/admin/today:
 *   get:
 *     tags: [Admin]
 *     summary: Get today's staff attendance (admin view)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     responses:
 *       200:
 *         description: Today's staff attendance retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StaffAttendanceListResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/admin/profile-settings:
 *   put:
 *     tags: [Admin]
 *     summary: Update admin account and school profile settings
 *     description: Supports optional file uploads for school logo, stamp, CAC certificate, and NEPA bill. Send as multipart/form-data.
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
 *       200:
 *         description: Admin profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Admin profile updated successfully }
 *                 admin: { $ref: '#/components/schemas/Admin' }
 *                 profile: { $ref: '#/components/schemas/AdminProfile' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

// ─────────────────────────────────────────────────────────────────────────────
// STAFF
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/staff/staff:
 *   post:
 *     tags: [Staff]
 *     summary: Create a staff record and send invite email
 *     description: Creates a staff member and sends a one-day invite link to set their password. If a `classId` is provided the staff must have `staffType` of "class teacher".
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateStaffRequest' }
 *     responses:
 *       201:
 *         description: Staff created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Staff created successfully }
 *                 redirectUrl: { type: string, example: "https://greenfield.ucheva.com/create-password/eyJ..." }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 *   get:
 *     tags: [Staff]
 *     summary: Get authenticated staff's own profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Staff profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Staff retrieved successfully }
 *                 staff: { $ref: '#/components/schemas/Staff' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/staff/staff/{staffId}:
 *   get:
 *     tags: [Staff]
 *     summary: Get a specific staff member by ID (admin access)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Staff retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Staff retrieved successfully }
 *                 staff: { $ref: '#/components/schemas/Staff' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 *   put:
 *     tags: [Staff]
 *     summary: Update a staff member's details
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateStaffRequest' }
 *     responses:
 *       200:
 *         description: Staff updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Staff updated successfully }
 *                 staff:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     fullName: { type: string, example: James Brown }
 *                     staffType: { type: string }
 *                     phoneNumber: { type: string }
 *                     assignedClass: { type: string }
 *                     assignedSubject: { type: string }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 *   delete:
 *     tags: [Staff]
 *     summary: Delete a staff member
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Staff deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Staff deleted successfully }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/staff/admin/{id}:
 *   get:
 *     tags: [Staff]
 *     summary: Get a staff member by ID, looked up directly by primary key
 *     description: Unlike the `/staff/{staffId}` route, this lookup is a plain `findByPk` with no admin or schoolUrl scoping.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Staff retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Staff retrieved successfully }
 *                 staff: { $ref: '#/components/schemas/Staff' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/staff/staff-dashboard:
 *   get:
 *     tags: [Staff]
 *     summary: Get staff dashboard — summary counts and staff list
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Staff dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StaffDashboardResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 * /api/v1/staff/all-staffs:
 *   get:
 *     tags: [Staff]
 *     summary: Get all staff for the admin's school
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Staff list retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StaffListResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 * /api/v1/staff/summary:
 *   get:
 *     tags: [Staff]
 *     summary: Get staff count summary — total, teaching, non-teaching, class teachers
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Staff summary retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StaffSummaryResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 * /api/v1/staff/create-password/{token}:
 *   post:
 *     tags: [Staff]
 *     summary: Activate staff account using invite token
 *     description: Sets the initial password for a staff member (or parent) using the JWT token from their invite email. Account is marked active and verified on success.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *         description: JWT invite token received in the welcome email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PasswordRequest' }
 *     responses:
 *       200:
 *         description: Password created and account activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Password created successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
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
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Password changed successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/student/student:
 *   post:
 *     tags: [Student]
 *     summary: Create a student and auto-create a linked parent account
 *     description: Enrols a new student. A parent record is automatically created and an invite email is sent to the parent's email address.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateStudentRequest' }
 *     responses:
 *       201:
 *         description: Student created successfully and parent invite sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Student created successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/student/getAllStudents:
 *   get:
 *     tags: [Student]
 *     summary: Get all students for the admin's school
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StudentListResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 * /api/v1/student/class/{classId}:
 *   get:
 *     tags: [Student]
 *     summary: Get all students for a specific class
 *     description: Returns student records for the specified class belonging to the authenticated admin's school.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the class to filter students by
 *     responses:
 *       200:
 *         description: Students retrieved successfully for the requested class
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StudentListResponse' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/student/new-intake:
 *   get:
 *     tags: [Student]
 *     summary: Get count of students enrolled in the last 30 days
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: New intake retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: new intake retrieved successfully }
 *                 totalStudentsLast30Days: { type: integer, example: 14 }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 * /api/v1/student/student/{id}:
 *   put:
 *     tags: [Student]
 *     summary: Update a student's details
 *     description: >
 *       Partial update — only provided fields are changed. If `firstName`, `lastName`, or `otherName`
 *       is changed, checks for a name collision with another student in the same school.
 *       If `classId` differs from the student's current class, the new class is validated and
 *       `studentClass` is synced. If the student has a linked parent and any parent-related field
 *       (`parentGuardiansName`, `parentGuardiansEmail`, `parentGuardiansAddress`, `phoneNumber`) is
 *       provided, the parent record is updated to match.
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/UuidPathId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateStudentRequest' }
 *     responses:
 *       200:
 *         description: Student updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Student updated successfully }
 *                 student: { $ref: '#/components/schemas/Student' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 *   delete:
 *     tags: [Student]
 *     summary: Delete a student
 *     description: >
 *       Deletes the student record. If the student had a linked parent and this was the
 *       parent's last remaining child, the parent account is deleted as well.
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/UuidPathId' }]
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Student deleted successfully }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// ─────────────────────────────────────────────────────────────────────────────
// PARENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/parent/create-password:
 *   post:
 *     tags: [Parent]
 *     summary: Activate parent account with initial password
 *     description: Sets the initial password for a parent using their bearer token (from the invite link). Marks the account as active and verified.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PasswordRequest' }
 *     responses:
 *       200:
 *         description: Password created and account activated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Password created successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/parent/update-password:
 *   put:
 *     tags: [Parent]
 *     summary: Change parent password
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ChangePasswordRequest' }
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Password changed successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 * /api/v1/parent/students:
 *   get:
 *     tags: [Parent]
 *     summary: Get all children linked to the authenticated parent
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: All students retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ParentStudentListResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/parent/student/{id}:
 *   get:
 *     tags: [Parent]
 *     summary: Get a specific child linked to the authenticated parent
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Student UUID
 *     responses:
 *       200:
 *         description: Student retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: students retrieved successfully }
 *                 getStudent: { $ref: '#/components/schemas/Student' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/parent/dashboard/{studentId}:
 *   get:
 *     tags: [Parent]
 *     summary: Get parent dashboard for a specific child
 *     description: Returns the parent's profile, child's details, payment history, and monthly attendance. Only accessible for children belonging to the authenticated parent.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: UUID of the child whose dashboard to load
 *       - in: query
 *         name: month
 *         required: false
 *         schema: { type: string, example: "2026-06" }
 *         description: Month in YYYY-MM format. Defaults to the current month.
 *     responses:
 *       200:
 *         description: Parent dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ParentDashboardResponse' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/parent/settings:
 *   put:
 *     tags: [Parent]
 *     summary: Update parent profile and optionally change password
 *     description: Accepts multipart/form-data so a profile picture can be uploaded alongside text fields.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema: { $ref: '#/components/schemas/ParentSettingsRequest' }
 *     responses:
 *       200:
 *         description: Parent updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Parent updated successfully }
 *                 parentData:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     firstName: { type: string }
 *                     lastName: { type: string }
 *                     address: { type: string }
 *                     parentProfileUrl: { type: string, nullable: true }
 *                     parentProfilePublicId: { type: string, nullable: true }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// ─────────────────────────────────────────────────────────────────────────────
// CLASS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/class/create-class:
 *   post:
 *     tags: [Class]
 *     summary: Create a class and optionally assign a teacher
 *     description: >
 *       Creates a new class. If `paymentOption` is "installment", `numberOfInstallments` (≥ 2) is required and `payableAmount` is automatically calculated.
 *       Returns 400 if a class with this `className` already exists for the admin and is already marked `assigned`.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateClassRequest' }
 *     responses:
 *       201:
 *         description: Class created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Class created successfully }
 *                 class: { $ref: '#/components/schemas/SchoolClass' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/class/get-class:
 *   get:
 *     tags: [Class]
 *     summary: Get one class for the authenticated admin
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Class found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: class found }
 *                 schoolClass: { $ref: '#/components/schemas/SchoolClass' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/class/classes:
 *   get:
 *     tags: [Class]
 *     summary: Get all classes for the authenticated admin's school
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Classes retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ClassListResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 * /api/v1/class/unassigned-classes:
 *   get:
 *     tags: [Class]
 *     summary: Get all classes that have not yet been assigned a teacher
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Unassigned classes retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/UnassignedClassListResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 * /api/v1/class/classes-by-department:
 *   get:
 *     tags: [Class]
 *     summary: Get all classes for the school with their assigned teacher's name
 *     description: Returns every class under the admin's school (not scoped to the requesting admin) along with the first/last name of the staff member assigned as class teacher, where applicable.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Classes retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ClassListWithTeacherResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 * /api/v1/class/classes/{id}:
 *   put:
 *     tags: [Class]
 *     summary: Update class details
 *     description: Partial update — only provided fields are changed. If switching to installment, `numberOfInstallments` (≥ 2) must be supplied.
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/UuidPathId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateClassRequest' }
 *     responses:
 *       200:
 *         description: Class updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Class updated successfully }
 *                 class: { $ref: '#/components/schemas/SchoolClass' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 *   delete:
 *     tags: [Class]
 *     summary: Delete a class
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/UuidPathId' }]
 *     responses:
 *       200:
 *         description: Class deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Class deleted successfully }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// ─────────────────────────────────────────────────────────────────────────────
// SUBJECT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/subject/subject:
 *   post:
 *     tags: [Subject]
 *     summary: Create a subject and assign it to one or more classes
 *     description: >
 *       Creates one subject record per class in `applicableClasses`. All listed class names
 *       must already exist under the admin's school. If `teacherId` is provided, the staff
 *       member is set as the subject teacher and their `subjects` list is updated.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateSubjectRequest' }
 *     responses:
 *       201:
 *         description: Subject created successfully (for one or more classes)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Subject created for 2 classes" }
 *                 subjects:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Subject' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/subject/allSubjects:
 *   get:
 *     tags: [Subject]
 *     summary: Get all subjects for the admin's school
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SubjectListResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *
 * /api/v1/subject/subject/{id}:
 *   put:
 *     tags: [Subject]
 *     summary: Update a subject record
 *     description: >
 *       Updates a single subject record (one class's instance of the subject). Renaming checks
 *       for a duplicate subject name already attached to the same class. Reassigning or
 *       unassigning the teacher (`teacherId`) keeps both the previous and new teacher's
 *       `subjects` list in sync — a teacher only loses the subject name from their list once
 *       they no longer teach it in any class.
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/UuidPathId' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateSubjectRequest' }
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Subject updated successfully }
 *                 subject: { $ref: '#/components/schemas/Subject' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 *   delete:
 *     tags: [Subject]
 *     summary: Delete a subject record
 *     description: >
 *       Deletes a single subject record (one class's instance of the subject). If the assigned
 *       teacher no longer teaches this subject in any other class after deletion, the subject
 *       name is removed from their `subjects` list.
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/UuidPathId' }]
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Subject deleted successfully }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// ─────────────────────────────────────────────────────────────────────────────
// CLASS TEACHER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/classteacher/class-teacher-dashboard:
 *   get:
 *     tags: [Class Teacher]
 *     summary: Get class teacher dashboard
 *     description: Returns attendance summary, student counts by gender, and the full student list for the teacher's assigned class(es).
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ClassTeacherDashboardResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/classteacher/students:
 *   get:
 *     tags: [Class Teacher]
 *     summary: Get all students in the class teacher's assigned class
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Students retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ClassTeacherStudentListResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/classteacher/attendance:
 *   post:
 *     tags: [Class Teacher]
 *     summary: Mark student attendance for the teacher's class
 *     description: >
 *       Bulk-creates or updates attendance records for the current date. All `studentId` values
 *       must belong to the teacher's assigned class. The `x-tenant` header is required to
 *       resolve the correct school.
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/MarkAttendanceRequest' }
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Attendance marked successfully }
 *                 attendance:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/StudentAttendance' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/classteacher/attendance/today:
 *   get:
 *     tags: [Class Teacher]
 *     summary: Get student attendance with WhatsApp parent-notify action
 *     description: Returns attendance records with a pre-built WhatsApp URL for absent students so the teacher can notify parents directly.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/TenantHeader'
 *       - in: query
 *         name: classSection
 *         required: false
 *         schema: { type: string, example: JSS 2A }
 *         description: Filter by class name. Omit or use "All Classes" for all.
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [All Status, present, absent]
 *       - in: query
 *         name: date
 *         required: false
 *         schema: { type: string, format: date, example: "2026-06-24" }
 *         description: Date in YYYY-MM-DD format. Defaults to today.
 *     responses:
 *       200:
 *         description: Student attendance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Today's student attendance retrieved successfully" }
 *                 Attendance:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/StudentAttendanceWithWhatsAppAction' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/classteacher/mark-score:
 *   post:
 *     tags: [Class Teacher]
 *     summary: Create or update student scores for an assigned subject
 *     description: >
 *       Bulk-creates or updates score records. The teacher must be assigned to the `subject`
 *       being scored. All `studentId` values must belong to the teacher's assigned class.
 *       `totalScore` is computed automatically as `continuousAssessment + exam`.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateScoreRequest' }
 *     responses:
 *       201:
 *         description: Scores created/updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Scores created successfully }
 *                 scores:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Score' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/classteacher/update-score:
 *   put:
 *     tags: [Class Teacher]
 *     summary: Update existing student scores
 *     description: Updates `continuousAssessment`, `exam`, and recomputes `totalScore`. All `studentId` values must have an existing score record for this teacher.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateScoreRequest' }
 *     responses:
 *       200:
 *         description: Scores updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Scores updated successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/classteacher/scores:
 *   get:
 *     tags: [Class Teacher]
 *     summary: Get all scores entered by the authenticated teacher
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Scores retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ScoresResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/classteacher/updateProfile:
 *   put:
 *     tags: [Class Teacher]
 *     summary: Update class teacher profile settings
 *     description: Supports optional profile picture and signature image uploads via multipart/form-data.
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
 *               signature: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Class teacher updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Class teacher updated successfully }
 *                 classTeacherData:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     firstName: { type: string }
 *                     lastName: { type: string }
 *                     address: { type: string }
 *                     staffProfileUrl: { type: string, nullable: true }
 *                     staffProfilePublicId: { type: string, nullable: true }
 *                     signatureUrl: { type: string, nullable: true }
 *                     signaturePublicId: { type: string, nullable: true }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// ─────────────────────────────────────────────────────────────────────────────
// SUBJECT TEACHER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/subjectteacher/subject-teacher-dashboard:
 *   get:
 *     tags: [Subject Teacher]
 *     summary: Get subject teacher dashboard
 *     description: Returns the teacher's assigned subjects, classes, and student counts.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dashboard:
 *                   type: object
 *                   properties:
 *                     myAttendance: { type: string, enum: [present, absent, late], nullable: true }
 *                     assignedClass:
 *                       type: array
 *                       items: { type: string }
 *                       example: [Primary 3, Primary 4]
 *                     studentHandling: { type: integer, example: 60 }
 *                     assignedSubjects:
 *                       type: array
 *                       items: { type: string }
 *                       example: [Mathematics, English]
 *                     totalStudents: { type: integer, example: 35 }
 *                     maleStudents: { type: integer, example: 18 }
 *                     femaleStudents: { type: integer, example: 17 }
 *                     studentsPresent: { type: integer, example: 30 }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/subjectteacher/mark-score:
 *   post:
 *     tags: [Subject Teacher]
 *     summary: Create or update student scores for an assigned subject
 *     description: Same rules as the class teacher score endpoint — the teacher must be assigned to the subject and all students must belong to the teacher's class.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateScoreRequest' }
 *     responses:
 *       201:
 *         description: Scores created/updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Scores created successfully }
 *                 scores:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Score' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/subjectteacher/update-score:
 *   put:
 *     tags: [Subject Teacher]
 *     summary: Update existing student scores
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateScoreRequest' }
 *     responses:
 *       200:
 *         description: Scores updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Scores updated successfully }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/subjectteacher/scores:
 *   get:
 *     tags: [Subject Teacher]
 *     summary: Get all scores entered by the authenticated subject teacher
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Scores retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ScoresResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/subjectteacher/updateProfile:
 *   put:
 *     tags: [Subject Teacher]
 *     summary: Update subject teacher profile settings
 *     description: Accepts multipart/form-data so a profile picture can be uploaded alongside text fields.
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
 *       200:
 *         description: Subject teacher updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: subject Teacher updated successfully }
 *                 subjectTeacherData:
 *                   type: object
 *                   properties:
 *                     id: { type: string, format: uuid }
 *                     firstName: { type: string }
 *                     lastName: { type: string }
 *                     address: { type: string }
 *                     staffProfileUrl: { type: string, nullable: true }
 *                     staffProfilePublicId: { type: string, nullable: true }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/payment/dashboard:
 *   get:
 *     tags: [Payment]
 *     summary: Get fees dashboard — overview cards, filters, fee records, and export data
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: classSection
 *         required: false
 *         schema: { type: string, example: JSS 1A }
 *         description: Omit or use "All Classes" to include every class.
 *       - in: query
 *         name: paymentStatus
 *         required: false
 *         schema:
 *           type: string
 *           enum: [All Status, full payment, part payment, unpaid]
 *       - in: query
 *         name: term
 *         required: false
 *         schema: { type: string, example: Third Term }
 *       - in: query
 *         name: page
 *         required: false
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         required: false
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *     responses:
 *       200:
 *         description: Fees dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/FeesDashboardResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/payment/initialize/{studentId}:
 *   post:
 *     tags: [Payment]
 *     summary: Initialize payment for a student
 *     description: Returns a Paystack (or equivalent) authorization URL for the student's outstanding fee.
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
 *       201:
 *         description: Payment initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Payment initialized successfully }
 *                 authorizationUrl: { type: string, example: "https://checkout.paystack.com/abc123" }
 *                 reference: { type: string, example: ref_abc123 }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/payment/verify/{reference}:
 *   get:
 *     tags: [Payment]
 *     summary: Verify payment by reference
 *     description: Confirms a payment with the payment gateway and updates the student's fee status on success.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payment verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Payment verified successfully }
 *                 payment: { $ref: '#/components/schemas/Payment' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/payment/history:
 *   get:
 *     tags: [Payment]
 *     summary: Get payment history
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: studentId
 *         required: false
 *         schema: { type: string, format: uuid }
 *         description: Filter by student. Omit to return all payments for the school.
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Payment history retrieved successfully }
 *                 payments:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Payment' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 * /api/v1/payment/reference/{reference}:
 *   get:
 *     tags: [Payment]
 *     summary: Get a single payment record by reference
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Payment retrieved successfully }
 *                 payment: { $ref: '#/components/schemas/Payment' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// ─────────────────────────────────────────────────────────────────────────────
// ANNOUNCEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/announcement:
 *   post:
 *     tags: [Announcement]
 *     summary: Create an announcement, draft, scheduled message, or template
 *     description: >
 *       Creates an announcement record. When `status` is "scheduled", `scheduledAt` is required.
 *       When `status` is "sent", `sentAt` is automatically set to the current timestamp.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateAnnouncementRequest' }
 *     responses:
 *       201:
 *         description: Announcement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Announcement created successfully }
 *                 announcement: { $ref: '#/components/schemas/Announcement' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/announcement/dashboard:
 *   get:
 *     tags: [Announcement]
 *     summary: Get announcement dashboard — tab counts, search results, and pagination
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: tab
 *         required: false
 *         schema:
 *           type: string
 *           enum: [all, drafts, scheduled, template, sent]
 *           default: all
 *         description: Filter announcements by status tab.
 *       - in: query
 *         name: search
 *         required: false
 *         schema: { type: string, example: meeting }
 *         description: Full-text search across title and content.
 *       - in: query
 *         name: page
 *         required: false
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         required: false
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *     responses:
 *       200:
 *         description: Announcement dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AnnouncementDashboardResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

// ─────────────────────────────────────────────────────────────────────────────
// STAFF ATTENDANCE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/staffattendance/qr-code:
 *   post:
 *     tags: [Staff Attendance]
 *     summary: Generate a daily QR code for staff attendance
 *     description: >
 *       Creates a unique QR token that expires at the end of the current day.
 *       Returns the token, a base64 QR image, and the scan URL.
 *       The `x-tenant` header is required to associate the QR with the correct school.
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude: { type: number, nullable: true, example: 6.5244 }
 *               longitude: { type: number, nullable: true, example: 3.3792 }
 *     responses:
 *       201:
 *         description: QR code generated successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/QRGenerateResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 * /api/v1/staffattendance/scan:
 *   post:
 *     tags: [Staff Attendance]
 *     summary: Scan QR token — auto check-in or check-out based on time of day
 *     description: >
 *       If the current hour is before 14:00, a check-in record is created.
 *       If it is 14:00 or later, the existing check-in record is updated with a check-out time.
 *       The `x-tenant` header must match the school that generated the QR.
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ScanAttendanceRequest' }
 *     responses:
 *       201:
 *         description: Checked in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Checked In }
 *                 attendance: { $ref: '#/components/schemas/StaffAttendance' }
 *       200:
 *         description: Checked out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Checked Out }
 *                 attendance: { $ref: '#/components/schemas/StaffAttendance' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *
 * /api/v1/staffattendance/check-in:
 *   post:
 *     tags: [Staff Attendance]
 *     summary: Explicit check-in with a QR token
 *     description: An alternative to the auto-scan endpoint — always creates a check-in record regardless of time.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/QrTokenRequest' }
 *     responses:
 *       201:
 *         description: Check-in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Check In Successful }
 *                 record: { $ref: '#/components/schemas/StaffAttendance' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *
 * /api/v1/staffattendance/check-out:
 *   post:
 *     tags: [Staff Attendance]
 *     summary: Explicit check-out with a QR token
 *     description: Sets the `timeCheckedOut` on the staff member's existing check-in record for today.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/QrTokenRequest' }
 *     responses:
 *       200:
 *         description: Check-out successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Check Out Successful }
 *                 attendance: { $ref: '#/components/schemas/StaffAttendance' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *
 * /api/v1/staffattendance/today:
 *   get:
 *     tags: [Staff Attendance]
 *     summary: Get today's attendance records for the admin's school (admin view)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     responses:
 *       200:
 *         description: Today's staff attendance retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StaffAttendanceListResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /api/v1/staffattendance/all:
 *   get:
 *     tags: [Staff Attendance]
 *     summary: Get all staff attendance records for today (tenant-scoped, public-facing)
 *     description: Returns today's records filtered by the `x-tenant` header. Does not require admin authentication.
 *     parameters: [{ $ref: '#/components/parameters/TenantHeader' }]
 *     responses:
 *       200:
 *         description: Staff attendance retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StaffAttendanceListResponse' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */

