/** @format */

const mongoose = require("mongoose");

const gameModel = new mongoose.Schema(
	{
		name: {
			type: String,
		},
		resultTime: {
			type: String,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
		},
		startTime: {
			type: String,
		},
		endTime: {
			type: String,
		},
		status: {
			type: String,
			enum: ["active", "deactive"],
			default: "active",
		},
	},
	{
		timestamps: true,
	},
);
module.exports = mongoose.model("Game", gameModel);
