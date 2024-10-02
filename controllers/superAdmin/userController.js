/** @format */

const { default: mongoose } = require("mongoose");
const User = require("../../models/userModel");
const { createReference } = require("../../uility/helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
class UserController {
	/**
	 * List Of Admin List
	 * @param {*} req
	 * @param {*} res
	 * @returns
	 */
	async index(req, res) {
		const list = await User.aggregate([
			{
				$match: {
					role: "Admin",
				},
			},
		]);
		return res.json({ data: list, status: true });
	}
	/**
	 * Admin Show Information By Id
	 * @param {*} req
	 * @param {*} res
	 * @returns
	 */
	async show(req, res) {
		const { id } = req.params;
		console.log({ id });

		const list = await User.aggregate([
			{
				$match: {
					_id: new mongoose.Types.ObjectId(id),
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "reference",
					foreignField: "_id",
					as: "customers",
				},
			},
			{
				$project: {
					_id: 1,
					name: 1,
					email: 1,
					reffrenceId: 1,
					mobile: 1,
					wallet: 1,
					role: 1,
					status: 1,
					isBlock: 1,
					createdAt: 1,
					updatedAt: 1,
					customers: 1,
				},
			},
		]);
		console.log({ list });

		return res.json({ data: list[0], status: true });
	}
	/**
	 * Admin Register Apis
	 * @param {*} req
	 * @param {*} res
	 * @returns
	 */
	async adminRegister(req, res) {
		try {
			const { email, password, mobile, name } = req.body;
			let userCheck = await User.findOne({ email: email });
			if (userCheck) {
				return res.json({
					status: false,
					message: "Admin already exist on this email",
				});
			}
			let reffrenceId = createReference();
			await User.create({
				email: email,
				name: name,
				password: await bcrypt.hashSync(password, saltRounds),
				role: "Admin",
				mobile: mobile,
				reffrenceId: reffrenceId,
			});
			res.status(201).json({
				status: true,
				message: "User register successfully.",
			});
		} catch (error) {
			console.log(error.message);
			return res.status(500).json({
				message: "Somthing want worng ! try again later",
			});
		}
	}
}

module.exports = new UserController();
