const mongoose = require("mongoose");

const gameModel = new mongoose.Schema({
    gameName: {
        type: String
    },
    gameNumber: {
        type: Number
    },
    gameStartTime: {
        type: String
    },
    gameEndTime: {
        type: String
    },
    gameDate: {
        type: Date
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