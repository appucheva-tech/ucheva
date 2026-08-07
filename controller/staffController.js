require('dotenv').config()
const staffModel = require('../models/staff');
const adminModel = require('../models/admin')
const subjectModel = require('../models/subject')
const cloudinary = require('../config/cloudinary');
const parentModel = require('../models/parent')
const bcrypt = require('bcrypt')
const { inviteTemplate } = require('../utils/emailTemplate')
const { sendBrevoEmail } = require('../utils/brevo')
const sendMail = require('../utils/nodemailer') 
const fs = require('fs');
const jwt = require('jsonwebtoken');
const schoolClasses = require('../models/schoolclass');

exports.createStaff = async (req, res, next) => {
    try {
        const { id } = req.user;
        const admin = await adminModel.findById(id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const { firstName, lastName, otherName, gender, dateOfBirth, nationality, 
                address, maritalStatus, staffType, phoneNumber, email, 
                qualification, classId } = req.body;

        const existingStaff = await staffModel.findOne({
            $or: [{ email }, { phoneNumber }],
            schoolUrl: admin.schoolUrl
        });
        if (existingStaff) {
            return res.status(400).json({ message: 'Email or phone number is already in use' });
        }

        let getClass = null;
        if (classId) {
            getClass = await schoolClasses.findOne({
                _id: classId,
                adminId: id,
                schoolUrl: admin.schoolUrl
            });
            if (!getClass) {
                return res.status(404).json({ message: 'Class not found' });
            }
            if (getClass.assigned === true) {
                return res.status(400).json({ message: 'Class has already been assigned' });
            }
            if (staffType !== 'class teacher') {
                return res.status(400).json({ 
                    message: 'Only a class teacher can be assigned to a class' 
                });
            }
        }

        const staff = await staffModel.create({
            schoolUrl: admin.schoolUrl,
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
            email: email.toLowerCase().trim(),
            staffType,
            qualification,
            staffTokenExpiresAt: new Date(Date.now() + (60000 * 60 * 24))
        });

        if (getClass) {
            getClass.staffId = staff._id;
            getClass.assigned = true;
            staff.classAssigned = [...(staff.classAssigned || []), getClass.className];
            await getClass.save();
            await staff.save();
        }

        const token = jwt.sign(
            { id: staff._id, email: staff.email, role: staff.role },
            process.env.JWT_SECRET_INVITE,
            { expiresIn: '1day' }
        );

        staff.staffToken = token;
        await staff.save();

        const link = `https://${admin.schoolUrl}.ucheva.com/create-password/${token}`;

        const emailOptions = {
            email: staff.email,
            subject: `Welcome To ${admin.schoolName}`,
            html: inviteTemplate(staff.firstName, link)
        };

        if (process.env.NODE_ENV === 'production') {
            await sendBrevoEmail(emailOptions);
        } else {
            await sendMail(emailOptions);
        }

        return res.status(201).json({
            message: 'Staff created successfully',
            redirectUrl: link
        });

    } catch (error) {
        next(error);
    }
};

exports.createPassword = async (req, res, next) => {
    try {   

        const { id, role } = req.user;
        const { password, confirmPassword } = req.body;
        let user;

        if (role === 'parent') {
            user = await parentModel.findById(id);

             if (!user) {
            return res.status(404).json({
                message: 'user not found'
            });
        }

        if (user.isActive) {
            return res.status(400).json({
                message: 'Account already activated'
            });
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.isActive = true;
        user.isVerified = true;

        await user.save();
        } else if (role === 'staff') {
            user = await staffModel.findById(id);
             if (!user) {
            return res.status(404).json({
                message: 'user not found'
            });
        }

        if (user.isActive) {
            return res.status(400).json({
                message: 'Account already activated'
            });
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.isActive = true;
        user.isVerified = true;

        await user.save();
        } else {
            return next({ 
                message: 'unauthorized access', 
                statusCode: 403 
            });
        }

        if (!user) {
            return next({ message: `${role} does not exist`, statusCode: 404 });
        }

        //  const hashedPassword = await bcrypt.hash(password, 10);

        res.status(200).json({
            message: 'Password created successfully'
        });

    } catch (error) {
        next(error)
    }
};


exports.changePassword = async(req,res,next)=>{

    try {
        const {id} =  req.user
        const { newPassword, confirmPassword } = req.body;
        const user = await staffModel.findById(id)

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: 'password does not match'
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        const pass = {
            password: hashedPassword
        }

        const updatedPassword = await staffModel.findByIdAndUpdate(id, pass)

        res.status(200).json({
            message: 'Password changed successfully',
            updatedPassword
        })

    } catch (error) {
       next(error)
    }
};


exports.StaffDashboard = async (req, res, next) => {
    try {

        const {id} = req.user
        const admin = await adminModel.findById(id)
        const staff = await staffModel.find({ adminId: id, schoolUrl: admin.schoolUrl });

        const totalStaff = staff.length;
        const totalClassTeachers = staff.filter(staffs => staffs.staffType === 'class teacher').length;
        const totalSubjectTeachers = staff.filter(staffs => staffs.staffType === 'subject teacher').length;
        const totalActiveStaff = staff.filter(staffs => staffs.isActive === true).length;

        const staffData = staff.map((staffs)=>{
            return {
                id: staffs._id,
                fullName: `${staffs.firstName} ${staffs.lastName}`,
                staffType: staffs.staffType
            }
        });

        res.status(200).json({
            message: 'Staff retrieved successfully',
            summary: {
                totalStaff,
                totalClassTeachers,
                totalSubjectTeachers,
                totalActiveStaff
            },
            staffData
        });
    } catch (error) {
        next(error);
    }   
};

exports.getAllStaffs = async(req,res,next)=>{
    try {
        const {id} = req.user
        const admin = await adminModel.findById(id)

        const getStaffs = await staffModel.find({ adminId: id, schoolUrl: admin.schoolUrl })

         const staffsData = getStaffs.map((staffs)=>{
            return {
                id: staffs._id,
                fullName: `${staffs.firstName} ${staffs.lastName}`,
                staffType: staffs.staffType,
                phoneNumber: staffs.phoneNumber,
                assignedClass: staffs.classAssigned || 'no class assigned',
                assignedSubject: staffs.subjectAssigned || 'no subject assigned'
            }
        });

        res.status(200).json({
            message: 'staffs retrieved successfully',
            staffsData
        })

    } catch (error) {
        next(error)
    }
};

exports.updateStaff = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { staffId } = req.params;
        const { firstName, lastName, othername, phoneNumber, staffType, maritalStatus, qualification, } = req.body;

        const admin = await adminModel.findById(id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const staff = await staffModel.findOne({ _id: staffId, adminId: id, schoolUrl: admin.schoolUrl });
        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }

        Object.assign(staff, {
            firstName:   firstName   ?? staff.firstName,
            lastName:    lastName    ?? staff.lastName,
            phoneNumber: phoneNumber ?? staff.phoneNumber,
            staffType:   staffType   ?? staff.staffType
        });
        await staff.save();

        return res.status(200).json({
            message: 'Staff updated successfully',
            staff: {
                id:         staff._id,
                fullName:   `${staff.firstName} ${staff.lastName}`,
                staffType:   staff.staffType,
                phoneNumber:  staff.phoneNumber,
                assignedClass:  staff.classAssigned   || 'no class assigned',
                assignedSubject: staff.subjectAssigned || 'no subject assigned',
                
            }
        });

    } catch (error) {
        next(error);
    }
};
exports.deleteStaff = async (req, res, next) => {
    try {
        const { id } = req.user;
        const staffId = req.params.id;

        const admin = await adminModel.findById(id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const staff = await staffModel.findOne({ 
            _id: staffId, 
            adminId: id, 
            schoolUrl: admin.schoolUrl
        });

        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }

        // Unassign this teacher from any class they're the classTeacher of
        await schoolClasses.updateMany(
            { staffId: staff._id },
            { $set: { teacherName: null, assigned: false } }
        );

        // Unassign this teacher from any subject they're the subjectTeacher of
        await subjectModel.updateMany(
            { staffId: staff._id },
            { $set: { subjectTeacher: null } }
        );

        await staff.deleteOne();

        return res.status(200).json({ 
            message: 'Staff deleted successfully' 
        });

    } catch (error) {
        next(error);
    }
};

exports.getStaffSummary = async (req, res, next) => {
    try {
        const { id: adminId } = req.user;

        const totalStaff = await staffModel.countDocuments({ adminId });
        const totalTeachingStaff = await staffModel.countDocuments({
            adminId,
            staffType: 'teaching staff'
        });
        const totalNonTeachingStaff = await staffModel.countDocuments({
            adminId,
            staffType: 'non-teaching staff'
        });
        const totalClassTeachers = await staffModel.countDocuments({
            adminId,
            staffType: 'class teacher'
        });

        res.status(200).json({
            message: 'Staff summary retrieved successfully',
            summary: {
                totalStaff,
                totalTeachingStaff,
                totalNonTeachingStaff,
                totalClassTeachers
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getStaff = async (req, res, next) => {
    try {
        const { id } = req.user;
        const staff = await staffModel.findById(id);
        

        if (!staff) {
            return res.status(404).json({
                message: 'Staff not found'
            });
        }
        res.status(200).json({
            message: 'Staff retrieved successfully',
            staff
        });
    } catch (error) {
        next(error);
    }
};

exports.getStaffByAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const staff = await staffModel.findById(id);        

        if (!staff) {
            return res.status(404).json({
                message: 'Staff not found'
            });
        }
        res.status(200).json({
            message: 'Staff retrieved successfully',
            staff
        });
    } catch (error) {
        next(error);
    }
};
