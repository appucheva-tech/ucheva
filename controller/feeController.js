const feeModel = require('../models/feestructure');
const classModel = require('../models/schoolclass');

exports.createFeeStructure = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { classId, feeType, amount, paymentOption, numberOfInstallments } = req.body;

        const fetchClass = await classModel.findByPk(classId);
        if (!fetchClass) {
            return res.status(404).json({
                message: 'class not found'
            });
        }

        if (fetchClass.adminId !== id) {
            return res.status(403).json({
                message: 'unauthorized access to this class'
            });
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

        const feeStructure = await feeModel.create({
            adminId: id,
            classId,
            feeType: feeType.toLowerCase().replace(/\s+/g, '_'),
            amount,
            paymentOption,
            numberOfInstallments: paymentOption === 'installment' ? numberOfInstallments : null,
            payableAmount
        });

        res.status(201).json({
            message: 'Fee structure created successfully',
            feeStructure
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllFeeStructures = async (req, res, next) => {
    try {
        const { id } = req.user;
        const feeStructures = await feeModel.findAll({
            where: { adminId: id },
            include: {
                model: classModel,
                as: 'classes',
                attributes: ['className', 'selectSection']
            },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            message: 'Fee structures retrieved successfully',
            feeStructures
        });
    } catch (error) {
        next(error);
    }
};

exports.getFeeStructureById = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { feeId } = req.params;

        const feeStructure = await feeModel.findOne({
            where: { id: feeId, adminId: id },
            include: {
                model: classModel,
                as: 'classes',
                attributes: ['className', 'selectSection']
            }
        });

        if (!feeStructure) {
            return res.status(404).json({
                message: 'Fee structure not found'
            });
        }

        res.status(200).json({
            message: 'Fee structure retrieved successfully',
            feeStructure
        });
    } catch (error) {
        next(error);
    }
};

exports.updateFeeStructure = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { feeId } = req.params;
        const { feeType, amount, paymentOption, numberOfInstallments } = req.body;

        const feeStructure = await feeModel.findOne({
            where: { id: feeId, adminId: id }
        });

        if (!feeStructure) {
            return res.status(404).json({
                message: 'Fee structure not found'
            });
        }

        let payableAmount = feeStructure.payableAmount;
        if (paymentOption === 'installment') {
            const installments = numberOfInstallments || feeStructure.numberOfInstallments;
            if (!installments || installments < 2) {
                return res.status(400).json({
                    message: 'number of installments must be at least 2 for installment payment'
                });
            }
            payableAmount = Math.floor((amount || feeStructure.amount) / installments);
        } else if (paymentOption === 'full payment') {
            payableAmount = null;
        }

        const updateData = {};
        if (feeType) updateData.feeType = feeType.toLowerCase().replace(/\s+/g, '_');
        if (amount) updateData.amount = amount;
        if (paymentOption) updateData.paymentOption = paymentOption;
        if (paymentOption === 'installment' && numberOfInstallments) {
            updateData.numberOfInstallments = numberOfInstallments;
        }
        if (paymentOption === 'full payment') {
            updateData.numberOfInstallments = null;
        }
        if (payableAmount !== undefined) updateData.payableAmount = payableAmount;

        await feeModel.update(updateData, { where: { id: feeId } });

        const updatedFee = await feeModel.findByPk(feeId);

        res.status(200).json({
            message: 'Fee structure updated successfully',
            feeStructure: updatedFee
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteFeeStructure = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { feeId } = req.params;

        const feeStructure = await feeModel.findOne({
            where: { id: feeId, adminId: id }
        });

        if (!feeStructure) {
            return res.status(404).json({
                message: 'Fee structure not found'
            });
        }

        await feeModel.destroy({ where: { id: feeId } });

        res.status(200).json({
            message: 'Fee structure deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
