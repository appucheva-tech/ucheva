const router = require('express').Router();
const { checkAdmin, authenticate } = require('../middleware/authenticator');
const {
    createAnnouncement,
    getAnnouncementDashboard,
    getAnnouncementByPk,
    deleteAnnouncement,
    updateAnnoucement,
    getAllAnnouncement
} = require('../controller/announcementController');

router.get('/dashboard', checkAdmin, getAnnouncementDashboard);
router.get('/recent-announcement', authenticate, getAllAnnouncement )
router.post('/', checkAdmin, createAnnouncement);
router.get('/:id', checkAdmin, getAnnouncementByPk)
router.delete('/:id', checkAdmin, deleteAnnouncement)
router.put('/update/:id', checkAdmin, updateAnnoucement)


module.exports = router;
