const mongoose = require("mongoose");

const gameModel = new mongoose.Schema({

    gameNumber: {
        type: Number
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