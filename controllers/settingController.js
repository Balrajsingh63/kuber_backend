const { default: mongoose } = require("mongoose");
const setting = require("../models/setting");

class SettingController {
    async allSetting(req, res) {
        const { _id, appBlock } = req.body;
        const setting = await setting.findOneAndUpdate({ _id: mongoose.Types.ObjectId(_id) },
            { appBlock },
            { upsert: true }
        )
        return res.json({
            status: true,
            message: "Setting updated successfully.",
            data: setting
        })
    }

    async getSetting(req, res) {
        const setting = await setting.findOne({});
        return res.json({
            status: true,
            message: "Setting data",
            data: setting
        });

    }

}
module.exports = new SettingController();