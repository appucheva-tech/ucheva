const adminModel = require('../models/admin')
const profileModel = require('../models/adminprofile')
const staff = require('../models/staff')
const parent = require('../models/parent')
const studentModel = require('../models/student')
const walletModel = require('../models/wallet')
const cloudinary = require('../config/cloudinary')
const classModel = require('../models/schoolclass')
const paymentModel = require('../models/payment')
const studentAttendanceModel = require('../models/studentattendance')
const staffAttendanceModel = require('../models/staffattendance')
const {Op} = require('sequelize')
const { Sequelize } = require('sequelize')
const db = require('../models');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const otpGenerator = require('otp-generator')
const { emailTemplate } = require('../utils/emailTemplate')
const { sendBrevoEmail } = require('../utils/brevo')
const fs = require('fs')
const redisClient = require('../config/redis')


exports.register = async (req, res, next) => {
    
    try {
        const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false })
        const expiresAt = new Date(Date.now() + 5 * 60000);
        const { schoolName, email, address, schoolUrl ,password, phoneNumber, confirmPassword } = req.body

       const existingUser = await adminModel.findOne({ where: { schoolName } });

        if (existingUser) {
            if (existingUser.isVerified) {
                return res.status(409).json({ message: 'schoolName already taken' });
            }
            await existingUser.destroy();
        }

        const checkSchoolUrl = await adminModel.findOne({ where: { schoolUrl: schoolUrl } })

        if (checkSchoolUrl) {
            return res.status(400).json({
                message: 'school url already exists',
            })
        }

        const existingEmail = await adminModel.findOne({ where: { email } });
        if (existingEmail && existingEmail.isVerified) {
            return res.status(409).json({ 
                message: 'email already in use' 
            });
        }
        if (existingEmail && !existingEmail.isVerified) {
            await existingEmail.destroy();
        };

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: 'password does not match'
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const users = await adminModel.create({
            schoolName,
            schoolUrl: schoolUrl.toLowerCase().trim().split('.')[0],
            email: email.toLowerCase().trim(),
            address,
            phoneNumber,
            password: hashedPassword,
            otp: OTP,
            otpExpiresAt: expiresAt
        })

        const adminProfile = await profileModel.create({
            adminId: users.id,
            schoolUrl: users.schoolUrl
        })

        const emailOptions = {
            email: users.email,
            subject: 'Welcome To Ucheva',
            html: emailTemplate(users.schoolName, OTP)
        }

        await sendBrevoEmail(emailOptions)

        const data = {
            schoolName: users.schoolName,
            schoolUrl: users.schoolUrl,
            email: users.email
        }

        res.status(201).json({
            message: 'account created',
            data: data,
            adminProfile,
            verifyRedirectUrl:`https://www.${users.schoolUrl}.ucheva.com/verify`,
            verifyRedirectLocalUrl:`http://www.${users.schoolUrl}.127.0.0.1.nip.io:5173/verify`,
            email: users.email
        })

    } catch (error) {
       next(error)
    }
};

exports.verifyEmail = async(req, res, next)=>{

    try {
           const schooldomain = req.headers["x-tenant"]
        if(!schooldomain){
            return res.status(404).json({
                message: 'invalid school domain'
            })
        }

        const { email, otp } = req.body;
        const user = await adminModel.findOne({where: {email, schoolUrl:schooldomain}})

        if(!user){
            return next({
        message: 'admin not found',
        statusCode: 404
      })
        };
        if (new Date()> user.otpExpiresAt || user.otp != otp){
            return next({
                message: 'Invalid OTP',
                statusCode: 400
            })

        }

         const id = user.id
        await walletModel.create({
            adminId: id,
            schoolUrl: user.schoolUrl
        })

        user.isVerified = true
        user.otp = null
        user.otpExpiresAt = null

        await user.save()

        res.status(200).json({
            message: 'Verification successful',
            loginRedirectUrl:`https://www.${user.schoolUrl}.ucheva.com/login`,
            verifyRedirectLocalUrl:`http://www.${user.schoolUrl}.127.0.0.1.nip.io:5173/login`,
            email: user.email

        })

    } catch (error) {
        console.log(error)
       next(error)
    }
};

