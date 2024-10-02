/** @format */

class PaymentController {
	/**
	 * Withdrawal Maney Request List apis
	 * @param {*} req
	 * @param {*} res
	 * @returns
	 */
	async withdrawalMoneyList(req, res) {
		const { userId } = req.query;
		let allUsers = await userModel.find({ reference: userId });
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
}
module.exports = new PaymentController();
