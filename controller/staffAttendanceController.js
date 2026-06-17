const crypto = require('crypto')
const QRCode = require('qrcode')
const StaffAttendanceModel = require('../models/staffattendance')
const staffModel = require('../models/staff')
const { Op } = require('sequelize')

exports.generateQRCode = async (req, res, next) => {
  try {
    const { id } = req.user
    const today = new Date()
    const date = today.toISOString().split('T')[0]

    const existingQR = await StaffAttendanceModel.findOne({
      where: {
        date,
        status: 'active'
      }
    })

    if (existingQR) {
      return res.status(409).json({
        message: 'QR already generated for today'
      })
    }

    const qrToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(23, 59, 59, 999)

    const qr = await StaffAttendanceModel.create({
      adminId: id,
      qrToken,
      date,
      expiresAt,
      status: 'active'
    })

    const qrImage = await QRCode.toDataURL(JSON.stringify({ qrToken }))

    res.status(201).json({
      message: 'QR Generated',
      qr,
      qrImage
    })
  } catch (error) {
    next(error)
  }
}

exports.checkInStaff = async (req, res, next) => {
  try {
    const { id: staffId } = req.user
    const { qrToken } = req.body

    const staff = await staffModel.findByPk(staffId)
    if (!staff) {
      return res.status(404).json({
        message: 'Staff not found'
      })
    }

    const today = new Date().toISOString().split('T')[0]
    const qr = await StaffAttendanceModel.findOne({
      where: {
        qrToken,
        date: today,
        status: 'active',
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    })

    if (!qr) {
      return res.status(400).json({
        message: 'Invalid or expired QR'
      })
    }

    const existingAttendance = await StaffAttendanceModel.findOne({
      where: {
        staffId,
        date: today
      }
    })

    if (existingAttendance) {
      return res.status(409).json({
        message: 'Already checked in'
      })
    }

    const record = await StaffAttendanceModel.create({
      staffId,
      qrCodeId: qr.id,
      date: today,
      timeCheckedIn: new Date(),
      staffName: `${staff.firstName} ${staff.lastName}`,
      staffRole: staff.role,
      status: 'Present'
    })

    res.status(201).json({
      message: 'Check In Successful',
      record
    })
  } catch (error) {
    next(error)
  }
}

exports.checkOutStaff = async (req, res, next) => {
  try {
    const { id: staffId } = req.user
    const { qrToken } = req.body

    const today = new Date().toISOString().split('T')[0]
    const qr = await StaffAttendanceModel.findOne({
      where: {
        qrToken,
        date: today,
        status: 'active',
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    })

    if (!qr) {
      return res.status(400).json({
        message: 'Invalid or expired QR'
      })
    }

    const attendance = await StaffAttendanceModel.findOne({
      where: {
        staffId,
        date: today
      }
    })

    if (!attendance) {
      return res.status(404).json({
        message: 'No check in found'
      })
    }

    if (attendance.timeCheckedOut) {
      return res.status(409).json({
        message: 'Already checked out'
      })
    }

    attendance.timeCheckedOut = new Date()
    await attendance.save()

    res.status(200).json({
      message: 'Check Out Successful',
      attendance
    })
  } catch (error) {
    next(error)
  }
}
exports.getAllStaffAttendance = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const Attendance = await StaffAttendanceModel.findAll({
      where: {
        date: today,
      },
      order: [['timeCheckedIn', 'ASC']]
    })

    if (Attendance.length === 0) {
      return res.status(404).json({
        message: 'No attendance records found for today'
      })
    }

    res.status(200).json({
      message: 'Today\'s staff attendance retrieved successfully',
      Attendance
    })
  } catch (error) {
    next(error)
  }
}
