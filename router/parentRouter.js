const router = require('express').Router()
const { logoutUser } = require('../controller/adminController')
const { createPassword, changePassword, parentSettings, parentDashboard, getAllStudent, getOneStudent } = require('../controller/parentController')
const { checkParent, authenticate } = require('../middleware/authenticator')
const upload = require('../middleware/multer')


router.post('/update-password', checkParent, changePassword)
router.put('/settings', checkParent, upload.single('profilePicture'), parentSettings)
router.get('/parentdashboard/:studentId', checkParent, parentDashboard)
router.get('/students', checkParent, getAllStudent)
router.get('/student', checkParent, getOneStudent)
router.post('/logout', authenticate, logoutUser)

module.exports = router;