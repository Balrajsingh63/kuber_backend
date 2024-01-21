const mongoose = require("mongoose");
const MoneyRequestModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    amount: {
        type: Number
    },
    upi: {
        type: String
    },
    date: {
        type: Date
    },
    status: {
        type: String,
        enum: ['approve', "reject", "pending"],
        default: "pending"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('WithdrawalMoney', MoneyRequestModel);  