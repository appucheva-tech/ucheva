const classModel = require('../models/schoolclass')
const classConfig = require('../models/classconfig')
const adminModel = require('../models/admin')
const staffModel = require('../models/staff')


exports.createClass = async(req, res, next) =>{
    try {
        const {id} = req.user
        const {teacherId} = req.params
        const { className, selectSection } = req.body

        const fetchClass = await classConfig.findOne({where: {adminId: id, section: selectSection}, raw: true})
        console.log(fetchClass);
        

        const fetchTeacher = await staffModel.findOne({where: {id: teacherId, staffType: 'subject teacher'}})

        if(fetchTeacher.teacherType == 'class teacher'){
            return res.status(400).json({
                message: 'teacher already assigned a class'
            })
        };

        if(!fetchClass.fullClasses.includes(className)){
            return res.status(404).json({
                message: 'class does not exist'
            })
        };
        
        if(!fetchTeacher){
            return next({
                message: 'teacher not found',
                statusCode: 404
            })
        };

        const checkClassExist = await classModel.findOne({where: {className: className}})
        
        if(checkClassExist){
            return res.status(400).json({
                message: 'class already exists'
            })
        };

        const newClass = await classModel.create({
            staffId: fetchTeacher.id,
            adminId: id,
            className,
            selectSection,
            assignTeacher: `${fetchTeacher.firstName} ${fetchTeacher.lastName}` 
        });

        fetchTeacher.classAssigned = className
        fetchTeacher.teacherType = 'class teacher'
        await fetchTeacher.save()

        res.status(201).json({
            message: 'Class created successfully',
            class: newClass
        })

    } catch (error) {
        next(error)
    }
};

exports.getClassByPk = async(req,res,next)=>{
    try {
        const {id} = req.user
        const schoolClass = await classModel.findOne({where: {adminId: id}})

        if(!schoolClass){
            return res.status(404).json({
                message: 'class not found'
            })
        }

        res.status(200).json({
            message: 'class found',
            schoolClass
        })




    } catch (error) {
        next(error)
    }
}

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