const subjectModel = require('../models/subject');
const adminModel = require('../models/admin')
const schoolClasses = require('../models/schoolclass')


exports.createSubject = async (req, res, next) => {
  try {
    const {id} = req.user
    const admin = await adminModel.findByPk(id)
    if(!admin){
        return res.status(403).json({
            message: 'you are not authorized to create subject'
        })
    }
    const { subjectName, applicableSection, aplicableDepartment } = req.body;

    // If generateForSection is true, create the subject for every class in that section
    if (applicableSection) {
      const classes = await schoolClasses.findAll({ where: { adminId: id, selectSection: applicableSection } });
      const created = await Promise.all(classes.map((c) => {
        return subjectModel.create({
          adminId: id,
          classId: c.id,
          staffId: null,
          subjectName,
          applicableSection,
          aplicableDepartment,
        })
      }))

      return res.status(201).json({
        message: `Subjects created for section ${applicableSection}`,
        subjects: created
      })
    }

    // Otherwise create a single subject (optionally linked to a specific class/staff)
    const { classId, staffId } = req.body;
    const subject = await subjectModel.create({
      adminId: id,
      classId: classId || null,
      staffId: staffId || null,
      subjectName,
      applicableSection,
      aplicableDepartment,
    })

    res.status(201).json({
        message: 'subject created successfully',
        subject
    })


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
