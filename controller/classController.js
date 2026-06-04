const classModel = require('../models/schoolclass')
const adminModel = require('../models/admin')
const staffModel = require('../models/staff')


exports.createClass = async(req, res, next) =>{
    try {
        const {id} = req.user
        const { className, selectSelection, assignTeacher } = req.body

        const fetchTeacher = await staffModel.findOne({where: {teachingType: 'class teacher', firstName: assignTeacher}})

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

        fetchTeacher.classAssigned = className
        await fetchTeacher.save()

        res.status(201).json({
            message: 'Class created successfully',
            class: newClass
        })

    } catch (error) {
        next(error)
    }
};

exports.getAllClasses = async(req, res, next) =>{
    try {
        const classes = await classModel.findAll({
            include: {
                model: staffModel,
                as: 'staff',
                attributes: ['firstName', 'lastName']
            }
        })

        res.status(200).json({
            message: 'Classes retrieved successfully',
            classes
        })
    } catch (error) {
        next(error)
    }
};

exports.deleteClass = async(req, res, next) =>{
    try {
        const {id} = req.params
        const deletedClass = await classModel.destroy({where: {id}})    
        if(!deletedClass){
            return next({
                message: 'Class not found', 
                statusCode: 404
            })
        }   
        res.status(200).json({
            message: 'Class deleted successfully'
        })
    } catch (error) {
        next(error)
    }   
};

exports.updateClass = async(req, res, next) =>{
    try {
        const {id} = req.params
        const { className, selectSelection, assignTeacher } = req.body  
        const fetchTeacher = await staffModel.findOne({where: {teachingType: 'class teacher', firstName: assignTeacher}})

        if(!fetchTeacher){
            return next({
                message: 'teacher not found',
                statusCode: 404
            })
        }   

        const data = {
            staffId: fetchTeacher.id,
            className,
            selectSelection,    
            assignTeacher
        }

        const updatedClass = await classModel.update(data, {where: {id}})

        if(!updatedClass[0]){
            return next({
                message: 'Class not found',
                statusCode: 404
            })
        }
        res.status(200).json({
            message: 'Class updated successfully'
        })  
    } catch (error) {
        next(error)
    }
};