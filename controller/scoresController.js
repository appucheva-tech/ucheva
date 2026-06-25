const classes = require('../models/schoolclass');
const student = require('../models/student');
const staff = require('../models/staff');
const scoresModel = require('../models/scores')
const subjectModel = require('../models/subject')
const admins = require('../models/admin')


exports.createScores = async (req, res, next) => {
    try {
        const { id } = req.user;
        const subjectId = req.params.id
        const { score } = req.body;

        const teacher = await staff.findByPk(id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const assignedSubjects = Array.isArray(teacher.subjectAssigned)
            ? teacher.subjectAssigned
            : [];

            const subjectExists = await subjectModel.findOne({
                where: { id: subjectId }
            });

        if (!subjectExists) {
            return res.status(404).json({ message: 'Subject not found' });
        }


        const classStudents = await student.findAll({
            where: { classId: subjectExists.classId },
            attributes: ['id', 'firstName', 'lastName', 'studentClass', 'admissionNumber']
        });

        const studentMap = Object.fromEntries(
            classStudents.map(s => [String(s.id), s])
        );

        const subjectScore = score.map(({ studentId, continuousAssessment, exam }) => {
    const studentRecord = studentMap[String(studentId)];

    return {
        staffId: id,
        schoolUrl: teacher.schoolUrl,
        subjectId: subjectExists.id,
        studentId,
        subject: subjectExists.subjectName,
        admissionNumber: studentRecord?.admissionNumber || null,
        studentName: studentRecord
            ? `${studentRecord.firstName} ${studentRecord.lastName}`
            : null,
        continuousAssessment,
        exam,
        totalScore: Number(continuousAssessment || 0) + Number(exam || 0)
    };
});
        const fullScores = await scoresModel.bulkCreate(
            subjectScore,
            { updateOnDuplicate: ['continuousAssessment', 'exam', 'totalScore'] }
        );

        return res.status(201).json({
            message: 'Scores created successfully',
            scores: fullScores
        });

    } catch (error) {
        next(error);
    }
};


exports.getScoresBySubject = async(req,res,next)=>{
    try {

        const schooldomain = req.headers["x-tenant"]
            if(!schooldomain){
                return res.status(404).json({
                    message: 'invalid school domain'
                })
            }

        const {id} = req.user
        const subjectId = req.params.id
        const getScores = await scoresModel.findAll({
            where: {subjectId, schoolUrl: schooldomain}
        })

        const data = getScores.map((score)=>{
            return {
                studentName: `${getScores.firstName} ${getScores.lastName}`,
                admissionNumber: getScores.admissionNumber,
                continuousAssessment: getScores.continuousAssessment,
                exam: getScores.exam
                
            }
        })

        res.status(200).json({
            message: `all scores for retrieved successfully`,
            data
        })

    } catch (error) {
        next(error)
    }
}




exports.updateScores = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { score } = req.body;

        const teacher = await staff.findByPk(id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Validate all studentIds exist in scores before updating
        const invalidIds = [];

        await Promise.all(
            score.map(async ({ studentId, continuousAssessment, exam }) => {
                const existingScore = await scoresModel.findOne({
                    where: { studentId, staffId: id }
                });

                if (!existingScore) {
                    invalidIds.push(studentId);
                    return;
                }

                const totalScore = (continuousAssessment ?? existingScore.continuousAssessment)
                                 + (exam ?? existingScore.exam);

                await existingScore.update({
                    continuousAssessment: continuousAssessment ?? existingScore.continuousAssessment,
                    exam: exam ?? existingScore.exam,
                    totalScore
                });
            })
        );

        if (invalidIds.length > 0) {
            return res.status(404).json({
                message: 'Some students do not have existing scores to update',
                invalidIds
            });
        }

        return res.status(200).json({ message: 'Scores updated successfully' });

    } catch (error) {
        next(error);
    }
};

exports.getScores = async (req, res, next) => {
    try {
        const { id } = req.user;

        const teacher = await staff.findByPk(id);
        if (!teacher) {
            return res.status(404).json({ 
                message: 'Teacher not found' 
            });
        }

        const scores = await scoresModel.findAll({
            where: { staffId: id },
            attributes: [
                'id',
                'studentId',
                'studentName',
                'admissionNumber',
                'subject',
                'className',
                'continuousAssessment',
                'exam',
                'totalScore'
            ],
            order: [['studentName', 'ASC']]
        });

        if (!scores.length) {
            return res.status(404).json({ message: 'No scores found' });
        }

        return res.status(200).json({
            message: 'Scores retrieved successfully',
            total: scores.length,
            scores
        });

    } catch (error) {
        next(error);
    }
};

