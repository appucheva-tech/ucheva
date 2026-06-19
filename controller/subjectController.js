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
    const { subjectName, applicableSection, applicableDepartment } = req.body;

  
    if (applicableSection) {
      const classes = await schoolClasses.findAll({

    where: {

        adminId: id,

        selectSection: applicableSection

    }

});

if(classes.length === 0){

    return res.status(404).json({

        message: `No classes found for ${applicableSection} section`

    })

}
      console.log(classes)
      const created = await Promise.all(

    classes.map((c)=>{

        return subjectModel.create({

            adminId:id,

            classId:c.id,

            staffId:null,

            schoolUrl:admin.schoolUrl,

            subjectName,

            applicableSection,

            applicableDepartment

        })

    })

)

return res.status(201).json({

    message:`Subjects created for ${applicableSection}`,

    subjects:created

})

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
      schoolUrl: admin.schoolUrl,
      subjectName,
      applicableSection,
      applicableDepartment,
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