exports.resendOTP = async(req,res,next)=>{
    const schooldomain = req.headers["x-tenant"]
        if(!schooldomain){
            return res.status(404).json({
                message: 'invalid school domain'
            })
        }
    const { email } = req.body;
    const user = await adminModel.findOne({where: {email}, schoolUrl: schooldomain })
    
    if(!user){
        return next({
        message: 'invalid credentials', 
        statusCode: 404
      })
        };

    const OTP = otpGenerator.generate(6, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false})
    const expiresAt = new Date(Date.now() + 2 * 60000);
    
    user.otp = OTP;
    user.otpExpiresAt = expiresAt
    
    const emailOptions = {
        email: user.email,
        subject: 'Confirm New OTP',
        html: emailTemplate(user.schoolName, OTP)
    }

    await sendBrevoEmail(emailOptions)
    
    await user.save()

        res.status(200).json({
            message: 'OTP sent successfully',
            verifyRedirectUrl:`https://www.${user.schoolUrl}.ucheva.com/verify`,
            verifyRedirectLocalUrl:`http://www.${user.schoolUrl}.127.0.0.1.nip.io:5173/verify`,
            email: user.email
    
        })
};

exports.forgotPassword = async(req,res,next)=>{
    const schooldomain = req.headers["x-tenant"]
        if(!schooldomain){
            return res.status(404).json({
                message: 'invalid school domain'
            })
        }
    const { email } = req.body;
    const user = await adminModel.findOne({where: {email}, schoolUrl: schooldomain})

        if(!user){
          return next({
        message: 'invalid credentials',
        statusCode: 404
      })
        };

        const OTP = otpGenerator.generate(6, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false})
        const expiresAt = new Date(Date.now() + 2 * 60000);
        
        user.otp = OTP;
        user.otpExpiresAt = expiresAt
        
        const emailOptions = {
            email: user.email,
            subject: 'Confirm New OTP',
            html: emailTemplate(user.schoolName, OTP)
        }
        
        await sendBrevoEmail(emailOptions)
        
        await user.save()
        
        res.status(200).json({
            message: 'OTP sent successfully',
            verifyRedirectUrl:`https://www.${user.schoolUrl}.ucheva.com/inputCode`,
            verifyRedirectLocalUrl:`http://www.${user.schoolUrl}.127.0.0.1.nip.io:5173/inputCode`,
        })
        
};

    exports.verifyForgotPassword = async(req,res,next)=>{

    try {

        const schooldomain = req.headers["x-tenant"]
        if(!schooldomain){
            return res.status(404).json({
                message: 'invalid school domain'
            })
        }
        
        const { email, otp } = req.body;
        const user = await adminModel.findOne({where: {email}})

        if(!user){
            return next({
        message: 'admin not found',
        statusCode: 404
      })
        };
        if (new Date()> user.otpExpiresAt || user.otp != otp){
            return next({
                message: 'Invalid OTP',
                statusCode: 400
            })

        };

        user.isVerified = true
        user.otp = null
        user.otpExpiresAt = null
        user.passwordReset = true

        await user.save()

        res.status(200).json({
            message: 'Verification successfully',
            verifyRedirectUrl:`https://www.${user.schoolUrl}.ucheva.com/resetpassword`,
            verifyRedirectLocalUrl:`http://www.${user.schoolUrl}.127.0.0.1.nip.io:5173/resetpassword`
        })

    } catch (error) {
       next(error)
    }
};

exports.resetPassword = async(req,res,next)=>{

    try {
        const schooldomain = req.headers["x-tenant"]
        if(!schooldomain){
            return res.status(404).json({
                message: 'invalid school domain'
            })
        }
        
        const { email, newPassword, confirmPassword } = req.body;
        const user = await adminModel.findOne({where: {email}, schoolUrl: schooldomain})

        if(!user){
            return next({
        message: 'admin not found',
        statusCode: 404
      })
        };

        if(user.passwordReset === false){
            return next({
                message: 'Unauthorized to perform this action',
                statusCode: 403
            })
        }

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
            message: 'Password Reset successfully',
             verifyRedirectUrl:`https://www.${user.schoolUrl}.ucheva.com/login`,
            verifyRedirectLocalUrl:`http://www.${user.schoolUrl}.127.0.0.1.nip.io:5173/login`
        })

    } catch (error) {
       next(error)
    }
};
    
