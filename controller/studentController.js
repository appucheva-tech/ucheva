const studentModel = require('../models/student');
const parentModel = require('../models/parent')
const adminModel = require('../models/admin')
const classModel = require('../models/schoolclass')
const staffModel = require('../models/staff')
const cloudinary = require('../config/cloudinary')
const bcrypt = require('bcrypt')
const fs = require('fs')
const dayjs = require('dayjs')
const { Op } = require('sequelize')
const paymentModel = require('../models/payment')
const studentAttendanceModel = require('../models/studentattendance')
const {parentInviteTemplate} = require('../utils/emailTemplate')
const {sendBrevoEmail} = require('../utils/brevo')
const sendMail = require('../utils/nodemailer')
const jwt = require('jsonwebtoken')

exports.createStudent = async (req, res, next) => {
    try {
        const { id } = req.user;
        const admin = await adminModel.findByPk(id);
        if (!admin) {
            return res.status(404).json({ message: 'admin not found' });
        }

        const {
            firstName, lastName, otherName, gender, dateOfBirth, nationality,
            address, relationship, religion, phoneNumber, parentGuardiansEmail,
            session, classId, department, parentGuardiansName, parentGuardiansAddress
        } = req.body;

        const normalizedParentEmail = parentGuardiansEmail.trim().toLowerCase();

        const existingStudent = await studentModel.findOne({
            where: { firstName, lastName, otherName, schoolUrl: admin.schoolUrl }
        });
        if (existingStudent) {
            return res.status(400).json({ message: 'student already exists' });
        }

        const schoolClass = await classModel.findOne({
            where: { id: classId, schoolUrl: admin.schoolUrl }
        });
        if (!schoolClass) {
            return res.status(404).json({
                message: 'selected class is not available. Please, update your class configuration or select other classes'
            });
        }

        const currentYear = new Date().getFullYear();
        const length = await studentModel.count();
        const studentAdmission = `STD/${currentYear}/${String(length + 1).padStart(6, "0")}`;

        const student = await studentModel.create({
            schoolUrl: schoolClass.schoolUrl,
            adminId: id,
            classId: schoolClass.id,
            admissionNumber: studentAdmission,
            firstName,
            lastName,
            otherName,
            gender,
            dateOfBirth: new Date(dateOfBirth),
            nationality,
            address,
            relationship,
            religion,
            phoneNumber,
            parentGuardiansEmail: normalizedParentEmail,
            parentGuardiansName,
            parentGuardiansAddress,
            session,
            studentClass: schoolClass.className,
            department
        });

        // 🔍 check if this parent already has an account at this school
        let parent = await parentModel.findOne({
            where: { email: normalizedParentEmail, schoolUrl: admin.schoolUrl }
        });

        let isNewParent = false;

        if (!parent) {
            isNewParent = true;
            const [parentFirstName, ...rest] = parentGuardiansName.trim().split(/\s+/);
            const parentLastName = rest.join(' ') || null;

            parent = await parentModel.create({
                schoolUrl: student.schoolUrl,
                adminId: id,
                firstName: parentFirstName,
                lastName: parentLastName,
                email: normalizedParentEmail,
                address: parentGuardiansAddress,
                phoneNumber
            });
        }

        student.parentId = parent.id;
        await student.save();

        if (isNewParent) {
            // only newly created parents need an invite + password-creation flow
            const token = jwt.sign(
                { id: parent.id, email: parent.email, role: parent.role },
                process.env.JWT_SECRET_INVITE,
                { expiresIn: '1day' }
            );

            parent.parentToken = token;
            await parent.save();

            const link = `https://${admin.schoolUrl}.ucheva.com/create-password/${token}`;

            const emailOptions = {
                email: parent.email,
                subject: `Welcome To ${admin.schoolName}`,
                html: parentInviteTemplate(parent.firstName, link)
            };

            if (process.env.NODE_ENV === "production") {
                await sendBrevoEmail(emailOptions);
            } else {
                await sendMail(emailOptions);
            }
        }

        res.status(201).json({
            message: isNewParent
                ? 'Student created successfully, invite sent to parent'
                : 'Student created successfully and mail sent to an existing parent account'
        });

    } catch (error) {
        next(error);
    }
};


exports.getAllStudents = async (req, res, next) => {
    try {
        const {id} = req.user
        const admin = await adminModel.findByPk(id)
        const students = await studentModel.findAll({where: {adminId: id, schoolUrl: admin.schoolUrl}});

         const studentsData = students.map((student)=>{
            return {
                id: student.id,
                fullName: `${student.firstName} ${student.lastName}`,
                gender: student.gender,
                classes: student.studentClass,
                department: student.department,
                parentGuardiansPhoneNumber: student.phoneNumber,
              
            }
        });

        res.status(200).json({
            message: 'Students retrieved successfully',
            studentsData
        });
        
    } catch (error) {
        next(error);
    }
};

