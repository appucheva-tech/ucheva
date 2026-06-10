const securityModel = require('../models/security');

exports.updateSecurity = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { firstName, lastName, staffType, address, phoneNumber, email } = req.body;

        const security = await securityModel.findByPk(id);
        if (!security) {
            return res.status(404).json({
                message: 'security not found'
            });
        }

        await security.update({
            firstName,
            lastName,
            staffType,
            address,
            phoneNumber,
            email
        });

        res.json({
            message: 'security updated successfully',
            security: {
                id: security.id,
                firstName: security.firstName,
                lastName: security.lastName,
                staffType: security.staffType,
                address: security.address,
                phoneNumber: security.phoneNumber,
                email: security.email
            }
        });
    } catch (error) {
        next(error);
    }
};