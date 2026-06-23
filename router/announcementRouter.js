const router = require('express').Router();
const { checkAdmin } = require('../middleware/authenticator');
const {
    createAnnouncement,
    getAnnouncementDashboard
} = require('../controller/announcementController');

router.get('/dashboard', checkAdmin, getAnnouncementDashboard);
router.post('/', checkAdmin, createAnnouncement);

module.exports = router;