exports.getStudentsByClass = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { classId } = req.params;

        const admin = await adminModel.findByPk(id);
        if (!admin) {
            return res.status(404).json({ message: 'admin not found' });
        }

        const schoolClass = await classModel.findOne({
            where: { id: classId, schoolUrl: admin.schoolUrl }
        });
        if (!schoolClass) {
            return res.status(404).json({ message: 'class not found' });
        }

        const students = await studentModel.findAll({
            where: {
                adminId: id,
                classId: schoolClass.id,
                schoolUrl: admin.schoolUrl
            }
        });

        const studentsData = students.map((student) => ({
            id: student.id,
            fullName: `${student.firstName} ${student.lastName}`,
            gender: student.gender,
            classes: student.studentClass,
            department: student.department,
            parentGuardiansPhoneNumber: student.phoneNumber,
            admissionNumber: student.admissionNumber
        }));

        res.status(200).json({
            message: `Students in ${schoolClass.className} retrieved successfully`,
            studentsData
        });
    } catch (error) {
        next(error);
    }
};

exports.getNewIntake = async(req,res,next)=>{
try {
    const {id} = req.user
    const admin = await adminModel.findByPk(id)
    const totalStudentsLast30Days = await studentModel.count({
    where: {
        schoolUrl: admin.schoolUrl,
        createdAt: {
            [Op.gte]: thirtyDaysAgo
        }
    }
});

res.status(200).json({
    message: 'new intake retrieved successfully',
    totalStudentsLast30Days
})


} catch (error) {
    next(error)
}
}


exports.updateStudent = async (req, res, next) => {
    try {
        const { id: adminId } = req.user;
        const { id: studentId } = req.params;

        const admin = await adminModel.findByPk(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'admin not found' });
        }

        const student = await studentModel.findOne({
            where: { id: studentId, schoolUrl: admin.schoolUrl }
        });
        if (!student) {
            return res.status(404).json({ message: 'student not found' });
        }

        const {
            firstName,
            lastName,
            otherName,
            gender,
            dateOfBirth,
            nationality,
            address,
            relationship,
            religion,
            phoneNumber,
            parentGuardiansEmail,
            parentGuardiansName,
            parentGuardiansAddress,
            session,
            classId,
            department
        } = req.body;

        // guard against renaming into a duplicate, the same way createStudent does
        if (firstName || lastName || otherName) {
            const duplicate = await studentModel.findOne({
                where: {
                    id: { [Op.ne]: student.id },
                    schoolUrl: admin.schoolUrl,
                    firstName: firstName ?? student.firstName,
                    lastName: lastName ?? student.lastName,
                    otherName: otherName ?? student.otherName
                }
            });
            if (duplicate) {
                return res.status(400).json({ message: 'another student with this name already exists' });
            }
        }

        let schoolClass = null;
        if (classId && classId !== student.classId) {
            schoolClass = await classModel.findOne({ where: { id: classId, schoolUrl: admin.schoolUrl } });
            if (!schoolClass) {
                return res.status(404).json({
                    message: 'selected class is not available. Please, update your class configuration or select other classes'
                });
            }
        }

        const updateData = {
            firstName,
            lastName,
            otherName,
            gender,
            nationality,
            address,
            relationship,
            religion,
            phoneNumber,
            parentGuardiansName,
            parentGuardiansAddress,
            session,
            department
        };

        if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
        if (parentGuardiansEmail) updateData.parentGuardiansEmail = parentGuardiansEmail.trim().toLowerCase();
        if (schoolClass) {
            updateData.classId = schoolClass.id;
            updateData.studentClass = schoolClass.className;
        }

        // strip undefined keys so partial updates don't null out untouched fields
        Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

        await student.update(updateData);

        // keep the linked parent record's contact info in sync, if one exists
        if (student.parentId && (parentGuardiansName || parentGuardiansEmail || parentGuardiansAddress || phoneNumber)) {
            const parent = await parentModel.findByPk(student.parentId);
            if (parent) {
                const parentUpdate = {};
                if (parentGuardiansName) {
                    const [parentFirstName, ...rest] = parentGuardiansName.trim().split(/\s+/);
                    parentUpdate.firstName = parentFirstName;
                    if (rest.length) parentUpdate.lastName = rest.join(' ');
                }
                if (parentGuardiansEmail) parentUpdate.email = updateData.parentGuardiansEmail;
                if (parentGuardiansAddress) parentUpdate.address = parentGuardiansAddress;
                if (phoneNumber) parentUpdate.phoneNumber = phoneNumber;

                if (Object.keys(parentUpdate).length) {
                    await parent.update(parentUpdate);
                }
            }
        }

        res.json({
            message: 'Student updated successfully',
            student
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteStudent = async (req, res, next) => {
    try {
        const { id: adminId } = req.user;
        const { id: studentId } = req.params;

        const admin = await adminModel.findByPk(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'admin not found' });
        }

        const student = await studentModel.findOne({
            where: { id: studentId, schoolUrl: admin.schoolUrl }
        });
        if (!student) {
            return res.status(404).json({ message: 'student not found' });
        }

        const { parentId } = student;

        await student.destroy();

        // only remove the parent account if this was their last linked child
        if (parentId) {
            const remainingChildren = await studentModel.count({ where: { parentId } });
            if (remainingChildren === 0) {
                await parentModel.destroy({ where: { id: parentId } });
            }
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        next(error);
    }
};
