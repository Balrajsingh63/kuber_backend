const paymentModel = require("../models/paymentModel");

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
}

module.exports = new PaymentController();