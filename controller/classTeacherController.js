const classModel = require('../models/schoolclass');
const staffModel = require('../models/staff');
const studentModel = require('../models/student');
const paymentModel = require('../models/payment')
const studentAttendance = require('../models/studentattendance');

exports.markAttendance = async(req, res, next) =>{
    try {
        const {id} = req.user
        const {studentId, status} = req.body

        const fetchTeacher = await staffModel.findByPk(id)

        if(!fetchTeacher){
            return next({
                message: 'teacher not found',
                statusCode: 404
            })
        };

        const fetchClass = await classModel.findOne({where: {staffId: id}})

        if(fetchTeacher.classAssigned !== fetchClass.className){
            return res.status(403).json({
                message: 'unauthorized access'
            })
        }

        const getClassStudents = await studentModel.findAll({
            where: {studentClass: fetchTeacher.classAssigned}
        })
        const fetchStudent = await studentModel.findByPk(studentId)


        if(!fetchStudent){
            return next({
                message: 'student not found',
                statusCode: 404
            })
        }

        if(fetchStudent.studentClass !== fetchClass.className){
            return res.status(404).json({
                message: 'Student does not belong to this class'
            })
        };

        const attendance = []
        
        attendance.push({
            staffId: id,
            studentId,
            classTeacher: `${fetchTeacher.firstName} ${fetchTeacher.lastName}`,
            studentClass: fetchStudent.studentClass,
            studentName: `${fetchStudent.firstName} ${fetchStudent.lastName}`,
            date: new Date(Date.now()),
            status
        })
            
        const fullAttendance = await studentAttendance.bulkCreate(attendance)

        res.status(201).json({
            message: 'Attendance marked successfully',
            attendance: fullAttendance
        })
    } catch (error) {
        next(error)
    }
};