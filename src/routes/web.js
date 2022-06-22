const express = require('express');
const router = express.Router()
const { getQr } = require('../controllers/general')

router.use('/qr', getQr)

module.exports = router