const mongoose = require("mongoose");

const paymentModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "users"
    },
    transactionId: {
        type: String
    },
    paymentStatus: {
        type: String
    },
    date: {
        type: Date
    }
}, {
    timestamps: true
});
module.exports = mongoose.model("payment", paymentModel);