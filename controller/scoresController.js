const classes = require('../models/schoolclass');
const student = require('../models/student');
const staff = require('../models/staff');
const scores = require('../models/scores')
const subject = require('../models/subject')

exports.createScores = async(req,res,next)=>{
    try {
        const {id} = req.user
        const {subject, continuousAssessment, exam} = req.body;

        const teacher = await staff.findByPk(id)

        const verifySubject = teacher.subjectAssigned.includes(subject)
        const students = await student.findAll({where: {staffId: id, }})
        

        if(!verifySubject) {
            return res.status(403).json({
                message: 'You cannot perform this action'
            })
        }

        const markScore = []
         
        // markScore.push({

        // })
        


    } catch (error) {
        next(error)
    }
}