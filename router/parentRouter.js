const router = require('express').Router()
const { createPassword, changePassword, parentSettings, parentDashboard, getAllStudent, getOneStudent } = require('../controller/parentController')
const { checkParent } = require('../middleware/authenticator')
const upload = require('../middleware/multer')


router.post('/update-password', checkParent, changePassword)
router.put('/settings', checkParent, upload.single('profilePicture'), parentSettings)
router.get('/parentdashboard/:studentId', checkParent, parentDashboard)
router.get('/students', checkParent, getAllStudent)
router.get('/student', checkParent, getOneStudent)

module.exports = router;