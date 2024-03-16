const User = require("../../models/userModel");
class UserController {

    async index() {
        const user = await User.find({});
        return res.json({
            data: users,
            message: "User list",
            status: true
        })
    }

    async userDetail(req, res) {
        const user = await User.findOne({ _id: req.user._id });
        return res.json({
            data: user,
            message: "User Detail list",
            status: true
        })
    }
}
module.exports = new UserController();