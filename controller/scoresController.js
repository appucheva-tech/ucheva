const classes = require('../models/schoolclass');
const student = require('../models/student');
const staff = require('../models/staff');
const scoresModel = require('../models/scores')
const subjectModel = require('../models/subject')
const admins = require('../models/admin')

exports.createScores = async(req, res, next) => {
    try {
        const { id } = req.user
        const { score, subject } = req.body

        const teacher = await staff.findByPk(id)
        if (!teacher){ 
            return res.status(404).json({ 
            message: 'Teacher not found' 
            })
        };

        const subjectExists = await subjectModel.findOne({ where: { subjectName: subject } })
        if (!subjectExists) {
        return res.status(404).json({   
            message: 'Subject not found' 
        })
        }

        const verifySubject = teacher?.subjectAssigned.includes(subject)
        if (!verifySubject) {
            return res.status(403).json({ 
                message: 'You cannot perform this action' 
            })
        }

        const classStudents = await student.findAll({
            where: { studentClass: teacher.classAssigned },
            attributes: ['id', 'firstName', 'lastName', 'studentClass', 'admissionNumber']
        })

        const studentMap = Object.fromEntries(classStudents.map(student => [String(student.id), student]))

        const subjectScore = score.map(({ studentId, continuousAssessment, exam }) => ({
            staffId: id,
            schoolUrl: admins.schoolUrl,
            studentId,
            subject,
            studentClass: teacher.classAssigned,
            admissionNumber: studentMap[String(studentId)].admissionNumber,
            studentName: `${studentMap[String(studentId)].firstName} ${studentMap[String(studentId)].lastName}`,
            continuousAssessment,
            exam
        }))

        const fullScores = await scoresModel.bulkCreate(subjectScore, { updateOnDuplicate: ['continuousAssessment', 'exam'] })

        res.status(201).json({ 
            message: 'Scores marked successfully', 
            scores: fullScores })

    } catch (error) {
        next(error)
    }
};

