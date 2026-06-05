const staff = require('./staff')
const student = require('./student')
const admin = require('./admin')
const feeStructures = require('./feestructure')
const schoolClasses = require('./schoolclass')
const adminProfile = require('./adminprofile')
const schoolClassConfig = require('./classconfig')
const wallets = require('./wallet')
const withdrawal = require('./withdrawals')

//staff model association
admin.hasMany(staff, {foreignKey: 'adminId', as: 'staff'})
staff.belongsTo(admin, {foreignKey: 'adminId',as: 'admin'})

//admin profile association
admin.hasOne(adminProfile, {foreignKey: 'adminId', as: 'profile' })
adminProfile.belongsTo(admin, {foreignKey: 'adminId', as: 'admin'})

//student model association
admin.hasMany(student, {foreignKey: 'adminId', as: 'students'})
student.belongsTo(admin, {foreignKey: 'adminId', as: 'admin'})

staff.hasMany(student, {foreignKey: 'staffId', as: 'students'})
student.belongsTo(staff, {foreignKey: 'staffId', as: 'staff'})

//fee structure association
admin.hasMany(feeStructures, {foreignKey: 'adminId', as: 'fee'})
feeStructures.belongsTo(admin, {foreignKey: 'adminId',as: 'admin'})

//school classes association
admin.hasMany(schoolClasses, {foreignKey: 'adminId', as: 'classes'})
schoolClasses.belongsTo(admin, {foreignKey: 'adminId', as: 'admin'})

staff.hasOne(schoolClasses, {foreignKey: 'staffId', as: 'classes'})
schoolClasses.belongsTo(staff, {foreignKey: 'staffId', as: 'staff'})

// class config association
admin.hasMany(schoolClassConfig, {foreignKey: 'adminId', as: 'classConfig'})
schoolClassConfig.belongsTo(admin, {foreignKey: 'adminId', as: 'admin'})

// wallet association
wallets.hasMany(student, {foreignKey: 'walletId', as: 'students'})
student.belongsTo(wallets, {foreignKey: 'walletId', as: 'wallet'})

admin.hasOne(wallets, {foreignKey: 'adminId', as: 'wallets'})
wallets.belongsTo(admin, {foreignKey: 'adminId', as: 'admin'})

// withdrawal association
wallets.hasMany(withdrawal, {foreignKey: 'walletId', as: 'withdrawals'})
withdrawal.belongsTo(wallets, {foreignKey: 'walletId', as: 'wallet'})

admin.hasMany(withdrawal, {foreignKey: 'adminId', as: 'withdrawals'})
withdrawal.belongsTo(admin, {foreignKey: 'adminId', as: 'admin'})