const router = require('express').Router()
const { createPassword, changePassword, parentSettings, parentDashboard } = require('../controller/parentController')
const { checkParent } = require('../middleware/authenticator')
const upload = require('../middleware/multer')


router.post('/update-password', checkParent, changePassword)
router.put('/settings', checkParent, upload.single('profilePicture'), parentSettings)
router.get('/parentdashboard', checkParent, parentDashboard)

module.exports = router