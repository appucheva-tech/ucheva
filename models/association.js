const staff              = require('./staff')
const student            = require('./student')
const parent             = require('../models/parent')
const admin              = require('./admin')
const schoolClasses      = require('./schoolclass')
const adminProfile       = require('./adminprofile')
const staffAttendance    = require('./staffattendance')
const studentAttendance  = require('./studentattendance')
const subject            = require('../models/subject')
const score              = require('./scores')
const wallets            = require('./wallet')
const withdrawal         = require('./withdrawals')
const payment            = require('./payment')
// const reportCard         = require('./reportcard')         // NEW
// const reportCardItem     = require('./reportcarditem')     // NEW — one row per subject on a report card


// ─────────────────────────────────────────────
// ADMIN ↔ STAFF
// ─────────────────────────────────────────────
admin.hasMany(staff, { foreignKey: 'adminId', as: 'staff' })
staff.belongsTo(admin, { foreignKey: 'adminId', as: 'admin' })

// ─────────────────────────────────────────────
// ADMIN ↔ ADMIN PROFILE
// ─────────────────────────────────────────────
admin.hasOne(adminProfile, { foreignKey: 'adminId', as: 'profile' })
adminProfile.belongsTo(admin, { foreignKey: 'adminId', as: 'admin' })

// ─────────────────────────────────────────────
// ADMIN ↔ STUDENT
// ─────────────────────────────────────────────
admin.hasMany(student, { foreignKey: 'adminId', as: 'students' })
student.belongsTo(admin, { foreignKey: 'adminId', as: 'admin' })

// ─────────────────────────────────────────────
// SCHOOL CLASS ↔ STUDENT
// ─────────────────────────────────────────────
schoolClasses.hasMany(student, { foreignKey: 'classId', as: 'students' })
student.belongsTo(schoolClasses, { foreignKey: 'classId', as: 'class' })
//  ^ was 'classes' — a student belongs to ONE class; singular alias is clearer

// ─────────────────────────────────────────────
// ADMIN ↔ SCHOOL CLASS
// ─────────────────────────────────────────────
admin.hasMany(schoolClasses, { foreignKey: 'adminId', as: 'classes' })
schoolClasses.belongsTo(admin, { foreignKey: 'adminId', as: 'admin' })

// ─────────────────────────────────────────────
// STAFF (class teacher) ↔ SCHOOL CLASS
// A staff member is the class teacher of ONE class;
// hasOne is correct here — keep as-is.
// ─────────────────────────────────────────────
staff.hasOne(schoolClasses, { foreignKey: 'staffId', as: 'classRoom' })
//  ^ was 'classes' — conflicts with admin's 'classes' alias at query time; renamed
schoolClasses.belongsTo(staff, { foreignKey: 'staffId', as: 'classTeacher' })
//  ^ was 'staff' — 'classTeacher' is self-documenting and avoids alias collision

// ─────────────────────────────────────────────
// ADMIN / STAFF / CLASS ↔ SUBJECT
// A subject teacher (staff) owns many subjects.
// ─────────────────────────────────────────────
admin.hasMany(subject, { foreignKey: 'adminId', as: 'subjects' })
subject.belongsTo(admin, { foreignKey: 'adminId', as: 'admin' })

staff.hasMany(subject, { foreignKey: 'staffId', as: 'subjects' })
subject.belongsTo(staff, { foreignKey: 'staffId', as: 'subjectTeacher' })
//  ^ was 'staff' — renamed to 'subjectTeacher' for clarity at include time

schoolClasses.hasMany(subject, { foreignKey: 'classId', as: 'subjects' })
subject.belongsTo(schoolClasses, { foreignKey: 'classId', as: 'class' })
//  ^ was 'classes' — singular for belongsTo

// ─────────────────────────────────────────────
// WALLET
// ─────────────────────────────────────────────
admin.hasOne(wallets, { foreignKey: 'adminId', as: 'wallet' })
//  ^ was 'wallets' — admin has ONE wallet; singular alias
wallets.belongsTo(admin, { foreignKey: 'adminId', as: 'admin' })

// ─────────────────────────────────────────────
// WITHDRAWAL
// ─────────────────────────────────────────────
wallets.hasMany(withdrawal, { foreignKey: 'walletId', as: 'withdrawals' })
withdrawal.belongsTo(wallets, { foreignKey: 'walletId', as: 'wallet' })

admin.hasMany(withdrawal, { foreignKey: 'adminId', as: 'withdrawals' })
withdrawal.belongsTo(admin, { foreignKey: 'adminId', as: 'admin' })

// ─────────────────────────────────────────────
// SCORE
// score.staffId  → the subject teacher who entered the score
// score.subjectId → which subject
// score.studentId → which student
// score.classId   → which class (add to Score model if not present)
// ─────────────────────────────────────────────
student.hasMany(score, { foreignKey: 'studentId', as: 'scores' })
score.belongsTo(student, { foreignKey: 'studentId', as: 'student' })

