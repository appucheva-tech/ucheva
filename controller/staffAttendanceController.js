const crypto = require('crypto')
const QRCode = require('qrcode')
const StaffAttendanceModel = require('../models/staffattendance')
const staffModel = require('../models/staff')
const adminModel = require('../models/admin')
const qrModel = require('../models/qrcode')
const { Op } = require('sequelize')
const dayjs = require("dayjs");





const StaffQRCodeModel = require("../models/qrcode");

exports.generateQRCode = async (req, res, next) => {

    try {

        const { id } = req.user;

        const schoolUrl = req.headers["x-tenant"];

        const today = dayjs().format("YYYY-MM-DD");

        const existingQR = await StaffQRCodeModel.findOne({

            where: {

                schoolUrl,

                date: today,

                status: "active"

            }

        });

        // if (existingQR) {

        //     return res.status(409).json({

        //         message: "QR already generated today"

        //     });

        // }

        const qrToken = crypto.randomBytes(32).toString("hex");

        const expiresAt = dayjs()

            .endOf("day")

            .toDate();

        const qr = await StaffQRCodeModel.create({

            adminId: id,

            schoolUrl,

            qrToken,

            date: today,

            expiresAt,

            status: "active"

        });

       const link = `https://${schoolUrl}.${process.env.FRONTEND_URL}/attendance/${qrToken}`

        const qrImage = await QRCode.toDataURL(link);

        return res.status(201).json({

            message: "QR Generated",

            qr,

            qrImage,

            link

        });

    }

    catch(error){

        next(error);

    }

};

exports.scanAttendance = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { token, latitude, longitude } = req.body;
        const schoolUrl = req.headers["x-tenant"];
      console.log('10 COMMANDMENTS')
        const staff = await staffModel.findOne({ where: { id, schoolUrl: schoolUrl } });
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }

        const today = dayjs().format("YYYY-MM-DD");
        console.log('1: THOU SHALL LOVE THY SELF')
        const qr = await StaffQRCodeModel.findOne({
            where: {
                qrToken: token,
                schoolUrl: staff.schoolUrl,
                date: today,
                status: "active",
                expiresAt: { [Op.gt]: dayjs().toDate() }
            }
        });

        if (!qr) {
            return res.status(400).json({ 
              message: "QR expired or invalid" 
            });
        }

        let attendance = await StaffAttendanceModel.findOne({
            where: { staffId: id, date: today }
        });

        const currentHour = dayjs().hour();

        // MORNING — Check In
        if (currentHour < 12) {
            if (attendance) {
                return res.status(409).json({ message: "Already checked in" });
            }

            console.log('2: THOU SHALL NOT STEAL')
            attendance = await StaffAttendanceModel.create({
                staffId: id,
                adminId: staff.adminId,
                qrToken: token,
                schoolUrl: staff.schoolUrl,
                date: today,
                staffName: `${staff.firstName} ${staff.lastName}`,
                staffRole: staff.staffType,
                timeCheckedIn: dayjs().toDate(),
                latitude,
                longitude,
                status: "Present",
            });
            console.log('3: THOU SHALL NOT LIE')
            return res.status(201).json({ message: "Checked In", attendance });
        }

        // AFTERNOON — Check Out
        // if (!attendance) {
        //     return res.status(404).json({ message: "Please check in first" });
        // }

        if (attendance.timeCheckedOut) {
            return res.status(409).json({ message: "Already checked out" });
        }

        attendance.timeCheckedOut = dayjs().toDate();
        attendance.latitude = latitude;
        attendance.longitude = longitude;
        await attendance.save();
        console.log('4: THOU SHALL WORSHIP THY LORD GOD')
        return res.status(200).json({ message: "Checked Out", attendance });

    } catch (error) {
        next(error);
    }
};

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
    const qr = await qrModel.findOne({
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
};

exports.getAllTodayStaffAttendance = async (req, res, next) => {
  try {
    const {id} = req.user
    const admin = await adminModel.findByPk(id)
    const schooldomain = req.headers["x-tenant"]
        if(!schooldomain){
            return res.status(404).json({
                message: 'invalid school domain'
            })
        }
    const today = new Date().toISOString().split('T')[0]
    const Attendance = await StaffAttendanceModel.findAll({
      where: {
        date: today,
        schoolUrl: admin.schoolUrl
      },
      order: [['timeCheckedIn', 'ASC']]
    })

    // if (Attendance.length === 0) {
    //   return res.status(404).json({
    //     message: 'No attendance records found for today'
    //   })
    // }

    res.status(200).json({
      message: 'Today\'s staff attendance retrieved successfully',
      Attendance
    })
  } catch (error) {
    next(error)
  }
}

exports.getAllStaffAttendance = async (req, res, next) => {
  try {
    const schooldomain = req.headers["x-tenant"]
        if(!schooldomain){
            return res.status(404).json({
                message: 'invalid school domain'
            })
        }
    const today = new Date().toISOString().split('T')[0]

    const Attendance = await StaffAttendanceModel.findAll({
      where: {
        date: today,
        staffId: {
          [Op.not]: null
        },
        schoolUrl: schooldomain
      },
      order: [['timeCheckedIn', 'ASC']]
    })

    // if (Attendance.length === 0) {
    //   return res.status(404).json({
    //     message: 'No attendance records found for today'
    //   })
    // }

    res.status(200).json({
      message: 'Staff attendance retrieved successfully',
      Attendance
    })
  } catch (error) {
    next(error)
  }
}

