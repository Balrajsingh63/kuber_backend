const mongoose = require("mongoose");

const paymentModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "users"
    },
    gameRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "gamerequestmodels"
    },
    transactionId: {
        type: String
    },
    paymentStatus: {
        type: String
    },
    amount: {
        type: Number
    },
    date: {
        type: Date
    }
}, {
    timestamps: true
});
module.exports = mongoose.model("payment", paymentModel);