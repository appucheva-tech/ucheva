const feeModel = require('../models/feestructure');
const paymentModel = require('../models/payment');
const classModel = require('../models/classconfig');

// const getPayableAmount = (amount, paymentOption, numberOfInstallments) => {
//     if (paymentOption === 'full payment') {
//         return amount;
//     }

//     return Math.ceil(amount / numberOfInstallments);
// };

const numberOfInstallments = 2 || 3; 

const getPayableAmount = (amount, paymentOption, installments) => {
    if (paymentOption === 'full payment') {
        return amount;
    }

    const installmentCount = Number(installments || numberOfInstallments);
    return Math.ceil(amount / installmentCount);
};

const sumAmount = (records, field = 'amount') => {
    return records.reduce((total, record) => total + Number(record[field] || 0), 0);
};

exports.createFee = async (req, res, next) => {
    try {
        const { id:adminId } = req.user;
        const { classId, feeType, amount, paymentOption } = req.body;

        const classes = await classModel.findOne({ where: { id: classId, adminId } });

        if (!classes){
            return res.status(404).json({
                message: 'class not found'
            })
        };

        if (!['full payment', 'installment'].includes(paymentOption)) {
            return res.status(400).json({
                message: 'paymentOption must be either full payment or installment'
            })
        }

        if (paymentOption === 'installment' && Number(numberOfInstallments) < 2) {
            return res.status(400).json({
                message: 'numberOfInstallments must be at least 2'
            })
        }
        if(paymentOption === 'installment' && Number(numberOfInstallments) > 3) {
            return res.status(400).json({
                message: 'numberOfInstallments must be at most 3'
            })
        }
        const fee = await feeModel.create({
            adminId,
            classId,
            feeType,
            amount,
            paymentOption,
            numberOfInstallments,
            payableAmount: getPayableAmount(Number(amount), paymentOption, Number(numberOfInstallments))
        });

        res.status(201).json({
             message: 'fee created successfully', 
             fee 
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllFees = async (req, res, next) => {
    try {
        const { id: adminId } = req.user;
        const { studentId } = req.query;
        const where = { adminId };
        if (studentId) where.studentId = studentId;

        const fees = await feeModel.findAll({ where, order: [['createdAt', 'DESC']] });
        res.status(200).json({ message: 'fees retrieved successfully', fees });
    } catch (error) {
        next(error);
    }
};

exports.getStudentFeeDetails = async (req, res, next) => {
    try {
        const { id: adminId } = req.user;
        const { classId } = req.params;

        const student = await classModel.findOne({
            where: { id: classId, adminId },
            attributes: [
                'id',
                'admissionNumber',
                'firstName',
                'lastName',
                'studentClass',
                'department',
                'gender',
                'dateOfBirth'
            ]
        });

        if (!student) {
            return res.status(404).json({
                message: 'student not found'
            });
        }

        const fees = await feeModel.findAll({ where: { adminId, classId } });
        const payments = await paymentModel.findAll({
            where: { adminId, classId },
            order: [['paymentDate', 'DESC']]
        });

        const totalFees = sumAmount(fees);
        const amountPaid = sumAmount(payments.filter((p) => p.paymentStatus === 'success'));

        res.status(200).json({
            message: 'fee details retrieved successfully',
            student,
            feeInformation: {
                totalAmount: totalFees,
                amountPaid,
                balance: Math.max(totalFees - amountPaid, 0)
            },
            feeBreakdown: fees.map((fee) => ({
                id: fee.id,
                description: fee.feeType,
                amount: Number(fee.amount),
                paymentOption: fee.paymentOption,
                payableAmount: Number(fee.payableAmount)
            })),
            paymentHistory: payments.map((payment) => ({
                id: payment.id,
                date: payment.paymentDate,
                amount: Number(payment.amount),
                paymentMethod: payment.paymentType,
                reference: payment.reference,
                status: payment.paymentStatus
            }))
        });
    } catch (error) {
        next(error);
    }
};

exports.updateFee = async (req, res, next) => {
    try {
        const { id: adminId } = req.user;
        const { id } = req.params;
        const { feeType, amount, paymentOption, numberOfInstallments } = req.body;

        const fee = await feeModel.findOne({ where: { id, adminId } });
        if (!fee) {
            return res.status(404).json({
                message: 'fee not found'
            });
        }

        const nextAmount = amount !== undefined ? Number(amount) : Number(fee.amount);
        const nextPaymentOption = paymentOption || fee.paymentOption;
        const nextInstallments = Number(numberOfInstallments || fee.numberOfInstallments);

        await fee.update({
            feeType: feeType || fee.feeType,
            amount: nextAmount,
            paymentOption: nextPaymentOption,
            numberOfInstallments: nextInstallments,
            payableAmount: getPayableAmount(nextAmount, nextPaymentOption, nextInstallments)
        });

        res.status(200).json({ message: 'fee updated successfully', fee });
    } catch (error) {
        next(error);
    }
};

exports.deleteFee = async (req, res, next) => {
    try {
        const { id: adminId } = req.user;
        const { id } = req.params;

        const deletedFee = await feeModel.destroy({ where: { id, adminId } });
        if (!deletedFee) {
            return res.status(404).json({
                message: 'fee not found'
            });
        }

        res.status(200).json({
             message: 'fee deleted successfully' 
        });
    } catch (error) {
        next(error);
    }
};
