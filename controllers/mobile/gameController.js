const GameModel = require('../../models/gameModel');
const { ObjectId, default: mongoose } = require("mongoose")
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
        const currentDate = new Date(); // Current date
        const currentDateString = currentDate.toISOString().split('T')[0]; // Get the current date string
        let time = moment("00:00 AM", "hh:mm A")
        let list = await GameModel.aggregate([
            {
                $match: {
                    createdAt: { $lte: currentDate } // Filter by createdAt date being less than or equal to the current date for GameModel
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
                                    // { $lte: ["$createdAt", "$$time"] } // Filter by resultTime being greater than or equal to the current time
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
        // start
        for (const iterator of list) {
            let currentDateTime = moment(new Date());
            let gameStartDateTime = moment(moment(new Date()).format("DD-MM-Y") + " " + iterator.startTime, "DD-MM-Y HH:mm");
            // let gameEndDateTime = moment(moment(new Date()).format("DD-MM-Y") + " " + game.endTime, "DD-MM-Y HH:mm").add(1, 'day');
            let gameEndDateTime = moment(moment(new Date()).format("DD-MM-Y") + " " + iterator.endTime, "DD-MM-Y HH:mm");
            // if (gameStartDateTime > gameEndDateTime) {
            //     gameEndDateTime.add(1, "day")
            // }
            if (!(currentDateTime.isBetween(gameStartDateTime, gameEndDateTime))) {
                iterator.openingStatus = "Closed";
            } else {
                iterator.openingStatus = "Open";
            }
        }

        // end
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
            console.log("current Date", moment(new Date()));
            let { gameNumber, type } = req.body;
            let game = await GameModel.findOne({ _id: type });
            let currentDateTime = moment(new Date());
            let gameStartDateTime = moment(moment(new Date()).format("DD-MM-Y") + " " + game.startTime, "DD-MM-Y HH:mm");
            // let gameEndDateTime = moment(moment(new Date()).format("DD-MM-Y") + " " + game.endTime, "DD-MM-Y HH:mm").add(1, 'day');
            let gameEndDateTime = moment(moment(new Date()).format("DD-MM-Y") + " " + game.endTime, "DD-MM-Y HH:mm");

            console.log('currentDateTime **** ', currentDateTime)
            console.log('gameStartDateTime **** ', gameStartDateTime)
            console.log('gameEndDateTime **** ', gameEndDateTime)


            if (gameStartDateTime > gameEndDateTime) {
                gameEndDateTime.add(1, day)
            }
            //
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
                // date: new Date(newDate),
                date: new Date(),
                userId: (req.user._id),
                gameNumber,
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
      */

    async gameRequest(req, res) {
        try {
            const { _id } = req.user;
            let list = await gameRequestModel.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(_id)
                    }
                }, {
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
                        from: "games",
                        localField: "type",
                        foreignField: "_id",
                        as: "games"
                    }
                },
                {
                    $unwind: {
                        path: "$games",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        gameDate: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
                    }
                },
                {
                    $lookup: {
                        from: "results",
                        let: { gameNumber: "$gameNumber.number", gameDate: "$gameDate", type: "$type" },
                        pipeline: [
                            {
                                $addFields: {
                                    resultDate: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
                                }
                            },
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ["$number", "$$gameNumber"] },
                                            { $eq: ["$resultDate", "$$gameDate"] },
                                            { $eq: ["$gameId", "$$type"] }
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
                        "games": { name: "$games.name" },
                        users: { name: "$users.name", _id: "$users._id" },
                        "results": 1
                    }
                }
            ]);


            console.log({ list });
            return res.json({
                status: true,
                message: "Your game request list.",
                data: list
            });
        } catch (error) {
            console.error("Error fetching game requests:", error);
            return res.status(500).json({
                status: false,
                message: "An error occurred while fetching game requests."
            });
        }
    }

}
module.exports = new GameController();