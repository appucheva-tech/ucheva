const classModel = require('../models/schoolclass');
const adminModel = require('../models/admin')
const staffModel = require('../models/staff');
const studentModel = require('../models/student');
const paymentModel = require('../models/payment')
const studentAttendance = require('../models/studentattendance');
const cloudinary = require('cloudinary').v2
const bcrypt = require('bcrypt')
const fs = require('fs')
const {Op} = require('sequelize')

const normalizeWhatsAppNumber = (phoneNumber) => {
    const digits = String(phoneNumber || '').replace(/\D/g, '');
    if (!digits) return null;
    if (digits.startsWith('0')) return `234${digits.slice(1)}`;
    return digits;
};

const buildWhatsAppUrl = ({ phoneNumber, parentName, studentName, date }) => {
    const normalizedPhoneNumber = normalizeWhatsAppNumber(phoneNumber);
    if (!normalizedPhoneNumber) return null;

    const message = `Good day ${parentName || 'Parent'}, this is to notify you that ${studentName} was marked absent on ${date}. Please contact the school for more information.`;
    return `https://wa.me/${normalizedPhoneNumber}?text=${encodeURIComponent(message)}`;
};

// exports.markAttendance = async(req, res, next) =>{
//     try {
//         const { id } = req.user;
//         const { attendance } = req.body;
//         const schoolUrl = req.headers["x-tenant"];
//         if(!schoolUrl){
//             return res.status(404).json({
//                 message: 'invalid school domain'
//             })
//         }

//         const fetchTeacher = await staffModel.findByPk(id)
//         if (!fetchTeacher?.classAssigned) {
//             return res.status(403).json({ 
//                 message: 'No class assigned to this teacher' 
//             })
//         };

//         const classStudents = await studentModel.findAll({
//             where: { studentClass: fetchTeacher.classAssigned, schoolUrl: schoolUrl },
//             attributes: ['id', 'firstName', 'lastName', 'studentClass', 'attendanceStatus']
//         });

//         const studentMap = Object.fromEntries(
//             classStudents.map(student => [String(student.id), student])
//         );

//         const invalidIds = attendance.filter(({ studentId }) => !studentMap[String(studentId)]);
//         if (invalidIds.length > 0) {
//             return res.status(400).json({
//                 message: 'Some student IDs do not belong to this class',
//                 invalidIds: invalidIds.map(({ studentId }) => studentId)
//             });
//         }

//         // Check if any student already has the same status
//         const alreadyInStatus = attendance.filter(({ studentId, status }) => 
//             studentMap[String(studentId)].attendanceStatus === status
//         );

//         if (alreadyInStatus.length > 0) {
//             return res.status(409).json({
//                 message: 'Some students already have this attendance status',
//                 students: alreadyInStatus.map(({ studentId, status }) => ({
//                     studentId,
//                     name: `${studentMap[String(studentId)].firstName} ${studentMap[String(studentId)].lastName}`,
//                     status
//                 }))
//             });
//         }

//         // Just update the student's attendance status directly
//         await Promise.all(
//             attendance.map(({ studentId, status }) =>
//                 studentModel.update(
//                     { attendanceStatus: status },
//                     { where: { id: studentId } }
//                 )
//             )
//         );

//         return res.status(200).json({
//             message: 'Attendance marked successfully',
//         });

//     } catch (error) {
//         next(error);
//     }
// };

