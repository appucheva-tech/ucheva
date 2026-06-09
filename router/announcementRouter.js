const router = require('express').Router()
const { createAnnouncement } = require('../controller/announcementController')
const {  checkAdmin } = require('../middleware/authenticator');

router.post('/announcement',checkAdmin, createAnnouncement)

module.exports = router