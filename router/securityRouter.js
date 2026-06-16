const router = require('express').Router()

router.put('/update-security', checkStaff, securitySettings);