exports.markAttendance = async(req, res, next) =>{
    try {
        const { id } = req.user;
        const { attendance } = req.body;
        const schoolUrl = req.headers["x-tenant"];
        if(!schoolUrl){
            return res.status(404).json({
                message: 'invalid school domain'
            })
        }

        const fetchTeacher = await staffModel.findByPk(id)
        if (!fetchTeacher?.classAssigned) {
            return res.status(403).json({ 
                message: 'No class assigned to this teacher' 
            })
        };

        const classStudents = await studentModel.findAll({
            where: { studentClass: fetchTeacher.classAssigned, schoolUrl: schoolUrl },
            attributes: ['id', 'firstName', 'lastName', 'studentClass', 'attendanceStatus']
        });

        const studentMap = Object.fromEntries(
            classStudents.map(student => [String(student.id), student])
        );

        const invalidIds = attendance.filter(({ studentId }) => !studentMap[String(studentId)]);
        if (invalidIds.length > 0) {
            return res.status(400).json({
                message: 'Some student IDs do not belong to this class',
                invalidIds: invalidIds.map(({ studentId }) => studentId)
            });
        }

        // Check if any student already has the same status
        const alreadyInStatus = attendance.filter(({ studentId, status }) => 
            studentMap[String(studentId)].attendanceStatus === status
        );

        if (alreadyInStatus.length > 0) {
            return res.status(409).json({
                message: 'Some students already have this attendance status',
                students: alreadyInStatus.map(({ studentId, status }) => ({
                    studentId,
                    name: `${studentMap[String(studentId)].firstName} ${studentMap[String(studentId)].lastName}`,
                    status
                }))
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendanceRecords = attendance.map(({ studentId, status }) => ({
            staffId: id,
            studentId,
            classTeacher: `${fetchTeacher.firstName} ${fetchTeacher.lastName}`,
            studentClass: fetchTeacher.classAssigned,
            studentName: `${studentMap[String(studentId)].firstName} ${studentMap[String(studentId)].lastName}`,
            schoolUrl: schoolUrl,
            date: today,
            status
        }));

        // Create or update attendance records
        await studentAttendance.bulkCreate(
            attendanceRecords,
            { updateOnDuplicate: ['status'] }
        );

        // Update the student's attendance status directly
        await Promise.all(
            attendance.map(({ studentId, status }) =>
                studentModel.update(
                    { attendanceStatus: status },
                    { where: { id: studentId } }
                )
            )
        );

        return res.status(200).json({
            message: 'Attendance marked successfully',
        });

    } catch (error) {
        next(error);
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
            const { id: adminId } = req.user
            const {
                classSection,
                status,
                date
            } = req.query

            const admin = await adminModel.findByPk(adminId)

            const today = new Date().toISOString().split('T')[0]
            const selectedDate = date || today
            const attendanceWhere = {
                date: selectedDate,
                schoolUrl: schooldomain
            }

            if (classSection && classSection !== 'All Classes') {
                attendanceWhere.studentClass = classSection
            }

            if (status && status !== 'All Status') {
                attendanceWhere.status = status.toLowerCase()
            }

            const Attendance = await studentAttendance.findAll({
         where: { ...attendanceWhere, schoolUrl: admin.schoolUrl },
        include: [{
            model: studentModel,
            as: 'student',
            where: { adminId, schoolUrl: admin.schoolUrl },
        attributes: [
            'id',
            'firstName',
            'lastName',
            'phoneNumber',
            'parentGuardiansName',
            'parentGuardiansEmail'
        ]
         }],
            order: [['studentName', 'ASC']]
        })

            // if (Attendance.length === 0) {
            //     return res.status(404).json({
            //         message: 'No attendance records found for today'
            //     })
            // }

            const attendanceWithWhatsAppAction = Attendance.map((attendance) => {
                const record = attendance.toJSON()
                const student = record.student
                const canNotifyParent = record.status === 'absent'
                const whatsAppUrl = canNotifyParent
                    ? buildWhatsAppUrl({
                        phoneNumber: student?.phoneNumber,
                        parentName: student?.parentGuardiansName,
                        studentName: record.studentName,
                        date: selectedDate
                    })
                    : null

                return {
                    ...record,
                    parentPhoneNumber: student?.phoneNumber || null,
                    whatsAppAction: {
                        enabled: Boolean(whatsAppUrl),
                        label: 'Notify Parent',
                        type: 'whatsapp',
                        url: whatsAppUrl
                    }
                }
            })

            res.status(200).json({
                message: 'Today\'s student attendance retrieved successfully',
                Attendance: attendanceWithWhatsAppAction
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

        const [totalStudents, maleStudents, femaleStudents, studentsPresent] = await Promise.all([
            studentModel.count({ where: { classId: { [Op.in]: classIds } } }),
            studentModel.count({ where: { classId: { [Op.in]: classIds }, gender: 'male' } }),
            studentModel.count({ where: { classId: { [Op.in]: classIds }, gender: 'female' } }),
            studentModel.count({ where: { classId: { [Op.in]: classIds }, attendanceStatus: 'present' } })
        ]);

        const getAllStudents = await studentModel.findAll({
            where: { classId: { [Op.in]: classIds } },
            attributes: ['id', 'firstName', 'lastName', 'gender', 'admissionNumber', 'attendanceStatus', 'classId']
        });

        const dashboard = {
            myAttendance:    teacher.attendanceStatus,
            assignedClass:   teacher.classAssigned,
            totalStudents,
            assignedSubjects: teacher.subjectAssigned,
        };

        const myClass = {
            myClass:        teacher.classAssigned,
            totalStudents,
            totalFemale:    femaleStudents,
            totalMale:      maleStudents,
            presentStudents: studentsPresent
        };

        return res.status(200).json({
            dashboard,
            myClass,
            getAllStudents
        });

    } catch (error) {
        next(error);
    }
};

exports.reportCard = async(req,res,next)=>{
    try {
        




    } catch (error) {
        next(error)
    }
}

exports.getClassTeacherProfile = async (req, res, next) => {
    try {
        const { id } = req.user;

        const classTeacher = await staffModel.findByPk(id, {
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

        if (!classTeacher) {
            return res.status(404).json({ message: 'Class teacher not found' });
        }

        return res.status(200).json({
            message: 'Class teacher profile retrieved successfully',
            classTeacherData: classTeacher
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
            return res.status(404).json({ message: 'Class teacher not found' });
        }

        let profilePic = null;
        if (req.files?.profilePicture) {
            const profilePath = req.files.profilePicture[0].path;
            profilePic = await cloudinary.uploader.upload(profilePath);
            if (fs.existsSync(profilePath)) fs.unlinkSync(profilePath);
            if (!profilePic) {
                return next({ message: 'Profile picture upload failed', statusCode: 500 });
            }
        }

        let signaturePic = null;
        if (req.files?.signature) {
            const signaturePath = req.files.signature[0].path;
            signaturePic = await cloudinary.uploader.upload(signaturePath);
            if (fs.existsSync(signaturePath)) fs.unlinkSync(signaturePath);
            if (!signaturePic) {
                return next({ message: 'Signature upload failed', statusCode: 500 });
            }
        }

        let hashedPassword;
        if (newPassword) {
            const passwordCorrect = await bcrypt.compare(oldPassword, classTeacher.password);
            if (!passwordCorrect) {
                return next({ message: 'Incorrect password', statusCode: 400 });
            }
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'Passwords do not match' });
            }
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(newPassword, salt);
        }

        const updateData = {
            firstName: firstName || classTeacher.firstName,
            lastName: lastName || classTeacher.lastName,
            address: address || classTeacher.address,
        };

        if (hashedPassword) updateData.password = hashedPassword;

        if (profilePic) {
            updateData.staffProfileUrl = profilePic.secure_url;
            updateData.staffProfilePublicId = profilePic.public_id;
        }

        if (signaturePic) {
            updateData.signatureUrl = signaturePic.secure_url;
            updateData.signaturePublicId = signaturePic.public_id;
        }

        await classTeacher.update(updateData);

        const classTeacherData = {
            id: classTeacher.id,
            firstName: classTeacher.firstName,
            lastName: classTeacher.lastName,
            address: classTeacher.address,
            staffProfileUrl: classTeacher.staffProfileUrl,
            staffProfilePublicId: classTeacher.staffProfilePublicId,
            signatureUrl: classTeacher.signatureUrl,
            signaturePublicId: classTeacher.signaturePublicId,
        };

        res.status(200).json({
            message: 'Class teacher updated successfully',
            classTeacherData,
        });

    } catch (error) {
        if (req.files?.profilePicture) {
            const p = req.files.profilePicture[0]?.path;
            if (p && fs.existsSync(p)) fs.unlinkSync(p);
        }
        if (req.files?.signature) {
            const p = req.files.signature[0]?.path;
            if (p && fs.existsSync(p)) fs.unlinkSync(p);
        }
        next(error);
    }
};

