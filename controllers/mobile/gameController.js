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
            let currentDateTime = moment(new Date());
            let gameStartDateTime = moment(moment(new Date()).format("DD-MM-Y") + " " + game.startTime, "DD-MM-Y HH:mm");
            let gameEndDateTime = moment(moment(new Date()).format("DD-MM-Y") + " " + game.endTime, "DD-MM-Y HH:mm");
            if (!(currentDateTime.isBetween(gameStartDateTime, gameEndDateTime))) {
                return res.json({
                    message: "Game request not available at this time",
                    status: false,
                    data: gameReq
                });
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
            var gameReq = await gameRequestModel.create({
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
                data: gameReq
            })
        } catch (error) {
            console.log(error.message)
            return res.json({
                message: "Something went wrong.",
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
    // async gameRequest(req, res) {
    //     let list = await gameRequestModel.aggregate([{
    //         $lookup: {
    //             from: "users",
    //             localField: "userId",
    //             foreignField: "_id",
    //             as: "users"
    //         }
    //     }, {
    //         $unwind: {
    //             path: "$users",
    //             preserveNullAndEmptyArrays: true
    //         }
    //     }, {
    //         $lookup: {
    //             from: "results",
    //             let: { gameNumber: "$gameNumber.number", gameDate: "$date" },
    //             pipeline: [
    //                 {
    //                     $match: {
    //                         $expr: {
    //                             $and: [
    //                                 { $eq: ["$number", "$$gameNumber"] },
    //                                 // { $eq: ["$date", "$$gameDate"] }
    //                             ]
    //                         }
    //                     }
    //                 }
    //             ],
    //             as: "results"
    //         }
    //     }, {
    //         $unwind: {
    //             path: "$results",
    //             preserveNullAndEmptyArrays: true
    //         }
    //     }, {
    //         $project: {
    //             "userId": 1,
    //             "type": 1,
    //             "gameNumber": 1,
    //             "date": 1,
    //             "status": 1,
    //             "createdAt": 1,
    //             "updatedAt": 1,
    //             users: { name: "$users.name", _id: "$users._id" },
    //             "results": 1
    //         }
    //     }]);
    //     return res.json({
    //         status: true,
    //         message: "Your game request list.",
    //         data: list
    //     });
    // }

    async gameRequest(req, res) {
        let list = await gameRequestModel.aggregate([
            {
                $addFields: {
                    "formattedDate": {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$date"
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "users"
                }
            },
            {
                $unwind: {
                    path: "$users",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "results",
                    let: { gameNumber: "$gameNumber.number", gameDate: "$formattedDate" },
                    pipeline: [
                        {
                            $addFields: {
                                "formattedDate": {
                                    $dateToString: {
                                        format: "%Y-%m-%d",
                                        date: "$date"
                                    }
                                }
                            }
                        },
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$number", "$$gameNumber"] },
                                        // { $eq: ["$formattedDate", "$$gameDate"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "results"
                }
            },
            {
                $unwind: {
                    path: "$results",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    "userId": 1,
                    "type": 1,
                    "gameNumber": 1,
                    "date": 1,
                    "status": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    users: { name: "$users.name", _id: "$users._id" },
                    "results": 1
                }
            }
        ]);

        return res.json({
            status: true,
            message: "Your game request list.",
            data: list
        });
    }

}
module.exports = new GameController();