const adminModel = require('../models/admin')
const profileModel = require('../models/adminprofile')
const staff = require('../models/staff')
const studentModel = require('../models/student')
const classConfigModel = require('../models/classconfig')
const walletModel = require('../models/wallet')
const cloudinary = require('../config/cloudinary')
const classModel = require('../models/schoolclass')
const feeModel = require('../models/feestructure')
const paymentModel = require('../models/payment')
const studentAttendanceModel = require('../models/studentattendance')
const announcementModel = require('../models/announcement') 
const staffAttendanceModel = require('../models/staffattendance')

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

        const checkSchoolName = await adminModel.findOne({ where: { schoolName: schoolName}})

        if (checkSchoolName) {
            return res.status(400).json({
                message: 'school name already exists',
            })
        }

        const checkSchoolUrl = await adminModel.findOne({ where: { schoolUrl: schoolUrl } })

        if (checkSchoolUrl) {
            return res.status(400).json({
                message: 'school url already exists',
            })
        }

        const emailExists = await adminModel.findOne({ where: {email}})

        if (emailExists){
         return res.status(400).json({
                message: 'school email already exists',
            })
        }

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
            verifyRedirectUrl:`https://www.${users.schoolUrl}.ucheva.com/verify`,
            verifyRedirectLocalUrl:`http://www.${users.schoolUrl}.127.0.0.1.nip.io:5173/verify`,
            email: users.email
        })

    } catch (error) {
       next(error)
    }
};


