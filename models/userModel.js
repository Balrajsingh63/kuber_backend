/** @format */

const mongoose = require("mongoose");

const UserModel = new mongoose.Schema(
	{
		name: {
			type: String,
		},
		email: {
			type: String,
		},
		password: {
			type: String,
		},
		reffrenceId: {
			type: String,
		},
		reference: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
		},
		mobile: {
			type: String,
		},
		age: {
			type: String,
		},
		wallet: {
			type: Number,
			default: 0,
		},
		role: {
			type: String,
			enum: ["SuperAdmin", "Admin", "SubAdmin", "Customer"],
			default: "Customer",
		},
		status: {
			type: String,
			enum: ["Active", "Deactivate"],
			default: "Active",
		},
		isBlock: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("User", UserModel);
