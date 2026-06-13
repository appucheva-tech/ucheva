const classes = require('../models/schoolclass');
const student = require('../models/student');
const staff = require('../models/staff');
const scoresModel = require('../models/scores')
const subject = require('../models/subject')

exports.createScores = async(req,res,next)=>{
    try {
        const {id} = req.user
        const subjectId = req.params
        const { score } = req.body;

        const teacher = await staff.findByPk(id)
        const subjects = await subject.findOne({where: {staffId: teacher.id}})

        const verifySubject = teacher?.subjectAssigned.includes(subject) 
        const students = await student.findAll({where: {staffId: id, }})
    
        if(!verifySubject) {
            return res.status(403).json({
                message: 'You cannot perform this action'
            })
        };

    const classStudents = await student.findAll({
        where: { studentClass: teacher.classAssigned },
        attributes: ['id', 'firstName', 'lastName', 'studentClass']
    })

    const studentMap = Object.fromEntries(classStudents.map(student => [String(student.id), student]))

    const subjectScore = score.map(({ studentId, continuousAssessment, exam }) => ({
     staffId: id,
     studentId,
     classTeacher: `${teacher.firstName} ${teacher.lastName}`,
     studentClass: teacher.classAssigned,
     studentName: `${studentMap[String(studentId)].firstName} ${studentMap[String(studentId)].lastName}`,
     continuousAssessment, 
     exam
    }))

    const fullScores = await scoresModel.bulkCreate(subjectScore, { updateOnDuplicate: ['continuousAssessment', 'exam'] })

    res.status(201).json({ 
     message: 'scores marked successfully', 
     attendance: fullScores
    })

    } catch (error) {
        next(error)
    }
}

