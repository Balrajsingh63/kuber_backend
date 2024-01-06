const Payment = require("../../models/paymentModel");
class PaymentController {

    /**
     * Payment History
     * @param {*} req 
     * @param {*} res 
     */
    async paymentHistory(req, res) {
        const transactions = await Payment.find({ userId: req.user._id })
            .populate("userId")
            .populate("gameRequestId");
        return res.json({
            status: true,
            data: transactions
        });
    }

    async storePayment(req, res) {
        try {
            const { transactionId, paymentStatus, gameRequestId } = req.body;
            let store = await Payment.create({
                userId: req.user._id,
                date: new Date(),
                transactionId,
                paymentStatus,
                gameRequestId
            })
            return res.json({
                status: true,
                message: "Payment successfully done."
            });
        } catch (error) {
            console.log(error.message)
            return res.json({
                status: false,
                message: "Somthing want worng ! try again later"
            });
        }

    }
}
module.exports = new PaymentController();
