const mongoose = require("mongoose");

const resultModel = new mongoose.Schema({
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "games"
    },
    number: {
        type: Number
    },
    startTime: {
        type: String
    },
    endTime: {
        type: String
    },
    date: {
        type: Date
    },
    updateWallet: {
        type: Date
    },
    status: {
        type: String,
        enum: ["active", "deactive"],
        default: "active"
    }
}, {
    timestamps: true
})
module.exports = mongoose.model("Result", resultModel);