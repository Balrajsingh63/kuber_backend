const setting = require("../../models/setting");

class SettingController {
    async settings(req, res) {
        let getSetting = await setting.findOne({});
        return res.json({
            data: data,
            message: "Setting data",
            status: true
        })
    }
}

module.exports = new SettingController();