const mongoose = require("mongoose");

const gameModel = new mongoose.Schema({
    name: {
        type: String
    },
    resultTime: {
        type: String
    },
    startTime: {
        type: String
    },
    endTime: {
        type: String
    },
    status: {
        type: String,
        enum: ["active", "deactive"],
        default: "active"
    }
}, {
    timestamps: true
});
module.exports = mongoose.model("Game", gameModel);