const staffModel = require('../models/staff');
const cloudinary = require('cloudinary').v2
const classModel = require('../models/schoolclass')
const studentModel = require('../models/student')
const staff = require('../models/staff');
const announcementModel = require('../models/announcement')
const feeModel = require('../models/feestructure');
const bcrypt = require('bcrypt');
const fs = require('fs')


exports.getFeesSummary = async (req, res, next) => {
    try {
        const { id } = req.user;
        const getStaff = await staff.findByPk(id);

        const schoolClasses = await classModel.findAll({ where: { adminId: getStaff.adminId } });
        const fees = await feeModel.findAll({ where: { adminId: getStaff.adminId } });
        const students = await studentModel.findAll({
            where: { adminId: getStaff.adminId },
            attributes: ['classId', 'paymentStatus']
        });

        const feeTotal = {};
        fees.forEach(fee => {
            feeTotal[fee.classId] = (feeTotal[fee.classId] || 0) + Number(fee.amount);
        });

        const allCount = {};
        const paidCount = {};
        const owingStudentCount = {}; // unpaid + part payment, just for the headcount

        students.forEach(student => {
            const classId = student.classId;
            const status = student.paymentStatus;

            allCount[classId] = (allCount[classId] || 0) + 1;

            if (status === 'full payment') {
                paidCount[classId] = (paidCount[classId] || 0) + 1;
            }

            if (status === 'unpaid' || status === 'part payment') {
                owingStudentCount[classId] = (owingStudentCount[classId] || 0) + 1;
            }
        });

        // calculate totals by walking through each class once
        let totalAmount = 0;
        let paidFees = 0;
        let studentsOwing = 0;

        schoolClasses.forEach(classes => {
            const classId = classes.id;
            const feePerStudent = feeTotal[classId] || 0;

            totalAmount += (allCount[classId] || 0) * feePerStudent;
            paidFees += (paidCount[classId] || 0) * feePerStudent;
            studentsOwing += (owingStudentCount[classId] || 0);
        });

        const unPaidFees = totalAmount - paidFees;

        res.status(200).json({
            message: 'fees summary retrieved successfully',
            totalAmount,
            paidFees,
            unPaidFees,
            studentsOwing
        });

    } catch (error) {
        next(error);
    }
};





exports.bursarySettings = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { firstName, lastName, address } = req.body;

        const result = await cloudinary.uploader.upload(req.file.path)
                     if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
        
                if(!result){
                    return next({
                        message: 'Image upload failed',
                        statusCode: 500
                    })
                };

        const bursary = await staffModel.findByPk(id);
        if (!bursary) {
            return res.status(404).json({
                message: 'subject Teacher not found'
            });
        }

        // In-app password reset
        const { oldPassword, newPassword, confirmPassword } = req.body;

        const passwordCorrect = await bcrypt.compare(oldPassword, bursary.password)
                if (!passwordCorrect) {                    
                    return next({
                        message: 'incorrect password',
                        statusCode: 400
                    })
                }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: 'password does not match'
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)


        await bursary.update({
            firstName,
            lastName,
            address,
            password: hashedPassword,
            staffProfileUrl: result.secure_url,
            staffProfilePublicId: result.public_id
        });

            const bursaryData ={
                id: bursary.id,
                firstName: bursary.firstName,
                lastName: bursary.lastName,
                address: bursary.address,
                staffProfileUrl: bursary.staffProfileUrl,
                staffProfilePublicId: bursary.staffProfilePublicId
            }

        res.json({
            message: 'bursary updated successfully',
            bursaryData
        });
    } catch (error) {
    if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
        next(error);
    }
};

exports.getAllAnnouncements = async (req, res, next)=>{
    try {
        const announcements = await announcementModel.findAll()
        if(announcements.length === 0){
            return res.status(404).json({
                message: 'No announcements found'
            })         
        }
        res.status(200).json({
            message: 'Announcements retrieved successfully',
            announcements
        })
    } catch (error) {
        next(error)
    }
};