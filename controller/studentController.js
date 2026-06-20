const studentModel = require('../models/student');
const adminModel = require('../models/admin')
const classModel = require('../models/schoolclass')
const staffModel = require('../models/staff')
const cloudinary = require('../config/cloudinary')
const bcrypt = require('bcrypt')
const fs = require('fs')
const dayjs = require('dayjs')
const { Op } = require('sequelize')
const paymentModel = require('../models/payment')
const studentAttendanceModel = require('../models/studentattendance')

exports.createStudent = async (req, res, next) => {
    try {
        const {id} = req.user
        const { firstName, lastName, otherName, gender, dateOfBirth, nationality, address, relationship, religion, phoneNumber, parentGuardiansEmail, session, studentClass, department,parentGuardiansName, parentGuardiansAddress} = req.body;
        
        const existingStudent = await studentModel.findOne({ where: { firstName: firstName, lastName: lastName, otherName: otherName } });
        if (existingStudent) {
            return res.status(400).json({
                message: 'student already exists'
            });
        };

        const schoolClass = await classModel.findOne({where: {className: studentClass}})
        

        if(!schoolClass){
            return res.status(404).json({
                message: 'selected class is not available. Please, update your class configuration or select other classes'
            })
        };
        
        const currentYear = new Date().getFullYear();
        const length = await studentModel.count();                
        const studentAdmission = `STD/${currentYear}/${String(length + 1).padStart(6, "0")}`;

        const student = await studentModel.create({
            schoolUrl: schoolClass.schoolUrl,
            adminId: id,
            classId: schoolClass.id,
            admissionNumber: studentAdmission,
            firstName,
            lastName,
            otherName,
            gender,
            dateOfBirth: new Date(dateOfBirth),
            nationality,
            address,
            relationship,
            religion,
            phoneNumber,
            parentGuardiansEmail: parentGuardiansEmail.trim().toLowerCase(),
            parentGuardiansName,
            parentGuardiansAddress,
            session,
            studentClass,
            department
        });

        res.status(201).json({
            message: 'Student created successfully',
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllStudents = async (req, res, next) => {
    try {
        const {id} = req.user
        const admin = await adminModel.findByPk(id)
        const students = await studentModel.findAll({where: {adminId: id, schoolUrl: admin.schoolUrl}});

         const studentsData = students.map((student)=>{
            return {
                id: student.id,
                fullName: `${student.firstName} ${student.lastName}`,
                parentGuardiansPhoneNumber: student.phoneNumber
            }
        });

        res.status(200).json({
            message: 'Students retrieved successfully',
            studentsData
        });
        
    } catch (error) {
        next(error);
    }
};

exports.parentSettings = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const {
            parentFirstName,
            parentLastName,
            parentGuardiansName,
            phoneNumber,
            parentGuardiansEmail,
            parentGuardiansAddress,
            oldPassword,
            newPassword,
            confirmPassword
        } = req.body;

        const student = await studentModel.findByPk(studentId);
        if (!student) {
            return res.status(404).json({
                message: 'Student not found'
            });
        }

        const updateData = {};

        if (parentFirstName) updateData.parentFirstName = parentFirstName.trim();
        if (parentLastName) updateData.parentLastName = parentLastName.trim();
        if (parentGuardiansName) {
            updateData.parentGuardiansName = parentGuardiansName.trim();
        } else if (parentFirstName || parentLastName) {
            updateData.parentGuardiansName = `${parentFirstName || student.parentFirstName || ''} ${parentLastName || student.parentLastName || ''}`.trim();
        }
        if (phoneNumber) updateData.phoneNumber = phoneNumber.trim();
        if (parentGuardiansEmail) updateData.parentGuardiansEmail = parentGuardiansEmail.trim().toLowerCase();
        if (parentGuardiansAddress) updateData.parentGuardiansAddress = parentGuardiansAddress.trim();

        if (newPassword || confirmPassword || oldPassword) {
            if (!newPassword || !confirmPassword) {
                return res.status(400).json({
                    message: 'newPassword and confirmPassword are required'
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    message: 'password does not match'
                });
            }

            if (student.parentPassword) {
                const passwordCorrect = await bcrypt.compare(oldPassword || '', student.parentPassword);
                if (!passwordCorrect) {
                    return res.status(400).json({
                        message: 'incorrect password'
                    });
                }
            }

            updateData.parentPassword = await bcrypt.hash(newPassword, 10);
        }

        if (req.file) {
            const uploadedImage = await cloudinary.uploader.upload(req.file.path);

            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            if (!uploadedImage) {
                return res.status(500).json({
                    message: 'profile picture upload failed'
                });
            }

            updateData.parentProfileUrl = uploadedImage.secure_url;
            updateData.parentProfilePublicId = uploadedImage.public_id;
        }

        await student.update(updateData);

        res.status(200).json({
            message: 'Parent settings updated successfully',
            parent: {
                studentId: student.id,
                parentFirstName: student.parentFirstName,
                parentLastName: student.parentLastName,
                parentGuardiansName: student.parentGuardiansName,
                phoneNumber: student.phoneNumber,
                parentGuardiansEmail: student.parentGuardiansEmail,
                parentGuardiansAddress: student.parentGuardiansAddress,
                parentProfileUrl: student.parentProfileUrl,
                parentProfilePublicId: student.parentProfilePublicId
            }
        });
    } catch (error) {
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

exports.parentDashboard = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const { month, currentTerm = 'First Term' } = req.query;

        const student = await studentModel.findByPk(studentId);
        if (!student) {
            return res.status(404).json({
                message: 'Student not found'
            });
        }
        const selectedMonth = month ? dayjs(`${month}-01`) : dayjs();
        if (!selectedMonth.isValid()) {
            return res.status(400).json({
                message: 'Invalid month format. Use YYYY-MM'
            });
        }

        const startOfMonth = selectedMonth.startOf('month').format('YYYY-MM-DD');
        const endOfMonth = selectedMonth.endOf('month').format('YYYY-MM-DD');

        const [payments, attendanceRecords] = await Promise.all([
            paymentModel.findAll({
                where: { studentId },
                order: [['paymentDate', 'DESC']]
            }),
            studentAttendanceModel.findAll({
                where: {
                    studentId,
                    date: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                }
            })
        ]);

        const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
        const absentDays = attendanceRecords.filter(record => record.status === 'absent').length;
        const totalAttendanceDays = attendanceRecords.length;
        const attendancePercentage = totalAttendanceDays
            ? Number(((presentDays / totalAttendanceDays) * 100).toFixed(1))
            : 0;

        const parentName =
            student.parentGuardiansName ||
            `${student.parentFirstName || ''} ${student.parentLastName || ''}`.trim();

        const paymentHistory = payments.map(payment => ({
            id: payment.id,
            date: dayjs(payment.paymentDate).format('MMM DD, YYYY'),
            term: currentTerm,
            amount: Number(payment.amount),
            currency: payment.currency,
            status: payment.paymentStatus,
            reference: payment.reference
        }));

        const dashboard = {
            greeting: `Good Day, ${parentName }`,
            parent: {
                name: parentName,
                firstName: student.parentFirstName,
                lastName: student.parentLastName,
                email: student.parentGuardiansEmail,
                phoneNumber: student.phoneNumber,
                address: student.parentGuardiansAddress,
                profileUrl: student.parentProfileUrl
            },
            student: {
                id: student.id,
                name: `${student.firstName} ${student.lastName}`,
                class: student.studentClass,
                admissionNumber: student.admissionNumber,
                feeStatus: student.paymentStatus,
                attendanceStatus: student.attendanceStatus,
                currentTerm,
                session: student.session
            },
            paymentHistory,
            monthlyAttendance: {
                month: selectedMonth.format('MMMM YYYY'),
                percentage: attendancePercentage,
                presentDays,
                absentDays,
                totalDays: totalAttendanceDays
            }
        };

        res.status(200).json({
            message: 'Parent dashboard retrieved successfully',
            dashboard
        });
    } catch (error) {
        next(error);
    }
};
