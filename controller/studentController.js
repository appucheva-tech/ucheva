const studentModel = require('../models/student');
const parentModel = require('../models/parent')
const adminModel = require('../models/admin')
const profileModel = require('../models/adminprofile')
const classModel = require('../models/schoolclass')
const staffModel = require('../models/staff')
const cloudinary = require('../config/cloudinary')
const bcrypt = require('bcrypt')
const fs = require('fs')
const dayjs = require('dayjs')
const paymentModel = require('../models/payment')
const studentAttendanceModel = require('../models/studentattendance')
const {parentInviteTemplate} = require('../utils/emailTemplate')
const {sendBrevoEmail} = require('../utils/brevo')
const sendMail = require('../utils/nodemailer')
const jwt = require('jsonwebtoken');
const staff = require('../models/staff');


exports.createStudent = async (req, res, next) => {
    try {
        const { id } = req.user;
        const admin = await adminModel.findById(id);
        const adminProfile = await profileModel.findOne({ adminId: id });
        if (!admin) {
            return res.status(404).json({ message: 'admin not found' });
        }

        const {
            firstName, lastName, otherName, gender, dateOfBirth, nationality,
            address, relationship, religion, phoneNumber, parentGuardiansEmail,
            classId, department, parentGuardiansFirstName, parentGuardiansLastName, parentGuardiansAddress
        } = req.body;

        const normalizedParentEmail = parentGuardiansEmail.trim().toLowerCase();

        const existingStudent = await studentModel.findOne({ firstName, lastName, otherName, schoolUrl: admin.schoolUrl });
        if (existingStudent) {
            return res.status(400).json({ message: 'student already exists' });
        }

        const schoolClass = await classModel.findOne({ _id: classId, schoolUrl: admin.schoolUrl });
        if (!schoolClass) {
            return res.status(404).json({
                message: 'selected class is not available. Please, update your class configuration or select other classes'
            });
        }

        const currentYear = new Date().getFullYear();
        const length = await studentModel.countDocuments();
        const studentAdmission = `STD-${currentYear}-${String(length + 1).padStart(6, "0")}`;

        const student = await studentModel.create({
            schoolUrl: schoolClass.schoolUrl,
            adminId: id,
            classId: schoolClass._id,
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
            parentGuardiansFirstName,
            parentGuardiansLastName,
            parentGuardiansAddress,
            session: adminProfile.session,
            studentClass: schoolClass.className,
            department,
            balance: Number(schoolClass.amount)
        });

        let parent = await parentModel.findOne({ email: normalizedParentEmail, schoolUrl: admin.schoolUrl });

        let isNewParent = false;

        if (!parent) {
            isNewParent = true;
            parent = await parentModel.create({
                schoolUrl: student.schoolUrl,
                adminId: id,
                firstName: student.parentGuardiansFirstName,
                lastName: student.parentGuardiansLastName,
                email: normalizedParentEmail,
                address: parentGuardiansAddress,
                phoneNumber
            });
        }

        student.parentId = parent._id;
        await student.save();

        if (isNewParent) {
            const token = jwt.sign(
                { id: parent._id, email: parent.email, role: parent.role },
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

exports.getStudent = async (req, res, next) => {
    try {
        const { id } = req.user;
        const studentId = req.params.id;

        const admin = await adminModel.findById(id);
        if (!admin) {
            return res.status(404).json({ message: 'admin not found' });
        }

        const getStudent = await studentModel.findOne({ _id: studentId, adminId: id, schoolUrl: admin.schoolUrl });

        if (!getStudent) {
            return res.status(404).json({ message: 'student not found' });
        }

        res.status(200).json({
            message: 'Student retrieved successfully',
            getStudent
        });

    } catch (error) {
        next(error);
    }
};


exports.getAllStudents = async (req, res, next) => {
    try {

        const schooldomain = req.headers["x-tenant"]
        if(!schooldomain){
            return res.status(404).json({
                message: 'invalid school domain'
            })
        }
        const {id} = req.user
        const admin = await adminModel.findById(id)

const students = await studentModel.find({ schoolUrl: admin.schoolUrl }).populate('classId', 'staffId className');
const classTeacherIds = students.map((student) => student.classId?.staffId).filter(Boolean);
const classTeachers = await staffModel.find({ _id: { $in: classTeacherIds } }).select('firstName lastName');
const teachersById = new Map(classTeachers.map((teacher) => [String(teacher._id), teacher]));

    const studentsData = students.map((student) => {
        const teacher = student.classId?.staffId
        ? teachersById.get(String(student.classId.staffId))
        : null;

    return {
        id: student._id,
        fullName: `${student.firstName} ${student.lastName}`,
        gender: student.gender,
        classes: student.classId?.className,
        department: student.department,
        admissionNumber: student.admissionNumber,
        parentGuardiansPhoneNumber: student.phoneNumber,
        classTeacher: teacher ? `${teacher.firstName} ${teacher.lastName}` : null,
    };
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

        const admin = await adminModel.findById(id);
        if (!admin) {
            return res.status(404).json({ message: 'admin not found' });
        }

        const schoolClass = await classModel.findOne({ _id: classId, schoolUrl: admin.schoolUrl });
        if (!schoolClass) {
            return res.status(404).json({ message: 'class not found' });
        }

        const students = await studentModel.find({
            adminId: id,
            classId: schoolClass._id,
            schoolUrl: admin.schoolUrl
        });

        const studentsData = students.map((student) => ({
            id: student._id,
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

exports.getNewIntake = async (req, res, next) => {
  try {
    const { id } = req.user;
    const admin = await adminModel.findById(id);

    const thirtyDaysAgo = new Date(); // Add this
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // Add this

    const totalStudentsLast30Days = await studentModel.countDocuments({
        schoolUrl: admin.schoolUrl,
        createdAt: {
          $gte: thirtyDaysAgo,
        },
    });

    res.status(200).json({
      message: "new intake retrieved successfully",
      totalStudentsLast30Days,
    });
  } catch (error) {
    next(error);
  }
};


exports.updateStudent = async (req, res, next) => {
    try {
        const { id } = req.user;
        const studentId = req.params.id;

        const admin = await adminModel.findById(id);
        if (!admin) {
            return res.status(404).json({ message: 'admin not found' });
        }

        const student = await studentModel.findOne({ _id: studentId, schoolUrl: admin.schoolUrl });
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
                _id: { $ne: student._id },
                schoolUrl: admin.schoolUrl,
                firstName: firstName ?? student.firstName,
                lastName: lastName ?? student.lastName,
                otherName: otherName ?? student.otherName
            });
            if (duplicate) {
                return res.status(400).json({ message: 'another student with this name already exists' });
            }
        }

        let schoolClass = null;
        if (classId && classId !== student.classId) {
            schoolClass = await classModel.findOne({ _id: classId, schoolUrl: admin.schoolUrl });
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
            updateData.classId = schoolClass._id;
            updateData.studentClass = schoolClass.className;
            updateData.balance = Number(schoolClass.amount);
        }

        Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

        Object.assign(student, updateData);
        await student.save();

        if (student.parentId && (parentGuardiansName || parentGuardiansEmail || parentGuardiansAddress || phoneNumber)) {
            const parent = await parentModel.findById(student.parentId);
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
                    Object.assign(parent, parentUpdate);
                    await parent.save();
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
        const studentId = req.params.id;

        const admin = await adminModel.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'admin not found' });
        }

        const student = await studentModel.findOne({ _id: studentId, schoolUrl: admin.schoolUrl });
        if (!student) {
            return res.status(404).json({ message: 'student not found' });
        }

        const { parentId } = student;

        await student.deleteOne();

        if (parentId) {
            const remainingChildren = await studentModel.countDocuments({ parentId });
            if (remainingChildren === 0) {
                await parentModel.findByIdAndDelete(parentId);
            }
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        next(error);
    }
};
