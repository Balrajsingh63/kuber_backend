const mongoose = require("mongoose");
const RequestModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "users"
    },
    type: {
        type: String,
    },
    gameNumber: [{
        number: {
            type: Number
        },
        price: {
            type: Number
        }
    }],
    gameDate: {
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

module.exports = mongoose.model('GameRequestModel', RequestModel);  