exports.userLogin = async (req, res, next) => {
    try {
        const schooldomain = req.headers["x-tenant"]
        if(!schooldomain){
            return res.status(404).json({
                message: 'invalid school domain'
            })
        }


        let user;
        const { role, email, password } = req.body


        if(!role){
          return res.status(400).json({
                message: 'Role is required'
            })
        }

        if (role === "admin"){
         user = await adminModel.findOne({where: { email: email.trim().toLowerCase() , schoolUrl: schooldomain}})
        }else if (role =="staff"){
                user = await staff.findOne({where: { email: email.trim().toLowerCase() , schoolUrl: schooldomain}})
 
        } else {
              user = await parent.findOne({where: { email , schoolUrl: schooldomain}})

        };

        if (!user) {
            return next({
                message: 'invalid credentials',
                statusCode: 404
            })
        };
        console.log('ERROR MESSAGE:',user);
        
        if(user.role !== role){
            return res.status(403).json({
                message: 'You are not '+role
            })
        }
        if(user.isVerified !== true){
            return res.status(401).json({
                message: 'unauthorized'
            })
        }

        if( user.lockUntil > Date.now()) {
            return next({
                message: `Account locked until ${user.lockUntil}`,
                statusCode: 403
            })
        };

        const passwordCorrect = await bcrypt.compare(password, user.password)
        if (!passwordCorrect) {
            // increment login attempt and lock account if necessary

            user.loginAttempts += 1;
            if (user.loginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 2 * 60000);
                user.loginAttempts = 0
            };

            await user.save()
            
            return next({
                message: 'invalid credentials',
                statusCode: 400
            })
        }

        // reset login attempts on successful login
        user.loginAttempts = 0;
        user.passwordReset = false
        await user.save();

        const token = await jwt.sign({
            id: user.id, email: user.email
        },
            process.env.JWT_SECRET_LOGIN,
            { expiresIn: '1 day' })
            redisClient.del(`user: ${user.id}`)
            redisClient.set(`user: ${user.id}`, token, {EX: 86400})

            const data = {
            id: user.id,
            schoolName: user.schoolName,
            email: user.email,
            role: user.role,
            staffType: user.staffType || null,
            completedOnboarding: user.finishedOnboarding || null
        }

        res.status(200).json({
            message: 'login successfully',
            data,
            token,
            
        })

    } catch (error) {
        next(error)
    }
};

// exports.createProfile = async (req, res, next) => {
//     let uploadedImage = null;
// const transaction = await db.sequelize.transaction();
//     try {


//         const { id } = req.user;

//         const user = await adminModel.findByPk(id, { transaction });

//         const profileExists = user.finishedOnboarding

//         if (profileExists) {
//             await transaction.rollback();

//             return res.status(400).json({
//                 message: 'profile has already been created'
//             });
//         }

//         const {
//             schoolType,
//             classFromNur,
//             classToNur,
//             armFromNur,
//             armToNur,
//             classFromPry,
//             classToPry,
//             armFromPry,
//             armToPry,
//             classFromSec,
//             classToSec,
//             armFromSec,
//             armToSec,
//             className,
//             feeType,
//             amount,
//             paymentOption,
//             numberOfInstallments
//         } = req.body;

//         // upload image
//         uploadedImage = await cloudinary.uploader.upload(req.file.path);

//         if (req.file?.path && fs.existsSync(req.file.path)) {
//             fs.unlinkSync(req.file.path);
//         }

//         // console.log(2, {
//         //         adminId: id,
//         //         schoolUrl: user.schoolUrl,
//         //         schoolType,
//         //         schoolLogoUrl: uploadedImage.secure_url,
//         //         schoolLogoPublicId: uploadedImage.public_id
//         //     })
        
//         const profile = await profileModel.create(
//             {
//                 adminId: id,
//                 schoolUrl: user.schoolUrl,
//                 schoolType,
//                 schoolLogoUrl: uploadedImage.secure_url,
//                 schoolLogoPublicId: uploadedImage.public_id
//             },
//             { transaction }
//         );
// //  console.log(5,{

// //               schoolLogoUrl: uploadedImage.secure_url,
// //                 schoolLogoPublicId: uploadedImage.public_id
// //         })
//         //  class config

// const createConfigs = [];

// const sections = [
//   {
//     name: 'nursery',
//     classFrom: classFromNur,
//     classTo: classToNur,
//     armFrom: armFromNur,
//     armTo: armToNur
//   },
//   {
//     name: 'primary',
//     classFrom: classFromPry,
//     classTo: classToPry,
//     armFrom: armFromPry,
//     armTo: armToPry
    
//   },
//   {
//     name: 'secondary',
//     classFrom: classFromSec,
//     classTo: classToSec,
//     armFrom: armFromSec,
//     armTo: armToSec
    
//   }
// ];

// const classLevels = {
//   nursery: ['Creche', 'Nursery 1', 'Nursery 2', 'KG 1', 'KG 2'],
//   primary: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'],
//   secondary: ['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3']
// };

// const getClassRange = (section, classFrom, classTo) => {
//   const classes = classLevels[section];

//    if (!classes) {
//     return (`Invalid section: ${section}`);
//   }

//   const startIndex = classes.indexOf(classFrom);
//   const endIndex = classes.indexOf(classTo);

//   if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
//     return (`Invalid class range for ${section}`);
//   }

