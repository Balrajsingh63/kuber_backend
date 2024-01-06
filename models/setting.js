const mongoose = require("mongoose");

const settingModel = new mongoose.Schema({
    appBlock: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
module.exports = mongoose.model("Setting", settingModel);
