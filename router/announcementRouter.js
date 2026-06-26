const router = require('express').Router();
const { checkAdmin } = require('../middleware/authenticator');
const {
    createAnnouncement,
    getAnnouncementDashboard,
    getAnnouncementByPk,
    deleteAnnouncement,
    updateAnnoucement
} = require('../controller/announcementController');

router.get('/dashboard', checkAdmin, getAnnouncementDashboard);
router.post('/', checkAdmin, createAnnouncement);
router.get('/:id', checkAdmin, getAnnouncementByPk)
router.delete('/:id', checkAdmin, deleteAnnouncement)
router.put('/update', checkAdmin, updateAnnoucement)


module.exports = router;
