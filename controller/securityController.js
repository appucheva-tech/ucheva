const securityModel = require('../models/security');
const announcementModel = require('../models/announcement')

exports.securitySettings = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { firstName, lastName, address } = req.body;

        const security = await securityModel.findByPk(id);
        if (!security) {
            return res.status(404).json({
                message: 'security not found'
            });
        }

        await security.update({
            firstName,
            lastName,
            address,
        });

        res.json({
            message: 'security updated successfully',
            security: {
                id: security.id,
                firstName: security.firstName,
                lastName: security.lastName,
                address: security.address,
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllAnnouncements = async (req, res, next)=>{
    try {
        const announcements = await announcementModel.findAll()
        if(announcements.length === 0){
            return res.status(404).json({
                message: 'No announcements found'
            })         
        }
        res.status(200).json({
            message: 'Announcements retrieved successfully',
            announcements
        })
    } catch (error) {
        next(error)
    }
}