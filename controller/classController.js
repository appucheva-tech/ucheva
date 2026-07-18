const classModel = require('../models/schoolclass')
const adminModel = require('../models/admin')
const staffModel = require('../models/staff');
const studentModel = require('../models/student');


exports.assignOrCreateClass = async (req, res, next) => {
    try {
        const { id } = req.user;
        const admin = await adminModel.findById(id);
        if (!admin) {
            return res.status(404).json({ message: 'admin not found' });
        }

        const { className, section, amount, paymentOption, teacherId, numberOfInstallments } = req.body;
        if (!className || !className.trim()) {
            return res.status(400).json({ message: 'class name is required' });
        }

        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ message: 'invalid class amount' });
        }

        if (!['full payment', 'installment'].includes(paymentOption)) {
            return res.status(400).json({ message: "paymentOption must be 'full payment' or 'installment'" });
        }

        const checkClassExist = await classModel.findOne({
            adminId: id,
            className,
            schoolUrl: admin.schoolUrl
        });

        if (checkClassExist) {
            return res.status(400).json({
                message: checkClassExist.assigned
                    ? 'class has already been assigned to a teacher'
                    : 'a class with this name already exists — use the update endpoint to modify it'
            });
        }

        let fetchTeacher = null;
        if (teacherId) {
            fetchTeacher = await staffModel.findOne({ _id: teacherId, adminId: id });
            if (!fetchTeacher) {
                return next({
                    message: 'teacher not found',
                    statusCode: 404
                });
            }
        }

        let payableAmount = null;
        let parsedInstallments = null;
        if (paymentOption === 'installment') {
            parsedInstallments = Number(numberOfInstallments);
            if (!Number.isFinite(parsedInstallments) || parsedInstallments < 2) {
                return res.status(400).json({
                    message: 'number of installments must be at least 2 for installment payment'
                });
            }
            payableAmount = Math.floor(numericAmount / parsedInstallments);
        }

        const newClass = await classModel.create({
            staffId: fetchTeacher ? fetchTeacher._id : null,
            adminId: id,
            schoolUrl: admin.schoolUrl,
            className,
            section,
            paymentOption,
            amount: numericAmount,
            numberOfInstallments: paymentOption === 'installment' ? parsedInstallments : null,
            payableAmount,
            teacherName: fetchTeacher ? `${fetchTeacher.firstName} ${fetchTeacher.lastName}` : null,
            assigned: Boolean(fetchTeacher)
        });

        if (fetchTeacher) {
            fetchTeacher.classAssigned = [...(fetchTeacher.classAssigned || []), newClass._id];
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

exports.updateClass = async (req, res, next) => {
    try {
        const { id } = req.user;
        const classId = req.params.id;
        const admin = await adminModel.findById(id);
        const { className, amount, section, paymentOption, teacherId, numberOfInstallments } = req.body;

        const schoolClass = await classModel.findOne({ _id: classId, adminId: id, schoolUrl: admin.schoolUrl });
        if (!schoolClass) {
            return next({
                message: 'Class not found',
                statusCode: 404
            });
        }

        let fetchTeacher = null;
        if (teacherId) {
            fetchTeacher = await staffModel.findOne({ _id: teacherId, adminId: id });
            if (!fetchTeacher) {
                return next({
                    message: 'teacher not found',
                    statusCode: 404
                });
            }
        }

        const nextAmount = amount !== undefined ? Number(amount) : Number(schoolClass.amount);
        const nextPaymentOption = paymentOption || schoolClass.paymentOption;
        const nextNumberOfInstallments = nextPaymentOption === 'installment'
            ? (numberOfInstallments || schoolClass.numberOfInstallments)
            : null;

        if (!nextAmount || nextAmount <= 0) {
            return res.status(400).json({ message: 'invalid class amount' });
        }

        if (nextPaymentOption === 'installment' && (!nextNumberOfInstallments || nextNumberOfInstallments < 2)) {
            return res.status(400).json({
                message: 'number of installments must be at least 2 for installment payment'
            });
        }

        const data = {
            className: className || schoolClass.className,
            section: section,
            amount: nextAmount,
            paymentOption: nextPaymentOption,
            numberOfInstallments: nextNumberOfInstallments,
            payableAmount: nextPaymentOption === 'installment'
                ? Number((nextAmount / nextNumberOfInstallments).toFixed(2))
                : null
        };

        if (fetchTeacher) {
            data.staffId = fetchTeacher._id;
            data.teacherName = `${fetchTeacher.firstName} ${fetchTeacher.lastName}`;
            fetchTeacher.classAssigned = [...(fetchTeacher.classAssigned || []), schoolClass._id];
            fetchTeacher.staffType = 'class teacher';
            await fetchTeacher.save();
        }

        Object.assign(schoolClass, data);
        await schoolClass.save();

        await studentModel.updateMany(
            { classId: schoolClass._id, adminId: id },
            { balance: nextAmount }
        );

        res.status(200).json({
            message: 'Class updated successfully',
            class: schoolClass
        });
    } catch (error) {
        next(error);
    }
};

exports.getClassByPk = async(req,res,next)=>{
    try {
        const {id} = req.user
        const schoolClass = await classModel.findOne({ adminId: id })

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
        const admin = await adminModel.findById(id)
        const classes = await classModel.find({ adminId: id, schoolUrl: admin.schoolUrl });

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
        const admin = await adminModel.findById(id)
        const fetchClass = await classModel.find({ adminId: id, schoolUrl: admin.schoolUrl, assigned: false })

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
        const admin = await adminModel.findById(id)
        const classes = await classModel.find({ schoolUrl: admin.schoolUrl })

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
        const admin = await adminModel.findById(id)

        const classId = req.params.id
        const deletedClass = await classModel.findOneAndDelete({ _id: classId, schoolUrl: admin.schoolUrl })
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
