const Payment = require("../../models/paymentModel");
const sdk = require('api')('@instamojo/v2#40d2ktblgmqonaz');
class PaymentController {

    /**
     * Payment History
     * @param {*} req 
     * @param {*} res 
     */
    async paymentHistory(req, res) {
        const transactions = await Payment.find({ userId: req.user._id });
        return res.json({
            status: true,
            data: transactions
        });
    }
}
module.exports = new PaymentController();
