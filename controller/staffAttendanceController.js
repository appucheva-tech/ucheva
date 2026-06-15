const crypto = require('crypto')
const QRCode = require('qrcode')
const StaffAttendanceModel = require('../models/staffattendance')
const staffModel = require('../models/staff')

exports.generateQRCode = async(req,res,next)=>{

    try{
        const {id} = req.user
        const today = new Date()
        const date = today.toISOString().split('T')[0]

        const existingQR = await StaffAttendanceModel.findOne({
            where:{
                date,
                status:'active'
            }
        })
        if(existingQR){
            return res.status(409).json({
                message:'QR already generated for today'
            })
        }

        const qrToken = crypto.randomBytes(32).toString('hex')

        const expiresAt = new Date()

        expiresAt.setHours(23,59,59,999)

        const qr = await StaffAttendanceModel.create({
            qrToken,
            date,
            expiresAt
        })
        const qrImage = await QRCode.toDataURL(
            JSON.stringify({
                qrToken
            })
        )
        res.status(201).json({
            message:'QR Generated',
            qr,
            qrImage
        })
    }
    catch(error){
        next(error)
    }
}

exports.checkInStaff = async(req,res,next)=>{
    try{
        const {id} = req.user
        const {qrToken} = req.body
        const staff = await staffModel.findByPk(Id)
        if(!staff){
            return res.status(404).json({
                message:'Staff not found'
            })
        }
        const today = new Date().toISOString().split('T')[0]
        const qr = await qrCodeAttendanceModel.findOne({
            where:{
                qrToken,
                date:today,
                status:'active',
                expiresAt:{
                    [Op.gt]: new Date()
                }
            }
        })
        if(!qr){
            return res.status(400).json({
                message:'Invalid or expired QR'
            })
        }
        const attendance = await attendanceModel.findOne({
            where:{
                Id:staffId,
                date:today
            }
        })
        if(attendance){
            return res.status(409).json({
                message:'Already checked in'
            })
        }
        const record = await attendanceModel.create({
            staffId,
            qrCodeId:qr.id,
            date:today,
            timeCheckedIn:new Date(),
            status:'Present'
        })
        res.status(201).json({
            message:'Check In Successful',
            record
        })
    }
    catch(error){
        next(error)
    }
}

exports.checkOutStaff = async(req,res,next)=>{
    try{
        const {staffId} = req.params
        const {qrToken } = req.body
        const today = new Date().toISOString().split('T')[0]
        const qr = await qrCodeAttendanceModel.findOne({
            where:{
                qrToken,
                date:today,
                status:'active',
                expiresAt:{
                    [Op.gt]:new Date()
                }
            }
        })
        if(!qr){
            return res.status(400).json({
                message:'Invalid or expired QR'
            })
        }
        const attendance = await attendanceModel.findOne({
            where:{
                staffId,
                date:today
            }
        })
        if(!attendance){
            return res.status(404).json({
                message:'No check in found'
            })
        }
        if(attendance.timeCheckedOut){
            return res.status(409).json({
                message:'Already checked out'
            })
        }
        attendance.timeCheckedOut = new Date()
        await attendance.save()
        res.status(200).json({
            message:'Check Out Successful',
            attendance
        })
    }
    catch(error){
        next(error)
    }
}