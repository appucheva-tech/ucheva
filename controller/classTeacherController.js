const classModel = require('../models/schoolclass');
const staffModel = require('../models/staff');
const studentModel = require('../models/student');
const paymentModel = require('../models/payment')
const attendanceModel = require('../models/attendance');

exports.markAttendance = async(req, res, next) =>{
    try {
        const {id} = req.user
        const studentId = req.params.id
        const {status} = req.body

        const fetchTeacher = await staffModel.findByPk(id)

        if(!fetchTeacher){
            return next({
                message: 'teacher not found',
                statusCode: 404
            })
        };

        const fetchClass = await classModel.findOne({where: {staffId: id}})

        if(!fetchClass){
            return next({
                message: 'class not found',
                statusCode: 404
            })
        }
        const fetchStudent = await studentModel.findByPk(studentId)

        if(!fetchStudent){
            return next({
                message: 'student not found',
                statusCode: 404
            })
        }

        if(fetchTeacher.classAssigned !== fetchClass.className){
            return res.status(403).json({
                message: 'unauthorized access'
            })
        }
        if(fetchStudent.studentClass !== fetchClass.className){
            return res.status(404).json({
                message: 'Student does not belong to this class'
            })
        };

        const attendance = []
        
        attendance.push({
            adminId: fetchTeacher.adminId,
            staffId: id,
            studentId: studentId,
            classId: fetchClass.id,
            classTeacher: fetchClass.assignTeacher,
            studentClass: fetchStudent.studentClass,
            studentName: `${fetchStudent.firstName}${fetchStudent.lastName}`,
            date: new Date(Date.now()),
            status
        })
            
        const fullAttendance = await attendanceModel.bulkCreate(attendance)

        res.status(201).json({
            message: 'Attendance marked successfully',
            attendance: newAttendance
        })
    } catch (error) {
        next(error)
    }
};