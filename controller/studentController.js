const studentModel = require('../models/student');
const parentModel = require('../models/parent')
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
const {inviteTemplate} = require('../utils/emailTemplate')
const {sendBrevoEmail} = require('../utils/brevo')
const sendMail = require('../utils/nodemailer')
const jwt = require('jsonwebtoken')

exports.createStudent = async (req, res, next) => {
    try {
        const {id} = req.user
        const admin = await adminModel.findByPk(id)
        const { firstName, lastName, otherName, gender, dateOfBirth, nationality, address, relationship, religion, phoneNumber, parentGuardiansEmail, session, classId, department,parentGuardiansName, parentGuardiansAddress} = req.body;
        console.log('Admin: ',admin)
        const existingStudent = await studentModel.findOne({ where: { firstName: firstName, lastName: lastName, otherName: otherName, schoolUrl: admin.schoolUrl } });
        if (existingStudent) {
            return res.status(400).json({
                message: 'student already exists'
            });
        };

        const schoolClass = await classModel.findOne({where: {id: classId, schoolUrl: admin.schoolUrl}})
        console.log('class: ',schoolClass)

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
            studentClass: schoolClass.className,
            department
        });

        const splitParentName = student.parentGuardiansName.split()

        const parent = await parentModel.create({
            schoolUrl: student.schoolUrl,
            adminId: id,
            firstName: splitParentName[0],
            lastName: splitParentName[1],
            email: student.parentGuardiansEmail,
            address: student.parentGuardiansAddress,
            phoneNumber: student.phoneNumber
        })

        student.parentId = parent.id
        await student.save()

        const token = jwt.sign(
            { id: parent.id, email: parent.email },
            process.env.JWT_SECRET_INVITE,
            { expiresIn: '1day' }
        );

        parent.parentToken = token;
        await parent.save();

        const link = `https://${admin.schoolUrl}.ucheva.com/create-password/${token}`;

        const emailOptions = {
            email: parent.email,
            subject: `Welcome To ${admin.schoolName}`,
            html: inviteTemplate(parent.firstName, link)
        };

        if (process.env.NODE_ENV === "production") {
            await sendBrevoEmail(emailOptions);
        } else {
            await sendMail(emailOptions);
        }

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
                gender: student.gender,
                classes: student.studentClass,
                department: student.department,
                parentGuardiansPhoneNumber: student.phoneNumber,
              
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

