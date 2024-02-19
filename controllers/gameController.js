const { default: mongoose } = require('mongoose');
const GameModel = require('../models/gameModel');
const GameRequestModel = require('../models/gameRequestModel');
const Result = require("./../models/resultModel")
const moment = require('moment');
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
            }, {
                $match: { today: { $eq: moment().format("Y-MM-DD").toString() } }
            },
            // {
            //     $lookup:
            //     {
            //         from: "games",
            //         localField: "name",
            //         foreignField: "_id",
            //         as: "games"
            //     }
            // },
            {
                $unwind: "$gameNumber"
            },
            {
                $group: {
                    "_id": "$gameNumber.number",
                    count: { $sum: 1 },
                    totalPrice: { $sum: "$gameNumber.price" },
                    data: { $push: "$$ROOT" }
                }
            },
            {
                $unwind: "$data"
            },
            {
                $sort: { totalPrice: 1 }
            }
        ]
        );
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
        const { startTime, endTime, number, resultTime, gameId } = req.body;
        const result = await Result.create({ startTime, endTime, number, resultTime, gameId })
        return res.json({
            data: result,
            message: "Game result updated successfully"
        });
    }

    async todayResult(req, res) {
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
            {
                $unwind: "$gameNumber"
            },
            {
                $group: {
                    "_id": "$gameNumber.number",
                    count: { $sum: 1 },
                    totalPrice: { $sum: "$gameNumber.price" },
                    minPrice: { $min: "$gameNumber.price" },
                    minCount: { $min: { $sum: 1 } },
                    data: { $push: "$$ROOT" }
                }
            },
            {
                $unwind: "$data"
            },
            {
                $sort: { totalPrice: 1 }
            }

        ]);
        return res.json({
            data: todayRequest,
            message: "Game totle Amount result successfully"
        });
    }


    // async filterGame(req, res) {
    //     const { gameId, date } = req.query;
    //     let filterData = await GameModel.aggregate([
    //         {
    //             $match: { _id: new mongoose.Types.ObjectId(gameId) }
    //         },
    //         {
    //             $lookup: {
    //                 from: "gamerequestmodels",
    //                 let: { gameId: "$_id" },
    //                 pipeline: [
    //                     {
    //                         $match: {
    //                             $expr: {
    //                                 $and: [
    //                                     { $eq: ["$type", "$$gameId"] },
    //                                     { $eq: [{ $dateToString: { format: "%Y-%m-%d", date: "$date" } }, moment(date).format("YYYY-MM-DD")] }
    //                                 ]
    //                             }
    //                         }
    //                     },

    //                     {
    //                         $unwind: "$gameNumber"
    //                     },
    //                     {
    //                         $group: {
    //                             "_id": "$gameNumber.number",
    //                             count: { $sum: 1 },
    //                             totalPrice: { $sum: "$gameNumber.price" },
    //                             data: { $push: "$$ROOT" }
    //                         },
    //                     },
    //                     {
    //                         $unwind: "$data"
    //                     },
    //                     {
    //                         $sort: { totalPrice: 1 }
    //                     }
    //                 ],
    //                 as: "gameRequest"
    //             }
    //         }
    //     ]);

    //     function removeDuplicates(arr) {
    //         let uniqueArr = [...new Set(arr.map(item => item._id))];
    //         return uniqueArr.map(_id => arr.find(item => item._id === _id));
    //     }

    //     const finalResult = filterData?.map((p_item, index) => {

    //         let removeDupl = removeDuplicates(p_item?.gameRequest);
    //         return { ...p_item, gameRequest: removeDupl }

    //     })

    //     console.log("finalResult ******* ", filterData);

    //     return res.json({
    //         data: finalResult,
    //         message: "Game Filter List successfully",
    //         status: true
    //     });
    // }

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
                                // data: {
                                //     $addToSet: {
                                //         number: "$gameNumber.number",
                                //     }
                                // }
                            }
                        },
                        // {
                        //     $unwind: "$data"
                        // },
                        {
                            $sort: { totalPrice: 1 }
                        },
                        {
                            $group: {
                                _id: "$_id",
                                count: { $first: "$count" },
                                totalPrice: { $first: "$totalPrice" },
                                // data: { $addToSet: "$data" }
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


}

module.exports = new GameController();


