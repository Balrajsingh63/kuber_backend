const express = require("express");
const paymentController = require("../controllers/paymentController");
const { getToken } = require("../middleware/authenticationMiddleware");
const { isAdmin } = require("../middleware/isAdminMiddleware");
const router = express.Router();

router.get("/payment", getToken, isAdmin, paymentController.list);

module.exports = router;