const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/mobile/paymentController');
const { getToken } = require('../../middleware/authenticationMiddleware');

router.get("/", getToken, paymentController.paymentHistory);
router.post("/", getToken, paymentController.storePayment);
router.post("/withdrawal-request", getToken, paymentController.withdrawalMoneyRequest);
router.post("/cancel/withdrawal-request", getToken, paymentController.cancelWithdrawalRequest);
router.get("/withdrawal-request-list", getToken, paymentController.requestList);
router.get("/paytm-token-request", getToken, paymentController.paytmTokenRequest);

module.exports = router;