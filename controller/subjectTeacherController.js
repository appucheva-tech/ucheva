const classModel = require('../models/schoolclass');
const staffModel = require('../models/staff');
const studentModel = require('../models/student');
const paymentModel = require('../models/payment')
const studentAttendance = require('../models/studentattendance');
const announcement = require('../models/announcement');
const subject = require('../models/subject');
const cloudinary = require('cloudinary').v2
const bcrypt = require('bcrypt')
const fs = require('fs')

    exports.subjectTeacherDashboard = async(req, res, next)=>{
try {
    const {id} = req.user
    const teacher = await staffModel.findByPk(id);
    const classes = await classModel.findOne({where: {staffId: id}})
    const students = await studentModel.count({ where: {classId: classes.id}})
    const maleStudents = await studentModel.count({ where: {classId: classes.id, gender:'male'}})
    const femaleStudents = await studentModel.count({ where: {classId: classes.id, gender: 'female'}})
    const studentsPresent = await studentModel.count({ where: {classId: classes.id, attendanceStatus: 'present'}})
    const getAllStudents = await studentModel.findAll({ 
        where: {classId: classes.id},  
        attributes: ['id', 'firstName', 'lastName', 'gender','admissionNumber', 'attendanceStatus']})

    const getAnnouncement = await announcement.findAll({ attributes: ['id', 'announcementTitle', 'announcementContent'] }) 

    const teacherSubjects = teacher.subjectAssigned 
    const totalStudents = getAllStudents.filter(student =>
         student.subjectsOffered.some(subject => teacherSubjects.includes(subject))
    )
    const totalStudentsHandled = totalStudents.length

    const dashboard = {
        myAttendance: teacher.attendanceStatus,
        assignedClass: teacher.classAssigned,
        studentHandling: totalStudentsHandled,
        assignedSubject: teacherSubjects.length
    }

    res.status(200).json({
        dashboard,
        getAnnouncement
    })

} catch (error) {
    next (error)
}
    }

    
exports.subjectTeacherSettings = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { firstName, lastName, address } = req.body;

        const result = await cloudinary.uploader.upload(req.file.path)
                     if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
        
                if(!result){
                    return next({
                        message: 'Image upload failed',
                        statusCode: 500
                    })
                };

        const subjectTeacher = await staffModel.findByPk(id);
        if (!subjectTeacher) {
            return res.status(404).json({
                message: 'subject Teacher not found'
            });
        }

        // In-app password reset
        const { oldPassword, newPassword, confirmPassword } = req.body;

        const passwordCorrect = await bcrypt.compare(oldPassword, subjectTeacher.password)
                if (!passwordCorrect) {                    
                    return next({
                        message: 'incorrect password',
                        statusCode: 400
                    })
                }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: 'password does not match'
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)


        await subjectTeacher.update({
            firstName,
            lastName,
            address,
            password: hashedPassword,
            staffProfileUrl: result.secure_url,
            staffProfilePublicId: result.public_id
        });

            const subjectTeacherData ={
                id: subjectTeacher.id,
                firstName: subjectTeacher.firstName,
                lastName: subjectTeacher.lastName,
                address: subjectTeacher.address,
                staffProfileUrl: subjectTeacher.staffProfileUrl,
                staffProfilePublicId: subjectTeacher.staffProfilePublicId
            }

        res.json({
            message: 'subject Teacher updated successfully',
            subjectTeacherData
        });
    } catch (error) {
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }   
        next(error);
    }
};

