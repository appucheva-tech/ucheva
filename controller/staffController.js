require('dotenv').config()
const staffModel = require('../models/staff');
const adminModel = require('../models/admin')
const cloudinary = require('../config/cloudinary');
const bcrypt = require('bcrypt')
const { inviteTemplate } = require('../utils/emailTemplate')
const { sendBrevoEmail } = require('../utils/brevo')
const sendMail = require('../utils/nodemailer') 
const fs = require('fs');
const jwt = require('jsonwebtoken');
const schoolClasses = require('../models/schoolclass');

exports.createStaff = async (req, res, next) => {
    try {
        const {id} = req.user
        const admin = await adminModel.findByPk(id)
        const { firstName, lastName, otherName, gender, dateOfBirth, nationality, address, maritalStatus, staffType, phoneNumber, email, qualification } = req.body;

        // Check if the email is already in use
        const existingStaff = await staffModel.findOne({ where: { email } });
        if (existingStaff) {
            return res.status(400).json({
                message: 'Email is already in use'
            });
        };

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
            staffTokenExpiresAt: new Date(Date.now) + (60000 * 60 * 24)
        });
        
        const token = await jwt.sign({
            id: staff.id, email: staff.email}, 
            process.env.JWT_SECRET_INVITE, {
                expiresIn: '1day'
            })

        staff.staffToken = token;
        await staff.save()

        const link = `https://${admin.schoolUrl}.ucheva.com/create-password/${token}`

        const emailOptions = {
        email: staff.email,
        subject: `Welcome To ${admin.schoolName}`,
        html: inviteTemplate(staff.firstName, link)
            }
       if (process.env.NODE_ENV === "production") {
            await sendBrevoEmail(emailOptions)
       } else{
            await sendMail(emailOptions)
       };

        res.status(201).json({
            message: 'Staff created successfully',
            redirectUrl: `https://${admin.schoolUrl}.ucheva.com/create-password/${token}`
        });
    } catch (error) {
        next(error);
        console.log(error.errors)
    }
};


exports.createPassword = async (req, res, next) => {
    try {
        const {id} = req.user
        const { password, confirmPassword } = req.body;

        const staff = await staffModel.findByPk(id);

        if (!staff) {
            return res.status(404).json({
                message: 'Staff not found'
            });
        }

        if (staff.isActive) {
            return res.status(400).json({
                message: 'Account already activated'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        staff.password = hashedPassword;
        staff.isActive = true;
        staff.isVerified = true;

        await staff.save();

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
        const user = await staffModel.findByPk(id)

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

        const updatedPassword = await adminModel.update(pass, {where: {email}})

        res.status(200).json({
            message: 'Password changed successfully',
            updatedPassword
        })

    } catch (error) {
       next(error)
    }
};



exports.updateStaff = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { firstName, lastName} = req.body;

        const staff = await staffModel.findByPk(id);    
        if (!staff) {
            return res.status(404).json({
                message: 'Staff not found'
            });
        }   
        const profilePic = await cloudinary.uploader.upload(req.files.profilePicture)
        if (fs.existsSync(req.files.profilePicture)) {
            fs.unlinkSync(req.files.profilePicture);
        }
        
        if(!profilePic){
            return next({
            message: 'profile picture upload failed',
            statusCode: 500
            })
        }
        const signaturePic = await cloudinary.uploader.upload(req.files.signature)
        if (fs.existsSync(req.files.signature)) {
            fs.unlinkSync(req.files.signature);
        }
        
        if(!signaturePic){
            return next({
            message: 'signature upload failed',
            statusCode: 500
            })
        }
        const update = {
            firstName: firstName || staff.firstName,
            lastName: lastName || staff.lastName,
            staffUrl: result.secure_url || staff.staffImage,
            staffPublicId: result.public_id || staff.publicId,
            signatureUrl: result.secure_url || staff.signatureUrl,
            signaturePublicId: result.public_id || staff.signaturePublicId
        };

        await staff.update(update);

        res.status(200).json({
            message: 'Staff updated successfully',
            staff
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllStaff = async (req, res, next) => {
    try {

        const {id} = req.user
        const staff = await staffModel.findAll({where: {adminId: id}});

        const totalStaff = staff.length;
        const totalClassTeachers = staff.filter(staffs => staffs.staffType === 'class teacher').length;
        const totalSubjectTeachers = staff.filter(staffs => staffs.staffType === 'subject teacher').length;
        const totalActiveStaff = staff.filter(staffs => staffs.isActive === true).length;

        const staffData = staff.map((staffs)=>{
            return {
                id: staffs.id,
                firstName: staffs.firstName,
                lastName: staffs.lastName,
                staffType: staffs.staffType,
                staffRole: staffs.staffRole,
                teacherType: staffs.teacherType || null,
                classAssigned: staffs.classAssigned,
                phoneNumber: staffs.phoneNumber,
                subjectAssigned: staffs.subjectAssigned
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

exports.getStaffSummary = async (req, res, next) => {
    try {
        const { id: adminId } = req.user;

        const totalStaff = await staffModel.count({ where: { adminId } });
        const totalTeachingStaff = await staffModel.count({
            where: {
                adminId,
                staffType: 'teaching staff'
            }
        });
        const totalNonTeachingStaff = await staffModel.count({
            where: {
                adminId,
                staffType: 'non-teaching staff'
            }
        });
        const totalClassTeachers = await staffModel.count({
            where: {
                adminId,
                teacherType: 'class teacher'
            }
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
        const staff = await staffModel.findByPk(id);
        

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
        const staff = await staffModel.findByPk(id);        

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