//   return classes.slice(startIndex, endIndex + 1);
// };

// const getArmRange = (armFrom, armTo) => {
//   if (!armFrom || !armTo) {
//     return []
// };

//   const start = armFrom.toUpperCase().charCodeAt(0);
//   const end = armTo.toUpperCase().charCodeAt(0);

//   if (start > end) {
//     return ('Invalid arm range');
//   }

//   const fullArms = [];

//   for (let arm = start; arm <= end; arm++) {
//     fullArms.push(String.fromCharCode(arm));
//   }

//   return fullArms
// };

// sections.forEach((sectionItem) => {
//   if (schoolType.includes(sectionItem.name)) {
//     const classes = getClassRange(
//       sectionItem.name,
//       sectionItem.classFrom,
//       sectionItem.classTo
//     );

//     const arms = getArmRange(
//       sectionItem.armFrom,
//       sectionItem.armTo
//     );

//     const combineClassesAndArms = (classes, arms) => {
//   if (!arms.length) {
//     return classes;
//   }

//   const combined = [];

//   classes.forEach((className) => {
//     arms.forEach((arm) => {
//       combined.push(`${className}${arm}`);
//     });
//   });

//   return combined;
// };

//     const fullClasses = combineClassesAndArms(classes, arms);

//     createConfigs.push({
//       adminId: id,
//       schoolUrl: user.schoolUrl,
//       section: sectionItem.name,
//       classFrom: sectionItem.classFrom,
//       classTo: sectionItem.classTo,
//       armFrom: sectionItem.armFrom,
//       armTo: sectionItem.armTo,
//       classes,
//       arms,
//       fullClasses
//     });
//   }
// });

//         const completedConfigs = await classConfigModel.bulkCreate(
//             createConfigs,
//             {
//                 transaction,
//                 returning: true
//             }
//         );

//         const createClass = completedConfigs.flatMap(
//             config => config.classes
//         );

//         const getClass = createClass.map(className => ({
//             adminId: id,
//             className
//         }));

//         await classModel.bulkCreate(getClass, {
//             transaction,
//             returning: true
//         });

//         // fee structure

//         const fetchClass = await classModel.findOne({
//             where: { className },
//             transaction
//         });

//         if (!fetchClass) {
//             throw new Error('class not found');
//         }

//         // if (fetchClass.adminId !== id) {
//         //     throw new Error('unauthorized access to this class');
//         // }

//         let payableAmount = null;

//         if (paymentOption === 'installment') {
//             if (
//                 !numberOfInstallments ||
//                 numberOfInstallments < 2
//             ) {
//                 throw new Error(
//                     'number of installments must be at least 2'
//                 );
//             }

//             payableAmount = Math.floor(
//                 amount / numberOfInstallments
//             );
//         }

//         const feeStructure = await feeModel.create(
//             {
//                 adminId: id,
//                 schoolUrl: user.schoolUrl,
//                 classId: fetchClass.id,
//                 feeType: feeType
//                     .toLowerCase()
//                     .replace(/\s+/g, '_'),
//                 amount,
//                 paymentOption,
//                 numberOfInstallments:
//                     paymentOption === 'installment'
//                         ? numberOfInstallments
//                         : null,
//                 payableAmount
//             },
//             { transaction }
//         );

//         user.finishedOnboarding = true;

//         await user.save({ transaction });

//         await transaction.commit();

//         return res.status(201).json({
//             message: 'profile created successfully'
//         });

//     } catch (error) {
//   console.log("FULL ERROR =>", error);

//   if (error.errors) {
//     error.errors.forEach(err => {
//       console.log({
//         field: err.path,
//         message: err.message,
//         value: err.value
//       });
//     });
//   }
//         if (transaction) {
//             await transaction.rollback();
//         }

//         // remove cloudinary image if DB failed
//         if (uploadedImage?.public_id) {
//             try {
//                 await cloudinary.uploader.destroy(
//                     uploadedImage.public_id
//                 );
//             } catch (err) {
//                 next (err)
//             }
//         }

//         // remove temp file
//         if (
//             req.file?.path &&
//             fs.existsSync(req.file.path)
//         ) {
//             fs.unlinkSync(req.file.path);
//         }

//         next(error);
//     }
// };

exports.getAdmin = async(req, res, next)=>{
    try {
        const {id} = req.user
        const admin = await adminModel.findByPk(id)

        const data = {
            id: admin.id,
            schoolName: admin.schoolName,
            email: admin.email,
            address: admin.address,
            phoneNumber: admin.phoneNumber,
            schoolUrl: admin.schoolUrl
        }

        res.status(200).json({
            message: 'admin retrieved successfully',
            data
        })

    } catch (error) {
        next(error)
    }
};

