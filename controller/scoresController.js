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

        const teacher = await staff.findById(id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const assignedSubjects = Array.isArray(teacher.subjectAssigned)
            ? teacher.subjectAssigned
            : [];

            const subjectExists = await subjectModel.findOne({ _id: subjectId });

        if (!subjectExists) {
            return res.status(404).json({ message: 'Subject not found' });
        }


        const classStudents = await student.find({ classId: subjectExists.classId }).select('id firstName lastName studentClass admissionNumber');

        const studentMap = Object.fromEntries(
            classStudents.map(s => [String(s._id), s])
        );

        const subjectScore = score.map(({ studentId, continuousAssessment, exam }) => {
    const studentRecord = studentMap[String(studentId)];

    return {
        staffId: id,
        schoolUrl: teacher.schoolUrl,
        subjectId: subjectExists._id,
        studentId,
        subject: subjectExists.subjectName,
        admissionNumber: studentRecord?.admissionNumber || null,
            className: studentRecord?.studentClass,

        studentName: studentRecord
        
            ? `${studentRecord.firstName} ${studentRecord.lastName}`
            : null,
        continuousAssessment,
        exam,
        totalScore: Number(continuousAssessment || 0) + Number(exam || 0)
    };
});
        const fullScores = await Promise.all(subjectScore.map(async (scoreDoc) => {
            return scoresModel.findOneAndUpdate(
                { studentId: scoreDoc.studentId, subjectId: scoreDoc.subjectId },
                { $set: scoreDoc },
                { upsert: true, new: true }
            );
        }));

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
        const getScores = await scoresModel.find({ subjectId, schoolUrl: schooldomain })

        const data = getScores.map((score)=>{
            return {
                studentName: `${score.firstName} ${score.lastName}`,
                admissionNumber: score.admissionNumber,
                continuousAssessment: score.continuousAssessment,
                exam: score.exam
                
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

        const teacher = await staff.findById(id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Validate all studentIds exist in scores before updating
        const invalidIds = [];

        await Promise.all(
            score.map(async ({ studentId, continuousAssessment, exam }) => {
                const existingScore = await scoresModel.findOne({ studentId, staffId: id });

                if (!existingScore) {
                    invalidIds.push(studentId);
                    return;
                }

                const totalScore = (continuousAssessment ?? existingScore.continuousAssessment)
                                 + (exam ?? existingScore.exam);

                Object.assign(existingScore, {
                    continuousAssessment: continuousAssessment ?? existingScore.continuousAssessment,
                    exam: exam ?? existingScore.exam,
                    totalScore
                });
                await existingScore.save();
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

        const teacher = await staff.findById(id);
        if (!teacher) {
            return res.status(404).json({ 
                message: 'Teacher not found' 
            });
        }

        const scores = await scoresModel.find({ staffId: id }).select('id studentId studentName admissionNumber subject className continuousAssessment exam totalScore').sort({ studentName: 1 });

        // if (!scores.length) {
        //     return res.status(404).json({ message: 'No scores found' });
        // }

        return res.status(200).json({
            message: 'Scores retrieved successfully',
            total: scores.length,
            scores
        });

    } catch (error) {
        next(error);
    }
};

