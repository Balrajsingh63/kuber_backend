/** @format */

const paymentModel = require("../models/paymentModel");
const WithdrawalMoney = require("../models/moneyRequestModel");
const userModel = require("../models/userModel");

class PaymentController {
	async list(req, res) {
		let data = await paymentModel.aggregate([
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "users",
				},
			},
			{
				$unwind: "$users",
			},
			{
				$project: {
					userId: 1,
					gameRequestId: 1,
					transactionId: 1,
					paymentStatus: 1,
					date: 1,
					createdAt: 1,
					updatedAt: 1,
					userName: "$users.name",
				},
			},
		]);
		return res.json({
			status: true,
			data: data,
			message: "Payment List",
		});
	}
	async approvedWithdrawalRequest(req, res) {
		const { requestId, status } = req.body;
		const request = await WithdrawalMoney.findOne({
			_id: requestId,
		});
		await request.updateOne({ status: "approve" });
		return res.json({
			status: true,
			message: "Payment request status successfully changed",
		});
	}
	async withdrawalMoneyList(req, res) {
		const { _id } = req.user;
		let allUsers = await userModel.find({ reference: _id });
		const list = await WithdrawalMoney.find({
			userId: {
				$in: allUsers.flatMap((v) => v._id),
			},
		});
		return res.json({
			status: true,
			data: list,
		});
	}
	async addPaymentUserWallet(req, res) {
		try {
			const { mobile, price } = req.body;
			const findUser = await userModel.findOne({ mobile });
			if (!findUser) {
				return res.json({
					status: false,
					message: "User not found.",
				});
			}
			const user = await userModel.findOneAndUpdate(
				{ mobile },
				{ $inc: { wallet: price } },
			);
			return res.json({
				status: true,
				message: "Wallet updated successfullly.",
			});
		} catch (error) {
			return res.json({
				status: false,
				message: error.message,
			});
		}
	}
}

module.exports = new PaymentController();
