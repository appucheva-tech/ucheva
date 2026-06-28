const staff = require('./staff')
const student = require('./student')
const parent = require('../models/parent')
const admin = require('./admin')
const schoolClasses = require('./schoolclass')
const adminProfile = require('./adminprofile')
const staffAttendance = require('./staffattendance')
const studentAttendance = require('./studentattendance')
const subject = require('../models/subject')
const score = require('./scores')
const wallets = require('./wallet')
const withdrawal = require('./withdrawals')
const payment = require('./payment')
const announcement = require('./announcement')
const schoolclass = require ("./schoolclass")
//staff model association
admin.hasMany(staff, {foreignKey: 'adminId', as: 'staff'})
staff.belongsTo(admin, {foreignKey: 'adminId',as: 'admin'})

//admin profile association
admin.hasOne(adminProfile, {foreignKey: 'adminId', as: 'profile' })
adminProfile.belongsTo(admin, {foreignKey: 'adminId', as: 'admin'})

//student model association
admin.hasMany(student, {foreignKey: 'adminId', as: 'students'})
student.belongsTo(admin, {foreignKey: 'adminId', as: 'admin'})

// staff.hasMany(student, {foreignKey: 'staffId', as: 'students'})
// student.belongsTo(staff, {foreignKey: 'staffId', as: 'staff'})

schoolClasses.hasMany(student, {foreignKey: 'classId', as: 'students'})
student.belongsTo(schoolClasses, {foreignKey: 'classId', as: 'classes'})

//school classes association
admin.hasMany(schoolClasses, {foreignKey: 'adminId', as: 'classes'})
schoolClasses.belongsTo(admin, {foreignKey: 'adminId', as: 'admin'})

staff.hasOne(schoolClasses, {foreignKey: 'staffId', as: 'classes'})
schoolClasses.belongsTo(staff, {foreignKey: 'staffId', as: 'staff'})

// subject association
admin.hasMany(subject, {foreignKey: 'adminId', as: 'subjects'})
subject.belongsTo(admin, {foreignKey: 'adminId',as: 'admin'})

staff.hasMany(subject, {foreignKey: 'staffId', as: 'subjects'})
subject.belongsTo(staff, {foreignKey: 'staffId', as: 'staff'})

schoolClasses.hasMany(subject, {foreignKey: 'classId', as: 'subjects'})
subject.belongsTo(schoolClasses,{foreignKey: 'classId', as: 'classes'})

// wallet association
admin.hasOne(wallets, {foreignKey: 'adminId', as: 'wallets'})
wallets.belongsTo(admin, {foreignKey: 'adminId', as: 'admin'})

// withdrawal association
wallets.hasMany(withdrawal, {foreignKey: 'walletId', as: 'withdrawals'})
withdrawal.belongsTo(wallets, {foreignKey: 'walletId', as: 'wallet'})

admin.hasMany(withdrawal, {foreignKey: 'adminId', as: 'withdrawals'})
withdrawal.belongsTo(admin, {foreignKey: 'adminId', as: 'admin'})


// scores model association
student.hasMany(score, {foreignKey: 'studentId', as: 'scores'})
score.belongsTo(student, {foreignKey: 'studentId', as: 'student'})

staff.hasMany(score, {foreignKey: 'staffId', as: 'scores'});
score.belongsTo(staff, {foreignKey: 'staffId', as: 'staff'});

subject.hasMany(score, { foreignKey: 'subjectId', as: 'scores' })
score.belongsTo(subject, { foreignKey: 'subjectId', as: 'subjects' })

// payment association
student.hasMany(payment, {foreignKey: 'studentId', as: 'payments'})
payment.belongsTo(student, {foreignKey: 'studentId', as: 'student'})

// announcement association
admin.hasMany(announcement, {foreignKey: 'adminId', as: 'announcements'})
announcement.belongsTo(admin, {foreignKey: 'adminId', as: 'admin'})

// staff Attendance association
// admin.hasMany(staffAttendance, {foreignKey: 'adminId', as: 'staffAttendances'})
// staffAttendance.belongsTo(admin, {foreignKey: 'adminId', as: 'admin'})

staff.hasMany(staffAttendance, {foreignKey: 'staffId', as: 'staffAttendances'})
staffAttendance.belongsTo(staff, {foreignKey: 'staffId', as: 'staff'})

// student Attendance association
student.hasMany(studentAttendance, {foreignKey: 'studentId', as: 'studentAttendances'})
studentAttendance.belongsTo(student, {foreignKey: 'studentId', as: 'student'})

staff.hasMany(studentAttendance, {foreignKey: 'staffId', as: 'studentAttendances'})
studentAttendance.belongsTo(staff, {foreignKey: 'staffId', as: 'staff'})

// parent model association
parent.hasMany(student, {foreignKey: 'parentId', as: 'students'})
student.belongsTo(parent, {foreignKey: 'parentId', as: 'parent'})

schoolclass.belongsTo(staff, {
  foreignKey: "staffId",
  as: "classTeacher",
});