exports.verifyEmail = async(req,res,next)=>{

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
            message: 'Verification successfully',
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
        message: 'user not found', 
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
        message: 'user not found',
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
console.log("userrr: ",user)
        }else if (role =="staff"){
                user = await staff.findOne({where: { email: email.trim().toLowerCase() , schoolUrl: schooldomain}})
 
        };
        // else{
        //       user = await parent.findOne({where: { email , schoolUrl: schooldomain}})

        // };

        if (!user) {
            return next({
                message: 'user not found',
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
        // check if account is locked due to many failed login attempts

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

// exports.createProfile = async(req, res, next) =>{
//     try {
//         const {id} = req.user;
//         const user = await adminModel.findByPk(id)
//         const profileExists = await profileModel.findOne({where:{adminId: id}})
//         if(profileExists){
//             return res.status(400).json({
//                 message: 'profile has already been created'
//             })
//         }

//     const  { schoolType,
       
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
//             className, feeType, amount, paymentOption, numberOfInstallments
  
// } = req.body;

//     // profile or school type setup

//         const result = await cloudinary.uploader.upload(req.file.path)
//              if (fs.existsSync(req.file.path)) {
//             fs.unlinkSync(req.file.path);
//         }

//         if(!result){
//             return next({
//                 message: 'Image upload failed',
//                 statusCode: 500
//             })
//         }

//          const profile = await profileModel.create({
//             adminId: id,
//             schoolUrl: user.schoolType,
//             schoolType,
//             schoolLogoUrl: result.secure_url,
//             schoolLogoPublicId: result.public_id
//         });

//         // class config

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
//       schoolUrl: user.schoolType,
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

//   const completedConfigs = await classConfigModel.bulkCreate(createConfigs);
//     //  create all classes
//         const createClass = completedConfigs.flatMap(config => config.classes)

//           const getClass = createClass.map((className)=>{
//             return{
//                 adminId: id,
//                 className: className
//             }
//           })

//           const createAllClasses = await classModel.bulkCreate(getClass)


//     // fee structure
//         const fetchClass = await classModel.findOne({where: {className: className}});
//         if (!fetchClass) {
//             return res.status(404).json({
//                 message: 'class not found'
//             });
//         }

//         if (fetchClass.adminId !== id) {
//             return res.status(403).json({
//                 message: 'unauthorized access to this class'
//             });
//         }

//         let payableAmount = null;
//         if (paymentOption === 'installment') {
//             if (!numberOfInstallments || numberOfInstallments < 2) {
//                 return res.status(400).json({
//                     message: 'number of installments must be at least 2 for installment payment'
//                 });
//             }
//             payableAmount = Math.floor(amount / numberOfInstallments);
//         }

//         const feeStructure = await feeModel.create({
//             adminId: id,
//             schoolUrl: user.schoolUrl,
//             classId: fetchClass.id,
//             feeType: feeType.toLowerCase().replace(/\s+/g, '_'),
//             amount,
//             paymentOption,
//             numberOfInstallments: paymentOption === 'installment' ? numberOfInstallments : null,
//             payableAmount
//         });

//          user.finishedOnboarding = true
//         await user.save()

//         res.status(201).json({
//             message: 'profile created successfully',
//             profile,
//             completedConfigs,
//             feeStructure
//         })
    
//     } catch (error) {
//      if (fs.existsSync(req.file.path)) {
//     fs.unlinkSync(req.file.path);
// }       next(error)
//     }
// };

exports.createProfile = async (req, res, next) => {
    let uploadedImage = null;
const transaction = await db.sequelize.transaction();
    try {


        const { id } = req.user;

        const user = await adminModel.findByPk(id, { transaction });

        const profileExists = user.finishedOnboarding

        if (profileExists) {
            await transaction.rollback();

            return res.status(400).json({
                message: 'profile has already been created'
            });
        }

        const {
            schoolType,
            classFromNur,
            classToNur,
            armFromNur,
            armToNur,
            classFromPry,
            classToPry,
            armFromPry,
            armToPry,
            classFromSec,
            classToSec,
            armFromSec,
            armToSec,
            className,
            feeType,
            amount,
            paymentOption,
            numberOfInstallments
        } = req.body;

        // upload image
        uploadedImage = await cloudinary.uploader.upload(req.file.path);

        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        const profile = await profileModel.create(
            {
                adminId: id,
                schoolUrl: user.schoolType,
                schoolType,
                schoolLogoUrl: uploadedImage.secure_url,
                schoolLogoPublicId: uploadedImage.public_id
            },
            { transaction }
        );

        //  class config

const createConfigs = [];

const sections = [
  {
    name: 'nursery',
    classFrom: classFromNur,
    classTo: classToNur,
    armFrom: armFromNur,
    armTo: armToNur
  },
  {
    name: 'primary',
    classFrom: classFromPry,
    classTo: classToPry,
    armFrom: armFromPry,
    armTo: armToPry
    
  },
  {
    name: 'secondary',
    classFrom: classFromSec,
    classTo: classToSec,
    armFrom: armFromSec,
    armTo: armToSec
    
  }
];

const classLevels = {
  nursery: ['Creche', 'Nursery 1', 'Nursery 2', 'KG 1', 'KG 2'],
  primary: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'],
  secondary: ['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3']
};

const getClassRange = (section, classFrom, classTo) => {
  const classes = classLevels[section];

   if (!classes) {
    return (`Invalid section: ${section}`);
  }

  const startIndex = classes.indexOf(classFrom);
  const endIndex = classes.indexOf(classTo);

  if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
    return (`Invalid class range for ${section}`);
  }

  return classes.slice(startIndex, endIndex + 1);
};

const getArmRange = (armFrom, armTo) => {
  if (!armFrom || !armTo) {
    return []
};

  const start = armFrom.toUpperCase().charCodeAt(0);
  const end = armTo.toUpperCase().charCodeAt(0);

  if (start > end) {
    return ('Invalid arm range');
  }

  const fullArms = [];

  for (let arm = start; arm <= end; arm++) {
    fullArms.push(String.fromCharCode(arm));
  }

  return fullArms
};

sections.forEach((sectionItem) => {
  if (schoolType.includes(sectionItem.name)) {
    const classes = getClassRange(
      sectionItem.name,
      sectionItem.classFrom,
      sectionItem.classTo
    );

    const arms = getArmRange(
      sectionItem.armFrom,
      sectionItem.armTo
    );

    const combineClassesAndArms = (classes, arms) => {
  if (!arms.length) {
    return classes;
  }

  const combined = [];

  classes.forEach((className) => {
    arms.forEach((arm) => {
      combined.push(`${className}${arm}`);
    });
  });

  return combined;
};

    const fullClasses = combineClassesAndArms(classes, arms);

    createConfigs.push({
      adminId: id,
      schoolUrl: user.schoolType,
      section: sectionItem.name,
      classFrom: sectionItem.classFrom,
      classTo: sectionItem.classTo,
      armFrom: sectionItem.armFrom,
      armTo: sectionItem.armTo,
      classes,
      arms,
      fullClasses
    });
  }
});

        // ====================================================
        // KEEP YOUR EXISTING sections, classLevels,
        // getClassRange, getArmRange logic here unchanged
        // ====================================================

        const completedConfigs = await classConfigModel.bulkCreate(
            createConfigs,
            {
                transaction,
                returning: true
            }
        );

        const createClass = completedConfigs.flatMap(
            config => config.classes
        );

        const getClass = createClass.map(className => ({
            adminId: id,
            className
        }));

        await classModel.bulkCreate(getClass, {
            transaction,
            returning: true
        });

        // fee structure

        const fetchClass = await classModel.findOne({
            where: { className },
            transaction
        });

        if (!fetchClass) {
            throw new Error('class not found');
        }

        if (fetchClass.adminId !== id) {
            throw new Error('unauthorized access to this class');
        }

        let payableAmount = null;

        if (paymentOption === 'installment') {
            if (
                !numberOfInstallments ||
                numberOfInstallments < 2
            ) {
                throw new Error(
                    'number of installments must be at least 2'
                );
            }

            payableAmount = Math.floor(
                amount / numberOfInstallments
            );
        }

        const feeStructure = await feeModel.create(
            {
                adminId: id,
                schoolUrl: user.schoolUrl,
                classId: fetchClass.id,
                feeType: feeType
                    .toLowerCase()
                    .replace(/\s+/g, '_'),
                amount,
                paymentOption,
                numberOfInstallments:
                    paymentOption === 'installment'
                        ? numberOfInstallments
                        : null,
                payableAmount
            },
            { transaction }
        );

        user.finishedOnboarding = true;

        await user.save({ transaction });

        await transaction.commit();

        return res.status(201).json({
            message: 'profile created successfully',
            profile,
            completedConfigs,
            feeStructure
        });

    } catch (error) {

        if (transaction) {
            await transaction.rollback();
        }

        // remove cloudinary image if DB failed
        if (uploadedImage?.public_id) {
            try {
                await cloudinary.uploader.destroy(
                    uploadedImage.public_id
                );
            } catch (err) {
                next (err)
            }
        }

        // remove temp file
        if (
            req.file?.path &&
            fs.existsSync(req.file.path)
        ) {
            fs.unlinkSync(req.file.path);
        }

        next(error);
    }
};


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



exports.getProfile = async(req,res,next)=>{
    try {
        const {id} = req.user;
        const adminProfile = await adminModel.findByPk(id)
        const schoolProfile = await profileModel.findOne({where: {adminId: id}})

        if(!schoolProfile){
            return next({
                message: 'profile not found',
                statusCode: 404
            })
        }   
        const schoolData = {
            schoolType: schoolProfile.schoolType,
            schoolLogoUrl: schoolProfile.schoolLogoUrl,
            schoolLogoPublicId: schoolProfile.schoolLogoPublicId  
        }; 

        const viewSchoolProfile = {
            schoolName: adminProfile.schoolName,
            schoolEmail: adminProfile.email,
            schoolAddress: adminProfile.schoolAddress,
            schoolPhoneNumber: adminProfile.phoneNumber,
            schoolUrl: adminProfile.schoolUrl  
        };

        res.status(200).json({
            message: 'profile retrieved successfully',
            viewSchoolProfile,
            schoolData
        })
    
    } catch (error) {
            next(error) 
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

exports.getSchoolDashboard = async (req, res, next) => {
    try {
        const { id: adminId } = req.user;
        const today = new Date().toISOString().split('T')[0];

        const totalStudents = await studentModel.count({ where: { adminId } });
        const totalStaff = await staff.count({ where: { adminId } });

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
            where: { status: 'Present', date: today },
            include: [{
                model: staff,
                as: 'staff',
                where: { adminId },
                attributes: []
            }]
        });

        const totalStaffAttendancePercent = totalStaff
            ? Number(((presentStaff / totalStaff) * 100).toFixed(2))
            : 0;
        const totalStudentAttendancePercent = totalStudents
            ? Number(((presentStudents / totalStudents) * 100).toFixed(2))
            : 0;

        const totalFeesCollectedRaw = await paymentModel.sum('amount', {
            where: {
                adminId,
                paymentStatus: 'success'
            }
        });
        const totalFeesCollected = Number(totalFeesCollectedRaw || 0);

        res.status(200).json({
            message: 'School dashboard summary retrieved successfully',
            summary: {
                totalStudents,
                totalStaff,
                totalStudentAttendancePercent,
                totalStaffAttendancePercent,
                totalFeesCollected
            }
        });
    } catch (error) {
        next(error);
    }
};
exports.getAllStaffAttendance = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const Attendance = await StaffAttendanceModel.findAll({
      where: {
        date: today,
        staffId: {
          [Op.not]: null
        }
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
exports.getTodayAnnouncements = async (req, res, next)=>{
    try {
        const today = new Date().toISOString().split('T')[0]
        const announcements = await announcementModel.findAll({
            where:{
                date: today
            },
            order:[['scheduleTime','ASC']]
        })
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
};