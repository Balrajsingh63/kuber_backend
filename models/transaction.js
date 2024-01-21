const mongoose = require("mongoose");
const TransactionModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "users"
    },
    type: {
        type: String,
        enum: ['credit', "debit"],
    },
    Date: {
        type: Date
    },
    amount: {
        type: Number
    },
    status: {
        type: String,
        enum: ['active', "deactivate", "cancel"],
        default: "active"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TransactionModel', TransactionModel);  