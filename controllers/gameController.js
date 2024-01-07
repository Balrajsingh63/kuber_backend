const GameModel = require('../models/gameModel');
const GameRequestModel = require('../models/gameRequestModel');
class GameController {
    async index(req, res) {
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

    async gameRequestList(req, res) {
        let list = await GameRequestModel.find({}).populate("userId", "name");
        return res.json({
            status: true,
            message: "Game Request list.",
            data: list
        })
    }

    async gameCreate(req, res) {
        const { name, startTime, endTime, status } = req.body;
        const storeData = await GameModel.create({ name, startTime, endTime, status });
        return res.json({
            status: true,
            message: "Game created successfully."
        })
    }
}
module.exports = new GameController();