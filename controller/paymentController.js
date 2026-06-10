const feeModel = require('../models/feestructure');
const paymentModel = require('../models/payment');
const studentModel = require('../models/student');
const walletModel = require('../models/wallet');

const buildReference = () => `UCH-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

const sumAmount = (records, field = 'amount') => {
    return records.reduce((total, record) => total + Number(record[field] || 0), 0);
};

const getSelectedFees = async (studentId, feeIds) => {
    const where = { studentId };

    if (feeIds && feeIds.length) {
        where.id = feeIds;
    }

    return feeModel.findAll({ where });
};

const buildPaymentSummary = (fees, paymentOption, numberOfInstallments) => {
    const totalFees = sumAmount(fees);
    const selectedPaymentOption = paymentOption || 'full payment';
    const installmentCount = Number(numberOfInstallments || 2);
    const amountPayingNow = selectedPaymentOption === 'installment'
        ? Math.ceil(totalFees / installmentCount)
        : totalFees;

    return {
        selectedFees: fees.map((fee) => ({
            id: fee.id,
            feeType: fee.feeType,
            amount: Number(fee.amount)
        })),
        totalFees,
        paymentType: selectedPaymentOption,
        amountPayingNow,
        balance: Math.max(totalFees - amountPayingNow, 0)
    };
};

exports.getPaymentSummary = async (req, res, next) => {
    try {
        const { studentId, feeIds, paymentOption, numberOfInstallments } = req.body;

        const student = await studentModel.findByPk(studentId);
        if (!student) return next({ message: 'student not found', statusCode: 404 });

        const fees = await getSelectedFees(studentId, feeIds);
        if (!fees.length) return next({ message: 'no fees selected', statusCode: 400 });

        res.status(200).json({
            message: 'payment summary retrieved successfully',
            orderSummary: buildPaymentSummary(fees, paymentOption, numberOfInstallments)
        });
    } catch (error) {
        next(error);
    }
};

exports.createPayment = async (req, res, next) => {
    try {
        const {
            studentId,
            feeIds,
            amount,
            paymentType,
            paymentOption,
            numberOfInstallments,
            paymentStatus = 'success',
            reference,
            currency = 'NGN',
            parentName,
            parentEmail,
            staffId
        } = req.body;

        const student = await studentModel.findByPk(studentId);
        if (!student) return next({ message: 'student not found', statusCode: 404 });

        const paymentStaffId = staffId || student.staffId;
        if (!paymentStaffId) return next({ message: 'staffId is required', statusCode: 400 });

        if (!['card', 'bank transfer', 'mobile payment'].includes(paymentType)) {
            return next({ message: 'invalid paymentType', statusCode: 400 });
        }
        if (!['pending', 'success', 'failed'].includes(paymentStatus)) {
            return next({ message: 'invalid paymentStatus', statusCode: 400 });
        }

        const fees = await getSelectedFees(studentId, feeIds);
        if (!fees.length) return next({ message: 'no fees selected', statusCode: 400 });

        const summary = buildPaymentSummary(fees, paymentOption, numberOfInstallments);
        const amountToPay = amount !== undefined ? Number(amount) : summary.amountPayingNow;

        const payment = await paymentModel.create({
            adminId: student.adminId,
            studentId,
            staffId: paymentStaffId,
            amount: amountToPay,
            paymentType,
            paymentStatus,
            reference: reference || buildReference(),
            currency,
            paymentDate: new Date(),
            parentName: parentName || student.parentGuardiansName,
            parentEmail: parentEmail || student.email
        });

        if (paymentStatus === 'success') {
            const wallet = await walletModel.findOne({ where: { adminId: student.adminId } });
            if (wallet) {
                await wallet.update({
                    paymentReceived: Number(wallet.paymentReceived || 0) + amountToPay,
                    balance: Number(wallet.balance || 0) + amountToPay,
                    totalTransaction: Number(wallet.totalTransaction || 0) + 1
                });
            }
        }

        res.status(201).json({
            message: 'payment created successfully',
            payment,
            orderSummary: {
                ...summary,
                amountPayingNow: amountToPay,
                balance: Math.max(summary.totalFees - amountToPay, 0)
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getPaymentHistory = async (req, res, next) => {
    try {
        const { studentId } = req.params;

        const student = await studentModel.findByPk(studentId);
        if (!student) return next({ message: 'student not found', statusCode: 404 });

        const payments = await paymentModel.findAll({
            where: { studentId },
            order: [['paymentDate', 'DESC']]
        });

        res.status(200).json({ message: 'payment history retrieved successfully', student, payments });
    } catch (error) {
        next(error);
    }
};
