const subjectModel = require('../models/subject');
const adminModel = require('../models/admin')
const schoolClasses = require('../models/schoolclass')
const staffModel = require('../models/staff')

exports.createSubject = async (req, res, next) => {
    try {
        const { id } = req.user;
        const admin = await adminModel.findByPk(id);
        if (!admin) {
            return res.status(403).json({ 
              message: 'you are not authorized to create subject' 
            });
        }

        const { subjectName, applicableClasses, applicableDepartment, teacherId } = req.body;

        if (!subjectName) {
            return res.status(400).json({ 
              message: 'subject name is required' 
            });
        }

        if (!Array.isArray(applicableClasses) || applicableClasses.length === 0) {
            return res.status(400).json({ 
              message: 'at least one class must be selected' 
            });
        }

        let subjectTeacher = null;
        if (teacherId) {
            subjectTeacher = await staffModel.findOne({
                where: { id: teacherId, adminId: id, schoolUrl: admin.schoolUrl }
            });
            if (!subjectTeacher) {
                return res.status(404).json({ 
                  message: 'teacher not found' 
                });
            }
        }

        const teacherName = subjectTeacher
            ? `${subjectTeacher.firstName} ${subjectTeacher.lastName}`
            : null;

        const classes = await schoolClasses.findAll({
            where: { id: applicableClasses, adminId: id, schoolUrl: admin.schoolUrl }
        });

        if (classes.length !== applicableClasses.length) {
            return res.status(404).json({ message: 'one or more selected classes were not found' });
        }

        const created = await Promise.all(
            classes.map(c =>
                subjectModel.create({
                    adminId: id,
                    classId: c.id,
                    staffId: teacherId || null,
                    schoolUrl: admin.schoolUrl,
                    subjectName,
                    applicableDepartment,
                    subjectTeacher: teacherName
                })
            )
        );

        return res.status(201).json({
            message: created.length === 1
                ? 'Subject created successfully'
                : `Subject created for ${created.length} classes`,
            subjects: created
        });

    } catch (error) {
        next(error);
    }
};

exports.getAllSubjects = async (req, res, next) => {
  try {
    const {id} = req.user
    const admin = await adminModel.findByPk(id)
    if(!admin){
        return res.status(403).json({
            message: 'you are not authorized to view subjects'
        })
    }
    const subjects = await subjectModel.findAll();
    res.status(200).json({
      message: 'Subjects retrieved successfully',
      subjects
    });
  } catch (error) {
    next(error);
  }
};
