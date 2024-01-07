const GameModel = require('../../models/gameModel');
const { ObjectId } = require("mongoose")
const gameRequestModel = require('../../models/gameRequestModel');
const moment = require("moment");
const Transaction = require("../../models/transaction");
const userModel = require('../../models/userModel');
class GameController {
    /**
    * Game Request
    * @param {*} req
    * @param {*} res
    * @returns
   */
    async gameList(req, res) {
        let list = await GameModel.aggregate([{
            $lookup: {
                from: "results",
                localField: "_id",
                foreignField: "gameId",
                as: "result"
            }
        }, {
            $unwind: {
                path: "$result",
                preserveNullAndEmptyArrays: true
            }
        }]);
        return res.json({
            status: true,
            message: "Game list.",
            data: list
        })
    }
    /**
     * Game Play Request
     * @param {*} req
     * @param {*} res
     * @returns
    */
    async gamePlay(req, res) {
        try {
            let { gameNumber, type } = req.body;
            let game = await GameModel.findOne({ _id: type });
            if ((moment().format("DD-MM-Y") + " " + game.startTime) > moment().format("DD-MM-Y HH:mm") && ((moment().format("DD-MM-Y") + " " + game.endTime) < moment().format("DD-MM-Y HH:mm"))) {
                return res.json({
                    message: "Game request not available this time",
                    status: false,
                    data: gameReq
                })
            }
            const user = await userModel.findOne({ _id: req.user._id });
            const sum = gameNumber?.reduce((accumulator, object) => {
                return accumulator + object.price;
            }, 0);
            if (user.wallet < sum) {
                return res.json({
                    status: false,
                    message: `Please add money your wallet`
                })
            }
            let gameReq = await gameRequestModel.create({
                date: new Date(),
                userId: (req.user._id),
                gameNumber,
                date: new Date(),
                type,
                status: "active"
            });
            let transactions = await Transaction.create({
                userId: user._id,
                type: 'debit',
                Date: new Date(),
                amount: sum,
                status: "active"
            });
            await user.updateOne({ "wallet": user.wallet - sum });
            return res.json({
                message: "Your game request successfully created.",
                status: true,
                data: ""
            })
        } catch (error) {
            console.log(error.message)
            return res.json({
                message: "Your game request successfully created.",
                status: false,
                data: {}
            })
        }

    }
    /**
      * Game Request
      * @param {*} req
      * @param {*} res
      * @returns
      **/
    async gameRequest(req, res) {
        let list = await gameRequestModel.find({}).populate("userId", "name");
        return res.json({
            status: true,
            message: "Your game request list.",
            data: list
        });
    }
}
module.exports = new GameController();