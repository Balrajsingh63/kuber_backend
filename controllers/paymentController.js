const paymentModel = require("../models/paymentModel");
const WithdrawalMoney = require("../models/moneyRequestModel");

class PaymentController {
    async list(req, res) {
        let data = await paymentModel.aggregate([{
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "users"

            }
        }, {
            $unwind: "$users"
        }, {
            $project: {
                "userId": 1,
                "gameRequestId": 1,
                "transactionId": 1,
                "paymentStatus": 1,
                "date": 1,
                "createdAt": 1,
                "updatedAt": 1,
                "userName": "$users.name"
            }
        }]);
        return res.json({
            status: true,
            data: data,
            message: "Payment List"
        });
    }

    async approvedWithdrawalRequest(req, res) {
        const { requestId, status } = req.body;
        const request = await WithdrawalMoney.findOne({
            _id: requestId
        });
        await request.updateOne({ status: "approve" });
        return res.json({
            status: true,
            message: "Payment request status successfully changed"
        })
    }
}

module.exports = new PaymentController();