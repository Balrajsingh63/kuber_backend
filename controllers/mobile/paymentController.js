const Payment = require("../../models/paymentModel");
const Transaction = require("../../models/transaction");
const userModel = require("../../models/userModel");
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
            const { transactionId, paymentStatus, gameRequestId, amount } = req.body;
            let store = await Payment.create({
                userId: req.user._id,
                date: new Date(),
                transactionId,
                paymentStatus,
                gameRequestId
            })
            let transactions = await Transaction.create({
                userId: req.user._id,
                type: 'credit',
                Date: new Date(),
                amount: amount,
                status: "active"
            });
            const user = await userModel.findOne({ "_id": req.user._id }).lean;
            user.wallet = user.wallet + amount;
            await user.save();
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
