const classModel = require('../models/schoolclass');
const staffModel = require('../models/staff');
const studentModel = require('../models/student');
const paymentModel = require('../models/payment')
const studentAttendance = require('../models/studentattendance');
const subjectModel = require('../models/subject')
const subject = require('../models/subject');
const cloudinary = require('cloudinary').v2
const bcrypt = require('bcrypt')
const fs = require('fs')


  exports.subjectTeacherDashboard = async (req, res, next) => {
    try {
        const { id } = req.user;

        const teacher = await staffModel.findByPk(id);
        if (!teacher) return res.status(404).json({ 
            message: 'Teacher not found' 
        });

        // const classes = await classModel.findOne({ 
        //     where: { staffId: id } 
        // });
        // if (!classes) return res.status(404).json({ 
        //     message: 'No class assigned to this teacher' 
        // });
        const fullName = `${teacher.firstName} ${teacher.lastName}`

        const teacherSubjects = await subjectModel.findAll({
            where: { subjectTeacher: fullName },
            attributes: ['subjectName', 'applicableClasses'],
        });

        const subjectNames = teacherSubjects.map(({ subjectName }) => subjectName);

        const assignedClasses = [
            ...new Set(teacherSubjects.flatMap(({ applicableClasses }) => applicableClasses ?? [])),
        ];

        const [students, maleStudents, femaleStudents, studentsPresent, getAllStudents, announcements] =
            await Promise.all([
                studentModel.count({ where: { classId: classes.id } }),
                studentModel.count({ where: { classId: classes.id, gender: 'male' } }),
                studentModel.count({ where: { classId: classes.id, gender: 'female' } }),
                studentModel.count({ where: { classId: classes.id, attendanceStatus: 'present' } }),
                studentModel.findAll({
                    where: { classId: classes.id, schoolUrl: teacher.schoolUrl },
                    attributes: ['id', 'firstName', 'lastName', 'admissionNumber', 'attendanceStatus', 'subjectsOffered'],
                }),
                // announcement.findAll({
                //     where: { schoolUrl: teacher.schoolUrl }, 
                //     attributes: ['id', 'announcementTitle', 'announcementContent'],
                // }),
            ]);

        const totalStudents = getAllStudents.filter(({ subjectsOffered }) =>
            Array.isArray(subjectsOffered) &&
            subjectsOffered.some(subject => subjectNames.includes(subject))
        );

        const dashboard = {
            myAttendance: teacher.attendanceStatus,
            assignedClass: assignedClasses,      
            studentHandling: totalStudents.length,
            assignedSubjects: subjectNames,        
            totalStudents: students,
            maleStudents,
            femaleStudents,
            studentsPresent,
        };

        res.status(200).json({ dashboard, 
            // announcements 
        });

    } catch (error) {
        next(error);
    }
};

exports.getSubjectTeacherProfile = async (req, res, next) => {
    try {
        const { id } = req.user;

        const subjectTeacher = await staffModel.findByPk(id, {
            attributes: [
                'id',
                'firstName',
                'lastName',
                'otherName',
                'email',
                'phoneNumber',
                'gender',
                'dateOfBirth',
                'nationality',
                'address',
                'maritalStatus',
                'qualification',
                'staffType',
                'classAssigned',
                'subjectAssigned',
                'attendanceStatus',
                'staffProfileUrl',
                'staffProfilePublicId',
                'signatureUrl',
                'signaturePublicId',
                'isActive',
                'isVerified',
                'schoolUrl'
            ]
        });

        if (!subjectTeacher) {
            return res.status(404).json({ 
                message: 'subject teacher not found' 
            });
        };

        return res.status(200).json({
            message: 'Subject teacher profile retrieved successfully',
            subjectTeacherData: subjectTeacher
        });

    } catch (error) {
        next(error);
    }
};


exports.subjectTeacherSettings = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { firstName, lastName, address, oldPassword, newPassword, confirmPassword } = req.body;

        const subjectTeacher = await staffModel.findByPk(id);
        if (!subjectTeacher) {
            return res.status(404).json({ message: 'subject Teacher not found' });
        }

        let result = null;
        if (req.file) {
            result = await cloudinary.uploader.upload(req.file.path);
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            if (!result) {
                return next({
                     message: 'Image upload failed', 
                     statusCode: 500 });
            }
        }

        let hashedPassword;
        if (newPassword) {
            const passwordCorrect = await bcrypt.compare(oldPassword, subjectTeacher.password);
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

        await subjectTeacher.update(updateData);

        const subjectTeacherData = {
            id: subjectTeacher.id,
            firstName: subjectTeacher.firstName,
            lastName: subjectTeacher.lastName,
            address: subjectTeacher.address,
            staffProfileUrl: subjectTeacher.staffProfileUrl,
            staffProfilePublicId: subjectTeacher.staffProfilePublicId
        };

        res.json({
            message: 'subject Teacher updated successfully',
            subjectTeacherData
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};