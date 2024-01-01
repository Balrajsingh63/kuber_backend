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

    // async userRegister(req, res) {
    //     try {
    //         const { name, phone, password, email } = req.body;
    //         await userModel.create({
    //             name: name,
    //             // email:email,
    //             mobile: (phone),
    //             password: await bcrypt.hashSync(password, saltRounds),
    //             role: "Customer",
    //             status: "Deactive"
    //         })
    //         res.status(201).json({
    //             status: true,
    //             message: "User register successfully."
    //         })
    //     } catch (error) {
    //         console.log(error.message)
    //         return res.status(500).json({
    //             message: "Somthing want worng ! try again later"
    //         })
    //     }

    // }
}

module.exports = new AdminAuthController();