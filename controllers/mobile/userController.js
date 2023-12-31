const User = require("../../models/userModel");
class UserController {

    async index() {
        const user = await User.find({});
        return res.json({
            data: users,
            message: "User list"
        })
    }
    // async store(req,res) {

    // }
    //  async index() {

    // } async index() {

    // } async index() {

    // }
}
module.exports = new UserController();