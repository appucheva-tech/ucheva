const router = require('express').Router()
const { createAnnouncement,getAllAnnouncements } = require('../controller/announcementController')
const {  checkAdmin } = require('../middleware/authenticator');

router.post('/announcement',checkAdmin, createAnnouncement)

router.get('/getAllAnnouncements', getAllAnnouncements)

module.exports = router