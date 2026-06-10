const studentModel = require('../models/student');
const adminModel = require('../models/admin')
const classModel = require('../models/schoolclass')
const staffModel = require('../models/staff')

exports.createStudent = async (req, res, next) => {
    try {
        const { firstName, lastName, otherName, gender, dateOfBirth, nationality, address, relationship, phoneNumber, email, session, studentClass, department ,parentGuardiansName} = req.body;
        
        const existingStudent = await studentModel.findOne({ where: { email: email.trim().toLowerCase() } });
        if (existingStudent) {
            return res.status(400).json({
                message: 'Email is already in use'
            });
        }
        
        const currentYear = new Date().getFullYear();
        const length = studentModel.length;

        console.log(length);
        
        const studentAdmission = `STD/${currentYear}/${String(length + 1).padStart(6, "0")}`;

        const student = await studentModel.create({
            admissionNumber: studentAdmission,
            firstName,
            lastName,
            otherName,
            gender,
            dateOfBirth: new Date(dateOfBirth),
            nationality,
            address,
            relationship,
            phoneNumber,
            email: email.trim().toLowerCase(),
            parentGuardiansName,
            session,
            studentClass,
            department
        });

        res.status(201).json({
            message: 'Student created successfully',
            student
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllStudents = async (req, res, next) => {
    try {
        const students = await studentModel.findAll();
        res.status(200).json({
            message: 'Students retrieved successfully',
            students
        });
    } catch (error) {
        next(error);
    }
};
