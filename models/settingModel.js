const mongoose = require('mongoose');
const settingModel = new mongoose.Schema({

}, {
    timestamps: true
})
module.exports = mongoose.model("Setting", settingModel);