staff.hasMany(score, { foreignKey: 'staffId', as: 'scores' })
score.belongsTo(staff, { foreignKey: 'staffId', as: 'enteredBy' })
//  ^ was 'staff' — renamed to 'enteredBy' to distinguish from class teacher

subject.hasMany(score, { foreignKey: 'subjectId', as: 'scores' })
score.belongsTo(subject, { foreignKey: 'subjectId', as: 'subject' })
//  ^ was 'subjects' — singular for belongsTo

schoolClasses.hasMany(score, { foreignKey: 'classId', as: 'scores' })
score.belongsTo(schoolClasses, { foreignKey: 'classId', as: 'class' })
//  ^ NEW — needed so you can query all scores for a class in one go

// ─────────────────────────────────────────────
// PAYMENT
// ─────────────────────────────────────────────
student.hasMany(payment, { foreignKey: 'studentId', as: 'payments' })
payment.belongsTo(student, { foreignKey: 'studentId', as: 'student' })

// ─────────────────────────────────────────────
// STAFF ATTENDANCE
// ─────────────────────────────────────────────
staff.hasMany(staffAttendance, { foreignKey: 'staffId', as: 'attendances' })
//  ^ was 'staffAttendances' — simplified
staffAttendance.belongsTo(staff, { foreignKey: 'staffId', as: 'staff' })

// ─────────────────────────────────────────────
// STUDENT ATTENDANCE
// ─────────────────────────────────────────────
student.hasMany(studentAttendance, { foreignKey: 'studentId', as: 'attendances' })
//  ^ was 'studentAttendances' — simplified
studentAttendance.belongsTo(student, { foreignKey: 'studentId', as: 'student' })

staff.hasMany(studentAttendance, { foreignKey: 'staffId', as: 'markedAttendances' })
//  ^ was 'studentAttendances' — conflicts with student's alias above; renamed
studentAttendance.belongsTo(staff, { foreignKey: 'staffId', as: 'markedBy' })
//  ^ was 'staff' — 'markedBy' is self-documenting

// ─────────────────────────────────────────────
// PARENT ↔ STUDENT
// ─────────────────────────────────────────────
parent.hasMany(student, { foreignKey: 'parentId', as: 'students' })
student.belongsTo(parent, { foreignKey: 'parentId', as: 'parent' })


// ═════════════════════════════════════════════
// REPORT CARD ASSOCIATIONS  (NEW)
//
// ReportCard — one record per student × term × session
//   Fields: studentId, classId, termId, sessionId,
//           totalCA, totalExam, totalScore, averageScore,
//           overallGrade, overallRemark, classTeacherRemark,
//           principalRemark, totalSchoolDays, daysPresent,
//           attendance (%), status (draft|submitted|published),
//           generatedBy (staffId of class teacher),
//           submittedAt, publishedAt
//
// ReportCardItem — one record per subject line on a report card
//   Fields: reportCardId, subjectId, subjectName (snapshot),
//           ca, exam, total, grade, teacherRemark
//   Snapshotting subjectName guards against subject renames
//   breaking historical report cards.
// ═════════════════════════════════════════════

// // ReportCard ↔ Student
// student.hasMany(reportCard, { foreignKey: 'studentId', as: 'reportCards' })
// reportCard.belongsTo(student, { foreignKey: 'studentId', as: 'student' })

// // ReportCard ↔ SchoolClass
// schoolClasses.hasMany(reportCard, { foreignKey: 'classId', as: 'reportCards' })
// reportCard.belongsTo(schoolClasses, { foreignKey: 'classId', as: 'class' })

// // ReportCard ↔ Staff (the class teacher who generated it)
// staff.hasMany(reportCard, { foreignKey: 'generatedBy', as: 'generatedReportCards' })
// reportCard.belongsTo(staff, { foreignKey: 'generatedBy', as: 'classTeacher' })

// // ReportCard ↔ Admin (the admin who published it)
// admin.hasMany(reportCard, { foreignKey: 'publishedBy', as: 'publishedReportCards' })
// reportCard.belongsTo(admin, { foreignKey: 'publishedBy', as: 'publishedByAdmin' })

// // ReportCard ↔ ReportCardItems  (the per-subject score lines)
// reportCard.hasMany(reportCardItem, { foreignKey: 'reportCardId', as: 'items' })
// reportCardItem.belongsTo(reportCard, { foreignKey: 'reportCardId', as: 'reportCard' })

// // ReportCardItem ↔ Subject  (for joins; subjectName snapshot is the safe read)
// subject.hasMany(reportCardItem, { foreignKey: 'subjectId', as: 'reportCardItems' })
// reportCardItem.belongsTo(subject, { foreignKey: 'subjectId', as: 'subject' })