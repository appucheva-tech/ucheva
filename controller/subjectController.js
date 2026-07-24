const subjectModel = require('../models/subject');
const adminModel = require('../models/admin')
const schoolClasses = require('../models/schoolclass')
const staffModel = require('../models/staff')

exports.createSubject = async (req, res, next) => {
    try {
        const { id } = req.user;
        const admin = await adminModel.findById(id);
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
            subjectTeacher = await staffModel.findOne({ _id: teacherId, adminId: id, schoolUrl: admin.schoolUrl });
            if (!subjectTeacher) {
                return res.status(404).json({ 
                  message: 'teacher not found' 
                });
            }
        }

        const teacherName = subjectTeacher
            ? `${subjectTeacher.firstName} ${subjectTeacher.lastName}`
            : null;

        const classes = await schoolClasses.find({
            _id: { $in: applicableClasses },
            adminId: id,
            schoolUrl: admin.schoolUrl
        });

        if (classes.length !== applicableClasses.length) {
            return res.status(404).json({ message: 'one or more selected classes were not found' });
        }

        const created = await Promise.all(
            classes.map(c =>
                subjectModel.create({
                    adminId: id,
                    // classId: c.id,
                    staffId: teacherId || null,
                    schoolUrl: admin.schoolUrl,
                    subjectName,
                    applicableClasses: c.id,
                    applicableDepartment,
                    subjectTeacher: teacherName
                })
            )
        );

        if (subjectTeacher) {
            const existingSubjects = subjectTeacher.subjects || [];

            const alreadyAssigned = existingSubjects.includes(subjectName);

            if (!alreadyAssigned) {
                subjectTeacher.subjects = [...existingSubjects, subjectName];
                await subjectTeacher.save();
            }
        }

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
    const admin = await adminModel.findById(id)
    if(!admin){
        return res.status(403).json({
            message: 'you are not authorized to view subjects'
        })
    }
    const subjects = await subjectModel.find({ schoolUrl: admin.schoolUrl });
    res.status(200).json({
      message: 'Subjects retrieved successfully',
      subjects
    });
  } catch (error) {
    next(error);
  }
};


exports.updateSubject = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { id: subjectId } = req.params;

        const admin = await adminModel.findById(id);
        if (!admin) {
            return res.status(403).json({ message: 'you are not authorized to update subject' });
        }

        const subject = await subjectModel.findOne({ _id: subjectId, adminId: id, schoolUrl: admin.schoolUrl });
        if (!subject) {
            return res.status(404).json({ message: 'subject not found' });
        }

        const { subjectName, applicableDepartment, teacherId } = req.body;

        if (subjectName && subjectName !== subject.subjectName) {
            const duplicate = await subjectModel.findOne({
                _id: { $ne: subject._id },
                classId: subject.classId,
                adminId: id,
                schoolUrl: admin.schoolUrl,
                subjectName
            });
            if (duplicate) {
                return res.status(400).json({ message: 'this class already has a subject with that name' });
            }
        }

        const previousTeacherId = subject.staffId;
        const previousSubjectName = subject.subjectName;

        let newTeacher = null;
        if (teacherId !== undefined) {
            if (teacherId) {
                newTeacher = await staffModel.findOne({ _id: teacherId, adminId: id, schoolUrl: admin.schoolUrl });
                if (!newTeacher) {
                    return res.status(404).json({ message: 'teacher not found' });
                }
            }
        }

        const updateData = {};
        if (subjectName) updateData.subjectName = subjectName;
        if (applicableDepartment !== undefined) updateData.applicableDepartment = applicableDepartment;
        if (teacherId !== undefined) {
            updateData.staffId = teacherId || null;
            updateData.subjectTeacher = newTeacher ? `${newTeacher.firstName} ${newTeacher.lastName}` : null;
        }

        Object.assign(subject, updateData);
        await subject.save();

        const finalSubjectName = subjectName || previousSubjectName;
        const teacherChanged = teacherId !== undefined && String(teacherId || '') !== String(previousTeacherId || '');
        const nameChanged = subjectName && subjectName !== previousSubjectName;

        if (teacherChanged || nameChanged) {
            if (previousTeacherId) {
                const stillTeachesIt = await subjectModel.countDocuments({
                    staffId: previousTeacherId,
                    subjectName: previousSubjectName,
                    _id: { $ne: subject._id }
                });
                if (stillTeachesIt === 0) {
                    const prevTeacher = await staffModel.findById(previousTeacherId);
                    if (prevTeacher && Array.isArray(prevTeacher.subjects)) {
                        prevTeacher.subjects = prevTeacher.subjects.filter(s => s !== previousSubjectName);
                        await prevTeacher.save();
                    }
                }
            }

            // add the (possibly new) name to the (possibly new) teacher
            if (newTeacher || (!teacherChanged && previousTeacherId && nameChanged)) {
                const teacherToUpdate = newTeacher || await staffModel.findById(previousTeacherId);
                if (teacherToUpdate) {
                    const existing = teacherToUpdate.subjects || [];
                    if (!existing.includes(finalSubjectName)) {
                        teacherToUpdate.subjects = [...existing, finalSubjectName];
                        await teacherToUpdate.save();
                    }
                }
            }
        }

        return res.json({
            message: 'Subject updated successfully',
            subject
        });

    } catch (error) {
        next(error);
    }
};

exports.deleteSubject = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { id: subjectId } = req.params;

        const admin = await adminModel.findById(id);
        if (!admin) {
            return res.status(403).json({ message: 'you are not authorized to delete subject' });
        }

        const subject = await subjectModel.findOne({ _id: subjectId, adminId: id, schoolUrl: admin.schoolUrl });
        if (!subject) {
            return res.status(404).json({ message: 'subject not found' });
        }

        const { staffId, subjectName } = subject;

        await subject.deleteOne();

        // only strip the subject name off the teacher if they don't teach it
        // in any other class anymore
        if (staffId) {
            const stillTeachesIt = await subjectModel.countDocuments({ staffId, subjectName });
            if (stillTeachesIt === 0) {
                const teacher = await staffModel.findById(staffId);
                if (teacher && Array.isArray(teacher.subjects)) {
                    teacher.subjects = teacher.subjects.filter(s => s !== subjectName);
                    await teacher.save();
                }
            }
        }

        return res.json({ message: 'Subject deleted successfully' });

    } catch (error) {
        next(error);
    }
};
