/** @format */

const userModel = require("../../models/userModel");
const msg = require("../../uility/constant");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

class AuthController {
	/**
	 * Login Super Admin apis
	 * @param {*} req
	 * @param {*} res
	 * @returns
	 */
	async login(req, res) {
		const { email, password } = req.body;
		let user = await userModel
			.findOne({
				email: email,
				role: "SuperAdmin",
			})
			.lean();
		if (!user) {
			return res.status(200).json({
				status: false,
				message: msg.Invalid_Record,
				data: [],
			});
		}
		const match = await bcrypt.compare(password, user.password);
		if (match) {
			return res.status(200).json({
				status: false,
				message: msg.Password_Not_Match,
				data: [],
			});
		}
		let token = jwt.sign(user, process.env.privateKey);
		user.token = token;
		return res.status(200).json({
			status: true,
			message: msg.login_success,
			data: user,
		});
	}
	/**
	 * Block Admin apis
	 * @returns
	 */
	async blockAdmin() {
		const { userId } = req.body;
		const getUser = await userModel.findOne({ _id: userId });
		getUser.updateOne({ isBlock: !getUser.isBlock }, { returnDocument: "after" });
		return res.status(200).json({
			status: true,
			message: getUser.isBlock
				? "User Block succeefully"
				: "User Unblock succeefully",
			data: getUser,
		});
	}
}
module.exports = new AuthController();
