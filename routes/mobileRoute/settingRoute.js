const express = require('express');
const router = express.Router();
const { getToken } = require('../../middleware/authenticationMiddleware');
const settingController = require('../../controllers/mobile/settingController');

router.get("/", getToken, settingController.settings);

module.exports = router;