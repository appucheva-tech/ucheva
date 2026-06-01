const staffModel = require('../models/staff');

exports.createStaff = async (req, res, next) => {
    try {
        const { firstName, lastName, otherName, adminId, gender, dateOfBirth, nationality, address, maritalStatus, phoneNumber, email, staffType, role, teachingType, classAssigned, subjectAssigned, classesToTeach } = req.body;

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
            adminId,
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
