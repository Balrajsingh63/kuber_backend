const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/mobile/paymentController');
const { getToken } = require('../../middleware/authenticationMiddleware');

router.get("/", getToken, paymentController.paymentHistory);
router.post("/", getToken, paymentController.storePayment);

module.exports = router;