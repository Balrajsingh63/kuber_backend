const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/mobile/paymentController');
const { getToken } = require('../../middleware/authenticationMiddleware');
// router.post('/payment', paymentController.paymentInit);
// router.post('/instamojo/access-token', paymentController.instaMojoInitCreateAccessToken);
// router.post('/instamojo/payment-request', paymentController.instaMojoPaymentRequest);
router.get("/transactions", getToken, paymentController.paymentHistory);
module.exports = router;