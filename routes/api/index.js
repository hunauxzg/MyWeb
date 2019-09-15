const express = require('express');
const router = express.Router();

router.use( '/system', require('./system') );

module.exports = router;
