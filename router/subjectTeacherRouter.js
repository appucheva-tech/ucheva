const router = require('express').Router()

const { createScores } = require('../controller/scoresController')
const { checkStaff } = require('../middleware/authenticator');


router.post('/mark-score', checkStaff, createScores)