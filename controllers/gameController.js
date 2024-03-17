const { default: mongoose } = require('mongoose');
const GameModel = require('../models/gameModel');
const GameRequestModel = require('../models/gameRequestModel');
const Result = require("./../models/resultModel")
const moment = require('moment');
const userModel = require('../models/userModel');
class GameController {

    async index(req, res) {
        const currentDate = new Date(); // Current date
        const currentDateString = currentDate.toISOString().split('T')[0]; // Get the current date string

        let list = await GameModel.aggregate([
            {
                $match: {
                    createdAt: { $lte: currentDate }
                }
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
                                ]
                            }
                        },
                        {
                            $project: {
                                gameId: 1,
                                resultTime: 1,
                                number: 1,
                                createdAtString: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } // Project createdAt as a string
                            }
                        },
                        {
                            $match: {
                                createdAtString: currentDateString // Compare createdAt date string with the current date string
                            }
                        },
                        {
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
        let list = await GameRequestModel.aggregate([
            {
                $addFields: {
                    "today": {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$date"
                        }
                    }
                }
            },
            {
                $match: { today: { $eq: moment().format("Y-MM-DD").toString() } }
            },
            {
                $lookup:
                {
                    from: "games",
                    localField: "type",
                    foreignField: "_id",
                    as: "games"
                }
            },
            {
                $unwind: "$gameNumber"
            },
            {
                $group: {
                    "_id": "$gameNumber.number",
                    count: { $sum: 1 },
                    totalPrice: { $sum: "$gameNumber.price" },
                    data: { $addToSet: "$$ROOT" }
                }
            },
        ]);
        return res.json({
            status: true,
            message: "Game Request list.",
            data: list
        });
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
        const { id } = req.params;
        const game = await GameModel.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id) });
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
        const storeData = await GameModel.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, { name, resultTime, startTime, endTime, status });
        return res.json({
            status: true,
            message: "Game Updated successfully."
        })
    }

    async gameResult(req, res) {
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        const { startTime, endTime, number, resultTime, gameId } = req.body;
        const result = await Result.create({ startTime, endTime, number, resultTime, gameId });

        const gameTime = await GameModel.findOne({ _id: gameId });
        let startTimeData = moment(gameTime.startTime, 'hh:mm A');
        let endTimeData = moment(gameTime.endTime, 'hh:mm A');

        if (endTimeData.isBefore(startTimeData)) {
            endTimeData.add(1, 'day'); // Add 1 day to end time if it's before start time
        }
        console.log(startTimeData, endTimeData, gameTime);
        // let duration = moment.duration(endTimeData.diff(startTimeData));
        // let hours = duration.asHours();
        let gameRequests = await GameRequestModel.find({
            $and: [{
                date: { $gte: startTimeData, $lte: endTimeData },
                type: gameId,
                "gameNumber.number": number
            }]

        },

        );
        console.table(gameRequests);
        if (gameRequests.length > 0) {
            for (const iterator of gameRequests) {

                let useData = await userModel.findOne({ _id: iterator.userId })
                await useData.updateOne({
                    wallet: Number(useData.wallet) + Number(iterator.gameNumber[0].price * 90)
                })
            }
        }
        return res.json({
            data: result,
            gameRequests: gameRequests,
            message: "Game result updated successfully"
        });
    }

    async filterGame(req, res) {
        const { gameId, date } = req.query;
        let filterData = await GameModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(gameId) }
            },
            {
                $lookup: {
                    from: "gamerequestmodels",
                    let: { gameId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$type", "$$gameId"] },
                                        { $eq: [{ $dateToString: { format: "%Y-%m-%d", date: "$date" } }, moment(date).format("YYYY-MM-DD")] }
                                    ]
                                }
                            }
                        },
                        {
                            $unwind: "$gameNumber"
                        },
                        {
                            $group: {
                                "_id": "$gameNumber.number",
                                count: { $sum: 1 },
                                totalPrice: { $sum: "$gameNumber.price" },
                            }
                        },
                        {
                            $sort: { totalPrice: 1 }
                        },
                        {
                            $group: {
                                _id: "$_id",
                                count: { $first: "$count" },
                                totalPrice: { $first: "$totalPrice" },
                            }
                        }
                    ],
                    as: "gameRequest"
                }
            }
        ]);

        return res.json({
            data: filterData,
            message: "Game Filter List successfully",
            status: true
        });
    }

    async todayrecords(req, res) {
        let todayRequest = await GameRequestModel.aggregate([
            {
                $addFields: {
                    "today": {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$date"
                        }
                    }
                }
            }, {
                $match: { today: { $eq: moment().format("Y-MM-DD").toString() } }
            },
        ]);
        return res.json({
            data: todayRequest,
            message: "Game totle Amount result successfully"
        });
    }
    /**
     * 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     * For User update wallet according to result APis
     */
    async updateResultWallet(req, res) {
        const { gameId, date } = req.body;
        let startDate = new Date(date);
        const updateWalletData = await Result.findOne({
            gameId: gameId,
            date: {
                $gte: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
                $lt: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1)
            }
        });
        if (updateWalletData && updateWalletData?.updateWallet) {
            return res.json({
                status: true,
                message: "User today wallet already updated"
            });
        } else {
            let gameRequests = await GameRequestModel.find({
                $and: [{
                    date: {
                        $gte: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
                        $lt: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1)
                    },
                    type: gameId,
                    "gameNumber.number": updateWalletData.number
                }]
            });
            if (gameRequests.length > 0) {
                for (const _user of gameRequests) {
                    let useData = await userModel.findOne({ _id: _user.userId })
                    let updateUser = await useData.updateOne({
                        wallet: Number(useData.wallet) + Number(_user.gameNumber[0].price * 90)
                    })
                }
                await updateWalletData.updateOne({
                    updateWallet: new Date()
                });
                return res.json({
                    status: true,
                    message: "User wallet updated successfully"
                });
            } else {
                return res.json({
                    status: true,
                    message: "No user found"
                });
            }

        }
    }


}

module.exports = new GameController();


