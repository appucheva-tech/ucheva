const announcementModel = require('../models/announcement')
const admin = require('../models/admin')

exports.createAnnouncement = async (req, res, next)=>{
    try {
        const {id} = req.user
        const getAdmin = await admin.findByPk(id)
        const { announcementTitle, announcementContent, audience ,sendOption,scheduleTime } = req.body
            
            if(sendOption === 'scheduled' && new Date(scheduleTime) <= new Date()){
                return res.status(400).json({
                    message: 'scheduleTime must be a future date and time'
                })
            };

        const announcement = await announcementModel.create({
            schoolUrl: getAdmin.schoolUrl,
            announcementTitle,
            announcementContent,
            audience,
            sendOption,
            scheduleTime: sendOption === 'scheduled' ? new Date(scheduleTime) : null,
            adminId: id,
        })
        res.status(201).json({
            message: 'Announcement created successfully',
            announcement
        })
    } catch (error) {
        next(error)
    }
}

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