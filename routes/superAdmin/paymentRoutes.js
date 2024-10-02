/** @format */

const express = require("express");
const paymentController = require("../../controllers/superAdmin/paymentController");
const router = express.Router();
router.get("/", paymentController.withdrawalMoneyList);
module.exports = router;
