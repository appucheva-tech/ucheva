const classModel = require('../models/schoolclass');
const staffModel = require('../models/staff');
const studentModel = require('../models/student');
const paymentModel = require('../models/payment')
const studentAttendance = require('../models/studentattendance');
const announcement = require('../models/announcement')

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

    const dashboard = {
        myAttendance: teacher.attendanceStatus,
        assignedClass: teacher.classAssigned,
        
    }



    const myClass = {
        myClass: teacher.classAssigned,
        totalStudents: students,
        totalFemale: femaleStudents,
        totalMale: maleStudents,
        presentStudent: studentsPresent
    }

    res.status(200).json({
        myClass,
        getAllStudents,
        getAnnouncement
    })

} catch (error) {
    next (error)
}
    }

