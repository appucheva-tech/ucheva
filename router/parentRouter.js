const { createPassword, changePassword, parentSettings } = require('../controller/parentController')
const { checkParentInvite } = require('../middleware/authenticator')
const upload = require('../middleware/multer')

const router = require('express').Router()

router.post('/create-password', checkParentInvite, createPassword)
router.post('/update-password', checkParentInvite, changePassword)
router.put('/settings', checkParentInvite, upload.single('profilePicture'), parentSettings)

module.exports = router