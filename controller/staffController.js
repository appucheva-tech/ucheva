require('dotenv').config()
const staffModel = require('../models/staff');
const adminModel = require('../models/admin')
const cloudinary = require('../config/cloudinary');
const bcrypt = require('bcrypt')
const { inviteTemplate } = require('../utils/emailTemplate')
const { sendBrevoEmail } = require('../utils/brevo')
const fs = require('fs');
const jwt = require('jsonwebtoken')

exports.createStaff = async (req, res, next) => {
    try {


        console.log( 'token: display token')
        const {id} = req.user
        const admin = await adminModel.findByPk(id)
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
            email: email.toLowerCase().trim(),
            staffType,
            role,
            teachingType,
            classAssigned,
            subjectAssigned,
            classesToTeach,
            staffTokenExpiresAt: new Date(Date.now) + (60000 * 60 * 24)
        });
console.log(       process.env.JWT_SECRET_INVITE)
        const token = await jwt.sign({
            id: staff.id, email: staff.email}, 
            process.env.JWT_SECRET_INVITE, {
                expiresIn: '1day'
            })
            console.log(token);
             
        staff.staffToken = token;
        await staff.save()

        const link = `https://ucheva.onrender.com/api/v1/staff/create-password/${token}`

        const emailOptions = {
        email: staff.email,
        subject: `Welcome To ${admin.schoolName}`,
        html: inviteTemplate(staff.firstName, link)
            }
       
        await sendBrevoEmail(emailOptions)


        res.status(201).json({
            message: 'Staff created successfully',
            staff
        });
    } catch (error) {
        next(error);
    }
};



exports.createPassword = async (req, res, next) => {
    try {
        const {id} = req.user
        // const { token } = req.params;
        const { password, confirmPassword } = req.body;

        // const decoded = jwt.verify(
        //     token,
        //     process.env.JWT_INVITE_SECRET
        // );

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

        await staff.save();

        res.status(200).json({
            message: 'Password created successfully'
        });

    } catch (error) {

        res.status(400).json({
            message: 'Invalid or expired token'
        });

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

exports.resetPassword = async(req,res,next)=>{
    try {
        const {id} = req.user
        const { email, newPassword, confirmPassword } = req.body;
        const user = await staffModel.findByPk(id)

        if(!user){
            return next({
        message: 'admin not found',
        statusCode: 404
      })
        };

        // if(user.passwordReset === false){
        //     return next({
        //         message: 'Unauthorized to perform this action',
        //         statusCode: 403
        //     })
        // }

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

        const updatedPassword = await staffModel.update(pass, {where: {id}})

        res.status(200).json({
            message: 'Password Reset successfully',
            updatedPassword
        })

    } catch (error) {
       next(error)
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
