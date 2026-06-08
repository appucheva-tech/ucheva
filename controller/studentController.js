const studentModel = require('../models/student');
const adminModel = require('../models/admin')
const classModel = require('../models/schoolclass')
const staffModel = require('../models/staff')

exports.createStudent = async (req, res, next) => {
    try {
        const {id} = req.user
        const admin = await adminModel.findByPk(id)
        if(!admin){
            return res.status(404).json({
                message: 'admin not found'
            })
        }
        const { firstName, lastName, otherName, gender, dateOfBirth, nationality, address, relationship, phoneNumber, email, guardianParentName, session, studentClass, department ,parentGuardiansName} = req.body;

        // Check if the email is already in use
        const existingStudent = await studentModel.findOne({ where: { email: email.toLowerCase().trim() } });
        if (existingStudent) {
            return res.status(400).json({
                message: 'Email is already in use'
            });
        }

        const student = await studentModel.create({
            firstName,
            lastName,
            otherName,
            gender,
            dateOfBirth: new Date(dateOfBirth),
            nationality,
            address,
            relationship,
            phoneNumber,
            email: email.toLowerCase().trim(),
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
