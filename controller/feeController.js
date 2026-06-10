const feeModel = require('../models/feestructure');
const studentModel = require('../models/student');
const paymentModel = require('../models/payment');

const getPayableAmount = (amount, paymentOption, numberOfInstallments) => {
    if (paymentOption === 'full payment') {
        return amount;
    }

    return Math.ceil(amount / numberOfInstallments);
};

const sumAmount = (records, field = 'amount') => {
    return records.reduce((total, record) => total + Number(record[field] || 0), 0);
};

exports.createFee = async (req, res, next) => {
    try {
        const { id: adminId } = req.user;
        const { studentId, feeType, amount, paymentOption, numberOfInstallments = 1 } = req.body;

        const student = await studentModel.findOne({ where: { id: studentId, adminId } });
        if (!student) return next({ message: 'student not found', statusCode: 404 });

        if (!['full payment', 'installment'].includes(paymentOption)) {
            return next({ message: 'invalid paymentOption', statusCode: 400 });
        }

        if (paymentOption === 'installment' && Number(numberOfInstallments) < 2) {
            return next({ message: 'numberOfInstallments must be at least 2', statusCode: 400 });
        }

        const fee = await feeModel.create({
            adminId,
            studentId,
            feeType,
            amount,
            paymentOption,
            numberOfInstallments,
            payableAmount: getPayableAmount(Number(amount), paymentOption, Number(numberOfInstallments))
        });

        res.status(201).json({ message: 'fee created successfully', fee });
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
        const { studentId } = req.params;

        const student = await studentModel.findOne({
            where: { id: studentId, adminId },
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
            return next({ message: 'student not found', statusCode: 404 });
        }

        const fees = await feeModel.findAll({ where: { adminId, studentId } });
        const payments = await paymentModel.findAll({
            where: { adminId, studentId },
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
            return next({ message: 'fee not found', statusCode: 404 });
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
        if (!deletedFee) return next({ message: 'fee not found', statusCode: 404 });

        res.status(200).json({ message: 'fee deleted successfully' });
    } catch (error) {
        next(error);
    }
};
