const { default: mongoose } = require("mongoose");
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

        let checkUser = await userModel.findOne({ mobile });
        if (checkUser) {
            return res.json({
                status: false,
                message: "User already exist on this number"
            })
        }
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

    async userUpdate(req, res) {
        const { id } = req.params;
        const { name, mobile, status } = req.body;
        let update = await userModel.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, {
            name: name,
            // email: email,
            mobile: mobile,
            // age: age,
            status: status
        });
        return res.status(200).json({
            data: update,
            status: true,
            message: "User updated successfully"
        })
    }

    async userDelete(req, res) {
        const { id } = req.params;
        let deleted = await userModel.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id) });
        return res.status(200).json({
            status: true,
            message: "User deleted successfully"
        })
    }
}
module.exports = new UserController();