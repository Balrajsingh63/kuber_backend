const mongoose = require('mongoose');

const UserModel = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    mobile: {
        type: String
    },
    age: {
        type: String
    },
    wallet: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        enum: ["Admin", "SubAdmin", "Customer"],
        default: "Customer"
    },
    status: {
        type: String,
        enum: ["Active", "Deactivate"],
        default: "Active"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserModel);