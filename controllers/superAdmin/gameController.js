/** @format */

const { default: mongoose } = require("mongoose");
const gameModel = require("../../models/gameModel");

class GameController {
	/**
	 * Game List Method
	 * @param {*} req
	 * @param {*} res
	 * @returns
	 */
	async index(req, res) {
		const currentDate = new Date(); // Current date
		const currentDateString = currentDate.toISOString().split("T")[0]; // Get the current date string
		let list = await gameModel.aggregate([
			{
				$match: {
					createdAt: { $lte: currentDate },
				},
			},
			{
				$lookup: {
					from: "results",
					let: { gameId: "$_id" },
					pipeline: [
						{
							$match: {
								$and: [
									{ $expr: { $eq: ["$gameId", "$$gameId"] } }, // Use $expr to compare gameId
									// { $gte: ["$resultTime", currentTime] } // Filter by resultTime being greater than or equal to the current time
								],
							},
						},
						{
							$project: {
								gameId: 1,
								resultTime: 1,
								number: 1,
								createdAtString: {
									$dateToString: {
										format: "%Y-%m-%d",
										date: "$createdAt",
									},
								}, // Project createdAt as a string
							},
						},
						{
							$match: {
								createdAtString: currentDateString, // Compare createdAt date string with the current date string
							},
						},
						{
							$limit: 1,
						},
					],
					as: "result",
				},
			},
			{
				$unwind: {
					path: "$result",
					preserveNullAndEmptyArrays: true,
				},
			},
		]);

		return res.json({
			status: true,
			message: "Game list.",
			data: list,
		});
	}
	/**
	 * Create Game Mehod apis
	 * @param {*} req
	 * @param {*} res
	 * @returns
	 */
	async gameCreate(req, res) {
		const { name, startTime, resultTime, endTime, status } = req.body;
		const storeData = await GameModel.create({
			name,
			resultTime,
			startTime,
			endTime,
			status,
		});
		return res.json({
			status: true,
			message: "Game created successfully.",
		});
	}
	/**
	 * Delete Game Apis
	 * @param {*} req
	 * @param {*} res
	 * @returns
	 */
	async deleteGame(req, res) {
		const { id } = req.params;
		const game = await GameModel.findOneAndDelete({
			_id: new mongoose.Types.ObjectId(id),
		});
		return res.json({
			status: true,
			message: "Game Deleted Successfully.",
		});
	}
	/**
	 * Show Game Apis
	 * @param {*} req
	 * @param {*} res
	 * @returns
	 */
	async showGame(req, res) {
		const { id } = req.params;
		const game = await GameModel.findOne({
			_id: new mongoose.Schema.ObjectId(id),
		});
		return res.json({
			status: true,
			message: "Game show.",
			data: game,
		});
	}
	/**
	 * Update Game APis
	 * @param {*} req
	 * @param {*} res
	 * @returns
	 */
	async updateGame(req, res) {
		const { id } = req.params;
		const { name, startTime, resultTime, endTime, status } = req.body;
		const game = await gameModel.findOneAndUpdate(
			{
				_id: new mongoose.Schema.ObjectId(id),
			},
			{ name, startTime, resultTime, endTime, status },
		);
		return res.json({
			status: true,
			message: "Game updated sucessfully.",
			data: game,
		});
	}
	/**
	 * Game Request List APis
	 * @param {*} req
	 * @param {*} res
	 * @returns
	 */
	async gameRequestList(req, res) {
		const { userId } = req.query;
		const gamesId = await GameModel.find({ userId });
		let gameArr = gamesId.flatMap((v) => v._id);
		let list = await GameRequestModel.aggregate([
			{
				$addFields: {
					today: {
						$dateToString: {
							format: "%Y-%m-%d",
							date: "$date",
						},
					},
				},
			},
			{
				$match: {
					today: { $eq: moment().format("Y-MM-DD").toString() },
					type: { $in: gameArr },
				},
			},
			{
				$lookup: {
					from: "games",
					localField: "type",
					foreignField: "_id",
					as: "games",
				},
			},
			{
				$unwind: "$gameNumber",
			},
			{
				$group: {
					_id: "$gameNumber.number",
					count: { $sum: 1 },
					totalPrice: { $sum: "$gameNumber.price" },
					data: { $addToSet: "$$ROOT" },
				},
			},
		]);
		return res.json({
			status: true,
			message: "Game Request list.",
			data: list,
		});
	}
}

module.exports = new GameController();
