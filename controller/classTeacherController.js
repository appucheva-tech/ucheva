const classModel = require('../models/schoolclass');
const staffModel = require('../models/staff');
const studentModel = require('../models/student');
const paymentModel = require('../models/payment')
const studentAttendance = require('../models/studentattendance');
const cloudinary = require('cloudinary').v2
const bcrypt = require('bcrypt')
const fs = require('fs')


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

    const fullAttendance = await studentAttendance.bulkCreate(
        attendanceRecords, 
        { updateOnDuplicate: ['status'] 
            
        })

    res.status(201).json({ 
     message: 'Attendance marked successfully', 
     attendance: fullAttendance 
    })
        } catch (error) {
         next(error)
        }
    };

    exports.getAllStudents = async (req, res, next) => {
    try {
        const { id } = req.user;

        const teacher = await staffModel.findByPk(id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const getTeacherStudents = await studentModel.findAll({
            where: {
                studentClass: teacher.classAssigned,
                schoolUrl: teacher.schoolUrl
            }
        });

        const studentData = getTeacherStudents.map((student) => ({
            id: student.id,
            fullName: `${student.firstName} ${student.lastName}`,
            admissionNumber: student.admissionNumber,
            gender: student.gender,
            attendanceStatus: student.attendanceStatus,
            feeStatus: student.paymentStatus
        }));

        res.status(200).json({
            message: 'students retrieved',
            studentData
        });

    } catch (error) {
        next(error);
    }
};


    exports.getAllStudentsAttendance = async(req, res, next) =>{
        try {
            const schooldomain = req.headers["x-tenant"]
        if(!schooldomain){
            return res.status(404).json({
                message: 'invalid school domain'
            })
        }
            const { id } = req.user
            const teacher = await staffModel.findByPk(id)
            if (!teacher?.classAssigned) {
                return res.status(403).json({
                    message: 'No class assigned to this teacher'
                })
            }

            const today = new Date().toISOString().split('T')[0]
            const Attendance = await studentAttendance.findAll({
                where: {
                    classTeacher: `${teacher.firstName} ${teacher.lastName}`,
                    date: today,
                    schoolUrl: schooldomain
                },
                order: [['studentName', 'ASC']]
            })

            if (Attendance.length === 0) {
                return res.status(404).json({
                    message: 'No attendance records found for today'
                })
            }

            res.status(200).json({
                message: 'Today\'s student attendance retrieved successfully',
                Attendance
            })
        } catch (error) {
            next(error)
        }
    };

exports.classTeacherDashboard = async (req, res, next) => {
    try {
        const { id } = req.user;

        const teacher = await staffModel.findByPk(id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const classes = await classModel.findAll({ where: { staffId: id } });
        if (classes.length === 0) {
            return res.status(404).json({ message: 'No classes assigned to this teacher' });
        }

        const classIds = classes.map(c => c.id);

        const students = await studentModel.count({ where: { classId: classIds } });
        const maleStudents = await studentModel.count({ where: { classId: classIds, gender: 'male' } });
        const femaleStudents = await studentModel.count({ where: { classId: classIds, gender: 'female' } });
        const studentsPresent = await studentModel.count({
            where: { classId: classIds, attendanceStatus: 'present' }
        });

        const getAllStudents = await studentModel.findAll({
            where: { classId: classIds },
            attributes: ['id', 'firstName', 'lastName', 'gender', 'admissionNumber', 'attendanceStatus', 'classId']
        });

        // const getAnnouncement = await announcement.findAll({
        //     attributes: ['id', 'announcementTitle', 'announcementContent']
        // });

        const dashboard = {
            myAttendance: teacher.attendanceStatus,
            assignedClass: teacher.classAssigned,
            totalStudents: students,
            assignedSubjects: teacher.subjectAssigned,
            // recentAnnouncements: getAnnouncement
        };

        const myClass = {
            myClass: teacher.classAssigned,
            totalStudents: students,
            totalFemale: femaleStudents,
            totalMale: maleStudents,
            presentStudent: studentsPresent
        };

        res.status(200).json({
            dashboard,
            myClass,
            getAllStudents,
            // getAnnouncement
        });

    } catch (error) {
        next(error);
    }
};


exports.classTeacherSettings = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { firstName, lastName, address, oldPassword, newPassword, confirmPassword } = req.body;

        const classTeacher = await staffModel.findByPk(id);
        if (!classTeacher) {
            return res.status(404).json({ message: 'class Teacher not found' });
        }

        // Handle optional profile picture upload
        let result = null;
        if (req.file) {
            result = await cloudinary.uploader.upload(req.file.path);
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            if (!result) {
                return next({ message: 'Image upload failed', statusCode: 500 });
            }
        }

        // Handle optional password change
        let hashedPassword;
        if (newPassword) {
            const passwordCorrect = await bcrypt.compare(oldPassword, classTeacher.password);
            if (!passwordCorrect) {
                return next({ message: 'incorrect password', statusCode: 400 });
            }
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'password does not match' });
            }
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(newPassword, salt);
        }

        const updateData = { firstName, lastName, address };
        if (hashedPassword) updateData.password = hashedPassword;
        if (result) {
            updateData.staffProfileUrl = result.secure_url;
            updateData.staffProfilePublicId = result.public_id;
        }

        await classTeacher.update(updateData);

        const classTeacherData = {
            id: classTeacher.id,
            firstName: classTeacher.firstName,
            lastName: classTeacher.lastName,
            address: classTeacher.address,
            staffProfileUrl: classTeacher.staffProfileUrl,
            staffProfilePublicId: classTeacher.staffProfilePublicId
        };

        res.json({
            message: 'class Teacher updated successfully',
            classTeacherData
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};