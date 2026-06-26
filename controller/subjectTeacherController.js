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
const {Op} = require('sequelize')


exports.getOneSubject = async(req,res,next)=>{
    try {
        const {id} = req.user
        const subjectId = req.params.id
        const getSubject = await subjectModel.findOne({where:{staffId: id}})

        if(!getSubject){
            return resendOTP.status(404).json({
                message: 'subject not found'
            })
        }

        res.status(200).json({
            message: 'subject retrieved successfully',
            getSubject
        })
    } catch (error) {
        next(error)
    }
}
exports.getAllSubjects = async (req, res, next) => {
    try {
        const { id } = req.user;
        const schoolUrl = req.headers["x-tenant"];
        if (!schoolUrl) {
            return res.status(404).json({ message: 'invalid school domain' });
        };
        const subjects = await subjectModel.findAll({
            where: { schoolUrl, staffId: id },
            attributes: ['id', 'subjectName', 'applicableClasses', 'staffId', 'classId']
        });

        res.status(200).json({ subjects });
    } catch (error) {
        next(error);
    }
};


exports.subjectTeacherDashboard = async (req, res, next) => {
    try {
        const { id } = req.user;
        const schooldomain = req.headers["x-tenant"];
        if (!schooldomain) {
            return res.status(404).json({ message: 'invalid school domain' });
        }

        const teacher = await staffModel.findByPk(id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        if (schooldomain !== teacher.schoolUrl) {
            return res.status(403).json({ message: 'school domain mismatch' });
        }

        const teacherSubjects = await subjectModel.findAll({
            where: { staffId: id },
            attributes: ['subjectName', 'applicableClasses'],
        });

        const subjectNames = teacherSubjects.map(({ subjectName }) => subjectName);

        const assignedClasses = [
            ...new Set(teacherSubjects.flatMap(({ applicableClasses }) => applicableClasses ?? [])),
        ];

        if (assignedClasses.length === 0) {
            return res.status(200).json({
                dashboard: {
                    myAttendance: teacher.attendanceStatus,
                    assignedClass: [],
                    studentHandling: 0,
                    assignedSubjects: [],
                    totalStudents: 0,
                    maleStudents: 0,
                    femaleStudents: 0,
                    studentsPresent: 0,
                }
            });
        }

        const [students, maleStudents, femaleStudents, studentsPresent, getAllStudents] =
            await Promise.all([
                studentModel.count({ where: { classId: { [Op.in]: assignedClasses }, schoolUrl: teacher.schoolUrl } }),
                studentModel.count({ where: { classId: { [Op.in]: assignedClasses }, gender: 'male', schoolUrl: teacher.schoolUrl } }),
                studentModel.count({ where: { classId: { [Op.in]: assignedClasses }, gender: 'female', schoolUrl: teacher.schoolUrl } }),
                studentModel.count({ where: { classId: { [Op.in]: assignedClasses }, attendanceStatus: 'present', schoolUrl: teacher.schoolUrl } }),
                studentModel.findAll({
                    where: { classId: { [Op.in]: assignedClasses }, schoolUrl: teacher.schoolUrl },
                    attributes: ['id', 'firstName', 'lastName', 'admissionNumber', 'attendanceStatus'],
                }),
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

        res.status(200).json({ 
            dashboard 
        });

    } catch (error) {
        next(error);
    }
};

exports.getTeacherProfile = async (req, res, next) => {
    try {
        const { id } = req.user;

        const teacher = await staffModel.findByPk(id, {
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

        if (!teacher) {
            return res.status(404).json({ 
                message: 'teacher not found' 
            });
        };

        return res.status(200).json({
            message: 'teacher profile retrieved successfully',
            teacher
        });

    } catch (error) {
        next(error);
    }
};

exports.getAllStudentsByClass = async(req,res,next)=>{
    try {

        const schooldomain = req.headers["x-tenant"]
        if(!schooldomain){
            return res.status(404).json({
                message: 'invalid school domain'
            })
        }
        const {id} = req.user
        const classId = req.params.id
      console.log({schoolUrl: schooldomain, classId})
        const getStudents = await studentModel.findAll({
            where: {schoolUrl: schooldomain, classId}

        })

        res.status(200).json({
            message: 'students retreived successfully',
            getStudents
        })



    } catch (error) {
        next(error)
    }
}


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