exports.getAdminProfileSettings = async (req, res, next) => {
    try {
        const { id } = req.user;

        const admin = await adminModel.findByPk(id, {
            attributes: { exclude: ['password'] }
        });
        if (!admin) {
            return res.status(404).json({ 
                message: 'admin not found' 
            });
        }

        const adminProfile = await profileModel.findOne({ where: { adminId: id, schoolUrl: admin.schoolUrl } });
        
        res.status(200).json({
            message: 'admin profile retrieved successfully',
            admin,
            adminProfile: adminProfile || null
        });
        
    } catch (error) {
        next(error);
    }
};
exports.getClassManagement = async (req, res, next) => {
    try {
        const { id } = req.user;
        const admin = await adminModel.findByPk(id);

        if (!admin) {
            return res.status(403).json({ message: 'Admin not found' });
        }

        const getClassDetails = await classModel.findAll({
            where: { schoolUrl: admin.schoolUrl }
        });

        if (!getClassDetails.length) {
            return res.status(404).json({ message: 'No classes found' });
        }

        const classData = await Promise.all(
            getClassDetails.map(async (classes) => {
                const totalStudents = await studentModel.count({
                    where: {
                        schoolUrl: admin.schoolUrl,
                        studentClass: classes.className 
                    }
                });

                return {
                    classId: classes.id,
                    className: classes.className,
                    teacherName: classes.teacherName,
                    totalStudents
                };
            })
        );

        return res.status(200).json({
            message: 'Classes retrieved successfully',
            total: classData.length,
            classes: classData
        });

    } catch (error) {
        next(error);
    }
};

exports.updateAdminProfileSettings = async (req, res, next) => {
    try {
        const { id } = req.user;
        const {
            oldPassword, newPassword, confirmPassword, phoneNumber,
            adminFirstName, adminLastName,
            continuousAssessmentConfig, examConfig, total
        } = req.body;

        const admin = await adminModel.findByPk(id);
        if (!admin) return res.status(404).json({ message: 'admin not found' });

        let adminProfile = await profileModel.findOne({ where: { adminId: id, schoolUrl: admin.schoolUrl } });
        if (!adminProfile) adminProfile = await profileModel.create({ 
            adminId: id, 
            schoolUrl: admin.schoolUrl 
        });

        const adminUpdates = { phoneNumber };

        if (newPassword) {
            const passwordCorrect = await bcrypt.compare(oldPassword, admin.password);
            if (!passwordCorrect) return next({ message: 'incorrect password', statusCode: 400 });
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'password does not match' });
            }
            const salt = await bcrypt.genSalt(10);
            adminUpdates.password = await bcrypt.hash(newPassword, salt);
        }

        if (req.files?.profilePic?.[0]) {
            const file = req.files.profilePic[0];
            const result = await cloudinary.uploader.upload(file.path);
            fs.unlinkSync(file.path);
            adminUpdates.staffProfileUrl = result.secure_url;
            adminUpdates.staffProfilePublicId = result.public_id;
        }

        const profileUpdates = {
            adminFirstName, adminLastName,
            continuousAssessmentConfig, examConfig, total
        };

        if (req.files?.schoolLogo?.[0]) {
            const file = req.files.schoolLogo[0];
            const result = await cloudinary.uploader.upload(file.path);
            fs.unlinkSync(file.path);
            profileUpdates.schoolLogoUrl = result.secure_url;
            profileUpdates.schoolLogoPublicId = result.public_id;
        }

        if (req.files?.schoolStamp?.[0]) {
            const file = req.files.schoolStamp[0];
            const result = await cloudinary.uploader.upload(file.path);
            fs.unlinkSync(file.path);
            profileUpdates.schoolStampUrl = result.secure_url;
            profileUpdates.schoolStampPublicId = result.public_id;
        }

        if (req.files?.cac?.[0]) {
            const file = req.files.cac[0];
            const result = await cloudinary.uploader.upload(file.path);
            fs.unlinkSync(file.path);
            profileUpdates.cacUrl = result.secure_url;
            profileUpdates.cacPublicId = result.public_id;
        }

        if (req.files?.nepa?.[0]) {
            const file = req.files.nepa[0];
            const result = await cloudinary.uploader.upload(file.path);
            fs.unlinkSync(file.path);
            profileUpdates.nepaUrl = result.secure_url;
            profileUpdates.nepaPublicId = result.public_id;
        }

        await admin.update(adminUpdates);
        await adminProfile.update(profileUpdates);

        res.json({
            message: 'admin profile updated successfully',
            admin,
            adminProfile
        });

    } catch (error) {
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                if (file?.path && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        next(error);
    }
};


