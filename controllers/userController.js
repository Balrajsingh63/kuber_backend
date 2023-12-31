const userModel = require("../models/userModel");
const bcrypt = require('bcrypt');
const saltRounds = 10;
class UserController {
    async index() {
        const user = await User.find({ $ne: { role: "Admin" } });
        return res.json({
            data: users,
            message: "User list"
        })
    }
    async userRegister(req, res) {
        let { name, email, mobile, age, password } = req.body;
        let hasPassword = await bcrypt.hash(password, saltRounds);
        let user = await userModel.create({
            name: name,
            email: email,
            mobile: mobile,
            age: age,
            password: hasPassword,
            status: "Active"
        })
    }

}
module.exports = new UserController();