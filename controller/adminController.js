const adminModel = require('../models/admin')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const otpGenerator = require('otp-generator')
const { emailTemplate } = require('../utils/emailTemplate')
const { sendBrevoEmail } = require('../utils/brevo')
// const cloudinary = require('../config/cloudinary')
// const fs = require('fs')
const redisClient = require('../config/redis')


exports.register = async (req, res, next) => {
    
    try {
        const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false })
        const expiresAt = new Date(Date.now() + 2 * 60000);
        // const file = req.file;
        const { schoolName, email, address, password, phoneNumber, confirmPassword } = req.body
        // let result;

        // if (req.file) {
        //     console.log('req file', req.file)
        
        //     result = await cloudinary.uploader.upload(file.path)
        //     console.log('cloudinary result', result)
        //     fs.unlinkSync(file.path)
        // }
        const emailExists = await adminModel.findOne({ where: {email: email}})

        if (emailExists){
         return next({
            message: 'email already exists',
            statusCode: 400
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
            schoolUrl: `https://${schoolName.toLowerCase().trim().replace(' ', "-")}.ucheva.com`,
            email,
            address,
            phoneNumber,
            password: hashedPassword,
            otp: OTP,
            otpExpiresAt: expiresAt
            // photo: {
            //     url: result.secure_url,
            //     public_id: result.public_id
            // }
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
            data: data
        })

    } catch (error) {
        // fs.unlinkSync(file.path)
       next(error)
    }
};

exports.verifyEmail = async(req,res,next)=>{

    try {
        
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

        }

        user.isVerified = true
        user.otp = null
        user.otpExpiresAt = null

        await user.save()

        res.status(200).json({
            message: 'Verification successfully'
        })

    } catch (error) {
       next(error)
    }
};

exports.resendOTP = async(req,res,next)=>{
    const { email } = req.body;
    const user = await adminModel.findOne({where: {email}})
    
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
            message: 'OTP sent successfully'
        })

};


exports.forgotPassword = async(req,res,next)=>{
    const { email } = req.body;
    const user = await adminModel.findOne({where: {email}})

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
            message: 'OTP sent successfully'
        })
        
    };

    exports.verifyForgotPassword = async(req,res,next)=>{

    try {
        
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

        }

        user.isVerified = true
        user.otp = null
        user.otpExpiresAt = null
        user.passwordReset = true

        await user.save()

        res.status(200).json({
            message: 'Verification successfully'
        })

    } catch (error) {
       next(error)
    }
};
    exports.resetPassword = async(req,res,next)=>{

    try {
        
        const { email, newPassword, confirmPassword } = req.body;
        const user = await adminModel.findOne({where: {email}})

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
            newPassword: hashedPassword
        }

        const updatedPassword = await adminModel.update(pass, {where: {email}})

        res.status(200).json({
            message: 'Password Reset successfully',
            updatedPassword
        })

    } catch (error) {
       next(error)
    }
};

    
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const user = await adminModel.findOne({where: { email }})
        if (!user) {
            return next({
                message: 'user not found',
                statusCode: 404
            })
        };

            if(user.isVerified == false){
                return next({
            message: 'please verify your email', 
            statusCode: 400
          })

         }

        // check if account is locked due to many failed login attempts

        if( user.lockUntil > Date.now()) {
            return next({
                message: `Account locked until ${user.lockUntil}`,
                statusCode: 403
            })
        }

        const passwordCorrect = await bcrypt.compare(password, user.password)
        if (!passwordCorrect) {
            // increment login attempt and lock account if necessary

            user.loginAttempts += 1;
            if (user.loginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 2 * 60000);
                user.loginAttempts = 0
            }

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
            process.env.JWT_SECRET,
            { expiresIn: '1 day' })
            redisClient.del(`user: ${user.id}`)
            redisClient.set(`user: ${user.id}`, token, {EX: 86400})

            const data = {
            id: user.id,
            schoolName: user.schoolName,
            email: user.email
        }

        res.status(200).json({
            message: 'login successfully',
            data,
            token
        })

    } catch (error) {
        next(error)
    }
};

exports.logout = async(req, res, next)=>{
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
}