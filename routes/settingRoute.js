const express = require("express");
const settingController = require("../controllers/settingController");
const router = express.Router();

router.post("/", settingController.allSetting);
router.get("/", settingController.getSetting);


module.exports = router;