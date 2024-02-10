const { default: mongoose } = require('mongoose');
const GameModel = require('../models/gameModel');
const GameRequestModel = require('../models/gameRequestModel');
const Result = require("./../models/resultModel")
class GameController {
    async index(req, res) {
        const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        let list = await GameModel.aggregate([
            {
                $lookup: {
                    from: "results",
                    let: { gameId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$gameId", "$$gameId"] },
                                        { $gte: ["$resultTime", currentTime] } // Filter by result time being greater than or equal to the current time
                                    ]
                                }
                            }
                        }, {
                            $limit: 1
                        }
                    ],
                    as: "result",
                }
            },
            {
                $unwind: {
                    path: "$result",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]);
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
        const { name, startTime, resultTime, endTime, status } = req.body;
        const storeData = await GameModel.create({ name, resultTime, startTime, endTime, status });
        return res.json({
            status: true,
            message: "Game created successfully."
        })
    }

    async deleteGame(req, res) {
        const { _id } = req.params;
        const game = await GameModel.findOneAndDelete({ _id: mongoose.Types.ObjectId(_id) });
        return res.json({
            status: true,
            message: "Game Deleted Successfully.",
        });
    }

    async findGame(req, res) {
        const { id } = req.params;
        const game = await GameModel.findOne({ _id: mongoose.Types.ObjectId(id) });
        return res.json({
            status: true,
            data: game
        });
    }

    async updateGame(req, res) {
        const { id } = req.params;
        const { name, startTime, resultTime, endTime, status } = req.body;
        const storeData = await GameModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, { name, resultTime, startTime, endTime, status });
        return res.json({
            status: true,
            message: "Game Updated successfully."
        })
    }

    async gameResult(req, res) {
        const { startTime, endTime, number, resultTime, gameId } = req.body;
        const result = await Result.create({ startTime, endTime, number, resultTime, gameId })
        return res.json({
            data: result,
            message: "Game result updated successfully"
        });
    }
}
module.exports = new GameController();