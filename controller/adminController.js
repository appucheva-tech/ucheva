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
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const otpGenerator = require('otp-generator')
const { emailTemplate } = require('../utils/emailTemplate')
const { sendBrevoEmail } = require('../utils/brevo')
const fs = require('fs')
const redisClient = require('../config/redis');


exports.register = async (req, res, next) => {
    
    try {
        const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false })
        const expiresAt = new Date(Date.now() + 5 * 60000);
        const { schoolName, email, address, schoolUrl ,password, phoneNumber, confirmPassword } = req.body
        
        if (password !== confirmPassword) {
     return res.status(400).json({
         message: 'password does not match'
     });
 }
 
 const existingUser = await adminModel.findOne({ schoolName });
 if (existingUser) {
     if (existingUser.isVerified) {
         return res.status(409).json({ 
             message: 'school name already taken' 
         });
     }
     await existingUser.deleteOne();
 }
 
 const existingNumber = await adminModel.findOne({ phoneNumber });
 if (existingNumber) {
     if (existingNumber.isVerified) {
         return res.status(409).json({
             message: 'phone number already exists'
         });
     }
     await existingNumber.deleteOne();
 }
 
 const checkSchoolUrl = await adminModel.findOne({ schoolUrl });
 if (checkSchoolUrl) {
     return res.status(409).json({
         message: 'school url already exists',
     });
 }
 
 const existingEmail = await adminModel.findOne({ email });
 if (existingEmail) {
     if (existingEmail.isVerified) {
         return res.status(409).json({ 
             message: 'email already in use' 
         });
     }
     await existingEmail.deleteOne();
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
            adminId: users._id,
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
        const user = await adminModel.findOne({email, schoolUrl:schooldomain})

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

        await walletModel.create({
            adminId: user._id,
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
    const user = await adminModel.findOne({ email, schoolUrl: schooldomain })
    
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
    const user = await adminModel.findOne({ email, schoolUrl: schooldomain })

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
        const user = await adminModel.findOne({email})

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
        const user = await adminModel.findOne({ email, schoolUrl: schooldomain })

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

        user.password = hashedPassword;
        await user.save();

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
         user = await adminModel.findOne({ email: email.trim().toLowerCase() , schoolUrl: schooldomain})
        }else if (role == "staff"){
                user = await staff.findOne({ email: email.trim().toLowerCase() , schoolUrl: schooldomain})
 
        } else {
              user = await parent.findOne({ email , schoolUrl: schooldomain})

        };

        if (!user) {
            return next({
                message: 'invalid credentials',
                statusCode: 404
            })
        };
        
        if(user.role !== role){
            return res.status(403).json({
                message: 'You are not '+ role
            })
        }
        if(user.isVerified !== true){
            return res.status(401).json({
                message: 'unauthorized, please verify your account'
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
            id: user._id, email: user.email, role: user.role
        },
            process.env.JWT_SECRET_LOGIN,
            { expiresIn: '1 day' });


            redisClient.del(`user: ${user.id}`)
            redisClient.set(`user: ${user.id}`, token, {EX: 86400})

            const adminProfile = await profileModel.findOne({ adminId: user.id , schoolUrl: schooldomain})
            const schoolUrl = user.schoolUrl
        //     const data = {
        //         id: user.id,
        //         schoolName: user.schoolName,
        //         name: adminProfile?.firstName 
        //             ? `${adminProfile.firstName} ${adminProfile.lastName}` 
        //             : `${user.firstName} ${user.lastName}`,
        //         email: user.email,
        //         address: user.address,
        //         phoneNumber: user.phoneNumber || null,
        //         role: user.role,
        //         staffType: user.staffType || null,
        //         isVerified: user.isVerified
        // }
        res.status(200).json({
            message: 'login successfully',
            user,
            token
        })

    } catch (error) {
        next(error)
    }
};

exports.getAdmin = async(req, res, next)=>{
    try {
        const {id} = req.user
        const admin = await adminModel.findById(id)

        const data = {
            id: admin._id,
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
        const { role, id } = req.user;

        // let user;
        // if (user)
        const admin = await adminModel.findById(id).select('-password');
        if (!admin) {
            return res.status(404).json({ 
                message: 'admin not found' 
            });
        }

        const adminProfile = await profileModel.findOne({ adminId: id, schoolUrl: admin.schoolUrl });
        
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
        const admin = await adminModel.findById(id);

        if (!admin) {
            return res.status(403).json({ message: 'Admin not found' });
        }

        const getClassDetails = await classModel.find({ schoolUrl: admin.schoolUrl });

        // if (!getClassDetails.length) {
        //     return res.status(404).json({ message: 'No classes found' });
        // }

        const classData = await Promise.all(
            getClassDetails.map(async (classes) => {
                const totalStudents = await studentModel.countDocuments({
                        schoolUrl: admin.schoolUrl,
                        studentClass: classes.className 
                    });

                return {
                    classId: classes._id,
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
            term, academicSession,
            oldPassword, newPassword, confirmPassword, phoneNumber,
            adminFirstName, adminLastName,
            continuousAssessmentConfig, examConfig, total
        } = req.body;

        const admin = await adminModel.findById(id);
        if (!admin) return res.status(404).json({ message: 'admin not found' });

        let adminProfile = await profileModel.findOne({ adminId: id, schoolUrl: admin.schoolUrl });
        if (!adminProfile) adminProfile = await profileModel.create({ 
            adminId: id, 
            schoolUrl: admin.schoolUrl 
        });

        const adminUpdates = { phoneNumber };

        if (newPassword) {
            const passwordCorrect = await bcrypt.compare(oldPassword, admin.password);
            if (!passwordCorrect) return next({ message: 'incorrect password', statusCode: 400 });
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ 
                    message: 'password does not match' 
                });
            }
            const salt = await bcrypt.genSalt(10);
            adminUpdates.password = await bcrypt.hash(newPassword, salt);
        }


        const profileUpdates = { term, academicSession,
            adminFirstName, adminLastName,
            continuousAssessmentConfig, examConfig, total
        };

        
        if (req.files?.profilePic?.[0]) {
            const file = req.files.profilePic[0];
            const result = await cloudinary.uploader.upload(file.path);
            fs.unlinkSync(file.path);
            profileUpdates.adminUrl = result.secure_url;
            profileUpdates.adminPublicId = result.public_id;
        }

        if (req.files?.schoolLogo?.[0]) {
            const file = req.files.schoolLogo[0];
            const result = await cloudinary.uploader.upload(file.path);
            fs.unlinkSync(file.path);
            profileUpdates.schoolLogoUrl = result.secure_url;
            profileUpdates.schoolLogoPublicId = result.public_id;
        }
        if (req.files?.schoolSignature?.[0]) {
            const file = req.files.schoolSignature[0];
            const result = await cloudinary.uploader.upload(file.path);
            fs.unlinkSync(file.path);
            profileUpdates.schoolSignatureUrl = result.secure_url;
            profileUpdates.schoolSignaturePublicId = result.public_id;
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

        Object.assign(admin, adminUpdates);
        Object.assign(adminProfile, profileUpdates);
        await admin.save();
        await adminProfile.save();

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
        const wallet = await walletModel
            .findOne({ adminId: id })
            .select('paymentReceived withdrawal balance totalTransaction')

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
        const { id } = req.user;
        const admin = await adminModel.findById(id);

        if (!admin) {
            return res.status(404).json({
                message: 'admin not found'
            });
        }

        const adminProfile = await profileModel.findOne({ adminId: id, schoolUrl: admin.schoolUrl });

        const {
            classSection,
            paymentStatus,
            term,
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

        const currentTerm = term || adminProfile?.currentTerm || 'Not set';

        const studentWhere = { adminId: id };
        if (classSection && classSection !== 'All Classes') {
            studentWhere.studentClass = classSection;
        }
        if (paymentStatus && paymentStatus !== 'All Status') {
            studentWhere.paymentStatus = paymentStatus;
        }

        const totalStudents = await studentModel.countDocuments({ adminId: id });
        const totalStaff = await staff.countDocuments({ adminId: id });
        const studentsThisWeek = await studentModel.countDocuments({
            adminId: id,
            createdAt: { $gte: getStartOfDay(thisWeekStart), $lte: getEndOfDay(now) }
        });
        const studentsPreviousWeek = await studentModel.countDocuments({
            adminId: id,
            createdAt: { $gte: getStartOfDay(previousWeekStart), $lte: getEndOfDay(thisWeekStart) }
        });
        const staffThisWeek = await staff.countDocuments({
            adminId: id,
            createdAt: { $gte: getStartOfDay(thisWeekStart), $lte: getEndOfDay(now) }
        });
        const staffPreviousWeek = await staff.countDocuments({
            adminId: id,
            createdAt: { $gte: getStartOfDay(previousWeekStart), $lte: getEndOfDay(thisWeekStart) }
        });

        const adminStudentIds = await studentModel.find({ adminId: id }).distinct('_id');
        const presentStudents = await studentAttendanceModel.countDocuments({
            studentId: { $in: adminStudentIds },
            status: 'present',
            date: today
        });

        const presentStaff = await staffAttendanceModel.countDocuments({ adminId: id, status: 'present', date: today });

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
        const presentStudentsYesterday = await studentAttendanceModel.countDocuments({
            studentId: { $in: adminStudentIds },
            status: 'present',
            date: yesterdayDate
        });
        const presentStaffYesterday = await staffAttendanceModel.countDocuments({ adminId: id, status: 'present', date: yesterdayDate });
        const attendanceRateYesterday = totalPeople
            ? Number((((presentStudentsYesterday + presentStaffYesterday) / totalPeople) * 100).toFixed(2))
            : 0;

        const [totalFeesCollectedAgg] = await paymentModel.aggregate([
            { $match: { adminId: admin._id, paymentStatus: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalFeesCollectedRaw = totalFeesCollectedAgg?.total || 0;
        const totalFeesCollected = Number(totalFeesCollectedRaw || 0);
        const [feesCollectedThisWeekAgg] = await paymentModel.aggregate([
            {
                $match: {
                    adminId: admin._id,
                    paymentStatus: 'success',
                    paymentDate: { $gte: getStartOfDay(thisWeekStart), $lte: getEndOfDay(now) }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const [feesCollectedPreviousWeekAgg] = await paymentModel.aggregate([
            {
                $match: {
                    adminId: admin._id,
                    paymentStatus: 'success',
                    paymentDate: { $gte: getStartOfDay(previousWeekStart), $lte: getEndOfDay(thisWeekStart) }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const feesCollectedThisWeekRaw = feesCollectedThisWeekAgg?.total || 0;
        const feesCollectedPreviousWeekRaw = feesCollectedPreviousWeekAgg?.total || 0;
        const expectedFeesRaw = await studentModel
            .find({ adminId: id })
            .populate('classId', 'amount')
            .select('classId');
        const totalExpectedFees = expectedFeesRaw.reduce((sum, student) => {
            return sum + toNumber(student.classId?.amount);
        }, 0);
        const feesCollectedPercent = totalExpectedFees
            ? Number(((totalFeesCollected / totalExpectedFees) * 100).toFixed(2))
            : 0;

        const [filteredStudents, filteredTotal] = await Promise.all([
            studentModel
                .find(studentWhere)
                .populate('classId', 'className amount')
                .select('firstName lastName studentClass paymentStatus classId')
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(safeLimit),
            studentModel.countDocuments(studentWhere)
        ]);

        const studentIds = filteredStudents.map((student) => student.id);
        const paymentRows = studentIds.length
            ? await paymentModel
                .find({ adminId: id, studentId: { $in: studentIds } })
                .select('studentId amount paymentType paymentStatus reference currency paymentDate')
                .sort({ paymentDate: -1 })
            : [];

        const paymentsByStudent = paymentRows.reduce((groups, payment) => {
            if (!groups[payment.studentId]) {
                groups[payment.studentId] = [];
            }
            groups[payment.studentId].push(payment);
            return groups;
        }, {});

        const feeRecords = filteredStudents.map((student) => {
            const payments = paymentsByStudent[student._id] || [];
            const paidPayments = payments.filter((payment) => payment.paymentStatus === 'success');
            const amountPaid = paidPayments.reduce((sum, payment) => sum + toNumber(payment.amount), 0);
            const totalAmount = toNumber(student.classId?.amount);
            const latestPayment = payments[0] || null;
            const computedStatus = amountPaid >= totalAmount && totalAmount > 0
                ? 'full payment'
                : amountPaid > 0
                    ? 'part payment'
                    : student.paymentStatus;

            return {
                studentId: student._id,
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
                currentTerm,
                filters: {
                    classSection: classSection || 'All Classes',
                    paymentStatus: paymentStatus || 'All Status',
                    term: currentTerm
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
// exports.getAllfees = async (req, res, next) =>{
//     try {
        
//     } catch (error) {
        
//     }
// }

exports.getAllStaffAttendance = async (req, res, next) => {
  try {
    const schooldomain = req.headers["x-tenant"]
        if(!schooldomain){
            return res.status(404).json({
                message: 'invalid school domain'
            })
        }
    const today = new Date().toISOString().split('T')[0]
    
    const Attendance = await staffAttendanceModel
      .find({
        date: today,
        staffId: { $ne: null },
        schoolUrl: schooldomain
      })
      .sort({ timeCheckedIn: 1 })

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
        const {id} =req.user
        const users = await adminModel.findById(id)
        const adminName = users ? await adminModel.find({ firstName: users.firstName }) : []
    } catch (error) {
        next(error)
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
};

exports.getAllSchoolsUrl = async (req, res, next) => {
  try {
    const schooldomain = req.headers["x-tenant"];

    const school = await adminModel.findOne({ schoolUrl: schooldomain });

    if (school) {
      return res.status(200).json({
        status: "checked",
        exists: true,
      });
    }

    return res.status(200).json({
      status: "unchecked",
      exists: false,
    });
  } catch (error) {
    next(error);
  }
};
