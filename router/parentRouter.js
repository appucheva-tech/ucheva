const { createPassword, changePassword, parentSettings } = require('../controller/parentController')
const { checkParent } = require('../middleware/authenticator')
const upload = require('../middleware/multer')

const router = require('express').Router()

router.post('/update-password', checkParent, changePassword)
router.put('/settings', checkParent, upload.single('profilePicture'), parentSettings)

module.exports = router