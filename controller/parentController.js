const parentModel = require("../models/parent")
const studentModel = require('../models/student')
const paymentModel = require('../models/payment')
const dayjs = require('dayjs')
const studentAttendanceModel = require('../models/studentattendance')
const {Op} = require('sequelize')


exports.createPassword = async (req, res, next) => {
    try {
        const {id} = req.user
        const { password, confirmPassword } = req.body;

        const parent = await parentModel.findByPk(id);

        if (!parent) {
            return res.status(404).json({
                message: 'parent not found'
            });
        }

        if (parent.isActive) {
            return res.status(400).json({
                message: 'Account already activated'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        parent.password = hashedPassword;
        parent.isActive = true;
        parent.isVerified = true;

        await parent.save();

        res.status(200).json({
            message: 'Password created successfully'
        });

    } catch (error) {
        next(error)
    }
};


exports.changePassword = async(req,res,next)=>{

    try {
        const {id} =  req.user
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const user = await staffModel.findByPk(id)

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: 'password does not match'
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(oldPassword, salt)

        const pass = {
            password: hashedPassword
        }

        const updatedPassword = await adminModel.update(pass, {where: {email}})

        res.status(200).json({
            message: 'Password changed successfully',
            updatedPassword
        })

    } catch (error) {
       next(error)
    }
};

exports.getAllStudent = async(req, res, next)=>{
    try {
        const {id} = req.user
        const parent = await parentModel.findByPk(id)

        const getAllStudents = await studentModel.findAll({where: {parentId: id, schoolUrl: parent.schoolUrl}})
        const parentName = `${parent.firstName} ${parent.lastName}`
        const studentsData = getAllStudents.map((student)=>{
            return {
                id: student.id,
                fullName: `${student.firstName} ${student.lastName}`,

            }
        });
        res.status(200).json({
            message: 'All students retrieved successfully',
            studentsData,
            parentName        
        })

    } catch (error) {
        next(error)
    }
}

exports.getOneStudent = async(req, res, next)=>{
    try {
        const {id} = req.user
        const parent = await parentModel.findByPk(id)
        const studentId = req.params.id

        const getStudent = await studentModel.findOne({where: {id: studentId, parentId: id, schoolUrl: parent.schoolUrl}})
        if(!getStudent){
            return res.status(404).json({
                message: 'student not found'
            })
        };

        res.status(200).json({
            message: 'students retrieved successfully',
            getStudent
        })

    } catch (error) {
        next(error)
    }
};
exports.parentDashboard = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { studentId } = req.params;
        const { month } = req.query;

        // FIX 1: verify student belongs to the requesting parent
        const student = await studentModel.findOne({
            where: { id: studentId, parentId: id }
        });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const selectedMonth = month ? dayjs(`${month}-01`) : dayjs();
        if (!selectedMonth.isValid()) {
            return res.status(400).json({
                message: 'Invalid month format. Use YYYY-MM'
            });
        }

        const startOfMonth = selectedMonth.startOf('month').format('YYYY-MM-DD');
        const endOfMonth   = selectedMonth.endOf('month').format('YYYY-MM-DD');

        const [payments, attendanceRecords] = await Promise.all([
            paymentModel.findAll({
                where: { studentId },
                order: [['paymentDate', 'DESC']]
            }),
            studentAttendanceModel.findAll({
                where: {
                    studentId,
                    date: { [Op.between]: [startOfMonth, endOfMonth] }
                }
            })
        ]);

        const presentDays          = attendanceRecords.filter(r => r.status === 'present').length;
        const absentDays           = attendanceRecords.filter(r => r.status === 'absent').length;
        const totalAttendanceDays  = attendanceRecords.length;
        const attendancePercentage = totalAttendanceDays
            ? Number(((presentDays / totalAttendanceDays) * 100).toFixed(1))
            : 0;

        const parentName =
            student.parentGuardiansName ||
            `${student.parentFirstName || ''} ${student.parentLastName || ''}`.trim();

        // FIX 3: pull currentTerm from student record, fall back to 'First Term'
        const currentTerm = student.currentTerm || 'First Term';

        const paymentHistory = payments.map(payment => ({
            id:        payment.id,
            date:      dayjs(payment.paymentDate).format('MMM DD, YYYY'),
            term:      currentTerm,
            amount:    Number(payment.amount),
            currency:  payment.currency,
            status:    payment.paymentStatus,
            reference: payment.reference
        }));

        const dashboard = {
            greeting: `Good Day, ${parentName}`,
            parent: {
                name:        parentName,
                firstName:   student.parentFirstName,
                lastName:    student.parentLastName,
                email:       student.parentGuardiansEmail,
                // FIX 2: use parent's phone field, not student's
                phoneNumber: student.parentGuardiansPhone,
                address:     student.parentGuardiansAddress,
                profileUrl:  student.parentProfileUrl
            },
            student: {
                id:               student.id,
                name:             `${student.firstName} ${student.lastName}`,
                class:            student.studentClass,
                admissionNumber:  student.admissionNumber,
                feeStatus:        student.paymentStatus,
                attendanceStatus: student.attendanceStatus,
                currentTerm,
                session:          student.session
            },
            paymentHistory,
            monthlyAttendance: {
                month:      selectedMonth.format('MMMM YYYY'),
                percentage: attendancePercentage,
                presentDays,
                absentDays,
                totalDays:  totalAttendanceDays
            }
        };

        return res.status(200).json({
            message: 'Parent dashboard retrieved successfully',
            dashboard
        });

    } catch (error) {
        next(error);
    }
};

exports.getParentProfile = async(req,res,next)=>{
    try {
        
        const {id} = req.user
        const getParent = await parentModel.findByPk(id)

        if(!getParent){
            return res.status(404).json({
                message: 'parent does not exist',
            })
        }
        const data = {
            id: getParent.id,
            firstName: getParent.firstName,
            lastName: getParent.lastName,
            email: getParent.email,
            phoneNumber: getParent.phoneNumber

        }


    } catch (error) {
        next(error)
    }
}


exports.parentSettings = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { firstName, lastName, address, oldPassword, newPassword, confirmPassword } = req.body;

        const parent = await parentModel.findByPk(id);
        if (!parent) {
            return res.status(404).json({ message: 'parent not found' });
        }

        let result = null;
        if (req.file) {
            result = await cloudinary.uploader.upload(req.file.path);
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            if (!result) {
                return next({ message: 'Image upload failed', statusCode: 500 });
            }
        };

        let hashedPassword;
        if (newPassword) {
            const passwordCorrect = await bcrypt.compare(oldPassword, parent.password);
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
            updateData.parentProfileUrl = result.secure_url;
            updateData.parentProfilePublicId = result.public_id;
        }

        await parent.update(updateData);

        const parentData = {
            id: parent.id,
            firstName: parent.firstName,
            lastName: parent.lastName,
            address: parent.address,
            parentProfileUrl: parent.parentProfileUrl,
            parentProfilePublicId: parent.parentProfilePublicId
        };

        res.json({
            message: 'Parent updated successfully',
            parentData
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

