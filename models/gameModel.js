const mongoose = require("mongoose");

const gameModel = new mongoose.Schema({
    name: {
        type: String
    },
    // number: {
    //     type: Number
    // },
    startTime: {
        type: String
    },
    endTime: {
        type: String
    },
    // date: {
    //     type: Date
    // },
    status: {
        type: String,
        enum: ["active", "deactive"],
        default: "active"
    }
}, {
    timestamps: true
});
module.exports = mongoose.model("Game", gameModel);