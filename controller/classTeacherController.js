const classModel = require('../models/schoolclass');
const staffModel = require('../models/staff');
const studentModel = require('../models/student');
const paymentModel = require('../models/payment')
const studentAttendance = require('../models/studentattendance');
const announcement = require('../models/announcement')

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

    exports.classTeacherDashboard = async(req, res, next)=>{
try {
    const {id} = req.user
    const teacher = await staffModel.findByPk(id);
    const classes = await classModel.findOne({where: {staffId: id}})
    const students = await studentModel.count({ where: {classId: classes.id}})
    const maleStudents = await studentModel.count({ where: {classId: classes.id, gender:'male'}})
    const femaleStudents = await studentModel.count({ where: {classId: classes.id, gender: 'female'}})
    const studentsPresent = await studentModel.count({ where: {classId: classes.id, attendanceStatus: 'present'}})
    const getAllStudents = await studentModel.findAll({where: {classId: classes.id},  attributes: ['id', 'firstName', 'lastName', 'gender','admissionNumber', 'attendanceStatus']})
    const getAnnouncement = await announcement.findAll({ attributes: ['id', 'announcementTitle', 'announcementContent'] }) 

    const data = {
        myClass: teacher.classAssigned,
        totalStudents: students,
        totalFemale: femaleStudents,
        totalMale: maleStudents,
        presentStudent: studentsPresent
    }

    res.status(200).json({
        data: data,
        getAllStudents,
        getAnnouncement
    })




} catch (error) {
    next (error)
}
    }

