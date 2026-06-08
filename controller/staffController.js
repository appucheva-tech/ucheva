const staffModel = require('../models/staff');

exports.createStaff = async (req, res, next) => {
    try {
        const {id} = req.user
        const { firstName, lastName, otherName, gender, dateOfBirth, nationality, address, maritalStatus, phoneNumber, email, staffType, role, teachingType, classAssigned, subjectAssigned, classesToTeach } = req.body;

        // Check if the email is already in use
        const existingStaff = await staffModel.findOne({ where: { email } });
        if (existingStaff) {
            return res.status(400).json({
                message: 'Email is already in use'
            });
        }

        const staff = await staffModel.create({
            firstName,
            lastName,
            otherName,
            adminId: id,
            gender,
            dateOfBirth,
            nationality,
            address,
            maritalStatus,
            phoneNumber,
            email,
            staffType,
            role,
            teachingType,
            classAssigned,
            subjectAssigned,
            classesToTeach
        });

        res.status(201).json({
            message: 'Staff created successfully',
            staff
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllStaff = async (req, res, next) => {
    try {
        const staff = await staffModel.findAll();
        res.status(200).json({
            message: 'Staff retrieved successfully',
            staff
        });
    } catch (error) {
        next(error);
    }
};
