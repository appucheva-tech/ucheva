const studentModel = require('../models/student');
const adminModel = require('../models/admin')

exports.createStudent = async (req, res, next) => {
    try {
        const {id} = req.params
        const admin = await adminModel.findByPk(id)
        if(!admin){
            return res.status(404).json({
                message: 'admin not found'
            })
        }
        const { firstName, lastName, otherName, gender, dateOfBirth, nationality, address, relationship, phoneNumber, email, guardianParentName, session } = req.body;

        // Check if the email is already in use
        const existingStudent = await studentModel.findOne({ where: { email } });
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
            email,
            guardianParentName,
            session
        });

        res.status(201).json({
            message: 'Student created successfully',
            student
        });
    } catch (error) {
        next(error);
    }
};
