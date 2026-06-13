const classModel = require('../models/schoolclass');
const staffModel = require('../models/staff');
const studentModel = require('../models/student');
const paymentModel = require('../models/payment')
const studentAttendance = require('../models/studentattendance');

exports.markAttendance = async(req, res, next) =>{
    try {
    const { id } = req.user
    const { attendance } = req.body

    const fetchTeacher = await staffModel.findByPk(id)
    if (!fetchTeacher?.classAssigned) {
    return res.status(403).json({ 
        message: 'No class assigned to this teacher' 
     })
    };

    const classStudents = await studentModel.findAll({
        where: { studentClass: fetchTeacher.classAssigned },
        attributes: ['id', 'firstName', 'lastName', 'studentClass']
    })

    const studentMap = Object.fromEntries(classStudents.map(student => [String(student.id), student]))

    const attendanceRecords = attendance.map(({ studentId, status }) => ({
     staffId: id,
     studentId,
     classTeacher: `${fetchTeacher.firstName} ${fetchTeacher.lastName}`,
     studentClass: fetchTeacher.classAssigned,
     studentName: `${studentMap[String(studentId)].firstName} ${studentMap[String(studentId)].lastName}`,
     date: new Date(),
     status
    }))

    const fullAttendance = await studentAttendance.bulkCreate(attendanceRecords, { updateOnDuplicate: ['status'] })

    res.status(201).json({ 
     message: 'Attendance marked successfully', 
     attendance: fullAttendance 
    })
        } catch (error) {
         next(error)
        }
    };

