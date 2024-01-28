const express = require("express");
const paymentController = require("../controllers/paymentController");
const { getToken } = require("../middleware/authenticationMiddleware");
const { isAdmin } = require("../middleware/isAdminMiddleware");
const router = express.Router();

router.get("/", getToken, isAdmin, paymentController.list);
router.get("/withdrawal-list", getToken, isAdmin, paymentController.withdrawalMoneyList)
router.post("/approve-request", getToken, isAdmin, paymentController.approvedWithdrawalRequest);

module.exports = router;