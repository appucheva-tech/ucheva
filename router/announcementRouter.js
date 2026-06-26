const router = require('express').Router();
const { checkAdmin } = require('../middleware/authenticator');
const {
    createAnnouncement,
    getAnnouncementDashboard,
    getAnnouncementByPk
} = require('../controller/announcementController');

router.get('/dashboard', checkAdmin, getAnnouncementDashboard);
router.post('/', checkAdmin, createAnnouncement);
router.get('/announce/:id', checkAdmin, getAnnouncementByPk)


module.exports = router;
