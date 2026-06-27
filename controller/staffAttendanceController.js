const crypto = require('crypto')
const QRCode = require('qrcode')
const StaffAttendanceModel = require('../models/staffattendance')
const staffModel = require('../models/staff')
const adminModel = require('../models/admin')
const qrModel = require('../models/qrcode')
const { Op } = require('sequelize')
const dayjs = require("dayjs");



const reverseGeocode = require('../utils/reverseGeoCode'); // adjust path to wherever you save it
const StaffQRCodeModel = require("../models/qrcode");
const staff = require('../models/staff')

exports.generateQRCode = async (req, res, next) => {
    try {
        const { id } = req.user;
        const schoolUrl = req.headers["x-tenant"];
        const { latitude, longitude } = req.body; // sent from frontend

        const today = dayjs().format("YYYY-MM-DD");

        const qrToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = dayjs().endOf("day").toDate();

        const qr = await StaffQRCodeModel.create({
            adminId: id,
            schoolUrl,
            qrToken,
            date: today,
            expiresAt,
            status: "active",
            latitude: latitude ,
            longitude: longitude 
        });

        const link = `https://${schoolUrl}.${process.env.FRONTEND_URL}/attendance/${qrToken}`;
        const qrImage = await QRCode.toDataURL(link);

        return res.status(201).json({
            message: "QR Generated",
            qr,
            qrImage,
            link,
            latitude: latitude ,
            longitude:longitude
        });
    } catch (error) {
        next(error);
    }
};


exports.scanAttendance = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { token, latitude, longitude } = req.body;
        const schoolUrl = req.headers["x-tenant"];
        const staff = await staffModel.findOne({ where: { id, schoolUrl: schoolUrl } });
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }

        const today = dayjs().format("YYYY-MM-DD");
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
            return res.status(400).json({ message: "QR expired or invalid" });
        }

        const address = await reverseGeocode(latitude, longitude);

        let attendance = await StaffAttendanceModel.findOne({
            where: { staffId: id, date: today }
        });

        const currentHour = dayjs().hour();

        if (currentHour < 12) {
            if (attendance) {
                return res.status(409).json({ message: "Already checked in" });
            }

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
                address,
                status: "Present",
            });

            return res.status(201).json({ message: "Checked In", attendance, address });
        }

        if (!attendance) {
            return res.status(404).json({ message: "Please check in first" });
        }

        if (attendance.timeCheckedOut) {
            return res.status(409).json({ message: "Already checked out" });
        }

        attendance.timeCheckedOut = dayjs().toDate();
        attendance.latitude = latitude;
        attendance.longitude = longitude;
        attendance.address = address;
        await attendance.save();

        return res.status(200).json({ message: "Checked Out", attendance, address });

    } catch (error) {
        next(error);
    }
};

// exports.checkInStaff = async (req, res, next) => {
//   try {
//     const { id: staffId } = req.user
//     const { qrToken, address } = req.body
//     const schoolUrl = req.headers['x-tenant']

//     const staff = await staffModel.findOne({ where: { id: staffId, schoolUrl } })
//     if (!staff) {
//       return res.status(404).json({ message: 'Staff not found' })
//     }

//     const today = new Date().toISOString().split('T')[0]
//     const qr = await qrModel.findOne({
//       where: {
//         qrToken,
//         schoolUrl,
//         date: today,
//         status: 'active',
//         expiresAt: { [Op.gt]: new Date() }
//       }
//     })

//     if (!qr) {
//       return res.status(400).json({ message: 'Invalid or expired QR' })
//     }

//     const existingAttendance = await StaffAttendanceModel.findOne({
//       where: { staffId, date: today }
//     })

//     if (existingAttendance) {
//       return res.status(409).json({ message: 'Already checked in' })
//     }

//     const record = await StaffAttendanceModel.create({
//       staffId,
//       adminId: staff.adminId,
//       qrToken,
//       schoolUrl,
//       date: today,
//       staffName: `${staff.firstName} ${staff.lastName}`,
//       staffRole: staff.staffType,
//       timeCheckedIn: new Date(),
//       latitude,
//       longitude,
//       status: 'Present'
//     })

//     res.status(201).json({
//       message: 'Check In Successful',
//       record
//     })
//   } catch (error) {
//     next(error)
//   }
// }

exports.checkOutStaff = async (req, res, next) => {
  try {
    const { id: staffId } = req.user
    const { qrToken, address } = req.body
    const schoolUrl = req.headers['x-tenant']

    const staff = await staffModel.findOne({ where: { id: staffId, schoolUrl } })
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' })
    }

    const today = new Date().toISOString().split('T')[0]
    const qr = await qrModel.findOne({
      where: {
        qrToken,
        schoolUrl,
        date: today,
        status: 'active',
        expiresAt: { [Op.gt]: new Date() }
      }
    })

    if (!qr) {
      return res.status(400).json({ message: 'Invalid or expired QR' })
    }

    const attendance = await StaffAttendanceModel.findOne({
      where: { staffId, date: today }
    })

    if (!attendance) {
      return res.status(404).json({ message: 'No check in found' })
    }

    if (attendance.timeCheckedOut) {
      return res.status(409).json({ message: 'Already checked out' })
    }

    attendance.timeCheckedOut = new Date()
    attendance.latitude = latitude
    attendance.longitude = longitude
    await attendance.save()

    res.status(200).json({
      message: 'Check Out Successful',
      attendance
    })
  } catch (error) {
    next(error)
  }
}

exports.getAllTodayStaffAttendance = async (req, res, next) => {
  try {
    const { id } = req.user
    const admin = await adminModel.findByPk(id)
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' })
    }

    const schooldomain = req.headers['x-tenant']
    if (!schooldomain) {
      return res.status(404).json({ message: 'invalid school domain' })
    }

    const today = new Date().toISOString().split('T')[0]

    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = 5
    const offset = (page - 1) * limit

    const { count, rows: Attendance } = await StaffAttendanceModel.findAndCountAll({
      where: {
        date: today,
        schoolUrl: admin.schoolUrl
      },
      order: [['timeCheckedIn', 'ASC']],
      limit,
      offset
    })

    res.status(200).json({
      message: "Today's staff attendance retrieved successfully",
      Attendance,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
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
     const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = 5
    const offset = (page - 1) * limit

    const Attendance = await StaffAttendanceModel.findAll({
      where: {
        date: today,
        staffId: {
          [Op.not]: null
        },
        limit,
       offset,
        schoolUrl: schooldomain
      },

      include:{
        model:staff,
        as:"staff",
        attributes:["name","role"]
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
      Attendance,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    next(error)
  }
}

