const router = require('express').Router();
const { checkAdmin } = require('../middleware/authenticator');
const {
    createAnnouncement,
    getAnnouncementDashboard,
    getAnnouncementByPk,
    deleteAnnouncement
} = require('../controller/announcementController');

router.get('/dashboard', checkAdmin, getAnnouncementDashboard);
router.post('/', checkAdmin, createAnnouncement);
router.get('/announce/:id', checkAdmin, getAnnouncementByPk)
router.delete('/announce/:id', checkAdmin, deleteAnnouncement)


module.exports = router;
