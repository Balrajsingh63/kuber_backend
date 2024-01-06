const paymentModel = require("../models/paymentModel");

class PaymentController {
    async list(req, res) {
        let data = await paymentModel.find({}).populate("userId");
        return res.json({
            status: true,
            data: data,
            message: "Payment List"
        });
    }
}

module.exports = new PaymentController();