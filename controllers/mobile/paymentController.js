const WithdrawalMoney = require("../../models/moneyRequestModel");
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
        const transactions = await Payment.aggregate([{
            $match: { userId: req.user._id }
        }, {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "users"
            }
        }, {
            $unwind: {
                path: "$users",
                preserveNullAndEmptyArrays: true
            }
        }]);
        return res.json({
            status: true,
            data: transactions
        });
    }
    /**
      * Payment History
      * @param {*} req 
      * @param {*} res 
      */
    async storePayment(req, res) {
        try {
            const { transactionId, paymentStatus, gameRequestId, amount } = req.body;
            let store = await Payment.create({
                userId: req.user._id,
                date: new Date(),
                transactionId,
                paymentStatus,
                amount: amount,
                gameRequestId: gameRequestId != "" ? gameRequestId : null
            })
            let transactions = await Transaction.create({
                userId: req.user._id,
                type: 'credit',
                Date: new Date(),
                amount: amount,
                status: "active"
            });
            const user = await userModel.findOne({ "_id": req.user._id });
            await user.updateOne({ wallet: Number(user.wallet) + Number(amount) });
            console.log(user);
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


    async withdrawalMoneyRequest(req, res) {
        try {
            const { _id } = req.user;
            const { amount, upi } = req.body;
            const request = await WithdrawalMoney.create({
                amount,
                upi,
                userId: _id,
                date: new Date(),
                status: "pending"
            });
            const payment = await Payment.create({
                userId: _id,
                date: new Date(),
                transactionId: request._id,
                paymentStatus: "pending",
                amount: amount,
                // gameRequestId: gameRequestId != "" ? gameRequestId : null
            });
            let transactions = await Transaction.create({
                userId: _id,
                type: 'debit',
                Date: new Date(),
                amount: amount,
                status: "active"
            });
            const user = await userModel.findOne({ "_id": _id });
            await user.updateOne({ wallet: Number(user.wallet) - Number(amount) });

            return res.json({
                status: true,
                message: "Your withdrawal request successfully sent",
                data: user
            });
        } catch (error) {
            console.log(error.message)
            return res.json({
                status: false,
                message: "Somthing want worng ! try again later",
                data: {}
            });
        }

    }

    async cancelWithdrawalRequest(req, res) {
        try {
            const { requestId } = req.body
            const { _id } = req.user;
            const request = await WithdrawalMoney.findOne({
                _id: requestId
            });
            await request.updateOne({ status: "reject" })
            const payment = await Payment.findOneAndUpdate({ userId: _id, transactionId: requestId }, {
                paymentStatus: "cancel",
            });
            let transactions = await Transaction.create({
                userId: _id,
                type: 'debit',
                Date: new Date(),
                amount: request?.amount,
                status: "cancel"
            });
            const user = await userModel.findOne({ "_id": _id });
            await user.updateOne({ wallet: Number(user.wallet) + Number(request?.amount) });
            return res.json({
                status: true,
                message: "Your request cancel successfully",
                data: user
            })

        } catch (error) {
            console.log(error.message)
            return res.json({
                status: false,
                message: "Somthing want worng ! try again later",
                data: {}
            });
        }

    }

    async requestList(req, res) {
        const { _id } = req.user;
        const list = await WithdrawalMoney.find({});
        return res.json({
            status: true,
            data: list
        })
    }
}
module.exports = new PaymentController();
