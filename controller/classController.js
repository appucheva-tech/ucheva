const classModel = require('../models/schoolclass')
const adminModel = require('../models/admin')
const staffModel = require('../models/staff')

exports.assignOrCreateClass = async (req, res, next) => {
    try {
        const { id } = req.user;
        const admin = await adminModel.findByPk(id);

        const { className, amount, paymentOption, teacherId, numberOfInstallments } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ message: 'invalid class amount' });
        }

        const checkClassExist = await classModel.findOne({ where: { adminId: id, className } });
        if (checkClassExist) {
            return res.status(400).json({ message: 'class already exists' });
        }

        const fetchTeacher = await staffModel.findOne({ where: { id: teacherId, adminId: id } });
        if (!fetchTeacher) {
            return next({ message: 'teacher not found', statusCode: 404 });
        }

        if (fetchTeacher.staffType === 'class teacher') {
            return res.status(400).json({ message: 'teacher already assigned a class' });
        }

        let payableAmount = null;
        if (paymentOption === 'installment') {
            if (!numberOfInstallments || numberOfInstallments < 2) {
                return res.status(400).json({
                    message: 'number of installments must be at least 2 for installment payment'
                });
            }
            payableAmount = Math.floor(amount / numberOfInstallments);
        }

        const newClass = await classModel.create({
            staffId: fetchTeacher.id,
            adminId: id,
            schoolUrl: admin.schoolUrl,
            className,
            paymentOption,
            amount: Number(amount),
            numberOfInstallments: paymentOption === 'installment' ? numberOfInstallments : null,
            payableAmount,
            teacherName: `${fetchTeacher.firstName} ${fetchTeacher.lastName}`
        });

        fetchTeacher.classAssigned = className;
        fetchTeacher.staffType = 'class teacher';
        await fetchTeacher.save();
        
        res.status(201).json({
            message: 'Class created successfully',
            class: newClass
        });
        
    } catch (error) {
        next(error);
    }
};

exports.updateClass = async(req, res, next) =>{
    try {
        const {id} = req.params
        const { className, amount, paymentOption, teacherId, numberOfInstallments } = req.body;
        const fetchTeacher = await staffModel.findOne({where: {staffType: 'class teacher', firstName: assignTeacher}})

        if(!fetchTeacher){
            return next({
                message: 'teacher not found',
                statusCode: 404
            })
        }   

        const data = {
            staffId: fetchTeacher.id,
            className, 
            amount, 
            paymentOption, 
            teacherId, 
            numberOfInstallments
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
        const{id} = req.user
        const admin = await adminModel.findByPk(id)
        const classes = await classModel.findAll({ where: {
            include: {
                model: staffModel,
                as: 'staff',
                attributes: ['firstName', 'lastName']
            }, schoolUrl: admin.schoolUrl
        }});

        res.status(200).json({
            message: 'Classes retrieved successfully',
            classes
        })
        
    } catch (error) {
        next(error)
    }
};


exports.getAllClassesByDept = async(req, res, next) =>{
    try {
        const {id} = req.user
        const admin = await adminModel.findByPk(id)
        const classes = await classModel.findAll({ where: { schoolUrl: admin.schoolUrl,
            include: {
                model: staffModel,
                as: 'staff',
                attributes: ['firstName', 'lastName']
            }
        }})

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
        const {id} = req.user
        const admin = await adminModel.findByPk(id)
        const {classId} = req.params.id
        const deletedClass = await classModel.destroy({where: {classId, schoolUrl: admin.schoolUrl}})    
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