exports.getWallet = async(req,res,next)=>{
    try {
        const {id} = req.user
        const wallet = await walletModel.findOne({ where: {adminId: id},
            attributes: ['paymentReceived', 'withdrawal', 'balance', 'totalTransaction']
        })

        res.status(200).json({
            wallet
        })

    } catch (error) {
        next(error)
    }
};

const getDateOnly = (date = new Date()) => date.toISOString().split('T')[0];

const getStartOfDay = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
};

const getEndOfDay = (date) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
};

const getFullName = (person) => [person?.firstName, person?.lastName].filter(Boolean).join(' ');

const toNumber = (value) => Number(value || 0);

exports.getSchoolDashboard = async (req, res, next) => {
    try {
        const { id: adminId } = req.user;
        const {
            classSection,
            paymentStatus,
            term = 'Third Term',
            limit = 20,
            page = 1
        } = req.query;
        const today = getDateOnly();
        const now = new Date();
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(now.getDate() - 7);
        const previousWeekStart = new Date(now);
        previousWeekStart.setDate(now.getDate() - 14);
        const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
        const safePage = Math.max(parseInt(page, 10) || 1, 1);
        const offset = (safePage - 1) * safeLimit;

        const admin = await adminModel.findByPk(adminId, {
            attributes: ['id', 'schoolName']
        });

        if (!admin) {
            return res.status(404).json({
                message: 'admin not found'
            });
        }

        const studentWhere = { adminId };
        if (classSection && classSection !== 'All Classes') {
            studentWhere.studentClass = classSection;
        }
        if (paymentStatus && paymentStatus !== 'All Status') {
            studentWhere.paymentStatus = paymentStatus;
        }

        const totalStudents = await studentModel.count({ where: { adminId } });
        const totalStaff = await staff.count({ where: { adminId } });
        const studentsThisWeek = await studentModel.count({
            where: {
                adminId,
                createdAt: { [Op.between]: [getStartOfDay(thisWeekStart), getEndOfDay(now)] }
            }
        });
        const studentsPreviousWeek = await studentModel.count({
            where: {
                adminId,
                createdAt: { [Op.between]: [getStartOfDay(previousWeekStart), getEndOfDay(thisWeekStart)] }
            }
        });
        const staffThisWeek = await staff.count({
            where: {
                adminId,
                createdAt: { [Op.between]: [getStartOfDay(thisWeekStart), getEndOfDay(now)] }
            }
        });
        const staffPreviousWeek = await staff.count({
            where: {
                adminId,
                createdAt: { [Op.between]: [getStartOfDay(previousWeekStart), getEndOfDay(thisWeekStart)] }
            }
        });

        const presentStudents = await studentAttendanceModel.count({
            where: { status: 'present', date: today },
            include: [{
                model: studentModel,
                as: 'student',
                where: { adminId },
                attributes: []
            }]
        });

        const presentStaff = await staffAttendanceModel.count({
            where: { adminId, status: 'present', date: today }
        });

        const totalPeople = totalStudents + totalStaff;
        const totalPresent = presentStudents + presentStaff;
        const attendanceRate = totalPeople
            ? Number(((totalPresent / totalPeople) * 100).toFixed(2))
            : 0;
        const totalStaffAttendancePercent = totalStaff
            ? Number(((presentStaff / totalStaff) * 100).toFixed(2))
            : 0;
        const totalStudentAttendancePercent = totalStudents
            ? Number(((presentStudents / totalStudents) * 100).toFixed(2))
            : 0;
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayDate = getDateOnly(yesterday);
        const presentStudentsYesterday = await studentAttendanceModel.count({
            where: { status: 'present', date: yesterdayDate },
            include: [{
                model: studentModel,
                as: 'student',
                where: { adminId },
                attributes: []
            }]
        });
        const presentStaffYesterday = await staffAttendanceModel.count({
            where: { adminId, status: 'present', date: yesterdayDate }
        });
        const attendanceRateYesterday = totalPeople
            ? Number((((presentStudentsYesterday + presentStaffYesterday) / totalPeople) * 100).toFixed(2))
            : 0;

        const totalFeesCollectedRaw = await paymentModel.sum('amount', {
            where: {
                adminId,
                paymentStatus: 'success'
            }
        });
        const totalFeesCollected = Number(totalFeesCollectedRaw || 0);
        const feesCollectedThisWeekRaw = await paymentModel.sum('amount', {
            where: {
                adminId,
                paymentStatus: 'success',
                paymentDate: { [Op.between]: [getStartOfDay(thisWeekStart), getEndOfDay(now)] }
            }
        });
        const feesCollectedPreviousWeekRaw = await paymentModel.sum('amount', {
            where: {
                adminId,
                paymentStatus: 'success',
                paymentDate: { [Op.between]: [getStartOfDay(previousWeekStart), getEndOfDay(thisWeekStart)] }
            }
        });
        const expectedFeesRaw = await studentModel.findAll({
            where: { adminId },
            include: [{
                model: classModel,
                as: 'classes',
                attributes: ['amount']
            }],
            attributes: ['id']
        });
        const totalExpectedFees = expectedFeesRaw.reduce((sum, student) => {
            return sum + toNumber(student.classes?.amount);
        }, 0);
        const feesCollectedPercent = totalExpectedFees
            ? Number(((totalFeesCollected / totalExpectedFees) * 100).toFixed(2))
            : 0;

        const { rows: filteredStudents, count: filteredTotal } = await studentModel.findAndCountAll({
            where: studentWhere,
            include: [{
                model: classModel,
                as: 'classes',
                attributes: ['className', 'amount']
            }],
            attributes: ['id', 'firstName', 'lastName', 'studentClass', 'paymentStatus'],
            order: [['createdAt', 'DESC']],
            limit: safeLimit,
            offset
        });

        const studentIds = filteredStudents.map((student) => student.id);
        const paymentRows = studentIds.length
            ? await paymentModel.findAll({
                where: { adminId, studentId: { [Op.in]: studentIds } },
                attributes: [
                    'id', 'studentId', 'amount', 'paymentType', 'paymentStatus',
                    'reference', 'currency', 'paymentDate'
                ],
                order: [['paymentDate', 'DESC']]
            })
            : [];

        const paymentsByStudent = paymentRows.reduce((groups, payment) => {
            if (!groups[payment.studentId]) {
                groups[payment.studentId] = [];
            }
            groups[payment.studentId].push(payment);
            return groups;
        }, {});

        const feeRecords = filteredStudents.map((student) => {
            const payments = paymentsByStudent[student.id] || [];
            const paidPayments = payments.filter((payment) => payment.paymentStatus === 'success');
            const amountPaid = paidPayments.reduce((sum, payment) => sum + toNumber(payment.amount), 0);
            const totalAmount = toNumber(student.classes?.amount);
            const latestPayment = payments[0] || null;
            const computedStatus = amountPaid >= totalAmount && totalAmount > 0
                ? 'full payment'
                : amountPaid > 0
                    ? 'part payment'
                    : student.paymentStatus;

            return {
                studentId: student.id,
                studentName: getFullName(student),
                class: student.studentClass,
                totalAmount,
                amountPaid,
                paymentType: latestPayment?.paymentType || null,
                status: computedStatus,
                date: latestPayment?.paymentDate || null,
                reference: latestPayment?.reference || null,
                currency: latestPayment?.currency || 'NGN'
            };
        });

        res.status(200).json({
            message: 'School dashboard retrieved successfully',
            dashboard: {
                greeting: `Good morning, ${admin.schoolName}`,
                overviewText: `Here's an overview of ${admin.schoolName} activities today.`,
                currentTerm: term,
                filters: {
                    classSection: classSection || 'All Classes',
                    paymentStatus: paymentStatus || 'All Status',
                    term
                },
                cards: {
                    totalStudents: {
                        value: totalStudents,
                        fromLastWeek: studentsThisWeek - studentsPreviousWeek
                    },
                    totalStaff: {
                        value: totalStaff,
                        fromLastWeek: staffThisWeek - staffPreviousWeek
                    },
                    attendanceRate: {
                        value: attendanceRate,
                        fromYesterday: Number((attendanceRate - attendanceRateYesterday).toFixed(2))
                    },
                    feesCollected: {
                        value: totalFeesCollected,
                        fromLastWeek: toNumber(feesCollectedThisWeekRaw) - toNumber(feesCollectedPreviousWeekRaw),
                        percentCollected: feesCollectedPercent
                    }
                },
                feeRecords,
                pagination: {
                    page: safePage,
                    limit: safeLimit,
                    total: filteredTotal,
                    totalPages: Math.ceil(filteredTotal / safeLimit)
                }
            },
            summary: {
                totalStudents,
                totalStaff,
                attendanceRate,
                totalStudentAttendancePercent,
                totalStaffAttendancePercent,
                totalFeesCollected,
                feesCollectedPercent
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllStaffAttendance = async (req, res, next) => {
  try {
    const schooldomain = req.headers["x-tenant"]
        if(!schooldomain){
            return res.status(404).json({
                message: 'invalid school domain'
            })
        }
    const today = new Date().toISOString().split('T')[0]
    
    const Attendance = await staffAttendanceModel.findAll({
      where: {
        date: today,
        staffId: {
          [Op.not]: null
        },
        schoolUrl: schooldomain
      },
      order: [['timeCheckedIn', 'ASC']]
    })

    if (Attendance.length === 0) {
      return res.status(404).json({
        message: 'No attendance records found for today'
      })
    }

    res.status(200).json({
      message: "Today's staff attendance retrieved successfully",
      Attendance
    })
  } catch (error) {
    next(error)
  }
}

exports.getAdminName= async (req, res, next) =>{
    try {
        const {id: adminId} =req.user
        const users = await adminModel.findByPk(adminId)
        const adminName = await adminModel.findAll({
            where:{
                name:users.firstName
            }
        })
    } catch (error) {
        next(error)
    }
};

exports.getAllSchoolsUrl = async (req, res, next) => {
    try {
        const schools = await adminModel.findAll({where: {schoolUrl}});
        res.status(200).json({
            message: 'Students retrieved successfully',
            schools
        });
    } catch (error) {
        next(error);
    }
};

exports.logoutUser = async(req, res, next)=>{
   try {
           // get the token from the request header
        const {id} = req.user
        // delete the token from redis to invalidate the session
        redisClient.del(`user:${id}`)

        res.status(200).json({
            message: 'logout successful'
        })
   } catch (error) {
    next(error)
   }
<<<<<<< HEAD
};
=======
};

exports.updateAdminProfileSettings = async (req, res, next) => {
    try {
        const { id } = req.user;
        const {
            oldPassword, newPassword, confirmPassword, phoneNumber,
            adminFirstName, adminLastName,
            continuousAssessmentConfig, examConfig, total
        } = req.body;

        const admin = await adminModel.findByPk(id);
        if (!admin) return res.status(404).json({ message: 'admin not found' });

        let adminProfile = await profileModel.findOne({ where: { adminId: id, schoolUrl: admin.schoolUrl } });
        if (!adminProfile) adminProfile = await profileModel.create({ 
            adminId: id, 
            schoolUrl: admin.schoolUrl 
        });

        const adminUpdates = { phoneNumber };

        if (newPassword) {
            const passwordCorrect = await bcrypt.compare(oldPassword, admin.password);
            if (!passwordCorrect) return next({ message: 'incorrect password', statusCode: 400 });
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'password does not match' });
            }
            const salt = await bcrypt.genSalt(10);
            adminUpdates.password = await bcrypt.hash(newPassword, salt);
        }

        if (req.files?.profilePic?.[0]) {
            const file = req.files.profilePic[0];
            const result = await cloudinary.uploader.upload(file.path);
            fs.unlinkSync(file.path);
            adminUpdates.staffProfileUrl = result.secure_url;
            adminUpdates.staffProfilePublicId = result.public_id;
        }

        const profileUpdates = {
            adminFirstName, adminLastName,
            continuousAssessmentConfig, examConfig, total
        };

        if (req.files?.schoolLogo?.[0]) {
            const file = req.files.schoolLogo[0];
            const result = await cloudinary.uploader.upload(file.path);
            fs.unlinkSync(file.path);
            profileUpdates.schoolLogoUrl = result.secure_url;
            profileUpdates.schoolLogoPublicId = result.public_id;
        }

        if (req.files?.schoolStamp?.[0]) {
            const file = req.files.schoolStamp[0];
            const result = await cloudinary.uploader.upload(file.path);
            fs.unlinkSync(file.path);
            profileUpdates.schoolStampUrl = result.secure_url;
            profileUpdates.schoolStampPublicId = result.public_id;
        }

        if (req.files?.cac?.[0]) {
            const file = req.files.cac[0];
            const result = await cloudinary.uploader.upload(file.path);
            fs.unlinkSync(file.path);
            profileUpdates.cacUrl = result.secure_url;
            profileUpdates.cacPublicId = result.public_id;
        }

        if (req.files?.nepa?.[0]) {
            const file = req.files.nepa[0];
            const result = await cloudinary.uploader.upload(file.path);
            fs.unlinkSync(file.path);
            profileUpdates.nepaUrl = result.secure_url;
            profileUpdates.nepaPublicId = result.public_id;
        }

        await admin.update(adminUpdates);
        await adminProfile.update(profileUpdates);

        res.json({
            message: 'admin profile updated successfully',
            admin,
            adminProfile
        });

    } catch (error) {
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                if (file?.path && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        next(error);
    }
};
>>>>>>> 9354de0c67d30086dd54f894dd432e9b167123e3
