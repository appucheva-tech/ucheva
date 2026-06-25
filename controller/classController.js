const classModel = require('../models/schoolclass')
const adminModel = require('../models/admin')
const staffModel = require('../models/staff');
const schoolClasses = require('../models/schoolclass');
exports.assignOrCreateClass = async (req, res, next) => {
    try {
        const { id } = req.user;
        const admin = await adminModel.findByPk(id);

        const { className, amount, paymentOption, teacherId, numberOfInstallments } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ message: 'invalid class amount' });
        }

        const checkClassExist = await classModel.findOne({ where: { adminId: id, className, schoolUrl: admin.schoolUrl } });

        if(checkClassExist?.assigned === true){
            return res.status(400).json({
                message: 'class has already been assigned to a teacher'
            })
        }

        let fetchTeacher = null;
        if (teacherId) {
            fetchTeacher = await staffModel.findOne({ where: { id: teacherId, adminId: id } });
            if (!fetchTeacher) {
                return next({ 
                    message: 'teacher not found', 
                    statusCode: 404 
                });
            }
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
            staffId: fetchTeacher ? fetchTeacher.id : null,
            adminId: id,
            schoolUrl: admin.schoolUrl,
            className,
            paymentOption,
            amount: Number(amount),
            numberOfInstallments: paymentOption === 'installment' ? numberOfInstallments : null,
            payableAmount,
            teacherName: fetchTeacher ? `${fetchTeacher.firstName} ${fetchTeacher.lastName}` : null
        });

        if (fetchTeacher) {
            fetchTeacher.classAssigned = className;
            fetchTeacher.staffType = 'class teacher';
            await fetchTeacher.save();
        }

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
        const { id } = req.user
        const { id: classId } = req.params
        const admin = await adminModel.findByPk(id)
        const { className, amount, paymentOption, teacherId, numberOfInstallments } = req.body;

        const schoolClass = await classModel.findOne({ where: { id: classId, adminId: id, schoolUrl: admin.schoolUrl } })
        if (!schoolClass) {
            return next({
                message: 'Class not found',
                statusCode: 404
            })
        }

        let fetchTeacher = null
        if (teacherId) {
            fetchTeacher = await staffModel.findOne({where: {id: teacherId, adminId: id}})

            if(!fetchTeacher){
                return next({
                    message: 'teacher not found',
                    statusCode: 404
                })
            }
        }

        const nextAmount = amount !== undefined ? Number(amount) : Number(schoolClass.amount)
        const nextPaymentOption = paymentOption || schoolClass.paymentOption
        const nextNumberOfInstallments = nextPaymentOption === 'installment'
            ? (numberOfInstallments || schoolClass.numberOfInstallments)
            : null

        if (!nextAmount || nextAmount <= 0) {
            return res.status(400).json({ message: 'invalid class amount' })
        }

        if (nextPaymentOption === 'installment' && (!nextNumberOfInstallments || nextNumberOfInstallments < 2)) {
            return res.status(400).json({
                message: 'number of installments must be at least 2 for installment payment'
            })
        }

        const data = {
            className: className || schoolClass.className,
            amount: nextAmount,
            paymentOption: nextPaymentOption,
            numberOfInstallments: nextNumberOfInstallments,
            payableAmount: nextPaymentOption === 'installment'
                ? Number((nextAmount / nextNumberOfInstallments).toFixed(2))
                : null
        }

        if (fetchTeacher) {
            data.staffId = fetchTeacher.id
            data.teacherName = `${fetchTeacher.firstName} ${fetchTeacher.lastName}`
            fetchTeacher.classAssigned = data.className
            fetchTeacher.staffType = 'class teacher'
            await fetchTeacher.save()
        }

        await schoolClass.update(data)

        res.status(200).json({
            message: 'Class updated successfully',
            class: schoolClass
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
        const classes = await classModel.findAll({ where: { adminId: id, schoolUrl: admin.schoolUrl }});

        res.status(200).json({
            message: 'Classes retrieved successfully',
            classes
        })
        
    } catch (error) {
        next(error)
    }
};

exports.getAllUnassignedClass = async(req, res, next)=>{
    try {
        const {id} = req.user
        const admin = await adminModel.findByPk(id)
        const fetchClass = await schoolClasses.findAll({where: {adminId: id, schoolUrl: admin.schoolUrl, assigned: false}})

        const classData = fetchClass.map((classes)=>{
            return {
                id: classes.id,
                className: classes.className
            }
        })

        res.status(200).json({
            message: 'unassigned class retrieved successfully',
            classData
        })

    } catch (error) {
        next(error)
    }
}


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
        const classId = req.params.id
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
