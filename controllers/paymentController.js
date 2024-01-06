const paymentModel = require("../models/paymentModel");

class Payment {
    async list(req, res) {
        let data = paymentModel.find({}).populate("userId");
        return res.json({
            status: true,
            data: data
        });
    }
}

module.exports = new Payment();