const staffModel = require('../models/staff');
const cloudinary = require('cloudinary').v2
const classModel = require('../models/schoolclass')
const studentModel = require('../models/student')
const staff = require('../models/staff');
const feeModel = require('../models/feestructure');
const bcrypt = require('bcrypt');


exports.getTotalExpectedFees = async (req, res, next) => {
    try {
        const { id } = req.user;
        const getStaff = await staff.findByPk(id)
        const classes = await classModel.findAll({ where: { adminId: getStaff.adminId } });
        const fees = await feeModel.findAll({ where: { adminId: getStaff.adminId } });
        const students = await studentModel.findAll({
            where: { adminId: getStaff.adminId },
            attributes: ['classId'],
            raw: true
        });

        // count students per classId manually
        const studentCountMap = {};
        students.forEach(student => {
            studentCountMap[student.classId] = (studentCountMap[student.classId] || 0) + 1;
        });

        // sum fee amount per classId manually
        const feeTotalMap = {};
        fees.forEach(fee => {
            feeTotalMap[fee.classId] = (feeTotalMap[fee.classId] || 0) + Number(fee.amount);
        });

        const breakdown = classes.map(cls => {
            const studentCount = studentCountMap[cls.id] || 0;
            const totalFeePerStudent = feeTotalMap[cls.id] || 0;
            return {
                classId: cls.id,
                className: cls.className,
                studentCount,
                totalFeePerStudent,
                totalExpectedForClass: studentCount * totalFeePerStudent
            };
        });

        const grandTotal = breakdown.reduce((sum, c) => sum + c.totalExpectedForClass, 0);

        res.status(200).json({
            message: 'total expected fees retrieved successfully',
            breakdown,
            grandTotal
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
}