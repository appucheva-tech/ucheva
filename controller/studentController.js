const studentModel = require('../models/student');
const adminModel = require('../models/admin')
const classModel = require('../models/schoolclass')
const staffModel = require('../models/staff')

exports.createStudent = async (req, res, next) => {
    try {
        const {id} = req.user
        const { firstName, lastName, otherName, gender, dateOfBirth, nationality, address, relationship, religion, phoneNumber, email, session, studentClass, department,parentGuardiansName, parentGuardiansAddress} = req.body;
        
        const existingStudent = await studentModel.findOne({ where: { firstName: firstName, lastName: lastName, otherName: otherName } });
        if (existingStudent) {
            return res.status(400).json({
                message: 'student already exists'
            });
        };

        const schoolClass = await classModel.findOne({where: {className: studentClass}})
        

        if(!schoolClass){
            return res.status(200).json({
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
            email: email.trim().toLowerCase(),
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
        // console.log(error.errors)
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
