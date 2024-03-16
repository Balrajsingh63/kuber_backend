const mongoose = require("mongoose");
const RequestModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "game"
    },
    gameNumber: [{
        number: {
            type: Number
        },
        price: {
            type: Number
        }
    }],
    date: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', "deactivate"],
        default: "active"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('GameRequest', RequestModel);  