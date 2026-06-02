const classModel = require('../models/schoolclass')
const adminModel = require('../models/admin')
const staffModel = require('../models/staff')


exports.createClass = async(req, res, next) =>{
    try {
        const {id} = req.user
        const { className, selectSelection, assignTeacher } = req.body

        const fetchTeacher = await staffModel.findOne({where: {teachingType: 'class teacher', name: assignTeacher}})

        if(!fetchTeacher){
            return next({
                message: 'teacher not found',
                statusCode: 404
            })
        }

        const newClass = await classModel.create({
            staffId: fetchTeacher.id,
            adminId: id,
            className,
            selectSelection,
            assignTeacher
        })

        res.status(201).json({
            message: 'Class created successfully',
            class: newClass
        })

    } catch (error) {
        next(error)
    }
}