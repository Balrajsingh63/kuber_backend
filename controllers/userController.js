const userModel = require("../models/userModel");
const bcrypt = require('bcrypt');
const saltRounds = 10;
class UserController {
    async index(req, res) {
        const users = await userModel.find({ role: { $ne: "Admin" } });
        return res.status(200).json({
            data: users,
            status: true,
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