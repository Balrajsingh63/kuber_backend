const userModel = require("../models/userModel");
const msg = require("../uility/constant");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const saltRounds = 10;

class AdminAuthController {
    async login(req, res) {
        let { email, password } = req.body;
        let user = await userModel.findOne({ email: email, role: "Admin" }).lean();
        if (!user) {
            return res.status(200).json({
                status: false,
                message: msg.Invalid_Record,
                data: []
            });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(200).json({
                status: false,
                message: msg.Password_Not_Match,
                data: []
            });
        }
        let token = jwt.sign(user, process.env.privateKey);
        user.token = token;
        return res.status(200).json({
            status: true,
            message: msg.login_success,
            data: user
        });

    }
}

module.exports = new AdminAuthController();