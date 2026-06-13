const router = require('express').Router()
const { createScores } = require('../controller/scoresController')


router.post('/mark-score', createScores)

module.exports = router