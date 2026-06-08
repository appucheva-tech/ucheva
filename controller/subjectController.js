const subjectModel = require('../models/subject');
const adminModel = require('../models/admin')


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
    const subject = await subjectModel.create({
      subjectName,
      applicableSection,
      aplicableDepartment,
      adminId: id
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
